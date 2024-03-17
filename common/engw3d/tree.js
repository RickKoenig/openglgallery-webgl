var treeflagenums = {
// tree
	ALWAYSFACING:0x20,
	DONTDRAW:0x40,
	DONTDRAWC:0x80,
	DONTCASTSHADOW:0x100,
	AMBLIGHT:0x200,
	DIRLIGHT:0x400,
	NOSCALE:0x800 // don't scale children by parent scale
};

//var treesort = true;

treeflagenums.LIGHT = treeflagenums.AMBLIGHT | treeflagenums.DIRLIGHT;

var buildshadowmap = false;

// longer term scratch storage, no allocations
var treeglobals = {
	// fast scratch vars
	"negtrans":vec3.create(),
	"invscale":vec3.create(),
	animframestep:30,	// animation frames are 1/30 seconds apart
	frmstep:1,
	framesteptoggleenable:true,
};

var treeinfo = {
	insamp:true
};

var qrotmat = mat4.create();

function buildtransqrotscale(out,sqt) {
	//mat4.identity(out);
	if (sqt.trans)
		mat4.translate(out,out,sqt.trans);
	if (sqt.qrot) {
		mat4.fromQuat(qrotmat,sqt.qrot);
		mat4.mul(out,out,qrotmat);
	}
	if (sqt.flags & treeflagenums.NOSCALE)
		mat4.copy(mvMatrixNoScale,out);
    if (sqt.scale)
    	mat4.scale(out,out,sqt.scale);
}

function buildtransrotscale(out,srt) {
	//mat4.identity(out);
	if (srt.trans)
		mat4.translate(out,out,srt.trans);
	if (srt.rot)
		mat4.rotateEuler(out,out,srt.rot);
	if (srt.flags & treeflagenums.NOSCALE)
		mat4.copy(mvMatrixNoScale,out);
    if (srt.scale)
    	mat4.scale(out,out,srt.scale);
}

function buildtransqrotscaleinv(out,sqt) {
    if (sqt.scale) {
    	vec3.inv(treeglobals.invscale,sqt.scale);
   		mat4.scale(out,out,treeglobals.invscale);
   	}
	if (sqt.qrot) {
		var c = quat.create();
		quat.conjugate(c,sqt.qrot);
		mat4.fromQuat(qrotmat,c);
		mat4.mul(out,out,qrotmat);
	}
   	if (sqt.trans) {
   		vec3.negate(treeglobals.negtrans,sqt.trans);
		mat4.translate(out,out,treeglobals.negtrans);
	}
}

function buildtransrotscaleinv(out,srt) {
    if (srt.scale) {
    	vec3.inv(treeglobals.invscale,srt.scale);
   		mat4.scale(out,out,treeglobals.invscale);
   	}
   	if (srt.rot) {
   		mat4.rotateEulerinv(out,out,srt.rot);
   	}
   	if (srt.trans) {
   		vec3.negate(treeglobals.negtrans,srt.trans);
		mat4.translate(out,out,treeglobals.negtrans);
	}
}

class Tree2 {
	constructor(name) {
		this.name = name;
		this.flags = 0;
		this.drawpri = -1; // nothing to draw
		// model
		//mod(),
		// hierarchy
		//parent(0),
		this.children = [];
		// orientation
		//this.trans = vec3.create();
		//this.rot = vec3.create();
		//this.scale = vec3.fromValues(1,1,1);
		//this.transvel = vec3.create();
		//this.rotvel = vec3.create();
		//this.scalevel = vec3.fromValues(1,1,1);
		this.mvm = mat4.create(); // this tree's model view matrix

		// tree specific user uniforms
		this.mat = {}; // tree specific user uniforms

		// populate based on file data
		this.frm = 0; // animation

		//this.frmstep = 1.0;
		if (!name)
			return;
		var s = spliturl(name);
		var lext = s.ext.toLowerCase();
		if (lext == "bwo") {
			this.mod = loadbwomodel(name);
		} else if (lext == "bws") {
			loadbws(this);
		}
	}

	findtree(name) {
		if (this.name == name)
			return this;
		var i, n = this.children.length;
		for (i = 0; i < n; ++i) {
			var fnd = this.children[i].findtree(name);
			if (fnd)
				return fnd;
		}
		return null;
	}

	setmodel(m) {
		this.mod = m;
	}

