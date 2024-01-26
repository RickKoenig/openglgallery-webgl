'use strict';

// terminal
var race_console = {}; // the 'race_console' state
race_console.text = "WebGL: race_console 3D drawing";
race_console.title = "race_console";

// BEGIN test internet breakage
const testDisconnect = 0;
// when to disconnect
// 0 no test
// 1 race_console got go
// 2 race_sentgo init
// 3 race_sentgo proc soon after
// 4 race_sentgo exit
// 5 race_ingame init
// 6 race_ingame proc soon after
const testNotReady = 0;
// when to say ready
// 0 no test, send ready in all inits
// 1 race_sentgo don't send ready
// 2 race_sentgo proc send ready soon after
// 3 race_ingame don't send ready
// 4 race_ingame proc send ready soon after
// socket id to try to break
const testId = 1;
// END test internet breakage

const autoCommands = false; // get to a game quickly

race_console.broadcastModes = {
	lobby: 0,
	room: 1,
};
race_console.modeStrs = ['L', 'R'];

// load these before init
race_console.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

race_console.gotoLobby = function() {
    changestate("race_lobby");
}

race_console.gotoFill = function() {
    changestate("race_sentgo");
}

// get my profile from server after setting name game etc. 
// also has my id and room id if needed
race_console.makePromptFromInfo = function(info) {
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
	race_console.terminal.print("info = " + JSON.stringify(info, null, '   '));
	let modeStr = race_console.modeStrs[info.mode]; // L or R
	if (info.room?.locked) {
		modeStr = 'S';
	} else if (info.roomIdx == 0) {
		modeStr = 'H'; // room host
	}
	let prompt = modeStr;
	if (info.mode == race_console.broadcastModes.room) {
		prompt += " [" + info.room.name + "]";
	}
	prompt += " {" + info.name + "}";
	prompt += " >";
	return prompt;
};

