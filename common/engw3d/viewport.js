var flycamstate = {
	inflycam:false,
	flycamrevy:false,
	"flycamspeed":.125
};

//var defaulttarget = null;

/*function hexdig(d) {
	if (d>=10)
		return String.fromCharCode(d-10+'A'.charCodeAt(0));
	else
		return String.fromCharCode(d+'0'.charCodeAt(0));
}

function tohex2(val) {
	if (val >= 1)
		return "ff";
	if (val < 0)
		return "00";
	var i = Math.floor(256*val);
	return hexdig(i>>4) + hexdig(i&0xf);
}
*/
function beginscene(vp) {
	checkglerror("start beginscene");
	//if (defaulttarget != vp.target) {
		FrameBufferTexture.useframebuffer(vp.target);
	//	defaulttarget = vp.target;
	//}
	checkglerror("done useframebuffer");
	if (vp.clearflags & gl.COLOR_BUFFER_BIT) {
		// I'm not sure why css background-color has an effect on alpha blending ??
		gl.clearColor(vp.clearcolor[0],vp.clearcolor[1],vp.clearcolor[2],vp.clearcolor[3]);
		// So I'll just set the style.backgroundColor to the same as the gl.clearColor
		//glc.style.backgroundColor = "#" + tohex2(vp.clearcolor[0]) + tohex2(vp.clearcolor[1]) + tohex2(vp.clearcolor[2]);
	}
    if (vp.clearflags)
		gl.clear(vp.clearflags);
	checkglerror("start setview");
	setview(vp);
	checkglerror("end setview");
	if (vp.target) {
	    gl.viewport(0, 0, vp.target.width,vp.target.height);
	} else {
	    gl.viewport(0, 0, vp.xs*gl.drawingBufferWidth, vp.ys*gl.drawingBufferHeight);
	}
	if (vp.isshadowmap)
		shadowmap.beginpass();
	else
		shadowmap.endpass();
}

/*function endscene() {
}*/

