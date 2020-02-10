if (!window.uiclass)
	var uiclass = {};

// uitree BASE CLASS
uiclass.uitree = function(name) {
	if (typeof name != 'string') { // script
		var sc = name;
		name = sc.read();
	}
	this.name = name;
	this.classname = "uitree";
	this.atree = new Tree2(name); // uses no resources
	//this.chld0 = null;
	this.doproc = true;
	this.dodraw = true;
	this.killc = false;
	this.children = [];
	this.parent = null;
};

uiclass.uitree.focus = null;
uiclass.uitree.uisedinput = false;
uiclass.uitree.fmxy = {x:0,y:0};
uiclass.uitree.oldfmxy = {x:0,y:0};
//uiclass.uitree.MOUSEOVERCOUNT = 30;
uiclass.uitree.movecount = 0;
uiclass.uitree.xres;
uiclass.uitree.yres;

uiclass.uitree.prototype.procrec = function() {
	var  nc = this.children.length;
	var i;
	for (i=0;i<nc;++i) {
		this.children[i].proc();
		nc = this.children.length;
	}
};

uiclass.uitree.showfocus = function() {
	
};

uiclass.uitree.showdest = function() {
	
};

uiclass.uitree.setinput = function() {
	uiclass.uitree.oldfmxy.x = uiclass.uitree.fmxy.x;
	uiclass.uitree.oldfmxy.y = uiclass.uitree.fmxy.y;
	uiclass.uitree.usedinput = false;
	uiclass.uitree.fmxy.x = input.mx;
	uiclass.uitree.fmxy.y = input.my;
};

uiclass.uitree.setfocus = function(uiobj) {
	uiclass.uitree.focus = uiobj;
};

uiclass.uitree.getfocus = function() {
	return uiclass.uitree.focus;
};

uiclass.uitree.prototype.killdeaddudes = function() {
	if (this.killc) {
		this.deleteuitree();
		return true;
	}
	var nc = this.children.length;
	var i;
	for (i=0;i<nc;++i) {
		var ret = this.children[i].killdeaddudes();
		if (ret) {
			--i;
			nc = this.children.length;
		}
	}
	return false;
	
};

uiclass.uitree.prototype.focustofront = function() {
	var i;
	var nc = this.children.length;
	var ena = this.focustofrontenabled();
	for (i=0;i<nc;++i) {
		var p = this.children[i];
		if (!p.focustofrontenabled())
			return false;
		var ret = p.focustofront();
		if (p == uiclass.uitree.focus || ret) {
			if (i && ena) {
				p.unlinkchild();
				this.linkchildf(p);
			}
			return true;
		}
	}
	return false;
/*	S32 i,nc=children.size();
	bool ena=focustofrontenabled();
	for (i=0;i<nc;++i) {
		uitree* p=children[i];
//		if (!p->focustofrontenabled())
//			return false;
		bool ret=p->focustofront();
		if (p==focus || ret) {
			if (i && ena) {
				children.erase(children.begin()+i);
				children.insert(children.begin(),p);
			}
			return true;
		}
	}
	return false;
*/	
};

uiclass.uitree.prototype.linkchild = function(ch) {
	if (!ch)
		alert("linkchild: null child");
	if (ch.parent)
		alert("linkchild: child already has a parent");
	ch.parent = this;
	// connect uiclass.uitree
	this.children.push(ch);
	// now connect Tree2 structures
	if (this.atree && ch.atree) {
		//var firstchild = this.chld0;
		this.atree.linkchildback(ch.atree); // link graphics, reverse order
		//if (firstchild) // if a draw child, then put it back in 1st place
		//	firstchild.backchild();
	}
};

uiclass.uitree.prototype.unlinkchild = function() {
	var par = this.parent;
// disconnect uiclass.uitree connection	
	var idx = par.children.indexOf(this);
	if (idx < 0)
		alert("uitree unlinkchild: child " + this.name + "' parent has already disowned you!");
	else
		this.parent.children.splice(idx,1);
	this.parent = null;
// disconnect Tree2 connection	
	if (!par)
		alert("unlinkchild: child has no parent");
	if (par.atree && this.atree)
		this.atree.unlinkchild();
};