race_console.setupCallbacks = function(socker, name) {
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
		race_console.sockerInfo = info;
		console.log("INFO from server: " + JSON.stringify(info));
		if (socker) {
			const newPrompt = race_console.makePromptFromInfo(info);
			race_console.terminal.setPrompt(newPrompt);
		} else {
			console.log('on prompt with null socker!!');
			alert('on prompt with null socker!!');
		}
	});

	// server sends message to terminal
	socker.on('message', function(message) {
		race_console.terminal.print(message);
	});

	socker.on('disconnect', function (reason) {
		console.log("disconnect reason '" + reason + "'");	
		race_console.terminal.print("disconnect reason '" + reason + "'");
		if (socker) {
			socker.disconnect();
			race_console.socker = socker = null; // one side effect
			race_console.terminal.setPrompt(">");
		}
	});

	// broadPack has members: name, id, data
	socker.on('broadcast', function(broadPack) {
		if (!broadPack.data) {
			console.log("no broadPack data, is disconnect from other socket: id = " + broadPack.id + ", roomIdx = " + broadPack.roomIdx);
		} else if (typeof broadPack.data === 'string') {
			console.log("broadcast from server: " + JSON.stringify(broadPack));
			race_console.terminal.print("{" + broadPack.name + "} '" + broadPack.data + "'");
		}
	});

	// display news from server
	socker.on('news', function(strData) {
		console.log("NEWS from server: " + strData + " client newsCount " 
			+ race_console.clientNewsCount);
			race_console.terminal.print(strData);
			++race_console.clientNewsCount;
	});

	socker.on('go', function(gameType) {
		if (race_console.sockerInfo.id == testId) { // test disconnect some sockets
			if (testDisconnect == 1) {
				race_console.socker?.disconnect(true);
			}
		}
		//const jGoData = JSON.stringify(goData);
		console.log("GO!: '" + gameType + "' client newsCount " 
			+ race_console.clientNewsCount);
		race_console.terminal.print(gameType);
		++race_console.clientNewsCount;
		race_console.keepSockInfo = true;
		changestate("race_sentgo", {
			sock: socker,
			info: race_console.sockerInfo,
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

race_console.doCommand = function(cmdStr) {
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
				race_console.terminal.print(words.join(' '));
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
			if (race_console.socker) {
				race_console.socker.emit('mul', words);
			} else {
				this.print("please connect first with 'enter (name)'!");
			}
			break;
		case "enter":
		case "e":
			// connect
			if (typeof io !== 'undefined') {
				if (race_console.socker) {
					race_console.terminal.print("already connected!");
				} else {
					// upgrade to websocket
					race_console.socker = io.connect("http://" + location.host);
					const name = words[0];
					race_console.setupCallbacks(race_console.socker, name);
				}
			} else {
				race_console.terminal.print("no 'socket IO' library!");
			}
			break;
		case "exit":
			// disconnect
			if (race_console.socker) {
				race_console.socker.disconnect();
				race_console.socker = null;
			} else {
				race_console.terminal.print("already disconnected!");
			}
			break;
		case "status":
		case "s":
			// remote, status
			if (race_console.socker) {
				race_console.socker.emit('status', null);
			} else {
				race_console.terminal.print("please connect first with 'enter (name)'!");
			}
			break;
		case "kickme":
			// remote, kill my connection in about 5 seconds
			if (race_console.socker) {
				race_console.socker.emit('kickme', null);
			} else {
				race_console.terminal.print("not connected!");
			}
			break;
		// send a message to everyone
		case "chat":
		case "c":
			if (race_console.socker) {
				const message = words.join(' ');
				race_console.socker.emit('broadcast', message);
				race_console.terminal.print("broadcast '" + message + "'");
			} else {
				race_console.terminal.print("not connected!");
			}
			break;

		// rooms
		case "makeroom":
		case "m":
			if (race_console.socker) {
				race_console.socker.emit('makeroom', words[0]);
			} else {
				race_console.terminal.print("not connected!");
			}
			break;
		case "joinroom":
		case "j":
			if (race_console.socker) {
				let roomName = words[0];
				if (!roomName) roomName = "p0";
				if (roomName) {
					race_console.socker.emit('joinroom', roomName);
				} else {
					race_console.terminal.print("usage: joinroom roomname");
				}
			} else {
				race_console.terminal.print("not connected!");
			}
			break;
		case "exitroom":
			if (race_console.socker) {
				race_console.socker.emit('exitroom', null);
			} else {
				race_console.terminal.print("not connected!");
			}
			break;

		// start a game
		case "go": // go from room to sim/game, a room that is locked
				   // no new members, host can leave without destroying the room
			if (race_console.socker) {
				let gameType = words[0];
				//if (!gameType) gameType = "a";
				if (gameType != 'a' && gameType != 'b' && gameType != undefined) {
					race_console.terminal.print("not a valid gameType '" + gameType + "'");
					break;
				}
				race_console.socker.emit('go', gameType);
			} else {
				race_console.terminal.print("not connected!");
			}
			break;

		default:
			// local, not a valid command
			this.print("unrecognized command '" + cmdStr + "'");
			break;
	}
}

race_console.testGameClass = function(gameType) {
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

race_console.init = function(intentData) {
	race_console.testGameClass('a');
	//race_console.testEqualsObj();
	//race_console.testFloat();
	race_console.keepSockInfo = false;
	race_console.clientNewsCount = 0;
	logger("entering webgl race_console\n");
	// ui
	setbutsname('console');
	// test state changes
	race_console.lobbyButton = makeabut("lobby", race_console.gotoLobby);
	race_console.fillButton = makeabut("sent go", race_console.gotoFill);
	race_console.showIntent = makeaprintarea("intent = '" + intentData + "'");
	
	// build parent
	race_console.roottree = new Tree2("race_console root tree");

	race_console.socker = null; // the client socket
	race_console.sockerInfo = null; // info about the socket

	const termParams1 = {
		cols: 120,
		rows: 45,
		offx: 8,
		offy: 8
	};
	race_console.terminal = new Terminal(race_console.roottree, [.1, 0, 0, 1], race_console.doCommand, termParams1);
	race_console.terminal.print("Welcome");

	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
	const waitSec = 1;
	if (autoCommands) {
		race_console.timeout = setTimeout(() => {
			race_console.doCommand('e');
			race_console.doCommand('m');
			race_console.doCommand('go');
		}, 1000 * waitSec);

	}
};

race_console.onresize = function() {
	console.log("onresize");
	race_console.terminal.onresize();
}

race_console.proc = function() {
	// proc
	race_console.terminal.proc(input.key);
	race_console.roottree.proc(); // probably does nothing
	//doflycam(mainvp); // modify the trs of mainvp using flycam

	// draw
	beginscene(mainvp);
	race_console.roottree.draw();
};

race_console.exit = function() {
	race_console.terminal = null;
	clearTimeout(race_console.timeout);
	if (race_console.keepSockInfo) {
		race_console.socker.off(); // kill all callbacks
	} else if (race_console.socker) {
		race_console.socker.disconnect();
	}
	race_console.socker = null;

	// show current usage before cleanup
	race_console.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_console.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	race_console.roottree = null;
	clearbuts('console');
	logger("exiting webgl race_console\n");
};
