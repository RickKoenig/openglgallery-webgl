// nim game
var nim = {}; // the nim game state

// NIM DATA

// state info
nim.text = "Nim Game";
nim.title = "Nim";

// FSM
nim.fsmStates = {
	humanMove : 0,
	compMove : 1,
	humanWins : 2,
	compWins : 3,
	compMoveFirst: 4 // let computer say I'll move first for a small amount of time
};

nim.fsmStateTable = [
	// human move
	{
		startCount: 0,
		endFunc: function() {
			var done = nim.playTurn();
			if (done) {
				if (nim.lastLoses) {
					return nim.fsmStates.compWins;
				} else {
					return nim.fsmStates.humanWins;
				}
			} else {
				return nim.fsmStates.compMove;
			}
		},
		endCondMove: true
	},
	// comp move
	{
		startCount: 90,
		startFunc: function() {
			nim.turn = nim.calcCompTurn();
		},
		endFunc: function() {
			var done = nim.playTurn();
			if (done) {
				if (nim.lastLoses) {
					return nim.fsmStates.humanWins;
				} else {
					return nim.fsmStates.compWins;
				}
			} else {
				return nim.fsmStates.humanMove;
			}
		},
		endCondTime: true
	},
	// human wins
	{
		startCount: 135,
		startFunc: function() {
			++nim.humanScore;
		},
		endFunc: function() {
			nim.startMoveHuman = !nim.startMoveHuman;
			nim.resetLevel();
			if (nim.startMoveHuman) {
				return nim.fsmStates.humanMove;
			} else {
				return nim.fsmStates.compMoveFirst;
			}
		},
		endCondTime: true
	},
	// comp wins
	{
		startCount: 135,
		startFunc: function() {
			++nim.compScore;
		},
		endFunc: function() {
			nim.startMoveHuman = !nim.startMoveHuman;
			nim.resetLevel();
			if (nim.startMoveHuman) {
				return nim.fsmStates.humanMove;
			} else {
				return nim.fsmStates.compMoveFirst;
			}
		},
		endCondTime: true
	},
	//compMoveFirst  let computer say that it's going first at beginning of game
	{
		startCount: 67,
		endFunc: function() {
			return nim.fsmStates.compMove;
		},
		endCondTime: true
	}
];
nim.fsmState = nim.fsmStates.humanMove;
nim.fsmCounter = 0;
nim.fsmHumanTurnReady = false;

// game rules
nim.threeMax = false;
nim.lastLoses = false;
nim.rulesButton = null;

//intermediate

// overall score
nim.humanScore = 0;
nim.compScore = 0;

// line turn info
nim.startMoveHuman = true;
nim.turn = [0, 0];
nim.turnLine = null; // tree draw a line for move

// pile info
nim.startPiles = null; // pile data, initial pile start
nim.curPiles = null; // current piles
nim.pilesTree = null; // tree draw 2d array
nim.curPileSet = 0;

// all the different pile configurations
nim.pileSet = [
	[9],
	[7, 7],
	[3, 5, 7],
	[3, 5, 7, 9],
];

nim.pileDesc = [
	"EASY",
	"MEDIUM",
	"STANDARD",
	"ADVANCED"
];

// drawing piles metrics
nim.maxPile = 0; // maximum number of piles
nim.pileOffset = null;
nim.pileSpace = null;
nim.pileSize = null;

nim.globalspecpow;

// game status
nim.textInfo = null; // tree font

// NIM FUNCTIONS

// game rules
nim.getMaxMove = function() {
	return nim.threeMax ? 3 : nim.maxPile;
};


// line for showing turn in progress
nim.createTurnLine = function() {
	// turn line 3d assets
	nim.turnLine = buildplanexy("line for turn",1,1,"Bark.png","texc");
	nim.turnLine.mod.flags |= modelflagenums.DOUBLESIDED|modelflagenums.NOZBUFFER;
	nim.turnLine.mod.mat.color = [1,0,0,1];
	nim.roottree.linkchild(nim.turnLine);
};

nim.updateTurnLine = function() {
	if (nim.fsmState == nim.fsmStates.humanMove) { // human
		nim.mouseToTurn();
	}
	nim.turnToDraw();
	if (input.mclick[0] && nim.turn[1] > 0) {
		nim.fsmHumanTurnReady = true;
	}
};

