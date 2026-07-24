var pendu1 = {};

pendu1.text = "WebGL: This state lets you swing around a pendulum with the mouse.";

pendu1.title = "Pendulum";

var dampval = 0;
var dampstep = 1;//1.0/256.0;
var damparea;
var camz = 5;

var pendroot = null;

var pendpos;
var oldpendpos;
var pendvel;
var oldpendvel;
var pendaccel;
var pendrot;
var pendrotvel;

var dampval;
var damparr = [0,.00001,.00005,.0001,.001,.002,.005,.01,.05,.1,.2,.3,.4,.5];

var pendgrav = -.02;
var pendradius = 4;

function updatedamp() {
	printareadraw(damparea,"Damping : " + damparr[dampval].toFixed(5) + ", Rot : " + pendrot.toFixed(5) + ", Rotvel : " + pendrotvel.toFixed(5));
}
	
function lessdamp() {
	dampval -= dampstep;
	if (dampval < 0)
		dampval = 0;
}

function moredamp() {
	dampval += dampstep;
	if (dampval >= damparr.length)
		dampval = damparr.length - 1;
}

function resetdamp() {
	dampval = 1;
}

function pendfric(v) {
	return (1-damparr[dampval])*v;
}
	
pendu1.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
};

pendu1.init = function() {
	logger("entering webgl pendu1\n");
	
	pendpos = [0,0,0];
	oldpendpos = [0,0,0];
	pendvel = [0,0,0];
	oldpendvel = [0,0,0];
	pendaccel = [0,0,0];
	pendrot = 3*Math.PI/2+Math.PI/16; // a little off center
	pendrotvel = 0;
	
	
	// build the scene
	roottree = new Tree2("root");
	
	// ui
	setbutsname('pendu1');
	// less,more,reset for pendu1
	damparea = makeaprintarea('damp: ');
	makeabut("less damp",null,lessdamp);
	makeabut("reset damp",null,resetdamp,null,true);
	makeabut("more damp",null,moredamp);
	resetdamp();
	
	pendroot = new Tree2("pendroot");
	pendroot.trans = [0,0,0];
	pendroot.rot = [0,0,0];
	roottree.linkchild(pendroot);
	
	// part that you move
	var pendpce0 = buildsphere("pend1pce0",.2,"panel.jpg","diffusespecp");
	pendpce0.trans = [0,0,0];
	pendroot.linkchild(pendpce0);
	
	// rod 
	var pendpce1 = buildcylinderxz("pend1pce1",.1,4,"panel.jpg","diffusespecp");
	pendpce1.trans = [0,0,0];
	pendroot.linkchild(pendpce1);

	// bob 
	var pendpce2 = buildsphere3("pend1pce2",[.4,.1,.4],"panel.jpg","diffusespecp");
	pendpce2.trans = [0,4,0];
	pendpce2.rot = [Math.PI/2,0,0];
	pendroot.linkchild(pendpce2);

	// set the camera
	mainvp.trans = [0,0,-camz]; // flycam
	mainvp.rot = [0,0,0]; // flycam
};

pendu1.proc = function() {
	if (input.mbut[0]) { // convert mouse to 3D space given a zoom factor of 1 and camera at 0,0,-camz
		pendpos = [input.fmx * camz, input.fmy * camz, 0];
	}
///////// start physics /////////
	vec3.sub(pendvel,pendpos,oldpendpos);
	vec3.sub(pendaccel,pendvel,oldpendvel);
	pendaccel[1] -= pendgrav;
	vec3.copy(oldpendpos,pendpos);
	vec3.copy(oldpendvel,pendvel);
	
	// do cross product, get torque
	var torque = pendaccel[0]*Math.sin(pendrot) - pendaccel[1]*Math.cos(pendrot);

	var pendrotaccel = torque/pendradius;
	pendrotvel += pendrotaccel;
	pendrotvel = pendfric(pendrotvel);
	pendrot += pendrotvel;
///////// end physics /////////

	pendrot = normalangrad(pendrot);
	vec3.copy(pendroot.trans,pendpos);
	pendroot.rot = [0,0,pendrot-Math.PI/2];

	roottree.proc();
	doflycam(mainvp); // modify the trs of the vp
	beginscene(mainvp);
	updatedamp();
	roottree.draw();
};

pendu1.exit = function() {
	roottree.log();
	logrc();
	logger("after roottree glfree\n");
	roottree.glfree();
	logrc();
	roottree = null;
	logger("exiting webgl pendu1\n");
	clearbuts('pendu1');
};
