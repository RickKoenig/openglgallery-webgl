'use strict';

// chomp game
var chomp = {}; // the chomp game state

// state info
chomp.text = "Chomp Game";
chomp.title = "Chomp";

// FSM
chomp.fsmStates = {
	humanMove : 0,
	compMove : 1,
	humanWins : 2,
	compWins : 3,
	compMoveFirst: 4 // let computer say I'll move first for a small amount of time
};

chomp.fsmStateTable = [
	// human move
	{
		startCount: 0,
		endFunc: function() {
			var done = chomp.playTurn();
			if (done) {
				//if (chomp.lastLoses) {
				//	return chomp.fsmStates.compWins;
				//} else {
					return chomp.fsmStates.humanWins;
				//}
			} else {
				return chomp.fsmStates.compMove;
			}
		},
		endCondMove: true
	},
	// comp move
	{
		startCount: 90,
		startFunc: function() {
			chomp.turn = chomp.calcCompTurn();
		},
		endFunc: function() {
			var done = chomp.playTurn();
			if (done) {
				//if (chomp.lastLoses) {
				//	return chomp.fsmStates.humanWins;
				//} else {
					return chomp.fsmStates.compWins;
				//}
			} else {
				return chomp.fsmStates.humanMove;
			}
		},
		endCondTime: true
	},
	// human wins
	{
		startCount: 135,
		startFunc: function() {
			++chomp.humanScore;
		},
		endFunc: function() {
			chomp.startMoveHuman = !chomp.startMoveHuman;
			chomp.resetLevel();
			if (chomp.startMoveHuman) {
				return chomp.fsmStates.humanMove;
			} else {
				return chomp.fsmStates.compMoveFirst;
			}
		},
		endCondTime: true
	},
	// comp wins
	{
		startCount: 135,
		startFunc: function() {
			++chomp.compScore;
		},
		endFunc: function() {
			chomp.startMoveHuman = !chomp.startMoveHuman;
			chomp.resetLevel();
			if (chomp.startMoveHuman) {
				return chomp.fsmStates.humanMove;
			} else {
				return chomp.fsmStates.compMoveFirst;
			}
		},
		endCondTime: true
	},
	//compMoveFirst  let computer say that it's going first at beginning of game
	{
		startCount: 67,
		endFunc: function() {
			return chomp.fsmStates.compMove;
		},
		endCondTime: true
	}
];
chomp.fsmState = chomp.fsmStates.humanMove;
chomp.fsmCounter = 0;
chomp.fsmHumanTurnReady = false;

/*
// game rules
chomp.threeMax = false;
chomp.lastLoses = false;
chomp.rulesButton = null;
*/
//intermediate

// overall score
chomp.humanScore = 0;
chomp.compScore = 0;

// line turn info
chomp.startMoveHuman = true;
chomp.turn = [0, 0];
chomp.turnLine = null; // tree draw a line for move

// pile info
chomp.startPiles = null; // pile data, initial pile start
chomp.curPiles = null; // current piles
chomp.pilesTree = null; // tree draw 2d array
//chomp.curPileSet = 0;

// all the different pile configurations
chomp.makePileSet = function(x, y) {
	const pileSet = Array(x).fill(y);
	return pileSet;
}
/*
chomp.pileSet = [];
	[9],
	[7, 7],
	[3, 5, 7],
	[3, 5, 7, 9],
];*/

/*chomp.pileDesc = [
	"EASY",
	"MEDIUM",
	"STANDARD",
	"ADVANCED"
];*/

chomp.pileDim = [7, 4];

// drawing piles metrics
chomp.maxPile = 0; // maximum number of piles
chomp.pileOffset = null;
chomp.pileSpace = null;
chomp.pileSize = null;

chomp.globalspecpow;

// game status
chomp.textInfo = null; // tree font

// CHOMP FUNCTIONS

