'use strict';

// running the simulation/game
var race_ingame = {}; // the 'race_ingame' state
//race_ingame.hidden = true; // can't be selected in the engine UI

race_ingame.text = "WebGL: race_ingame 3D drawing";
race_ingame.title = "race_ingame";

race_ingame.broadcastLag = 100; // milliseconds setTimeout, 0, 10, 100, 1000, 2000, 3000
race_ingame.doChecksum = true; // check all valid frames (race state)
race_ingame.fpswanted = 10;
race_ingame.maxCount = 25 * 60;//0;//30; // stop running when count >= maxCount, 0 run forever
race_ingame.gotoConsole = function() {
    changestate("race_console", "from INGAME");
}

race_ingame.setupCallbacks = function(socker) {
	// handle all events from SERVER
	socker.on('disconnect', function (reason) {
		race_ingame.terminal?.print("ingame disconnect reason '" + reason + "'");
		if (socker) {
			socker.disconnect();
			race_ingame.socker = socker = null; // one side effect
			changestate("race_console");
		}
	});

	// broadPack has members: name, id, data
	/*
	const broadPack = {
		id: id,
		roomIdx: wsocket.roomIdx,
		slotIdx: wsocket.slotIdx,
		name: wsocket.name,
		data: data
	}
	*/
	socker.on('broadcast', function(broadPack) {
		//console.log("got a broadcast from server = " + JSON.stringify(broadPack));
		const slot = broadPack.slotIdx;
		if (slot >= 0) {
			if (broadPack.data) {
				race_ingame.mvc.controlToModel(broadPack.data.frameNum, slot, broadPack.data.keyCode);
				const frameNum = broadPack.data.frameNum;
				race_ingame.pingTimes[slot] = race_ingame.count - frameNum; // my time
				if (race_ingame.doChecksum) {
					if (broadPack.data.checksum) {
						const checksum = broadPack.data.checksum;
						console.log("num checksum frames = " + checksum.length);
						for (let i = 0; i < checksum.length; ++i) {
							console.log("checksum from other player is S " + slot + ", checksum " + JSON.sortify(checksum[i]));
						}
						const oldLen = race_ingame.validFramesSlots[slot].length;
						race_ingame.validFramesSlots[slot] = race_ingame.validFramesSlots[slot].concat(checksum);
						const newLen = race_ingame.validFramesSlots[slot].length;
						// check frame numbers
						for (let i = oldLen; i < newLen; ++i) {
							if (i != race_ingame.validFramesSlots[slot][i].frameNum) {
								alert("on broadcast race_ingame.checksum[i].frameNum("
								    + race_ingame.validFramesSlots[slot][i].frameNum + ") != i " + i);
							}
						}
						race_ingame.validateFrames();
					}
				}
			} else {
				race_ingame.terminal?.print(
					"no broadPack data in ingame, is disconnect from other socket:  slotIdx = " + slot);
				race_ingame.mvc.controlToModel(null, slot, RaceModel.modelMakeKeyCode(true));
				race_ingame.pingTimes[slot] = undefined;
				race_ingame.discon[slot] = true;
			}
		} else {
			alert("BAD slot index = " + broadPack.slotIdx + " !!!");
		}
	});

	// message from server
	socker.on('message', function(str) {
		race_ingame.terminal?.print("MESSAGE FROM SERVER " + str);
	});
	// (most) everyone is in this race_ingame state, or some timed out
	socker.on('allReady', function(allReadyPack) {
		const str = "got ALL READY event:  " + JSON.stringify(allReadyPack, null, '   ');
		race_ingame.allready = true;
		race_ingame.terminal?.print(str);
		for (let slot of allReadyPack.absentSlots) {
			race_ingame.mvc.controlToModel(null, slot, RaceModel.modelMakeKeyCode(true)); // disconnected
			race_ingame.discon[slot] = true;
		}
	});
}

