var framebuffer4 = {};

framebuffer4.text = "WebGL: Test multi view 3D, 't' to toggle viewport flycams / render targets";
framebuffer4.title = "MultiView3D testing area";

// display, use mainvp
framebuffer4.roottree; // SCENE, just render FB n to display

// frame buffer FBn
framebuffer4.roottreen; // SCENE, the one with the off screen render target FB n
framebuffer4.roottreenpp; // SCENE, render to off screen pixel perfect FB n
framebuffer4.frametexnvp; // VIEWPORT, viewport for FB n
framebuffer4.pixelPerfectVp; // VIEWPORT, test pixel perfect SCENE on FB n

// number of views/targets
framebuffer4.numTargets = 4;
framebuffer4.frametexn= new Array(framebuffer4.numTargets); // RENDER TARGETS, FB n
framebuffer4.flycamFBn; // boolean, toggle flycam between mainvp and FB n viewport
//framebuffer4.mergeShaders = {1:"tex",2:"blend2",3:"blend3",4:"blend4",16:"blend16"}; // pick right shader for the number of targets
//framebuffer4.mergeShaders = {1:"tex",2:"redblue",3:"blend3",4:"blend4",16:"blend16"}; // pick right shader for the number of targets
framebuffer4.mergeShaders = {1:"tex",2:"redblue",3:"blend3",4:"interleave4",16:"blend16"}; // pick right shader for the number of targets

// animate some stuff
framebuffer4.ang;
framebuffer4.leftObjcenterTrans;
framebuffer4.rightObjcenterTrans;
framebuffer4.leftObj;
framebuffer4.rightObj;
framebuffer4.angStep = .005;
framebuffer4.angAmp = 3;

// for lattice
framebuffer4.latticeLevel = 4; // how many sticks in each direction
framebuffer4.latticeSeparation = 1; // how far apart are the sticks


// tree planexy of multi FB, to ajust asp 
framebuffer4.fbnPlaneXY;

// which flycam to use, true use the framebuffer, false use the display
framebuffer4.flycamFBn = true;

framebuffer4.calcPos = function(rank) {
//	return -1 + rank*2/(framebuffer4.latticeLevel - 1);
	return framebuffer4.latticeSeparation*(rank - .5*(framebuffer4.latticeLevel - 1));
};

framebuffer4.buildLattice = function () {
	var i,j;
	var stickWidth = .04; // width of sticks
	var atreer = new Tree2("Lattice");
	//atreer.scale = [2,2,2];
	var stickScale = framebuffer4.calcPos(framebuffer4.latticeLevel - 1);
	
	// the master model
	var gpm = buildprism("gridPiece",[1,1,1],"maptestnck.png","tex");
	gpm.mod.flags |= modelflagenums.DOUBLESIDED;
	var zft = .99; // fight 'Z' fighting by making sticks slightly rectangular
	
	// do x
	var gpx = gpm.newdup();
	gpx.scale = [stickScale,stickWidth*zft,stickWidth];
	for (j=0;j<framebuffer4.latticeLevel;++j) {
		for (i=0;i<framebuffer4.latticeLevel;++i) {
			var gp = gpx.newdup();
			gp.trans = [0,framebuffer4.calcPos(i),framebuffer4.calcPos(j)];
			atreer.linkchild(gp);
		}
	}
	gpx.glfree();
	
	// do y
	var gpy = gpm.newdup();
	gpy.scale = [stickWidth,stickScale,stickWidth*zft];
	for (j=0;j<framebuffer4.latticeLevel;++j) {
		for (i=0;i<framebuffer4.latticeLevel;++i) {
			var gp = gpy.newdup();
			gp.trans = [framebuffer4.calcPos(i),0,framebuffer4.calcPos(j)];
			atreer.linkchild(gp);
		}
	}
	gpy.glfree();
	
	// do z
	var gpz = gpm.newdup();
	gpz.scale = [stickWidth*zft,stickWidth,stickScale];
	for (j=0;j<framebuffer4.latticeLevel;++j) {
		for (i=0;i<framebuffer4.latticeLevel;++i) {
			var gp = gpz.newdup();
			gp.trans = [framebuffer4.calcPos(i),framebuffer4.calcPos(j),0];
			atreer.linkchild(gp);
		}
	}
	gpz.glfree();
	
	// free master
	gpm.glfree();
	
	// return result fancy scene
	return atreer;
};

