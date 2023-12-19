'use strict';

// preparing to go to the simulation/game
var race_sentgo = {}; // the 'race_sentgo' state
//race_sentgo.hidden = true; // can't be selected in the engine UI

race_sentgo.text = "WebGL: race_sentgo 3D drawing";
race_sentgo.title = "race_sentgo";

race_sentgo.gotoConsole = function() {
    changestate("race_console", "from SENTGO");
}

race_sentgo.gotoLogin = function() {
    changestate("race_login", "from SENTGO");
}

race_sentgo.setupCallbacks = function(socker) {
	// handle all events from SERVER
	socker.on('disconnect', function (reason) {
		race_sentgo.terminal?.print("sentgo disconnect reason '" + reason + "'");	
		if (socker) {
			socker.disconnect();
			race_sentgo.socker = socker = null; // one side effect
			changestate("race_console");
			clearTimeout(race_sentgo.timeout);
			race_sentgo.timeout = null;
		}
	});

	// broadPack has members: name, id, data
	/*
	const broadObj = {
		id: id,
		roomIdx: wsocket.roomIdx,
		slotIdx: wsocket.slotIdx,
		name: wsocket.name,
		data: data
	}
	*/
	socker.on('broadcast', function(broadPack) {
		if (!broadPack.data) {
			race_sentgo.terminal?.print("no broadPack data in sentgo, is disconnect from other socket: id = " + broadPack.id + ", slotIdx = " + broadPack.slotIdx);
		} else {
			race_sentgo.terminal?.print("broadcast from server in sentgo: " + JSON.stringify(broadPack.data));
		}
	});

	// message from server
	socker.on('message', function(str) {
		race_sentgo.terminal?.print("MESSAGE FROM SERVER " + str);
	});
	// (most) everyone is in this race_sentgo state, or some timed out
	socker.on('allReady', function(allReadyPack) {
		const str = "got ALL READY event:  " + JSON.stringify(allReadyPack, null, '   ');
		race_sentgo.terminal?.print(str);
		const waitSec = 2;
		race_sentgo.timeout = setTimeout(() => {
			race_sentgo.keepSockInfo = true;
			changestate("race_ingame", {
				sock: socker,
				info: race_sentgo.sockerInfo
			});
		},waitSec * 1000);
	});
}

// load these before init
race_sentgo.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

/*
sockerinfo........
	id: wsocket.id,
	name: wsocket.name,
	mode: wsocket.mode,
	roomIdx: wsocket.roomIdx,
	slotIdx: wsocket.slotIdx,
	room: null
*/

race_sentgo.init = function(sockInfo) { // network state tranfered from race_console
	race_sentgo.keepSockInfo = false;
	logger("entering webgl race_sentgo\n");
	race_sentgo.count = 0; // counter for this state


	// ui
	setbutsname('sentgo');
	race_lobby.fillButton = makeabut("console", race_sentgo.gotoConsole);
	race_lobby.fillButton = makeabut("login", race_sentgo.gotoLogin);

    // build 3D scene
	race_sentgo.roottree = new Tree2("race_sentgo root tree");
	race_sentgo.terminal = new Terminal(race_sentgo.roottree, [.2, .1, .1, 1]);
	
	// do network stuff
	if (sockInfo) {
		race_sentgo.socker = sockInfo.sock; // actual socket.io
		race_sentgo.sockerInfo = sockInfo.info;
		race_sentgo.setupCallbacks(race_sentgo.socker);
		// show myself and other info from 'intent'
		race_sentgo.terminal.print("SENTGO\n\n"
			+ "sockerinfo = " + JSON.stringify(race_sentgo.sockerInfo)
			+ "\nrace_sentgo count = " + race_sentgo.count);

		// TEST
		if (race_sentgo.sockerInfo.id == testId) { // test disconnect some sockets
			if (testDisconnect == 2) {
				race_sentgo.socker.disconnect();
				race_sentgo.socker = null;
			}
			if (testDisconnect == 3) {
				// wait a bit before disconnect
				const waitSec = 3;
				setTimeout(() => {
					race_sentgo.terminal?.print("disconnect after " + waitSec + " seconds");
					race_sentgo.socker?.disconnect();
				}, 1000 * waitSec);
			}
		}

		// TEST
		// otherwise don't send ready when testNotReady == 1 and testID == race_ingame.sockerInfo.id
		if (testId == race_sentgo.sockerInfo.id) {
			if (testNotReady == 2) { // wait a bit before saying I'm ready
				const waitSec = 7;
				setTimeout(() => {
					race_sentgo.terminal?.print("say ready after " + waitSec + " seconds");
					race_sentgo.socker.emit('ready');
				}, 1000 * waitSec);
			} else if (testNotReady != 1) { // if a 1, then don't emit ready
				race_sentgo.terminal.print("say ready right away NOT testNotReady != 1");
				race_sentgo.socker.emit('ready');
			}
		} else {
			race_sentgo.terminal.print("say ready right away NOT testId");
			race_sentgo.socker.emit('ready');
		}

		race_sentgo.terminal.print("done SENTGO init with sockInfo, id = " 
		+ race_sentgo.sockerInfo.id + " slot = " + race_sentgo.sockerInfo.slotIdx);
	}

	// the 3D viewport
	mainvp = defaultviewport();
	mainvp.clearcolor = [.5,.5,1,1];
};

race_sentgo.onresize = function() {
	console.log("onresize");
	race_sentgo.terminal.onresize();

}

race_sentgo.proc = function() {
	// proc
	++race_sentgo.count;
	race_sentgo.roottree.proc(); // probably does nothing
	//doflycam(mainvp); // modify the trs of mainvp using flycam
	// draw
	beginscene(mainvp);
	race_sentgo.roottree.draw();
};

race_sentgo.onresize = function() {
	console.log("onresize");
	race_console.terminal.onresize();
}

race_sentgo.exit = function() {
	if (race_sentgo.keepSockInfo) {
		race_sentgo.socker.off(); // kill all callbacks
	} else if (race_sentgo.socker) {
		race_sentgo.socker.disconnect();
		race_sentgo.socker = socker = null; // one side effect
	}
	if (race_sentgo.sockerInfo && race_sentgo.sockerInfo.id == testId && testDisconnect == 4) {
		race_sentgo.socker.disconnect();
		race_sentgo.socker = socker = null; // one side effect
		changestate("race_console");
	}
	race_sentgo.socker = null;
	// show current usage before cleanup
	race_sentgo.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_sentgo.roottree.glfree();
	race_sentgo.terminal = null;
	
	// show usage after cleanup
	logrc();
	race_sentgo.roottree = null;
	clearbuts('sentgo');
	logger("exiting webgl race_sentgo\n");
};