// game rules
chomp.getMaxMove = function() {
	return chomp.maxPile;
};


// line for showing turn in progress
chomp.createTurnLine = function() {
	// turn line 3d assets
	chomp.turnLine = buildplanexy("line for turn",1,1,"Bark.png","texc");
	chomp.turnLine.mod.flags |= modelflagenums.DOUBLESIDED|modelflagenums.NOZBUFFER;
	chomp.turnLine.mod.mat.color = [1,0,0,1];
	chomp.roottree.linkchild(chomp.turnLine);
};

chomp.updateTurnLine = function() {
	if (chomp.fsmState == chomp.fsmStates.humanMove) { // human
		chomp.mouseToTurn();
	}
	chomp.turnToDraw();
	if (input.mclick[0] && chomp.turn[1] > 0) {
		chomp.fsmHumanTurnReady = true;
	}
};

// update chomp.turn
// from input.fmx and input.fmy
chomp.mouseToTurn = function() {
	var mx = input.fmx;
	var my = input.fmy;
	var len = chomp.startPiles.length;
	var tpX = mx / chomp.pileSpace[0] + chomp.startPiles.length / 2;
	var turnPileX = Math.floor(tpX);
	var turnSubPile = (tpX - turnPileX) * chomp.pileSpace[0];
	var overPileX = turnPileX >= 0 && turnPileX < chomp.startPiles.length
				&& turnSubPile >= (chomp.pileSpace[0] - chomp.pileSize[0]) / 2
				&& turnSubPile < (chomp.pileSpace[0] + chomp.pileSize[0]) / 2;
	if (!overPileX) {
		chomp.turn = [0, 0];
		return;
	}

	var turnPileY = Math.floor(-chomp.maxPile / 2 + chomp.curPiles[turnPileX] - my / chomp.pileSpace[1] + .5);
	turnPileY = range(0, turnPileY, chomp.curPiles[turnPileX]);
	turnPileY = range(0, turnPileY, chomp.getMaxMove());
	chomp.turn = [turnPileX, turnPileY];
};

chomp.countPieces = function(arr) {
	var cnt = 0;
	for (var i = 0; i < chomp.startPiles.length; ++i) {
		cnt += arr[i];
	}
	return cnt;
};

// also append a 1 if losing, 0 if winning to return array
chomp.calcMove = function() {
	// assume rightmost pile is the largest
	//reason = "std";
	//reasonArr = new Array(chomp.startPiles.length).fill("pile");
	chomp.mod = chomp.startPiles[chomp.startPiles.length - 1] + 1;
	var xor = 0;
	for (var np of chomp.curPiles) {
		xor ^= np;
	}
	var ret = new Array(chomp.startPiles.length).fill(0);
	// test
	//xor = 0;
	if (xor) {
		for (var i = 0; i < chomp.startPiles.length; ++i) {
			var goodPile = xor ^ chomp.curPiles[i];
			var amount = chomp.curPiles[i] - goodPile;
			var newPile = chomp.doMove(chomp.curPiles, i, amount);
			ret[i] = amount;
		}
	} else {
		ret.fill(0);
	}
	// convert losing position to take 1 from any nonzero pile
	var cp = chomp.countPieces(ret);
	if (!cp) {
		for (var i = 0; i < chomp.startPiles.length; ++i) {
			ret[i] = chomp.curPiles[i] > 0 ? 1 : 0;
		}
		ret.push(1);
	} else {
		ret.push(0);
	}
	return ret;
};

