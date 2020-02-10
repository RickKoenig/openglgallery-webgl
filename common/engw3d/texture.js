var refcounttexturelist = {};
var ngltextures = 0;

// build gl texture from image

// optional 
// twidth,theight : width and height of resultant gltexture, powers of 2
// soffx,soffy : start of image to copy
// swidth,sheight : width and height of image to copy
// iscub, 0-5 face of cubemap, undefined if not used
var lasttexw;
var lasttexh;
var lastorigtexw;
var lastorigtexh;

var globaltexflags = 0;
//var cubtexture;
//var cubface;
var glcmfaceenums;

function image2gltexture(image, cubface,twidth,theight,soffx,soffy,swidth,sheight) {
	checkglerror("tex start -1");
	var texture;
	if (!image) // fallback to a debug texture
		image = defaultimage;
	var bind;
	var isclamped = (globaltexflags & (textureflagenums.CLAMPU|textureflagenums.CLAMPV)) == (textureflagenums.CLAMPU|textureflagenums.CLAMPV); // non power of 2 texture, doesn't use mip map or repeats
	if (cubface !== undefined) {
		texture = -1;//cubtexture;
		if (!glcmfaceenums) {
			glcmfaceenums = [ // make match cubeenums
				gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
				gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
				gl.TEXTURE_CUBE_MAP_POSITIVE_X,
				gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
				gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
				gl.TEXTURE_CUBE_MAP_NEGATIVE_Y
			];
		}
		bind = glcmfaceenums[cubface];
	} else {
		texture = gl.createTexture();
		++ngltextures;
		bind = gl.TEXTURE_2D;
		gl.bindTexture(bind, texture);
	}
	checkglerror("tex start -.5");
	if (twidth !== undefined) { // read a sub part of image into gltexture, manual
		//alert("twidth is defined !!! = " + twidth);
		var spriteCanvas = document.createElement('canvas');
		lastorigtexw = twidth;
		lastorigtexh = theight;
		twidth = makepow2(twidth);
		theight = makepow2(theight);
		spriteCanvas.width = twidth;
		spriteCanvas.height = theight;
		var spriteContext = spriteCanvas.getContext('2d');
		spriteContext.drawImage(image,soffx,soffy,swidth,sheight,0,0,twidth,theight);
	
		gl.texImage2D(bind, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, spriteCanvas);
		lasttexw = twidth;
		lasttexh = theight;
	} else { // read whole texture in, automatic
		var p2w = image.naturalWidth;
		var p2h = image.naturalHeight;
		lastorigtexw = p2w;
		lastorigtexh = p2h;
		if (!isclamped) {
			var p2w = makepow2(p2w);
			var p2h = makepow2(p2h);
		}
		if (p2w != image.naturalWidth || p2h != image.naturalHeight) { // round down to a power of 2
			var spriteCanvas = document.createElement('canvas');
			spriteCanvas.width = p2w;
			spriteCanvas.height = p2h;
			var spriteContext = spriteCanvas.getContext('2d');
			spriteContext.drawImage(image,0,0,image.naturalWidth,image.naturalHeight,0,0,p2w,p2h);
		
			gl.texImage2D(bind, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, spriteCanvas);
		} else {
			gl.texImage2D(bind, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		}
		lasttexw = p2w;
		lasttexh = p2h;
		
	}
	if (cubface === undefined) {
		checkglerror("tex start");
	    // regular texture filtering
	    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		checkglerror("tex start 2");
		//isclamped = true; // turn off mip mapping
		if (isclamped)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);//NEAREST);//NEAREST_MIPMAP_LINEAR);
		else
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);//NEAREST);//NEAREST_MIPMAP_LINEAR);
		checkglerror("tex start 3");
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		checkglerror("tex start 4");
	    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.GL_MIPLINEAR_NEARLINEAR);
		//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		if (globaltexflags & textureflagenums.CLAMPU)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		if (globaltexflags & textureflagenums.CLAMPV)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		if (!isclamped)
			gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		checkglerror("tex end");
	}
	return texture;
}

///// texture class
// reference counted

// for skybox, locations on a 4 by 3 texture
var cubeenums = {
	"POSZ":[1,1],
	"NEGZ":[3,1],
	"POSX":[2,1],
	"NEGX":[0,1],
	"POSY":[1,0],
	"NEGY":[1,2]
};

var textureflagenums = {
// globaltexture
	"CLAMPU":0x100,
	"CLAMPV":0x200,
	"NOFLOAT":0x400, // don't use float textures for render target, even if it exists
};