framebuffer4.buildWelcome = function () {
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

framebuffer4.buildFancyScene = function() {
	var atreef = new Tree2("fancyRoot");
	var lattice = framebuffer4.buildLattice();
	atreef.linkchild(lattice);
	var welcome = framebuffer4.buildWelcome();
	atreef.linkchild(welcome);
	var atreec = buildsphere("center",.25,"Bark.png","texc");
	atreec.mod.mat.color = [1,1,1,.6];
	// even without this flag, will still punch a 'alpha hole' in framebuffer
	//atreec.mod.flags |= modelflagenums.HASALPHA
	atreef.linkchild(atreec);
	return atreef;
};

framebuffer4.toggleFlycam = function() {
	framebuffer4.flycamFBn = !framebuffer4.flycamFBn;	
};
/*
framebuffer4.floatToString = function(f,precision) {
	var fs = "" + f;
	if (precision === undefined)
		precision = 6;
	if (fs.charAt(0) == '-') {
		++precision;
	}
	if (fs.length > precision) {
		fs = fs.substr(0,precision);
	}
	return fs;
}
*/
framebuffer4.updateGainText = function() {
	var gainStr = floatToString(framebuffer4.gain);
	printareadraw(framebuffer4.gainPrint,"Gain = " + gainStr);	
};

framebuffer4.updateConvergenceText = function() {
	var convergenceStr = floatToString(framebuffer4.convergence);
	printareadraw(framebuffer4.convergencePrint,"Convergence = " + convergenceStr);	
};

framebuffer4.gainSliderCallback = function(val) {
	framebuffer4.gain = val.value/framebuffer4.gainMul;
	framebuffer4.updateGainText();
};

framebuffer4.convergenceSliderCallback = function(val) {
	framebuffer4.convergence = val.value/framebuffer4.convergenceMul;
	framebuffer4.updateConvergenceText();
};

// make some kind of lattice or something
framebuffer4.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
	preloadimg("../common/sptpics/smallfont.png");
	preloadimg("../common/sptpics/xpar.png");
};

