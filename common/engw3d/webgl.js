var gl; // the main interface
var glc; // canvas to make webgl
var gllores = 1; // lower resolution on a given canvas, the lower the number the faster the fragment shaders will be
var dowebgl = true;
var maxTextures = 16;
var webglVersion = 0;
var mainvp;
// list of all shaders
var shaderlist;
var globalmat = {
	alphacutoff:.03125,
	specpow:500
};

const verbose = false;

function loggerV(str) {
	if (verbose) {
		logger(str);
	}
}

function gl_resize() {
	glc.width = glc.clientWidth * gllores;
	glc.height = glc.clientHeight * gllores;
     // set asp
	glc.asp = glc.clientWidth/glc.clientHeight;
	// set gl viewport
	//var xo = 0;
	//var yo = 0;
	var xs = 1;
	var ys = 1;
	if (window.mainvp) {
		mainvp.asp = glc.asp;
		//xo = mainvp.xo;
		//yo = mainvp.yo;
		xs = mainvp.xs;
		ys = mainvp.ys;
	}
	gl.viewport(0, 0, xs*gl.drawingBufferWidth, ys*gl.drawingBufferHeight);
	//gl.viewport(xo*gl.drawingBufferWidth, yo*gl.drawingBufferHeight, xs*gl.drawingBufferWidth, ys*gl.drawingBufferHeight);
}

function gl_preinit() {
	logger("gl_preinit\n");
	checkglerror("start gl_preinit()");
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
	doURLParams();
	// get a webgl context (gl)
	if (dowebgl) {
		try {
			// Try to grab the new 'webgl2' context.
			if (!gl && URLparams.webglversion != 1) {
				gl = glc.getContext("webgl2",glattr);
				if (gl) {
					logger("context = webgl2\n");
					webglVersion = 2;
				}
			} 
			
			// Try to grab the standard 'webgl' context.
			if (!gl) {
				gl = glc.getContext("webgl",glattr);
				if (gl) {
					logger("context = webgl\n");
					webglVersion = 1;
				}
			}
			
			// Try to get the experimental-webgl context.
			if (!gl) {
				gl = glc.getContext("experimental-webgl",glattr);
				if (gl) {
					logger("context = experimental-webgl\n");
					webglVersion = 1;
				}
			}
		}
		catch(e) {
			logger("err gl context\n");
		}
	}
}

function gl_init() {
	logger("gl_init\n");
	checkglerror("start gl_init()");
	// If we don't have a GL context, give up now
	checkglerror("tried to get some webgl");
	if (!gl) {
		logger("no webgl\n");
		var ctx=glc.getContext("2d");
        glc.width = glc.clientWidth;
        glc.height = glc.clientHeight;
		ctx.font="20px Arial";
		ctx.fillText("Your browser doesn't support WebGL.",20,40);
		var instele = document.getElementById('instructions');
		if (instele)
			instele.innerHTML = 'GET WEBGL ' +
			'<a href="http://get.webgl.org"> HERE</a>.';
		return;
	}

	logger("yes some webgl\n");
	glc.extraHeight = 1;
	glc.extraWidth = 1;
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
	if (webglVersion == 1)
		var dxdy = gl.getExtension("OES_standard_derivatives"); 
	initShaders();
	gl.frontFace(gl.CW);
	gl.cullFace(gl.BACK);
	gl.enable(gl.CULL_FACE);
	
	mainvp = defaultviewport();
	checkglerror("after gl_init()");
}

function gl_exit() {
	exitShaders();
}

var shaderPrograms = {};
var shadershadowmapbuild = null;
var shadershadowmapbuildnotex = null;

function getShader2v(gl,id) {
    var str = preloadedtext[id];
	if (webglVersion == 1 && str.startsWith("#version 3")) {
		logger("shader version is too advanced for webgl 1.0 for shader " + id + " reverting to 'tex'");
		return null;
	}
	if (!str)
		return null;
    var shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(shader,str);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		var err = "VERTEX SHADER ERROR '" + id + "' " + gl.getShaderInfoLog(shader);
        alert(err);
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
		var err = "PIXEL SHADER ERROR '" + id + "' " + gl.getShaderInfoLog(shader);
        alert(err);
        return null;
    }
    return shader;
}

