/* hum */
//// !!! play with vertices, with vertex shaders ... !!! ...
var vertexShadersV1 = {}; // the 'vertexShadersV1' state

vertexShadersV1.text = "WebGL: Vertex Shaders";
vertexShadersV1.title = "Vertex Shaders Test";

// switched the front and back because we're outside the box (for skybox textures)

// two disjointed triangles 6 vertices
vertexShadersV1.pattMesh1 = {
	"verts": [
		100,100,0,
		200,300,0,
		300,100,0,
		400,100,0,
		500,300,0,
		600,100,0,
	],
	"uvs": [
		0,1,
		.5,0,
		1,1,

		0,1,
		.5,0,
		1,1,
	],
};

// triangle fan 8 vertices
vertexShadersV1.pattMesh2 = {
	"verts": [
		100,0,0,
		0,100,0,
		0,300,0,
		100,400,0,
		300,400,0,
		400,300,0,
		400,100,0,
		300,0,0,
	],
	"uvs": [
		.25,1,
		0,.75,
		0,.25,
		.25,0,
		.75,0,
		1,.25,
		1,.75,
		.75,1,
	],
};

// triangle strip 10 vertices
vertexShadersV1.pattMesh3 = {
	"verts": [
		  0,100,0,
		  0,300,0,
		100,  0,0,
		100,200,0,
		200,100,0,
		200,300,0,
		300,  0,0,
		300,200,0,
		400,100,0,
		400,300,0,
	],
	"uvs": [
		  0,.75,
		  0,.25,
		.25,  1,
		.25, .5,
		 .5,.75,
		 .5,.25,
		.75,  1,
		.75, .5,
		  1,.75,
		  1,.25,
	],
};

// no mesh
vertexShadersV1.pattMesh4 = {
	"numVerts": 7
};

vertexShadersV1.pattMesh5 = {
	"numVerts": 32
};

// load these before init
vertexShadersV1.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/Bark.png");
};

vertexShadersV1.init = function() {
	logger("entering webgl vertexShadersV1 3D\n");

	// build parent
	vertexShadersV1.roottree = new Tree2("vertexShadersV1 root tree");


	// build a vertex pattern 1 independent triangles
	var patt = buildMesh("aPattIndependent", "maptestnck.png", "tex", 
		vertexShadersV1.pattMesh1, modelflagenums.DOUBLESIDED | modelflagenums.NOZBUFFER);
	patt.trans = [400,0,0];
	patt.scale = [.5,.5,.5];
	vertexShadersV1.roottree.linkchild(patt);
	

	// build a vertex pattern 2 fan
	patt = buildMesh("aPattFan", "Bark.png", "tex", 
		vertexShadersV1.pattMesh2, modelflagenums.DOUBLESIDED | modelflagenums.NOZBUFFER | modelflagenums.FAN);
	patt.scale = [.5,.5,.5];
	vertexShadersV1.roottree.linkchild(patt);

	// build a vertex pattern 3 strip
//	patt = buildMesh("aPattStrip", "Bark.png", "tex", 
	patt = buildMesh("aPattStrip", "maptestnck.png", "tex", 
		vertexShadersV1.pattMesh3, modelflagenums.DOUBLESIDED | modelflagenums.NOZBUFFER | modelflagenums.STRIP);
	patt.trans = [800,0,0];
	patt.scale = [.5,.5,.5];
	vertexShadersV1.roottree.linkchild(patt);

	// build a vertex pattern using new format for GLSL
	patt = buildMesh("aPattVersion", "Bark.png", "verttestversion", 
		vertexShadersV1.pattMesh2, modelflagenums.DOUBLESIDED | modelflagenums.NOZBUFFER | modelflagenums.FAN);
	patt.trans = [100,400,0];
	patt.scale = [.5,.5,.5];
	vertexShadersV1.roottree.linkchild(patt);


	// build a vertex pattern using no mesh
	patt = buildMesh("aPattNoMesh", "maptestnck.png", "verttestnomesh", 
		vertexShadersV1.pattMesh4, modelflagenums.DOUBLESIDED | modelflagenums.NOZBUFFER | modelflagenums.FAN);
	patt.mod.numInstances = 5;
	patt.trans = [500,400,0];
	patt.scale = [.5,.5,.5];
	vertexShadersV1.roottree.linkchild(patt);
// hi

	// build a vertex pattern using a uniform float array
	patt = buildMesh("aPattFloatUniformArray", "maptestnck.png", "verttestuniformarray", 
		vertexShadersV1.pattMesh5, modelflagenums.DOUBLESIDED | modelflagenums.NOZBUFFER | modelflagenums.FAN);
	patt.mod.mat.matColor = [1,0,0,1];
	patt.mod.mat.UAradArray = [150,75,300,200]; // uniform array
	patt.trans = [850,400,0];
	patt.scale = [.5,.5,.5];
	vertexShadersV1.roottree.linkchild(patt);

	mainvp = defaultorthoviewport();
	mainvp.clearcolor = F32LIGHTBLUE;
	mainvp.clearflags = gl.COLOR_BUFFER_BIT; // no depth buffer
	vertexShadersV1.onresize();
	
// UI debprint menu
	debprint.addlist("vertexTest V1",[
		"vertexShadersV1",
	]);

};

vertexShadersV1.proc = function() {
	// proc
	vertexShadersV1.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	vertexShadersV1.roottree.draw();
};

vertexShadersV1.onresize = function() {
	// fixup ortho viewport to handle the new size, lower left 0,0 to upper right XRES, YRES
	logger("vertexShadersV1 resize!\n");
	var scl = glc.clientHeight*.5;
	mainvp.trans = [scl*gl.asp,scl,0];
	mainvp.ortho_size = scl;
};

vertexShadersV1.exit = function() {
	// show current usage before cleanup
	vertexShadersV1.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	vertexShadersV1.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	vertexShadersV1.roottree = null;
	logger("exiting webgl vertexShadersV1 3D\n");
	
	debprint.removelist("vertexTest");

};
