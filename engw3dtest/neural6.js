// run a neural network nmodel
var neural6 = {}; // the 'neural6' state

neural6.text = "WebGL: Recognize hand written digits\n"
			+ "Left mouse button: draw   Right mouse button: erase " +
			"Middle mouse button: clear\nleft key prev test, right key next test";
neural6.title = "Neural6";

neural6.topo = null; // structure of network
neural6.layers = null; // data for network
neural6.testDataRaw = null; // test data array of array of U8
neural6.curData = null; // array of U8
neural6.xSize; // size of 2D image
neural6.ySize;

neural6.font0;
neural6.font1;
neural6.font2;

neural6.bm;
neural6.input;
neural6.output;

neural6.mx = 0;
neural6.my = 0;
neural6.lastmx = 0;
neural6.lastmy = 0;

neural6.fontSize = .1;
neural6.dataYoffset = .8; // results

neural6.extraSlopeAmount = .01;

// helper
neural6.getUserInputsFromBM = function(bm, inp) {
		var prod = bm.size.x * bm.size.y;
		var bmData = bm.data;
		const LO = .1;
		const HI = .9;
		for (var i = 0; i < prod; ++i) {
			// read just the red channel
			inp[i] = LO + (HI - LO) * (bmData[i] & 0xff) / 255.0;
		}
		// normalize data 0 mean, 1 standard deviation
		var mean;
		var stdDev;
		var stat = {mean: mean, stdDev : stdDev};
		neural6.normalize(inp, stat);
		//logger("normalizing user input 1st pass, mean = " + stat.mean + ", stdDev = " + stat.stdDev + "\n");
		//neural6.normalize(inp, stat);
		//logger("normalizing user input 2nd pass, mean = " + stat.mean + ", stdDev = " + stat.stdDev + "\n");
};

neural6.normalize = function(data, stat) {
	const EPSILON = 1.0e-20;
	var mean = 0.0;
	var N = data.length;
	// 1st pass calc the mean
	for (var i = 0; i < N; ++i) {
		mean += data[i];
	}
	mean /= N;
	var variance = 0.0;
	// 2nd pass calc the variance and stdDev
	for (var i = 0; i < N; ++i) {
		var diff = data[i] - mean;
		variance += diff * diff;
	}
	if (variance < EPSILON) {
		//logger("no variance!\n");
		stdDev = 0.0;
		return; // no variance, don't divide by zero
	}
	variance /= N;
	var stdDev = Math.sqrt(variance);
	// 3rd pass normalize the data so it has mean == 0, stdDev == 1
	for (var i = 0; i < N; ++i) {
		data[i] = (data[i] - mean) / stdDev;
	}
	stat.mean = mean;
	stat.stdDev = stdDev;
};

neural6.makeBMfromImage = function(img, wid, hit) {
	var ret = new Bitmap32(wid, hit, C32LIGHTMAGENTA);
	var i, j;
	var data = ret.data;
	var prod = wid * hit;
	for (j = 0; j < prod; ++j) {
		var rawVal = img[j];
		var c32Val = C32([rawVal, rawVal, rawVal]);
		data[j] = c32Val;
	}
	return ret;
};

neural6.loadNetwork = function() {
	abModel = preloadedbin["Neural6_4.mdl"]; // little-endian
	var fhmd = fopen(abModel);
	var nLayers = freadU32(fhmd);
	neural6.topo = [];
	neural6.layers = [];
	for (var k = 0; k < nLayers; ++k) {
		var layerSize = freadU32(fhmd);
		neural6.topo.push(layerSize);
	}
	neural6.layers.push(null);
	for (var k = 1; k < nLayers; ++k) {
		var pK = k - 1;
		var kSize = neural6.topo[k];
		var kPrevSize = neural6.topo[pK];
		var alayer = {};
		alayer.W = [];
		if (k < nLayers - 1)
			alayer.A = new Array(kSize);
		alayer.Z = new Array(kSize);
		for (var j = 0; j < kSize; ++j) {
			var wr = freadF64DVv(fhmd, kPrevSize);
			alayer.W.push(wr);
		}
		alayer.B = freadF64DVv(fhmd, kSize);
		neural6.layers.push(alayer);
	}
};

neural6.loadTestData = function() {
	var abTestData = preloadedbin["t10k-images.idx3-ubyte.bin"]; // big-endian
		// file is big endian
	var fhtd = fopen(abTestData);
	var magic = freadU32(fhtd, false);
	neural6.testDataRaw = [];
	if (magic != 0x00000803) {
		logger("bad magic\n");
	} else {
		var nTest = freadU32(fhtd, false);
		neural6.ySize = freadU32(fhtd, false);
		neural6.xSize = freadU32(fhtd, false);
		var nEle = neural6.xSize * neural6.ySize;
		for (var i = 0; i < nTest; ++i) {
			var rawImage = freadU8v(fhtd, nEle);
			neural6.testDataRaw.push(rawImage);
		}
	}
};

