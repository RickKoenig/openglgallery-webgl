// no more comma
// remove extra comma

// Qfield constructor, pass in Script object and highlight position
// OR just the number of qubits
qcomp.QField = function(sc_num,hlp) { // script and highlight position
	logger("--------------- Qfield constructor -----------------\n");
	if (typeof sc_num == 'number') { // basic no data constructor, just numqubits
		this.basic(sc_num);
		this.hilitpos = -1;
		return;
	}
	this.hilitpos = hlp;
	var sc = sc_num; // now assume it's a script
	var num = sc.data.length;
	var scwid = sc.read();
	var schit = sc.read();
	var prod = scwid*schit;
	logger("numtokens = " + num + ", width = " + scwid + ", hit = " + schit  + ", prod = " + prod + "\n");
	this.basic(schit);
	
	//qcomp.QField.version = {NO:0,VER1:1,VER2:2,VER3:3};
	var m = this.version.NO;
	var ex1 = scwid*schit + 2;
	if (num == ex1)
		m = this.version.VER1; // no ids
	var ex2 = 2*scwid*schit + 2;
	if (num == ex2)
		m = this.version.VER2; // added ids
	var ex3 = 2*scwid*schit + 2 + Number(scwid);
	if (num == ex3)
		m = this.version.VER3; // added linkbacks
	if (m == this.version.NO) { // no luck figuring out file format
		//errorexit("bad .qcmp file 1 '%s'",fname.c_str());
		logger("bad .qcmp version\n");
		return;
	} else {
		logger("good .qcmp version = " + m);
	}
	
	var i,j;
	// make some qcolumns and push those into the qfield
	if (scwid > this.maxcolumns)
		scwid = this.maxcolumns;
	for (i=0;i<scwid;++i) {
		this.qcolumns[i].glfree();
		var qc = new qcomp.QColumn(schit,i);
		for (j=0;j<schit;++j) {
			var qgs = sc.read();
			//var qg = Number(qgs);
			var gid = 6;
			if (m == this.version.VER2 || m == this.version.VER3)
				gid = Number(sc.read());

			//if (isdigit(qgs[0])) { // number, qgatebase::qtype
			//if (true) {
				//qc.changeqgatecol(j,qgatebase::qtype(qg),gid);
			//} else { // name
			qc.changeqgatecol(j,qgs,gid);
			//}
		}
		if (m == this.version.VER3) {
			var lb = Number(sc.read());
			qc.setlinkback(lb);
		}
		qc.calc();
		this.qcolumns[i] = qc;
	}
	this.calclinks();
	//this.fcalc();
	//logger("sizeof qcolumn = %d\n",sizeof(qcolumn));
};

//qcomp.QField.maxolumns = 100; // how many steps to allocate
// location of qfield on window/screen
qcomp.QField.leftlabels = 80;//60;
qcomp.QField.maxcolumns = 100; // = 10; // 7; // 10; // 100;
qcomp.QField.prototype.maxcolumns = qcomp.QField.maxcolumns; // convenience
qcomp.QField.fpixleft = qcomp.QField.leftlabels;
qcomp.QField.fpixwid = qcomp.QColumn.cpixwid*qcomp.QField.maxcolumns + qcomp.QField.leftlabels;//360;//1920 - qcomp.QField.leftlabels

qcomp.QField.fpixtop = 4;
//qcomp.QField.fpixhit = 500;

qcomp.QField.brt = F32([230,230,230]);
//qcomp.QField.brtbloch = F32([200,200,200]);
//qcomp.QField.bakecolor = F32([190,190,190]);
qcomp.QField.hili = F32([190,180,170]);
qcomp.QField.bottomMargin = qcomp.QField.fpixtop;//40;
qcomp.QField.invalidcol = -2; // -1 is valid for acc and state

qcomp.QField.prototype.basic = function(numqubits) {
	logger("calling Qfield basic init with " + numqubits + " qubits\n");
	if (this.qcolumns) {
		for (var i=0;i<this.maxcolumns;++i) {
			this.qcolumns[i].glfree();
		}
	}
	this.qcolumns = [];
	for (var i=0;i<this.maxcolumns;++i) {
		var qc = new qcomp.QColumn(numqubits,i);
		qc.calc();
		this.qcolumns.push(qc);
	}
	//hilitpos = -1;
	//hilitcenter = false;
	this.qfxoffset = 0;
	//logger("sizeof qcolumn = %d\n",sizeof(qcolumn));
	//this.fcalc();
};

qcomp.QField.prototype.version = {
	NO:0, // unknown
	VER1:1, // no ids
	VER2:2, // no linkbacks
	VER3:3 // both ids and linkbacks
};

