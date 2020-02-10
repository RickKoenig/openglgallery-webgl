// 2d physics with friction
var physics2d = {};

physics2d.text = "WebGL: 2d physics";

physics2d.title = "physics2d";

// test webgl
physics2d.backgroundtree;
physics2d.roottree;
physics2d.helpertree;
physics2d.mastertree;
physics2d.bt;
physics2d.nhelper = 0;
physics2d.nmaxhelper = 0;
physics2d.SX;// = glc.width;
physics2d.SY;// = glc.height;
physics2d.BX = 600;//20+(Math.random()*100);//300;
physics2d.BY = 500;//20+(Math.random()*100);//600;
physics2d.BASP = physics2d.BX / physics2d.BY;//Main3D.viewAsp;//1;

physics2d.aback = .5; // move everything back to see


// global time
//var time = 0;
physics2d.timestep = 1;
physics2d.timemul = 3;
//var laststep = false;

// global physics parameters

//physics2d.littleg = new Point2(0,0);
physics2d.littleg = new Point2(0,-.125);
//physics2d.littleg = new Point2(0,-.0125);
//physics2d.littleg = new Point2(-1,-2.25);
physics2d.vdamp = .995;//.95; // velocity damp
physics2d.rvdamp = .995; // rot velocity damp

physics2d.elast = .65;//1;//.7;//1;//.5; //1;//.95; //1;
physics2d.ustatic = .3;
physics2d.udynamic = .25;
//physics2d.elastfric = true; // conservative friction
physics2d.elastfric = false;

//physics2d.physics2d.norot = true; // make moi infinite
physics2d.norot = false;

physics2d.littlegm2 = sdot2vv(physics2d.littleg,physics2d.littleg);

// total energies
physics2d.penergy = 0;
physics2d.kenergy = 0;
physics2d.renergy = 0;
physics2d.tenergy = 0;

physics2d.types = {"Shape":-1,"Wall":0,"Plank":1,"Ball":2,"num":3};

physics2d.shapes = [];// = new Array();
physics2d.maxshapes = 100;
physics2d.minshapes;
physics2d.NRECTPOINTS = 4;

physics2d.initpoints = function() {
	logger("init points\n");
        physics2d.helpertree = new Tree2("helpertree");
        physics2d.helpertree.trans = [0,0,physics2d.aback];
        physics2d.mastertree = buildplanexy("mastertree",1,1,"ball1.png","tex");
        physics2d.mastertree.name = "mastertree";
        physics2d.mastertree.mod.flags &= ~modelflagenums.NOZBUFFER; // turn off zbuffer
};

physics2d.setupcircle = function(t,x,y,rot,rad) {
	t.rot = [0, 0, rot];
	t.trans = [x/physics2d.BY - .5*physics2d.BX/physics2d.BY, y/physics2d.BY - .5, 0];
	t.scale = [rad/physics2d.BY, rad/physics2d.BY, 1];
};

physics2d.drawpoint = function(pos,rad) {
        //float tbr = 2*rad;
        var ht = physics2d.mastertree.newdup();
        //circle1->trans.x = -.5f;
        physics2d.setupcircle(ht,pos.x,pos.y,Math.PI*(1.0/16.0),rad);
        //		6);
        physics2d.helpertree.linkchild(ht);
	
};

physics2d.resetpoints = function() {
	physics2d.helpertree.glfree();
	physics2d.helpertree = new Tree2("helpertree");
	physics2d.helpertree.trans = [0,0,physics2d.aback]; // move this in line with background
	physics2d.nhelper = 0;
};

physics2d.exitpoints = function() {
	physics2d.helpertree.glfree();
	physics2d.helpertree = null;
	physics2d.mastertree.glfree();
	physics2d.mastertree = null;
	physics2d.nhelper = 0;
	physics2d.nmaxhelper = 0;
};

physics2d.Wall = function(x,y,nx,ny) {
	physics2d.shapes.push(this);
	//if (physics2d.shapes.length == physics2d.maxshapes)
	//	return;
	if (!x)
		x = 0;
	if (!y)
		y = 0;
	var pos = new Point2(x,y);
	var norm = new Point2(nx,ny);
	normalize2d(norm);
	this.vel = new Point2(0,0);
	this.invmass = 0;
	this.invmoi = 0;
	this.norm = norm;
	this.d = sdot2vv(pos,norm);
	this.kind = physics2d.types.Wall;
};

physics2d.Wall.prototype.draw = function() {
	
};

physics2d.Ball = function(m,x,y,r,vx,vy,vr,rad) {
	//if (physics2d.shapes.length == physics2d.maxshapes)
	//	return;
	physics2d.shapes.push(this);
	var im;
	if (m != 0)
		im = 1/m;
	else
		im = m;
	if (!x)
		x = 0;
	if (!y)
		y = 0;
	if (!r)
		r = 0;
	if (!vx)
		vx = 0;
	if (!vy)
		vy = 0;
	if (!vr)
		vr = 0;
	if (!rad)
		rad = 10;
	this.invmass = im;
	if (im) {
		this.invmoi = 2*im/(rad*rad);
	}
	if (physics2d.norot)
		this.invmoi = 0;
	this.pos = new Point2(x,y);
	this.rot = r;
	this.vel = new Point2(vx,vy);
	this.rotvel = vr;
	this.rad = rad;
	this.kind = physics2d.types.Ball;
	
			this.t = buildplanexy("ball",1,1,"ball5.png","tex");
            this.t.name = "circle1";
            this.t.mod.flags |= modelflagenums.NOZBUFFER; // turn off zbuffer
            this.setupball();
			physics2d.roottree.linkchild(this.t);	
};