neural6.updateTex = function() {
	// update texture
	neural6.dataTex.updateData(neural6.bm);
	// update input
	neural6.input = [];
	neural6.getUserInputsFromBM(neural6.bm, neural6.input);
};

neural6.updateStatus = function(out) {
	var p = 7;
	var all = "";
	var maxOut = -1000;
	for (var i = 0; i < 10; ++i) {
		var v = out[i];
		if (v > maxOut) {
			p = i;
			maxOut = v;
		}
	}
	for (var i = 0; i < 10; ++i) {
		var row = "D " + i + ", V =" + (out[i] * 100).toFixed(4).padStart(9) + "%";
		if (i == p) {
			neural6.treef2.trans[1] = neural6.dataYoffset - neural6.fontSize * p;
			neural6.font2.print("* " + row);
		} else {
			all += "  " + row;
		}
		all += "\n";
	}
	neural6.font1.print(all);
};

neural6.runNetwork = function(inData, out) {
	var i, j, k;
	var lastK;
	for (k = 1; k < neural6.topo.length; ++k) {
		lastK = k - 1;
		var lastLayer = neural6.layers[lastK];
		var curLayer = neural6.layers[k];
		var outputLayer = k == neural6.topo.length - 1;
		var curA = outputLayer ? out : curLayer.A;
		var lastA = lastK != 0 ? lastLayer.A : inData;
		var ic = neural6.topo[lastK];
		var jc = neural6.topo[k];
		var curB = curLayer.B;
		var curW = curLayer.W;
		var curZ = curLayer.Z;
		for (j = 0; j < jc; ++j) {
			var curWrow = curW[j];
			var ZjRow = curB[j];
			for (i = 0; i < ic; ++i) {
				ZjRow += lastA[i] * curWrow[i];
			}
			curZ[j] = ZjRow;
			curA[j] = outputLayer ? neural6.sigmoid(ZjRow) : neural6.tangentH(ZjRow);
		}
	}
};

neural6.sigmoid = function(x) {
	return 1.0 / (1.0 + Math.exp(-x)) + x * neural6.extraSlopeAmount;
};

neural6.tangentH = function(x) {
	return Math.tanh(x) + x * neural6.extraSlopeAmount;
};

neural6.drawToUser = function(drawColor) {
	var x = neural6.mx;
	var y = neural6.my;
	var xl = neural6.lastmx;
	var yl = neural6.lastmy;
	const xsize = neural6.bm.size.x;
	const ysize = neural6.bm.size.y;
	if (x >= 0 && x < xsize && y >=0 && y < ysize) {
		const A = 255;
		const B = 180;
		const C = 92;
		const D = 64;
		const E = 32;
		const F = 0;
		const brush = [
			[F,E,D,E,F],
			[E,C,B,C,E],
			[D,B,A,B,D],
			[E,C,B,C,E],
			[F,E,D,E,F]
		];
		const lineStep = 20;
		for (var k = 0; k <= lineStep; ++k) {
			var xc = Math.floor(xl + (x - xl) * k / lineStep);
			var yc = Math.floor(yl + (y - yl) * k / lineStep);
			for (var j = 0; j < 5; ++j) {
				for (var i = 0; i < 5; ++i) {
					var brushVal = brush[j][i];
					if (brushVal) {
						var xi = xc + i - 2;
						var yj = yc + j - 2;
						if (drawColor == C32BLACK) {
							// erase: just clear to black if brush is non zero
							neural6.bm.clipPutPixel(xi, yj, drawColor);
						} else {
							// draw: only when output would be greater then the input
							var oldVal = neural6.bm.clipGetPixel(xi, yj);
							if ((oldVal & 0xff) < brushVal) {
								neural6.bm.clipPutPixel(xi, yj, C32([brushVal, brushVal, brushVal]));
							}
						}
					}
				}
			}
		}
	}
	neural6.lastmx = x;
	neural6.lastmy = y;
};

// load these before init
neural6.load = function() {
	preloadbin("neural/t10k-images.idx3-ubyte.bin");
	preloadbin("neural/Neural6_4.mdl");
	preloadimg("../common/sptpics/font0.png");
	preloadimg("../common/sptpics/font3.png");
};

