var solarTest = {};

solarTest.text = "Right mouse button moves the camera.  Mouse wheel changes camera distance to the house.\n" +
	"Left mouse button picks and moves inverters and the tree around.\n" +
	"Slider below changes time of day."

solarTest.title = "Solar Test";

solarTest.shadowtexturefirst;
//solarTest.shadowtextureblur;

solarTest.lightdist = 80;
solarTest.lightloc = [0,solarTest.lightdist,-solarTest.lightdist];
solarTest.theLight; // Tree2 of light object (sun)
//solarTest.theLight; // Tree2 of light object (sun)

solarTest.vectormasterc;
solarTest.invertermaster;
solarTest.vectorlist;

solarTest.nearObj;
solarTest.middleObj;
solarTest.farObj;
solarTest.pickObj;

solarTest.roottree;
//solarTest.treeTree;

solarTest.renderShadowMap; // if true the one shot render shadow textures

solarTest.oldTOD; // Time of Day
solarTest.TOD;

solarTest.trackVector; // dir2rot tests Y (arrows) and Z (lights) Tree2
solarTest.trackVectorValues; //number[3]
solarTest.tipSphere; // tip of the arrow, test

solarTest.w2v; // world to view matrix
solarTest.v2c; // view to clip matrix
solarTest.w2c; // world to clip matrix
solarTest.c2w; // clip to world matrix

solarTest.pickMode; // (index) if dragging object around, -1 if not
solarTest.pickDist = 1; // how close to get to an object to pick it
solarTest.pickDist2 = solarTest.pickDist*solarTest.pickDist; // how close to get to an object to pick it squared

solarTest.debug = false;

solarTest.camYaw;
solarTest.camPitch;
solarTest.camDist;

solarTest.lastmx;
solarTest.lastmy;

solarTest.rightCam = true;

solarTest.sliderTree;
solarTest.dragSlider;

// hard coded house mesh
// origin at bottom center
// keep these names short, (global)
// house dimensions scaled down .5
var Hw = 12.5 *.5; // 25m wide
var Hh = 7 *.5; // 7m tall
var Hd = 10 *.5; // 20m deep
var Htn = Math.tan(Math.PI/6);
var Hh2 = Hh + Hd*Htn; // roof slant at 30 degrees
var Hny = Math.cos(Math.PI/6); // normal for roof back
var Hnz = Math.sin(Math.PI/6);
var Hf = -.05;

solarTest.houseMesh = {
	verts: [
		// front
		-Hw,Hh,-Hd,
		Hw,Hh,-Hd,
		-Hw,Hf,-Hd,
		Hw,Hf,-Hd,
		// back
		Hw,Hh,Hd,
		-Hw,Hh,Hd,
		Hw,Hf,Hd,
		-Hw,Hf,Hd,
		// right
		Hw,Hf,-Hd,
		Hw,Hh,-Hd,
		Hw,Hh2,0,
		Hw,Hh,Hd,
		Hw,Hf,Hd,
		// left
		-Hw,Hf,Hd,
		-Hw,Hh,Hd,
		-Hw,Hh2,0,
		-Hw,Hh,-Hd,
		-Hw,Hf,-Hd,
		// top
		-Hw,Hh,Hd,
		Hw,Hh,Hd,
		-Hw,Hh2,0,
		Hw,Hh2,0,
		-Hw,Hh2,0,
		Hw,Hh2,0,
		-Hw,Hh,-Hd,
		Hw,Hh,-Hd,
		// bottom
		-Hw,0,-Hd,
		Hw,0,-Hd,
		-Hw,0,Hd,
		Hw,0,Hd,
	],
	norms: [
		// front
		0,0,-1,
		0,0,-1,
		0,0,-1,
		0,0,-1,
		// back
		0,0,1,
		0,0,1,
		0,0,1,
		0,0,1,
		// right
		1,0,0,
		1,0,0,
		1,0,0,
		1,0,0,
		1,0,0,
		// left
		-1,0,0,
		-1,0,0,
		-1,0,0,
		-1,0,0,
		-1,0,0,
		// top back
		0,Hny,Hnz,
		0,Hny,Hnz,
		0,Hny,Hnz,
		0,Hny,Hnz,
		// top front
		0,Hny,-Hnz,
		0,Hny,-Hnz,
		0,Hny,-Hnz,
		0,Hny,-Hnz,
		// bottom
		0,-1,0,
		0,-1,0,
		0,-1,0,
		0,-1,0,
	],
	uvs: [
		// front
		0,0,
		5,0,
		0,2,
		5,2,
		// back
		0,0,
		5,0,
		0,2,
		5,2,
		// right
		0,2,
		0,0,
		2,-2*Hd*Htn/Hh,
		4,0,
		4,2,
		// left
		0,2,
		0,0,
		2,-2*Hd*Htn/Hh,
		4,0,
		4,2,
		// top back
		0,0,
		5,0,
		0,2,
		5,2,
		// top front
		0,2,
		5,2,
		0,4,
		5,4,
		// bottom
		0,0,
		5,0,
		0,2,
		5,2,
	],
	faces: [
		// front
		0,1,2,
		3,2,1,
		// back
		4,5,6,
		7,6,5,
		// right
		8,9,10,
		8,10,11,
		8,11,12,
		// left
		13,14,15,
		13,15,16,
		13,16,17,
		// top back
		18,19,20,
		21,20,19,
		// top front
		22,23,24,
		25,24,23,
		// bottom
		26,27,28,
		29,28,27,
	]
};