physics2d.Ball.prototype.draw = function() {
	this.setupball();
};

physics2d.Ball.prototype.setupball = function() {
	this.t.rot = [0, 0, this.rot];
	this.t.trans = [this.pos.x/physics2d.BY - .5*physics2d.BX/physics2d.BY, this.pos.y/physics2d.BY - .5, 0];
	this.t.scale = [this.rad/physics2d.BY, this.rad/physics2d.BY, 1];
};

physics2d.setupplank = function() {
	this.t.rot = [0,0,this.rot];
	this.t.trans = [this.pos.x/physics2d.BY - .5*physics2d.BX/physics2d.BY, this.pos.y/physics2d.BY - .5, 0];
	this.t.scale = [this.w/physics2d.BY/2,this.h/physics2d.BY/2,1];
};

physics2d.calcpr = function(b) {
	b.p[0].x = -.5*b.w;
	b.p[0].y =  .5*b.h;
	b.p[1].x =  .5*b.w;
	b.p[1].y =  .5*b.h;
	b.p[2].x =  .5*b.w;
	b.p[2].y = -.5*b.h;
	b.p[3].x = -.5*b.w;
	b.p[3].y = -.5*b.h;
	rotpoints2d(b.p,b.pr,b.rot,physics2d.NRECTPOINTS);
	var i;
	for (i=0;i<physics2d.NRECTPOINTS;++i) {
		b.pr[i] = vadd2vv(b.pr[i],b.pos);
	}
};

physics2d.Plank = function(m,x,y,r,vx,vy,vr,w,h) {
	//if (physics2d.shapes.length == physics2d.maxshapes)
	//	return;
	physics2d.shapes.push(this);
	var im;
	if (m != 0)
		im = 1/m;
	else
		im = m;
	if (!x)
		x = 0;
	if (!y)
		y = 0;
	if (!r)
		r = 0;
	if (!vx)
		vx = 0;
	if (!vy)
		vy = 0;
	if (!vr)
		vr = 0;
	if (!w)
		w = 20;
	if (!h)
		h = 20;
	this.invmass = im;
	if (im) {
		this.invmoi = 12*im/(w*w+h*h);
	}
	if (physics2d.norot)
		this.invmoi = 0;
	this.pos = new Point2(x,y);
	this.rot = r;
	this.vel = new Point2(vx,vy);
	this.rotvel = vr;
	this.w = w;
	this.h = h;
	//this.stype = "Plank";
	//this.show = plankshow;
	//this.draw = plankdraw;
	this.p = [new Point2(),new Point2(),new Point2(),new Point2()];
	this.pr = [new Point2(),new Point2(),new Point2(),new Point2()];
	this.kind = physics2d.types.Plank;
          
			this.t = buildplanexy("plank",1,1,"plank3.png","tex");
            this.t.name = "plank1";
            this.t.mod.flags |= modelflagenums.NOZBUFFER; // turn off zbuffer
            this.setupplank();
            physics2d.roottree.linkchild(this.t); 
};

physics2d.Plank.prototype.setupplank = function() {
	this.t.rot = [0,0,this.rot];
	this.t.trans = [this.pos.x/physics2d.BY - .5*physics2d.BX/physics2d.BY, this.pos.y/physics2d.BY - .5, 0];
	this.t.scale = [this.w/physics2d.BY/2,this.h/physics2d.BY/2,1];
};

physics2d.Plank.prototype.draw = function() {
	this.setupplank();
};
/*
physics2d.scaleOrient = function(tree) {
};
*/

physics2d.collinfo = {};


physics2d.fixupcp = function(cp,nrm,penm) {
	cp.x += nrm.x*penm;
	cp.y += nrm.y*penm;
};

// specific collisions
// sets collinfo object
physics2d.wall2wall = function(a,b) {
	//logger_str += "(wall2wall )";
	return false;
};

