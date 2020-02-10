// QColumn constructor, pass in numqubits   OR   QColumn rhs (copy constructor)
qcomp.QColumn = function(numqubits_rhs,cl) {
	this.col = cl;
	this.linkback = -1;
	this.qgates = [];
	if (typeof numqubits_rhs == 'object') {
	// copy rhs, source of copy passed in
		// make a default column with this many qubits
		var rhs = numqubits_rhs;
		this.linkback = rhs.linkback;
		var numqubits = rhs.qgates.length;
		for (var i=0;i<numqubits;++i) {
			//var rse = rhs.qgates[i];
			var qg = new qcomp.QGateBase(rhs.qgates[i]);
			this.qgates.push(qg);
		}
		this.qmcol = clone(rhs.qmcol);
		this.qmacc = clone(rhs.qmacc);
		this.qqcol = clone(rhs.qqcol);
		this.qqacc = clone(rhs.qqacc);
	} else {
		this.linkback = -1;
		// default, numqubits passed in
		// make a default column with this many qubits
		var numqubits = Number(numqubits_rhs); // it's probably a number
		for (var i=0;i<numqubits;++i) {
			var qg = new qcomp.QGateBase(qcomp.qtype.PASSTHRU,i);
			this.qgates.push(qg);
		}
		this.qmcol = qcomp.QMat.qmatqu(numqubits_rhs);
		this.qmacc = qcomp.QMat.qmatqu(numqubits_rhs);
		this.qqcol = [0,0,0,1];
		this.qqacc = [0,0,0,1];
	}
	
	// start EXPO
	var texname = "columnExpoDataNum" + this.col;
	//var texname = "columnExpoDataNum";
	//var texname = "maptestnck.png";
	var c = document.createElement('canvas');
	var texX = qcomp.QColumn.cpixwid - 1;
	var texY = 272;
	c.width = texX;
	c.height = texY;
	
	// make a 2d context
	var ctx = c.getContext('2d');
/*	
	// draw some images on 2d context
	
	// background color
	ctx.fillStyle="rgb(230,130,30)";
	ctx.fillRect(0,0,texX,texY);
	
	
	// draw centered text
	ctx.strokeStyle = 'white';
	ctx.fillStyle = 'black';
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.font = 'bold 16px serif';
	ctx.lineWidth = 1;
	let str = '' + cl;
	ctx.fillText(str, texX/2,texY/2);
	//ctx.strokeText(str, pnt.x, pnt.y); */

	if (this.col == 0)
		logger("createtexture col 0");
	this.dt = DataTexture.createtexture(texname,c);
	// end EXPO
	//this.redrawExpo();

};

qcomp.QColumn.maxiqubits = 6;
qcomp.QColumn.miniqubits = 1;
qcomp.QColumn.defaultqubits = 4;
qcomp.QColumn.cpixwid = 55;

qcomp.QColumn.prototype.getqgatecol = function(qub) {
	return this.qgates[qub];
};

qcomp.QColumn.prototype.changeqgatecol = function(qub,qname,ida) {
	var qgb;
	// qgb = this.qgates[qub];
	// qgb.glfree(); // free any resources
	var kind = qcomp.QGateBase.findqtypebyfilename(qname);
	qgb = qcomp.QGateBase.build(kind,ida);
	this.qgates[qub] = qgb;
};

qcomp.QColumn.prototype.changeqgatecolautoid = function(qub,qt) {
	// change a qgate, gen an id based on what other
	// gates are in column (UI gate drop)
// drop a qgate, figure out id
	//var qgb = this.qgates[qub]; // get old gate
	//qgb = null; // free it
	this.qgates[qub] = 0; // no gate here right now
	var ida = this.calcid(qt);
	//U32 ida = 7; // calc id MAGIC
	var qgb = qcomp.QGateBase.build(qt,ida); // build new one
	this.qgates[qub] = qgb; // assign it
	this.calc(); // build qcolumn matrix, flag errors as red
};

