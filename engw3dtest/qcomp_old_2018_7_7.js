var qcomp = {};

qcomp.roottree;
qcomp.ftree;
qcomp.fmodel;
qcomp.text = "WebGL: Future home of Simulated Quantum Computer";
qcomp.title = "qcomp";
qcomp.maxsize = "unk";
qcomp.remotestatus = "ready";
qcomp.fontColor = [0,0,0,1];
qcomp.numlevels = 72;
qcomp.messid = 0;
qcomp.lines = 30;
qcomp.rot = 0;


qcomp.title = "Quantum Computer Simulator";

//qcomp.prebuilt = "prebuilt";
qcomp.defaultPreBuilt = "testc2.qcmp";

// color function
qcomp.getColor = function(cycle,col) {
	return .5*Math.cos(2*Math.PI*(cycle - col/3)) + .5;
};

// ui functions
qcomp.lesslevel = function() {
	--qcomp.curlevel;
	if (qcomp.curlevel < 0)
		qcomp.curlevel += qcomp.numlevels;
	qcomp.updatelevel();
};

qcomp.morelevel = function() {
	++qcomp.curlevel;
	if (qcomp.curlevel >= qcomp.numlevels)
		qcomp.curlevel -= qcomp.numlevels;
	qcomp.updatelevel();
};

// LOCAL //
////////////////// get a value
qcomp.loadlocallevel = function() {
	var storedlevel = localStorage.getItem("curlevel");
	if (typeof(storedlevel) === 'string')
		qcomp.curlevel = Number(storedlevel);
	qcomp.updatelevel();
};

