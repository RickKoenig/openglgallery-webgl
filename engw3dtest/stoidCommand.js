var stoidCommand = {}; // the 'stoidCommand' state
// moved level name to top
// stoid command game played out on a lo res bitmap
// has pixel collision detection

var sc = stoidCommand; // shortcut
sc.fpswantedsave = null;

stoidCommand.text = "Play the Stoid Command game with UP ('w', Up Arrow, LMB)   DOWN ('s', Down Arrow, RMB)";
stoidCommand.title = "STOID COMMAND !!";

sc.B32S = null; // main bitmap
sc.puzzcirc = null; // puzzle circles are drawn in this bitmap, left and right
sc.mycirc = null; // magenta circle, my circle, up and down
sc.SWIDTH = 320;
sc.SHEIGHT = 200;

sc.level = null;
sc.ypos = null;
sc.scount = null;
sc.xpuzz = null;
sc.delayCount = null;

sc.StoidModeE = {
	PLAYING:0,
	CRASHED:1,
	REACHED_TOP:2,
	DONE:3,
};
sc.StoidMode = null;

// load these before init
stoidCommand.load = function() {
	preloadimg("../common/sptpics/smallfont.png");
};

stoidCommand.calcscale = function(bm) {
	const bx = bm.size.x; // from bitmap
	const by = bm.size.y;
	let cx = glc.clientWidth;
	let cy = glc.clientHeight; // to canvas client
	const scl = vec3.create();
	if (cx >= cy) {
		if (cx / bx >= cy / by) {
			scl[0] = 2 * bx / by;
			scl[1] = 2;
		} else {
			scl[0] = 2 * cx / cy;
			scl[1] = 2 * cx / cy * by / bx;
		}
	} else {
		scl[0] = 2;
		scl[1] = 2 * by / bx;
	}
	const safe = .85;
	scl[0] *= safe;
	scl[1] *= safe;
	scl[2] = 1;
	return scl;
};

sc.fastScanAlpha = function(bmS,bmD,sx,sy,dx,dy,tx,ty) {
	var sw = bmS.size.x;
	var dw = bmD.size.x;
	var sp = sw*sy + sx;
	var dp = dw*dy + dx;
	var sstep = sw - tx;
	var dstep = dw - tx;
	var sData = bmS.data;
	var dData = bmD.data;
	var col = false;
	for (var j=0;j<ty;++j) {
		for (var i=0;i<tx;++i) {
			var val = sData[sp++];
			if (val & 0x80000000) { // opaque source
				var dval = dData[dp];
				if (dval & 0xffffff) { // non black dest
					val = C32WHITE;
					col = true;
				}
				dData[dp] = val;
			}
			++dp;
		}
		sp += sstep;
		dp += dstep; 
	}
	return col;
};

sc.clipScanAlpha = function(bmS,bmD,sx,sy,dx,dy,tx,ty) {
	var ret = bmD.bClip(bmS,sx,sy,dx,dy,tx,ty);
	if (ret) {
		sx = ret[0];
		sy = ret[1];
		dx = ret[2];
		dy = ret[3];
		tx = ret[4];
		ty = ret[5];
		return sc.fastScanAlpha(bmS,bmD,sx,sy,dx,dy,tx,ty);
	}
	return false;
};

sc.doUPDown = function() {
	if (sc.scount & 1)
		return;
	var del = 0;
	if (window.isMobile) {
		if (input.mbut[Input.MLEFT]) {
			if (input.my < glc.clientHeight/2) {
				del--;
			} else if (input.my >= glc.clientHeight/2) {
				del++;
			}
		}
	} else {
		if (input.mbut[Input.MLEFT])
			del--;
		if (input.mbut[Input.MRIGHT])
			del++;
		if (input.keystate[keycodes.UP] || input.keystate[keycodes.NUMUP] || input.keystate['w'.charCodeAt(0)])
			del--;
		if (input.keystate[keycodes.DOWN] || input.keystate[keycodes.NUMDOWN] || input.keystate['s'.charCodeAt(0)])
			del++;
	}
	del = range(-1, del, 1);
	sc.ypos += del;

	if (sc.ypos > 165) {
		sc.ypos = 165;
	}
	if (sc.ypos < 40) {
		sc.stoidMode = sc.StoidModeE.REACHED_TOP;
		sc.delayCount = 60; //60
		sc.B32S.clipBlitAlpha(sc.mycirc, 0, 0, 160 - 16, sc.ypos - 16, 32, 32);
	}
};