	// can be called more than once, used by 'Model' only for now.
	// override model's texture
	settexture(tname) {
		if (this.reftexture) {
			this.reftexture.glfree();
			//this.reftexture = null;
		}
		this.texturename = tname;
		this.reftexture = Texture.createtexture(this.texturename);
		//if (this.reftexture && this.reftexture.hasalpha)
		//	this.hasalpha = true;
	}

	newdup() {
		var ret = new Tree2(); // copy name AFTER new Tree2 to prevent .bwo or .bws from loading
		ret.name = this.name;
		//var ret = new Tree2(this.name);
		ret.flags = this.flags;
		ret.drawpri = this.drawpri;
		ret.userproc = this.userproc;
		//	ret.name = this.name;
		// model
		/*
			ret.mod = this.mod;
			if (ret.mod)
				++ret.mod.refcount;
		*/
		if (this.mod /*&& !ret.mod */)
			ret.mod = this.mod.newdup();
		// tree material override
		ret.mat = cloneObject(this.mat);
		// tree texture
		ret.texturename = this.texturename;
		ret.reftexture = this.reftexture;
		if (ret.reftexture)
			++ret.reftexture.refcount;
		// orientation
		if (this.trans)
			ret.trans = vec3.clone(this.trans);
		if (this.rot)
			ret.rot = vec3.clone(this.rot);
		if (this.qrot)
			ret.qrot = vec4.clone(this.qrot);
		if (this.scale)
			ret.scale = vec3.clone(this.scale);
		if (this.transvel)
			ret.transvel = vec3.clone(this.transvel);
		if (this.rotvel)
			ret.rotvel = vec3.clone(this.rotvel);
		if (this.scalevel)
			ret.scalevel = vec3.clone(this.scalevel);
		ret.frm = this.frm;
		// copy animation	(maybe these should be cloned) !!
		ret.possamp = this.possamp;
		ret.qrotsamp = this.qrotsamp;
		ret.o2pmat4 = this.o2pmat4;

		//ret.frmstep = this.frmstep;
		// hierarchy
		ret.children = [];
		var i, n = this.children.length;
		for (i = 0; i < n; ++i) {
			var dupchild = this.children[i].newdup();
			dupchild.parent = ret;
			ret.children.push(dupchild);
		}
		return ret;
	}

	// put at end of list, draw last, shows up frontchild
	linkchild(child) {
		if (child.parent)
			alert("child '" + child.name + "' already has a parent, '" + child.parent.name + "'");
		this.children.push(child);
		child.parent = this;
	}

	// put at front of list, draw first, shows up in the back
	linkchildback(child) {
		if (child.parent)
			alert("child '" + child.name + "' already has a parent, '" + child.parent.name + "'");
		this.children.unshift(child);
		child.parent = this;
	}

	unlinkchild() {
		//	S32 i,n;
		if (!this.parent)
			alert("child " + this.name + "' has no parent to unlink", this.name);
		var idx = this.parent.children.indexOf(this);
		if (idx < 0)
			alert("child " + this.name + "' parent has already disowned you!");

		else
			this.parent.children.splice(idx, 1);
		this.parent = null;
	}

	backchild() {
		var par = this.parent;
		this.unlinkchild();
		par.linkchildback(this);
	}

	frontchild() {
		var par = this.parent;
		this.unlinkchild();
		par.linkchild(this);
	}

