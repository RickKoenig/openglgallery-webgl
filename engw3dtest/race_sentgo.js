// very minimalist 3D state
var race_sentgo = {}; // the 'race_sentgo' state
//race_sentgo.hidden = true; // can't be selected in the engine UI

race_sentgo.text = "WebGL: race_sentgo 3D drawing";
race_sentgo.title = "race_sentgo";

// load these before init
race_sentgo.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

race_sentgo.gotoConsole = function() {
    changestate("race_console", "from SENTGO");
}

race_sentgo.gotoLogin = function() {
    changestate("race_login", "from SENTGO");
}

race_sentgo.init = function(sockInfo) {
	if (sockInfo) {
		race_sentgo.socker = sockInfo.sock;
		race_sentgo.socker.off('disconnect'); // don't fire off race_console disconnect
		race_sentgo.sockerInfo = sockInfo.info;
	}
	race_sentgo.count = 0;
	logger("entering webgl race_sentgo 3D\n");

	// ui
	setbutsname('sentgo');
	race_lobby.fillButton = makeabut("console", race_sentgo.gotoConsole);
	race_lobby.fillButton = makeabut("login", race_sentgo.gotoLogin);

    // build parent
	race_sentgo.roottree = new Tree2("race_sentgo root tree");

	// build a planexy (a square)
	// make double sided and test gl_FrontFace (TODO: check spelling)
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","diffusespecp");
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","tex");
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","texDoubleSided");
	//plane.mod.flags |= modelflagenums.DOUBLESIDED;

	const cols = 120;
	const rows = 45;
	const depth = glc.clientHeight / 2;
	const offx = -glc.clientWidth / 2 + 16;
	const offy = glc.clientHeight / 2 - 16;
	const glyphx = 8;
	const glyphy = 16;

	const backgnd = buildplanexy01("aplane2", glyphx * cols, glyphy * rows, null, "flat", 1, 1);
	backgnd.mod.flags |= modelflagenums.NOZBUFFER;
	backgnd.mod.mat.color = [.1, 0, 0, 1];
	backgnd.trans = [offx, offy, depth];
	race_sentgo.roottree.linkchild(backgnd);

	//plane.trans = [0,0,1];
	//race_sentgo.roottree.linkchild(plane);
	race_sentgo.term = new ModelFont("term", "font0.png", "texc", glyphx, glyphy, cols, rows, false);
	race_sentgo.term.flags |= modelflagenums.NOZBUFFER;
	const treef1 = new Tree2("term");
	treef1.setmodel(race_sentgo.term);
	treef1.trans = [offx, offy, depth];
	//term.mat.color = [1,0,0,1];
	race_sentgo.roottree.linkchild(treef1);

	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
};

race_sentgo.proc = function() {
	// proc
	++race_sentgo.count;
	// do something after 4 seconds
	if (race_sentgo.count == 4*fpswanted) {
		//changestate("solarTest");
		//window.history.back();
		//window.location.href = "../../index.html";
		//window.location.href = "http://janko.at";
	}
	race_sentgo.roottree.proc(); // probably does nothing
	race_sentgo.term.print("SENTGO\n\n"
		+ JSON.stringify(race_sentgo.sockerInfo, null, '   ') 
		+ "\ncount = " + race_sentgo.count);
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	race_sentgo.roottree.draw();
};

race_sentgo.exit = function() {
	if (race_sentgo.socker) {
		race_sentgo.socker.disconnect();
		race_sentgo.socker = null;
	}
	// show current usage before cleanup
	race_sentgo.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_sentgo.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	race_sentgo.roottree = null;
	clearbuts('sentgo');
	logger("exiting webgl race_sentgo 3D\n");
};