// 7 planes
var dtb = vec3.dot([0,Hny,Hnz],[0,Hh,Hd]);
var dtf = vec3.dot([0,Hny,-Hnz],[0,Hh,-Hd]);
solarTest.planes = [
	{d:0,n:[0,1,0]}, // ground
	{d:Hd,n:[0,0,-1]}, // front
	{d:Hd,n:[0,0,1]}, // back
	{d:Hw,n:[1,0,0]}, // right
	{d:Hw,n:[-1,0,0]}, // left
	{d:dtb,n:[0,Hny,Hnz]}, // top back
	{d:dtf,n:[0,Hny,-Hnz]}, // top front
];

solarTest.buildAHouse = function() {
    var mod = Model.createmodel("house");
	if (mod.refcount == 1) {
		mod.setshader("shadowmapuseblur");
	    mod.setmesh(solarTest.houseMesh);
	    mod.settexture("maptestnck.png");
	    mod.settexture2("shadowmapfirst");
	    mod.commit();
	}
	var ret = new Tree2("house");
	ret.setmodel(mod);
	//ret.scale = [.5,.5,.5];
	//ret.trans = [0,-.05,0];
	return ret;
};

solarTest.buildATree = function(trns) {
	var ret = new Tree2("atree");
	bwoInvertNormals = true; // normals were inverted on Tree01.bwo
	var chld = new Tree2("Tree01.bwo");
	bwoInvertNormals = false;
	var chld2 = new Tree2("TreeLeaves01.bwo");
	//chld.trans = [0,0,0];
	//chld.
	chld2.o2pmat4 = [ // object to parent matrix
/*		4,0,0,0,
		0,4,0,0,
		0,0,4,0,
		0,0,0,1, */
		-1.084,0,-.856,0, // copied from source art
		0,1.38,0,0,
		.856,0,-1.083,0,
		0,0,0,1, 
	];
	ret.linkchild(chld);
	chld.linkchild(chld2);
	chld.trans = [.75,5.812 - .05,0]; // adjust tree origin
	//return ret;
	ret.trans = trns;
	solarTest.roottree.linkchild(ret);
	solarTest.vectorlist.push(ret); // index 0 will be the tree
};

solarTest.makeinvertermaster = function() {
	var ret = new Tree2("inverter");
	var chld = buildprism2t("inverter",[.558*.5,.430*.5,.446*.5],"maptestnck.png","shadowmapfirst","shadowmapuseblur");
	chld.trans = [0,.430*.5,0];
	// inverter also scaled down .5
	//chld.scale = [.5,.5,.5]; made bigger, just to see inverters better on house and ground
	ret.linkchild(chld);
	return ret;
};

solarTest.makevectormasterc = function() {
	//var arrowmaster = new Tree2("arrow");
	var c = [
		Math.random(),
		Math.random(),
		Math.random(),
		1.0
	];
	// a modelpart
	var arrowmaster = buildconexz2t("tailc",.125,1,"maptestnck.png","shadowmapfirst","shadowmapuseblur");
	//arrowmaster.trans = [0,-.5,0];
	arrowmaster.mat.color = c;
	/*arrowmaster.linkchild(atree);

	atree = buildcylinderxz2t("midc",.0625,.5,"Asphalt.png","shadowmapfirst","shadowmapuseblur");
	atree.trans = [0,-.25,0];
	//atree.rot = [0,0,-Math.PI/2];
	atree.mat.color = c;
	arrowmaster.linkchild(atree);

	atree = buildconexz2t("headc",.125,.5,"maptestnck.png","shadowmapfirst","shadowmapuseblur");
	atree.trans = [0,.25,0];
	atree.mat.color = c;
	arrowmaster.linkchild(atree);
*/
	return arrowmaster;
};

solarTest.changeavector = function(t,pos,dir,scl) {
	t.trans = vec3.clone(pos);
	if (!dir)
		return t;
	t.rot = dir2rotY(dir);
	var s = scl*vec3.length(dir);	
	t.scale = [s,s,s];
};

solarTest.makeavector = function(pos,dir,c) {
	if (!c)
		c = [1,1,1,1];
	var t = solarTest.vectormasterc.newdup();
	solarTest.changeavector(t,pos,dir,1);
	//if (t.children.length) {
		//var tail = t.children[0];
		t.children[0].mat.color = c;
		t.children[1].mat.color = c;
		/*var mid = t.children[1];
		mid.children[0].mat.color = c;
		mid.children[1].mat.color = c;
		mid.children[2].mat.color = c;
		var head = t.children[2];
		head.children[0].mat.color = c;
		head.children[1].mat.color = c;
	}*/
	return t;
};

