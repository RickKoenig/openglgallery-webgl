'use strict';

// running the simulation/game
var race_ingame = {}; // the 'race_ingame' state
//race_ingame.hidden = true; // can't be selected in the engine UI

race_ingame.text = "WebGL: race_ingame 3D drawing";
race_ingame.title = "race_ingame";

race_ingame.gotoConsole = function() {
    changestate("race_console", "from INGAME");
}

race_ingame.gotoLogin = function() {
    changestate("race_login", "from INGAME");
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
			//const otherTree = race_ingame.playerTrees[slot];
			if (broadPack.data) {
				/*
				// update position of other player
				if (broadPack.data.pos) {
					otherTree.trans = vec3.clone(broadPack.data.pos);
				} else {
					console.log('broadback data = ' + JSON.stringify(broadPack.data));
				}*/
				race_ingame.mvc.modelProc("frame", slot, broadPack.data.keyCode);
			} else {
				race_ingame.terminal?.print(
					"no broadPack data in ingame, is disconnect from other socket:  slotIdx = " + broadPack.slotIdx);
				//otherTree.mat.color = [.75, 0, 0, 1]; // disconnected color
				race_ingame.mvc.modelProc("frame", slot, RaceModel.modelMakeKeyCode(true));
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
			const otherTree = race_ingame.playerTrees[slot];
			//otherTree.mat.color = [.25, 1, 0, 1]; // not ready color
			race_ingame.mvc.modelProc("frame", slot, RaceModel.modelMakeKeyCode(true));
		}
	});
}

// load these before init
race_ingame.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	//preloadtime(3000); // show loading screen for minimum time
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

race_ingame.init = function(sockInfo) { // network state tranfered from race_sentgo
	logger("entering webgl race_ingame\n");
	race_ingame.count = 0; // counter for this state
	race_ingame.allready = false;

	// ui
	setbutsname('ingame');
	race_lobby.fillButton = makeabut("console", race_ingame.gotoConsole);
	race_lobby.fillButton = makeabut("login", race_ingame.gotoLogin);

	race_ingame.roottree = new Tree2("race_ingame root tree");
	race_ingame.terminal = new Terminal(race_ingame.roottree, [.2, .2, .1, 1]);

    // build 3D scene
	race_ingame.treeMaster = buildprism("aprism", [.5, .5, .5], "panel.jpg", "texc");
	race_ingame.treeMaster.mat.color = [.75, .75, .75, 1];

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

	    // build 3D scene
		const room = race_ingame.sockerInfo.room;
		for (let s = 0; s < room.slots.length; ++s) {
			const playerTree = race_ingame.treeMaster.newdup();
			//playerTree.trans = [s * .75 - 3, -3, 5]; // for now, center with 4 players, and a little lower
			playerTree.scale = [.3, .3, .3];
			if (race_ingame.mySlot == s) playerTree.mat.color = [1, 1, 1, 1]; // brighter color for self
			race_ingame.playerTrees[s] = playerTree;
			race_ingame.roottree.linkchild(playerTree);
		}
	
		race_ingame.mvc = new RaceModel(room.slots.length, race_ingame.playerTrees);
		race_ingame.mvc.modelToView();
			race_ingame.terminal.print("done INGAME init with sockInfo, id = "
		+ race_ingame.sockerInfo.id + " slot = " + race_ingame.sockerInfo.slotIdx);
	}

	// the 3D viewport
	mainvp = defaultviewport();
	mainvp.clearcolor = [.5,.5,1,1];
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

		const step = .025;
		const keyCode = RaceModel.modelMakeKeyCode();
		race_ingame.mvc.modelProc("frame number", race_ingame.mySlot, keyCode);
		// get some input
		// process input
		/*const myTree = race_ingame.playerTrees[race_ingame.mySlot];
		if (myTree) {
			if (input.keystate[keycodes.LEFT]) {
				myTree.trans[0] -= step;
			}
			if (input.keystate[keycodes.RIGHT]) {
				myTree.trans[0] += step;
			}
			if (input.keystate[keycodes.DOWN]) {
				myTree.trans[1] -= step;
			}
			if (input.keystate[keycodes.UP]) {
				myTree.trans[1] += step;
			}
			if (input.keystate[keycodes.PAGEDOWN]) {
				myTree.trans[2] -= step;
			}
			if (input.keystate[keycodes.PAGEUP]) {
				myTree.trans[2] += step;
			}*/
		race_ingame.socker?.emit('broadcast', {keyCode: keyCode});
		//}
		++race_ingame.count;
	}
	race_ingame.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	// draw
	beginscene(mainvp);
	race_ingame.mvc.modelToView();
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
};
