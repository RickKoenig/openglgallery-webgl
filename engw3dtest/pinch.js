// test pinch zoom
var pinch = {}; // the 'pinch zoom' state

pinch.text = "WebGL: Test pinch zoom, press 't' to change picture";
pinch.title = "Pinch Zoom";

pinch.curPic = 0; // default intent, show first picture

// for now just concentrate on 1:1 asp for input texture
pinch.picList = [
	"falls.jpg",
	"wide.jpg",
	"light.jpg",
	"take0020.jpg",
	"cube.jpg",
	"cubemap_mountains.jpg",
	"maptestnck.png",
];

// load these before init
pinch.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/light.jpg");
	preloadimg("../common/sptpics/take0020.jpg");
	preloadimg("skybox/cube.jpg");
	preloadimg("pics/falls.jpg");
	preloadimg("pics/wide.jpg");
	preloadimg("skybox/cubemap_mountains.jpg");
};

pinch.aspChanged = function() {
	// resize quad depending on asps
	// nothing // picture turned to square, picture y is matches screen y
	// pinch.quad.scale = [mainvp.asp, 1, 1]; // square stretched to fill the full screen
	if (mainvp.asp > pinch.picAsp) { // portrait, preserve Y, scrunch in X
		pinch.quad.scale = [pinch.picAsp, 1,1 ]; // original picture asp y pic == y screen 
	} else { // landscape, preserve X, scrunch in Y
		pinch.quad.scale = [mainvp.asp, mainvp.asp/pinch.picAsp, 1]; // original picture asp x pic == x screen 
		
	}
};

pinch.calcPinchZoom = function() {
	// move image around
	if (pinch.leftBut) {
		pinch.state.x += pinch.state.z*pinch.input.dx;
		pinch.state.y += pinch.state.z*pinch.input.dy;
	}
	// zoom with mouse wheel
	pinch.state.x -= pinch.input.px*pinch.state.z;
	pinch.state.y -= pinch.input.py*pinch.state.z;
	
	pinch.state.z *= pinch.input.ds;
	
	pinch.state.x += pinch.input.px*pinch.state.z;
	pinch.state.y += pinch.input.py*pinch.state.z;
};

pinch.constrainPinchZoom = function() {
	if (pinch.state.z > 1)
		pinch.state.z = 1;
	if (pinch.state.x < pinch.state.z - 1)
		pinch.state.x = pinch.state.z - 1
	if (pinch.state.x > 0)
		pinch.state.x = 0;
	if (pinch.state.y < pinch.state.z - 1)
		pinch.state.y = pinch.state.z - 1;
	if (pinch.state.y > 0)
		pinch.state.y = 0;
};

pinch.updateMaterial = function() {
	pinch.pinchMat.uvOffset = [-pinch.state.x,-pinch.state.y];
	pinch.pinchMat.uvScale = pinch.state.z;
};

pinch.init = function() {
	pinch.count = 0;
	logger("entering webgl poinch zoom 3D\n");

	// UI
	setbutsname('pinch');
	pinch.inputText = makeaprintarea('mouse input');
	makeahr();
	pinch.stateText = makeaprintarea('pinch zoom state');

	mainvp = defaultviewport();	
	mainvp.clearcolor = [.2,.2,.2,1];
	
	// build parent
	pinch.roottree = new Tree2("pinch zoom root tree");

	// build a quadxy (a square)
	pinch.quad = buildplanexy("aquad",1,1,pinch.picList[pinch.curPic],"pinch");
	pinch.pinchMat = pinch.quad.mod.mat
	var texture = pinch.quad.mod.reftextures[0];
	var texX = texture.origwidth;
	var texY = texture.origheight;
	pinch.picAsp = texX/texY;
	logger("picture size is " + texX + " " + texY);
	pinch.quad.trans = [0,0,1];
	pinch.aspChanged();
	pinch.roottree.linkchild(pinch.quad);
	// PINCH INPUT
	pinch.input = {};
	// pivot point for scale, formula
	pinch.input.px = 0;
	pinch.input.py = 0;
	// vector for move, add
	pinch.input.dx = 0;
	pinch.input.dy = 0;
	// scale for pinch zoom, multiply
	pinch.input.ds = 1;
	// PINCH STATE
	pinch.state = {};
	pinch.state.x = 0; // offset
	pinch.state.y = 0;
	pinch.state.z = 1; // zoom
	pinch.updateMaterial();
};

