// test local and remote storage
var storagetest = {};

// test load and save local and remote storage using some webgl and simpleui
storagetest.roottree;
storagetest.ftree;
storagetest.fmodel;
storagetest.text = "WebGL: test local and remote storage";
storagetest.title = "storagetest";
storagetest.maxsize = "unk";
storagetest.remotestatus = "ready";
storagetest.testItem = "";
storagetest.fontColor = [0,0,0,1];
storagetest.numlevels = 72;
storagetest.messid = 0;
storagetest.lines = 30;

// color function
storagetest.getColor = function(cycle,col) {
	return .5*Math.cos(2*Math.PI*(cycle - col/3)) + .5;
};

// ui functions
storagetest.lesslevel = function() {
	--storagetest.curlevel;
	if (storagetest.curlevel < 0)
		storagetest.curlevel += storagetest.numlevels;
	storagetest.updatelevel();
};

storagetest.morelevel = function() {
	++storagetest.curlevel;
	if (storagetest.curlevel >= storagetest.numlevels)
		storagetest.curlevel -= storagetest.numlevels;
	storagetest.updatelevel();
};

// LOCAL //
////////////////// get a value
storagetest.loadlocallevel = function() {
	var storedlevel = localStorage.getItem("curlevel");
	if (typeof(storedlevel) === 'string')
		storagetest.curlevel = Number(storedlevel);
	storagetest.updatelevel();
};

////////////////// put a value
storagetest.savelocallevel = function() {
	localStorage.setItem("curlevel",storagetest.curlevel.toString());
};

	
// show last response  and convert to object
storagetest.responsephp = function(resp,id) {
	try {
		var obj = JSON.parse(resp);
	} catch(err) {
		var obj = 'JSON parse error';
	}
	/*if (showresp) {
		var objstr = JSON.stringify(obj);
		resp = escapehtml(objstr) + ", id = " + id + "<br/>";
		htmladd("responsephp","p",resp);
	}*/
	return obj;
};

// REMOTE //
////////////////// get a value
storagetest.submitlogingettrack = function() {
	storagetest.remotestatus = "connecting...";
	// don't do regular submit, but do an ajax instead
	var yourname = "player";
	var htmllogin = "login try with " + "'" + yourname + "'";
	//setuptitle();
	//htmladd("span1","p",htmllogin);
	//var yourage = document.getElementById("loginuserage").value;
	//yourage = parseInt(yourage);
	var sendobj = {
		"command":"login",
		"name":yourname,
		//"age":yourage,
		//"obj":[{},
		//	{"x\"x":44,"y":"5j5"},{"x":32,"y":64}
		//]
	};
	goAjax3("../../tracks2/tracksmain.php",storagetest.messid++,storagetest.responselogingettrack,sendobj,true/*,0*/);
	return false;
};

storagetest.responselogingettrack = function(resp,id) {
	var obj = storagetest.responsephp(resp,id);
	if (obj.result) {
		storagetest.userid = obj.id;
		if (storagetest.userid === undefined)
			storagetest.userid = obj.userid;
		//storagetest.curlevel = userid;
		var htmllogindone = "login succeeded";
		//alert("good login " + JSON.stringify(obj));
		var trackarr = obj.list;
		storagetest.submitgettrack();
		//setupmainmenu();
	} else {
		var htmllogindone = "login failed";
		storagetest.curlevel = 13; // bad level
		//alert("bad login " + JSON.stringify(obj));
		//setuptitle();
	}
	//htmladd("span1","p",htmllogindone);
};

storagetest.submitgettrack = function() {
	storagetest.remotestatus = "loading...";
	var curtrackname = "level";
	//var htmlselecttrack = "select try '" + curtrackname + "'";
	//htmladd("span1","p",htmlselecttrack);
	//var userid = 1; // 'fgh' user 37, has a 'level' track with a number
	var sendobj = {
		command : "getdata",
		userid : storagetest.userid,
		name : curtrackname,
	};
	goAjax3("../../tracks2/tracksmain.php",storagetest.messid++,storagetest.responsegettrack,sendobj,true/*,0*/);
};

