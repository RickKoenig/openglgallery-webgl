'use strict';

// terminal
var race_lobby = {}; // the 'race_lobby' state
race_lobby.text = "WebGL: race_lobby 3D drawing";
race_lobby.title = "race_lobby";

// BEGIN test internet breakage
const testDisconnect = 0;
// when to disconnect
// 0 no test
// 1 race_lobby got go
// 2 race_sentgo init
// 3 race_sentgo proc soon after
// 4 race_sentgo exit
// 5 race_gameState init
// 6 race_gameState proc soon after
const testNotReady = 0;
// when to say ready
// 0 no test, send ready in all inits
// 1 race_sentgo don't send ready
// 2 race_sentgo proc send ready soon after
// 3 race_gameState don't send ready
// 4 race_gameState proc send ready soon after
// socket id to try to break
const testId = 1;
// END test internet breakage

race_lobby.broadcastModes = {
	lobby: 0,
	room: 1,
};
race_lobby.modeStrs = ['L', 'R'];

// load these before init
race_lobby.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

race_lobby.gotoLobby = function() {
    changestate("race_lobby");
}

race_lobby.autoCommandMake = function() {
	// log in and make room p0
	race_lobby.doCommand('e');
	race_lobby.doCommand('m');
}

race_lobby.autoCommandJoin = function() {
	// log in and connect to room p0
	race_lobby.doCommand('e');
	race_lobby.doCommand('j');
}

race_lobby.autoCommand1P = function(g) {
	// log in and make room p0 and go
	race_lobby.doCommand('e');
	race_lobby.doCommand('m');
	race_lobby.doCommand('go ' + g);
}

// get my profile from server after setting name game etc. 
// also has my id and room id if needed
race_lobby.makePromptFromInfo = function(info) {
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
	race_lobby.terminal.print("info = " + JSON.stringify(info, null, '   '));
	let modeStr = race_lobby.modeStrs[info.mode]; // L or R
	if (info.room?.locked) {
		modeStr = 'S';
	} else if (info.roomIdx == 0) {
		modeStr = 'H'; // room host
	}
	let prompt = modeStr;
	if (info.mode == race_lobby.broadcastModes.room) {
		prompt += " [" + info.room.name + "]";
	}
	prompt += " {" + info.name + "}";
	prompt += " >";
	return prompt;
};