// update nim.turn
// from input.fmx and input.fmy
nim.mouseToTurn = function() {
	var mx = input.fmx;
	var my = input.fmy;
	var len = nim.startPiles.length;
	var tpX = mx / nim.pileSpace[0] + nim.startPiles.length / 2;
	var turnPileX = Math.floor(tpX);
	var turnSubPile = (tpX - turnPileX) * nim.pileSpace[0];
	var overPileX = turnPileX >= 0 && turnPileX < nim.startPiles.length
				&& turnSubPile >= (nim.pileSpace[0] - nim.pileSize[0]) / 2
				&& turnSubPile < (nim.pileSpace[0] + nim.pileSize[0]) / 2;
	if (!overPileX) {
		nim.turn = [0, 0];
		return;
	}

	var turnPileY = Math.floor(-nim.maxPile / 2 + nim.curPiles[turnPileX] - my / nim.pileSpace[1] + .5);
	turnPileY = range(0, turnPileY, nim.curPiles[turnPileX]);
	turnPileY = range(0, turnPileY, nim.getMaxMove());
	nim.turn = [turnPileX, turnPileY];
};

nim.countPieces = function(arr) {
	var cnt = 0;
	for (var i = 0; i < nim.startPiles.length; ++i) {
		cnt += arr[i];
	}
	return cnt;
};

// also append a 1 if losing, 0 if winning to return array
nim.calcMove = function() {
	// assume rightmost pile is the largest
	//reason = "std";
	//reasonArr = new Array(nim.startPiles.length).fill("pile");
	nim.mod = (nim.threeMax ? 3 : nim.startPiles[nim.startPiles.length - 1]) + 1;
	var xor = 0;
	for (var np of nim.curPiles) {
		xor ^= (np % nim.mod);
	}
	var ret = new Array(nim.startPiles.length).fill(0);
	// test
	//xor = 0;
	if (xor || nim.lastLoses) {
		for (var i = 0; i < nim.startPiles.length; ++i) {
			var goodPile = xor ^ (nim.curPiles[i] % nim.mod);
			var amount = nim.curPiles[i] - goodPile;
			if (amount > 0) {
				amount %= nim.mod;
			} else {
				amount = 0;
			}
			var newPile = nim.doMove(nim.curPiles, i, amount);
			if (nim.lastLoses) {
				var ones = nim.isOnes(newPile, i);
				if (ones >= 0) {
					//reason = "spc1";
					var goodPile = 1 - ones; // try to get an odd number of ones
					var amount = nim.curPiles[i] - goodPile;
					if (amount > 0) {
						amount %= nim.mod;
					} else {
						//reason = "spc2";
						amount = 0;
					}
				} 
			}
			ret[i] = amount;
		}
	} else {
		ret.fill(0);
	}
	// convert losing position to take 1 from any nonzero pile
	var cp = nim.countPieces(ret);
	if (!cp) {
		for (var i = 0; i < nim.startPiles.length; ++i) {
			ret[i] = nim.curPiles[i] > 0 ? 1 : 0;
		}
		ret.push(1);
	} else {
		ret.push(0);
	}
	return ret;
};

// return 2d array that has the pile and the amount
nim.calcCompTurn = function() {
	var moves = nim.calcMove();
	var validTurn = [];
	var possibleMoves = [];
	for (var i = 0; i < nim.curPiles.length; ++i) {
		if (moves[i] > 0) {
			validTurn.push(i);
			var newPile = nim.doMove(nim.curPiles, i, moves[i]);
			possibleMoves.push(newPile);
		}
		
	}
	if (!validTurn.length) {
		return [0, 0]; // can't make a turn!
	}
	var outcomes = null;
	// do outcomes and print them
	var outcomes = JSON.stringify(possibleMoves);
	console.log("calcCompturn start = " + nim.curPiles + " moves = " + moves 
				+ " outcomes = " + outcomes + " " + (moves[nim.curPiles.length] ? "Losing" : "Winning"));
	var pile = validTurn[getRandomInt(validTurn.length)];
	return [pile, moves[pile]];
};