uiclass.uitree.prototype.linkchildf = function(ch) {
	if (!ch)
		alert("linkchildf: null child");
	if (ch.parent)
		alert("linkchildf: child already has a parent");
	ch.parent = this;
	// connect uiclass.uitree
	this.children.unshift(ch);
	// now connect Tree2 structures
	this.atree.linkchild(ch.atree);
};

uiclass.uitree.prototype.copychildrenrec = function(n) {
	var nc = this.children.length;
	var i;
	for (i=0;i<nc;++i) {
		n.linkchild(this.children[i].copy());
	}
};

uiclass.uitree.prototype.dokillc = function() {
	this.killc = true;
};

uiclass.uitree.prototype.deleteuitree = function() {
	var nc;
	var i;
	logger("uitree.deleteuitree");
	// free Tree2
	if (this.atree.parent)
		this.atree.unlinkchild();
	this.atree.glfree();
	//uiclass.uitree.prototype.deleteuitree.apply(this); // take care of the children, free them all too

	
	if (uiclass.uitree.focus == this) {
//		logger("~uitree: '%s' '%s' %p setting focus to parent\n",getclassname(),script2print(name).c_str(),this);
		uiclass.uitree.focus = this.parent;
	}
	if (uiclass.uitree.dest == this)
		uiclass.uitree.dest = 0;
	if (uiclass.uitree.tview == this)
		uiclass.uitree.tview = 0;
	if (this.parent) {
//		logger("got a parent\n");
		nc = this.parent.children.length;
		for (i=0;i<nc;++i)
			if (this.parent.children[i] == this)
				break;
		if (i == nc)
			alert("child doesn't belong to parent \n");
		//vector<uitree*>::iterator ti=parent->children.begin()+i;
		//parent->children.erase(ti);
		this.parent.children.splice(i,1);
	}
	nc = this.children.length;
	for (i=0;i<nc;++i) {
		this.children[i].parent = null;
		this.children[i].deleteuitree();
	} 
	// now disconnect and free Tree2 structures
};

uiclass.uitree.prototype.copy = function() {
	// this should be a deep copy, not a reference
	//return this;
	//return clone(this); // not good either
	// should be specialized, so Tree2 class doesn't get copied
	var cp = new uiclass.uitree2d(this.name);
	this.copychildrenrec(cp);
	return cp;
};

uiclass.uitree.prototype.buildo2w = function() {
	var nc = this.children.length;
	var i;
	for (i=0;i<nc;++i)
		this.children[i].buildo2w();
};

uiclass.uitree.prototype.proc = function() {
	if (this.doproc)
		this.procrec();
};

//var drawlevel = 0;
uiclass.uitree.prototype.draw = function() {
	
	if (!this.dodraw)
		return;
	//++drawlevel;
	var nc = this.children.length;
	var i;
	for (i=nc-1;i>=0;--i) {
		//if (drawlevel <= 1)
			this.children[i].draw();
	}
	//--drawlevel;
};

uiclass.uitree.prototype.mouseover = function() {
	if (input.mbut[0])
		return true;
	var nc = this.children.length;
	var i;
	for (i=0;i<nc;++i) {
		var ret = this.children[i].mouseover();
		if (ret)
			return true;
	}
	return false;
};

// NEW ADDITIONS for engw
uiclass.uitree.setres = function(x,y) {
	uiclass.uitree.xres = x;
	uiclass.uitree.yres = y;
}

// set trans and scale of a roottree to handle space of 
// 0,0 to xres,yres
uiclass.uitree.settransscale = function(uiroot) {
	/*
	uiroot.trans = [0,0,1];
	*/
	//uiroot.scale = [];
	/*
	var w = 2*this.w/uiclass.uitree.yres; // asp
	var h = 2*this.h/uiclass.uitree.yres;
	var x = (2*this.x - uiclass.uitree.xres)/uiclass.uitree.yres;
	var y = 2*this.y/uiclass.uitree.yres - 1;
	this.atree.trans = [x,-y,0]; // flip y from 2d to 3d here
	this.atree.scale = [w,h,1];
	*/
	var w = 2/uiclass.uitree.yres;
	var h = 2/uiclass.uitree.yres;
	//w *= 10;
	//h *= 10;
	var x = (2 - uiclass.uitree.xres)/uiclass.uitree.yres;
	var y = 2/uiclass.uitree.yres + 1;
	uiroot.trans = [x,y,1];
	//uiroot.scale = [w,h,1];
	uiroot.scale = [w,h,h];
};

