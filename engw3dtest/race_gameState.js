'use strict';

// running the simulation/game
var race_gameState = {}; // the 'race_gameState' state
//race_gameState.hidden = true; // can't be selected in the engine UI

race_gameState.text = "WebGL: race_gameState 3D drawing";
race_gameState.title = "race_gameState";

race_gameState.broadcastLag = 1000; // milliseconds setTimeout, 0, 10, 100, 1000, 2000, 3000
race_gameState.doChecksum = true; // check all valid frames (race state)
race_gameState.verbose = true;
race_gameState.fpswanted = 10;

race_gameState.maxFrames = 0;

race_gameState.gotoConsole = function() {
    changestate("race_console", "from INGAME");
}

race_gameState.setupCallbacks = function(socker) {
	// handle all events from SERVER
	socker.on('disconnect', function (reason) {
		race_gameState.terminal?.print("ingame disconnect reason '" + reason + "'");
		if (socker) {
			socker.disconnect();
			race_gameState.socker = socker = null; // one side effect
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
				race_gameState.mvc.controlToModel(broadPack.data.frameNum, slot, broadPack.data.keyCode);
				const frameNum = broadPack.data.frameNum;
				race_gameState.pingTimes[slot] = race_gameState.count - frameNum; // my time
				if (race_gameState.doChecksum) {
					if (broadPack.data.checksum) {
						const checksum = broadPack.data.checksum;
						if (race_gameState.verbose) {
							console.log("num checksum frames = " + checksum.length);
							for (let i = 0; i < checksum.length; ++i) {
								console.log("checksum from other player is S " + slot + ", checksum " + JSON.sortify(checksum[i]));
							}
						}
						const oldLen = race_gameState.validFramesSlots[slot].length;
						race_gameState.validFramesSlots[slot] = race_gameState.validFramesSlots[slot].concat(checksum);
						const newLen = race_gameState.validFramesSlots[slot].length;
						// check frame numbers
						for (let i = oldLen; i < newLen; ++i) {
							const oi = i + race_gameState.validOffset;
							if (oi != race_gameState.validFramesSlots[slot][i].frameNum) {
								alertS("EEE, on broadcast race_gameState.checksum[i].frameNum("
								    + race_gameState.validFramesSlots[slot][i].frameNum + ") != i " + i);
							}
						}
						race_gameState.validateFrames();
					}
				}
			} else {
				race_gameState.terminal.print?.(
					"no broadPack data in ingame, is disconnect from other socket:  slotIdx = " + slot);
				race_gameState.mvc.controlToModel(null, slot, race_gameState.gameClass.modelMakeKeyCode(true));
				race_gameState.pingTimes[slot] = undefined;
				race_gameState.discon[slot] = true;
			}
		} else {
			alertS("BAD slot index = " + broadPack.slotIdx + " !!!");
		}
	});

	// message from server
	socker.on('message', function(str) {
		race_gameState.terminal?.print("MESSAGE FROM SERVER " + str);
	});
	// (most) everyone is in this race_gameState state, or some timed out
	socker.on('allReady', function(allReadyPack) {
		const str = "got ALL READY event:  " + JSON.stringify(allReadyPack, null, '   ');
		race_gameState.allready = true;
		race_gameState.terminal?.print(str);
		for (let slot of allReadyPack.absentSlots) {
			race_gameState.mvc.controlToModel(null, slot, race_gameState.gameClass.modelMakeKeyCode(true)); // disconnected
			race_gameState.discon[slot] = true;
		}
	});
}

