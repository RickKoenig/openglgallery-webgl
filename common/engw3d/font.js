////// Model 3d class, one material per model
// try using reference counter
/*
	aname: model name
	fontname: texture name to use a the font 8 by 16 chars
	shadname: shader to use
	cw: model 'x' values between chars, glyph x size, usually 16
	ch: model 'y' values between chars, glyph y size, usually 32
	maxcols: // max columns before either wraping or not drawing
	maxrows: // max rows before not drawing anymore
	wrap: do simple wrap
*/
function ModelFont(aname, fontname, shadname, cw, ch, maxcols, maxrows, wrap) {
// do reference counter now
	var amod = refcountmodellist[aname];
	if (amod) {
		++amod.refcount;
		return amod;
	}

	this.refcount = 1;
	//this.name = aname;
	//this.mat = {}; // uniform materials, all user defined
	this.flags = 0;
	//this.texflags = globaltexflags;
	refcountmodellist[aname] = this;
// reference counter set

	this.name = aname;
	this.mat = {}; // uniform materials, all user defined
	this.isafont = true;
	this.flags = 0;
	this.texturenames = new Array(maxTextures);
	this.reftextures = new Array(maxTextures);
	this.text = "";
	this.shader = shaderPrograms[shadname];
	this.shadername = shadname;
	this.texturenames[0] = fontname;
	this.cw = cw;
	this.ch = ch;
	this.maxrows = maxrows;
	this.maxcols = maxcols;
	this.wrap = wrap;
/*	this.verts = new Float32Array([
		-1.0,  1.0,  0.0,
         1.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0
	]);
	this.uvs = new Float32Array([
		0.0,  0.0,
		1.0,  0.0,
		0.0,  1.0,
		1.0,  1.0,
	]);
	this.faces = new Uint16Array([
    	0,1,2,
    	3,2,1
	]); */
	this.nc = 0; // number of chars printing including \n and space
	this.ng = 0; // number of glyphs printing, just printable chars
	this.ngcap = 0; // number of glyphs alloced, same as max of glyphs printed
	this.reftextures[0] = Texture.createtexture(this.texturenames[0]); 
	this.fudgex = 0;//.025; // fudge in for fonts, helps prevent wrap around effects (stray pixels from next glyph), but loses precise pixel mapping
	this.fudgey = 0;//.025;
}

ModelFont.prototype.setfudge = function(dofudge) {
	if (dofudge) {
		this.fudgex = .025;
		this.fudgey = .025;
	} else {
		this.fudgex = 0;
		this.fudgey = 0;
	}
};

// copy model to gl, commit
ModelFont.prototype.print = function(text) { // commit
	if (this.text == text) {
		return; // nothing to change
	}
	this.text = text.slice(); // make a copy of the text
	var i;
	if (!this.shader)
		alert("missing shader '" + this.shadername + "' on model '" + this.name + "'");
	//if (!this.verts)
	//	alert("missing verts on model '" + this.name + "'");
	this.nc = text.length;
	var numVerts = 0;
	var x = 0;
	var y = 0;
	
    // build tri verts and uvs
	this.verts = new Float32Array(this.nc*12); // 4 vec3's
	this.uvs = new Float32Array(this.nc*8);	// 4 vec2's

	// first parse the string
	for (i=0;i<this.nc;++i) {
		var cc = text.charCodeAt(i);
		if (cc >= 128) { // skip non-printable chars
			continue;
		}
		const visibleSpace = true;
		if (!visibleSpace) {
			if (cc == 32) { // space, invisible, skip over
				++x;
				continue;
			}
		}
		
		if (cc == 10) { // \n, new line
			x = 0;
			++y;
			continue;
		}
		if (x >= this.maxcols) {
			if (this.wrap) { // simple wrap
				x = 0;
				++y;
			} else {
				continue;
			}
		}
		if (y >= this.maxrows) {
			break;
		}
		
		// build verts with uvs
		var r = cc>>3;
		var c = cc&7;
		var u0 = c/8.0 + this.fudgex/8.0;
		var v0 = r/16.0 + this.fudgey/16.0;
		var u1 = (c+1)/8.0-this.fudgex/8.0;
		var v1 = (r+1)/16.0-this.fudgey/16.0;
		this.verts[12*numVerts   ] = this.cw*x;
		this.verts[12*numVerts+ 1] = -this.ch*y;
		this.verts[12*numVerts+ 2] = 0;
		this.verts[12*numVerts+ 3] = this.cw*(x + 1);
		this.verts[12*numVerts+ 4] = -this.ch*y;
		this.verts[12*numVerts+ 5] = 0;
		this.verts[12*numVerts+ 6] = this.cw*x;
		this.verts[12*numVerts+ 7] = -this.ch*(y + 1);
		this.verts[12*numVerts+ 8] = 0;
		this.verts[12*numVerts+ 9] = this.cw*(x + 1);
		this.verts[12*numVerts+10] = -this.ch*(y + 1);
		this.verts[12*numVerts+11] = 0;
		this.uvs[8*numVerts  ] = u0;
		this.uvs[8*numVerts+1] = v0;
		this.uvs[8*numVerts+2] = u1;
		this.uvs[8*numVerts+3] = v0;
		this.uvs[8*numVerts+4] = u0;
		this.uvs[8*numVerts+5] = v1;
		this.uvs[8*numVerts+6] = u1;
		this.uvs[8*numVerts+7] = v1;
		++x;
		++numVerts;
	}
	this.ng = numVerts;
	if (this.glverts) {
		gl.deleteBuffer(this.glverts);
		decnglbuffers();
	}
    this.glverts = gl.createBuffer();
    ++nglbuffers;
    gl.bindBuffer(gl.ARRAY_BUFFER,this.glverts);
    gl.bufferData(gl.ARRAY_BUFFER, this.verts,gl.STATIC_DRAW);
	
	if (this.gluvs) {
		gl.deleteBuffer(this.gluvs);
		decnglbuffers();
	}
	this.gluvs = gl.createBuffer();
    ++nglbuffers;
	gl.bindBuffer(gl.ARRAY_BUFFER,this.gluvs);
	gl.bufferData(gl.ARRAY_BUFFER,this.uvs,gl.STATIC_DRAW);

	 // grow tri faces if necessary
	if (this.ngcap < this.ng) {
		this.faces = new Uint16Array(this.ng*6); // 2 face3's
		for (i=0;i<this.ng;++i) {
			this.faces[6*i  ] = i*4;
			this.faces[6*i+1] = i*4 + 1;
			this.faces[6*i+2] = i*4 + 2;
			this.faces[6*i+3] = i*4 + 3;
			this.faces[6*i+4] = i*4 + 2;
			this.faces[6*i+5] = i*4 + 1;
		}
		if (this.glfaces) {
			gl.deleteBuffer(this.glfaces);
			decnglbuffers();
		}
		this.glfaces = gl.createBuffer();
	    ++nglbuffers;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.glfaces);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.faces,gl.STATIC_DRAW);
		this.ngcap = this.ng;
	}
	
	// check sampler and texture
	if (this.shader.uSampler0 !== undefined && !this.reftextures[0]) {
		alert("missing texture on font '" + this.name + "'  shader '" + this.shader.name + "'");
	}	
};