solarTest.makeaninverter = function(pos) {
	//if (!c)
	//	c = [1,1,1,1];
	var t = solarTest.invertermaster.newdup();
	t.trans = vec3.clone(pos);
	//solarTest.changeavector(t,pos,dir,1);
	//if (t.children.length) {
		//var tail = t.children[0];
		//t.children[0].mat.color = c;
		//t.children[1].mat.color = c;
		/*var mid = t.children[1];
		mid.children[0].mat.color = c;
		mid.children[1].mat.color = c;
		mid.children[2].mat.color = c;
		var head = t.children[2];
		head.children[0].mat.color = c;
		head.children[1].mat.color = c;
	}*/
	solarTest.roottree.linkchild(t);
	solarTest.vectorlist.push(t);
};

solarTest.updateTOD = function() {
	//solarTest.TOD = range(.03125,solarTest.TOD,.96875);
	solarTest.TOD = .95*solarTest.sliderTree.trans[0];
	if (solarTest.TOD == solarTest.oldTOD)
		return;
	solarTest.oldTOD = solarTest.TOD;
	solarTest.renderShadowMap = true; // update shadowmap
	var ang = /*-Math.PI/2 + */solarTest.TOD*Math.PI/2; // -PI/2 to PI/2
	var ang2 = -38 * Math.PI/180; // latitude
	var sa = Math.sin(ang);
	var ca = Math.cos(ang);
	var sa2 = Math.sin(ang2);
	var ca2 = Math.cos(ang2);
	var lx = solarTest.lightdist*sa;
	var ly = solarTest.lightdist*ca;
	var lz = ly*sa2;
	ly *= ca2;
	//ly *= 
	lz += 15; // summer
	// the directional light
	//solarTest.theLight.trans = vec3.fromValues(0,0,5);
	solarTest.theLight.trans = vec3.fromValues(lx,ly,lz);
	//solarTest.theLight.rot = vec3.fromValues(ang + Math.PI/2,Math.PI/2,0); // light normally face in the z direction, Euler angles
	var ndir = [];
	vec3.negate(ndir,solarTest.theLight.trans);
	solarTest.theLight.rot = dir2rotZ(ndir);
	// shadowmap viewport, shadowmapping light
	//solarTest.shadowvp.trans = solarTest.theLight.trans;
	//solarTest.shadowvp.rot = solarTest.theLight.rot;
	solarTest.shadowvp.trans = null;
	solarTest.shadowvp.rot = null;
	solarTest.shadowvp.camattach = solarTest.theLight;
	solarTest.shadowvp.incamattach = true;
	/*
solarTest.shadowvp
		"trans":vec3.clone(solarTest.lightloc),
		"rot":[Math.PI/4,0,0], // part of lightdir

	solarTest.theLight.trans = vec3.clone(solarTest.lightloc);
	solarTest.theLight.flags |= treeflagenums.DONTCASTSHADOW;
	solarTest.theLight.flags |= treeflagenums.DIRLIGHT;
	solarTest.theLight.rot = [Math.PI/4,0,0];
	*/
};

// pass in points p0,p1, plane with n and d, set pint, and returns t, if t<0 or t>1 return null
solarTest.calcIntersections = function(p0,p1,n,d,pint) {
	var pd = vec3.create();
	vec3.sub(pd,p1,p0);
	var dem = vec3.dot(n,pd);
	if (dem > -.01) { // opposite
		return null;
	}
	var num = d - vec3.dot(n,p0);
	
	var t = num/dem;
//	var t = .5;
	
	
	if (t < 0 || t > 1)
		return null;
	
	vec3.scale(pint,pd,t);
	vec3.add(pint,pint,p0);
	return t;
};

// calculate the ray that goes from the camera to the mouse cursor, set a near and far point
// also pick and drag objects
var saveFmx = 0,saveFmy = 0;