qcomp.QColumn.prototype.calcid = function(qt) {
//	return 3; // random NYI
//};

///*
// find an empty unique id for that qgate qtype
//U32 qcolumn::calcid(qgatebase::qtype qt) const
//{
	var idlist = [];
	var i,ng = this.qgates.length;
	var newqg = qcomp.QGateBase.build(qt);
	var newnumparts = newqg.getnumparts();
	var newcurpart = newqg.getcurpart();
	newqg = null;

	for (i=0;i<ng;++i) {
		var qg = this.qgates[i];
		// if not null and same kind(class), bump the id only if there is same gate, if multi gate, then bump if same curpart number
		if (!qg)
			continue;
		if (qg.getkind() == qt ||
			//false) {
		     (newnumparts>1 && qg.getnumparts()>1 && newcurpart==qg.getcurpart())) { 
		  //(newnumparts>1 && qg->getnumparts()>1 && newcurpart==1 && qg->getcurpart()==1)) { 
				idlist.push(qg.getid());
			//}
		}
	}
	var cid = 0,nidlist = idlist.length;
	var watchdog = 0;
	while(true) {
		++watchdog;
		if (watchdog == 100)
			alert("calcid watchdog!!");
		for (i=0;i<nidlist;++i) {
			if (idlist[i] == cid)
				break; // cid not found, that's the one to use
		}
		if(i == nidlist)
			break; // do it again if found
		++cid;
	}
	return cid;
}

//*/

// just use the copy constructor above
/*qcomp.QColumn.prototype.copy = function(rhs) {
	for (var i=0;i<rhs.numqubits();++i) {
	}
};*/

qcomp.QColumn.prototype.getkind = function(idx) {
	return this.qgates[idx].kind;
};

qcomp.QColumn.prototype.getid = function(idx) {
	return this.qgates[idx].id;
};

qcomp.QColumn.prototype.getnumqubits = function() {
	return this.qgates.length;
};

qcomp.QColumn.prototype.morequbits = function() {
	//var newsize = this.qgates.length + 1;
	//qgates.resize(newsize);
	//qgates[newsize-1] = new qgatebase(calcid(qgatebase::PASSTHRU));
	var gt = qcomp.qtype.PASSTHRU;
	var newqgate = qcomp.QGateBase.build(gt,this.calcid(gt));
	this.qgates.push(newqgate);
	this.calc();
};

qcomp.QColumn.prototype.lessqubits = function() {
	var newsize = this.qgates.length - 1;
	this.qgates.splice(-1,1);
	
	//delete qgates[newsize];
	//qgates.resize(newsize);
	this.calc();
};

qcomp.QColumn.prototype.draw = function(xoff,xscrolloff) {
	// next layer, draw main gate
	var numqubits = this.qgates.length;
	var idoffset = 4; // now a 4
	xoff -= xscrolloff;

	// draw the gates, connections, outline and passthru first
	for (var j=0;j<numqubits;++j) {
		var qg = this.qgates[j];
		var gid = qg.getid();
		var yoff = qcomp.QField.fpixtop + qcomp.QGateBase.gpixhit*j;
		var ioff = idoffset;
		if (qg.getnumparts() > 1/* && qg.getcurpart() == 0*/) {
			ioff = idoffset;
			qg.drawconnect(xoff+ gid*ioff,yoff);
		//} else {
		//	ioff = 1;
		}
		//qg.draw(xoff + gid*ioff,yoff);


		//qg->drawpassthru(xoff,yoff);
		//qg->drawconnect(xoff,yoff);
		//qg->draw(xoff + qg->getid()*4,yoff);
	}
	for (var j=0;j<numqubits;++j) {
		var qg = this.qgates[j];
		var gid = qg.getid();
		var yoff = qcomp.QField.fpixtop + qcomp.QGateBase.gpixhit*j;
		var ioff = idoffset;
		if (qg.getnumparts() > 1/* && qg.getcurpart() == 0*/) {
			ioff = idoffset;
			//qg.drawconnect(xoff+ gid*ioff,yoff);
		} else {
			ioff = 1;
		}
		qg.draw(xoff + gid*ioff,yoff);


		//qg->drawpassthru(xoff,yoff);
		//qg->drawconnect(xoff,yoff);
		//qg->draw(xoff + qg->getid()*4,yoff);
	}
	if (this.linkback >= 0) {
	//	outtextxyfc32(B32,xc,yc + 10,F32BLUE,"L=%d",linkback);
		//qcomp.spriteHandle.addLine([0,0],[100,100],F32BLUE,2);

		//xoff -= xscrolloff;
		var yoff = qcomp.QField.fpixtop + qcomp.QGateBase.gpixhit * numqubits;
		//var xc2 = qcomp.QFieldfpixleft + qcolumn::cpixwid*linkback - xscrolloff;
		var xc = xoff + qcomp.QColumn.cpixwid/2;
		var yc = yoff + 10;// + gpixhit/2;
		var xc2 = qcomp.QField.fpixleft + qcomp.QColumn.cpixwid*this.linkback + qcomp.QColumn.cpixwid/2 - xscrolloff;
		var yc2 = yoff + 80;
		qcomp.spriteHandle.addLine([xc,yc],[xc2,yc2],[0,0,.67,.25],2);
	}
	
	///// start draw EXPO ////
	
	if (qcomp.sm == qcomp.showmode.EXPO) {
		var texname = "columnExpoDataNum" + this.col;
		var extraDown = 130; // move EXPO down to make room for header text
		if (numqubits <= 4) {
			var yoff = qcomp.QField.fpixtop + qcomp.QGateBase.gpixhit * numqubits + qcomp.QField.bottomMargin + extraDown;
			qcomp.spriteHandle.add(texname,[xoff,yoff]); // handle top left
		}
	}
	
	///// end draw EXPO ////
	
	
};


