var state10 = {};

// test webgl
var roottree;
var tree0,treef0,treef1,treef2,treef3;
var tree7;
var treetim;

var amod0,amodf0,amodf1a,amodf1b,amodf1c,amodf1d,amodf1big,amodf2,amodf3;
var amod1,amod7;
var amodtim;
var keyteststr;
var keyteststrmaxlength = 32;
var keytest = false;

var manyfonttest = true; // if true then test the 'many' character render of a font

// instructions and info
state10.text = "WebGL: This has 3D fonts and some texture blending shaders.\n" +
			"The 'flycam' interface works in all WebGL states except state 4.\n" +
			"Moving the mouse up and down on the screen effects the blending.";

state10.title = "3D Fonts";

state10.load = function() {
//	if (!gl)
//		return;
	preloadimg("../common/sptpics/font0.png");
	preloadimg("../common/sptpics/font1.png");
	preloadimg("../common/sptpics/font2.png");
	preloadimg("../common/sptpics/font3.png");
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/wonMedal.png");
	preloadimg("../common/sptpics/coin_logo.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadtime(750,false); // test loading screen
};

state10.testvar = {
	s1:31,
	s2:47,
};

state10.init = function() {
	scratchtest();
	//keytest = true;
	keyteststr = "keyteststr";
//	gl_mode(true);
//	if (!gl)
//		return;
	logger("entering webgl state10\n");
	
	frame = 0;
	
// now build trees	
	roottree = new Tree2("root");

	amodf1big = new ModelFont("amodf1big","font3.png","tex",16,32,100,100,true);
	treef1 = new Tree2("amodf1big");
	var depth = glc.clientHeight/2;
	treef1.trans = [0,0,depth];
	//treef1.trans = [-depth,-32*4,depth];
	treef1.setmodel(amodf1big);
	roottree.linkchild(treef1);
	
	amodtim = new ModelFont("amodtim","font3.png","tex",64,64,100,100,true);
	amodtim.print("hey ho!");
	treef1 = new Tree2("amodtim");
	treef1.trans = [-64*7,64,depth];
	treef1.setmodel(amodtim);
	roottree.linkchild(treef1);
	mainvp.trans = [0,0,0]; // flycam
	mainvp.rot = [0,0,0]; // flycam
	//logger_str = "";
	
};

state10.proc = function() {
	
	if (manyfonttest) {
		var docircles = true;
		//var str = "Test string ready to use.";
		var str = "";
		var i,j;
		if (docircles) {
			for (j=0;j<96;++j) {
				for (i=0;i<96;++i) {
					var x = i - 48;
					var y = j - 48;
					var r = Math.floor(Math.sqrt(x*x + y*y));
					str += String.fromCharCode((r + 96*1000000 - frame)%96 + 32);
				}
				str += "\n";
			}
		}
		amodf1big.print(str);
		str = "frm " + frame;
		amodtim.print(str);
	}
	roottree.proc();
	doflycam(mainvp);  // modify the trs of the vp
	beginscene(mainvp);
	roottree.draw();
};

state10.exit = function() {
	roottree.log();
	logrc();
	logger("after roottree glfree\n");
	roottree.glfree();
	logrc();
	roottree = null;
	logger("exiting webgl state10\n");
};
