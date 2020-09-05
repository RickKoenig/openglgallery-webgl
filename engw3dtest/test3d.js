var test3d = {};

test3d.step = .0625;

// test webgl
test3d.roottree;
//test3d.atree;

test3d.text = "WebGL: This state is where the developer tries new 3D things.";

test3d.title = "test3d";

test3d.infocnt;

test3d.button1 = function() {
	alert("button1 !");
}

test3d.button2 = function() {
	alert("button2 !");
}

// print some realtime info
test3d.updateinfo = function() {
	//var tx = input.mx / glc.clientWidth;
	//var ty = input.my / glc.clientHeight;
	var tx = (input.mx - (glc.clientWidth - glc.clientHeight)/2)/ glc.clientHeight;
	var ty = input.my / glc.clientHeight;
	printareadraw(test3d.infoarea,"test3d Info = "  + test3d.infocnt++ + " tex (" + tx.toFixed(3) + "," + ty.toFixed(3) + ")");
	//printareadraw(test3d.infoarea,"test3d Info = "  + test3d.infocnt++ + " mouse (" + input.mx + "," + input.my + ")");
};

// load these before init
test3d.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
};

test3d.init = function() {
	logger("entering webgl test3d\n");
	
	// ui
	setbutsname('test3d');

	makeahr();
	makeabut("Button 1",test3d.button1);
	makeabut("Button 2",test3d.button2);

	// build parent
	test3d.roottree = new Tree2("root");
	test3d.roottree.trans = [0,0,3];

	// build a prism
	//test3d.atree = buildprism("aprism",[.5,.5,.5],"maptestnck.png","texc"); // helper, builds 1 prism returns a Tree2
	test3d.cub =  buildprism("aplane",[.5,.5,.5],"maptestnck.png","diffusespecp");
	//test3d.tree0.mod.flags |= modelflagenums.HASALPHA;
	test3d.cub.trans = [1,0,0];
	//test3d.cub.mat.color=[1,.5,1,1];
	//test3d.cub.rotvel = [.5,.4,.3];
	test3d.roottree.linkchild(test3d.cub);	
	
	// build a sphere
	test3d.sph =  buildsphere("asphere",.5,"maptestnck.png","diffusespecp");
	//test3d.tree0.mod.flags |= modelflagenums.HASALPHA;
	test3d.sph.trans = [-1,0,0];
	//test3d.sph.mat.color=[1,.5,1,1];
	//test3d.sph.rotvel = [.5,.4,.3];
	test3d.roottree.linkchild(test3d.sph);	

	// add a dir light
	var lt = new Tree2("dirlight");
	//lt.rot = [0,0,0];
	lt.rotvel = [0,1,0];
	lt.flags |= treeflagenums.DIRLIGHT;
	addlight(lt);
	test3d.roottree.linkchild(lt);

	// move view back some using LHC
	//mainvp.trans = [0,0,-3]; // flycam
	mainvp = defaultviewport();
	mainvp.rot = [0,0,0]; // flycam

	// ui, realtime log update
	setbutsname('test3d');
	test3d.infoarea = makeaprintarea('test3d Info: ');
	test3d.infocnt = 0;
	test3d.updateinfo();
};

test3d.proc = function() {
	// proc
	//dolights();
	test3d.updateinfo();
	test3d.cub.trans[2] = input.wheelPos * test3d.step;
	switch (input.key) {
	case keycodes.RIGHT:
		test3d.cub.trans[0] += test3d.step;
		break;
	case keycodes.LEFT:
		test3d.cub.trans[0] -= test3d.step;
		break;
	case keycodes.UP:
		test3d.cub.trans[1] += test3d.step;
		break;
	case keycodes.DOWN:
		test3d.cub.trans[1] -= test3d.step;
		break;
	}
	test3d.roottree.proc();
	doflycam(mainvp); // modify the trs of vp using flycam
	
	// draw
	beginscene(mainvp);
	test3d.roottree.draw();
};

test3d.exit = function() {
	// show current usage
	//debprint.removelist("test3d");
	test3d.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	test3d.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	test3d.roottree = null;
	logger("exiting webgl test3d\n");
	clearbuts('test3d');
};