/*var cubelocs = [
	[3,1],
	[1,1],
	[2,1],
	[0,1],
	[1,0],
	[1,2],
];
*/
function Texture(aname) {
	checkglerror("tex start -2");
	this.refcount = 1;
	this.name = aname;
	var sname = aname;
	var cmidx = aname.indexOf("CUB_");
	var animage;
// build up all of the cubmap
	if (cmidx == 0) { // cubemap prefix 'CUB_', build a cubemap texture
		this.gltexture = gl.createTexture();
		this.iscubemap = true;
		++ngltextures;
		gl.bindTexture(gl.TEXTURE_CUBE_MAP,this.gltexture);
		sname = aname.substr(4); // remove 'CUB_'
		var keys = Object.keys(cubeenums);
		var cubface;
		for (i=0;i<keys.length;++i) {
			var cf = keys[i] + "_" + sname + ".jpg"; // name of face to look for
			animage = preloadedimages[sname];
			cubface = i;
			if (animage) { // cross, names like 'cube2.jpg'
				var key = keys[i];
				var cl = cubeenums[key];
				var w = animage.naturalWidth;
				var h = animage.naturalHeight;
				image2gltexture(animage,cubface,
					w/4,h/3,
					w*cl[0]/4,h*cl[1]/3,
					w/4,h/3);
			} else { // 6 pics that came from a folder, names like 'POSX_aname.jpg'
				animage = preloadedimages[cf];
				image2gltexture(animage,cubface);
			}
			cubface = undefined;
			//cubtexture = undefined;
		}
		// cubemap texture filtering
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		//gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		//gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		//if (globaltexflags & textureflagenums.CLAMPU)
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		//if (globaltexflags & textureflagenums.CLAMPV)
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP,null);
		refcounttexturelist[aname] = this;
		this.hasalpha = animage.hasalpha;
		this.width = lasttexw;
		this.height = lasttexh;
		this.origwidth = lastorigtexw;
		this.origheight = lastorigtexh;
		return;
	}
	
	this.iscubemap = false;
// build normal or part of skybox
	animage = preloadedimages[sname];
/*	if (!animage) {
		alert("animage == null");
	} */
	if (!animage) {
		var keys = Object.keys(cubeenums); // check for skybox prefixes like 'POSX_'
		var i;	
		var cubidx;
		for (i=0;i<keys.length;++i) {
			var key = keys[i];
			//var val = cubeenums[key];
			var idx = aname.indexOf(key + "_");
			if (idx == 0) {
				cubidx = key;
				sname = aname.substr(5);
				break;
			}
			//logger(" key = '" + key + "', val = '" + val + "'\n");
		}
	}

	animage = preloadedimages[sname];
	if (!animage) {
		alert("animage of " + sname + " is null");
	}
	var w = animage.naturalWidth;
	var h = animage.naturalHeight;
	if (cubidx !== undefined) { // skybox, load a piece from the 'cross'
		var cl = cubeenums[key];
		this.gltexture = image2gltexture(animage,undefined,
			w/4,h/3,
			w*cl[0]/4,h*cl[1]/3,
			w/4,h/3);
	} else { // normal
		this.gltexture = image2gltexture(animage);
	}
	this.width = lasttexw;
	this.height = lasttexh;
	this.origwidth = lastorigtexw;
	this.origheight = lastorigtexh;
/*	this.gltexture = image2gltexture(animage,64,64,
		0,animage.naturalHeight/2,
		animage.naturalWidth/2,animage.naturalHeight/2); */
	refcounttexturelist[aname] = this;
	this.hasalpha = animage.hasalpha;
}

Texture.createtexture = function(aname) {
	//if (!aname) // undefined
	//	return; // undefined
	var atex = refcounttexturelist[aname];
	if (atex) {
		++atex.refcount;
	} else {
		atex = new Texture(aname);
	}
	return atex;
};

var totalpixels = 0;
function texturerc() {
	logger("Texturelist =====  has one font texture left over after free for loading font and one for debprint\n");
	totalpixels = 0;
	var totaltextures = 0;
	var largest = 0;
	var largestname = "---";
    for (var texname in refcounttexturelist) {
        if (refcounttexturelist.hasOwnProperty(texname)) {
        	var texref = refcounttexturelist[texname];
        	if (texref.hasalpha)
        		var texlog = "  Atex '" + texref.name + "'";
			else
				var texlog = "   tex '" + texref.name + "'";
        	texlog += " refcount " + texref.refcount;
        	var cubemult = 1;
        	if (texref.iscubemap) {
        		texlog += " CM 6";
        		cubemult = 6;
        	}
        	if (texref.framebuffer) {
        		texlog += " FB";
        	}
        	texlog += " w " + texref.width + " h " + texref.height;
        	texlog += " ow " + texref.origwidth + " oh " + texref.origheight;
        	var prod = texref.width*texref.height*cubemult;
        	texlog += " p " + prod;
        	totalpixels += prod;
        	//logger("   tex = '" + texref.name + "' refcount = " + texref.refcount + "\n");
	        logger(texlog + "\n");
	        ++totaltextures;
	        if (prod > largest) {
	        	largest = prod;
	        	largestname = texref.name;
	        }
        }
    }
    logger("totaltextures " + totaltextures + " totalpixels " + totalpixels + " largest '" + largestname + "'\n");
}

