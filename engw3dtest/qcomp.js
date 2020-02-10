// Quantum computer simulation code ported from Windows c++
// 615 lines before remove old code and add new comments
// 268 after
var qcomp = {}; // the state, load this file first

// constants
qcomp.SR2 = Math.sqrt(2);
qcomp.SR3 = Math.sqrt(3);
qcomp.SR2O2 = qcomp.SR2*.5; // O for Over, 1 over square root of 2, D divide right away
qcomp.SR3O2 = qcomp.SR3*.5;
qcomp.SR1D3 = Math.sqrt(1/3);
qcomp.SR2D3 = Math.sqrt(2/3);

// State section
qcomp.noesc = true;
// yellow title area
qcomp.text = 'Qcomp: 6 QBit Quantum Computer Simulator, A lot more to come for Expo!<br><a href="qcomp_instructions.html" target="_blank">Instructions and more links</a>';


qcomp.title = "Quantum Computer Simulator"; // entry in the state <select> UI

// 3D section
qcomp.roottree; // for 3d text
qcomp.sphereroottree; // for Bloch sphere and axises
qcomp.flabeltree; // for treecolor and onResize
qcomp.flabelmodel; // for print text to fontmodel
qcomp.flabelredtree; // for treecolor and onResize RED
qcomp.flabelredmodel; // for print RED text to fontmodel
qcomp.flargeconsoletree;
qcomp.flargeconsolemodel;
qcomp.fsmallconsoletree;
qcomp.fsmallconsolemodel;

// for scrolling circuit left and right
qcomp.sliderTree; // yellow sphere to drag to change TOD
qcomp.dragSlider; // true if currently dragging the TOD

qcomp.invalidcol = -2;
qcomp.lastshowcol;
// enum for mode
qcomp.showmode = {COL:0,ACC:1,STATE:2,EXPO:3};
qcomp.sm; // what mode you are in 0,1,2
qcomp.modestr = ["Matrix Current Column","Matrix Accumulate","Quantum State","Quantum State, Expo!"];
qcomp.linkfrom;

qcomp.nodrop; // prevent double click load file local from also dropping gate
qcomp.lastqstate = null; // the last qstate printed

// force, updates slider even if is the same as before, (resize)
qcomp.updateSlider = function(force) {
	qcomp.QField.slideFactor = qcomp.QColumn.cpixwid*qcomp.QField.maxcolumns - glc.clientWidth + 2*qcomp.QField.leftlabels; // left and right
	if (qcomp.QField.slideFactor < 0)
		qcomp.QField.slideFactor = 0;
	var mb = input.mbut[Input.MLEFT];
	var lmb = input.lmbut[Input.MLEFT];
	var sliderVal = qcomp.sliderTree.trans[0]; // -1 to 1
	var oldSliderVal = sliderVal;
	// do we need to slide?
	if (!mb)
		qcomp.dragSlider = false;
	// see if mouse click on the slider sphere, then drag it
	var del = input.fmx - qcomp.sliderTree.trans[0];
	if (mb && !lmb && input.fmy < -.92 && // mouse y near the bottom
	  Math.abs(del) < .04) { // mouse x near the slider
		qcomp.dragSlider = true; // yes, mouse pressed on slider icon
	}
	// slider engaged, update slider trans with mouse x
	if (qcomp.dragSlider) {
		sliderVal = input.fmx;
	} else {
		// see if mouse held down left or right of slider, if so move closer
		if (mb && input.fmy < -.92 && Math.abs(input.fmx) <= 1.025) {
			if (del > .02)
				sliderVal += .01;
			else if (del < -.02)
				sliderVal -= .01;
		}
	}
	// since this is the only slider and arrows and pageup/down are not used
	var lrv = 2*qcomp.QColumn.cpixwid/qcomp.QField.slideFactor/20; // 2 is for the -1 to 1 for slider
			// 20 is for the 18.2 per second keyboard repeat
	var pudv = 4*lrv;
	switch(input.key) {
	case keycodes.PAGEUP:
		sliderVal -= pudv;
		input.key = 0;
		break;
	case keycodes.LEFT:
		sliderVal -= lrv;
		input.key = 0;
		break;
	case keycodes.RIGHT:
		sliderVal += lrv;
		input.key = 0;
		break;
	case keycodes.PAGEDOWN:
		sliderVal += pudv;
		input.key = 0;
		break;
	}
	sliderVal = range(-1,sliderVal,1);
	qcomp.sliderTree.trans[0] = sliderVal;
	//qcomp.flabeltree.trans = [0,0,0];
	var depth = glc.clientHeight/2;
	// convert to 0 to 1
	var sliderValue01 = sliderVal * .5 + .5;
	qcomp.flabelredtree.trans =qcomp.flabeltree.trans = [
//	  -depth*gl.asp + sliderValue01*1000,
	-depth*gl.asp - sliderValue01*qcomp.QField.slideFactor,
	  depth + 12, // fudge y for font lining up with circuit '>---'
	  depth
	];
	if (sliderVal != oldSliderVal || force) {
		qcomp.qf.setxoffset(/*ret*hposfactor*/sliderValue01);
	}
};


qcomp.remoteDataFolder = "qcomp";
//qcomp.remoteDataFolder = "qcompBRN"; // before rename

//qcomp.data = {};
//qcomp.data.value = ""; // load save file data

// Quantum section
qcomp.defaultPreBuilt = "qbit_random.qcmp";
//qcomp.defaultPreBuilt = "control gates.qcmp"; // load this circuit at the start
//qcomp.defaultPreBuilt = "game bot left.qcmp"; // load this circuit at the start
//qcomp.defaultPreBuilt = "nothad.qcmp"; // load this circuit at the start
//qcomp.defaultPreBuilt = "super dense coding 11.qcmp";
//qcomp.defaultPreBuilt = "2 entangled ibmqx4fail.qcmp";
//qcomp.defaultPreBuilt = "new game middle middle.qcmp";
//qcomp.defaultPreBuilt = "Quantum Fourier Transform.qcmp";
//qcomp.defaultPreBuilt = "grover4link.qcmp"; // load this circuit at the start
//qcomp.defaultPreBuilt = "s and t gates.qcmp"; // load this circuit at the start
//qcomp.defaultPreBuilt = "BellState measure CP 30.qcmp"; // load this circuit at the start
//qcomp.defaultPreBuilt = "1qubit gates.qcmp"; // load this circuit at the start
//qcomp.defaultPreBuilt = "90 degrees Y.qcmp"; // load this circuit at the start
//qcomp.defaultPreBuilt = "testc2 sp.qcmp"; // load this circuit at the start
//qcomp.cursorEnum = 0; // default gate for cursor (0 passthru), overridden by qcomp.init (1 Hadamard)
//qcomp.spriteRot = 0; // test spriter rotation on just the qgate cursor
// name of all the quantum gates, index is the gate enum
// qcomp.qgfilenames moved to qcomp_qgatelist.js
	