solarTest.calcRayCast = function(vzdistn,vzdistf) {
	//solarTest.nearObj.trans[0] = input.fmx * 10;
	
	mat4.mul(solarTest.w2c,solarTest.v2c,solarTest.w2v);
	//mat4.mul(solarTest.w2c,solarTest.w2v,solarTest.v2c);
	mat4.invert(solarTest.c2w,solarTest.w2c);
	
	var czdistn = vzdistn*solarTest.v2c[10] + solarTest.v2c[14];
	var czdistnw = vzdistn*solarTest.v2c[11] + solarTest.v2c[15];
	czdistn /= czdistnw;
	var czdistf = vzdistf*solarTest.v2c[10] + solarTest.v2c[14];
	var czdistfw = vzdistf*solarTest.v2c[11] + solarTest.v2c[15];
	czdistf /= czdistfw;
	//pointf3 n,f;
	var n = vec4.create();
	var overridemouse = false;//!input.mbut[Input.MMIDDLE]; // debug
	if (overridemouse) {
		n[0] = saveFmx / solarTest.mvp.asp; // -1 to 1   //-1.0f+(mox-vp->xstart)* 2.0f/vp->xres;
		n[1] = saveFmy; // -1 to 1   //1.0f+(moy-vp->ystart)*-2.0f/vp->yres;
	} else {
		n[0] = input.fmx / solarTest.mvp.asp; // -1 to 1   //-1.0f+(mox-vp->xstart)* 2.0f/vp->xres;
		n[1] = input.fmy; // -1 to 1   //1.0f+(moy-vp->ystart)*-2.0f/vp->yres;
		saveFmx = input.fmx;
		saveFmy = input.fmy;
	}
	n[2] = czdistn;
	n[3] = 1;
	var f = vec4.clone(n);
	f[2] = czdistf;
	//mat4 c2w;
	//inversemat4(&solarTest.w2c,&c2w);
	var tn = vec4.create();
	var tf = vec4.create();
	//mulmatvec4(&c2w,&n,tn);
	//mulmatvec4(&c2w,&f,tf);
	vec4.transformMat4(tn,n,solarTest.c2w);
	vec4.transformMat4(tf,f,solarTest.c2w);

	// near point
	var rw = 1/tn[3];
	tn[0] *= rw;
	tn[1] *= rw;
	tn[2] *= rw;
	tn[3] = 1;
	rw = 1/tf[3];
	solarTest.nearObj.trans = tn;
	
	// far point
	tf[0] *= rw;
	tf[1] *= rw;
	tf[2] *= rw;
	tf[3] = 1;
	solarTest.farObj.trans = tf;
	
	// now calculate intersections
	
	//var n = [0,1,0];
	//var d = 0;
	
	if (!input.mbut[Input.MLEFT])
		solarTest.pickMode = -1; // stop dragging, when mouse released
	
	// special for tree, ignore the house when dragging tree around
	var numPlanes = solarTest.pickMode == 0 ? 1 : solarTest.planes.length;
	var plane = solarTest.planes[0];
	var n = plane.n;
	var d = plane.d;
	var pinttree = vec3.create();
	var treet = solarTest.calcIntersections(tn,tf,n,d,pinttree);
	// treet will be null when no ground intersection found
	if (treet === null)
		treet = 2; // floor will be ignored later

	 // we want highest t between 6 house planes (convex, intersection)
	var bestt = -1; // best house time
	var bestpint = null;
	var bestpintidx = -1;
	var pint = vec3.create();
	for (var i=1;i<numPlanes;++i) {
		plane = solarTest.planes[i];
		n = plane.n;
		d = plane.d;
		var t = solarTest.calcIntersections(tn,tf,n,d,pint);
		if (t === null) {
			continue;
		}
		if (t > bestt) {
			bestt = t;
			bestpint = vec3.clone(pint);
			bestpintidx = i;
		}
			//t = -1; // wall/roof will be ignored
	}
	// bestt == -1 when no intersection found
	if (bestt == -1) { // flip not found to the other side of 0 to 1
		bestt = 2; 
	} else { // okay got an intersection, is it on the house
		if (bestpint[0] + epsilon < -Hw || bestpint[0] - epsilon > Hw ||
		  bestpint[2] + epsilon < -Hd || bestpint[2] - epsilon > Hd ||
		  bestpint[1] - epsilon > Hh2 - Math.abs(bestpint[2])*Htn) {
			bestt = 2;
		}  
	}
	if (bestt == 2 && treet == 2) {
		//logger("no intersection on anything\n");
		solarTest.middleObj.flags |= treeflagenums.DONTDRAWC;
		solarTest.pickObj.flags |= treeflagenums.DONTDRAWC;
		return;
	}
	// we want lowest t between house result and ground plane (concave, union)
	if (bestt < treet) {
		// house wins
		pint = bestpint;
	} else {
		// ground wins
		pint = pinttree;
		bestpintidx = 0;
	}
	if (solarTest.debug)
		solarTest.middleObj.flags &= !treeflagenums.DONTDRAWC;
	solarTest.middleObj.trans = pint;
	
	
/*	



	
	// see if both house and ground bad
	if (bestt == -1 && treet === null) {
		// cursor not on anything
		solarTest.middleObj.flags |= treeflagenums.DONTDRAWC;
		solarTest.pickObj.flags |= treeflagenums.DONTDRAWC;
		return;
	}
	if (bestt != -1) {
	// if only house is good
	} else if (treet !== null) {
	// if only ground is good
	} else {
	// both are good, compare times
		if (
	}

	if (treet < bestt) {
		// ground wins and ground is good
		
	} else {
		// house wins
	}

	// finally we got our intersection point that's on the house or ground,
	// now look around the scene for things to pickup
*/	
		
	// keep cursor on the map
	if (pint[0] > 15)
		return;
	else if (pint[0] < -15)
		return;
	if (pint[2] > 15)
		return;
	else if (pint[2] < -15)
		return;
	
	if (solarTest.pickMode == 0) { // keep the tree from going inside the house
		if (pint[0] > -Hw - 1 && pint[0] < Hw + 1 &&
		  pint[2] > -Hd - 1 && pint[2] < Hd + 1) {
			return; // move the tree only when it's not inside the house
		}
	}

	//solarTest.middleObj.trans = pint;
	//solarTest.middleObj.flags &= !treeflagenums.DONTDRAWC;
	
	// pint is the 3D cursor in world space,
	// let's find objects close to it in the scene
	
	var bestPickIdx = -1;
	var bestDist = 1e20;
	var bestObj = null;
	if (solarTest.pickMode == -1) { // try to pick something up
		for (var i=0;i<solarTest.vectorlist.length;++i) {
		//for (var i=0;i<1;++i) { // just the tree
			var tre = solarTest.vectorlist[i];
			var trns = tre.trans;
			var dist2 = vec3.sqrDist(trns,pint);
			if (dist2 <= solarTest.pickDist2 && dist2 <= bestDist) {
				bestDist = dist2;
				bestPickIdx = i;
				bestObj = tre;
			}
		}
		
		if (bestObj) {
			solarTest.pickObj.trans = bestObj.trans;
			if (input.mbut[Input.MLEFT] && !input.lmbut[Input.MLEFT]) {
				if (solarTest.pickMode < 0) {
					solarTest.pickMode = bestPickIdx;
				}
			} else {
				solarTest.pickObj.flags &= !treeflagenums.DONTDRAWC;
			}
		} else {
			solarTest.pickObj.flags |= treeflagenums.DONTDRAWC;
		}
	}

	
	if (solarTest.pickMode >= 0) {
		// hide hilit when dragging object around
		solarTest.pickObj.flags |= treeflagenums.DONTDRAWC;
		var tre = solarTest.vectorlist[solarTest.pickMode];
		tre.trans = pint; // drag object around
		tre.rot = dir2rotY(solarTest.planes[bestpintidx].n);
		solarTest.renderShadowMap = true; // update shadowmap
		
	}
	
	// hide hilight when mouse button is held down
	if (input.mbut[Input.MLEFT]) {
		solarTest.pickObj.flags |= treeflagenums.DONTDRAWC;
	}

};