// check all new validFrames from all players
race_gameState.validateFrames = function() {
	const room = race_gameState.sockerInfo.room;
	const numSlots = room.slots.length;
	let watchDog = 6000;
	while(true) {
		let doBreak = false;
		const vf = race_gameState.validFrames - race_gameState.validOffset;
		for (let i = 0; i < numSlots; ++i) {
			if (!race_gameState.discon[i] && vf >= race_gameState.validFramesSlots[i].length) {
				doBreak = true; // nothing new yet
				break;
			}
		}
		if (doBreak) {
			break; // not all players have a new validFrame yet, maybe later
		}
		// check everything
		// first, frameNum matches index
		for (let i = 0; i < numSlots; ++i) {
			if (race_gameState.discon[i]) {
				continue;
			}
			if (race_gameState.validFrames != race_gameState.validFramesSlots[i][vf].frameNum) {
				alertS("CCC, bad checksum frame: VF[" + i + "] error " + race_gameState.validFrames);
			} else {
				if (race_gameState.verbose) console.log("VF[" + i + "] good " + race_gameState.validFrames);
			}
		}
		// second, checksum all players
		for (let i = 0; i < numSlots; ++i) {
			if (race_gameState.discon[i]) {
				continue;
			}
			for (let j = i + 1; j < numSlots; ++j) {
				if (race_gameState.discon[j]) {
					continue;
				}
				const isEq = equalsObj(race_gameState.validFramesSlots[i][vf].model
						, race_gameState.validFramesSlots[j][vf].model);
					if (isEq) {
						if (race_gameState.verbose) console.log("VF[" + i + "] VF[" + j + "] good " + race_gameState.validFrames);
					} else {
						alertS("DDD, bad checksum: VF[" + i + "] VF[" + j + "] error " + race_gameState.validFrames);
					}
				}
			}
			++race_gameState.validFrames;
			let trimValid = true; // if false, keep a paper trail of all gamestates
			if (trimValid) {
				// shift out old data, save memory
				for (let i = 0; i < numSlots; ++i) {
					race_gameState.validFramesSlots[i].shift();
				}
				++race_gameState.validOffset;
			}
			--watchDog;
			if (watchDog <= 0) {
				alertS("watchdog hit");
				break;
			}
		}
	const str = "Valid Frm = " + race_gameState.validFrames;
	race_gameState.termValid.print?.(str);
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
race_gameState.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	//preloadtime(3000); // show loading screen for minimum time
}

