var solarTest = {}; // a state, like an Android Activity, a static class, has a title text init proc exit onresize

solarTest.title = "Solar Test";

solarTest.text = "Right mouse button moves the camera.  Mouse wheel changes camera distance to the house.\n" +
	"Left mouse button picks and moves inverters and the tree around.\n" +
	"Slider below changes time of day."

// declare some variables we'll need later

solarTest.shadowtexturesharp; // sharp shadowmap

// Tree2 is a object node class used alot to represent objects in a scene
// sun's position in the sky
solarTest.lightdist = 80;
solarTest.lightloc = [0,solarTest.lightdist,-solarTest.lightdist];
solarTest.theLight; // Tree2 of light object (sun)

solarTest.invertermaster; // prototype of inverter model, Tree2
solarTest.moveObjs; // list of a tree and inverters, Tree2[]

solarTest.cursor3D; // 3D cursor, can be turned on in debprint menu, red sphere
solarTest.pickObj; // hilit the object that can be picked, yellow sphere

solarTest.roottree; // main tree node of main scene

solarTest.renderShadowMap; // if true then one shot update shadow textures, because of change TOD or move objects around

solarTest.oldTOD; // Time of Day old
solarTest.TOD; // Time of Day

// for calculating 3D pick, calcRayCast function
solarTest.w2v; // world to view matrix
solarTest.v2c; // view to clip matrix
solarTest.w2c; // world to clip matrix
solarTest.c2w; // clip to world matrix

// object 3D picking
solarTest.pickMode; // (index of moveObjs) if dragging object around, -1 if not
solarTest.pickDist = 1; // how close to get to an object to pick it, and hilit with yellow sphere
solarTest.pickDist2 = solarTest.pickDist*solarTest.pickDist; // how close to get to an object to pick it squared
solarTest.showCursor3D = false; // can be turned on in debprint menu, hit '`'

// for moving the camera around
solarTest.camYaw;
solarTest.camPitch;
solarTest.camDist;
solarTest.lastmx; // calculate delta camera movement
solarTest.lastmy;
// if false then disable right mouse button camera, use flycam instead, activate with 'c'
solarTest.rightCam = true; 

// for changing TOD
solarTest.sliderTree; // yellow sphere to drag to change TOD
solarTest.dragSlider; // true if currently dragging the TOD

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
var Hf = 0;

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
		// bottom
		-Hw,Hf,-Hd,
		Hw,Hf,-Hd,
		-Hw,Hf,Hd,
		Hw,Hf,Hd,
		// top back
		-Hw,Hh,Hd,
		Hw,Hh,Hd,
		-Hw,Hh2,0,
		Hw,Hh2,0,
		// top front
		-Hw,Hh2,0,
		Hw,Hh2,0,
		-Hw,Hh,-Hd,
		Hw,Hh,-Hd,
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
		// bottom
		0,-1,0,
		0,-1,0,
		0,-1,0,
		0,-1,0,
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
	],
	uvs: [
		// front
		0,0,
		2.5,0,
		0,1,
		2.5,1,
		// back
		0,0,
		2.5,0,
		0,1,
		2.5,1,
		// right
		0,1,
		0,0,
		1,-1*Hd*Htn/Hh,
		2,0,
		2,1,
		// left
		0,1,
		0,0,
		1,-1*Hd*Htn/Hh,
		2,0,
		2,1,
		// bottom
		0,0,
		2.5,0,
		0,2,
		2.5,2,
		// top back
		0,0,
		0,2,
		2,0,
		2,2,
		// top front
		0,0,
		0,2,
		2,0,
		2,2,
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
		// bottom
		18,19,20,
		21,20,19,
		// top back
		22,23,24,
		25,24,23,
		// top front
		26,27,28,
		29,28,27,
	]
};

// 7 planes, P . N = d, higher level geometry of the house for calculating intersections of ray to the house
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
	// no bottom
];