qcomp.QField.prototype.sethilitpos = function(hi,center) {
	this.hilitpos = hi;
	this.hilitcenter = center;
};

qcomp.QField.prototype.gethilitpos = function() {
	return this.hilitpos;
};

qcomp.QField.prototype.setxoffset = function(xoff) {
//const S32 numhpos = (qcolumn::cpixwid*qfield::maxcolumns - qfield::fpixwid + qfield::leftlabels)/hposfactor;// - qfield::fpixwid + qfield::leftlabels;//3000; // fine grain slider
//	this.qfxoffset = xoff * qcomp.QColumn.cpixwid; 
// left and right margins the same
	this.qfxoffset = xoff*qcomp.QField.slideFactor;
};

qcomp.QField.prototype.save = function() {
	var ret = "";
	//fprintf(fw,"%2d %2d\n",maxcolumns,numqubits);
	var numqubits = this.getnumqubits();
	ret += this.maxcolumns + " " + numqubits + "\n";
	var i,j;
	for (j=0;j<this.maxcolumns;++j) {
		var qc = this.qcolumns[j];
		for (i=0;i<numqubits;++i) {
			var k = qc.getkind(i);
			var name = qcomp.qgateinfo[k].fullname;
			ret += '"' + name + '" ' + qc.getid(i) + ' ';
/*			const qgatebase::qtype qt = qc.getkind(i);
			U32 qid = qc.getid(i);
			fprintf(fw,"\"%s\" %2d   ",qgatebase::qgnames[qt],qid);
			*/
		}
		//fprintf(fw,"%d",qc.getlinkback());
		//fprintf(fw,"\n");
		ret += qc.getlinkback() + "\n";
	}
	//ret += "hi\nho\n";
	return ret;
};

qcomp.QField.prototype.getqgate = function(col,qub) {
	if (col >= this.maxcolumns)
		return 0; // bad
	if (qub >= this.getnumqubits())
		return 0; // bad
	return this.qcolumns[col].getqgatecol(qub);
};

qcomp.QField.prototype.changeqgate = function(col,qub,qt) {
	if (col >= this.maxcolumns)
		return;
	if (qub >= this.getnumqubits())
		return;
	// change qgate in this column
	this.qcolumns[col].changeqgatecolautoid(qub,qt);
	this.calclinks();
	this.fcalc();
};

qcomp.QField.prototype.copycolumn = function(frm,to) {
	//return;
	if (frm >= this.maxcolumns)
		return;
	if (to >= this.maxcolumns)
		return;
	if (frm == to)
		return;
	// fancy assignment happening here
	var oldlink = this.qcolumns[to].getlinkback();
	this.qcolumns[to].glfree();
	this.qcolumns[to] = new qcomp.QColumn(this.qcolumns[frm],to);
	this.qcolumns[to].setlinkback(oldlink);
};

qcomp.QField.prototype.getnumqubits = function() {
	if (this.qcolumns && this.qcolumns.length > 0)
		return this.qcolumns[0].getnumqubits();
	else
		return 0;
};

qcomp.QField.prototype.morequbits = function() {
	if (this.getnumqubits() >= qcomp.QColumn.maxiqubits)
		return;
	for (var i=0;i<this.maxcolumns;++i) {
		this.qcolumns[i].morequbits();
	}
	this.fcalc();
};

qcomp.QField.prototype.lessqubits = function() {
	if (this.getnumqubits() <= qcomp.QColumn.miniqubits)
		return;
	for (var i=0;i<this.maxcolumns;++i) {
		this.qcolumns[i].lessqubits();
	}
	this.fcalc();
};