// width and height of all qgates
//qcomp.gwid = 55;
//qcomp.ghit = 80;

qcomp.qf = null; 	// the whole quantum circuit, a 2D array of qcolumns,
					// which each one has an array of qgates for each column)
qcomp.QEPSILON = .0001; // more tolerance, quantum epsilon for throwing out small probabilities

qcomp.qgcur = null; // cursor with a qgate
// used to read files that don't allow space uses '_' instead
qcomp.Space2Underscore = function(str) {
	str = str.replace(/\s/g,'_'); // whitespace to underscore
	return str;
};

// State section
// load these before init
qcomp.load = function() {
	// preload these textures
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
	preloadimg("../common/sptpics/font0.png");
	preloadimg("../common/sptpics/font1.png");
	preloadimg("../common/sptpics/font2.png");
	preloadimg("../common/sptpics/font3.png");
	preloadimg("../common/sptpics/smallfont.png");
	preloadimg("../common/sptpics/light.jpg");
	
	// load qcomp assets (gates icons etc.)
	// load all qgate textures
	for (var i=0;i<qcomp.qgateinfo.length;++i) {//n qcomp.qgfilenames) {
		var gateName = qcomp.qgateinfo[i].fullname;
		//var gateName = qcomp.qgfilenames[key];
		var gateName = qcomp.Space2Underscore(gateName); // convert qgate name to name of qgate image file
		var loadfile = qcomp.remoteDataFolder + "/" + gateName + ".png";
		preloadimg(loadfile);
	}
	// load list of circuits are available to load from server (built in circuits)
	preloadtext(qcomp.remoteDataFolder + "/prebuilt.txt"); // goes into pre-built <select>
};

// callbacks for load save local remote
// Local, read write
// response callback from load filesystem, put the dataLoaded argument data somewhere
/*qcomp.loadcb = function(dataLoaded) {
	qcomp.data.value = dataLoaded;
};*/

// request callback from save filesystem, return the dataToSave to the save system
qcomp.savecb = function() {
	//var dataToSave = qcomp.data.value;
	var dataToSave = qcomp.qf.save();
	return dataToSave;
	
/*
			const C8* savename = efile->gettname();
			if (savename[0] != '\0') { // don't save 0 length names
				string fileextname = string(savename) + ".qcmp";
				qf->save(fileextname);
				/savelastfile(fileextname);
				//S32 idx = lfiles->findstring(savename);
				//if (idx >= 0)
				//	lfiles->setidxc(idx);
			//focus2 = lfiles;
			//}
*/	
	
	
	
};

// Remote, read only, (for now)
// request server side file to load (examples)
qcomp.selectExample = function() {
	var exampleName = qcomp.prebuiltList[qcomp.sellev.selectedIndex];
	logger("requesting example '" + exampleName + "'\n");
	goAjaxText(qcomp.remoteDataFolder + "/" + exampleName,qcomp.loadcb);
	var namenoext = exampleName.substr(0,exampleName.length - 5); // strip '.qcmp'
	changefileloadsavename(namenoext);
	logger("load example '" + namenoext + "'\n");
};

// response server side 'txt', either got a response back from server for pre-built, or callback for filesystem load
qcomp.loadcb = function(txt) { // text data of the file
	// free up openGL resources if necessary
	//return;
	if (!txt.length)
		return;
	//if (qcomp.qf)
	//	qcomp.qf.glfree();
	//qcomp.data.value = txt; // put it somewhere, show file data here
	var scScript = new Script(txt);
	// extract width and height from .qcmp
	//qcomp.qf = new qcomp.QField(3); // build a Qfield from this text data, no column
	
// weird double click bug, get 2nd click to drop gate during file load dialog double click, so, set cursor gate to PASSTHRU only gate that cannot drop
/*	qcomp.changecursorqgate(qcomp.qtype.PASSTHRU);
	selectsetidx(qcomp.selqgate,qcomp.qtype.PASSTHRU); // set <select> with default circuit	*/
	qcomp.nodrop = 10;
	qcomp.scratch = {
		scratch1:-3.14,
		scratch2:2.718
	};
	qcomp.scratch.scratch3 = "hi ho";
	qcomp.scratch.scratch4 = {one:1,two:true,three:undefined,four:null,five:"five"};

	var lasthlp = qcomp.qf.gethilitpos();
	if (lasthlp < 0)
		lasthlp = 16; // default hilight is here
	if (qcomp.qf)
		qcomp.qf.glfree();
	qcomp.qf = new qcomp.QField(scScript,lasthlp); // build a Qfield from this text data, no column
	qcomp.qf.fcalc();
	
	var xoff = lasthlp*qcomp.QColumn.cpixwid - 15*qcomp.QField.fpixwid/16;
	if (xoff > 0)
		qcomp.qf.setxoffset(xoff);
	qcomp.resetui();
	qcomp.onresize();
	//qcomp.forceConsoleUpdate = true;
	qcomp.printtoconsole(lasthlp);
};

// callback from qgate selector change
qcomp.selectQGate = function() {
	qcomp.changecursorqgate(this.selectedIndex);
	
	logger("selectQGate, idx = " + this.selectedIndex + "\n");
};

// changes, qgcur QGateBase
qcomp.changecursorqgate = function(gt) {
	//delete qgcur;
	if (gt >= 0 && gt < qcomp.qgateinfo.length) {
		qcomp.qgcur = qcomp.QGateBase.build(gt,5); // some random id like 5
	} else {
		qcomp.qgcur = null;
	}
};

// returns a gate id number
qcomp.nextcursorqgate = function() {
	if (!qcomp.qgcur)
		return 0;
	var cp = qcomp.qgcur.getcurpart();
	var mp = qcomp.qgcur.getnumparts();
	++cp;
	if (cp == mp)
		cp = 0;
	return qcomp.qgcur.getbasekind() + cp;
};

qcomp.updatemode = function() {
	printareadraw(qcomp.textuiMode,qcomp.modestr[qcomp.sm]);
	qcomp.lastshowcol = qcomp.invalidcol;
};

qcomp.bin2str = function(val,bits) {
	var str = "";
	var i;
	for (i=bits-1;i>=0;--i) {
		var msk = 1<<i;
		if (val&msk)
			str += "1";
		else
			str += "0";
	}
	return str;
};

