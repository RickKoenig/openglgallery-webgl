// very minimalist 3D state
var race_fill = {}; // the 'race_fill' state

race_fill.text = "WebGL: race_fill 3D drawing";
race_fill.title = "race_fill";

// load these before init
race_fill.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

race_fill.gotoLogin = function() {
    changestate("race_login", "from FILL");
}

race_fill.init = function() {
	race_fill.count = 0;
	logger("entering webgl race_fill 3D\n");

	// ui
	setbutsname('fill');
	race_lobby.fillButton = makeabut("login", race_fill.gotoLogin);

    // build parent
	race_fill.roottree = new Tree2("race_fill root tree");

	// build a planexy (a square)
	// make double sided and test gl_FrontFace (TODO: check spelling)
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","diffusespecp");
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","tex");
	var plane = buildplanexy("aplane",1,1,"maptestnck.png","texDoubleSided");
	plane.mod.flags |= modelflagenums.DOUBLESIDED;

	plane.trans = [0,0,1];
	race_fill.roottree.linkchild(plane);

	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
};

race_fill.proc = function() {
	// proc
	++race_fill.count;
	// do something after 4 seconds
	if (race_fill.count == 4*fpswanted) {
		//changestate("solarTest");
		//window.history.back();
		//window.location.href = "../../index.html";
		//window.location.href = "http://janko.at";
	}
	race_fill.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	race_fill.roottree.draw();
};

race_fill.exit = function() {
	// show current usage before cleanup
	race_fill.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_fill.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	race_fill.roottree = null;
	clearbuts('fill');
	logger("exiting webgl race_fill 3D\n");
};
