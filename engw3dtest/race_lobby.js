'use strict';

// very minimalist 3D state
var race_lobby = {}; // the 'race_lobby' state
race_lobby.hidden = true; // can't be selected in the engine UI

race_lobby.text = "WebGL: race_lobby 3D drawing";
race_lobby.title = "race_lobby";

// load these before init
race_lobby.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

race_lobby.gotoLogin = function() {
    changestate("race_login", "from LOBBY");
}

race_lobby.init = function() {
	race_lobby.count = 0;
	logger("entering webgl race_lobby 3D\n");

	// ui
	setbutsname('lobby');
	race_lobby.loginButton = makeabut("login", race_lobby.gotoLogin);

    // build parent
	race_lobby.roottree = new Tree2("race_lobby root tree");

	// build a planexy (a square)
	// make double sided and test gl_FrontFace
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","diffusespecp");
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","tex");
	var plane = buildplanexy("aplane",1,1,"maptestnck.png","texDoubleSided");
	plane.mod.flags |= modelflagenums.DOUBLESIDED;

	plane.trans = [0,0,1];
	race_lobby.roottree.linkchild(plane);

	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
};

race_lobby.proc = function() {
	// proc
	++race_lobby.count;
	// do something after 4 seconds
	if (race_lobby.count == 4*fpswanted) {
		//changestate("solarTest");
		//window.history.back();
		//window.location.href = "../../index.html";
		//window.location.href = "http://janko.at";
	}
	race_lobby.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	race_lobby.roottree.draw();
};

race_lobby.exit = function() {
	// show current usage before cleanup
	race_lobby.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_lobby.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	race_lobby.roottree = null;
	clearbuts('lobby');
	logger("exiting webgl race_lobby 3D\n");
};
