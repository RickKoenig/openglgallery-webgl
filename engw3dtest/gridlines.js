// do a fwidth() gridlines demo
var gridlines = {}; // the 'gridlines' state

gridlines.text = "WebGL: gridlines anti alias drawing";
gridlines.title = "test gridlines fwidth";

gridlines.makeTerrArray = function() {
	var A = .1;
	var B = .2;
	var C = .3;
	var D = .4;
	var ret = [
		[A,A,D,A,A,0],
		[C,B,0,A,A,0],
		[D,C,0,A,C,0],
		[A,A,B,A,A,0],
		[A,A,0,D,A,D],
		[A,A,0,A,A,0],
	];
	return ret;
};

// UI
gridlines.setTexShader = function() {
	gridlines.mod.setshader("tex");
	gridlines.updateShaderName("shader: tex");
};

gridlines.setGridlinesYShader = function() {
	gridlines.mod.setshader("gridlinesy");
	gridlines.updateShaderName("shader: gridlinesy");
};

gridlines.setGridlinesXZShader = function() {
	gridlines.mod.setshader("gridlinesxz");
	gridlines.updateShaderName("shader: gridlinesxz");
};

gridlines.setGridlinesXYZShader = function() {
	gridlines.mod.setshader("gridlinesxyz");
	gridlines.updateShaderName("shader: gridlinesxyz");
};

gridlines.setGridlinesLenShader = function() {
	gridlines.mod.setshader("gridlineslen");
	gridlines.updateShaderName("shader: gridlineslen");
};

gridlines.setGridlinesLenAtanShader = function() {
	gridlines.mod.setshader("gridlineslenatan");
	gridlines.updateShaderName("shader: gridlineslenatan");
};

gridlines.updateShaderName = function(name) {
	//gridlines.scenearea.settext(name);
	printareadraw(gridlines.scenearea,name);
};

gridlines.buildterrainmesh = function(rad) {
	return buildpatcharray(6,6,gridlines.makeTerrArray());
};

gridlines.buildterrainmodel = function(name,texname,shadername) {
	var mod = Model.createmodel(name);
	gridlines.mod = mod;
	if (mod.refcount == 1) {
	    mod.setshader(shadername);
		var gridmesh = gridlines.buildterrainmesh();
	    mod.setmesh(gridmesh);
	    mod.settexture(texname);
	    mod.commit();
	}
    return mod;
};

gridlines.buildterrain = function(name,sizex,sizey,texname,shadername) {
	var mod = gridlines.buildterrainmodel(name,texname,shadername);
	var ret = new Tree2(name);
	ret.setmodel(mod);
	return ret;
};

// load these before init
gridlines.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

gridlines.init = function() {
	logger("entering webgl gridlines\n");

	// create user UI section
	setbutsname("gridlines");
	// less,more printarea for sponge
	gridlines.scenearea = makeaprintarea("shader: ");
	makeabut("tex",gridlines.setTexShader);
	makeabut("gridlinesY",gridlines.setGridlinesYShader);
	makeabut("XZ",gridlines.setGridlinesXZShader);
	makeabut("XYZ",gridlines.setGridlinesXYZShader);
	makeabut("Len",gridlines.setGridlinesLenShader);
	makeabut("LenAtan",gridlines.setGridlinesLenAtanShader);

	// build parent
	gridlines.roottree = new Tree2("gridlines root tree");

	// build a terrain grid
	// start in tex shader to get some uvs
	//var startShader = "gridlines";
	var startShader = "tex";
	gridlines.updateShaderName("shader: tex");
	var terrain = gridlines.buildterrain("some terrain",1,1,"maptestnck.png",startShader);
	gridlines.roottree.linkchild(terrain);

	mainvp = defaultviewport();	
	mainvp.clearcolor = [0,0,1,1];
	mainvp.trans = [.221, 1.35, -1.64];
	mainvp.rot = [.896, -.245, 0];
	
	// animate gridlines
	gridlines.heightOffset = 0;
};

gridlines.proc = function() {
	// proc
	gridlines.heightOffset += .01;
	if (gridlines.heightOffset >= 1)
		gridlines.heightOffset -= 1;
	gridlines.mod.mat.heightOffset = gridlines.heightOffset;
	gridlines.roottree.proc(); // probably does nothing unless you modify children
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	gridlines.roottree.draw();
};

gridlines.exit = function() {
	// show current usage before cleanup
	logger("before roottree glfree\n");
	gridlines.roottree.log();
	logrc();
	
	// cleanup
	gridlines.roottree.glfree();
	gridlines.roottree = null;

	// show usage after cleanup
	logger("after roottree glfree\n");
	logrc();

	// cleanup UI
	clearbuts("gridlines"); // remove UI

	logger("exiting webgl gridlines 3D\n");
};