	proc() {
		if (Tree2level == 0) {
			if (treeglobals.framesteptoggleenable && input.key == "f".charCodeAt(0)) {
				treeinfo.insamp = !treeinfo.insamp;
				input.key = 0; // so other viewports don't get a key..
			}
		}
		if (this.rotvel) {
			if (!this.rot)
				this.rot = vec3.create();
			crn("proc1", this.rot);
			crn("proc1vel", this.rotvel);
			this.rot[0] = normalangrad(this.rot[0] + this.rotvel[0] * Timers.frametime);
			this.rot[1] = normalangrad(this.rot[1] + this.rotvel[1] * Timers.frametime);
			this.rot[2] = normalangrad(this.rot[2] + this.rotvel[2] * Timers.frametime);
			crn("proc2", this.rot);
		}

		if (this.transvel) {
			if (!this.trans)
				this.trans = vec3.create();
			this.trans[0] += this.transvel[0] * Timers.frametime;
			this.trans[1] += this.transvel[1] * Timers.frametime;
			this.trans[2] += this.transvel[2] * Timers.frametime;
		}

		if (this.scalevel) {
			if (!this.scale)
				this.scale = vec3.fromValues(1, 1, 1);
			this.scale[0] *= Math.pow(this.scalevel[0], Timers.frametime);
			this.scale[1] *= Math.pow(this.scalevel[1], Timers.frametime);
			this.scale[2] *= Math.pow(this.scalevel[2], Timers.frametime);
		}
		if (treeinfo.insamp) {
			// advance to next frame
			var nframes = null;
			if (this.possamp) // if both exist, assume they are the same length
				nframes = this.possamp.length - 1;
			else if (this.qrotsamp)
				nframes = this.qrotsamp.length - 1;
			if (nframes > 0) { // 0 doesn't count too
				this.frm += treeglobals.frmstep * treeglobals.animframestep * Timers.frametime;
				if (this.frm >= nframes) {
					this.frm -= nframes;
				} else if (this.frm < 0) {
					this.frm += nframes;
				}
			}
			// get trs from sample
			var ifrm = Math.floor(this.frm);
			var twn = this.frm - ifrm;
			var ifrm2 = ifrm + 1;
			if (this.possamp) {
				if (this.possamp[ifrm]) {
					if (this.possamp[ifrm2]) {
						var twnpos = vec3.create();
						vec3.lerp(twnpos, this.possamp[ifrm], this.possamp[ifrm2], twn);
						this.trans = twnpos;
					} else {
						this.trans = vec3.clone(this.possamp[ifrm]);
					}
				}
			}
			if (this.qrotsamp) {
				if (this.qrotsamp[ifrm]) {
					if (this.qrotsamp[ifrm2]) {
						var twnqrot = quat.create();
						var ff = quat.clone(this.qrotsamp[ifrm]);
						var ff2 = quat.clone(this.qrotsamp[ifrm2]);
						if (vec4.dot(ff, ff2) < 0)
							//if (ff[3] * ff2[3] < 0)
							vec4.negate(ff2, ff2); // choose the short path on the great circle
						quat.slerp2(twnqrot, ff, ff2, twn);
						this.qrot = twnqrot;
					} else {
						this.qrot = quat.clone(this.qrotsamp[ifrm]);
					}
				}
			}
		}
		if (this.userproc)
			this.userproc(this);
		// children last
		var childcopy = this.children.slice();
		var i, n = childcopy.length;
		for (i = 0; i < n; ++i) {
			++Tree2level;
			childcopy[i].proc();
			//if (childcopy[i].userproc)
			//	childcopy[i].userproc(childcopy[i]);
			--Tree2level;
		}
		//crn("proc3",this.rot);
	}

