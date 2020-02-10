PrimColl = {};

PrimColl.MAXF = 1000;
PrimColl.MAXV = 1000;

PrimColl.checkw = function(p) { // phyobject
	var j; // int
	if (!p.haswf) {
		for (j=0;j<p.nwpnts;j++) {
			p.wpnts[j].x = p.scale.x*p.lpnts[j].x;
			p.wpnts[j].y = p.scale.y*p.lpnts[j].y;
			p.wpnts[j].z = p.scale.z*p.lpnts[j].z;
		}
		VECQuat.quatrots(p.st.rot,p.wpnts,p.wpnts,p.nwpnts);
		for (j=0;j<p.nwpnts;j++) {
			p.wpnts[j].x += p.st.pos.x;
			p.wpnts[j].y += p.st.pos.y;
			p.wpnts[j].z += p.st.pos.z;
		}
	}
};

// phyobject p, VEC ploc, VEC pnorm, VEC cloc, returns separation
// and location in cloc
PrimColl.meshplane = function(p,ploc,pnorm,cloc) {
	var dot; // float
	var cnt = 0; // int
	var sep, minsep = 1e20; // float
	var i; // int
	var badcnt = 0; // int
	var pdot = VEC.dot3d(pnorm,ploc);
	PrimColl.checkw(p);
	cloc.clear();
	for (i = 0; i < p.nwpnts; i++) {
		dot = VEC.dot3d(pnorm,p.wpnts[i]);
		sep = dot - pdot;
		if (sep < minsep)
			minsep = sep;
		if (sep <= 0) {
			cloc.x += p.wpnts[i].x - sep*pnorm.x;
			cloc.y += p.wpnts[i].y - sep*pnorm.y;
			cloc.z += p.wpnts[i].z - sep*pnorm.z;
			badcnt++;
		}
	}
	if (minsep <= 0) {
		cloc.x /= badcnt;
		cloc.y /= badcnt;
		cloc.z /= badcnt;
	}
	return minsep;
};
