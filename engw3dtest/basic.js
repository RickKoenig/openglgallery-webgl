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
	// ui
	setbutsname('basic');
	// build parent
	basic.roottree = new Tree2("basic root tree");

	// build 2 planexy (square)
	var plane = buildplanexy("aplane",1,1,"maptestnck.png","texDoubleSided");
	plane.mod.flags |= modelflagenums.DOUBLESIDED;
	plane.trans = [-1.5, 1.5, 2.5];
	basic.roottree.linkchild(plane);
	plane = plane.newdup();
	plane.trans = [1.5, -1.5, 2.5];
	basic.roottree.linkchild(plane);

	// build 2 prism (boxes)
	var prism = buildprism("aprism",[1, 1, 1], "maptestnck.png", "tex");
	prism.trans = [-1.5, -1.5, 3.5];
	basic.roottree.linkchild(prism);
	prism = prism.newdup();
	prism.trans = [1.5, 1.5, 3.5];
	basic.roottree.linkchild(prism);

	// cursor
	basic.sphere = buildsphere("asphere", 1 / 16, "maptestnck.png", "texc");
	basic.sphere.mod.mat.color = [.5, .5, 0, 1];
	basic.sphere.trans = [0, 0, 1];
	basic.roottree.linkchild(basic.sphere);

	// background
	const backgnd = buildplanexy("backgnd", 4 / 3, 3 / 3, "maptestnck.png", "texc", 1, 1, 4, 3);
	backgnd.mod.mat.color = [1, 1, 1, .25];
	backgnd.mod.flags |= modelflagenums.DOUBLESIDED | modelflagenums.HASALPHA | modelflagenums.NOZBUFFER;
	backgnd.trans = [0, 0, 1];
	basic.roottree.linkchild(backgnd);

	// viewport
	if (URLparams.isOrtho) {
		mainvp = defaultorthoviewport();
		mainvp.ortho_size = 2.5;
		mainvp.clearcolor = [.75,.75,1,1];
		backgnd.scale = [2.5, 2.5, 1];
	} else {
		mainvp = defaultviewport();
		mainvp.clearcolor = [0,.5,1,1];
	}
	// use ndc extra system
	mainvp.extraWidth = 4 / 3;
	mainvp.extraHeight = 1;
	// use ndc extra system
	glc.extraWidth = mainvp.extraWidth;
	glc.extraHeight = mainvp.extraHeight;
	input.extraWidth = mainvp.extraWidth;
	input.extraHeight = mainvp.extraHeight;
};

basic.proc = function() {
	// proc
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

};

basic.exit = function() {
	// reset extra ndc system, output
	glc.extraHeight = 1;
	glc.extraWidth = 1;
	mainvp.extraWidth = 1;
	mainvp.extraHeight = 1;
	// reset extra ndc system, input
	input.extraWidth = 1;
	input.extraHeight = 1;

	clearbuts('basic');
	// show current usage before cleanup
	basic.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	basic.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	basic.roottree = null;
	logger("exiting webgl basic 3D\n");
};
