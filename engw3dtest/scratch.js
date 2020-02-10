var scratch = {};

// test webgl
scratch.roottree;
scratch.atree;
scratch.btree;
scratch.ctree;
scratch.dir = [];
scratch.datatexd; // data texture
scratch.jobtest = true;

scratch.text = "WebGL: This state is where the developer trys new things.  Like JSONP";

scratch.title = "Scratch";
scratch.frame;

scratch.debvars = {
	pitch:0,
	yaw:0,
	roll:0,
	transx:0,
	transy:0,
	transz:0,
	scalex:0,
	scaley:0,
	scalez:0
};

scratch.infocnt;

scratch.upfunctext = function(e) {
	//if (e.lastKey == 13) // '\n'
	//	scratch.getnodetree();
};

scratch.getajax = function() {
	var nodeurlstr = scratch.inputtext.value;
	//goAjaxText("../engw3dtest/shaders/basic.ps",resptree);
	goAjaxText(scratch.inputtext.value,scratch.resptree);
};

// hack to bypass CORS
scratch.getjsonp = function() {
	//Construct the 'script' tag at Runtime
	var nodeurlstr = scratch.inputtext.value;
	var head = document.head;
	var script = document.createElement("script");
	script.setAttribute("src", nodeurlstr + "?callback=scratch.jsonpcallback"); // this will load and run a script, and call custom callback function
	head.appendChild(script); // go!
	head.removeChild(script); // done with script
};

/* //Predefined callback function    
function jsonpCallback(data) {
alert(data.message); // Response data from the server
}
}; */

scratch.jsonpcallback = function(data) {
	try {
		//alert("in JSONP callback!, with data = '" + data + "'");
		var po = JSON.parse(data);
		var pos = JSON.stringify(po);
		logger("in JSONP callback!, with data = '" + pos + "'");
	} catch(e) {
		logger("parse error" + e + "'" + data + "'");
	}
};

scratch.resptree = function(txt,txtname) {
	logger("resp = (URL:" + txtname + "\n<<<< " + txt + " >>>>)\n");
};

// print some realtime info
scratch.updateinfo = function() {
	//var tx = input.mx / glc.clientWidth;
	//var ty = input.my / glc.clientHeight;
	var tx = (input.mx - (glc.clientWidth - glc.clientHeight)/2)/ glc.clientHeight;
	var ty = input.my / glc.clientHeight;
	printareadraw(scratch.infoarea,"scratch Info = "  + scratch.infocnt++ + " tex (" + tx.toFixed(3) + "," + ty.toFixed(3) + ")");
	//printareadraw(scratch.infoarea,"scratch Info = "  + scratch.infocnt++ + " mouse (" + input.mx + "," + input.my + ")");
};

// load these before init
scratch.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
	preloadimg("../common/sptpics/take0016.jpg");
	preloadimg("skybox/cube02");
	// test bwo
	//preloadbwo("../../tracks2/barn.bwo");
	//preloadbwo("prehistoric/Trex_head.bwo");
	//preloadbwo("prehistoric/chk18.bwo");
	preloadbwo("prehistoric/water.bwo");
};

scratch.runTestStuff = function() {
	
	// closure tests
	
	var add = function(a,b) {
		return a+b;
	};
	
	var add3 = function(a) {
		return add(a,3);
	};
	var add5 = function(a) {
		return add(a,5);
	};
	logger("add3 of 6 = " + add3(6));
	
	/*
	int rand7() {
    while (1) {
        int num = 5*(rand5()-1) + rand5();
        if (num < 22) return ((num % 7) + 1);
    }
}*/
	
	// it's transposed
	var ma = [	1.0,0.0,0.0,3.0,
				0.0,0.0,0.0,0.0,
				0.0,0.0,0.0,0.0,
				2.0,0.0,0.0,4.0];
	var mb = [	5.0,0.0,0.0,7.0,
				0.0,0.0,0.0,0.0,
				0.0,0.0,0.0,0.0,
				6.0,0.0,0.0,8.0];
	var mout = [];
	mat4.mul(mout,ma,mb); 
	logger("test mat mult done\n");
	var i;
	for (i=0;i<16;++i) {
		logger("matout " + i + " = " + mout[i] + "\n");
	}
	var testquatinterp = true;
	if (testquatinterp) {
		var qa = [0,0,0,1];
		var qb = [0,0,.7071,.7071];
		var qo =[];
		var t = .5;
		quat.slerp2(qo,qa,qb,t);
		logger("quat interp = " + 
		qo[0].toFixed(4) + " " +
		qo[1].toFixed(4) + " " + 
		qo[2].toFixed(4) + " " + 
		qo[3].toFixed(4) + "\n");
	}
	var testdet = true;
	if (testdet) {
		var m = [2,3,5,0,
				 7,11,13,0,
				 17,19,23,0,
				 0,0,0,1];
		var f = mat4.det(m);
		logger("det = " + f + "\n");
	}
	var testcross = true;
	if (testcross) {
		var a = [2,3,5];
		var b = [7,11,13];
		var c = [];
		vec3.cross(c,a,b);
		logger("crs = " + c + "\n");
		var f = vec3.dot(a,b);
		logger("dot = " + f + "\n");
	}
};

