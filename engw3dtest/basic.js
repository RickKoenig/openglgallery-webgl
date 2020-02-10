// very minimalist 3D state
var basic = {}; // the 'basic' state

basic.text = "WebGL: Most basic 3D drawing";
basic.title = "Basic 3D";

// load these before init
basic.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

basic.init = function() {
	basic.count = 0;
	logger("entering webgl basic 3D\n");

	// build parent
	basic.roottree = new Tree2("basic root tree");

	// build a planexy (a square)
	var plane = buildplanexy("aplane",1,1,"maptestnck.png","diffusespecp");
	plane.trans = [0,0,1];
	basic.roottree.linkchild(plane);

	mainvp = defaultviewport();	
};

basic.proc = function() {
	// proc
	++basic.count;
	// do something after 4 seconds
	if (basic.count == 4*fpswanted) {
		//changestate("solarTest");
		//window.history.back();
		//window.location.href = "../../index.html";
		//window.location.href = "http://janko.at";
	}
	basic.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	basic.roottree.draw();
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
};