qcomp.QColumn.prototype.drawoutline = function(xoff) {
	var numqubits = this.qgates.length;
	for (var j=0;j<numqubits;++j) {
		var qg = this.qgates[j];
		var yoff = qcomp.QField.fpixtop + qcomp.QGateBase.gpixhit*j;
		//qg->drawoutline(xoff,yoff);
		//qg->drawpassthru(xoff,yoff);
		qg.drawoutline(xoff,yoff);
	}
};

// save some time for passthru columns
qcomp.QColumn.prototype.ispassthru = function() {
	var numqubits = this.qgates.length;
	var i;
	for (i=0;i<numqubits;++i)
		if (this.qgates[i].getkind() != qcomp.qtype.PASSTHRU)
			return false;
	return true;
};

// calc both the math and the circuit layout
qcomp.QColumn.prototype.calc = function() {
	var numqubits = this.qgates.length;
	this.qmcol = new qcomp.QMat(1<<numqubits);
	this.qqcol = new quat.create();
	if (this.ispassthru()) {
		//this.redrawExpo();
		return;
	}
	var filler = [
		qcomp.QMat.qmatqu(numqubits-0), // filler, max qubits
		qcomp.QMat.qmatqu(numqubits-1), // filler, max qubits - 1, for simple gates
		qcomp.QMat.qmatqu(numqubits-2), // filler, max qubits - 2, for 2 in/out gates
		qcomp.QMat.qmatqu(numqubits-3), // filler, max qubits - 3, for 3 in/out gates
		qcomp.QMat.qmatqu(numqubits-4), // filler, max qubits - 4, for 4 in/out gates
		qcomp.QMat.qmatqu(numqubits-5), // filler, max qubits - 5, for 5 in/out gates
		qcomp.QMat.qmatqu(numqubits-6), // filler, max qubits - 6, for 6 in/out gates
	];
	
	/*
#if 0 // set qmat to something, test, enum of first gate goes to ele 3 2, test
	qgatebase*qg = qgates[0]; // top gate
	U32 kind = qg->getbasekind(); // kind maps to a value in the matrix, test
	qm.ele[3][2] = float(kind) * .01f; // show top gate in matrix, test
	//qmat nqm; // should be 1x1 matrix set to 1, 0 qubits
	qmat nqm = qmat::qmatqu(numqubits);
	//qmat onepassthru(2); // one qubit
#endif
*/	
	var nqm = qcomp.QMat.qmatqu(numqubits);//qmat nqm = qmat::qmatqu(numqubits);
	var swapbits = createArray(numqubits); //	vector<U32> swapbits(numqubits);
	var usedbits = createArray(numqubits); // vector<bool> usedbits(numqubits);
	// circuit layout
	var i,j,numqubits = this.qgates.length;
	for (i=0;i<numqubits;++i) {
		var qg = this.qgates[i]; // check to see if gate is 'whole'
		var curid = qg.getid(); // id of current 'gate' with all it's parts
		var kind = qg.getkind();
		var bkind = qg.getbasekind();
		var numparts = qg.getnumparts();
		var curpart = qg.getcurpart();
		var parts = createArray(numparts);
		parts.fill(0);
		var ypos = createArray(numparts);
		ypos.fill(0);
		//vector<U32> parts(numparts); // count how many diff parts used, should all be '1'
		//vector<U32> ypos(numparts); // which qubit this part is in, good for vertical lines, and calc gates qubit index position
		// see if gate is 'whole' by running thru 1 gate (single/multi)
		for (j=0;j<numqubits;++j) {
			var qg2 = this.qgates[j];
			var curid2 = qg2.getid();
			var bkind2 = qg2.getbasekind();
			if (curid == curid2 && bkind == bkind2) {
				var curpart2 = qg2.getcurpart();
				++parts[curpart2];
				ypos[curpart2] = j;
			}
		}
		//logger("calced a qgate in qcolumn\n");
		for (j=0;j<numparts;++j) {
			if (parts[j] != 1) {
				break;
			}
		}
		var goodpart = j == numparts;
		qg.setdrawcolor(goodpart ? qcomp.QGateBase.goodcolor : qcomp.QGateBase.badcolor);
		if (goodpart && curpart + 1 < numparts) { // connect first and last one
			//qg->setnextyoffset(ypos[numparts-1] - ypos[curpart]);
			qg.setnextyoffset(ypos[curpart+1] - ypos[curpart]);
		} else {
			qg.setnextyoffset(0);
		}

		for (j=0;j<numqubits;++j) {
			swapbits[j] = j;
			usedbits[j] = false;
		}

		// for now multi gate is ident
		if (goodpart && curpart == 0 && kind != qcomp.qtype.PASSTHRU) {
			var sqm = qg.getqmat();
			var full = sqm.mulTensor(filler[numparts]); // sqm^filler[numparts];
			for (j=0;j<numparts;++j) {
				var dest = ypos[j];
				swapbits[j] = dest;
				usedbits[dest] = true;
			}
			// move passthru into old positions, (invertable)
			for(;j<numqubits;++j) {
				var u = 0;
				while(usedbits[u]) {
					++u;
				}
				swapbits[j] = u;
				usedbits[u] = true;
			}
			full = full.swapqubits(swapbits);
			nqm = nqm.mulMat(full); // nqm = nqm*full;
		}
	}
	this.qmcol = nqm;
	if (numqubits == 1) {
		qcomp.QField.toBlochQuatMat(this.qmcol,this.qqcol);
	}
	//this.redrawExpo(); // TODO: comment out RICK
};