qcomp.QField.toBlochQuatMat = function(m,q) {
//void qfield::toBlochQuat(const qmat& m,pointf3* q,float* phaseRet)
	if (m.dim != 2)
		throw "toBlochAngleAxis, only 1 qubit please!";


	var dt = m.det(); // false for singular, true for unitary
	//var pm = qcomp.QState.getprob(dt);
	//if (pm < qcomp.QEPSILON) {
	if (!dt) {
		q[0] = q[1] = q[2] = 0; q[3] = 1;// identity quaternion
		return 0; // phaseret
	}

	// read in the matrix
	var a = m.ele[0][0];
	var b = m.ele[0][1];
	var c = m.ele[1][0];
	var d = m.ele[1][1];

    // --- Part 1: convert to a quaternion ---
    // Phased components of quaternion.
	var mpfi = compf.create(0,-.5);
	
	var wp = compf.create();
    compf.add(wp,a,d); //compf wp = (a + d) * .5f  * -1.0f; // a fix ?
	compf.scale(wp,wp,-.5);
	
	var xp = compf.create();
    compf.add(xp,b,c);
	compf.mul(xp,xp,mpfi);//compf xp = -(b + c) * pfi;
	
    var yp = compf.create();
	compf.sub(yp,b,c);
	compf.scale(yp,yp,.5);//compf yp = (b - c) * .5f;
	
    var zp = compf.create();
	compf.sub(zp,a,d);
	compf.mul(zp,zp,mpfi);//compf zp = -(a - d) * pfi;

    // Arbitrarily use largest value to determine the global phase factor.
	// W
    // phase = max([wp, xp, yp, zp], key=abs)
	var bestnrm = compf.sqrAbs(wp);
	var phase = compf.clone(wp);
	// X
	var nrm = compf.sqrAbs(xp);
	if (nrm > bestnrm) {
		bestnrm = nrm;
		phase = compf.clone(xp);
	}
	// Y
	nrm = compf.sqrAbs(yp);
	if (nrm > bestnrm) {
		bestnrm = nrm;
		phase = compf.clone(yp);
	}
	// Z
	nrm = compf.sqrAbs(zp);
	if (nrm > bestnrm) {
		bestnrm = nrm;
		phase = compf.clone(zp);
	}
    compf.norm(phase,phase); //phase /= abs(phase);
	var phaseconj = compf.create();
	compf.conj(phaseconj,phase); //compf phaseconj = conj(phase);


    // Cancel global phase factor, recovering quaternion components.
	var ml = compf.create();
	
	compf.mul(ml,wp,phaseconj);
    q[3] = ml[0];//(wp * phaseconj).real();
	
	compf.mul(ml,xp,phaseconj);
    q[0] = ml[0];//(xp * phaseconj).real();
	
	compf.mul(ml,yp,phaseconj);
    q[1] = ml[0];//(yp * phaseconj).real();
	
	compf.mul(ml,zp,phaseconj);
    q[2] = ml[0];//(zp * phaseconj).real();
	

	// --- Part 3: (optional) canonicalize ---
    // Prefer angle in [-pi, pi]
	if (q[3] >= 0) {//if (q->w >= 0) {
        compf.scale(phase,phase,-1);// *= -1;
	}

    //phase_angle = cmath.polar(phase)[1]
	var phaseRet = compf.arg(phase);
	quat.normalize(q,q);
    //return axis(x, y, z), angle, phase_angle
	return phaseRet;
};
// method 1

qcomp.QField.prototype.drawblochO = function() {
	var cl = this.getcolumncursor(input.mx,input.my,true);
	var frac = cl.frac;
	var col = cl.whole;


	if (col == qcomp.QField.invalidcol) {
		col = this.gethilitpos();
		if (col < 0) {
			qcomp.rotaxistree.flags |= treeflagenums.DONTDRAWC;
			return;
		}
		if (col >= this.maxcolumns)
			col = this.maxcolumns - 1;
		frac = .999;
//		}
	}
//	return;

	
	//logger("cl = " + cl + " frac = " + frac.toFixed(3) + "\n");
	var curqmat = this.getqmatcol(col);
	var curqmata = this.getqmatacc(col - 1);
	
	var q = quat.create(); // current and accumulated quat
	var qa = quat.create();
	var phaseRet2,phaseRet2a;
	
	var phaseRet2 = qcomp.QField.toBlochQuatMat(curqmat,q);
	var phaseRet2a = qcomp.QField.toBlochQuatMat(curqmata,qa);
	// Prefer axes that point positive-ward.
	var axis2 = vec4.create();
	//quat.getAxisAngle = function(axisq, q);
	quat.getAxisAngle(axis2,q);
	if (axis2[0] + axis2[1] + axis2[2] < 0) {
		axis2[0] *= -1;
		axis2[1] *= -1;
		axis2[2] *= -1;
		axis2[3] *= -1;
		//*angleRet *= -1;
		
	}
	
	// if angle close to -PI, make PI, fix errors from using a low precision PI
	var howClose = qcomp.QEPSILON;
	if (axis2[3] < -Math.PI + howClose) {
		axis2[3] = Math.PI;
		quat.invert(q,q);//quatinverse(&q,&q);
	}
	var q0 = quat.create();//pointf3x();
	var qi = quat.create();
	quat.slerp2(qi,q0,q,frac);
	//quatinterp(q0,q,frac,qi);

	// invert
	//axis2.w = TWOPI - axis2.w;
	// store
	var angleRet2 = axis2[3];
	
	var qt = quat.create();
	quat.mul(qt,qi,qa);

	qcomp.sph.qrot = quat.create();
	qcomp.sph.qrot[0] = qt[1];
	qcomp.sph.qrot[1] = qt[2];
	qcomp.sph.qrot[2] = -qt[0];
	qcomp.sph.qrot[3] = -qt[3];
	
	//qcomp.rot = dir2rotY(dir);
	//var dir = [1,1,0];
	var dir = vec3.create();
	dir[0] = axis2[1];
	dir[1] = axis2[2];
	dir[2] = -axis2[0];
	if (Math.abs(angleRet2) > qcomp.QEPSILON) {
		//drawvector(blochbm,bsh,axis2,F32LIGHTGRAY,.25f);
		qcomp.rotaxistree.rot = dir2rotY(dir);
		qcomp.rotaxistree.flags &= ~treeflagenums.DONTDRAWC;
	} else {
		qcomp.rotaxistree.flags |= treeflagenums.DONTDRAWC;
	}
	
};


