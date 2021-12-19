var state18 = {};

state18.text = "WebGL: Menger sponge, upto level 4.  " +
			"Toggle the 'flycam' using the 'C' key.  " +
			"Reset the position of the camera with the 'R' key.  " +
			"Aim the camera with the mouse.\n" + 
			"Move the camera with the arrow keys and left and right mouse buttons.  " +
			"Speed up and slow down camera movement with '+/=' and '-' keys.\n" +
			"Tab through various states using the 'prev state' and 'next state' buttons.";
			
state18.title = "Menger sponge";

state18.curlevel = null;
state18.maxlevel = 4;

state18.sellev = null;
state18.sellev2 = null;
//var paslider = null;

state18.lesslevel = function() {
	if (state18.curlevel > 0)
		--state18.curlevel;
	state18.updatelevel();
};

state18.morelevel = function() {
	if (state18.curlevel < state18.maxlevel)
		++state18.curlevel;
	state18.updatelevel();
};

state18.selectlevel = function(sel) {
	state18.curlevel = sel.selectedIndex;
	state18.updatelevel();
};
	
state18.pow3 = [];
state18.trin;

// return an value of binary has ones, base3 to base2 like
state18.tobase3 = function(n,ndig) {
	var ret = 0;
	var i;
	var p = 1;
	for (i=0;i<ndig;++i) {
		var m = n%3;
		n = Math.floor(n/3);
		if (m == 1)
			ret += p;
		p *= 2;
	}
	return ret;
};

state18.getones = function(lev) {
	state18.trin = [];
	var m = state18.pow3[lev];
	var i;
	for (i=0;i<m;++i) {
		var r = state18.tobase3(i,lev);
		state18.trin.push(r);
	}
};

state18.issolid = function(pos) {
	var br = [];
	var i;
	for (i=0;i<3;++i) {
		var t = pos[i];
		var b;
		if (t<0 || t>=state18.trin.length)
			return false;
		b = state18.trin[t];
		br.push(b);
	}
	if (br[0] & br[1])
		return false;
	if (br[0] & br[2])
		return false;
	if (br[1] & br[2])
		return false;
	return true;
}
	
state18.smeshfaceposx = {
	verts: [
		 0,1,1,
		 0,1,0,
		 0,0,1,
		 0,0,0
	],
	uvs: [
		 0,0,
		 1,0,
		 0,1,
		 1,1
	],
	faces: [
		0,1,2,
		3,2,1
	]
};

state18.smeshfacenegx = {
	verts: [
		 0,1,0,
		 0,1,1,
		 0,0,0,
		 0,0,1
	],
	uvs: [
		 0,0,
		 1,0,
		 0,1,
		 1,1
	],
	faces: [
		0,1,2,
		3,2,1
	]
};

state18.smeshfaceposy = {
	verts: [
		 0,0,0,
		 1,0,0,
		 0,0,1,
		 1,0,1
	],
	uvs: [
		 0,0,
		 1,0,
		 0,1,
		 1,1
	],
	faces: [
		0,1,2,
		3,2,1
	]
};

state18.smeshfacenegy = {
	verts: [
		 0,0,1,
		 1,0,1,
		 0,0,0,
		 1,0,0
	],
	uvs: [
		 0,0,
		 1,0,
		 0,1,
		 1,1
	],
	faces: [
		0,1,2,
		3,2,1
	]
};

state18.smeshfaceposz = {
	verts: [
		 0,1,0,
		 1,1,0,
		 0,0,0,
		 1,0,0
	],
	uvs: [
		 0,0,
		 1,0,
		 0,1,
		 1,1
	],
	faces: [
		0,1,2,
		3,2,1
	]
};

state18.smeshfacenegz = {
	verts: [
		 1,1,0,
		 0,1,0,
		 1,0,0,
		 0,0,0
	],
	uvs: [
		 0,0,
		 1,0,
		 0,1,
		 1,1
	],
	faces: [
		0,1,2,
		3,2,1
	]
};

state18.meshes6 = [
	state18.smeshfaceposz,
	state18.smeshfacenegz,
	state18.smeshfaceposx,
	state18.smeshfacenegx,
	state18.smeshfaceposy,
	state18.smeshfacenegy
];

