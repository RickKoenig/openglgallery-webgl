'use strict';

var race_track = {};

race_track.text = "WebGL: Track constructor and builder";
race_track.title = "race_track";

// trees
race_track.roottree; // 3d
race_track.infoTree; // info
race_track.trackRoot; // tree
race_track.trackInfo; // static model, start pos, dimensions
race_track.trackA; // track data
race_track.carTreeRot;
race_track.carTreeTrans;
race_track.depth = 4.2; // how far away from track to be, camera

// test moving object (car)
race_track.carModel;

// utils
race_track.mapUVs = function(mesh) {
    mesh.uvs = [];
    for (let i = 0; i < mesh.verts.length; i += 3) {
        const x = mesh.verts[i];
        const y = mesh.verts[i + 1];
        const u = .5 * x + .5;
        const v = -.5 * y + .5;
        mesh.uvs.push(u);
        mesh.uvs.push(v);
    }
};

// in place, 0 to 3 is the same as 0 to 270, clockwise
race_track.rotateVert = function(outVerts, inVerts, offset, rot) {
    if (!rot) {
        outVerts[0] = inVerts[0];
        outVerts[1] = inVerts[1];
        return;
    }
    rot &= 3;
    const xi = inVerts[offset];
    const yi = inVerts[offset + 1];
    let xo, yo;
    switch(rot) {
        case 1:
            xo = yi;
            yo = -xi;
            break;
        case 2:
            xo = -xi;
            yo = -yi;
            break;
        case 3:
            xo = -yi;
            yo = xi;
            break;
    }
    outVerts[offset] = xo;
    outVerts[offset + 1] = yo;
};

// rotation axis, but only 0, 90, 180, 270 degrees,  0 to 3 is the same as 0 to 270
race_track.rotateVerts = function(verts, rot) {
    if (!rot) return;
    rot &= 3;
    for (let i = 0; i < verts.length; i+= 3) {
        race_track.rotateVert(verts, verts, i, rot);
    }
};
// end utils

race_track.buildtrack = function(trackData) {
    const trackRoot = new Tree2("trackRoot");
    const width = trackData[0].length;
    const height = trackData.length;
    for (let j = 0; j < height; ++j) {
        for (let i = 0; i < width; ++i) {
            const piece = trackData[j][i];
            const pieceBuildFun = race_track.funcs[piece.type];
            if (pieceBuildFun) {
                const pieceTree = pieceBuildFun(piece.rot);
                const trans = [
                    2 * i - width + 1,
                    -2 * j + height - 1,
                    0
                ];
                pieceTree.trans = trans;
                trackRoot.linkchild(pieceTree);
            }
        }
    }
    const minPos = [-width, -height, 0];
    const maxPos = [width, height, 0];
    const startPos = [0, 0, 0];
    return {
        tree: trackRoot,
        info: {
            minPos: minPos,
            maxPos: maxPos,
            startPos: startPos
        }
    };
};

