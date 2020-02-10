// MATH
// QMat constructor
qcomp.QMat = function(arg,zero) {
	// find out what type arg is...
	var dim = null;
	var rhs = null;
	//if (arg == null) // default arg
	//	dim = 1;
	/*else*/ 
	if (typeof arg == 'number')
		dim = arg;
	else if (Array.isArray(arg)) {
		logger("qmat arr");
		dim = arg.length;
		this.dim = dim
		var i,j;
		this.ele = createArray(dim,dim);
		for (j=0;j<this.dim;++j) {
			for (i=0;i<this.dim;++i) {
				var v = arg[j][i];
				if (typeof v == 'number') {
					this.ele[j][i] = compf.create(v);
				} else {
					this.ele[j][i] = clone(v);
				}
			}
		}
		return;
	} else if (typeof arg == 'object') // this copy constructor will double as operator=
		rhs = arg;
	else
		dim = 1; // default
	if (dim) {
		this.dim = dim;
		this.ele = createArray(dim,dim);
		var i,j;
		for (j=0;j<dim;++j) {
			var row = this.ele[j];
			for (i=0;i<dim;++i) {
				row[i] = i == j && !zero ? compf.create(1) : compf.create();
			}
		}
	} else if (rhs) {
		this.dim = rhs.dim;
		this.ele = clone(rhs.ele);
	}
};

qcomp.QMat.qmatqu = function(numqubits) {
	if (numqubits<0)
		numqubits = 0;
	return new qcomp.QMat(1<<numqubits);
};

//	static U32 mapbits(U32 inbits,const vector<U32>& pins); // reorder the bits of a binary number using 'pins'
qcomp.QMat.mapbits = function(inbits,pins) {
	// reorder the bits of a binary number using 'pins'
	// order is reversed because qubit 0 is most significant bit
	var numpins = pins.length;
	var i;
	var ret = 0;
	for (i=0;i<numpins;++i) {
		var inbit = qcomp.QMat.getbitval(inbits,numpins - 1 - i);
		var outbit = qcomp.QMat.setbitval(inbit,numpins -1 - pins[i]);
		ret += outbit;
	}
	return ret;
};

//	static U32 getbitval(U32 val,U32 bitnum); // returns a bit 0 or 1 if that bit is set or not
qcomp.QMat.getbitval = function(val,bitnum) {
	return (val>>bitnum)&1;
};

//	static U32 setbitval(U32 bit,U32 bitnum); // returns a new int with the bit set or not
qcomp.QMat.setbitval = function(bit,bitnum) {
	return bit<<bitnum
};


qcomp.QMat.prototype.getnumqubits = function() {
	return ilog2(this.dim);
};

qcomp.QMat.prototype.det = function() {
	// quick check, return 0 for measurement gate, 1 for unitary gate
	// look for any column this is all 0's
	var i,j;
	for (i=0;i<this.dim;++i) {
		for (j=0;j<this.dim;++j) {
			var v = this.ele[j][i];
			var p = qcomp.QState.getprob(v);
			if (p >= qcomp.QEPSILON)
				break;
		}
		if (j == this.dim)
			return false;
	}
	return true;
};

qcomp.QMat.prototype.print = function(title,abbrev) {
	var i,j;
	var str = " QMAT '" + title + "'\n";
	var spc = this.dim <= 8 ? "   " : "";
	var margin = this.dim <= 8 ? " " : "";
	for (j=0;j<this.dim;++j) {
		var row = this.ele[j];
		str += margin;
		for (i=0;i<this.dim;++i) {
			var cf = row[i];
			if (!cf)
				logger("not cf");
			var sr = qcomp.QState.smallfloat(cf[0]);
			var si = qcomp.QState.smallfloat(cf[1]);
			str += sr + "+" + si + "i" + spc;
		}
		str += "\n";
	}
	return str;
};

// Matrix * vector => vector
qcomp.QMat.prototype.mulState = function(rhs) {
	if (this.dim != rhs.numstates)
		throw "mulMat mismatch " + this.dim + " " + rhs.numstates;
	
	
	var ret = new qcomp.QState(rhs.numqubits);//dim);
	var tmp = compf.create();
	var i,j;
	for (j=0;j<this.dim;++j) {
		var acc = compf.create();
		for (i=0;i<this.dim;++i) {
			compf.mul(tmp,this.ele[j][i],rhs.states[i]);
			compf.add(acc,tmp,acc);//ret.states[j] += this.ele[j][i]*rhs.states[i];
		}
		ret.states[j] = acc;
	}
	return ret;
	
	
	
//	return rhs; // TODO: implement !!!
};

