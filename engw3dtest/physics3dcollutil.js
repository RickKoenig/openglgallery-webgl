// some collision utilities

var CollUtil = {};

CollUtil.MAXBOX2BOX = 72; // int
CollUtil.MAXBOX2PLANE = 12; // int

CollUtil.pln0 = []; //new VEC[3]; // VEC[3]
CollUtil.pln1 = []; //new VEC[3]; // VEC[3]

CollUtil.intpnts = []; //new VEC[8]; // VEC[8]

CollUtil.init = function() {
	var i;
	for (i=0;i<3;++i) {
		CollUtil.pln0[i] = new VEC();
		CollUtil.pln1[i] = new VEC();
	}
	for (i=0;i<8;++i) {
		CollUtil.intpnts[i] = new VEC();
	}
}

// v0 v1 v2 and v0+(v1-v0)+(v2-v0)
// static boolean line2bplane(VEC v0i,VEC v1i,VEC v2i,VEC top,VEC bot,VEC intsect) {
CollUtil.line2bplane = function(v0i,v1i,v2i,top,bot,intsect) {
	var uvec = new VEC(),vvec = new VEC();
	var nrm = new VEC();
	var topdn,botdn,pdn,pdi; // float
	var t,b0,b1; // float
	var np1 = new VEC(),np2 = new VEC();
	var v0 = new VEC(),v1 = new VEC(),v2 = new VEC();//,cm;
	v0.copy(v0i);
	v1.copy(v1i);
	v2.copy(v2i);
	uvec.x = v1.x - v0.x;
	uvec.y = v1.y - v0.y;
	uvec.z = v1.z - v0.z;
	vvec.x = v2.x - v0.x;
	vvec.y = v2.y - v0.y;
	vvec.z = v2.z - v0.z;
	VEC.cross3d(uvec,vvec,nrm);
// solve for intersection of line with plane
	topdn = VEC.dot3d(top,nrm);
	botdn = VEC.dot3d(bot,nrm);
	pdn = VEC.dot3d(v0,nrm);
	if (topdn >= pdn && botdn >= pdn)
		return false;
	if (topdn < pdn && botdn < pdn)
		return false;
	if (botdn == topdn)
		logger("divide by zero !!");
	t = (pdn - topdn)/(botdn - topdn);
	if (intsect == null || top == null || bot == null)
		logger("something is null !!!");
	intsect.x = top.x + t*(bot.x - top.x);
	intsect.y = top.y + t*(bot.y - top.y);
	intsect.z = top.z + t*(bot.z - top.z);
	var nx = isNaN(intsect.x);
	var ny = isNaN(intsect.y);
	var nz = isNaN(intsect.z);
	if (nx || ny || nz)
		logger("intsect is a NaN");
// see if on plane
	VEC.cross3d(nrm,uvec,np1);
	pdi = VEC.dot3d(intsect,np1);
	b0 = VEC.dot3d(v0,np1);
	b1 = VEC.dot3d(v2,np1);
	if (b0 > pdi && b1 > pdi)
		return false;
	if (b0 < pdi && b1 < pdi)
		return false;
	VEC.cross3d(nrm,vvec,np2);
	pdi = VEC.dot3d(intsect,np2);
	b0 = VEC.dot3d(v0,np2);
	b1 = VEC.dot3d(v1,np2);
	if (b0 > pdi && b1 > pdi)
		return false;
	if (b0 < pdi && b1 < pdi)
		return false;
	return true;
};

    // v0 v1 v2 and v0+(v1-v0)+(v2-v0)
