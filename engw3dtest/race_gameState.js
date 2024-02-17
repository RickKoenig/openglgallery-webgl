'use strict';

// running the simulation/game
var race_gameState = {}; // the 'race_gameState' state
race_gameState.hidden = true; // can't be selected in the engine UI

race_gameState.text = "WebGL: race_gameState 3D drawing";
race_gameState.title = "race_gameState";

race_gameState.broadcastLag = 0; // milliseconds setTimeout, 0, 10, 100, 1000, 2000, 3000
race_gameState.doChecksum = true; // check all valid frames (race state)
race_gameState.validateVerbose = false;
race_gameState.broadcastReceiveVerbose = false;
race_gameState.broadcastSendVerbose = false;
race_gameState.fpswanted = 60;

race_gameState.maxFrames = 0; // 0 is unlimited

race_gameState.gotoConsole = function() {
    changestate("race_console", "from gameState");
}

race_gameState.setupCallbacks = function(socker) {
	// handle all events from SERVER
	socker.on('disconnect', function (reason) {
		race_gameState.terminal?.print("ingame disconnect reason '" + reason + "'");
		if (socker) {
			socker.disconnect();
			race_gameState.socker = socker = null; // one side effect
			changestate("race_console", "from gameState, disconnect");
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
	// broadcast receive
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
						if (race_gameState.broadcastReceiveVerbose) {
							console.log("RECEIVE num checksum frames = " + checksum.length);
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
				const kc = {discon: true};
				race_gameState.mvc.controlToModel(null, slot, kc);
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
			const kc = {discon: true};
			race_gameState.mvc.controlToModel(null, slot, kc); // disconnected
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
				if (race_gameState.validateVerbose) console.log("VF[" + i + "] good " + race_gameState.validFrames);
			}
		}
		// second, checksum all players game models
		for (let i = 0; i < numSlots; ++i) {
			if (race_gameState.discon[i]) {
				continue;
			}
			for (let j = i + 1; j < numSlots; ++j) {
				if (race_gameState.discon[j]) {
					continue;
				}
				let mess = "VF[" + i + "] VF[" + j + "] frame = " + race_gameState.validFrames;
				const isEq = equalsObj(race_gameState.validFramesSlots[i][vf].model
					, race_gameState.validFramesSlots[j][vf].model);
				mess += "\n" + JSON.sortify(race_gameState.validFramesSlots[i][vf].model) + "\n"
					+ "WITH\n" + JSON.sortify(race_gameState.validFramesSlots[j][vf].model);
				if (isEq) {
					if (race_gameState.validateVerbose) console.log("DDD, good checksum frame: " + mess);
				} else {
					alertS("DDD, bad checksum frame: " + mess);
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
	preloadimg("../common/sptpics/Bark.png");
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
	race_gameState.terminal.doShow(false);

	race_gameState.checksum = [];

	// do network stuff
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
		race_gameState.negPingTree.mod.mat.color = [0,0,0,0];
		race_gameState.negPingTree.mod.flags |= modelflagenums.HASALPHA;
		race_gameState.roottree.linkchild(race_gameState.negPingTree);

		// setup the gamewarp system with the game 'gameClass'
		race_gameState.mvc = new GameWarp(room.slots.length
			, race_gameState.mySlot, race_gameState.gameClass
			, race_gameState.roottree
			, race_gameState.doChecksum);
		// frame 0 will be valid
		race_gameState.checksum = race_gameState.mvc.modelToView(race_gameState.count);
		if (race_gameState.doChecksum) {
			race_gameState.validFramesSlots = Array(room.slots.length);
			for (let i = 0; i < race_gameState.validFramesSlots.length; ++i) {
				// clone frame 0 to all slots, don't check frame 0 with other players
				race_gameState.validFramesSlots[i] = clone(race_gameState.checksum);
			}
			race_gameState.terminal.print("done INGAME init with sockInfo, id = "
				+ race_gameState.sockerInfo.id + " slot = " + race_gameState.sockerInfo.slotIdx);
		}
		const termParams = {
			cols: 19,
			rows: 1,
			offx: 40,
			offy: 80,
			scale: 2
		};
		if (race_gameState.doChecksum) {
			race_gameState.termValid = new Terminal(race_gameState.roottree, [.1, 0, 0, 1], null, termParams);
			const showValidFrames = true;
			race_gameState.termValid.print("VALID FRAMES");
			race_gameState.termValid.doShow(showValidFrames);
		}
		//termParams.cols= 39;
		termParams.offy = 120;
		race_gameState.terminalFPS = new Terminal(race_gameState.roottree, [.2, .2, .1, 1], null, termParams);
		race_gameState.terminalFPS.doShow(true);

		race_gameState.validFrames = 0;
		race_gameState.validOffset = 0; // shift race_gameState.discon, to save memory
	}

	// the 3D viewport
	mainvp = defaultviewport();
	mainvp.near = 7;
	mainvp.far = 10000;
	mainvp.clearcolor = [.125, .125, .125, 1];
	if (race_gameState.gameType == 'a') {
		mainvp.clearcolor = [.25 ,.55, 1, 1];
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
		let catchup = 0;
		const delCatchup = .4;
		const slack = 0;
		if (testCatchup) {
			// test neg ping times
			const negId = 1;
			const negTime = 30;
			const negPings = Array(race_gameState.pingTimes.length).fill(-negTime);
			negPings[negId] = negTime - slack;
			for (let i = 0; i < race_gameState.pingTimes.length; ++i) {
				if (i != race_gameState.mySlot && race_gameState.pingTimes[i] < negPings[i]) {
					catchup = 1;
					break;
				}
			}
		} else {
			// normal catchup
			for (let i = 0; i < race_gameState.pingTimes.length; ++i) {
				const comp = -slack - race_gameState.pingTimes[i];
				if (comp > 0) {
					catchup = Math.max(catchup, comp);
					break;
				}
			}
			catchup *= delCatchup;
		}
		// TEST disable catchup if uncommented
		// catchup = 0; // no catchup
		if (catchup) {
			race_gameState.negPingTree.mod.mat.color = [1,0,0,1];
		}
		// drift catchup color
		race_gameState.negPingTree.mod.mat.color[0] *=  .75;
		race_gameState.negPingTree.mod.mat.color[3] *=  .75;

		// get some input
		let keyCode = race_gameState.gameClass.modelMakeKeyCode();
		const testKeyCodeAuto = false; // auto move some players
		const testKeyCodeAutoSlot = 0;
		if (testKeyCodeAuto) {
			if (race_gameState.mySlot == testKeyCodeAutoSlot) {
				keyCode.kc |= race_gameState.gameClass.keyCodes.RIGHT;
			}
		}
		// process input
		let loopCount = Math.floor(catchup) + 1;// ? 5 : 1;
		if (loopCount > 5) loopCount = 5;
		for (let loop = 0; loop < loopCount; ++loop) {
			let myKeyCode = keyCode;
			const breakChecksum = false;
			const count = race_gameState.count;
			if (breakChecksum) {
				// TEST checksum breakage
				if (count == 60 && race_gameState.mySlot == 1) {
					myKeyCode.kc = race_gameState.gameClass.keyCodes.LEFT;
				}
			}
			race_gameState.mvc.controlToModel(race_gameState.count, race_gameState.mySlot, myKeyCode);
			// broadcast send
			const checksum = race_gameState.checksum;
			if (race_gameState.broadcastLag) {
				setTimeout(function() {
					if (race_gameState.doChecksum && loop == 0) {
						if (race_gameState.broadcastSendVerbose) {
							console.log(" -- LAG -- " + race_gameState.broadcastLag + "ms ---, SEND broadcast valid frame = " + count);
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
					if (race_gameState.broadcastSendVerbose) {
						console.log("SEND broadcast valid frame = " + count);
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
			race_gameState.mvc.game.stepGhostModel(race_gameState.count);
			++race_gameState.count;
		}
	}
	race_gameState.roottree.proc(); // do animations that don't effect players
	race_gameState.terminalFPS.print("FPS = " + fpsavg.toFixed(4));
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
