ObjCollisions ={};

// bbox code

ObjCollisions.MAX3DBOX = 100;

function bbox3d() {
	this.b = new VEC();
	this.e = new VEC();
}

function colpair3d() {
	//var a,b;	// a < b //int
	this.a = 0; // not set yet
	this.b = 0;
}

colpair3d.prototype.copy = function(rhs) {
	this.a = rhs.a;
	this.b = rhs.b;
};

// don't need to do this, just more organized
ObjCollisions.bboxs3d;// = new bbox3d[MAX3DBOX];

ObjCollisions.colltab; // int[][]
ObjCollisions.colltabidx;// = new int[MAX3DBOX][MAX3DBOX];

ObjCollisions.colltabx; // int[][]
ObjCollisions.colltaby; // int[][]
ObjCollisions.colltabz; // int[][]

ObjCollisions.ncolpairs; // int
ObjCollisions.colpairs3d;// = new colpair3d[MAX3DBOX*MAX3DBOX];
// odd is end
// even is start
// / 2 is boxnum
ObjCollisions.sweepx; // int[]
ObjCollisions.sweepy; // int[]
ObjCollisions.sweepz; // int[]

ObjCollisions.nboxes; // int

ObjCollisions.init3dbboxes = function(nb) { // int
	var i; // int
	var arr = createArray(3,4,5);
	arr[2][3][4] = 99;
	var arrc = clone(arr);
	arrc[2][3][4] = 1414;
	logger("made arr " + arr);
	var org = [3,{x:5,y:4},11,"hi"];
	var cln = clone(org);
	logger("tested clone once again");
	
    ObjCollisions.bboxs3d = createArray(ObjCollisions.MAX3DBOX); //new bbox3d[ObjCollisions.MAX3DBOX];
    ObjCollisions.colltabidx = createArray(ObjCollisions.MAX3DBOX,ObjCollisions.MAX3DBOX); //new int[ObjCollisions.MAX3DBOX][ObjCollisions.MAX3DBOX];
	for (i=0;i<ObjCollisions.MAX3DBOX;i++)
		ObjCollisions.colltabidx[i].fill(0);
    ObjCollisions.colpairs3d = createArray(ObjCollisions.MAX3DBOX*ObjCollisions.MAX3DBOX); //new colpair3d[ObjCollisions.MAX3DBOX*ObjCollisions.MAX3DBOX];
	if (nb > ObjCollisions.MAX3DBOX)
		alert("set MAX3DBBOX higher, max " + ObjCollisions.MAX3DBOX + ", wanted " + nb);
	ObjCollisions.nboxes = nb;
	ObjCollisions.sweepx = createArray(ObjCollisions.MAX3DBOX*2); //new int[ObjCollisions.MAX3DBOX*2];
	ObjCollisions.sweepy = createArray(ObjCollisions.MAX3DBOX*2); //new int[ObjCollisions.MAX3DBOX*2];
	ObjCollisions.sweepz = createArray(ObjCollisions.MAX3DBOX*2); //new int[ObjCollisions.MAX3DBOX*2];
	for (i=0;i<ObjCollisions.nboxes*2;i++)
		ObjCollisions.sweepx[i] = i;
	ObjCollisions.colltabx = createArray(ObjCollisions.MAX3DBOX,ObjCollisions.MAX3DBOX); //new int[ObjCollisions.MAX3DBOX][ObjCollisions.MAX3DBOX];
	for (i=0;i<ObjCollisions.MAX3DBOX;i++)
		ObjCollisions.colltabx[i].fill(0);
	for (i=0;i<ObjCollisions.nboxes*2;i++)
		ObjCollisions.sweepy[i] = i;
	ObjCollisions.colltaby = createArray(ObjCollisions.MAX3DBOX,ObjCollisions.MAX3DBOX); //new int[ObjCollisions.MAX3DBOX][ObjCollisions.MAX3DBOX];
	for (i=0;i<ObjCollisions.MAX3DBOX;i++)
		ObjCollisions.colltaby[i].fill(0);
	for (i=0;i<ObjCollisions.nboxes*2;i++)
		ObjCollisions.sweepz[i] = i;
	ObjCollisions.colltabz = createArray(ObjCollisions.MAX3DBOX,ObjCollisions.MAX3DBOX); //new int[ObjCollisions.MAX3DBOX][ObjCollisions.MAX3DBOX];
	for (i=0;i<ObjCollisions.MAX3DBOX;i++)
		ObjCollisions.colltabz[i].fill(0);
	ObjCollisions.colltab = createArray(ObjCollisions.MAX3DBOX,ObjCollisions.MAX3DBOX); //new int[ObjCollisions.MAX3DBOX][ObjCollisions.MAX3DBOX];
	for (i=0;i<ObjCollisions.MAX3DBOX;i++)
		ObjCollisions.colltab[i].fill(0);
	ObjCollisions.ncolpairs = 0;
	for (i=0;i<ObjCollisions.MAX3DBOX;++i)
		ObjCollisions.bboxs3d[i] = new bbox3d();
	for (i=0;i<ObjCollisions.MAX3DBOX*ObjCollisions.MAX3DBOX;++i) {
		ObjCollisions.colpairs3d[i] = new colpair3d();
	}
};

