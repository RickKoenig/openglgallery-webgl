// big TODO: make less global !!
let state = null;
let newstate = null;
let dochangestate = false;
let stateinited = false;
let passIntent = null; // data to be passed from one state to another

function changestate(NS, intent) {
	if (typeof NS == 'string') {
		NS = window[NS];
	}
	newstate = NS;
	passIntent = intent;
	dochangestate = true;
	havemousedown = false;
}

// call a method in a 'state' object
function showandgo(title, method, data) {
	let callBack = state[method];
	logger("showandgo ^^^^^^^^^^^ " + method + "." + title + " ^^^^^^^^^^^\n");
	if (callBack) {
		callBack(data);
	}
	data = null;
	logger("showandgo vvvvvvvvvvvvv " + method + "." + title + " vvvvvvvvvvvv\n");
}

function loadstate() {
//	let instele = document.getElementById('instructions');
//	instele.innerHTML = escapehtml("Hiho hiho\noff to work\nwe go.");
	//let s = "text" + state;
	//let noesc = "noesc" + state;
	let inst = state.text;
	let noesc = state.noesc;
	//noesc = true;
	if (!inst)
		inst = "Default description";
	let instele = document.getElementById('instructions');
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
	if (window.checkglerror) checkglerror("start init state");
	//if (loadingmodelfont)
	//	loadingmodelfont.print("");
	loadstatus = 0;
	maindebugclear();
	maindebugsetbefore(); // but debug before user
	//showandgo("init" + state);
	showandgo(newstate.title, "init", passIntent);
	maindebugsetafter(); // but debug after user
	stateinited = true;
	resetframestep();
	if (window.checkglerror) checkglerror("done init state");
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
		dochangestate = false; // do this early for nested state changes
		exitstate();
		state = newstate;
		loadstate();
		//initstate();
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
			//console.log("state proc " + state.title);
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
	//let durl = edrawarea.toDataURL();
	if (stateinited) {
		//showandgo("exit" + state);
		showandgo(state.title,"exit");
		stateinited = false;
	}
}

function nextstate() {
	let stateidx = statelist.indexOf(state);
	do {
		if (stateidx < 0) {
			alert("can't next state");
		}
		++stateidx;
		if (stateidx >= statelist.length) {
			stateidx -= statelist.length;
		}
	} while(statelist[stateidx].hidden);
	if (mainproc) {
		curfps = 0;
		setframerate(mainproc, fpswanted);
	}
	changestate(statelist[stateidx]);
}

function prevstate() {
	let stateidx = statelist.indexOf(state);
	do {
		if (stateidx < 0) {
			alert("can't prev state");
		}
		--stateidx;
		if (stateidx < 0) {
			stateidx += statelist.length;
		}
	} while(statelist[stateidx].hidden);
	if (mainproc) {
		curfps = 0;
		setframerate(mainproc, fpswanted);
	}
	changestate(statelist[stateidx]);
}

// select HTML UI selected a new state
function selstate(sel) { // the selector element
	let oldStateidx = statelist.indexOf(state);
	let newStateidx = sel.selectedIndex; // OR statesel.selectedIndex
	const newstate = statelist[newStateidx];
	if (newstate.hidden) {
		console.log(`Can't select state '${newstate.title}', it's hidden!`);
		const newIdx = statelist.indexOf(newstate);
		selectsetidx(sel, oldStateidx);//statelist.indexOf(state));
		return;
	}
	changestate(statelist[newStateidx]);
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
	let i;
	let ret = [];
	for (i=0;i<statelist.length;++i) {
		const state = statelist[i];
		let title = state.title;
		if (state.hidden) {
			title = '* ' + title;
		}
		ret.push(title);
	}
	return ret;
}