qcomp.repchar = function(chr,rep) {
	var str = "";
	var i;
	for (i=0;i<rep;++i)
		str += chr;
	return str;
};

qcomp.resetui = function() {
	// print labels too
	qcomp.lastshowcol = qcomp.invalidcol;
	qcomp.linkfrom = -1;
	
	// build qubit start labels
	var nqb = qcomp.qf.getnumqubits();
	var printstring = "\n\n\n";
	var printstringred = printstring.slice(0);
	for (var i=0;i<nqb;++i) {
		printstring += " Q" + i + " |0>---\n\n\n\n\n";
		printstringred += "\n\n\n\n\n";
	}
	if (qcomp.sm == qcomp.showmode.EXPO && nqb <= 4) {
		
		printstring += "\n\n\n\n\n";
		printstringred += "\n\n\n\n\n";
		var bitfields = "Q";
		for (i=0;i<nqb;++i)
			bitfields += i;
		//con32_printf(con,"%s\n",bitfields.c_str());
		printstring += " " + bitfields + "\n\n";
		printstringred += "\n\n";

		
		var pnqb = 1<<nqb;
		for (i=0;i<pnqb;++i) {
			if (i == 0) {
				//printstring    += " |" + qcomp.bin2str(i,nqb) + ">\n";
				//printstringred    += qcomp.repchar(" ",3 + nqb);
				//printstringred    += qcomp.repchar("-",7-nqb) + "\n";
				printstringred += " |" + qcomp.bin2str(i,nqb) + ">" + qcomp.repchar("-",7-nqb) + "\n";
				printstring += "\n";
			} else {
				printstring += " |" + qcomp.bin2str(i,nqb) + ">" + qcomp.repchar("-",7-nqb) + "\n";
			}
			if (nqb < 2)
				printstring += "\n\n\n\n";
			if (nqb < 3)
				printstring += "\n\n";
			if (nqb < 4)
				printstring += "\n";
		}
	}
	qcomp.flabelmodel.print(printstring); // BLACK
	qcomp.flabelredmodel.print(printstringred); // RED
};

// return pass in index 0, updated string in index 1
qcomp.showmeasprob = function(qm,qsout,str) {
	var tb = qsout.gettotprob();
	if (tb < qcomp.QEPSILON) {
		str += "( ZERO MEAS PROB ) ";
		return [false,str];
	}
	var qmsing = !qm.det();
	//var qmdet = qm.det();
	//if (qcomp.QState.getprob(qmdet) < qcomp.QEPSILON)
	//	qmsing = true;
	if (qmsing || tb < 1 - qcomp.QEPSILON) {
		str += "((( MEAS PROB = " + compf.fixfloat(tb) + " ))) ";
		qsout.normalize();
	}
	return [true,str];
};

qcomp.printtoconsole = function(cl/*,frc*/) {
	// print something
	/*if (cl == qcomp.invalidcol) {
		cl = -1;
	}*/
	//	qcomp.lastshowcol = -1;
	var printlarge = true;
	//if (true) {
	if (/*qcomp.forceConsoleUpdate || */(cl != qcomp.lastshowcol && cl != qcomp.invalidcol)) { // only update when changed
		var qm;// = new qcomp.QMat(); // qmat
		var nqb  = qcomp.qf.getnumqubits();
		//var qsin = new qcomp.QState();
		//var qsout = new qcomp.QState(); // qstate
		var str = "";
		if (cl >= qcomp.QField.maxcolumns)
			cl = qcomp.QField.maxcolumns - 1;
		// show link status
		if (qcomp.linkfrom >= 0)
			str += " --------------- Link status from " + qcomp.linkfrom + " -------------\n";
		// PRINT SOME MORE
		//str += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789)!@#$%^&*(\n";
		if (qcomp.sm == qcomp.showmode.EXPO && nqb == 3)
			str += "\n";
		str += " ### numqubits = " + nqb + " ### ";
		switch(qcomp.sm) {
		case qcomp.showmode.STATE:
			qcomp.qf.sethilitpos(cl,true);
			str += "CUR STATE = " + cl + " ";
			if (qcomp.reverse)
				str += "<QBit rev disp order> ";
			if (qcomp.zprob)
				str += "<Show 0 prob> ";
			if (qcomp.showspin)
				str += "<Show spin> ";
			qm = qcomp.qf.getqmatacc(cl);
			var qsin = new qcomp.QState(nqb);
			qsin.init0();
			var qsout = qm.mulState(qsin);
			qcomp.lastqstate = qsout;
			
// show measurement probabilites			
			var result = qcomp.showmeasprob(qm,qsout,str);
			str = result[1];
			if (!result[0])
				break;
			str += "\n";

			str += qsout.print(qcomp.modestr[qcomp.sm],false/*,qcon*/);
			//qcomp.lastqstate = qsout;

// show factors if any
			var showFactors = true;
			if (showFactors) {
				// print factors if they exist
				var factors = []; // QState
				if (nqb != 1)
					factors = qsout.factor();
				str += qcomp.QState.printfactors(factors,"factors CUR STATE\n");
				if (!factors.length && nqb == 2)
					str += "\n ENTANGLED"; 
			}

			// customize
			if (nqb >= 5) {
				printlarge = false;
			}
			break;
		case qcomp.showmode.EXPO:
			qcomp.qf.sethilitpos(cl,true);
			str += "CUR EXPO = " + cl + " ";
			if (qcomp.reverse)
				str += "<QBit rev disp order> ";
			if (qcomp.zprob)
				str += "<Show 0 prob> ";
			if (qcomp.showspin)
				str += "<Show spin> ";
			qm = qcomp.qf.getqmatacc(cl);
			var qsin = new qcomp.QState(nqb);
			qsin.init0();
			var qsout = qm.mulState(qsin);
			qcomp.lastqstate = qsout;
			
	// show measurement probabilites
			var sep = 19;
			var result = qcomp.showmeasprob(qm,qsout,str);
			str = result[1];
			if (!result[0])
				break;
			if (nqb > 3) {
				str += " [qstate too big for expo]";
			}
			if (nqb > 4) {
				str += " [EXPO too big]";
			}
			// move to the bottom section
			for (var i=0;i<sep;++i) {
				str += "\n";
			}
			if (nqb <= 3) {
				if (nqb == 3) {
					printlarge = false;
					for (var i=0;i<sep+1;++i) { // small font needs a lot more separation
						str += "\n";
					}
				}
				str += "\n" + qsout.print(qcomp.modestr[qcomp.sm],false/*,qcon*/);
			}
			
// show factors if any, only interested in if entangled or not, not the factors
			var showFactors = true;
			if (showFactors) {
				// print factors if they exist
				var factors = []; // QState
				if (nqb != 1)
					factors = qsout.factor();
				// commented out , only show entangled
				// don't show the factors, just say entangled
				//str += qcomp.QState.printfactors(factors,"factors CUR STATE\n");
				if (!factors.length && nqb == 2)
					str += "\n ENTANGLED"; 
			}
			break;
		case qcomp.showmode.ACC:
			qcomp.lastqstate = null;
			qcomp.qf.sethilitpos(cl,true);
			str += "CUR ACCUMULATE = " + cl + "\n";
			
			qm = qcomp.qf.getqmatacc(cl);
			if (nqb <= 4) {
				str += qm.print(qcomp.modestr[qcomp.sm],false/*,qcon*/);
			} else {
				var dim = 1<<qm.getnumqubits();
				str += " " + qcomp.modestr[qcomp.sm] + " [matrix " + dim + " " + dim + ", too big]\n";
			}
			if (nqb == 4)
				printlarge = false;
			break;
		case qcomp.showmode.COL:
			qcomp.lastqstate = null;
			if (cl == -1)
				cl = 0; // fix remnants from acc or state enum when switching to column mode
			qcomp.qf.sethilitpos(cl,false);
			str += "CUR COLUMN = " + cl + /*" frac = " + frc +*/ "\n";
			
			qm = qcomp.qf.getqmatcol(cl);
			if (nqb <= 4) {
				str += qm.print(qcomp.modestr[qcomp.sm],false/*,qcon*/);
			} else {
				var dim = 1<<qm.getnumqubits();
				str += " " + qcomp.modestr[qcomp.sm] + " [matrix " + dim + " " + dim + ", too big]\n";
			}
			if (nqb == 4)
				printlarge = false;
			break;
		}
		qcomp.lastshowcol = cl;
		if (printlarge) {
			qcomp.flargeconsolemodel.print(str);
			qcomp.flargeconsoletree.flags &= ~treeflagenums.DONTDRAWC;
			qcomp.fsmallconsoletree.flags |= treeflagenums.DONTDRAWC;
		} else {
			qcomp.fsmallconsolemodel.print(str);
			qcomp.fsmallconsoletree.flags &= ~treeflagenums.DONTDRAWC;
			qcomp.flargeconsoletree.flags |= treeflagenums.DONTDRAWC;
		}

	}
};

