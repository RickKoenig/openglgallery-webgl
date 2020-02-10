// 2d sprites, using the new spriter package
var test2d = {}; // test 2d sprites and the new spriter package

test2d.text = "WebGL: Most basic 2D drawing, and new spriter package";
test2d.title = "spriter basic 2D";

// load these before init
test2d.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/take0016.jpg");
	preloadimg("test2d/wood_door.jpg");
	preloadimg("test2d/seq5.png");
};

test2d.init = function() {
	logger("entering webgl test2D\n");
	
	// debprint
	debprint.addlist("test2d",["test2d.spritevp"]);

	// turn off all Tree2 sorting for this state, (painters algorithm)
	Tree2.treesort = false;
	
	// now try new sprite package
	test2d.spriteHandle = new Spriter();
	//test2d.spritevp = Spriter.createspritervp();
	test2d.onresize();
	//test2d.spriteHandle.setKeepList([
	//	"wood_door.jpg"
	//]);
};

test2d.proc = function() {
	// input
	// new sprite add
	test2d.spriteHandle.reset();
	var space = 40;
	
	var i;
	var n = 100;
	for (i=0;i<n;++i) {
		var sx = 200;
		var sy = 100;
		var ang = Math.PI*2*i/n;
		var rx = Math.cos(ang)*input.mx + Math.sin(ang)*input.my;
		var ry = -Math.sin(ang)*input.mx + Math.cos(ang)*input.my;
		test2d.spriteHandle.add("wood_door.jpg",[rx,ry],[sx,sy]/*,undefined,undefined,.5,.5*/);
		//test2d.spriteHandle.add("seq5.png",input.mx+2*space,input.my+space,sx,sy);
		//test2d.spriteHandle.add("take0016.jpg",input.mx+4*space,input.my+2*space,sx,sy);//,200,100);
		//test2d.spriteHandle.add("maptestnck.png",input.mx+6*space,input.my+3*space,sx,sy);//,200,100);
	}
	
	// proc
	doflycam(test2d.spritevp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(test2d.spritevp);
	// new sprite draw
	test2d.spriteHandle.draw();
};

test2d.onresize = function() {
	logger("test2d resize!\n");
	// readjust spriter viewport
	test2d.spritevp = Spriter.createspritervp();
};

test2d.exit = function() {
	// remove debprint
	debprint.removelist("test2d");
	
	// free up spriter
	logger("before new sprite package glfree\n");
	logrc();
	test2d.spriteHandle.glfree();
	test2d.spriteHandle = null;
		
	// show usage after all cleanups
	logger("after new sprite package glfree\n");
	logrc();
	logger("exiting webgl test2D\n");
	Tree2.treesort = true; // turn tree sorting back on, default
};
