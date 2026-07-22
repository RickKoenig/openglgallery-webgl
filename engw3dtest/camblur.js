var camblur = {};

// test webgl
camblur.roottree;
camblur.atree;

camblur.text = "WebGL: This state uses the GPU to perform some image processing effects, like blurring.";

camblur.title = "Camera Blurring";

camblur.infocnt;

camblur.tx = 0;
camblur.ty = 0;

// print some realtime info
camblur.updateinfo = function() {
	// convert from mouse to texture coords
	camblur.tx = input.fmx / 2 + .5;
	camblur.ty = .5 - input.fmy / 2;
	printareadraw(camblur.infoarea,"Camblur Info = "  + camblur.infocnt++ 
		+ " tex (" + camblur.tx.toFixed(3) + "," + camblur.ty.toFixed(3) + ")");
};
	
// load these before init
camblur.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/light.jpg"); // world map
};

camblur.init = function() {
	logger("entering webgl camblur\n");
	
	camblur.roottree = new Tree2("root");

	// build parent prism
	camblur.atree =  buildplanexy("aplane",1,1,"light.jpg","imageblur");
	camblur.atree.trans = [0,0,1];

	camblur.atree.mat.color=[1,.5,1,1];
	camblur.atree.mat.coord = [.5,.5]; // blur coordinates
	camblur.roottree.linkchild(camblur.atree);	

	// ui, realtime log update
	setbutsname('camblur');
	camblur.infoarea = makeaprintarea('Camblur Info: ');
	camblur.infocnt = 0;
	camblur.updateinfo();
};

camblur.proc = function() {
	// proc
	camblur.updateinfo();
	camblur.roottree.proc();
	doflycam(mainvp); // modify the trs of vp using flycam
	// update shader uniform
	camblur.atree.mat.coord = [camblur.tx,camblur.ty];
	
	// draw
	beginscene(mainvp);
	camblur.roottree.draw();
};

camblur.exit = function() {
	// show current usage
	camblur.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	camblur.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	camblur.roottree = null;
	logger("exiting webgl camblur\n");
	clearbuts('camblur');
};