qcomp.buildaxis = function(name,col,wid,hit) {
	var cyl = buildcylinderxz(name,1,1,0,"flat");
	cyl.scale = vec3.fromValues(wid,hit,wid);
	var colc = vec4.clone(col);
	//vec4.scale(colc,colc,.75);
	colc[3] = 1;
	cyl.children[0].mat.color = colc;
	cyl.children[1].mat.color = colc;
	cyl.children[2].mat.color = colc;
	return cyl;
};

qcomp.goStateMode = function() {
	qcomp.sm = qcomp.showmode.STATE;
	qcomp.updatemode();
	//qcomp.forceConsoleUpdate = true;
	qcomp.resetui();
};

qcomp.goAccMode = function() {
	qcomp.sm = qcomp.showmode.ACC;
	qcomp.updatemode();
	//qcomp.forceConsoleUpdate = true;
	qcomp.resetui();
};

qcomp.goColMode = function() {
		qcomp.sm = qcomp.showmode.COL;
		qcomp.updatemode();
		if (qcomp.qf.gethilitpos() == -1)
			qcomp.qf.sethilitpos(0,false); // no -1 for column mode enum
		//qcomp.forceConsoleUpdate = true;
		qcomp.resetui();
};

qcomp.goExpoMode = function() {
		qcomp.sm = qcomp.showmode.EXPO;
		qcomp.updatemode();
		//if (qcomp.qf.gethilitpos() == -1)
		//	qcomp.qf.sethilitpos(0,false); // no -1 for column mode enum
		//qcomp.forceConsoleUpdate = true;
		qcomp.resetui();
};