uiclass.uitree.makemouseoverfont = function(rt) {
	//uiclass.uitree.mouseoverfont = buildplanexy01("mouseoverfont",1,1,"Bark.png","tex"); // -1,-1 to 1,1
	//uiclass.uitree.mouseoverfont.flags |= modelflagenums.NOZBUFFER;
	
	uiclass.uitree.mouseoverfont = new Tree2("mouseoverfont");
	//var modfont = new ModelFont("mouseoverfontmodel","font3.png","tex",2*16/glc.clientHeight,2*32/glc.clientHeight,8,1,true);
	var modfont = new ModelFont("mouseoverfontmodel","font3.png","tex",16,32,80,1,true);
    //modfont.mat.fcolor = [0,1,0,1];
    //modfont.mat.bcolor = [0,0,0,1];
    modfont.flags |= modelflagenums.NOZBUFFER; // always in front when drawn
	modfont.print("Mouse Over");
	uiclass.uitree.mouseoverfont.setmodel(modfont);
	// link
	rt.linkchild(uiclass.uitree.mouseoverfont);
};

uiclass.uitree.prototype.focustofrontenabled = function() {
	return true;
};

// uitree2d CLASS
uiclass.uitree2d = function(name,x,y) {
	if (typeof name != 'string') { // script
		var sc = name;
		uiclass.uitree.call(this,sc);
		x = Number(sc.read());
		y = Number(sc.read());
	} else { // args
		uiclass.uitree.call(this,name);
	}
	this.classname = "uitree2d";
	this.o2p = {};
	this.o2p.x = x;
	this.o2p.y = y;
	this.o2w = {};
	//this.atree.name = "uitree2d";
};

uiclass.uitree2d.prototype.seto2p = function(x,y) {
	this.o2p.x = x;
	this.o2p.y = y;
};

uiclass.uitree2d.prototype.copy = function() {
	// this should be a deep copy, not a reference, but tightly controlled so that tree class doesn't get copied
	var cp = new uiclass.uitree2d(this.name,this.o2p.x,this.o2p.y);
	this.copychildrenrec(cp);
	return cp;
};

uiclass.uitree2d.matstack = [];

uiclass.uitree2d.prototype.buildo2w = function() {
//	static vector<pointf2> matstack;
	if (!uiclass.uitree2d.matstack.length) {
		this.o2w.x = this.o2p.x;
		this.o2w.y = this.o2p.y;
	} else {
		//const pointf2& tp=matstack.back();
		var tp = uiclass.uitree2d.matstack[uiclass.uitree2d.matstack.length - 1];
		this.o2w.x = this.o2p.x + tp.x;
		this.o2w.y = this.o2p.y + tp.y;
	}
	uiclass.uitree2d.matstack.push(this.o2w);
	uiclass.uitree.prototype.buildo2w.apply(this);
	uiclass.uitree2d.matstack.pop();
};

uiclass.uitree2d.prototype.draw = function() {
	var x = this.o2p.x;
	var y = this.o2p.y;
	this.atree.trans = [x,-y,0]; // flip y from 2d to 3d here
	uiclass.uitree.prototype.draw.apply(this); /// children on top
};

// uitree2drect CLASS
uiclass.uitree2drect = function(name,x,y,w,h) {
	if (typeof name != 'string') { // script
		var sc = name;
		uiclass.uitree2d.call(this,sc);
		w = Number(sc.read());
		h = Number(sc.read());
	} else { // args
		uiclass.uitree2d.call(this,name,x,y);
	}
	this.classname = "uitree2drect";
	this.w = w;
	this.h = h;
	
	// make a hierarchy, rect is first child
	//this.atree.name = "auitree2drect";
	// tree object super simple
	/*this.chld0 = buildplanexy01("aplanexyUI1c",1,1,"maptestnck.png","tex"); // -1,-1 to 1,1
	this.chld0.mod.flags |= modelflagenums.NOZBUFFER;
	this.atree.linkchild(this.chld0);*/
	name = this.atree.name; // get name from old tree, and overwrite with new planexy01
	this.atree = buildplanexy01(name,1,1,"maptestnck.png","tex"); // -1,-1 to 1,1
	this.atree.mod.flags |= modelflagenums.NOZBUFFER;
	this.atree.flags |= treeflagenums.NOSCALE;
};