solarTest.doRightCam = function() {
	if (!solarTest.rightCam)
		return;
	if (input.mbut[Input.MRIGHT]) {
		solarTest.camYaw += (input.mx - solarTest.lastmx)*.0035;
		solarTest.camYaw = normalangrad(solarTest.camYaw);
		solarTest.camPitch += (input.my - solarTest.lastmy)*.0035;
		solarTest.camPitch = range(.03,solarTest.camPitch,1.45);
	}
	solarTest.camDist -= input.wheelDelta*.55;
	solarTest.camDist = range(9.85,solarTest.camDist,30);
	var dir = vec3.create();
	var cs = Math.cos(solarTest.camPitch);
	dir[0] = cs*Math.sin(solarTest.camYaw);
	dir[1] = -Math.sin(solarTest.camPitch);
	dir[2] = cs*Math.cos(solarTest.camYaw);
	solarTest.mvp.rot = dir2rotZ(dir);
	vec3.scale(solarTest.mvp.trans,dir,-solarTest.camDist);
};

solarTest.updateSlider = function() {
	var mb = input.mbut[Input.MLEFT];
	var lmb = input.lmbut[Input.MLEFT];
	if (!mb)
		solarTest.dragSlider = false;
	if (mb && !lmb && input.fmy < -.92 && 
	  Math.abs(solarTest.sliderTree.trans[0] - input.fmx) < .04) {
		solarTest.dragSlider = true;
	}
	if (solarTest.dragSlider) {
		var todx = input.fmx;
		todx = range(-1,todx,1);
		solarTest.sliderTree.trans = [todx,-.95,0];
	}
};

solarTest.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("fortpoint/Asphalt.png");
	preloadimg("../common/sptpics/wonMedal.png");
	preloadbwo("fortpoint/TreeLeaves01.bwo");
	preloadbwo("fortpoint/Tree01.bwo");
};

