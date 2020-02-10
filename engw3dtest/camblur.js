var camblur = {};

// test webgl
camblur.roottree;
camblur.atree;

camblur.text = "WebGL: This state uses the GPU to perform some image processing effects, like blurring.";

camblur.title = "Camera Blurring";

camblur.infocnt;

// print some realtime info
camblur.updateinfo = function() {
	//var tx = input.mx / glc.clientWidth;
	//var ty = input.my / glc.clientHeight;
	var tx = (input.mx - (glc.clientWidth - glc.clientHeight)/2)/ glc.clientHeight;
	var ty = input.my / glc.clientHeight;
	printareadraw(camblur.infoarea,"Camblur Info = "  + camblur.infocnt++ + " tex (" + tx.toFixed(3) + "," + ty.toFixed(3) + ")");
	//printareadraw(camblur.infoarea,"Camblur Info = "  + camblur.infocnt++ + " mouse (" + input.mx + "," + input.my + ")");
};
	
// load these before init
camblur.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/light.jpg");
};

camblur.init = function() {
	logger("entering webgl camblur\n");
	
	camblur.roottree = new Tree2("root");

	// build parent prism
	//camblur.atree = buildprism("aprism",[.5,.5,.5],"maptestnck.png","texc"); // helper, builds 1 prism returns a Tree2
	camblur.atree =  buildplanexy("aplane",1,1,"light.jpg","imageblur");

	//camblur.tree0.mod.flags |= modelflagenums.HASALPHA;
	camblur.atree.mat.color=[1,.5,1,1];
	camblur.atree.mat.coord = [.5,.5]; // blur coordinates
	camblur.roottree.linkchild(camblur.atree);	

	// move view back some using LHC
	mainvp.trans = [0,0,-1]; // flycam
	mainvp.rot = [0,0,0]; // flycam

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
	
	// update uniform in imageblur shader
	var tx = (input.mx - (glc.clientWidth - glc.clientHeight)/2)/ glc.clientHeight;
	var ty = input.my / glc.clientHeight;
	camblur.atree.mat.coord = [tx,ty];
	
	// draw
	beginscene(mainvp);
	camblur.roottree.draw();
};

camblur.exit = function() {
	// show current usage
	//debprint.removelist("camblur");
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