scratch.drawCurve = function(ctx, startx, starty, endx, endy) {
	var cp = bezier.getControlPoints(startx,starty,endx,endy);
	var xcoef = bezier.calcABCD(startx,endx,cp.cp1x,cp.cp2x);
	var ycoef = bezier.calcABCD(starty,endy,cp.cp1y,cp.cp2y);
	
	ctx.strokeStyle = 'yellow';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(startx, starty);
	ctx.bezierCurveTo(cp.cp1x, cp.cp1y, cp.cp2x, cp.cp2y, endx, endy);
	ctx.stroke();
	
	ctx.fillStyle = 'red';
	var t;
	for (t=0;t<=1;t+=.125) {
		var x = bezier.cubic(xcoef,t);
		var y = bezier.cubic(ycoef,t);
		
		ctx.beginPath();
		ctx.arc(x, y, 4, 0, 2* Math.PI);  // Control point one
		ctx.closePath();
		ctx.fill();		
	}
};

scratch.drawPartialCurve = function(ctx, startx, starty, endx, endy, part) {
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
	
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(xp[0], yp[0]);
	ctx.bezierCurveTo(xp[2], yp[2], xp[3], yp[3], xp[1], yp[1]);
	ctx.stroke();
};

scratch.getCssColorFromComplex = function(val) {
	var mg = compf.abs(val);
	var ang = Math.atan2(val[1],val[0]);
	ang *= 180/Math.PI;
	brt = 55*mg;
	return "hsl(" + ang + ",100%," + brt + "%)";
//	return "rgb(" + r + "," + g + "," + b + ")";
};
/*
scratch.getCssColorFromComplex = function(val) {
	var p = compf.abs(val);
	var r = 255*p;
	var g = 0;
	var b = 0;
	ang = 180;
	sat = 75;
	brt = 50;
//	return "hsl(" + ang + "," + sat + "%," + brt + "%)";
	return "rgb(" + r + "," + g + "," + b + ")";
};
*/

scratch.updateBitmap = function() {
	// test updating data texture using Bitmap32 class
/*
	var rx = Math.floor(Math.random()*scratch.bm32.size.x);
	var ry = Math.floor(Math.random()*scratch.bm32.size.y);
	scratch.bm32.clipPutPixel(rx,ry,C32YELLOW);
	*/
	var sz = scratch.bm32.size;
	var w = sz.x;
	var h = sz.y;
	var d = scratch.bm32.data;
	var i,j;//area = scratch.bm32.size.x * scratch.bm32.size.y;
	var p = 0;
	var twoTo24 = 1<<24;
	for (j=0;j<h;++j) {
		for (i=0;i<w;++i) {
			var v = Math.floor(Math.random()*twoTo24);
			v += (255<<24); // alpha opaque
			d[p++] = v;
		}
	}
	scratch.datatexd.updateData(scratch.bm32);
};

scratch.calcscale = function(bm) {
	var scl = vec3.create();
	var tx = bm.size.x;
	var ty = bm.size.y;
	//var mf = 1;
	var mf = Math.floor(glc.clientHeight/ty);
	logger("calc scale: mf = " + mf + "\n");
	scl[1] = 2*ty/glc.clientHeight*mf;
	scl[0] = scl[1] * tx / ty;
	scl[2] = 1;
	return scl;
};

scratch.printLinkedList = function(ll) {
	var str = "[";
	var sep = "";
	var sep2 = ", ";
	while(ll) {
		str += sep + ll.val;
		ll = ll.next;
		sep = sep2;
	}
	str += "]\n";
	logger(str);
};

scratch.reverseLinkedList = function(ll) {
	if (!ll || !ll.next)
		return ll;
	var first = ll;
	var rest = ll.next;
	var rev = scratch.reverseLinkedList(rest);
	first.next = null;
	rest.next = first;
	return rev;
};

