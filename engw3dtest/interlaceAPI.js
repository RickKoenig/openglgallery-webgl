// an API to make drawing 3D interleave easier

function Interleave3D() {
	
	Interleave3D.numTargets = 4;

	// gain
	Interleave3D.minGain = -.25;
	Interleave3D.maxGain = .25;
	//Interleave3D.gain = 0;//.75;
	//Interleave3D.gainMul = 100.0;
	Interleave3D.gainStep = .01;

	// convergence
	Interleave3D.minConvergence = -1;
	Interleave3D.maxConvergence = 1;
	//Interleave3D.convergence = 0;//.75;
	//Interleave3D.convergenceMul = 100.0;
	Interleave3D.convergenceStep = .01;

	// UI
	setbutsname("Multiview");

	// gain
	Interleave3D.gainPrint = makeaprintarea('GAIN:');
	makeaslider(
		Interleave3D.minGain,
		Interleave3D.maxGain,
		Interleave3D.gain,
		Interleave3D.gainSliderCallback,
		Interleave3D.gainStep
	);

	// convergence
	Interleave3D.convergencePrint = makeaprintarea('CONVERGENCE:');
	makeaslider(
		Interleave3D.minConvergence,
		Interleave3D.maxConvergence,
		Interleave3D.convergence,
		Interleave3D.convergenceSliderCallback,
		Interleave3D.convergenceStep
	);
	makeahr();
	makeabut("3D toggle",Interleave3D.toggle3D);
	
	Interleave3D.updateGainText();
	Interleave3D.updateConvergenceText();
	
		// build render targets
	Interleave3D.frametexn= new Array(Interleave3D.numTargets); // RENDER TARGETS, FB n
	globaltexflags |= textureflagenums.NOFLOAT;
	for (var i=0;i<Interleave3D.numTargets;++i) {
		Interleave3D.frametexn[i] = FrameBufferTexture.createtexture("rendertex" + i,glc.clientWidth,glc.clientHeight);
	}
	globaltexflags &= ~textureflagenums.NOFLOAT;
	
/*
	// build some viewports
	Interleave3D.frametexnvp = {
		target:Interleave3D.frametexn[0],
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
	}; */
	
	Interleave3D.interleaveVP = defaultviewport();
	
	// build the main screen scene last so we can hook up render targets, depends on FB 1
	Interleave3D.roottree = new Tree2("Interleave3Droot");
	Interleave3D.mixShader = "interleave4";
	logger("MIXSHADER = '" + Interleave3D.mixShader + "'\n");

	var textureList = [];
	for (var i = 0; i < Interleave3D.numTargets; ++i) {
		var rt = "rendertex" + i;
		textureList.push(rt);
	}
	//Interleave3D.fbnPlaneXY = buildplanexy("aplane",1,1,"Bark.png",mixShader);
	//Interleave3D.fbnPlaneXY = buildplanexy("aplane",1,1,"xpar.png",mixShader);
	Interleave3D.fbnPlaneXY = buildplanexyNt("aplane",1,1,textureList,Interleave3D.mixShader);
	Interleave3D.fbnPlaneXY.scale = [1,-1,1];
	Interleave3D.fbnPlaneXY.mod.flags &= ~modelflagenums.HASALPHA;
	//Interleave3D.fbnPlaneXY.mod.flags |= modelflagenums.HASALPHA;
	Interleave3D.fbnPlaneXY.mod.flags |= modelflagenums.DOUBLESIDED; // draw backface since scale has a -1
	Interleave3D.fbnPlaneXY.trans = [0,0,1];
	Interleave3D.roottree.linkchild(Interleave3D.fbnPlaneXY);

	this.onresize();
	debprint.addlist("interlaceAPI",[
		"Interleave3D.interleaveVP",
	]);
 }

Interleave3D.convergence = .62;
Interleave3D.gain = .18;
Interleave3D.interleaveMode = false;

Interleave3D.toggle3D = function() {
	Interleave3D.interleaveMode = !Interleave3D.interleaveMode;
};

Interleave3D.updateGainText = function() {
	var gainStr = floatToString(Interleave3D.gain);
	printareadraw(Interleave3D.gainPrint,"Gain = " + gainStr);	
};

Interleave3D.updateConvergenceText = function() {
	var convergenceStr = floatToString(Interleave3D.convergence);
	printareadraw(Interleave3D.convergencePrint,"Convergence = " + convergenceStr);	
};

Interleave3D.gainSliderCallback = function(val) {
	Interleave3D.gain = parseFloat(val.value);
	Interleave3D.updateGainText();
};

Interleave3D.convergenceSliderCallback = function(val) {
	Interleave3D.convergence = parseFloat(val.value);
	Interleave3D.updateConvergenceText();
};


// free all GL resources and also the UI
Interleave3D.prototype.glfree = function() {
		// remove ui
	clearbuts("Multiview");
	// cleanup render targets
	for (var i=0;i<Interleave3D.numTargets;++i) {
		Interleave3D.frametexn[i].glfree();
		Interleave3D.frametexn[i] = null;
	}
	Interleave3D.roottree.glfree();
	debprint.removelist("interlaceAPI");
};



Interleave3D.prototype.onresize = function() {
	globaltexflags |= textureflagenums.NOFLOAT;
	for (var i = 0; i < Interleave3D.numTargets; ++i) {
		var rt = Interleave3D.frametexn[i];
		rt.resize(glc.clientWidth,glc.clientHeight);
	}
	globaltexflags &= ~textureflagenums.NOFLOAT;

	Interleave3D.interleaveVP.asp = gl.asp;
	Interleave3D.fbnPlaneXY.mat.resolution = [glc.clientWidth,glc.clientHeight];
};

Interleave3D.prototype.beginsceneAndDraw = function(viewPort,scene) {
		//beginscene(viewPort);
		//scene.draw(); // depends on FB 1,2,3
	if (!Interleave3D.interleaveMode) {
		beginscene(viewPort);
		scene.draw();
		return;
	}
	var oldtrans = vec3.clone(viewPort.trans);
	
	// gain
	var transVec = [Interleave3D.gain*2/Interleave3D.numTargets,0,0];
	
	// get viewport orientation matrix and move transVec to world space
	var tm = mat4.create(); // matrix to spread cameras apart
	buildtransrotscale(tm,viewPort);
	vec3.transformMat4Vec(transVec,transVec,tm);

	// now run through each render target and use appropriate viewport for each one for draw pass
	var nt = Interleave3D.numTargets; // number of targets
	var gc = Interleave3D.convergence*Interleave3D.gain*2/Interleave3D.numTargets;
	for (var i = 0; i < nt; ++i) {
		var rt = Interleave3D.frametexn[i]; // render target
		// place cameras in camera space and convert to world space
		var scl = i - nt*.5 + .5; // 0 : -.5,.5 : -1,0,1 : -1.5,-.5,.5,1.5 etc...
		var conv = (i - nt*.5 +.5)*gc;
		var trans = viewPort.trans;
		viewPort.xo = conv;
		vec3.scale(trans,transVec,scl);
		vec3.add(trans,trans,oldtrans);
		// draw FBn scene
		viewPort.target = rt;
		beginscene(viewPort);
		scene.draw();
	}
	viewPort.trans = oldtrans;
	viewPort.xo = 0;
	viewPort.target = null;
	
	beginscene(Interleave3D.interleaveVP);
	Interleave3D.fbnPlaneXY.scale = [gl.asp,-1,1];
	Interleave3D.roottree.draw();	
};




