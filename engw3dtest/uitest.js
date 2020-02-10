// interact with 3d objects UI test new, try using uiclass

var uitest = {};
uitest.text = "WebGL: Start testing 3d ui new ";
uitest.title = "uitest new";

uitest.roottree;
uitest.uiroottree;

uitest.UIObj = function(x,y,w,h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	// tree object super simple
	this.tree = buildplanexy01("aplanexyUI1t",1,1,"panel.jpg","tex"); // -1,-1 to 1,1
	this.tree.mod.flags |= modelflagenums.NOZBUFFER;
	// link
	uitest.roottree.linkchild(this.tree);
	uitest.UIObj.uiobjs.push(this);
};

uitest.UIObj.prototype.proc = function() {
	//logger("UIObj proc\n");
	var xres = uitest.UIObj.xres;
	var yres = uitest.UIObj.yres;
	var ih = 2/yres;
	var asp = xres/yres;
	this.tree.trans = [-asp + ih*this.x,1 - ih*this.y,0];
	this.tree.scale = [ih*this.w,ih*this.h,1];
};

uitest.UIObj.prototype.remove = function() {
	logger("remove UIObj\n");
	var srch = uitest.UIObj.uiobjs.indexOf(this); // find object in list
	if (srch !== -1) {
		uitest.UIObj.uiobjs.splice(srch, 1); // remove from list
		if (this.tree) {
			this.tree.unlinkchild(); // free resources
			this.tree.glfree();
		}
	}
};

uitest.UIObj.reset = function() {
	uitest.UIObj.uiobjs = []; // array of UI objects
};

uitest.UIObj.procAll = function() {
	uitest.UIObj.setScreenSize(glc.clientWidth,glc.clientHeight); // update incase changed screen resolution
	for (var i=0;i<uitest.UIObj.uiobjs.length;++i) {
		var uiobj = uitest.UIObj.uiobjs[i];
		uiobj.proc();
	}
};

uitest.UIObj.setScreenSize = function(wid,hit) {
	uitest.UIObj.xres = wid;
	uitest.UIObj.yres = hit;
};

// load these before init
uitest.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
	preloadimg("../common/sptpics/xpar.png");
	preloadtext("ui/default2.uis");
	preloadtext("ui/testhier.uis");
	preloadtext("ui/overlap.uis");
};

uitest.testchildren = function(rt) {
	var ch0 = buildplanexy01("ch0",1,1,"maptestnck.png","tex"); // -1,-1 to 1,1
	ch0.trans = [0,0,0];
	ch0.scale = [200,200,200];
	ch0.mod.flags |= modelflagenums.NOZBUFFER;
	rt.linkchildback(ch0);
	
	var ch1 = buildplanexy01("ch1",1,1,"maptestnck.png","tex"); // -1,-1 to 1,1
	ch1.trans = [25,-25,0];
	ch1.scale = [200,200,200];
	ch1.mod.flags |= modelflagenums.NOZBUFFER;
	rt.linkchildback(ch1);
	
	var ch2 = buildplanexy01("ch2",1,1,"maptestnck.png","tex"); // -1,-1 to 1,1
	ch2.trans = [50,-50,0];
	ch2.scale = [200,200,200];
	ch2.mod.flags |= modelflagenums.NOZBUFFER;
	rt.linkchildback(ch2);
	//ch2.unlinkchild();
	
	var ch3 = buildplanexy01("ch3",1,1,"maptestnck.png","tex"); // -1,-1 to 1,1
	ch3.trans = [75,-75,0];
	ch3.scale = [200,200,200];
	ch3.mod.flags |= modelflagenums.NOZBUFFER;
	rt.linkchildback(ch3);
	//rt.linkchild(ch2);
	
	ch2.frontchild();
	
};

