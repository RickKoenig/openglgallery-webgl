'use strict';

// terminal
var race_lobby_standalone = {}; // the 'race_lobby_standalone' state
race_lobby_standalone.text = "WebGL: race_lobby_standalone 3D drawing";
race_lobby_standalone.title = "race_lobby_standalone";

race_lobby_standalone.lastGame = 'd';

// load these before init
race_lobby_standalone.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

race_lobby_standalone.autoCommand1P = function(g) {
	// standalone, start game
	const gameInfo = {
		game: g,
		info: {
			id: 0,
			name: "player 0"
		}
	}
	changestate(race_gameState_standalone, gameInfo);
}

race_lobby_standalone.init = function(intentData) {
	logger("entering webgl race_lobby_standalone\n");
	// ui
	setbutsname('console');
	makeabut("start game(a), move and push", race_lobby_standalone.autoCommand1P.bind(this,'a'));
	makeabr();
	makeabut("start game(b), 2d race", race_lobby_standalone.autoCommand1P.bind(this,'b'));
	makeabr();
	makeabut("start game(c), move and push V2 fixed", race_lobby_standalone.autoCommand1P.bind(this,'c'));
	makeabr();
	makeabut("start game(d), move and push MOBILE", race_lobby_standalone.autoCommand1P.bind(this,'d'));
	
	// build parent
	race_lobby_standalone.roottree = new Tree2("race_lobby_standalone root tree");

	// build simple terminal
	const termParams1 = {
		cols: 60,
		rows: 22.5,
		offx: 8,
		offy: 8,
		scale: 2
	};
	race_lobby_standalone.terminal = new Terminal(race_lobby_standalone.roottree, [.1, 0, 0, 1], race_lobby_standalone.doCommand, termParams1);
	if (window.isMobile) {
		race_lobby_standalone.terminal.print("Welcome, select a game letter 'a' thru '" 
			+ race_lobby_standalone.lastGame + "' when in focus.");
	} else {
		race_lobby_standalone.terminal.print("Welcome, select a game from the left panel.");
	}

	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
};

race_lobby_standalone.onresize = function() {
	console.log("onresize");
	race_lobby_standalone.terminal.onresize();
}

race_lobby_standalone.proc = function() {
	if (input.key >= 'a'.charCodeAt(0) && input.key <= race_lobby_standalone.lastGame.charCodeAt(0)) {
		race_lobby_standalone.autoCommand1P.call(this, String.fromCharCode(input.key));
	}
	// draw
	beginscene(mainvp);
	race_lobby_standalone.roottree.draw();
};

race_lobby_standalone.exit = function() {
	race_lobby_standalone.terminal = null;

	// show current usage before cleanup
	race_lobby_standalone.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_lobby_standalone.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	race_lobby_standalone.roottree = null;
	clearbuts('console');
	logger("exiting webgl race_lobby_standalone\n");
};