// method 2
qcomp.QField.prototype.drawbloch = function() {
		//qcomp.rotaxistree.flags |= treeflagenums.DONTDRAWC;
		//qcomp.sph.flags |=	treeflagenums.DONTDRAWC;
		//qcomp.axises[0].flags |= treeflagenums.DONTDRAWC;
		//qcomp.axises[1].flags |= treeflagenums.DONTDRAWC;

		
	var cl = this.getcolumncursor(input.mx,input.my,true);
	var frac = cl.frac;
	var col = cl.whole;


	qcomp.sph.qrot = quat.create();
	if (col == qcomp.QField.invalidcol) {
		col = this.gethilitpos();
		if (col < 0) {
			qcomp.rotaxistree.flags |= treeflagenums.DONTDRAWC;
			
			if (qcomp.showspin) {
				var ang = qcomp.spinang/qcomp.maxspinang*Math.PI*2;
				var spinquat = quat.create();
				var raIn = [0,0,1];
				quat.setAxisAngle(spinquat,raIn,ang);
				//quat.mul(qt,qt,spinquat);
				//qt = spinquat;
						qcomp.sph.qrot[0] = spinquat[1];
						qcomp.sph.qrot[1] = spinquat[2];
						qcomp.sph.qrot[2] = -spinquat[0];
						qcomp.sph.qrot[3] = -spinquat[3];
			} else { /*
						qcomp.sph.qrot[0] = 0;
						qcomp.sph.qrot[1] = 0;
						qcomp.sph.qrot[2] = 0;
						qcomp.sph.qrot[3] = .7071; 
			*/ }
			return;
		}
		if (col >= this.maxcolumns)
			col = this.maxcolumns - 1;
		frac = .999;
//		}
	}
//	return;

	
	//logger("cl = " + cl + " frac = " + frac.toFixed(3) + "\n");
	var curqmat = this.getqmatcol(col);
	var q = quat.clone(this.getqquatcol(col));
	var curqmata = this.getqmatacc(col - 1);
	var qa = quat.clone(this.getqquatacc(col - 1));
	
	var singa = !curqmata.det();
	var singc = !curqmat.det();
	
	//var q = quat.create(); // current and accumulated quat
	//var phaseRet2 = qcomp.QField.toBlochQuatMat(curqmat,q);

	// Prefer axes that point positive-ward.
	var axis2 = vec4.create();
	
	//quat.getAxisAngle = function(axisq, q);
	quat.getAxisAngle(axis2,q);
	if (axis2[0] + axis2[1] + axis2[2] < 0) {
		axis2[0] *= -1;
		axis2[1] *= -1;
		axis2[2] *= -1;
		axis2[3] *= -1;
		//*angleRet *= -1;
		
	}
	
	// if angle close to -PI, make PI, fix errors from using a low precision PI
	var howClose = qcomp.QEPSILON;
	if (axis2[3] < -Math.PI + howClose) {
		axis2[3] = Math.PI;
		quat.invert(q,q);//quatinverse(&q,&q);
	}
/*	var q0 = quat.create();//pointf3x();
	var qi = quat.create();
	quat.slerp2(qi,q0,q,frac);
	//quatinterp(q0,q,frac,qi);*/
	var angleRet2 = axis2[3];
	
	//static compf xdata[2] = {compf(SR2O2),compf(SR2O2)};
	//static compf ydata[2] = {compf(SR2O2),compf(0,SR2O2)};
	//bas[0].ax.load(xdata,2);
	//bas[1].ax.load(ydata,2);

	var bas = [];
	bas[0] = new qcomp.QState(1); // X
	bas[1] = new qcomp.QState(1); // Y
	bas[2] = new qcomp.QState(1); // Z
	bas[0].initX();
	bas[1].initY();
	bas[2].init0();
	
	// check Z qstate first
	var Zsacc = curqmata.mulState(bas[2]);
	if (frac >= .5) { // RIGHT SIDE, after applied current gate
		Zsacc = curqmat.mulState(Zsacc);
	}
	var zp = Zsacc.gettotprob();
	var singZ = false;
	var measZ = false;
	if (zp < qcomp.QEPSILON) {
		singZ = true;
	}
	if (zp < 1 - qcomp.QEPSILON)
		measZ = true;
	if (singZ) {
		qcomp.sph.flags |=	treeflagenums.DONTDRAWC;
		qcomp.rotaxistree.flags |= treeflagenums.DONTDRAWC;
		return;
	}
	qcomp.sph.flags &=	~treeflagenums.DONTDRAWC;
	//qcomp.rotaxistree.flags &= ~treeflagenums.DONTDRAWC;
	
	var dir = vec3.create();
	dir[0] = axis2[1];
	dir[1] = axis2[2];
	dir[2] = -axis2[0];

	if (Math.abs(angleRet2) > qcomp.QEPSILON) {
		//drawvector(blochbm,bsh,axis2,F32LIGHTGRAY,.25f);
		qcomp.rotaxistree.rot = dir2rotY(dir);
		qcomp.rotaxistree.flags &= ~treeflagenums.DONTDRAWC;
	} else {
		qcomp.rotaxistree.flags |= treeflagenums.DONTDRAWC;
	}
	
	var draw3 = false;
	if (!singa && !measZ && (frac < .5 || !singc))
		draw3 = true;
	var starti;
	if (draw3) {
		starti = 0; // all three X,Y,Z
		qcomp.sph.children[0].flags &= ~treeflagenums.DONTDRAWC;
		qcomp.sph.children[1].flags &= ~treeflagenums.DONTDRAWC;
	} else {
		starti = 2; // just the Z because of a measurement
		qcomp.sph.children[0].flags |= treeflagenums.DONTDRAWC;
		qcomp.sph.children[1].flags |= treeflagenums.DONTDRAWC;
	}
	
	//var sacc = curqmata*bas[i].ax;
	if (singc && frac >= .5) {
		if (compf.squaredAbs(curqmat.ele[0][0]) == 0) { // measure '1'
//		if (true) {
			qt = [1,0,0,0];
		} else {
			qt = [0,0,0,1];
		}
	} else {
		var q0 = quat.create();//pointf3x();
		var qi = quat.create();
		//var qa = quat.create();
		quat.slerp2(qi,q0,q,frac);
		var qt = quat.create();
		//var phaseRet2a = qcomp.QField.toBlochQuatMat(curqmata,qa);
		quat.mul(qt,qi,qa);
	}
		//Zsacc = curqmat.mulState(Zsacc);
	//var vi = Zsacc.qstateToBloch();


	
	//var qt = dir2quat(vi);

		
	if (qcomp.showspin) {
		var ang = qcomp.spinang/qcomp.maxspinang*Math.PI*2;
		var spinquat = quat.create();
		var raIn = [0,0,1];
		quat.setAxisAngle(spinquat,raIn,ang);
		quat.mul(qt,qt,spinquat);
		//qt = spinquat;
	}
	qcomp.sph.qrot[0] = qt[1];
	qcomp.sph.qrot[1] = qt[2];
	qcomp.sph.qrot[2] = -qt[0];
	qcomp.sph.qrot[3] = -qt[3];
	
	//qcomp.sph.qrot = [0,0,0,1];

	/*	var i;
	for (i=starti;i<3;++i) {
	}
	
	var q0 = quat.create();//pointf3x();
	var qi = quat.create();
	quat.slerp2(qi,q0,q,frac);
	//quatinterp(q0,q,frac,qi);

	// invert
	//axis2.w = TWOPI - axis2.w;
	// store
	var angleRet2 = axis2[3];
	
	var qt = quat.create();
	quat.mul(qt,qi,qa);

	qcomp.sph.qrot = quat.create();
	qcomp.sph.qrot[0] = qt[1];
	qcomp.sph.qrot[1] = qt[2];
	qcomp.sph.qrot[2] = -qt[0];
	qcomp.sph.qrot[3] = -qt[3];
	
	//qcomp.rot = dir2rotY(dir);
	//var dir = [1,1,0];
*/	
	
};