// sets collinfo object
physics2d.plank2wall = function(sp,sw) {
	//logger_str += "plank2wall )";
	//return false;
	var newcp = true;
	if (newcp) { // new way, better with deeper penetration
		var i;
		var sum = new Point2(0,0);
		var npnt = 0;
		for (i=0;i<physics2d.NRECTPOINTS;++i) { // take all the points that are penetrating and find the deepest one
			var vert = sp.pr[i];
			//var vert = vadd2vv(sp.pr[i],sp.pos);
			var penm = sw.d - sdot2vv(vert,sw.norm);
			if (penm > 0) {
				// vert COLLIDING
				sum = vadd2vv(sum,vert);
				++npnt;
			}
		}
		if (npnt) {
			// run through all the intersections
			physics2d.collinfo.cn = sw.norm;
			npnt = 1.0 / npnt;
			sum.x *= npnt;
			sum.y *= npnt;
			var penm = sw.d - sdot2vv(sum,sw.norm);
			physics2d.collinfo.penm = penm;
			physics2d.collinfo.cp = new Point2(sum.x,sum.y);
			return true;
		}
		return false;
	} else { // old way
		var i;
		var sum = new Point2(0,0);
		var bestvert;
		var bestpenm = 0;
		for (i=0;i<physics2d.NRECTPOINTS;++i) { // take all the points that are penetrating and find the deepest one
			var vert = sp.pr[i];
			//var vert = vadd2vv(sp.pr[i],sp.pos);
			var penm = sw.d - sdot2vv(vert,sw.norm);
			if (penm > 0) {
				// vert COLLIDING
				if (penm > bestpenm) {
					bestpenm = penm;
					bestvert = vert;
				}
			}
		}
		if (bestpenm > 0) {
			physics2d.collinfo.cn = sw.norm;
			physics2d.collinfo.penm = bestpenm;
			physics2d.collinfo.cp = new Point2(bestvert.x,bestvert.y);
			fixupcp(collinfo.cp,sw.norm,bestpenm);
			return true;
		}
		return false;
	}
};

physics2d.move = [{"x":0,"y":1},{"x":0,"y":-1},{"x":1,"y":0},{"x":-1,"y":0}];
physics2d.arr = [
	[],
	[],
	[],
	[]
]; //pointf2 arr[physics2d.NRECTPOINTS][physics2d.NRECTPOINTS];
physics2d.warr = []; //pointi2 warr[physics2d.NRECTPOINTS+physics2d.NRECTPOINTS];