solarTest.init = function() {
	checkglerror("start of solarTest init 1");
	logger("entering webgl solarTest\n");
	solarTest.vectorlist = [];
	solarTest.pickMode = -1;
	solarTest.camYaw = -.83;
	solarTest.camPitch = .33;
	solarTest.camDist = 17;
	solarTest.lastmx = 0;
	solarTest.lastmy = 0;
// build render target
	var shadowmapres = 2048;
	solarTest.shadowtexturefirst = FrameBufferTexture.createtexture("shadowmapfirst",shadowmapres,shadowmapres);
	//solarTest.shadowtextureblur = FrameBufferTexture.createtexture("shadowmapblur",shadowmapres,shadowmapres);

// main viewport for state 19
	solarTest.mvp = {
	   	clearflags:gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
		clearcolor:[.15,.25,.75,1],                    // Set clear color to yellow, fully opaque
		trans:[13.81,4,-13.5],
		"rot":[.265,-1,0], // part of lightdir
		//"scale":[1,1,1],
	   	near:.01,
	   	far:10000.0,
	   	zoom:1,
		asp:gl.asp,
		//inlookat:true
		isortho:false,
		ortho_size:1,
		xo:0,
		yo:0,
		xs:1,
		ys:1
	};

// shadow viewport, not yet blurred
	solarTest.shadowvp = {
		target:solarTest.shadowtexturefirst,
	   	clearflags:gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
		clearcolor:[0,0,0,1],                    // Set clear color to black, fully opaque
		"trans":vec3.clone(solarTest.lightloc),
		"rot":[Math.PI/4,0,0], // part of lightdir
	   	near:50,
	   	far:100,
	   	zoom:1,
		asp:1,
		inlookat:false,
		isshadowmap:true,
		isortho:true,
		ortho_size:20, // how much of the scene to capture with shadow mapping
		xo:0,
		yo:0,
		xs:1,
		ys:1
	};
/*
// shadow blur viewport
	solarTest.shadowblurvp = {
		target:solarTest.shadowtextureblur,
	   	clearflags:gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
		clearcolor:[0,0,0,1],                    // Set clear color to black, fully opaque
		"trans":[0,0,0],
		"rot":[0,0,0], // part of lightdir
	   	near:-10,
	   	far:10,
	   	zoom:1,
		asp:1,
		inlookat:false,
		isshadowmap:false,
		isortho:true,
		ortho_size:1, // how much of the scene to capture with shadow mapping
		xo:0,
		yo:0,
		xs:1,
		ys:1
	};
*/
// slider viewport
	solarTest.slidervp = defaultorthoviewport();
	solarTest.slidervp.clearflags = 0;//   	clearflags:gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,

// build a master vector
	solarTest.vectormasterc = solarTest.makevectormasterc();
	
// build a master inverter
	solarTest.invertermaster = solarTest.makeinvertermaster();
	
//// build the main screen scene
	solarTest.roottree = new Tree2("root");
	
	/*// back plane
	var atree1 = buildplanexy2t("planexy1",20,20,"maptestnck.png","shadowmapfirst","shadowmapuseblur"); // tex
	atree1.trans = [0,0,20];
	atree1.flags |= treeflagenums.DONTCASTSHADOW;
	solarTest.roottree.linkchild(atree1);
	*/
	// ground plane
	var atree1b = buildplanexz2t("planexz1",20,20,"maptestnck.png","shadowmapfirst","shadowmapuseblur"); // tex
	//atree1b.trans = [0,-20,0];
	atree1b.flags |= treeflagenums.DONTCASTSHADOW;
	solarTest.roottree.linkchild(atree1b);
	
	var houseTree = solarTest.buildAHouse();
	solarTest.roottree.linkchild(houseTree);
	
	/*solarTest.treeTree = */solarTest.buildATree([4.02,0,-7.66]);
	
/*	var i,j,k;
	for (k=-3;k<=3;++k) {
		var z = k*(10/3);
		for (j=-3;j<=3;++j) {
			var y = j*(10/3);
			for (i=-3;i<=3;++i) {
				var x = i*(10/3);
				var as = solarTest.makeavector([x,y,z],[1,0,0],[Math.random()*.5+.5,Math.random()*.5+.5,Math.random()*.5+.5,1]);
				//as.rotvel = [Math.random(),Math.random(),Math.random()];
				//as.scale = [4,4,4];
				solarTest.roottree.linkchild(as);
				solarTest.vectorlist.push(as);
			}
		}
	} */
	var as = solarTest.makeavector([-10,0,0],[0,1,0]);
	solarTest.roottree.linkchild(as);

	var as = solarTest.makeavector([10,0,0],[0,1,0]);
	solarTest.roottree.linkchild(as);

	solarTest.trackVector = solarTest.makeavector([0,0,-10],[0,1,0]);
	solarTest.roottree.linkchild(solarTest.trackVector);
	//solarTest.trackVectorValues = [3,1,3];  //number[3]

	var as = solarTest.makeavector([0,0,10],[0,1,0]);
	solarTest.roottree.linkchild(as);

	solarTest.makeaninverter([-10,0,10]);
	//solarTest.roottree.linkchild(as);
	
	solarTest.makeaninverter([10,0,10]);
	//solarTest.roottree.linkchild(as);
	
	solarTest.makeaninverter([8,0,-8]);
	//solarTest.roottree.linkchild(as);
	
	solarTest.makeaninverter([-10,0,-10]);
	//solarTest.roottree.linkchild(as);
	
	
	solarTest.makeaninverter([0,0,9]);
	//solarTest.roottree.linkchild(as);

	solarTest.makeaninverter([0,0,8]);
	//solarTest.roottree.linkchild(as);

	solarTest.makeaninverter([6,0,-6]);
	//solarTest.roottree.linkchild(as);
	
	/*for (var i=0;i<45;++i) {
		var inv = solarTest.makeaninverter([-6.25 + i* .558*.5,3.5,-5]);
		solarTest.roottree.linkchild(inv);

	} */

	/*
		for (i=0;i<250;++i) {
		var sz = 10;
		var x = 2*sz*Math.random()-sz;
		var y = 2*sz*Math.random()-sz;
		var z = 2*sz*Math.random()-sz;
		as = solarTest.makeavector([x,y,z],[10,0,0],[Math.random()*.5+.5,Math.random()*.5+.5,Math.random()*.5+.5,1]);
		//as.rotvel = [Math.random(),Math.random(),Math.random()];
		//as.scale = [4,4,4];
		solarTest.roottree.linkchild(as);
		solarTest.vectorlist.push(as);
	}*/
	// the light
	//solarTest.theLight = new Tree2("sun");
	//solarTest.theLight.rotvel = [.1,.2,.3];
	solarTest.theLight = buildsphere("theSun",.5,null,"flat"); // this is where the light is for (directional) shadowcasting
	solarTest.theLight.mod.mat.color = [1,1,.5,1];
	solarTest.theLight.trans = vec3.clone(solarTest.lightloc);
	solarTest.theLight.flags |= treeflagenums.DONTCASTSHADOW;
	solarTest.theLight.flags |= treeflagenums.DIRLIGHT;
	//solarTest.theLight.rot = [Math.PI/4,0,0];
	addlight(solarTest.theLight); // diffuse lighting
	//solarTest.theLight.linkchild(solarTest.theLight);
	solarTest.roottree.linkchild(solarTest.theLight);
	
	solarTest.tipSphere = buildsphere("arrowtip",.5,"maptestnck.png","tex"); // tip of the arrow
	solarTest.tipSphere.trans = [0,0,0];
	solarTest.tipSphere.scale = [.25,.25,.25];
	solarTest.roottree.linkchild(solarTest.tipSphere);

	// shadow map viewer
	var atree3 = buildplanexy("planexy3",2,2,"shadowmapfirst","shadowmapshow"); // invert framebuffer renders
	atree3.trans = [10,4,15];
	atree3.flags |= treeflagenums.DONTCASTSHADOW;
	solarTest.roottree.linkchild(atree3);
/*
	atree3 = buildplanexy("planexy4",2,2,"shadowmapblur","shadowmapshow"); // invert framebuffer renders
	atree3.trans = [15,4,15];
	atree3.flags |= treeflagenums.DONTCASTSHADOW;
	solarTest.roottree.linkchild(atree3);
*/
	solarTest.mvp.incamattach = false;
	
	// UI debprint 
	debprint.addlist("solar test variables",[
		"solarTest.rightCam",
		"solarTest.camYaw",
		"solarTest.camPitch",
		"solarTest.camDist",
		"solarTest.TOD",
		"solarTest.trackVectorValue",
		"solarTest.mvp", // change cursor qgate for testing
		"solarTest.shadowvp", // watch/modify the viewport that spriter.js uses
		"solarTest.w2v", // watch world to view matrix"
		"solarTest.v2c", // watch view to clip (projection) matrix
		"solarTest.theLight",
		
	]);
	solarTest.onresize();
	checkglerror("end of solarTest init");
	solarTest.renderShadowMap = true; // set when need to change shadowmap
	solarTest.keepRenderShadowMap = false; // set when always update shadowmap, when not set, update only when necessary
	solarTest.TOD = .1875; // 0 to 1, TOD sunrise to sunset
	debprint.step = .0625;
	solarTest.trackVectorValue = [0,0,3];  //number[3], test dir2rot
	
	var castSize = .25;
	solarTest.pickObj = buildsphere("pickObj",castSize,null,"flat"); // this is where the light is for (directional) shadowcasting
	solarTest.pickObj.mod.mat.color = [1,1,0,.7];
	solarTest.pickObj.mod.flags |= modelflagenums.HASALPHA;
	solarTest.pickObj.trans = [0,10,-20];
	solarTest.pickObj.mod.flags |= modelflagenums.NOZBUFFER;
	solarTest.roottree.linkchild(solarTest.pickObj);

	solarTest.nearObj = buildsphere("nearObj",castSize,null,"flat"); // this is where the light is for (directional) shadowcasting
	solarTest.nearObj.mod.mat.color = [0,1,0,.5];
	solarTest.nearObj.mod.flags |= modelflagenums.HASALPHA;
	solarTest.nearObj.trans = [0,10,-20];
	solarTest.roottree.linkchild(solarTest.nearObj);

	solarTest.middleObj = buildsphere("middleObj",castSize,null,"flat"); // this is where the light is for (directional) shadowcasting, slightly larger for ortho viewing
	solarTest.middleObj.mod.mat.color = [1,0,0,.5];
	solarTest.middleObj.mod.flags |= modelflagenums.HASALPHA;
	solarTest.middleObj.trans = [0,10,-15];
	solarTest.roottree.linkchild(solarTest.middleObj);
	
	solarTest.farObj = buildsphere("farObj",castSize,null,"flat"); // this is where the light is for (directional) shadowcasting, slightly larger for ortho viewing
	solarTest.farObj.mod.mat.color = [1,1,1,1];
	//solarTest.farObj.mod.flags |= modelflagenums.HASALPHA;
	solarTest.farObj.trans = [0,10,-15];
	solarTest.roottree.linkchild(solarTest.farObj);

	if (!solarTest.debug) {
		solarTest.middleObj.flags |= treeflagenums.DONTDRAWC;
	}
	solarTest.nearObj.flags |= treeflagenums.DONTDRAWC;
	solarTest.farObj.flags |= treeflagenums.DONTDRAWC;
	
	solarTest.w2v = mat4.create();
	solarTest.v2c = mat4.create();
	solarTest.w2c = mat4.create();
	solarTest.c2w = mat4.create();

	solarTest.sliderRoot = new Tree2("sliderRoot");

	//var sliderBack = buildsphere("sliderBackground",.045,null,"flat");
	//var sliderBack = buildprism("sliderBackground",[.025,.025,.025],"maptestnck.png","tex");
	var sliderBack = buildplanexy("sliderBackground",1 + .025,.025,null,"flat");
	sliderBack.mod.flags |= modelflagenums.NOZBUFFER;
	sliderBack.mod.mat.color = [1,1,1,.125];
	sliderBack.mod.flags |= modelflagenums.HASALPHA;
	sliderBack.trans = [0,-.95,1];
	//sliderBack.rotvel = [0,.2,0];
	solarTest.sliderRoot.linkchild(sliderBack);

	solarTest.sliderTree = buildsphere("theSlider",.025,null,"flat");
	solarTest.sliderTree.trans = [-.75,-.95,0];
	solarTest.sliderTree.mod.mat.color = [1,1,.5,1];
	solarTest.sliderTree.mod.flags |= modelflagenums.HASALPHA;
	solarTest.sliderTree.mod.flags |= modelflagenums.NOZBUFFER;
	solarTest.sliderRoot.linkchild(solarTest.sliderTree);
	
	solarTest.dragSlider = false;
	solarTest.oldTOD = -1;
	solarTest.updateTOD();
	
	/*// build a planexy (a square) for blurring
	solarTest.rootblurtree = buildplanexy("ablurplane",1,-1,"shadowmapfirst","shadowmapdoblur"); // render target
	solarTest.rootblurtree.mod.flags |= modelflagenums.DOUBLESIDED;*/

};