////////////////// put a value
qcomp.savelocallevel = function() {
	localStorage.setItem("curlevel",qcomp.curlevel.toString());
};

	
// show last response  and convert to object
qcomp.responsephp = function(resp,id) {
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
qcomp.submitlogingettrack = function() {
	qcomp.remotestatus = "connecting...";
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
	goAjax3("../../tracks2/tracksmain.php",qcomp.messid++,qcomp.responselogingettrack,sendobj,true/*,0*/);
	return false;
};

qcomp.responselogingettrack = function(resp,id) {
	var obj = qcomp.responsephp(resp,id);
	if (obj.result) {
		qcomp.userid = obj.id;
		if (qcomp.userid === undefined)
			qcomp.userid = obj.userid;
		//qcomp.curlevel = userid;
		var htmllogindone = "login succeeded";
		//alert("good login " + JSON.stringify(obj));
		var trackarr = obj.list;
		qcomp.submitgettrack();
		//setupmainmenu();
	} else {
		var htmllogindone = "login failed";
		qcomp.curlevel = 13; // bad level
		//alert("bad login " + JSON.stringify(obj));
		//setuptitle();
	}
	//htmladd("span1","p",htmllogindone);
};

qcomp.submitgettrack = function() {
	qcomp.remotestatus = "loading...";
	var curtrackname = "level";
	//var htmlselecttrack = "select try '" + curtrackname + "'";
	//htmladd("span1","p",htmlselecttrack);
	//var userid = 1; // 'fgh' user 37, has a 'level' track with a number
	var sendobj = {
		command : "getdata",
		userid : qcomp.userid,
		name : curtrackname,
	};
	goAjax3("../../tracks2/tracksmain.php",qcomp.messid++,qcomp.responsegettrack,sendobj,true/*,0*/);
};

qcomp.responsegettrack = function(resp,id) {
	var robj = qcomp.responsephp(resp,id);
	var dobj = robj.data;
	if (!dobj)
		dobj = 1;
	qcomp.curlevel = dobj;
	qcomp.remotestatus = "done!";
	qcomp.updatelevel();
};

////////////////// put a value
qcomp.submitloginputtrack = function() {
	qcomp.remotestatus = "connecting...";
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
	goAjax3("../../tracks2/tracksmain.php",qcomp.messid++,qcomp.responseloginputtrack,sendobj,true/*,0*/);
	return false;
};

qcomp.responseloginputtrack = function(resp,id) {
	var obj = qcomp.responsephp(resp,id);
	if (obj.result) {
		// try alt
		qcomp.userid = obj.id;
		if (qcomp.userid === undefined)
			qcomp.userid = obj.userid;
		//qcomp.curlevel = userid;
		var htmllogindone = "login succeeded";
		//alert("good login " + JSON.stringify(obj));
		var trackarr = obj.list;
		//setupmainmenu();
		qcomp.submitputtrack();
	} else {
		var htmllogindone = "login failed";
		qcomp.curlevel = 13; // bad level
		//alert("bad login " + JSON.stringify(obj));
		//setuptitle();
	}
	//htmladd("span1","p",htmllogindone);
};

qcomp.submitputtrack = function() {
	qcomp.remotestatus = "saving...";
	var curtrackname = "level";
	var curtrackdata = qcomp.curlevel;
	
	//var htmlselecttrack = "select try '" + curtrackname + "'";
	//htmladd("span1","p",htmlselecttrack);
	var userid = 1; // 'fgh' user 37, has a 'level' track with a number
	var sendobj = {
		command : "setdata",
		userid : qcomp.userid,
		name : curtrackname,
		data : curtrackdata,
	};
	goAjax3("../../tracks2/tracksmain.php",qcomp.messid++,qcomp.responseputtrack,sendobj,true/*,0*/); // no delay
};

qcomp.responseputtrack = function(resp,id) {
	var robj = qcomp.responsephp(resp,id);
	var dobj = robj.data;
	if (!dobj)
		dobj = 1;
	//qcomp.curlevel = dobj;
	qcomp.remotestatus = "done!";
	qcomp.updatelevel();
};

qcomp.updatelevel = function() {
	printareadraw(qcomp.levelarea,"Level : " + qcomp.curlevel);
};

qcomp.gatelist = [
	// 1 qubit gates
	"NONE",
	"HADAMARD",
	"SPLITTER",
	"MIRROR",
	
	"SNOT TWOAK",
	"SNOT WIKIPEDIA",
	"NOT (PX)",
	"PX (NOT)",
	"PY",
	"PZ",
	"S",
	"St",
	"T",
	"Tt",
	"G1Over3",
	"P 45",
	"P -45",
	"P 30",
	"P -30",

	// 2 qubit gates
	"SWAP TOP",
	"SWAP BOTTOM",
	"CNOT TOP",
	"CNOT BOTTOM",
	"CZ TOP",
	"CZ BOTTOM",
	"CY TOP",
	"CY BOTTOM",
	"CH TOP",
	"CH BOTTOM",
	"CP 45 TOP",
	
	"CP 45 BOTTOM",
	"CP -45 TOP",
	"CP -45 BOTTOM",
	"CP 30 TOP",
	"CP 30 BOTTOM",
	"CP -30 TOP",
	"CP -30 BOTTOM",
	"DEC TOP",
	"DEC BOTTOM",
	// 3 qubit gates
	"FREDKIN TOP",
	"FREDKIN MIDDLE",
	"FREDKIN BOTTOM",
	"TOFFOLI TOP",
	"TOFFOLI MIDDLE",
	"TOFFOLI BOTTOM",
	// 4 qubit gates
	"TOFFOLI 4C0",
	"TOFFOLI 4C1",
	"TOFFOLI 4C2",
	"TOFFOLI 4T",
	// 5 qubit gates
	"TOFFOLI 5C0",
	"TOFFOLI 5C1",
	"TOFFOLI 5C2",
	"TOFFOLI 5C3",
	"TOFFOLI 5T",
	// 6 qubit gates
	"TOFFOLI 6C0",
	"TOFFOLI 6C1",
	"TOFFOLI 6C2",
	"TOFFOLI 6C3",
	"TOFFOLI 6C4",
	"TOFFOLI 6T", 
];
	
qcomp.gwid = 55;
qcomp.ghit = 80;

qcomp.Space2Underscore = function(str) {
	str = str.replace(/\s/g,'_');
	return str;
};
// load these before init
qcomp.load = function() {
	//preloadimg("../common/sptpics/maptestnck.png");
	//preloadimg("../common/sptpics/panel.jpg");

	//preloadimg("../common/sptpics/maptestnck.png");
	//preloadimg("../common/sptpics/take0016.jpg");
	//preloadimg("test2d/wood_door.jpg");
	//preloadimg("test2d/seq5.png");
	//preloadimg("test2d/hi .ho");
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
	preloadimg("../common/sptpics/font0.png");
	preloadimg("../common/sptpics/font1.png");
	preloadimg("../common/sptpics/font2.png");
	preloadimg("../common/sptpics/font3.png");
	
	// load qcomp assets (gates icons etc.)
	for (var key in qcomp.gatelist) {
		var gateName = qcomp.gatelist[key];
		var gateName = qcomp.Space2Underscore(gateName);
		var loadfile = "qcomp/" + gateName + ".png";
		preloadimg(loadfile);
	}
	
	preloadtext("qcomp/prebuilt.txt");
};

qcomp.loadcb = function(dataLoaded) {
	qcomp.data.value = dataLoaded;
};

qcomp.savecb = function() {
	var dataToSave = qcomp.data.value;
	return dataToSave;
};

/*qcomp.textcb = function() {
	qcomp.data.innerHTML = qcomp.text.value;
};*/

qcomp.selectExamplesResp = function(txt) {
	qcomp.data.value = txt;
};

qcomp.selectExamples = function() {
	//alert("selectExamples " + sellev.selectedIndex);
	//qcomp.data.value = "Selected " + sellev.selectedIndex;
	goAjaxText("qcomp/" + qcomp.prebuiltList[qcomp.sellev.selectedIndex],qcomp.selectExamplesResp);
};

qcomp.cbgotprebuilt = function(txt) {
	qcomp.prebuilt = txt;
};

// sometime split adds some weird null chars, trim fixes that, replacement for indexOf
qcomp.compareStrArr = function(arr,str) {
	var splitstr = str.split("");
	var i;
	for (i=0;i<arr.length;++i) {
		var cmp = arr[i];
		//var splitcmp1 = cmp.split("");
		cmp = cmp.trim();
		//var splitcmp2 = cmp.split("");
		if (cmp == str)
			return i;
	}
	return -1;
}

qcomp.init = function() {
	logger("entering webgl qcomp\n");
	
	qcomp.af = 0; // anim frame of qgate

	qcomp.p0 = [400,500];
	qcomp.p1 = [700,600];
	qcomp.p2 = [900,600];
	qcomp.pw = 8;
	qcomp.color0 = [1,0,0,.5];
	qcomp.color1 = [0,1,0,.5];
	qcomp.color2 = [0,0,1,.5];
	// ui
	qcomp.curlevel = 2;

	setbutsname('qcomp');
	// less,more,reset for pendu1
	qcomp.levelarea = makeaprintarea('level: ');
	makeabut("LOWER level",qcomp.lesslevel);
	makeabut("HIGHER level",qcomp.morelevel);
	makeabut("LOAD level LOCAL",qcomp.loadlocallevel);
	makeabut("SAVE level LOCAL",qcomp.savelocallevel);
	//makeabut("LOAD level REMOTE",qcomp.submitlogin); // just load user id
	makeabut("LOAD level REMOTE",qcomp.submitlogingettrack); // try to load track 'level' from user id 'player'
	makeabut("SAVE level REMOTE",qcomp.submitloginputtrack); // save to 'player'
	makeafileloaddsave(qcomp.loadcb,qcomp.savecb,".qcmp");
	//makeahr();
	makeaprintarea("Load pre-built");
	var preloadtxt = preloadedtext["prebuilt.txt"];
	qcomp.prebuiltList = preloadtxt.split("\n");
	qcomp.sellev = makeaselect("what circuit",qcomp.prebuiltList,qcomp.selectExamples);
//	var idx = qcomp.prebuiltList.indexOf(qcomp.defaultPreBuilt);
	var idx = qcomp.compareStrArr(qcomp.prebuiltList,qcomp.defaultPreBuilt);
	selectsetidx(qcomp.sellev,idx);
	qcomp.selectExamples();
	//sellev = makeaselect("what state",["Level 0","Level 1","Level 2","Level 3","Level 4"],qcomp.selectExamples);
	makeabut("Reload pre-built",qcomp.selectExamples);
	qcomp.data = makeatext("file data","data"/*,qcomp.textcb*/);
	//goAjaxText("qcomp/prebuilt.txt",qcomp.cbgotprebuilt);
	//qcomp.data.id = 'filedata';
	qcomp.updatelevel();

	// build parent
	qcomp.roottree = new Tree2("root");
	//qcomp.roottree.trans = [0,0,1];
// tree structure
	//qcomp.roottree = new Tree2("root");
	/*
	qcomp.ftree = buildplanexy("aplanexy",1,1,"maptestnck.png","texc");
	qcomp.ftree.trans = [0,1,0];
	qcomp.roottree.linkchild(qcomp.ftree); */

	var lines = 30;
	qcomp.fmodel = new ModelFont("fmodel","font0.png","texc",8,16,100,100,true);
	qcomp.fmodel.flags |= modelflagenums.DOUBLESIDED;
	qcomp.ftree = new Tree2("fmodel");
	//var depth = glc.clientHeight/2;
	//var depth = qcomp.lines;//32*96;
	var depth = glc.clientHeight/2;
	//qcomp.ftree.trans = [-depth*gl.asp,depth,depth];
	//ftree.trans = [-depth,-32*4,depth];
	qcomp.ftree.setmodel(qcomp.fmodel);
	qcomp.roottree.linkchild(qcomp.ftree);
	qcomp.fmodel.print("hi");

	// build a sphere
	qcomp.sph =  buildsphere("asphere",.5,"maptestnck.png","tex");
	//qcomp.sph.trans = [mainvp.asp*.9,-.9,1];
	qcomp.sph.scale = [.1,.1,.1];
	qcomp.roottree.linkchild(qcomp.sph);	

	
	// debprint
	debprint.addlist("qcomp",[
		"qcomp.spritevp",
		"qcomp.rot",
		"qcomp.p0",
		"qcomp.p1",
		"qcomp.p2",
		"qcomp.pw",
		"qcomp.color0",
		"qcomp.color1",
		"qcomp.color2",
	]);
//	debprint.addlist("qcomp",["qcomp"]); // won't work too much stuff

	// turn off all Tree2 sorting for this state, (painters algorithm)
	Tree2.treesort = false;
	
	// now try new sprite package
	qcomp.spriteHandle = new Spriter();
	//qcomp.spritevp = qcomp.spriteHandle.createspritervp();
	//qcomp.spritevp.clearflags &= ~gl.COLOR_BUFFER_BIT; // don't clear viewport
	qcomp.frame = 0;
	
	qcomp.onresize();
	qcomp.alphacutoffsave = globalmat.alphacutoff;
	//globalmat.alphacutoff = 0; // test sprites without alpha
};

qcomp.proc = function() {
	// proc
	qcomp.roottree.proc();
	//qcomp.rot += 2*Math.PI*frametime / 5;
	qcomp.rot = normalangrad(qcomp.rot);
	// no input
	var fc = qcomp.fontColor;
	var cyc = qcomp.curlevel/qcomp.numlevels;
	var i;
	for (i=0;i<3;++i)
		fc[i] = qcomp.getColor(cyc,i);
	//fc[0] = .5*Math.cos(2*Math.PI*qcomp.curlevel/qcomp.numlevels) + .5;
	//fc[0] = qcomp.getColor(qcomp.curlevel/qcomp.numlevels,0);
	qcomp.ftree.mat.color = qcomp.fontColor;
	var printstring = "frame = " + qcomp.frame + "\nframe2 = " + qcomp.frame*2;
	printstring += "\ncurlevel = " + qcomp.curlevel;
	printstring += "\nmaxstoragesize = " + qcomp.maxsize + " chars";
	printstring += "\nremote status = " + qcomp.remotestatus;
	//printstring += "\ncolorvalue = " + fc[0]*256;
	qcomp.fmodel.print(printstring);
	++qcomp.frame;
	doflycam(mainvp); // modify the trs of vp using flycam
	// proc
	//doflycam(qcomp.spritevp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	qcomp.roottree.draw();
	
	
	
	// input
	// new sprite add
	qcomp.spriteHandle.reset();
	var i=0,j=0;
	for (var key in qcomp.gatelist) {
		var loadfile = qcomp.gatelist[key] + ".png";
		loadfile = qcomp.Space2Underscore(loadfile);
		//loadfile = undefined;
		qcomp.spriteHandle.add(loadfile,[i*qcomp.gwid,j*qcomp.ghit],undefined,[.75,.1,.25,.75]);
		++i;
		if (i == 10) {
			i = 0;
			++j;
		}
	}

	//var idx = Math.floor(qcomp.af/8);
	var idx = 1;
	var cursorFile = qcomp.gatelist[idx] + ".png"; // Hadamard
	//var cursorFile = "maptestnck.png";
	cursorFile = qcomp.Space2Underscore(cursorFile);
	//cursorFile = null;
	var i,j;
	for (j = -1;j <= 1; ++j) {
		for (i = -1;i <= 1; ++i) {
			/*
			- Math.floor(qcomp.gwid/2)
			- Math.floor(qcomp.ghit/2)
			*/
			//qcomp.spriteHandle.add(cursorFile,i * 200 + 0 - Math.floor(qcomp.gwid/2),j * 200 + -35 - Math.floor(qcomp.ghit/2),undefined,undefined,[.25,.75,.25,.5]);/*,undefined,undefined,[.25,.1,.75,.75]*/ // handle middle
			qcomp.spriteHandle.add(cursorFile,[i * 200 + input.mx,j * 200 + input.my],undefined,[.25 + .4*i,.75 - .4*j,.25,.5],qcomp.rot,[.25,.4]);/*,undefined,undefined,[.25,.1,.75,.75]*/ // handle middle
		//	qcomp.spriteHandle.add(cursorFile,input.mx - qcomp.gwid,input.my - qcomp.ghit); // handle bottom right
		}
	}

	qcomp.spriteHandle.add(undefined,[300,400],[10,200],[1,0,0,1]);
	qcomp.spriteHandle.add(undefined,[350,400],[10,200],[0,1,0,1]);
	qcomp.spriteHandle.add(undefined,[400,400],[10,200],[0,0,1,1]);
	
	qcomp.spriteHandle.add(undefined,qcomp.p0);
	qcomp.spriteHandle.add(undefined,qcomp.p1);
	qcomp.spriteHandle.add(undefined,qcomp.p2);
	
	qcomp.spriteHandle.addLine(qcomp.p0,qcomp.p1,qcomp.color0,qcomp.pw);
	qcomp.spriteHandle.addLine(qcomp.p1,qcomp.p2,qcomp.color1,qcomp.pw);
	qcomp.spriteHandle.addLine(qcomp.p2,qcomp.p0,qcomp.color2,qcomp.pw);
	
	// draw
	beginscene(qcomp.spritevp);
	// new sprite draw
	qcomp.spriteHandle.draw();

	++qcomp.af;
	//qcomp.af = 8;
	if (qcomp.af >= 8*qcomp.gatelist.length)
		qcomp.af = 0;
	
};

qcomp.onresize = function() {
	logger("qcomp resize!\n");
	// readjust spriter viewport
	qcomp.spritevp = Spriter.createspritervp();
	qcomp.spritevp.clearflags &= ~gl.COLOR_BUFFER_BIT; // don't clear viewport

	qcomp.sph.trans = [mainvp.asp*.9,-.9,1];
	//var depth = qcomp.lines;
	var depth = glc.clientHeight/2;
	qcomp.ftree.trans = [-depth*gl.asp,-depth+5*16,depth];
};

qcomp.exit = function() {
	// show current usage
	//debprint.removelist("qcomp");
	qcomp.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	qcomp.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	qcomp.roottree = null;
	logger("exiting webgl qcomp\n");
	clearbuts('qcomp');
	
	
	
		// remove debprint
	debprint.removelist("qcomp");
	
	// free up spriter
	logger("before new sprite package glfree\n");
	logrc();
	qcomp.spriteHandle.glfree();
	qcomp.spriteHandle = null;
		
	// show usage after all cleanups
	logger("after new sprite package glfree\n");
	logrc();
	logger("exiting webgl qcomp\n");
	Tree2.treesort = true; // turn tree sorting back on, default
	globalmat.alphacutoff = qcomp.alphacutoffsave;
};