pinch.proc = function() {
	// proc
	if (input.key == "t".charCodeAt(0)) {
		++pinch.curPic;
		if (pinch.curPic == pinch.picList.length)
			pinch.curPic = 0;
		changestate(pinch); // relaunch state with new intent
		//pinch.quad.mod.changetexture(pinch.picList[pinch.curPic]); // this works too
		
	}
	++pinch.count;
	// do something after 4 seconds
	if (pinch.count == 4*fpswanted) {
		//changestate("solarTest");
		//window.history.back();
		//window.location.href = "../../index.html";
		//window.location.href = "http://janko.at";
	}
	
	// input for pinch zoom
	//input.mx = 128;
	if (mainvp.asp > pinch.picAsp) { // portrait
		pinch.input.px = (1/pinch.picAsp)*mainvp.asp*input.mx/glc.clientWidth; // pivot point for scale, 0 to 1 across picture at scale 1
		pinch.input.py = input.my/glc.clientHeight;
		pinch.input.px += (1 - (1/pinch.picAsp)*mainvp.asp)/2;
		//pinch.input.py += 0;
		pinch.input.dx = (1/pinch.picAsp)*mainvp.asp*input.dmx/glc.clientWidth; // delta x
		pinch.input.dy = input.dmy/glc.clientHeight;
	} else { // landscape
		pinch.input.px = input.mx/glc.clientWidth; // pivot point for scale, 0 to 1 across picture at scale 1
		pinch.input.py = pinch.picAsp*input.my/mainvp.asp/glc.clientHeight;
		//pinch.input.px += 0;
		pinch.input.py += (1 - (pinch.picAsp)/mainvp.asp)/2;
		pinch.input.dx = input.dmx/glc.clientWidth; // delta x
		pinch.input.dy = pinch.picAsp*input.dmy/mainvp.asp/glc.clientHeight;
	}
	
	// calculate pinch zoom from deltas and pivots
	pinch.input.ds = Math.pow(1.1,-input.wheelDelta); // delta scale, multiply, close to +1
	pinch.leftBut = input.mbut[Input.MLEFT];
	
	pinch.calcPinchZoom();
	pinch.constrainPinchZoom();
	pinch.updateMaterial(); // update shader

	
// show input
	printareadraw(pinch.inputText,
		"INPUT\n" +
		"leftBut = " + pinch.leftBut + " wheel = " + input.wheelDelta +	
		"\nmx = " + input.mx + " my = " + input.my +
		"\ndmx = " + input.dmx + " dmy = " + input.dmy +
		"\n\nPINCH INPUT\npx = " + floatToString(pinch.input.px) + " py = " + floatToString(pinch.input.py) +
		"\ndx = " + floatToString(pinch.input.dx) + 
		"\ndy = " + floatToString(pinch.input.dy) + 
		"\nds = " + floatToString(pinch.input.ds));
	
	// show state (pinch zoom)
	printareadraw(pinch.stateText,
		"PINCH STATE" +
		"\nx = " + floatToString(pinch.state.x) + 
		"\ny = " + floatToString(pinch.state.y) +
		"\nzoom = " + floatToString(pinch.state.z));	
	//pinch.inputText.print("hi");
	pinch.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	pinch.roottree.draw();
};

pinch.onresize = function() {
	// mainvp's asp changes automatically
	pinch.aspChanged();
};

pinch.exit = function() {
	// show current usage before cleanup
	pinch.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	pinch.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	pinch.roottree = null;
	logger("exiting webgl pinch zoom 3D\n");

	mainvp = defaultviewport();	
	// remove ui
	clearbuts('pinch');
};