ObjCollisions.collide3dboxes = function() {
	var i,j,k,old; // int
	var ise0,ise1,bn0,bn1; // int
	var p0,p1; // float
	// do x
	//logger("do x");
	for (k=0;k<ObjCollisions.nboxes*2-1;k++) {
		for (i=k;i>=0;i--) {
			bn0 = ObjCollisions.sweepx[i];
			bn1 = ObjCollisions.sweepx[i+1];
			ise0 = bn0&1;
			ise1 = bn1&1;
			bn0 >>= 1;
			bn1 >>= 1;
			if (ise0 != 0)
				p0 = ObjCollisions.bboxs3d[bn0].e.x;
			else
				p0 = ObjCollisions.bboxs3d[bn0].b.x;
			if (ise1 != 0)
				p1 = ObjCollisions.bboxs3d[bn1].e.x;
			else
				p1 = ObjCollisions.bboxs3d[bn1].b.x;
			if (p0 > p1) {
				j = ObjCollisions.sweepx[i];
				ObjCollisions.sweepx[i] = ObjCollisions.sweepx[i+1];
				ObjCollisions.sweepx[i+1] = j;
				if ((ise0^ise1) != 0) {
					ObjCollisions.colltabx[bn0][bn1] ^= 1;
					ObjCollisions.colltabx[bn1][bn0] ^= 1;
					old = ObjCollisions.colltab[bn0][bn1];
					ObjCollisions.colltab[bn0][bn1] = ObjCollisions.colltab[bn1][bn0] =
						ObjCollisions.colltabx[bn0][bn1]&ObjCollisions.colltaby[bn0][bn1]&ObjCollisions.colltabz[bn0][bn1];
					if (ObjCollisions.colltab[bn0][bn1] != 0 && old == 0) {
						ObjCollisions.colltabidx[bn0][bn1] = ObjCollisions.colltabidx[bn1][bn0] = ObjCollisions.ncolpairs;
						if (bn0 < bn1) {
							ObjCollisions.colpairs3d[ObjCollisions.ncolpairs].a = bn0;
							ObjCollisions.colpairs3d[ObjCollisions.ncolpairs].b = bn1;
						} else {
							ObjCollisions.colpairs3d[ObjCollisions.ncolpairs].a = bn1;
							ObjCollisions.colpairs3d[ObjCollisions.ncolpairs].b = bn0;
						}
						ObjCollisions.ncolpairs++;
					} else if (ObjCollisions.colltab[bn0][bn1] == 0 && old != 0) {
						var oidx = ObjCollisions.colltabidx[bn0][bn1]; // int
						ObjCollisions.ncolpairs--;
						var cp = ObjCollisions.colpairs3d[ObjCollisions.ncolpairs]; // colpair3d
						ObjCollisions.colpairs3d[oidx].copy(cp);
						ObjCollisions.colltabidx[cp.a][cp.b] = ObjCollisions.colltabidx[cp.b][cp.a] = oidx;
					}
				}
			} else
				break;
		}
	}
	// do y
	//logger("do y");
	for (k=0;k<ObjCollisions.nboxes*2-1;k++) {
		for (i=k;i>=0;i--) {
			bn0 = ObjCollisions.sweepy[i];
			bn1 = ObjCollisions.sweepy[i+1];
			ise0 = bn0&1;
			ise1 = bn1&1;
			bn0 >>= 1;
			bn1 >>= 1;
			if (ise0 != 0)
				p0 = ObjCollisions.bboxs3d[bn0].e.y;
			else
				p0 = ObjCollisions.bboxs3d[bn0].b.y;
			if (ise1 != 0)
				p1 = ObjCollisions.bboxs3d[bn1].e.y;
			else
				p1 = ObjCollisions.bboxs3d[bn1].b.y;
			if (p0 > p1) {
				j = ObjCollisions.sweepy[i];
				ObjCollisions.sweepy[i] = ObjCollisions.sweepy[i+1];
				ObjCollisions.sweepy[i+1] = j;
				if ((ise0^ise1) != 0) {
					ObjCollisions.colltaby[bn0][bn1] ^= 1;
					ObjCollisions.colltaby[bn1][bn0] ^= 1;
					old = ObjCollisions.colltab[bn0][bn1];
					ObjCollisions.colltab[bn0][bn1] = ObjCollisions.colltab[bn1][bn0] =
						ObjCollisions.colltabx[bn0][bn1]&ObjCollisions.colltaby[bn0][bn1]&ObjCollisions.colltabz[bn0][bn1];
					if (ObjCollisions.colltab[bn0][bn1] != 0 && old == 0) {
						ObjCollisions.colltabidx[bn0][bn1] = ObjCollisions.colltabidx[bn1][bn0] = ObjCollisions.ncolpairs;
						if (bn0 < bn1) {
							ObjCollisions.colpairs3d[ObjCollisions.ncolpairs].a = bn0;
							ObjCollisions.colpairs3d[ObjCollisions.ncolpairs].b = bn1;
						} else {
							ObjCollisions.colpairs3d[ObjCollisions.ncolpairs].a = bn1;
							ObjCollisions.colpairs3d[ObjCollisions.ncolpairs].b = bn0;
						}
						ObjCollisions.ncolpairs++;
					} else if (ObjCollisions.colltab[bn0][bn1] == 0 && old != 0) {
						var oidx = ObjCollisions.colltabidx[bn0][bn1]; // int
						ObjCollisions.ncolpairs--;
						var cp = ObjCollisions.colpairs3d[ObjCollisions.ncolpairs]; // colpair3d
						ObjCollisions.colpairs3d[oidx].copy(cp);
						ObjCollisions.colltabidx[cp.a][cp.b] = ObjCollisions.colltabidx[cp.b][cp.a] = oidx;
					}
				}
			} else
				break;
		}
	}
	// do z
	//logger("do z");
	for (k=0;k<ObjCollisions.nboxes*2-1;k++) {
		for (i=k;i>=0;i--) {
			bn0 = ObjCollisions.sweepz[i];
			bn1 = ObjCollisions.sweepz[i+1];
			ise0 = bn0&1;
			ise1 = bn1&1;
			bn0 >>= 1;
			bn1 >>= 1;
			if (ise0 != 0)
				p0 = ObjCollisions.bboxs3d[bn0].e.z;
			else
				p0 = ObjCollisions.bboxs3d[bn0].b.z;
			if (ise1 != 0)
				p1 = ObjCollisions.bboxs3d[bn1].e.z;
			else
				p1 = ObjCollisions.bboxs3d[bn1].b.z;
			if (p0 > p1) {
				j = ObjCollisions.sweepz[i];
				ObjCollisions.sweepz[i] = ObjCollisions.sweepz[i+1];
				ObjCollisions.sweepz[i+1] = j;
				if ((ise0^ise1) != 0) {
					ObjCollisions.colltabz[bn0][bn1] ^= 1;
					ObjCollisions.colltabz[bn1][bn0] ^= 1;
					old = ObjCollisions.colltab[bn0][bn1];
					ObjCollisions.colltab[bn0][bn1] = ObjCollisions.colltab[bn1][bn0] =
						ObjCollisions.colltabx[bn0][bn1]&ObjCollisions.colltaby[bn0][bn1]&ObjCollisions.colltabz[bn0][bn1];
					if (ObjCollisions.colltab[bn0][bn1] != 0 && old == 0) {
						ObjCollisions.colltabidx[bn0][bn1] = ObjCollisions.colltabidx[bn1][bn0]=ObjCollisions.ncolpairs;
						if (bn0 < bn1) {
							ObjCollisions.colpairs3d[ObjCollisions.ncolpairs].a = bn0;
							ObjCollisions.colpairs3d[ObjCollisions.ncolpairs].b = bn1;
						} else {
							ObjCollisions.colpairs3d[ObjCollisions.ncolpairs].a = bn1;
							ObjCollisions.colpairs3d[ObjCollisions.ncolpairs].b = bn0;
						}
						ObjCollisions.ncolpairs++;
					} else if (ObjCollisions.colltab[bn0][bn1] == 0 && old != 0) {
						var oidx = ObjCollisions.colltabidx[bn0][bn1]; // int
						ObjCollisions.ncolpairs--;
						var cp = ObjCollisions.colpairs3d[ObjCollisions.ncolpairs]; // colpair3d
						ObjCollisions.colpairs3d[oidx].copy(cp);
						ObjCollisions.colltabidx[cp.a][cp.b] = ObjCollisions.colltabidx[cp.b][cp.a] = oidx;
					}
				}
			} else
				break;
		}
	}
};
