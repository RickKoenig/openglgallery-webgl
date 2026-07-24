var shaderTest = {};

// BIG TODO: make less global
// test webgl
// should be inside shaderTest
var roottree;
var tree0,tree1,tree2,tree3,tree4,tree5,tree6,tree7,tree8,tree9,tree10,tree11,tree12; // many different shaders
var tree13,tree14,tree15,tree16; // specular
var tree17,tree18; // tree color
var tree17,tree18; // tree textures
var tree19,tree20; // tree texture override
var tree21,tree22; // change stuff on model
var tree23;	// world
var tree24; // no pers
var shaderTestang;

var scenelist11 = [
	"cubemap_mountains.jpg",
	"Skansen",
	"Footballfield",
	"panel.jpg"
];

var scenelist11dir = [
	"skybox",
	"skybox",
	"skybox",
	"../common/sptpics"
];

var cursceneidx = 0;
var curscenesky = null;
var curscenejpg = null;
var cubcurscene = null;



// for animating textures
var shaderTesttexlist = [
	"maptestnck.png",
	"panel.jpg",
	"wonMedal.png",
	"coin_logo.png"
];

var frame;
var oldcnt;

 // instructions
 shaderTest.text = "WebGL: This is a test area for various shaders.  " + 
			"Toggle the 'flycam' using the 'C' key.  " +
			"Reset the position of the camera with the 'R' key. Load different scenes with the 'T' key. Break skybox 'K'\n" +
			"Aim the camera with the mouse. " + 
			"Move the camera with the arrow keys and left and right mouse buttons.  " +
			"Speed up and slow down camera movement with '+/=' and '-' keys.\n" +
			"Tab through various states using the 'prev state' and 'next state' buttons.";

shaderTest.title = "Shaders";

shaderTest.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("skybox/cube.jpg");
	preloadimg("skybox/cube2.jpg");
	preloadimg("skybox/cubemap_mountains.jpg");
	preloadimg("skybox/cubicmap.jpg");
	
	preloadimg(scenelist11dir[cursceneidx] + "/" + scenelist11[cursceneidx]);
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/wonMedal.png");
	preloadimg("../common/sptpics/coin_logo.png");
	preloadimg("../common/sptpics/light.jpg");
	preloadimg("../common/sptpics/dark.jpg");
};

 // test inheritance
function Animal() {
	this.avar = "animal";
	//logger("new animal\n");
}
	
Animal.prototype.speak = function() {
	logger("Animal Noise\n");
}	

Animal.prototype.live = function() {
	logger("Living '" + this.avar + "'\n");
}	

function Cat()
{
	//this = new Animal();
	this.avar = "cat";
	logger("new cat\n");
}

Cat.prototype = new Animal();
Cat.prototype.speak = function() {
	logger("Meow\n");
}	

function Dog() {
//	parent = 
	//this = new Animal();
	this.avar = "dog";
	logger("new dog\n");
}

Dog.prototype = new Animal();
Dog.prototype.speak = function() {
	logger("Woof\n");
}	

function testinheritance() {
	logger("--- animal ---\n");
	var a = new Animal();
	a.speak();
	a.__proto__.speak();
	//a.__proto__.__proto__.speak();
	a.live();
	logger("--- cat ---\n");
	var c = new Cat();
	c.speak();
	c.__proto__.speak();
	c.__proto__.__proto__.speak();
	c.live();
	logger("--- dog ---\n");
	var d = new Dog();
	d.speak();
	d.__proto__.speak();
	d.__proto__.__proto__.speak();
	d.live();
}
// end test inheritance

var cachedgltextures = [];

function loadcachedtextures() {
	var i;
	for (i=0;i<shaderTesttexlist.length;++i)
		cachedgltextures.push(Texture.createtexture(shaderTesttexlist[i]));
}

function freecachedtextures() {
	var i;
	for (i=0;i<cachedgltextures.length;++i)
		cachedgltextures[i].glfree();
	cachedgltextures = [];
}