race_gameState.init = function(sockInfo) { // network state tranfered from race_sentgo
	logger("entering webgl race_gameState with game '" + sockInfo?.game + "'\n");
	race_gameState.count = 0; // counter for this state
	race_gameState.allready = false;
	race_gameState.gameType = sockInfo?.game;

	// ui
	setbutsname('ingame');
	race_lobby.fillButton = makeabut("console", race_gameState.gotoConsole);

	race_gameState.roottree = new Tree2("race_gameState root tree");
	race_gameState.terminal = new Terminal(race_gameState.roottree, [.2, .2, .1, 1]);

    // build 3D scene
	//race_gameState.treeMaster = buildprism("aprism", [.5, .5, .5], "panel.jpg", "texc");
	//race_gameState.treeMaster.mat.color = [.75, .75, .75, 1];
	race_gameState.checksum = [];

	// do network stuff
	//race_gameState.playerTrees = [];
	if (sockInfo && sockInfo.sock) {

		const gameClassStr = "Game" + race_gameState.gameType.toUpperCase();
		console.log("game class string = " + gameClassStr);
		race_gameState.gameClass = window[gameClassStr];

		race_gameState.socker = sockInfo.sock; // actual socket.io
		race_gameState.sockerInfo = sockInfo.info;
		race_gameState.mySlot = race_gameState.sockerInfo.slotIdx;
		race_gameState.setupCallbacks(race_gameState.socker);
		if (testDisconnect == 5) {
			if (race_gameState.sockerInfo.id == testId) {
				race_gameState.socker.disconnect();
			}
		}
		// show myself and other info from 'intent'
		race_gameState.terminal.print("INGAME\n\n"
			+ "sockerinfo = " + JSON.stringify(race_gameState.sockerInfo)
			+ "\ngame = " + sockInfo.game
			+ "\nrace_gameState count = " + race_gameState.count);

		// TEST
		const killaSock = false;
		if (killaSock) {
			if (race_gameState.sockerInfo.id == testId) { // test disconnect a socket
				const waitABit = false;
				if (waitABit) {
					// wait a bit before disconnect
					const waitSec = 3 + (3 - race_gameState.sockerInfo.id) * 1;
					setTimeout(() => {
						race_gameState.terminal?.print("disconnect after " + waitSec + " seconds");
						race_gameState.socker.disconnect();
					}, 1000 * waitSec);
				} else { // disconnect right away
					race_gameState.terminal.print("disconnect right away");
					race_gameState.socker.disconnect();
				}
			}
		}

		// TEST
		// otherwise don't send ready when testNotReady == 3 and testID == race_gameState.sockerInfo.id
		if (testId == race_gameState.sockerInfo.id) {
			if (testNotReady == 4) { // wait a bit before saying I'm ready
				const waitSec = 13;
				setTimeout(() => {
					race_gameState.terminal?.print("say ready after " + waitSec + " seconds");
					race_gameState.socker.emit('ready');
				}, 1000 * waitSec);
			} else if (testNotReady != 3) {
				race_gameState.terminal.print("say ready right away NOT testNotReady == 3");
				race_gameState.socker.emit('ready');
			}
		} else {
			race_gameState.terminal.print("say ready right away NOT testId == " + testId);
			race_gameState.socker.emit('ready');
		}

		const room = race_gameState.sockerInfo.room;
		race_gameState.pingTimes = Array(room.slots.length);
		race_gameState.discon = Array(room.slots.length);
		race_gameState.showPings = new Indicator(race_gameState.roottree, room.slots.length, race_gameState.mySlot);

		race_gameState.negPingTree = buildplanexy("anegping",.5,.5,null,"flat");
		race_gameState.negPingTree.trans = [-7, 9.15, 10];
        race_gameState.negPingTree.mod.flags |= modelflagenums.NOZBUFFER;
		race_gameState.negPingTree.mod.mat.color = [0,0,0,1];
		race_gameState.roottree.linkchild(race_gameState.negPingTree);

		/*
	    // build 3D scene
		for (let s = 0; s < room.slots.length; ++s) {
			const playerTree = race_gameState.treeMaster.newdup();
			playerTree.scale = [.3, .3, .3];
			if (race_gameState.mySlot == s) playerTree.mat.color = [1, 1, 1, 1]; // brighter color for self
			race_gameState.playerTrees[s] = playerTree;
			race_gameState.roottree.linkchild(playerTree);
		}*/
	
		race_gameState.mvc = new GameWarp(room.slots.length
			, race_gameState.mySlot, race_gameState.gameClass
			, race_gameState.roottree
			, race_gameState.doChecksum);
		// frame 0 will be valid
		race_gameState.checksum = race_gameState.mvc.modelToView(race_gameState.count);
		if (race_gameState.doChecksum) {
			race_gameState.validFramesSlots = Array(room.slots.length);
			for (let i = 0; i < race_gameState.validFramesSlots.length; ++i) {
				// clone frame 0 to all slots
				race_gameState.validFramesSlots[i] = clone(race_gameState.checksum);
			}
			race_gameState.terminal.print("done INGAME init with sockInfo, id = "
				+ race_gameState.sockerInfo.id + " slot = " + race_gameState.sockerInfo.slotIdx);
		}
		const termParams = {
			cols: 16,
			rows: 1,
			offx: 40,
			offy: 60,
			scale: 2
		};
		if (race_gameState.doChecksum) {
			race_gameState.termValid = new Terminal(race_gameState.roottree, [.1, 0, 0, 1], null, termParams);
			race_gameState.termValid.print("VALID FRAMES");
		}
		race_gameState.validFrames = 0;
		race_gameState.validOffset = 0; // shift race_gameState.discon, to save memory
	}

	// the 3D viewport
	mainvp = defaultviewport();
	mainvp.clearcolor = [.125, .125, .125, 1];
	if (race_gameState.gameType == 'a') {
		mainvp.clearcolor = [.85 ,.15, .1, 1];
	}
	if (race_gameState.gameType == 'b') {
		mainvp.clearcolor = [.15, .85, .1, 1];
	}
	fpswanted = race_gameState.fpswanted;
	// run players at different framerates, test catchup logic
	const staggerFPSWanted = false;
	const staggerDiff = 2;
	if (race_gameState.sockerInfo && staggerFPSWanted) {
		fpswanted += race_gameState.sockerInfo?.id * staggerDiff;
		//if (race_gameState.sockerInfo?.id == 1) fpswanted = 1;
	}

	// UI debprint menu
	debprint.addlist("ingame test variables",[
		"fpswanted",
		"fpsavg",
	]);
};

race_gameState.onresize = function() {
	console.log("onresize");
	race_gameState.terminal.onresize();
}