// return 2d array that has the pile and the amount
chomp.calcCompTurn = function() {
	var moves = chomp.calcMove();
	var validTurn = [];
	var possibleMoves = [];
	for (var i = 0; i < chomp.curPiles.length; ++i) {
		if (moves[i] > 0) {
			validTurn.push(i);
			var newPile = chomp.doMove(chomp.curPiles, i, moves[i]);
			possibleMoves.push(newPile);
		}
		
	}
	if (!validTurn.length) {
		return [0, 0]; // can't make a turn!
	}
	var outcomes = null;
	// do outcomes and print them
	var outcomes = JSON.stringify(possibleMoves);
	console.log("calcCompturn start = " + chomp.curPiles + " moves = " + moves 
				+ " outcomes = " + outcomes + " " + (moves[chomp.curPiles.length] ? "Losing" : "Winning"));
	var pile = validTurn[getRandomInt(validTurn.length)];
	return [pile, moves[pile]];
};

// update chomp.turnLine.trans and chomp.turnLine.scale and chomp.turnLine.flags treeflagenums.DONTDRAW
// from chomp.turn
chomp.turnToDraw = function() {
if (!chomp.turn[1] || (chomp.fsmState != chomp.fsmStates.humanMove && chomp.fsmState != chomp.fsmStates.compMove)) {
		// not a valid turn, don't draw
		chomp.turnLine.flags |= treeflagenums.DONTDRAW;	
		return;
	}
	// do draw
	chomp.turnLine.flags &= ~treeflagenums.DONTDRAW;
	var xTrans = chomp.turn[0] * chomp.pileSpace[0] - (chomp.startPiles.length - 1) * chomp.pileSpace[0] / 2;
	var xScale = .025;
	
	var yStart = chomp.curPiles[chomp.turn[0]] * chomp.pileSpace[1] - chomp.maxPile * chomp.pileSpace[1] / 2;
	var yEnd = yStart - chomp.pileSpace[1] * chomp.turn[1];
	var yTrans = (yStart + yEnd) / 2;
	var yScale = (yStart - yEnd) / 2;
	
	chomp.turnLine.trans = [xTrans, yTrans, 1];
	chomp.turnLine.scale = [xScale, yScale, 1];
};

chomp.playTurn = function() {
	chomp.curPiles = chomp.doMove(chomp.curPiles, chomp.turn[0], chomp.turn[1]);
	// return true if all zeros
	for (var i = 0; i < chomp.curPiles.length; ++i) {
		if (chomp.curPiles[i]) {
			return false;
		}
	}
	return true;
};

// see if piles have just 0's and 1's
// return -1 if not, 0 if even, 1 if odd
// ignore a pile if ignore >= 0 else count all piles
chomp.isOnes = function(piles, ignore) {
	// you lose if odd number of all piles of 1 and rest 0
	var ones = 0;
	for (var i = 0; i < piles.length; ++i) {
		if (i == ignore)
			continue;
		var npm = piles[i] % chomp.mod;
		if (npm > 1) {
			return -1;
		} else if (npm == 1) {
			++ones;
		}
	}
	return ones & 1;
};

chomp.doMove = function(arr, pile, amount) {
	var ret = arr.slice();
	ret[pile] -= amount;
	return ret;
};

chomp.minPileX = 1;
chomp.minPileY = 1;
chomp.maxPileX = 8;
chomp.maxPileY = 8;
// piles
chomp.changeXm = function() {
	console.log("xm");
	chomp.pileDim[0] = Math.max(chomp.pileDim[0] - 1, chomp.minPileX);
	chomp.createPiles();
}

chomp.changeXp = function() {
	console.log("xp");
	chomp.pileDim[0] = Math.min(chomp.pileDim[0] + 1, chomp.maxPileX);
	chomp.createPiles();
}

chomp.changeYm = function() {
	console.log("ym");
	chomp.pileDim[1] = Math.max(chomp.pileDim[1] - 1, chomp.minPileY);
	chomp.createPiles();
}

chomp.changeYp = function() {
	console.log("yp");
	chomp.pileDim[1] = Math.min(chomp.pileDim[1] + 1, chomp.maxPileY);
	chomp.createPiles();
}

