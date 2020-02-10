var modelflagenums = {
// model
	NOZBUFFER:0x1,
	HASALPHA:0x2,
	ISSKYBOX:0x10, // puts object at location eye space 0,0,0
    DOUBLESIDED:0x20,
};

var refcountmodellist = {};
var nglbuffers = 0;

//var inshadowmapbuild = false;
var curtree = null;
var totalverts = 0;
var totalfaces = 0;

function logrc() {
	modelrc();
	texturerc();
	logger("num gl face,vert,uv etc. handles left (6) >= " + nglbuffers + ", num gl tex handles left (1) >= " + ngltextures + "\n");
}

function modelrc() {
	logger("Modellist ===== has one model left over after free for loading font and one for debprint font\n");
	totalverts = 0;
	totalfaces = 0;
	var totalmodels = 0;
	var largest = 0;
	var largestname = "---";
    for (var modname in refcountmodellist) {
        if (refcountmodellist.hasOwnProperty(modname)) {
        	var modref = refcountmodellist[modname];
        	modref.log();
        	++totalmodels;
	        if (modref.verts) {
				var nv = modref.verts.length;
				if (nv > largest) {
					largest = nv;
					largestname = modref.name;
				}
			}
        }
    }
    logger("totalmodels " + totalmodels + " totalverts " + totalverts + " totalfaces " + totalfaces + " largest '" + largestname + "'\n");
}

////// Model 3d class, one material per model
// reference counted

function Model(aname) {
	this.refcount = 1;
	this.name = aname;
	this.mat = {}; // uniform materials, all user defined
	this.flags = 0;
	this.texturenames = new Array(maxTextures);
	this.reftextures = new Array(maxTextures);
	//this.texflags = globaltexflags;
	refcountmodellist[aname] = this;
}

Model.createmodel = function(aname) {
	var amod = refcountmodellist[aname];
	if (amod) {
		++amod.refcount;
	} else {
		amod = new Model(aname);
	}
	return amod;
};

// set model verts (3 floats each)
Model.prototype.setverts = function(verts) {
	//if (verts.length%3)
	//	alert("verts array not a multiple of 3 on model '" + this.name + "' length " + verts.length);
	this.verts = mesharray2vert(verts,3);
	if (!this.verts)
		alert("verts array not good on model '" + this.name + "' length " + verts.length);
	//this.nvert = verts.length;
};

// set model norms (3 floats each)
Model.prototype.setnorms = function(norms) {
	//if (norms.length%3)
	//	alert("norms array not a multiple of 3 on model '" + this.name + "' length " + norms.length);
	this.norms = mesharray2vert(norms,3);
	if (!this.norms)
		alert("norms array not good on model '" + this.name + "' length " + norms.length);
	if (this.norms.length != this.verts.length)
		alert("vert norm mismatch on model '" + this.name + "'");
};

// set model uvs (2 floats each)
Model.prototype.setuvs = function(uvs) {
	this.uvs = mesharray2vert(uvs,2);
	if (!this.uvs)
		alert("uvs array not good on model '" + this.name + "' length " + uvs.length);
	if (this.uvs.length != this.verts.length)
		alert("vert uv mismatch on model '" + this.name + "'");
};

Model.prototype.setuvs2 = function(uvs) {
	this.uvs2 = mesharray2vert(uvs,2);
	if (!this.uvs2)
		alert("uvs2 array not good on model '" + this.name + "' length " + uvs2.length);
	if (this.uvs2.length != this.verts.length)
		alert("vert uv2 mismatch on model '" + this.name + "'");
};

// set model cverts (4 floats each)
Model.prototype.setcverts = function(cverts) {
	this.cverts = mesharray2vert(cverts,4);
	if (!this.cverts)
		alert("cverts array not good on model '" + this.name + "' length " + cverts.length);
	if (this.cverts.length != this.verts.length)
		alert("vert cvert mismatch on model '" + this.name + "'");
};

// set model faces (1 int each)
Model.prototype.setfaces = function(faces) {
	//if (faces.length%3)
	//	alert("faces array not a multiple of 3 on model '" + this.name + "' length " + faces.length);
	this.faces = mesharray2face(faces,3);
	if (!this.faces)
		alert("faces array not good on model '" + this.name + "' length " + faces.length);
	//this.nface = faces.length/3;
};