qcomp.QColumn.prototype.getqmatcol = function() {
	return this.qmcol;
};

qcomp.QColumn.prototype.getqmatacc = function() {
	return this.qmacc;
};

qcomp.QColumn.prototype.setqmatacc = function(ac) {
	this.qmacc = clone(ac);
};

qcomp.QColumn.prototype.getqquatcol = function() {
	return this.qqcol;
};

qcomp.QColumn.prototype.getqquatacc = function() {
	return this.qqacc;
};

qcomp.QColumn.prototype.setqquatacc = function(ac) {
	this.qqacc = clone(ac);
};

qcomp.QColumn.prototype.getlinkback = function() {
	return this.linkback;
};

qcomp.QColumn.prototype.setlinkback = function(linkbacka) {
	this.linkback = linkbacka;
};

// EXPO
/*
qcomp.QColumn.getCssColorFromComplex = function(val) {
	var p = compf.abs(val);
	var g = 255*p;
	var r = 0;
	var b = 0;
	return "rgb(" + r + "," + g + "," + b + ")";
};
*/

qcomp.QColumn.getCssColorFromComplex = function(val) {
	var mg = compf.abs(val);
	var ang = Math.atan2(val[1],val[0]);
	ang *= 180/Math.PI;
	brt = 55*mg;
	return "hsl(" + ang + ",100%," + brt + "%)";
//	return "rgb(" + r + "," + g + "," + b + ")";
};

qcomp.QColumn.drawExpoPartialCurve = function(ctx, p0, p1, val, part) {
	var startx = p0[0];
	var starty = p0[1];
	var endx = p1[0];
	var endy = p1[1];
	var cp = bezier.getControlPoints(startx,starty,endx,endy);
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
	
	ctx.strokeStyle = qcomp.QColumn.getCssColorFromComplex(val);
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(xp[0], yp[0]);
	ctx.bezierCurveTo(xp[2], yp[2], xp[3], yp[3], xp[1], yp[1]);
	ctx.stroke();
};

