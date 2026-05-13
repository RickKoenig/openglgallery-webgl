'use strict';

// terminal
var race_console_standalone = {}; // the 'race_console_standalone' state
race_console_standalone.text = "WebGL: race_console_standalone 3D drawing";
race_console_standalone.title = "race_console_standalone";

// BEGIN test internet breakage
//const testDisconnect = 0;
// when to disconnect
// 0 no test
// 1 race_console_standalone got go
// 2 race_sentgo init
// 3 race_sentgo proc soon after
// 4 race_sentgo exit
// 5 race_ingame init
// 6 race_ingame proc soon after
//const testNotReady = 0;
// when to say ready
// 0 no test, send ready in all inits
// 1 race_sentgo don't send ready
// 2 race_sentgo proc send ready soon after
// 3 race_ingame don't send ready
// 4 race_ingame proc send ready soon after
// socket id to try to break
//const testId = 1;
// END test internet breakage

race_console_standalone.broadcastModes = {
	lobby: 0,
	room: 1,
};
race_console_standalone.modeStrs = ['L', 'R'];

// load these before init
race_console_standalone.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

race_console_standalone.gotoLobby = function() {
    changestate("race_lobby");
}

race_console_standalone.gotoFill = function() {
    changestate("race_sentgo");
}

race_console_standalone.autoCommandMake = function() {
	// log in and make room p0
	race_console_standalone.doCommand('e');
	race_console_standalone.doCommand('m');
}

race_console_standalone.autoCommandJoin = function() {
	// log in and connect to room p0
	race_console_standalone.doCommand('e');
	race_console_standalone.doCommand('j');
}

race_console_standalone.autoCommand1P = function(g) {
	// standalone, start game
	const sockinfo = {
		game: g,
		info: {
			id: 0,
			name: "player 0"
		}
	}
	changestate(race_gameState_standalone, sockinfo);
	/*race_console_standalone.doCommand('e');
	race_console_standalone.doCommand('m');
	race_console_standalone.doCommand('go ' + g);*/
}

// get my profile from server after setting name game etc. 
// also has my id and room id if needed
race_console_standalone.makePromptFromInfo = function(info) {
/*
	//like this
	L {slayer0} > // lobby
	H [slayer0] {slayer0} > // host in room
	R [slayer0] {slayer0} > // guest in room
	S {[slayer0] {slayer0} // game/sim

	//info members
	id
	name
	mode // lobby or room
	roomLocked // if in room or game/sim
	roomName
	roomIdx
*/
	race_console_standalone.terminal.print("info = " + JSON.stringify(info, null, '   '));
	let modeStr = race_console_standalone.modeStrs[info.mode]; // L or R
	if (info.room?.locked) {
		modeStr = 'S';
	} else if (info.roomIdx == 0) {
		modeStr = 'H'; // room host
	}
	let prompt = modeStr;
	if (info.mode == race_console_standalone.broadcastModes.room) {
		prompt += " [" + info.room.name + "]";
	}
	prompt += " {" + info.name + "}";
	prompt += " >";
	return prompt;
};