// set model mesh
Model.prototype.setmesh = function(mesh) {
	if (mesh.verts)
		this.setverts(mesh.verts);
	if (mesh.norms)
		this.setnorms(mesh.norms);
	if (mesh.uvs)
		this.setuvs(mesh.uvs);
	if (mesh.uvs2)
		this.setuvs2(mesh.uvs2);
	if (mesh.cverts)
		this.setcverts(mesh.cverts);
	if (mesh.faces)
		this.setfaces(mesh.faces);
};

// set model shader
Model.prototype.setshader = function(shadername) {
	this.shadername = shadername;
	this.shader = shaderPrograms[shadername];
};

// set model texture 0
Model.prototype.settexture = function(texturename) {
	this.texturenames[0] = texturename;
};

// set model texture 1
Model.prototype.settexture2 = function(texturename) {
	this.texturenames[1] = texturename;
};

// set model texture N
Model.prototype.settextureN = function(texturename,n) {
	this.texturenames[n] = texturename;
};

// set model texture Array 0 - N-1
Model.prototype.settextureNArray = function(textureNameArray) {
	for (var i=0;i<textureNameArray.length;++i)
		this.texturenames[i] = textureNameArray[i];
};

// copy model to gl
Model.prototype.commit = function() {
	if (!this.shader)
		alert("missing shader '" + this.shadername + "' on model '" + this.name + "'");
	if (!this.verts)
		alert("missing verts on model '" + this.name + "'");
	if (this.glverts)
		alert("can only commit once on model '" + this.name + "'");
		
    // build tri vertex buffer
   	this.glverts = gl.createBuffer();
    ++nglbuffers;
    gl.bindBuffer(gl.ARRAY_BUFFER,this.glverts);
    var arrverts = meshvert2array(this.verts,3);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrverts),gl.STATIC_DRAW);
    
	// build tri norms
	if (this.shader.normalAttribute !== undefined) {
		if (this.norms) {
			this.glnorms = gl.createBuffer();
		    ++nglbuffers;
			gl.bindBuffer(gl.ARRAY_BUFFER,this.glnorms);
			var arrnorms = meshvert2array(this.norms,3);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrnorms),gl.STATIC_DRAW);
		} else {
			alert("missing norms on model '" + this.name + "'  shader '" + this.shader.name + "'");
		}
	}	
	
	// build tri cverts
	if (this.shader.colorAttribute !== undefined) {
		if (this.cverts) {
			this.glcverts = gl.createBuffer();
		    ++nglbuffers;
			gl.bindBuffer(gl.ARRAY_BUFFER,this.glcverts);
			var arrcverts = meshvert2array(this.cverts,4);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrcverts),gl.STATIC_DRAW);
		} else {
			alert("missing cverts on model '" + this.name + "'  shader '" + this.shader.name + "'");
		}
	}
	
	// build tri uvs
	if (this.shader.textureCoordAttribute !== undefined) {
		if (this.uvs) {
			this.gluvs = gl.createBuffer();
		    ++nglbuffers;
			gl.bindBuffer(gl.ARRAY_BUFFER,this.gluvs);
			var arruvs = meshvert2array(this.uvs,2);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arruvs),gl.STATIC_DRAW);
		} else {
			alert("missing uvs on model '" + this.name + "'  shader '" + this.shader.name + "'");
		}	
	}
	
	// build tri uvs2
	if (this.shader.textureCoordAttribute2 !== undefined) {
		if (this.uvs2) {
			this.gluvs2 = gl.createBuffer();
		    ++nglbuffers; // ++nglbuffers2
			gl.bindBuffer(gl.ARRAY_BUFFER,this.gluvs2);
			var arruvs2 = meshvert2array(this.uvs2,2);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arruvs2),gl.STATIC_DRAW);
		} else {
			alert("missing uvs2 on model '" + this.name + "'  shader '" + this.shader.name + "'");
		}	
	}

	// build tri faces
	if (this.faces) {
		if (!this.glfaces) {
			this.glfaces = gl.createBuffer();
		    ++nglbuffers;
		}
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.glfaces);
		var arrfaces = meshface2array(this.faces,3);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arrfaces),gl.STATIC_DRAW);
