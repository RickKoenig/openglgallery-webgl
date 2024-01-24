// MATH
// Qstate constructor
qcomp.QState = function(rhs) {
	// find out what type rhs is...
	var num = -1;
	this.states = [];
	if (rhs == null) { // default rhs
		this.numstates = 0;
		this.numqubits = 0;
		return;
	}
	if (typeof rhs == 'number') {
		this.numqubits = rhs;
		this.numstates = 1<<rhs;
		var i;
		for (i=0;i<this.numstates;++i) {
			this.states.push(compf.create());
		}
		return;
	}
	throw "can't construct QState with an object!!";
};

// QState static methods
qcomp.QState.getprob = function(qs) {
	//logger("in getprob\n");
	return compf.sqrAbs(qs);
};

qcomp.QState.almostEqual = function(a,b) {
	var d = compf.create();
	compf.sub(d,a,b);
	var p = qcomp.QState.getprob(d);
	return p < qcomp.QEPSILON;
};

//void printfactors(const vector<qstate>& factors,const string& title,con32* con) {
qcomp.QState.printfactors = function(factors,title) {
	var str = "";
	var n = factors.length;
	if (n > 0) {
		var i;
		str += "\n " + title + "\n";
		for (i=0;i<n;++i) {
			str += " ---- factor QUBIT " + i + " ---- ";
			str += factors[i].print("factor",false,i);
		}
	}
	return str;
};

qcomp.QState.smallfloat = function(sf) {
	var ret = sf >= 0 ? " " : "-";
	var sf = Math.abs(sf);
	var intf = Math.floor(100*sf + .5);
	var ret;
	if (intf >= 100)
		ret += "1.";
	else if (intf >= 10)
		ret += intf;
	else
		ret += "0" + intf;
	return ret;
};

// convert 0,2 to 00
// convert 1,2 to 10
// convert 2,2 to 01
// convert 3,2 to 11
// it's backwards, MSB is 0
qcomp.QState.idxtobinstring = function(val,numbits) {
	var ret = "";
	var i;
	for (i=0;i<numbits;++i)
		ret = ((val&(1<<i)) ? "1" : "0") + ret; // lower number qubit is to the left of higher qubits
	return ret;
};

qcomp.QState.revbits = function(inbits,numbits) {
	//return inbits;
	var i;
	var outbits = 0;
	for (i=0;i<numbits;++i) {
		var val = ((inbits>>i)&1);
		outbits += val<<(numbits - i - 1);
	}
	return outbits;
};

qcomp.QState.prototype.print = function(title,measure,qoff) {
//	return "QState print   coming soon...\n";
	var str = " QSTATE '" + title + "'\n";
	//if (qcomp.reverse)
	//	str += " R ";
	if (qoff == null)
		qoff = 0;
//	if (con) {
		//con32_printf(con,"QSTATE '%s'\n",title.c_str());
		var i,j;
		var nqubits = this.numqubits;
		//U32 nqubits = ilog2(numstates);
		var bitfields = "    qubit              Q";
		if (qcomp.reverse) { // make like IBMQ, Q0 is least significant
			for (i=0;i<nqubits;++i)
				bitfields += nqubits - i - 1 + qoff;
		} else { // Q0 is most significant
			for (i=0;i<nqubits;++i)
				bitfields += i + qoff;
		}
		//con32_printf(con,"%s\n",bitfields.c_str());
		str += " " + bitfields + "\n";
		for (i=0;i<this.numstates;++i) {
			var ri = qcomp.reverse ? qcomp.QState.revbits(i,nqubits) : i;
			var e = this.states[ri];
			var mprob = qcomp.QState.getprob(e);
			if (qcomp.zprob || mprob >= qcomp.QEPSILON) {
			//if (true) {
			//if (mprob >= qcomp.QEPSILON) {
				//str += "index = " + 3 + "\n";
				str += " " + compf.str(e) + " | " + qcomp.QState.idxtobinstring(i,nqubits) + " >   P = " + compf.fixfloat(mprob) + "\n";
//				con32_printf(con,"\t(%8.5f,%8.5fi) | %s> P = %8.5f\n",e.real(),e.imag(),idxtobinstring(i,nqubits).c_str(),getprob(e));
			}
		}
		str += "\n";
/*		if (measure) {
			measureall();
			for (i=0;i<nqubits;++i) {
				float mprob;
				vector<qstate> measresult1 = measure1(i,mprob);
				for (j=0;j<2;++j) {
					con32_printf(con,"\tmeasure qubit %d, value %d, prob %8.5f\n",i,j,mprob);
					if (mprob >= QEPSILON) {
						measresult1[j].print("measure",false);
					} else {
						con32_printf(con,"\t\t< no probability >\n");
					}
					mprob = 1 - mprob;
				}
			}
		} */

//	}
	return str;
};