race_console_standalone.setupCallbacks = function(socker, name) {
	// handle all events from SERVER
	socker.on('connect', function() {
		if (socker) {
			if (name) {
				socker.emit('name', name);
			}
		} else {
			console.log('on id with null socker!!');
			alert('on id with null socker!!');
		}
	});

	socker.on('prompt', function(info) {
		race_console_standalone.sockerInfo = info;
		console.log("INFO from server: " + JSON.stringify(info));
		if (socker) {
			const newPrompt = race_console_standalone.makePromptFromInfo(info);
			race_console_standalone.terminal.setPrompt(newPrompt);
		} else {
			console.log('on prompt with null socker!!');
			alert('on prompt with null socker!!');
		}
	});

	// server sends message to terminal
	socker.on('message', function(message) {
		race_console_standalone.terminal.print(message);
	});

	socker.on('disconnect', function (reason) {
		console.log("disconnect reason '" + reason + "'");	
		race_console_standalone.terminal?.print("disconnect reason '" + reason + "'");
		if (socker) {
			socker.disconnect();
			race_console_standalone.socker = socker = null; // one side effect
			race_console_standalone.terminal?.setPrompt(">");
		}
	});

	// broadPack has members: name, id, data
	socker.on('broadcast', function(broadPack) {
		if (!broadPack.data) {
			console.log("no broadPack data, is disconnect from other socket: id = " + broadPack.id + ", roomIdx = " + broadPack.roomIdx);
		} else if (typeof broadPack.data === 'string') {
			console.log("broadcast from server: " + JSON.stringify(broadPack));
			race_console_standalone.terminal.print("{" + broadPack.name + "} '" + broadPack.data + "'");
		}
	});

	// display news from server
	socker.on('news', function(strData) {
		console.log("NEWS from server: " + strData + " client newsCount " 
			+ race_console_standalone.clientNewsCount);
			//race_console_standalone.terminal.print(strData);
			++race_console_standalone.clientNewsCount;
	});

	socker.on('go', function(gameType) {
		if (race_console_standalone.sockerInfo.id == testId) { // test disconnect some sockets
			if (testDisconnect == 1) {
				race_console_standalone.socker?.disconnect(true);
			}
		}
		//const jGoData = JSON.stringify(goData);
		console.log("GO!: '" + gameType + "' client newsCount " 
			+ race_console_standalone.clientNewsCount);
		race_console_standalone.terminal.print(gameType);
		++race_console_standalone.clientNewsCount;
		race_console_standalone.keepSockInfo = true;
		changestate("race_sentgo", {
			sock: socker,
			info: race_console_standalone.sockerInfo,
			gameType: gameType
		});
	});
}

/*
COMMANDS

add
chat c
echo
enter e
exit
exitroom
go
help
joinroom j
kickme
makeroom m
mul
status s
*/

race_console_standalone.doCommand = function(cmdStr) {
	console.log("got a command from terminal '" + cmdStr + "'");
	const words = cmdStr.trim().split(/\s+/);
	if (!words[0]) return;
	const first = words.shift();
	switch(first) {
		case "help":
			// local
			this.print("commands are:\nhelp echo add mul (e)nter exit (s)tatus kickme (c)hat"
				+ "\n(m)akeroom (j)oinroom exitroom go");
			break;
		case "echo":
			// local with delay
			setTimeout(function() {
				race_console_standalone.terminal.print(words.join(' '));
			}, 2000);
			break;
		case "add":
			// local
			let sum = 0;
			for (let ele of words) {
				sum += parseFloat(ele);
			}
			this.print("sum = " + sum);
			break;
		case "mul":
			// remote
			if (race_console_standalone.socker) {
				race_console_standalone.socker.emit('mul', words);
			} else {
				this.print("please connect first with 'enter (name)'!");
			}
			break;
		case "enter":
		case "e":
			// connect
			if (false) {
			//if (typeof io !== 'undefined') {
				if (race_console_standalone.socker) {
					race_console_standalone.terminal.print("already connected!");
				} else {
					// upgrade to websocket
					race_console_standalone.socker = io.connect("http://" + location.host);
					const name = words[0];
					race_console_standalone.setupCallbacks(race_console_standalone.socker, name);
				}
			} else {
				race_console_standalone.terminal.print("no 'socket IO' library!");
			}
			break;
		case "exit":
			// disconnect
			if (race_console_standalone.socker) {
				race_console_standalone.socker.disconnect();
				race_console_standalone.socker = null;
			} else {
				race_console_standalone.terminal.print("already disconnected!");
			}
			break;
		case "status":
		case "s":
			// remote, status
			if (race_console_standalone.socker) {
				race_console_standalone.socker.emit('status', null);
			} else {
				race_console_standalone.terminal.print("please connect first with 'enter (name)'!");
			}
			break;
		case "kickme":
			// remote, kill my connection in about 5 seconds
			if (race_console_standalone.socker) {
				race_console_standalone.socker.emit('kickme', null);
			} else {
				race_console_standalone.terminal.print("not connected!");
			}
			break;
		// send a message to everyone
		case "chat":
		case "c":
			if (race_console_standalone.socker) {
				const message = words.join(' ');
				race_console_standalone.socker.emit('broadcast', message);
				race_console_standalone.terminal.print("broadcast '" + message + "'");
			} else {
				race_console_standalone.terminal.print("not connected!");
			}
			break;

		// rooms
		case "makeroom":
		case "m":
			if (race_console_standalone.socker) {
				race_console_standalone.socker.emit('makeroom', words[0]);
			} else {
				race_console_standalone.terminal.print("not connected!");
			}
			break;
		case "joinroom":
		case "j":
			if (race_console_standalone.socker) {
				let roomName = words[0];
				if (!roomName) roomName = "p0";
				if (roomName) {
					race_console_standalone.socker.emit('joinroom', roomName);
				} else {
					race_console_standalone.terminal.print("usage: joinroom roomname");
				}
			} else {
				race_console_standalone.terminal.print("not connected!");
			}
			break;
		case "exitroom":
			if (race_console_standalone.socker) {
				race_console_standalone.socker.emit('exitroom', null);
			} else {
				race_console_standalone.terminal.print("not connected!");
			}
			break;

		// start a game
		case "go": // go from room to sim/game, a room that is locked
				   // no new members, host can leave without destroying the room
			if (race_console_standalone.socker) {
				let gameType = words[0];
				//if (!gameType) gameType = 'a'; // default
				if (!gameType || gameType.length != 1 || gameType < 'a' || gameType > 'd') {
					race_console_standalone.terminal.print("not a valid gameType '" + gameType + "'");
					race_console_standalone.terminal.print("valid gameTypes are, 'a' thru 'd'");
					break;
				}
				race_console_standalone.socker.emit('go', gameType);
			} else {
				race_console_standalone.terminal.print("not connected!");
			}
			break;

		default:
			// local, not a valid command
			this.print("unrecognized command '" + cmdStr + "'");
			break;
	}
}