qcomp.QColumn.drawExpoCurve = function(ctx, p0, p1, val) {
	var startx = p0[0];
	var starty = p0[1];
	var endx = p1[0];
	var endy = p1[1];
	var cp = bezier.getControlPoints(startx,starty,endx,endy);
	
	ctx.strokeStyle = qcomp.QColumn.getCssColorFromComplex(val);
	//ctx.strokeStyle = "green";
	ctx.lineWidth = 1.95;
	ctx.beginPath();
	ctx.moveTo(startx, starty);
	ctx.bezierCurveTo(cp.cp1x, cp.cp1y, cp.cp2x, cp.cp2y, endx, endy);
	ctx.stroke();
};

qcomp.QColumn.drawPhaseCircle = function(ctx, p, ang, rad) {
	var px = p[0];
	var py = p[1];

	ctx.lineWidth = .25;
	ctx.strokeStyle = 'black';
	ctx.fillStyle = 'white';
	ctx.beginPath();
	ctx.arc(px, py, rad, 0, 2*Math.PI);  // Control point one
	ctx.closePath();
	ctx.fill();	
	ctx.stroke();
	
	ctx.fillStyle = 'black';
	ctx.beginPath();
	ctx.moveTo(px, py);
	ctx.arc(px, py, rad, -.5*Math.PI, ang - .5*Math.PI);  // Control point one
	ctx.closePath();
	ctx.fill();		
};

qcomp.QColumn.drawAmpColor = function(ctx, p, val, rad) {
	//if (val[1] == 0)
	//	return;
	var px = p[0];
	var py = p[1];
	ctx.fillStyle = qcomp.QColumn.getCssColorFromComplex(val);
	ctx.beginPath();
	ctx.arc(px, py, rad, 0, 2*Math.PI);  // Control point one
	ctx.closePath();
	ctx.fill();	
};

// EXPO

qcomp.QColumn.heights = [1,164,228,260,276]; // indexed by qubit (max 4)