race_lobby.setupCallbacks = function(socker, name) {
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
		race_lobby.sockerInfo = info;
		console.log("INFO from server: " + JSON.stringify(info));
		if (socker) {
			const newPrompt = race_lobby.makePromptFromInfo(info);
			race_lobby.terminal.setPrompt(newPrompt);
		} else {
			console.log('on prompt with null socker!!');
			alert('on prompt with null socker!!');
		}
	});

	// server sends message to terminal
	socker.on('message', function(message) {
		race_lobby.terminal.print(message);
	});

	socker.on('disconnect', function (reason) {
		console.log("disconnect reason '" + reason + "'");	
		race_lobby.terminal?.print("disconnect reason '" + reason + "'");
		if (socker) {
			socker.disconnect();
			race_lobby.socker = socker = null; // one side effect
			race_lobby.terminal?.setPrompt(">");
		}
	});

	// broadPack has members: name, id, data
	socker.on('broadcast', function(broadPack) {
		if (!broadPack.data) {
			console.log("no broadPack data, is disconnect from other socket: id = " + broadPack.id + ", roomIdx = " + broadPack.roomIdx);
		} else if (typeof broadPack.data === 'string') {
			console.log("broadcast from server: " + JSON.stringify(broadPack));
			race_lobby.terminal.print("{" + broadPack.name + "} '" + broadPack.data + "'");
		}
	});

	// display news from server
	socker.on('news', function(strData) {
		console.log("NEWS from server: " + strData + " client newsCount " 
			+ race_lobby.clientNewsCount);
			++race_lobby.clientNewsCount;
	});

	socker.on('go', function(gameType) {
		if (race_lobby.sockerInfo.id == testId) { // test disconnect some sockets
			if (testDisconnect == 1) {
				race_lobby.socker?.disconnect(true);
			}
		}
		//const jGoData = JSON.stringify(goData);
		console.log("GO!: '" + gameType + "' client newsCount " 
			+ race_lobby.clientNewsCount);
		race_lobby.terminal.print(gameType);
		++race_lobby.clientNewsCount;
		race_lobby.keepSockInfo = true;
		changestate("race_sentgo", {
			sock: socker,
			info: race_lobby.sockerInfo,
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

race_lobby.doCommand = function(cmdStr) {
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
				race_lobby.terminal.print(words.join(' '));
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
			if (race_lobby.socker) {
				race_lobby.socker.emit('mul', words);
			} else {
				this.print("please connect first with 'enter (name)'!");
			}
			break;
		case "enter":
		case "e":
			// connect
			if (typeof io !== 'undefined') {
				if (race_lobby.socker) {
					race_lobby.terminal.print("already connected!");
				} else {
					// upgrade to websocket
					race_lobby.socker = io.connect("http://" + location.host);
					const name = words[0];
					race_lobby.setupCallbacks(race_lobby.socker, name);
				}
			} else {
				race_lobby.terminal.print("no 'socket IO' library!");
			}
			break;
		case "exit":
			// disconnect
			if (race_lobby.socker) {
				race_lobby.socker.disconnect();
				race_lobby.socker = null;
			} else {
				race_lobby.terminal.print("already disconnected!");
			}
			break;
		case "status":
		case "s":
			// remote, status
			if (race_lobby.socker) {
				race_lobby.socker.emit('status', null);
			} else {
				race_lobby.terminal.print("please connect first with 'enter (name)'!");
			}
			break;
		case "kickme":
			// remote, kill my connection in about 5 seconds
			if (race_lobby.socker) {
				race_lobby.socker.emit('kickme', null);
			} else {
				race_lobby.terminal.print("not connected!");
			}
			break;
		// send a message to everyone
		case "chat":
		case "c":
			if (race_lobby.socker) {
				const message = words.join(' ');
				race_lobby.socker.emit('broadcast', message);
				race_lobby.terminal.print("broadcast '" + message + "'");
			} else {
				race_lobby.terminal.print("not connected!");
			}
			break;

		// rooms
		case "makeroom":
		case "m":
			if (race_lobby.socker) {
				race_lobby.socker.emit('makeroom', words[0]);
			} else {
				race_lobby.terminal.print("not connected!");
			}
			break;
		case "joinroom":
		case "j":
			if (race_lobby.socker) {
				let roomName = words[0];
				if (!roomName) roomName = "p0";
				if (roomName) {
					race_lobby.socker.emit('joinroom', roomName);
				} else {
					race_lobby.terminal.print("usage: joinroom roomname");
				}
			} else {
				race_lobby.terminal.print("not connected!");
			}
			break;
		case "exitroom":
			if (race_lobby.socker) {
				race_lobby.socker.emit('exitroom', null);
			} else {
				race_lobby.terminal.print("not connected!");
			}
			break;

		// start a game
		case "go": // go from room to sim/game, a room that is locked
				   // no new members, host can leave without destroying the room and game
			if (race_lobby.socker) {
				let gameType = words[0];
				if (!gameType || gameType.length != 1 || gameType < 'a' || gameType > 'c') {
					race_lobby.terminal.print("not a valid gameType '" + gameType + "'");
					race_lobby.terminal.print("valid gameTypes are, 'a' thru 'c'");
					break;
				}
				race_lobby.socker.emit('go', gameType);
			} else {
				race_lobby.terminal.print("not connected!");
			}
			break;
		default:
			// local, not a valid command
			this.print("unrecognized command '" + cmdStr + "'");
			break;
	}
}

race_lobby.distColl = function(a, b, dist) {
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

race_lobby.showPoint = function(p) {
	return"(" + p[0].toFixed(4) + ", " + p[1].toFixed(4) + ")";
}

race_lobby.showPointPairs = function(pps) {
	console.log("POINT PAIRS");
	for (const pp of pps) {
		console.log("p0 = [" + race_lobby.showPoint(pp[0]) + ", p1 " + race_lobby.showPoint(pp[1]));
	}
}

// find and list floating point inconsistencies here between firefox and chrome
race_lobby.testFloat = function() {
	let ang = 4 * 2 * Math.PI / 6; // doesn't matter which library
	ang = normalangrad(ang);
	{
		console.log("\nUsing Math library, standard math library");
		const sinAng = Math.sin(ang);
		console.log("TEST FLOAT: ang = " + ang + ", sinAng = " + sinAng);
		let bi = fromFloat(ang);
		console.log("ang to bi = " + bi.toString(16));
		bi = fromFloat(sinAng);
		console.log("sinAng to bi = " + bi.toString(16) + "\n");
	}
	{
		CMath.enable();
		console.log("Using CMath library, consistent math library");
		const sinAng = CMath.sin(ang);
		console.log("TEST FLOAT: ang = " + ang + ", sinAng = " + sinAng);
		let bi = fromFloat(ang);
		console.log("ang to bi = " + bi.toString(16));
		bi = fromFloat(sinAng);
		console.log("sinAng to bi = " + bi.toString(16) + "\n");
		CMath.disable();
	}
}

race_lobby.init = function(intentData) {
	race_lobby.count = 0;
	race_lobby.testFloat();
	race_lobby.keepSockInfo = false;
	race_lobby.clientNewsCount = 0;
	logger("entering webgl race_lobby\n");
	// ui
	setbutsname('lobby');
	makeabut("start game(a), move and push intended for MOBILE", race_lobby.autoCommand1P.bind(this,'a'));
	makeabr();
	makeabut("start game(b), 2d race", race_lobby.autoCommand1P.bind(this,'b'));
	makeabr();
	makeabut("start game(c), move and push V2 fixed", race_lobby.autoCommand1P.bind(this,'c'));
	makeabr();
	makeabut("make room", race_lobby.autoCommandMake);
	makeabut("join room", race_lobby.autoCommandJoin);
	
	// build parent
	race_lobby.roottree = new Tree2("race_lobby root tree");

	race_lobby.socker = null; // the client socket
	race_lobby.sockerInfo = null; // info about the socket

	const termParams1 = {
		cols: 30,
		rows: 24,
		offx: 0,
		offy: 0,
		scale: 2 / 25,
		center: true
	}
	race_lobby.terminal = new Terminal(race_lobby.roottree, race_lobby.doCommand, termParams1);
	race_lobby.terminal.print("Welcome");

	//mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
	// use ndc extra system
	mainvp.extraWidth = 4 / 3;
	mainvp.extraHeight = 1;
	// use ndc extra system
	glc.extraWidth = mainvp.extraWidth;
	glc.extraHeight = mainvp.extraHeight;
	input.extraWidth = mainvp.extraWidth;
	input.extraHeight = mainvp.extraHeight;
};

race_lobby.proc = function() {
	// proc
	race_lobby.terminal?.proc(input.key);
	race_lobby.roottree.proc(); // probably does nothing
	++race_lobby.count;
	// draw
	beginscene(mainvp);
	race_lobby.roottree.draw();
};

race_lobby.exit = function() {
	// reset extra ndc system, output
	glc.extraHeight = 1;
	glc.extraWidth = 1;
	mainvp.extraWidth = 1;
	mainvp.extraHeight = 1;
	// reset extra ndc system, input
	input.extraWidth = 1;
	input.extraHeight = 1;
	race_lobby.terminal = null;
	clearTimeout(race_lobby.timeout);
	if (race_lobby.keepSockInfo) {
		race_lobby.socker.off(); // kill all callbacks
	} else if (race_lobby.socker) {
		race_lobby.socker.disconnect();
	}
	race_lobby.socker = null;

	// show current usage before cleanup
	race_lobby.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_lobby.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	race_lobby.roottree = null;
	clearbuts('lobby');
	logger("exiting webgl race_lobby\n");
};