race_track.collideTrack = function(trackData, pos) {
    const trackWidth = trackData[0].length;
    const trackHeight = trackData.length;
    // piece index and offset
    let fx = pos[0] / 2 + trackWidth / 2;
    let fy = -pos[1] / 2 + trackHeight / 2;
    const ix = Math.floor(fx);
    const iy = Math.floor(fy);
    fx -= ix;
    fy -= iy;
    fx = 2 * fx - 1;
    fy = 1 - 2 * fy;
    // check bounds, make blank if out of bounds
    let pieceEnum;
    let pieceRot;
    if (ix >=0 && ix < trackWidth && iy >= 0 && iy < trackHeight) {
        const pce = trackData[iy][ix];
        pieceEnum = pce.type;
        pieceRot = pce.rot;
    } else { // center on blank
        pieceEnum = race_track.trackTypeEnums.blank;
        pieceRot = 0;
        fx = fy = 0;
    }

    const collInfo = {
        pieceData: {
            name: race_track.trackTypeStrs[pieceEnum],
            rot: pieceRot
        },
        pieceIdx: [ix, iy],
        pieceOffset: [fx, fy],
        collidePos: null,
        collide: false
    }
    // collide with different piece types
    const pop = Array(2); // piece offset piece space 
    race_track.rotateVert(pop, collInfo.pieceOffset, 0, -pieceRot);
    const border = .5; // between grass and pavement
    switch(pieceEnum) {
        case race_track.trackTypeEnums.blank:
            collInfo.collide = true;
            collInfo.collidePos = [0, 0];
            break;
        case race_track.trackTypeEnums.straight:
        case race_track.trackTypeEnums.startFinish:
            if ( pop[1] < -border || pop[1] > border) {
                pop[1] = range(-border, pop[1], border);
                collInfo.collide = true;
            }
            break;
        case race_track.trackTypeEnums.turn:
            const popTurn = [pop[0] + 1, pop[1] + 1]; // from -1,-1 lower right corner
            const distSq = popTurn[0] * popTurn[0] + popTurn[1] * popTurn[1];
            const minTurn = 1 - border;
            const maxTurn = 1 + border;
            const minTurnSq = minTurn * minTurn;
            const maxTurnSq = maxTurn * maxTurn;
            if (distSq < minTurnSq) {
                collInfo.collide = true;
                vec2.Cnormalize(popTurn, popTurn);
                pop[0] = popTurn[0] * minTurn - 1;
                pop[1] = popTurn[1] * minTurn - 1;
            } else if (distSq > maxTurnSq) {
                collInfo.collide = true;
                vec2.Cnormalize(popTurn, popTurn);
                pop[0] = popTurn[0] * maxTurn - 1;
                pop[1] = popTurn[1] * maxTurn - 1;
            }
            break;
    }
    // move collide pos back to track space
    if (collInfo.collide) {
        race_track.rotateVert(pop, pop, 0, pieceRot);
        collInfo.collidePos = [
            -trackWidth + 1 + 2 * ix + pop[0],
            trackHeight - 1 - 2 * iy + pop[1]
        ];
    }
    return collInfo;
};

race_track.buildTextInfo = function () {
	var ftree = new Tree2("info");
	var scratchfontmodel = new ModelFont("infoFont","font0.png","tex",
		1,1,
		60,20,
		true);
	scratchfontmodel.flags |= modelflagenums.NOZBUFFER;
	var str = "Welcome";
	scratchfontmodel.print(str);
    // make pixel perfect
    ftree.trans = [-race_track.depth * gl.asp, race_track.depth, 0];
    ftree.scale = [
        race_track.depth * 16 * 2 / glc.clientHeight * .5,
        race_track.depth * 32 * 2 / glc.clientHeight * .5,
        1
    ];
	ftree.setmodel(scratchfontmodel);
	return ftree;
};

race_track.updateInfo = function(obj) {
    race_track.infoTree.mod.print(JSON.stringify(obj, null, "   "));
};

// returns object with tree info and a 'model' mvc
race_track.buildCar = function(root) {
    const carSize = .1875;
    // body
    const bodyTree = buildprism("carBody", [1, 2, 1], "Bark.png", "tex");
    bodyTree.scale = [.5 * carSize, .5 * carSize, .2 * carSize];
    // wedge
    const wedgeVerts = [
        1, -2, 1,
        -1, -2, 1,
        0, 2, 1,
        1, -2, -1,
        -1, -2, -1,
        0, 2, -1,
    ];
    const wedgeFaces = [
        0, 3, 2,
        2, 3, 5,
        2, 5, 1,
        1, 5, 4,
        1, 4, 0,
        0, 4, 3,
        0, 2, 1,
        3, 4, 5
    ];
    const wedgeMesh = {
        "verts": wedgeVerts,
        "faces": wedgeFaces
    };
    const wedgeModel = buildMeshModel("carWedge", null, "flat", wedgeMesh);
    wedgeModel.mat.color = [.5, 0, 0, 1];
    const wedgeTree = new Tree2("carWedge");
    wedgeTree.setmodel(wedgeModel);
    wedgeTree.scale = [.45 * carSize, .45 * carSize, .3 * carSize];
    // whole car rot
    const wholeCarRot = new Tree2("carWholeRot");
    wholeCarRot.linkchild(bodyTree);
    wholeCarRot.linkchild(wedgeTree);
    const carAttach = new Tree2("carAttach");
    carAttach.trans = [0, 0, -3];
    // whole car trans
    const wholeCarTrans = new Tree2("carWholeTrans");
    wholeCarTrans.linkchild(wholeCarRot);
    wholeCarTrans.linkchild(carAttach);
    // tie model and view together
    const car = { // model and some trees
        model: {
            pos: [-2.5, -3, 0], // hard coded
            speed: 0,
            dir: CMath.PI * .5,
        },
        treeRot: wholeCarRot, // THIS, don't rotate screen with car
        treeTrans: wholeCarTrans, // OR THIS, rotate screen with car
        attachTree: carAttach
    }
    car.treeTrans.trans = car.model.pos.slice();
    car.treeRot.rot = [0, 0, 0];
    car.treeTrans.rot = [0, 0, 0];
    // hook to parent
    root.linkchild(wholeCarTrans);
    return car;
};

