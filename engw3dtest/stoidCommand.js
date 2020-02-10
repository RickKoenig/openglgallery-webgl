var stoidCommand = {}; // the 'stoidCommand' state
// I moved level name to top
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

sc.debvars = {
	mx:0,
	my:0,
	pmx:47,
	pmy:69,
	//rad:5,
	//rectx:20,
	//recty:15,
};


// load these before init
stoidCommand.load = function() {
	//preloadimg("../common/sptpics/maptestnck.png");
	//preloadimg("../common/sptpics/xpar.png");
	//preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/smallfont.png");
};


stoidCommand.calcscale = function(bm) {
	var sclObj = {};
	var scl = vec3.create();
	var bx = bm.size.x; // from bitmap
	var by = bm.size.y;
	var cx = glc.clientWidth;
	var cy = glc.clientHeight; // to canvas client
	var frac = 1;
	if (isMobile)
		frac = 4; // futs with mobile
//	if (true) {
	cx -= 20; // safe zone
	cy -= 20;
	if (cx*by >= cy*bx) {
		var mf = Math.floor(frac*cy/by)/frac;
		logger("calc scale VERTICAL: mf = " + mf + "\n");
	} else {
		var mf = Math.floor(frac*cx/bx)/frac;
		logger("calc scale HORIZONTAL: mf = " + mf + "\n");
	}
	cx += 20;
	cy += 20;
	if (mf > 4)
		;//mf = 4; // uncomment to make Win32 window size when web is in fullscreen
	//mf = 3;
	var bigx = bx*mf;
	var bigy = by*mf;
	scl[1] = 2*bigy/cy;
	//scl[0] = scl[1] * bx / by;
	scl[0] = 2*bigx/cy;
	scl[2] = 1;
	sclObj.scl = scl;
	var xform = {};
	var imf = 1/mf;
	sc.fact = mf;
	xform.factX = imf;
	xform.offX = (cx - bigx)*.5;
	xform.factY = imf;
	xform.offY = (cy - bigy)*.5;
	sclObj.xform = xform;
	return sclObj;
};