//		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.faces),gl.STATIC_DRAW);
	} else if (this.verts.length%3) {
		alert("no faces and verts not a multiple of 3 on model '" + this.name + "'");
	}
	
	// build textureN
	//this.hasalpha = false;
	for(var i = 0;i < maxTextures;++i) {
		if (this.shader["uSampler" + i] !== undefined) {
			if (this.texturenames[i]) {
				this.reftextures[i] = Texture.createtexture(this.texturenames[i]); 
				if (i == 0) {
					if (this.reftextures[i] && this.reftextures[i].hasalpha)
						//this.hasalpha = true;
						this.flags |= modelflagenums.HASALPHA;
				}
			} else {
				alert("missing texture" + i + " '" + this.texturenames[i] + "' on model '" + this.name + "'  shader '" + this.shader.name + "'");
			}
		}
	}
	/*
	// build texture0
	//this.hasalpha = false;
	if (this.shader.uSampler0 !== undefined) {
		if (this.texturenames[0]) {
			this.reftextures[0] = Texture.createtexture(this.texturenames[0]); 
			if (this.reftextures[0] && this.reftextures[0].hasalpha)
				//this.hasalpha = true;
				this.flags |= modelflagenums.HASALPHA;
		} else {
			alert("missing texture0 '" + this.texturenames[0] + "' on model '" + this.name + "'  shader '" + this.shader.name + "'");
		}
	}
	
	// build texture1
	if (this.shader.uSampler1 !== undefined) {
		if (this.texturenames[1]) {
			this.reftextures[1] = Texture.createtexture(this.texturenames[1]); 
			if (this.reftextures[1] && this.reftextures[1].hasalpha)
				//this.hasalpha = true;
				this.flags |= modelflagenums.HASALPHA;
		} else {
			alert("missing texture1 '" + this.texturenames[1] + "' on model '" + this.name + "'  shader '" + this.shader.name + "'");
		}
	}*/
	setbbox(this);
};

// change model mesh
Model.prototype.changemesh = function(newmesh) {
	if (newmesh.verts) {
		this.setverts(newmesh.verts);
		//gl.deleteBuffer(this.glverts);
		//decnglbuffers();
	   	//this.glverts = gl.createBuffer();
	    //++nglbuffers;
	    gl.bindBuffer(gl.ARRAY_BUFFER,this.glverts);
	    var arrverts = meshvert2array(this.verts,3);
	    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrverts),gl.STATIC_DRAW);
	}
	if (newmesh.norms) {
		this.setnorms(newmesh.norms);
		if (this.shader.normalAttribute !== undefined && this.glnorms) {
			//gl.deleteBuffer(this.glnorms);
			//decnglbuffers();
			//this.glnorms = gl.createBuffer();
		    //++nglbuffers;
			gl.bindBuffer(gl.ARRAY_BUFFER,this.glnorms);
			var arrnorms = meshvert2array(this.norms,3);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrnorms),gl.STATIC_DRAW);
		}	
	}
	if (newmesh.uvs) {
		this.setuvs(newmesh.uvs);
		if (this.shader.textureCoordAttribute !== undefined && this.gluvs) {
			//gl.deleteBuffer(this.gluvs);
			//decnglbuffers();
			//this.gluvs = gl.createBuffer();
		    //++nglbuffers;
			gl.bindBuffer(gl.ARRAY_BUFFER,this.gluvs);
			var arruvs = meshvert2array(this.uvs,2);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arruvs),gl.STATIC_DRAW);
		}
	}
	if (newmesh.cverts) {
		this.setcverts(newmesh.cverts);
		if (this.shader.colorAttribute !== undefined && this.glcverts) {
			//gl.deleteBuffer(this.glcverts);
			//decnglbuffers();
			//this.glcverts = gl.createBuffer();
		    //++nglbuffers;
			gl.bindBuffer(gl.ARRAY_BUFFER,this.glcverts);
			var arrcverts = meshvert2array(this.cverts,4);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrcverts),gl.STATIC_DRAW);
		}
	}
	setbbox(this);
};

// change model textureN
Model.prototype.changetextureN = function(newname,i) {
	this.texturenames[i] = newname;
	//this.hasalpha = false;
	this.flags &= ~modelflagenums.HASALPHA;
	if (this.shader["uSampler" + i] !== undefined && this.reftextures[i]) {
		this.reftextures[i].glfree();
		this.reftextures[i] = Texture.createtexture(this.texturenames[i]); 
		if (this.reftextures[i] && this.reftextures[i].hasalpha) {
			//this.hasalpha = true;
			this.flags |= modelflagenums.HASALPHA;
		}
	}
};

// change model texture0
Model.prototype.changetexture = function(newname) {
	this.changetextureN(newname,0);
/*	this.texturenames[0] = newname;
	//this.hasalpha = false;
	this.flags &= ~modelflagenums.HASALPHA;
	if (this.shader.uSampler0 !== undefined && this.reftextures[0]) {
		this.reftextures[0].glfree();
		this.reftextures[0] = Texture.createtexture(this.texturenames[0]); 
		if (this.reftextures[0] && this.reftextures[0].hasalpha) {
			//this.hasalpha = true;
			this.flags |= modelflagenums.HASALPHA;
		}
	} */
};