race_track.procCar = function() {
    const dirStep = 1.5;
    const topSpeed = 1 / 32;
    const topRevSpeed = -1 / 64;
    const accel = topSpeed / 128;
    const coast = -topSpeed / 512;
    const brake = -topSpeed / 64;
    // move around with keyboard
    if (input.keystate[keycodes.UP]) { // accel
        race_track.carModel.speed += accel;
    } else if (input.keystate[keycodes.DOWN]) { // brake/reverse
        race_track.carModel.speed += brake;
    } else { // coast
        if (race_track.carModel.speed > 0) {
            race_track.carModel.speed += coast;
            if (race_track.carModel.speed < 0) {
                race_track.carModel.speed = 0;
            }
        } else if (race_track.carModel.speed < 0) {
            race_track.carModel.speed -= coast;
            if (race_track.carModel.speed > 0) {
                race_track.carModel.speed = 0;
            }
        }
    }
    race_track.carModel.speed = range(topRevSpeed, race_track.carModel.speed, topSpeed);
    if (input.keystate[keycodes.LEFT]) {
        race_track.carModel.dir -= dirStep * race_track.carModel.speed;
        race_track.carModel.dir = normalangrad(race_track.carModel.dir);
    }
    if (input.keystate[keycodes.RIGHT]) {
        race_track.carModel.dir += dirStep * race_track.carModel.speed;
        race_track.carModel.dir = normalangrad(race_track.carModel.dir);
    }
    const stepX = race_track.carModel.speed * CMath.sin(race_track.carModel.dir);
    const stepY = race_track.carModel.speed * CMath.cos(race_track.carModel.dir);
    race_track.carModel.pos[0] += stepX;
    race_track.carModel.pos[1] += stepY;

    // don't move out of entire track area
    const extra = .25;
    race_track.carModel.pos[0] = range(
        race_track.trackInfo.minPos[0] - extra,
        race_track.carModel.pos[0],
        race_track.trackInfo.maxPos[0] + extra);
    race_track.carModel.pos[1] = range(
        race_track.trackInfo.minPos[1] - extra,
        race_track.carModel.pos[1],
        race_track.trackInfo.maxPos[1] + extra);
    // don't move out of the pavement
    const collInfo = race_track.collideTrack(race_track.trackAData ,race_track.carModel.pos);
    if (collInfo.collide) {
        race_track.carModel.pos[0] = collInfo.collidePos[0];
        race_track.carModel.pos[1] = collInfo.collidePos[1];
    }
};

race_track.m2v = function() {
    race_track.carTreeTrans.trans = race_track.carModel.pos.slice(); // update view
    if (race_track.rotCam) {
        race_track.carTreeRot.rot[2] = 0; // update view
        race_track.carTreeTrans.rot[2] = -race_track.carModel.dir; // update view
    } else {
        race_track.carTreeRot.rot[2] = -race_track.carModel.dir; // update view
        race_track.carTreeTrans.rot[2] = 0; // update view
    }
};

// load these before init
race_track.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
	preloadimg("../common/sptpics/take0016.jpg");
	preloadimg("track/4pl_tile01.jpg");
	preloadimg("track/grass.jpg");
	preloadimg("track/sanddbl.jpg");
};