qcomp.init = function() {
	qcomp.spinang = 0;
	qcomp.maxspinang = 150;
	//var testmat = new qcomp.QMat();
	compf.test();
	qcomp.QState.test();
	logger("entering webgl qcomp\n");
	//qcomp.forceConsoleUpdate = false;
	mainvp = defaultviewport();	
	mainvp.clearflags = gl.DEPTH_BUFFER_BIT; // clear depth buffer
	mainvp.zoom = 1;
	// initial qgate for the cursor
	//qcomp.cursorEnum = 1; // Hadamard
	
	//qcomp.sm = qcomp.showmode.EXPO;
	qcomp.sm = qcomp.showmode.STATE;
	qcomp.nodrop = 0;


	// UI section, left side
	qcomp.reverse = false;
	qcomp.zprob = false;
	qcomp.showspin = false;
	//qcomp.expo = false;
	setbutsname('qcomp'); // namespace for UI, used to free it up on exit
	// nice easy way to load/save to local file system, use ext .qcmp
	// load pre-built section
	makeaprintarea("Load examples from server"); 
	//var preloadtxt = preloadedtext["prebuilt.txt"]; // file that has all prebuilt circuits names
	
	// find index of default pre-built
	
	/*qcomp.prebuiltList = preloadtxt.split("\n").map(function(item) {
		return item.trim();
	}); // might be corrupted, trim will fix now */
	
	qcomp.prebuiltList = new Script("prebuilt.txt").getData();
	
	// make a basic null quantum circuit until the async is done
	// set > 1 to prevent sphere from flashing between async load
	if (qcomp.qf)
		qcomp.qf.glfree();
	qcomp.qf = new qcomp.QField(3); // temporary circuit until default is loaded
	qcomp.qf.fcalc();
	qcomp.qgcur = null;
	
	
// load examples from server	
	qcomp.sellev = makeaselect(qcomp.prebuiltList,qcomp.selectExample); // <select> for pre-built files
	makeabut("Reload example",qcomp.selectExample);
	var idx = qcomp.prebuiltList.indexOf(URLparams.startcircuit + ".qcmp");
	if (idx < 0)
		idx = qcomp.prebuiltList.indexOf(qcomp.defaultPreBuilt); 
	selectsetidx(qcomp.sellev,idx); // set <select> with default circuit
	
	if (URLparams.startmode) {
		if (URLparams.startmode == "expo")
			qcomp.sm = qcomp.showmode.EXPO;
	}

// load and save to the filesystem
	makeafileloaddsave(qcomp.loadcb,qcomp.savecb,".qcmp"); 
	
	// depends on edit box of makeafileloaddsave is already built
	qcomp.selectExample(); // grab the data from currently selected pre-built init
	
	makeaprintarea("Select QGate"); 
	var selectList = [];
	for (var i=0;i<qcomp.qgateinfo.length;++i) {
		selectList.push(qcomp.qgateinfo[i].fullname);
	}
	qcomp.selqgate = makeaselect(selectList,qcomp.selectQGate);
	//qcomp.loadqgatelist();	
	
	// some stuff
	// configure with 3 buttons
	makeaprintarea("Configure circuit"); 
	makeabut("Less QBits",function(){
		qcomp.qf.lessqubits();
		//qcomp.forceConsoleUpdate = true;
		qcomp.resetui();
		qcomp.onresize();
	});
	makeabut("Reset",function(){
		var numqubits = qcomp.qf.getnumqubits();
		if (qcomp.qf)
			qcomp.qf.glfree();
		//qcomp.qf = null; // just to show
		qcomp.qf = new qcomp.QField(numqubits);
		qcomp.qf.fcalc();
		//qcomp.hqfxoffset.setidx(0);
		qcomp.sliderTree.trans[0] = -1;
		//resetui();
		//qcomp.sm = qcomp.showmode.STATE;
		//qcomp.updatemode();
		qcomp.resetui();
	});
	makeabut("More QBits",function(){
		qcomp.qf.morequbits();
		//qcomp.forceConsoleUpdate = true;
		qcomp.resetui();
		qcomp.onresize();
	});

	// next line of 4 buttons
	// mode, qstate, qcolumn, qaccumulate
	qcomp.textuiMode = makeaprintarea("Show Mode");
 	makeabut("'Q' state",qcomp.goStateMode); /*function(){
		qcomp.sm = qcomp.showmode.STATE;
		qcomp.updatemode();
		//qcomp.forceConsoleUpdate = true;
		qcomp.resetui();
	});*/
	makeabut("matrix 'A'cc",qcomp.goAccMode);/*function(){
		qcomp.sm = qcomp.showmode.ACC;
		qcomp.updatemode();
		//qcomp.forceConsoleUpdate = true;
		qcomp.resetui();
	});*/
	makeabut("matrix c'O'l",qcomp.goColMode);/*function(){
		qcomp.sm = qcomp.showmode.COL;
		qcomp.updatemode();
		if (qcomp.qf.gethilitpos() == -1)
			qcomp.qf.sethilitpos(0,false); // no -1 for column mode enum
		//qcomp.forceConsoleUpdate = true;
		qcomp.resetui();
	});*/
	makeabut("'E'xpo!",qcomp.goExpoMode);/*function(){
		qcomp.sm = qcomp.showmode.EXPO;
		qcomp.updatemode();
		if (qcomp.qf.gethilitpos() == -1)
			qcomp.qf.sethilitpos(0,false); // no -1 for column mode enum
		//qcomp.forceConsoleUpdate = true;
		qcomp.resetui();
	});*/
	//makeaprintarea("Reverse Display of Qbits");
	makeabut("Reverse qubit order",function(){
		//qcomp.sm = qcomp.showmode.COL;
		qcomp.reverse = !qcomp.reverse;
		//qcomp.updatemode();
		//if (qcomp.qf.gethilitpos() == -1)
		//	qcomp.qf.sethilitpos(0,false); // no -1 for column mode enum
		//qcomp.forceConsoleUpdate = true;
		qcomp.resetui();
	});
	makeabut("Show 0 prob",function(){
		//qcomp.sm = qcomp.showmode.COL;
		qcomp.zprob = !qcomp.zprob;
		//qcomp.updatemode();
		//if (qcomp.qf.gethilitpos() == -1)
		//	qcomp.qf.sethilitpos(0,false); // no -1 for column mode enum
		//qcomp.forceConsoleUpdate = true;
		qcomp.resetui();
	});
	makeabut("Spin!",function(){
		//qcomp.sm = qcomp.showmode.COL;
		qcomp.showspin = !qcomp.showspin;
		qcomp.spinang = 0;
		//qcomp.updatemode();
		//if (qcomp.qf.gethilitpos() == -1)
		//	qcomp.qf.sethilitpos(0,false); // no -1 for column mode enum
		//qcomp.forceConsoleUpdate = true;
		qcomp.resetui();
	});
	makeaprintarea("NOTE: Middle mouse button links columns");
	
	var qt = qcomp.qtype.HADAMARD; // startup cursor gate
	qcomp.changecursorqgate(qt);

	selectsetidx(qcomp.selqgate,qcomp.qtype.HADAMARD); // set <select> with default circuit	
	
	//qcomp.lastshowcol = qcomp.invalidcol;
	
	//qcomp.resetui();
	//qcomp.updatemode();
	
	
	// 3D section
	
	// build parent
	qcomp.roottree = new Tree2("root"); // main 3D tree
	qcomp.sphereroottree = new Tree2("sphere root"); // main 3D tree
	
// color map of complex space TEXTURE
	// make a <canvas>
	var c = document.createElement('canvas');
	qcomp.RCtexX = 128;
	qcomp.RCtexY = 128;
	
	c.width = qcomp.RCtexX;
	c.height = qcomp.RCtexY;
	// make a 2d context
	var ctx = c.getContext('2d');
	// draw on 2d context
	var i,j;
	
	var invTexX = 1/qcomp.RCtexX; // step
	var invTexY = 1/qcomp.RCtexY;
	var im = 2*invTexX;
	var ib = invTexX - 1;
	var jm = 2*invTexY;
	var jb = invTexY - 1;
	
	for (j=0;j<qcomp.RCtexY;++j) {
		var jf = j*jm + jb;
		for (i=0;i<qcomp.RCtexX;++i) {
			var ief = i*im + ib;
			if (ief*ief + jf*jf < 1) { // inside circle
				var val = compf.create(ief,-jf); // flip y, put positive on top
				ctx.fillStyle = scratch.getCssColorFromComplex(val);
			} else { // outside circle
				ctx.fillStyle = 'rgba(0,0,0,0)';
			}
			ctx.fillRect(i, j, 1, 1);
		}
	}
	// end procedure
	// copy a <canvas> to a datatexture
	qcomp.rcmap = DataTexture.createtexture("rcmap",c);

// color map of complex space TEXTURE markers, little white circles
	// make a <canvas>
	var c = document.createElement('canvas');
	qcomp.RCtexXMark = 16;
	qcomp.RCtexYMark = 16;
	
	c.width = qcomp.RCtexXMark;
	c.height = qcomp.RCtexYMark;
	// make a 2d context
	var ctx = c.getContext('2d');
	// draw on 2d context
	var i,j;
	
	var invTexX = 1/qcomp.RCtexXMark; // step
	var invTexY = 1/qcomp.RCtexYMark;
	var im = 2*invTexX;
	var ib = invTexX - 1;
	var jm = 2*invTexY;
	var jb = invTexY - 1;
	
	for (j=0;j<qcomp.RCtexYMark;++j) {
		var jf = j*jm + jb;
		for (i=0;i<qcomp.RCtexXMark;++i) {
			var ief = i*im + ib;
			var d2 = ief*ief + jf*jf;
			if (d2 < 1 && d2 > .75) { // inside circle
				ctx.fillStyle = 'rgba(255,255,255,1)';
			} else { // outside circle
				ctx.fillStyle = 'rgba(0,0,0,0)';
			}
			ctx.fillRect(i, j, 1, 1);
		}
	}
	// end procedure
	// copy a <canvas> to a datatexture
	qcomp.rcmapMark = DataTexture.createtexture("rcmapMark",c);

/*
	// build a planexy (a square)
	qcomp.planerc = buildplanexy("rcmapplane",1,1,"rcmap","tex");
	//qcomp.planerc = buildplanexy("rcmapplane",1,1,"light.jpg","texc");
	//qcomp.planerc.mod.mat.color = [1,1,1,.125];
	//qcomp.planerc.mod.flags |= modelflagenums.HASALPHA;
	qcomp.planerc.trans = [12,-8,10];
	qcomp.roottree.linkchild(qcomp.planerc);
*/

	// build labels
	var depth = glc.clientHeight/2;
	// 3D font for show qubits at left side
	qcomp.flabelmodel = new ModelFont("fmodel","font0.png","font2c",8,16,100,100,true);
	qcomp.flabelmodel.flags |= modelflagenums.DOUBLESIDED;
	qcomp.flabeltree = new Tree2("fmodel");
	qcomp.flabeltree.setmodel(qcomp.flabelmodel);
	//qcomp.flabeltree.flags |= treeflagenums.DONTDRAWC;
	qcomp.flabeltree.mat.fcolor = [0,0,0,1]; // black colored font
	qcomp.flabeltree.mat.bcolor = [0,0,0,0]; // transparent
	qcomp.roottree.linkchild(qcomp.flabeltree);

	// RED
	// 3D font for show qubits at left side, just a little RED
	qcomp.flabelredmodel = new ModelFont("fmodelred","font0.png","font2c",8,16,100,100,true);
	qcomp.flabelredmodel.flags |= modelflagenums.DOUBLESIDED;
	qcomp.flabelredtree = new Tree2("fmodelred");
	qcomp.flabelredtree.setmodel(qcomp.flabelredmodel);
	//qcomp.flabeltree.flags |= treeflagenums.DONTDRAWC;
	qcomp.flabelredtree.mat.fcolor = [1,0,0,1]; // red colored font
	qcomp.flabelredtree.mat.bcolor = [0,0,0,0]; // transparent
	qcomp.roottree.linkchild(qcomp.flabelredtree);

	// another 3D font for show console
	var conscale = 1;
	qcomp.flargeconsolemodel = new ModelFont("flarge","font0.png","font2c",8*conscale,16*conscale,1000,100,true);
	//qcomp.flargeconsolemodel = new ModelFont("fmodel2","smallfont.png","font2c",8*conscale,8*conscale,1000,100,true);
	qcomp.flargeconsolemodel.flags |= modelflagenums.DOUBLESIDED;
	qcomp.flargeconsoletree = new Tree2("fmodel2");
	//var depth = glc.clientHeight/2;
	qcomp.flargeconsoletree.setmodel(qcomp.flargeconsolemodel);
	qcomp.flargeconsoletree.mat.fcolor = [0,0,0,1]; // green colored font
	qcomp.flargeconsoletree.mat.bcolor = [0,0,0,0];
	qcomp.roottree.linkchild(qcomp.flargeconsoletree);
	qcomp.flargeconsoletree.flags |= treeflagenums.DONTDRAWC;
	
	//qcomp.flargeconsolemodel = new ModelFont("fmodel2","font0.png","font2c",8*conscale,16*conscale,1000,100,true);
	qcomp.fsmallconsolemodel = new ModelFont("fsmall","smallfont.png","font2c",8*conscale,8*conscale,1000,100,true);
	qcomp.fsmallconsolemodel.flags |= modelflagenums.DOUBLESIDED;
	qcomp.fsmallconsoletree = new Tree2("fmodel2");
	//var depth = glc.clientHeight/2;
	qcomp.fsmallconsoletree.setmodel(qcomp.fsmallconsolemodel);
	qcomp.fsmallconsoletree.mat.fcolor = [0,0,0,1]; // green colored font
	qcomp.fsmallconsoletree.mat.bcolor = [0,0,0,0];
	qcomp.roottree.linkchild(qcomp.fsmallconsoletree);
	
	//qcomp.flargeconsolemodel.print("0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19");

	
	
	// 3D build a sphere (Bloch)

	var saveu = spherepatchu; // TODO, fix this!, pass in more args later
	var savev = spherepatchv;
	spherepatchu = 1;
	spherepatchv = 1;
	qcomp.sphc =  buildsphere("asphere",.5,"light.jpg","tex");
	spherepatchu = saveu;
	spherepatchv = savev;
	// adjust parameters of the sphere
	qcomp.sphc.rot = [0,Math.PI,0]; // start at the prime meridian
	qcomp.sphc.scale = [1.5,1.5,1.5];
	
	//qcomp.sph.rotvel = [0,-Math.PI*2/60,0]; // once per minute, counter clockwise
	qcomp.sph = new Tree2("aspherep");
	qcomp.sph.trans = [0,0,4]; // back a bit
	qcomp.sph.qrot = [0,0,0,1]; // default
	
	qcomp.axises = [];
	
	// show the 3 axis
	var cyl = qcomp.buildaxis("x axis",F32GREEN,.1,1.1); // front
	cyl.rot = [-Math.PI/2,0,0];
	qcomp.sph.linkchild(cyl);
	qcomp.axises.push(cyl);
	
	cyl = qcomp.buildaxis("y axis",F32BLUE,.1,1.0); // right
	cyl.rot = [0,0,-Math.PI/2];
	qcomp.sph.linkchild(cyl);
	qcomp.axises.push(cyl);
	
	var cyl = qcomp.buildaxis("z axis",F32RED,.1,1.5); // up, default
	qcomp.sph.linkchild(cyl);
	qcomp.axises.push(cyl);

	// show axis of rotation when it is large enough
	qcomp.rotaxistree = qcomp.buildaxis("rotaxis",F32DARKGRAY,.06,1.7);
	var dir = [1,1,1];
	qcomp.rotaxistree.rot = dir2rotY(dir);
	qcomp.rotaxistree.trans = [0,0,4];
	qcomp.sphereroottree.linkchild(qcomp.rotaxistree);
	
	
	
	qcomp.sph.linkchild(qcomp.sphc);	
	qcomp.sphereroottree.linkchild(qcomp.sph);	
	
	
	

	// build slider UI at the bottom of screen
	qcomp.sliderRoot = new Tree2("sliderRoot");
	
	var sliderBack = buildplanexy("sliderBackground",1 + .025,.025,null,"flat");
	sliderBack.mod.flags |= modelflagenums.NOZBUFFER;
	sliderBack.mod.mat.color = [1,0,1,.25];
	sliderBack.mod.flags |= modelflagenums.HASALPHA;
	sliderBack.trans = [0,-.95,1];
	qcomp.sliderRoot.linkchild(sliderBack);
	
	qcomp.sliderTree = buildsphere("theSlider",.025,null,"flat");
	qcomp.sliderTree.trans = [-1,-.95,0];
	qcomp.sliderTree.mod.mat.color = [1,1,.5,1];
	qcomp.sliderTree.mod.flags |= modelflagenums.HASALPHA;
	qcomp.sliderTree.mod.flags |= modelflagenums.NOZBUFFER;
	qcomp.sliderRoot.linkchild(qcomp.sliderTree);

	// slider viewport
	qcomp.slidervp = defaultorthoviewport();
	qcomp.slidervp.clearflags = 0; // don't clear anything
	
	// sphere viewport
	qcomp.spherevp = defaultviewport();
	qcomp.spherevp.clearflags = 0; // don't clear anything
	qcomp.spherevp.yo = -.25; // offset this viewport down, skew
	
	
	// UI debprint 
	debprint.addlist("qcomp",[
		//"qcomp.cursorEnum", // change cursor qgate for testing
		"qcomp.spritevp", // watch/modify the viewport that spriter.js uses
		"qcomp.nodrop",
		"qcomp.scratch",
		"qcomp.lastqstate",
	]);

	// custom settings
	// turn off all Tree2 sorting for this state, (painters algorithm), TODO maybe spriter package should handle this
	Tree2.treesort = false;
	
	// now try new sprite package
	qcomp.spriteHandle = new Spriter();
	//qcomp.frame = 0; // something to print
	
	qcomp.onresize(); // setup stuff depending on viewport size
	qcomp.alphacutoffsave = globalmat.alphacutoff; // test alpha
	//globalmat.alphacutoff = 0; // test sprites without alpha
	qcomp.resetui();
	qcomp.updatemode();

	bezier.setFactors(.375,0);
	
};

