// very minimalist 3D state, but with 4 textures
var basic4textures = {}; // the 'basic4textures' state

basic4textures.text = "WebGL: Most basic4textures 3D drawing, reload for more shaders";
basic4textures.title = "Basic 3D 4 textures";
basic4textures.shaderIndex = 0;
basic4textures.maxShaderIndex = 3;
basic4textures.planexy;

basic4textures.shaderNames = [
	"interleave4",
	"tex4",
	"blend4uv"
];

// load these before init
basic4textures.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
	preloadimg("../common/sptpics/take0016.jpg");
};

basic4textures.init = function() {
	logger("entering webgl basic4textures 3D\n");
	// build parent
	basic4textures.roottree = new Tree2("basic4textures root tree");
	// build a planexy (a square)
	var textureList = ["maptestnck.png","panel.jpg","Bark.png","take0016.jpg"];
	basic4textures.planexy = buildplanexyNt("aplane",1,1,textureList,basic4textures.shaderNames[basic4textures.shaderIndex]);
	basic4textures.planexy.trans = [0,0,1];
	basic4textures.planexy.mod.flags |= modelflagenums.DOUBLESIDED;

	basic4textures.roottree.linkchild(basic4textures.planexy);

	mainvp = defaultviewport();
	basic4textures.onresize();
};

basic4textures.proc = function() {
	// proc
	basic4textures.roottree.proc(); // animate
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	basic4textures.roottree.draw();
};

basic4textures.onresize = function() {
	logger("basic4textures resize!\n");
	// readjust planexy scale to fill the screen
	basic4textures.planexy.scale = [gl.asp,1,1];
	if (basic4textures.shaderIndex == 0) {
		// set 'resolution' uniform in shader
		basic4textures.planexy.mat.resolution = [glc.clientWidth,glc.clientHeight];
	}
};

basic4textures.exit = function() {
	// show current usage before cleanup
	basic4textures.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	basic4textures.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	basic4textures.roottree = null;
	logger("exiting webgl basic4textures\n");
	basic4textures.shaderIndex = incWrap(basic4textures.shaderIndex,basic4textures.maxShaderIndex);
};
