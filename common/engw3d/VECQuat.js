VECQuat = {};

//VECQuat.t = new VEC();

// order is reversed
VECQuat.rotaxis2quat = function(raIn,qOut) {
	var a;
	var sina,cosa;
// convert to unit quat
	if (raIn.w > 10000 || raIn.w < -10000)
		alert("big angle in rotaxis2quat " + raIn.w);
	while(raIn.w <= VEC.PI) // should be -PI
		raIn.w += VEC.TWOPI;
	while (raIn.w > VEC.PI)
		raIn.w -= VEC.TWOPI;
	a = .5*raIn.w;
	sina = Math.sin(a);
	cosa = Math.cos(a);
	qOut.x = raIn.x*sina;
	qOut.y = raIn.y*sina;
	qOut.z = raIn.z*sina;
	qOut.w = cosa;
};

VECQuat.quatinverse = function(inp,out) { // unit quats
	out.x = -inp.x;
	out.y = -inp.y;
	out.z = -inp.z;
	out.w = inp.w;
};

// c = a * b
VECQuat.quattimes = function(a,b,c) {
	var x =  a.x*b.w + a.y*b.z - a.z*b.y + a.w*b.x;
	var y = -a.x*b.z + a.y*b.w + a.z*b.x + a.w*b.y;
	var z =  a.x*b.y - a.y*b.x + a.z*b.w + a.w*b.z;
	var w = -a.x*b.x - a.y*b.y - a.z*b.z + a.w*b.w;
	c.copy(x,y,z,w);
};

VECQuat.quatrot = function(q,vi,vo) {
	var qi = new VEC();
	var vi2 = new VEC(vi);
	vi2.w=0;
	VECQuat.quatinverse(q,qi);
	VECQuat.quattimes(q,vi2,vo);
	VECQuat.quattimes(vo,qi,vo);
};

VECQuat.quatrots = function(q,vi,vo,npnts) {
	var i;
	for (i=0;i<npnts;i++)
		VECQuat.quatrot(q,vi[i],vo[i]);
};

VECQuat.quatnormalize = function(a,b) { // make quat a into unit quat b
	var r = a.x*a.x + a.y*a.y + a.z*a.z + a.w*a.w;
	if (r < VEC.EPSILON) {
		b.clear();
		b.w = 1;
	} else {
		r = 1.0/Math.sqrt(r);
		b.x = r*a.x;
		b.y = r*a.y;
		b.z = r*a.z;
		b.w = r*a.w;
	}
};