qcomp.proc = function() {
	// some input
	qcomp.updateSlider();
	
	if (qcomp.nodrop > 0) // prevent double click local file load from dropping gate
		--qcomp.nodrop;
	
	// change cursor gate with up/down arrow keys AND wheel mouse
	var del = 0;
	
	switch(input.key) {
	case keycodes.UP:
		del = -1;
		break;
	case keycodes.DOWN:
		del = 1;
		break;
	case "q".charCodeAt(0):
		qcomp.goStateMode();
		break;
	case "a".charCodeAt(0):
		qcomp.goAccMode();
		break;
	case "o".charCodeAt(0):
		qcomp.goColMode();
		break;
	case "e".charCodeAt(0):
		qcomp.goExpoMode();
		break;
	}
		/*
	if (input.key == keycodes.UP) {
		del = -1;
	if (input.key == keycodes.DOWN) {
		del = 1;
	}*/
	if (input.wheelDelta != 0) {
		del = -input.wheelDelta;
	}
	
	if (del != 0) {
		var qt = qcomp.qgcur.getkind();
		qt += del;
		qt = range(0,qt,qcomp.qgateinfo.length - 1);
		qcomp.changecursorqgate(qt);
		selectsetidx(qcomp.selqgate,qt);
	}

	// proc
	//if (true) {
	// only draw sphere when doing just 1 qubit and not column /*expo*/
	if (qcomp.qf.getnumqubits() > 1 || qcomp.sm == qcomp.showmode.COL /* || qcomp.sm == qcomp.showmode.EXPO */) {
		qcomp.sph.flags |=	treeflagenums.DONTDRAWC;
		qcomp.rotaxistree.flags |= treeflagenums.DONTDRAWC;
	} else {
		qcomp.sph.flags &=	~treeflagenums.DONTDRAWC;
		qcomp.rotaxistree.flags &= ~treeflagenums.DONTDRAWC;
	}
	
	qcomp.roottree.proc(); // anim, user tree procs etc.
	qcomp.sphereroottree.proc(); // anim, user tree procs etc.
	//qcomp.spriteRot = normalangrad(qcomp.spriteRot); // from debprint, test sprite rot on qgate cursor

	// drop cursor qgate onto qfield by clicking mouse buttons
	// or pick up gate to cursor
	if (input.mclick[0] || input.mclick[1] || input.mclick[2]) {
		var qg = qcomp.qtype.QTYPEENUM; // invalid gate enum
	
		if (input.mclick[Input.MLEFT] && qcomp.nodrop == 0) { // drop
			if (qcomp.qgcur && qcomp.qgcur.getkind())
				qg = qcomp.qgcur.getkind(); // cursor gate enum
		}
		
		if (input.mclick[Input.MRIGHT]) {
			qg = qcomp.qtype.PASSTHRU; // pick up gate, make a wire
		}
		
		if (input.mclick[Input.MMIDDLE]) { // link columns
			var col = qcomp.qf.getcolumncursor(input.mx,input.my);
			if (col != qcomp.QField.invalidcol) {
				if (qcomp.linkfrom == -1) {
					qcomp.linkfrom = col;
				} else {
					var linkto = col;
					qcomp.qf.makelink(qcomp.linkfrom,linkto);
					qcomp.resetui();
				}
			}
		}


		if (qg != qcomp.qtype.QTYPEENUM) {

			var p = qcomp.qf.getrowcolumncursor(input.mx,input.my);
			if (p) {
				var oldtype = qcomp.qf.getqgate(p[0],p[1]); // get a reference to gate from circuit
				var oldtypekind = oldtype.getkind();
				qcomp.qf.freelink(p[0]); // better
				qcomp.qf.changeqgate(p[0],p[1],qg); // update circuit from qg
				//focus2 = lqgates; // keep list of qgates active
				if (input.mclick[Input.MLEFT] && qcomp.nodrop == 0) { // drop, update circuit gate with cursor
					//qgatebase::qtype ng = qgatebase::qtype(lqgates->getidx());
					var ng = qcomp.nextcursorqgate();
/*					// step to the next gate in the sequence (multi gate)
					//if (ng >= lqgates->getnumidx())
					//	ng = qgatebase::qtype(0);
					lqgates->setidxc(ng); */
					selectsetidx(qcomp.selqgate,ng);
					qcomp.changecursorqgate(ng);
					//focus2 = hqfxoffset;
					//return;
					qcomp.resetui();
				} 
				if (input.mclick[Input.MRIGHT]) { // pickup, update cursor with circuit gate
					if (oldtype) {
						//lqgates->setidxc(oldtypekind);
						selectsetidx(qcomp.selqgate,oldtypekind);
						qcomp.changecursorqgate(oldtypekind);
					}
				}
			}
		
		}
		qcomp.lastshowcol = qcomp.invalidcol; // update console
	}


	// draw matrices or state to console
	var cl;//,frc = 0;
	switch(qcomp.sm) {
	case qcomp.showmode.STATE:
	case qcomp.showmode.ACC:
	case qcomp.showmode.EXPO:
		cl = qcomp.qf.getaccumcursor(input.mx,input.my)
		break;
	case qcomp.showmode.COL:
		cl = qcomp.qf.getcolumncursor(input.mx,input.my);
		//cl = qcomp.qf.getcolumncursor(input.mx,input.my,true);
		//frc = cl.frac;
		//cl = cl.whole;
		//if (cl < 0)
		//	cl = 0;
		break;
	}
	if (cl == qcomp.QField.invalidcol)
		cl = qcomp.qf.gethilitpos();
	//if (cl != qcomp.QField.invalidcol) {
		qcomp.printtoconsole(cl/*,frc*/);
	//}




// DRAW //

	// flycam of which viewport
	doflycam(mainvp); // modify the trs of mainvp using flycam
	//doflycam(qcomp.spritevp); // modify the trs of spritevp using flycam
	
	
	// draw circuit
	qcomp.spriteHandle.reset();
	// draw the whole circuit with hilights
	qcomp.qf.draw(); // some new sprite draw

	// draw 2D
	beginscene(qcomp.spritevp); // start with the sprites, includes entire curcuit
	// new sprite draw
	qcomp.spriteHandle.draw();

	// draw bloch sphere(3D) and all text
	beginscene(qcomp.spherevp);
	qcomp.sphereroottree.draw();
	beginscene(mainvp);
	qcomp.roottree.draw();

	// draw slider
	beginscene(qcomp.slidervp);
	qcomp.sliderRoot.draw();
	
	// draw cursor on another pass, in front of everything
	qcomp.spritevp.clearflags &= ~gl.COLOR_BUFFER_BIT; // don't clear viewport
	qcomp.spriteHandle.reset();
	qcomp.qf.drawcursor(qcomp.qgcur);
	
	// draw 2D
	beginscene(qcomp.spritevp);
	
	// new sprite draw
	qcomp.spriteHandle.draw();

	qcomp.spritevp.clearflags |= gl.COLOR_BUFFER_BIT; // clear viewport next time

	++qcomp.spinang;
	if (qcomp.spinang >= qcomp.maxspinang)
		qcomp.spinang -= qcomp.maxspinang;
};