framebuffer4.init = function() {
	logger("entering webgl framebuffer4\n");
	framebuffer4.convergence = .62;
	framebuffer4.gain = .18;
	// gain
	framebuffer4.minGain = -.25;
	framebuffer4.maxGain = .25;
	//framebuffer4.gain = 0;//.75;
	framebuffer4.gainMul = 100.0;
	
	// convergence
	framebuffer4.minConvergence = -1;
	framebuffer4.maxConvergence = 1;
	//framebuffer4.convergence = 0;//.75;
	framebuffer4.convergenceMul = 100.0;

	// UI
	setbutsname('framebuffer4');
	makeabut("Toggle flycam render targets",null,framebuffer4.toggleFlycam);
	
	// gain
	framebuffer4.gainPrint = makeaprintarea('GAIN:');
	makeaslider(
		framebuffer4.minGain*framebuffer4.gainMul,
		framebuffer4.maxGain*framebuffer4.gainMul,
		framebuffer4.gain*framebuffer4.gainMul,
		framebuffer4.gainSliderCallback
	);

	// convergence
	framebuffer4.convergencePrint = makeaprintarea('CONVERGENCE:');
	makeaslider(
		framebuffer4.minConvergence*framebuffer4.convergenceMul,
		framebuffer4.maxConvergence*framebuffer4.convergenceMul,
		framebuffer4.convergence*framebuffer4.convergenceMul,
		framebuffer4.convergenceSliderCallback
	);
	
	framebuffer4.updateGainText();
	framebuffer4.updateConvergenceText();

	// super sharp specular, remember old value
	framebuffer4.oldspecpow = globalmat.specpow;
	globalmat.specpow = 5000;
	
	// build render targets
	var i;
	for (i=0;i<framebuffer4.numTargets;++i) {
		framebuffer4.frametexn[i] = FrameBufferTexture.createtexture("rendertex" + i,glc.clientWidth,glc.clientHeight);
	}

	// build some viewports
	framebuffer4.frametexnvp = {
		target:framebuffer4.frametexn[0],
		clearflags:gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
		clearcolor:[0,1,0,.9375],
		"trans":[0,0,5],
		"rot":[0,0,0],
		near:.002,
		far:10000.0,
		zoom:1,
		asp:gl.asp,
		xo:0,
		yo:0,
		xs:1,
		ys:1
	};
	
	// pixel perfect font viewport
	framebuffer4.pixelPerfectVp = {
		// where to draw
		target:framebuffer4.frametexn[0],
		// view volume
		near:-100,
		far:100,
		asp:gl.asp,
		isortho:true,
		ortho_size:glc.clientHeight/2, // make pixel perfect
		xo:0,
		yo:0,
		xs:1,
		ys:1
	};

	mainvp = defaultviewport();
	
	//// build the off screen scene FB n
	framebuffer4.roottreen = new Tree2("rootn");
	framebuffer4.roottreen.trans = [0,0,5];
	framebuffer4.roottreen.rot = [0,0,0];
	
	// a modelpart
	framebuffer4.rightObj = buildsphere("atree2sp",1,"panel.jpg","diffusespecp");
	framebuffer4.rightObj.trans = [3,0,0,1];
	framebuffer4.rightObjcenterTrans = vec4.clone(framebuffer4.rightObj.trans);
	framebuffer4.roottreen.linkchild(framebuffer4.rightObj);
	
	framebuffer4.leftObj = buildprism("atree2sq1",[1,1,1],"maptestnck.png","tex");
	framebuffer4.leftObj.trans = [-3,0,0,1];
	framebuffer4.leftObjcenterTrans = vec4.clone(framebuffer4.leftObj.trans);
	framebuffer4.roottreen.linkchild(framebuffer4.leftObj);

	framebuffer4.ang = 0;

	var fancyScene = framebuffer4.buildFancyScene();
	framebuffer4.roottreen.linkchild(fancyScene);
	
	// build pixel perfect scene
	// build pixel perfect font model and tree for screen output
    framebuffer4.fontmodel = new ModelFont("pp model","smallfont.png","font2c",8,8,100,100);
    framebuffer4.fontmodel.mat.fcolor = [0,1,0,1];
    framebuffer4.fontmodel.mat.bcolor = [0,0,0,1];
    framebuffer4.fontmodel.flags |= modelflagenums.NOZBUFFER; // always in front when drawn
	framebuffer4.fontmodel.print("Pixel perfect ###\\");
	framebuffer4.roottreenpp = new Tree2("pixel perfect roottree");
	framebuffer4.roottreenpp.setmodel(framebuffer4.fontmodel);

	// build the main screen scene last so we can hook up render targets, depends on FB 1
	framebuffer4.roottree = new Tree2("root");
	framebuffer4.mixShader = framebuffer4.mergeShaders[framebuffer4.numTargets];
	logger("MIXSHADER = '" + framebuffer4.mixShader + "'\n");
	if (framebuffer4.mixShader) { // if a shader can handle numTargets, build quad
		var textureList = [];
		for (var i = 0; i < framebuffer4.numTargets; ++i) {
			var rt = "rendertex" + i;
			textureList.push(rt);
		}
		//framebuffer4.fbnPlaneXY = buildplanexy("aplane",1,1,"Bark.png",mixShader);
		//framebuffer4.fbnPlaneXY = buildplanexy("aplane",1,1,"xpar.png",mixShader);
		framebuffer4.fbnPlaneXY = buildplanexyNt("aplane",1,1,textureList,framebuffer4.mixShader);
		framebuffer4.fbnPlaneXY.scale = [1,-1,1];
		//framebuffer4.fbnPlaneXY.mod.flags &= ~modelflagenums.HASALPHA; // draw backface since scale has a -1
		framebuffer4.fbnPlaneXY.mod.flags |= modelflagenums.HASALPHA; // draw backface since scale has a -1
		framebuffer4.fbnPlaneXY.mod.flags |= modelflagenums.DOUBLESIDED; // draw backface since scale has a -1
		framebuffer4.fbnPlaneXY.trans = [0,0,1];
		framebuffer4.roottree.linkchild(framebuffer4.fbnPlaneXY);
	}
	
	// add a couple more tree nodes to rootree
	// build a prism
	var cub =  buildprism("abox",[.25,.25,.25],"maptestnck.png","diffusespecp");
	cub.trans = [1,0,0];
	framebuffer4.roottree.linkchild(cub);	
	
	// build a sphere
	var sph =  buildsphere("asphere",.25,"maptestnck.png","diffusespecp");
	sph.trans = [-1,0,0];
	framebuffer4.roottree.linkchild(sph);

	// some more
	cub = cub.newdup();
	cub.trans = [1,0,3];
	framebuffer4.roottree.linkchild(cub);

	cub = cub.newdup();
	cub.trans = [-1.0/3.0,0,3];
	cub.rotvel = [0,2*Math.PI/10,0];
	framebuffer4.roottree.linkchild(cub);

	sph = sph.newdup();
	sph.trans = [-1,0,3];
	framebuffer4.roottree.linkchild(sph);

	sph = sph.newdup();
	sph.trans = [1.0/3.0,0,3];
	sph.rotvel = [0,2*Math.PI/10,0];
	framebuffer4.roottree.linkchild(sph);



	// debug pixel perfect viewport
	debprint.addlist("framebuffer4 viewports",[
		"framebuffer4.pixelPerfectVp",
		"framebuffer4.frametexnvp",
	]);
	// debug pixel FB n viewport
	debprint.addlist("rotate FB n scene",[
		"framebuffer4.roottreen.rot",
	]);
	framebuffer4.onresize();

};

