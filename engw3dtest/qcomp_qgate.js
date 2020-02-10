// QGateBase, base class for quantum gates, maybe make data driven instead of class driven
qcomp.QGateBase = function(kind,id) {
	if (typeof kind == 'object') { // copy constructor
		var rhs = kind;
		this.kind = rhs.kind;
		this.id = rhs.id;
		this.drawcolor = vec4.clone(rhs.drawcolor);
		this.nyoff = rhs.nyoff;
	} else { // regular constructor
		this.kind = kind;
		this.id = id;
		this.drawcolor = qcomp.QGateBase.goodcolor; // for errors, white, more like bordercolor
		//this.drawcolor = F32([250,200,200]); // white
		this.nyoff = 0; // no vertical line
	}
};

qcomp.QGateBase.gpixhit = 80;
qcomp.QGateBase.goodcolor = F32([240,240,240]);
qcomp.QGateBase.badcolor = F32([250,150,150]);

qcomp.QGateBase.findqtypebyfilename = function(qname) {
	if (!isNaN(qname)) {
		var num = Number(qname);
		return num;
	}
	var i,n = qcomp.qgateinfo.length;
//	var i,n = qcomp.qgfilenames.length;
	for (i=0;i<n;++i) {
		if (qname == qcomp.qgateinfo[i].fullname) {
		//if (qname == qcomp.qgfilenames[i]) {
			return i;
		}
	}
	return qcomp.qtype.PASSTHRU;
};

qcomp.QGateBase.build = function(kind,id) {
	if (id == null)
		id = 0;
	//if (kind >= qcomp.qtype.QTYPEENUM)
	if (kind >= qcomp.qgateinfo.length)
		kind = qcomp.qtype.PASSTHRU;
	return new qcomp.QGateBase(kind,id);
};

qcomp.QGateBase.prototype.getkind = function() {
	return this.kind;
};

qcomp.QGateBase.prototype.getnumparts = function() {
	//return 1;
	var qgi = qcomp.qgateinfo[this.kind];
	//if (typeof qgi == 'string')
	//	return 1;
	//if (qgi === undefined) {
	//	logger("qgi === undefined\n");
	//}
	if (qgi.numparts === undefined)
		return 1;
	return qgi.numparts;
};

qcomp.QGateBase.prototype.getcurpart = function() {
	//return 0;
	var qgi = qcomp.qgateinfo[this.kind];
	if (typeof qgi == 'string')
		return 0;
	if (qgi.curpart === undefined)
		return 0;
	return qgi.curpart;
};
	
qcomp.QGateBase.prototype.getbasekind = function() {
	//return this.kind;
	var qgi = qcomp.qgateinfo[this.kind];
	if (typeof qgi == 'string')
		return this.kind;
	if (qgi.curpart === undefined)
		return this.kind;
	return this.kind - qgi.curpart; // this gets you back to the basekind
};

qcomp.QGateBase.prototype.getid = function() {
	return this.id;
};

qcomp.QGateBase.prototype.drawoutline = function(xoff,yoff) {


	//return;
	// draw std outline
	//cliprecto32(bm,xoff,yoff,qcolumn::cpixwid,gpixhit,bordercolor);
	//outtextxyf32(bm,xoff + 2,yoff + 2,F32BLACK,"%d",id);
	//outtextxyf32(bm,xoff - 2 + qcolumn::cpixwid - 24,yoff  + 2,F32BLACK,"%3d",nyoff);
	//qcomp.spriteHandle.addRectangleo([xoff,yoff],[qcomp.QColumn.cpixwid,qcomp.QGateBase.gpixhit],qcomp.QGateBase.bordercolor);
	qcomp.spriteHandle.addRectangleo([xoff,yoff],[qcomp.QColumn.cpixwid,qcomp.QGateBase.gpixhit],this.drawcolor);


	//var loadfile = qcomp.qgfilenames[this.kind] + ".png";
	//loadfile = qcomp.Space2Underscore(loadfile); // asset doesn't use space, it uses underscore
	//qcomp.spriteHandle.add(loadfile,[xoff,yoff]); // handle top left
};

qcomp.QGateBase.prototype.drawconnect = function(xoff,yoff) {
	 // draw a line down to bottom
	var xoffc = xoff + qcomp.QColumn.cpixwid/2 + .5;
	var yoffc = yoff + qcomp.QGateBase.gpixhit/2;
/*	clipline32(bm,xoffc,yoffc,xoffc,yoffc+nyoff*gpixhit,drawcolor);
	clipline32(bm,xoffc+1,yoffc,xoffc+1,yoffc+nyoff*gpixhit,drawcolor); */
	qcomp.spriteHandle.addLine([xoffc,yoffc],[xoffc,yoffc + qcomp.QGateBase.gpixhit*this.nyoff],F32BLUE,2);
/*
	// draw a line down to bottom
	U32 xoffc = xoff + qcolumn::cpixwid/2;
	U32 yoffc = yoff + gpixhit/2;
	clipline32(bm,xoffc,yoffc,xoffc,yoffc+nyoff*gpixhit,drawcolor);
	clipline32(bm,xoffc+1,yoffc,xoffc+1,yoffc+nyoff*gpixhit,drawcolor);
*/	
	
};

qcomp.QGateBase.prototype.setdrawcolor = function(ca) {
	this.drawcolor = ca;
};

//var bc = 250; // almost white
//qcomp.QGateBase.bordercolor = F32([bc,bc,bc]);
qcomp.QGateBase.prototype.setnextyoffset = function(nyoffa) {
	this.nyoff = nyoffa;
};

qcomp.QGateBase.prototype.draw = function(xoff,yoff) {
	//var qi = 
	var loadfile = qcomp.qgateinfo[this.kind].fullname + ".png";
	//if (!loadfile)
	//	loadfile = qi.name;
	//loadfile += ".png";
	//var loadfile = qcomp.qgateinfo[this.kind].fullname + ".png";
	//var loadfile = qcomp.qgfilenames[this.kind] + ".png";
	loadfile = qcomp.Space2Underscore(loadfile); // asset doesn't use space, it uses underscore
	qcomp.spriteHandle.add(loadfile,[xoff,yoff]); // handle top left
};

qcomp.QGateBase.prototype.getqmat = function() {
	var qgi = qcomp.qgateinfo[this.kind];
	var mat = qgi.gatemat;
	//if (mat)
		return new qcomp.QMat(mat);
	//var qm = qcomp.QMat.qmatqu(this.getnumparts());
	//return qm;
};
