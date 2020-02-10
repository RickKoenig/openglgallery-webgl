var gl; // the main interface
var glc; // canvas to make webgl
//var d2edrawarea; // canvas to make webgl
var gllores = 1; // lower resolution on a given canvas, the lower the number the faster the fragment shaders will be
var dowebgl = true;
var maxTextures = 16;
// list of all shaders
var shaderlist;
/* = [
	"red",
	"basic",
	"flat",
	"cvert",
	"tex"
]; */

var glenums = {
	"GL_FLOAT":5126,
	"GL_FLOAT_VEC2":35664,
	"GL_FLOAT_VEC3":35665,
	"GL_FLOAT_VEC4":35666,
	"GL_FLOAT_MAT4":35676
	//"GL_SAMPLER_2D":35678
};

var globalmat = {
	hi:3,
	"ho":5,
	alphacutoff:.03125,
	//alphacutoff:.125,
	//alphacutoff:.0625,
	//alphacutoff:.125
	//alphacutoff:.25
	//alphacutoff:.5
	//alphacutoff:.75
	specpow:500,
};

function gl_resize() {
//	alert("gl_resize to " + x + " " + y);
	 // set gl wid,hit
	glc.width = glc.clientWidth*gllores;
    glc.height = glc.clientHeight*gllores;
		//gl.drawingBufferWidth = glc.clientWidth*gllores;
		//gl.drawingBufferHeight = glc.clientHeight*gllores;
     // set asp
	gl.asp = glc.clientWidth/glc.clientHeight;
	// set gl viewport
	//var xo = 0;
	//var yo = 0;
	var xs = 1;
	var ys = 1;
	if (window.mainvp) {
		mainvp.asp = gl.asp;
		//xo = mainvp.xo;
		//yo = mainvp.yo;
		xs = mainvp.xs;
		ys = mainvp.ys;
	}
	gl.viewport(0, 0, xs*gl.drawingBufferWidth, ys*gl.drawingBufferHeight);
	//gl.viewport(xo*gl.drawingBufferWidth, yo*gl.drawingBufferHeight, xs*gl.drawingBufferWidth, ys*gl.drawingBufferHeight);
//	mat4.perspectivelhc(pMatrix, Math.PI/180 * 90, gl.asp, 0.5, 2.0);
	//mat4.perspectivelhc(pMatrix, Math.PI/180 * 90, gl.asp, 0.002,10000.0);
}