state18.off60 = [
	[0,0,0],
	[0,0,1],
	[0,0,0],
	[1,0,0],
	[0,0,0],
	[0,1,0]
];
state18.off62 = [
	[0,0,-1],
	[0,0,1],
	[-1,0,0],
	[1,0,0],
	[0,-1,0],
	[0,1,0]
];
state18.colss6 = [
	[1,.125,.125,1],
	[.125,1,.125,1],
	[.125,.125,1,1],
	[1,1,.125,1],
	[1,.125,1,1],
	[.125,1,1,1]
];

state18.smesh;
state18.curmeshidx;

state18.clearsmesh = function() {
	state18.smesh = {verts:[],faces:[],uvs:[]};
	state18.curmeshidx = 0;
};

state18.addsmesh = function(off,msh) {
	var i,j;
	// 4 verts
	for (i=0;i<4;++i) {
		for (j=0;j<3;++j) {
			state18.smesh.verts.push(msh.verts[3*i+j]+off[j]);
		}
	}
	// 4 uvs
	for (i=0;i<4;++i) {
		for (j=0;j<2;++j) {
			state18.smesh.uvs.push(msh.uvs[2*i+j]);
		}
	}
	// 2 faces
	for (i=0;i<2;++i) {
		for (j=0;j<3;++j) {
			state18.smesh.faces.push(msh.faces[3*i+j]+state18.curmeshidx);
		}
	}
	state18.curmeshidx += 4;
};

state18.makesponge = function(level,f) {
	var i,j,k,f;
	var m = state18.pow3[level];
	state18.getones(level);
	state18.clearsmesh();
	for (k=0;k<=m;++k) {
		for (j=0;j<=m;++j) {
			for (i=0;i<=m;++i) {
//				for (f=0;f<6;++f) {
					var off0 = [i+state18.off60[f][0], j+state18.off60[f][1], k+state18.off60[f][2]];
					var off1 = [i,j,k];
					var off2 = [i+state18.off62[f][0], j+state18.off62[f][1], k+state18.off62[f][2]];
					
					// pz
					//off1 = [i,j,k];
					//off2 = [i,j,k-1];
					if (state18.issolid(off1) && !state18.issolid(off2))
						state18.addsmesh(off0,state18.meshes6[f]);
	/*				
					// nz
					offp1 = [i,j,k+1];
					if (issolid(off1) && !issolid(off2))
						addsmesh(off11,smeshfacenegz);
						
					// px
					offm1 = [i-1,j,k];
					if (issolid(off1) && !issolid(off2))
						addsmesh(off1,smeshfaceposx);
						
					// nx
					offp1 = [i+1,j,k];
					if (issolid(off1) && !issolid(off2))
						addsmesh(off1,smeshfacenegx);
						
					// py
					offm1 = [i,j-1,k];
					if (issolid(off1) && !issolid(off2))
						addsmesh(off1,smeshfaceposy);
						
					// ny
					offp1 = [i,j+1,k];
					if (issolid(off1) && !issolid(off2))
						addsmesh(off1,smeshfacenegy); */
//				}
			}
		}
	}
	return state18.smesh;
};

state18.updatelevel = function() {
	//if (myform)
		selectsetidx(state18.sellev,state18.curlevel);
		slidersetidx(state18.sellev2,state18.curlevel);
	//else
	//	curlevel = 2;
	printareadraw(state18.levelarea,"Level : " + state18.curlevel);
	var lev,f;
	/*
	var childcopy = roottree.children.slice();
	for (i=0;i<childcopy.length;++i) {
		childcopy[i].glfree();
		childcopy[i].unlinkchild();
	} */
	state18.roottree.glfree();
	state18.roottree = new Tree2("roottree");
	var simple = false;
	if (simple) {
		var tree1 = buildprism("aprism2",[.5,.5,.5],"maptestnck.png","tex"); // helper, builds 1 prism returns a Tree2
		state18.roottree.linkchild(tree1);
		return;
	}
	lev = Math.floor(state18.curlevel);
	//for (lev=cur;lev<=3;++lev) {
		for (var g=0;g<6;++g) {
			// a modelpart
			var amod = Model2.createmodel("spongemod m" + lev + "s" + g);
			if (amod.refcount == 1) {
				//amod.setmesh(smeshtemplate);
				var msh = state18.makesponge(lev,g);//,[0,-lev*1.5,0]);
				amod.setmesh(msh);
				//amod.settexture("maptestnck.png");
				//amod.setshader("tex");
				var fs = 6000;
				for (f=0;f<amod.faces.length;f += fs) {
					var f2 = f + fs;
					if (f2 >= amod.faces.length)
						f2 = amod.faces.length;
					var fp = f2 - f;
					//amod.addmat("tex",null,fp,2*fp);
					//amod.addmat("texc","BridgeCon1.png",fp,2*fp);
					amod.addmat("texc","maptestnck.png",fp,2*fp);
				}
				amod.mat.color = state18.colss6[g];
				//amod.mat.color = [.75,.75,.75,1];
				amod.commit();
				//amod.settexture();
				var atree = new Tree2("spongepart" + lev);
				atree.setmodel(amod);
				//atree.trans = [0,(4-lev)*1.5,0];
				//atree.trans = [-.45,-.45,0];
				atree.trans = [-.5,-.5,0];
				var scl = 1.0/state18.pow3[lev];
				atree.scale = [scl,scl,scl];
				//pendpce0.rotvel = [.1,.5,0];
				//pendpce0.flags |= treeflagenums.ALWAYSFACING;
				state18.roottree.linkchild(atree);
			}
		}
	//}
};