// sets collinfo object
physics2d.plank2plank = function(a,b) {
	//logger_str += "plank2plank )";
	//return false;
	//logger_str += "(plank2plank )";
	var i,j;
	// build 2d array of differences
	// TODO need an early out (AABB)
	for (j=0;j<physics2d.NRECTPOINTS;++j) {
		for (i=0;i<physics2d.NRECTPOINTS;++i) {
//			var new Point2()
//			pointf2x diff(a.pr[i].x-b.pr[j].x,a.pr[i].y-b.pr[j].y);
			physics2d.arr[j][i] = vsub2vv(a.pr[i],b.pr[j]);
		}
	}
	var wi = 0; // walk
	var wj = 0;
	var wp = physics2d.arr[0][0];
	// find lowest y value, then lowest x value (incase of 2 or more lowest y values)
	for (j=0;j<physics2d.NRECTPOINTS;++j) {
		for (i=0;i<physics2d.NRECTPOINTS;++i) {
			var lop = physics2d.arr[j][i];
			if (lop.y < wp.y || (lop.y == wp.y && lop.x < wp.x)) { // there should be no points at the same place
				wi = i;
				wj = j;
				wp = lop;
			}
		}
	}

	var wloc = new Point2(wi,wj); //pointi2x wloc(wi,wj);
	var widx = 0;
	// bool hilits[physics2d.NRECTPOINTS+physics2d.NRECTPOINTS]; // used just for drawing
	// ::fill(hilits,hilits+physics2d.NRECTPOINTS+physics2d.NRECTPOINTS,false);
	physics2d.warr[widx++] = wloc;
	var wang = 0;
	// walk thru the points, doing gift wrapping
 
	while(widx < physics2d.NRECTPOINTS+physics2d.NRECTPOINTS) {
		// try the 4 'nearest' points (by connection, not distance)
		var k;
		var bestk=0;
		var nwi,nwj;
		var bestang = 5; // bigger than any angle 0-4
		for (k=0;k<physics2d.NRECTPOINTS;++k) { // use the one with the lowest angle
			nwi = (wi + physics2d.move[k].x + physics2d.NRECTPOINTS)%physics2d.NRECTPOINTS;
			nwj = (wj + physics2d.move[k].y + physics2d.NRECTPOINTS)%physics2d.NRECTPOINTS;
			var pdest = physics2d.arr[nwj][nwi];
			//logger("wp = " + wp.x + "," + wp.y + " pdest = " + pdest.x + "," + pdest.y + "\n");
			var ang = cheapatan2delta(wp,pdest);
			//logger("k = " + k + ", ang = " + ang + ", wang = " + wang + ", bestang = " + bestang + "\n");
			if (ang <= bestang && ang >= wang) {
				bestk = k;
				bestang = ang;
				//logger("new best k = " + k + ", best ang = " + bestang + "\n",bestk,bestang);
			}
		}
		nwi = (wi + physics2d.move[bestk].x + physics2d.NRECTPOINTS)%physics2d.NRECTPOINTS;
		nwj = (wj + physics2d.move[bestk].y + physics2d.NRECTPOINTS)%physics2d.NRECTPOINTS;
		//logger("warr[" + widx + "] = " + nwi + "," + nwj);
		physics2d.warr[widx++] = new Point2(nwi,nwj);
		wi = nwi;
		wj = nwj;
		wp = physics2d.arr[wj][wi];
		wang = bestang;
	} 
	var bestpen = 1e20;
	var bestidx = 0;
	var coll = false;
	var bestnrm = null;

	// got 8 points, find if inside and if so find closest line with 2 points
	for (i=0;i<physics2d.NRECTPOINTS+physics2d.NRECTPOINTS;++i) {
		j = (i+1)%(physics2d.NRECTPOINTS+physics2d.NRECTPOINTS);
		var p0 = physics2d.arr[physics2d.warr[i].y][physics2d.warr[i].x];
		var p1 = physics2d.arr[physics2d.warr[j].y][physics2d.warr[j].x];
		var pd = vsub2vv(p1,p0);
		var nrm = new Point2(pd.y,-pd.x);
		normalize2d(nrm);
		var d = sdot2vv(nrm,p0);
		if (d <= 0) { // no collision
			coll = false;
			break;
		}
		var d1 = sdot2vv(p0,pd);
		var d2 = sdot2vv(p1,pd);
		if (d < bestpen && ((d1 >= 0 && d2<= 0) || (d1 <= 0 && d2 >= 0))) { 
			// left of line segment and a line from point intersects line segment at 90 degrees
			bestpen = d;
			bestidx = i;
			bestnrm = nrm;
			coll = true;
		}
	}
	// find line segment and point
	if (coll) {
		i = bestidx;
		j = (i+1)%(physics2d.NRECTPOINTS+physics2d.NRECTPOINTS);
		bestnrm.x = -bestnrm.x;
		bestnrm.y = -bestnrm.y;
		physics2d.collinfo.cn = bestnrm;
		var pen = bestpen;
		var cp;
		var newcp = true;
		if (newcp) {
 			// better for deeper penetrations
			// pick a more central collision point
			var paccum = new Point2(0,0);
			var pcnt = 0;
			cp = new Point2();
			// use all points inside and intersections
			for (i=0;i<physics2d.NRECTPOINTS;++i) {
				if (util_point2plank(b.pr[i],a)) {
					paccum.x += b.pr[i].x;
					paccum.y += b.pr[i].y;
					++pcnt;
				}
			}
			for (i=0;i<physics2d.NRECTPOINTS;++i) {
				if (util_point2plank(a.pr[i],b)) {
					paccum.x += a.pr[i].x;
					paccum.y += a.pr[i].y;
					++pcnt;
				}
			}
			var is = new Point2();
			for (i=0;i<physics2d.NRECTPOINTS;++i) {
				var la0 = a.pr[i];
				var la1 = a.pr[(i + 1)%physics2d.NRECTPOINTS];
				for (j=0;j<physics2d.NRECTPOINTS;++j) {
					var lb0 = b.pr[j];
					var lb1 = b.pr[(j + 1)%physics2d.NRECTPOINTS];
					if (getintersection2d(la0,la1,lb0,lb1,is)) {
						paccum.x += is.x;
						paccum.y += is.y;
						++pcnt;
					}
				}
			}
			if (!pcnt)
				undefined("pcnt == 0");
			pcnt = 1.0 / pcnt;
			cp.x = paccum.x * pcnt;
			cp.y = paccum.y * pcnt;			
			physics2d.collinfo.cp = cp;
		} else {
			if (warr[i].x == physics2d.warr[j].x) { // same point in a
				var cp2 = a.pr[physics2d.warr[i].x];
				cp = new Point2(cp2.x,cp2.y);
			} else if (physics2d.warr[i].y == physics2d.warr[j].y) { // same point in b
				var cp2 = b.pr[physics2d.warr[i].y];
				cp = new Point2(cp2.x,cp2.y);
				cp.x -= pen * bestnrm.x;
				cp.y -= pen * bestnrm.y;
			} else { // what ??
				//cp = pointf2x(3,3);
				error("what");
			}
			physics2d.collinfo.cp = cp;
			fixupcp(collinfo.cp,bestnrm,pen);
		}
		physics2d.collinfo.penm = pen;
	}
	return coll;
};

// sets collinfo object
physics2d.ball2wall = function(sb,sw) {
	//logger_str += "ball2wall )";
	//return false;
	//return false;
	//logger_str += "(ball2wall )";
	var penm = sw.d + sb.rad - sdot2vv(sb.pos,sw.norm);
	if (penm <= 0)
		return false;
	// COLLIDING
	physics2d.collinfo.cn = sw.norm; // normal 
	physics2d.collinfo.penm = penm;
	physics2d.collinfo.cp = vmul2sv(-sb.rad,sw.norm);
	physics2d.collinfo.cp = vadd2vv(physics2d.collinfo.cp,sb.pos);
	physics2d.fixupcp(physics2d.collinfo.cp,sw.norm,penm);
	return true;
};

