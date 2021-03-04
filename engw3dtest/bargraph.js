// draw bargraphs different ways
var bargraph = {}; // test bargraphs

bargraph.text = "WebGL: Draw some bargraphs";
bargraph.title = "Bar Graphs";

bargraph.debvars = {
	tile:[1,1],
	v0:0,
	v1:1,
	value:1,
};

// load these before init
bargraph.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

bargraph.init = function() {
	bargraph.count = 0;
	logger("entering bargraphs\n");

	// build parent
	bargraph.roottree = new Tree2("root");
	bargraph.roottree.trans = [-.5,0,0];

	// build a planexy (a square)
	var plane = buildplanexy("aplane",1,1,"maptestnck.png","tex");
	plane.trans = [0,0,1];
	var scaleDown = .02;
	plane.scale = [scaleDown, scaleDown, scaleDown];
	bargraph.roottree.linkchild(plane);
	
	plane = plane.newdup();
	plane.trans = [1,0,1];
	bargraph.roottree.linkchild(plane);
	
	bargraph.valueplane = plane.newdup();
	bargraph.roottree.linkchild(bargraph.valueplane);
	
	var bargraphTree = buildplanexy("the bar graph",1,1,"maptestnck.png","bargraph");
	bargraphTree.trans = [0,.2,1];
	bargraphTree.scale = [1,.2,1];
	bargraph.roottree.linkchild(bargraphTree);
	bargraph.mod = bargraphTree.mod;
	bargraph.mod.flags |= modelflagenums.DOUBLESIDED;

	mainvp = defaultviewport();	
	mainvp.clearcolor = [0,.5,0,1];
	
	bargraph.mod.mat.tile = bargraph.debvars.tile;

	debprint.addlist("bargraph_debug",["bargraph.debvars"]);

};

bargraph.proc = function() {
	// proc
	bargraph.mod.mat.v0 = bargraph.debvars.v0;
	bargraph.mod.mat.v1 = bargraph.debvars.v1;
	bargraph.mod.mat.value = bargraph.debvars.value;
	bargraph.valueplane.trans = [bargraph.debvars.value,-.025,1];

	bargraph.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	bargraph.roottree.draw();
};

bargraph.exit = function() {
	debprint.removelist("bargraph_debug");
	// show current usage before cleanup
	bargraph.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	bargraph.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	bargraph.roottree = null;
	logger("exiting bargraphs\n");
};