function decngltextures() {
	--ngltextures;
	if (ngltextures == 0)
		logger("ngltextures now at = 0\n");
	if (ngltextures < 0)
		alert("ngltextures < 0\n");
}

Texture.prototype.glfree = function() {
	--this.refcount;
	if (this.refcount > 0) {
		return;
	}
	if (this.refcount < 0) {
		alert("Texture refcount < 0 in '" + this.name + "'");
	}
	delete refcounttexturelist[this.name];
	gl.deleteTexture(this.gltexture);
	decngltextures();
	this.gltexture = null;
};


// DataTexture class

// user generated texture, can use
// aname,width,height,data = Uint32Array   OR
// aname,width,height,data = Uint8Array   OR
// aname,width,height,data = Uint8ClampedArray NOT !!!, doesn't work   OR
// aname,canvas
function DataTexture(aname,wid,hit,data) {
	var numbits = 0;
	var c = null; // <canvas>
	
	if (data instanceof Uint32Array) {
		numbits = 32;
	} else if (data instanceof Uint8Array) {
		numbits = 8;
//	else if (data instanceof Uint8ClampedArray) // doesn't work
//		numbits = 8;
	} else if (wid.size && wid.size.x) { // maybe wid is a Bitmap32 object
		var bm32 = wid; // it's a Bitmap32
		numbits = 32;
		wid = bm32.size.x;
		hit = bm32.size.y;
		data = bm32.data;
		
	} else { // assume wid is canvas
		c = wid;
		wid = c.width;
		hit = c.height;
	}
	
	var gltex = gl.createTexture();
	++ngltextures;
	
	// start configure texture
    gl.bindTexture(gl.TEXTURE_2D, gltex);
	// data texture filtering
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	// no mipmap and can do non powers of 2
	//if (globaltexflags & textureflagenums.CLAMPU)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	//if (globaltexflags & textureflagenums.CLAMPV)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	// done configure texture
	
	if (numbits == 32) {
		// finagle(convert) a Uint32Array to an Uint8Array
		var outputABuffer = new ArrayBuffer(data.length * 4);
		var input32Array = new Uint32Array(outputABuffer);
		input32Array.set(data);
		var output8Array= new Uint8Array(outputABuffer);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, wid, hit, 0, gl.RGBA, gl.UNSIGNED_BYTE, output8Array);
	} else if (numbits == 8) {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, wid, hit, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
	} else if (c) {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
	} else {
		alert("DataTexture wrong numbits and no <canvas>" + numbits);
	}
    gl.bindTexture(gl.TEXTURE_2D, null);
	checkglerror("DataTexture constructor");
    //gl.generateMipmap(gl.TEXTURE_2D);
	this.name = aname;
	this.width = wid;
	this.height = hit;
	this.origwidth = wid;
	this.origheight = hit;
	this.hasalpha = false;
	this.iscubemap = false;
	this.gltexture = gltex;
	this.refcount = 1;
	refcounttexturelist[aname] = this;
}

DataTexture.createtexture = function(aname,wid,hit,data) {
	var atex = refcounttexturelist[aname];
	if (atex) {
		++atex.refcount;
	} else {
		atex = new DataTexture(aname,wid,hit,data);
	}
	return atex;
};

DataTexture.prototype.updateData = function(bm32) {
	if (bm32.size && bm32.size.x) { // maybe wid is a Bitmap32 object
		var numbits = 32;
		var wid = bm32.size.x;
		var hit = bm32.size.y;
		var data = bm32.data;
		// finagle(convert) a Uint32Array to an Uint8Array
		var outputABuffer = new ArrayBuffer(data.length * 4);
		var input32Array = new Uint32Array(outputABuffer);
		input32Array.set(data);
		var output8Array= new Uint8Array(outputABuffer);
		gl.bindTexture(gl.TEXTURE_2D, this.gltexture);
/*		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, wid, hit, 0, gl.RGBA, gl.UNSIGNED_BYTE, output8Array);
*/
		gl.texSubImage2D(gl.TEXTURE_2D, 0,0,0, wid, hit, gl.RGBA, gl.UNSIGNED_BYTE, output8Array);
		gl.bindTexture(gl.TEXTURE_2D, null);

	} else {
		alert("DataTexture.updateData, not a Bitmap32 !");
	}

}

DataTexture.prototype.glfree = function() {
	--this.refcount;
	if (this.refcount > 0) {
		return;
	}
	if (this.refcount < 0) {
		alert("DataTexture refcount < 0 in '" + this.name + "'");
	}
	delete refcounttexturelist[this.name];
	gl.deleteTexture(this.gltexture);
	decngltextures();
	this.gltexture = null;
};