function setUserModelUniforms(shader,mat) {
	var keys = Object.keys(mat);
	for (var i=0;i<keys.length;++i) {
		var key = keys[i];
		var au = shader.actunifs[key];
		if (au) {
			var unf = shader[key];
			var val = mat[key];
			var type = au.type;
			switch(type) {
			case glenums.GL_FLOAT:
				gl.uniform1f(unf,val);
				break;
			case glenums.GL_FLOAT_VEC2:
				gl.uniform2fv(unf,val);
				break;
			case glenums.GL_FLOAT_VEC3:
				gl.uniform3fv(unf,val);
				break;
			case glenums.GL_FLOAT_VEC4:
				gl.uniform4fv(unf,val);
				break;
			case glenums.GL_FLOAT_MAT4:
				gl.uniformMatrix4fv(unf,false,val);
				break;
			}
		}
	}
}

// draw with gl
Model.prototype.draw = function() {
	//checkglerror("glerr model draw start");
	if ((this.flags & modelflagenums.NOZBUFFER) && !shadowmap.inshadowmapbuild)
	    gl.disable(gl.DEPTH_TEST);                               // turn off zbuffer
	if (this.flags & modelflagenums.DOUBLESIDED)
	    gl.disable(gl.CULL_FACE);
	//checkglerror("glerr model draw 9");
	//var hasTexture = true;
	var i;
	if (curtree && curtree.reftexture) {
		gl.activeTexture(gl.TEXTURE0);
		if (curtree.reftexture.iscubemap)
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, curtree.reftexture.gltexture);
		else
			gl.bindTexture(gl.TEXTURE_2D, curtree.reftexture.gltexture);
		i = 1; // done texture 0
	} else {
		i = 0;
	}
	var hasTexture0 = this.reftextures[0];
	for (;i<maxTextures;++i) {
		if (this.reftextures[i]) {
			gl.activeTexture(gl.TEXTURE0 + i);
			if (this.reftextures[i].iscubemap)
				gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.reftextures[i].gltexture);
			else
				gl.bindTexture(gl.TEXTURE_2D, this.reftextures[i].gltexture);
		//} else {
		//	gl.bindTexture(gl.TEXTURE_2D,null);
			//hasTexture = false;
		}
	}
	/*
	//checkglerror("glerr model draw 10");
	if (this.reftextures[1] && this.reftextures[0]) {
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.reftextures[1].gltexture);
	}*/
	
	
	//checkglerror("glerr model draw 1");
	var shaderProgram;
	if (shadowmap.inshadowmapbuild)
		if (hasTexture0)
			shaderProgram = shadershadowmapbuild;
		else
			shaderProgram = shadershadowmapbuildnotex;
	else
		shaderProgram = this.shader;
	//checkglerror("glerr model draw 2");
	gl.useProgram(shaderProgram);
	setMatrixModelViewUniforms(shaderProgram);
	setAttributes(shaderProgram);
	//checkglerror("glerr model draw 3");
	
	setUserModelUniforms(shaderProgram,this.mat);
	if (curtree)
		setUserModelUniforms(shaderProgram,curtree.mat);
	setUserModelUniforms(shaderProgram,globalmat);
	//checkglerror("glerr model draw 4");
	
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.glverts);
		
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,3,gl.FLOAT, false, 0, 0);
	/*
	var attribLocation = 1;
	var ret = gl.getVertexAttrib ( attribLocation, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING );
	if (ret == null)
		alert("bad attrib location");
    */
	//checkglerror("glerr model draw 5");
    if (this.glnorms && shaderProgram.normalAttribute !== undefined) {
    	gl.bindBuffer(gl.ARRAY_BUFFER, this.glnorms);
    	gl.vertexAttribPointer(shaderProgram.normalAttribute,3,gl.FLOAT, false, 0, 0);
	}
	
	//checkglerror("glerr model draw 6");
    if (this.gluvs && shaderProgram.textureCoordAttribute !== undefined) {
    	gl.bindBuffer(gl.ARRAY_BUFFER, this.gluvs);
    	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,2,gl.FLOAT, false, 0, 0);
	}
	
	//checkglerror("glerr model draw 7");
    if (this.gluvs2 && shaderProgram.textureCoordAttribute2 !== undefined) {
    	gl.bindBuffer(gl.ARRAY_BUFFER, this.gluvs2);
    	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute2,2,gl.FLOAT, false, 0, 0);
	}
	
	//checkglerror("glerr model draw 8");
    if (this.glcverts && shaderProgram.colorAttribute !== undefined) {
    	gl.bindBuffer(gl.ARRAY_BUFFER, this.glcverts);
    	gl.vertexAttribPointer(shaderProgram.colorAttribute,4,gl.FLOAT, false, 0, 0);
	}
	
	//checkglerror("glerr model draw 11");
	if (!(this.flags & modelflagenums.HASALPHA)) { // turn it off
	//if (true) {
		if (shadowmap.inshadowmapbuild)
			gl.cullFace(gl.FRONT); // back face shadow generate non alpha models
		gl.disable(gl.BLEND);
	}
	//gl.disable(gl.BLEND);
	//checkglerror("glerr model draw 11.5");
	//logger("drawing " + this.name);
    if (this.glfaces) {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.glfaces);
     	gl.drawElements(gl.TRIANGLES,this.faces.length*3,gl.UNSIGNED_SHORT,0);
    } else {
    	gl.drawArrays(gl.TRIANGLES,0,this.verts.length); // *3 ?
    }
    
	//checkglerror("glerr model draw 12");
	if (!(this.flags & modelflagenums.HASALPHA)) { // turn it back on
		if (shadowmap.inshadowmapbuild)
			gl.cullFace(gl.BACK); // back face shadow generate non alpha models
		gl.enable(gl.BLEND);
	}
	//checkglerror("glerr model draw 13");
	if ((this.flags & modelflagenums.NOZBUFFER) && !shadowmap.inshadowmapbuild)
	    gl.enable(gl.DEPTH_TEST);                               // turn zbuffer back on
	if (this.flags & modelflagenums.DOUBLESIDED)
	    gl.enable(gl.CULL_FACE);
	//checkglerror("glerr model draw end");
};