// add to main scene a Tree2 of a house
solarTest.buildAHouse = function() {
/*    var mod = Model.createmodel("house");
	if (mod.refcount == 1) {
		mod.setshader("shadowmapuseblur");
	    mod.setmesh(solarTest.houseMesh);
	    mod.settexture("Rest_roof.png");
	    mod.settexture("Rest_siding.png");
	    mod.settexture2("shadowmapsharp");
	    mod.commit(); // send data to GPU
	} */
	
	var multimodel = Model2.createmodel("multimaterial");
	//globaltexflags = textureflagenums.CLAMPU | textureflagenums.CLAMPV;
	if (multimodel.refcount == 1) {
		multimodel.setmesh(solarTest.houseMesh);
		//multimodel.setshader("tex");
		//multimodel.settexture("Bark.png");
		multimodel.addmat2t("shadowmapuseblur","Rest_siding.png","shadowmapsharp",12,22);
		//multimodel.addmat("tex","Bark.png",2,4);
		multimodel.addmat2t("shadowmapuseblur","Rest_roof.png","shadowmapsharp",4,8);
		//multimodel.mats[1].color = [0,1,0,1];
		multimodel.commit();
	}

	var ret = new Tree2("house");
	ret.setmodel(multimodel);
	solarTest.roottree.linkchild(ret); // now part of main scene
};

// add to main scene a tree borrowed from Fort Point scene
solarTest.buildATree = function(trns) {
	var ret = new Tree2("atree");
	bwoInvertNormals = true; // normals were inverted on Tree01.bwo
	var chld = new Tree2("Tree01.bwo"); // load branches
	bwoInvertNormals = false;
	var chld2 = new Tree2("TreeLeaves01.bwo"); // load leaves
	// in order to not have to load the whole fortpoint,
	// manually set the matrix connecting models of the tree
	chld2.o2pmat4 = [ // object to parent matrix
		-1.084,0,-.856,0, // copied from source art
		0,1.38,0,0,
		.856,0,-1.083,0,
		0,0,0,1, 
	];
	ret.linkchild(chld);
	chld.linkchild(chld2);
	chld.trans = [.75,5.812 - .05,0]; // adjust tree origin, also move it down slightly to make shadowmap happier
	ret.trans = trns; // place tree somewhere in main scene
	solarTest.roottree.linkchild(ret); // now part of main scene
	solarTest.moveObjs.push(ret); // first movable object, index 0 of moveObjs will be the tree
};

// build the prototype inverter to be used by makeaninverter
solarTest.makeinvertermaster = function() {
	var ret = new Tree2("inverter");
	var chld = buildprism2t("inverter",[.558*.5,.430*.5,.446*.5],"panel.jpg","shadowmapsharp","shadowmapuseblur");
	chld.trans = [0,.430*.5,0]; // bottom center is the origin
	// inverter also scaled down .5, don't scale make twice as large to show it moving around scene better
	//chld.scale = [.5,.5,.5]; made bigger, just to see inverters better on house and ground
	ret.linkchild(chld);
	return ret;
};

// make a dup of the inverter to add to moveObjs list
solarTest.makeaninverter = function(pos) {
	var t = solarTest.invertermaster.newdup();
	t.trans = vec3.clone(pos);
	solarTest.roottree.linkchild(t);
	solarTest.moveObjs.push(t);
};

// see if TOD needs updating, usually because of updateSlider
solarTest.updateTOD = function() {
	solarTest.TOD = .95*solarTest.sliderTree.trans[0]; // get TOD from slider position
	if (solarTest.TOD == solarTest.oldTOD)
		return; // same
	solarTest.oldTOD = solarTest.TOD;
	solarTest.renderShadowMap = true; // update shadowmap next draw
	// calc arc of the sun
	var ang = solarTest.TOD*Math.PI/2; // -PI/2 to PI/2
	var ang2 =  -38 * Math.PI/180; // latitude
	// spherical to cartesian
	var sa = Math.sin(ang);
	var ca = Math.cos(ang);
	var sa2 = Math.sin(ang2);
	var ca2 = Math.cos(ang2);
	var lx = solarTest.lightdist*sa;
	var ly = solarTest.lightdist*ca;
	var lz = ly*sa2;
	ly *= ca2;
	lz += 15; // summer
	// place the sun, yellow sphere in the sky
	solarTest.theLight.trans = vec3.fromValues(lx,ly,lz);
	// make light direction point in opposite of postion
	var ndir = [];
	vec3.negate(ndir,solarTest.theLight.trans);
	solarTest.theLight.rot = dir2rotZ(ndir); //
	// shadowmap viewport, shadowmapping light, orient this ortho viewport to look down on the house
	// attach this camera to the light
	solarTest.shadowvp.camattach = solarTest.theLight;
	solarTest.shadowvp.incamattach = true;
};