// sets collinfo object
physics2d.ball2plank = function(b,a) {
	//logger_str += "ball2plank )";
	//return false;
	//logger_str += "(ball2plank )";
// TODO AABB early out
	var bestidx = 0;
	var coll = false;
	var bestnrm = new Point2();
	var bestpen = 1e20;
	var i,j;
//	see if ball is close to edge
	for (i=0;i<physics2d.NRECTPOINTS;++i) {
		j = (i+1)%(physics2d.NRECTPOINTS);
		var p0 = a.pr[i];
		var p1 = a.pr[j];
		var pd = vsub2vv(p1,p0);
		var nrm = new Point2(pd.y,-pd.x);
		normalize2d(nrm);
		var d = sdot2vv(nrm,p0); // line in d,nrm  format
		var pen = sdot2vv(nrm,b.pos) - d + b.rad;
		if (pen <= 0) {
			coll = false;
			break; // too far away, no collision
		}
		// now work 90 degrees from nrm
		var d1 = sdot2vv(p0,pd);
		var d2 = sdot2vv(p1,pd);
		var dp = sdot2vv(b.pos,pd);
//		if (pen < bestpen) { 
		if (pen < bestpen && ((d1 >= dp && d2<= dp) || (d1 <= dp && d2 >= dp))) { 
			// left of line segment and a line from point intersects line segment at 90 degrees
			bestpen = pen;
			bestidx = i;
			bestnrm = nrm;
			coll = true;
		}
	}
	//if (coll) 
	//	if (bestpen > 20)
	//		var q = 3.1;
	if (!coll && i == physics2d.NRECTPOINTS) { // check corners
		var bestdist2 = 1e20;
		for (i=0;i<physics2d.NRECTPOINTS;++i) {
			var del = vsub2vv(a.pr[i],b.pos);
			var dist2 = del.x*del.x + del.y*del.y;
			if (dist2 >= b.rad*b.rad)
				continue;
			if (dist2 < bestdist2) {
				bestdist2 = dist2;
				bestidx = i;
				coll = true;
			}
		}
		if (coll) {
			bestnrm = vsub2vv(a.pr[bestidx],b.pos);
			normalize2d(bestnrm); // this might be wrong, could be 0
			bestpen = b.rad - Math.sqrt(bestdist2);
			//if (bestpen > 20)
			//	var q = 3.1;
		}
	}
	if (coll) {
		physics2d.collinfo.penm = bestpen;
		physics2d.collinfo.cp = vmul2sv(b.rad,bestnrm);
		physics2d.collinfo.cp = vadd2vv(physics2d.collinfo.cp,b.pos);
		bestnrm.x = -bestnrm.x;
		bestnrm.y = -bestnrm.y;
		physics2d.collinfo.cn = bestnrm;
		physics2d.fixupcp(physics2d.collinfo.cp,bestnrm,bestpen);
	}
	return coll;
};

// sets collinfo object
physics2d.ball2ball = function(a,b) {
	//logger_str += "ball2ball )";
//	return false;
	//logger_str += "(ball2ball )";
	var del = vsub2vv(a.pos,b.pos);
	var dist2 = del.x*del.x + del.y*del.y;
	var rsum = a.rad + b.rad;
	if (dist2 >= rsum*rsum)
		return false;
	var d = Math.sqrt(dist2);
	//var nrm = del;
	//normalize2d(nrm);
	var nrm = vmul2sv(1/d,del);
	cp = vmul2sv(-a.rad,nrm);
	cp = vadd2vv(cp,a.pos);
	penm = rsum - Math.sqrt(dist2);
	physics2d.collinfo.penm = penm;
	physics2d.collinfo.cn = nrm;
	physics2d.collinfo.cp = cp;
	physics2d.fixupcp(physics2d.collinfo.cp,nrm,penm);
	return true;
};



physics2d.collmatrix = [
	[physics2d.wall2wall],
	[physics2d.plank2wall,physics2d.plank2plank],
	[physics2d.ball2wall,physics2d.ball2plank,physics2d.ball2ball]
];