function incnglbuffers() {
	++nglbuffers;
}
function decnglbuffers() {
	--nglbuffers;
	if (nglbuffers == 0)
		logger("nglbuffers now at = 0\n");
	if (ngltextures < 0)
		alert("nglbuffers < 0\n");
}

// free gl resources, but keep the rest, 'commit' again to get it back into gl
Model.prototype.glfree = function() {
	--this.refcount;
	if (this.refcount > 0) {
		return;
	}
	if (this.refcount < 0) {
		alert("Model refcount < 0 in '" + this.name + "'");
	}
	delete refcountmodellist[this.name];

	gl.deleteBuffer(this.glverts);
	decnglbuffers();
	this.glverts = null;

	if (this.glnorms) {
		gl.deleteBuffer(this.glnorms);
		decnglbuffers();
		this.glnorms = null;
	}
		
	if (this.glcverts) {
		gl.deleteBuffer(this.glcverts);
		decnglbuffers();
		this.glcverts = null;
	}

	if (this.gluvs) {
		gl.deleteBuffer(this.gluvs);
		decnglbuffers();
		this.gluvs = null;
	}

	if (this.gluvs2) {
		gl.deleteBuffer(this.gluvs2);
		decnglbuffers();
		this.gluvs2 = null;
	}

	if (this.glfaces) {
		gl.deleteBuffer(this.glfaces);
		decnglbuffers();
		this.glfaces = null;
	}

	for (var i = 0;i < maxTextures;++i) {
		if (this.reftextures[i]) {
			this.reftextures[i].glfree();
			this.reftextures[i] = null;
		}
	}
};

Model.prototype.newdup = function() {
	logger("Model newdup of " + this.name);
	++this.refcount;
	return this;
};

Model.prototype.log = function() {
	var modellog = "   Model '" + this.name + "'";
	modellog += " refcount " + this.refcount;
/*	
		if (fo.constructor !== Array)
		return false;
*/
	if (this.verts) {
		var numverts = this.verts.length;
		if (numverts) {
			if (this.verts.constructor !== Array || !this.verts[0] instanceof Object)
				numverts /= 3;
		}
		modellog += " verts " + numverts;
		totalverts += numverts;
	}
	if (this.faces) {
		var numfaces = this.faces.length;
		if (numfaces) {
			if (this.faces.constructor !== Array || !this.faces[0] instanceof Object)
				numfaces /= 3;
		}
		modellog += " faces " + numfaces;
		totalfaces += numfaces;
	}
	modellog += " shadername '" + this.shadername + "'";
	for (var i=0;i<maxTextures;++i) {
		if (this.texturenames[i])
			modellog += " texname" + i + " '" + this.texturenames[i] + "'";
	}
	logger(modellog + "\n");
};