// update nim.turnLine.trans and nim.turnLine.scale and nim.turnLine.flags treeflagenums.DONTDRAW
// from nim.turn
nim.turnToDraw = function() {
if (!nim.turn[1] || (nim.fsmState != nim.fsmStates.humanMove && nim.fsmState != nim.fsmStates.compMove)) {
		// not a valid turn, don't draw
		nim.turnLine.flags |= treeflagenums.DONTDRAW;	
		return;
	}
	// do draw
	nim.turnLine.flags &= ~treeflagenums.DONTDRAW;
	var xTrans = nim.turn[0] * nim.pileSpace[0] - (nim.startPiles.length - 1) * nim.pileSpace[0] / 2;
	var xScale = .025;
	
	var yStart = nim.curPiles[nim.turn[0]] * nim.pileSpace[1] - nim.maxPile * nim.pileSpace[1] / 2;
	var yEnd = yStart - nim.pileSpace[1] * nim.turn[1];
	var yTrans = (yStart + yEnd) / 2;
	var yScale = (yStart - yEnd) / 2;
	
	nim.turnLine.trans = [xTrans, yTrans, 1];
	nim.turnLine.scale = [xScale, yScale, 1];
};

nim.playTurn = function() {
	nim.curPiles = nim.doMove(nim.curPiles, nim.turn[0], nim.turn[1]);
	// return true if all zeros
	for (var i = 0; i < nim.curPiles.length; ++i) {
		if (nim.curPiles[i]) {
			return false;
		}
	}
	return true;
};

// see if piles have just 0's and 1's
// return -1 if not, 0 if even, 1 if odd
// ignore a pile if ignore >= 0 else count all piles
nim.isOnes = function(piles, ignore) {
	// you lose if odd number of all piles of 1 and rest 0
	var ones = 0;
	for (var i = 0; i < piles.length; ++i) {
		if (i == ignore)
			continue;
		var npm = piles[i] % nim.mod;
		if (npm > 1) {
			return -1;
		} else if (npm == 1) {
			++ones;
		}
	}
	return ones & 1;
};

nim.doMove = function(arr, pile, amount) {
	var ret = arr.slice();
	ret[pile] -= amount;
	return ret;
};

