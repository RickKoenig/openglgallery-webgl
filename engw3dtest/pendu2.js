var pendu2 = {};
pendu2.text = "WebGL: This state lets you play with coupled pendulums.";

pendu2.title = "2 pendulums";

// some code and globals 'borrowed' from pendu1

//var pendroot = null;
var pend2pos = null;
var pend2vel = null;
var pend2spring = null;
var pend2tree0 = null;
var pend2tree1 = null;


var pend2k = -.006;
var pend2g = -.02;
var pendlen = 4;
var lastbutsection = -1;
var delta2 = [];

function updatedamp2() {
	printareadraw(damparea,"Damping2 : " + damparr[dampval].toFixed(5));
}
	
function lessdamp2() {
	dampval -= dampstep;
	if (dampval < 0)
		dampval = 0;
}

function moredamp2() {
	dampval += dampstep;
	if (dampval >= damparr.length)
		dampval = damparr.length - 1;
}

function resetdamp2() {
	dampval = 0;
}

function buildpend2() {
	var ret = new Tree2("apend");
	var pendpce0 = buildsphere("pend2pce0",.2,"panel.jpg","diffusespecp");
	pendpce0.trans = [0,0,0];
	ret.linkchild(pendpce0);
	
	// rod 
	var pendpce1 = buildcylinderxz("pend2pce1",.1,pendlen,"panel.jpg","diffusespecp");
	pendpce1.trans = [0,0,0];
	ret.linkchild(pendpce1);

	// bob 
	var pendpce2 = buildsphere3("pend2pce2",[.4,.1,.4],"panel.jpg","diffusespecp");
	pendpce2.trans = [0,4,0];
	pendpce2.rot = [Math.PI/2,0,0];
	ret.linkchild(pendpce2);
	return ret;
}

pendu2.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
};

pendu2.init = function() {
	logger("entering webgl pendu2\n");
	
	pend2pos = [-Math.PI/8,0];
	pend2vel = [0,0];
	lastbutsection = -1;
	lastbut = false;
	
	
	// build the scene
	roottree = new Tree2("root");
	
	// ui
	setbutsname('pendu2');
	// less,more,reset for pendu1
	damparea = makeaprintarea('damp: ');
	makeabut("less damp",null,lessdamp2);
	makeabut("reset damp",null,resetdamp2,null,true);
	makeabut("more damp",null,moredamp2);
	resetdamp2();
	
	pend2tree0 = buildpend2();
	pend2tree0.trans = [-2,0,0];
	pend2tree0.rot = [0,0,0];
	roottree.linkchild(pend2tree0);

	pend2tree1 = buildpend2();
	pend2tree1.trans = [2,0,0];
	pend2tree1.rot = [0,0,0];
	roottree.linkchild(pend2tree1);

	pend2spring = buildcylinderxz("pend2spring",.1,1,"panel.jpg","diffusespecp"); // spring
	roottree.linkchild(pend2spring);

	// set the camera
	mainvp.trans = [0,0,-camz]; // flycam
	mainvp.rot = [0,0,0]; // flycam
};

pendu2.proc = function() {
	var pendpos = 0;
	if (input.mbut[0]) {
		pendpos = input.fmx * camz;
		if (lastbutsection < 0) {
			if (pendpos < 0)
				lastbutsection = 0;
			else 
				lastbutsection = 1;		
		}
	} else {
		lastbutsection = -1;
	}
	
	if (lastbutsection == 0) {
		pend2pos[0] = range(-Math.PI/8,(pendpos - pend2tree0.trans[0])/pendlen,Math.PI/8);
		pend2vel[0] = 0;
	} else if (lastbutsection == 1) {
		pend2pos[1] = range(-Math.PI/8,(pendpos - pend2tree1.trans[0])/pendlen,Math.PI/8);
		pend2vel[1] = 0;
	}	 
///////// start physics /////////
	var pend2accel = [];
	
	var sf = -(pend2pos[1] - pend2pos[0])*pend2k;
	pend2accel[0] = pend2pos[0]*pend2g + sf;
	pend2accel[1] = pend2pos[1]*pend2g - sf;
	
	pend2vel[0] += pend2accel[0];
	pend2vel[1] += pend2accel[1];
	
	pend2vel[0] = pendfric(pend2vel[0]);
	pend2vel[1] = pendfric(pend2vel[1]);
	
	pend2pos[0] += pend2vel[0];
	pend2pos[1] += pend2vel[1];
	
	pend2tree0.rot[2] = pend2pos[0] + Math.PI;
	pend2tree1.rot[2] = pend2pos[1] + Math.PI;

	var springstart = [pendlen*Math.sin(pend2pos[0])+pend2tree0.trans[0],-pendlen*Math.cos(pend2pos[0]),0];
	var springend = [pendlen*Math.sin(pend2pos[1])+pend2tree1.trans[0],-pendlen*Math.cos(pend2pos[1]),0];
	pend2spring.trans = springstart;
	vec3.sub(delta2,springend,springstart);
	var d = vec3.length(delta2);
	pend2spring.scale = [1,d,1];
	var rt = Math.atan2(delta2[1],delta2[0])-Math.PI/2;
	pend2spring.rot = [0,0,rt];

///////// end physics /////////

	roottree.proc();
	doflycam(mainvp);  // modify the trs of the vp
	
	beginscene(mainvp);

	updatedamp2();
	roottree.draw();
};

pendu2.exit = function() {
	roottree.log();
	logrc();
	logger("after roottree glfree\n");
	roottree.glfree();
	logrc();
	roottree = null;
	logger("exiting webgl pendu2\n");
	clearbuts('pendu2');
};