/*
credit Craig Gidney, thanks
Breaksdown a matrix U into axis, angle, and phase_angle components satisfying
U = exp(i phase_angle) (I cos(angle/2) - axis sigma i sin(angle/2))

:param matrix: The 2x2 unitary matrix U
:return: The breakdown (axis(x, y, z), angle, phase_angle)
*/
qcomp.QState.prototype.qstateToBloch = function() {
	if (this.numqubits != 1)
		throw "should bloch on just 1 qubit for now !!";
	var blochstate = []; // pointf3
	var qsn = clone(this);
	qsn.normalize();
//	return ret;
//}
//#if 0
	// convert
	// TODO adjust phase
	var alen = Math.abs(qsn.states[0]); // float
	var ph; // compf
	if (alen > qcomp.QEPSILON) {
		ph = compf(qsn.states[0].real()/alen,-qsn.states[0].imag()/alen);
		var AP = alen; // float
		var BP = qsn.states[1] * ph; // compf
		blochstate[2] = 2*AP*AP - 1;
		blochstate[0] = 2*AP*BP.real();
		blochstate[1] = 2*AP*BP.imag();
	} else {
		blochstate = [0,0,-1];
	}
	return blochstate;
//#endif
}

// should be 1, unless measured
qcomp.QState.prototype.gettotprob = function() {
	var totprob = 0;
	var i;
	for (i=0;i<this.numstates;++i)
		totprob += qcomp.QState.getprob(this.states[i]);
	return totprob;
}

// remove 1 degree of freedom
qcomp.QState.prototype.normalize = function() {
	var totprob = 0;
	var i,numstates = this.states.length;
	for (i=0;i<numstates;++i)
		totprob += qcomp.QState.getprob(this.states[i]);
	var rat = 1/Math.sqrt(totprob);
	for (i=0;i<numstates;++i)
		compf.scale(this.states[i],this.states[i],rat);
};

// remove another degree of freedom, try to set first nonzero amplitude to a positive real number
qcomp.QState.prototype.stdphase = function() {
	var i,numstates = this.states.length; // int
	var r; // float
	var u=compf.create(),uc=compf.create(); // compf
	for (i=0;i<numstates;++i) {
		var  a = this.states[i];
		var p = qcomp.QState.getprob(a);
		if (p > qcomp.QEPSILON) {
			r = Math.sqrt(p); // magnitude
			u = compf.scale(u,a,1/r);//a/r; // unit length, a = r*u
			compf.conj(uc,u);//uc = compf(u.real(),-u.imag());
			break;
		}
	}
	if (i == numstates)
		return;
	for (i=0;i<numstates;++i) {
		compf.mul(this.states[i],this.states[i],uc);
	}
};

