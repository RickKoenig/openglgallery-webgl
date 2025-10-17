'use strict';

// very minimalist 3D state
var basic = {}; // the 'basic' state

basic.text = "WebGL: Most basic 3D drawing";
basic.title = "Basic 3D";

// load these before init
basic.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

basic.init = function() {
	logger("entering webgl basic 3D\n");

	// build parent
	basic.roottree = new Tree2("basic root tree");

	// build a planexy (a square)
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","diffusespecp");
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","tex");
	var plane = buildplanexy("aplane",1,1,"maptestnck.png","texDoubleSided");
	plane.mod.flags |= modelflagenums.DOUBLESIDED;
	plane.trans = [-1.5,1.5,2.5];
	basic.roottree.linkchild(plane);
	plane = plane.newdup();
	plane.trans = [1.5,-1.5,2.5];
	basic.roottree.linkchild(plane);

	var prism = buildprism("aprism",[1, 1, 1], "maptestnck.png", "tex");
	prism.trans = [-1.5, -1.5, 3.5];
	basic.roottree.linkchild(prism);
	prism = prism.newdup();
	prism.trans = [1.5, 1.5, 3.5];
	basic.roottree.linkchild(prism);

	basic.sphere = buildsphere("asphere", 1 / 16, "maptestnck.png", "texc");
	basic.sphere.mod.mat.color = [.5, .5, 0, 1];
	basic.sphere.trans = [0, 0, 1];
	basic.roottree.linkchild(basic.sphere);

	if (URLparams.isOrtho) {
		mainvp = defaultorthoviewport();
		mainvp.ortho_size = 2.5;
		mainvp.clearcolor = [.75,.75,1,1];
	} else {
		mainvp = defaultviewport();
		mainvp.clearcolor = [0,.5,1,1];
	}
	// use ndc extra system
	mainvp.extraWidth = 7 / 5;
	mainvp.extraHeight = 1;//7 / 5;
};

basic.proc = function() {
	// proc
	// use ndc extra system
	glc.extraWidth = mainvp.extraWidth;
	glc.extraHeight = mainvp.extraHeight;
	input.extraWidth = mainvp.extraWidth;
	input.extraHeight = mainvp.extraHeight;
	// use sphere as a cursor
	basic.sphere.trans = [input.fmx, input.fmy, 1];
	if (URLparams.isOrtho) {
		basic.sphere.trans[0] *= mainvp.ortho_size;
		basic.sphere.trans[1] *= mainvp.ortho_size;
	}
	basic.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	basic.roottree.draw();

	// reset extra ndc system, output
	glc.extraHeight = 1;
	glc.extraWidth = 1;
};

basic.exit = function() {
	// show current usage before cleanup
	basic.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	basic.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	basic.roottree = null;
	logger("exiting webgl basic 3D\n");

	// reset extra ndc system, input
	input.extraWidth = 1;
	input.extraHeight = 1;
};