sc.stepCircles = function() {
	sc.scount++;
	if (sc.scount == 26) {
		// new circles
		var val = scd.levels[sc.level][sc.xpuzz];
		if (val & 1)
			sc.puzzcirc.clipCircle( 7, 48 + 6, 3, C32GREEN);
		if (val & 4)
			sc.puzzcirc.clipCircle( 7, 48 + 6 + 26, 3, C32BLUE);
		if (val & 0x10)
			sc.puzzcirc.clipCircle( 7, 48 + 6 + 2 * 26, 3, C32RED);
		if (val & 0x40)
			sc.puzzcirc.clipCircle( 7, 48 + 6 + 3 * 26, 3, C32LIGHTBLUE);
		if (val & 2)
			sc.puzzcirc.clipCircle( 319 - 6, 61 + 6, 3, C32DARKGRAY);
		if (val & 8)
			sc.puzzcirc.clipCircle( 319 - 6, 61 + 6 + 26, 3, C32LIGHTBLUE);
		if (val & 0x20)
			sc.puzzcirc.clipCircle( 319 - 6, 61 + 6 + 2 * 26, 3, C32LIGHTRED);
		if (val & 0x80)
			sc.puzzcirc.clipCircle( 319 - 6, 61 + 6 + 3 * 26, 3, C32BROWN);
		sc.scount = 0;
		
		sc.xpuzz++;
		if (sc.xpuzz == scd.levels[sc.level].length)
			sc.xpuzz = 0;
	} 
	// shift circles left and right
	var i;
	for (i = 0; i < 4; i++)
		sc.B32S.clipBlit(sc.puzzcirc, 0, i * 26 + 48, 1, i * 26 + 48, sc.SWIDTH - 1, 13);
	for (i = 0; i < 4; i++)
		sc.B32S.clipBlit(sc.puzzcirc, 1, i * 26 + 61, 0, i * 26 + 61, sc.SWIDTH - 1, 13);
	sc.puzzcirc.clipBlit(sc.B32S, 0, 54 - 5, 0, 54 - 5, sc.SWIDTH, 92 + 10);
};

sc.init = function() {
	logger("entering webgl stoidCommand 3D\n");
	// state
	sc.level = 0;
	var sl = localStorage.stoidLevel;
	if (sl === undefined) {
		sl = 0;
		localStorage.stoidLevel = sl;
	} else {
		sl = Number(sl);
	}
	sc.level = sl;

	sc.xpuzz = 0;
	sc.scount = 0;
	sc.delayCount = 0;
	sc.ypos = 165;
	sc.stoidMode = sc.StoidModeE.PLAYING;

// build and init lores Bitmap32 and DataTexture
	sc.B32S = new Bitmap32(sc.SWIDTH, sc.SHEIGHT, C32BROWN);
	sc.puzzcirc = new Bitmap32(sc.SWIDTH, sc.SHEIGHT, C32BLACK);
	sc.mycirc = new Bitmap32(32, 32, 0); // ,C32BLACK);
	sc.mycirc.clipCircle(16, 16, 3, C32MAGENTA);

	var animageF = preloadedimages["smallfont.png"];
	stoidCommand.B32Sfont = new Bitmap32(animageF);
	
	stoidCommand.datatexd = DataTexture.createtexture("datatex",stoidCommand.B32S);
	
	// build roottree
	stoidCommand.roottree = new Tree2("stoidCommand root tree");

	if (window.isMobile) {
		stoidCommand.ptreeL = buildplanexy("aLine",1,1,null,"flat");
		stoidCommand.ptreeL.mod.flags |= modelflagenums.NOZBUFFER; // turn off zbuffer
		stoidCommand.ptreeL.mat.color = [.5,.5,.5,1];
		stoidCommand.roottree.linkchild(stoidCommand.ptreeL);
	}
	
	// draw the one with the data texture
	stoidCommand.ptree = buildplanexy("aplanexy",1,1,"datatex","tex");
	stoidCommand.ptree.mod.flags |= modelflagenums.NOZBUFFER; // turn off zbuffer
	stoidCommand.ptree.trans = [0,0,0];
	var scl = stoidCommand.calcscale(stoidCommand.B32S);
	stoidCommand.ptree.scale = scl;
	if (window.isMobile) {
		stoidCommand.ptreeL.scale = vec3.clone(scl);
		stoidCommand.ptreeL.scale[0] *=20;
		stoidCommand.ptreeL.scale[1] *=.02;
	}
	stoidCommand.roottree.linkchild(stoidCommand.ptree);

	mainvp = defaultviewport();	
	mainvp.trans = [0,0,-2]; // for mouse test // move back some
	stoidCommand.oldclearcolor = mainvp.clearcolor;
	mainvp.clearcolor = F32DARKGRAY;
	sc.fpswantedsave = fpswanted;
	fpswanted = 30;
};