/// new non virtual functions for 2d on up
uiclass.uitree2drect.prototype.clickfocus = function() {
	if (uiclass.uitree.usedinput)
		return false;
	//if ((MBUT&M_LBUTTON) && !(LMBUT&M_LBUTTON)) {
	if (input.mbut[Input.MLEFT] && !input.lmbut[Input.MLEFT]) {
		if (this.isinside(uiclass.uitree.fmxy)) {
			uiclass.uitree.setfocus(this);
//			logger("click focus to %p\n",getfocus());
			uiclass.uitree.usedinput=true;
			return true;
		} else {
			uiclass.uitree.setfocus(0);
//			logger("click focus to zero\n");
			return false;
		}
	} else
		return false;
}

uiclass.uitree2drect.prototype.proc = function() {
	if (!this.doproc)
		return;
	uiclass.uitree.prototype.proc.apply(this);
	this.clickfocus();
}

uiclass.uitree2drect.prototype.draw = function() {
	/*
	var w = 2*this.w/uiclass.uitree.yres; // asp
	var h = 2*this.h/uiclass.uitree.yres;
	var x = (2*this.x - uiclass.uitree.xres)/uiclass.uitree.yres;
	var y = 2*this.y/uiclass.uitree.yres - 1;
	this.atree.trans = [x,-y,0]; // flip y from 2d to 3d here
	this.atree.scale = [w,h,1];
	*/
	var w = this.w;
	var h = this.h;
	//this.atree.trans = [x,-y,0]; // flip y from 2d to 3d here
	
	
	//this.atree.scale = [20,20,1];
	this.atree.scale = [w,h,1];
	//this.chld0.scale = [w,h,1];



	uiclass.uitree2d.prototype.draw.apply(this); /// children on top
};


uiclass.uitree2drect.prototype.copy = function() {
	// this should be a deep copy, not a reference, but tightly controlled so that tree class doesn't get copied
	var cp = new uiclass.uitree2drect(this.name,this.o2p.x,this.o2p.y,this.w,this.h);
	this.copychildrenrec(cp);
	return cp;
};

uiclass.uitree2drect.movecount = 0;
uiclass.uitree.num_popup = 0;

uiclass.uitree2drect.prototype.mouseover = function() {
	uiclass.uitree.mouseoverfont.flags |= treeflagenums.DONTDRAW;
	//static S32 movecount;		/// for mouseover
	var MOUSEOVERCOUNT = 30;
	if (!this.doproc)
		return false;
	//if (uitree::mouseover()) /// children first
	if (uiclass.uitree.prototype.mouseover.apply(this)) /// children first
		return true;
	// test font draw first
	//var xt = 0 + 2*(input.mx - glc.clientWidth/2)/glc.clientHeight;
	//var yt = 1 - 2*input.my/glc.clientHeight;
	var xt =  uiclass.uitree.fmxy.x;
	var yt = -uiclass.uitree.fmxy.y;
	uiclass.uitree.mouseoverfont.trans = [xt,yt + 32,0];
	//uiclass.uitree.mouseoverfont.trans = [0,-(uiclass.uitree.yres - 32),0];
	if (this.isinside(uiclass.uitree.fmxy)) {
		//uiclass.uitree.mouseoverfont.flags |= treeflagenums.DONTDRAW;
/*		
		// right mouse button popup
		if ((MBUT&M_RBUTTON)&&!(LMBUT&M_RBUTTON)) {
			uitree2drect* pop=new popup("pop",fmxy.x-o2w.x,fmxy.y-o2w.y,0,0);
			linkchildf(pop);
		}
		// if on top of another popup return parent popup
		if (num_popup) {
//			if (!parent)
//				return true;
			if (!dynamic_cast<popup*>(parent))
				return true;
		}
		// highlight the object the mouse is over
		cliprecto32(B32,(S32)o2w.x,(S32)o2w.y,(S32)size.x,(S32)size.y,F32YELLOW);
		cliprecto32(B32,(S32)o2w.x+1,(S32)o2w.y+1,(S32)size.x-2,(S32)size.y-2,F32MAGENTA);
		// steady mouse movement
		*/
		if (uiclass.uitree.num_popup<=0 && 
		  uiclass.uitree.oldfmxy.x==uiclass.uitree.fmxy.x && 
		  uiclass.uitree.oldfmxy.y==uiclass.uitree.fmxy.y)
			++uiclass.uitree.movecount; // mouse is not moving
		else
			uiclass.uitree.movecount=0;
		if (uiclass.uitree.movecount>MOUSEOVERCOUNT)
			uiclass.uitree.movecount=MOUSEOVERCOUNT;
		if (uiclass.uitree.movecount<MOUSEOVERCOUNT)
			return true; // haven't hovered long enough
		// show the classname of the object the mouse is hovering over (tooltip)
		//outtextxybf32(B32,(S32)fmxy.x+16,(S32)fmxy.y+32,F32WHITE,F32BLACK,"%s",getclassname());
		uiclass.uitree.mouseoverfont.flags &= ~treeflagenums.DONTDRAW;
		var classname = this.classname;
		var pname;
		if (this.classname)
			pname = this.classname + ":" + this.name;
		else
			pname = "foo";
		uiclass.uitree.mouseoverfont.mod.print(pname);
		return true;
	}
	return false;
};