CollUtil.line2btricull = function(v0,v1,v2,top,bot,intsect) {
    //static boolean line2btricull(VEC v0, VEC v1, VEC v2, VEC top,VEC bot,VEC intsect) {
	var uvec = new VEC();
	var vvec = new VEC();
	var nrm = new VEC();
	var topdn,botdn,pdn;
	var v0mi = new VEC();
	var v1mi = new VEC();
	var v2mi = new VEC();
	var c0 = new VEC();
	var c1 = new VEC();
	var c2 = new VEC();
	var d0,d1,d2;
	var t;
	uvec.x = v1.x - v0.x;
	uvec.y = v1.y - v0.y;
	uvec.z = v1.z - v0.z;
	vvec.x = v2.x - v0.x;
	vvec.y = v2.y - v0.y;
	vvec.z = v2.z - v0.z;
	VEC.cross3d(uvec,vvec,nrm);
// solve for intersection of line with plane
	topdn = VEC.dot3d(top,nrm);
	botdn = VEC.dot3d(bot,nrm);
	pdn = VEC.dot3d(v0,nrm);
	if (topdn < botdn)
		return false;
	if (topdn>=pdn && botdn>=pdn)
		return false;
	if (topdn<=pdn && botdn<=pdn)
		return false;
	t=(pdn - topdn)/(botdn - topdn);
	intsect.x = top.x +t*(bot.x - top.x);
	intsect.y = top.y +t*(bot.y - top.y);
	intsect.z = top.z +t*(bot.z - top.z);
// now check to see if intsect is on the triangle
	v0mi.x = v0.x - intsect.x;
	v0mi.y = v0.y - intsect.y;
	v0mi.z = v0.z - intsect.z;
	v1mi.x = v1.x - intsect.x;
	v1mi.y = v1.y - intsect.y;
	v1mi.z = v1.z - intsect.z;
	v2mi.x = v2.x - intsect.x;
	v2mi.y = v2.y - intsect.y;
	v2mi.z = v2.z - intsect.z;
	VEC.cross3d(v0mi,v1mi,c0);
	VEC.cross3d(v1mi,v2mi,c1);
	VEC.cross3d(v2mi,v0mi,c2);
	d0 = VEC.dot3d(c0,nrm);
	d1 = VEC.dot3d(c1,nrm);
	d2 = VEC.dot3d(c2,nrm);
	var fudge = 1e-8;
	if (d0>=-fudge && d1>=fudge && d2>=fudge)
		return true;
	if (d0<=fudge && d1<=fudge && d2<=fudge)
		return true;
	return false;
}
	