// piles
nim.createPiles = function() {
	nim.pileSpace = [.3, .2];
	nim.pileSize = [.175, .175];
	nim.pileDescStr= nim.pileDesc[nim.curPileSet];
	nim.startPiles = nim.pileSet[nim.curPileSet];
	++nim.curPileSet;
	if (nim.curPileSet == nim.pileSet.length) {
		nim.curPileSet = 0;
	}
	
	nim.maxPile = nim.startPiles[nim.startPiles.length -1]; // assume right most pile is the largest
	nim.pileOffset = [(nim.startPiles.length - 1) * -nim.pileSpace[0] / 2,
						(nim.maxPile - 1) * -nim.pileSpace[1] /2];
	nim.curPiles = nim.startPiles.slice(); // start with the preset piles

	// build 3d assets
	/*
	var master = buildplanexy("a nim piece", nim.pileSize[0] / 2, nim.pileSize[1] / 2, "maptestnck.png", "texDoubleSided");
	master.mod.flags |= modelflagenums.DOUBLESIDED|modelflagenums.NOZBUFFER;
	master.trans = [0,0,1];
	*/
		// bob 
	//var pendpce2 = buildcylinderxz("pend1pce2",.4,.2,"panel.jpg","diffusespecp");
	var master = buildsphere3("pend1pce2",[nim.pileSize[0] / 2,nim.pileSize[0] / 2 / 3,nim.pileSize[0] / 2]
	,"panel.jpg","diffusespecp");
	master.mod.mat.specpow = .0001;
	master.trans = [0,0,1];
	//pendpce2.trans = [0,4,-.1];
	master.rot = [Math.PI/2,0,0];
	//pendpce0.rotvel = [.1,.5,0];
	//pendpce0.flags |= treeflagenums.ALWAYSFACING;
	nim.roottree.linkchild(master);
	
	// free up some resources when changing piles
	if (nim.pilesTree) {
		for (var column of nim.pilesTree) {
			for (var piece of column) {
				piece.glfree();
			}
		}
	}
	
	// start over with tree resources
	nim.pilesTree = [];
	for (var i = 0; i < nim.startPiles.length; ++i) {
		var column = [];
		var numCol = nim.startPiles[i];
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
	
	// put turnLine back in front of draw order
	if (nim.turnLine) {
		nim.turnLine.unlinkchild();
		nim.turnLine.glfree();
		nim.createTurnLine();
	}
};

nim.updatePiles = function() {
	for (var i = 0; i < nim.startPiles.length; ++i) {
		var column = [];
		var numCol = nim.startPiles[i];
		var numCurPieces = nim.curPiles[i];
		for (var j = 0; j < numCol; ++j) {
			if (j >= numCurPieces) { // draw pieces left
				nim.pilesTree[i][j].flags |= treeflagenums.DONTDRAW;
			} else { // don't draw pieces removed
				nim.pilesTree[i][j].flags &= ~treeflagenums.DONTDRAW;
			}
		}
	}
};


// text status of the game
// create
nim.createTextInfo = function () {
	nim.textInfo = new Tree2("nim game info");
	var fontSize = 1.5;
	var scratchfontmodel = new ModelFont("font for nim","font0.png","tex",
		fontSize, fontSize,
		80, 20,
		true);
	scratchfontmodel.flags |= modelflagenums.DOUBLESIDED|modelflagenums.NOZBUFFER;
	nim.textInfo.setmodel(scratchfontmodel);
	nim.roottree.linkchild(nim.textInfo);
};

// update
nim.updateTextInfo = function() {
	// make a few sentences describing the current state of the game
	var scoreInfo = "Score:\nYou " + nim.humanScore + " ,Me " + nim.compScore + "\n\n";

	var stateInfo = 0;
	var rulesInfo = "These are the rules:\n";
	if (nim.threeMax) {
		rulesInfo += "Take 1, 2 or 3 pieces\n from any one pile\n";
	} else {
		rulesInfo += "Take as many pieces as you want\n from any one pile\n";
	}
	if (nim.lastLoses) {
		rulesInfo += "Who ever takes the last piece LOSES!\n\n";
	} else {
		rulesInfo += "Who ever takes the last piece WINS!\n\n";
	}
	var who1 = "#";
	var who2 = "$";
	var who3 = "?";
	switch(nim.fsmState) {
	case nim.fsmStates.humanMove:
		who1 = "You'll";
		who2 = "Your";
		who3 = "You";
		break;
	case nim.fsmStates.compMove:
		who1 = "I'll";
		who2 = "My";
		who3 = "I";
		break;
	}
	var turnInfo;
	if (nim.fsmState == nim.fsmStates.humanWins) {
		turnInfo = "You Win!!!";
	} else if (nim.fsmState == nim.fsmStates.compWins) {
		turnInfo = "You Lose!!!";
	} else if (nim.fsmState == nim.fsmStates.compMoveFirst) {
		turnInfo = "I'll go first";
	} else {
		if (nim.turn[1] > 0) {
			turnInfo = who1 + " take " + nim.turn[1] + " from pile " + (nim.turn[0] + 1);
		} else {
			if (nim.firstMove) {
				turnInfo = who3 + " go first";
			} else {
				turnInfo = who2 + " turn";
			}
		}
	}
	//var testInfo = "\n\nFSM state = " + nim.fsmState 
	//	+ ", FSM counter = " + nim.fsmCounter;
	//	//+ ",fmx = " + input.fmx.toFixed(3);
	var pileInfo = "\n\n\nPiles: " + JSON.stringify(nim.curPiles);
	var info = rulesInfo + scoreInfo + turnInfo + pileInfo;
	nim.textInfo.mod.print(info);
	printareadraw(nim.levelDest, "Level = " + nim.pileDescStr + " piles");
};

nim.resetLevel = function() {
	nim.curPiles = nim.startPiles.slice();
};

nim.changeRules = function() {
	nim.lastLoses = !nim.lastLoses;
	if (nim.lastLoses)
		nim.threeMax = !nim.threeMax;
	nim.updateTextInfo();
};

nim.procFSM = function() {
	// init FSM when fsmState < 0
	if (nim.fsmState < 0) {
		if (nim.startMoveHuman) {
			nim.fsmState = nim.fsmStates.humanMove;
		} else {
			nim.fsmState = nim.fsmStates.compMoveFirst;
		}
		nim.fsmCounter = nim.fsmStateTable[nim.fsmState].startCount;
		nim.fsmHumanTurnReady = false;
	}
	// proc
	var curState = nim.fsmStateTable[nim.fsmState];
	--nim.fsmCounter;
	// change on time
	var newState = false;
	// end conditions
	if (nim.fsmCounter < 0) {
		nim.fsmCounter = 0;
		// change on time
		if (curState.endCondTime) {
			newState = true;
		}
	}
	// change on move
	if (curState.endCondMove && nim.fsmHumanTurnReady) {
		newState = true;
	}
	// change state
	if (newState) {
		if (curState.endFunc) {
			var ret = curState.endFunc();
			if (ret === undefined)
				console.log("undefined");
			nim.fsmState = ret;
			curState = nim.fsmStateTable[nim.fsmState];
		}
		if (curState.startFunc) {
			curState.startFunc();
		}
		nim.fsmCounter = nim.fsmStateTable[nim.fsmState].startCount;
		nim.fsmHumanTurnReady = false;
	}
};


// here we go, boot up the state
// load these before init
nim.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
};