stoidCommand.proc = function() {
	// proc
	switch (sc.stoidMode) {
	case sc.StoidModeE.PLAYING:
		sc.B32S.clipRect(0, 0, sc.SWIDTH, sc.SHEIGHT, C32BLACK);
		sc.doUPDown();
		sc.stepCircles();
		break;
	case sc.StoidModeE.CRASHED:
		--sc.delayCount;
		if (!sc.delayCount) {
			sc.stoidMode = sc.StoidModeE.PLAYING;
			sc.ypos = 165;
			sc.puzzcirc.clipRect(0, 0, sc.SWIDTH - 1, sc.SHEIGHT - 1, C32BLACK);
		}
		break;
	case sc.StoidModeE.REACHED_TOP:
		--sc.delayCount;
		if (!sc.delayCount) {
			sc.level++;
			var LL = scd.LAST_LEVEL;
			if (sc.level == LL) {
				localStorage.stoidLevel = 0;
				sc.level = LL - 1;
				sc.stoidMode = sc.StoidModeE.DONE;
				sc.delayCount = 150;
			} else {
				localStorage.stoidLevel = sc.level;
				sc.stoidMode = sc.StoidModeE.PLAYING;
				sc.puzzcirc.clipRect(0, 0, sc.SWIDTH - 1, sc.SHEIGHT - 1, C32BLACK);
				sc.ypos = 165;
				sc.xpuzz = 0;
				sc.scount = 0;
			}
		}
		break;
	case sc.StoidModeE.DONE:
		--sc.delayCount;
		if (!sc.delayCount) {
			changestate("stoidCommand");
		}
		if (sc.delayCount % 48 >= 24) { // cheap animate win state, TODO: use more variables
			sc.B32S.outTextXY(stoidCommand.B32Sfont, 160 - 4 * "Koodoos!!".length, 88, "Koodoos!!");
			sc.B32S.outTextXY(stoidCommand.B32Sfont, 160 - 4 * "You Won!!".length, 112, "You Won!!");
		} else {
			sc.B32S.outTextXY(stoidCommand.B32Sfont, 160 - 4 * "You Won!!".length, 88, "You Won!!");
			sc.B32S.outTextXY(stoidCommand.B32Sfont, 160 - 4 * "Koodoos!!".length, 112, "Koodoos!!");
			
		}
		break;
	}
	if (sc.stoidMode == sc.StoidModeE.PLAYING) {
		var hit = sc.clipScanAlpha(sc.mycirc, sc.B32S, 0, 0, 160 - 16, sc.ypos - 16, 32, 32);
		if (hit && !sc.delayCount) {
			sc.stoidMode = sc.StoidModeE.CRASHED;
			sc.delayCount = 45;
			sc.puzzcirc.clipRect(0, 0, sc.SWIDTH - 1, sc.SHEIGHT - 1, C32BLACK);
			sc.scount = 0;
			sc.xpuzz = 0;
		}
	}
	var str = "Level " + (sc.level + 1) + ", " + scd.levelstrs[sc.level];
	sc.B32S.outTextXY(stoidCommand.B32Sfont,160 - 4 * str.length, 0, str);
	// update dataTexture from a Bitmap32
	stoidCommand.datatexd.updateData(stoidCommand.B32S);
	stoidCommand.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	// draw
	beginscene(mainvp);
	stoidCommand.roottree.draw();
};

stoidCommand.onresize = function() {
	var bottomLines = 20; // for console
	logger("stoidCommand resize to " + glc.clientWidth + "," + glc.clientHeight + "\n");
	if (stoidCommand.B32S) {
		var scl = stoidCommand.calcscale(stoidCommand.B32S);
		stoidCommand.ptree.scale = scl;
	}
};

stoidCommand.exit = function() {
	if (stoidCommand.datatexd) {
		stoidCommand.datatexd.glfree();
		stoidCommand.datatexd = null;
	}

	stoidCommand.B32Sfont = null;
	
	sc.B32S = null; // main bitmap
	sc.puzzcirc = null; // puzzle circles are drawn in this bitmap, left and right
	sc.mycirc = null; // magenta circle, my circle, up and down

	// show current usage before cleanup
	stoidCommand.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	stoidCommand.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	stoidCommand.roottree = null;
	logger("exiting webgl stoidCommand\n");
	mainvp.clearcolor = stoidCommand.oldclearcolor;
	fpswanted = sc.fpswantedsave;
};