scratch.testLinkList = function() {
	logger("test link list\n");
	var ex1a = {}; ex1a.val = 3;

	var ex2a = {}; ex2a.val = 5;
	var ex2b = {}; ex2b.val = 7;
	ex2a.next = ex2b;

	var ex3a = {}; ex3a.val = 11;
	var ex3b = {}; ex3b.val = 13;
	var ex3c = {}; ex3c.val = 17;
	ex3a.next = ex3b;
	ex3b.next = ex3c;

	var ex4a = {}; ex4a.val = 19;
	var ex4b = {}; ex4b.val = 23;
	var ex4c = {}; ex4c.val = 29;
	var ex4d = {}; ex4d.val = 31;
	ex4a.next = ex4b;
	ex4b.next = ex4c;
	ex4c.next = ex4d;

	scratch.printLinkedList(null);
	scratch.printLinkedList(ex1a);
	scratch.printLinkedList(ex2a);
	scratch.printLinkedList(ex3a);
	scratch.printLinkedList(ex4a);

	logger("now reverse\n");
	var rex0a = scratch.reverseLinkedList(null);
	var rex1a = scratch.reverseLinkedList(ex1a);
	var rex2a = scratch.reverseLinkedList(ex2a);
	var rex3a = scratch.reverseLinkedList(ex3a);
	var rex4a = scratch.reverseLinkedList(ex4a);
	scratch.printLinkedList(rex0a);
	scratch.printLinkedList(rex1a);
	scratch.printLinkedList(rex2a);
	scratch.printLinkedList(rex3a);
	scratch.printLinkedList(rex4a);
};

scratch.CyclicGraph = function(val) {
	this.val = val;
	this.nodes = [];
};

scratch.CyclicGraph.prototype.push = function(cg) {
	this.nodes.push(cg);
};

scratch.CyclicGraph.prototype.printCyclicGraphRec = function(visited) {
	var ret = visited.has(this);
	if (!ret) {
		visited.add(this);
		logger("\tval = " + this.val + "\n");
		//for (var vi of this.nodes) {
		for (var i=0;i<this.nodes.length;++i) {
			var vi = this.nodes[i];
			logger("\t\tchild val = " + vi.val + "\n");
		}
		//for (var vi of this.nodes) {
		for (var i=0;i<this.nodes.length;++i) {
			vi = this.nodes[i];
			vi.printCyclicGraphRec(visited);
		}
	}
};

scratch.printCyclicGraph = function(cg) {
	logger("START print cyclic graph\n");
	if (!cg) {
		logger("\tnull\n");
		logger("END print cyclic graph\n\n");
		return;
	}
	var visited = new Set();
	cg.printCyclicGraphRec(visited);
	logger("END print cyclic graph\n\n");
};

scratch.copyCyclicGraphRec1 = function(cg,oldNewMap) {
	if (oldNewMap.has(cg))
		return;
	var ncg = new scratch.CyclicGraph(cg.val * 11);
	oldNewMap.set(cg,ncg);
	//for (vi of cg.nodes) {
	for (var i=0;i<cg.nodes.length;++i) {
		var vi = cg.nodes[i];
		scratch.copyCyclicGraphRec1(vi,oldNewMap);
	}
};

scratch.copyCyclicGraphPass2 = function(oldNewMap) {
	oldNewMap.forEach(function(s,f,map) {
		for (var i=0;i<f.nodes.length;++i) {
			var j = f.nodes[i];
			var nj = oldNewMap.get(j);
			s.nodes.push(nj);
		}
	});
};

scratch.copyCyclicGraph = function(cg) {

	if (!cg)
		return null;
	var oldNewMap = new Map();
	scratch.copyCyclicGraphRec1(cg,oldNewMap);
	scratch.copyCyclicGraphPass2(oldNewMap);
	var ret = oldNewMap.get(cg);
	return ret;
};

scratch.testCopyCyclicGraph = function() {
	logger("testCopyCyclicGraph\n");
	// build A graph
	/*
	== visual representation ==
		1 -> 2 -> 3 ->
		^    ^    ^   \
		\----\----\-- - 4

		== connections ==
		1 -> 2
		2 -> 3
		3 -> 4
		4 -> 1, 2, 3 
	*/
	var a_1 = new scratch.CyclicGraph(1);
	var a_2 = new scratch.CyclicGraph(2);
	var a_3 = new scratch.CyclicGraph(3);
	var a_4 = new scratch.CyclicGraph(4);
	a_1.push(a_2);
	a_2.push(a_3);
	a_3.push(a_4);
	a_4.push(a_1);
	a_4.push(a_2);
	a_4.push(a_3);

	// build B graph
	var b_1 = new scratch.CyclicGraph(1);
	var b_2 = new scratch.CyclicGraph(2);
	var b_3 = new scratch.CyclicGraph(3);
	var b_4 = new scratch.CyclicGraph(4);
	var b_5 = new scratch.CyclicGraph(5);
	var b_6 = new scratch.CyclicGraph(6);
	var b_7 = new scratch.CyclicGraph(7);
	var b_8 = new scratch.CyclicGraph(8);
	b_1.push(b_2);
	b_2.push(b_6);
	b_2.push(b_3);
	b_3.push(b_2);
	b_3.push(b_4);
	b_4.push(b_3);
	b_5.push(b_6);
	b_6.push(b_8);
	b_6.push(b_7);
	b_7.push(b_8);
	b_8.push(b_5);
	b_8.push(b_7);

	var c_1 = new scratch.CyclicGraph(1);
	var c_2 = new scratch.CyclicGraph(2);
	c_1.push(c_2);
	c_2.push(c_1);

	var d_1 = new scratch.CyclicGraph(1);
	var d_2 = new scratch.CyclicGraph(2);
	d_1.push(d_2);

	var e_1 = new scratch.CyclicGraph(1);

	logger("print cyclic graphs\n");

	scratch.printCyclicGraph(null);
	scratch.printCyclicGraph(a_1);

	scratch.printCyclicGraph(b_1);
	scratch.printCyclicGraph(c_1);
	scratch.printCyclicGraph(d_1);
	scratch.printCyclicGraph(e_1);

	logger("print cyclic graphs copies\n");
	var copy_nul = scratch.copyCyclicGraph(null);
	var copya_1 = scratch.copyCyclicGraph(a_1);
	var copyb_1 = scratch.copyCyclicGraph(b_1);
	var copyc_1 = scratch.copyCyclicGraph(c_1);
	var copyd_1 = scratch.copyCyclicGraph(d_1);
	var copye_1 = scratch.copyCyclicGraph(e_1);
	scratch.printCyclicGraph(copy_nul);
	scratch.printCyclicGraph(copya_1);
	scratch.printCyclicGraph(copyb_1);
	scratch.printCyclicGraph(copyc_1);
	scratch.printCyclicGraph(copyd_1);
	scratch.printCyclicGraph(copye_1);
};
	