// try to factor a qstate into disentangled qubits
//vector<qstate> qstate::factor()
qcomp.QState.prototype.factor = function() {
	var ret = [];
	
	if (this.numqubits != 2) // only factor 2 qubits for now
		return ret;
	//vector<qstate> ret;
	
	// find highest amplitude
	var i,j,k; // int
	var mi,mj,mk; // int
	var maxprob = -1; // float
	for (j=0;j<2;++j) {
		for (i=0;i<2;++i) {
			k = 2*j + i;
			var amp = this.states[k];
			var p = qcomp.QState.getprob(amp);
			if (p > maxprob) {
				maxprob = p;
				mi = i;
				mj = j;
				mk = k;
			}
		}
	}
	if (maxprob < qcomp.QEPSILON) {
		//logger("qstate::factor prob was less than .2, should be .25 or greater\n");
		return ret;
	}
	
	var mk0 = this.states[mk];
	var mk1 = this.states[mk^1];
	var mk2 = this.states[mk^2];
	var mk3 = this.states[mk^3];
	var rat0main = compf.create();
	var rat1main = compf.create();
	//var rat0alt = compf.create();
	//var rat1alt = compf.create();
	var mk30 = compf.create();
	var mk31 = compf.create();
	compf.div(rat0main,mk1,mk0);
	compf.div(rat1main,mk2,mk0);
	//compf.div(rat0alt,mk3,mk2);
	//compf.div(rat1alt,mk3,mk1);
	compf.mul(mk30,rat0main,mk2);
	compf.mul(mk31,rat1main,mk1);

	if (!qcomp.QState.almostEqual(mk30,mk3)) {
		logger("can't be factored rat0\n");
		return ret;
	}
	if (!qcomp.QState.almostEqual(mk31,mk3)) {
		logger("can't be factored rat1\n");
		return ret;
	}
/*	// now factor
	qstate qb[2] = {qstate(1),qstate(1)};
	qb[0].states[0^mj] = 1; // highest
	qb[0].states[1^mj] = rat1main;
	qb[1].states[0^mi] = 1;
	qb[1].states[1^mi] = rat0main;
	qb[0].normalize();
	qb[1].normalize();
	qb[0].stdphase();
	qb[1].stdphase();
	ret.push_back(qb[0]);
	ret.push_back(qb[1]);
	return ret;
*/

	
	var f0 = new qcomp.QState(1);
	f0.states[0^mj] = compf.create(1);
	f0.states[1^mj] = rat1main;
	f0.normalize();
	f0.stdphase();
	ret.push(f0);
	
	var f1 = new qcomp.QState(1);
	f1.states[0^mi] = compf.create(1);
	f1.states[1^mi] = rat0main;
	f1.normalize();
	f1.stdphase();
	ret.push(f1);
	
	return ret;
};


qcomp.QState.prototype.clear = function() {
	if (this.numstates) {
		var i;
		for (i=0;i<this.numstates;++i) {
			this.states[i] = compf.create(/*Math.random()*4 -2*/);
		}
	}
};

// QState instance methods
qcomp.QState.prototype.init0 = function() {
	if (this.numstates) {
		this.clear();
		this.states[0] = compf.create(1);
	}
};

// QState instance methods
qcomp.QState.prototype.initX = function() {
	if (this.numstates == 2) {
		this.clear();
		this.states[0] = compf.create(qcomp.SR2O2);
		this.states[1] = compf.create(qcomp.SR2O2);
	}
};

// QState instance methods
qcomp.QState.prototype.initY = function() {
	if (this.numstates == 2) {
		this.clear();
		this.states[0] = compf.create(qcomp.SR2O2);
		this.states[1] = compf.create(0,qcomp.SR2O2);
	}
};

// unit tests
qcomp.QState.test = function() {
	logger("unit test of QState\n");
	// test factors
	var qs = new qcomp.QState(2);
	qs.init0();
	qs.states[0] = compf.create(3);
	qs.states[1] = compf.create(4);
	qs.states[2] = compf.create(21);
	qs.states[3] = compf.create(28);
	var factors = qs.factor();
};

