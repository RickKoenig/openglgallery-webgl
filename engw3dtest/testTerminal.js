'use strict';

// terminal
var testTerminal = {}; // the 'testTerminal' state
testTerminal.text = "WebGL: testTerminal 3D drawing";
testTerminal.title = "testTerminal";

// load these before init
testTerminal.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/fontsmall.png");
};

/*
COMMANDS
add
echo
help
*/

testTerminal.doCommand = function(cmdStr) {
	console.log("got a command from terminal '" + cmdStr + "'");
	const words = cmdStr.trim().split(/\s+/);
	if (!words[0]) return;
	const first = words.shift();
	switch(first) {
		default:
			// local, not a valid command
			this.print("unrecognized command '" + cmdStr + "'");
		case "help":
			// local
			this.print("commands are:\nhelp echo add");
			break;
		case "echo":
			// local with delay
			setTimeout(function() {
				testTerminal.terminal.print(words.join(' '));
			}, 2000);
			break;
		case "add":
			// local
			let sum = 0;
			for (let ele of words) {
				sum += parseFloat(ele);
			}
			this.print("sum = " + sum);
			break;
	}
}

testTerminal.init = function(intentData) {
	testTerminal.count = 0;
	logger("entering webgl testTerminal\n");
	// ui
	setbutsname('testTerminal');
	
	// build parent
	testTerminal.roottree = new Tree2("testTerminal root tree");

	// terminal
	const termParams1 = {
		cols: 8,
		rows: 4,
		offx: -.75,
		offy: .25,
		scale: 1 / 16,
		wrap: true
	};
	testTerminal.terminal = new Terminal2(testTerminal.roottree, [.1, .5, 0, 1], testTerminal.doCommand, termParams1);
	testTerminal.terminal.setPrompt('$');
	testTerminal.terminal.print("Welcome");
		
	// background
	const backgnd = buildplanexy("backgnd", 1, 1, "maptestnck.png", "texc", 1, 1, 4, 4);
	backgnd.mod.mat.color = [1, 1, 1, .25];
	backgnd.mod.flags |= modelflagenums.HASALPHA | modelflagenums.NOZBUFFER;
	backgnd.trans = [0, 0, 1];
	testTerminal.roottree.linkchild(backgnd);

	// cursor
	testTerminal.sphere = buildsphere("asphere", 1 / 16, "maptestnck.png", "texc");
	testTerminal.sphere.mod.mat.color = [.5, .5, 0, 1];
	testTerminal.sphere.trans = [0, 0, 1];
	testTerminal.roottree.linkchild(testTerminal.sphere);

	// font
	testTerminal.afonttree = new Tree2("afont");
	const testTerminalmodel = new ModelFont("reffont", "fontsmall.png", "tex"
		, .0625, .0625
		, 40, 20
		, true);
    testTerminalmodel.flags |= modelflagenums.NOZBUFFER; // always in front when drawn
	testTerminalmodel.print("Mouse Over");
	testTerminal.afonttree.setmodel(testTerminalmodel);
	testTerminal.afonttree.trans = [-.75, .75, 1];
	testTerminal.roottree.linkchild(testTerminal.afonttree);

	// setup viewport stuff
	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
	// use ndc extra system
	mainvp.extraWidth = 4 / 3;
	mainvp.extraHeight = 1;
	// use ndc extra system
	glc.extraWidth = mainvp.extraWidth;
	glc.extraHeight = mainvp.extraHeight;
	input.extraWidth = mainvp.extraWidth;
	input.extraHeight = mainvp.extraHeight;
};

testTerminal.onresize = function() {
	console.log("onresize");
	testTerminal.terminal.onresize();
}

testTerminal.proc = function() {
	// proc
	testTerminal.terminal?.proc(input.key);
	// use sphere as a cursor
	testTerminal.sphere.trans = [input.fmx, input.fmy, 1];
	testTerminal.roottree.proc(); // probably does nothing
	++testTerminal.count;
	// draw
	doflycam(mainvp); // modify the trs of mainvp using flycam
	beginscene(mainvp);
	testTerminal.roottree.draw();
};

testTerminal.exit = function() {
	// reset extra ndc system, output
	glc.extraHeight = 1;
	glc.extraWidth = 1;
	mainvp.extraWidth = 1;
	mainvp.extraHeight = 1;
	// reset extra ndc system, input
	input.extraWidth = 1;
	input.extraHeight = 1;
	testTerminal.terminal = null;
	clearTimeout(testTerminal.timeout);
	// show current usage before cleanup
	testTerminal.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	testTerminal.roottree.glfree();
	// show usage after cleanup
	logrc();
	testTerminal.roottree = null;
	clearbuts('testTerminal');
	logger("exiting webgl testTerminal\n");
};
