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
    changestate("race_fill");
}

race_console.init = function(intentData) {
	race_console.count = 0;
	logger("entering webgl race_console 3D\n");

	// ui
	setbutsname('console');
	race_console.lobbyButton = makeabut("lobby", race_console.gotoLobby);
	race_console.fillButton = makeabut("fill", race_console.gotoFill);
	race_console.showIntent = makeaprintarea("intent = '" + intentData + "'");
	
	// build parent
	race_console.roottree = new Tree2("race_console root tree");

	// build a planexy (a square)
	const plane = buildplanexy("aplane",2,2,"maptestnck.png","texDoubleSided");
	plane.mod.flags |= modelflagenums.DOUBLESIDED;
	plane.flags = treeflagenums.DONTDRAWC;
	plane.trans = [0,0,2];
	race_console.roottree.linkchild(plane);

	const cols = 80;
	const rows = 45;
	const depth = glc.clientHeight / 2; //
	const offx = -glc.clientWidth / 2 + 16;
	const offy = glc.clientHeight / 2 - 16;
	const glyphx = 8;
	const glyphy = 16;

	const backgnd = buildplanexy01("aplane2", glyphx * cols, glyphy * rows, null, "flat", 1, 1);
	backgnd.mod.flags |= modelflagenums.NOZBUFFER;
	backgnd.mod.mat.color = [.1, 0, 0, 1];
	backgnd.trans = [offx, offy, depth];
	race_console.roottree.linkchild(backgnd);

	const amodf1big = new ModelFont("amodf1big", "font0.png", "tex", glyphx, glyphy, cols, rows, false);
	amodf1big.flags |= modelflagenums.NOZBUFFER;
	const treef1 = new Tree2("amodf1big");
	treef1.setmodel(amodf1big);
	treef1.trans = [offx, offy, depth];
	race_console.roottree.linkchild(treef1);

	race_console.terminal = new Terminal(amodf1big, race_console.doCommand);

	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
};

race_console.doCommand = function(cmdStr) {
	console.log("got a command from terminal '" + cmdStr + "'");
	const words = cmdStr.trim().split(/\s+/);
	if (!words[0]) return;
	const first = words.shift();
	switch(first) {
		case "help":
			// local
			this.print("commands are:\nhelp echo add mul enter exit status kickme chat");
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
			this.print(sum);
			break;
		case "mul":
			// local, make remote for testing
			let prod = 1;
			for (let ele of words) {
				prod *= parseFloat(ele);
			}
			this.print(prod);
			break;
		case "enter":
			// connect
			if (typeof io !== 'undefined') {
				if (race_console.socker) {
					race_console.terminal.print("already connected!");
				} else {
					const name = words[0] ? words[0] : "player";
					// upgrade to websocket
					race_console.socker = io.connect("http://" + location.host);
					// handle all events from SERVER
					// get id
					race_console.socker.on('id', function (data) {
						console.log("your ID from server: " + JSON.stringify(data));	
						race_console.myId = data;
						race_console.terminal.setPrompt("" + name + " : " + data + " >");
						race_console.terminal.print("myid = " + race_console.myId);
						race_console.socker.emit('name', name);
					});
					race_console.socker.on('status', function (data) {
						console.log("status from server: " + data);	
						race_console.terminal.print("status = " + data);
					});
					// response from server after a 'kickme'
					race_console.socker.on('disconnect', function (data) {
						console.log("disconnect from server: " + data);	
						race_console.terminal.print("disconnect = " + data);
						if (race_console.socker) {
							//race_console.socker.disconnect();
							race_console.socker = null;
							race_console.myId = null;
							race_console.terminal.setPrompt(">");
						}
					});
					race_console.socker.on('broadcast', function (data) {
						const strData = JSON.stringify(data);
						console.log("broadcast from server: " + strData);
						race_console.terminal.print(strData);
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
				race_console.myId = null;
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
				race_console.socker.emit('broadcast', words.join(' '));
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
	if (race_console.socker) {
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
