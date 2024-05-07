'use strict';

// move the AI calc part of the chomp game to this file

chomp.iter = function(pile, y) {
	let i = 0;
	while(i < pile.length) {
		if (pile[i] < y) {
			++pile[i];
			if (i > 0) {
				pile.fill(pile[i], 0, i); // keep lower pile idx >= current
			}
			return true;
		} else {
			pile[i++] = 0;
		}
	}
	return false;
};

chomp.findLoser = function(pile) {
	for (const pos of chomp.losePositions) {
		if (arrayEquals(pos, pile)) {
			return true;
		}
	}
	return false;
};

// look back for losing moves, if found then this pile is a winner
chomp.lookMoves = function(pile) {
	//console.log("moves for pile " + pile);
	let loser = chomp.findLoser(pile); // shortcut, already know is a loser, don't try to move and find a loser
	if (loser) {
		//console.log("SHORTCUT, already a loser");
		return []; // no winning moves
	}
	const goodMoves = [];
	// do all legal moves
	for (let i = 0; i < pile.length; ++i) {
		for (let j = 0; j < pile[i]; ++j) {
			const newPile = chomp.doMove(pile, i, j);
			loser = chomp.findLoser(newPile);
			if (loser) {
				const move = [i, j];
				//console.log("move to LOSER = " + move + ", result = " + newPile);
				goodMoves.push(move);
			}
		}
	}
	if (!goodMoves.length) {
		//console.log("can't move to LOSER, must be a LOSER");
		chomp.losePositions.push(pile.slice());
	}
	return goodMoves;
};

chomp.showPile = function(pile, dimY) {
	for (let j = dimY; j > 0; --j) {
		let rowStr = "";
		for (let i = 0; i < pile.length; ++i) {
			rowStr += pile[i] >= j ? "# " : ". ";
		}
		console.log(rowStr);
	}
};

chomp.study = function(dim) {
    //console.log("study piles of a " + dim[0] + " by " + dim[1] + " game");
	chomp.losePositions = Array();
	let count = 0;
	const pile = Array(dim[0]).fill(0);
	pile[0] = 1; // start at one, if you are left with just 1, you lose
	chomp.losePositions.push(pile.slice());
	// start at next pile after 1
	while (chomp.iter(pile, dim[1])) {
		//console.log("pile = " + pile);
		const lm = chomp.lookMoves(pile);
		//console.log("look moves = " + JSON.stringify(lm));
		++count;
	}
	// done studying
	console.log("count = " + count + ", loser count = " + chomp.losePositions.length);
	console.log("lose piles");
	for (const pile of chomp.losePositions) {
		console.log("======================");
		console.log("pile: " + pile);
		chomp.showPile(pile, dim[1]);
	}
};

chomp.calcMove = function(piles) {
	const goodMoves = chomp.lookMoves(piles);
	// a move has: pilex, piley, numChomps
	let win;
	let moves;
	// 
	if (goodMoves.length) {
		win = true;
		moves = goodMoves;

	} else {
		win = false;
		moves = [];
		// losing, just take chomp 1 piece where possible
		for (let i = 0; i < piles.length; ++i) {
			const val = piles[i];
			if (val > 0) {
				const r = i + 1;
				const valRight = r == piles.length ? 0 : piles[r];
				if (val > valRight) { // chomp one piece
					moves.push([i, val - 1]);
				}
			}
		}
	}
	const oldAmount = chomp.countPieces(piles);
	for (let i = 0; i < moves.length; ++i) {
		const move = moves[i];
		const newPile = chomp.doMove(piles, move[0], move[1]);
		const newAmount = chomp.countPieces(newPile);
		const diff = oldAmount - newAmount;
		move.push(diff);
	}
	return {moves: moves, win: win};
};