neural6.init = function() {
	neural6.testIdx = 0;
	logger("entering webgl neural6\n");
	
	// load binary data, model and test data into an ArrayBuffer
	neural6.loadNetwork();
	neural6.loadTestData();
	
	// build parent
	neural6.roottree = new Tree2("neural6 root tree");

	// build a planexy (a square)
	neural6.bm = new Bitmap32(neural6.xSize, neural6.ySize, C32GREEN);
	neural6.dataTex = DataTexture.createtexture("digit", neural6.bm);
	var plane = buildplanexy("aplane",1,1,"digit","texDoubleSided");
	plane.mod.flags |= modelflagenums.DOUBLESIDED;
	neural6.curData = neural6.testDataRaw[neural6.testIdx].slice();
	neural6.bm = neural6.makeBMfromImage(neural6.curData
		, neural6.xSize
		, neural6.ySize);
	neural6.updateTex();

	plane.trans = [1,0,2];
	neural6.roottree.linkchild(plane);

	// load some fonts
	// build model font0, title
	neural6.font0 = new ModelFont("font0","font3.png","font2c",neural6.fontSize,neural6.fontSize,100,100);
    neural6.font0.mat.fcolor = [0,1,0,1];
    neural6.font0.mat.bcolor = [0,0,0,1];
	neural6.font0.print("Hello");
	neural6.treef0 = new Tree2("font0");
	neural6.treef0.trans = [-2.5, 1, 2];
	neural6.treef0.setmodel(neural6.font0);
	neural6.roottree.linkchild(neural6.treef0);

	// build model font1, data
	neural6.font1 = new ModelFont("font1","font0.png","font2c",neural6.fontSize,neural6.fontSize,100,100);
    neural6.font1.mat.fcolor = [0,1,0,1];
    neural6.font1.mat.bcolor = [0,0,0,1];
	neural6.font1.print("0\n1\n2\n3\n4\n5\n6\n\n8\n9");
	neural6.treef1 = new Tree2("neural6.font1");
	neural6.treef1.trans = [-2.5, neural6.dataYoffset, 2];
	neural6.treef1.setmodel(neural6.font1);
	neural6.roottree.linkchild(neural6.treef1);

	// build model font2, hilight
	neural6.font2 = new ModelFont("font2","font3.png","font2c",neural6.fontSize,neural6.fontSize,100,100);
    neural6.font2.mat.fcolor = [1,1,1,1];
    neural6.font2.mat.bcolor = [0,0,0,1];
	neural6.font2.print("Hum");
	neural6.treef2 = new Tree2("neural6.font2");
	neural6.treef2.trans = [-2.5, neural6.dataYoffset, 2];
	neural6.treef2.setmodel(neural6.font2);
	neural6.roottree.linkchild(neural6.treef2);

	mainvp = defaultviewport();	
	mainvp.clearcolor = [.5,.5,1,1];
};

neural6.proc = function() {
	// proc
	var updateTex = false;
	switch(input.key) {
	case keycodes.LEFT:
		--neural6.testIdx;
		if (neural6.testIdx < 0) {
			neural6.testIdx += neural6.testDataRaw.length;
		}
		updateTex = true;
		break;
	case keycodes.RIGHT:
		++neural6.testIdx;
		if (neural6.testIdx >= neural6.testDataRaw.length) {
			neural6.testIdx -= neural6.testDataRaw.length;
		}
		updateTex = true;
		break;
	}
	if (updateTex) {
		neural6.curData = neural6.testDataRaw[neural6.testIdx].slice();
	neural6.bm = neural6.makeBMfromImage(neural6.curData
		, neural6.xSize
		, neural6.ySize);
		neural6.updateTex();
	}
	const xsize = neural6.bm.size.x;
	const ysize = neural6.bm.size.y;
	neural6.mx = Math.floor(input.fmx * xsize);
	neural6.my = Math.floor((.5 - input.fmy) * ysize);
	if (input.mbut[Input.MMIDDLE]) {
		neural6.bm.fastClear(C32BLACK);
		neural6.updateTex();
	}
	if (input.mbut[Input.MLEFT]) {
		neural6.drawToUser(C32WHITE);
		neural6.updateTex();
	} else if (input.mbut[Input.MRIGHT]) {
		neural6.drawToUser(C32BLACK);
		neural6.updateTex();
	} else {
		neural6.lastmx = neural6.mx;
		neural6.lastmy = neural6.my;
	}
	neural6.font0.print("User: TestIdx = " + neural6.testIdx);
	
	neural6.output = new Array(10);
	neural6.runNetwork(neural6.input, neural6.output);

	neural6.updateStatus(neural6.output);
	neural6.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	neural6.roottree.draw();
};

neural6.exit = function() {
	// show current usage before cleanup
	neural6.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	neural6.roottree.glfree();
	neural6.dataTex.glfree();
	
	// show usage after cleanup
	logrc();
	neural6.roottree = null;
	logger("exiting webgl neural6\n");
};
