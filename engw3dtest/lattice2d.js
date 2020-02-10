var lattice2d = {};

// draw lattice scene from 'framebuffer4' normally just to display, help develop interaceAPI

lattice2d.text = "WebGL: draw 3d normally for interlaceAPI, just draw a simple scnene in 1 view, compare with lattice3d for multiView";
lattice2d.title = "MultiView3D 1 View";

// display, use mainvp
lattice2d.roottree; // SCENE, just render to display

// animate some stuff
lattice2d.ang;
lattice2d.leftObjcenterTrans;
lattice2d.rightObjcenterTrans;
lattice2d.leftObj;
lattice2d.rightObj;
lattice2d.angStep = .005;
lattice2d.angAmp = 3;

// for lattice
lattice2d.latticeLevel = 4; // how many sticks in each direction
lattice2d.latticeSeparation = 1; // how far apart are the sticks

lattice2d.calcPos = function(rank) {
//	return -1 + rank*2/(lattice2d.latticeLevel - 1);
	return lattice2d.latticeSeparation*(rank - .5*(lattice2d.latticeLevel - 1));
};

lattice2d.buildLattice = function () {
	var i,j;
	var stickWidth = .04; // width of sticks
	var atreer = new Tree2("Lattice");
	//atreer.scale = [2,2,2];
	var stickScale = lattice2d.calcPos(lattice2d.latticeLevel - 1);
	
	// the master model
	var gpm = buildprism("gridPiece",[1,1,1],"maptestnck.png","tex");
	gpm.mod.flags |= modelflagenums.DOUBLESIDED;
	var zft = .99; // fight 'Z' fighting by making sticks slightly rectangular
	
	// do x
	var gpx = gpm.newdup();
	gpx.scale = [stickScale,stickWidth*zft,stickWidth];
	for (j=0;j<lattice2d.latticeLevel;++j) {
		for (i=0;i<lattice2d.latticeLevel;++i) {
			var gp = gpx.newdup();
			gp.trans = [0,lattice2d.calcPos(i),lattice2d.calcPos(j)];
			atreer.linkchild(gp);
		}
	}
	gpx.glfree();
	
	// do y
	var gpy = gpm.newdup();
	gpy.scale = [stickWidth,stickScale,stickWidth*zft];
	for (j=0;j<lattice2d.latticeLevel;++j) {
		for (i=0;i<lattice2d.latticeLevel;++i) {
			var gp = gpy.newdup();
			gp.trans = [lattice2d.calcPos(i),0,lattice2d.calcPos(j)];
			atreer.linkchild(gp);
		}
	}
	gpy.glfree();
	
	// do z
	var gpz = gpm.newdup();
	gpz.scale = [stickWidth*zft,stickWidth,stickScale];
	for (j=0;j<lattice2d.latticeLevel;++j) {
		for (i=0;i<lattice2d.latticeLevel;++i) {
			var gp = gpz.newdup();
			gp.trans = [lattice2d.calcPos(i),lattice2d.calcPos(j),0];
			atreer.linkchild(gp);
		}
	}
	gpz.glfree();
	
	// free master
	gpm.glfree();
	
	// return result fancy scene
	return atreer;
};

lattice2d.buildWelcome = function () {
	// label fancy scene
	var ftree = new Tree2("welcome sign");
	var scratchfontmodel = new ModelFont("reffont","font3.png","tex",
		1,1,
		64,8,
		true);
	scratchfontmodel.flags |= modelflagenums.DOUBLESIDED;
	var str = "Welcome";
	scratchfontmodel.print(str);
	ftree.setmodel(scratchfontmodel);
	var scaledown = .1;
	var signOffset = 2.4; // 1.25 is golden!
	ftree.trans = [-1*scaledown*str.length,signOffset,-signOffset];
	ftree.scale = [.2,.2,.2];
	return ftree;
};