// FrameBufferTexture class

function FrameBufferTexture(aname,wid,hit) {
	var gltex = gl.createTexture();
	++ngltextures;
    gl.bindTexture(gl.TEXTURE_2D, gltex);
	// frame buffer texture filtering
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
	var extensions = gl.getSupportedExtensions();
	var ext1 = gl.getExtension("OES_texture_float"); 
	if (!ext1) {
		//alert("no float textures");
		logger("no float textures");
	}
	//ext1 = false; // degrade from float to int textures
	var ext2 = gl.getExtension("OES_texture_float_linear"); 
	if (!ext2) {
		//alert("no float textures with linear filtering");
		logger("no float textures with linear filtering");
	}
	if (globaltexflags & textureflagenums.NOFLOAT) {
		logger("don't use float textures");
		ext1 = false;
	}
    if (ext1)
    	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,wid,hit,0,gl.RGBA,gl.FLOAT,null);
    else
    	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,wid,hit,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    //gl.generateMipmap(gl.TEXTURE_2D);
	this.name = aname;
	this.width = wid;
	this.height = hit;
	this.hasalpha = false;
	this.iscubemap = false;
	this.gltexture = gltex;
	this.refcount = 1;
	
	// create frame buffer
	this.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER,this.framebuffer);
	// create zbuffer
	this.renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER,this.renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,wid,hit); // zbuffer
	// attach texture and zbuffer
	gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,this.gltexture,0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,this.renderbuffer);
	// unbind
	gl.bindTexture(gl.TEXTURE_2D,null);
    gl.bindRenderbuffer(gl.RENDERBUFFER,null);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
	// list
	refcounttexturelist[aname] = this;
}

FrameBufferTexture.createtexture = function(aname,wid,hit) {
	var aftex = refcounttexturelist[aname];
	if (aftex) {
		++aftex.refcount;
	} else {
		aftex = new FrameBufferTexture(aname,wid,hit);
	}
	return aftex;
};

FrameBufferTexture.prototype.resize = function(nX,nY) {
	//defaulttarget = null; // reset render target
	var oX = this.width;
	var oY = this.height;
	if (oX == nX && oY == nY) {
		logger("FrameBufferTexture.prototype.resize, same size " + oX + " " + oY + "\n");
		return;
	}
	logger("FrameBufferTexture.prototype.resize, old " + oX + " " + oY + ", new " + nX + " " + nY + "\n");


	// delete old
	gl.deleteRenderbuffer(this.renderbuffer);
	this.renderbuffer = null;
	gl.deleteFramebuffer(this.framebuffer);
	this.framebuffer = null;
	
	// create new
    gl.bindTexture(gl.TEXTURE_2D, this.gltexture);
	var wid = nX;
	var hit = nY;
	var extensions = gl.getSupportedExtensions();
	var ext1 = gl.getExtension("OES_texture_float"); 
	if (!ext1) {
		//alert("no float textures");
		logger("no float textures");
	}
	//ext1 = false; // degrade from float to int textures
	var ext2 = gl.getExtension("OES_texture_float_linear"); 
	if (!ext2) {
		//alert("no float textures with linear filtering");
		logger("no float textures with linear filtering");
	}
	if (globaltexflags & textureflagenums.NOFLOAT) {
		logger("don't use float textures");
		ext1 = false;
	}
    if (ext1)
    	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,wid,hit,0,gl.RGBA,gl.FLOAT,null);
    else
    	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,wid,hit,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
	
	this.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER,this.framebuffer);
	// create zbuffer
	this.renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER,this.renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,wid,hit); // zbuffer
	// attach texture and zbuffer
	gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,this.gltexture,0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,this.renderbuffer);
	// unbind
	gl.bindTexture(gl.TEXTURE_2D,null);
    gl.bindRenderbuffer(gl.RENDERBUFFER,null);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);

	
	this.width = nX;
	this.height = nY;

};

FrameBufferTexture.prototype.glfree = function() {
	--this.refcount;
	if (this.refcount > 0) {
		return;
	}
	if (this.refcount < 0) {
		alert("FrameBufferTexture refcount < 0 in '" + this.name + "'");
	}
	delete refcounttexturelist[this.name];
	gl.deleteTexture(this.gltexture);
	decngltextures();
	this.gltexture = null;
	gl.deleteRenderbuffer(this.renderbuffer);
	this.renderbuffer = null;
	gl.deleteFramebuffer(this.framebuffer);
	this.framebuffer = null;
};

FrameBufferTexture.useframebuffer = function(texfb) {
	if (texfb)
		gl.bindFramebuffer(gl.FRAMEBUFFER,texfb.framebuffer);
	else
		gl.bindFramebuffer(gl.FRAMEBUFFER,null);
};

