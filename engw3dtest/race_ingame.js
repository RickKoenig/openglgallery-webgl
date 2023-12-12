// preparing to go to the simulation/game
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
			const otherTree = race_ingame.playerTrees[slot];
			if (broadPack.data) {
				// update position of other player
				console.log('broadback data = ' + JSON.stringify(broadPack.data));
				otherTree.trans = vec3.clone(broadPack.data.pos);
			} else {
				race_ingame.terminal?.print(
					"no broadPack data in ingame, is disconnect from other socket:  slotIdx = " + broadPack.slotIdx);
				otherTree.mat.color = [.75, 0, 0, 1]; // disconnected color
			}
		} else {
			alert("slot index = " + broadPack.slotIdx + " !!!");
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
		// now that everyone is ready, test broadcast something
		race_ingame.socker.emit('broadcast', "broad all ready 1 from slot " + race_ingame.sockerInfo.slotIdx);
		race_ingame.socker.emit('broadcast', "broad all ready 2 from slot " + race_ingame.sockerInfo.slotIdx);
		//socker.broadcast("slotidx = " + race_ingame.sockerInfo.slotIdx);
		for (let slot of allReadyPack.absentSlots) {
			const otherTree = race_ingame.playerTrees[slot];
			otherTree.mat.color = [.25, 1, 0, 1]; // not ready color
		}
	});
}

// load these before init
race_ingame.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
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

race_ingame.init = function(sockInfo) { // network state tranfered from race_sentgo
	logger("entering webgl race_ingame\n");
	race_ingame.count = 0; // counter for this state
	race_ingame.allready = false;

	// ui
	setbutsname('ingame');
	race_lobby.fillButton = makeabut("console", race_ingame.gotoConsole);
	race_lobby.fillButton = makeabut("login", race_ingame.gotoLogin);

	race_ingame.roottree = new Tree2("race_ingame root tree");
	// background for terminal
	// modelfont settings
	const cols = 120;
	const rows = 45;
	const depth = glc.clientHeight / 2;
	const offx = -glc.clientWidth / 2 + 16;
	const offy = glc.clientHeight / 2 - 16;
	const glyphx = 8;
	const glyphy = 16;

	race_ingame.backgnd = buildplanexy01("aplane2", glyphx * cols, glyphy * rows, null, "flat", 1, 1);
	//race_ingame.backgnd.mod.flags |= modelflagenums.NOZBUFFER;
	race_ingame.backgnd.mod.mat.color = [.2, .2, .1, 1];
	race_ingame.backgnd.trans = [offx, offy, depth];
	//race_ingame.backgnd.flags |= treeflagenums.DONTDRAW;
	race_ingame.roottree.linkchild(race_ingame.backgnd);

	// text for terminal
	race_ingame.term = new ModelFont("term", "font0.png", "texc", glyphx, glyphy, cols, rows, false); // might mess up the prompt
	//race_ingame.term.flags |= modelflagenums.NOZBUFFER;
	race_ingame.treef1 = new Tree2("term");
	race_ingame.treef1.setmodel(race_ingame.term);
	race_ingame.treef1.trans = [offx, offy, depth];
	race_ingame.treef1.mat.color = [1, 1, 1, 1];
	//race_ingame.treef1.flags |= treeflagenums.DONTDRAW;
	race_ingame.roottree.linkchild(race_ingame.treef1);

	// make terminal, no callbacks or prompt
	race_ingame.terminal = new Terminal(race_ingame.term, null);//race_ingame.doCommand);
	
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
		const waitABit = false;
		if (waitABit) {
			// wait a bit before saying I'm ready
			const waitSec = 3 + race_ingame.sockerInfo.id * 1;
			setTimeout(() => {
				race_ingame.terminal?.print("say ready after " + waitSec + " seconds");
				race_ingame.socker.emit('ready');
			}, 1000 * waitSec);
		} else { // no test, send ready right away
			race_ingame.terminal.print("say ready right away");
			race_ingame.socker.emit('ready');
		}

		race_ingame.terminal.print("done INGAME init with sockInfo, id = " 
		+ race_ingame.sockerInfo.id + " slot = " + race_ingame.sockerInfo.slotIdx);
	}

    // build 3D scene
	//race_ingame.roottree = new Tree2("race_ingame root tree");
	race_ingame.treeMaster = buildprism("aprism", [.5, .5, .5], "panel.jpg", "texc");
	race_ingame.treeMaster.mat.color = [.75, .75, .75, 1];
	const room = race_ingame.sockerInfo.room;
	for (let s = 0; s < room.slots.length; ++s) {
		const playerTree = race_ingame.treeMaster.newdup();
		playerTree.trans = [s * .75 - 3, -3, 5]; // for now, center with 4 players, and a little lower
		playerTree.scale = [.3, .3, .3];
		if (race_ingame.mySlot == s) playerTree.mat.color = [1, 1, 1, 1]; // brighter color for self
		race_ingame.playerTrees[s] = playerTree;
		race_ingame.roottree.linkchild(playerTree);
	}
	// the 3D viewport
	mainvp = defaultviewport();
	mainvp.clearcolor = [.5,.5,1,1];
};