race_ingame.showValidFramesSlots = function() {
	//return;
	if (!race_ingame.validFramesSlots) return;
	console.log("VALID FRAME SLOTS");
	for (let i = 0; i < race_ingame.validFramesSlots.length; ++i) {
		const validFrames = race_ingame.validFramesSlots[i];
		console.log("SLOT " + i);
		for (let j = 0; j < validFrames.length; ++j) {
			console.log("index = " + j + ", frameNum = " + validFrames[j].frameNum);
		}
	}
}

race_ingame.validateFrames = function() {
	//race_ingame.validFrames = -1;
	//race_ingame.validFramesSlots
	const room = race_ingame.sockerInfo.room;
	const numSlots = room.slots.length;
	let watchDog = 600;
	if (numSlots == 1) {
		while(true) {
			if (race_ingame.validFrames >= race_ingame.validFramesSlots[0].length) {
				break;
			}
			// check something
			if (race_ingame.validFrames != race_ingame.validFramesSlots[0][race_ingame.validFrames].frameNum) {
				console.error("VF error " + race_ingame.validFrames);
			} else {
				console.log("VF good " + race_ingame.validFrames);
			}
			++race_ingame.validFrames;
			--watchDog;
			if (watchDog <= 0) {
				console.error("watchdog hit");
				break;
			}
		}
	} else if (numSlots == 2) {
		while(true) {
			if (!race_ingame.discon[0] && race_ingame.validFrames >= race_ingame.validFramesSlots[0].length) {
				break;
			}
			if (!race_ingame.discon[1] && race_ingame.validFrames >= race_ingame.validFramesSlots[1].length) {
				break;
			}
			// check something
			if (!race_ingame.discon[0]) {
				if (race_ingame.validFrames != race_ingame.validFramesSlots[0][race_ingame.validFrames].frameNum) {
					console.error("VF[0] error " + race_ingame.validFrames);
				} else {
					console.log("VF[0] good " + race_ingame.validFrames);
				}
			}
			if (!race_ingame.discon[1]) {
				if (race_ingame.validFrames != race_ingame.validFramesSlots[1][race_ingame.validFrames].frameNum) {
					console.error("VF[1] error " + race_ingame.validFrames);
				} else {
					console.log("VF[1] good " + race_ingame.validFrames);
				}
			}
			if (!race_ingame.discon[0] && !race_ingame.discon[1]) {
				const isEq = equalsObj(race_ingame.validFramesSlots[0][race_ingame.validFrames].model
					, race_ingame.validFramesSlots[1][race_ingame.validFrames].model);
				if (isEq) {
					console.log("VF[0] VF[1] good " + race_ingame.validFrames);
				} else {
					console.error("VF[0] VF[1] error " + race_ingame.validFrames);
				}
			}
			++race_ingame.validFrames;
			--watchDog;
			if (watchDog <= 0) {
				console.error("watchdog hit");
				break;
			}
		}
	}
	const str = "Valid Frm = " + race_ingame.validFrames;
	//console.log(str);
	race_ingame.termValid.print(str);
}