race_track.init = function() {
    // track piece names
    race_track.trackTypeStrs = [
        "blank",
        "straight",
        "turn",
        "startFinish",
    ];
    race_track.trackTypeEnums = makeEnum(race_track.trackTypeStrs);
    // build track piece trees
    race_track.funcs = [
        raceGetBlank,
        raceGetStraight,
        raceGetTurn,
        raceGetStartFinish,
    ];
    const types = race_track.trackTypeEnums;
    race_track.trackAData = [
        [
            {type: types.blank, rot: 0},
            {type: types.blank, rot: 0},
            {type: types.turn, rot: 3},
            {type: types.straight, rot: 0},
            {type: types.turn, rot: 0},
        ],
        [
            {type: types.turn, rot: 3},
            {type: types.straight, rot: 0},
            {type: types.turn, rot: 1},
            {type: types.turn, rot: 3},
            {type: types.turn, rot: 1},
        ],
        [
            {type: types.straight, rot: 1},
            {type: types.blank, rot: 0},
            {type: types.blank, rot: 0},
            {type: types.straight, rot: 1},
            {type: types.blank, rot: 0},
        ],
        [
            {type: types.turn, rot: 2},
            {type: types.startFinish, rot: 0},
            {type: types.straight, rot: 0},
            {type: types.turn, rot: 1},
            {type: types.blank, rot: 0},
        ],
    ];
	logger("entering webgl race_track\n");
	// ui
	setbutsname('race_track_buts');
    // tree root
    race_track.roottree = new Tree2("root");
    race_track.roottree.trans = [0, 0, race_track.depth]; // move scene out a little for good camera shot
    race_track.inforoottree = new Tree2("inforoot");
    race_track.inforoottree.trans = [0, 0, race_track.depth]; // move scene out a little for good camera shot

    // make the track
    const track = race_track.buildtrack(race_track.trackAData);
    race_track.trackRoot = track.tree;
    race_track.roottree.linkchild(race_track.trackRoot);
    race_track.trackInfo = track.info;
    // make info text
    race_track.infoTree = race_track.buildTextInfo();
    race_track.inforoottree.linkchild(race_track.infoTree);
    // make the car
    const car = race_track.buildCar(race_track.roottree);
    race_track.carModel = car.model; // mvc
    race_track.carTreeRot = car.treeRot; // camera rigging
    race_track.carTreeTrans = car.treeTrans; // camera rigging
        
    // camera viewport
	mainvp = defaultviewport();	
    mainvp.camattach = car.attachTree;
    mainvp.incamattach = true;
    race_track.rotCam = false;
	mainvp.clearcolor = [.125,.5,.75,1];

    race_track.infovp = defaultviewport();
    race_track.infovp.clearflags = 0; // already cleared from mainvp

    // add a test debprint
    race_track.debvars = {
        testarr: [3,4,[5,7],6],
        testarr2: [3,4,[5,7],6],
        testobj: {"hi":40,"ho":[50,99]},
        testBool: true,
        testStr: "hi",
        testNan: NaN,
        testInf: Infinity,
        testNull: null,
        testund: undefined
    };
    debprint.addlist("race_track_debug",[
        "mainvp.incamattach",
        "race_track.rotCam",
        "race_track.debvars"
    ]);
};

race_track.proc = function() {
    //input
    if (input.key == 'v'.charCodeAt()) {
        if (race_track.rotCam) {
            race_track.rotCam = false;
            mainvp.incamattach = false;
        } else if (mainvp.incamattach) {
            race_track.rotCam = true;
        } else {
            mainvp.incamattach = true;
        }
    }
	// proc
    race_track.procCar();
    race_track.m2v();
    race_track.updateInfo("car speed = " + (race_track.carModel.speed * 5000).toFixed(1));
	doflycam(mainvp); // modify the trs of vp using flycam
	// draw
	beginscene(mainvp);
	race_track.roottree.draw();
	beginscene(race_track.infovp);
	race_track.inforoottree.draw();
};

race_track.exit = function() {
    // ui
	debprint.removelist("race_track_debug");
	clearbuts('race_track_buts');
	// show current usage
	race_track.roottree.log();
	race_track.inforoottree.log();
	logrc();
	// show usage after cleanup
	race_track.roottree.glfree();
	race_track.inforoottree.glfree();
	logger("after roottree glfree\n");
	logrc();
	race_track.roottree = null;
	logger("exiting webgl race_track\n");
};
