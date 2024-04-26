'use strict';

// move the AI calc part of the chomp game to this file

chomp.study = function(dim) {
    console.log("study piles of a " + dim[0] + " by " + dim[1] + " game");

};

chomp.calcMove = function(piles) {
	// a move has: pilex, piley, numChomps
	const ret = {};
	ret.moves = [];
	ret.win = false;
	for (let i = 0; i < piles.length; ++i) {
		const val = piles[i];
		if (val > 0) {
			const r = i + 1;
			const valRight = r == piles.length ? 0 : piles[r];
			if (val > valRight) { // chomp one piece
				const oldAmount = chomp.countPieces(piles);
				const newPile = chomp.doMove(piles, i, val - 1);
				const newAmount = chomp.countPieces(newPile);
				const diff = oldAmount - newAmount;
				const move = [i, val - 1, diff];
				ret.moves.push(move);
				ret.win = true;
			}
		}
	}
	return ret;
};
