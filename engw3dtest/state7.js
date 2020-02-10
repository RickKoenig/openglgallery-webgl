var state7 = {};

// test webgl
//var amod0,amod1,amod2;
//var modellist;
state7.roottree;

state7.text = "Load a .bws file.  It's a scene file that references many .bwo files.  " +
			"This is the ultimate stress test of the engine, " +
			"over 100 high triangle models rendered with advanced shaders using a high level managed tree structure.\n" +
			"This may take awhile to load.  " +
			"This is an accurate rendering of the famous 'Fort Point'.  Let's start near one of the cannons.\n" +
			"Press 'C' then hold down 'up arrow' to begin your adventure!";

state7.title = "Fort Point";

state7.multiview;

state7.load = function() {
	//if (!gl)
	//	return;
	preloadimg("../common/sptpics/maptestnck.png");
	//preloadimg("../common/sptpics/boohaa.jpg");
	preloadbws("fortpoint/fp7opt.BWS");
	//preloadbwo("fortpoint/SFPD_car1W.bwo");
};

state7.init = function() {
//	gl_mode(true);
//	if (!gl)
//		return;
	logger("entering webgl state7\n");
	// setup the whole multiview system
	state7.multiview = new Interleave3D();
	
// build model 0, test model, uvs and texture, 'tex' shader, test amp phase freq
    //var amod0 = new Model("mod0");
    amod0 = Model.createmodel("mod0");
    if (amod0.refcount == 1) {
    	amod0.setshader("tex");
	    var amod0mesh = {
	    	"verts":[
	        -1.0,  1.0,  0.0,
	         1.0,  1.0,  0.0,
	        -1.0, -1.0,  0.0,
	         1.0, -1.0,  0.0
	    ],
	    "uvs":[
			0.0,  0.0,
			1.0,  0.0,
			0.0,  1.0,
			1.0,  1.0,
	    ],
	    "faces":[
	    	0,1,2,
	    	3,2,1
	    ]};
	    amod0.setmesh(amod0mesh);
	    amod0.settexture("maptestnck.png");
	    amod0.commit();
	}
//	logger_str = "";
	//modellist = [amod0];
	
	state7.roottree = new Tree2("root");

	var tree0 = new Tree2("right");
	tree0.trans = vec3.fromValues(2,0,0);
	tree0.scale = vec3.fromValues(.25,.25,.25);
	tree0.rotvel = vec3.fromValues(0,0,Math.PI*2/3);
//	tree0.setmodel(amod0); // this is the same model, refcount is incremented
	tree0.setmodel(amod0.newdup()); // this is the same model, refcount is incremented
	var tree0sub = new Tree2("sub right");
	tree0sub.trans = vec3.fromValues(0,3,0);
	tree0sub.setmodel(amod0);
	tree0.linkchild(tree0sub);
	state7.roottree.linkchild(tree0);
	//state7.roottree.rotvel = vec3.fromValues(0,0,Math.PI*2/10);
	
	var tree1 = tree0.newdup();
	tree1.name = "left";
	tree1.trans = vec3.fromValues(-2,0,0);
	state7.roottree.linkchild(tree1);
	
	mainvp.trans = [7.02316,51.149,167.413]; // flycam, near the cannon
	//mainvp.trans = [0,0,-5]; // flycam
	mainvp.rot = [0,0,0]; // flycam
	var bwstree = new Tree2("fp7opt.BWS");
	//var bwstree = new Tree2("SFPD_car1W.bwo");
	state7.roottree.linkchild(bwstree);
	
	//state7.onresize();
	//logger_str = "";
};

//var once4 = true;
state7.proc = function() {
	//if (!gl)
	//	return;
	doflycam(mainvp); // modify the trs of vp
	
    //gl.clearColor(.5,0,1,1);                      // Set clear color to yellow, fully opaque
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

/*    mat4.copy(mvMatrix,vMatrix);
    var dist = 3;
    mat4.translate(mvMatrix,mvMatrix,[0,0,dist]);
    mat4.scale(mvMatrix,mvMatrix,[dist,dist,dist]);
   amod0.draw();
*/
	// draw main vp
	if (true) { // use interleave and 4 views
		state7.multiview.beginsceneAndDraw(mainvp,state7.roottree);
	} else { // just normal 1 view drawing
		beginscene(mainvp);
		state7.roottree.draw(); // depends on FB 1,2,3
	}

};

state7.onresize = function() {
	// will need for multiview
	logger("state7: onResize " + glc.clientWidth + " " + glc.clientHeight + "\n");
	state7.multiview.onresize();
};

state7.exit = function() {
	//alert("bye!");
//	gl_mode(false);
//	if (!gl)
//		return;
/*	var i;
	for (i=0;i<modellist.length;++i)
		modellist[i].glfree(); */
	state7.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	state7.roottree.glfree();
	state7.multiview.glfree();
	logrc();
	state7.roottree = null;
	logger("exiting webgl state7\n");
	mainvp = defaultviewport();
};