physics2d.collide = function(sa,sb) {
	//return;
	// early out
	var tim = sa.invmass + sb.invmass;
	if (tim <= 0)
		return;
	// switch objects if necessary 
	var satype = sa.kind;
	var sbtype = sb.kind;
	if (satype < sbtype) {
		var t = sa;
		sa = sb;
		sb = t;
		var t = satype;
		satype = sbtype;
		sbtype = t;
	}
	// do the collision
	var res = physics2d.collmatrix[satype][sbtype](sa,sb);
	if (!res) // no collision
		return;
	var cn = physics2d.collinfo.cn; // normal of impulse from b to a
	var cp = physics2d.collinfo.cp; // where the collision took place
	var penm = physics2d.collinfo.penm; // how deep the collision was
	// display collision info
	var cp2 = vmul2sv(.5*penm,cn);
	cp2 = vadd2vv(cp2,cp);
	//if (laststep) {
		physics2d.drawpoint(cp,6);
		physics2d.drawpoint(cp2,3);
	//}
	// velocity update very long
	// calc rel vel
	var rveltrans = vsub2vv(sa.vel,sb.vel); // rel vel, trans part, a rel to b
	var rvelk = rveltrans;
	if (sa.invmoi) {
		var ra = vsub2vv(cp,sa.pos);
		var rva = vcross2zv(sa.rotvel,ra);
		rvelk = vadd2vv(rvelk,rva);
	}
	if (sb.invmoi) {
		var rb = vsub2vv(cp,sb.pos);
		var rvb = vcross2zv(sb.rotvel,rb);
		rvelk = vsub2vv(rvelk,rvb);
	}
	
	// calc k, the impulse
	var rvelm = -sdot2vv(rvelk,cn); // vel rel to -normal, should be positive
	if (rvelm <= 0)  // pen velocity
		return; // already moving away
	//  impulse formula
	var timm = tim;
	if (sa.invmoi) {
		var racn = scross2vv(ra,cn);
		timm += racn*racn*sa.invmoi;
	}
	if (sb.invmoi) {
		var rbcn = scross2vv(rb,cn);
		timm += rbcn*rbcn*sb.invmoi;
	}
	var k = (1+physics2d.elast)*rvelm/timm;

	// apply impulse maybe do later
	if (sa.invmass) {
		var dva = k*sa.invmass;
		var tva = vmul2sv(dva,cn);
		sa.vel = vadd2vv(sa.vel,tva);
	}
	if (sa.invmoi) {
		sa.rotvel += k*racn*sa.invmoi;
	}
	if (sb.invmass) {
		var dvb = k*sb.invmass;
		var tvb = vmul2sv(dvb,cn);
		sb.vel = vsub2vv(sb.vel,tvb);
	}
	if (sb.invmoi) {
		sb.rotvel -= k*rbcn*sb.invmoi;
	}
	// new friction
	var f = 0;
	if (physics2d.ustatic > 0) {
		// calc a new rvel
		var rvelf = rveltrans;
		if (sa.invmoi) {
			var ra = vsub2vv(cp,sa.pos);
			var rva = vcross2zv(sa.rotvel,ra);
			rvelf = vadd2vv(rvelf,rva);
		}
		if (sb.invmoi) {
			var rb = vsub2vv(cp,sb.pos);
			var rvb = vcross2zv(sb.rotvel,rb);
			rvelf = vsub2vv(rvelf,rvb);
		}
		// try a new direction of force here
		var tang = new Point2(cn.y,-cn.x); // 90 degrees to normal
		var rvelt = -sdot2vv(rvelf,tang);
		if (rvelt < 0) { // make sure force is opposite the rvelf
			rvelt = -rvelt;
			tang.x = -tang.x;
			tang.y = -tang.y;
		}
		if (rvelt > 0) {
			var timt = tim;
			if (sa.invmoi) {
				var racnt = scross2vv(ra,tang);
				timt += racnt*racnt*sa.invmoi;
			}
			if (sb.invmoi) {
				var rbcnt = scross2vv(rb,tang);
				timt += rbcnt*rbcnt*sb.invmoi;
			}
			if (physics2d.elastfric) {
				f = 2*rvelt/timt; // this f will bounce it back
			} else {
				f = rvelt/timt; // this f will stop objects
				var fs = k * physics2d.ustatic;
				if (f > fs) { // then slip
					var fd = k * physics2d.udynamic;
					f = fd;
				}
			}
		}
	}
	// apply new friction impulse
	if (f != 0) {
		if (sa.invmass) {
			var dvat = f*sa.invmass;
			var tvat = vmul2sv(dvat,tang);
			sa.vel = vadd2vv(sa.vel,tvat);
		}
		if (sa.invmoi) {
			sa.rotvel += f*racnt*sa.invmoi;
		}
		if (sb.invmass) {
			var dvbt = f*sb.invmass;
			var tvbt = vmul2sv(dvbt,tang);
			sb.vel = vsub2vv(sb.vel,tvbt);
		}
		if (sb.invmoi) {
			sb.rotvel -= f*rbcnt*sb.invmoi;
		}
	}
	// position update due to penetration, maybe do sooner
	var resolvepen = .1; // 0 to 1, 0 never, 1 instant
	if (sa.invmass) {
		var pena = resolvepen*penm*sa.invmass/tim;
		var tda = vmul2sv(pena,cn);
		sa.pos = vadd2vv(sa.pos,tda);
	}
	if (sb.invmass) {
		var penb = resolvepen*penm*sb.invmass/tim;
		var tdb = vmul2sv(penb,cn);
		sb.pos = vsub2vv(sb.pos,tdb);
	}
};

// run the physics etc