qcomp.QColumn.prototype.redrawExpo = function() {
	var numqubits = this.qgates.length;
	if (numqubits > 4) // too many
		return;
	// start EXPO
	var texname = "columnExpoDataNum" + this.col;
	var c = document.createElement('canvas');
	
	var texX = qcomp.QColumn.cpixwid;
	var texY = qcomp.QColumn.heights[numqubits];
	c.width = texX;
	c.height = texY;
	
	// make a 2d context
	var ctx = c.getContext('2d');

	// draw some images on 2d context
	
	// background color
	//ctx.fillStyle="rgb(230,230,230)";
	//ctx.fillRect(0,0,texX,texY);
	ctx.strokeStyle = 'white';
	//ctx.lineWidth = 4.5;
	ctx.strokeRect(0,0,texX,texY);
	ctx.fillStyle = 'black';

	var wires = 1<<numqubits;
	
	// setup for each size qubits
	var startLine = 18;
	var stepLine = 16;
	if (numqubits < 4)
		stepLine *= 2;
	if (numqubits < 3)
		stepLine *= 2;
	if (numqubits < 2)
		stepLine *= 2;
	

	// draw curves for each state from start to end
	var qsin = new qcomp.QState(numqubits);
	qsin.init0();
	//var qsout = qm*qsin;
	var qsout;
	if (this.col > 0) {
		var qm = qcomp.qf.getqmatacc(this.col - 1);
		qsout = qm.mulState(qsin);
	} else {
		qsout = qsin;
	}
	var tb = qsout.gettotprob();
	if (tb >= qcomp.QEPSILON) {
		qsout.normalize();
	}

	// 2 Passes
	// pass 1
	for (var j=0;j<wires;++j) {
		dy = startLine + j*stepLine;
		var p0 = vec2.fromValues(0,dy);
		for (var i=0;i<wires;++i) {
			let emMat = this.qmcol.ele[i][j]; // element of matrix
			let emMatMag = compf.create(compf.abs(emMat),0); // how much amp is reduced during split
			//emMat = emMatMag;
			let qsBefore = qsout.states[j]; // element of before state
			//let val3 = emMat * qsBefore;
			
			let qsBeforeSplit = compf.create();
			compf.mul(qsBeforeSplit,emMatMag,qsBefore);
			let qsAfter = compf.create();
			compf.mul(qsAfter,emMat,qsBefore);
			let emMatMag2 = compf.squaredAbs(emMat);
			if (emMatMag2 > qcomp.QEPSILON) {
				sy = startLine + i*stepLine;
				p1 = vec2.fromValues(texX,sy);
				var slope = Math.abs(i - j);
				var t = 1/(2 + .5*slope) - .11;
				//t = .25;
				var startx = p0[0];
				var starty = p0[1];
				var endx = p1[0];
				var endy = p1[1];
				//var pm = bezier.getCoords(startx,starty,endx,endy,t);
				
				var ang = Math.atan2(emMat[1],emMat[0]); // get phase shift of matrix element
				var fromZero = Math.abs(ang);
				//if (false) {
				if (fromZero > qcomp.QEPSILON) {
					// some phase shift
					qcomp.QColumn.drawExpoCurve(ctx,p0,p1,qsAfter); // after phase shift
					qcomp.QColumn.drawExpoPartialCurve(ctx,p0,p1,qsBeforeSplit,t); // before phase shift
				} else {
					// no phase shift
					qcomp.QColumn.drawExpoCurve(ctx,p0,p1,qsBeforeSplit); // draw whole curve
				}
				//qcomp.QColumn.drawPhaseCircle(ctx,pm,emMat,12-2*numqubits);
			}
		}
	} 
	// pass 2
	for (var j=0;j<wires;++j) {
		dy = startLine + j*stepLine;
		var p0 = vec2.fromValues(0,dy);
		for (var i=0;i<wires;++i) {
			let emMat = this.qmcol.ele[i][j];
			let mag2 = compf.squaredAbs(emMat);
			if (mag2 > qcomp.QEPSILON) {
				sy = startLine + i*stepLine;
				p1 = vec2.fromValues(texX,sy);
				var slope = Math.abs(i - j);
				var t = 1/(2 + .5*slope) - .11;
				//t = .25;
				var startx = p0[0];
				var starty = p0[1];
				var endx = p1[0];
				var endy = p1[1];
				var pm = bezier.getCoords(startx,starty,endx,endy,t);
				
				//qcomp.QColumn.drawExpoCurve(ctx,p0,p1,mag2);
				var ang = Math.atan2(emMat[1],emMat[0]);
				var fromZero = Math.abs(ang);
				if (fromZero > qcomp.QEPSILON) {
					qcomp.QColumn.drawPhaseCircle(ctx,pm,ang,8-numqubits);
				}
			}
		}
	} 
	
	// draw circle for each state
	var ampcolrad = 8;
	var doarcs = true;
	if (doarcs && qcomp.qf) {
		// left side before
		var qsin = new qcomp.QState(numqubits);
		qsin.init0();
		//var qsout = qm*qsin;
		var qsout;
		if (this.col > 0) {
			var qm = qcomp.qf.getqmatacc(this.col - 1);
			qsout = qm.mulState(qsin);
		} else {
			qsout = qsin;
		}

		// draw left side
		var tb = qsout.gettotprob();
		if (tb >= qcomp.QEPSILON) {
			qsout.normalize();
			for (var i=0;i<wires;++i) {
				qcomp.QColumn.drawAmpColor(ctx,[0,startLine + i*stepLine],qsout.states[i],ampcolrad);
			} 
		}
		
		// right side after
		var qsin = new qcomp.QState(numqubits);
		qsin.init0();
		//var qsout = qm*qsin;
		//var qsout;
		//if (this.col > 0) {
			var qm = qcomp.qf.getqmatacc(this.col);
			qsout = qm.mulState(qsin);
		//} else {
		//	qsout = qsin;
		//}

		// draw right side
		var tb = qsout.gettotprob();
		if (tb >= qcomp.QEPSILON) {
			qsout.normalize();
			for (var i=0;i<wires;++i) {
				qcomp.QColumn.drawAmpColor(ctx,[texX,startLine + i*stepLine],qsout.states[i],ampcolrad);
			} 
		}
	}
	// now make a texture out of the canvas
	if (this.col == 0) // debug
		logger("createtexture col redrawExpo 0");
	this.dt.glfree();
	this.dt = DataTexture.createtexture(texname,c);
	// end EXPO
};

qcomp.QColumn.prototype.glfree = function() {
	if (!this.dt)
		logger("no dt to free");
	if (this.col == 0)
		logger("glfree col 0");
	this.dt.glfree();
	this.dt = null;
};

