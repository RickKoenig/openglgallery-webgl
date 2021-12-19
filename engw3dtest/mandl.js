// mandl state
var mandl = {}; // the 'mandl' state

mandl.text = "Mandelbrot set rendering";
mandl.title = "mandl";

mandl.posPrecision = 5;
mandl.zoomPrecision = 2;
mandl.palettePosPrecision = 2;


mandl.desiredPos = [0,0,0];
mandl.driftPos = .05;

mandl.palettePos = 0.0;
mandl.desiredPalettePos = 0.0;
mandl.driftPalettePos = .05;

mandl.desiredLogZoom = 0;
mandl.logZoom = 0;
mandl.logZoomStep = .05;
mandl.minLogZoom = -1;
mandl.maxLogZoom = 5.5; // example: 4 makes zoom of 10000
mandl.driftZoom = .05;

mandl.rangeZoom = function() {
	if (mandl.desiredLogZoom > mandl.maxLogZoom) {
		mandl.desiredLogZoom = mandl.maxLogZoom;
	} else if (mandl.desiredLogZoom < mandl.minLogZoom) {
		mandl.desiredLogZoom = mandl.minLogZoom;
	}
};

mandl.moreZoom = function() {
	mandl.desiredLogZoom += mandl.logZoomStep;
	mandl.rangeZoom();
};

mandl.lessZoom = function() {
	mandl.desiredLogZoom -= mandl.logZoomStep;
	mandl.rangeZoom();
};

mandl.resetPos = function() {
	mandl.desiredPos[0] = 0;
	mandl.desiredPos[1] = 0;
};

mandl.resetZoom = function() {
	mandl.desiredLogZoom = 0;
};

mandl.toggleColorPalette = function() {
	mandl.desiredPalettePos = 1.0 - mandl.desiredPalettePos;
};

// load these assets before init (none so far)
/*
mandl.load = function() {
};
*/

mandl.init = function() {
	logger("entering webgl mandl\n");

	mandl.pos = [0, 0, 0];
	mandl.desiredPos = [0, 0, 0];
	
	mandl.logZoom = 0;
	mandl.desiredLogZoom = 0;
	
	mandl.palettePos = 0.0;
	mandl.desiredPalettePos = 0.0;

	// ui
	setRepDelay(3, 20); // faster repeat
	setbutsname('mandl');
	mandl.levelarea = makeaprintarea('zoom: ');
	makeabut("Zoom In",null,mandl.moreZoom);
	makeabut("Zoom Out",null,mandl.lessZoom);
	makeabut("Reset pos",mandl.resetPos);
	makeabut("Reset Zoom",mandl.resetZoom);
	makeabut("Toggle Show Color Palette", mandl.toggleColorPalette);

	// build parent
	mandl.roottree = new Tree2("mandl root tree");

	// build a planexy (a square)
	mandl.plane = buildplanexy("aplane",2, 2,"maptestnck.png","mandl");
	mandl.zoomNode = new Tree2("zoom node");

	mandl.plane.trans = [0,0,1];
	mandl.zoomNode.linkchild(mandl.plane);
	mandl.roottree.linkchild(mandl.zoomNode);

	mainvp = defaultviewport();	
	mainvp.clearcolor = [0.05, .255, .505, 1.0];
};

mandl.proc = function() {
	// input / ui
	var faster = input.mbut[1] ? mandl.logZoomStep * 4 : mandl.logZoomStep;
	mandl.desiredLogZoom += input.wheelDelta * faster;
	mandl.rangeZoom();
	var zoom = Math.pow(10, mandl.logZoom);
	var realZoom = zoom * .5; // zoom out because we want to see a -2,-2 to +2,+2 quad
	if (input.mclick[0]) {
		mandl.desiredPos[0] += input.fmx / realZoom;
		mandl.desiredPos[1] += input.fmy / realZoom;
		// clamp position
		var clampVal = 4.0;
		mandl.desiredPos[0] = range(-clampVal, mandl.desiredPos[0], clampVal);
		mandl.desiredPos[1] = range(-clampVal, mandl.desiredPos[1], clampVal);
	}
	
	// proc, copy uniforms to shader using model material
	mandl.plane.mod.mat.palettePos = mandl.palettePos;
	
	// drift
	mandl.pos[0] += (mandl.desiredPos[0] - mandl.pos[0]) * mandl.driftPos;
	mandl.pos[1] += (mandl.desiredPos[1] - mandl.pos[1]) * mandl.driftPos;
	mandl.logZoom += (mandl.desiredLogZoom - mandl.logZoom) * mandl.driftZoom;
	mandl.palettePos += (mandl.desiredPalettePos - mandl.palettePos) * mandl.driftPalettePos;

	// set pos and zoom
	mandl.plane.trans[0] = -mandl.pos[0];
	mandl.plane.trans[1] = -mandl.pos[1];
	mandl.zoomNode.scale = [realZoom, realZoom, 1];

	// show where we are
	printareadraw(mandl.levelarea,"Position = ( " + floatToString(mandl.pos[0], mandl.posPrecision)
		+ ", " + floatToString(mandl.pos[1], mandl.posPrecision) + " )\n"
		+ "Zoom = " + floatToString(zoom, mandl.zoomPrecision)
		+ ", Palette Position = " + floatToString(mandl.palettePos, mandl.palettePosPrecision)
		); // range is from -2,-2 to +2,+2

	mandl.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	mandl.roottree.draw();
};

mandl.exit = function() {
	// show current usage before cleanup
	mandl.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	mandl.roottree.glfree();
	
	clearbuts('mandl');
	resetRepDelay();

	
	// show usage after cleanup
	logrc();
	mandl.roottree = null;
	logger("exiting webgl mandl\n");
};
