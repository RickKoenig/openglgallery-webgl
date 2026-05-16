'use strict';

// terminal
var race_console_standalone = {}; // the 'race_console_standalone' state
race_console_standalone.text = "WebGL: race_console_standalone 3D drawing";
race_console_standalone.title = "race_console_standalone";

// load these before init
race_console_standalone.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

race_console_standalone.autoCommand1P = function(g) {
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

race_console_standalone.init = function(intentData) {
	logger("entering webgl race_console_standalone\n");
	// ui
	setbutsname('console');
	makeabut("start game(a), move and push", race_console_standalone.autoCommand1P.bind(this,'a'));
	makeabr();
	makeabut("start game(b), 2d race", race_console_standalone.autoCommand1P.bind(this,'b'));
	makeabr();
	makeabut("start game(c), move and push V2 fixed", race_console_standalone.autoCommand1P.bind(this,'c'));
	
	// build parent
	race_console_standalone.roottree = new Tree2("race_console_standalone root tree");

	// build simple terminal
	const termParams1 = {
		cols: 60,
		rows: 22.5,
		offx: 8,
		offy: 8,
		scale: 2
	};
	race_console_standalone.terminal = new Terminal(race_console_standalone.roottree, [.1, 0, 0, 1], race_console_standalone.doCommand, termParams1);
	race_console_standalone.terminal.print("Welcome, select a game from the left panel.");

	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
};

race_console_standalone.onresize = function() {
	console.log("onresize");
	race_console_standalone.terminal.onresize();
}

race_console_standalone.proc = function() {
	// draw
	beginscene(mainvp);
	race_console_standalone.roottree.draw();
};

race_console_standalone.exit = function() {
	race_console_standalone.terminal = null;

	// show current usage before cleanup
	race_console_standalone.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_console_standalone.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	race_console_standalone.roottree = null;
	clearbuts('console');
	logger("exiting webgl race_console_standalone\n");
};
