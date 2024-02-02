// very minimalist 3D state
var race_login = {}; // the 'race_login' state
race_login.hidden = true; // can't be selected in the engine UI

race_login.text = "WebGL: race_login 3D drawing";
race_login.title = "race_login";

// load these before init
race_login.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

race_login.gotoLobby = function() {
    changestate("race_lobby");
}

race_login.gotoFill = function() {
    changestate("race_sentgo");
}

race_login.init = function(intentData) {
	race_login.count = 0;
	logger("entering webgl race_login 3D\n");

	// ui
	setbutsname('login');
	race_login.lobbyButton = makeabut("lobby", race_login.gotoLobby);
	race_login.fillButton = makeabut("fill", race_login.gotoFill);
	race_login.showIntent = makeaprintarea("intent = '" + intentData + "'");
	
	// build parent
	race_login.roottree = new Tree2("race_login root tree");

	// build a planexy (a square)
	// make double sided and test gl_FrontFace
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","diffusespecp");
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","tex");
	var plane = buildplanexy("aplane",1,1,"maptestnck.png","texDoubleSided");
	plane.mod.flags |= modelflagenums.DOUBLESIDED;

	plane.trans = [0,0,1];
	race_login.roottree.linkchild(plane);

	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
};

race_login.proc = function() {
	// proc
	++race_login.count;
	// do something after 4 seconds
	if (race_login.count == 4*fpswanted) {
		//changestate("solarTest");
		//window.history.back();
		//window.location.href = "../../index.html";
		//window.location.href = "http://janko.at";
	}
	race_login.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	race_login.roottree.draw();
};

race_login.exit = function() {
	// show current usage before cleanup
	race_login.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_login.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	race_login.roottree = null;
	clearbuts('login');
	logger("exiting webgl race_login 3D\n");
};