	draw() {
		if (Tree2level == 0) {
			Tree2drawlist = [];
		}
		if (this.flags & treeflagenums.DONTDRAWC) {
			return;
		}
		mat4.push(mvMatrix);
		//	if (false)
		//	if (this.o2pmat4)
		if (this.o2pmat4 && !this.qrotsamp && !this.possamp)
			mat4.mul(mvMatrix, mvMatrix, this.o2pmat4);
		else if (this.qrot) {
			buildtransqrotscale(mvMatrix, this); // using tqs members (trans quat scale)
		} else {
			buildtransrotscale(mvMatrix, this); // using trs members (trans rot scale)
			if (this.mod && (this.mod.flags & modelflagenums.ISSKYBOX)) { // skybox is relative to view
				mvMatrix[12] = 0;
				mvMatrix[13] = 0;
				mvMatrix[14] = 0;
			} else if (this.flags & treeflagenums.ALWAYSFACING) { // rotate to view and keep scale
				var scl = Math.abs(mat4.determinant(mvMatrix));
				var scl = Math.pow(scl, 1.0 / 3.0);
				mvMatrix[0] = scl;
				mvMatrix[1] = 0;
				mvMatrix[2] = 0;
				mvMatrix[4] = 0;
				mvMatrix[5] = scl;
				mvMatrix[6] = 0;
				mvMatrix[8] = 0;
				mvMatrix[9] = 0;
				mvMatrix[10] = scl;
			}
		}
		if (this == dirlight)
			mat4.copy(this.mvm, mvMatrix);
		if (this.mod) {
			if (!(this.flags & treeflagenums.DONTDRAW)) {
				if (!shadowmap.inshadowmapbuild || !(this.flags & treeflagenums.DONTCASTSHADOW)) {
					//curtree = this;
					mat4.copy(this.mvm, mvMatrix);
					//if ((this.mod.flags & modelflagenums.HASALPHA))
					Tree2drawlist.push(this);
					//this.mod.draw();
					//curtree = null;
				}
			}
		}
		// children
		if (this.flags & treeflagenums.NOSCALE)
			mat4.copy(mvMatrix, mvMatrixNoScale);
		var i, n = this.children.length;
		for (i = 0; i < n; ++i) {
			++Tree2level;
			this.children[i].draw();
			--Tree2level;
		}
		if (Tree2level == 0) {
			var ndrawlist = Tree2drawlist.length;
			var i;
			var alphacnt = 0;
			var skyboxcnt = 0;
			var opaquecnt = 0;
			// sort drawlist
			for (i = 0; i < ndrawlist; ++i) { // set drawpri (0 skybox, 1 opaque, 2 alpha)
				curtree = Tree2drawlist[i];
				var ctm = curtree.mod;
				if (ctm.flags & modelflagenums.ISSKYBOX) {
					++skyboxcnt;
					curtree.drawpri = 0;
				} else if (ctm.flags & modelflagenums.HASALPHA) {
					++alphacnt;
					curtree.drawpri = 2;
				} else {
					++opaquecnt;
					curtree.drawpri = 1;
				}
				//curtree.mod.draw();
			}
			if (Tree2.treesort)
				// chrome will swap equal values
				Tree2drawlist.sort(Tree2sortfunct);
			// draw drawlist
			dolights();
			for (i = 0; i < ndrawlist; ++i) {
				curtree = Tree2drawlist[i];
				mat4.copy(mvMatrix, curtree.mvm);
				curtree.mod.draw();
			}
			curtree = null; // keep lower level (engine bypass) stuff happy
		}
		mat4.pop(mvMatrix);
	}

	log() {
		if (tree2level == 0) {
			logger("Tree Log\n");
			ntreenodes = 0;
		}
		++ntreenodes;
		var modname = "---";
		if (this.mod)
			modname = this.mod.name;
		logger("" + tree2indent(tree2level + 1) + " DP " + this.drawpri + " " + this.name + " mod " + modname);
		if (this.mod && this.mod.isafont)
			logger(" isa ModelFont, model name = " + this.mod.name);
		//logger(tree2level);
		if (this.texturename)
			logger(" treetexture " + this.texturename);
		//logger("\n");
		var i, n = this.children.length;
		for (i = 0; i < n; ++i) {
			++tree2level;
			this.children[i].log();
			--tree2level;
		}
		if (tree2level == 0) {
			logger("num nodes = " + ntreenodes + "\n");
		}
	}
	
	glfree() {
		//	if (this.parent)
		//		this.unlinkchild();
		if (this.mod) {
			this.mod.glfree();
			this.mod = null;
		}
		if (this.reftexture) {
			this.reftexture.glfree();
			this.reftexture = null;
		}
		removelight(this);
		var i, n = this.children.length;
		for (i = 0; i < n; ++i) {
			this.children[i].glfree();
		}
	}
}

Tree2.treesort = true; // chrome changes order of same value objects during sort










// look for freaky javascript interpreter bug that causes an array[3] 0 element to go from 0 to NaN, quite rare, hasn't happened in a while
function crn(name,r) {
	var i;
	for (i=0;i<3;++i)
		if (!isFinite(r[i])) {
			alert("not a number " + name + " " + i + " Timers.frametime " + Timers.frametime);
			r[i] = 0;
		}
}

Tree2level = 0;


// this was done before with 
// void video_drawscene(tree2* t)
Tree2drawlist = [];

function Tree2sortfunct (a,b) {
	if (a.drawpri == 2 && b.drawpri == 2) {
		// for alpha
		return b.mvm[14] - a.mvm[14]; // decreasing trans z, draw far away first, (left handed coord system, inc z goes away from camera towards the horizon)
		//return a.mvm[14] - b.mvm[14]; // test wrong order
	}
	return a.drawpri - b.drawpri; // draw highest priority last
}
	

tree2level = 0;

function tree2indent(n) {
	var ret = "";
	var i;
	for (i=0;i<n;++i) {
		ret += ".";
	}
	return ret;
}

var ntreenodes = 0;
	