race_console_standalone.testGameClass = function(gameType) {
	console.log("start test game class");
	const game = GameA;
	const typeofgame = typeof game;
	console.log("typeof game = " + typeofgame);
	const gameClassStr = "Game" + gameType.toUpperCase();
	console.log("game class string = " + gameClassStr);
	const game2 = window[gameClassStr];
	const typeofgame2 = typeof game2;
	console.log("typeof game = " + typeofgame2);
	console.log("finish test game class");
}

race_console_standalone.distColl = function(a, b, dist) {
	const dist2 = vec2.sqrDist(a, b);
	let delta;
	if (dist2 > 0) {
		delta = vec2.create();
		vec2.sub(delta, b, a);
		vec2.normalize(delta, delta);
	} else {
		delta = vec2.fromValues(1, 0);
	}
	const mid = vec2.create();
	vec2.add(mid, a, b);
	vec2.scale(mid, mid, .5);
	vec2.sub(a, mid, delta);
	vec2.add(b, mid, delta);
}

race_console_standalone.showPoint = function(p) {
	return"(" + p[0].toFixed(4) + ", " + p[1].toFixed(4) + ")";
}

race_console_standalone.showPointPairs = function(pps) {
	console.log("POINT PAIRS");
	for (const pp of pps) {
		console.log("p0 = [" + race_console_standalone.showPoint(pp[0]) + ", p1 " + race_console_standalone.showPoint(pp[1]));
	}
}

race_console_standalone.testDistColl = function() {
	const pointPairs = [
		[[3, 4], [4, 5]],
		[[3, 6], [4, 7]],
		[[5, 0], [10, 0]],
		[[10, 0], [5, 0]],
		[[-5, 5], [4, 3]],
		[[4, 5], [4, 5]],
		[[4, 0], [-2, 0]],
		[[-4, 0], [2, 0]],
		[[2, 5], [2, 9]],
		[[2, 9], [2, 5]],
	];
	const dist = 2;

	console.log("TEST DIST COLL");
	console.log("BEFORE separation");
	race_console_standalone.showPointPairs(pointPairs);
	for (const pp of pointPairs) {
		race_console_standalone.distColl(pp[0], pp[1], dist);
	}
	console.log("AFTER separation");
	race_console_standalone.showPointPairs(pointPairs);
}