scratch.testArrayBuffers = false;
scratch.testStuff = false;

scratch.init = function() {
	
	if (scratch.jobtest) {
		logger("jobtest\n");
		scratch.testLinkList();
		scratch.testCopyCyclicGraph();
	}
	
	if (scratch.testArrayBuffers) {

		// test ArrayBuffers
		var sData = new Uint8ClampedArray([7,11,13,17,1,2,0,0]); // mem1 U8C
		var outputABuffer = new ArrayBuffer(sData.length); // mem2 generic
		var input8Array = new Uint8Array(outputABuffer); // mem2 U8
		input8Array.set(sData); // copy mem1U8C to mem2U8
		var output32Array= new Uint32Array(outputABuffer); // mem2 U32
		output32Array[0] = 300;
		logger("o32[0] = " + output32Array[0] + "\n");
		logger("o32[1] = " + output32Array[1] + "\n");
		var i;
		for (i=0;i<8;++i)
			logger("i8[" + i + "] = " + input8Array[i] + "\n");
		
		var tData = new Uint32Array([2,3,5,7,11,13,17,19,23,29]);
		var uData = new Uint32Array([20,30,50,70,110,130]);
		var vData = new Uint32Array(uData.buffer,4*3,2);
		tData.set(vData,3);
	}	
	
	
	
	
	logger("done!\n");
	// end test ArrayBuffers
	
	logger("entering webgl scratch\n");
	if (scratch.testStuff) {
		scratch.runTestStuff();
	}
	
	// ui
	setbutsname('scratch');
	//scratch.inputtext = makeatext('URL','http://23.123.140.155:88/engw/engw3dtest/shaders/basic.ps',scratch.upfunctext);
	//scratch.inputtext = makeatext('URL','http://127.0.0.1:88/engw/engw3dtest/textdata/text1.txt',scratch.upfunctext);
	scratch.inputtext = makeatext('URL','textdata/json1.txt',scratch.upfunctext);
	//scratch.inputtext = makeatext('URL','http://127.0.0.1:88/engw/engw3dtest/shaders/basic.ps',scratch.upfunctext);
	//scratch.inputtext = makeatext('URL','shaders/basic.ps',scratch.upfunctext);

	makeabut("AJAX Get",scratch.getajax);
	makeabut("JSONP Get",scratch.getjsonp);

	scratch.roottree = new Tree2("root");
	


	// start build a datatexture procedurally
	scratch.test1 = true;
	if (scratch.test1) {
		var texX = 128;
		var texY = 128;
		
		var invTexX = 1/texX; // step
		var invTexY = 1/texY;
		var im = 2*invTexX;
		var ib = invTexX - 1;
		var jm = 2*invTexY;
		var jb = invTexY - 1;
		
		//var numbits = 8; // R,G,B,A
		//var numbits = 32; // ABGR , little endian?
		//var numbits = 2; // draw procedure on <canvas>
		//var numbits = 1; // for test image on <canvas>
		var numbits = 3; // test complex number color
		//var numbits = 4; // test Bitmap32
		
		if (numbits == 8) { // 8 bit raw data
			var texdataarr8 = new Uint8Array(texX*texY*4); // R,G,B,A
			// procedure, build bitmap in 8 bit array
			var i,j,k4=0;
			for (j=0;j<texY;++j) {
				var jo = j&1;
				var jf = j*jm + jb;
				for (i=0;i<texX;++i,k4+=4) {
					var io = i&1;
					var ief = i*im + ib;
					if (io ^ jo) { // checkerboard ODD
						texdataarr8[k4  ] = 255; // RED
					}
					if (ief*ief + jf*jf < 1) { // inside circle
						texdataarr8[k4+1] = 255; // GREEN
					}
					texdataarr8[k4+2] = 96; // BLUE
					texdataarr8[k4+3] = 255; // ALPHA

				}
			}
			// end procedure
			scratch.datatexd = DataTexture.createtexture("datatex",texX,texY,texdataarr8);
			texdataarr8 = null;
			
		} else if (numbits == 32) { // 32 bit raw data
			var texdataarr32 = new Uint32Array(texX*texY); // ABGR
			// procedure, build bitmap in 32 bit array
			var i,j,k4=0;
			for (j=0;j<texY;++j) {
				var jo = j&1;
				var jf = j*jm + jb;
				for (i=0;i<texX;++i,++k4) {
					var io = i&1;
					var ief = i*im + ib;
					// plus some BLUE 96 or 0x60
					if (io ^ jo) { // checkerboard ODD
						if (ief*ief + jf*jf < 1) { // inside circle
							texdataarr32[k4] = 0xff60ffff; // GREEN + RED
						} else { // outside circle
							texdataarr32[k4] = 0xff6000ff; // BLACK + RED
						}
					} else { // checkerboard EVEN
						if (ief*ief + jf*jf < 1) { // inside circle
							texdataarr32[k4] = 0xff60ff00; // GREEN
						} else { // outside circle
							texdataarr32[k4] = 0xff600000; // BLACK
						}
					}
				}
			}
			// end procedure
			// converts 32bit to 8bit if necessary
			scratch.datatexd = DataTexture.createtexture("datatex",texX,texY,texdataarr32);
		} else if (numbits == 3) { // test complex number color procedural from <canvas>
			// make a <canvas>
			var c = document.createElement('canvas');
			c.width = texX;
			c.height = texY;
			// make a 2d context
			var ctx = c.getContext('2d');
			// draw on 2d context
			var i,j;
			for (j=0;j<texY;++j) {
				var jf = j*jm + jb;
				for (i=0;i<texX;++i) {
					var ief = i*im + ib;
					if (ief*ief + jf*jf < 1) { // inside circle
						var val = compf.create(ief,-jf); // flip y, put positive on top
						ctx.fillStyle = scratch.getCssColorFromComplex(val);
					} else { // outside circle
						;//ctx.fillStyle = 'black';
						ctx.fillStyle = 'rgba(0,0,0,0)';//return "hsl(" + ang + ",100%," + brt + "%)";
					}
					ctx.fillRect(i, j, 1, 1);
				}
			}
			// end procedure
			// copy a <canvas> to a datatexture
			scratch.datatexd = DataTexture.createtexture("datatex",c);
		} else if (numbits == 2) { // procedural from <canvas>
			
			// make a <canvas>
			var c = document.createElement('canvas');
			c.width = texX;
			c.height = texY;
			
			// make a 2d context
			var ctx = c.getContext('2d');
			
			// draw on 2d context
			ctx.fillStyle = 'rgba(215, 0, 225,.125)'; // RGBA, super LameO, Let us see...
			//ctx.fillRect(10, 10, texX-20,texY-20);
			// procedure, build bitmap in 32 bit array
			var i,j;
			for (j=0;j<texY;++j) {
				var jo = j&1;
				var jf = j*jm + jb;
				for (i=0;i<texX;++i) {
					var io = i&1;
					var ief = i*im + ib;
					// plus some BLUE 96 or 0x60
					if (io ^ jo) { // checkerboard ODD
						if (ief*ief + jf*jf < 1) { // inside circle
							ctx.fillStyle = 'rgb(255, 255, 96)'; // RGB, super LameO, Let us see...
							ctx.fillRect(i, j, 1, 1);
							;//texdataarr32[k4] = 0xff60ffff; // GREEN + RED
						} else { // outside circle
							ctx.fillStyle = 'rgb(255,  0, 96)'; // RGB, super LameO, Let us see...
							ctx.fillRect(i, j, 1, 1);
							;//texdataarr32[k4] = 0xff6000ff; // BLACK + RED
						}
					} else { // checkerboard EVEN
						if (ief*ief + jf*jf < 1) { // inside circle
							ctx.fillStyle = 'rgb(0,  255, 96)'; // RGB, super LameO, Let us see...
							ctx.fillRect(i, j, 1, 1);
							;//texdataarr32[k4] = 0xff60ff00; // GREEN
						} else { // outside circle
							ctx.fillStyle = 'rgb(0, 0, 96)'; // RGB, super LameO, Let us see...
							ctx.fillRect(i, j, 1, 1);
							;//texdataarr32[k4] = 0xff600000; // BLACK
						}
					}
				}
			}
			// end procedure

			// copy a <canvas> to a datatexture
			scratch.datatexd = DataTexture.createtexture("datatex",c);
		} else if (numbits == 1) { // image from <canvas> and a lot more
			// get some images
			var im1 = preloadedimages["take0016.jpg"];
			var im2 = preloadedimages["panel.jpg"];
			var im3 = preloadedimages["Bark.png"];
			
			// make a <canvas>
			var c = document.createElement('canvas');
			var texX = 256;
			var texY = 256;
			c.width = texX;
			c.height = texY;
			
			// make a 2d context
			var ctx = c.getContext('2d');
			
			// draw some images on 2d context
			
			// background color
			ctx.fillStyle="rgb(230,230,230)";
			ctx.strokeStyle = '#ff00ff'; // pink
			ctx.lineWidth = 15;
			ctx.fillRect(0,0,texX,texY);
			ctx.strokeRect(0,0,texX,texY); 
			
			// 3 images
			ctx.drawImage(im2,         0,         0, texX/2,texY/2);
			ctx.drawImage(im1, texX/2,         0, texX/2,texY/2);
			ctx.drawImage(im3,         0,texY/2, texX/2,texY/2);
			
			

			// Cubic Bezier curve
			var i;
			bezier.setFactors(.7375,-.7);
			for (i=0;i<=8;++i) {
				let start = { x: 0,    y: 5*texY/16  };
				let end =   { x: texX,   y: i*texY/10+texY/16 };
				scratch.drawCurve(ctx, start.x, start.y, end.x, end.y);
				scratch.drawPartialCurve(ctx, start.x, start.y, end.x, end.y,.125*i);
			}

		
			// Define the points as {x, y}
			// draw circle
			ctx.fillStyle = 'red';
			ctx.strokeStyle = 'green';
			let pnt = { x: texX/4, y: 3*texY/4 };
			ctx.beginPath();
			ctx.moveTo(pnt.x, pnt.y);
			ctx.arc(pnt.x, pnt.y, 50, 0, .375 * 2* Math.PI);  // Control point one
			ctx.closePath();
			ctx.fill();		
			ctx.stroke();
			
			// draw centered text
			ctx.strokeStyle = 'white';
			ctx.fillStyle = 'black';
			ctx.textBaseline = "middle";
			ctx.textAlign = "center";
			ctx.font = 'bold 16px serif';
            ctx.lineWidth = 1;
			let str = 'W 3/8';
			ctx.fillText(str, pnt.x, pnt.y);
			//ctx.strokeText(str, pnt.x, pnt.y);
			
			// copy a <canvas> to a datatexture
			scratch.datatexd = DataTexture.createtexture("datatex",c);
		} else if (numbits == 4) {
			var texX = 320;
			var texY = 200;
			//var texdataarr32 = new Uint32Array(texX*texY); // ABGR
			scratch.bm32 = new Bitmap32(texX,texY);
			var texdataarr32 = scratch.bm32.data;
			// procedure, build bitmap in 32 bit array
			var invTexX = 1/texX; // step
			var invTexY = 1/texY;
			var im = 2*invTexX;
			var ib = invTexX - 1;
			var jm = 2*invTexY;
			var jb = invTexY - 1;
			var i,j,k4=0;
			for (j=0;j<texY;++j) {
				var jo = j&1;
				var jf = j*jm + jb;
				for (i=0;i<texX;++i,++k4) {
					var io = i&1;
					var ief = i*im + ib;
					// plus some BLUE 96 or 0x60
					if (io ^ jo) { // checkerboard ODD
						if (ief*ief + jf*jf < 1) { // inside circle
							texdataarr32[k4] = 0xff60ffff; // GREEN + RED
						} else { // outside circle
							texdataarr32[k4] = C32CYAN; //0xff6000ff; // BLACK + RED
						}
					} else { // checkerboard EVEN
						if (ief*ief + jf*jf < 1) { // inside circle
							texdataarr32[k4] = 0xff60ff00; // GREEN
						} else { // outside circle
							texdataarr32[k4] = 0xff600000; // BLACK
						}
					}
				}
			}
			// end procedure
			// converts 32bit to 8bit if necessary
			//scratch.datatexd = DataTexture.createtexture("datatex",texX,texY,texdataarr32);
			scratch.datatexd = DataTexture.createtexture("datatex",scratch.bm32);
			scratch.datatexd.hasalpha = true;			
		}
	// end build a datatexture procedurally
	
	
        var us = planepatchu;
        var vs = planepatchv;
        planepatchu = 2;
        planepatchv = 2;
        scratch.atree =  buildplanexy2t("aplane", 1, 1, "maptestnck.png", "Bark.png", "blend2bc");
        planepatchu = us;
        planepatchv = vs;
        //Texture.globaltexflags = Texture.FLAG_CLAMPUV;
        //scratch.atree.mod.flags |= Model.FLAG_DOUBLESIDED;
        scratch.atree.trans = [0,1,0];
        // rot
        //atree.rot = new float[3];// {0.0f,0.0f,0.0f}; // qrot overrides rot
        scratch.atree.scale = [.4,1,1];
        //atree.qrot = new float[4];
		scratch.atree.mod.flags |= modelflagenums.NOZBUFFER;

        //atree.transvel = new float[] {0f,0f,1f};
        //atree.rotvel = new float[] {0f,0f,NuMath.TWOPI/5f};
        //atree.scalevel = new float[] {.5f,.5f,.5f};

        //scratch.tree0.mod.flags |= modelflagenums.HASALPHA;
        scratch.atree.mat.color = [1,.5,1,1];

        // 1st generation 'b'
        scratch.btree = new Tree2("1st");
        //btree.trans = new float[] {0.0f,1.0f,0.0f};
        scratch.btree.qrot = [0,0,.7071,-.7071];
        //scratch.btree.rot =  [0,0,0];
        scratch.btree.scale = [1,1,1]; 

        //scratch.ptree = new Tree2("barn.bwo");
        //scratch.ptree = new Tree2("Trex_head.bwo");
        //scratch.ptree = new Tree2("chk18.bwo");
        scratch.ptree = new Tree2("water.bwo");
        scratch.ptree.trans = [0,0,0];
        scratch.roottree.linkchild(scratch.ptree);
		
        // draw the one with the data texture
		scratch.ptree = buildplanexy("aplanexy",1,1,"datatex","tex");
        scratch.ptree.trans = [0,0,0];
		if (scratch.bm32)
			scratch.ptree.scale = scratch.calcscale(scratch.bm32);
        scratch.roottree.linkchild(scratch.ptree);

// test multi material 'Model2' from scratch

		var multimesh = {
			"verts": [ // centered
			// front (POSZ) switched
				-1, 1,0,
				 1, 1,0,
				-1,-1,0,
				 1,-1,0,
				-1,-1,0,
				 1,-1,0,
				-1,-3,0,
				 1,-3,0,
			],
			"norms": [
			// front
				 0, 0,-1,
				 0, 0,-1,
				 0, 0,-1,
				 0, 0,-1,
				 0, 0,-1,
				 0, 0,-1,
				 0, 0,-1,
				 0, 0,-1,
			],
			"uvs": [
			// front
				0,0,
				1,0,
				0,1,
				1,1,
				.375,.375,
				.625,.375,
				.375,.625,
				.625,.625,
			],
			"faces": [	
			// front
				 0, 1, 2,
				 3, 2, 1,
				 4, 5, 6,
				 7, 6, 5,
			]
		};
		
		var multimodel = Model2.createmodel("multimaterial");
		globaltexflags = textureflagenums.CLAMPU | textureflagenums.CLAMPV;
		scratch.frame = 0;
		if (multimodel.refcount == 1) {
			multimodel.setmesh(multimesh);
			//multimodel.setshader("tex");
			//multimodel.settexture("Bark.png");
			multimodel.addmat2t("blend2b","take0016.jpg","panel.jpg",2,4);
			multimodel.mats[0].blend = .5;
			//multimodel.addmat("tex","Bark.png",2,4);
			multimodel.addmat("texc","maptestnck.png",2,4);
			multimodel.mats[1].color = [0,1,0,1];
			multimodel.commit();
		}
		globaltexflags = 0;

		scratch.ctree = new Tree2("multimaterial");
		scratch.ctree.setmodel(multimodel);

		//scratch.ctree = buildplanexy("multimaterial",1,1,"Bark.png","tex");

        scratch.ctree.trans = [-1.6,1,0];
        scratch.ctree.scale = [.5,.5,1];
        scratch.roottree.linkchild(scratch.ctree);

        // finally link it all together
        scratch.btree.linkchild(scratch.atree);
        scratch.roottree.linkchild(scratch.btree); // roottree -> btree -> atree
		
		// test bright shaders/basic
		scratch.dtree = buildplanexy("test bright",1,1,"Bark.png","bright");
		scratch.dtree.trans = [0,2,1];
		scratch.roottree.linkchild(scratch.dtree);
		
		var ctree2 = scratch.ctree.newdup();
		ctree2.trans = [-2.8,1,0];
		scratch.roottree.linkchild(ctree2);
	
	}
	scratch.test2 = false;
	if (scratch.test2) {
		// build parent prism/plane
		//scratch.atree = buildprism("aprism",[.5,.5,.5],"maptestnck.png","texc"); // helper, builds 1 prism returns a Tree2
		scratch.btree =  buildplanexy("aplane",20,20,"maptestnck.png","tex");
		scratch.btree.trans = [0,0,20];
		scratch.btree.scale = [1,1,1];
		scratch.debvars.transz = scratch.btree.trans[2];
		scratch.debvars.scalex = scratch.btree.scale[0];
		scratch.debvars.scaley = scratch.btree.scale[1];
		scratch.debvars.scalez = scratch.btree.scale[2];
		//scratch.tree0.mod.flags |= modelflagenums.HASALPHA;
		scratch.btree.mat.color=[1,.5,1,1];
		scratch.btree.rot = [0,0,0];
		scratch.roottree.linkchild(scratch.btree);	
		
		// build another 
		scratch.atree = buildplanexy("aplane2",1,1,"Bark.tga","tex");
		scratch.atree.trans = [-5,5,10];
		scratch.roottree.linkchild(scratch.atree);	
		
		// build another 
		scratch.atree = buildsphere("texsphere",1,"maptestnck.png","tex");
		scratch.atree.trans = [0,5,10];
		scratch.roottree.linkchild(scratch.atree);	
		
		// build another 
		scratch.atree = buildsphere("envmapshere",1,"CUB_cube02.jpg","envmapp");
		scratch.atree.trans = [5,5,10];
		scratch.atree.rotvel = [0,.1,0];
		scratch.roottree.linkchild(scratch.atree);	

		
		// build another 
		scratch.atree = buildprism("envmapprism",[1,1,1],"CUB_cube02.jpg","envmapp");
		scratch.atree.trans = [-5,0,10];
		scratch.atree.rotvel = [0,.1,0];
		scratch.roottree.linkchild(scratch.atree);	
		
		// build another 
		scratch.atree = buildplanexy("aplane3",1,1,"Bark.tga","tex");
		scratch.atree.trans = [0,0,10];
		scratch.roottree.linkchild(scratch.atree);	
		
		// build another 
		scratch.atree = buildplanexy("aplane3",1,1,"Bark.tga","tex");
		scratch.atree.trans = [5,0,10];
		scratch.roottree.linkchild(scratch.atree);	
	}

	// move view back some using LHC
	if (scratch.test1)
		mainvp.trans = [0,0,-2]; // for mouse test
		// mainvp.trans = [1.31321,3.39566,-3.53785]; // flycam for barn, near clipping
	else
		mainvp.trans = [0,0,0];
	mainvp.rot = [0,0,0]; // flycam

	// ui, realtime log update
	setbutsname('scratch');
	scratch.infoarea = makeaprintarea('scratch Info: ');
	scratch.infocnt = 0;
	scratch.updateinfo();
	
	// add a test debprint
	//debprint.addlist("scratch",["scratch.fvar"]);
	debprint.addlist("scratch_debug",["scratch.debvars"]);
};

