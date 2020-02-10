// Simple bitmap32 class

//////////// constructor
Bitmap32 = function(wida,hita,col) {
	if (col !== undefined) { // standard width height color
		this.size = {x:wida,y:hita};
		this.area = wida*hita;
		this.data = new Uint32Array(this.area); // ABGR
		if (col === undefined)
			col = C32GREEN;
		if (col) // if col == 0, then this.data is already 0
			this.data.fill(col,0,this.area);
	} else { // assume wida is an img
		var img = wida;
		var wida = img.width;
		var hita = img.height;
		// get the data by using a canvas
		var cvs = document.createElement('canvas');
		cvs.width = img.width;
		cvs.height = img.height;
		var ctx = cvs.getContext('2d');
		ctx.drawImage(img,0,0);
		var pixelData = ctx.getImageData(0,0,wida,hita);
		var sData = pixelData.data;
		this.size = {x:wida,y:hita};
		this.area = wida*hita;
		// convert data from 8bit to 32bit
		var outputABuffer = new ArrayBuffer(sData.length);
		var input8Array = new Uint8Array(outputABuffer);
		input8Array.set(sData);
		var output32Array= new Uint32Array(outputABuffer);
		this.data = output32Array;
	}
};

//////////// pixels
Bitmap32.prototype.fastPutPixel = function(x,y,color) {
	this.data[this.size.x*y + x] = color;
}

Bitmap32.prototype.clipPutPixel = function(x,y,color) {
	if (x >= 0 && x < this.size.x && y >= 0 && y < this.size.y) {
		this.fastPutPixel(x,y,color);
	}
}


////////// horizontal lines
Bitmap32.prototype.xClip = function(x0,x1) {
	if (x0 > x1) {
		var t = x0;
		x0 = x1;
		x1 = t;
	}
	var left = 0;
	var right = this.size.x;
	if (x1 < left)
		return null;
	if (x0 >= right)
		return null;
	if (x0 < left)
		x0 = left;
	if (x1 >= right)
		x1 = right - 1;
	var ret = [x0,x1];
	return ret;
};

Bitmap32.prototype.fastHLine = function(x0,y,x1,color) {
	var yindex = this.size.x*y;
	var start = yindex + x0;
	var end = yindex + x1 + 1;
	this.data.fill(color,start,end);
};

Bitmap32.prototype.clipHLine = function(x0,y,x1,color) {
	if (y < 0)
		return;
	if (y >= this.size.y)
		return;
	var ret = this.xClip(x0,x1);
	if (ret) {
		x0 = ret[0];
		x1 = ret[1];
		this.fastHLine(x0,y,x1,color);
	}
};

/////////// circles ////////////////////////////////////
Bitmap32.prototype.clipCircle = function(x,y,r,c) {
//	this.clipHLine(x - r, y, x + r, color);
	var e;
//	if (true) {
	if (r <= 0) {
		this.clipPutPixel(x,y,c);
		return;
	}
	if (x - r >= this.size.x)
		return;
	if (x + r < 0)
		return;
	if (y - r >= this.size.y)
		return;
	if (y + r < 0)
		return;	// circle completely off bitmap, don't draw

	var cir_xorg=x;
	var cir_yorg=y;
	var cir_color=c;
	x=0;
	y=r;
	e=(y<<1)-1;
	while(x<=y) {
		this.clipHLine(cir_xorg-y,cir_yorg-x,cir_xorg+y,cir_color);
		this.clipHLine(cir_xorg-y,cir_yorg+x,cir_xorg+y,cir_color);
		e-=(x<<2)+2;
//		x++; // was here
		if (e<0) {
			e+=(y<<2)+2;
			this.clipHLine(cir_xorg-x,cir_yorg-y,cir_xorg+x,cir_color);
			this.clipHLine(cir_xorg-x,cir_yorg+y,cir_xorg+x,cir_color);
			y--;
		}
		x++; // now here
	}
};

Bitmap32.prototype.fastClear = function(color) {
	this.data.fill(color,0,this.area);
};

Bitmap32.prototype.rClip = function(x,y,sx,sy) {
	var move;
	var right = this.size.x;
	var bottom = this.size.y;
// trivial check
	if (sx == 0 || sy == 0)
		return null;
// negative
	if (sx < 0) {
		sx = - sx;
		x -= sx;
	}
	if (sy < 0) {
		sy = - sy;
		y -= sy;
	}
// left
	move = -x;
	if (move > 0) {
		x += move;
		sx -= move;
	}
	if (sx <= 0)
		return null;
// top
	move = -y;
	if (move > 0) {
		y += move;
		sy -= move;
	}
	if (sy <= 0)
		return null;
// right
	move = (x + sx) - right;
	if (move > 0)
		sx -= move;
	if (sx <= 0)
		return null;
// bottom
	move = (y + sy) - bottom;
	if (move > 0)
		sy -= move;
	if (sy <= 0)
		return null;
// done
	var ret = [x,y,sx,sy];
	return ret;
};