race_gameState.proc = function() {
	// proc
	// proc
	if (race_gameState.maxFrames && race_gameState.maxFrames <= race_gameState.count) {
		return;
	}
	if (race_gameState.allready) {
		// do something after N seconds
		const numSeconds = 4;
		if (race_gameState.count == numSeconds * fpswanted) {
			if (testDisconnect == 6) {
				if (race_gameState.sockerInfo.id == testId) {
					race_gameState.socker.disconnect();
				}
			}
		}
		race_gameState.pingTimes[race_gameState.mySlot] = 0; // my time
		race_gameState.showPings.update(race_gameState.pingTimes, race_gameState.count);
		// if any neg pings, speed up to catch up
		const testCatchup = false;
		let catchup = false;
		const slack = 0;
		if (testCatchup) {
			// test neg ping times
			const negId = 1;
			const negTime = 30;
			const negPings = Array(race_gameState.pingTimes.length).fill(-negTime);
			negPings[negId] = negTime - slack;
			for (let i = 0; i < race_gameState.pingTimes.length; ++i) {
				if (i != race_gameState.mySlot && race_gameState.pingTimes[i] < negPings[i]) {
					catchup = true;
					break;
				}
			}
		} else {
			// normal catchup
			for (let i = 0; i < race_gameState.pingTimes.length; ++i) {
				if (race_gameState.pingTimes[i] < -slack) {
					catchup = true;
					break;
				}
			}
		}
		// TEST disable catchup if uncommented
		// catchup = false; // no catchup
		race_gameState.negPingTree.mod.mat.color;
		if (catchup) {
			race_gameState.negPingTree.mod.mat.color = [1,0,0,1];
		}
		// drift catchup color
		race_gameState.negPingTree.mod.mat.color[0] *=  .75;

		// get some input
		let keyCode = race_gameState.gameClass.modelMakeKeyCode();
		const testKeyCodeAuto = false; // auto move some players
		const testKeyCodeAutoSlot = 0;
		if (testKeyCodeAuto) {
			if (race_gameState.mySlot == testKeyCodeAutoSlot) {
				keyCode |= race_gameState.gameClass.keyCodes.RIGHT;
			}
		}
		// process input
		let loopCount = catchup ? 2 : 1;
		for (let loop = 0; loop < loopCount; ++loop) {
			let myKeyCode = keyCode;
			const breakChecksum = false;
			const count = race_gameState.count;
			if (breakChecksum) {
				// TEST checksum breakage
				if (count == 60 && race_gameState.mySlot == 1) {
					myKeyCode = race_gameState.gameClass.keyCodes.LEFT;
				}
			}
			race_gameState.mvc.controlToModel(race_gameState.count, race_gameState.mySlot, myKeyCode);
			const checksum = race_gameState.checksum;
			if (race_gameState.broadcastLag) {
				setTimeout(function() {
					if (race_gameState.doChecksum && loop == 0) {
						if (race_gameState.verbose) {
							console.log(" -- LAG -- " + race_gameState.broadcastLag + "ms ---,   broadcast valid frame = " + count);
							console.log("   WITH checksum = " + JSON.sortify(checksum));
						}
						race_gameState.socker?.emit('broadcast', {
							frameNum: count, 
							keyCode: keyCode, 
							checksum: checksum
						});
					} else {
						race_gameState.socker?.emit('broadcast', {
							frameNum: count,
							keyCode: keyCode
						});
					}
				}, race_gameState.broadcastLag);
			} else {
				if (race_gameState.doChecksum && loop == 0) {
					if (race_gameState.verbose) {
						console.log("broadcast valid frame = " + count);
						console.log("   WITH checksum = " + JSON.sortify(race_gameState.checksum));
					}
					race_gameState.socker?.emit('broadcast', {
						frameNum: count,
						keyCode: keyCode,
						checksum: checksum
					});
				} else {
					race_gameState.socker?.emit('broadcast', {
						frameNum: count,
						keyCode: keyCode
					});
				}
			}
			race_gameState.checksum = [];
			++race_gameState.count;
		}
	}
	race_gameState.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	// draw
	beginscene(mainvp);
	if (race_gameState.mvc) {
		race_gameState.checksum = race_gameState.mvc.modelToView(race_gameState.count);
		if (race_gameState.doChecksum) {
			const oldLen = race_gameState.validFramesSlots[race_gameState.mySlot].length;
			race_gameState.validFramesSlots[race_gameState.mySlot] = race_gameState.validFramesSlots[race_gameState.mySlot].concat(race_gameState.checksum);
			const newLen = race_gameState.validFramesSlots[race_gameState.mySlot].length;
			// check frame numbers
			for (let i = oldLen; i < newLen; ++i) {
				const oi = i + race_gameState.validOffset;
				if (oi != race_gameState.validFramesSlots[race_gameState.mySlot][i].frameNum) {
					alertS("BBB, race_gameState.checksum[i].frameNum != i");
				}
			}
			race_gameState.validateFrames();
		}
	}
	race_gameState.roottree.draw();
};

race_gameState.onresize = function() {
	console.log("onresize");
	race_gameState.terminal.onresize();
}

race_gameState.exit = function() {
	if (race_gameState.socker) {
		race_gameState.socker.disconnect();
		race_gameState.socker = null;
		race_gameState.sockInfo = null;
	}
	// show current usage before cleanup
	race_gameState.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_gameState.roottree.glfree();
	//race_gameState.treeMaster.glfree();
	race_gameState.terminal = null;
	
	// show usage after cleanup
	logrc();
	race_gameState.roottree = null;
	clearbuts('ingame');
	logger("exiting webgl race_gameState\n");
	mainvp.camattach = null;
	mainvp.incamattach = false;
	mainvp.lookat = null;
	mainvp.inlookat = false;
	debprint.removelist("ingame test variables");
};
