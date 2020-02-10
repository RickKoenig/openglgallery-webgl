// cubemaptest namespace
var cubemaptest = {};

cubemaptest.text = "WebGL: Play with cubemaps.";
cubemaptest.title = "CubemapTest";

// webgl, trees
cubemaptest.roottree;

var scenelistcmt = [
	"cubemap_mountains.jpg",
	"Skansen",
	"Footballfield",
	"panel.jpg"
];

var scenedircmt = [
	"skybox",
	"skybox",
	"skybox",
	"../common/sptpics"
];

var cursceneidx = 0;

// load these before init
cubemaptest.load = function() {
	//preloadimg("../common/sptpics/maptestnck.png");
	//preloadimg("../common/sptpics/panel.jpg");
	//preloadimg("../common/sptpics/Bark.tga");
	//preloadimg("skybox/FishPond");
	//preloadimg("skybox/cube02");
	//preloadimg("skybox/cubemap_mountains.jpg");
	preloadimg(scenedircmt[cursceneidx] + "/" + scenelistcmt[cursceneidx]);
};

cubemaptest.init = function() {
	logger("entering webgl cubemaptest\n");
	
	// build scene
	cubemaptest.roottree = new Tree2("root");
	
	
	var atree;

	var curscene = scenelistcmt[cursceneidx];
//	atree = buildskybox("aprism3",[1,1,1],"FishPond","tex"); // helper, builds 1 prism returns a Tree2
	atree = buildskybox("aprism3",[1,1,1],curscene,"tex"); // helper, builds 1 prism returns a Tree2
//	atree = buildskybox("aprism3",[1,1,1],"cube02.jpg","tex"); // helper, builds 1 prism returns a Tree2
	cubemaptest.roottree.linkchild(atree);	

	//atree = buildprism("aprism5",[1,1,1],"panel.jpg","tex"); // use cubemap texture and shader
	atree = buildprism("aprism5",[1,1,1],"CUB_" + curscene,"cubemaptest"); // use cubemap texture and shader
	//atree = buildprism("aprism5",[1,1,1],"CUB_FishPond","envmapp"); // use cubemap texture and shader
	atree.trans = [0,0,2];
	var ints = .85;
	atree.mat.color = [ints,ints,ints,1.0];
	//atree.trans = [6,7.5,0];
	//atree.rotvel = [.02,.1,0];
	cubemaptest.roottree.linkchild(atree);

/*
	// build prism/plane
	//atree = buildprism("aprism",[.5,.5,.5],"maptestnck.png","texc"); // helper, builds 1 prism returns a Tree2
	atree = buildplanexy("aplane",20,20,"maptestnck.png","tex");
	atree.trans = [0,0,20];
	//tree0.mod.flags |= modelflagenums.HASALPHA;
	atree.mat.color=[1,.5,1,1];
	cubemaptest.roottree.linkchild(atree);	
	
	// build another 
	atree = buildplanexy("aplane2",1,1,"Bark.tga","tex");
	atree.trans = [-5,5,10];
	cubemaptest.roottree.linkchild(atree);	
	
	// build another 
	atree = buildsphere("texsphere",1,"maptestnck.png","tex");
	atree.trans = [0,5,10];
	cubemaptest.roottree.linkchild(atree);	
	
	// build another 
	atree = buildsphere("envmapshere",1,"CUB_cube02.jpg","envmapp");
	atree.trans = [5,5,10];
	atree.rotvel = [0,.1,0];
	cubemaptest.roottree.linkchild(atree);	

	// build another 
	atree = buildprism("envmapprism",[1,1,1],"CUB_cube02.jpg","envmapp");
	atree.trans = [-5,0,10];
	atree.rotvel = [0,.1,0];
	cubemaptest.roottree.linkchild(atree);	
	
	// build another 
	atree = buildplanexy("aplane3",1,1,"Bark.tga","tex");
	atree.trans = [0,0,10];
	cubemaptest.roottree.linkchild(atree);	
	
	// build another 
	atree = buildplanexy("aplane3",1,1,"Bark.tga","tex");
	atree.trans = [5,0,10];
	cubemaptest.roottree.linkchild(atree);	
*/
	// reset camera
	mainvp.trans = [0,0,0]; // flycam
	mainvp.rot = [0,0,0]; // flycam
}

cubemaptest.proc = function() {
	// proc
	if (input.key == "t".charCodeAt(0)) {
		++cursceneidx;
		if (cursceneidx >= scenelistcmt.length)
			cursceneidx = 0;
		changestate("cubemaptest");
		//changestate(state11);
	}
	cubemaptest.roottree.proc(); // animate
	doflycam(mainvp); // modify the trs of vp using flycam

	// draw
	beginscene(mainvp);
	cubemaptest.roottree.draw();
};

cubemaptest.exit = function() {
	// show current usage
	cubemaptest.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	cubemaptest.roottree.glfree();

	// show usage after cleanup
	logrc();
	cubemaptest.roottree = null;
	logger("exiting webgl cubemaptest\n");
};