uiclass.uitree2drect.prototype.isinside = function(pnt) {
	var localpntx = pnt.x - this.o2w.x;
	var localpnty = pnt.y - this.o2w.y;
	if (localpntx < 0 || localpnty < 0 || localpntx >= this.w || localpnty >= this.h)
		return false;
	return true;
};

// uitree2dbitmap CLASS
uiclass.uitree2dbitmap = function(name,x,y,w,h,offx,offy,dir,imagename) {
	if (typeof name != 'string') { // script
		var sc = name;
		uiclass.uitree2drect.call(this,sc);
		offx = Number(sc.read());
		offy = Number(sc.read());
		dir = sc.read();
		imagename = sc.read();
	} else { // args
		uiclass.uitree2drect.call(this,name,x,y,w,h);
	}
	this.classname = "uitree2dbitmap";
	this.offx = offx;
	this.offy = offy;
	this.dir = dir;
	this.imagename = imagename;
	
	// make a hierarchy, rect is first child
	//this.atree.name = "auitree2dbitmap";
	// tree object super simple
	//this.chld0 = buildplanexy01("aplanexyUI1c",1,1,"panel.jpg","tex"); // -1,-1 to 1,1
	//this.chld0.mod.flags |= modelflagenums.NOZBUFFER;
	//this.atree.linkchild(this.chld0);
};

// uitree2dbitmap CLASS
uiclass.uitree2dbitmapscale = function(name,x,y,w,h,offx,offy,dir,imagename) {
	if (typeof name != 'string') { // script
		var sc = name;
		uiclass.uitree2dbitmap.call(this,sc);
	} else { // args
		uiclass.uitree2dbitmap.call(this,name,x,y,w,h,offx,offy,dir,imagename);
	}
	this.classname = "uitree2dbitmapscale";
	
	// make a hierarchy, rect is first child
	//this.atree.name = "auitree2dbitmapscale";
	// tree object super simple
	//this.chld0 = buildplanexy01("aplanexyUI1c",1,1,"panel.jpg","tex"); // -1,-1 to 1,1
	//this.chld0.mod.flags |= modelflagenums.NOZBUFFER;
	//this.atree.linkchild(this.chld0);
};


/*
/// 2d bitmap with file name
class uitree2dbitmapscale : public uitree2dbitmap {
protected:
	bitmap32* bout;
	bool update;
public:
/// static functions
	static void* create(script& sc)
	{
		return new uitree2dbitmapscale(sc);
	}
/// non virtual functions
	uitree2dbitmapscale(const C8* na,float xa,float ya,float xsa,float ysa,float offsetxa,float offsetya,const C8* diraa,const C8* fna);
	uitree2dbitmapscale(script& sc);
/// virtual functions
	bitmap32* getbitmap()
	{
		update=1;
		return uitree2dbitmap::getbitmap();
	}
	const C8* getclassname() const
	{
		return "uitree2dbitmapscale";
	}
	~uitree2dbitmapscale()
	{
		if (bout)
			bitmap32free(bout);
	}
	uitree2dbitmapscale* copy()
	{
		uitree2dbitmapscale* n=new uitree2dbitmapscale(name.c_str(),o2p.x,o2p.y,size.x,size.y,offset.x,offset.y,dirname.c_str(),fname.c_str());
		copychildrenrec(n);
		return n;
	}
//	void log()
//	{
//		logger("uitree2dbitmapscale '%s' '%s' (%f,%f,(%f,%f))\n",script2print(name).c_str(),script2print(name2).c_str(),o2p.x,o2p.y,size.x,size.y);
//		logrec();
//	}
	void draw();
//	void save(FILE* fh,bool usename=true);
	void setsize(const pointf2& sizea);
	void loaddata2fn(string fn)
	{
//		logger("in loaddata2fn scale with '%s'\n",fn.c_str());
		uitree2dbitmap::loaddata2fn(fn);
		update=true;
	} 
};
*/
// texter CLASS
uiclass.texter = function(name,x,y,w,h,tname) {
	if (typeof name != 'string') { // script
		var sc = name;
		uiclass.uitree2drect.call(this,sc);
		tname = sc.read();
	} else { // args
		uiclass.uitree2drect.call(this,name,x,y,w,h);
	}
	this.tname = tname;
	this.classname = "texter";
	
	// make a hierarchy, rect is first child
	//this.atree.name = "atexter";
};

