// very minimalist 3D state
var race_console = {}; // the 'race_console' state

race_console.text = "WebGL: race_console 3D drawing";
race_console.title = "race_console";

// load these before init
race_console.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

race_console.gotoLobby = function() {
    changestate("race_lobby");
}

race_console.gotoFill = function() {
    changestate("race_fill");
}

race_console.init = function(intentData) {
	race_console.count = 0;
	logger("entering webgl race_console 3D\n");

	// ui
	setbutsname('console');
	race_console.lobbyButton = makeabut("lobby", race_console.gotoLobby);
	race_console.fillButton = makeabut("fill", race_console.gotoFill);
	race_console.showIntent = makeaprintarea("intent = '" + intentData + "'");
	
	// build parent
	race_console.roottree = new Tree2("race_console root tree");

	// build a planexy (a square)
	// make double sided and test gl_FrontFace (TODO: check spelling)
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","diffusespecp");
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","tex");
	var plane = buildplanexy("aplane",1,1,"maptestnck.png","texDoubleSided");
	plane.mod.flags |= modelflagenums.DOUBLESIDED;

	plane.trans = [0,0,1];
	race_console.roottree.linkchild(plane);

	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
};

race_console.proc = function() {
	// proc
	++race_console.count;
	// do something after 4 seconds
	if (race_console.count == 4*fpswanted) {
		//changestate("solarTest");
		//window.history.back();
		//window.location.href = "../../index.html";
		//window.location.href = "http://janko.at";
	}
	race_console.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	race_console.roottree.draw();
};

race_console.exit = function() {
	// show current usage before cleanup
	race_console.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_console.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	race_console.roottree = null;
	clearbuts('console');
	logger("exiting webgl race_console 3D\n");
};
