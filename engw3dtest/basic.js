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
	//scratch.inputtext = makeatext('URL','http://23.123.140.155:88/engw/engw3dtest/shaders/basic.ps',scratch.upfunctext);
	//scratch.inputtext = makeatext('URL','http://127.0.0.1:88/engw/engw3dtest/textdata/text1.txt',scratch.upfunctext);
	basic.info = makeaprintarea('info','hiho');

	// build parent
	basic.roottree = new Tree2("basic root tree");

	// build a planexy (a square)
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","diffusespecp");
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","tex");
	var plane = buildplanexy("aplane",1,1,"maptestnck.png","texDoubleSided");
	plane.mod.flags |= modelflagenums.DOUBLESIDED;
	plane.trans = [-1.5, 1.5, 2.5];
	basic.roottree.linkchild(plane);
	plane = plane.newdup();
	plane.trans = [1.5, -1.5, 2.5];
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

	const backgnd = buildplanexy("backgnd", 4 / 3, 3 / 3, "maptestnck.png", "texc", 1, 1, 4, 3);
	backgnd.mod.mat.color = [1, 1, 1, .25];
	backgnd.mod.flags |= modelflagenums.DOUBLESIDED | modelflagenums.HASALPHA | modelflagenums.NOZBUFFER;
	backgnd.trans = [0, 0, 1];
	basic.roottree.linkchild(backgnd);

		// build model font2, hilight
	basic.font2 = new ModelFont("font2","font0.png","font2c",2, 2,100,100);
    basic.font2.mat.fcolor = [1,1,1,1];
    basic.font2.mat.bcolor = [0,0,0,1];
	basic.font2.print("Hum");
	basic.treef2 = new Tree2("basic.font2");
	basic.treef2.trans = [-.875, .25, 1];
	// TODO: stop using hard coded glyph sizes, (right now 16,32)
	basic.treef2.scale = [16 / glc.clientHeight, 32 / glc.clientHeight, 1];
	basic.treef2.setmodel(basic.font2);
	basic.roottree.linkchild(basic.treef2);


	if (URLparams.isOrtho) {
		mainvp = defaultorthoviewport();
		mainvp.ortho_size = 2.5;
		mainvp.clearcolor = [.75,.75,1,1];
	} else {
		mainvp = defaultviewport();
		mainvp.clearcolor = [0,.5,1,1];
	}
	// use ndc extra system
	mainvp.extraWidth = 4 / 3;
	mainvp.extraHeight = 1;//1;//7 / 5;
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
	//basic.info.print("hi");
	//printareadraw(basic.info,"scratch Info = " + fpsCurrent);
	basic.updateInfo();
};

basic.updateInfo = function() {
	const plotter2dBody = document.getElementById("body");		
	const plotter2dDiv = document.getElementById("drawarea");		
	const plotter2dCanvas = document.getElementById("mycanvas2");		

	let infoStr;
	const bodyWid = plotter2dBody.clientWidth;
	const bodyHit = plotter2dBody.clientHeight;
	const divWid = plotter2dDiv.clientWidth;
	const divHit = plotter2dDiv.clientHeight;
	const canWid = plotter2dCanvas.clientWidth;
	const canHit = plotter2dCanvas.clientHeight;
	const bufWid = plotter2dCanvas.width;
	const bufHit = plotter2dCanvas.height;

	if (basic.info) {
		infoStr = "Info<br>"
			+ "<br>div bod = " + bodyWid + ", " + bodyHit
			+ "<br>div dim = " + divWid + ", " + divHit
			+ "<br>can dim = " + canWid + ", " + canHit
			+ "<br>buf dim = " + bufWid + ", " + bufHit
			+ "<br>";
		basic.info.innerHTML = infoStr;
	}

	infoStr = 
		"div body = " + bodyWid + ", " + bodyHit
		+ "\ndiv dim = " + divWid + ", " + divHit
		+ "\ncan dim = " + canWid + ", " + canHit
		+ "\nbuf dim = " + bufWid + ", " + bufHit;
	basic.font2.print(infoStr);
};

basic.exit = function() {
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

	// reset extra ndc system, input
	input.extraWidth = 1;
	input.extraHeight = 1;
};
