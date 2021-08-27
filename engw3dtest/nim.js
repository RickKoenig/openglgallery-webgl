// nim game
var nim = {}; // the nim game state

nim.text = "Nim Game, a work in progress";
nim.title = "Nim";

nim.states = {
	intro : 0,
	humanMove : 1,
	computerMove : 2,
	humanWins : 3,
	computerWins : 4,
	reset : 5,
	ruleChange : 6
};

nim.piles = [3,5,7];

nim.maxlevel = 1240;
nim.humanScore = 0;
nim.computerScore = 0;
nim.state = nim.states.intro;

nim.counter = 0;
nim.threeMax = true;
nim.lastLoses = true;

// load these before init
nim.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

nim.drawPiles = function() {
};

nim.lesslevel = function() {
	if (nim.curlevel > 0)
		--nim.curlevel;
	nim.updatelevel();
};

nim.morelevel = function() {
	if (nim.curlevel < nim.maxlevel)
		++nim.curlevel;
	nim.updatelevel();
};

nim.updatelevel = function() {
	printareadraw(nim.levelarea,"Level : " + nim.curlevel + "\nhi\nho");
};

nim.init = function() {
	nim.count = 0;
	nim.curlevel = 1234;
	logger("entering webgl nim\n");

	nim.maxlevel = 1240;
	nim.humanScore = 0;
	nim.computerScore = 0;
	nim.state = nim.states.intro;
	nim.piles = [3,5,7];

	nim.counter = 0;
	nim.threeMax = true;
	nim.lastLoses = true;

	// ui
	
	setbutsname('nim');
	nim.levelarea = makeaprintarea('level: ');
	
	nim.bl = makeabut("lower level",nim.lesslevel);
	nim.bh = makeabut("higher level",nim.morelevel);
	nim.bh.disabled = true;
	nim.updatelevel();
	
	// build parent
	nim.roottree = new Tree2("nim root tree");

	var plane = buildplanexy("aplane",1,1,"maptestnck.png","texDoubleSided");
	plane.mod.flags |= modelflagenums.DOUBLESIDED;

	plane.trans = [0,0,1];
	nim.roottree.linkchild(plane);

	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
};

nim.proc = function() {
	// proc nim game
	++nim.count;
	// do something after 4 seconds
	if (nim.count == 4*fpswanted) {
		nim.bl.disabled = !nim.bl.disabled;
		nim.bh.disabled = !nim.bh.disabled;
		nim.count = 0;
	}
	
	// proc graphics
	nim.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	nim.roottree.draw();
};

nim.exit = function() {
	// show current usage before cleanup
	nim.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	nim.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	nim.roottree = null;
	clearbuts('nim');
	logger("exiting webgl nim\n");
};
