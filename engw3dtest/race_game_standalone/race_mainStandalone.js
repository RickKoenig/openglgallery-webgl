'use strict';

var race_mainStandalone = {};

race_mainStandalone.text = "WebGL: Race on a constructed track";
race_mainStandalone.title = "race_main_standalone";

race_mainStandalone.buildTextInfo = function () {
	var ftree = new Tree2("info");
	var scratchfontmodel = new ModelFont("infoFont","font0.png","tex",
		1,1,
		60,20,
		true);
	scratchfontmodel.flags |= modelflagenums.NOZBUFFER;
	var str = "Welcome";
	scratchfontmodel.print(str);
    // make pixel perfect
    ftree.trans = [-gl.asp, 1, 0];
    ftree.scale = [
        16 * 2 / glc.clientHeight * .5,
        32 * 2 / glc.clientHeight * .5,
        1
    ];
	ftree.setmodel(scratchfontmodel);
	return ftree;
};

race_mainStandalone.updateInfo = function(str) {
    race_mainStandalone.infoTree.mod.print(str);
};

race_mainStandalone.changeCameraView = function() {
    switch(race_mainStandalone.curCameraType) {
    case race_mainStandalone.cameraTypeEnums.static:
        mainvp.incamattach = false;
        race_mainStandalone.rotCam = false;
        viewportClearRotTrans(mainvp);
        break;
    case race_mainStandalone.cameraTypeEnums.scroll:
        mainvp.incamattach = true;
        race_mainStandalone.rotCam = false;
        viewportClearRotTrans(mainvp);
        break;
    case race_mainStandalone.cameraTypeEnums.rotScroll:
        mainvp.incamattach = true;
        race_mainStandalone.rotCam = true;
        viewportClearRotTrans(mainvp);
        break;
    case race_mainStandalone.cameraTypeEnums.view3D:
        mainvp.trans = [0, -1.23, .475];
        mainvp.rot = [-1.25, 0, 0];
        break;
    }
};

// model to view
race_mainStandalone.m2v = function(i) {
    race_mainStandalone.carTreeTranss[i].trans = race_mainStandalone.carModels[i].pos.slice(); // update view
    if (race_mainStandalone.rotCam) {
        race_mainStandalone.carTreeTranss[i].rot[2] = -race_mainStandalone.carModels[i].dir; // update view
        race_mainStandalone.carTreeRots[i].rot[2] = 0; // update view
    } else {
        race_mainStandalone.carTreeTranss[i].rot[2] = 0; // update view
        race_mainStandalone.carTreeRots[i].rot[2] = -race_mainStandalone.carModels[i].dir; // update view
    }
};

// load these before init
race_mainStandalone.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
	preloadimg("../common/sptpics/take0016.jpg");
	preloadimg("track/4pl_tile01.jpg");
	preloadimg("track/grass.jpg");
	preloadimg("track/sanddbl.jpg");
};

race_mainStandalone.init = function() {
    // build track piece trees
	logger("entering webgl race_track\n");
	// ui
	setbutsname('race_track_buts');
    // tree root
    race_mainStandalone.roottree = new Tree2("root");
    race_mainStandalone.roottree.trans = [0, 0, 1]; // move scene out a little for good camera shot
    race_mainStandalone.inforoottree = new Tree2("inforoot");
    race_mainStandalone.inforoottree.trans = [0, 0, 1]; // move scene out a little for good camera shot

    // make the track
    const track = race_track.buildtrack(race_trackData.race_track1);
    race_mainStandalone.trackInfo = track.info;
    race_mainStandalone.roottree.linkchild(track.tree);
    // make info text
    race_mainStandalone.infoTree = race_mainStandalone.buildTextInfo();
    race_mainStandalone.inforoottree.linkchild(race_mainStandalone.infoTree);
    // make the car
    race_mainStandalone.numPlayers = 16;
    race_mainStandalone.curPlayer = 0;
    race_mainStandalone.carModels = [];
    race_mainStandalone.carTreeRots = [];
    race_mainStandalone.carTreeTranss = [];
    race_mainStandalone.carTreeAttachs = [];
    for (let i = 0; i < race_mainStandalone.numPlayers; ++i) {
        const car = race_car.buildCar(i, race_mainStandalone.numPlayers);
        race_mainStandalone.carModels.push(car.model); // mvc
        race_mainStandalone.carTreeRots.push(car.treeRot); // camera rigging
        race_mainStandalone.carTreeTranss.push(car.treeTrans); // camera rigging
        race_mainStandalone.carTreeAttachs.push(car.attachTree); // camera rigging
        race_mainStandalone.roottree.linkchild(car.tree);
    }

    // main viewport
	mainvp = defaultviewport();	
    // camera types (views)
    mainvp.camattach = race_mainStandalone.carTreeAttachs[race_mainStandalone.curPlayer];
    race_mainStandalone.cameraTypeStrs = [
        "static",
        "scroll",
        "rotScroll",
        "view3D",
    ];
    race_mainStandalone.cameraTypeEnums = makeEnum(race_mainStandalone.cameraTypeStrs);
    race_mainStandalone.curCameraType = race_mainStandalone.cameraTypeEnums.scroll;
    race_mainStandalone.cameraZoom = .5;
    race_mainStandalone.changeCameraView();
	mainvp.clearcolor = [.125,.5,.75,1];

    // info viewport
    race_mainStandalone.infovp = defaultviewport();
    race_mainStandalone.infovp.clearflags = 0; // already cleared from mainvp

    // add a test debprint
    race_mainStandalone.debvars = {
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
        "race_mainStandalone.rotCam",
        "race_mainStandalone.curCameraType",
        "race_mainStandalone.debvars"
    ]);
};

