// nim game
var nim = {}; // the nim game state

nim.text = "Nim Game, a work in progress";
nim.title = "Nim";

nim.states = {
	intro : 0,
	humanMove : 1,
	computerMove : 2,
	humanWins : 3,
	computerWins : 4,
	reset : 5,
	ruleChange : 6
};

nim.piles = [3,5,7];
nim.pilesTree;
nim.currentPiles = [3,5,7];

nim.maxlevel = 1240;
nim.humanScore = 0;
nim.computerScore = 0;
nim.state = nim.states.intro;

nim.counter = 0;
nim.threeMax = true;
nim.lastLoses = true;

nim.master = null; // master piece
nim.line = null; // draw a line for move

// load these before init
nim.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

nim.createPiles = function() {
	// build 3d assets
	nim.master = buildplanexy("aplane",.1,.1,"maptestnck.png","texDoubleSided");
	nim.master.mod.flags |= modelflagenums.DOUBLESIDED;
	nim.master.trans = [0,0,1];
	
	nim.pilesTree = [];
	
	for (var i = 0; i < nim.piles.length; ++i) {
		var column = [];
		var numCol = nim.piles[i];
		for (var j = 0; j < numCol; ++j) {
			var piece = nim.master.newdup();
			piece.trans[0] = i * .25 - .25;
			piece.trans[1] = j * .25 - .75;
			nim.roottree.linkchild(piece);
			column.push(piece);
		}
		nim.pilesTree.push(column);
	}
};

nim.drawPiles = function() {
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

nim.cleanPiles = function() {
	nim.master.glfree();
};

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
	// line 3d assets
	nim.line = buildplanexy("line",1,1,"maptestnck.png","texDoubleSided");
	nim.line.mod.flags |= modelflagenums.DOUBLESIDED;
	nim.line.trans = [.5,.5,1];
	nim.line.scale = [.1,.1,.1];
	nim.roottree.linkchild(nim.line);
	// piles 3d assets
	nim.createPiles();
	
	// viewport
	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
	
	// test
	nim.currentPiles = [2,4,6];
};

nim.proc = function() {
	// proc nim game
	++nim.count;
	// do something after 4 seconds, test
	if (nim.count == 4*fpswanted) {
		nim.bl.disabled = !nim.bl.disabled;
		nim.bh.disabled = !nim.bh.disabled;
		nim.count = 0;
		nim.currentPiles[1]--;
		if (nim.currentPiles[1] < 0)
			nim.currentPiles[1] += nim.piles[1] + 1;
	}
	
	// proc line
	nim.line.trans = [input.fmx, input.fmy, 1];
	
	// proc graphics
	nim.drawPiles();
	nim.roottree.proc(); // probably does nothing
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
	nim.cleanPiles();
	
	// show usage after cleanup
	logrc();
	nim.roottree = null;
	clearbuts('nim');
	logger("exiting webgl nim\n");
};
