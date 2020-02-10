if (!window.uiclass)
	var uiclass = {};

// sizer CLASS
uiclass.sizer = function(name,x,y,w,h) {
	if (typeof name != 'string') { // script
		var sc = name;
		uiclass.uitree2drect.call(this,sc);
	} else { // args
		uiclass.uitree2drect.call(this,name,x,y,w,h);
	}
	this.refx = 0;
	this.refy = 0;
	this.classname = "sizer";
	
	// make a hierarchy, rect is first child
	//this.atree.name = "asizer";
};

uiclass.sizer.prototype.proc = function() {
	if (!this.doproc)
		return;
	uiclass.uitree2drect.prototype.proc.apply(this);
	//this.w = 1.001 * this.w;
	var pinf = this.parent;
	if (!pinf)
		return;
	this.o2p.x = pinf.w - this.w;
	this.o2p.y = pinf.h - this.h;
	var fc = uiclass.uitree.getfocus()
	if (fc != this)
		return;
	//logger("focus mover\n");
	if (input.mbut[Input.MLEFT]) {
		if (!(input.lmbut[Input.MLEFT])) {
			var oldo2p = pinf.o2p;
			this.refx = uiclass.uitree.fmxy.x - this.o2p.x;
			this.refy = uiclass.uitree.fmxy.y - this.o2p.y;
		}
		this.o2p.x = uiclass.uitree.fmxy.x - this.refx;
		this.o2p.y = uiclass.uitree.fmxy.y - this.refy;
		var npszx = this.o2p.x + this.w;
		var npszy = this.o2p.y + this.h;
		pinf.w = npszx;
		pinf.h = npszy;
	} else {
		uiclass.uitree.setfocus(this.parent);
	}
};

// mover CLASS
uiclass.mover = function(name,x,y,w,h) {
	if (typeof name != 'string') { // script
		var sc = name;
		uiclass.uitree2drect.call(this,sc);
	} else { // args
		uiclass.uitree2drect.call(this,name,x,y,w,h);
	}
	this.rbord = this.w; // original width
	this.refx = 0;
	this.refy = 0;
	this.classname = "mover";
	
	// make a hierarchy, rect is first child
	//this.atree.name = "amover";
};

uiclass.mover.prototype.proc = function() {
	if (!this.doproc)
		return;
	uiclass.uitree2drect.prototype.proc.apply(this);
	//this.w = 1.001 * this.w;
	if (!this.parent)
		return;
	var pinf = this.parent;
	this.o2p.x = 0;
	this.o2p.y = 0;
	this.w = this.parent.w - this.rbord;
	var fc = uiclass.uitree.getfocus()
	if (fc == this) {
		//logger("focus mover\n");
		if (input.mbut[Input.MLEFT]) {
			if (!(input.lmbut[Input.MLEFT])) {
		//if (MBUT&M_LBUTTON) {
		//	if (!(LMBUT&M_LBUTTON)) {
				//pointf2 oldo2p = pinf->geto2p();
				var oldo2p = pinf.o2p;
				this.refx = oldo2p.x - uiclass.uitree.fmxy.x;
				this.refy = oldo2p.y - uiclass.uitree.fmxy.y;
			}
			var no2px = uiclass.uitree.fmxy.x + this.refx;
			var no2py = uiclass.uitree.fmxy.y + this.refy;
			pinf.seto2p(no2px,no2py);
		} else {
			uiclass.uitree.setfocus(parent);
		}
	}
};
/*
void mover::proc()
{
	if (!doproc)
		return;
	uitree2drect::proc();
	if (!parent)
		return;
	uitree2drect* pinf=dynamic_cast<uitree2drect*>(parent);
	if (!pinf)
		return;
	o2p.x=0;
	o2p.y=0;
	size.x=pinf->getsize().x-rbord;
	if (getfocus()==this) {
		if (MBUT&M_LBUTTON) {
			if (!(LMBUT&M_LBUTTON)) {
				pointf2 oldo2p=pinf->geto2p();
				ref.x=oldo2p.x-fmxy.x;
				ref.y=oldo2p.y-fmxy.y;
			}
			pointf2 no2p;
			no2p.x=fmxy.x+ref.x;
			no2p.y=fmxy.y+ref.y;
			pinf->seto2p(no2p);
		} else {
			setfocus(parent);
		}
	}
}
*/

// xscroll CLASS
uiclass.xscroll = function(name,x,y,w,h) {
	if (typeof name != 'string') { // script
		var sc = name;
		uiclass.uitree2drect.call(this,sc);
	} else { // args
		uiclass.uitree2drect.call(this,name,x,y,w,h);
	}
	this.classname = "xscroll";
	
	// make a hierarchy, rect is first child
	//this.atree.name = "axscroll";
};

uiclass.xscroll.prototype.proc = function() {
	if (!this.doproc)
		return;
	uiclass.uitree2drect.prototype.proc.apply(this);
	var parentrect = this.parent; // see if a rect
	if (!parentrect)
		return;
	//if (parentrect) {
		//pointf2 psz=parentrect->getsize(); /// adjust position to lower left of parent

		this.o2p.y = parentrect.h - this.h;//0;
		this.o2p.x = this.h;
		this.w = parentrect.w - 2*this.h;

		//}
};