// static boolean plane2plane(VEC[] pl0,VEC[] pl1,VEC res0,VEC res1) {
CollUtil.plane2plane = function(pl0,pl1,res0,res1) {
	if (res0 == res1)
		logger("res0 == res1");
	var i,npnts = 0; // int
	var bmin = -1,bmax = -1; // int
	var doxyz; // 0 x 1 y 2 z // int
	var maxpnts = new VEC(),minpnts = new VEC();
	//VEC intpnts[8];
	var pl03 = new VEC(),pl13 = new VEC();
	var maxpl0 = new VEC(),minpl0 = new VEC(),maxpl1 = new VEC(),minpl1 = new VEC();
	var delu = new VEC(),delv = new VEC(),nrm0 = new VEC(),nrm1 = new VEC(),crs = new VEC(),t = new VEC(),del = new VEC();
	pl03.x = pl0[1].x + pl0[2].x - pl0[0].x;
	pl03.y = pl0[1].y + pl0[2].y - pl0[0].y;
	pl03.z = pl0[1].z + pl0[2].z - pl0[0].z;
	pl13.x = pl1[1].x + pl1[2].x - pl1[0].x;
	pl13.y = pl1[1].y + pl1[2].y - pl1[0].y;
	pl13.z = pl1[1].z + pl1[2].z - pl1[0].z;
	maxpl0.copy(pl03);
	minpl0.copy(pl03);
	for (i=0;i<3;i++) {
		if (pl0[i].x > maxpl0.x)
			maxpl0.x = pl0[i].x;
		if (pl0[i].y > maxpl0.y)
			maxpl0.y = pl0[i].y;
		if (pl0[i].z > maxpl0.z)
			maxpl0.z = pl0[i].z;
		if (pl0[i].x < minpl0.x)
			minpl0.x = pl0[i].x;
		if (pl0[i].y < minpl0.y)
			minpl0.y = pl0[i].y;
		if (pl0[i].z < minpl0.z)
			minpl0.z = pl0[i].z;
	}
	//maxpl1=minpl1=pl13;
	maxpl1.copy(pl13);
	minpl1.copy(pl13);
	for (i=0;i<3;i++) {
		if (pl1[i].x > maxpl1.x)
			maxpl1.x = pl1[i].x;
		if (pl1[i].y > maxpl1.y)
			maxpl1.y = pl1[i].y;
		if (pl1[i].z > maxpl1.z)
			maxpl1.z = pl1[i].z;
		if (pl1[i].x < minpl1.x)
			minpl1.x = pl1[i].x;
		if (pl1[i].y < minpl1.y)
			minpl1.y = pl1[i].y;
		if (pl1[i].z < minpl1.z)
			minpl1.z = pl1[i].z;
	}
	if (maxpl0.x < minpl1.x || maxpl0.y < minpl1.y || maxpl0.z < minpl1.z)
		return false;
	if (maxpl1.x < minpl0.x || maxpl1.y < minpl0.y || maxpl1.z < minpl0.z)
		return false;
	if (CollUtil.line2bplane(pl0[0],pl0[1],pl0[2],pl1[0],pl1[1],CollUtil.intpnts[npnts]))
		npnts++;
	if (CollUtil.line2bplane(pl0[0],pl0[1],pl0[2],pl1[1],pl13,CollUtil.intpnts[npnts]))
		npnts++;
	if (CollUtil.line2bplane(pl0[0],pl0[1],pl0[2],pl13,pl1[2],CollUtil.intpnts[npnts]))
		npnts++;
	if (CollUtil.line2bplane(pl0[0],pl0[1],pl0[2],pl1[2],pl1[0],CollUtil.intpnts[npnts]))
		npnts++;
	if (CollUtil.line2bplane(pl1[0],pl1[1],pl1[2],pl0[0],pl0[1],CollUtil.intpnts[npnts]))
		npnts++;
	if (CollUtil.line2bplane(pl1[0],pl1[1],pl1[2],pl0[1],pl03,CollUtil.intpnts[npnts]))
		npnts++;
	if (CollUtil.line2bplane(pl1[0],pl1[1],pl1[2],pl03,pl0[2],CollUtil.intpnts[npnts]))
		npnts++;
	if (CollUtil.line2bplane(pl1[0],pl1[1],pl1[2],pl0[2],pl0[0],CollUtil.intpnts[npnts]))
		npnts++;
	if (npnts < 2)
		return false;
	if (npnts == 2) {
		res0.copy(CollUtil.intpnts[0]);
		res1.copy(CollUtil.intpnts[1]);
	} else {
		//minpnts = maxpnts = CollUtil.intpnts[0];
		minpnts.copy(CollUtil.intpnts[0]);
		maxpnts.copy(CollUtil.intpnts[0]);
		for (i=1;i<npnts;i++) {
			if (CollUtil.intpnts[i].x < minpnts.x)
				minpnts.x = CollUtil.intpnts[i].x;
			if (CollUtil.intpnts[i].y < minpnts.y)
				minpnts.y = CollUtil.intpnts[i].y;
			if (CollUtil.intpnts[i].z < minpnts.z)
				minpnts.z = CollUtil.intpnts[i].z;
			if (CollUtil.intpnts[i].x > maxpnts.x)
				maxpnts.x = CollUtil.intpnts[i].x;
			if (CollUtil.intpnts[i].y > maxpnts.y)
				maxpnts.y = CollUtil.intpnts[i].y;
			if (CollUtil.intpnts[i].z > maxpnts.z)
				maxpnts.z = CollUtil.intpnts[i].z;
		}
		if (maxpnts.x - minpnts.x > maxpnts.y - minpnts.y) { // x>y
			if (maxpnts.y - minpnts.y > maxpnts.z - minpnts.z) { // x>y && y>z --> x is largest
				doxyz = 0;
			} else // x>y && z>y
				if (maxpnts.x - minpnts.x > maxpnts.z - minpnts.z) // x>y && z>y && x>z --> x is largest
					doxyz = 0;
				else // x>y && z>y && z>x --> z is largest
					doxyz = 2;
		} else { // x<y
			if (maxpnts.y - minpnts.y > maxpnts.z - minpnts.z) { // x<y && y>z --> y is largest
				doxyz = 1;
			} else // x<y && z>y --> z is largest
				doxyz = 2;
		}
		if (doxyz == 0) {
			for (i=0;i<npnts;i++) {
				if (CollUtil.intpnts[i].x == minpnts.x) {
					bmin = i;
					break;
				}
			}
			for (i=0;i<npnts;i++) {
				if (CollUtil.intpnts[i].x == maxpnts.x) {
					bmax = i;
					break;
				}
			}
		} else if (doxyz == 1) {
			for (i=0;i<npnts;i++) {
				if (CollUtil.intpnts[i].y == minpnts.y) {
					bmin = i;
					break;
				}
			}
			for (i=0;i<npnts;i++) {
				if (CollUtil.intpnts[i].y == maxpnts.y) {
					bmax = i;
					break;
				}
			}
		} else {
			for (i=0;i<npnts;i++) {
				if (CollUtil.intpnts[i].z == minpnts.z) {
					bmin = i;
					break;
				}
			}
			for (i=0;i<npnts;i++) {
				if (CollUtil.intpnts[i].z == maxpnts.z) {
					bmax = i;
					break;
				}
			}
		}
		if (bmin<0 || bmax<0) {
			alert("this error just shouldn't happen");
			//logger("this error just shouldn't happen");
		} else {
			res0.copy(CollUtil.intpnts[bmin]);
			res1.copy(CollUtil.intpnts[bmax]);
		}
	}
	delu.x = pl0[1].x - pl0[0].x;
	delu.y = pl0[1].y - pl0[0].y;
	delu.z = pl0[1].z - pl0[0].z;
	delv.x = pl0[2].x - pl0[0].x;
	delv.y = pl0[2].y - pl0[0].y;
	delv.z = pl0[2].z - pl0[0].z;
	VEC.cross3d(delu,delv,nrm0);
	delu.x = pl1[1].x - pl1[0].x;
	delu.y = pl1[1].y - pl1[0].y;
	delu.z = pl1[1].z - pl1[0].z;
	delv.x = pl1[2].x - pl1[0].x;
	delv.y = pl1[2].y - pl1[0].y;
	delv.z = pl1[2].z - pl1[0].z;
	VEC.cross3d(delu,delv,nrm1);
	VEC.cross3d(nrm0,nrm1,crs);
	del.x = res1.x - res0.x;
	del.y = res1.y - res0.y;
	del.z = res1.z - res0.z;
	if (VEC.dot3d(crs,del) < 0) {
		t.copy(res0);
		res0.copy(res1);
		res1.copy(t);
	}
	return true;
};

// returns pairs of points (line segs)
//static private int[][] pntplnidx   [6][3]   ={
CollUtil.pntplnidx = [
	[0,1,2],
	[4,6,5],
	[0,4,1],
	[2,3,6],
	[0,2,4],
	[1,5,3],
];

//static int box2box(VEC[] b0,VEC[] b1,VEC[] res)
CollUtil.box2box = function(b0,b1,res) { // return int, number of points involved
	var i,j,k; // int
	var npnts = 0; // int
//	VEC b0max,b1max,b0min,b1min;
	//VEC pln0[3],pln1[3];
	for (j=0;j<6;j++) {
		for (k=0;k<3;k++)
			CollUtil.pln1[k].copy(b1[CollUtil.pntplnidx[j][k]]);
		for (i=0;i<6;i++) {
			for (k=0;k<3;k++)
				CollUtil.pln0[k].copy(b0[CollUtil.pntplnidx[i][k]]);
			if (CollUtil.plane2plane(CollUtil.pln0,CollUtil.pln1,res[npnts],res[npnts + 1]))
				npnts += 2;
		}
	}
	if (npnts < 4 && npnts > 0) {
//		logger("box2box with <4 points %d\n",npnts);
		return 0;
	}
	return npnts;
};