physics2d.procshapes = function(ts) {
	//return;
	physics2d.penergy = 0;
	physics2d.kenergy = 0;
	physics2d.renergy = 0;
	var i,j;
	// move all objects
	for (i=0;i<physics2d.shapes.length;++i) {
		var s = physics2d.shapes[i];
		// preprocess planks
		/*if (s.stype == "Plank") {
			physics2d.calcpr(s);
		}*/
		if (s.kind == physics2d.types.Plank)
			physics2d.calcpr(s);
		// move
		if (s.invmass <= 0)
			continue;	// can't move walls etc.
		// air friction
		s.vel = vmul2sv(physics2d.vdamp,s.vel); // beware, should be damp^ts, we'll see
		s.rotvel *= physics2d.rvdamp;
		// integrator
		// p1 = p0 + v0t + 1/2at^2
		var vt = vmul2sv(ts,s.vel);
		var at2 = vmul2sv(.5*ts*ts,physics2d.littleg);
		s.pos = vadd2vv(s.pos,vt);
		s.pos = vadd2vv(s.pos,at2);
		//s.pos.x += .1;
		// v1 = v0 + at
		var at = vmul2sv(ts,physics2d.littleg);
		s.vel = vadd2vv(s.vel,at);
		// rotate
		s.rot += ts*s.rotvel;
		s.rot = normalangrad(s.rot);
	}
	
	// do shape to shape collisions
	for (i=0;i<physics2d.shapes.length;++i) {
		var sa = physics2d.shapes[i];
		for (j=i+1;j<physics2d.shapes.length;++j) {
			var sb = physics2d.shapes[j];
			physics2d.collide(sa,sb);
		}
	}
	
	// update stats
	for (i=0;i<physics2d.shapes.length;++i) {
		var s = physics2d.shapes[i];
		if (s.invmass) {
			var m = 1/s.invmass;
			physics2d.penergy -= m*sdot2vv(s.pos,physics2d.littleg); // littleg is <0
			physics2d.kenergy += m*.5*sdot2vv(s.vel,s.vel);
		}
		if (s.invmoi) {
			physics2d.renergy += .5*s.rotvel*s.rotvel/s.invmoi;
		}
	}
	physics2d.tenergy = physics2d.penergy + physics2d.kenergy + physics2d.renergy;
};

    // move physics data to tree graphic hierarchy
physics2d.drawshapes = function() {
	var i;
	for (i=0;i<physics2d.shapes.length;++i) {
		var s = physics2d.shapes[i];
//		s.show(); // text
		s.draw(); // update graphic data with physics data
	}
	//drawpoint(new Point2(100,200),8);
};

physics2d.runResetPhysics2D = function() {
	logger("reset physics\n");
	changestate("physics2d");
};

physics2d.moreShapes = function() {
	logger("more shapes\n");
	var i;
	var ds = 1;
	for (i=0;i<ds;++i) {
		if ((physics2d.shapes.length % 2) == 1) {
			new physics2d.Ball(1,
				200,200,0,
				5,20*Math.random(),0,
				50*Math.random()+25
			);
		} else { 
			var w = 125*Math.random()+20;
			var h = 125*Math.random()+20;
			new physics2d.Plank(1,
				200,200,0,
//					5,15,0,
				5,20*Math.random(),0,
				w,h
			);
		} 
	}
};

physics2d.lessShapes = function() {
	logger("less shapes\n");
	var shp = physics2d.shapes.pop();
	if (shp.t) {
		shp.t.unlinkchild();
		shp.t.glfree();
	}
};

physics2d.freeshapes = function() {
	physics2d.shapes.length = 0;
};

// load these before init
physics2d.load = function() {
	preloadimg("../common/sptpics/take0005.jpg");
	preloadimg("../common/sptpics/ball1.png");
	preloadimg("../common/sptpics/ball5.png");
	preloadimg("../common/sptpics/plank3.png");
};

physics2d.test = function() {
	logger("start physics2d test\n");
	//window.foobar = 1;
	//foobar;
	if (window.foobar)
		logger("var foobar = " + foobar + "\n");
	else
		logger("var foobar not a global variable\n");
	foobar = 1;
	if (window.foobar)
		logger("var foobar = " + foobar + "\n");
	else
		logger("var foobar not a global variable\n");
	foobar = 2.718;
	logger("var foobar = " + foobar + "\n");
	foobar;
	logger("var foobar = " + foobar + "\n");
	foobar = "hi";
	logger("var foobar = " + foobar + "\n");
	foobar;
	logger("var foobar = " + foobar + "\n");
	logger("finish physics2d test\n");
};