// Matrix * Matrix => Matrix
// this is where classical simulations get much slower
qcomp.QMat.prototype.mulMat = function(rhs) {
	if (this.dim != rhs.dim)
		throw "mulMat mismatch " + this.dim + " " + rhs.dim;

	
	var ret = new qcomp.QMat(this.dim);
	var tmp = compf.create();
	//ret.clear();
	var i,j,k;
	//var val = compf.create();
	for (j=0;j<this.dim;++j) {
		for (i=0;i<this.dim;++i) {
			var acc = compf.create();
			for (k=0;k<this.dim;++k) {
				//var prd = this.ele[j][k]*rhs.ele[k][i];
				compf.mul(tmp,this.ele[j][k],rhs.ele[k][i]);
				
				//ret.ele[j][i] += prd;
				compf.add(acc,tmp,acc);
			}
			ret.ele[j][i] = acc;
		}
	}
	return ret;
	
	
};

// Matrix ^ Matrix => bigger Matrix
qcomp.QMat.prototype.mulTensor = function(rhs) {
//	if (rhs.dim == 1)
//		return clone(this);
	var ret = new qcomp.QMat(this.dim*rhs.dim);
	var i,j,u,v,x,y;
	for (v=0,y=0;v<this.dim;++v) {
		for (j=0;j<rhs.dim;++j,++y) {
			for (u=0,x=0;u<this.dim;++u) {
				for (i=0;i<rhs.dim;++i,++x) {
					var mul = compf.create();
					compf.mul(mul,this.ele[v][u],rhs.ele[j][i]);
					ret.ele[y][x] = mul;
				}
			}
		}
	}
	return ret;
};

/*
// multiply 2 matrices together using tensor product
qmat qmat::operator^(const qmat& rhs) const
{
	// not needed
	//if (dim != rhs.dim)
	//	errorexit("qmat qmat ^: lhs dim = %d, rhs dim = %d",dim,rhs.dim);
	qmat ret(dim*rhs.dim);
	S32 i,j,u,v,x,y;
	for (v=0,y=0;v<dim;++v) {
		for (j=0;j<rhs.dim;++j,++y) {
			for (u=0,x=0;u<dim;++u) {
				for (i=0;i<rhs.dim;++i,++x) {
					ret.ele[y][x] = ele[v][u]*rhs.ele[j][i];
				}
			}
		}
	}
	return ret;
}
*/

// qmat swapqubits(const vector<U32>& pins); // alters the matrix, swaps inputs and outputs of a qmat, n qubits
qcomp.QMat.prototype.swapqubits = function(pins) {
	// checks, invalid input
	// num qubits must match
	var numpins = pins.length
	if ((1<<numpins) != this.dim)
		throw "swapqubits: bad input, dim = " + this.dim + ", pins.length = " + numpins;
	//vector<var> counts(numpins);
	var counts = createArray(numpins);
	counts.fill(0);
	
	var i;
	for (i=0;i<numpins;++i) {
		var val = pins[i];
		if (val >= numpins)
			throw "swapqubits: bad input, pin " + i + " is " + val + " which is > numpins " + numpins;
		++counts[val];
	}
	for (i=0;i<numpins;++i) {
		var val = counts[i];
		if (val != 1) {
			throw "swapqubits: bad input, pin " + i + " count " + val + " not a 1";
		}
	}
	// checking now done, build a swp-1 * qmat * swp matrix
	//vector<var> mapper(dim);
	var mapper = createArray(this.dim);
	for (i=0;i<this.dim;++i) {
		var m = qcomp.QMat.mapbits(i,pins);//,numpins);
		mapper[i] = m;
		//invmapper[m] = i;
	}
	var frontmat = new qcomp.QMat(this.dim,true); // rearrange pins in front (first)
	var invmat = new qcomp.QMat(this.dim,true); // undo rearrange pins in back (last)
	//frontmat.clear();
	//invmat.clear();
	for (i=0;i<this.dim;++i) {
		var m = mapper[i];
		frontmat.ele[i][m] = compf.create(1);
		invmat.ele[m][i] = compf.create(1); // don't need conjugates because all numbers are 0 or 1 (real)
	}
	var tmp = this.mulMat(frontmat);
	var ret = invmat.mulMat(tmp);
	return ret;
	//*this = invmat * *this * frontmat; // math goes right to left
	
};

// keeps current dim
// set to all zeros
/*qcomp.QMat.prototype.clear = function(rhs) {
	var i;
	var zer = compf.create(.037,.069); // TODO, test !!!
	for (i=0;i<this.dim;++i)
		this.ele[i].fill(clone(zer));
};
*/
/*
// set this qmat to be identity
qcomp.QMat.prototype.identn = function(rhs) {
	this.clear();
	var i;
	for (i=0;i<this.dim;++i)
		this.ele[i][i] = compf.create(1);
};
*/