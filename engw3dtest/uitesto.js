// interact with 3d objects UI test
// study class hierarchy
var uitesto = {};

// test webgl

uitesto.roottree;
uitesto.atree;
uitesto.atreesub;
//uitesto.btree;
uitesto.ctree; // for UI test
uitesto.dtree; // for UI test 0,0 to 1,1 simple model

uitesto.dir = [];
uitesto.text = "WebGL: Start testing 3d ui old";

uitesto.title = "uitest old";

// practice class hierarchy

// OLD hierarchy system
var uitestoo = {};

// SHAPE base class

uitestoo.Shape = function(x,y) {
	this.x = x;
	this.y = y;
};

uitestoo.Shape.prototype.draw = function() {
	return "Shape draw = " + this.x + "," + this.y + "\n";
};

// CIRCLE class derived from shape
// Store a reference to our superclass constructor.
uitestoo.Circle = function(x,y,r) {
	this.superclass(x,y);
	this.r = r;
};

// hierarchy
uitestoo.Circle.prototype = new uitestoo.Shape();
delete uitestoo.Circle.prototype.x; // don't need Shape members in Circle prototype
delete uitestoo.Circle.prototype.y;
uitestoo.Circle.prototype.superclass = uitestoo.Shape;

uitestoo.Circle.prototype.draw = function() {
	var superstring = this.superclass.prototype.draw.apply(this);
	return "Circle draw = " + superstring + " , " + this.r + "\n";
};

// COLOR CIRCLE class derived from circle
// Store a reference to our superclass constructor.
uitestoo.ColorCircle = function(x,y,r,c) {
	this.superclass(x,y,r);
	this.c = c;
};

uitestoo.ColorCircle.prototype = new uitestoo.Circle();
//delete uitestoo.Circle.prototype.x; // don't need Shape members in Circle prototype
//delete uitestoo.Circle.prototype.y;
uitestoo.ColorCircle.prototype.superclass = uitestoo.Circle;

uitestoo.ColorCircle.prototype.draw = function() {
	var superstring = this.superclass.prototype.draw.apply(this);
	return "Color Circle draw = " + superstring + " , " + this.c + "\n";
};

uitestoo.Foo = function() {
	this.a = 1; 
};

// NEW hierarchy system

// SHAPE CLASS
uitesto.Shape = function(x,y) {
  this.x = x;
  this.y = y;
};

uitesto.Shape.prototype.draw = function() {
	return "Shape draw : x = " + this.x + " y = " + this.y;
};

uitesto.Shape.prototype.showpos = function() {
	return "Shape showpos : x = " + this.x + " y = " + this.y;
};

// CIRCLE CLASS extends SHAPE
uitesto.Circle = function(x,y,r) {
  // Call the parent's constructor
  uitesto.Shape.call(this,x,y);
  this.r = r;
};

uitesto.Circle.prototype.draw = function() {
	return "Circle draw : r = " + this.r + " super : " + uitesto.Shape.prototype.draw.apply(this);
	  //logger("draw Circle this.superclass.prototype.draw.apply(this);
}; 

uitesto.Circle.prototype.showradius = function() {
	return "Circle showradius : r = " + this.r;
	  //logger("draw Circle this.superclass.prototype.draw.apply(this);
}; 

// COLORCIRCLE CLASS extends CIRCLE
uitesto.ColorCircle = function(x,y,r,c) {
  // Call the parent's constructor
  uitesto.Circle.call(this,x,y,r);
  this.c = c;
};

uitesto.ColorCircle.prototype.draw = function() {
	return "ColorCircle draw : c = " + this.c + " super : " + uitesto.Circle.prototype.draw.apply(this);
}; 

// COLORCIRCLESCALE CLASS extends COLORCIRCLE
uitesto.ColorCircleScale = function(x,y,r,c,s) {
  // Call the parent's constructor
  uitesto.ColorCircle.call(this,x,y,r,c);
  this.s = s;
};

uitesto.ColorCircleScale.prototype.draw = function() {
	return "ColorCircleScale draw : s = " + this.s + " super : " + uitesto.ColorCircle.prototype.draw.apply(this);
}; 

// Setup the prototype chain the right way
// order matters !!
extend(uitesto.Shape,uitesto.Circle);
extend(uitesto.Circle,uitesto.ColorCircle);
extend(uitesto.ColorCircle,uitesto.ColorCircleScale);