state18.sliderCallback = function(val) {
	//paslider.settext(val.value);
	//printareadraw(paslider,val.value);
	state18.curlevel = val.value;
	state18.updatelevel();
};

state18.load = function() {
	//if (!gl)
	//	return;
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("fortpoint/BridgeCon1.png");
};

state18.makeLevelSelect = function() {
	var ret = [];
	var i;
	for (i=0;i<=state18.maxlevel;++i) {
		var str = "Levvel " + i;
		ret.push(str);
	}
	return ret;
};

state18.init = function() {
//	gl_mode(true);

state18.pow3 = [1,3,9,27,81,243,729];

	state18.curlevel = 2; // actually 2
//	if (!gl)
//		return;
	logger("entering webgl state18\n");
	
	// build the scene
	state18.roottree = new Tree2("root");
	
	
	// ui
	setbutsname('menger');
	state18.levelarea = makeaprintarea('level: ');
	makeabut("lower level",null,state18.lesslevel);
	makeabut("higher level",null,state18.morelevel);
	//if (myform)
	var selstr = state18.makeLevelSelect();
	state18.sellev = makeaselect(selstr,state18.selectlevel);
	//sellev = makeaselect(["Level 0","Level 1","Level 2","Level 3","Level 4"],selectlevel);
	state18.sellev2 = makeaslider(0, state18.maxlevel, state18.curlevel, state18.sliderCallback);
	//paslider = makeaprintarea("slider output");
	//printareadraw(paslider,sellev2.value);
	state18.updatelevel();
	
/*	var tre = buildplanexy("testortho",Math.SQRT2,Math.SQRT2,"panel.jpg","tex");
	tre.trans = [0,0,.5];
	tre.scale = [.5,.5,.5];
	tre.rot = [0,-Math.PI/4,0];
	roottree.linkchild(tre); */
	
	// set the lights
	//lights.wlightdir = vec3.fromValues(0,0,1);
	
	// set the camera
	//mainvp.trans = [0,0,-15]; // flycam
	mainvp.trans = [0,0,-1]; // flycam
	mainvp.rot = [0,0,0]; // flycam
	//mainvp.isortho = true;
	//mainvp.ortho_size = 1;
	//mainvp.near = 1.25;
	//mainvp.far = 1.75;
};

state18.proc = function() {
//	if (!gl)
//		return;
//    gl.clearColor(.25,.25,0,1);                      // Set clear color to yellow, fully opaque
//    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	state18.roottree.proc();
	doflycam(mainvp); // modify the trs of the vp
	
	//pendpce0.trans = [0,0,0];
	//dolights(); // get some lights to eye space
	//mainvp.trans[0] += 1;
	beginscene(mainvp);
	//mainvp.trans[0] -= 1;
	state18.roottree.draw();
	//endscene();
};

state18.exit = function() {
//	gl_mode(false);
//	if (!gl)
//		return;
	state18.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	state18.roottree.glfree();
	logrc();
	state18.roottree = null;
	logger("exiting webgl state18\n");
	clearbuts('menger');
	//mainvp.isortho = false;
};
