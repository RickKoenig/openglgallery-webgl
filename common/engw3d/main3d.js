// javascript for main.html

/* If browser back button was used, flush cache */
(function () {
	window.onpageshow = function(event) {
		if (event.persisted) {
			window.location.reload();
		}
	};
})();

//isMobile = true; // TEST, force mobile
var infullscreen = false;
var layouts = false; // small
var layoutm = false; // medium
var layoutl = true; // large
var layoutp = false; // portrait
if (layouts) {
	var leftwidth = 300;
	var rightwidth = 100;
	var middlewidth = 320;
	var middleheight = 240;
}
if (layoutm) {
	var leftwidth = 300;
	var rightwidth = 100;
	var middlewidth =  640;//1024;
	var middleheight = 480;
}
if (layoutl) {
	var leftwidth = 300;
	var rightwidth = 100;
	var middlewidth = 1024;
	var middleheight = 768;
}
if (layoutp) {
	var leftwidth = 300;
	var rightwidth = 100;
	var middlewidth = 480;
	var middleheight = 640;
}
var totalwidth = leftwidth + middlewidth + rightwidth;

var inputevents = "inputevents = ";
var logger_str = "logger = ";

// globals
//var serverip = ""; // engine sprites
var serverip = ""; // engine sprites 'searcher' web server
var serverip2 = ""; // engine sprites2 'apache' web server
//var serverip = "http://23.123.140.155:8080/"; // engine sprites 'searcher' web server
//var serverip2 = "http://23.123.140.155/"; // engine sprites2 'apache' web server

var eoutstateman;
var escroll;
var eoutkeystate;
var eoutinputstate;
var eoutinputevents;
var eoutlogger;

var fpswanted = 60;
var screenRefresh = undefined;

var viewx;// = 600;
var viewy;// = 500;
var frame = 0;

var showstate = true;
//var showscroll = true;
var showprint = true;

//var showstate = false;
var showscroll = false;
//var showprint = false;

var dojavascript = true;

var statesel = null;
var logmode = 0;
var logstrs = ["Log Disabled","Log Enabled"];

var minWheelDelta = 0;
var maxWheelDelta = 0;


// debug on the elements
function drawelements() {
	// show state
	if (showstate) {
		//eoutstateman.firstChild.nodeValue = "State " + state;
		printareadraw(eoutstateman,"State " + statelist.indexOf(state) + " WebGL version " + webglVersion + ".0");
	}
	
	// show scroll
	if (showscroll) {
		//escroll.firstChild.nodeValue = 
		//	" sclvel = " + scrollvelx + "," + scrollvely + " scl = " + scrollx + "," + scrolly;
		printareadraw(escroll,"sclvel = " + scrollvelx + "," + scrollvely + " scl = " + scrollx + "," + scrolly);
	}
		
	// show much stuff
	if (showprint) {
		var maxsize = 150;
		// show keystate
		var ks = "keystate = ";
		var len = input.keystate.length;
		var i;
		for (i=0;i<len;++i) {
			if (input.keystate[i])
				ks += i.toString(16) + " ";
		}
		//eoutkeystate.firstChild.nodeValue = ks;
		printareadraw(eoutkeystate,ks);
		
		// show input
		//eoutinputstate.firstChild.nodeValue = "inputstate = mx " + input.mx + " my " + input.my + " mbut " + input.mbut + " mclick " + input.mclick + " key " + input.key;
		if (input.wheelDelta > maxWheelDelta)
			maxWheelDelta = input.wheelDelta;
		if (input.wheelDelta < minWheelDelta)
			minWheelDelta = input.wheelDelta;
		printareadraw(eoutinputstate,
		  "inputstate = mx " + input.mx + 
		  " my " + input.my + 
		  " mbut " + input.mbut + 
		  " mwheel " + input.wheelPos + 
		  " mwheeldelta " + input.wheelDelta +
		  " mminwheeldelta " + minWheelDelta +
		  " mmaxwheeldelta " + maxWheelDelta +
		  " mclick0 " + input.mclick[0] + 
		  " mclick1 " + input.mclick[1] + 
		  " mclick2 " + input.mclick[2] + 
		  " key " + input.key.toString(16) + 
		  " keybufflen " + input.keybuff.length);
		
		// show inputevents
		if (inputevents.length > maxsize) {
			inputevents = inputevents.substr(inputevents.length-maxsize,maxsize);
		}
		//eoutinputevents.firstChild.nodeValue = inputevents;
		printareadraw(eoutinputevents,inputevents);
		
		// show logger
/*		if (logger_str.length > maxsize) {
//			logger_str = logger_str.substr(logger_str.length-maxsize,maxsize);
		} */
		//eoutlogger.outerHTML = "Howdy!";
		//eoutlogger.firstChild.nodeValue = logger_str;
		if (logmode)
			printareadraw(eoutlogger,logger_str);
		else {
			printareadraw(eoutlogger,"logger disabled");
			logger_str = "";
		}
	}
	
	// show image cache
/*	var str = "";
	for (var nam in imagecacher) {
		str += "C[" + nam + "] = " + imagecacher[nam].size+ ",";	
	} */
}

