// VEC class, used by physics3d, doubles as a vector and a quaternion
// members x,y,z,w
// constructor for VEC class
//VEC()
//VEC(x,y,z)
//VEC(x,y,z,w)
//VEC(VEC)
//VEC(var[])
//VEC(var[],offset) // offset gets multiplied by 3

function VEC(ax,ay,az,aw) {
	if (ax) {
		if (ax.constructor === Array) { // assume first arg is an array of floats with stride of 3
			var offset = 0;
			if (ay)
				offset = ay;
			var j = offset*3;
			this.x = ax[j];
			this.y = ax[j + 1];
			this.z = ax[j + 2];
			this.w = 0;
			return;
		}
		if (ax instanceof Object) { // see if first argument is a VEC
			if (ax !== undefined) {
				if (ax.x != undefined) {
					//VEC(VEC)
					this.x = ax.x;
					this.y = ax.y;
					this.z = ax.z;
					this.w = ax.w;
					return;
				}
			}
		}
		this.x = ax;
	} else
		this.x = 0; // if null or undefined or 0 etc.
	if (ay)
		this.y = ay;
	else
		this.y = 0; // if null or undefined or 0 etc.
	if (az)
		this.z = az;
	else
		this.z = 0; // if null or undefined or 0 etc.
	if (aw)
		this.w = aw;
	else
		this.w = 0; // if null or undefined or 0 etc.
}

VEC.PI = Math.PI;
VEC.TWOPI = 2.0*VEC.PI;
VEC.PIOVER2 = .5*VEC.PI;
VEC.E = Math.E;
VEC.SQRT2 = Math.sqrt(2.0);
VEC.SQRT2O2 = Math.sqrt(2.0)/2.0;
VEC.SQRT3 = Math.sqrt(3.0);
VEC.SQRT3O3 = Math.sqrt(3.0)/3.0;
VEC.SQRT5 = Math.sqrt(5.0);
VEC.SQRT5O5 = Math.sqrt(5.0)/5.0;

VEC.DEGREE2RAD = VEC.TWOPI/360.0;
VEC.RAD2DEGREE = 360.0/VEC.TWOPI;
VEC.EPSILON = 1e-20;

VEC.prototype.copy = function(ax,ay,az,aw) {
	if (ax) {
		if (ax instanceof Object) { // see if first argument is a VEC
			//if (ax !== undefined) {
				if (ax.x != undefined) {
					//copy(VEC)
					this.x = ax.x;
					this.y = ax.y;
					this.z = ax.z;
					this.w = ax.w;
					return;
				}
			//}
		}
		this.x = ax;
	} else
		this.x = 0;
	if (ay)
		this.y = ay;
	else
		this.y = 0; // if null or undefined or 0 etc.
	if (az)
		this.z = az;
	else
		this.z = 0; // if null or undefined or 0 etc.
	if (aw)
		this.w = aw;
	else
		this.w = 0; // if null or undefined or 0 etc.
};

VEC.prototype.clear = function() {
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.w = 0;
};

VEC.prototype.equals = function(rhs) {
	return  this.x == rhs.x &&
			this.y == rhs.y && 
			this.z == rhs.z && 
			this.w == rhs.w;
};

// copy a VEC into an existing var[3] array
VEC.copy3 = function(ina,outa) {
	outa[0] = ina.x;
	outa[1] = ina.y;
	outa[2] = ina.z;
};

// copy a VEC into an existing var[4] array
VEC.copy4 = function(ina,outa) {
	outa[0] = ina.x;
	outa[1] = ina.y;
	outa[2] = ina.z;
	outa[3] = ina.w;
};


// convert array of floats with stride of 3 to an array of VEC's
VEC.makeVECArray = function(pnts) {
	if (pnts.length%3 != 0) {
		alert(("makeVECArray not multiple of 3 it's " + pnts.length));
	}
	var n = Math.floor(pnts.length/3);
	var ret = [];
	for (var i=0;i<n;++i)
		ret[i] = new VEC(pnts,i);
	return ret;
};

// convert array of VEC's to an array of floats with stride of 3
VEC.makeFLOATArray = function(pnts) {
	var ret = [];
	var n = pnts.length;
	for (var i=0;i<n;++i) {
		var j = i*3;
		ret[j] = pnts[i].x;
		ret[j + 1] = pnts[i].y;
		ret[j + 2] = pnts[i].z;
	}
	return ret;
};

// from VECNuMath

VEC.length2 = function(v) {
	return v.x*v.x + v.y*v.y + v.z*v.z;
};

VEC.dist3dsq = function(a,b) {
	var dx = a.x - b.x;
	var dy = a.y - b.y;
	var dz = a.z - b.z;
	return dx*dx + dy*dy + dz*dz;
}

VEC.normalize = function(vin,vout) {
	if (vout === undefined)
		vout = vin;
	var len2 = VEC.length2(vin);
	if (len2 < VEC.EPSILON*VEC.EPSILON) {
		vout.x = 0.0;
		vout.y = 1.0; // return something
		vout.z = 0.0;
		return 0;
	}
	var len = Math.sqrt(len2);
	var ilen = 1/len;
	vout.x = ilen * vin.x;
	vout.y = ilen * vin.y;
	vout.z = ilen * vin.z;
	return len;
};
/*
    public static var normalize(VEC v) {
        return normalize(v,v);
    }
*/

VEC.dot3d = function(a,b) {
	return a.x*b.x + a.y*b.y + a.z*b.z;
};

VEC.cross3d = function(a,b,c) {
	var z = a.x * b.y - a.y * b.x;
	var x = a.y * b.z - a.z * b.y;
	var y = a.z * b.x - a.x * b.z;
	c.copy(x,y,z);
};

VEC.prototype.toString = function() {
	var prec = 5;
	return "(" + this.x.toPrecision(prec) + "," + this.y.toPrecision(prec) + "," + this.z.toPrecision(prec) + ")";
};
