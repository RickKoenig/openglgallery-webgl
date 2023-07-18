// very minimalist 3D state
var race_ingame = {}; // the 'race_ingame' state

race_ingame.text = "WebGL: race_ingame 3D drawing";
race_ingame.title = "race_ingame";

// load these before init
race_ingame.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

race_ingame.init = function() {
	race_ingame.count = 0;
	logger("entering webgl race_ingame 3D\n");

	// build parent
	race_ingame.roottree = new Tree2("race_ingame root tree");

	// build a planexy (a square)
	// make double sided and test gl_FrontFace (TODO: check spelling)
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","diffusespecp");
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","tex");
	var plane = buildplanexy("aplane",1,1,"maptestnck.png","texDoubleSided");
	plane.mod.flags |= modelflagenums.DOUBLESIDED;

	plane.trans = [0,0,1];
	race_ingame.roottree.linkchild(plane);

	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
};

race_ingame.proc = function() {
	// proc
	++race_ingame.count;
	// do something after 4 seconds
	if (race_ingame.count == 4*fpswanted) {
		//changestate("solarTest");
		//window.history.back();
		//window.location.href = "../../index.html";
		//window.location.href = "http://janko.at";
	}
	race_ingame.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	race_ingame.roottree.draw();
};

race_ingame.exit = function() {
	// show current usage before cleanup
	race_ingame.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_ingame.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	race_ingame.roottree = null;
	logger("exiting webgl race_ingame 3D\n");
};