Bitmap32.prototype.fastRect = function(x0,y0,sx,sy,color) {
	var yindex = this.size.x*y0;
	var start = yindex + x0;
	var end = yindex + x0 + sx;
	var dinc = this.size.x;
	for (j=0;j<sy;++j) {
		this.data.fill(color,start,end);
		start += dinc;
		end += dinc;
	}
/*	var i,j;
	var dinc;
	var dp = 0;
	var val = color;
	dp=b32->data+b32->size.x*y0+x0;
		for (i=0;i<sx;++i)
			dp[i]=val;
		dp+=dinc;
	} */
};

Bitmap32.prototype.clipRect = function(x0,y0,sx,sy,color) {
	var ret = this.rClip(x0,y0,sx,sy);
	if (ret) {
		x0 = ret[0];
		y0 = ret[1];
		sx = ret[2];
		sy = ret[3];
		this.fastRect(x0,y0,sx,sy,color);
	}
};

Bitmap32.prototype.bClip = function(sBmp,sx,sy,dx,dy,tx,ty) {
	var move;
	var dsizex = this.size.x;
	var dsizey = this.size.y;
	var ssizex = sBmp.size.x;
	var ssizey = sBmp.size.y;
// trivial check
	if ((tx<=0)||(ty<=0))
		return null;
// left source
	move = -sx;
	if (move>0) {
		sx += move;
		dx += move;
		tx -= move;
	}
	if (tx <= 0)
		return null;
// left dest
	move = -dx;
	if (move>0) {
		sx += move;
		dx += move;
		tx -= move;
	}
	if (tx <= 0)
		return null;
// top source
	move = -sy;
	if (move>0) {
		sy += move;
		dy += move;
		ty -= move;
	}
	if (ty <= 0)
		return null;
// top dest
	move = -dy;
	if (move>0) {
		sy += move;
		dy += move;
		ty -= move;
	}
	if (ty <= 0)
		return null;
// right source
	move = sx + tx - ssizex;
	if (move>0)
		tx -= move;
	if (tx <= 0)
		return null;
// right dest
	move = dx + tx - dsizex;
	if (move>0)
		tx -= move;
	if (tx <= 0)
		return null;
// bottom source
	move = sy + ty - ssizey;
	if (move>0)
		ty -= move;
	if (ty <= 0)
		return null;
// bottom dest
	move = dy + ty - dsizey;
	if (move>0)
		ty -= move;
	if (ty <= 0)
		return false;
	return [sx,sy,dx,dy,tx,ty];
};

Bitmap32.prototype.fastBlit = function(sBmp,sx,sy,dx,dy,tx,ty) {
	var sw = sBmp.size.x;
	var dw = this.size.x;
	var sp = 4*(sw*sy + sx);
	var dp = dw*dy + dx;
	var sstep = 4*sw;
	var dstep = dw;
	var sArrayBuff = sBmp.data.buffer;
	for (var j=0;j<ty;++j) {
		var lineData = new Uint32Array(sArrayBuff,sp,tx);
		this.data.set(lineData,dp);
		sp += sstep;
		dp += dstep;
	}
};

Bitmap32.prototype.clipBlit = function(sBmp,sx,sy,dx,dy,tx,ty) {
	var ret = this.bClip(sBmp,sx,sy,dx,dy,tx,ty);
	if (ret) {
		sx = ret[0];
		sy = ret[1];
		dx = ret[2];
		dy = ret[3];
		tx = ret[4];
		ty = ret[5];
		this.fastBlit(sBmp,sx,sy,dx,dy,tx,ty);
	}
};

Bitmap32.prototype.fastBlitAlpha = function(sBmp,sx,sy,dx,dy,tx,ty) {
	var sw = sBmp.size.x;
	var dw = this.size.x;
	var sp = sw*sy + sx;
	var dp = dw*dy + dx;
	var sstep = sw - tx;
	var dstep = dw - tx;
	var sData = sBmp.data;
	var dData = this.data;
	for (var j=0;j<ty;++j) {
		for (var i=0;i<tx;++i) {
			var val = sData[sp++];
			if (val & 0x80000000)
				dData[dp] = val;
			++dp;
		}
		sp += sstep;
		dp += dstep; 
	}
};

Bitmap32.prototype.clipBlitAlpha = function(sBmp,sx,sy,dx,dy,tx,ty) {
	var ret = this.bClip(sBmp,sx,sy,dx,dy,tx,ty);
	if (ret) {
		sx = ret[0];
		sy = ret[1];
		dx = ret[2];
		dy = ret[3];
		tx = ret[4];
		ty = ret[5];
		this.fastBlitAlpha(sBmp,sx,sy,dx,dy,tx,ty);
	}
};

Bitmap32.prototype.outTextXYFB = function(smallFontBmp,x,y,forColor,backColor,str) {
// control fore and back color, NYI
};

Bitmap32.prototype.outTextXY = function(smallFontBmp,x,y,str) { 
// white and black for now, what ever is in the font, straight copy
	var len = str.length;
	for (var i=0;i<len;++i) {
		var v = str.charCodeAt(i);
		var xf = v&0x7;
		var yf = (v>>3)&0x1f;
		xf <<= 3;
		yf <<= 3;
		this.clipBlit(smallFontBmp,xf,yf,x,y,8,8);
		x+=8;
	}
};