function maindebugclear() {
	clearbuts('debprint');
	clearbuts('scroller');
	clearbuts('stateman');
}

var topShow = true;
var botShow = false;
var topBut;
var botBut;

function topToggle(e) {
	if (e.value == 'Engw Options +') {
		e.value = 'Engw Options -';
		myformT.classList.add("noshow");
		e.setAttribute("title", "Show Engw Options");
		topShow = false;
	} else if (e.value == 'Engw Options -') {
		e.value = 'Engw Options +';
		myformT.classList.remove("noshow");
		e.setAttribute("title", "Hide Engw Options");
		topShow = true;
	}
}

function botToggle(e) {
	if (e.value == 'Show Log +') {
		e.value = 'Show Log -';
		myformB.classList.add("noshow");
		e.setAttribute("title", "Show Log");
		botShow = false;
	} else if (e.value == 'Show Log -') {
		e.value = 'Show Log +';
		myformB.classList.remove("noshow");
		e.setAttribute("title", "Hide Log");
		botShow = true;
	}
}

function maindebugsetbefore() {

	if (showstate && myform) {
		var oldform = myform;
		myform = myformT0;
		// eoutstateman = document.getElementById('stateman');
		setbutsname('stateman');
		if (topShow) {
			topBut = makeabut('Engw Options +', topToggle);
		} else {
			topBut = makeabut('Engw Options -', topToggle);
		}
		topBut.setAttribute("title", "Show Engw Options");
		myform = myformT;
		eoutstateman = makeaprintarea();
		var statetitles = getstatetitles();
		statesel = makeaselect(statetitles, selstate);
		selectsetidx(statesel, statelist.indexOf(state));
		makeabut('Prev State', prevstate);
		makeabut('Reload State', reloadstate);
		makeabut('Next State', nextstate);
		makeabut(logstrs[logmode], clearlog, null, null, true); // wide margins
		makeabut("FULLSCREEN!", gofullscreen);
		makeabut("Change Res", changeres);
		myform = myformT0;
		makeahr();
		//userStyle = true;
		//oldform.appendChild(myform);
		myform = oldform;
	}
}

function clearlog() {
	inputevents = "inputevents 'clear' = ";	
	logger_str = "logger 'clear' = ";
	logmode = 1 - logmode;
	this.value = logstrs[logmode];
}

function maindebugsetafter() {
	//userStyle = false;
	//if (showscroll || showprint)
	//	makeahr();
	if (showscroll) {
		scrollerinit();
	}
	if (showprint) {
		var oldform = myform;
		myform = myformB0;
		//myform = document.createElement('p');
		setbutsname('debprint');
		// eoutkeystate = document.getElementById('keystate');
		makeahr();
		if (botShow) {
			botBut = makeabut('Show Log +',botToggle);
		} else {
			botBut = makeabut('Show Log -',botToggle);
		}
		if (botBut) {
			botBut.setAttribute("title", "Show Log");
		}
		myform = myformB;
		eoutkeystate = makeaprintarea();
		// eoutinputstate = document.getElementById('inputstate');
		eoutinputstate = makeaprintarea();
		// eoutinputevents = document.getElementById('inputevents');
		eoutinputevents = makeaprintarea();
		// eoutlogger = document.getElementById('logger');
		eoutlogger = makeaprintarea();
		//oldform.appendChild(myform);
		myform = oldform;
	}
}