storagetest.responsegettrack = function(resp,id) {
	var robj = storagetest.responsephp(resp,id);
	var dobj = robj.data;
	if (!dobj)
		dobj = 1;
	storagetest.curlevel = dobj;
	storagetest.remotestatus = "done!";
	storagetest.updatelevel();
};

////////////////// put a value
storagetest.submitloginputtrack = function() {
	storagetest.remotestatus = "connecting...";
	// don't do regular submit, but do an ajax instead
	var yourname = "player";
	var htmllogin = "login try with " + "'" + yourname + "'";
	//setuptitle();
	//htmladd("span1","p",htmllogin);
	//var yourage = document.getElementById("loginuserage").value;
	//yourage = parseInt(yourage);
	var sendobj = {
		"command":"login",
		"name":yourname,
		//"age":yourage,
		//"obj":[{},
		//	{"x\"x":44,"y":"5j5"},{"x":32,"y":64}
		//]
	};
	goAjax3("../../tracks2/tracksmain.php",storagetest.messid++,storagetest.responseloginputtrack,sendobj,true/*,0*/);
	return false;
};

storagetest.responseloginputtrack = function(resp,id) {
	var obj = storagetest.responsephp(resp,id);
	if (obj.result) {
		// try alt
		storagetest.userid = obj.id;
		if (storagetest.userid === undefined)
			storagetest.userid = obj.userid;
		//storagetest.curlevel = userid;
		var htmllogindone = "login succeeded";
		//alert("good login " + JSON.stringify(obj));
		var trackarr = obj.list;
		//setupmainmenu();
		storagetest.submitputtrack();
	} else {
		var htmllogindone = "login failed";
		storagetest.curlevel = 13; // bad level
		//alert("bad login " + JSON.stringify(obj));
		//setuptitle();
	}
	//htmladd("span1","p",htmllogindone);
};

storagetest.submitputtrack = function() {
	storagetest.remotestatus = "saving...";
	var curtrackname = "level";
	var curtrackdata = storagetest.curlevel;
	
	//var htmlselecttrack = "select try '" + curtrackname + "'";
	//htmladd("span1","p",htmlselecttrack);
	var userid = 1; // 'fgh' user 37, has a 'level' track with a number
	var sendobj = {
		command : "setdata",
		userid : storagetest.userid,
		name : curtrackname,
		data : curtrackdata,
	};
	goAjax3("../../tracks2/tracksmain.php",storagetest.messid++,storagetest.responseputtrack,sendobj,true/*,0*/); // no delay
};

storagetest.responseputtrack = function(resp,id) {
	var robj = storagetest.responsephp(resp,id);
	var dobj = robj.data;
	if (!dobj)
		dobj = 1;
	//storagetest.curlevel = dobj;
	storagetest.remotestatus = "done!";
	storagetest.updatelevel();
};

storagetest.updatelevel = function() {
	printareadraw(storagetest.levelarea,"Level : " + storagetest.curlevel);
};

// load these before init
storagetest.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
	preloadimg("../common/sptpics/font0.png");
	preloadimg("../common/sptpics/font1.png");
	preloadimg("../common/sptpics/font2.png");
	preloadimg("../common/sptpics/font3.png");
};

// find max size for local storage, clears all localstorage !!!
storagetest.test = function() {
	localStorage.clear();
	var blocks = 1;
	var blockSize = 1<<16;
	var okay = true;
	while(okay) {
		localStorage.removeItem("testQuota");
		var chars = blocks*blockSize;
		storagetest.testItem = new Array(chars + 1).join('a');
		
		try {
			localStorage.setItem("testQuota",storagetest.testItem);
		} catch (err) {
			alert("localstorage failed at " + chars + " chars, message = '" + err.message + "'");
			storagetest.maxsize = "" + (blocks - 1)*blockSize;
			okay = false;
		} 
		/*if (chars > 5000000)
			okay = false;*/
		++blocks;
	}
	localStorage.removeItem("testQuota");
};

// show every item in localstorage
storagetest.show = function() {
	var obj = localStorage;
	for (var prop in obj) {
        // skip loop if the property is from prototype
        if(!obj.hasOwnProperty(prop)) continue;
        // your code
        alert(prop + " = " + obj[prop]);
    }
};