qcomp.onresize = function() {
	logger("qcomp resize!\n");
	
	// readjust spriter viewport
	qcomp.spritevp = Spriter.createspritervp();
	//qcomp.spritevp.clearflags &= ~gl.COLOR_BUFFER_BIT; // don't clear viewport
	qcomp.spritevp.clearcolor = F32([200,255,255]);

	var depth = glc.clientHeight/2;
	//qcomp.flabeltree.trans = [-depth*gl.asp,depth,depth];
	var nqb = qcomp.qf.getnumqubits();
	//qcomp.flabelmodel.print("hey ho!\noff to work we go, dadadaadaddadada\nnumqubits = " + nqb);
	if (nqb >= qcomp.QColumn.maxiqubits)
		nqb = qcomp.QColumn.maxiqubits - 1;
	qcomp.flargeconsoletree.trans = [ // position console
	  -depth*gl.asp,
/*	  
	  [qcomp.QField.fpixleft-qcomp.QField.leftlabels,0],
	  [qcomp.QField.fpixwid+qcomp.QField.leftlabels,qcomp.QGateBase.gpixhit*drawnumqubits + qcomp.QField.fpixtop + qcomp.QField.bottomMargin],
*/	  
	  
	  depth - (qcomp.QField.fpixtop + qcomp.QGateBase.gpixhit*(nqb + 1) + qcomp.QField.bottomMargin),
	  depth]; // TODO, hardcoded glyph height size

	qcomp.fsmallconsoletree.trans = qcomp.flargeconsoletree.trans; // position console
 
	qcomp.slidervp.asp = gl.asp;
	qcomp.updateSlider(true);	
	
	qcomp.spherevp.asp = gl.asp;
};