// find and list floating point inconsistencies here
race_console_standalone.testFloat = function() {
	let ang = 4 * 2 * CMath.PI / 6; // doesn't matter which library
	ang = normalangrad(ang);
	{
		console.log("Using Math library, standard math library");
		const sinAng = Math.sin(ang);
		console.log("TEST FLOAT: ang = " + ang + ", sinAng = " + sinAng);
		let bi = fromFloat(ang);
		console.log("ang to bi = " + bi.toString(16) + "\n");
		bi = fromFloat(sinAng);
		console.log("sinAng to bi = " + bi.toString(16) + "\n");
	}
	{
		console.log("Using Math library, consistent math library");
		const sinAng = CMath.sin(ang);
		console.log("TEST FLOAT: ang = " + ang + ", sinAng = " + sinAng);
		let bi = fromFloat(ang);
		console.log("ang to bi = " + bi.toString(16) + "\n");
		bi = fromFloat(sinAng);
		console.log("sinAng to bi = " + bi.toString(16) + "\n");
	}
}

race_console_standalone.testJSON = function() {
	console.log("test JSON");

	const obj = {
		hi: "ho",
		num1: 13.14,
		num4: 42.72,
		num14: {x: 33n, y: -44n},
		num3: '-3149999n',
		num5: '34n',
		num2: 2.72,
		num6: '-34n',
		num7: '-0n',
		num8: '0n',
		num9: '-0',
		num10: '0',
		num11: '-n',
		num12: 'n',
		num13: '',
	}
	const objStr = JSON.sortify(obj, JSONbigintReplacer, '   ');
	const obj2 = JSON.parse(objStr, JSONbigintReviver);
	console.log("objStr = " + objStr);
	console.log(obj2);
	console.log("end test JSON");
}

race_console_standalone.init = function(intentData) {
	//race_console_standalone.testJSON();
	//race_console_standalone.testGameClass('a');
	//race_console_standalone.testFloat();
	//race_console_standalone.testDistColl();
	race_console_standalone.keepSockInfo = false;
	race_console_standalone.clientNewsCount = 0;
	logger("entering webgl race_console_standalone\n");
	// ui
	setbutsname('console');
	makeabut("start game(a), move and push", race_console_standalone.autoCommand1P.bind(this,'a'));
	makeabr();
	makeabut("start game(b), 2d race", race_console_standalone.autoCommand1P.bind(this,'b'));
	makeabr();
	makeabut("start game(c), move and push V2 fixed", race_console_standalone.autoCommand1P.bind(this,'c'));
	makeabr();
	makeabut("start game(d), move and push V2", race_console_standalone.autoCommand1P.bind(this,'d'));
	makeahr();
	makeabut("make room", race_console_standalone.autoCommandMake);
	makeabut("join room", race_console_standalone.autoCommandJoin);
	
	//race_console_standalone.showIntent = makeaprintarea("intent = '" + intentData + "'");
	
	// build parent
	race_console_standalone.roottree = new Tree2("race_console_standalone root tree");

	race_console_standalone.socker = null; // the client socket
	race_console_standalone.sockerInfo = null; // info about the socket

	const termParams1 = {
		cols: 120,
		rows: 45,
		offx: 8,
		offy: 8
	};
	race_console_standalone.terminal = new Terminal(race_console_standalone.roottree, [.1, 0, 0, 1], race_console_standalone.doCommand, termParams1);
	race_console_standalone.terminal.print("Welcome");

	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
	const waitSec = 1;
};

race_console_standalone.onresize = function() {
	console.log("onresize");
	race_console_standalone.terminal.onresize();
}

race_console_standalone.proc = function() {
	// proc
	race_console_standalone.terminal?.proc(input.key);
	race_console_standalone.roottree.proc(); // probably does nothing
	//doflycam(mainvp); // modify the trs of mainvp using flycam

	// draw
	beginscene(mainvp);
	race_console_standalone.roottree.draw();
};

race_console_standalone.exit = function() {
	race_console_standalone.terminal = null;
	clearTimeout(race_console_standalone.timeout);
	if (race_console_standalone.keepSockInfo) {
		race_console_standalone.socker.off(); // kill all callbacks
	} else if (race_console_standalone.socker) {
		race_console_standalone.socker.disconnect();
	}
	race_console_standalone.socker = null;

	// show current usage before cleanup
	race_console_standalone.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_console_standalone.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	race_console_standalone.roottree = null;
	clearbuts('console');
	logger("exiting webgl race_console_standalone\n");
};