nim.init = function() {
	logger("entering webgl nim\n");
	nim.globalspecpow = globalmat.specpow;
	globalmat.specpow = 2000;
	
	// overall game state
	nim.humanScore = 0;
	nim.compScore = 0;
	nim.startMoveHuman = true;
	nim.fsmState = -1;
	
	// rules
	nim.threeMax = true;
	nim.lastLoses = true;

	// ui
	setbutsname('nim');
	//makeabut("Reset level",nim.resetLevel); // temp, TEST
	nim.rulesButton = makeabut("Change rules", nim.changeRules);
	nim.changePilesButton = makeabut("Change piles", nim.createPiles);
	nim.levelDest = makeaprintarea('level:');
	
	input.fmx = -10; // hack to not be over a piece when state starts
	
	// build parent
	nim.roottree = new Tree2("nim root tree");
	nim.turnLine = null;

	// build 3d assets
	// piles
	nim.curPileSet = 2; // STD piles
	nim.createPiles();
	// line
	nim.createTurnLine();
	// textInfo
	nim.createTextInfo();
	
	// viewport
	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
	nim.onresize(); // set textInfo trans a scale right
	
// test debug	
	//debprint.addlist("nim state",["nim"]); // TMI
	debprint.addlist("nim state",["nim.fsmStates", "nim.turn", "nim.curPiles", "nim.turnLine"]);
};

nim.proc = function() {
	// proc nim game
	nim.procFSM();
	
	// proc line
	nim.updateTurnLine();
	
	// proc graphics
	nim.updatePiles();
	nim.firstMove = arrayEquals(nim.startPiles, nim.curPiles);
	
	// text
	nim.updateTextInfo();
	
	// change state of rules and pile set button depending on whether or not start of game and human
	if (nim.fsmState == nim.fsmStates.humanMove && nim.firstMove) {
		nim.rulesButton.disabled = false;
		nim.changePilesButton.disabled = false;
	} else {
		nim.rulesButton.disabled = true;
		nim.changePilesButton.disabled = true;
	}
	
	// general proc
	nim.roottree.proc(); // probably does nothing, run animations if available, and user procs too
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	nim.roottree.draw();
};

nim.onresize = function() {
	logger("nim resize!\n");
	nim.textInfo.trans = [-gl.asp + 64 / glc.clientHeight / 4, 1 - 64 / glc.clientHeight / 4, 1];
	// TODO: stop using hard coded glyph sizes, (right now 16,32)
	nim.textInfo.scale = [16 / glc.clientHeight, 32 / glc.clientHeight, 1];
};

nim.exit = function() {
	// show current usage before cleanup
	nim.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	nim.roottree.glfree();
	debprint.removelist("nim state");
	
	// show usage after cleanup
	logrc();
	nim.roottree = null;
	clearbuts('nim');
	logger("exiting webgl nim\n");
	globalmat.specpow = nim.globalspecpow;
};