uitesto.testoldhierarchy = function() {
	
	logger("--- test simple function methods ---\n");
	// Create and initialize the "static" variable.
	// Function declarations are processed before code is executed, so
	// we really can do this assignment before the function declaration.
	uniqueInteger.counter = 0;

	// Here's the function. It returns a different value each time
	// it is called and uses a "static" property of itself to keep track
	// of the last value it returned.
	function uniqueInteger() {
	// Increment and return our "static" variable
		return uniqueInteger.counter++;
	}
	logger("unique = " + uniqueInteger());
	logger("unique = " + uniqueInteger());
	logger("unique = " + uniqueInteger());

	logger("---- test old hierarchy ----\n");
	var foo = new uitestoo.Foo();
	var isobj = (foo instanceof Object);          // true
	var isfoo = (foo instanceof uitestoo.Foo);             // true
	var isconfoo = (foo.constructor == uitestoo.Foo);         // true
	var isconfooname = foo.constructor.name; // "Foo"
	
	var ashape = new uitestoo.Shape(3,4);
	logger("ahape draw = " + ashape.draw());
	
	var acircle = new uitestoo.Circle(5,6,19);
	logger("acircle draw = " + acircle.draw());
	
	//var acolorcircle = new uitestoo.ColorCircle(7,8,11,[.25,.5,.75,1.5]);
	//logger("acolorcircle draw = " + acolorcircle.draw());
	
	logger("is ashape a Shape? " + (ashape instanceof uitestoo.Shape) + "\n");
	logger("is ashape a Foo? " + (ashape instanceof uitestoo.Foo) + "\n");
	logger("is foo a Shape? " + (foo instanceof uitestoo.Shape) + "\n");
	logger("is foo a Foo? " + (foo instanceof uitestoo.Foo) + "\n");
	
	logger("is ashape a Shape? " + (ashape instanceof uitestoo.Shape) + "\n");
	logger("is ashape a Circle? " + (ashape instanceof uitestoo.Circle) + "\n");
	logger("is acircle a Shape? " + (acircle instanceof uitestoo.Shape) + "\n");
	logger("is acircle a Circle? " + (acircle instanceof uitestoo.Circle) + "\n");
};

uitesto.testnewhierarchy = function() {
	logger("---- test new hierarchy ---- \n");
	// build some shapes
	var ashape = new uitesto.Shape(3,4);
	logger(ashape.draw() + "\n");
	logger(ashape.showpos() + "\n");
	//logger(ashape.showradius() + "\n");
	var acircle = new uitesto.Circle(5,6,7);
	logger(acircle.draw() + "\n");
	logger(acircle.showpos() + "\n");
	logger(acircle.showradius() + "\n");
	var acolorcircle = new uitesto.ColorCircle(8,9,10,[.2,.3,.5,.7]);
	logger(acolorcircle.draw() + "\n");
	logger(acolorcircle.showpos() + "\n");
	logger(acolorcircle.showradius() + "\n");
	var acolorcirclescale = new uitesto.ColorCircleScale(11,12,13,[.11,.13,.17,.19],.2718);
	logger(acolorcirclescale.draw() + "\n");
	logger(acolorcirclescale.showpos() + "\n");
	logger(acolorcirclescale.showradius() + "\n");
	console.log(ashape instanceof uitesto.Shape); // true
	console.log(ashape instanceof uitesto.Circle); // false
	console.log(ashape instanceof uitesto.ColorCircle); // false
	console.log(ashape instanceof uitesto.ColorCircleScale); // false
	console.log(acircle instanceof uitesto.Shape); // true
	console.log(acircle instanceof uitesto.Circle); // true
	console.log(acircle instanceof uitesto.ColorCircle); // false
	console.log(acircle instanceof uitesto.ColorCircleScale); // false
	console.log(acolorcircle instanceof uitesto.Shape); // true
	console.log(acolorcircle instanceof uitesto.Circle); // true
	console.log(acolorcircle instanceof uitesto.ColorCircle); // true
	console.log(acolorcircle instanceof uitesto.ColorCircleScale); // false
	console.log(acolorcirclescale instanceof uitesto.Shape); // true
	console.log(acolorcirclescale instanceof uitesto.Circle); // true
	console.log(acolorcirclescale instanceof uitesto.ColorCircle); // true
	console.log(acolorcirclescale instanceof uitesto.ColorCircleScale); // true
	console.log(ashape.constructor);
	console.log(acircle.constructor);
	console.log(acolorcircle.constructor);
	console.log(acolorcirclescale.constructor);
};

uitesto.UIObj = function(x,y,w,h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	// tree object super simple
	this.tree = buildplanexy01("aplanexyUI1o",1,1,"panel.jpg","tex"); // -1,-1 to 1,1
	//this.tree.scale = [.05,.05,.05]; // -.5,-.5 to .5,.5
	//this.tree.trans = [-.5,.5,0]; // -.5,.5 to .5,1.5
	this.tree.mod.flags |= modelflagenums.NOZBUFFER;
	// link
	uitesto.roottree.linkchild(this.tree);
	uitesto.UIObj.uiobjs.push(this);
	//logger("screen size = " + uitesto.UIObj.xres + " " + uitesto.UIObj.yres + "\n");
};

uitesto.UIObj.prototype.proc = function() {
	//logger("UIObj proc\n");
	var xres = uitesto.UIObj.xres;
	var yres = uitesto.UIObj.yres;
	var ih = 2/yres;
	var asp = xres/yres;
	this.tree.trans = [-asp + ih*this.x,1 - ih*this.y,0];
	this.tree.scale = [ih*this.w,ih*this.h,1];
};