scratch.proc = function() {
	// proc
	scratch.updateinfo();
	if (scratch.test1 && input.mbut[0]) {
        scratch.dir[0] = input.fmx;
        scratch.dir[1] = input.fmy;
        scratch.dir[2] = 0;
        var len = vec3.length(scratch.dir);
		scratch.btree.qrot = dir2quat(scratch.dir);
        scratch.btree.scale[1] = len;
		//scratch.ptree.trans[0] = input.fmx;
		//scratch.ptree.trans[1] = input.fmy;
		
		if (scratch.bm32)
			scratch.updateBitmap();
	}
	
	if (scratch.test2) {
		scratch.btree.rot[0] = scratch.debvars.pitch;
		scratch.btree.rot[1] = scratch.debvars.yaw;
		scratch.btree.rot[2] = scratch.debvars.roll;
		scratch.btree.trans[0] = scratch.debvars.transx;
		scratch.btree.trans[1] = scratch.debvars.transy;
		scratch.btree.trans[2] = scratch.debvars.transz;
		scratch.btree.scale[0] = scratch.debvars.scalex;
		scratch.btree.scale[1] = scratch.debvars.scaley;
		scratch.btree.scale[2] = scratch.debvars.scalez;
		scratch.roottree.proc();
	}
	doflycam(mainvp); // modify the trs of vp using flycam
	var blend = .5 + .5*Math.cos(scratch.frame);
	scratch.ctree.mod.mats[0].blend = blend;
	scratch.atree.mod.mat.blend = blend;
	scratch.dtree.mod.mat.bright = 2*blend; // make super bright
	
	// draw
	beginscene(mainvp);
	scratch.roottree.draw();
	scratch.frame += 2*Math.PI/60/10;
	if (scratch.frame >= Math.PI*2)
		scratch.frame -= Math.PI*2;
};

scratch.onresize = function() {
	var bottomLines = 20; // for console
	logger("scratch resize to " + glc.clientWidth + "," + glc.clientHeight + "\n");
	if (scratch.bm32)
		scratch.ptree.scale = scratch.calcscale(scratch.bm32);
};

scratch.exit = function() {
	if (scratch.datatexd) {
		scratch.datatexd.glfree();
		scratch.datatexd = null;
	}
	scratch.bm32 = null;
	debprint.removelist("scratch_debug");
	// show current usage
	//debprint.removelist("scratch");
	scratch.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	scratch.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	scratch.roottree = null;
	logger("exiting webgl scratch\n");
	clearbuts('scratch');
};