stoidCommand.xformMouse = function() {
	sc.debvars.pmx = Math.floor(sc.xform.factX*(sc.debvars.mx - sc.xform.offX));
	sc.debvars.pmy = Math.floor(sc.xform.factY*(sc.debvars.my - sc.xform.offY));
//stoidCommand.ptree.scale;
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

/*bool fastscan32alpha1(struct bitmap32* s, struct bitmap32* d, S32 sx, S32 sy, S32 dx, S32 dy, S32 tx, S32 ty)
{
	S32 i, j;
	U32 sinc, dinc;
	register C32 *sp, *dp;
	if (tx <= 0 || ty <= 0)
		return false;
	bool col = false;
	sp = s->data + s->size.x*sy + sx;
	dp = d->data + d->size.x*dy + dx;
	sinc = s->size.x;
	dinc = d->size.x;
	for (j = 0; j < ty; j++) {
		for (i = 0; i < tx; i++) {
			register C32 v;
			v = sp[i];
			if (v.a >= 0x80) {
				if (dp[i].c32 & 0xffffff) {
					col = true;
					v = 0xffffffff;
				}
				dp[i] = v;
			}
		}
		sp += sinc;
		dp += dinc;
	}
	return col;
}*/

sc.clipScanAlpha = function(bmS,bmD,sx,sy,dx,dy,tx,ty) {
	var ret = bmD.bClip(bmS,sx,sy,dx,dy,tx,ty);
	if (ret) {
		sx = ret[0];
		sy = ret[1];
		dx = ret[2];
		dy = ret[3];
		tx = ret[4];
		ty = ret[5];
		//bmD.fastBlitAlpha(bmS,sx,sy,dx,dy,tx,ty);
		//return false;
		return sc.fastScanAlpha(bmS,bmD,sx,sy,dx,dy,tx,ty);
	}
	return false;
};

sc.doUPDown = function() {
	

	if (sc.scount & 1)
		return;
	var del = 0;
	if (isMobile) {
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
	/*
		if (wininfo.keystate[K_UP] || wininfo.keystate[K_NUMUP] || wininfo.keystate['w'])
			del--;
		if (wininfo.keystate[K_DOWN] || wininfo.keystate[K_NUMDOWN] || wininfo.keystate['s'])
			del++;
	*/
		if (input.keystate[keycodes.UP] || input.keystate[keycodes.NUMUP] || input.keystate['w'.charCodeAt(0)])
			del--;
		if (input.keystate[keycodes.DOWN] || input.keystate[keycodes.NUMDOWN] || input.keystate['s'.charCodeAt(0)])
			del++;
	}
	del = range(-1, del, 1);
	//del *= 10; // test speedup up down
	sc.ypos += del;

	if (sc.ypos > 165)
		sc.ypos = 165;

	if (sc.ypos < 40)
	{
		sc.stoidMode = sc.StoidModeE.REACHED_TOP;
		sc.delayCount = 60; //60
		//clipblit32alpha1(mycirc, B32S, 0, 0, 160 - 16, sc.ypos - 16, 32, 32);
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

/*sc.goUp = function() {
	++sc.debvars.rad
};

sc.goDown = function() {
	--sc.debvars.rad
};*/

sc.init = function() {
	//stoidCommand.count = 0;
	logger("entering webgl stoidCommand 3D\n");
	
		// ui
	//setbutsname('stoid');
	// less,more,reset for pendu1
	//makeabr();
	//makeabr();
	//levelarea = makeaprintarea('level: ');
	//makeabut("UP",sc.goUp,sc.goUp);
	//makeabut("DOWN",sc.goDown,sc.goDown);
	//makeabr();
	//makeabr();

	/*if (isMobile) {
		screen.orientation.lock("landscape-primary").catch(function(error) {
			logger("can't lock orientation!");
		});
	}*/
	
	debprint.addlist("sc_debug",["sc.debvars"]);
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
	/*var fromData = true;
	var fromImage = false;
	if (fromData) {
		stoidCommand.texX = 320;
		stoidCommand.texY = 200; 
		stoidCommand.B32S = new Bitmap32(stoidCommand.texX,stoidCommand.texY,C32BROWN);
	}
	*/
	/*if (fromImage) {
		var animage = preloadedimages["xpar.png"];
		stoidCommand.B32S = new Bitmap32(animage);
	}*/

	//var animage2 = preloadedimages["panel.jpg"];
	//stoidCommand.B32Ssmall = new Bitmap32(animage2);
	
	sc.B32S = new Bitmap32(sc.SWIDTH, sc.SHEIGHT, C32BROWN);
	sc.puzzcirc = new Bitmap32(sc.SWIDTH, sc.SHEIGHT, C32BLACK);
	sc.mycirc = new Bitmap32(32, 32, 0); // ,C32BLACK);
	sc.mycirc.clipCircle(16, 16, 3, C32MAGENTA);

	var animageF = preloadedimages["smallfont.png"];
	stoidCommand.B32Sfont = new Bitmap32(animageF);
	
	/*var bm = stoidCommand.B32S;
	bm.clipPutPixel(0,0,C32WHITE);
	bm.clipPutPixel(1,1,C32WHITE);
	bm.clipPutPixel(2,2,C32WHITE);
	bm.clipPutPixel(3,3,C32WHITE);
	bm.clipPutPixel(4,4,C32WHITE);*/
	stoidCommand.datatexd = DataTexture.createtexture("datatex",stoidCommand.B32S);
	
	// build roottree
	stoidCommand.roottree = new Tree2("stoidCommand root tree");

	if (isMobile) {
		stoidCommand.ptreeL = buildplanexy("aLine",1,1,null,"flat");
		stoidCommand.ptreeL.mod.flags |= modelflagenums.NOZBUFFER; // turn off zbuffer
	//stoidCommand.ptree.trans = [0,0,0];
	//if (stoidCommand.B32S) { // pixel perfect
		//var sclObj = stoidCommand.calcscale(stoidCommand.B32S);
		//stoidCommand.ptree.scale = sclObj.scl;
		//stoidCommand.xform = sclObj.xform;
	//}
		stoidCommand.ptreeL.mat.color = [.5,.5,.5,1];
		stoidCommand.roottree.linkchild(stoidCommand.ptreeL);
	}
	
	// draw the one with the data texture
	stoidCommand.ptree = buildplanexy("aplanexy",1,1,"datatex","tex");
	stoidCommand.ptree.mod.flags |= modelflagenums.NOZBUFFER; // turn off zbuffer
	stoidCommand.ptree.trans = [0,0,0];
	//if (stoidCommand.B32S) { // pixel perfect
		var sclObj = stoidCommand.calcscale(stoidCommand.B32S);
		stoidCommand.ptree.scale = sclObj.scl;
		if (isMobile) {
			stoidCommand.ptreeL.scale = vec3.clone(sclObj.scl);
			stoidCommand.ptreeL.scale[0] *=2;
			stoidCommand.ptreeL.scale[1] *=.02;
		}
		
		stoidCommand.xform = sclObj.xform;
	//}
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
	//sc.debvars.mx = 42;
	//sc.debvars.my ++;//= 49;
	sc.debvars.mx = input.mx;
	sc.debvars.my = input.my;

	//sc.B32S.clipPutPixel(sc.debvars.pmx,sc.debvars.pmy,C32BROWN);
	//sc.B32S.fastClear(C32BROWN);
	stoidCommand.xformMouse();
	//sc.B32S.clipPutPixel(sc.debvars.pmx,sc.debvars.pmy,C32WHITE);
/*	
	sc.debvars.rad = Math.floor(sc.debvars.rad);
	//sc.B32S.clipHLine(sc.debvars.pmx - sc.debvars.rad,sc.debvars.pmy,sc.debvars.pmx + sc.debvars.rad,C32WHITE);
	sc.B32S.clipCircle(sc.debvars.pmx,sc.debvars.pmy,sc.debvars.rad,C32GREEN);
*/	


	//sc.debvars.rectx = Math.floor(sc.debvars.rectx);
	//sc.debvars.recty = Math.floor(sc.debvars.recty);
	//sc.B32S.clipHLine(sc.debvars.pmx - sc.debvars.rad,sc.debvars.pmy,sc.debvars.pmx + sc.debvars.rad,C32WHITE);
	//sc.B32S.clipRect(sc.debvars.pmx,sc.debvars.pmy,sc.debvars.rectx,sc.debvars.recty,C32GREEN);
	//sc.B32S.clipBlit(sc.B32Ssmall,0,0,sc.debvars.pmx,sc.debvars.pmy,sc.debvars.rectx,sc.debvars.recty,C32GREEN);
	//sc.B32S.clipBlit(sc.B32Sfont,0,0,sc.debvars.pmx,sc.debvars.pmy,sc.B32Ssmall.size.x,sc.B32Ssmall.size.y);
	//sc.B32S.clipBlit(sc.B32Ssmall,0,0,0,0,sc.B32Ssmall.size.x,sc.B32Ssmall.size.y);
	//sc.B32S.outTextXY(sc.B32Sfont,sc.debvars.pmx,sc.debvars.pmy,"A quick brown fox...");





	switch (sc.stoidMode) {
	case sc.StoidModeE.PLAYING:
		sc.B32S.clipRect(0, 0, sc.SWIDTH, sc.SHEIGHT, C32BLACK);
		//sc.B32S.outTextXY(stoidCommand.B32Sfont, 0,0, "Wid " + glc.clientWidth + ", Hit " + glc.clientHeight + ", Fact " + sc.fact);
		//sc.B32S.outTextXY(stoidCommand.B32Sfont, 0,8, "Mx " + input.mx + ", My " + input.my + ", But " + (input.mbut[0] + (input.mbut[1]<<1) + (input.mbut[2] <<2)));
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
		if (!sc.delayCount)
			changestate("stoidCommand");
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
	//sprintf(str, "Level %d, %s", level + 1, levelstrs[level]);
	//var str = "Boo Hoo !!#!";
	var str = "Level " + (sc.level + 1) + ", " + scd.levelstrs[sc.level];
	sc.B32S.outTextXY(stoidCommand.B32Sfont,160 - 4 * str.length, 0, str);





	//++stoidCommand.count;
	//if (stoidCommand.count == 240)
	//	;//changestate("solarTest");

	// update dataTexture from a Bitmap32
	stoidCommand.datatexd.updateData(stoidCommand.B32S);



/*
	//	changestate(NOSTATE);
	if (KEY == K_ESCAPE)
		poporchangestate(STATE_MAINMENU);
	switch (stoidMode) {
	case PLAYING:
		cliprect32(B32S, 0, 0, SWIDTH, SHEIGHT, C32BLACK);
		doUPDwon();
		stepCircles();
		break;
	case CRASHED:
		--delayCount;
		if (!delayCount) {
			stoidMode = PLAYING;
			ypos = 165;
			cliprect32(puzzcirc, 0, 0, SWIDTH - 1, SHEIGHT - 1, C32BLACK);
		}
		break;
	case REACHED_TOP:
		--delayCount;
		if (!delayCount) {
			stoidMode = PLAYING;
			level++;
			S32 ll = LAST_LEVEL;
			if (level == ll) {
				level = ll - 1;
				stoidMode = DONE;
				delayCount = 150;
			} else {
				cliprect32(puzzcirc, 0, 0, SWIDTH - 1, SHEIGHT - 1, C32BLACK);
				ypos = 165;
				xpuzz = 0;
				scount = 0;
			}
		}
		break;
	case DONE:
		--delayCount;
		if (!delayCount)
			popstate();
		if (delayCount & 16) { // cheap animate win state
			outtextxybf32(B32S, 160 - 4 * strlen("Koodoos!!"), 96, C32BLUE, C32BLACK, "Koodoos!!");
			outtextxybf32(B32S, 160 - 4 * strlen("You Won!!"), 104, C32RED, C32BLACK, "You Won!!");
		} else {
			outtextxybf32(B32S, 160 - 4 * strlen("Koodoos!!"), 96, C32RED, C32BLACK, "Koodoos!!");
			outtextxybf32(B32S, 160 - 4 * strlen("You Won!!"), 104, C32BLUE, C32BLACK, "You Won!!");
		}
		break;
	}
	if (stoidMode == PLAYING) {
		bool hit = clipScanAlpha(mycirc, B32S, 0, 0, 160 - 16, ypos - 16, 32, 32);
		if (hit && !delayCount) {
			stoidMode = CRASHED;
			delayCount = 45;
			cliprect32(puzzcirc, 0, 0, SWIDTH - 1, SHEIGHT - 1, C32BLACK);
			scount = 0;
			xpuzz = 0;
		}
	}
	sprintf(str, "Level %d, %s", level + 1, levelstrs[level]);
	outtextxy32(B32S, 160 - 4 * strlen(str), 192, C32WHITE, str);
*/







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
		var sclObj = stoidCommand.calcscale(stoidCommand.B32S);
		stoidCommand.ptree.scale = sclObj.scl;
		stoidCommand.xform = sclObj.xform;
	}
};

stoidCommand.exit = function() {
	debprint.removelist("sc_debug");

	if (stoidCommand.datatexd) {
		stoidCommand.datatexd.glfree();
		stoidCommand.datatexd = null;
	}
/*	stoidCommand.B32S = null;
	//stoidCommand.B32Ssmall = null; */
	
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
	//clearbuts('stoid');
	fpswanted = sc.fpswantedsave;
};
