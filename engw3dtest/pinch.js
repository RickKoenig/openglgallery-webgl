// test pinch zoom
var pinch = {}; // the 'pinch zoom' state

// BIG TODO: convert to input.fmx and input.fmy

pinch.text = "WebGL: Test pinch zoom, press 't' to change picture";
pinch.title = "Pinch Zoom";

pinch.curPic = 0; // default intent, show first picture

// for now just concentrate on 1:1 asp for input texture
pinch.picList = [
	"scene2.jpg",
	"mayor1.jpg",
	"Alps.jpg",
	"falls.jpg",
	"wide.jpg",
	"light.jpg",
	"take0020.jpg",
	"maptestnck.png",
];

// load these before init
pinch.load = function() {
	preloadimg("../../depth_player/textures/scene2.jpg");
	preloadimg("test2d/mayor1.jpg");
	preloadimg("../../jsbe/example_2_5/Alps.jpg");
	preloadimg("pics/falls.jpg");
	preloadimg("pics/wide.jpg");
	preloadimg("../common/sptpics/light.jpg");
	preloadimg("../common/sptpics/take0020.jpg");
	preloadimg("../common/sptpics/maptestnck.png");
};

pinch.prevTexture = function() {
	--pinch.curPic;
	if (pinch.curPic < 0)
		pinch.curPic = pinch.picList.length - 1;
	changestate(pinch); // relaunch state with new intent
}

pinch.nextTexture = function() {
	++pinch.curPic;
	if (pinch.curPic == pinch.picList.length)
		pinch.curPic = 0;
	changestate(pinch); // relaunch state with new intent
}

pinch.init = function() {
	logger("entering webgl pinch zoom 3D\n");
	pinch.zoom = 5;
	pinch.center = [2, 0];

	// UI
	setbutsname('pinch');
	makeabut("prev texture",null,pinch.prevTexture);
	makeabut("next texture",null,pinch.nextTexture);
	pinch.infoText = makeaprintarea('mouse input');

	mainvp.clearcolor = [.2,.2,.2,1];
	
	// build parent
	pinch.roottree = new Tree2("pinch zoom root tree");

	// build a quadxy (a square)
	pinch.quad = buildplanexy("aquad",1,1,pinch.picList[pinch.curPic],"tex");
	var texture = pinch.quad.mod.reftextures[0];
	const texX = texture.origwidth;
	const texY = texture.origheight;
	pinch.asp = texX / texY;
	logger("picture " + texture.name + ", size = " + texX + ", " + texY 
		+ ", asp = " + pinch.asp.toFixed(3));
	pinch.asp = texX / texY;
	pinch.quad.trans = [0,0,1];
	pinch.roottree.linkchild(pinch.quad);
};

pinch.proc = function() {
	// proc
	// change texture
	if (input.key == "t".charCodeAt(0)) {
		pinch.nextTexture();
	}
	// process input: mouse move and wheel zoom, output: change center and zoom
	// move center
	if (input.mbut[Input.MLEFT]) {
		const delPos = [input.dfmx, input.dfmy];
		vec2.add(pinch.center, pinch.center, delPos);
	}
	// zoom in and out
	let delZoom = input.wheelDelta;
	if (input.wheelDelta) {
	if (input.mbut[Input.MMIDDLE]) delZoom *= 4;
		delZoom = Math.pow(1.1, delZoom); // delta scale, multiply, close to +1
		// condensed formula
		pinch.zoom *= delZoom;
		// constraints, reset if zoom less than 1
		if (pinch.zoom < 1) {
			pinch.zoom = 1;
			pinch.center = vec2.create();
		}
		const fm = vec2.fromValues(input.fmx, input.fmy);
		vec2.sub(pinch.center, pinch.center, fm);
		vec2.scale(pinch.center, pinch.center, delZoom);
		vec2.add(pinch.center, pinch.center, fm);
	}

	// M2V move to trees
	pinch.quad.trans = [pinch.center[0], pinch.center[1], 1];
	if (pinch.asp >= 1) {
		pinch.quad.scale = [pinch.zoom, pinch.zoom / pinch.asp, 1];
	} else {
		pinch.quad.scale = [pinch.zoom * pinch.asp, pinch.zoom, 1];
	}
	
	pinch.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	pinch.roottree.draw();


// show input
	// show state info (pinch zoom)
	printareadraw(pinch.infoText,
		"PINCH STATE" +
		"\ncenter = " +
		pinch.center[0].toFixed(3) + ", " + pinch.center[1].toFixed(3) +
		"\nzoom = " + pinch.zoom.toFixed(3) +
		"\nASP = " + pinch.asp.toFixed(3));	
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

	// remove ui
	clearbuts('pinch');
};