// pass in points p0,p1, plane with n and d (n*p = d), set pint, and returns t, if t<0 or t>1 return null
solarTest.calcIntersections = function(p0,p1,n,d,pint) {
	var pd = vec3.create();
	vec3.sub(pd,p1,p0);
	var dem = vec3.dot(n,pd);
	if (dem > -.01) { // opposite
		return null;
	}
	var num = d - vec3.dot(n,p0);
	
	var t = num/dem;

	if (t < 0 || t > 1)
		return null;
	
	vec3.scale(pint,pd,t);
	vec3.add(pint,pint,p0);
	return t;
};

var saveFmx = 0,saveFmy = 0; // debug special cases
var overridemouse = false; // debug

// calculate the ray that goes from the camera to the mouse cursor, set a near and far point
// also pick and drag objects, pick an object
solarTest.calcRayCast = function(vzdistn,vzdistf) {
	mat4.mul(solarTest.w2c,solarTest.v2c,solarTest.w2v);
	mat4.invert(solarTest.c2w,solarTest.w2c);
	// get these to clip space
	var czdistn = vzdistn*solarTest.v2c[10] + solarTest.v2c[14];
	var czdistnw = vzdistn*solarTest.v2c[11] + solarTest.v2c[15];
	czdistn /= czdistnw;
	var czdistf = vzdistf*solarTest.v2c[10] + solarTest.v2c[14];
	var czdistfw = vzdistf*solarTest.v2c[11] + solarTest.v2c[15];
	czdistf /= czdistfw;
	var n = vec4.create();
	// for debugging
	if (overridemouse) {
		n[0] = saveFmx / solarTest.mvp.asp; // -1 to 1
		n[1] = saveFmy; // -1 to 1
	} else {
		n[0] = input.fmx / solarTest.mvp.asp; // -1 to 1
		n[1] = input.fmy; // -1 to 1
		saveFmx = input.fmx;
		saveFmy = input.fmy;
	}
	n[2] = czdistn;
	n[3] = 1;
	var f = vec4.clone(n);
	f[2] = czdistf;
	var tn = vec4.create();
	var tf = vec4.create();
	vec4.transformMat4(tn,n,solarTest.c2w);
	vec4.transformMat4(tf,f,solarTest.c2w);

	// near point
	var rw = 1/tn[3];
	tn[0] *= rw;
	tn[1] *= rw;
	tn[2] *= rw;
	tn[3] = 1;
	rw = 1/tf[3];
	
	// far point
	tf[0] *= rw;
	tf[1] *= rw;
	tf[2] *= rw;
	tf[3] = 1;
	
	// release pick if LMB is not pressed anymore
	if (!input.mbut[Input.MLEFT])
		solarTest.pickMode = -1; // stop dragging, when mouse released
	
	// now calculate intersections
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
	// find best plane
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
	}
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
		solarTest.cursor3D.flags |= treeflagenums.DONTDRAWC;
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
	if (solarTest.showCursor3D)
		solarTest.cursor3D.flags &= !treeflagenums.DONTDRAWC;
	solarTest.cursor3D.trans = pint;
	
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

	// pint is the best object in world space
	// let's find objects close to it in the scene
	var bestPickIdx = -1;
	var bestDist = 1e20;
	var bestObj = null;
	if (solarTest.pickMode == -1) { // try to pick something up
		for (var i=0;i<solarTest.moveObjs.length;++i) {
			var tre = solarTest.moveObjs[i];
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
	
	// dragging a movable object
	if (solarTest.pickMode >= 0) {
		// hide hilit when dragging object around
		solarTest.pickObj.flags |= treeflagenums.DONTDRAWC;
		var tre = solarTest.moveObjs[solarTest.pickMode];
		tre.trans = pint; // drag object around
		tre.rot = dir2rotY(solarTest.planes[bestpintidx].n);
		solarTest.renderShadowMap = true; // update shadowmap
	}
	
	// hide hilight when mouse button is held down
	if (input.mbut[Input.MLEFT]) {
		solarTest.pickObj.flags |= treeflagenums.DONTDRAWC;
	}
};

// control the camera with right mouse button and the mouse wheel
 solarTest.doRightCam = function() {
	if (!solarTest.rightCam) // if disabled
		return;
	// update camera pitch and yaw if RMB pressed
	if (input.mbut[Input.MRIGHT]) {
		solarTest.camYaw += (input.mx - solarTest.lastmx)*.0035;
		solarTest.camYaw = normalangrad(solarTest.camYaw);
		solarTest.camPitch += (input.my - solarTest.lastmy)*.0035;
		solarTest.camPitch = range(.03,solarTest.camPitch,1.45);
	}
	// adjust camera distance with mouse wheel
	solarTest.camDist -= input.wheelDelta*.55;
	solarTest.camDist = range(9.85,solarTest.camDist,30);
	// set direction of camera
	var dir = vec3.create();
	var cs = Math.cos(solarTest.camPitch);
	dir[0] = cs*Math.sin(solarTest.camYaw);
	dir[1] = -Math.sin(solarTest.camPitch);
	dir[2] = cs*Math.cos(solarTest.camYaw);
	// convert dir to RPY
	// set RPY of main viewport camera
	solarTest.mvp.rot = dir2rotZ(dir);
	// set postion of main viewport camera
	vec3.scale(solarTest.mvp.trans,dir,-solarTest.camDist);
	// camera all set now, remember last mouse coords
	solarTest.lastmx = input.mx;
	solarTest.lastmy = input.my;
};

// handle TOD slider, but don't update TOD, just the UI
solarTest.updateSlider = function() {
	var mb = input.mbut[Input.MLEFT];
	var lmb = input.lmbut[Input.MLEFT];
	// do we need to slide?
	if (!mb)
		solarTest.dragSlider = false;
	// see if mouse click on the slider sphere
	if (mb && !lmb && input.fmy < -.92 && // mouse y near the bottom
	  Math.abs(solarTest.sliderTree.trans[0] - input.fmx) < .04) { // mouse x near the slider
		solarTest.dragSlider = true; // yes, mouse pressed on slider icon
	}
	if (solarTest.dragSlider) {
		// slider engaged, update slider trans with mouse x
		var todx = input.fmx;
		todx = range(-1,todx,1);
		solarTest.sliderTree.trans = [todx,-.95,0]; // update slider graphic
	}
};

// preload these assets before running .init (loading screen)
solarTest.load = function() {
	//preloadimg("../common/sptpics/maptestnck.png"); // fallback texture
	preloadbwo("fortpoint/TreeLeaves01.bwo");
	preloadbwo("fortpoint/Tree01.bwo");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("fortpoint/Grass01.png");
	preloadimg("fortpoint/Rest_roof.png");
	preloadimg("fortpoint/Rest_siding.png");
};

// build up everything for this state now that the assets have been loaded
// initialize everything
solarTest.init = function() {
	checkglerror("start of solarTest init 1");
	logger("entering webgl solarTest\n");
	solarTest.moveObjs = []; // no moveable objects yet
	solarTest.pickMode = -1; // no objects piced yet
	
	solarTest.camYaw = -.83; // start of camera
	solarTest.camPitch = .33;
	solarTest.camDist = 17;
	solarTest.lastmx = 0;
	solarTest.lastmy = 0;
	
// build render target
	var shadowmapres = 2048;
	solarTest.shadowtexturesharp = FrameBufferTexture.createtexture("shadowmapsharp",shadowmapres,shadowmapres);
	//solarTest.shadowtextureblur = FrameBufferTexture.createtexture("shadowmapblur",shadowmapres,shadowmapres);

// main viewport for solarTest state
	solarTest.mvp = {
	   	clearflags:gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
		clearcolor:[.15,.25,.75,1], // blueish
		trans:[0,0,0], // RMB will control
		rot:[0,0,0], // MX,MY will control
	   	near:.01,
	   	far:10000.0,
	   	zoom:1,
		asp:gl.asp, // aspect ratio
		xo:0,
		yo:0,
		xs:1,
		ys:1
	};

// shadow viewport, not yet blurred
	solarTest.shadowvp = {
		target:solarTest.shadowtexturesharp,
	   	clearflags:gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
		clearcolor:[0,0,0,1],                    // Set clear color to black, fully opaque
	   	near:50,
	   	far:100,
		asp:1,
		isshadowmap:true,
		isortho:true,
		ortho_size:20, // how much of the scene to capture with shadow mapping
		xo:0,
		yo:0,
		xs:1,
		ys:1
	};
	
// slider viewport
	solarTest.slidervp = defaultorthoviewport();
	solarTest.slidervp.clearflags = 0; // don't clear anything
	
// build a master inverter
	solarTest.invertermaster = solarTest.makeinvertermaster();
	
//// build the main screen scene
	solarTest.roottree = new Tree2("root");
	
// ground plane
	var planepatchusave = planepatchu;
	var planepatchvsave = planepatchv;
	planepatchu = 10;
	planepatchv = 10;
	var atree1b = buildplanexz2t("planexz1",20,20,"Grass01.png","shadowmapsharp","shadowmapuseblur"); // tex
	planepatchu = planepatchusave;
	planepatchv = planepatchvsave;
	//atree1b.trans = [0,-20,0];
	atree1b.flags |= treeflagenums.DONTCASTSHADOW;
	solarTest.roottree.linkchild(atree1b);
	
// house
	solarTest.buildAHouse();
	
// the tree
	solarTest.buildATree([4.02,0,-7.66]);
	
// some inverters
	solarTest.makeaninverter([-10,0,10]);
	solarTest.makeaninverter([10,0,10]);
	solarTest.makeaninverter([8,0,-8]);
	solarTest.makeaninverter([-10,0,-10]);
	solarTest.makeaninverter([0,0,9]);
	solarTest.makeaninverter([0,0,8]);
	solarTest.makeaninverter([6,0,-6]);

// the sun
	solarTest.theLight = buildsphere("theSun",.5,null,"flat"); // this is where the light is for (directional) shadowcasting
	solarTest.theLight.mod.mat.color = [1,1,.5,1];
	solarTest.theLight.trans = vec3.clone(solarTest.lightloc);
	solarTest.theLight.flags |= treeflagenums.DONTCASTSHADOW;
	solarTest.theLight.flags |= treeflagenums.DIRLIGHT;
	addlight(solarTest.theLight); // diffuse lighting
	solarTest.roottree.linkchild(solarTest.theLight);
	
// shadow map viewer
	var atree3 = buildplanexy("planexy3",2,2,"shadowmapsharp","shadowmapshow"); // invert framebuffer renders
	atree3.trans = [10,4,15];
	atree3.flags |= treeflagenums.DONTCASTSHADOW;
	solarTest.roottree.linkchild(atree3);
	solarTest.mvp.incamattach = false;
	
// UI debprint menu
	debprint.addlist("solar test variables",[
		"solarTest.rightCam",
		//"solarTest.mvp", // change cursor qgate for testing
		//"solarTest.shadowvp", // watch/modify the viewport that spriter.js uses
		"solarTest.showCursor3D",
	]);
	
// sync	
	solarTest.onresize();
	checkglerror("end of solarTest init");
	solarTest.renderShadowMap = true; // set when need to change shadowmap
	solarTest.keepRenderShadowMap = false; // set when always update shadowmap, when not set, update only when necessary
	solarTest.TOD = .3750; // 0 to 1, TOD sunrise to sunset
	debprint.step = .0625;
	solarTest.trackVectorValue = [0,0,3];  //number[3], test dir2rot
	
	// hilit when close to object to pick
	var castSize = .25;
	solarTest.pickObj = buildsphere("pickObj",castSize,null,"flat"); // best object to pick up for dragging, hilit a yellow sphere
	solarTest.pickObj.mod.mat.color = [1,1,0,.7];
	solarTest.pickObj.mod.flags |= modelflagenums.HASALPHA;
	solarTest.pickObj.trans = [0,10,-20];
	solarTest.pickObj.mod.flags |= modelflagenums.NOZBUFFER;
	solarTest.roottree.linkchild(solarTest.pickObj);

	// 3D cursor (when enabled)
	solarTest.cursor3D = buildsphere("cursor3D",castSize,null,"flat"); // 3D cursor a red sphere
	solarTest.cursor3D.mod.mat.color = [1,0,0,.5];
	solarTest.cursor3D.mod.flags |= modelflagenums.HASALPHA;
	solarTest.cursor3D.trans = [0,10,-15];
	solarTest.roottree.linkchild(solarTest.cursor3D);
	
	// show red 3D cursor if enabled
	if (!solarTest.showCursor3D) {
		solarTest.cursor3D.flags |= treeflagenums.DONTDRAWC;
	}

	// matrices for 3D mouse pick and drag
	solarTest.w2v = mat4.create();
	solarTest.v2c = mat4.create();
	solarTest.w2c = mat4.create();
	solarTest.c2w = mat4.create();

	// build slider UI at the bottom of screen
	solarTest.sliderRoot = new Tree2("sliderRoot");
	
	var sliderBack = buildplanexy("sliderBackground",1 + .025,.025,null,"flat");
	sliderBack.mod.flags |= modelflagenums.NOZBUFFER;
	sliderBack.mod.mat.color = [1,1,1,.125];
	sliderBack.mod.flags |= modelflagenums.HASALPHA;
	sliderBack.trans = [0,-.95,1];
	solarTest.sliderRoot.linkchild(sliderBack);
	
	solarTest.sliderTree = buildsphere("theSlider",.025,null,"flat");
	solarTest.sliderTree.trans = [-.55,-.95,0];
	solarTest.sliderTree.mod.mat.color = [1,1,.5,1];
	solarTest.sliderTree.mod.flags |= modelflagenums.HASALPHA;
	solarTest.sliderTree.mod.flags |= modelflagenums.NOZBUFFER;
	solarTest.sliderRoot.linkchild(solarTest.sliderTree);
	
	// sync TOD at init
	solarTest.dragSlider = false;
	solarTest.oldTOD = -1;
	solarTest.updateTOD();
};

// adjust asp if viewport is resized
solarTest.onresize = function() {
	solarTest.mvp.asp = gl.asp;
	solarTest.slidervp.asp = gl.asp;
};

solarTest.proc = function() {
	checkglerror("solar test proc start check gl error");
	solarTest.updateTOD(); // do the TOD UI
	//solarTest.roottree.proc(); // run tree specific code like rotvel
	//solarTest.sliderRoot.proc(); //  run tree specific code like rotvel
	
	doflycam(solarTest.mvp); // modify the trs of the vp
	solarTest.doRightCam(); // do the cam UI, use right mouse button and mouse wheel to move the camera around
	setview(solarTest.mvp); // need these matrices early for raycast
	mat4.copy(solarTest.w2v,mvMatrix);
	mat4.copy(solarTest.v2c,pMatrix);
	solarTest.calcRayCast(.005,55); // near and far
	
	solarTest.updateSlider(); // 

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
	}
	solarTest.shadowvp.clearflags = 0;
	// update light/camera matrix for main render, but don't draw anything (no openGL calls)
	beginscene(solarTest.shadowvp); 
	checkglerror("solar test  shadowvp draw end check gl error");

	// draw main scene
	beginscene(solarTest.mvp);
	solarTest.roottree.draw();
	checkglerror("solar test rootree draw end check gl error");
	
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
	solarTest.shadowtexturesharp.glfree();
	//solarTest.shadowtextureblur.glfree();
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