physics2d.init = function() {
	physics2d.SX = glc.width;
	physics2d.SY = glc.height;
	physics2d.SASP = glc.width/glc.height;
	//testinheritance();
	physics2d.test();
	logger("entering webgl physics2d\n");
	physics2d.roottree = new Tree2("root");
	
	
	//testFunctionArrays();
	//Utils.pushandsetdir("physics2d");
	// main scene
	//physics2d.roottree = new Tree2("roottree");
	physics2d.roottree.trans = [0,0,physics2d.aback];
	physics2d.initpoints();

	physics2d.backgroundtree = new Tree2("backgroundtree");
	physics2d.backgroundtree.trans = [0,0,physics2d.aback];
	// build a prism
	logger("Screen (" + physics2d.SX + "," + physics2d.SY + ") asp = " + physics2d.SASP + ", Background (" + physics2d.BX + "," + physics2d.BY + ") asp = " + physics2d.BASP);

	// make width wider, landscape
	//Utils.pushandsetdir("common");
	//atree =  ModelUtil.buildplanexy("aplane",.5f* BASP,.5f, "caution.png", "tex"); // name, size, texture, generic texture shader
	physics2d.bt =  buildplanexy("aplaneb",.5*physics2d.BASP,.5, "take0005.jpg", "tex"); // name, size, texture, generic texture shader
	physics2d.bt.mod.flags |= modelflagenums.NOZBUFFER;
	//Utils.popdir();
	//if (true) {
	//physics2d.scaleOrient(physics2d.backgroundtree);
	//physics2d.scaleOrient(physics2d.roottree);
	//physics2d.scaleOrient(physics2d.helpertree);
	//atree.trans = [0,0,aback};
	physics2d.backgroundtree.linkchild(physics2d.bt); // link to and pass ownership to backgroundtree

	// TODO: should share models (refcount) not unique
	if (physics2d.shapes.length <= 4) {
		physics2d.shapes.length = 0;
		var setim = true;
		if (setim) {
			// immovable objects
			new physics2d.Wall(0, 0,
					1, 0
			);
			new physics2d.Wall(physics2d.BX, 0,
					-1, 0
			);
			new physics2d.Wall(0, 0,
					0, 1
			);
			new physics2d.Wall(0, physics2d.BY,
					0, -1
			);
			new physics2d.Plank(0,
					400, 200,  Math.PI * (3.0 / 2.0),
					0, 0, 0,
					150, 50
			);
		}
		physics2d.minshapes = physics2d.shapes.length;

		// movable objects
		var set1 = true;
		if (set1) {
			new physics2d.Plank(1,
					260,480,Math.PI*(1.0/16.0),
					0,-.5,0,
					150,50
			);
			new physics2d.Plank(1,
					200,380,Math.PI*(1.0/16.0),
					5,-.5,0,
					150,50
			);
			new physics2d.Ball(1,
					200,80,Math.PI*(1.0/16.0),
					2,-.5,-.8,
					50
			);
			new physics2d.Ball(1,
					200,180,Math.PI*(5.0/16.0),
					2,.5,0,
					20
			);
		}
		var set2 = false;
		if (set2) {
			new physics2d.Plank(0,
					200, 180, 0,
					0, 0, 0,
					150, 50
			);
			new physics2d.Ball(1,
					200, 240, 0,
					0, -3, 0,
					50
			);
		}
		var set3 = false;
		if (set3) {
			new physics2d.Plank(1,
					260, 360, Math.PI * (3.0 / 16.0),
					0, -2, 0,
					150, 50
			);
			new physics2d.Plank(1,
					200, 280, Math.PI * (0.0 / 16.0),
					0, 0, 0,
					150, 50
			);
		}
	}


	// move view back some using LHC
	//mainvp.trans = [0,0,-2]; // for mouse test
	// mainvp.trans = [1.31321,3.39566,-3.53785]; // flycam for barn, near clipping
	//	mainvp.trans = [0,0,0];
	mainvp.rot = [0,0,0]; // flycam
	mainvp.trans = [0,0,0];

	setbutsname("physics2d");
	makeaprintarea("change number of shapes");
	makeabut("Less Shapes",physics2d.lessShapes);
	makeabut("Reset",physics2d.runResetPhysics2D);
	makeabut("More Shapes",physics2d.moreShapes);
};

physics2d.proc = function() {
	// proc
	if (input.key == "r".charCodeAt(0))
		changestate("physics2d");
	var i;
	physics2d.resetpoints();
	var ts = physics2d.timestep / physics2d.timemul;
	//for (i=0;i<physics2d.timemul;++i) {
		physics2d.procshapes(ts);
	//}
    physics2d.drawshapes(); // move 2d positions to 3d trees
	doflycam(mainvp); // modify the trs of vp using flycam
	physics2d.roottree.proc();
	physics2d.helpertree.proc();
	// draw
	beginscene(mainvp);
	physics2d.backgroundtree.draw();
	physics2d.roottree.draw();
	physics2d.helpertree.draw();
};

physics2d.exit = function() {
    clearbuts("physics2d");
	
	logger("exiting physics2d\n");
	logger( "logging roottree\n");
	physics2d.roottree.log();
	logger( "logging backgroundtree\n");
	physics2d.backgroundtree.log();
	logger( "logging helpertree\n");
	physics2d.helpertree.log();
	logger( "logging mastertree\n");
	physics2d.mastertree.log();
	logger("logging reference lists\n");
	logrc(); // show all allocated resources
	// cleanup
	physics2d.freeshapes(); // maybe free tree's, if not, let glfree roottree do that
	physics2d.exitpoints();
	physics2d.roottree.glfree();
	physics2d.roottree = null;
	physics2d.backgroundtree.glfree();
	physics2d.backgroundtree = null;
	// show usage after cleanup
	logger("logging reference lists after free");
	logrc(); // show all allocated resources, should be clean
	//Utils.popdir();

/*	physics2d.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	physics2d.roottree.glfree();
	// show usage after cleanup
	logrc();
	physics2d.roottree = null; */
	
	logger("exiting webgl physics2d\n");
};

