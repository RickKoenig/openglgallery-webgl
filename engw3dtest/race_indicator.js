'use strict';

// show ping times with a graph
class Indicator {
	// array of values to display left to right
	constructor(roottree, num, mySlot) {
		//num = 4;
		const show = true;
		// assume 60 FPS
		this.seconds = 1;
		this.lastSeconds = -1;
		this.index = 0; // index into scaling ranges
		this.sep = 1.2;
		//const depth = glc.clientHeight / 2;
        let offy = .55;
		const stepy = .1;
        //offy += depth;
		this.num = num;
		// alignment lines
		const lin = buildplanexy("alin",1,1,null,"flat");
		if (!show) {
			lin.flags |= treeflagenums.DONTDRAWC;
		}
		lin.mod.mat.color = [0, 1, 0, 1];
        lin.mod.flags |= modelflagenums.NOZBUFFER;
		lin.trans = [0, offy + (1 - num) * stepy * .5, 1];
		lin.scale = [.005, this.num * stepy * .5, 1];
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
		dot.scale = [.0125, .0125, 1];
		this.trees = Array(this.num);
		for (let i = 0; i < this.num; ++i) {
			const tre = dot.newdup();
			if (i == mySlot) {
				tre.scale = [.02, .02, 1];
			}
			tre.trans = [0, offy, 1];
			offy -= stepy;
			roottree.linkchild(tre);
			this.trees[i] = tre;
		}
		dot.glfree();

		// labels
		const termParamsL = {
			cols: 8,
			rows: 1,
			scale: 1 / 16,
			offx: -1.05,
			offy: .7,
			centerx: true
		};
		const termParamsM = {
			cols: 8,
			rows: 1,
			scale: 1 / 10,
			offy: .925,
			centerx: true
		};
		const termParamsR = {
			cols: 8,
			rows: 1,
			scale: 1 / 16,
			offx: 1.05,
			offy: .7,
			centerx: true
		};
		this.termLeft = new Terminal(roottree, null, termParamsL);
		this.termLeft.doShow(show);

		this.termMiddle = new Terminal(roottree, null, termParamsM);
		this.termMiddle.doShow(show);

		this.termRight = new Terminal(roottree, null, termParamsR);
		this.termRight.doShow(show);
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

