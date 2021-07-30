// very minimalist 3D state
var tubedots = {}; // the 'tubedots' state

tubedots.text = "WebGL: Draw stuff inside a tube";
tubedots.title = "tubedots 3D";

tubedots.nzb = 0;
//tubedots.nzb = modelflagenums.NOZBUFFER;

// load these before init
tubedots.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

tubedots.buildParticleMeshAlwaysFacing = function(cols, rows) {
	// instances of quads
	var ret = buildplanexy("instanceMeshAlwaysFacing", 1, 1, "maptestnck.png", "meshparticlealwaysfacing");
	//ret.flags |= treeflagenums.ALWAYSFACING;
	var mod = ret.mod;
	mod.numInstances = cols * rows;
	var mat = mod.mat;
	mat.mcolor = [1, 1, 1, 1];
	mat.numRows = rows;
	mat.numCols = cols;
	return ret;
};

tubedots.buildStripMesh = function(cols, rows) {
	// no mesh
	var numVerts = (cols + 1) * 2 * rows;
	pattMesh = {
		"numVerts": numVerts // no data, generate numVerts in vertex shader
	};
	var ret = buildMesh("stripMesh", "maptestnck.png", "meshstrip", 
		pattMesh, tubedots.nzb | modelflagenums.STRIP);
	var mat = ret.mod.mat;
	mat.mcolor = [1, 1, 1, 1];
	mat.numRows = rows;
	mat.numCols = cols;
	return ret;
};

tubedots.buildParticleMesh = function(cols, rows) {
	// instances of quads
	var ret = buildplanexy("instanceMesh", 1, 1, "maptestnck.png", "meshparticle");
	var mod = ret.mod;
	mod.numInstances = cols * rows;
	var mat = mod.mat;
	mat.mcolor = [1, 1, 1, 1];
	mat.numRows = rows;
	mat.numCols = cols;
	return ret;
};

tubedots.init = function() {
	tubedots.count = 0;
	logger("entering webgl tubedots 3D\n");

	// build parent tree
	tubedots.roottree = new Tree2("tubedots root tree");
	tubedots.roottree.trans = [0,0,4];
	
	// 12 various quads for alignment
	
	// left, standard quad
	var plane = buildplanexy("aplane",1,1,"maptestnck.png","texDoubleSided");
	plane.mod.flags |= modelflagenums.DOUBLESIDED | tubedots.nzb;
	plane.trans = [-4.2,0,0]; // it's in the middle
	tubedots.roottree.linkchild(plane);

	plane = plane.newdup();
	plane.trans = [-4.2,2.1,0]; // above
	tubedots.roottree.linkchild(plane);
	
	plane = plane.newdup();
	plane.trans = [-4.2,-2.1,0]; // below
	tubedots.roottree.linkchild(plane);
	

	plane = plane.newdup();
	plane.trans = [-2.1,2.1,0]; // above
	tubedots.roottree.linkchild(plane);
	
	plane = plane.newdup();
	plane.trans = [-2.1,-2.1,0]; // below
	tubedots.roottree.linkchild(plane);
	
	plane = plane.newdup();
	plane.trans = [0,2.1,0]; // above
	tubedots.roottree.linkchild(plane);
	
	plane = plane.newdup();
	plane.trans = [0,-2.1,0]; // below
	tubedots.roottree.linkchild(plane);

	plane = plane.newdup();
	plane.trans = [2.1,2.1,0]; // above
	tubedots.roottree.linkchild(plane);
	
	plane = plane.newdup();
	plane.trans = [2.1,-2.1,0]; // below
	tubedots.roottree.linkchild(plane);
	
	plane = plane.newdup();
	plane.trans = [4.2,2.1,0]; // above
	tubedots.roottree.linkchild(plane);
	
	plane = plane.newdup();
	plane.trans = [4.2,0,0]; // middle right
	tubedots.roottree.linkchild(plane);
	
	plane = plane.newdup();
	plane.trans = [4.2,-2.1,0]; // below
	tubedots.roottree.linkchild(plane);
	
	// custom shader work, 3 models
	var tessx = 80;
	var tessy = 60;

	// left, instanced rendering with always facing
	plane = tubedots.buildParticleMeshAlwaysFacing(tessx, tessy);
	plane.trans = [-2.1, 0, 0];
	tubedots.roottree.linkchild(plane);

	// center, strip tessellation
	plane = tubedots.buildStripMesh(tessx, tessy);
	plane.trans = [0,0,0];
	tubedots.roottree.linkchild(plane);
	
	// right, instanced rendering
	plane = tubedots.buildParticleMesh(tessx, tessy);
	plane.trans = [2.1, 0, 0];
	tubedots.roottree.linkchild(plane);


	// setup viewport
	mainvp = defaultviewport();
	//mainvp.trans = [-2.1, 0, 0];
};

tubedots.proc = function() {
	// proc
	++tubedots.count;
	// animate
	tubedots.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	// draw
	beginscene(mainvp);
	tubedots.roottree.draw();
};

tubedots.exit = function() {
	// show current usage before cleanup
	tubedots.roottree.log();
	logrc();
	
	// show usage after cleanup
	tubedots.roottree.glfree();
	tubedots.roottree = null;
	logger("after roottree glfree\n");
	logrc();
	logger("exiting webgl tubedots 3D\n");
};