lattice2d.buildFancyScene = function() {
	var atreef = new Tree2("fancyRoot");
	var lattice = lattice2d.buildLattice();
	atreef.linkchild(lattice);
	var welcome = lattice2d.buildWelcome();
	atreef.linkchild(welcome);
	var atreec = buildsphere("center",.25,"Bark.png","texc");
	atreec.mod.mat.color = [1,1,1,.6];
	atreec.mod.flags |= modelflagenums.HASALPHA
	atreef.linkchild(atreec);
	return atreef;
};

// make some kind of lattice or something
lattice2d.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
	preloadimg("../common/sptpics/smallfont.png");
	preloadimg("../common/sptpics/xpar.png");
};

lattice2d.init = function() {
	logger("entering lattice 2d\n");

	// super sharp specular, remember old value
	lattice2d.oldspecpow = globalmat.specpow;
	globalmat.specpow = 5000;
	
	mainvp = defaultviewport(); // VIEWPORT
	mainvp.trans = [0,0,5];
	
	//// build the scene
	lattice2d.roottree = new Tree2("rootn");
	lattice2d.roottree.trans = [0,0,5];
	lattice2d.roottree.rot = [0,0,0];
	
	// a modelpart
	lattice2d.rightObj = buildsphere("atree2sp",1,"panel.jpg","diffusespecp");
	lattice2d.rightObj.trans = [3,0,0,1];
	lattice2d.rightObjcenterTrans = vec4.clone(lattice2d.rightObj.trans);
	lattice2d.roottree.linkchild(lattice2d.rightObj);
	
	lattice2d.leftObj = buildprism("atree2sq1",[1,1,1],"maptestnck.png","tex");
	lattice2d.leftObj.trans = [-3,0,0,1];
	lattice2d.leftObjcenterTrans = vec4.clone(lattice2d.leftObj.trans);
	lattice2d.roottree.linkchild(lattice2d.leftObj);

	lattice2d.ang = 0;

	var fancyScene = lattice2d.buildFancyScene();
	lattice2d.roottree.linkchild(fancyScene);

	lattice2d.onresize();
};

lattice2d.proc = function() {
	// proc everything
	lattice2d.roottree.proc();

	// move a couple of objects forward and back sinusoidally using ang
	lattice2d.leftObj.trans = [
		lattice2d.leftObjcenterTrans[0],
		lattice2d.leftObjcenterTrans[1],
		lattice2d.leftObjcenterTrans[2] + lattice2d.angAmp*Math.sin(lattice2d.ang)
	];
	
	lattice2d.rightObj.trans = [
		lattice2d.rightObjcenterTrans[0],
		lattice2d.rightObjcenterTrans[1],
		lattice2d.rightObjcenterTrans[2] - lattice2d.angAmp*Math.sin(lattice2d.ang)
	];
	
	doflycam(mainvp); // modify the trs of display vp by flying

	// MAIN SCREEN
	// draw main vp
	beginscene(mainvp);
	lattice2d.roottree.draw(); // depends on FB 1,2,3

	// animate the ang
	lattice2d.ang += lattice2d.angStep;
	if (lattice2d.ang > 2*Math.PI)
		lattice2d.ang -= 2*Math.PI;
};

lattice2d.onresize = function() {
	// will need for lattice3d
	logger("lattice2d: onResize " + glc.clientWidth + " " + glc.clientHeight + "\n");
};

lattice2d.exit = function() {
	globalmat.specpow = lattice2d.oldspecpow;

	// show everything in logs
	logger("=== roottree log ===\n");
	lattice2d.roottree.log();
	logger("before roottree logs\n");
	
	// log resources used before glfree
	logrc();
	
	// cleanup scenes
	lattice2d.roottree.glfree();
	lattice2d.roottree = null;

	logger("after roottree glfree\n");

	// log resources used after glfree, should be empty (execpt for the global resources, fonts etc.)
	logrc();
	
	// put everything the way it was
	mainvp = defaultviewport();
	logger("exiting lattice 2d\n");
};
