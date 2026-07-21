// draw many 3d objects, also test out websockets
var many = {};
// test webgl
many.roottree = null;
many.text = "WebGL: This state stress tests the matrix functions by displaying 2000 independent model objects using the engine.";
many.title = "Many objects";
many.socker = null;
many.serverNews = "server news";
many.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
};

many.newsCount = 0;
many.init = function() {
	logger("entering webgl many with location host of " + location.host + "\n");
	many.roottree = new Tree2("root");
	many.tree0 = buildprism("aprism",[.5,.5,.5],"maptestnck.png","texc"); // helper, builds 1 prism returns a Tree2
	many.tree0.mod.flags |= modelflagenums.HASALPHA;
	var tree1 = buildprism("aprism2",[.25,.25,.25],"maptestnck.png","tex"); // helper, builds 1 prism returns a Tree2
	tree1.trans = [2,0,0];
	tree1.rotvel = [0,1,0];
	many.tree0.linkchild(tree1);
	var i,j,k,n = 4;
	for (k=0;k<n;++k) {
		for (j=0;j<n;++j) {
			for (i=0;i<n;++i) {
				var cld = many.tree0.newdup();
				cld.name = "dim" + k + j + i;
				cld.mat.color = [Math.random(),Math.random(),Math.random(),.5]; // tree override for model color for flat
				cld.trans = [2.0*i,2.0*j,2.0*k];
				cld.rotvel = [Math.random()*.5,Math.random()*.5,0];
				if (Math.random() >= .5)
					cld.settexture("panel.jpg"); // override model texture with tree texture
				many.roottree.linkchild(cld);
			}
		}
	}
	many.tree0.qrot = [0,.7071,0,.7071];
	tree1.qrot = [.866,0,0,.5];
	many.tree0.trans = [-4,0,0];
	tree1.trans = [-4,0,0];
	many.tree0.mat.color=[1,0,0,1];
	many.roottree.linkchild(many.tree0);
	mainvp.trans = [0,0,-5]; // flycam
	mainvp.rot = [0,0,0]; // flycam
	mainvp.camattach = many.roottree.children[3].children[0];
	mainvp.incamattach = false;
	mainvp.lookat = many.roottree.children[4].children[0];
	debprint.addlist( "many",[
		"many.tree0.trans",
		"many.tree0.mat",
	]);
	// ui
	setbutsname('many');

	// WEBSOCKET
	// info from websocket
	many.infoarea = makeaprintarea('websocket info: ');
	many.updateinfo();
	if (typeof io !== 'undefined') {
		// upgrade to websocket
		many.socker = io.connect("http://" + location.host);
		// see if using websocket or not
		many.socker.on("connect", () => {
			const engine = many.socker.io.engine;
			console.log("Transport method at connection = " 
				+ engine.transport.name);
			many.protocol = engine.transport.name;
			many.hostname = engine.transport.hostname;
			many.updateinfo();
			engine.once("upgrade", () => {
				console.log("Transport method after upgrade = " 
					+ engine.transport.name);
				many.protocol = engine.transport.name;
				many.updateinfo();
			});
		});
		// get id
		many.socker.on('id', function (data) {
			console.log("your ID from server: " + JSON.stringify(data));	
			many.myId = data;
			many.updateinfo();
		});
		// read tilt info from android for 'model'
		many.socker.on('tilt', function (data) {
			if (data != null && typeof data === 'object') {
				// control some webgl stuff from android controller
				mainvp.rot[2] = data.tilt / 1000; // tilt the scene
				console.log("TILT from server: " + JSON.stringify(data));
				if (data.but0) {
					var v = many.tree0.mat.color[1];
					v = range(0,v-.015625,1);
					many.tree0.mat.color[1] = v;
					many.tree0.mat.color[2] = v;
				}
				if (data.but1) {
					var v = many.tree0.mat.color[1];
					v = range(0,v+.015625,1);
					many.tree0.mat.color[1] = v;
					many.tree0.mat.color[2] = v;
				}
			}
		});
		many.socker.on('news', function (strData) {
			console.log("NEWS from server: " + strData + " newsCount " + many.newsCount);
			many.serverNews = strData  + " newsCount " + many.newsCount;
			++many.newsCount;
			many.updateinfo();
		});
	}
};

many.proc = function() {
	many.roottree.proc();
	// draw everything
	doflycam(mainvp); // modify the trs of vp
	beginscene(mainvp);
	many.roottree.draw();
};

many.updateinfo = function() {
	printareadraw(many.infoarea, "myId = " + many.myId
		+ "\nhostname = " + many.hostname
		+ "\nprotocol = " + many.protocol
		+ "\nserverNews = " + many.serverNews);
};
	
many.exit = function() {
	debprint.removelist("many");
	if (many.socker) {
		many.socker.disconnect();
		many.socker = null;
	}
	many.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	many.roottree.glfree();
	logrc();
	many.roottree = null;
	logger("exiting webgl many\n");
	mainvp.camattach = null;
	mainvp.incamattach = false;
	mainvp.lookat = null;
	mainvp.inlookat = false;
	clearbuts('many');
};
