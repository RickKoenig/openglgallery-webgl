// nim game
var nim = {}; // the nim game state

nim.text = "Nim Game, a work in progress";
nim.title = "Nim";

// various states of the game
nim.states = {
	intro : 0,
	humanMove : 1,
	computerMove : 2,
	humanWins : 3,
	computerWins : 4,
	reset : 5,
	ruleChange : 6
};
nim.state = nim.states.intro;

// game rules
nim.threeMax = true;
nim.lastLoses = true;

// pile info
nim.piles = [3, 5, 7];
nim.pilesTree;
nim.currentPiles = [3, 5, 7];
nim.pileSpace = [.25, .25];
nim.pileOffset = [-.25, -.75];

// line turn info
nim.line = null; // draw a line for move

// overall score
nim.humanScore = 0;
nim.computerScore = 0;

// game status
nim.textInfo = null; // tree font

// test stuff
nim.maxlevel = 1240;
nim.counter = 0;

// piles
nim.createPiles = function() {
	// build 3d assets
	master = buildplanexy("aplane",.1,.1,"maptestnck.png","texDoubleSided");
	master.mod.flags |= modelflagenums.DOUBLESIDED|modelflagenums.NOZBUFFER;
	master.trans = [0,0,1];
	
	nim.pilesTree = [];
	
	for (var i = 0; i < nim.piles.length; ++i) {
		var column = [];
		var numCol = nim.piles[i];
		for (var j = 0; j < numCol; ++j) {
			var piece = master.newdup();
			piece.trans[0] = i * nim.pileSpace[0] + nim.pileOffset[0]; // x
			piece.trans[1] = j * nim.pileSpace[1] + nim.pileOffset[1]; // y
			nim.roottree.linkchild(piece);
			column.push(piece);
		}
		nim.pilesTree.push(column);
	}
	master.glfree();
};

nim.updatePiles = function() {
	for (var i = 0; i < nim.piles.length; ++i) {
		var column = [];
		var numCol = nim.piles[i];
		var numCurPieces = nim.currentPiles[i];
		for (var j = 0; j < numCol; ++j) {
			if (j >= numCurPieces) { // draw pieces left
				nim.pilesTree[i][j].flags |= treeflagenums.DONTDRAW;
			} else { // don't draw pieces removed
				nim.pilesTree[i][j].flags &= ~treeflagenums.DONTDRAW;
			}
		}
	}
};


// line for showing turn in progress
nim.createLine = function() {
	// line 3d assets
	nim.line = buildplanexy("line",1,1,"maptestnck.png","texDoubleSided");
	nim.line.mod.flags |= modelflagenums.DOUBLESIDED|modelflagenums.NOZBUFFER;
	nim.line.trans = [0,0,1];
	nim.line.scale = [.025,.1,.1];
	nim.roottree.linkchild(nim.line);
};

nim.updateLine = function() {
	nim.line.trans = [input.fmx, input.fmy, 1];
};


// info about status of game
nim.createTextInfo = function () {
	// label fancy scene
	var ftree = new Tree2("nim game info");
	var scratchfontmodel = new ModelFont("font for nim","font3.png","tex",
		1,1,
		64,8,
		true);
	scratchfontmodel.flags |= modelflagenums.DOUBLESIDED|modelflagenums.NOZBUFFER;
	var str = "Info";
	scratchfontmodel.print(str);
	ftree.setmodel(scratchfontmodel);
	var scaledown = .1;
	var signOffset = 2.4; // 1.25 is golden!
	ftree.trans = [-1*scaledown*str.length,signOffset,-signOffset];
	ftree.scale = [.2,.2,.2];
	return ftree;
};

// update instructions for the game
nim.updateTextInfo = function(text) {
};

// test stuff
nim.lesslevel = function() {
	if (nim.curlevel > 0)
		--nim.curlevel;
	nim.updatelevel();
};

nim.morelevel = function() {
	if (nim.curlevel < nim.maxlevel)
		++nim.curlevel;
	nim.updatelevel();
};

nim.updatelevel = function() {
	printareadraw(nim.levelarea,"Level : " + nim.curlevel + "\nhi\nho");
};


// here we go, boot up the state
// load these before init
nim.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

nim.init = function() {
	// new text for instructions
	nim.text = "hiho";
	updateInstructions();
	nim.count = 0;
	nim.curlevel = 1234;
	logger("entering webgl nim\n");

	nim.maxlevel = 1240;
	nim.humanScore = 0;
	nim.computerScore = 0;
	nim.state = nim.states.intro;
	nim.piles = [3,5,7];
	nim.currentPiles = nim.piles.slice();

	nim.counter = 0;
	nim.threeMax = true;
	nim.lastLoses = true;

	// ui
	setbutsname('nim');
	nim.levelarea = makeaprintarea('level: ');
	
	nim.bl = makeabut("lower level",nim.lesslevel);
	nim.bh = makeabut("higher level",nim.morelevel);
	nim.bh.disabled = true;
	nim.updatelevel();
	
	// build parent
	nim.roottree = new Tree2("nim root tree");

	// build 3d assets
	nim.createPiles();
	nim.createLine();
	
	// viewport
	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
	
	// test
	//nim.currentPiles = [2,4,3];
};

nim.proc = function() {
	// proc nim game
	++nim.count;
	// do something after 4 seconds, test
	if (nim.count == 4*fpswanted) {
		nim.bl.disabled = !nim.bl.disabled;
		nim.bh.disabled = !nim.bh.disabled;
		nim.count = 0;
		/*
		nim.currentPiles[1]--;
		if (nim.currentPiles[1] < 0) {
			nim.currentPiles[1] += nim.piles[1] + 1;
		}
		*/
	}
	
	// proc line
	nim.updateLine();
	
	// proc graphics
	nim.updatePiles();
	
	// general proc
	nim.roottree.proc(); // probably does nothing, run animations if available, and user procs too
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	nim.roottree.draw();
};

nim.exit = function() {
	// show current usage before cleanup
	nim.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	nim.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	nim.roottree = null;
	clearbuts('nim');
	logger("exiting webgl nim\n");
};