// editbox CLASS
uiclass.editbox = function(name,x,y,w,h,tname) {
	if (typeof name != 'string') { // script
		var sc = name;
		uiclass.texter.call(this,sc);
	} else { // args
		uiclass.texter.call(this,name,x,y,w,h,tname);
	}
	this.classname = "editbox";
	
	// make a hierarchy, rect is first child
	//this.atree.name = "aeditbox";
};


// button CLASS
uiclass.button = function(name,x,y,w,h,bname) {
	this.waspressed = false;
	this.down = false;
	if (typeof name != 'string') { // script
		var sc = name;
		uiclass.uitree2drect.call(this,sc);
		bname = sc.read();
	} else { // args
		uiclass.uitree2drect.call(this,name,x,y,w,h);
	}
	this.bname = bname;
	this.classname = "button";
	
	// make a hierarchy, rect is first child
	//this.atree.name = "abutton";
	// tree object super simple
	//this.chld0 = buildplanexy01("aplanexyUI1c",1,1,"panel.jpg","tex"); // -1,-1 to 1,1
	//this.chld0.mod.flags |= modelflagenums.NOZBUFFER;
	//this.atree.linkchild(this.chld0);
};

uiclass.button.prototype.proc = function() {
	if (!this.doproc)
		return;
	uiclass.uitree2drect.prototype.proc.apply(this);
	var fc = uiclass.uitree.getfocus()
	if (fc != this)
		return;
	var isinsiderect = this.isinside(uiclass.uitree.fmxy);
	if (input.mbut[Input.MLEFT]) {
		this.down = isinsiderect;
	} else {
		if (this.down) {
			if (isinsiderect) {
				this.waspressed = true;
				uiclass.uitree.usedinput = true;
			}
			this.down = false;
		}
	}
};

uiclass.button.prototype.pressed = function() {
	var ret = this.waspressed;
	this.waspressed = false;
	return ret;
};

// listbox2d CLASS
uiclass.listbox2d = function(name,x,y,w,h) {
	if (typeof name != 'string') { // script
		var sc = name;
		uiclass.uitree2drect.call(this,sc);
	} else { // args
		uiclass.uitree2drect.call(this,name,x,y,w,h);
	}
	this.classname = "listbox2d";
	
	// make a hierarchy, rect is first child
	//this.atree.name = "alistbox2d";
};


// now connect the classes together
extend(uiclass.uitree,uiclass.uitree2d);
	extend(uiclass.uitree2d,uiclass.uitree2drect);
		extend(uiclass.uitree2drect,uiclass.uitree2dbitmap);
			extend(uiclass.uitree2dbitmap,uiclass.uitree2dbitmapscale);
		extend(uiclass.uitree2drect,uiclass.sizer);
		extend(uiclass.uitree2drect,uiclass.mover);
		extend(uiclass.uitree2drect,uiclass.button);
			extend(uiclass.button,uiclass.cloner);
			extend(uiclass.button,uiclass.deleter);
			extend(uiclass.button,uiclass.buttest0);
			extend(uiclass.button,uiclass.buttest1);
		extend(uiclass.uitree2drect,uiclass.texter);
			extend(uiclass.texter,uiclass.editbox);
		extend(uiclass.uitree2drect,uiclass.listbox2d);
		extend(uiclass.uitree2drect,uiclass.xscroll);
		extend(uiclass.uitree2drect,uiclass.yscroll);
		extend(uiclass.uitree2drect,uiclass.tabs);