function setview(vp) {
	// lookat cam
	if (vp.inlookat && vp.lookat) {

		var a = vp.lookat; // get tree node that we're looking at
		var mwi = mat4.create(); // lookat node to world matrix

		while(a) {
			if (a.o2pmat4 && !a.qrotsamp && !a.possamp) { // test TODO
				var ia = mat4.create();
				mat4.invert(ia,a.o2pmat4);
				mat4.mul(mwi,mwi,ia);
			} else if (a.qrot) {
				buildtransqrotscaleinv(mwi,a); // using tqs members (trans quat scale) // test TODO
			} else {
				buildtransrotscaleinv(mwi,a); // using trs members (trans rot scale) // works!
			}
			a = a.parent; // walk up to world
		}

		var mw = mat4.create();
		mat4.invert(mw,mwi);
		var trns = [mw[12],mw[13],mw[14]]; // lookat point in world space
		var trns2 = vp.trans;
		if (vp.incamattach && vp.camattach) { // do both lookat and camattach
			// borrow mvMatrix and v2wMatrix
			mat4.identity(mvMatrix);
			buildtransrotscaleinv(mvMatrix,vp); // viewport first
			var a = vp.camattach; // get tree node that camera is attached to, where in the world is the camera
			while(a) {
				if (a.o2pmat4 && !a.qrotsamp && !a.possamp) { // test TODO
					var ia = mat4.create();
					mat4.invert(ia,a.o2pmat4);
					mat4.mul(mvMatrix,mvMatrix,ia);
				} else if (a.qrot) {
					buildtransqrotscaleinv(mvMatrix,a); // using tqs members (trans quat scale) // test TODO
				} else {
					buildtransrotscaleinv(mvMatrix,a); // using trs members (trans rot scale) // works!
				}
				a = a.parent; // walk up to world
			}
			mat4.invert(v2wMatrix,mvMatrix); // for env map and shadowmapping
			trns2 = [v2wMatrix[12],v2wMatrix[13],v2wMatrix[14]]; // camera location in world space
			// done borrow mvMatrix and v2wMatrix
		}
		mat4.lookAtlhc(mvMatrix,trns2,trns,[0,1,0]);
	} else { // no lookat, just check for camattach
		mat4.identity(mvMatrix);

//		if (false) {
		// ajust mvMatrix for attached camera
		buildtransrotscaleinv(mvMatrix,vp); // viewport first
		if (vp.incamattach && vp.camattach) { // build up the camera to world matrix, then invert it
			var a = vp.camattach; // get tree node that camera is attached to
			while(a) {
				if (a.o2pmat4 && !a.qrotsamp && !a.possamp) { // test TODO
					var ia = mat4.create();
					mat4.invert(ia,a.o2pmat4);
					mat4.mul(mvMatrix,mvMatrix,ia);
				} else if (a.qrot) {
					buildtransqrotscaleinv(mvMatrix,a); // using tqs members (trans quat scale) // test TODO
				} else {
					buildtransrotscaleinv(mvMatrix,a); // using trs members (trans rot scale) // works!
				}
				a = a.parent; // walk up to world
			}
			// check for neg scale and invert the scale of the matrix somehow...
			// and normalize matrix
			// leave pos scale alone...
			var d = mat4.det(mvMatrix);
			if (d < 0) {
				var id = -1.0/d;
				id = -Math.pow(id,1.0/3.0);
			} else {
				var id = 1.0/d;
				id = Math.pow(id,1.0/3.0);
			}
			var mi = [0,1,2,4,5,6,8,9,10,12,13,14]; // flip over just the 4 by 3 submatrix part, it seems to work
			var i;
			for (i=0;i<mi.length;++i) {
				var j = mi[i];
				mvMatrix[j] *= id;
			}
		}
	}
	mat4.invert(v2wMatrix,mvMatrix); // for env map and shadowmapping
	
	// set projection matrix here
	if (vp.isortho) {
		mat4.ortholhc(pMatrix,-vp.ortho_size*vp.asp,vp.ortho_size*vp.asp,-vp.ortho_size,vp.ortho_size,vp.near,vp.far);
	} else {
		mat4.perspectivelhczf(pMatrix,vp.zoom,vp.asp,vp.near,vp.far);
		pMatrix[8] += vp.xo*2/gl.asp; // skew X
		pMatrix[9] += vp.yo*2; // skew Y
	}
	
	// get light matrices over for 2nd pass
	if (vp.inshadowmapmap) {
		// copy over matrices to light map matrices
		globalmat.lightpMatrix = pMatrix;
		shadowmap.lmvMatrix = mvMatrix;
		shadowmap.hasshadowmap = true;
	}
	//dolights(); // call later in Tree2.draw
}

function viewportClearRotTrans(vp) {
	vp.trans[0] = vp.trans[1] = vp.trans[2] = 0;
	vp.rot[0] = vp.rot[1] = vp.rot[2] = 0;
}

