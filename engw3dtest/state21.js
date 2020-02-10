var state21 = {};

state21.text = "WebGL: Shadow Mapping merge.";

state21.title = "Shadow mapping merge";

// texture
var shadowtexture;

// trees
var roottree,floor,wall,cyl1,cyl2,light,viewer;

state21.lightdist = 20;
state21.lightloc = [0,state21.lightdist,-state21.lightdist];

var frm;

state21.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
};

state21.init = function() {
	logger("entering webgl state21\n");
	frm = 0;
	
// build render target
	var shadowmapres = 2048;
	shadowtexture = FrameBufferTexture.createtexture("shadowmap",shadowmapres,shadowmapres);

// shadow viewport
	state21.shadowvp = {
		target:shadowtexture,
	   	clearflags:gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
		//clearcolor:[1,1,1,1],                    // Set clear color to yellow, fully opaque
		clearcolor:[0,0,0,1],                    // Set clear color to yellow, fully opaque
		trans:vec3.clone(state21.lightloc),
		rot:[Math.PI/4,0,0], // part of lightdir
	   	near:.1,
	   	far:10000.0,
	   	zoom:1,
		asp:1,
		isshadowmap:true,
		xo:0,
		yo:0,
		xs:1,
		ys:1
	};

// main viewport for state 21
	state21.mvp = {
	   	clearflags:gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
		clearcolor:[.15,.25,.75,1],                    // Set clear color to yellow, fully opaque
	//	trans:vec3.clone(state21.lightloc),
		trans:[-10,20,-20],
		rot:[Math.PI/4,0,0], // part of lightdir
	   	near:.1,
	   	far:10000.0,
	   	zoom:1,
		asp:gl.asp,
		xo:0,
		yo:0,
		xs:1,
		ys:1
	};

// build the  scene
	roottree = new Tree2("root");
	//roottree.rotvel = [0,.1,0];
	roottree.flags |= treeflagenums.DONTDRAW; // testing
	
	// big floor
	floor = buildplanexy2t("planexy1",20,20,"maptestnck.png","shadowmap","shadowmapuse"); // tex
	floor.trans = [0,0,20];
	floor.flags |= treeflagenums.DONTCASTSHADOW;
	roottree.linkchild(floor);
	
	// big wall
	wall = buildplanexz2t("planexz1",20,20,"maptestnck.png","shadowmap","shadowmapuse"); // tex
	wall.trans = [0,-20,0];
	wall.flags |= treeflagenums.DONTCASTSHADOW;
	roottree.linkchild(wall);
	
	// shadow map viewer
	viewer = buildplanexy("planexy3",2,2,"shadowmap","shadowmapshow"); // invert framebuffer renders, sigh
	viewer.trans = [7,0,-1];
	viewer.flags |= treeflagenums.DONTCASTSHADOW;
	roottree.linkchild(viewer);
	
	// the light sphere
	light = buildsphere("sph4",.2,null,"flat"); // this is where the light is
	light.mod.mat.color = [1,1,0,1];
	light.trans = [0,20,-20];
	light.flags |= treeflagenums.DONTCASTSHADOW;
	light.flags |= treeflagenums.DIRLIGHT;
	light.rot = [Math.PI/4,0,0];
	addlight(light);
	roottree.linkchild(light);
	
	// two cylinders
	//cyl1 = buildcylinderxz2t("cyl1",.4,2.5,"panel.jpg","shadowmap","shadowmapuse");
	cyl1 = buildcylinderxz2t("cyl1",.4,2.5,"panel.jpg","shadowmap","shadowmapusec");
	//cyl1 = buildcylinderxz("cyl1",.4,2.5,"panel.jpg","texc");
	cyl1.scale = [2,2,2];
	cyl1.trans = [5,15,-7];
	cyl1.rot = [0,0,Math.PI/4];
	var i;
	for (i=0;i<cyl1.children.length;++i)
		cyl1.children[i].mat.color = [0.0,1.0,0.0,1.0];
	roottree.linkchild(cyl1);

	//cyl2 = buildcylinderxz("cyl2",.4,1.5,"panel.jpg","tex");
	cyl2 = buildcylinderxz2t("cyl2",.4,1.5,"panel.jpg","shadowmap","shadowmapuse");
	cyl2.scale = [5,5,5];
	cyl2.trans = [5,10,3];
	roottree.linkchild(cyl2);
};

state21.proc = function() {
	doflycam(state21.mvp); // modify the trs of the vp
	
	cyl1.trans[2] = 10 + 15*Math.sin(2*frm);
	// update trees
	roottree.proc();
	
	// draw to shadowmap
	beginscene(state21.shadowvp);
	roottree.draw();

	// draw main scene
	beginscene(state21.mvp);	
	roottree.draw();

	// update frame counter
	frm += .002;
	if (frm >= 2*Math.PI)
		frm -= 2*Math.PI;
};

state21.exit = function() {
	roottree.log();
	logrc();
	logger("after roottree glfree\n");
	roottree.glfree();
	shadowtexture.glfree();
	logrc();
	roottree = null;
	logger("exiting webgl state21\n");
};