storagetest.init = function() {
	logger("entering webgl storagetest\n");
	// ui
	storagetest.curlevel = 2;
	
	// run tests after loading level
	//storagetest.test(); // will clear all localstorage
	//storagetest.show();
	
	setbutsname('storagetest');
	// less,more,reset for pendu1
	storagetest.levelarea = makeaprintarea('level: ');
	makeabut("LOWER level",storagetest.lesslevel);
	makeabut("HIGHER level",storagetest.morelevel);
	makeabut("LOAD level LOCAL",storagetest.loadlocallevel);
	makeabut("SAVE level LOCAL",storagetest.savelocallevel);
	//makeabut("LOAD level REMOTE",storagetest.submitlogin); // just load user id
	makeabut("LOAD level REMOTE",storagetest.submitlogingettrack); // try to load track 'level' from user id 'player'
	makeabut("SAVE level REMOTE",storagetest.submitloginputtrack); // save to 'player'
	storagetest.updatelevel();

// tree structure
	storagetest.roottree = new Tree2("root");
	/*
	storagetest.ftree = buildplanexy("aplanexy",1,1,"maptestnck.png","texc");
	storagetest.ftree.trans = [0,1,0];
	storagetest.roottree.linkchild(storagetest.ftree); */

	storagetest.fmodel = new ModelFont("fmodel","font3.png","texc",8,16,100,100,true);
	storagetest.fmodel.flags |= modelflagenums.DOUBLESIDED;
	storagetest.fmodel.setfudge(false);
	storagetest.ftree = new Tree2("fmodel");
	var depth = glc.clientHeight/2;
	//var depth = storagetest.lines;//32*96;
	storagetest.ftree.trans = [-depth*gl.asp,depth,depth];
	//ftree.trans = [-depth,-32*4,depth];
	storagetest.ftree.setmodel(storagetest.fmodel);
	storagetest.roottree.linkchild(storagetest.ftree);
	storagetest.fmodel.print("hi");


	// move view back some using LHC
	mainvp.trans = [0,0,0]; // for mouse test
	mainvp.rot = [0,0,0]; // flycam
	storagetest.frame = 0;
	
};

storagetest.proc = function() {
	// proc
	storagetest.roottree.proc();
	// no input
	var fc = storagetest.fontColor;
	var cyc = storagetest.curlevel/storagetest.numlevels;
	var i;
	for (i=0;i<3;++i)
		fc[i] = storagetest.getColor(cyc,i);
	//fc[0] = .5*Math.cos(2*Math.PI*storagetest.curlevel/storagetest.numlevels) + .5;
	//fc[0] = storagetest.getColor(storagetest.curlevel/storagetest.numlevels,0);
	storagetest.ftree.mat.color = storagetest.fontColor;
	var printstring = "frame = " + storagetest.frame + "\nframe2 = " + storagetest.frame*2;
	printstring += "\ncurlevel = " + storagetest.curlevel;
	printstring += "\nmaxstoragesize = " + storagetest.maxsize + " chars";
	printstring += "\nremote status = " + storagetest.remotestatus;
	//printstring += "\ncolorvalue = " + fc[0]*256;
	storagetest.fmodel.print(printstring);
	++storagetest.frame;
	doflycam(mainvp); // modify the trs of vp using flycam
	// draw
	beginscene(mainvp);
	storagetest.roottree.draw();
};

storagetest.onresize = function() {
	logger("storagetest resize!\n");
	// readjust spriter viewport
	//storagetest.spritevp = storagetest.spriteHandle.createspritervp();
	//storagetest.spritevp.clearflags &= ~gl.COLOR_BUFFER_BIT; // don't clear viewport

	//storagetest.sph.trans = [mainvp.asp*.9,-.9,1];
	//var depth = storagetest.lines;
	var depth = glc.clientHeight/2;
	storagetest.ftree.trans = [-depth*gl.asp,depth,depth];
};
storagetest.exit = function() {
	//localStorage.clear();
	storagetest.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	storagetest.roottree.glfree();
	// show usage after cleanup
	logrc();
	storagetest.roottree = null;
	clearbuts('storagetest');
	logger("exiting webgl storagetest\n");
};