function gl_init() {
	logger_str += " gl_init\n";	
	checkglerror("start gl_init()");
	gl = null;
	glc = document.getElementById('mycanvas2');
	var glattr = {
		alpha:false,
		depth:true,
		stencil:false,
		antialias:true,
		premultipliedAlpha:true,
		preserveDrawingBuffer:false
	};
	// get a webgl context (gl)
	if (dowebgl) {
		try {
			// Try to grab the standard context. If it fails, fallback to experimental.
			gl = glc.getContext("webgl",glattr);
			if (gl) {
				logger_str += "webgl\n";
			checkglerror("just got GL 'webgl'",false); // I get some weird GL_MAX_SAMPLES_ANGLE enum error
													  // on Android Emulator when creating the context, so ignore
			}
			if (!gl) {
				gl = glc.getContext("experimental-webgl",glattr);
				if (gl)
					logger_str += "experimental-webgl\n";
			}
			//gl = edrawarea.getContext("experimental-webgl");
		checkglerror("just got GL");
		}
		catch(e) {
			logger_str += "err gl context\n";
		}
	}
	// If we don't have a GL context, give up now
	if (!gl) {
		logger_str += "no webgl\n";
		var ctx=glc.getContext("2d");
        glc.width = glc.clientWidth;
        glc.height = glc.clientHeight;
        //glc.style.width = glc.clientWidth;
        //glc.style.height = glc.clientHeight;
		ctx.font="20px Arial";
		ctx.fillText("Your browser doesn't support WebGL.",20,40);
		var instele = document.getElementById('instructions');
		if (instele)
			instele.innerHTML = 'Get webgl ' +
			'<a href="http://get.webgl.org"> here</a> .';
		//ctx=edrawarea.getContext("2d");
		//ctx.font="30px Arial";
		//ctx.fillText("2d Your browser doesn't support WebGL.",10,50);
		//alert("Unable to initialize WebGL. Your browser may not support it.");
		//glc.style.opacity = 1;	// hide the 2d canvas by showing the 3d canvas
	}
	if (gl) {
/*		if (!myform) {
			//var sw = screen.availWidth;
			//var sh = screen.availHeight;
			var sw = 1024;
			var sh = 768;
	        maparea.style.width = sw + "px";
	        maparea.style.height = sh + "px";
	        glc.style.width = sw + "px";
	        glc.style.height = sh + "px";
	        glc.clientWidth = sw;
	        glc.clientHeight = sh;
	} else { */
	// set screen wid,hit
	        //glc.clientWidth = glc.clientWidth;
	        //glc.clientHeight = glc.clientHeight;
	 //	}
	 // set gl wid,hit
	// set gl viewport and asp
		checkglerror("after gl_mid()");
		gl_resize();
		gl.enable(gl.BLEND);
		gl.blendFunc (gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
	    gl.clearColor(.7,.7,0,1);                      // Set clear color to yellow, fully opaque
	    gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
	    gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
	    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
		// convert to d3d like left handed coord system by negating z, z now increases away in front of the camera, towards the horizon
		//pMatrix[8] = -pMatrix[8]; pMatrix[9] = -pMatrix[9]; pMatrix[10] = -pMatrix[10]; pMatrix[11] = -pMatrix[11];
	    initShaders();
	    gl.frontFace(gl.CW);
	    gl.cullFace(gl.BACK);
	    gl.enable(gl.CULL_FACE);
		
		mainvp = defaultviewport();
		//resetviewport(mainvp);
/*	    initBuffers();
	    inittextures(); */
		checkglerror("after gl_init()");
	}
}

function gl_exit() {
	exitShaders();
}

var shaderPrograms = {};
var shadershadowmapbuild = null;
var shadershadowmapbuildnotex = null;

function getShader2v(gl,id) {
    var str = preloadedtext[id];
	if (!str)
		return null;
    var shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(shader,str);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("VERTEX SHADER ERROR '" + id + "' " + gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

function getShader2p(gl,id) {
    var str = preloadedtext[id];
	if (!str)
		return null;
    var shader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(shader,str);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("PIXEL SHADER ERROR '" + id + "' " + gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

function preloadShaders() {
	var i,n = shaderlist.length;
	for (i=0;i<n;++i) {
		var shadName = shaderlist[i];
		//if (!shadName.startsWith("//")) {
			preloadtext("shaders/" + shadName + ".vert.glsl");
			preloadtext("shaders/" + shadName + ".frag.glsl");
		//}
	}
}

function initShaders() {
	var i,j,n = shaderlist.length;
	for (j=0;j<n;++j) {
		var shadName = shaderlist[j];
		//if (shadName.startsWith("//")) {
		//	continue;
		//}
	    //var vertexShader = getShader(gl, "shader-vs");
	    //var fragmentShader = getShader(gl, "shader-fs");
	    var vertexShader = getShader2v(gl, shadName + ".vert.glsl");
	    var fragmentShader = getShader2p(gl, shadName + ".frag.glsl");
	
	    var shaderProgram = gl.createProgram();
	    shaderProgram.name = shadName;
	    gl.attachShader(shaderProgram, vertexShader);
	    gl.attachShader(shaderProgram, fragmentShader);
	    gl.linkProgram(shaderProgram);
	
	    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	        alert("Could not initialise shader LINK '" + shadName + "'");
	        alert(gl.getProgramInfoLog(shaderProgram));
	    }
	
		var nunif = gl.getProgramParameter(shaderProgram,gl.ACTIVE_UNIFORMS);
		shaderProgram.actunifs = {};
		for (i=0;i<nunif;++i) {
			var au = gl.getActiveUniform(shaderProgram,i);
			shaderProgram[au.name] = gl.getUniformLocation(shaderProgram,au.name);
			//shaderProgram.unifs.push(au);
			shaderProgram.actunifs[au.name] = au;
		}
		
		shaderProgram.nattrib = gl.getProgramParameter(shaderProgram,gl.ACTIVE_ATTRIBUTES);
		//shaderProgram.attribs = [];
		for (i=0;i<shaderProgram.nattrib;++i) {
			var aa = gl.getActiveAttrib(shaderProgram,i);
			shaderProgram[aa.name] = gl.getAttribLocation(shaderProgram,aa.name);
			//shaderProgram.attribs.push(aa);
		}
/*		shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
		shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
		shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.bright = gl.getUniformLocation(shaderProgram, "bright");
		shaderProgram.phase = gl.getUniformLocation(shaderProgram, "phase");
		shaderProgram.sampler = gl.getUniformLocation(shaderProgram, "uSampler0");
		shaderPrograms.basic = shaderProgram; */
	    gl.useProgram(shaderProgram);
		//setAttributes(shaderProgram);
		setSamplerUniforms(shaderProgram);
	    //setMatrixPersUniforms(shaderProgram);
		shaderPrograms[shadName] = shaderProgram;
		if (shaderProgram.name == "shadowmapbuild")
			shadershadowmapbuild = shaderProgram;
		if (shaderProgram.name == "shadowmapbuildnotex")
			shadershadowmapbuildnotex = shaderProgram;
	}
}


//var wMatrix = mat4.create(); // world matrix, o2w
//var vMatrix = mat4.create(); // view matrix, camera, w2v

var mvMatrix = mat4.create(); // model view matrix, o2v, used in shaders, mvMatrix = vMatrix * wMatrix
var mvMatrixNoScale = mat4.create(); // don't scale children by parent scale
var pMatrix = mat4.create(); // perspective matrix, v2c, used in shaders
var v2wMatrix = mat4.create(); // eye to world, used by envmap
globalmat.LvMatrix = mat4.create();
globalmat.LpMatrix = mat4.create();
// mv = v * w
// ends up being p * mv = p * v * w

//var activeattribs = [];
var nactiveattribs = 0;
// enable only the ones we need
function setAttributes(shaderProgram) {
	
	var i,n = shaderProgram.nattrib;
	// assume attribs count from 0
	if (n > nactiveattribs) {
		for (i=nactiveattribs;i<n;++i)
			gl.enableVertexAttribArray(i);
	} else if (n < nactiveattribs) {
		for (i=n;i<nactiveattribs;++i)
			gl.disableVertexAttribArray(i);	
		
	}
	/*
	var i,n = shaderProgram.nattrib;
	for (i=0;i<nactiveattribs;++i)
		gl.disableVertexAttribArray(i);
	for (i=0;i<n;++i)
		gl.enableVertexAttribArray(i);
	*/
	nactiveattribs = n;
/*	gl.disableVertexAttribArray(0);
	gl.disableVertexAttribArray(1);
	for (i=0;i<n;++i) {
		gl.enableVertexAttribArray(shaderProgram[shaderProgram.attribs[i].name]);
	} */
/*	var newattribs = [];
	for (i=0;i<n;++i) {
		var val = shaderProgram[shaderProgram.attribs[i].name];
		newattribs[val] = true;
	}
	n = Math.max(activeattribs.length,n);
	for (i=0;i<n;++i) {
		if (!activeattribs[i] && newattribs[i]) {
			gl.enableVertexAttribArray(i);
			activeattribs[i] = true;
		} else if (activeattribs[i] && !newattribs[i]) {
			gl.disableVertexAttribArray(i);
			activeattribs[i] = false;
		}
	} */
	
/*    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	if (shaderProgram.textureCoordAttribute !== undefined)
		gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute); */
}

/*function setMatrixPersUniforms(shaderProgram) {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
}
*/
function setMatrixModelViewUniforms(shaderProgram) {
	// test
	//mvMatrix[13] += 20.0;
	// end test
//	mat4.mul(mvMatrix,vMatrix,wMatrix);
//	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix); // model view
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix); // perspective
	if (shaderProgram.v2wMatrix !== undefined) // view to world
		gl.uniformMatrix4fv(shaderProgram.v2wMatrix, false, v2wMatrix); // for env map and shadowmapping
}

function setSamplerUniforms(shaderProgram) {
	for (i=0;i<maxTextures;++i) {
		var samplerName = "uSampler" + i;
		if (shaderProgram[samplerName] !== undefined) {
			gl.uniform1i(shaderProgram[samplerName], i);
		}
	}
//	if (shaderProgram.uSampler0 !== undefined)
//		gl.uniform1i(shaderProgram.uSampler0, 0);
//	if (shaderProgram.uSampler1 !== undefined)
//		gl.uniform1i(shaderProgram.uSampler1, 1);
}

//var shaderProgram = null;

function exitShaders() {
	if (!gl)
		return;
	var i,n = shaderlist.length;
	for (i=0;i<n;++i) {
		shaderProgram = shaderPrograms[shaderlist[i]];
		var sharr = gl.getAttachedShaders(shaderProgram);
		var m = sharr.length;
		var j;
		for (j=0;j<m;++j)
			gl.deleteShader(sharr[j]);
	 	gl.deleteProgram(shaderProgram);
	 	shaderProgram = null;
	 }
	 shaderPrograms = {};
}

function checkglerror(m,ignore) {
	//return;
	//alert("checkglerror");
	//ignore = false;
	// check for gl errors
	if (typeof gl === 'undefined') {
		return;
	}

	if (gl !== null) {
		//alert("gl active");
		//var watch = 10;
		while(true) {
			var err = gl.getError();
			if (err != 0) {
				if (!ignore)
					alert("glerr : " + m + " " + err);
			} else {
				break;
			}
			//--watch;
		}
		//if (watch == 0)
		//	alert("watch == 0!");
	}
}