function buildlayout() {
	if (window.isMobile) {
		var ele1 = document.getElementsByClassName("centerg");		
		var ele2 = document.getElementsByClassName("inside");		
		
		var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		var height = (window.innerHeight > 0) ? window.innerHeight : screen.height;
		var cw = document.documentElement.clientWidth;
		var ch = document.documentElement.clientHeight;
		if (cw > 0 && cw < width)
			width = cw;
		if (ch > 0 && ch < height)
			height = ch;
		var cv = document.getElementById("mycanvas2");
		cv.style.width = width + "px";
		cv.style.height = height + "px";
		return;
	}
// play with styles
	var layoutwidth = {
		bottom:totalwidth,
		top:totalwidth,
		instructions:totalwidth,
		left:leftwidth,
		right:rightwidth,
		middle:totalwidth,
		inside:middlewidth,
	};
	var layoutheight = {
		inside:middleheight,
	};
	for (var name in layoutwidth) {
		var eles = document.getElementsByClassName(name);
		if (!eles.length) {
			break; // don't do any of this if first class not found
		}
		var i;
		for (i=0;i<eles.length;++i) {
			//eles[i].style.width = "300px";
			eles[i].style.width = layoutwidth[name] + "px";
		}
	}
	for (var name in layoutheight) {
		var eles = document.getElementsByClassName(name);
		if (!eles.length) {
			break; // don't do any of this if first class not found
		}
		var i;
		for (i=0;i<eles.length;++i) {
			eles[i].style.height = layoutheight[name] + "px";
		}
	}
}

// main javascript entry point
function mainload() {
	if (!dojavascript)
		return;
	gl_preinit();
	preloadshaderlist("shaders/shaderlist.txt");
	preloadimg("../common/sptpics/maptestnck.png"); // preload the default texture
	preloadimg("../common/sptpics/font0.png"); // preload the default texture
	preloadimg("../common/sptpics/font3.png"); // for debprint, hmm..
	setloaddonefunc(maininit);
	document.oncontextmenu = function() {return false;};
	console.log("in mainload!");
	console.log("location search = '" + window.location.search + "'");
	buildlayout();
	doPageCounter("pagecounterid","pagecounteridT","pagecounteridR","pagecounteridY"); // setup page counter, unique visitors and so on
}

var loadingvp = null;
var loadingmodelfont = null;
var loadingtreefont = null;
var loadstatus = 0;

function loadingproc() {
	if (!loadingvp) {
		// get size of texture
		var tex = Texture.createtexture("font0.png");
		var glyw = tex.width/8; // 16
		var glyh = tex.height/16; // 32
		var debprint_depth = glc.clientHeight/2;
		//debprint_depth *= 2; // half pixel still looks good
		loadingvp = {
	    	// where to draw
			target:null,
			// clear
			clearflags:gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
		//	clearcolor:[0,1,.75,1],
			clearcolor:[0,0,0,1],
		//	mat4.create();
			// orientation
			"trans":[0,0,-debprint_depth],
			"rot":[0,0,0],
		//	"scale":[1,1,1],
			// frustum
			near:.002,
			far:10000.0,
			zoom:1,
			asp:glc.asp,
			//isortho:true,
			ortho_size:debprint_depth*2,
			// optional target (overrides rot)
			inlookat:false,
			//lookat:null,
			incamattach:false,
			//camattach:null
			// sub viewports
			xo:0,
			yo:0,
			xs:1,
			ys:1
		};
	// build model f0, test font model0
	    loadingmodelfont = new ModelFont("loadingfont","font0.png","tex",glyw,glyh,30,20);
		loadingmodelfont.print("Loading...");
		loadingtreefont = new Tree2("amod0");
		loadingtreefont.trans = [-debprint_depth,debprint_depth,0];
		loadingtreefont.setmodel(loadingmodelfont);
		tex.glfree();
	}
    var percent = (loadcnt*100/reqcnt).toFixed(2);
    var loadingstr = 
	"Loading " + percent + "%\n\n" +
	"frame = " + frame + "\nreqcnt = " + reqcnt + "\nloadcnt = " + loadcnt + 
		"\nnwreqcnt = " + nwreqcnt + "\nnwloadcnt = " + nwloadcnt + "\nloadstatus = " + loadstatus++ + "\n";
	var i,j;
	var testalign = String.fromCharCode(127);
	for (j=0;j<10;++j) {
		for (i=0;i<5;++i) {
			loadingstr += testalign;
		}
		loadingstr += "\n";
	}
	loadingmodelfont.print(loadingstr);
	beginscene(loadingvp);
	loadingtreefont.draw();
}

function loadingexit() {
	if (loadingtreefont) {
		loadingtreefont.glfree();
		loadingtreefont = null;
	}
}

