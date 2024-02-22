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

mandl.paletteSlider = null; // element
mandl.paletteOffset = 0.0;
mandl.paletteSpeed = 0.0;

mandl.rangeZoom = function() {
	mandl.desiredLogZoom = range(mandl.minLogZoom, mandl.desiredLogZoom, mandl.maxLogZoom);
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

mandl.handlePaletteSliderSpeed = function(val) {
	mandl.paletteSpeed = parseFloat(val.value);
};

mandl.resetPaletteCycleSpeed = function() {
	mandl.paletteSpeed = 0.0;
	slidersetidx(mandl.paletteSliderSpeed, 0);
};

mandl.handlePaletteSliderOffset = function(val) {
	mandl.paletteOffset = parseFloat(val.value);
	mandl.paletteSpeed = 0.0;
	slidersetidx(mandl.paletteSliderSpeed, 0);
};

mandl.handlePaletteSliderAmp = function(val) {
	mandl.paletteAmp = parseFloat(val.value);
};

mandl.handlePaletteSliderFreq = function(val) {
	mandl.paletteFreq = parseFloat(val.value);
	
};

mandl.handlePaletteSliderRepeat = function(val) {
	mandl.paletteRepeat = parseFloat(val.value);
};

mandl.resetPaletteCycleOffset = function() {
	mandl.paletteOffset = 0.0;
	mandl.paletteSpeed = 0.0;
	slidersetidx(mandl.paletteSliderOffset, 0);
	slidersetidx(mandl.paletteSliderSpeed, 0);
};

mandl.toggleColorPalette = function() {
	mandl.desiredPalettePos = 1.0 - mandl.desiredPalettePos;
};

// load these assets before init (none so far)
mandl.load = function() {
};

mandl.init = function() {
	logger("entering webgl mandl\n");

	mandl.pos = [0, 0, 0];
	mandl.desiredPos = [0, 0, 0];
	
	mandl.logZoom = 0;
	mandl.desiredLogZoom = 0;
	
	mandl.palettePos = 0.0;
	mandl.desiredPalettePos = 0.0;
	
	mandl.paletteOffset = 0.0;
	mandl.paletteSpeed = 0.0;
		
	mandl.paletteAmp = 1.0;
	mandl.paletteFreq = 0.0;
	
	mandl.paletteRepeat = 1.0;

	// ui
	setRepDelay(3, 20); // faster repeat
	setbutsname('mandl');
	makeabut("FULLSCREEN!",gofullscreen);
	mandl.posZoomShowPalette = makeaprintarea('zoom: ');
	makeabut("Zoom In",null,mandl.moreZoom);
	makeabut("Zoom Out",null,mandl.lessZoom);
	makeabut("Reset pos",mandl.resetPos);
	makeabut("Reset Zoom",mandl.resetZoom);
	makeabut("Toggle Show Color Palette", mandl.toggleColorPalette);
	makeahr();
	mandl.offsetArea = makeaprintarea("Offset");
	mandl.paletteSliderOffset = makeaslider(0.0, .9999, 0.0, mandl.handlePaletteSliderOffset, .001);
	makeabr();
	makeabut("Reset Palette Cycle Offset",mandl.resetPaletteCycleOffset);
	makeahr();
	mandl.speedArea = makeaprintarea("Speed");
	mandl.paletteSliderSpeed = makeaslider(-4.0, 4.0, 0.0, mandl.handlePaletteSliderSpeed, .01);
	makeabr();
	makeabut("Reset Palette Cycle Speed",mandl.resetPaletteCycleSpeed);
	makeahr();
	mandl.ampArea = makeaprintarea("Palette Amplitude");
	mandl.paletteSliderAmp = makeaslider(0.0, 1.0, 1.0, mandl.handlePaletteSliderAmp, .05);
	mandl.freqArea = makeaprintarea("Palette Frequency");
	mandl.paletteSliderFreq = makeaslider(0.0, 25.0, 0.0, mandl.handlePaletteSliderFreq, .5);
	mandl.repeatArea = makeaprintarea("Palette Repeat");
	mandl.paletteSliderFreq = makeaslider(1.0, 5.0, 0.0, mandl.handlePaletteSliderRepeat, .1);

	// build parent
	mandl.roottree = new Tree2("mandl root tree");

	// build a planexy (a square)
	mandl.plane = buildplanexy("aplane",2, 2,"maptestnck.png","mandl"); // make it go from -2 to +2 for mandl range
	mandl.plane.mod.flags |= modelflagenums.DOUBLESIDED;

	mandl.zoomNode = new Tree2("zoom node");

	mandl.plane.trans = [0,0,1];
	mandl.zoomNode.linkchild(mandl.plane);
	mandl.roottree.linkchild(mandl.zoomNode);

	mainvp = defaultviewport();	
	mainvp.clearcolor = [0.05, .255, .505, 1.0];
	
	debprint.addlist("mandl variables, fps",[
		"Timers.fpsavg"
	]);
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
	
	// color cycle
	mandl.paletteOffset += mandl.paletteSpeed / 1024.0; // make palette cycling  slow
	if (mandl.paletteOffset < 0.0) {
		mandl.paletteOffset += 1.0;
	} else if (mandl.paletteOffset >= 1.0) {
		mandl.paletteOffset -= 1.0;
	}
	slidersetidx(mandl.paletteSliderOffset, mandl.paletteOffset);
	// proc, copy uniforms to shader using model material
	var mat = mandl.plane.mod.mat;
	mat.palettePos = mandl.palettePos;
	mat.paletteCycleOffset = mandl.paletteOffset;
	mat.paletteRepeat = mandl.paletteRepeat;
	mat.paletteAmp = mandl.paletteAmp;
	mat.paletteFreq = mandl.paletteFreq;
	
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
	printareadraw(mandl.posZoomShowPalette,"Position = ( " + floatToString(mandl.pos[0], mandl.posPrecision)
		+ ", " + floatToString(mandl.pos[1], mandl.posPrecision) + " )\n"
		+ "Zoom = " + floatToString(zoom, mandl.zoomPrecision)
		+ "\nPalette Show Position = " + floatToString(mandl.palettePos, mandl.palettePosPrecision)
		);

	// show palette parameters
	printareadraw(mandl.speedArea, "Palette Speed = " + floatToString(mandl.paletteSpeed, 3));
	printareadraw(mandl.offsetArea, "Palette Offset = " + floatToString(mandl.paletteOffset, 3));
	printareadraw(mandl.repeatArea, "Palette Repeat = " + floatToString(mandl.paletteRepeat, 2));

	printareadraw(mandl.ampArea, "Palette Amplitude = " + floatToString(mandl.paletteAmp, 2));
	printareadraw(mandl.freqArea, "Palette Frequency = " + floatToString(mandl.paletteFreq, 2));
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
	resetRepDelay(); // back to defaults
	debprint.removelist("mandl variables, fps");
	
	// show usage after cleanup
	logrc();
	mandl.roottree = null;
	logger("exiting webgl mandl\n");
};