framebuffer4.proc = function() {
	// proc everything
	framebuffer4.roottree.proc();
	framebuffer4.roottreen.proc();

	// toggle viewports
	if (input.key == "t".charCodeAt(0)) {
		framebuffer4.toggleFlycam();
	}
	
	// move a couple of objects forward and back sinusoidally using ang
	framebuffer4.leftObj.trans = [
		framebuffer4.leftObjcenterTrans[0],
		framebuffer4.leftObjcenterTrans[1],
		framebuffer4.leftObjcenterTrans[2] + framebuffer4.angAmp*Math.sin(framebuffer4.ang)
	];
	
	framebuffer4.rightObj.trans = [
		framebuffer4.rightObjcenterTrans[0],
		framebuffer4.rightObjcenterTrans[1],
		framebuffer4.rightObjcenterTrans[2] - framebuffer4.angAmp*Math.sin(framebuffer4.ang)
	];

	// flycam either the FB's or the display viewport
	if (framebuffer4.flycamFBn) {
		doflycam(framebuffer4.frametexnvp); // modify the trs of FB1 vp by flying
	} else {
		doflycam(mainvp); // modify the trs of display vp by flying
	}
	
	// draw to frame buffers and main screen
	
	// draw to each frame buffer FB n
	// save viewport FB n's trans
	
	// this
	//var oldtrans = [0,0,0];
	//vec3.copy(oldtrans,framebuffer4.frametexnvp.trans);
	
	// or this
	var oldtrans = vec3.clone(framebuffer4.frametexnvp.trans);
	
	// gain
	var transVec = [framebuffer4.gain*2/framebuffer4.numTargets,0,0];
	//var transVec = [0,0,0];
	
	// get viewport orientation matrix and move transVec to world space
	var tm = mat4.create(); // matrix to spread cameras apart
	buildtransrotscale(tm,framebuffer4.frametexnvp);
	vec3.transformMat4Vec(transVec,transVec,tm);

	// now run through each render target and use appropriate viewport for each one for draw pass
	var nt = framebuffer4.numTargets; // number of targets
	var gc = framebuffer4.convergence*framebuffer4.gain*2/framebuffer4.numTargets;
	for (var i = 0; i < nt; ++i) {
		var rt = framebuffer4.frametexn[i]; // render target
		// place cameras in camera space and convert to world space
		var scl = i - nt*.5 + .5; // 0 : -.5,.5 : -1,0,1 : -1.5,-.5,.5,1.5 etc...
		var conv = (i - nt*.5 +.5)*gc;
		var trans = framebuffer4.frametexnvp.trans;
		framebuffer4.frametexnvp.xo = conv;
		vec3.scale(trans,transVec,scl);
		vec3.add(trans,trans,oldtrans);
		// draw FBn scene
		framebuffer4.frametexnvp.target = rt;
		beginscene(framebuffer4.frametexnvp);
		framebuffer4.roottreen.draw();
		
		// draw pixel perfect scene
		framebuffer4.pixelPerfectVp.target = rt;
		beginscene(framebuffer4.pixelPerfectVp);
		framebuffer4.roottreenpp.draw();
	}
	framebuffer4.frametexnvp.trans = oldtrans;
	framebuffer4.frametexnvp.xo = 0;
	

	// MAIN SCREEN
	// draw main vp
	beginscene(mainvp);
	if (framebuffer4.fbnPlaneXY) {
		framebuffer4.fbnPlaneXY.scale = [gl.asp,-1,1];
	}
	framebuffer4.roottree.draw(); // depends on FB 1,2,3

	// animate the ang
	framebuffer4.ang += framebuffer4.angStep;
	if (framebuffer4.ang > 2*Math.PI)
		framebuffer4.ang -= 2*Math.PI;
};

