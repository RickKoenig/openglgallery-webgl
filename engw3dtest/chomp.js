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
					return chomp.fsmStates.compWins;
				//} else {
				//	return chomp.fsmStates.humanWins;
				//}
			} else {
				//return chomp.fsmStates.compMove;
				return chomp.fsmStates.humanMove;
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
					return chomp.fsmStates.humanWins;
				//} else {
				//	return chomp.fsmStates.compWins;
				//}
			} else {
				return chomp.fsmStates.compMove;
				//return chomp.fsmStates.humanMove;
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
			//chomp.startMoveHuman = !chomp.startMoveHuman;
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
			//chomp.startMoveHuman = !chomp.startMoveHuman;
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
//chomp.fsmState = chomp.fsmStates.humanMove;
//chomp.fsmState = chomp.fsmStates.compMove;
chomp.fsmCounter = 0;
chomp.fsmHumanTurnReady = false;

// overall score
chomp.humanScore = 0;
chomp.compScore = 0;

// line turn info
chomp.startMoveHuman;
chomp.turn = [0, 0];
chomp.turnSelect = null; // tree draw a line for move

// pile info
chomp.startPiles = null; // pile data, initial pile start
chomp.curPiles = null; // current piles
chomp.pilesTree = null; // tree draw 2d array

// all the different pile configurations
chomp.makePileSet = function(x, y) {
	const pileSet = Array(x).fill(y);
	return pileSet;
}

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

// line for showing turn in progress
chomp.createTurnSelect = function() {
	// turn line 3d assets
	chomp.turnSelect = buildplanexy("select for turn",1,1,"Bark.png","texc");
	chomp.turnSelect.mod.flags |= modelflagenums.DOUBLESIDED|modelflagenums.NOZBUFFER|modelflagenums.HASALPHA;
	chomp.turnSelect.mod.mat.color = [1,0,0,.25];
	chomp.roottree.linkchild(chomp.turnSelect);
};

chomp.updateTurnSelect = function() {
	if (chomp.fsmState == chomp.fsmStates.humanMove) { // human
		chomp.mouseToTurn();
	}
	chomp.turnToDraw();
	if (input.mclick[0] && chomp.turn[1] >= 0) {
		chomp.fsmHumanTurnReady = true;
	}
};

// update chomp.turn
// from input.fmx and input.fmy
chomp.mouseToTurn = function() {
	var mx = input.fmx;
	var my = input.fmy;
	var len = chomp.pileDim[0];
	var tpX = mx / chomp.pileSpace[0] + len / 2;
	var turnPileX = Math.floor(tpX);
	var overPileX = turnPileX >= 0 && turnPileX < len;
	if (!overPileX) {
		chomp.turn = [0, -1, 0];
		return;
	}
	var turnPileY = Math.floor(-chomp.maxPile / 2 + chomp.pileDim[1] - my / chomp.pileSpace[1] + 1);
	turnPileY = chomp.pileDim[1] - range(0, turnPileY, chomp.pileDim[1]);
	const numPiecesBefore = chomp.countPieces(chomp.curPiles);
	const piecesAfter = chomp.doMove(chomp.curPiles, turnPileX, turnPileY);
	const numPiecesAfter = chomp.countPieces(piecesAfter);
	const numChompedPieces = numPiecesBefore - numPiecesAfter;
	if (!numChompedPieces) {
		chomp.turn = [0, -1, 0];
		return;
	}
	chomp.turn = [turnPileX, turnPileY, numChompedPieces];
};

chomp.countPieces = function(arr) {
	var cnt = 0;
	for (var i = 0; i < chomp.startPiles.length; ++i) {
		cnt += arr[i];
	}
	return cnt;
};

// START Computer turn

// see if piles have just 0's and 1's
// return -1 if not, 0 if even, 1 if odd
// ignore a pile if ignore >= 0 else count all piles
/*
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
			if (amount < 0) {
				amount = 0;
			}
			var newPile = chomp.doMove(chomp.curPiles, i, amount);
			var ones = chomp.isOnes(newPile, i);
			if (ones >= 0) {
				//reason = "spc1";
				var goodPile = 1 - ones; // try to get an odd number of ones
				var amount = chomp.curPiles[i] - goodPile;
				if (amount > 0) {
					amount %= chomp.mod;
				} else {
					//reason = "spc2";
					amount = 0;
				}
			} 
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
	}
	return {moves: ret, win: !!cp};
};
*/
/*
// return 2d array that has the pile and the amount
chomp.calcCompTurn = function() {
	var {moves, win: winning} = chomp.calcMove();
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
				+ " outcomes = " + outcomes + " " + (winning ? "Winning" : "Losing"));
	var pile = validTurn[getRandomInt(validTurn.length)];
	return [pile, moves[pile]];
};
*/

chomp.calcCompTurn = function() {
	for (let i = chomp.pileDim[0] -1; i >= 0; --i) {
		const val = chomp.curPiles[i];
		if (val > 0) {
			const oldAmount = chomp.countPieces(chomp.curPiles);
			const newPile = chomp.doMove(chomp.curPiles,i,val - 1);
			const newAmount = chomp.countPieces(newPile);
			const diff = oldAmount - newAmount;
			return [i, val - 1, diff]
		}
	}
	return [0, -1, 0];
};

// END Computer turn

// update chomp.turnSelect.trans and chomp.turnSelect.scale and chomp.turnSelect.flags treeflagenums.DONTDRAW
// from chomp.turn
chomp.turnToDraw = function() {
if (chomp.turn[1] < 0 || (chomp.fsmState != chomp.fsmStates.humanMove && chomp.fsmState != chomp.fsmStates.compMove)) {
		// not a valid turn, don't draw
		chomp.turnSelect.flags |= treeflagenums.DONTDRAW;	
		return;
	}
	// do draw
	chomp.turnSelect.flags &= ~treeflagenums.DONTDRAW;
	var xTrans = chomp.turn[0] * chomp.pileSpace[0] / 2;
		- ((chomp.startPiles.length - 1) * chomp.pileSpace[0]) / 2;
	var xScale = chomp.pileSpace[0] / 2 * (chomp.startPiles.length - chomp.turn[0]);//.025;
	
	var yStart = chomp.pileDim[1] * chomp.pileSpace[1] - chomp.maxPile * chomp.pileSpace[1] / 2;
	var yEnd = yStart - chomp.pileSpace[1] * (chomp.pileDim[1] - chomp.turn[1]);
	var yTrans = (yStart + yEnd) / 2;
	var yScale = (yStart - yEnd) / 2;
	
	chomp.turnSelect.trans = [xTrans, yTrans, 1];
	chomp.turnSelect.scale = [xScale, yScale, 1];
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

// take a bite
chomp.doMove = function(arr, pile, newVal) {
	const ret = arr.slice();
	for (let i = pile; i < chomp.pileDim[0]; ++i) {
		const oldVal = chomp.curPiles[i];
		if (newVal < oldVal) {
			ret[i] = newVal;
		}
	}
	return ret;
};

chomp.minPileX = 1;
chomp.minPileY = 1;
chomp.maxPileX = 8;
chomp.maxPileY = 8;

// change start piles start rectangle
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
	chomp.pileDescStr = "" + chomp.pileDim;
	chomp.startPiles = chomp.makePileSet(chomp.pileDim[0], chomp.pileDim[1]);
	
	chomp.maxPile = chomp.pileDim[1];
	chomp.pileOffset = [(chomp.pileDim[0] - 1) * -chomp.pileSpace[0] / 2,
						(chomp.maxPile - 1) * -chomp.pileSpace[1] /2];
	chomp.curPiles = chomp.startPiles.slice(); // start with the preset piles

	// build 3d assets
	const master = buildsphere3("chompPiece",[chomp.pileSize[0] / 2,chomp.pileSize[0] / 2 / 3,chomp.pileSize[0] / 2]
	,"panel.jpg","diffusespecp");
	master.mod.mat.specpow = .0001;
	master.trans = [0,0,1];
	master.rot = [Math.PI/2,0,0];
	
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
	if (chomp.turnSelect) {
		chomp.turnSelect.unlinkchild();
		chomp.turnSelect.glfree();
		chomp.createTurnSelect();
	}
};

chomp.updatePiles = function() {
	for (var i = 0; i < chomp.startPiles.length; ++i) {
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
	var rulesInfo = "These are the rules:\n\n";
	rulesInfo += "Chomp from upper right\n";
	rulesInfo += "Who ever takes the last piece LOSES!\n\n";
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
		if (chomp.turn[1] >= 0) {
			turnInfo = who1 + " take " + chomp.turn[1] + " from pile " + (chomp.turn[0]);
			const chompPieces = chomp.turn[2];
			turnInfo += " \n" + who1 + " chomp " + chompPieces + ( chompPieces == 1 ? " piece" : " pieces");
		} else {
			if (chomp.firstMove) {
				turnInfo = who3 + " go first";
			} else {
				turnInfo = who2 + " turn";
			}
		}
	}
	var pileInfo = "\n\n\nPiles: " + JSON.stringify(chomp.curPiles);
	var info = rulesInfo + scoreInfo + turnInfo + pileInfo;
	chomp.textInfo.mod.print(info);
	printareadraw(chomp.levelDest, "Level = " + chomp.pileDescStr + " piles");
};

chomp.resetLevel = function() {
	chomp.curPiles = chomp.startPiles.slice();
};

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
	chomp.startMoveHuman = false;
	chomp.fsmState = -1;
	
	// ui
	setbutsname('chomp');
	chomp.changeXmBut = makeabut("X-", chomp.changeXm);
	chomp.changeXpBut = makeabut("X+", chomp.changeXp);
	chomp.changeYmBut = makeabut("Y-", chomp.changeYm);
	chomp.changeYpBut = makeabut("Y+", chomp.changeYp);
	chomp.levelDest = makeaprintarea('level:');
	
	input.fmx = -10; // hack to not be over a piece when state starts
	
	// build parent
	chomp.roottree = new Tree2("chomp root tree");
	chomp.turnSelect = null;

	// build 3d assets
	// piles
	chomp.createPiles();
	// select
	chomp.createTurnSelect();
	// textInfo
	chomp.createTextInfo();
	
	// viewport
	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
	chomp.onresize(); // set textInfo trans a scale right
	
// test debug	
	debprint.addlist("chomp state",["chomp.fsmStates", "chomp.turn", "chomp.curPiles"]);
};

chomp.proc = function() {
	// proc chomp game
	chomp.procFSM();
	
	// proc select
	chomp.updateTurnSelect();
	
	// proc graphics
	chomp.updatePiles();
	chomp.firstMove = arrayEquals(chomp.startPiles, chomp.curPiles);
	
	// text
	chomp.updateTextInfo();
	
	// change state of rules and pile set button depending on whether or not start of game and human
	const enableButs = chomp.fsmState == chomp.fsmStates.humanMove && chomp.firstMove;
	const disableButs = !enableButs;
	chomp.changeXmBut.disabled = disableButs;
	chomp.changeXpBut.disabled = disableButs;
	chomp.changeYmBut.disabled = disableButs;
	chomp.changeYpBut.disabled = disableButs;
	
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
