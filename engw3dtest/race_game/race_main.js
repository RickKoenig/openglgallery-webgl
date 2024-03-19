'use strict';

var race_main = {};

race_main.text = "WebGL: Race on a constructed track";
race_main.title = "race_main";

race_main.depth = 4.2; // how far away from track to be, camera

race_main.buildTextInfo = function () {
	var ftree = new Tree2("info");
	var scratchfontmodel = new ModelFont("infoFont","font0.png","tex",
		1,1,
		60,20,
		true);
	scratchfontmodel.flags |= modelflagenums.NOZBUFFER;
	var str = "Welcome";
	scratchfontmodel.print(str);
    // make pixel perfect
    ftree.trans = [-race_main.depth * gl.asp, race_main.depth, 0];
    ftree.scale = [
        race_main.depth * 16 * 2 / glc.clientHeight * .5,
        race_main.depth * 32 * 2 / glc.clientHeight * .5,
        1
    ];
	ftree.setmodel(scratchfontmodel);
	return ftree;
};

race_main.updateInfo = function(str) {
    race_main.infoTree.mod.print(str);
};

// model to view
race_main.m2v = function() {
    race_main.carTreeTrans.trans = race_main.carModel.pos.slice(); // update view
    if (race_main.rotCam) {
        race_main.carTreeRot.rot[2] = 0; // update view
        race_main.carTreeTrans.rot[2] = -race_main.carModel.dir; // update view
    } else {
        race_main.carTreeRot.rot[2] = -race_main.carModel.dir; // update view
        race_main.carTreeTrans.rot[2] = 0; // update view
    }
};

// load these before init
race_main.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
	preloadimg("../common/sptpics/take0016.jpg");
	preloadimg("track/4pl_tile01.jpg");
	preloadimg("track/grass.jpg");
	preloadimg("track/sanddbl.jpg");
};

race_main.init = function() {
    // build track piece trees
	logger("entering webgl race_track\n");
	// ui
	setbutsname('race_track_buts');
    // tree root
    race_main.roottree = new Tree2("root");
    race_main.roottree.trans = [0, 0, race_main.depth]; // move scene out a little for good camera shot
    race_main.inforoottree = new Tree2("inforoot");
    race_main.inforoottree.trans = [0, 0, race_main.depth]; // move scene out a little for good camera shot

    // make the track
    const track = race_track.buildtrack(race_trackData.race_track1);
    race_main.trackInfo = track.info;
    race_main.roottree.linkchild(track.tree);
    // make info text
    race_main.infoTree = race_main.buildTextInfo();
    race_main.inforoottree.linkchild(race_main.infoTree);
    // make the car
    const car = race_car.buildCar();
    race_main.carModel = car.model; // mvc
    race_main.carTreeRot = car.treeRot; // camera rigging
    race_main.carTreeTrans = car.treeTrans; // camera rigging
    race_main.roottree.linkchild(car.tree);    

    // main viewport
	mainvp = defaultviewport();	
    mainvp.camattach = car.attachTree;
    mainvp.incamattach = true;
    race_main.rotCam = false;
	mainvp.clearcolor = [.125,.5,.75,1];
    // info viewport
    race_main.infovp = defaultviewport();
    race_main.infovp.clearflags = 0; // already cleared from mainvp

    // add a test debprint
    race_main.debvars = {
        testarr: [3,4,[5,7],6],
        testarr2: [3,4,[5,7],6],
        testobj: {"hi":40,"ho":[50,99,{abc: "def"}]},
        testBool: true,
        testStr: "hi",
        testNan: NaN,
        testInf: Infinity,
        testNull: null,
        testund: undefined
    };
    debprint.addlist("race_track_debug",[
        "mainvp.incamattach",
        "race_main.rotCam",
        "race_main.debvars"
    ]);
};

race_main.proc = function() {
    //input
    if (input.key == 'v'.charCodeAt()) {
        if (race_main.rotCam) {
            race_main.rotCam = false;
            mainvp.incamattach = false;
        } else if (mainvp.incamattach) {
            race_main.rotCam = true;
        } else {
            mainvp.incamattach = true;
        }
    }

	// proc
    race_car.procCar(race_main.carModel);
    race_main.m2v(); // model to view
    race_main.updateInfo("car speed = " + (race_main.carModel.speed * 5000).toFixed(1));
	doflycam(mainvp); // modify the trs of vp using flycam

	// draw main
	beginscene(mainvp);
	race_main.roottree.draw();
    // draw info
	beginscene(race_main.infovp);
	race_main.inforoottree.draw();
};

race_main.exit = function() {
    // ui
	debprint.removelist("race_track_debug");
	clearbuts('race_track_buts');
	// show current usage
	race_main.roottree.log();
	race_main.inforoottree.log();
	logrc();
	// show usage after cleanup
	race_main.roottree.glfree();
	race_main.inforoottree.glfree();
	logger("after roottree glfree\n");
	logrc();
	race_main.roottree = null;
	logger("exiting webgl race_track\n");
};