/*
// draw white circle outlines on the big color complex circle
qcomp.QField.prototype.drawMark = function(pos) {
		qcomp.spriteHandle.add(
		  "rcmapMark",
		  [glc.clientWidth - qcomp.RCtexX/2 - 4 + pos[0]*qcomp.RCtexX/2*.95,
		   glc.clientHeight - qcomp.RCtexY/2 - 4 + pos[1]*qcomp.RCtexY/2*.95],
		  [qcomp.RCtexXMark,qcomp.RCtexYMark],
		  null,
		  null,
		  [.5,.5],
		  );
};
*/

qcomp.QField.prototype.draw = function(cur) {
	// start to draw 2D, circuit and cursor
	var numqubits = this.getnumqubits();
	var drawnumqubits = numqubits + 1;
	if (drawnumqubits > qcomp.QColumn.maxiqubits)
		drawnumqubits = qcomp.QColumn.maxiqubits; // make room for bloch sphere when qubits == 1, else max (6 qubits) size

	// background for main circuit
	qcomp.spriteHandle.addRectangle(
	  [qcomp.QField.fpixleft-qcomp.QField.leftlabels,0],
	  [qcomp.QField.fpixwid+qcomp.QField.leftlabels,qcomp.QGateBase.gpixhit*drawnumqubits + qcomp.QField.fpixtop + qcomp.QField.bottomMargin],
	  qcomp.QField.brt);
	  
	// background for expo circuit
	if (qcomp.sm == qcomp.showmode.EXPO) {
		qcomp.spriteHandle.addRectangle(
		  [qcomp.QField.fpixleft-qcomp.QField.leftlabels,28 + qcomp.QGateBase.gpixhit*drawnumqubits + qcomp.QField.fpixtop],
		  [qcomp.QField.fpixwid+qcomp.QField.leftlabels,qcomp.QColumn.heights[numqubits] + 26],
		  F32([230,230,230]));
	}

// draw special 1/2 hilit for this case, (left of first gate)
	if (this.hilitpos == -1) {
		var xoff = qcomp.QField.fpixleft - this.qfxoffset;
		var xwid = (qcomp.QColumn.cpixwid - qcomp.QColumn.cpixwid/2)/2;
		qcomp.spriteHandle.addRectangle(
		  [xoff,qcomp.QField.fpixtop],
		  [xwid,qcomp.QGateBase.gpixhit*numqubits],
		  qcomp.QField.hili);
	}

	// draw bloch sphere
	if (numqubits == 1 && this.hilitcenter && this.hilitpos != qcomp.QField.invalidcol) { // don't draw COL mode
		this.drawbloch();
	}

	  // draw circuit
	for (var i=-1;i<this.qcolumns.length;++i) {
		var xoff = qcomp.QField.fpixleft + qcomp.QColumn.cpixwid*i;
		// draw extra background column if hilit enabled
		var hilit = i == this.hilitpos;
		if (hilit) {
			var xoc;
			var xwid;
			if (this.hilitcenter) {
				xoc = xoff + qcomp.QColumn.cpixwid/2 + qcomp.QColumn.cpixwid/4 - this.qfxoffset;
				xwid = qcomp.QColumn.cpixwid/2;
			} else {
				xoc = xoff - this.qfxoffset;
				xwid = qcomp.QColumn.cpixwid;
			}
			if (this.hilitpos >= 0) {
				qcomp.spriteHandle.addRectangle(
				  [xoc,qcomp.QField.fpixtop],
				  [xwid,qcomp.QGateBase.gpixhit*numqubits],
				  qcomp.QField.hili);
			}
			// draw hilit for expo
			if (qcomp.sm == qcomp.showmode.EXPO && numqubits <= 4) {
				qcomp.spriteHandle.addRectangle(
				  [xoc,56 + qcomp.QGateBase.gpixhit*drawnumqubits + qcomp.QField.fpixtop],
				  [xwid,qcomp.QColumn.heights[numqubits]-4],
				  qcomp.QField.hili);
			}
		}
		// clip draw
		if (i >= 0) {
			this.qcolumns[i].drawoutline(xoff-this.qfxoffset);
		}
	}
	
	// draw some horizontal lines for the score
	var nqb = this.getnumqubits();
	for (var i=0;i<nqb;++i) {
		var bt = F32BLUE;
		var x0 = qcomp.QField.fpixleft;
		var y0 = qcomp.QField.fpixtop + i*qcomp.QGateBase.gpixhit + qcomp.QGateBase.gpixhit/2;
		var x1 = x0 + this.maxcolumns*qcomp.QColumn.cpixwid;
		var y1 = y0;
		qcomp.spriteHandle.addLine([x0-this.qfxoffset,y0],[x1-this.qfxoffset-1,y1],bt,2);		
	}
	
	// draw circuit
	for (var i=0;i<this.qcolumns.length;++i) {
		var xoff = qcomp.QField.fpixleft + qcomp.QColumn.cpixwid*i;
		this.qcolumns[i].draw(xoff,this.qfxoffset);
	}

	// draw phase circle or not
	var dodrawphasecircle = true;
	if (qcomp.sm == qcomp.showmode.COL || qcomp.sm == qcomp.showmode.ACC)
		dodrawphasecircle = false;
	if (qcomp.qf.getnumqubits() > 3 && qcomp.sm == qcomp.showmode.EXPO)
		dodrawphasecircle = false;
	if (qcomp.qf.getnumqubits() > 5 && qcomp.sm == qcomp.showmode.STATE)
		dodrawphasecircle = false;
/*	//if ((qcomp.qf.getnumqubits() > 3) || (qcomp.sm == qcomp.showmode.COL) || (qcomp.sm == qcomp.showmode.ACC)) {
	if (dodrawphasecircle) {
		qcomp.planerc.flags &= ~treeflagenums.DONTDRAWC;
	} else {
		qcomp.planerc.flags |= treeflagenums.DONTDRAWC;
	}
*/	
	if (dodrawphasecircle) {
		// draw color circle of complex numbers
		var h = qcomp.QField;
		var qs = qcomp.lastqstate;
		if (qs == null)
			return;

		var tb = qs.gettotprob();
		if (tb < .9)
			return;
		qcomp.spriteHandle.add(
		  "rcmap",
		  [glc.clientWidth - qcomp.RCtexX/2 - 4,glc.clientHeight - qcomp.RCtexY/2 - 4],
		  [qcomp.RCtexX,qcomp.RCtexY],
		  null,
		  null,
		  [.5,.5]
		  );
		// place many markers of qstate on top of big circle
		//qcomp.scratch.scratch1 = this.hilitpos;
		//var cl = this.hilitpos;
		//if (cl < 0)
		//	cl = 0;
		//var qcl = this.qcolumns[cl];
		
		for (var i=0;i<qs.numstates;++i) {
			var e = qs.states[i];
			h.drawMark(e);
		}
/*
		h.drawMark([0,0]);
		
		h.drawMark([1,0]);
		h.drawMark([-1,0]);
		h.drawMark([0,1]);
		h.drawMark([0,-1]);*/
	}

};
// draw white circle outlines on the big color complex circle
qcomp.QField.drawMark = function(pos) {
		qcomp.spriteHandle.add(
		  "rcmapMark",
		  [glc.clientWidth - qcomp.RCtexX/2 - 4 + pos[0]*qcomp.RCtexX/2*.95,
		   glc.clientHeight - qcomp.RCtexY/2 - 4 + pos[1]*qcomp.RCtexY/2*.95],
		  [qcomp.RCtexXMark,qcomp.RCtexYMark],
		  null,
		  null,
		  [.5,.5] // took out last comma
		  );
};