function doflycam(vp) {
	var leftright=0,foreback=0,updown=0;
	var mxc,mxr,myc,myr,rcx,rsx,rcy,rsy;
	//if (wininfo.indebprint || wininfo.releasemode)
	//	return;
/*	if (input.key) {
		logger("gotakey\n");
} */
	if (input.key == "c".charCodeAt(0)) {
		flycamstate.inflycam = !flycamstate.inflycam;
		//input.key = 0; // so other viewports don't get a key..
	}
	if (input.key == "l".charCodeAt(0)) {
		vp.inlookat = !vp.inlookat;
		//input.key = 0; // so other viewports don't get a key..
	}
	if (input.key == "a".charCodeAt(0)) {
		vp.incamattach = !vp.incamattach;
		input.key = 0; // so other viewports don't get a key..
	}
	if (input.key == "y".charCodeAt(0)) {
		flycamstate.flycamrevy = !flycamstate.flycamrevy;
		input.key = 0; // so other viewports don't get a key..
	}
	if (input.mx>=0 && input.mx<glc.clientWidth && input.my>=0 && input.my<glc.clientHeight) {
		if (input.key == "r".charCodeAt(0)) {
			viewportClearRotTrans(vp);
			input.key = 0;
		}
		if (flycamstate.inflycam) {
			if (input.key == "+".charCodeAt(0) || input.key == "=".charCodeAt(0))
				flycamstate.flycamspeed *= 2.0;
			if (input.key == "-".charCodeAt(0))
				flycamstate.flycamspeed *= .5;
			if (input.keystate[keycodes.RIGHT])
				leftright += flycamstate.flycamspeed;
			if (input.keystate[keycodes.LEFT])
				leftright -= flycamstate.flycamspeed;
			if (input.keystate[keycodes.UP])
			//if (true) // force UP
				foreback += flycamstate.flycamspeed;
			if (input.keystate[keycodes.DOWN]) {
				foreback -= flycamstate.flycamspeed;
			}
			if (input.mbut[Input.MRIGHT] || input.mbut[Input.MMIDDLE])
				updown += flycamstate.flycamspeed;
			if (input.mbut[Input.MLEFT])
				updown -= flycamstate.flycamspeed;

			mxc = .5*glc.clientWidth;
			myc = .5*glc.clientHeight;
			mxr = 1.0*2*2*Math.PI/glc.clientWidth;
			myr = .5*2*Math.PI/glc.clientHeight;
			if (flycamstate.flycamrevy)
				myr = -myr;
			vp.rot[1] = normalangrad((input.mx - mxc)*mxr);
			vp.rot[0] = normalangrad((input.my - myc)*myr);

			rcx = Math.cos(vp.rot[0]);
			rsx = Math.sin(vp.rot[0]);
			rcy = Math.cos(vp.rot[1]);
			rsy = Math.sin(vp.rot[1]);
			vp.trans[0] += leftright*rcy;
			vp.trans[2] -= leftright*rsy;
			vp.trans[0] += foreback*rcx*rsy;
			vp.trans[1] += -foreback*rsx;
			vp.trans[2] += foreback*rcx*rcy;
			vp.trans[0] += updown*rsx*rsy;
			vp.trans[1] += updown*rcx;
			vp.trans[2] += updown*rsx*rcy;
		}
	}
//	setview(vp);
}

function defaultviewport() {
	var vp = {
		// where to draw
		target:null,
		// clear
		clearflags:gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
//			clearcolor:[0,0,0,1],
//			clearcolor:[1,1,1,1],
		clearcolor:[0,.75,1,1], // RGBA
//			clearcolor:[.1,.2,.9,1],
	//	mat4.create();
		// orientation
		"trans":[0,0,0],
		"rot":[0,0,0],
	//	"scale":[1,1,1],
		// frustum
		//near:.02, // android version
		near:.002, // webgl version
		far:10000.0,
		zoom:1,
		asp:gl.asp,
		isortho:false,
		ortho_size:10,
		// optional target (overrides rot)
		inlookat:false,
		lookat:null,
		incamattach:false,
		camattach:null,
		xo:0,
		yo:0,
		xs:1,
		ys:1
	};
	return vp;
}

function defaultorthoviewport() {
	//var depth = glc.clientHeight/2;//*8/h;
	//depth *= 2; // half pixel size still looks good, comment out for true 1 to 1 texel to pixel mapping
	vpo = {
		// where to draw
		target:null,
		// clear
		clearflags:gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
//			clearcolor:[0,0,0,1],
//			clearcolor:[1,1,1,1],
		clearcolor:[0,.75,1,1],
//			clearcolor:[.1,.2,.9,1],
	//	mat4.create();
		// orientation
		"trans":[0,0,0],
		"rot":[0,0,0],
	//	"scale":[1,1,1],
		// frustum
		near:-1000.0,
		far:1000.0,
		zoom:1,
		asp:gl.asp,
		isortho:true,
		//ortho_size:depth,
		ortho_size:1,
		inlookat:false,
		lookat:null,
		incamattach:false,
		camattach:null,
		xo:0,
		yo:0,
		xs:1,
		ys:1
	};
	return vpo;
}