chomp.createPiles = function() {
	chomp.pileSpace = [.2, .2];
	chomp.pileSize = [.175, .175];
	chomp.pileDescStr = "" + chomp.pileDim;//chomp.pileDesc[chomp.curPileSet];
	chomp.startPiles = chomp.makePileSet(chomp.pileDim[0], chomp.pileDim[1]);
/*	++chomp.curPileSet;
	if (chomp.curPileSet == chomp.pileSet.length) {
		chomp.curPileSet = 0;
	} */
	
	chomp.maxPile = chomp.pileDim[1];//chomp.startPiles[chomp.startPiles.length -1]; // assume right most pile is the largest
	chomp.pileOffset = [(chomp.pileDim[0] - 1) * -chomp.pileSpace[0] / 2,
						(chomp.maxPile - 1) * -chomp.pileSpace[1] /2];
	chomp.curPiles = chomp.startPiles.slice(); // start with the preset piles

	// build 3d assets
	/*
	var master = buildplanexy("a chomp piece", chomp.pileSize[0] / 2, chomp.pileSize[1] / 2, "maptestnck.png", "texDoubleSided");
	master.mod.flags |= modelflagenums.DOUBLESIDED|modelflagenums.NOZBUFFER;
	master.trans = [0,0,1];
	*/
		// bob 
	//var pendpce2 = buildcylinderxz("pend1pce2",.4,.2,"panel.jpg","diffusespecp");
	var master = buildsphere3("pend1pce2",[chomp.pileSize[0] / 2,chomp.pileSize[0] / 2 / 3,chomp.pileSize[0] / 2]
	,"panel.jpg","diffusespecp");
	master.mod.mat.specpow = .0001;
	master.trans = [0,0,1];
	//pendpce2.trans = [0,4,-.1];
	master.rot = [Math.PI/2,0,0];
	//pendpce0.rotvel = [.1,.5,0];
	//pendpce0.flags |= treeflagenums.ALWAYSFACING;
	chomp.roottree.linkchild(master);
	
	// free up some resources when changing piles
	if (chomp.pilesTree) {
		for (var column of chomp.pilesTree) {
			for (var piece of column) {
				piece.glfree();
			}
		}
	}
	
	// start over with tree resources
	chomp.pilesTree = [];
	for (var i = 0; i < chomp.startPiles.length; ++i) {
		var column = [];
		var numCol = chomp.startPiles[i];
		for (var j = 0; j < numCol; ++j) {
			var piece = master.newdup();
			piece.trans[0] = i * chomp.pileSpace[0] + chomp.pileOffset[0]; // x
			piece.trans[1] = j * chomp.pileSpace[1] + chomp.pileOffset[1]; // y
			chomp.roottree.linkchild(piece);
			column.push(piece);
		}
		chomp.pilesTree.push(column);
	}
	master.glfree();
	
	// put turnLine back in front of draw order
	if (chomp.turnLine) {
		chomp.turnLine.unlinkchild();
		chomp.turnLine.glfree();
		chomp.createTurnLine();
	}
};

chomp.updatePiles = function() {
	for (var i = 0; i < chomp.startPiles.length; ++i) {
		var column = [];
		var numCol = chomp.startPiles[i];
		var numCurPieces = chomp.curPiles[i];
		for (var j = 0; j < numCol; ++j) {
			if (j >= numCurPieces) { // draw pieces left
				chomp.pilesTree[i][j].flags |= treeflagenums.DONTDRAW;
			} else { // don't draw pieces removed
				chomp.pilesTree[i][j].flags &= ~treeflagenums.DONTDRAW;
			}
		}
	}
};


// text status of the game
// create
chomp.createTextInfo = function () {
	chomp.textInfo = new Tree2("chomp game info");
	var fontSize = 1.5;
	var scratchfontmodel = new ModelFont("font for chomp","font0.png","tex",
		fontSize, fontSize,
		80, 20,
		true);
	scratchfontmodel.flags |= modelflagenums.DOUBLESIDED|modelflagenums.NOZBUFFER;
	chomp.textInfo.setmodel(scratchfontmodel);
	chomp.roottree.linkchild(chomp.textInfo);
};

