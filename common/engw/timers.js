'use strict';

// timer class using setInterval
window.Timers = class Timers
{
	// public
	// frames per second
	static fpsavg = 0;
	static fpsactual = 0;
	// milli seconds
	static frametimewanted = 0; // from fpswanted
	static frametimeactual = 0; // from start of 1 frame to start of next frame
	static frametimeavg = 0;
	static frametime = 0; // seconds, used for time for the frame, animation etc.
	static proctimeactual = 0;
	static proctimeavg = 0;

	// private
	static #intervalId = null;
	static #curfps = 0;
	static #measureProcStart = 0; // internal for proc deltas
	static #rfs = false; // resetframestep

	static resetframestep = function() {
		Timers.#rfs = true;
	}
	static #avgsize = 1000;
	static #avgframeclass = new Runavg(Timers.#avgsize);
	static #avgprocclass = new Runavg(Timers.#avgsize);
	static #testrunavg = false;
	static #dotestrunavg = function() {
		var arunavg = new Runavg(5);
		const avgData = [7, 4, 9, 6, 3, 2, 1, 1, 5, 5, 5, 5, 5];
		for (const data of avgData) {
			const res = arunavg.add(data);
			console.log("run avg so far = " + res);
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
		if (window.performance && window.performance.now) {
			var measureProcEnd = performance.now();
			// resetframestep
			if (Timers.#rfs) {
				Timers.#measureProcStart = measureProcEnd;
				Timers.#rfs = false;
			}
			Timers.frametimeactual = measureProcEnd-Timers.#measureProcStart;
			Timers.#measureProcStart = measureProcEnd;
		} else {
			Timers.frametimeactual = Timers.frametimewanted;
		}
		Timers.frametimeavg = Timers.#avgframeclass.add(Timers.frametimeactual);
		Timers.fpsactual = 1000/Timers.frametimeactual
		Timers.fpsavg = 1000/Timers.frametimeavg;
		Timers.frametime = .001 * Timers.frametimeactual;
		if (forceInterval) Timers.#curfps = 0; // clear and set new interval
		if (fps != Timers.#curfps) {
			if (Timers.#intervalId) {
				window.clearInterval(Timers.#intervalId);
				Timers.#intervalId = null;
			}
			if (fps && fun) {
				const interval = Timers.frametimewanted;
				//console.log("setInterval to " + interval);
				Timers.#intervalId = setInterval(fun, interval);
			}
			Timers.#curfps = fps;
		}
	}
	
	// continue animation, setInterval doesn't need this since it's not a oneshot
	static refire = function(fun) {
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
