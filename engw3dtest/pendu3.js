var pendu3 = {};

pendu3.text = "WebGL: This state lets you play with many coupled pendulums.";

pendu3.title = "Many pendulums";

// some code and globals 'borrowed' from pendu1

var pend3pos = null;
var pend3vel = null;
var pend3spring = null;
var pend3tree = null;


var pend3k = -.6;
var pend3g = -.02;
var pend3len = 1;
var lastbutsection = -1;
var delta2 = [];

var npendu = 10;
var penduspace = .9;

function updatedamp3() {
	printareadraw(damparea,"Damping3 : " + damparr[dampval].toFixed(5));
}
	
function lessdamp3() {
	dampval -= dampstep;
	if (dampval < 0)
		dampval = 0;
}

function moredamp3() {
	dampval += dampstep;
	if (dampval >= damparr.length)
		dampval = damparr.length - 1;
}

function resetdamp3() {
	dampval = 7;
}

function buildpend3() {
	var ret = new Tree2("apend");
	var pendpce0 = buildsphere("pend3pce0",.1,"panel.jpg","diffusespecp");
	pendpce0.trans = [0,0,0];
	ret.linkchild(pendpce0);
	
	// rod 
	var pendpce1 = buildcylinderxz("pend3pce1",.05,pend3len,"panel.jpg","diffusespecp");
	pendpce1.trans = [0,0,0];
	ret.linkchild(pendpce1);

	// bob 
	var pendpce2 = buildsphere3("pend3pce2",[.2,.05,.2],"panel.jpg","diffusespecp");
	pendpce2.trans = [0,pend3len,0];
	pendpce2.rot = [Math.PI/2,0,0];
	ret.linkchild(pendpce2);
	return ret;
}

pendu3.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
};

pendu3.init = function() {
	logger("entering webgl pendu3\n");
	
	var i;
	pend3pos = [];
	pend3vel = [];
	pend3tree = [];
	for (i=0;i<npendu;++i) {
		pend3pos[i] = 0;
		pend3vel[i] = 0;
	}
	pend3pos[0] = -Math.PI/16;
	lastbutsection = -1;
	lastbut = false;
	
	// build the scene
	roottree = new Tree2("root");
	
	// ui
	setbutsname('pendu3');
	damparea = makeaprintarea('damp: ');
	makeabut("less damp",null,lessdamp3);
	makeabut("reset damp",null,resetdamp3,null,true);
	makeabut("more damp",null,moredamp3);
	resetdamp3();
	
	for (i=0;i<npendu;++i) {
		pend3tree[i] = buildpend3();
		pend3tree[i].trans = [(-npendu+1)*penduspace/2.0+penduspace*i,0,0];
		pend3tree[i].rot = [0,0,0];
		roottree.linkchild(pend3tree[i]);
	}

	pend3spring = [];
	for (i=0;i<npendu-1;++i) {
		pend3spring[i] = buildcylinderxz("pend3spring",.05,1,"panel.jpg","diffusespecp"); // spring
		roottree.linkchild(pend3spring[i]);
	}

	// set the camera
	mainvp.trans = [0,0,-camz]; // flycam
	mainvp.rot = [0,0,0]; // flycam
};

pendu3.proc = function() {
	var pendpos = 0;
	if (input.mbut[0]) {
		pendpos = input.fmx * camz;
		if (lastbutsection < 0) {
			lastbutsection = Math.floor(pendpos/penduspace+npendu/2.0);
			lastbutsection = range(0,lastbutsection,npendu-1);	
		}
	} else {
		lastbutsection = -1;
	}
	
	if (lastbutsection >= 0) {
		pend3pos[lastbutsection] = range(-Math.PI/8,(pendpos - pend3tree[lastbutsection].trans[0])/pend3len,Math.PI/8);
		pend3vel[lastbutsection] = 0;
	}	 
///////// start physics /////////
	for (i=0;i<npendu;++i) {
		var pend3accel = pend3pos[i]*pend3g;
		if (i > 0) {
			pend3accel += (pend3pos[i] - pend3pos[i-1])*pend2k;
		} 
		if (i < npendu - 1) {
			pend3accel += (pend3pos[i] - pend3pos[i+1])*pend2k;
		}
		pend3vel[i] += pend3accel;
		pend3vel[i] = pendfric(pend3vel[i]);
		
		pend3pos[i] += pend3vel[i]; 
		
		pend3tree[i].rot[2] = pend3pos[i] + Math.PI;
	
	}
	for (i=0;i<npendu-1;++i) {
		var springstart = [pend3len*Math.sin(pend3pos[i])+pend3tree[i].trans[0],-pend3len*Math.cos(pend3pos[i]),0];
		var springend = [pend3len*Math.sin(pend3pos[i+1])+pend3tree[i+1].trans[0],-pend3len*Math.cos(pend3pos[i+1]),0];
		pend3spring[i].trans = springstart;
		vec3.sub(delta2,springend,springstart);
		var d = vec3.length(delta2);
		pend3spring[i].scale = [1,d,1];
		var rt = Math.atan2(delta2[1],delta2[0])-Math.PI/2;
		pend3spring[i].rot = [0,0,rt];
	}
///////// end physics /////////


	roottree.proc();
	doflycam(mainvp);  // modify the trs of the vp
	
	beginscene(mainvp);
	updatedamp3();
	roottree.draw();
};

pendu3.exit = function() {
	roottree.log();
	logrc();
	logger("after roottree glfree\n");
	roottree.glfree();
	logrc();
	roottree = null;
	logger("exiting webgl pendu3\n");
	clearbuts('pendu3');
};
