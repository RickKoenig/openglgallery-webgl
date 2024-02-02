// very minimalist 3D state
var race_results = {}; // the 'race_results' state
race_results.hidden = true; // can't be selected in the engine UI

race_results.text = "WebGL: race_results 3D drawing";
race_results.title = "race_results";

// load these before init
race_results.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

race_results.init = function() {
	race_results.count = 0;
	logger("entering webgl race_results 3D\n");

	// build parent
	race_results.roottree = new Tree2("race_results root tree");

	// build a planexy (a square)
	// make double sided and test gl_FrontFace
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","diffusespecp");
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","tex");
	var plane = buildplanexy("aplane",1,1,"maptestnck.png","texDoubleSided");
	plane.mod.flags |= modelflagenums.DOUBLESIDED;

	plane.trans = [0,0,1];
	race_results.roottree.linkchild(plane);

	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
};

race_results.proc = function() {
	// proc
	++race_results.count;
	// do something after 4 seconds
	if (race_results.count == 4*fpswanted) {
		//changestate("solarTest");
		//window.history.back();
		//window.location.href = "../../index.html";
		//window.location.href = "http://janko.at";
	}
	race_results.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	race_results.roottree.draw();
};

race_results.exit = function() {
	// show current usage before cleanup
	race_results.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_results.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	race_results.roottree = null;
	logger("exiting webgl race_results 3D\n");
};