uitest.init = function() {
	logger("entering webgl uitest\n");
	Tree2.treesort = false; // turn off all Tree2 sorting for this state, (painters algorithm)
	
	// root
	uitest.UIObj.reset();
	uitest.roottree = new Tree2("mainroot");
	uitest.roottree.trans = [0,0,1]; // move whole scene back to view

	// try uitest special objects for UI, creates a tree and adds to uiobjs
	new uitest.UIObj(0,0,200,200);
	new uitest.UIObj(0,glc.clientHeight - 200,200,200);
	var uiobj2 = new uitest.UIObj(glc.clientWidth - 400,0,400,200);
	new uitest.UIObj(glc.clientWidth - 400,glc.clientHeight - 200,400,200);
	uiobj2.remove();
	
	uitest.UIObj.uiobjs[0].tree.flags |= treeflagenums.DONTDRAWC;
	
	// default camera
	//mainvp = new Viewport();
	mainvp.trans = [0,0,0];
	mainvp.rot = [0,0,0];

	uitest.oldclearcolor = mainvp.clearcolor;
	mainvp.clearcolor = [0,.5,1,1]

	// uiclass
	uiclass.uitree.setfocus(null); // not focused, pass in object to get focus
	uiclass.uitree.setres(glc.clientWidth,glc.clientHeight);
	
	uitest.uiroottree = new Tree2("uiroot");
	uiclass.uitree.settransscale(uitest.uiroottree);
	
	/*
	// create a root uiclass object
	//uitest.auitree = new uiclass.uitree2drect("a uitree",0,0,glc.clientWidth,glc.clientHeight); // whole canvas
	uitest.auitree = new uiclass.uitree2drect("a uitree",10,20,100,200); // very simple
	// hook up uiclass object to root translater for 0,0 to xres,yres configuration
	*/
	
	var SCRIPT = true;
	var ONEOBJ = false;
	var HIER =  false;

	if (SCRIPT) {
		//var s = new Script("testhier.uis");
		var s = new Script("default2.uis");
		//var s = new Script("overlap.uis");
		uitest.auitree = factory.newclass_from_script(uiclass,s);
		/*
	//	script ns=script("testnewsave.uis");
	//	pushandsetdir("ui");
		script ns=script("default2.uis");
	//	popdir();
		factory<uitree,script> fs; // these 2 lines, this is where it all comes together
		auitree=fs.newclass_from_handle(ns);
		*/
	}

	if (ONEOBJ) {
		// single object
		uitest.auitree = new uiclass.uitree2drect("a uitree",10,20,100,200); // very simple
		uitest.auitree.seto2p(100,60);
	}
	
	if (HIER) {
		// simple hierarchy
		uitest.auitree = new uiclass.uitree2drect("root uitree",10,10,20,20); // very simple
		var par = new uiclass.uitree2d("parent uitree2d",400,120); // very simple
		uitest.auitree.linkchild(par);
		var chld0 = new uiclass.uitree2drect("chld0",10,20,100,200); // very simple
		var chld1 = new uiclass.uitree2drect("chld1",210,20,100,250); // very simple
		par.linkchild(chld0);
		par.linkchild(chld1);
		//par.seto2p(100,50);
		var parc = par.copy();
		parc.seto2p(20,40);
		uitest.auitree.linkchild(parc);
		chld0.w = 150;
		//par.deleteuitree();
		//parc.deleteuitree();
	}

	uitest.uiroottree.linkchild(uitest.auitree.atree); // hook ui to Tree2
	uiclass.uitree.makemouseoverfont(uitest.uiroottree);
/*
	// make some test objects and hook them to uitest.uiroottree
	// play around with uiroottree space
	//var testtexname = "xpar.png";
	//var testtexname = "Bark.png";
	var testtexname = "maptestnck.png"
	var ts = buildsphere("asphereui1",1,testtexname,"tex"); // -1,-1 to 1,1
	//ts.mod.flags |= modelflagenums.NOZBUFFER;
	
	ts.scale = [20,20,20];
	var i;
	// X Y
	for (i=0;i<20;++i) {
		var tsd = ts.newdup();
		var ang = VEC.TWOPI*i/20;
		var tx = 200*Math.cos(ang);
		var ty = 200*Math.sin(ang);
		tsd.trans = [uiclass.uitree.xres/2 + tx,-uiclass.uitree.yres/2 + ty,0];
		uitest.uiroottree.linkchild(tsd);
	}
	// X Z
	for (i=0;i<20;++i) {
		var tsd = ts.newdup();
		var ang = VEC.TWOPI*i/20;
		var tx = 200*Math.cos(ang);
		var tz = 200*Math.sin(ang);
		tsd.trans = [uiclass.uitree.xres/2 + tx,-uiclass.uitree.yres/2,tz];
		uitest.uiroottree.linkchild(tsd);
	}
	// Y Z
	for (i=0;i<20;++i) {
		var tsd = ts.newdup();
		var ang = VEC.TWOPI*i/20;
		var ty = 200*Math.cos(ang);
		var tz = 200*Math.sin(ang);
		tsd.trans = [uiclass.uitree.xres/2,-uiclass.uitree.yres/2 + ty,tz];
		if (i%4 == 0)
			tsd.settexture("Bark.png");
		uitest.uiroottree.linkchild(tsd);
	}
	
	//ts.mod.flags |= modelflagenums.NOZBUFFER;
	//uitest.uiroottree.linkchild(ts);
	ts.glfree();

	//uitest.testchildren(uitest.uiroottree);
*/
};

