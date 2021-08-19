// nim game
var nim = {}; // the nim game state

nim.text = "Nim Game, a work in progress";
nim.title = "Nim";
nim.maxlevel = 1240;

// load these before init
nim.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

nim.lesslevel = function() {
	if (nim.curlevel > 0)
		--nim.curlevel;
	nim.updatelevel();
};

nim.morelevel = function() {
	if (nim.curlevel < nim.maxlevel)
		++nim.curlevel;
	nim.updatelevel();
};

nim.updatelevel = function() {
	//if (myform)
		//selectsetidx(nim.sellev,nim.curlevel);
		//slidersetidx(nim.sellev2,nim.curlevel);
	//else
	//	curlevel = 2;
	printareadraw(nim.levelarea,"Level : " + nim.curlevel);
	var i,f;
	/*
	var childcopy = roottree.children.slice();
	for (i=0;i<childcopy.length;++i) {
		childcopy[i].glfree();
		childcopy[i].unlinkchild();
	} */
/*	nim.roottree.glfree();
	nim.roottree = new Tree2("roottree");
	var simple = false;
	if (simple) {
		var tree1 = buildprism("aprism2",[.5,.5,.5],"maptestnck.png","tex"); // helper, builds 1 prism returns a Tree2
		nim.roottree.linkchild(tree1);
		return;
	}
	i = Math.floor(nim.curlevel/10); // test must be an integer
	//for (i=cur;i<=3;++i) {
		for (var g=0;g<6;++g) {
			// a modelpart
			var amod = Model2.createmodel("spongemod m" + i + "s" + g);
			if (amod.refcount == 1) {
				//amod.setmesh(smeshtemplate);
				var msh = nim.makesponge(i,g);//,[0,-i*1.5,0]);
				amod.setmesh(msh);
				//amod.settexture("maptestnck.png");
				//amod.setshader("tex");
				var fs = 6000;
				for (f=0;f<amod.faces.length;f += fs) {
					var f2 = f + fs;
					if (f2 >= amod.faces.length)
						f2 = amod.faces.length;
					var fp = f2 - f;
					//amod.addmat("tex",null,fp,2*fp);
					//amod.addmat("texc","BridgeCon1.png",fp,2*fp);
					amod.addmat("texc","maptestnck.png",fp,2*fp);
				}
				amod.mat.color = nim.colss6[g];
				//amod.mat.color = [.75,.75,.75,1];
				amod.commit();
				//amod.settexture();
				var atree = new Tree2("spongepart" + i);
				atree.setmodel(amod);
				//atree.trans = [0,(4-i)*1.5,0];
				//atree.trans = [-.45,-.45,0];
				atree.trans = [-.5,-.5,0];
				var scl = 1.0/nim.pow3[i];
				atree.scale = [scl,scl,scl];
				//pendpce0.rotvel = [.1,.5,0];
				//pendpce0.flags |= treeflagenums.ALWAYSFACING;
				nim.roottree.linkchild(atree);
			}
		}
	//} */
};

nim.init = function() {
	nim.count = 0;
	nim.curlevel = 1234;
	logger("entering webgl nim\n");

	// ui
	
	setbutsname('nim');
	nim.levelarea = makeaprintarea('level: ');
	
	nim.bl = makeabut("lower level",nim.lesslevel);
	nim.bh = makeabut("higher level",nim.morelevel);
	nim.bh.disabled = true;
	nim.updatelevel();
	
	//if (myform)
	//var selstr = nim.makeLevelSelect();
/*	nim.sellev = makeaselect(selstr,nim.selectlevel);
	//sellev = makeaselect(["Level 0","Level 1","Level 2","Level 3","Level 4"],selectlevel);
	nim.sellev2 = makeaslider(0,nim.maxlevel,nim.curlevel,nim.sliderCallback);
	//paslider = makeaprintarea("slider output");
	//printareadraw(paslider,sellev2.value);
	nim.updatelevel();
	*/

	// build parent
	nim.roottree = new Tree2("nim root tree");

	// build a planexy (a square)
	// make double sided and test gl_FrontFace (TODO: check spelling)
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","diffusespecp");
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","tex");
	var plane = buildplanexy("aplane",1,1,"maptestnck.png","texDoubleSided");
	plane.mod.flags |= modelflagenums.DOUBLESIDED;

	plane.trans = [0,0,1];
	nim.roottree.linkchild(plane);

	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
};

nim.proc = function() {
	// proc
	++nim.count;
	// do something after 4 seconds
	if (nim.count == 4*fpswanted) {
		//changestate("solarTest");
		//window.history.back();
		//window.location.href = "../../index.html";
		//window.location.href = "http://janko.at";
		nim.bl.disabled = !nim.bl.disabled;
		nim.bh.disabled = !nim.bh.disabled;
		nim.count = 0;
	}
	nim.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	nim.roottree.draw();
};

nim.exit = function() {
	// show current usage before cleanup
	nim.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	nim.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	nim.roottree = null;
	clearbuts('nim');
	logger("exiting webgl nim\n");
};