qcomp.exit = function() {
	// free Qfield resources
	qcomp.rcmap.glfree();
	qcomp.rcmapMark.glfree();
	qcomp.qf.glfree();
	qcomp.qf = null; // garbage collect Qfield qf
	
	qcomp.qgcur = null;
	
	// show current usage
	qcomp.roottree.log();
	qcomp.sphereroottree.log();
	logrc();
	logger("after roottree glfree\n");
	qcomp.roottree.glfree();
	qcomp.sphereroottree.glfree();
	
	logger("sliderRoot log\n");
	qcomp.sliderRoot.log();

	qcomp.sliderRoot.glfree();

	// show usage after cleanup
	logrc();
	qcomp.roottree = null;
	qcomp.sphereroottree = null;
	logger("exiting webgl qcomp\n");
	clearbuts('qcomp');

	// remove qcomp from debprint
	debprint.removelist("qcomp");
	
	// free up spriter
	logger("before new sprite package glfree\n");
	logrc();
	qcomp.spriteHandle.glfree();
	qcomp.spriteHandle = null;
		
	// show usage after all cleanups
	logger("after new sprite package glfree\n");
	logrc();
	logger("exiting webgl qcomp\n");
	Tree2.treesort = true; // turn tree sorting back on, default
	globalmat.alphacutoff = qcomp.alphacutoffsave;
	
	mainvp = defaultviewport();

};