race_mainStandalone.proc = function() {
    // input
    // change view
    if (input.key == 'v'.charCodeAt()) {
        race_mainStandalone.curCameraType = (race_mainStandalone.curCameraType + 1) % race_mainStandalone.cameraTypeStrs.length;
        race_mainStandalone.changeCameraView();
    }
    // change zoom
    if (race_mainStandalone.curCameraType != race_mainStandalone.cameraTypeEnums.view3D) {
        let delta = input.wheelDelta; // new with chrome, they now have non integer values
        //console.log("wheel delta = " + delta);
        const zf = 1.1;
        let watch = 0;
        while(delta) {
            if (watch > 20) {
                console.log("watch hit!!");
                break;
            }
            if (delta > 0) {
                race_mainStandalone.cameraZoom *= zf;
                --delta;
            } else if (delta < 0) {
                race_mainStandalone.cameraZoom /= zf;
                ++delta;
            }
            ++watch;
        }
        race_mainStandalone.cameraZoom = range(1 / 8, race_mainStandalone.cameraZoom, 8);
        mainvp.zoom = race_mainStandalone.cameraZoom;
    } else {
        mainvp.zoom = 2;
    }

    // change car view control
    let changeCarView = 0;
    if (input.key == ']'.charCodeAt()) {
        changeCarView = 1;
    } else if (input.key == '['.charCodeAt()) {
        changeCarView = -1;
    }
    if (changeCarView) {
        race_mainStandalone.curPlayer 
            = (race_mainStandalone.curPlayer + race_mainStandalone.numPlayers + changeCarView) 
            % race_mainStandalone.numPlayers;
        mainvp.camattach = race_mainStandalone.carTreeAttachs[race_mainStandalone.curPlayer];
    }

	// proc
    race_car.procCars(race_mainStandalone.carModels, race_mainStandalone.curPlayer); // input for car 0
    for (let i = 0; i < race_mainStandalone.numPlayers; ++i) {
        race_mainStandalone.m2v(i); // model to view
    }
    const carModel = race_mainStandalone.carModels[race_mainStandalone.curPlayer];
    race_mainStandalone.updateInfo("car " + race_mainStandalone.curPlayer
        + ", mode = " + race_car.modeStrs[carModel.mode]
        + ", speed = " + (carModel.speed * 5000).toFixed(1)
        + ", dir = " + carModel.dir.toFixed(3));
	doflycam(mainvp); // modify the trs of vp using flycam

	// draw main
	beginscene(mainvp);
	race_mainStandalone.roottree.draw();
    // draw info
	beginscene(race_mainStandalone.infovp);
	race_mainStandalone.inforoottree.draw();
};

race_mainStandalone.exit = function() {
    // ui
	debprint.removelist("race_track_debug");
	clearbuts('race_track_buts');
	// show current usage
	race_mainStandalone.roottree.log();
	race_mainStandalone.inforoottree.log();
	logrc();
	// show usage after cleanup
	race_mainStandalone.roottree.glfree();
	race_mainStandalone.inforoottree.glfree();
	logger("after roottree glfree\n");
	logrc();
	race_mainStandalone.roottree = null;
	logger("exiting webgl race_track\n");
};
