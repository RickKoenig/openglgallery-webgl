// terminal
var race_console = {}; // the 'race_console' state

race_console.text = "WebGL: race_console 3D drawing";
race_console.title = "race_console";

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

race_console.broadcastModes = {
	lobby: 0,
	room: 1,
	go: 2,
	sim: 3,
	results: 4
};
race_console.modeStrs = ['L', 'R', 'G', 'S', 'R'];

race_console.init = function(intentData) {
	race_console.keepSockInfo = false;
	race_console.count = 0;
	race_console.clientNewsCount = 0;
	logger("entering webgl race_console 3D\n");

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

	// build a planexy (a square)
	const plane = buildplanexy("aplane",2,2,"maptestnck.png","texDoubleSided");
	plane.mod.flags |= modelflagenums.DOUBLESIDED;
	plane.flags = treeflagenums.DONTDRAWC;
	plane.trans = [0,0,2];
	race_console.roottree.linkchild(plane);

	const cols = 120;
	const rows = 45;
	const depth = glc.clientHeight / 2;
	const offx = -glc.clientWidth / 2 + 16;
	const offy = glc.clientHeight / 2 - 16;
	const glyphx = 8;
	const glyphy = 16;

	const backgnd = buildplanexy01("aplane2", glyphx * cols, glyphy * rows, null, "flat", 1, 1);
	backgnd.mod.flags |= modelflagenums.NOZBUFFER;
	backgnd.mod.mat.color = [.1, 0, 0, 1];
	backgnd.trans = [offx, offy, depth];
	race_console.roottree.linkchild(backgnd);

	const amodf1big = new ModelFont("amodf1big", "font0.png", "texc", glyphx, glyphy, cols, rows, false);
	amodf1big.flags |= modelflagenums.NOZBUFFER;
	const treef1 = new Tree2("amodf1big");
	treef1.setmodel(amodf1big);
	treef1.trans = [offx, offy, depth];
	//amodf1big.mat.color = [1,0,0,1];
	race_console.roottree.linkchild(treef1);

	race_console.terminal = new Terminal(amodf1big, race_console.doCommand);

	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
};

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

race_console.doCommand = function(cmdStr) {
	console.log("got a command from terminal '" + cmdStr + "'");
	const words = cmdStr.trim().split(/\s+/);
	if (!words[0]) return;
	const first = words.shift();
	switch(first) {
		case "help":
			// local
			this.print("commands are:\nhelp echo add mul enter exit status kickme chat"
				+ "\nmakeroom joinroom exitroom go");
			break;
		case "echo":
			// local with delay
			setTimeout(function() {
				this.print(words.join(' '));
			}.bind(race_console.terminal), 3000);
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
			// connect
			if (typeof io !== 'undefined') {
				if (race_console.socker) {
					race_console.terminal.print("already connected!");
				} else {
					//const name = words[0] ? words[0] : "player";
					const name = words[0];
					// upgrade to websocket
					race_console.socker = io.connect("http://" + location.host);
					// handle all events from SERVER
					race_console.socker.on('connect', function() {
						if (race_console.socker) {
							if (name) {
								race_console.socker.emit('name', name);
							}
						} else {
							console.log('on id with null socker!!');
							alert('on id with null socker!!');
						}
					});

					race_console.socker.on('prompt', function(info) {
						race_console.sockerInfo = info;
						console.log("INFO from server: " + JSON.stringify(info));
						if (race_console.socker) {
							const newPrompt = race_console.makePromptFromInfo(info);
							race_console.terminal.setPrompt(newPrompt);
						} else {
							console.log('on prompt with null socker!!');
							alert('on prompt with null socker!!');
						}
					});

					// server sends message to terminal
					race_console.socker.on('message', function(message) {
						race_console.terminal.print(message);
					});

					// response from server after a 'kickme'
					race_console.socker.on('disconnect', function (reason) {
						console.log("disconnect reason '" + reason + "'");	
						race_console.terminal.print("disconnect reason '" + reason + "'");
						if (race_console.socker) {
							race_console.socker.disconnect();
							race_console.socker = null;
							//race_console.myId = null;
							race_console.terminal.setPrompt(">");
						}
					});

					// broadPack has members: name, id, data
					race_console.socker.on('broadcast', function(broadPack) {
						if (!broadPack.data) {
							// TODO: handle this
							console.log("no broadPack data, is disconnect from other socket: id = " + broadPack.id + ", roomIdx = " + broadPack.roomIdx);
						} else if (typeof broadPack.data === 'string') {
							console.log("broadcast from server: " + JSON.stringify(broadPack));
							race_console.terminal.print("{" + broadPack.name + "} '" + broadPack.data + "'");
						}
					});

					// display news from server
					race_console.socker.on('news', function(strData) {
						console.log("NEWS from server: " + strData + " client newsCount " 
							+ race_console.clientNewsCount);
							race_console.terminal.print(strData);
							++race_console.clientNewsCount;
					});

					race_console.socker.on('go', function(goData) {
						const jGoData = JSON.stringify(goData);
						console.log("GO!: " + jGoData + " client newsCount " 
							+ race_console.clientNewsCount);
							race_console.terminal.print(jGoData);
							++race_console.clientNewsCount;
							race_console.keepSockInfo = true;
							changestate("race_sentgo", {sock: race_console.socker, info: race_console.sockerInfo});
					});
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
				//race_console.myId = null;
				race_console.terminal.setPrompt(">");
			} else {
				race_console.terminal.print("already disconnected!");
			}
			break;
		case "status":
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
			if (race_console.socker) {
				const message = words.join(' ');
				race_console.socker.emit('broadcast', message);
				race_console.terminal.print("broadcast '" + message + "'");
			} else {
				race_console.terminal.print("not connected!");
			}
			break;


		case "makeroom":
			if (race_console.socker) {
				race_console.socker.emit('makeroom', words[0]);
			} else {
				race_console.terminal.print("not connected!");
			}
			break;
		case "joinroom":
			if (race_console.socker) {
				const roomName = words[0];
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
		case "go": // go from room to sim/game, a room that is locked
					// no new members, host can leave without destroying the room
			if (race_console.socker) {
				race_console.socker.emit('go', null);
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

race_console.proc = function() {
	// proc
	race_console.terminal.proc(input.key);
	++race_console.count;
	// do something after 4 seconds
	if (race_console.count == 4*fpswanted) {
		//changestate("solarTest");
		//window.history.back();
		//window.location.href = "../../index.html";
		//window.location.href = "http://janko.at";
		//return;
	}
	race_console.roottree.proc(); // probably does nothing
	//doflycam(mainvp); // modify the trs of mainvp using flycam

	// draw
	beginscene(mainvp);
	race_console.roottree.draw();
};

race_console.exit = function() {
	if (race_console.socker && !race_console.keepSockInfo) {
		race_console.socker.disconnect();
		race_console.socker = null;
	}
	// show current usage before cleanup
	race_console.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_console.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	race_console.roottree = null;
	clearbuts('console');
	logger("exiting webgl race_console 3D\n");
};
