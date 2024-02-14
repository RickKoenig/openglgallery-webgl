'use strict';

console.log("INDICATOR");
// show ping times with a graph
class Indicator {
	// array of values to display left to right
	constructor(roottree, num, mySlot) {
		const show = true;
		// assume 60 FPS
		this.seconds = 1;
		this.lastSeconds = -1;
		this.index = 0; // index into scaling ranges
		this.sep = 420;
		const depth = glc.clientHeight / 2;
        let offy = -120;
		const stepy = 20;
        offy += depth;
		this.num = num;
		// alignment lines
		const lin = buildplanexy("alin",1,1,null,"flat");
		if (!show) {
			lin.flags |= treeflagenums.DONTDRAWC;
		}
		lin.mod.mat.color = [0, 1, 0, 1];
        lin.mod.flags |= modelflagenums.NOZBUFFER;
		lin.trans = [0, offy - this.num * stepy * .5 + stepy * .5, depth];
		lin.scale = [.5, this.num * stepy * .5, 1];
		for (let i = -1; i <= 1; ++i) { // min, 0, max indicator lines
			const alin = lin.newdup();
			alin.trans[0] = i * this.sep;
			roottree.linkchild(alin);
		}
		lin.glfree();

		// dots
		const dot = buildplanexy("adot",1,1,null,"flat");
        dot.mod.flags |= modelflagenums.NOZBUFFER;
		if (!show) {
			dot.flags |= treeflagenums.DONTDRAWC;
		}
		dot.scale = [4, 4, 1];
		this.trees = Array(this.num);
		for (let i = 0; i < this.num; ++i) {
			const tre = dot.newdup();
			if (i == mySlot) {
				tre.scale = [8, 8, 1];
			}
			tre.trans = [0, offy, depth];
			offy -= stepy;
			roottree.linkchild(tre);
			this.trees[i] = tre;
		}
		dot.glfree();

		// labels
		const termParams = {
			cols: 10,
			rows: 1,
			offx: 40,
			offy: 8,
			scale: 2
		};
		this.termLeft = new Terminal(roottree, [.1, 0, 0, 1], null, termParams);
		this.termLeft.doShow(show);
		termParams.offx += this.sep - 80 - 20;
		termParams.scale = 6;
		termParams.cols = 9;
		this.termMiddle = new Terminal(roottree, [.1, 0, 0, 1], null, termParams);
		this.termMiddle.doShow(show);
		termParams.offx += this.sep - 60 + 80;
		termParams.scale = 2;
		termParams.cols = 10;
		this.termRight = new Terminal(roottree, [.1, 0, 0, 1], null, termParams);
		this.termRight.doShow(show);
		this.termMiddle.print("0 sec at 60 HZ");
	}

	#setSeconds(maxVal) {
		// hysteresis
		const ranges = [1, 2, 5, 10, 20, 50]; // seconds for ranges
		if (this.index < ranges.length - 1 && maxVal > ranges[this.index]) {
			++this.index;
			this.seconds = ranges[this.index];
		}
		if (this.index > 0) {
			let downVal;
			if (this.index == 1) {
				downVal = .5 * ranges[0];
			} else {
				downVal = .5 * (ranges[this.index - 2] + ranges[this.index - 1])
			}
			if (maxVal <= downVal) {
				--this.index;
				this.seconds = ranges[this.index];
			}
		}
		if (this.lastSeconds == this.seconds) return;
		this.lastSeconds = this.seconds;
		this.termLeft.clear();
		this.termLeft.print("-" + this.seconds + " sec");
		this.termRight.clear();
		this.termRight.print("+" + this.seconds + " sec");
	}

	// Frames ( 60 HZ ) to MM : SS : FF
	#frameToTime = function(f) {
		let s = Math.floor(f / 60);
		f %= 60;
		let m = Math.floor(s / 60);
		s %= 60
		const padF = f.toString().padStart(2, "0");
		const padS = s.toString().padStart(2, "0");
		const padM = m.toString().padStart(2, "0");
		return padM + ":" + padS + ":" + padF;
	}

	// same size arr
	update(arr, tim) {
		this.termMiddle.clear();
		this.termMiddle.print(this.#frameToTime(tim));
		let maxVal = 0;
		for (let i = 0; i < this.num; ++i) {
			let val = arr[i];
			if (typeof val === 'number') {
				const absVal = Math.abs(val);
				if (absVal > maxVal) maxVal = absVal;
			}
		}
		this.#setSeconds(maxVal / 60);
		for (let i = 0; i < this.num; ++i) {
			const tre = this.trees[i];
			let val = arr[i];
			if (typeof val === 'number') {
				tre.mat.color = [1, 1, 1, 1];
			} else {
				val = 0;
				tre.mat.color = [1, 0, 0, 1];
			}
			tre.trans[0] = val * this.sep / (60 * this.seconds);
		}
	}
}