function preloadShaders() {
	var i,n = shaderlist.length;
	for (i=0;i<n;++i) {
		var shadName = shaderlist[i];
		var isV2 = shadName.startsWith("V2");
		if (isV2) {
			// remove V2 prefix from shader and if webglVersion == 2 use V2 directory
			shadName = shadName.slice(2);
			shaderlist[i] = shadName; // put back shader name into the list without the V2 prefix
		}
		if (webglVersion == 2 && isV2) {
			preloadtext("shaders/V2/" + shadName + ".vert.glsl");
			preloadtext("shaders/V2/" + shadName + ".frag.glsl");
		} else {
			preloadtext("shaders/" + shadName + ".vert.glsl");
			preloadtext("shaders/" + shadName + ".frag.glsl");
		}
	}
}

function initShaders() {
	var i,j,n = shaderlist.length;
	logger("init shaders");
	for (j=0;j<n;++j) {
		var shadName = shaderlist[j];
	    var vertexShader = getShader2v(gl, shadName + ".vert.glsl");
		if (!vertexShader) {
			continue;
		}
	    var fragmentShader = getShader2p(gl, shadName + ".frag.glsl");
		if (!fragmentShader) {
			continue;
		}
	
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
			shaderProgram.actunifs[au.name] = au;
		}
		
		shaderProgram.nattrib = gl.getProgramParameter(shaderProgram,gl.ACTIVE_ATTRIBUTES);
		loggerV("======== shader name = " + shaderProgram.name);
		var decAtt = 0;
		for (i=0;i<shaderProgram.nattrib;++i) {
			var aa = gl.getActiveAttrib(shaderProgram,i);
			loggerV("shader attribute = " + aa.name);
			if (aa.name == "gl_InstanceID") { // built in attribute should not be included in the list of attributes
				loggerV("########## skipping built in attribute " + aa.name);
				++decAtt;
			} else if (aa.name == "gl_VertexID") { // built in attribute should not be included in the list of attributes
				loggerV("########## skipping built in attribute " + aa.name);
				++decAtt;
			} else {
				shaderProgram[aa.name] = gl.getAttribLocation(shaderProgram,aa.name);
			}
		}
		if (decAtt > 0)
			shaderProgram.nattrib -= decAtt;
	    gl.useProgram(shaderProgram);
		setSamplerUniforms(shaderProgram);
		shaderPrograms[shadName] = shaderProgram;
		if (shaderProgram.name == "shadowmapbuild")
			shadershadowmapbuild = shaderProgram;
		if (shaderProgram.name == "shadowmapbuildnotex")
			shadershadowmapbuildnotex = shaderProgram;
	}
}

var mvMatrix = mat4.create(); // model view matrix, o2v, used in shaders, mvMatrix = vMatrix * wMatrix
var mvMatrixNoScale = mat4.create(); // don't scale children by parent scale
var pMatrix = mat4.create(); // perspective matrix, v2c, used in shaders
var v2wMatrix = mat4.create(); // eye to world, used by envmap
globalmat.LvMatrix = mat4.create();
globalmat.LpMatrix = mat4.create();
// mv = v * w
// ends up being p * mv = p * v * w

var nactiveattribs = 0;
// enable only the ones we need
function setAttributes(shaderProgram) {
	var i,n = shaderProgram.nattrib;
	// assume attribs count from 0
	if (n > nactiveattribs) {
		for (i=nactiveattribs;i<n;++i) {
			gl.enableVertexAttribArray(i);
		}
	} else if (n < nactiveattribs) {
		for (i=n;i<nactiveattribs;++i) {
			gl.disableVertexAttribArray(i);	
		}
	}
	nactiveattribs = n;
}

function setMatrixModelViewUniforms(shaderProgram) {
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix); // model view
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix); // perspective
	if (shaderProgram.v2wMatrix !== undefined) { // view to world
		gl.uniformMatrix4fv(shaderProgram.v2wMatrix, false, v2wMatrix); // for env map and shadowmapping
	}
}

function setSamplerUniforms(shaderProgram) {
	for (i=0;i<maxTextures;++i) {
		var samplerName = "uSampler" + i;
		if (shaderProgram[samplerName] !== undefined) {
			gl.uniform1i(shaderProgram[samplerName], i);
		}
	}
}

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

function checkglerror(mess) {
	if (!gl) {
		return;
	}
	const ignore = false;
	if (ignore) {
		return;
	}
	// check for gl errors
	let watch = 10;
	while(watch > 0) {
		const err = gl.getError();
		if (err) {
			alertS("glerr : " + mess + " " + err);
		} else {
			break;
		}
		--watch;
	}
	if (watch <= 0) {
		alertS("watch == 0!");
	}
}
