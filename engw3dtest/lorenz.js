var lorenz = {};

lorenz.text = "WebGL: Lorenz attractor\nPress 'a' to toggle cam attach.  Press 'l' to toggle cam lookat\nPress 'c' to control camera\n";

lorenz.title = "Lorenz Attractor";

lorenz.shadowtexture;

lorenz.lightdist = 20;
lorenz.lightloc = [0,lorenz.lightdist,-lorenz.lightdist];

lorenz.vectormaster;
lorenz.vectormasterc;
lorenz.vectorlist;

lorenz.vectorversion = 1;
//lorenz.vectorversion = 2;

lorenz.roottree;

lorenz.makevectormaster = function() {
	var arrowmaster = new Tree2("arrow");
	var c = [
		Math.random(),
		Math.random(),
		Math.random(),
		1.0
	];
	// a modelpart
	//var atree = buildsphere("atree",.1,"Asphalt.png","diffusespecp");
	var atree = buildconexz2t("tail",.125,.5,"maptestnck.png","shadowmap","shadowmapuse");
	atree.trans = [0,0,0];
	//atree.rot = [0,0,-Math.PI/2];
	atree.mat.color = c;
	arrowmaster.linkchild(atree);
	atree = buildcylinderxz2t("mid",.0625,.5,"Asphalt.png","shadowmap","shadowmapuse");
	atree.trans = [0,.25,0];
	//atree.rot = [0,0,-Math.PI/2];
	atree.mat.color = c;
	arrowmaster.linkchild(atree);
	atree = buildconexz2t("head",.125,.5,"maptestnck.png","shadowmap","shadowmapuse");
	atree.trans = [0,.75,0];
	//atree.rot = [0,0,-Math.PI/2];
	atree.mat.color = c;
	arrowmaster.linkchild(atree);
	//atree.trans = [0,0,0];
	//atree.rotvel = [.01,.05,0]; 
	return arrowmaster;
};

lorenz.makevectormasterc = function() {
	switch(lorenz.vectorversion) {
	case 1:
		var arrowmaster = new Tree2("arrow");
		var c = [
			Math.random(),
			Math.random(),
			Math.random(),
			1.0
		];
		// a modelpart
		//var atree = buildsphere("atree",.1,"Asphalt.png","diffusespecp");
		var atree = buildconexz2t("tailc",.125,.5,"maptestnck.png","shadowmap","shadowmapusec");
		atree.trans = [0,-.5,0];
		//atree.rot = [0,0,-Math.PI/2];
		atree.mat.color = c;
		arrowmaster.linkchild(atree);
		atree = buildcylinderxz2t("midc",.0625,.5,"Asphalt.png","shadowmap","shadowmapusec");
		atree.trans = [0,-.25,0];
		//atree.rot = [0,0,-Math.PI/2];
		atree.mat.color = c;
		arrowmaster.linkchild(atree);
		atree = buildconexz2t("headc",.125,.5,"maptestnck.png","shadowmap","shadowmapusec");
		atree.trans = [0,.25,0];
		//atree.rot = [0,0,-Math.PI/2];
		atree.mat.color = c;
		arrowmaster.linkchild(atree);
		//atree.trans = [0,0,0];
		//atree.rotvel = [.01,.05,0]; 
		break;
	case 2:
		var arrowmaster = buildpaperairplane("paperairplane","cvert");
		//arrowmaster.mat.color = [1,0,0,1];
		break;
	}
	return arrowmaster;
};

lorenz.changeavector = function(t,pos,dir,scl) {
	t.trans = vec3.clone(pos);
	//t.rot = [0,0,r];
	if (!dir)
		return t;
	//t.qrot = dir2quat(dir);
	t.rot = dir2rotY(dir);
	//t.rot = [0,0,ang];
	var s = scl*vec3.length(dir);	
	t.scale = [s,s,s];
	//t.transvel = [5*Math.cos(a),5*Math.sin(a),0];
	//t.rot = [0,0,a];
	//t.cnt = 5;
	//t.userproc = arrowuserproc;
};

lorenz.makeavector = function(pos,dir,center,c) {
	if (!c)
		c = [1,1,1,1];
	//++arrowcnt;
	var t;
	if (center)
		t = lorenz.vectormasterc.newdup();
	else
		t = lorenz.vectormaster.newdup();
	lorenz.changeavector(t,pos,dir,.1);
	if (t.children.length) {
		var tail = t.children[0];
		tail.children[0].mat.color = c;
		tail.children[1].mat.color = c;
		var mid = t.children[1];
		mid.children[0].mat.color = c;
		mid.children[1].mat.color = c;
		mid.children[2].mat.color = c;
		var head = t.children[2];
		head.children[0].mat.color = c;
		head.children[1].mat.color = c;
	}
	return t;
};

lorenz.circlesim = function(pos) {
	var step = .01;
	var vel = vec3.create();
	vel[0] = -step*pos[1];
	vel[1] = step*pos[0];
	vel[2] = -step*pos[2];
	return vel;
};

