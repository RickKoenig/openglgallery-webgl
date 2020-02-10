var lattice3d = {};

// draw lattice scene from 'framebuffer4' develop interaceAPI for multi view

lattice3d.text = "WebGL: test multi view system API, Interleave3D";
lattice3d.title = "MultiView3D multi View";

// display, use mainvp
lattice3d.roottree; // SCENE, just render to display

// multiview interface
lattice3d.multiview;

// animate some stuff
lattice3d.ang;
lattice3d.leftObjcenterTrans;
lattice3d.rightObjcenterTrans;
lattice3d.leftObj;
lattice3d.rightObj;
lattice3d.angStep = .005;
lattice3d.angAmp = 3;

// for lattice
lattice3d.latticeLevel = 4; // how many sticks in each direction
lattice3d.latticeSeparation = 1; // how far apart are the sticks

lattice3d.calcPos = function(rank) {
//	return -1 + rank*2/(lattice3d.latticeLevel - 1);
	return lattice3d.latticeSeparation*(rank - .5*(lattice3d.latticeLevel - 1));
};

lattice3d.buildLattice = function () {
	var i,j;
	var stickWidth = .04; // width of sticks
	var atreer = new Tree2("Lattice");
	//atreer.scale = [2,2,2];
	var stickScale = lattice3d.calcPos(lattice3d.latticeLevel - 1);
	
	// the master model
	var gpm = buildprism("gridPiece",[1,1,1],"maptestnck.png","tex");
	gpm.mod.flags |= modelflagenums.DOUBLESIDED;
	var zft = .99; // fight 'Z' fighting by making sticks slightly rectangular
	
	// do x
	var gpx = gpm.newdup();
	gpx.scale = [stickScale,stickWidth*zft,stickWidth];
	for (j=0;j<lattice3d.latticeLevel;++j) {
		for (i=0;i<lattice3d.latticeLevel;++i) {
			var gp = gpx.newdup();
			gp.trans = [0,lattice3d.calcPos(i),lattice3d.calcPos(j)];
			atreer.linkchild(gp);
		}
	}
	gpx.glfree();
	
	// do y
	var gpy = gpm.newdup();
	gpy.scale = [stickWidth,stickScale,stickWidth*zft];
	for (j=0;j<lattice3d.latticeLevel;++j) {
		for (i=0;i<lattice3d.latticeLevel;++i) {
			var gp = gpy.newdup();
			gp.trans = [lattice3d.calcPos(i),0,lattice3d.calcPos(j)];
			atreer.linkchild(gp);
		}
	}
	gpy.glfree();
	
	// do z
	var gpz = gpm.newdup();
	gpz.scale = [stickWidth*zft,stickWidth,stickScale];
	for (j=0;j<lattice3d.latticeLevel;++j) {
		for (i=0;i<lattice3d.latticeLevel;++i) {
			var gp = gpz.newdup();
			gp.trans = [lattice3d.calcPos(i),lattice3d.calcPos(j),0];
			atreer.linkchild(gp);
		}
	}
	gpz.glfree();
	
	// free master
	gpm.glfree();
	
	// return result fancy scene
	return atreer;
};

lattice3d.buildWelcome = function () {
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

lattice3d.buildFancyScene = function() {
	var atreef = new Tree2("fancyRoot");
	var lattice = lattice3d.buildLattice();
	atreef.linkchild(lattice);
	var welcome = lattice3d.buildWelcome();
	atreef.linkchild(welcome);
	var atreec = buildsphere("center",.25,"Bark.png","texc");
	atreec.mod.mat.color = [1,1,1,.6];
	atreec.mod.flags |= modelflagenums.HASALPHA
	atreef.linkchild(atreec);
	return atreef;
};

// make some kind of lattice or something
lattice3d.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
	preloadimg("../common/sptpics/smallfont.png");
	preloadimg("../common/sptpics/xpar.png");
};

lattice3d.init = function() {
	logger("entering lattice 3d\n");

	// setup the whole multiview system
	lattice3d.multiview = new Interleave3D();
	// super sharp specular, remember old value
	lattice3d.oldspecpow = globalmat.specpow;
	globalmat.specpow = 5000;
	
	mainvp = defaultviewport(); // VIEWPORT
	mainvp.trans = [0,0,5];
	
	//// build the scene
	lattice3d.roottree = new Tree2("rootn");
	lattice3d.roottree.trans = [0,0,5];
	lattice3d.roottree.rot = [0,0,0];
	
	// a modelpart
	lattice3d.rightObj = buildsphere("atree2sp",1,"panel.jpg","diffusespecp");
	lattice3d.rightObj.trans = [3,0,0,1];
	lattice3d.rightObjcenterTrans = vec4.clone(lattice3d.rightObj.trans);
	lattice3d.roottree.linkchild(lattice3d.rightObj);
	
	lattice3d.leftObj = buildprism("atree2sq1",[1,1,1],"maptestnck.png","tex");
	lattice3d.leftObj.trans = [-3,0,0,1];
	lattice3d.leftObjcenterTrans = vec4.clone(lattice3d.leftObj.trans);
	lattice3d.roottree.linkchild(lattice3d.leftObj);

	lattice3d.ang = 0;

	var fancyScene = lattice3d.buildFancyScene();
	lattice3d.roottree.linkchild(fancyScene);

	//lattice3d.onresize();
};

lattice3d.proc = function() {
	// proc everything
	lattice3d.roottree.proc();

	// move a couple of objects forward and back sinusoidally using ang
	lattice3d.leftObj.trans = [
		lattice3d.leftObjcenterTrans[0],
		lattice3d.leftObjcenterTrans[1],
		lattice3d.leftObjcenterTrans[2] + lattice3d.angAmp*Math.sin(lattice3d.ang)
	];
	
	lattice3d.rightObj.trans = [
		lattice3d.rightObjcenterTrans[0],
		lattice3d.rightObjcenterTrans[1],
		lattice3d.rightObjcenterTrans[2] - lattice3d.angAmp*Math.sin(lattice3d.ang)
	];
	
	doflycam(mainvp); // modify the trs of display vp by flying

	// MAIN SCREEN
	// draw main vp
	if (true) { // use interleave and 4 views
		lattice3d.multiview.beginsceneAndDraw(mainvp,lattice3d.roottree);
	} else { // just normal 1 view drawing
		beginscene(mainvp);
		lattice3d.roottree.draw(); // depends on FB 1,2,3
	}

	// animate the ang
	lattice3d.ang += lattice3d.angStep;
	if (lattice3d.ang > 2*Math.PI)
		lattice3d.ang -= 2*Math.PI;
};

lattice3d.onresize = function() {
	// will need for lattice3d
	logger("lattice3d: onResize " + glc.clientWidth + " " + glc.clientHeight + "\n");
	lattice3d.multiview.onresize();
};

lattice3d.exit = function() {
	globalmat.specpow = lattice3d.oldspecpow;

	// show everything in logs
	logger("=== roottree log ===\n");
	lattice3d.roottree.log();
	logger("before roottree logs\n");
	
	// log resources used before glfree
	logrc();
	
	// cleanup scenes
	lattice3d.roottree.glfree();
	lattice3d.roottree = null;

	logger("after roottree glfree\n");
	lattice3d.multiview.glfree();

	// log resources used after glfree, should be empty (execpt for the global resources, fonts etc.)
	logrc();
	
	// put everything the way it was
	mainvp = defaultviewport();
	logger("exiting lattice 2d\n");
};
