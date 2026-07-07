var menger = {};

menger.text = "WebGL: Menger sponge, upto level 4.  " +
			"Toggle the 'flycam' using the 'C' key.  " +
			"Reset the position of the camera with the 'R' key.  " +
			"Aim the camera with the mouse.\n" + 
			"Move the camera with the arrow keys and left and right mouse buttons.  " +
			"Speed up and slow down camera movement with '+/=' and '-' keys.\n" +
			"Tab through various states using the 'prev state' and 'next state' buttons.";
			
menger.title = "Menger sponge";

menger.curlevel = null;
menger.maxlevel = 4;

menger.sellev = null;
menger.sellev2 = null;
//var paslider = null;

menger.lesslevel = function() {
	if (menger.curlevel > 0)
		--menger.curlevel;
	menger.updatelevel();
};

menger.morelevel = function() {
	if (menger.curlevel < menger.maxlevel)
		++menger.curlevel;
	menger.updatelevel();
};

menger.selectlevel = function(sel) {
	menger.curlevel = sel.selectedIndex;
	menger.updatelevel();
};
	
menger.pow3 = [];
menger.trin;

// return an value of binary has ones, base3 to base2 like
menger.tobase3 = function(n,ndig) {
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

menger.getones = function(lev) {
	menger.trin = [];
	var m = menger.pow3[lev];
	var i;
	for (i=0;i<m;++i) {
		var r = menger.tobase3(i,lev);
		menger.trin.push(r);
	}
};

menger.issolid = function(pos) {
	var br = [];
	var i;
	for (i=0;i<3;++i) {
		var t = pos[i];
		var b;
		if (t<0 || t>=menger.trin.length)
			return false;
		b = menger.trin[t];
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
	
menger.smeshfaceposx = {
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

menger.smeshfacenegx = {
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

menger.smeshfaceposy = {
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

menger.smeshfacenegy = {
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

menger.smeshfaceposz = {
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

menger.smeshfacenegz = {
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

menger.meshes6 = [
	menger.smeshfaceposz,
	menger.smeshfacenegz,
	menger.smeshfaceposx,
	menger.smeshfacenegx,
	menger.smeshfaceposy,
	menger.smeshfacenegy
];

menger.off60 = [
	[0,0,0],
	[0,0,1],
	[0,0,0],
	[1,0,0],
	[0,0,0],
	[0,1,0]
];
menger.off62 = [
	[0,0,-1],
	[0,0,1],
	[-1,0,0],
	[1,0,0],
	[0,-1,0],
	[0,1,0]
];
menger.colss6 = [
	[1,.125,.125,1],
	[.125,1,.125,1],
	[.125,.125,1,1],
	[1,1,.125,1],
	[1,.125,1,1],
	[.125,1,1,1]
];

menger.smesh;
menger.curmeshidx;

menger.clearsmesh = function() {
	menger.smesh = {verts:[],faces:[],uvs:[]};
	menger.curmeshidx = 0;
};

menger.addsmesh = function(off,msh) {
	var i,j;
	// 4 verts
	for (i=0;i<4;++i) {
		for (j=0;j<3;++j) {
			menger.smesh.verts.push(msh.verts[3*i+j]+off[j]);
		}
	}
	// 4 uvs
	for (i=0;i<4;++i) {
		for (j=0;j<2;++j) {
			menger.smesh.uvs.push(msh.uvs[2*i+j]);
		}
	}
	// 2 faces
	for (i=0;i<2;++i) {
		for (j=0;j<3;++j) {
			menger.smesh.faces.push(msh.faces[3*i+j]+menger.curmeshidx);
		}
	}
	menger.curmeshidx += 4;
};

menger.makesponge = function(level,f) {
	var i,j,k,f;
	var m = menger.pow3[level];
	menger.getones(level);
	menger.clearsmesh();
	for (k=0;k<=m;++k) {
		for (j=0;j<=m;++j) {
			for (i=0;i<=m;++i) {
//				for (f=0;f<6;++f) {
					var off0 = [i+menger.off60[f][0], j+menger.off60[f][1], k+menger.off60[f][2]];
					var off1 = [i,j,k];
					var off2 = [i+menger.off62[f][0], j+menger.off62[f][1], k+menger.off62[f][2]];
					
					// pz
					//off1 = [i,j,k];
					//off2 = [i,j,k-1];
					if (menger.issolid(off1) && !menger.issolid(off2))
						menger.addsmesh(off0,menger.meshes6[f]);
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
	return menger.smesh;
};

menger.updatelevel = function() {
	//if (myform)
		selectsetidx(menger.sellev,menger.curlevel);
		slidersetidx(menger.sellev2,menger.curlevel);
	//else
	//	curlevel = 2;
	printareadraw(menger.levelarea,"Level : " + menger.curlevel);
	var lev,f;
	/*
	var childcopy = roottree.children.slice();
	for (i=0;i<childcopy.length;++i) {
		childcopy[i].glfree();
		childcopy[i].unlinkchild();
	} */
	menger.roottree.glfree();
	menger.roottree = new Tree2("roottree");
	var simple = false;
	if (simple) {
		var tree1 = buildprism("aprism2",[.5,.5,.5],"maptestnck.png","tex"); // helper, builds 1 prism returns a Tree2
		menger.roottree.linkchild(tree1);
		return;
	}
	lev = Math.floor(menger.curlevel);
	//for (lev=cur;lev<=3;++lev) {
		for (var g=0;g<6;++g) {
			// a modelpart
			var amod = Model2.createmodel("spongemod m" + lev + "s" + g);
			if (amod.refcount == 1) {
				//amod.setmesh(smeshtemplate);
				var msh = menger.makesponge(lev,g);//,[0,-lev*1.5,0]);
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
				amod.mat.color = menger.colss6[g];
				//amod.mat.color = [.75,.75,.75,1];
				amod.commit();
				//amod.settexture();
				var atree = new Tree2("spongepart" + lev);
				atree.setmodel(amod);
				//atree.trans = [0,(4-lev)*1.5,0];
				//atree.trans = [-.45,-.45,0];
				atree.trans = [-.5,-.5,0];
				var scl = 1.0/menger.pow3[lev];
				atree.scale = [scl,scl,scl];
				//pendpce0.rotvel = [.1,.5,0];
				//pendpce0.flags |= treeflagenums.ALWAYSFACING;
				menger.roottree.linkchild(atree);
			}
		}
	//}
};

menger.sliderCallback = function(val) {
	//paslider.settext(val.value);
	//printareadraw(paslider,val.value);
	menger.curlevel = val.value;
	menger.updatelevel();
};

menger.load = function() {
	//if (!gl)
	//	return;
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("fortpoint/BridgeCon1.png");
};

menger.makeLevelSelect = function() {
	var ret = [];
	var i;
	for (i=0;i<=menger.maxlevel;++i) {
		var str = "Level " + i;
		ret.push(str);
	}
	return ret;
};

menger.init = function() {
//	gl_mode(true);

menger.pow3 = [1,3,9,27,81,243,729];

	menger.curlevel = 2; // actually 2
//	if (!gl)
//		return;
	logger("entering webgl menger\n");
	
	// build the scene
	menger.roottree = new Tree2("root");
	
	
	// ui
	setbutsname('menger');
	menger.levelarea = makeaprintarea('level: ');
	makeabut("lower level",null,menger.lesslevel);
	makeabut("higher level",null,menger.morelevel);
	//if (myform)
	var selstr = menger.makeLevelSelect();
	menger.sellev = makeaselect(selstr,menger.selectlevel);
	//sellev = makeaselect(["Level 0","Level 1","Level 2","Level 3","Level 4"],selectlevel);
	menger.sellev2 = makeaslider(0, menger.maxlevel, menger.curlevel, menger.sliderCallback);
	//paslider = makeaprintarea("slider output");
	//printareadraw(paslider,sellev2.value);
	menger.updatelevel();
	
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

menger.proc = function() {
//	if (!gl)
//		return;
//    gl.clearColor(.25,.25,0,1);                      // Set clear color to yellow, fully opaque
//    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	menger.roottree.proc();
	doflycam(mainvp); // modify the trs of the vp
	
	//pendpce0.trans = [0,0,0];
	//dolights(); // get some lights to eye space
	//mainvp.trans[0] += 1;
	beginscene(mainvp);
	//mainvp.trans[0] -= 1;
	menger.roottree.draw();
	//endscene();
};

menger.exit = function() {
//	gl_mode(false);
//	if (!gl)
//		return;
	menger.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	menger.roottree.glfree();
	logrc();
	menger.roottree = null;
	logger("exiting webgl menger\n");
	clearbuts('menger');
	//mainvp.isortho = false;
};
