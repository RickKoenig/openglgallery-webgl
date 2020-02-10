var ghostcity = {};

ghostcity.roottree;

ghostcity.text = "WebGL: Load a .bws file.  Ghost City\n" +
			"This may take awhile to load.\n" +
			"Press 'C' then hold down 'up arrow' to begin your adventure!";

ghostcity.title = "Ghost City";

// multiview interface
ghostcity.multiview;

ghostcity.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	//preloadbws("prehistoric/prehistoric.BWS");
	preloadbws("ghostcity/ghostcity.BWS");
};

ghostcity.init = function() {
	logger("entering webgl ghostcity\n");
	
	// setup the whole multiview system
	ghostcity.multiview = new Interleave3D();
	
	// create root tree
	ghostcity.roottree = new Tree2("root");

	// create directional light and attach to root tree
	var lt = new Tree2("dirlight");
	lt.rot = [Math.PI/4,0,0]; // point light down 45 degrees
	lt.rotvel = [0,1,0]; // spin on vertical axis
	lt.flags |= treeflagenums.DIRLIGHT;
	addlight(lt);
	ghostcity.roottree.linkchild(lt);

	// create scene and attach to root tree
	//var bwstree = new Tree2("prehistoric.BWS");
	//unchunktest(preloadedbin["ghostcity.BWS"]);
	var bwstree = new Tree2("ghostcity.BWS");
	ghostcity.roottree.linkchild(bwstree);

	// set camera orientation
	mainvp.trans = [-20.8,51.6,-45.1];
	mainvp.rot = [-.098,1.59,0];
};

ghostcity.proc = function() {
	doflycam(mainvp); // modify the trs of vp
	ghostcity.roottree.proc();
	
	
		// MAIN SCREEN
	// draw main vp
	if (true) { // use interleave and 4 views
		ghostcity.multiview.beginsceneAndDraw(mainvp,ghostcity.roottree);
	} else { // just normal 1 view drawing
		beginscene(mainvp);
		ghostcity.roottree.draw(); // depends on FB 1,2,3
	}
};

ghostcity.onresize = function() {
	logger("ghostcity: onResize " + glc.clientWidth + " " + glc.clientHeight + "\n");
	ghostcity.multiview.onresize();
};

ghostcity.exit = function() {
	ghostcity.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	ghostcity.roottree.glfree();
	ghostcity.multiview.glfree();
	logrc();
	ghostcity.roottree = null;
	mainvp.camattach = null;
	mainvp.incamattach = false;
	mainvp.lookat = null;
	mainvp.inlookat = false;
	logger("exiting webgl ghostcity\n");
};