function loadingresize() {
	var loading_depth = glc.clientHeight/2;//*8/h;
	//loading_depth *= 2; // half pixel size still looks good, comment out for true 1 to 1 texel to pixel mapping
	if (loadingvp) {
		loadingvp.asp = glc.asp;
		loadingvp.trans[2] = -loading_depth;
		loadingvp.ortho_size = loading_depth*2;
		if (loadingtreefont) {
			loadingtreefont.trans = [-loading_depth,loading_depth,0];
		}
	}
}

var defaultimage;

function doresize() {
		gl_resize();
		debprint.resize();
		loadingresize();
		onresizestate();
}

// enter full screen
function gofullscreen() {
	var didfullscreen = false;
	var elem = document.getElementById("drawarea");
	if (elem.requestFullScreen) {
		elem.requestFullScreen();
		didfullscreen = true;
	} else if (elem.msRequestFullscreen) {
		elem.msRequestFullscreen();
		didfullscreen = true;
	} else if (elem.mozRequestFullScreen) {
		elem.mozRequestFullScreen();
		didfullscreen = true;
	} else if (elem.webkitRequestFullscreen) {
		elem.webkitRequestFullscreen();
		didfullscreen = true;
	} else {
		//alert("Fullscreen API is not supported");
	}
//	if (false) {
//	if (true) {
	if (didfullscreen) {
        glc.style.width = window.screen.width + 'px';
        glc.style.height = window.screen.height + 'px';
		addfullscreenchangehandler();
		doresize();
		infullscreen = true;
	}
}

// change resolution of canvas
function changeres() {
	if (gllores == 1)
		gllores = .5;
	else
		gllores = 1;
	doresize();
}

function addfullscreenchangehandler() {
	if (document.addEventListener) {
		document.addEventListener('webkitfullscreenchange', exitfullscreenHandler, false);
		document.addEventListener('mozfullscreenchange', exitfullscreenHandler, false);
		document.addEventListener('fullscreenchange', exitfullscreenHandler, false);
		document.addEventListener('MSFullscreenChange', exitfullscreenHandler, false);
	}
}	

// exit full screen
function exitfullscreenHandler()
{
    if (!(document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement)) {
        // Run code on exit
		buildlayout(); // for non fullscreen
		infullscreen = false;
	doresize();
    }
}

function doUrlparams() {
	var ss = window.location.search;
	
//URLparams;
	URLparams = {};

	if (ss.charAt(0) == '?') {
		// we have args
		ss = ss.substring(1); // past '?'
		var namevals = ss.split('&');
		var i;
		for (i=0;i<namevals.length;++i) {
			var nv = namevals[i];
			var nvs = nv.split('=');
			if (nvs.length == 2) {
				URLparams[nvs[0]] = decodeURI(nvs[1]);
			}
		}
	}
}

function sizeChangedInit() {
	if (!window.isMobile) {
		return;
	}
	//return;
	window.addEventListener('resize', function() {
        // Code to execute when the window is resized
        console.log
			('Window resized! New width:', window.innerWidth
			, 'New height:', window.innerHeight);
        glc.style.width = window.innerWidth + 'px';
        glc.style.height = window.innerHeight + 'px';
		glc.width = window.innerWidth;
		glc.height = window.innerHeight;
		doresize();
    });
}

function maininit() {
	loadstatus = 0;
	defaultimage = preloadedimages["maptestnck.png"];
	gl_init();
	checkglerror("after gl_init()");
	initinput();
	sizeChangedInit();
	// get some nodes from html
	if (gl) {
		var stst = URLparams.startstate;
		if (stst != null) {
			var so = window[stst];
			if (so)
				changestate(so);
			else
				changestate(startstate);
		} else {
			changestate(startstate);
		}
		//intervalid = window.setInterval(mainproc,intervaltime);
		Timers.resetframestep();
		Timers.setframerate(mainproc,fpswanted);
		debprint.init();
	}
}

function mainproc() {
	Timers.setframerate(mainproc,fpswanted);
	inputproc();
// proc
	debprint.proc();
	procstate();
	debprint.draw();
// draw
	Timers.measureproctime();
	++frame;
}

// leaving page
function mainexit() {
	console.log("main exit");
	if (!dojavascript) {
		return;
	}
	Timers.setframerate(null,0);
	exitstate();
	debprint.exit();
	loadingexit();
	gl_exit();
}

var unloaded = false;
window.addEventListener('load', function(event) {
	console.log('Load event');
	mainload();
});

// this one seems newer
window.addEventListener('beforeunload', function(event) {
	console.log('I am the beforeunload one.');
	mainexit();
	unloaded = true;
});