shaderTest.init = function() {
	// UI
	setbutsname('shaderTest');
	makeabut("next texture",null,shaderTest.changeTexture);
	frame = 0;
	oldcnt = -1;
	logger("entering webgl shaderTest\n");
	loadcachedtextures();
	
	shaderTestang = 0;
	roottree = new Tree2("root");
	
	curscene = scenelist11[cursceneidx];
	curscenejpg = curscene;// + ".jpg";
	cubcurscene = "CUB_" + curscenejpg;
	tree3 = buildskybox("aprism3",[50,50,50],curscenejpg,"tex"); // helper, builds 1 prism returns a Tree2
	roottree.linkchild(tree3); 
	
	tree9 = buildprism("aprism9",[1,1,1],"maptestnck.png","diffusespecv"); // helper, builds 1 prism returns a Tree2
	tree9.trans = [-10,7.5,0];
	tree9.rotvel = [.15,.4,0];
	roottree.linkchild(tree9);
	
	tree10 = buildsphere("asphere10",1,"maptestnck.png","diffusespecv");
	tree10.trans = [-10,2.5,0];
	tree10.rotvel = [.15,.4,0];
	roottree.linkchild(tree10);

	tree0 = buildprism("aprism",[1,1,1],"maptestnck.png","diffusev"); // helper, builds 1 prism returns a Tree2
	tree0.trans = [-6,7.5,0];
	tree0.rotvel = [.15,.4,0];
	roottree.linkchild(tree0);
	
	tree1 = buildsphere("asphere",1,"maptestnck.png","diffusev");
	tree1.trans = [-6,2.5,0];
	tree1.rotvel = [.15,.4,0];
	roottree.linkchild(tree1);

	tree13 = buildprism("aprism13",[1,1,1],"maptestnck.png","diffusespecp"); // helper, builds 1 prism returns a Tree2
	tree13.trans = [-10,-2.5,0];
	tree13.rotvel = [.15,.4,0];
	roottree.linkchild(tree13);
	
	tree14 = buildsphere("asphere14",1,"maptestnck.png","diffusespecp");
	tree14.trans = [-10,-7.5,0];
	tree14.rotvel = [.15,.4,0];
	roottree.linkchild(tree14);

	tree15 = buildprism("aprism15",[1,1,1],"maptestnck.png","diffusep"); // helper, builds 1 prism returns a Tree2
	tree15.trans = [-6,-2.5,0];
	tree15.rotvel = [.15,.4,0];
	roottree.linkchild(tree15);
	
	tree16 = buildsphere("asphere16",1,"maptestnck.png","diffusep");
	tree16.trans = [-6,-7.5,0];
	tree16.rotvel = [.15,.4,0];
	roottree.linkchild(tree16);

	tree2 = buildprism6("aprism2",[1,1,1],curscenejpg,"tex"); // helper, builds 1 prism returns a Tree2
	tree2.trans = [-2,7.5,0];
	roottree.linkchild(tree2);
	
	tree4 = buildsphere("asphere2",1,cubcurscene,"envmapv"); // use cubemap texture and shader
	tree4.trans = [2,2.5,0];
	tree4.rotvel = [.02,.1,0];
	roottree.linkchild(tree4);

	tree5 = buildsphere("asphere3",1,cubcurscene,"envmapp"); // use cubemap texture and shader
	tree5.trans = [6,2.5,0];
	tree5.rotvel = [.02,.1,0];
	roottree.linkchild(tree5);

	tree8 = buildsphere("asphere7",1,cubcurscene,"cubemap"); // use cubemap texture and shader
	tree8.trans = [-2,2.5,0];
	roottree.linkchild(tree8);

	tree6 = buildprism("aprism4",[1,1,1],cubcurscene,"envmapv"); // use cubemap texture and shader
	tree6.trans = [2,7.5,0];
	tree6.rotvel = [.02,.1,0];
	roottree.linkchild(tree6);

	tree7 = buildprism("aprism5",[1,1,1],cubcurscene,"envmapp"); // use cubemap texture and shader
	tree7.trans = [6,7.5,0];
	tree7.rotvel = [.02,.1,0];
	roottree.linkchild(tree7);

	tree11 = buildsphere("asphere11",1,cubcurscene,"envmapghostv"); // use cubemap texture and shader
	tree11.trans = [10,2.5,0];
	tree11.rotvel = [.02,.1,0];
	roottree.linkchild(tree11);

	tree12 = buildprism("aprism12",[1,1,1],cubcurscene,"envmapghostv"); // use cubemap texture and shader
	tree12.trans = [10,7.5,0];
	tree12.rotvel = [.02,.1,0];
	roottree.linkchild(tree12);

	tree17 = buildsphere("asphere17",1,null,"flat");
	tree17.mat.color = [1,0,0,.45]; // treecolor
	tree17.mod.flags |= modelflagenums.HASALPHA;
	tree17.trans = [-2,-2.5,0];
	tree17.rotvel = [.15,.4,0];
	roottree.linkchild(tree17);

	tree18 = buildsphere("asphere18",1,null,"flat");
	tree18.mat.color = [0,1,0,.55]; // treecolor
	tree18.mod.flags |= modelflagenums.HASALPHA;
	tree18.trans = [-2,-7.5,0];
	tree18.rotvel = [.15,.4,0];
	roottree.linkchild(tree18);

	tree19 = buildsphere("asphere19",1,"maptestnck.png","tex");
	tree19.trans = [2,-2.5,0];
	tree19.rotvel = [.15,.4,0];
	roottree.linkchild(tree19);

	tree20 = tree19.newdup();
	tree20.settexture("panel.jpg");
	tree20.trans = [2,-7.5,0];
	tree20.rotvel = [.15,.4,0];
	roottree.linkchild(tree20);

	tree21 = buildsphere("asphere21",1,"maptestnck.png","tex");
	tree21.trans = [6,-2.5,0];
	tree21.rotvel = [.15,.4,0];
	roottree.linkchild(tree21);

	tree22 = buildsphere("asphere22",1,"maptestnck.png","tex");
	tree22.trans = [6,-7.5,0];
	roottree.linkchild(tree22);

	var psu = spherepatchu;
	var psv = spherepatchv;
	spherepatchu = 1;
	spherepatchv = 1;
	tree23 = buildsphere2t("asphere23",1,"light.jpg","dark.jpg","daynight");
	tree23.trans = [10,-2.5,0];
	tree23.rotvel = [.15,.4,0];
	spherepatchu = psu;
	spherepatchv = psv;
	roottree.linkchild(tree23);
	
	tree23 = buildprism("aprism23",[1,1,1],"maptestnck.png","nopers"); // helper, builds 1 prism returns a Tree2
	tree23.trans = [10,-7.5,0];
	tree23.rotvel = [.15,.4,0];
	roottree.linkchild(tree23);

	var lighttre = new Tree2("adirlight");
	lighttre.flags |= treeflagenums.DIRLIGHT;
	lighttre.rotvel = [0,1,0];
	addlight(lighttre);
	roottree.linkchild(lighttre);

	mainvp.trans = [0,0,-10]; // flycam
	mainvp.rot = [0,0,0]; // flycam
};