qcomp.QField.prototype.drawcursor = function(cur) {
	//if (cur) {
	if (cur && this.isinside(input.mx,input.my)) {
		var xoff = input.mx - qcomp.QColumn.cpixwid/2;
		var yoff = input.my - qcomp.QGateBase.gpixhit/2;
		//if (cur->hasmultibox())
		//	cur->drawboxm(B32,xoff,yoff);
		cur.draw(/*B32,*/xoff,yoff); // draw qgate cursor
	}
	/*if (isinside(MX,MY))
		clipline32(B32,MX,fpixtop + 2,MX,fpixtop + fpixhit - 1 - 2,F32GREEN);
	// clip back to whole window/screen
	if (doclip)
		resetcliprect32(B32);

	};
	*/
};

qcomp.QField.prototype.isinside = function(mx,my) {
	//my = 10;
	//return true;
	if (mx <qcomp.QField.fpixleft - qcomp.QField.leftlabels || my < qcomp.QField.fpixtop)
		return false;
	if (mx >= qcomp.QField.fpixleft + qcomp.QField.fpixwid || 
	  my >= 10 + qcomp.QField.fpixtop + qcomp.QGateBase.gpixhit*qcomp.qf.getnumqubits() + qcomp.QGateBase.gpixhit + qcomp.QField.bottomMargin)
//	if (mx >= qcomp.QField.fpixleft + qcomp.QField.fpixwid || my >= qcomp.QField.fpixtop + qcomp.QField.fpixhit)
		return false;
	return true;
	
};

