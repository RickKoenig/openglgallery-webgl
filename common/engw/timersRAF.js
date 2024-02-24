'use strict';

// timer class using requestAnimationFrame
window.Timers = class Timers
{
	// public
	// frames per second
	static fpsavg = 0;
	static fpsactual = 0;
	static fpsrefreshactual = 0;
	// milli seconds
	static frametimewanted = 0; // from fpswanted
	static frametimeactual = 0; // from start of 1 frame to start of next frame
	static frametimeavg = 0;
	static frametime = 0; // seconds, used for time for the frame, animation etc.
	static proctimeactual = 0;
	static proctimeavg = 0;

	// private
	static #rafId = null;
	static #measureProcStart = 0; // internal for proc deltas
	static #fun = null;
	static #curfpswanted = 0;

	static #avgsize = 1000;
	static #avgframeclass = new Runavg(Timers.#avgsize);
	static #avgprocclass = new Runavg(Timers.#avgsize);
	static #avgrefreshclass = new Runavg(4);
	static #testrunavg = false;
	static #funcnt = 0;
	static #lasttimestamp = null;
	
	static resetframestep = function() {
	}
	
	static #dotestrunavg = function() {
		var arunavg = new Runavg(5);
		const avgData = [7, 4, 9, 6, 3, 2, 1, 1, 5, 5, 5, 5, 5];
		for (const data of avgData) {
			const res = arunavg.add(data);
			console.log("run avg so far = " + res);
		}
	}
	
	static #RAFfun = function(timestamp) {
		if (Timers.#fun) {
			// measure screen refresh rate
			Timers.#rafId = requestAnimationFrame(Timers.#RAFfun);
			if (Timers.#lasttimestamp !== null) {
				let diff = timestamp - Timers.#lasttimestamp;
				if (diff <= 0) diff = 1;
				//console.log("diff timestamp = " + diff);
				Timers.fpsrefreshactual = Math.round(Timers.#avgrefreshclass.add(Math.round(1000 / diff)));
			}
			Timers.#lasttimestamp = timestamp;
			// call fun depending on fpswanted
			//console.log("funcnt = " + Timers.#funcnt);
			Timers.#funcnt -= Timers.#curfpswanted;
			while (Timers.#funcnt < 0) {
				Timers.#fun();
				Timers.#funcnt += Timers.fpsrefreshactual;
				if (Timers.fpsrefreshactual == 0) break; // don't have refresh rate yet
			}
		} else {
			cancelAnimationFrame(Timers.#rafId);
			Timers.#rafId = null;
		}
	}

	// called at start of mainproc
	static setframerate = function(fun, fps, forceInterval) {
		if (fps == 0)
			fps = 1000;
		if (Timers.#testrunavg) {
			Timers.#dotestrunavg();
			Timers.#testrunavg = false;
		}
		if (fps > 1000)
			fps = 1000;
		if (fps > 0)
			Timers.frametimewanted = 1000/fps;
		else
			Timers.frametimewanted = 0;
		Timers.#curfpswanted = fps;
		if (window.performance && window.performance.now) {
			var measureProcEnd = performance.now();
			Timers.frametimeactual = measureProcEnd-Timers.#measureProcStart;
			Timers.#measureProcStart = measureProcEnd;
		} else {
			Timers.frametimeactual = Timers.frametimewanted;
		}
		Timers.frametimeavg = Timers.#avgframeclass.add(Timers.frametimeactual);
		Timers.fpsactual = 1000/Timers.frametimeactual
		Timers.fpsavg = 1000/Timers.frametimeavg;
		Timers.frametime = .001 * Timers.frametimeactual;
		// start RAF
		if (!Timers.#fun && fun) {
			Timers.#fun = fun;
			Timers.#RAFfun(null);
		}
		Timers.#fun = fun;
	}

	// called at end of mainproc
	static measureproctime = function() {
		if (window.performance && window.performance.now) {
			var msendproctime = performance.now();
			Timers.proctimeactual = msendproctime - Timers.#measureProcStart;
			Timers.proctimeavg = Timers.#avgprocclass.add(Timers.proctimeactual);
		}
	}
}