shaderTest.changeTexture = function() {
	++cursceneidx;
	if (cursceneidx == scenelist11.length) {
		cursceneidx = 0;
	}
	//changestate(shaderTest); // relaunch state with new intent
	changestate("shaderTest");
};

shaderTest.proc = function() {
	// change scene
	if (input.key == "t".charCodeAt(0)) {
		shaderTest.changeTexture();
	}
	// break skybox
	if (input.key == "k".charCodeAt(0)) {
		tree3.mod.flags ^= modelflagenums.NOZBUFFER | modelflagenums.ISSKYBOX;
	}

	// rebuild animated sphere
	var uvmesh = buildspheremesh(1);
	var i;
	for (i=0;i<uvmesh.verts.length;i+=3) {
		uvmesh.verts[i] += Math.random()*.0625 - .01325;
		uvmesh.verts[i+1] += Math.random()*.0625 - .01325;
		uvmesh.verts[i+2] += Math.random()*.0625 - .01325;
	}
	for (i=0;i<uvmesh.uvs.length;i+=2) {
		uvmesh.uvs[i] += Math.random()*.03125 - .015625;
		uvmesh.uvs[i+1] += Math.random()*.03125 - .015625;
	}
	spherefixpatch(uvmesh); // fix wrap around, remove gap
	
	tree21.mod.changemesh(uvmesh);
	var nzfpswanted = fpswanted;
	if (!fpswanted)
		nzfpswanted = 1;
	var cnt = Math.floor(frame/nzfpswanted);
	cnt = cnt%4;
	if (cnt != oldcnt) {
		tree21.mod.changetexture(shaderTesttexlist[cnt]);
		oldcnt = cnt; 
	}
	
	roottree.proc();
	doflycam(mainvp); //  // modify the trs of the vp
	beginscene(mainvp);
	roottree.draw();
	shaderTestang += .01;
	if (shaderTestang > 2*Math.PI)
		shaderTestang -= 2*Math.PI;
};

shaderTest.exit = function() {
	roottree.log();
	logrc();
	logger("after roottree glfree\n");
	roottree.glfree();
	freecachedtextures();
	logrc();
	roottree = null;
	// remove ui
	clearbuts('shaderTest');
	logger("exiting webgl shaderTest\n");
};