// yscroll CLASS
uiclass.yscroll = function(name,x,y,w,h) {
	if (typeof name != 'string') { // script
		var sc = name;
		uiclass.uitree2drect.call(this,sc);
	} else { // args
		uiclass.uitree2drect.call(this,name,x,y,w,h);
	}
	this.classname = "yscroll";
	
	// make a hierarchy, rect is first child
	//this.atree.name = "ayscroll";
};

uiclass.yscroll.prototype.proc = function() {
	if (!this.doproc)
		return;
	uiclass.uitree2drect.prototype.proc.apply(this);
	var parentrect = this.parent; // see if a rect
	if (!parentrect)
		return;
	//if (parentrect) {
		//pointf2 psz=parentrect->getsize(); /// adjust position to lower left of parent

		this.o2p.x = parentrect.w - this.w;//0;
		this.o2p.y = this.w;
		this.h = parentrect.h - 2*this.w;

		//}
};

// cloner CLASS
uiclass.cloner = function(name,x,y,w,h,bname) {
	if (typeof name != 'string') { // script
		var sc = name;
		uiclass.button.call(this,sc);
	} else { // args
		uiclass.button.call(this,name,x,y,w,h,bname);
	}
	this.classname = "cloner";
	
	// make a hierarchy, rect is first child
	//this.atree.name = "acloner";
};

uiclass.cloner.prototype.proc = function() {
	if (!this.doproc)
		return;
	uiclass.button.prototype.proc.apply(this);

	var parentrect = this.parent; // see if a rect
	if (!parentrect)
		return;
	//if (parentrect) {
		//pointf2 psz=parentrect->getsize(); /// adjust position to lower left of parent
		this.o2p.x = parentrect.w - this.w;//0;
		this.o2p.y = 0;
	//}
	if (!this.pressed())
		return;
/*	uitree* parentparent=parent->getparent(); /// get parent's parent
	if (!parentparent) /// must not delete the root, (safety)
		return;
	parent->dokillc();
*/	
};

// deleter CLASS
uiclass.deleter = function(name,x,y,w,h,bname) {
	if (typeof name != 'string') { // script
		var sc = name;
		uiclass.button.call(this,sc);
	} else { // args
		uiclass.button.call(this,name,x,y,w,h,bname);
	}
	this.classname = "deleter";
	
	// make a hierarchy, rect is first child
	//this.atree.name = "adeleter";
};

uiclass.deleter.prototype.proc = function() {
	if (!this.doproc)
		return;
	uiclass.button.prototype.proc.apply(this);
	var parentrect = this.parent; // see if a rect
	if (!parentrect)
		return;
	//if (parentrect) {
		//pointf2 psz=parentrect->getsize(); // adjust position to lower left of parent
		this.o2p.x = 0;
		this.o2p.y = parentrect.h - this.h; // 0;
	//}
	if (!this.pressed())
		return;
/*	uitree* parentparent=parent->getparent(); // get parent's parent
	if (!parentparent)
		return;
	uitree* parentcopy=parent->copy(); // copy parent
	uitree2drect* parentrectcopy=dynamic_cast<uitree2drect*>(parentcopy);
	if (parentrectcopy) { // adjust pos parentcopy if a rect
		pointf2 pp=parentrectcopy->geto2p();
		pp.x+=3;
		pp.y+=3;
		parentrectcopy->seto2p(pp);
	}
	parentparent->linkchild(parentcopy);
	uitree::setfocus(parentcopy); */
};

// buttest0 CLASS
uiclass.buttest0 = function(name,x,y,w,h,bname) {
	if (typeof name != 'string') { // script
		var sc = name;
		uiclass.button.call(this,sc);
	} else { // args
		uiclass.button.call(this,name,x,y,w,h,bname);
	}
	this.classname = "buttest0";
	
	// make a hierarchy, rect is first child
	//this.atree.name = "abuttest0";
};

uiclass.buttest0.prototype.proc = function() {
	if (!this.doproc)
		return;
	uiclass.button.prototype.proc.apply(this);
	if (!this.pressed())
		return;
	var pinf = this.parent;
	if (!pinf)
		return;
	pinf.o2p.x -= 10;
};

// buttest1 CLASS
uiclass.buttest1 = function(name,x,y,w,h,bname) {
	if (typeof name != 'string') { // script
		var sc = name;
		uiclass.button.call(this,sc);
	} else { // args
		uiclass.button.call(this,name,x,y,w,h,bname);
	}
	this.classname = "buttest1";
	
	// make a hierarchy, rect is first child
	//this.atree.name = "abuttest1";
};

uiclass.buttest1.prototype.proc = function() {
	if (!this.doproc)
		return;
	uiclass.button.prototype.proc.apply(this);
	if (!this.pressed())
		return;
	var pinf = this.parent;
	if (!pinf)
		return;
	pinf.o2p.x += 10;
};

// tabs CLASS
uiclass.tabs = function(name,x,y,w,h) {
	if (typeof name != 'string') { // script
		var sc = name;
		uiclass.uitree2drect.call(this,sc);
	} else { // args
		uiclass.uitree2drect.call(this,name,x,y,w,h);
	}
	this.classname = "tabs";
	
	// make a hierarchy, rect is first child
	//this.atree.name = "atabs";
};

uiclass.tabs.prototype.focustofrontenabled = function() {
	return false;
};