lorenz.lorenzsim = function(pos) {
	var sig = 10.0;
	var beta = 8.0/3.0;
	var rho = 28.0;
	var step = .01;
	var vel = vec3.create();
	vel[0] = sig*(pos[1]-pos[0]);
	vel[1] = pos[0]*(rho-(pos[2]+20)) - pos[1];
	vel[2] = pos[0]*pos[1] - beta*(pos[2]+20);
	vec3.scale(vel,vel,step);
	return vel;
};

lorenz.procsim1 = function(f) {
	var i,n = lorenz.vectorlist.length;
	var t;
	for (i=0;i<n;++i) {
		t = lorenz.vectorlist[i];
		t.transvel = f(t.trans);
		var dir = vec3.create();
		vec3.scale(dir,t.transvel,2);
		lorenz.changeavector(t,t.trans,dir,3);
	}
};

lorenz.load = function() {
	//if (!gl)
	//	return;
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("fortpoint/Asphalt.png");
	preloadimg("../common/sptpics/wonMedal.png");
};

lorenz.init = function() {
	checkglerror("start of lorenz init 1");
	checkglerror("start of lorenz init 2");
	checkglerror("start of lorenz init 3");
//	gl_mode(true);
//	if (!gl)
//		return;
	logger("entering webgl lorenz\n");
	lorenz.vectorlist = [];

// build render target
	var shadowmapres = 2048;
	lorenz.shadowtexture = FrameBufferTexture.createtexture("shadowmap",shadowmapres,shadowmapres);

// shadow viewport
	lorenz.shadowvp = {
		target:lorenz.shadowtexture,
	   	clearflags:gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
		//clearcolor:[1,1,1,1],                    // Set clear color to yellow, fully opaque
		clearcolor:[0,0,0,1],                    // Set clear color to yellow, fully opaque
	//	mat4.create();
		"trans":vec3.clone(lorenz.lightloc),
		"rot":[Math.PI/4,0,0], // part of lightdir
		//"scale":[1,1,1],
	   	near:.1,
	   	far:10000.0,
	   	zoom:1,
		asp:1,
		inlookat:false,
		isortho:false,
		ortho_size:1,
		isshadowmap:true,
		xo:0,
		yo:0,
		xs:1,
		ys:1
	};

// main viewport for state 19
	lorenz.mvp = {
	   	clearflags:gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
		clearcolor:[.15,.25,.75,1],                    // Set clear color to yellow, fully opaque
		trans:[-21,-3,3],
	//	"trans":vec3.clone(lorenz.lightloc),
		"rot":[Math.PI/4,0,0], // part of lightdir
		//"scale":[1,1,1],
	   	near:.1,
	   	far:10000.0,
	   	zoom:1,
		inlookat:true,
		xo:0,
		yo:0,
		xs:1,
		ys:1
	};

// build a master vector
	lorenz.vectormaster = lorenz.makevectormaster();
	lorenz.vectormasterc = lorenz.makevectormasterc();
	
//// build the main screen scene
	lorenz.roottree = new Tree2("root");
	
	// back plane
	var atree1 = buildplanexy2t("planexy1",20,20,"maptestnck.png","shadowmap","shadowmapuse"); // tex
	atree1.trans = [0,0,20];
	atree1.flags |= treeflagenums.DONTCASTSHADOW;
	lorenz.roottree.linkchild(atree1);
	
	// ground plane
	var atree1b = buildplanexz2t("planexz1",20,20,"maptestnck.png","shadowmap","shadowmapuse"); // tex
	atree1b.trans = [0,-20,0];
	atree1b.flags |= treeflagenums.DONTCASTSHADOW;
	lorenz.roottree.linkchild(atree1b);
	
/*	// test object
	var as = buildcylinderxz2t("cyl6",.4,2.5,"Asphalt.png","shadowmap","shadowmapuse");
	as.scale = [2,2,2];
	//as.rotvel = [0,0,.3];
	as.rot = [0,0,Math.PI/2-.1];
	as.trans = [0,-10,10];
	lorenz.roottree.linkchild(as);
*/	
	// a bunch of vectors
/*	var i,j,k;
	for (k=-1;k<=1;++k) {
		for (j=-1;j<=1;++j) {
			for (i=-1;i<=1;++i) {
				var sp = 3;
				as = makeavector([sp*i,sp*j,sp*k]);
				as.rotvel = [Math.random(),Math.random(),Math.random()];
				as.scale = [4,4,4];
				lorenz.roottree.linkchild(as);
				lorenz.vectorlist.push(as);
			}
		}
	}
*/
/*	// some more vectors
	var i,j,k;//k = 0;
	for (i=-1;i<=1;++i) {
		for (j=-1;j<=1;++j) {
			for (k=-1;k<=1;++k) {
				var sp = 3;
				as = makeavector([i,j,k],[i,j,k],true);
				//as.rotvel = [Math.random(),Math.random(),Math.random()];
				//as.scale = [4,4,4];
				lorenz.roottree.linkchild(as);
				lorenz.vectorlist.push(as);
			}
		}
	}
*/
	var i;
	for (i=0;i<250;++i) {
		var sz = 10;
		var x = 2*sz*Math.random()-sz;
		var y = 2*sz*Math.random()-sz;
		var z = 2*sz*Math.random()-sz;
		as = lorenz.makeavector([x,y,z],[1,0,0],true,[Math.random()*.5+.5,Math.random()*.5+.5,Math.random()*.5+.5,1]);
		//as.rotvel = [Math.random(),Math.random(),Math.random()];
		//as.scale = [4,4,4];
		lorenz.roottree.linkchild(as);
		lorenz.vectorlist.push(as);
	}
	// the light
	var atree4 = buildsphere("sph4",.2,null,"flat"); // this is where the light is for (point) shadowcasting
	atree4.mod.mat.color = [1,1,.5,1];
	atree4.trans = vec3.clone(lorenz.lightloc);
	atree4.flags |= treeflagenums.DONTCASTSHADOW;
	atree4.flags |= treeflagenums.DIRLIGHT;
	atree4.rot = [Math.PI/4,0,0];
	addlight(atree4);
	lorenz.roottree.linkchild(atree4);

//// set the lights (directional)
	//lights.wlightdir = vec3.fromValues(0,-.7071,.7071);  // part of lightdir
	
//// set the camera
	//mainvp.trans = vec3.clone(lorenz.lightloc);
	//vec3.scale(mainvp.trans,mainvp.trans,.5);
	//mainvp.trans = [-21,-3,3];
	//mainvp.inlookat = 1;
//	mainvp.rot = [Math.PI/4,0,0]; // part of lightdir
	// build the scene
/*	var testmat4 = mat4.create();
	mat4.lookAtlhc(testmat4,[0,0,10],[1,2,22],[0,1,0]);
	var testmat4inv = mat4.create();
	mat4.invert(testmat4inv,testmat4);
	//vp.trans,vp.lookattrans,[0,1,0]); */
	lorenz.mvp.lookat = lorenz.vectorlist[0];
	lorenz.mvp.inlookat = true;
	lorenz.mvp.camattach = lorenz.vectorlist[1];
	lorenz.mvp.incamattach = false;
	checkglerror("end of lorenz init");

	// shadow map viewer
	var atree3 = buildplanexy("planexy3",2,2,"shadowmap","shadowmapshow"); // invert framebuffer renders, sigh
	atree3.trans = [7,0,-1];
	atree3.flags |= treeflagenums.DONTCASTSHADOW;
	lorenz.roottree.linkchild(atree3);
	lorenz.testint = 3;
	
	// UI debprint 
	debprint.addlist("lorenz",[
		"lorenz.testint",
		"lorenz.mvp", // change cursor qgate for testing
		"lorenz.shadowvp", // watch/modify the viewport that spriter.js uses
	]);
	//lorenz.setsize();

};
/*
lorenz.setsize= function() {
	lorenz.mvp.asp = glc.asp;
};
*/
lorenz.proc = function() {
	debprint.buildstrarr();
	checkglerror("lorenz attractor proc start check gl error");
	
//	if (!gl)
//		return;
	
	// run the simulation here
	var i;
	for (i=0;i<10;++i) {
		//lorenz.procsim1(lorenz.circlesim);
		lorenz.procsim1(lorenz.lorenzsim);
		lorenz.roottree.proc();
	}

	// lookat the 0th arrow/vector
	doflycam(lorenz.mvp); // modify the trs of the vp
	
	// draw to shadowmap
	beginscene(lorenz.shadowvp);
	checkglerror("lorenz attractor draw start check gl error");
	lorenz.roottree.draw();
	checkglerror("lorenz attractor draw end check gl error");

	// draw main scene
	beginscene(lorenz.mvp);	
	lorenz.roottree.draw();
	checkglerror("lorenz attractor proc end check gl error");
};

lorenz.exit = function() {
	checkglerror("lorenz attractor exit start check gl error");

	// remove qcomp from debprint
	debprint.removelist("lorenz");

	// show state
	lorenz.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	
	// free everything
	lorenz.roottree.glfree();
	lorenz.shadowtexture.glfree();
	lorenz.vectormaster.glfree();
	lorenz.vectormasterc.glfree();
	
	// show freed state
	logrc();
	lorenz.roottree = null;
	lorenz.mvp.lookat = null;
	lorenz.mvp.inlookat = false;
	logger("exiting webgl lorenz\n");
	checkglerror("lorenz attractor exit end check gl error");
	
	switch(lorenz.vectorversion) {
	case 1:
		lorenz.vectorversion = 2;
		break;
	case 2:
		lorenz.vectorversion = 1;
		break;
	}
			
};