// update
chomp.updateTextInfo = function() {
	// make a few sentences describing the current state of the game
	var scoreInfo = "Score:\nYou " + chomp.humanScore + " ,Me " + chomp.compScore + "\n\n";

	var stateInfo = 0;
	var rulesInfo = "These are the rules:\n";
	rulesInfo += "Take as many pieces as you want\n from any one pile\n";
	rulesInfo += "Who ever takes the last piece WINS!\n\n";
	var who1 = "#";
	var who2 = "$";
	var who3 = "?";
	switch(chomp.fsmState) {
	case chomp.fsmStates.humanMove:
		who1 = "You'll";
		who2 = "Your";
		who3 = "You";
		break;
	case chomp.fsmStates.compMove:
		who1 = "I'll";
		who2 = "My";
		who3 = "I";
		break;
	}
	var turnInfo;
	if (chomp.fsmState == chomp.fsmStates.humanWins) {
		turnInfo = "You Win!!!";
	} else if (chomp.fsmState == chomp.fsmStates.compWins) {
		turnInfo = "You Lose!!!";
	} else if (chomp.fsmState == chomp.fsmStates.compMoveFirst) {
		turnInfo = "I'll go first";
	} else {
		if (chomp.turn[1] > 0) {
			turnInfo = who1 + " take " + chomp.turn[1] + " from pile " + (chomp.turn[0] + 1);
		} else {
			if (chomp.firstMove) {
				turnInfo = who3 + " go first";
			} else {
				turnInfo = who2 + " turn";
			}
		}
	}
	//var testInfo = "\n\nFSM state = " + chomp.fsmState 
	//	+ ", FSM counter = " + chomp.fsmCounter;
	//	//+ ",fmx = " + input.fmx.toFixed(3);
	var pileInfo = "\n\n\nPiles: " + JSON.stringify(chomp.curPiles);
	var info = rulesInfo + scoreInfo + turnInfo + pileInfo;
	chomp.textInfo.mod.print(info);
	printareadraw(chomp.levelDest, "Level = " + chomp.pileDescStr + " piles");
};

chomp.resetLevel = function() {
	chomp.curPiles = chomp.startPiles.slice();
};
/*
chomp.changeRules = function() {
	chomp.lastLoses = !chomp.lastLoses;
	if (chomp.lastLoses)
		chomp.threeMax = !chomp.threeMax;
	chomp.updateTextInfo();
};*/

chomp.procFSM = function() {
	// init FSM when fsmState < 0
	if (chomp.fsmState < 0) {
		if (chomp.startMoveHuman) {
			chomp.fsmState = chomp.fsmStates.humanMove;
		} else {
			chomp.fsmState = chomp.fsmStates.compMoveFirst;
		}
		chomp.fsmCounter = chomp.fsmStateTable[chomp.fsmState].startCount;
		chomp.fsmHumanTurnReady = false;
	}
	// proc
	var curState = chomp.fsmStateTable[chomp.fsmState];
	--chomp.fsmCounter;
	// change on time
	var newState = false;
	// end conditions
	if (chomp.fsmCounter < 0) {
		chomp.fsmCounter = 0;
		// change on time
		if (curState.endCondTime) {
			newState = true;
		}
	}
	// change on move
	if (curState.endCondMove && chomp.fsmHumanTurnReady) {
		newState = true;
	}
	// change state
	if (newState) {
		if (curState.endFunc) {
			var ret = curState.endFunc();
			if (ret === undefined)
				console.log("undefined");
			chomp.fsmState = ret;
			curState = chomp.fsmStateTable[chomp.fsmState];
		}
		if (curState.startFunc) {
			curState.startFunc();
		}
		chomp.fsmCounter = chomp.fsmStateTable[chomp.fsmState].startCount;
		chomp.fsmHumanTurnReady = false;
	}
};


