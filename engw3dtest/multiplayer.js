'use strict';

// use websockets to do some simple multiplayer games
var multiplayer = {};

multiplayer.text = "WebGL: multiplayer";
multiplayer.title = "WebGL: multiplayer";

multiplayer.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
};

multiplayer.init = function() {
	multiplayer.clientNewsCount = 0;
	multiplayer.socker = null;
	multiplayer.myId = undefined;
	multiplayer.serverDisconneted = true; // only restart state when server disconnects, not the client
	multiplayer.playerTrees = []; // active players
	mainvp = defaultviewport();
	logger("entering webgl multiplayer with location host of " + location.host + "\n");
	multiplayer.roottree = new Tree2("root");
	multiplayer.treeMaster = buildprism("aprism", [.5, .5, .5], "panel.jpg", "texc");
	multiplayer.treeMaster.mat.color = [.75, .75, .75, 1];
	// ui
	setbutsname('multiplayer test');

	// WEBSOCKET
	// info from websocket
	multiplayer.infoarea = makeaprintarea('websocket info: ');
	multiplayer.updateinfo();
	if (typeof io !== 'undefined') {
		// upgrade to websocket
		multiplayer.socker = io.connect("http://" + location.host);
		// see if using websocket or not
		multiplayer.socker.on("connect", () => {
			const engine = multiplayer.socker.io.engine;
			console.log("Transport method at connection = " 
				+ engine.transport.name);
			multiplayer.protocol = engine.transport.name;
			multiplayer.hostname = engine.transport.hostname;
			multiplayer.updateinfo();
			engine.once("upgrade", () => {
				console.log("Transport method after upgrade = " 
					+ engine.transport.name);
				multiplayer.protocol = engine.transport.name;
				multiplayer.updateinfo();
			});
		});
		// get id
		multiplayer.socker.on('id', function (data) {
			console.log("your ID from server: " + JSON.stringify(data));	
			multiplayer.myId = data;
			multiplayer.updateinfo();
			// display myself
			const myTree = multiplayer.treeMaster.newdup();
			myTree.trans = [multiplayer.myId * 2 - 3, 0, 5];
			myTree.mat.color = [1.5, 1, 0, 1]; // brighter color for self
			multiplayer.playerTrees[multiplayer.myId] = myTree;
			multiplayer.roottree.linkchild(myTree);
		});
		// draw other players
		multiplayer.socker.on('news', function (strData) {
			console.log("NEWS from server: " + strData + " client newsCount " + multiplayer.clientNewsCount);
			++multiplayer.clientNewsCount;
			multiplayer.updateinfo();
		});
		multiplayer.socker.on('broadcast', function(broadData) {
			//console.log("got a broadcast from server = " + JSON.stringify(broadData));
			let otherTree;
			const pid = broadData.id;
			// create a new tree if one doesn't exist
			if (!multiplayer.playerTrees[pid]) {
				otherTree = multiplayer.treeMaster.newdup();
				multiplayer.roottree.linkchild(otherTree);
				multiplayer.playerTrees[pid] = otherTree;
				console.log("player " + pid + " connected");
			} else {
				otherTree = multiplayer.playerTrees[pid];
			}
			// update position of other player
			if (!broadData.data) {
				console.log("no broaddata!");
				const tre = multiplayer.playerTrees[pid];
				if (tre) {
					tre.unlinkchild();
					tre.glfree();
					multiplayer.playerTrees[pid] = null;		
				}
			} else {
				otherTree.trans = vec3.clone(broadData.data.pos);
			}
		});
		// myself got disconnect, reset most everything by restarting the state
		// most likely a ping timeout from an inactive tab in the browser
		multiplayer.socker.on('disconnect', function (reason) {
			if (multiplayer.serverDisconneted) {
				console.log("disconnect from server, restart state, Socker: " + reason);
				changestate(multiplayer); // just restart the whole state 'multiplayer' after cleaning up
			} else {
				console.log("disconnect while in state exit: " + reason);
			}
		});
	}
};

multiplayer.proc = function() {
	const step = .025;
	// get some input
	// process input
	const myTree = multiplayer.myId === undefined ? null 
		: multiplayer.playerTrees[multiplayer.myId];
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
	multiplayer.roottree.proc();
	// send some data back to the server
	if (multiplayer.socker) {
		if (myTree) {
			multiplayer.socker.emit('broadcast', {pos: myTree.trans});
		}
	}

	// draw everything
	doflycam(mainvp); // modify the trs of vp
	beginscene(mainvp);
	multiplayer.roottree.draw();
};

multiplayer.updateinfo = function() {
	printareadraw(multiplayer.infoarea, "myId = " + multiplayer.myId
		+ "\nhostname = " + multiplayer.hostname
		+ "\nprotocol = " + multiplayer.protocol);
};
	
multiplayer.exit = function() {
	if (multiplayer.socker) {
		multiplayer.serverDisconneted = false; // disconnect callbacks won't change state
		multiplayer.socker.disconnect();
		multiplayer.socker = null;
	}
	multiplayer.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	multiplayer.roottree.glfree();
	multiplayer.treeMaster.glfree();
	logrc();
	multiplayer.roottree = null;
	logger("exiting webgl multiplayer\n");
	mainvp.camattach = null;
	mainvp.incamattach = false;
	mainvp.lookat = null;
	mainvp.inlookat = false;
	clearbuts('multiplayer test');
};