uitesto.UIObj.prototype.remove = function() {
	logger("remove UIObj\n");
	var srch = uitesto.UIObj.uiobjs.indexOf(this); // find object in list
	if (srch !== -1) {
		uitesto.UIObj.uiobjs.splice(srch, 1); // remove from list
		if (this.tree) {
			this.tree.unlinkchild(); // free resources
			this.tree.glfree();
		}
	}
};

uitesto.UIObj.reset = function() {
	uitesto.UIObj.uiobjs = []; // array of UI objects
};

uitesto.UIObj.procAll = function() {
	uitesto.UIObj.setScreenSize(glc.clientWidth,glc.clientHeight); // update incase changed screen resolution
	for (var i=0;i<uitesto.UIObj.uiobjs.length;++i) {
		var uiobj = uitesto.UIObj.uiobjs[i];
		uiobj.proc();
	}
};

uitesto.UIObj.setScreenSize = function(wid,hit) {
	uitesto.UIObj.xres = wid;
	uitesto.UIObj.yres = hit;
};

// load these before init
uitesto.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
};

uitesto.init = function() {
	logger("entering webgl uitesto\n");
	
	// practice class hierarchy
	uitesto.testoldhierarchy();
	uitesto.testnewhierarchy();

	// root
	uitesto.UIObj.reset();
	uitesto.roottree = new Tree2("root");
	uitesto.roottree.trans = [0,0,1];
	//uitesto.roottree.flags |= treeflagenums.DONTDRAW;

	// object 'D' super simple, use for UI test
	uitesto.dtree = buildplanexy01("aplanexyD",.5,.75,"Bark.png","tex"); // simplest plane 0,0 to 1,-1
	//uitesto.dtree.scale = [2,2,1]; // 0,0 to 2,2
	uitesto.dtree.trans = [-1,.9,0]; // -1,1 to 1,3 ????
	//uitesto.ctree.rotvel = [0,0,1];
	uitesto.dtree.mod.flags |= modelflagenums.NOZBUFFER;
	
	// link
	uitesto.roottree.linkchild(uitesto.dtree);

	// try uitesto special objects for UI, creates a tree and adds to uiobjs
	new uitesto.UIObj(0,0,200,200);
	new uitesto.UIObj(0,glc.clientHeight - 200,200,200);
	var uiobj2 = new uitesto.UIObj(glc.clientWidth - 400,0,400,200);
	new uitesto.UIObj(glc.clientWidth - 400,glc.clientHeight - 200,400,200);
	uiobj2.remove();
	
/*
	// object 'C' super simple, use for UI test
	uitesto.ctree = buildplanexy("aplanexyC",1,1,"maptestnck.png","tex"); // -1,-1 to 1,1
	uitesto.ctree.scale = [.5,.5,.5];
	uitesto.ctree.trans = [.25,0,0];
	//uitesto.ctree.rotvel = [0,0,1];
	uitesto.ctree.mod.flags |= modelflagenums.NOZBUFFER;
	// link
	uitesto.roottree.linkchild(uitesto.ctree);
*/
	// object 'A' move offset object, control with mouse
	// child
	uitesto.atreesub =  buildplanexy("aplane", 1, 1, "maptestnck.png", "texc"); 
	uitesto.atreesub.scale = [.2,.5,.5];
	uitesto.atreesub.trans = [0,.5,0];
	uitesto.atreesub.mod.flags |= modelflagenums.NOZBUFFER;
	uitesto.atreesub.mat.color = [1,.5,1,1];
	// parent
	uitesto.atree = new Tree2("Object A");
	uitesto.atree.qrot = [0,0,.7071,-.7071];
	uitesto.atree.scale = [1,1,1]; 
	// link
	uitesto.atree.linkchild(uitesto.atreesub);
	uitesto.roottree.linkchild(uitesto.atree);
	
	// default camera
};

uitesto.proc = function() {
	// ui
	if (input.key == 'r'.charCodeAt(0)) // reset state if 'r' pressed
		changestate(uitesto);
	// proc
	// manipulate btree scale and rot with mouse/touch
	if (uitesto.atree && input.mbut[0]) {
        uitesto.dir[0] = input.fmx;
        uitesto.dir[1] = input.fmy;
        uitesto.dir[2] = 0;
        var len = vec3.length(uitesto.dir);
		uitesto.atree.qrot = dir2quat(uitesto.dir);
        uitesto.atree.scale[1] = len;
	}
	if (input.mbut[0]) {
		/*
		// test trans
		uitesto.UIObj.uiobjs[0].x = input.mx;
		uitesto.UIObj.uiobjs[0].y = input.my;
		*/
		// test scale
		uitesto.UIObj.uiobjs[0].w = input.mx + 1;
		uitesto.UIObj.uiobjs[0].h = input.my + 1;
	}
	uitesto.UIObj.procAll();
	uitesto.roottree.proc();
	doflycam(mainvp); // modify the trs of vp using flycam
	// draw
	beginscene(mainvp);
	uitesto.roottree.draw();
};

uitesto.exit = function() {
	logger("exiting webgl uitesto\n");
	uitesto.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	uitesto.roottree.glfree();
	uitesto.UIObj.reset();
	// show usage after cleanup
	logrc();
	uitesto.roottree = null;
};
