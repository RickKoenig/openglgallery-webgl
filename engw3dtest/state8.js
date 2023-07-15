// draw many 3d objects, also test out websockets
var state8 = {};
// test webgl
state8.roottree = null;
state8.text = "WebGL: This state stress tests the matrix functions by displaying 2000 independent model objects using the engine.";
state8.title = "Many objects";
state8.socker = null;

state8.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
};

state8.init = function() {
	logger("entering webgl state8 with location host of " + location.host + "\n");
	state8.roottree = new Tree2("root");
	state8.tree0 = buildprism("aprism",[.5,.5,.5],"maptestnck.png","texc"); // helper, builds 1 prism returns a Tree2
	state8.tree0.mod.flags |= modelflagenums.HASALPHA;
	var tree1 = buildprism("aprism2",[.25,.25,.25],"maptestnck.png","tex"); // helper, builds 1 prism returns a Tree2
	tree1.trans = [2,0,0];
	tree1.rotvel = [0,1,0];
	state8.tree0.linkchild(tree1);
	var i,j,k,n = 4;
	for (k=0;k<n;++k) {
		for (j=0;j<n;++j) {
			for (i=0;i<n;++i) {
				var cld = state8.tree0.newdup();
				cld.name = "dim" + k + j + i;
				cld.mat.color = [Math.random(),Math.random(),Math.random(),.5]; // tree override for model color for flat
				cld.trans = [2.0*i,2.0*j,2.0*k];
				cld.rotvel = [Math.random()*.5,Math.random()*.5,0];
				if (Math.random() >= .5)
					cld.settexture("panel.jpg"); // override model texture with tree texture
				state8.roottree.linkchild(cld);
			}
		}
	}
	state8.tree0.qrot = [0,.7071,0,.7071];
	tree1.qrot = [.866,0,0,.5];
	state8.tree0.trans = [-4,0,0];
	tree1.trans = [-4,0,0];
	state8.tree0.mat.color=[1,0,0,1];
	state8.roottree.linkchild(state8.tree0);
	mainvp.trans = [0,0,-5]; // flycam
	mainvp.rot = [0,0,0]; // flycam
	mainvp.camattach = state8.roottree.children[3].children[0];
	mainvp.incamattach = false;
	mainvp.lookat = state8.roottree.children[4].children[0];
	debprint.addlist( "state8",[
		"state8.tree0.trans",
		"state8.tree0.mat",
	]);
	// ui
	setbutsname('many');

	// WEBSOCKET
	// info from websocket
	state8.infoarea = makeaprintarea('websocket info: ');
	state8.infocnt = 0;
	state8.updateinfo();
	if (typeof io !== 'undefined') {
		// upgrade to websocket
		state8.socker = io.connect("http://" + location.host);
		// see if using websocket or not
		state8.socker.on("connect", () => {
			const engine = state8.socker.io.engine;
			console.log("Transport method at connection = " 
				+ engine.transport.name);
			state8.protocol = engine.transport.name;
			state8.hostname = engine.transport.hostname;
			state8.updateinfo();
			engine.once("upgrade", () => {
				console.log("Transport method after upgrade = " 
					+ engine.transport.name);
				state8.protocol = engine.transport.name;
				state8.updateinfo();
			});
		});
		// get id
		state8.socker.on('id', function (data) {
			console.log("your ID from server: " + JSON.stringify(data));	
			state8.myId = data;
			state8.updateinfo();
		});
		// read tilt info from android for 'model'
		state8.socker.on('tilt', function (data) {
			if (data != null && typeof data === 'object') {
				if (data.controller) {
					// control some webgl stuff from android controller
					mainvp.rot[2] = data.controller.tilt / 1000; // tilt the scene
					console.log("TILT from server: " + JSON.stringify(data));
					if (data.controller.but0) {
						var v = state8.tree0.mat.color[1];
						v = range(0,v-.015625,1);
						state8.tree0.mat.color[1] = v;
						state8.tree0.mat.color[2] = v;
					}
					if (data.controller.but1) {
						var v = state8.tree0.mat.color[1];
						v = range(0,v+.015625,1);
						state8.tree0.mat.color[1] = v;
						state8.tree0.mat.color[2] = v;
					}
				} else {
					console.log(data);
				}
			}
		});
		state8.socker.on('news', function (data) {
			if (data != null && typeof data === 'object') {
				state8.serverNews = JSON.stringify(data);
				console.log("NEWS from server: " + state8.serverNews);
				state8.updateinfo();
			}
		});
	}
};

state8.proc = function() {
	//state8.updateinfo();
	state8.roottree.proc();
	// send some data back to the server
	++state8.infocnt;
	if (state8.socker) {
		if (state8.infocnt % (state8.myId + 100) == 0) {
			const browserInfo = {count : state8.infocnt};
			console.log("BROWSERINFO: <id " + state8.myId + "> " + JSON.stringify(browserInfo));
			state8.socker.emit('browserInfo', browserInfo);
			state8.updateinfo();
		}
	}

	// draw everything
	doflycam(mainvp); // modify the trs of vp
	beginscene(mainvp);
	state8.roottree.draw();
};

state8.updateinfo = function() {
	printareadraw(state8.infoarea, "myId = " + state8.myId
		+ "\nmy count = " + state8.infocnt
		+ "\nhostname = " + state8.hostname
		+ "\nprotocol = " + state8.protocol
		+ "\nserverNews = " + state8.serverNews);
};
	
state8.exit = function() {
	debprint.removelist("state8");
	if (state8.socker) {
		state8.socker.disconnect();
		state8.socker = null;
	}
	state8.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	state8.roottree.glfree();
	logrc();
	state8.roottree = null;
	logger("exiting webgl state8\n");
	mainvp.camattach = null;
	mainvp.incamattach = false;
	mainvp.lookat = null;
	mainvp.inlookat = false;
	clearbuts('many');
};