// draw with gl
ModelFont.prototype.draw = function() {
	if (!this.nc)
		return; // nothing to draw
	if (!this.ng) // no printable characters
		return;
	if (this.flags & modelflagenums.NOZBUFFER)
	    gl.disable(gl.DEPTH_TEST);                               // turn off zbuffer
	if (this.flags & modelflagenums.DOUBLESIDED)
	    gl.disable(gl.CULL_FACE);
	var shaderProgram = this.shader;
	gl.useProgram(shaderProgram);
	setMatrixModelViewUniforms(shaderProgram);
	setAttributes(shaderProgram);
	
	setUserModelUniforms(shaderProgram,this.mat);
	if (curtree)
		setUserModelUniforms(shaderProgram,curtree.mat);
	setUserModelUniforms(shaderProgram,globalmat);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.glverts);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,3,gl.FLOAT, false, 0, 0);

    if (this.gluvs && shaderProgram.textureCoordAttribute !== undefined) {
    	gl.bindBuffer(gl.ARRAY_BUFFER, this.gluvs);
    	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,2,gl.FLOAT, false, 0, 0);
	}
	
	if (this.reftextures[0].gltexture && shaderProgram.uSampler0 !== undefined) {
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.reftextures[0].gltexture);
	}
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.glfaces);
   	gl.drawElements(gl.TRIANGLES,this.ng*6,gl.UNSIGNED_SHORT,0);
 	if (this.flags & modelflagenums.NOZBUFFER)
	    gl.enable(gl.DEPTH_TEST);                               // turn it back on
	if (this.flags & modelflagenums.DOUBLESIDED)
	    gl.enable(gl.CULL_FACE);
	checkglerror("draw font");
};

// free gl resources
ModelFont.prototype.glfree = function() {

// use reference counter	
	--this.refcount;
	if (this.refcount > 0) {
		return;
	}
	if (this.refcount < 0) {
		alert("Model refcount < 0 in '" + this.name + "'");
	}
	delete refcountmodellist[this.name];
// end use reference counter
	
	
	if (this.glverts) {
		gl.deleteBuffer(this.glverts);
		decnglbuffers();
		this.glverts = null;
	}
	if (this.gluvs) {
		gl.deleteBuffer(this.gluvs);
		decnglbuffers();
		this.gluvs = null;
	}
	if (this.glfaces) {
		gl.deleteBuffer(this.glfaces);
		decnglbuffers();
		this.glfaces = null;
	}
	if (this.reftextures[0]) {
		this.reftextures[0].glfree();
		this.reftextures[0] = null;
	}
};

ModelFont.doReference = false; // true: same model, false: different models

ModelFont.prototype.newdup = function() {
	if (ModelFont.doReference) {
		logger("ModelFont newdup reference of " + this.name);
		++this.refcount;
		return this;
	} else {
		logger("ModelFont newdup copy of " + this.name);
		var newname = makeuniq(this.name);
		//var scratchfontmodel = new ModelFont("reffont","font3.png","tex",2*16/glc.clientHeight,2*32/glc.clientHeight,64,8,true);
		var ret = new ModelFont(newname,this.texturenames[0],
		  this.shadername,this.cw,this.ch,
		  this.maxcols,this.maxrows,this.wrap);
		ret.print("copy");
		return ret;
	}
};

ModelFont.prototype.log = function() {
	Model.prototype.log.call(this);
	var txt = this.text;
	// only log the first line
	var idx = txt.indexOf("\n");
	if (idx != -1) {
		txt = txt.substr(0,idx);
	}
	logger("      ModelFont log (" + txt.length + ") = '" + txt + "'  first CR = " + idx + "\n");
};