// here we go, boot up the state
// load these before init
chomp.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
};

chomp.init = function() {
	logger("entering webgl chomp\n");
	chomp.globalspecpow = globalmat.specpow;
	globalmat.specpow = 2000;
	
	// overall game state
	chomp.humanScore = 0;
	chomp.compScore = 0;
	chomp.startMoveHuman = true;
	chomp.fsmState = -1;
	
	// rules
	//chomp.threeMax = true;
	//chomp.lastLoses = true;

	// ui
	setbutsname('chomp');
	//makeabut("Reset level",chomp.resetLevel); // temp, TEST
	//chomp.rulesButton = makeabut("Change rules", chomp.changeRules);
	//chomp.changePilesButton = makeabut("Change piles", chomp.createPiles);
	chomp.changeXm = makeabut("X-", chomp.changeXm);
	chomp.changeXp = makeabut("X+", chomp.changeXp);
	chomp.changeYm = makeabut("Y-", chomp.changeYm);
	chomp.changeYp = makeabut("Y+", chomp.changeYp);
	chomp.levelDest = makeaprintarea('level:');
	
	input.fmx = -10; // hack to not be over a piece when state starts
	
	// build parent
	chomp.roottree = new Tree2("chomp root tree");
	chomp.turnLine = null;

	// build 3d assets
	// piles
	//chomp.curPileSet = 2; // STD piles
	chomp.createPiles();
	// line
	chomp.createTurnLine();
	// textInfo
	chomp.createTextInfo();
	
	// viewport
	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
	chomp.onresize(); // set textInfo trans a scale right
	
// test debug	
	//debprint.addlist("chomp state",["chomp"]); // TMI
	debprint.addlist("chomp state",["chomp.fsmStates", "chomp.turn", "chomp.curPiles", "chomp.turnLine"]);
};

chomp.proc = function() {
	// proc chomp game
	chomp.procFSM();
	
	// proc line
	chomp.updateTurnLine();
	
	// proc graphics
	chomp.updatePiles();
	chomp.firstMove = arrayEquals(chomp.startPiles, chomp.curPiles);
	
	// text
	chomp.updateTextInfo();
	
	// change state of rules and pile set button depending on whether or not start of game and human
	if (chomp.fsmState == chomp.fsmStates.humanMove && chomp.firstMove) {
		chomp.changeXm.disabled = false;
		chomp.changeXp.disabled = false;
		chomp.changeYm.disabled = false;
		chomp.changeYp.disabled = false;
		//chomp.rulesButton.disabled = false;
		//chomp.changePilesButton.disabled = false;
	} else {
		chomp.changeXm.disabled = true;
		chomp.changeXp.disabled = true;
		chomp.changeYm.disabled = true;
		chomp.changeYp.disabled = true;
		//chomp.rulesButton.disabled = true;
		//chomp.changePilesButton.disabled = true;
	}
	
	// general proc
	chomp.roottree.proc(); // probably does nothing, run animations if available, and user procs too
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	chomp.roottree.draw();
};

chomp.onresize = function() {
	logger("chomp resize!\n");
	chomp.textInfo.trans = [-gl.asp + 64 / glc.clientHeight / 4, 1 - 64 / glc.clientHeight / 4, 1];
	// TODO: stop using hard coded glyph sizes, (right now 16,32)
	chomp.textInfo.scale = [16 / glc.clientHeight, 32 / glc.clientHeight, 1];
};

chomp.exit = function() {
	// show current usage before cleanup
	chomp.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	chomp.roottree.glfree();
	debprint.removelist("chomp state");
	
	// show usage after cleanup
	logrc();
	chomp.roottree = null;
	clearbuts('chomp');
	logger("exiting webgl chomp\n");
	globalmat.specpow = chomp.globalspecpow;
};