race_ingame.onresize = function() {
	console.log("onresize");
	const depth = glc.clientHeight / 2;
	race_ingame.backgnd.trans[2] = depth;
	race_ingame.treef1.trans[2] = depth;
}

race_ingame.proc = function() {
	// proc
	//race_ingame.allready = true; // what is this?
	if (race_ingame.allready) {
		++race_ingame.count;
		// do something after N seconds
		const numSeconds = 4;
		if (race_ingame.count == numSeconds * fpswanted) {
			if (testDisconnect == 6) {
				if (race_ingame.sockerInfo.id == testId) {
					race_ingame.socker.disconnect();
				}
			}
			//changestate("solarTest");
			//window.history.back();
			//window.location.href = "../../index.html";
			//window.location.href = "http://janko.at";
		}

		const step = .025;
		// get some input
		// process input
		const myTree = race_ingame.playerTrees[race_ingame.mySlot];
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
			}
			race_ingame.socker?.emit('broadcast', {pos: myTree.trans});
		}
	}
	race_ingame.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	// draw
	beginscene(mainvp);
	race_ingame.roottree.draw();
};

race_ingame.exit = function() {
	if (race_ingame.socker) {
		//race_ingame.socker.off();
		race_ingame.socker.disconnect();
		race_ingame.socker = null;
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







/*
// use websockets to do some simple race_ingame games
var race_ingame = {};

race_ingame.text = "WebGL: race_ingame";
race_ingame.title = "WebGL: race_ingame";

race_ingame.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
};

race_ingame.init = function() {
	race_ingame.clientNewsCount = 0;
	race_ingame.socker = null;
	race_ingame.myId = undefined;
	race_ingame.serverDisconneted = true; // only restart state when server disconnects, not the client
	race_ingame.playerTrees = []; // active players
	mainvp = defaultviewport();
	logger("entering webgl race_ingame with location host of " + location.host + "\n");
	race_ingame.roottree = new Tree2("root");
	race_ingame.treeMaster = buildprism("aprism", [.5, .5, .5], "panel.jpg", "texc");
	race_ingame.treeMaster.mat.color = [.75, .75, .75, 1];
	// ui
	setbutsname('race_ingame test');

	// WEBSOCKET
	// info from websocket
	race_ingame.infoarea = makeaprintarea('websocket info: ');
	race_ingame.updateinfo();
	if (typeof io !== 'undefined') {
		// upgrade to websocket
		race_ingame.socker = io.connect("http://" + location.host);
		// see if using websocket or not
		race_ingame.socker.on("connect", () => {
			const engine = race_ingame.socker.io.engine;
			console.log("Transport method at connection = " 
				+ engine.transport.name);
			race_ingame.protocol = engine.transport.name;
			race_ingame.hostname = engine.transport.hostname;
			race_ingame.updateinfo();
			engine.once("upgrade", () => {
				console.log("Transport method after upgrade = " 
					+ engine.transport.name);
				race_ingame.protocol = engine.transport.name;
				race_ingame.updateinfo();
			});
		});
		// get id
		race_ingame.socker.on('id', function (data) {
			console.log("your ID from server: " + JSON.stringify(data));	
			race_ingame.myId = data;
			race_ingame.updateinfo();
			// display myself
			const myTree = race_ingame.treeMaster.newdup();
			myTree.trans = [race_ingame.myId * 2 - 3, 0, 5];
			myTree.mat.color = [1.5, 1, 0, 1]; // brighter color for self
			race_ingame.playerTrees[race_ingame.myId] = myTree;
			race_ingame.roottree.linkchild(myTree);
		});
		race_ingame.socker.on('news', function (strData) {
			console.log("NEWS from server: " + strData + " client newsCount " + race_ingame.clientNewsCount);
			++race_ingame.clientNewsCount;
			race_ingame.updateinfo();
		});
		race_ingame.socker.on('broadcast', function(broadData) {
			//console.log("got a broadcast from server = " + JSON.stringify(broadData));
			let otherTree;
			const pid = broadData.id;
			// create a new tree if one doesn't exist
			if (!race_ingame.playerTrees[pid]) {
				otherTree = race_ingame.treeMaster.newdup();
				race_ingame.roottree.linkchild(otherTree);
				race_ingame.playerTrees[pid] = otherTree;
				console.log("player " + pid + " connected");
			} else {
				otherTree = race_ingame.playerTrees[pid];
			}
			// update position of other player
			if (!broadData.data) {
				console.log("no broaddata!");
				const tre = race_ingame.playerTrees[pid];
				if (tre) {
					tre.unlinkchild();
					tre.glfree();
					race_ingame.playerTrees[pid] = null;		
				}
			} else {
				otherTree.trans = vec3.clone(broadData.data.pos);
			}
		});
		// myself got disconnect, reset most everything by restarting the state
		// most likely a ping timeout from an inactive tab in the browser
		race_ingame.socker.on('disconnect', function (reason) {
			if (race_ingame.serverDisconneted) {
				console.log("disconnect from server, restart state, Socker: " + reason);
				changestate(race_ingame); // just restart the whole state 'race_ingame' after cleaning up
			} else {
				console.log("disconnect while in state exit: " + reason);
			}
		});
	}
};

race_ingame.proc = function() {
	const step = .025;
	// get some input
	// process input
	const myTree = race_ingame.myId === undefined ? null 
		: race_ingame.playerTrees[race_ingame.myId];
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
	}
	race_ingame.roottree.proc();
	// send some data back to the server
	if (race_ingame.socker) {
		if (myTree) {
			race_ingame.socker.emit('broadcast', {pos: myTree.trans});
		}
	}

	// draw everything
	doflycam(mainvp); // modify the trs of vp
	beginscene(mainvp);
	race_ingame.roottree.draw();
};

race_ingame.updateinfo = function() {
	printareadraw(race_ingame.infoarea, "myId = " + race_ingame.myId
		+ "\nhostname = " + race_ingame.hostname
		+ "\nprotocol = " + race_ingame.protocol);
};
	
race_ingame.exit = function() {
	if (race_ingame.socker) {
		race_ingame.serverDisconneted = false; // disconnect callbacks won't change state
		race_ingame.socker.disconnect();
		race_ingame.socker = null;
	}
	race_ingame.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_ingame.roottree.glfree();
	race_ingame.treeMaster.glfree();
	logrc();
	race_ingame.roottree = null;
	logger("exiting webgl race_ingame\n");
	mainvp.camattach = null;
	mainvp.incamattach = false;
	mainvp.lookat = null;
	mainvp.inlookat = false;
	clearbuts('race_ingame test');
};
*/
