var state19 = {};

state19.text = "WebGL: Lorenz attractor\nPress 'a' to toggle cam attach.  Press 'l' to toggle cam lookat\nPress 'c' to control camera\n";

state19.title = "Lorenz Attractor";

state19.shadowtexture;

state19.lightdist = 20;
state19.lightloc = [0,state19.lightdist,-state19.lightdist];

state19.vectormaster;
state19.vectormasterc;
state19.vectorlist;

state19.vectorversion = 1;
//state19.vectorversion = 2;

state19.roottree;

state19.makevectormaster = function() {
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

state19.makevectormasterc = function() {
	switch(state19.vectorversion) {
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

state19.changeavector = function(t,pos,dir,scl) {
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

state19.makeavector = function(pos,dir,center,c) {
	if (!c)
		c = [1,1,1,1];
	//++arrowcnt;
	var t;
	if (center)
		t = state19.vectormasterc.newdup();
	else
		t = state19.vectormaster.newdup();
	state19.changeavector(t,pos,dir,.1);
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

state19.circlesim = function(pos) {
	var step = .01;
	var vel = vec3.create();
	vel[0] = -step*pos[1];
	vel[1] = step*pos[0];
	vel[2] = -step*pos[2];
	return vel;
};

state19.lorenzsim = function(pos) {
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

state19.procsim1 = function(f) {
	var i,n = state19.vectorlist.length;
	var t;
	for (i=0;i<n;++i) {
		t = state19.vectorlist[i];
		t.transvel = f(t.trans);
		var dir = vec3.create();
		vec3.scale(dir,t.transvel,2);
		state19.changeavector(t,t.trans,dir,3);
	}
};

state19.load = function() {
	//if (!gl)
	//	return;
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("fortpoint/Asphalt.png");
	preloadimg("../common/sptpics/wonMedal.png");
};

state19.init = function() {
	checkglerror("start of state19 init 1");
	checkglerror("start of state19 init 2");
	checkglerror("start of state19 init 3");
//	gl_mode(true);
//	if (!gl)
//		return;
	logger("entering webgl state19\n");
	state19.vectorlist = [];

// build render target
	var shadowmapres = 2048;
	state19.shadowtexture = FrameBufferTexture.createtexture("shadowmap",shadowmapres,shadowmapres);

// shadow viewport
	state19.shadowvp = {
		target:state19.shadowtexture,
	   	clearflags:gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
		//clearcolor:[1,1,1,1],                    // Set clear color to yellow, fully opaque
		clearcolor:[0,0,0,1],                    // Set clear color to yellow, fully opaque
	//	mat4.create();
		"trans":vec3.clone(state19.lightloc),
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
	state19.mvp = {
	   	clearflags:gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
		clearcolor:[.15,.25,.75,1],                    // Set clear color to yellow, fully opaque
		trans:[-21,-3,3],
	//	"trans":vec3.clone(state19.lightloc),
		"rot":[Math.PI/4,0,0], // part of lightdir
		//"scale":[1,1,1],
	   	near:.1,
	   	far:10000.0,
	   	zoom:1,
		asp:gl.asp,
		inlookat:true,
		xo:0,
		yo:0,
		xs:1,
		ys:1
	};

// build a master vector
	state19.vectormaster = state19.makevectormaster();
	state19.vectormasterc = state19.makevectormasterc();
	
//// build the main screen scene
	state19.roottree = new Tree2("root");
	
	// back plane
	var atree1 = buildplanexy2t("planexy1",20,20,"maptestnck.png","shadowmap","shadowmapuse"); // tex
	atree1.trans = [0,0,20];
	atree1.flags |= treeflagenums.DONTCASTSHADOW;
	state19.roottree.linkchild(atree1);
	
	// ground plane
	var atree1b = buildplanexz2t("planexz1",20,20,"maptestnck.png","shadowmap","shadowmapuse"); // tex
	atree1b.trans = [0,-20,0];
	atree1b.flags |= treeflagenums.DONTCASTSHADOW;
	state19.roottree.linkchild(atree1b);
	
/*	// test object
	var as = buildcylinderxz2t("cyl6",.4,2.5,"Asphalt.png","shadowmap","shadowmapuse");
	as.scale = [2,2,2];
	//as.rotvel = [0,0,.3];
	as.rot = [0,0,Math.PI/2-.1];
	as.trans = [0,-10,10];
	state19.roottree.linkchild(as);
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
				state19.roottree.linkchild(as);
				state19.vectorlist.push(as);
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
				state19.roottree.linkchild(as);
				state19.vectorlist.push(as);
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
		as = state19.makeavector([x,y,z],[1,0,0],true,[Math.random()*.5+.5,Math.random()*.5+.5,Math.random()*.5+.5,1]);
		//as.rotvel = [Math.random(),Math.random(),Math.random()];
		//as.scale = [4,4,4];
		state19.roottree.linkchild(as);
		state19.vectorlist.push(as);
	}
	// the light
	var atree4 = buildsphere("sph4",.2,null,"flat"); // this is where the light is for (point) shadowcasting
	atree4.mod.mat.color = [1,1,.5,1];
	atree4.trans = vec3.clone(state19.lightloc);
	atree4.flags |= treeflagenums.DONTCASTSHADOW;
	atree4.flags |= treeflagenums.DIRLIGHT;
	atree4.rot = [Math.PI/4,0,0];
	addlight(atree4);
	state19.roottree.linkchild(atree4);

//// set the lights (directional)
	//lights.wlightdir = vec3.fromValues(0,-.7071,.7071);  // part of lightdir
	
//// set the camera
	//mainvp.trans = vec3.clone(state19.lightloc);
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
	state19.mvp.lookat = state19.vectorlist[0];
	state19.mvp.inlookat = true;
	state19.mvp.camattach = state19.vectorlist[1];
	state19.mvp.incamattach = false;
	checkglerror("end of state19 init");

	// shadow map viewer
	var atree3 = buildplanexy("planexy3",2,2,"shadowmap","shadowmapshow"); // invert framebuffer renders, sigh
	atree3.trans = [7,0,-1];
	atree3.flags |= treeflagenums.DONTCASTSHADOW;
	state19.roottree.linkchild(atree3);
	state19.testint = 3;
	
	// UI debprint 
	debprint.addlist("lorenz",[
		"state19.testint",
		"state19.mvp", // change cursor qgate for testing
		"state19.shadowvp", // watch/modify the viewport that spriter.js uses
	]);
	state19.onresize();

};

state19.onresize= function() {
	state19.mvp.asp = gl.asp;
};

state19.proc = function() {
	debprint.buildstrarr();
	checkglerror("lorenz attractor proc start check gl error");
	
//	if (!gl)
//		return;
	
	// run the simulation here
	var i;
	for (i=0;i<10;++i) {
		//state19.procsim1(state19.circlesim);
		state19.procsim1(state19.lorenzsim);
		state19.roottree.proc();
	}

	// lookat the 0th arrow/vector
	doflycam(state19.mvp); // modify the trs of the vp
	
	// draw to shadowmap
	beginscene(state19.shadowvp);
	checkglerror("lorenz attractor draw start check gl error");
	state19.roottree.draw();
	checkglerror("lorenz attractor draw end check gl error");

	// draw main scene
	beginscene(state19.mvp);	
	state19.roottree.draw();
	checkglerror("lorenz attractor proc end check gl error");
};

state19.exit = function() {
	checkglerror("lorenz attractor exit start check gl error");

	// remove qcomp from debprint
	debprint.removelist("lorenz");

	// show state
	state19.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	
	// free everything
	state19.roottree.glfree();
	state19.shadowtexture.glfree();
	state19.vectormaster.glfree();
	state19.vectormasterc.glfree();
	
	// show freed state
	logrc();
	state19.roottree = null;
	state19.mvp.lookat = null;
	state19.mvp.inlookat = false;
	logger("exiting webgl state19\n");
	checkglerror("lorenz attractor exit end check gl error");
	
	switch(state19.vectorversion) {
	case 1:
		state19.vectorversion = 2;
		break;
	case 2:
		state19.vectorversion = 1;
		break;
	}
			
};
