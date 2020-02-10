// just some math for partial bezier's
var bezier = {};

// curve parameters, just for now quite fixed
bezier.fx = .8;
bezier.fy = 0;

bezier.setFactors = function(afx,afy) {
	bezier.fx = afx;
	bezier.fy = afy;
}
bezier.cubic = function(COEF,t) {
	return t*(t*(t*COEF[0] + COEF[1]) + COEF[2]) + COEF[3];
};

// should use a matrix instead

/* OLD
bezier.calcABCD = function(p0,p1,c0,c1) {
	var ret = [
		p0 - p1 + c0 - c1,
		-p0 +2*p1 -2*c0 + c1,
		-p0 + c0,
		p0
	];
	return ret;
};*/

bezier.calcABCD = function(p0,p1,c0,c1) {
	var ret = [
		-p0 + p1 + 3*c0 - 3*c1,
		3*p0 +    -6*c0 + 3*c1,
		-3*p0 +    3*c0,
		p0
	];
	return ret;
};

bezier.calcP0P1C0C1 = function(C) {
	var ret = [
		C[3],
		C[0] + C[1] + C[2] + C[3],
		C[2]/3.0 + C[3],
		C[1]/3.0 + 2.0*C[2]/3.0 + C[3]
	];
	return ret;
};

// using fx and fy factors, calc control points
bezier.getControlPoints = function(startx, starty, endx, endy) {
	var ret = {};
	ret.cp1x = startx + bezier.fx*(endx - startx);
	ret.cp1y = starty + bezier.fy*(endy - starty);
	ret.cp2x = endx + bezier.fx*(startx - endx);
	ret.cp2y = endy +bezier.fy*(starty - endy);
	return ret;
};


// location on curve at time t
bezier.getCoords = function(startx, starty, endx, endy, t) {
	var ret = [];
	let cp = bezier.getControlPoints(startx, starty, endx, endy);
	var xcoef = bezier.calcABCD(startx,endx,cp.cp1x,cp.cp2x);
	var ycoef = bezier.calcABCD(starty,endy,cp.cp1y,cp.cp2y);
	ret[0] = bezier.cubic(xcoef,t);
	ret[1] = bezier.cubic(ycoef,t);
	return ret;
};

// get a new bezier curve that only goes part way on original curve
// returns start, end, and control points
bezier.getPartialCurve = function(startx, starty, endx, endy, part) {
	var ret = {};
	let cp = bezier.getControlPoints(startx, starty, endx, endy);
	var xcoef = bezier.calcABCD(startx,endx,cp1x,cp2x);
	var ycoef = bezier.calcABCD(starty,endy,cp1y,cp2y);

	
	var xcoef = bezier.calcABCD(startx,endx,cp.cp1x,cp.cp2x);
	var ycoef = bezier.calcABCD(starty,endy,cp.cp1y,cp.cp2y);
	
	var p2 = part*part;
	var p3 = p2*part;
	xcoef[0] *= p3;
	xcoef[1] *= p2;
	xcoef[2] *= part;
	
	ycoef[0] *= p3;
	ycoef[1] *= p2;
	ycoef[2] *= part;

	var xp = bezier.calcP0P1C0C1(xcoef);
	var yp = bezier.calcP0P1C0C1(ycoef);
	
	ret.startx = xp[0];
	ret.starty = yp[0];
	ret.endx = xp[1];
	ret.endy = yp[1];
	ret.cp1x = xp[2];
	ret.cp1y = yp[2];
	ret.cp2x = xp[3];
	ret.cp2y = yp[3];
	return ret;
};