solarTest.onresize = function() {
	solarTest.mvp.asp = gl.asp;
	solarTest.slidervp.asp = gl.asp;
};

solarTest.proc = function() {
	checkglerror("solar test  proc start check gl error");

	solarTest.trackVector.rot = dir2rotY(solarTest.trackVectorValue);
	var s = vec3.length(solarTest.trackVectorValue);
	solarTest.trackVector.scale = [s,s,s];
	vec3.add(solarTest.tipSphere.trans,solarTest.trackVector.trans,solarTest.trackVectorValue);	
	solarTest.updateTOD();
	solarTest.roottree.proc();
	solarTest.sliderRoot.proc();
	
	doflycam(solarTest.mvp); // modify the trs of the vp
	solarTest.doRightCam(); // use right mouse button and mouse wheel to move the camera around
	setview(solarTest.mvp);
	mat4.copy(solarTest.w2v,mvMatrix);
	mat4.copy(solarTest.v2c,pMatrix);
	solarTest.calcRayCast(.005,55); // near and far
	
	solarTest.updateSlider();

	// draw to shadowmap
	checkglerror("solar test  draw start check gl error");
	if (solarTest.renderShadowMap) {
		
		// render shadow map
		solarTest.shadowvp.clearflags = gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT;
		beginscene(solarTest.shadowvp);
		solarTest.roottree.draw();
		
/*		// render shadow blur map
		beginscene(solarTest.shadowblurvp);
		solarTest.rootblurtree.draw(); */
		
		if (!solarTest.keepRenderShadowMap) {
			solarTest.renderShadowMap = false;
		}
	} //else {
	solarTest.shadowvp.clearflags = 0;
	// update light/camera matrix for main render, but don't draw anything (no openGL calls)
	beginscene(solarTest.shadowvp); 
	//}
	checkglerror("solar test  draw end check gl error");

	// draw main scene
	beginscene(solarTest.mvp);
	//mat4.copy(solarTest.w2v,mvMatrix);
	//mat4.copy(solarTest.v2c,pMatrix);
	solarTest.roottree.draw();
	checkglerror("solar test  proc end check gl error");
	solarTest.lastmx = input.mx;
	solarTest.lastmy = input.my;
	
	// draw slider
	beginscene(solarTest.slidervp);
	solarTest.sliderRoot.draw();
};

solarTest.exit = function() {
	checkglerror("solar test  exit start check gl error");
	logger("roottree log\n");
	solarTest.roottree.log();
	logger("sliderRoot log\n");
	solarTest.sliderRoot.log();
	//logger("rootblurtree log\n");
	//solarTest.rootblurtree.log();
	logger("model and texture logs before free\n");
	logrc();
	logger("after roottree glfree\n");
	
	// free everything
	solarTest.roottree.glfree();
	solarTest.shadowtexturefirst.glfree();
	//solarTest.shadowtextureblur.glfree();
	solarTest.vectormasterc.glfree();
	solarTest.invertermaster.glfree();
	solarTest.sliderRoot.glfree();
	//solarTest.rootblurtree.glfree();	
	// show freed state
	logrc();
	solarTest.roottree = null;
	logger("exiting webgl solarTest\n");
	checkglerror("solar test exit end check gl error");
	debprint.removelist("solar test variables");
};
