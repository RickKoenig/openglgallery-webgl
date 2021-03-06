var state = null;
var newstate = null;
var dochangestate = false;
var stateinited = false;

function changestate(news) {
	if (typeof news == 'string') {
		news = window[news];
	}
	//if (!news)
	//	return;
	//while (ns >= nstates)
	//	ns -= nstates;
	//while (ns < 0)
	//	ns += nstates;
	newstate = news;
	dochangestate = true;
	havemousedown = false;
}

function showandgo(m,s) {
	var cbf = state[s];
	logger("^^^^^^^^^^^ " + s + "." + m + " ^^^^^^^^^^^\n");
//	if (s>=0 && s<nstates) {
	//var cbf = window[s];
	if (cbf) {
		cbf();
	}
	logger("vvvvvvvvvvvvv " + s + "." + m + " vvvvvvvvvvvv\n");
//		return true;	
//	} else {
//		return false;
//	} else {
//		return false;
//	}
}

function loadstate() {
//	var instele = document.getElementById('instructions');
//	instele.innerHTML = escapehtml("Hiho hiho\noff to work\nwe go.");
	//var s = "text" + state;
	//var noesc = "noesc" + state;
	var inst = state.text;
	var noesc = state.noesc;
	//noesc = true;
	if (!inst)
		inst = "Default description";
	var instele = document.getElementById('instructions');
	if (instele) {
		if (noesc)
			instele.innerHTML = inst;
		else
			instele.innerHTML = escapehtml(inst);
	}
	//showandgo("load" + state);
	showandgo(newstate.title,"load");
	preloadtime(2500,true);
	preloadtime(5000,true);
	setloaddonefunc(initstate);
}

function initstate() {
	if (window.checkglerror)
		checkglerror("start init state");
	//if (loadingmodelfont)
	//	loadingmodelfont.print("");
	loadstatus = 0;
	maindebugclear();
	maindebugsetbefore(); // but debug before user
	//showandgo("init" + state);
	showandgo(newstate.title,"init");
	maindebugsetafter(); // but debug after user
	stateinited = true;
	resetframestep();
	if (window.checkglerror)
		checkglerror("done init state");
}

function procstate() {
	//if (window.checkglerror)
	//	checkglerror("start proc state");
	if (infullscreen) {
		if (input.key == 'n'.charCodeAt(0) /* && !myform */)
			nextstate();
		else if (input.key == 'p'.charCodeAt(0) /* && !myform */)
			prevstate();
	}
	if (dochangestate) {
		exitstate();
		state = newstate;
		loadstate();
		//initstate();
		dochangestate = false;
	}
	if (window.sprites_reset)
		sprites_reset();
	if (state) {
	//if (state>=0 && state<nstates) {
//		if (false) {
		if (stateinited) {
//		if (isloaded()) { // assets loaded, proc state
			//load_mode(false); // for webgl
			//window["proc" + state]();
			if (state.proc)
				state.proc();
			drawelements();
		} else { // assets loading, display loading progress screen
			//load_mode(true); // for webgl
			loadingproc();
		}
	}
	if (window.checkglerror)
		checkglerror("end proc state");
}

function onresizestate() {
		showandgo(state.title,"onresize");
}

function exitstate() {
	//var durl = edrawarea.toDataURL();
	if (stateinited) {
		//showandgo("exit" + state);
		showandgo(state.title,"exit");
		stateinited = false;
	}
}

function nextstate() {
	var stateidx = statelist.indexOf(state);
	if (stateidx<0)
		alert("can't next state");
	++stateidx;
	if (stateidx >= statelist.length)
		stateidx -= statelist.length;
	if (mainproc) {
		curfps = 0;
		setframerate(mainproc,fpswanted);
	}
	changestate(statelist[stateidx]);
}

function prevstate() {
	var stateidx = statelist.indexOf(state);
	if (stateidx<0)
		alert("can't prev state");
	--stateidx;
	if (stateidx < 0)
		stateidx += statelist.length;
	if (mainproc) {
		curfps = 0;
		setframerate(mainproc,fpswanted);
	}
	changestate(statelist[stateidx]);
}

function selstate(sel) {
	var stateidx = sel.selectedIndex; // OR statesel.selectedIndex
	changestate(statelist[stateidx]);
	// sometimes the screen locks up, roll the mouse wheel to unfreeze (chrome)
	if (mainproc) {
		curfps = 0;
		setframerate(mainproc,fpswanted);
	}
}

function reloadstate() {
	if (mainproc) {
		curfps = 0;
		setframerate(mainproc,fpswanted);
	}
	changestate(state);
}

function getstatetitles() {
	var i;
	var ret = [];
	for (i=0;i<statelist.length;++i) {
		ret.push(statelist[i].title);
	}
	return ret;
}