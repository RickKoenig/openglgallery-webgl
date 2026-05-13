'use strict';

// running the simulation/game
var race_gameState_standalone = {}; // the 'race_gameState_standalone' state
race_gameState_standalone.hidden = true; // can't be selected in the engine UI

race_gameState_standalone.text = "WebGL: race_gameState_standalone 3D drawing";
race_gameState_standalone.title = "race_gameState_standalone";

race_gameState_standalone.broadcastLag = 0; // milliseconds setTimeout, 0, 10, 100, 1000, 2000, 3000
race_gameState_standalone.doChecksum = true; // check all valid frames (race state)
race_gameState_standalone.validateVerbose = false;
race_gameState_standalone.broadcastReceiveVerbose = false;
race_gameState_standalone.broadcastSendVerbose = false;
race_gameState_standalone.fpswanted = 60;

race_gameState_standalone.maxFrames = 0; // 0 is unlimited

race_gameState_standalone.gotoConsole = function() {
    changestate("race_console", "from gameState");
}


// check all new validFrames from all players
race_gameState_standalone.validateFrames = function() {
	const room = race_gameState_standalone.sockerInfo.room;
	const numSlots = room.slots.length;
	let watchDog = 6000;
	while(true) {
		let doBreak = false;
		const vf = race_gameState_standalone.validFrames - race_gameState_standalone.validOffset;
		for (let i = 0; i < numSlots; ++i) {
			if (!race_gameState_standalone.discon[i] && vf >= race_gameState_standalone.validFramesSlots[i].length) {
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
			if (race_gameState_standalone.discon[i]) {
				continue;
			}
			if (race_gameState_standalone.validFrames != race_gameState_standalone.validFramesSlots[i][vf].frameNum) {
				alertS("CCC, bad checksum frame: VF[" + i + "] error " + race_gameState_standalone.validFrames);
			} else {
				if (race_gameState_standalone.validateVerbose) console.log("VF[" + i + "] good " + race_gameState_standalone.validFrames);
			}
		}
		// second, checksum all players game models
		for (let i = 0; i < numSlots; ++i) {
			if (race_gameState_standalone.discon[i]) {
				continue;
			}
			for (let j = i + 1; j < numSlots; ++j) {
				if (race_gameState_standalone.discon[j]) {
					continue;
				}
				let mess = "VF[" + i + "] VF[" + j + "] frame = " + race_gameState_standalone.validFrames;

/*
				const isEq = equalsObj(race_gameState_standalone.validFramesSlots[i][vf].model
					, race_gameState_standalone.validFramesSlots[j][vf].model);
				mess += "\n" + JSON.sortify(race_gameState_standalone.validFramesSlots[i][vf].model, JSONbigintReplacer) + "\n"
					+ "WITH\n" + JSON.sortify(race_gameState_standalone.validFramesSlots[j][vf].model, JSONbigintReplacer) + "\n";
				if (isEq) {
					if (race_gameState_standalone.validateVerbose) console.log("DDD, good checksum frame: " + mess);
				} else {
					alertS("DDD, bad checksum frame: " + mess);
				}
*/
				const isEq = race_gameState_standalone.validFramesSlots[i][vf].model === race_gameState_standalone.validFramesSlots[j][vf].model;
				mess += "\n" + race_gameState_standalone.validFramesSlots[i][vf].model + "\n"
					+ "WITH\n" + race_gameState_standalone.validFramesSlots[j][vf].model + "\n";
				if (isEq) {
					if (race_gameState_standalone.validateVerbose) console.log("DDD, good checksum frame: " + mess);
				} else {
					alertS("DDD, bad checksum frame: " + mess);
				}


			}
		}
		++race_gameState_standalone.validFrames;
		let trimValid = true; // if false, keep a paper trail of all gamestates
		if (trimValid) {
			// shift out old data, save memory
			for (let i = 0; i < numSlots; ++i) {
				race_gameState_standalone.validFramesSlots[i].shift();
			} 
			++race_gameState_standalone.validOffset;
		}
		--watchDog;
		if (watchDog <= 0) {
			alertS("watchdog hit");
			break;
		}
	}
	const str = "Valid Frm = " + race_gameState_standalone.validFrames;
	race_gameState_standalone.termValid?.print(str);
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
race_gameState_standalone.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
	preloadimg("../common/sptpics/take0016.jpg");
	preloadimg("track/4pl_tile01.jpg");
	preloadimg("track/grass.jpg");
	preloadimg("track/sanddbl.jpg");
	//preloadtime(3000); // show loading screen for minimum time
}

race_gameState_standalone.init = function(sockInfo) { // network state tranfered from race_sentgo
	logger("entering webgl race_gameState_standalone with game '" + sockInfo?.game + "'\n");
	race_gameState_standalone.count = 0; // counter for this state
	race_gameState_standalone.allready = false;
	race_gameState_standalone.gameType = sockInfo?.game;

	// the 3D viewport
	mainvp = defaultviewport();
	mainvp.clearcolor = [.125, .125, .125, 1];

	// ui
	race_gameState_standalone.showHud = true;
	setbutsname('ingame');
	race_lobby.fillButton = makeabut("standalone console", race_gameState_standalone.gotoConsole);
	makeaprintarea("GAME '" + race_gameState_standalone.gameType + "'", "font-size: 2.1em;");
	makeabr();

	race_gameState_standalone.roottree = new Tree2("race_gameState_standalone root tree");
	if (race_gameState_standalone.showHud) {
		race_gameState_standalone.terminal = new Terminal(race_gameState_standalone.roottree, [.2, .2, .1, 1]);
		race_gameState_standalone.terminal.doShow(false);
	}

	race_gameState_standalone.checksum = [];

	// do network stuff
	if (true) {
	//if (sockInfo && sockInfo.sock) {
		const gameClassStr = "Game" + race_gameState_standalone.gameType.toUpperCase();
		console.log("game class string = " + gameClassStr);
		race_gameState_standalone.gameClass = window[gameClassStr];

		race_gameState_standalone.socker = sockInfo.sock; // actual socket.io
		race_gameState_standalone.sockerInfo = sockInfo.info;
		race_gameState_standalone.mySlot = 0;//race_gameState_standalone.sockerInfo.slotIdx;
		// show myself and other info from 'intent'
		race_gameState_standalone.terminal?.print("INGAME\n\n"
			+ "sockerinfo = " + JSON.stringify(race_gameState_standalone.sockerInfo)
			+ "\ngame = " + sockInfo.game
			+ "\nrace_gameState count = " + race_gameState_standalone.count);


		const room = race_gameState_standalone.sockerInfo.room;

		if (race_gameState_standalone.showHud) {
			race_gameState_standalone.negPingTree = buildplanexy("anegping",.5,.5,null,"flat");
			race_gameState_standalone.negPingTree.trans = [-7, 9.15, 10];
			race_gameState_standalone.negPingTree.mod.flags |= modelflagenums.NOZBUFFER;
			race_gameState_standalone.negPingTree.mod.mat.color = [0,0,0,0];
			race_gameState_standalone.negPingTree.mod.flags |= modelflagenums.HASALPHA;
			race_gameState_standalone.roottree.linkchild(race_gameState_standalone.negPingTree);
		}

		// setup the gamewarp system with the game 'gameClass'
		race_gameState_standalone.mvc = new GameWarp_standalone(1 //room.slots.length
			, race_gameState_standalone.mySlot, race_gameState_standalone.gameClass
			, race_gameState_standalone.roottree
			, race_gameState_standalone.doChecksum
			, ["player0"]//race_gameState_standalone.sockerInfo.room.slotNames);
		);
		// frame 0 will be valid
		race_gameState_standalone.checksum = race_gameState_standalone.mvc.modelToView(race_gameState_standalone.count);
		if (race_gameState_standalone.doChecksum) {
			race_gameState_standalone.validFramesSlots = Array(1);
			for (let i = 0; i < race_gameState_standalone.validFramesSlots.length; ++i) {
				// clone frame 0 to all slots, don't check frame 0 with other players
				race_gameState_standalone.validFramesSlots[i] = clone(race_gameState_standalone.checksum);
			}
			race_gameState_standalone.terminal?.print("done INGAME init with sockInfo, id = "
				+ race_gameState_standalone.sockerInfo.id + " slot = " + race_gameState_standalone.sockerInfo.slotIdx);
		}
		const termParams = {
			cols: 39,
			rows: 1,
			offx: 40,
			offy: 80,
			scale: 2
		};
		race_gameState_standalone.validFrames = 0;
		race_gameState_standalone.validOffset = 0; // shift race_gameState_standalone.discon, to save memory

		race_gameState_standalone.pingTimes = Array(1);
		race_gameState_standalone.discon = Array(1);
		if (race_gameState_standalone.showHud) {
			if (race_gameState_standalone.doChecksum) {
				race_gameState_standalone.termValid = new Terminal(race_gameState_standalone.roottree, [.2, .2, .1, .25], null, termParams);
				const showValidFrames = true;
				race_gameState_standalone.termValid.print("VALID FRAMES");
				race_gameState_standalone.termValid.doShow(showValidFrames);
			}
			//termParams.cols= 39;
			termParams.offy = 120;
			race_gameState_standalone.terminalFPS = new Terminal(race_gameState_standalone.roottree, [.2, .2, .1, .25], null, termParams);
			race_gameState_standalone.terminalFPS.doShow(true);

			race_gameState_standalone.indicatorTree = new Tree2("indicator");
			race_gameState_standalone.roottree.linkchild(race_gameState_standalone.indicatorTree);
			race_gameState_standalone.showPings = new Indicator(race_gameState_standalone.indicatorTree, 1, race_gameState_standalone.mySlot);
		}
	}

	// catchup parameters
	race_gameState_standalone.catchup0 = .05 //0; // constant
	race_gameState_standalone.catchup1 = .05 / 30; // linear
	race_gameState_standalone.catchup2 = 0 //.01; // quadratic
	race_gameState_standalone.catchupAccum = 0;

	// UI debprint menu
	debprint.addlist("ingame test variables",[
		"fpswanted",
		"Timers.fpsavg",
		"screenRefresh",
		"race_gameState_standalone.catchup0",
		"race_gameState_standalone.catchup1",
		"race_gameState_standalone.catchup2",
		"race_gameState_standalone.catchupAccum"
	]);
};

race_gameState_standalone.onresize = function() {
	console.log("onresize");
	race_gameState_standalone.terminal?.onresize();
}

race_gameState_standalone.proc = function() {
	// proc
	if (race_gameState_standalone.maxFrames && race_gameState_standalone.maxFrames <= race_gameState_standalone.count) {
		return;
	}
	// hide/show pings etc.
	if (input.key == 'h'.charCodeAt()) {
		if (race_gameState_standalone.showHud) {
			race_gameState_standalone.negPingTree.flags ^= treeflagenums.DONTDRAWC;
			race_gameState_standalone.indicatorTree.flags ^= treeflagenums.DONTDRAWC;
			race_gameState_standalone.terminalFPS?.doShow(!race_gameState_standalone.terminalFPS.getShow());
			race_gameState_standalone.termValid?.doShow(!race_gameState_standalone.termValid.getShow());
		}
	}
	// change frame rate
	if (input.key == ','.charCodeAt()) {
		--fpswanted;
		if (fpswanted < 1) fpswanted = 1;
	} else if (input.key == '.'.charCodeAt()) {
		++fpswanted;
		if (fpswanted > 120) fpswanted = 120;
	}
	if (true) {
	// if (race_gameState_standalone.allready) {
		// do something after N seconds
		const numSeconds = 4;
		if (race_gameState_standalone.count == numSeconds * fpswanted) {
			if (testDisconnect == 6) {
				if (race_gameState_standalone.sockerInfo.id == testId) {
					race_gameState_standalone.socker.disconnect();
				}
			}
		}
		race_gameState_standalone.pingTimes[race_gameState_standalone.mySlot] = 0; // my time
		race_gameState_standalone.showPings?.update(race_gameState_standalone.pingTimes, race_gameState_standalone.count);
		// if any neg pings, speed up to catch up
		let behind = 0;
		for (let i = 0; i < race_gameState_standalone.pingTimes.length; ++i) { // units are 'frames'
			const negPing = -race_gameState_standalone.pingTimes[i];
			if (negPing > 0) {
				behind = Math.max(behind, negPing);
			}
		}
		// run slightly faster if time is behind other players
		let catchup = 0; // no catchup
		if (behind > 0) {
			const faster = race_gameState_standalone.catchup0 
				+ behind * (race_gameState_standalone.catchup1 + behind * race_gameState_standalone.catchup2);
			race_gameState_standalone.catchupAccum += faster;
			catchup = Math.floor(race_gameState_standalone.catchupAccum);
			race_gameState_standalone.catchupAccum -= catchup;
		}
		if (catchup > 0) {
			race_gameState_standalone.negPingTree.mod.mat.color = [1,0,0,1];
		}
		// drift catchup color
		if (race_gameState_standalone.showHud) {
			race_gameState_standalone.negPingTree.mod.mat.color[0] *=  .75;
			race_gameState_standalone.negPingTree.mod.mat.color[3] *=  .75;
		}

		// get some input
		let keyCode = race_gameState_standalone.gameClass.modelMakeKeyCode(race_gameState_standalone.mvc.game);

		race_gameState_standalone.catchupAccum;

		let loopCount = catchup + 1; // run at least once

		// run model 1 or more times
		for (let loop = 0; loop < loopCount; ++loop) {
			let myKeyCode = keyCode;
			const breakChecksum = false;
			const count = race_gameState_standalone.count;
			if (breakChecksum) {
				// TEST checksum breakage
				if (count == 60 && race_gameState_standalone.mySlot == 1) {
					myKeyCode.kc = race_gameState_standalone.gameClass.keyCodes.LEFT;
				}
			}
			race_gameState_standalone.mvc.controlToModel(race_gameState_standalone.count, race_gameState_standalone.mySlot, myKeyCode);
			// broadcast send
			const checksum = race_gameState_standalone.checksum;
			if (race_gameState_standalone.broadcastLag) {
				setTimeout(function() {
					if (race_gameState_standalone.doChecksum && loop == 0) {
						if (race_gameState_standalone.broadcastSendVerbose) {
							console.log(" -- LAG -- " + race_gameState_standalone.broadcastLag + "ms ---, SEND broadcast valid frame = " + count);
							console.log("   WITH checksum = " + JSON.sortify(checksum, JSONbigintReplacer));
						}
						race_gameState_standalone.socker?.emit('broadcast', {
							frameNum: count, 
							keyCode: keyCode, 
							checksum: checksum
						});
					} else {
						race_gameState_standalone.socker?.emit('broadcast', {
							frameNum: count,
							keyCode: keyCode
						});
					}
				}, race_gameState_standalone.broadcastLag);
			} else {
				if (race_gameState_standalone.doChecksum && loop == 0) {
					if (race_gameState_standalone.broadcastSendVerbose) {
						console.log("SEND broadcast valid frame = " + count);
						console.log("   WITH checksum = " + JSON.sortify(race_gameState_standalone.checksum, JSONbigintReplacer));
					}
					race_gameState_standalone.socker?.emit('broadcast', {
						frameNum: count,
						keyCode: keyCode,
						checksum: checksum
					});
				} else {
					race_gameState_standalone.socker?.emit('broadcast', {
						frameNum: count,
						keyCode: keyCode
					});
				}
			}
			race_gameState_standalone.checksum = [];
			if (race_gameState_standalone.mvc.game.stepGhostModel) {
			race_gameState_standalone.mvc.game.stepGhostModel(race_gameState_standalone.count);
			}
			++race_gameState_standalone.count;
		}
	}
	race_gameState_standalone.roottree.proc(); // do animations that don't effect players
	race_gameState_standalone.terminalFPS?.print("FPS: AVG = " + Timers.fpsavg.toFixed(4) 
		+ ", WANTED " + fpswanted);
	doflycam(mainvp); // modify the trs of mainvp using flycam
	// draw
	if (race_gameState_standalone.mvc) {
		race_gameState_standalone.checksum = race_gameState_standalone.mvc.modelToView(race_gameState_standalone.count);
		/*if (race_gameState_standalone.doChecksum) {
			const oldLen = race_gameState_standalone.validFramesSlots[race_gameState_standalone.mySlot].length;
			race_gameState_standalone.validFramesSlots[race_gameState_standalone.mySlot] = race_gameState_standalone.validFramesSlots[race_gameState_standalone.mySlot].concat(race_gameState_standalone.checksum);
			const newLen = race_gameState_standalone.validFramesSlots[race_gameState_standalone.mySlot].length;
			// check frame numbers
			for (let i = oldLen; i < newLen; ++i) {
				const oi = i + race_gameState_standalone.validOffset;
				if (oi != race_gameState_standalone.validFramesSlots[race_gameState_standalone.mySlot][i].frameNum) {
					alertS("BBB, race_gameState_standalone.checksum[i].frameNum != i");
				}
			}
			race_gameState_standalone.validateFrames();
		}*/
	}
	race_gameState_standalone.mvc.draw();
	beginscene(mainvp);
	race_gameState_standalone.roottree.draw();
};

race_gameState_standalone.exit = function() {
	changestate("race_console_standalone", "from gameState_standalone, reload state");

	// show current usage before cleanup
	race_gameState_standalone.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_gameState_standalone.roottree.glfree();
	race_gameState_standalone.terminal = null;
	race_gameState_standalone.mvc.exit();
	
	// show usage after cleanup
	logrc();
	race_gameState_standalone.roottree = null;
	clearbuts('ingame');
	logger("exiting webgl race_gameState_standalone\n");
	mainvp.camattach = null;
	mainvp.incamattach = false;
	mainvp.lookat = null;
	mainvp.inlookat = false;
	debprint.removelist("ingame test variables");
};