qcomp.QField.prototype.getcolumncursor = function(mx,my,retfrac) {
//qcomp.QField.getcolumncursor = function(U32 mx,U32 my,S32* cl,float* frac) { // add frac later when we bring Bloch sphere online
	var invalid = retfrac ? 
		{whole:qcomp.QField.invalidcol,frac:0} 
	:
		qcomp.QField.invalidcol;
	//if (!this.isinside(mx,my))
	//	return invalid;
	var xo = mx - qcomp.QField.fpixleft + this.qfxoffset;
	var i = xo/qcomp.QColumn.cpixwid;
	i = Math.floor(i);
	if (i >= this.maxcolumns)
		return invalid;
	else if (i < 0)
		return invalid;
	//if (i < 0)
	//	return false;
	//*cl = i;
	/*if (frac) {
	}*/
	if (retfrac) {
		var rem = xo - i*qcomp.QColumn.cpixwid;
		var f = rem/qcomp.QColumn.cpixwid;
		var deadzone = .1;
		var m = 1/(1 - 2*deadzone);
		f = m*(f - deadzone);
		f = range(0,f,.9999);
		return {whole:i,frac:f};
	} else {
		return i;
	}
};

qcomp.QField.prototype.getaccumcursor = function(mx,my) {
	//if (!this.isinside(mx,my))
	//	return qcomp.QField.invalidcol;
	var i = (mx - qcomp.QField.fpixleft + this.qfxoffset + qcomp.QColumn.cpixwid/2)/qcomp.QColumn.cpixwid - 1;
	i = Math.floor(i);
	if (i >= this.maxcolumns)
		return qcomp.QField.invalidcol;
	//if (i < -1)
	//	return false;
	//*cl = i;
	return i;
};

