'use strict';

var race_track = {};

race_track.text = "WebGL: Track constructor and builder";
race_track.title = "race_track";

// trees
race_track.roottree;
race_track.trackRoot;
race_track.trackInfo; // start pos, dimensions
race_track.trackA; // track data
race_track.carTree;
race_track.depth = 4.2; // how far away from track to be, camera

race_track.debvars = {
	testarr:[3,4,[5,7],6],
	testobj:{"hi":40,"ho":[50,99]},
    testBool:true,
    testStr:"hi",
    testNan: NaN,
    testInf: Infinity,
    testNull: null,
    testund: undefined
};

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
}

// 0 to 3 is the same as 0 to 270
race_track.rotateVerts = function(verts, rot) {
    if (!rot) return;
    rot &= 3;
    for (let i = 0; i < verts.length; i+= 3) {
        race_track.rotateVert(verts, verts, i, rot);
    }
}
// end utils

race_track.buildtrack = function(trackData) {
    const trackRoot = new Tree2("trackRoot");
    const width = trackData[0].length;
    const height = trackData.length;
    for (let j = 0; j < height; ++j) {
        for (let i = 0; i < width; ++i) {
            const piece = trackData[j][i];
            const fun = race_track.funcs[piece.type];
            if (fun) {
                const pieceTree = fun(piece.rot);
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
}

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
}

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
    race_track.infoTree.mod.print("info obj = " + JSON.stringify(obj, null, "   "));
}


race_track.buildCar = function(root) {
    const carSize = .1875;
    const carRoot = new Tree2("carRoot");
    const wholeCar = new Tree2("carWhole");
    // test sphere
    //const carTree = buildsphere("carSphere", 1, "maptestnck.png", "texc");
    //carTree.scale = [carSize, carSize, .2 * carSize];
    //carRoot.linkchild(carTree);
    // body
    const carTree = buildprism("carBody", [1, 2, 1], "Bark.png", "tex");
    carTree.scale = [.5 * carSize, .5 * carSize, .2 * carSize];
    wholeCar.linkchild(carTree);
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
    wholeCar.linkchild(wedgeTree);
    carRoot.linkchild(wholeCar);
    const carAttach = new Tree2("carAttach");
    carAttach.trans = [0, 0, -3];
    const lookCar = new Tree2("lookCar");
    lookCar.linkchild(carAttach);
    carRoot.linkchild(lookCar);
    // tie model and view together
    const car = {
        model: {
            pos: [-2.5, -3, 0],
            dir: CMath.PI * .5,
            //desiredPos: null
        },
        tree: wholeCar,
        attachTree: carAttach
    }
    wholeCar.trans = car.model.pos.slice();
    wholeCar.rot = [0, 0, -car.model.dir];
    root.linkchild(carRoot);
    return car;
}

race_track.procCar = function() {
    //return;
    const step = 1 / 32;
    // move around
    // with mouse
    /*if (input.mclick[0]) {
        
        race_track.carModel.desiredPos = [
            input.fmx * race_track.depth,
            input.fmy * race_track.depth
        ];
    }*/
    // with keyboard
    if (input.keystate[keycodes.RIGHT]) {
        race_track.carModel.pos[0] += step;
        //race_track.carModel.desiredPos = null;
    }
    if (input.keystate[keycodes.LEFT]) {
        race_track.carModel.pos[0] -= step;
        //race_track.carModel.desiredPos = null;
    }
    if (input.keystate[keycodes.UP]) {
        race_track.carModel.pos[1] += step;
        //race_track.carModel.desiredPos = null;
    }
    if (input.keystate[keycodes.DOWN]) {
        race_track.carModel.pos[1] -= step;
        //race_track.carModel.desiredPos = null;
    }
    // mouse, move to desiredPos
    /*
    if (race_track.carModel.desiredPos) {
        const close2 = step * step * 2;
        const dist2 = vec2.sqrDist(race_track.carModel.desiredPos, race_track.carModel.pos);
        if (dist2 < close2) {
            vec2.copy(race_track.carModel.pos, race_track.carModel.desiredPos);
            race_track.carModel.desiredPos = null;
        } else {
            const delta = vec2.create();
            vec2.sub(delta, race_track.carModel.desiredPos, race_track.carModel.pos);
            vec2.normalize(delta, delta);
            vec2.scale(delta, delta, step);
            vec2.add(race_track.carModel.pos, race_track.carModel.pos, delta);
        }
    }*/
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
    race_track.carTree.trans = race_track.carModel.pos.slice(); // update view
    }

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
    race_track.trackTypeStrs = [
        "blank",
        "straight",
        "turn",
        "startFinish",
    ];
    race_track.trackTypeEnums = makeEnum(race_track.trackTypeStrs);
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
    race_track.carModel = car.model;
    race_track.carTree = car.tree;
    //race_track.roottree.linkchild(car.tree);
        
    // camera viewport
	mainvp = defaultviewport();	
    mainvp.camattach = car.attachTree;
    //mainvp.incamattach = true;
    //mainvp.trans = [-2.57, -2.8, 3.31];
	mainvp.clearcolor = [.125,.5,.75,1];

    race_track.infovp = defaultviewport();
    race_track.infovp.clearflags = 0;
    //clearflags:gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,

    // add a test debprint
	debprint.addlist("race_track_debug",["race_track.debvars"]);
};

race_track.proc = function() {
	// proc
    race_track.procCar();
    const collInfo = race_track.collideTrack(race_track.trackAData ,race_track.carModel.pos);
    if (collInfo.collide) {
        race_track.carModel.pos[0] = collInfo.collidePos[0];
        race_track.carModel.pos[1] = collInfo.collidePos[1];
    }
/*    race_track.carTree.children[0].mat.color = collInfo.collide
        ? [1, 0, 0, 1] 
        : [1, 1, 1, 1]; */
    race_track.updateInfo("hi");
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
