var scratchfont = {};

// test webgl
scratchfont.roottree;
scratchfont.a1tree;
scratchfont.a2tree;
scratchfont.f1tree;
scratchfont.f2tree;

scratchfont.text = "WebGL: test fonts again scratch";

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

/*
// test unique
//scratchfont.refcounttestlist = {};
scratchfont.uniqval = 0;

scratchfont.makeuniq = function(str) {
	var last = str.lastIndexOf("__U");
	if (last >= 0) {
		str = str.substr(0,last);
	}
	return str + "__U" + scratchfont.uniqval++;
};
*/
/*scratchfont.removelist = function(objname) {
	delete scratchfont.refcounttestlist[objname];
};

scratchfont.showreflist = function() {
	
};*/

scratchfont.testuniq = function() {
	logger("test unique strings\n");
	var somestrings = [
		"hey",
		"buddy",
	];
	// build up a unique list by running through the list a few times
	var numpasses = 3;
	for (j = 0; j < numpasses; ++j) {
		logger("add some to somestrings list\n");
		var n = somestrings.length; // number of strings in this pass to process
		for (var i = 0; i < n; ++i) {
			var astr = somestrings[i];
			var ustr = makeuniq(astr);
			logger("testuniq of '" + astr + "' => '" + ustr + "'");
			somestrings.push(ustr);
			
		}
	}
	//scratchfont.showreflist();
};
// end test unique


scratchfont.init = function() {
	scratchfont.testuniq();
	logger("entering webgl scratchfont\n");
// roottree	
	scratchfont.roottree = new Tree2("root");
	scratchfont.roottree.trans = [0,0,1];

// simple 1	
	scratchfont.a1tree =  buildplanexy("aplane",.05,.05,"maptestnck.png","tex");
	scratchfont.a1tree.mod.flags |= modelflagenums.NOZBUFFER;
	//scratchfont.a1tree.trans = [0,0,0];
	scratchfont.roottree.linkchild(scratchfont.a1tree);

// simple 2
	scratchfont.a2tree =  scratchfont.a1tree.newdup();
	//scratchfont.a1tree.trans = [0,1,0];
	scratchfont.roottree.linkchild(scratchfont.a2tree); 

// font 1
	scratchfont.f1tree = new Tree2("ascratchfont");
	var scratchfontmodel = new ModelFont("reffont","font3.png","tex",2*16/glc.clientHeight,2*32/glc.clientHeight,64,8,true);
    scratchfontmodel.flags |= modelflagenums.NOZBUFFER; // always in front when drawn
	scratchfontmodel.print("Mouse Over");
	scratchfont.f1tree.setmodel(scratchfontmodel);
	scratchfont.roottree.linkchild(scratchfont.f1tree);

// font 2
	var dodup = true;
	if (dodup) {
		scratchfont.f2tree = scratchfont.f1tree.newdup();
	} else {
		scratchfont.f2tree = new Tree2("ascratchfont2");
		var scratchfontmodel = new ModelFont("reffont2","font3.png","tex",2*16/glc.clientHeight,2*32/glc.clientHeight,64,8,true);
		scratchfontmodel.flags |= modelflagenums.NOZBUFFER; // always in front when drawn
		scratchfontmodel.print("Mouse Over");
		scratchfont.f2tree.setmodel(scratchfontmodel); 
	}
	scratchfont.roottree.linkchild(scratchfont.f2tree);

// test debug	
	debprint.addlist("scratchfont_debug",["scratchfont.debvars"]);
};

scratchfont.proc = function() {
	// proc
	doflycam(mainvp); // modify the trs of vp using flycam
	scratchfont.a1tree.trans = [input.fmx,input.fmy,0];
	scratchfont.a2tree.trans = [input.fmx,input.fmy + .25,0];
	scratchfont.f1tree.trans = [input.fmx + .25,input.fmy,0];
	//scratchfont.f1tree.mod.print("hi 333333");
	scratchfont.f1tree.mod.print("f1: x = " + input.fmx.toFixed(1) + ", y = " + input.fmy.toFixed(1));
	scratchfont.f2tree.trans = [input.fmx + .25,input.fmy + .25,0];
	//scratchfont.f2tree.mod.print("ho 444444");
	scratchfont.f2tree.mod.print("f2: x = " + input.fmx.toFixed(3) + ", y = " + input.fmy.toFixed(3));
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
