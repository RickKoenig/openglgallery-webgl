'use strict';

// running the simulation/game
var race_gameState_standalone = {}; // the 'race_gameState_standalone' state
race_gameState_standalone.hidden = true; // can't be selected in the engine UI

race_gameState_standalone.text = "WebGL: race_gameState_standalone 3D drawing";
race_gameState_standalone.title = "race_gameState_standalone";

fpswanted = 60;

race_gameState_standalone.gotoStandaloneConsole = function() {
    changestate("race_console_standalone", "from gameState standalone");
}

// load these before init
race_gameState_standalone.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
	preloadimg("../common/sptpics/take0016.jpg");
	preloadimg("track/4pl_tile01.jpg");
	preloadimg("track/grass.jpg");
	preloadimg("track/sanddbl.jpg");
	//preloadtime(3000); // show loading screen for minimum time
}

race_gameState_standalone.init = function(sockInfo) { // network state tranfered from race_sentgo
	logger("entering webgl race_gameState_standalone with game '" + sockInfo?.game + "'\n");
	race_gameState_standalone.count = 0; // counter for this state
	race_gameState_standalone.gameType = sockInfo?.game;

	// the 3D viewport
	mainvp = defaultviewport();
	mainvp.clearcolor = [.125, .125, .125, 1];

	// ui
	race_gameState_standalone.showHud = true;
	setbutsname('ingame');
	makeabut("standalone console", race_gameState_standalone.gotoStandaloneConsole);
	makeaprintarea("GAME '" + race_gameState_standalone.gameType + "'", "font-size: 2.1em;");
	makeabr();

	race_gameState_standalone.roottree = new Tree2("race_gameState_standalone root tree");

	// do network stuff
	const gameClassStr = "Game" + race_gameState_standalone.gameType.toUpperCase();
	console.log("game class string = " + gameClassStr);
	race_gameState_standalone.gameClass = window[gameClassStr];
	race_gameState_standalone.mySlot = 0;
	// show myself and other info from 'intent'

	// setup the gamewarp system with the game 'gameClass'
	race_gameState_standalone.mvc = new GameWarp_standalone(1 //room.slots.length
		, race_gameState_standalone.mySlot, race_gameState_standalone.gameClass
		, race_gameState_standalone.roottree
		, ["player 0"]
	);
	//race_gameState_standalone.mvc.modelToView(race_gameState_standalone.count);
	const termParams = {
		cols: 39,
		rows: 1,
		offx: 40,
		offy: 80,
		scale: 2
	};

	if (race_gameState_standalone.showHud) {
		termParams.offy = 120;
		race_gameState_standalone.terminalFPS = new Terminal(race_gameState_standalone.roottree, [.2, .2, .1, .25], null, termParams);
		race_gameState_standalone.terminalFPS.doShow(true);
	}

	// UI debprint menu
	debprint.addlist("ingame test variables",[
		"fpswanted",
		"Timers.fpsavg",
	]);
};

race_gameState_standalone.proc = function() {
	// proc
	// hide/show hud
	if (input.key == 'h'.charCodeAt()) {
		if (race_gameState_standalone.showHud) {
			race_gameState_standalone.terminalFPS?.doShow(!race_gameState_standalone.terminalFPS.getShow());
		}
	}
	// change frame rate
	if (input.key == ','.charCodeAt()) {
		--fpswanted;
		if (fpswanted < 1) fpswanted = 1;
	} else if (input.key == '.'.charCodeAt()) {
		++fpswanted;
		if (fpswanted > 120) fpswanted = 120;
	}

	// get some input
	let keyCode = race_gameState_standalone.gameClass.modelMakeKeyCode(race_gameState_standalone.mvc.game);
	// run model 1 time
	let myKeyCode = keyCode;
	race_gameState_standalone.mvc.controlToModel(race_gameState_standalone.count, race_gameState_standalone.mySlot, myKeyCode);
	if (race_gameState_standalone.mvc.game.stepGhostModel) {
		race_gameState_standalone.mvc.game.stepGhostModel(race_gameState_standalone.count);
	}
	++race_gameState_standalone.count;

	race_gameState_standalone.roottree.proc(); // do animations that don't effect players
	race_gameState_standalone.terminalFPS?.print("FPS: AVG = " + Timers.fpsavg.toFixed(4) 
		+ ", WANTED " + fpswanted);
	doflycam(mainvp); // modify the trs of mainvp using flycam
	// draw
	race_gameState_standalone.mvc.modelToView(race_gameState_standalone.count);
	race_gameState_standalone.mvc.draw();
	beginscene(mainvp);
	race_gameState_standalone.roottree.draw();
};

race_gameState_standalone.exit = function() {
	changestate("race_console_standalone", "from gameState_standalone, reload state");

	// show current usage before cleanup
	race_gameState_standalone.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_gameState_standalone.roottree.glfree();
	race_gameState_standalone.mvc.exit();
	
	// show usage after cleanup
	logrc();
	race_gameState_standalone.roottree = null;
	clearbuts('ingame');
	logger("exiting webgl race_gameState_standalone\n");
	mainvp.camattach = null;
	mainvp.incamattach = false;
	mainvp.lookat = null;
	mainvp.inlookat = false;
	debprint.removelist("ingame test variables");
};