qcomp.QField.prototype.getrowcolumncursor = function(mx,my) {
	if (!this.isinside(mx,my))
		return null;
	var i = (mx - qcomp.QField.fpixleft + this.qfxoffset)/qcomp.QColumn.cpixwid;
	var j = (my - qcomp.QField.fpixtop)/qcomp.QGateBase.gpixhit;
	i = Math.floor(i);
	j = Math.floor(j);
	if (i >= qcomp.QField.maxcolumns || i < 0)
		return null;
	if (j >= this.getnumqubits() || j < 0)
		return null;
	var p = [i,j];
	return p;
};

qcomp.QField.prototype.getqmatcol = function(col) {
	//var ret = new qcomp.QMat();
	return this.qcolumns[col].getqmatcol();
	//return ret;
};

qcomp.QField.prototype.getqmatacc = function(col) {
	//var ret = new qcomp.QMat();
	if (col >= 0)
		return this.qcolumns[col].getqmatacc();
	else
		return new qcomp.QMat(1<<(this.getnumqubits())); // -1 return identity of correct size
};

qcomp.QField.prototype.getqquatcol = function(col) {
	//var ret = new qcomp.QMat();
	return this.qcolumns[col].getqquatcol();
	//return ret;
};

qcomp.QField.prototype.getqquatacc = function(col) {
	//var ret = new qcomp.QMat();
	if (col >= 0)
		return this.qcolumns[col].getqquatacc();
	else
		return [0,0,0,1];
};

// do we need this?
qcomp.QField.prototype.glfree = function() {
	logger("in qcomp.QField glfree\n");
	for (var i=0;i<this.qcolumns.length;++i) {
		this.qcolumns[i].glfree();
	}
};

qcomp.QField.prototype.fcalc = function() {
	//return;
	var i;
	var qma = new qcomp.QMat(1<<this.getnumqubits());
	for (i=0;i<this.qcolumns.length;++i) {
		if (this.qcolumns[i].ispassthru()) {
			this.qcolumns[i].setqmatacc(qma);
		} else {
			var qm = this.qcolumns[i].getqmatcol();
			//qma = qm * qma;
			qma = qm.mulMat(qma);
			this.qcolumns[i].setqmatacc(qma);
		
		}
		this.qcolumns[i].redrawExpo();
	}
// for bloch sphere
	if (this.getnumqubits() == 1) {
		var qqa = [0,0,0,1];
		for (i=0;i<this.qcolumns.length;++i) {
			if (this.qcolumns[i].ispassthru()) {
				//qqa = [0,0,0,1];
				this.qcolumns[i].setqquatacc(qqa);
			} else {
				var qq = this.qcolumns[i].getqquatcol();
				
				var qm = this.qcolumns[i].getqmatcol();
				if (qm.det()) {
					quat.mul(qqa,qq,qqa);
				} else {
					if (compf.squaredAbs(qm.ele[0][0]) == 0) { // measure '1'
						qqa = [1,0,0,0];
					} else { // measure '0'
						qqa = [0,0,0,1];
					}
				}
				this.qcolumns[i].setqquatacc(qqa);
			}
		}
	}
};

qcomp.QField.prototype.makelink = function(lf,lt) {
	if (lf > lt)
		this.qcolumns[lf].setlinkback(lt);
	if (lf == lt)
		this.freelink(lf);
	this.calclinks();
	this.fcalc();
};

qcomp.QField.prototype.freelink = function(col) {
	this.qcolumns[col].setlinkback(-1);
};

qcomp.QField.prototype.calclinks = function() {
	//return;
	var i;
	for (i=0;i<this.qcolumns.length;++i) {
		var to = this.qcolumns[i].getlinkback();
		if (to >= 0)
			this.copycolumn(to,i);
	}
};
