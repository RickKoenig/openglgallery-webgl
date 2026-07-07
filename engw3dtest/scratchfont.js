'use strict';

var scratchfont = {};

// test webgl
scratchfont.roottree;
scratchfont.a1tree;
scratchfont.a2tree;
scratchfont.f1tree;
scratchfont.f2tree;
scratchfont.btree;

scratchfont.text = "WebGL: test fonts again scratch"; // for desktop mode
scratchfont.title = "test fonts again scratch";

scratchfont.debvars = {
	pitch:0,
	yaw:0,
	roll:0,
	transx:0,
	transy:0,
	transz:0,
	scalex:0,
	scaley:0,
	scalez:0
};

// load these before init
scratchfont.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
};

scratchfont.init = function() {
	logger("entering webgl scratchfont\n");
// roottree	
	scratchfont.roottree = new Tree2("root");
	scratchfont.roottree.trans = [0,0,1];
// backgnd
	scratchfont.btree = buildplanexy("backgnd", 1, 1, "maptestnck.png", "texc", 1, 1, 4, 4);
	scratchfont.btree.mod.mat.color = [1, 1, 1, .25];
	scratchfont.btree.mod.flags |= modelflagenums.NOZBUFFER | modelflagenums.HASALPHA;
	scratchfont.roottree.linkchild(scratchfont.btree);
// simple 1	
	scratchfont.a1tree = buildplanexy("aplane", .05, .05, "maptestnck.png", "tex");
	scratchfont.a1tree.mod.flags |= modelflagenums.NOZBUFFER;
	scratchfont.roottree.linkchild(scratchfont.a1tree);
// simple 2
	scratchfont.a2tree = scratchfont.a1tree.newdup();
	scratchfont.roottree.linkchild(scratchfont.a2tree); 
// simple fixed
	scratchfont.a3tree = scratchfont.a1tree.newdup();
	scratchfont.a3tree.trans = [-.5, .5, 0];
	scratchfont.roottree.linkchild(scratchfont.a3tree); 
// font 1
	scratchfont.f1tree = new Tree2("ascratchfont");
	var scratchfontmodel = new ModelFont("reffont", "font3.png", "tex"
		, 2 * 16 / glc.clientHeight
		, 2 * 32 / glc.clientHeight
		, 64, 8
		, true);
    scratchfontmodel.flags |= modelflagenums.NOZBUFFER; // always in front when drawn
	scratchfontmodel.print("Mouse Over");
	scratchfont.f1tree.setmodel(scratchfontmodel);
	scratchfont.roottree.linkchild(scratchfont.f1tree);
// font 2
	scratchfont.f2tree = scratchfont.f1tree.newdup();
	scratchfont.roottree.linkchild(scratchfont.f2tree);
// font fixed
	scratchfont.f3tree = scratchfont.f1tree.newdup();
	scratchfont.f3tree.trans = [-.25, .25, 0];
	scratchfont.roottree.linkchild(scratchfont.f3tree);
// test debug	
	debprint.addlist("scratchfont_debug",["scratchfont.debvars"]);
// default viewport
	mainvp = defaultviewport();
};

scratchfont.proc = function() {
	// proc
	doflycam(mainvp); // modify the trs of vp using flycam
	scratchfont.a1tree.trans = [input.fmx,input.fmy,0];
	scratchfont.a2tree.trans = [input.fmx,input.fmy + .25,0];
	scratchfont.f1tree.trans = [input.fmx + .25,input.fmy,0];
	scratchfont.f1tree.mod.print("f1: x = " + input.fmx.toFixed(1) + ", y = " + input.fmy.toFixed(1));
	scratchfont.f2tree.trans = [input.fmx + .25,input.fmy + .25,0];
	scratchfont.f2tree.mod.print("f2: x = " + input.fmx.toFixed(3) + ", y = " + input.fmy.toFixed(3));
	scratchfont.f3tree.mod.print("f3: x = " + input.fmx.toFixed(3) + ", y = " + input.fmy.toFixed(3));
	scratchfont.roottree.proc();
	// draw
	beginscene(mainvp);
	scratchfont.roottree.draw();
};

scratchfont.exit = function() {
	debprint.removelist("scratchfont_debug");
	// show current usage
	scratchfont.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	scratchfont.roottree.glfree();
	// show usage after cleanup
	logrc();
	scratchfont.roottree = null;
	logger("exiting webgl scratchfont\n");
};