// show ping times with a graph
class Indicator {
	// array of values to display left to right
	constructor(roottree, num, mySlot) {
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
		termParams.offx += this.sep - 80 - 20;
		termParams.scale = 6;
		termParams.cols = 9;
		this.termMiddle = new Terminal(roottree, [.1, 0, 0, 1], null, termParams);
		termParams.offx += this.sep - 60 + 80;
		termParams.scale = 2;
		termParams.cols = 10;
		this.termRight = new Terminal(roottree, [.1, 0, 0, 1], null, termParams);
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

/*
sockerinfo........
	id: wsocket.id,
	name: wsocket.name,
	mode: wsocket.mode,
	roomIdx: wsocket.roomIdx,
	slotIdx: wsocket.slotIdx,
	room: null
*/

// load these before init
race_ingame.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	//preloadtime(3000); // show loading screen for minimum time
}

race_ingame.init = function(sockInfo) { // network state tranfered from race_sentgo
	logger("entering webgl race_ingame\n");
	race_ingame.count = 0; // counter for this state
	race_ingame.allready = false;
	race_ingame.doDump = true;

	// ui
	setbutsname('ingame');
	race_lobby.fillButton = makeabut("console", race_ingame.gotoConsole);

	race_ingame.roottree = new Tree2("race_ingame root tree");
	race_ingame.terminal = new Terminal(race_ingame.roottree, [.2, .2, .1, 1]);

    // build 3D scene
	race_ingame.treeMaster = buildprism("aprism", [.5, .5, .5], "panel.jpg", "texc");
	race_ingame.treeMaster.mat.color = [.75, .75, .75, 1];
	race_ingame.checksum = [];

	// do network stuff
	race_ingame.playerTrees = [];
	if (sockInfo && sockInfo.sock) {
		race_ingame.socker = sockInfo.sock; // actual socket.io
		race_ingame.sockerInfo = sockInfo.info;
		race_ingame.mySlot = race_ingame.sockerInfo.slotIdx;
		race_ingame.setupCallbacks(race_ingame.socker);
		if (testDisconnect == 5) {
			if (race_ingame.sockerInfo.id == testId) {
				race_ingame.socker.disconnect();
			}
		}
		// show myself and other info from 'intent'
		race_ingame.terminal.print("INGAME\n\n"
			+ "sockerinfo = " + JSON.stringify(race_ingame.sockerInfo)
			+ "\nrace_ingame count = " + race_ingame.count);

		// TEST
		const killaSock = false;
		if (killaSock) {
			if (race_ingame.sockerInfo.id == testId) { // test disconnect a socket
				const waitABit = false;
				if (waitABit) {
					// wait a bit before disconnect
					const waitSec = 3 + (3 - race_ingame.sockerInfo.id) * 1;
					setTimeout(() => {
						race_ingame.terminal?.print("disconnect after " + waitSec + " seconds");
						race_ingame.socker.disconnect();
					}, 1000 * waitSec);
				} else { // disconnect right away
					race_ingame.terminal.print("disconnect right away");
					race_ingame.socker.disconnect();
				}
			}
		}

		// TEST
		// otherwise don't send ready when testNotReady == 3 and testID == race_ingame.sockerInfo.id
		if (testId == race_ingame.sockerInfo.id) {
			if (testNotReady == 4) { // wait a bit before saying I'm ready
				const waitSec = 13;
				setTimeout(() => {
					race_ingame.terminal?.print("say ready after " + waitSec + " seconds");
					race_ingame.socker.emit('ready');
				}, 1000 * waitSec);
			} else if (testNotReady != 3) {
				race_ingame.terminal.print("say ready right away NOT testNotReady == 3");
				race_ingame.socker.emit('ready');
			}
		} else {
			race_ingame.terminal.print("say ready right away NOT testId == " + testId);
			race_ingame.socker.emit('ready');
		}

		const room = race_ingame.sockerInfo.room;
		race_ingame.pingTimes = Array(room.slots.length);
		race_ingame.discon = Array(room.slots.length);
		race_ingame.showPings = new Indicator(race_ingame.roottree, room.slots.length, race_ingame.mySlot);

		race_ingame.negPingTree = buildplanexy("anegping",.5,.5,null,"flat");
		race_ingame.negPingTree.trans = [-7, 9.15, 10];
        race_ingame.negPingTree.mod.flags |= modelflagenums.NOZBUFFER;
		race_ingame.negPingTree.mod.mat.color = [0,0,0,1];
		race_ingame.roottree.linkchild(race_ingame.negPingTree);

	    // build 3D scene
		for (let s = 0; s < room.slots.length; ++s) {
			const playerTree = race_ingame.treeMaster.newdup();
			playerTree.scale = [.3, .3, .3];
			if (race_ingame.mySlot == s) playerTree.mat.color = [1, 1, 1, 1]; // brighter color for self
			race_ingame.playerTrees[s] = playerTree;
			race_ingame.roottree.linkchild(playerTree);
		}
		race_ingame.mvc = new RaceModel(room.slots.length, race_ingame.playerTrees, race_ingame.doChecksum);
		// frame 0 will be valid
		race_ingame.checksum = race_ingame.mvc.modelToView(race_ingame.count);
		if (race_ingame.doChecksum) {
			race_ingame.validFramesSlots = Array(room.slots.length);
			for (let i = 0; i < race_ingame.validFramesSlots.length; ++i) {
				// clone frame 0 to all slots
				race_ingame.validFramesSlots[i] = clone(race_ingame.checksum);
			}
			race_ingame.terminal.print("done INGAME init with sockInfo, id = "
				+ race_ingame.sockerInfo.id + " slot = " + race_ingame.sockerInfo.slotIdx);
		}
		const termParams = {
			cols: 16,
			rows: 1,
			offx: 40,
			offy: 60,
			scale: 2
		};
		race_ingame.termValid = new Terminal(race_ingame.roottree, [.1, 0, 0, 1], null, termParams);
		race_ingame.termValid.print("VALID FRAMES");
		race_ingame.validFrames = 0;
	}

	// the 3D viewport
	mainvp = defaultviewport();
	mainvp.clearcolor = [.5,.5,1,1];
	fpswanted = race_ingame.fpswanted;
	const staggerFPSWanted = true;
	const staggerDiff = 4;
	if (race_ingame.sockerInfo && staggerFPSWanted) {
		fpswanted += race_ingame.sockerInfo?.id * staggerDiff;
	}

	// UI debprint menu
	debprint.addlist("ingame test variables",[
		"fpswanted",
		"fpsavg",
	]);
};

race_ingame.onresize = function() {
	console.log("onresize");
	race_ingame.terminal.onresize();
}

race_ingame.proc = function() {
	// proc
	if (race_ingame.allready) {
		// do something after N seconds
		const numSeconds = 4;
		if (race_ingame.count == numSeconds * fpswanted) {
			if (testDisconnect == 6) {
				if (race_ingame.sockerInfo.id == testId) {
					race_ingame.socker.disconnect();
				}
			}
		}
		race_ingame.pingTimes[race_ingame.mySlot] = 0; // my time
		race_ingame.showPings.update(race_ingame.pingTimes, race_ingame.count);
		// if any neg pings, speed up to catch up
		const testCatchup = false;
		let catchup = false;
		const slack = 0;
		if (testCatchup) {
			// test neg ping times
			const negId = 1;
			const negTime = 30;
			const negPings = Array(race_ingame.pingTimes.length).fill(-negTime);
			negPings[negId] = negTime - slack;
			for (let i = 0; i < race_ingame.pingTimes.length; ++i) {
				if (i != race_ingame.mySlot && race_ingame.pingTimes[i] < negPings[i]) {
					catchup = true;
					break;
				}
			}
		} else {
			// normal catchup
			for (let i = 0; i < race_ingame.pingTimes.length; ++i) {
				if (race_ingame.pingTimes[i] < -slack) {
					catchup = true;
					break;
				}
			}
		}
		// TEST disable catchup if uncommented
		// catchup = false; // no catchup

		race_ingame.negPingTree.mod.mat.color;
		if (catchup) {
			race_ingame.negPingTree.mod.mat.color = [1,0,0,1];
		}
		// drift catchup color
		race_ingame.negPingTree.mod.mat.color[0] *=  .75;

		// get some input
		let keyCode = RaceModel.modelMakeKeyCode();
		const testKeyCodeAuto = false; // auto move some players
		const testKeyCodeAutoSlot = 0;
		if (testKeyCodeAuto) {
			if (race_ingame.mySlot == testKeyCodeAutoSlot) {
				keyCode |= RaceModel.keyCodes.RIGHT;
			}
		}
		// process input
		let loopCount = catchup ? 2 : 1;
		for (let loop = 0; loop < loopCount; ++loop) {
			if (race_ingame.maxCount && race_ingame.count >= race_ingame.maxCount) {
				if (race_ingame.doDump) {
					race_ingame.doDump = false;
					race_ingame.showValidFramesSlots();
				}
				continue;
			}
			race_ingame.mvc.controlToModel(race_ingame.count, race_ingame.mySlot, keyCode);
			const count = race_ingame.count;
			// TEST checksum breakage
			const breakChecksum = false;
			if (breakChecksum) {
				if (count == 60 && race_ingame.mySlot == 1) {
					keyCode = RaceModel.keyCodes.LEFT;
				}
			}
			const checksum = race_ingame.checksum;
			if (race_ingame.broadcastLag) {
				setTimeout(function() {
					if (race_ingame.doChecksum && loop == 0) {
						console.log(" -- LAG -- " + race_ingame.broadcastLag + "ms ---,   broadcast valid frame = " + count);
						console.log("   WITH checksum = " + JSON.sortify(checksum));
							race_ingame.socker?.emit('broadcast', {
							frameNum: count, 
							keyCode: keyCode, 
							checksum: checksum
						});
					} else {
						race_ingame.socker?.emit('broadcast', {
							frameNum: count,
							keyCode: keyCode
						});
					}
				}, race_ingame.broadcastLag);
			} else {
				if (race_ingame.doChecksum && loop == 0) {
					console.log("broadcast valid frame = " + count);
					console.log("   WITH checksum = " + JSON.sortify(race_ingame.checksum));
					race_ingame.socker?.emit('broadcast', {
						frameNum: count,
						keyCode: keyCode,
						checksum: checksum
					});
				} else {
					race_ingame.socker?.emit('broadcast', {
						frameNum: count,
						keyCode: keyCode
					});
				}
			}
			race_ingame.checksum = [];
			++race_ingame.count;
		}
	}
	race_ingame.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	// draw
	beginscene(mainvp);
	if (race_ingame.mvc) {
		race_ingame.checksum = race_ingame.mvc.modelToView(race_ingame.count);
		if (race_ingame.doChecksum) {
			const oldLen = race_ingame.validFramesSlots[race_ingame.mySlot].length;
			race_ingame.validFramesSlots[race_ingame.mySlot] = race_ingame.validFramesSlots[race_ingame.mySlot].concat(race_ingame.checksum);
			const newLen = race_ingame.validFramesSlots[race_ingame.mySlot].length;
			// check frame numbers
			for (let i = oldLen; i < newLen; ++i) {
				if (i != race_ingame.validFramesSlots[race_ingame.mySlot][i].frameNum) {
					alert("race_ingame.checksum[i].frameNum != i");
				}
			}
			race_ingame.validateFrames();
		}
	}
	race_ingame.roottree.draw();
};

race_ingame.onresize = function() {
	console.log("onresize");
	race_ingame.terminal.onresize();
}

race_ingame.exit = function() {
	if (race_ingame.socker) {
		race_ingame.socker.disconnect();
		race_ingame.socker = null;
		race_ingame.sockInfo = null;
	}
	// show current usage before cleanup
	race_ingame.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_ingame.roottree.glfree();
	race_ingame.treeMaster.glfree();
	race_ingame.terminal = null;
	
	// show usage after cleanup
	logrc();
	race_ingame.roottree = null;
	clearbuts('ingame');
	logger("exiting webgl race_ingame\n");
	mainvp.camattach = null;
	mainvp.incamattach = false;
	mainvp.lookat = null;
	mainvp.inlookat = false;
	debprint.removelist("ingame test variables");
};