uitest.proc = function() {
	// ui
	if (input.key == 'r'.charCodeAt(0)) // reset state if 'r' pressed
		changestate(uitest);
	// proc
	// proc uitest class
	if (input.mbut[0]) {
		/*
		// test trans
		uitest.UIObj.uiobjs[0].x = input.mx;
		uitest.UIObj.uiobjs[0].y = input.my;
		*/
		// test scale
		uitest.UIObj.uiobjs[0].w = input.mx + 1;
		uitest.UIObj.uiobjs[0].h = input.my + 1;
	}
	uitest.UIObj.procAll();
	
// proc uiclass
	uiclass.uitree.setinput(); // reads MX,MY converts to float fmxy, and sets usedinput to false
	
	//uitest.auitree.x = uiclass.uitree.fmxy.x;
	//uitest.auitree.y = uiclass.uitree.fmxy.y;
	
	uitest.auitree.proc();
	uitest.auitree.killdeaddudes();
	uitest.auitree.buildo2w();
	uitest.auitree.focustofront(); // this will alter order in hierarchy, never call this from a class member function

// draw uiclass
	uitest.auitree.draw();		/// draw everything but below
	uitest.auitree.mouseover();	/// show window that mouse is over and handle right click menu
	uiclass.uitree.showfocus();	/// show current window in focus (if any)
	uiclass.uitree.showdest();	/// show destination for hiearchy control

// update graphics system	
	uitest.roottree.proc();
	doflycam(mainvp); // modify the trs of vp using flycam

	// draw
	beginscene(mainvp);
	uitest.uiroottree.draw();
	//uitest.roottree.draw();
};

uitest.onresize = function() {
	logger("uitest resize!\n");
	// readjust uitest viewport
	uiclass.uitree.setres(glc.clientWidth,glc.clientHeight);
	uiclass.uitree.settransscale(uitest.uiroottree);
};

uitest.exit = function() {
	logger("exiting webgl uitest\n");
	Tree2.treesort = true; // turn back on Tree2 sorting

	logger("uitest.uiroottree.log\n");
	uitest.uiroottree.log();
	

	var clonet = uitest.auitree.copy();
	//uitest.auitree.dokillc();
	clonet.dokillc();
	//uitest.auitree.killdeaddudes();
	clonet.killdeaddudes();

	uitest.auitree.dokillc();
	uitest.auitree.killdeaddudes();
	uitest.auitree = null;

	logger("uitest.roottree.log\n");
	uitest.roottree.log();
	logrc();
	//uitest.auitree.atree.glfree();
	logger("after roottree glfree\n");
	uitest.roottree.glfree();
	uitest.uiroottree.glfree();
	uitest.roottree = null;
	uitest.uiroottree = null;
	uitest.UIObj.reset();
	
	// show usage after cleanup
	logrc();
	mainvp.clearcolor = uitest.oldclearcolor;
};
