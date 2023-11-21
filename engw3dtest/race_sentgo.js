// very minimalist 3D state
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
/*
race_sentgo.addSlot = function(slotIdx, info) {
	console.log("add slot, slotIdx =  " + slotIdx + " info, " + JSON.stringify(info));
	race_sentgo.slots[slotIdx].name = info.name;
	++race_sentgo.fill;
	console.log("add slot = " + JSON.stringify(race_sentgo.slots, null, "   "));
	if (race_sentgo.fill == race_sentgo.slots.length) { // if full
		return true;
	} else {
		return false;
	}
}

race_sentgo.setupSlots = function(sockInfo) {
	race_sentgo.slots = Array(sockInfo.room.slots.length);
	race_sentgo.fill = 0;
	for (let i = 0; i < sockInfo.room.slots.length; ++i) {
		const slot = {
			name: null,
			wid: sockInfo.room.slots[i]
		}
		race_sentgo.slots[i] = slot;		
	}
	console.log("setup slots = " + JSON.stringify(race_sentgo.slots, null, "   "));
}
*/
race_sentgo.setupCallbacks = function(socker) {
	// handle all events from SERVER
	//const name = words[0] ? words[0] : "player";
	//const name = words[0];

	socker.on('disconnect', function (reason) {
		console.log("disconnect reason '" + reason + "'");	
		if (socker) {
			socker.disconnect();
			race_sentgo.socker = socker = null; // one side effect
			//race_sentgo.myId = null;
			changestate("race_console");
		}
	});
/*
	// broadPack has members: name, id, data
	socker.on('broadcast', function(broadPack) {
		if (!broadPack.data) {
			// TODO: handle this
			console.log("no broadPack data, is disconnect from other socket: id = " + broadPack.id + ", roomIdx = " + broadPack.roomIdx);
		} else {
			console.log("broadcast from server: " + JSON.stringify(broadPack));
			race_sentgo.addSlot(broadPack.slotIdx, broadPack.data);
		}
	});
*/
	// message from server
	socker.on('message', function(str) {
		console.log("MESSAGE FROM SERVER " + str);
	});
	// (most) everyone is in this race_sentgo state, or some timed out
	socker.on('allReady', function(allReadyPack) {
		const str = "got ALL READY event:  " + JSON.stringify(allReadyPack, null, '   ');
		console.log(str);
		race_sentgo.terminal.print(str);
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
	//roomName: null,
	//roomLocked: false
*/

race_sentgo.init = function(sockInfo) {
	if (sockInfo) {
		race_sentgo.socker = sockInfo.sock;
		race_sentgo.sockerInfo = sockInfo.info;
		race_sentgo.setupCallbacks(race_sentgo.socker);


		const waitABit = false;
		if (waitABit) {
			// wait a bit before saying I'm ready
			const waitSec = 1 + race_sentgo.sockerInfo.id * 4;
			setTimeout(() => {
				console.log("ready timeout!!!");
				race_sentgo.socker.emit('ready');
			}, 1000 * waitSec);
		} else {
			race_sentgo.socker.emit('ready');
		}

		//race_sentgo.setupSlots(race_sentgo.sockerInfo);
		//race_sentgo.addSlot(sockInfo.info.slotIdx, sockInfo.info);
		/*race_sentgo.socker.emit('broadcast', {
			name: sockInfo.info.name
		});*/
	}
	race_sentgo.count = 0;
	logger("entering webgl race_sentgo\n");

	// ui
	setbutsname('sentgo');
	race_lobby.fillButton = makeabut("console", race_sentgo.gotoConsole);
	race_lobby.fillButton = makeabut("login", race_sentgo.gotoLogin);

    // build parent
	race_sentgo.roottree = new Tree2("race_sentgo root tree");

	// build a planexy (a square)
	// make double sided and test gl_FrontFace (TODO: check spelling)
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","diffusespecp");
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","tex");
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","texDoubleSided");
	//plane.mod.flags |= modelflagenums.DOUBLESIDED;

	const cols = 120;
	const rows = 45;
	const depth = glc.clientHeight / 2;
	const offx = -glc.clientWidth / 2 + 16;
	const offy = glc.clientHeight / 2 - 16;
	const glyphx = 8;
	const glyphy = 16;

	race_sentgo.backgnd = buildplanexy01("aplane2", glyphx * cols, glyphy * rows, null, "flat", 1, 1);
	race_sentgo.backgnd.mod.flags |= modelflagenums.NOZBUFFER;
	race_sentgo.backgnd.mod.mat.color = [.1, 0, 0, 1];
	race_sentgo.backgnd.trans = [offx, offy, depth];
	//race_sentgo.backgnd.flags |= treeflagenums.DONTDRAW
	race_sentgo.roottree.linkchild(race_sentgo.backgnd);

	//plane.trans = [0,0,1];
	//race_sentgo.roottree.linkchild(plane);
	race_sentgo.term = new ModelFont("term", "font0.png", "texc", glyphx, glyphy, cols, rows, false); // might mess up the prompt
	race_sentgo.term.flags |= modelflagenums.NOZBUFFER;
	race_sentgo.treef1 = new Tree2("term");
	race_sentgo.treef1.setmodel(race_sentgo.term);
	race_sentgo.treef1.trans = [offx, offy, depth];
	race_sentgo.treef1.mat.color = [1, 1, 1, 1];
	race_sentgo.roottree.linkchild(race_sentgo.treef1);
	race_sentgo.terminal = new Terminal(race_sentgo.term, null);//race_sentgo.doCommand);

	race_sentgo.terminal.print("SENTGO\n\n"
		+ "sockerinfo = " + JSON.stringify(race_sentgo.sockerInfo) 
		+ "\ncount = " + race_sentgo.count);
		mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
	if (sockInfo) {
		race_sentgo.terminal.print("SENTGO init, id = " 
		+ race_sentgo.sockerInfo.id + " slot = " + race_sentgo.sockerInfo.slotIdx);
	}
};

race_sentgo.onresize = function() {
	console.log("onresize");
	const depth = glc.clientHeight / 2;
	race_sentgo.backgnd.trans[2] = depth;
	race_sentgo.treef1.trans[2] = depth;
}

race_sentgo.proc = function() {
	// proc
	++race_sentgo.count;
	// do something after 4 seconds
	if (race_sentgo.count == 4*fpswanted) {
		//changestate("solarTest");
		//window.history.back();
		//window.location.href = "../../index.html";
		//window.location.href = "http://janko.at";
	}
	race_sentgo.roottree.proc(); // probably does nothing
	
	//doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	race_sentgo.roottree.draw();
};

race_sentgo.exit = function() {
	if (race_sentgo.socker) {
		race_sentgo.socker.disconnect();
		race_sentgo.socker = null;
	}
	// show current usage before cleanup
	race_sentgo.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_sentgo.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	race_sentgo.roottree = null;
	clearbuts('sentgo');
	logger("exiting webgl race_sentgo\n");
};
