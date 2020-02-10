// draw 2D sprites and lines

// TODO: optimize more, maybe a texture atlas

Spriter = function() {
	this.master = new Tree2("sprite master tree");
	this.curdraw = new Tree2("sprite curdraw tree");
	this.reset();
};

Spriter.prototype.reset = function() {
	this.curdraw.glfree();
	this.curdraw = new Tree2("sprite curdraw tree");
	var scl = glc.clientHeight*.5;
	this.curdraw.trans = [-scl*gl.asp,scl,1];
};

Spriter.prototype.add = function(textu,pos,size,color,rot,hand) {
	// build a planexy (a square)
	// texture or flat
	if (textu) { // texture
		globaltexflags = textureflagenums.CLAMPU | textureflagenums.CLAMPV; // keep original size by using clamping
		if (color) { // texture has color
			var spttree = buildplanexy01("sptModelc",1,1,textu,"texc");	// texture with uniform color
			spttree.mat.color = color;
			if (color[3] < .98) {
				spttree.mod.flags |= modelflagenums.HASALPHA; // test sprite with alpha blending
			}
		} else {
			var spttree = buildplanexy01("sptModel",1,1,textu,"tex");	
		}
		spttree.settexture(textu);
		var tex = spttree.reftexture;
		// could be optimized further with texture atlas and dynamic uv attribute updates, like font.js
		if (tex.refcount == 1) { // keep textures alive until Spriter.glfree by storing reference in master
			var keep = spttree.newdup();
			this.master.linkchild(keep);
		}
		var texwid = tex.origwidth;
		var texhit = tex.origheight;
		globaltexflags = 0; // back to default, wrap, use power of 2 textures
	} else { // flat
		var spttree = buildplanexy01("sptModelf",1,1,undefined,"flat");	// texture with uniform color
		var texwid = 32; // something simple
		var texhit = 32;
		if (color) { // flat and has color
			if (color[3] < .98) {
				spttree.mod.flags |= modelflagenums.HASALPHA; // test sprite with alpha blending
			}
		} else { // no texture no color
			color = [1,1,1,1,]; // default color, opaque white
		}
		spttree.mat.color = color;
	}

	var tx = pos[0];
	var ty = pos[1];
	if (size) {
		var sx = size[0];
		var sy = size[1];
	}
	if (hand) {
		var handx = hand[0];
		var handy = hand[1];
	}
	
	if (sx !== undefined) { // override texture width and height with sx,sy
		var texwid = sx;
		var texhit = sy;
	}
	
	var testoff = 0;// 15; // test sprite clipping, normally a 0
	
	// don't draw if off screen
	if (rot) { // defined and non zero
		var rs = Math.sin(rot);
		var rc = Math.cos(rot);
		if (hand) {
			tx -= ( rc*texwid * handx + rs*texhit * handy);
			ty -= (-rs*texwid * handx + rc*texhit * handy);
		}
		// calc bounding box for rotated sprite, probably overkill
		rot = normalangrad(rot);
		if (rot < -Math.PI/2) {       // PI to 3*PI/2
			var left = texwid*rc + texhit*rs;
			var right = 0;
			var top = texhit*rc;
			var bot = -texwid*rs;
		} else if (rot < 0) {         // 3*PI/2 to 2*PI
			var left = texhit*rs;
			var right = texwid*rc;
			var top = 0;
			var bot = -texwid*rs + texhit*rc;
		} else if (rot < Math.PI/2) { // 0 to PI/2
			var left = 0;
			var right = texwid*rc + texhit*rs;
			var top = -texwid*rs;
			var bot = texhit*rc;
		} else { // rot < Math.PI,    // PI/2 to PI
			var left = texwid*rc;
			var right = texhit*rs;
			var top = -texwid*rs + texhit*rc;
			var bot = 0;
		}
		// calc bounding box for non rotated sprite
	} else {
		if (hand) {
			tx -= texwid * handx;
			ty -= texhit * handy;
		}

		var left = 0;
		var right = texwid;
		var top = 0;
		var bot = texhit;
	}
	if (tx + right < testoff ||
    	ty + bot < testoff || 
	    tx  + left >= glc.clientWidth - testoff ||
		ty  + top >= glc.clientHeight - testoff) {
		spttree.glfree(); // reduce refcounts, balance
		return; // comment out for no clipping
	}
	tx = Math.floor(tx);
	ty = Math.floor(ty);
	spttree.trans = [tx,-ty,0];
	spttree.scale = [texwid,texhit,1];
	if (rot) // defined and non zero
		spttree.rot = [0,0,rot];
	spttree.mod.flags |= modelflagenums.NOZBUFFER;
	this.curdraw.linkchild(spttree);	
};

Spriter.prototype.addLine = function(p0,p1,color,lineWidth) {
	//return;
	if (!lineWidth)
		lineWidth = 2;
	var len = vec2.dist(p0,p1);
	var ang = Math.atan2(p1[1] - p0[1],p1[0] - p0[0]);
	this.add(undefined,p0,[len,lineWidth],color,-ang,[0,.5]);
};

Spriter.prototype.addRectangle = function(p0,ps,color) {
	this.add(undefined,p0,ps,color);
};

Spriter.prototype.addRectangleo = function(p0,ps,color) {
	var p1 = vec2.create();
	vec2.add(p1,p0,ps);
	p1[0] -= 2;
	p1[1] -= 2; // move right down closer
	this.addLine(p0,[p1[0],p0[1]],color);
	this.addLine([p0[0],p1[1]],p1,color);
	this.addLine(p0,[p0[0],p1[1]],color);
	this.addLine([p1[0],p0[1]],p1,color);
};

Spriter.prototype.draw = function() {
	this.curdraw.draw();
};

Spriter.prototype.glfree = function() {
	this.master.glfree(); // free up cached resources
	this.master = null;
	this.curdraw.glfree(); // free up current resources
	this.curdraw = null;
};

Spriter.createspritervp = function() {
	var scl = glc.clientHeight*.5;
	svp = defaultorthoviewport();
	svp.clearflags &= ~gl.DEPTH_BUFFER_BIT;
	svp.ortho_size = scl;
	return svp;
};