framebuffer4.onresize = function() {
	for (var i = 0; i < framebuffer4.numTargets; ++i) {
		var rt = framebuffer4.frametexn[i];
		rt.resize(glc.clientWidth,glc.clientHeight);
	}
	//mainvp.asp = 1; // tweek the asp, hack, put this back to 1 after main3d onresize of mainvp, TODO: should use another viewport
	framebuffer4.frametexnvp.asp = gl.asp;
	framebuffer4.pixelPerfectVp.asp = gl.asp;
	framebuffer4.pixelPerfectVp.ortho_size = glc.clientHeight/2; // make pixel perfect
        
	//ViewPort.mainvp = new ViewPort();
	if ("interleave4" == framebuffer4.mixShader) { // need resolution uniforms for this shader
		framebuffer4.fbnPlaneXY.mat.resolution = [glc.clientWidth,glc.clientHeight];
		//framebuffer4.fbnPlaneXY.mat.put("resolution",new float[] {Main3D.viewWidth,Main3D.viewHeight});
	}
};

framebuffer4.exit = function() {
	globalmat.specpow = framebuffer4.oldspecpow;

	// show everything in logs
	logger("=== roottree log ===\n");
	framebuffer4.roottree.log();
	logger("=== roottree pp log ===\n");
	framebuffer4.roottreenpp.log();
	logger("=== roottreen log ===\n");
	framebuffer4.roottreen.log();
	logger("before roottree logs\n");
	
	// log resources used before glfree
	logrc();
	
	// cleanup scenes
	framebuffer4.roottree.glfree();
	framebuffer4.roottree = null;
	framebuffer4.roottreen.glfree();
	framebuffer4.roottreen = null;
	framebuffer4.roottreenpp.glfree();
	framebuffer4.roottreenpp = null;
	
	// cleanup render targets
	for (var i=0;i<framebuffer4.numTargets;++i) {
		framebuffer4.frametexn[i].glfree();
		framebuffer4.frametexn[i] = null;
	}

	logger("after roottree glfree\n");

	// log resources used after glfree, should be empty (execpt for the global resources, fonts etc.)
	logrc();
	
	// put everything the way it was
	mainvp = defaultviewport();
	
	// remove custom debprint sections
	debprint.removelist("framebuffer4 viewports");
	debprint.removelist("rotate FB n scene");

	// remove ui
	clearbuts('framebuffer4');

	logger("exiting webgl framebuffer4\n");
};
