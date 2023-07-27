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
	multiplayer.infocnt = 0;
	multiplayer.socker = null;
	multiplayer.myId = undefined;
	multiplayer.playerTrees = []; // active players
	mainvp = defaultviewport();
	logger("entering webgl multiplayer with location host of " + location.host + "\n");
	multiplayer.roottree = new Tree2("root");
	multiplayer.treeMaster = buildprism("aprism", [.5, .5, .5], "panel.jpg", "tex");
	mainvp.incamattach = false;
	// ui
	setbutsname('many');

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
			myTree.trans = [multiplayer.myId * 2, 0, 5];
			myTree.scale = [1.5, 1.5, 1.5]; // bigger for self
			multiplayer.playerTrees[multiplayer.myId] = myTree;
			multiplayer.roottree.linkchild(myTree);
		});
		// draw other players
		multiplayer.socker.on('broadcast', function(data) {
			console.log("got a broadcast from server = " + JSON.stringify(data));
			// get other tree or create a new one
			if (data.id !== undefined) {
				let otherTree;
				if (!multiplayer.playerTrees[data.id]) {
					otherTree = multiplayer.treeMaster.newdup();
					multiplayer.roottree.linkchild(otherTree);
					multiplayer.playerTrees[data.id] = otherTree;
				} else {
					otherTree = multiplayer.playerTrees[data.id];
				}
				otherTree.trans = vec3.clone(data.data.pos);
			} else if (data.disconnect !== undefined) {
				console.log("id disconnected = " + data.disconnect);
				multiplayer.playerTrees[data.disconnect].unlinkchild();
				multiplayer.playerTrees[data.disconnect].glfree();
				multiplayer.playerTrees[data.disconnect] = null;		
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
	multiplayer.roottree.proc();
	// send some data back to the server
	++multiplayer.infocnt;
	if (multiplayer.socker) {
		if (multiplayer.infocnt % (multiplayer.myId + 100) == 0) {
			const browserInfo = {count : multiplayer.infocnt};
			console.log("BROWSERINFO: <id " + multiplayer.myId + "> " + JSON.stringify(browserInfo));
			multiplayer.socker.emit('browserInfo', browserInfo);
			multiplayer.updateinfo();
		}
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
	clearbuts('many');
};
