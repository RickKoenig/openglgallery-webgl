'use strict';

var race_track = {};

race_track.text = "WebGL: Track constructor and builder";
race_track.title = "race_track";

// trees
race_track.roottree;
race_track.multiTree;
race_track.datatexTree;
race_track.trackRoot;
race_track.trackInfo; // start pos, dimensions
race_track.trackA; // data
race_track.carTree;
race_track.depth = 4.2;

// data texture
race_track.datatex; // data texture

race_track.debvars = {
	testarr:[3,4,[5,7],6],
	testobj:{"hi":40,"ho":[50,99]},
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

// 0 to 3 is the same as 0 to 270
race_track.rotateVerts = function(verts, rot) {
    if (!rot) return;
    rot &= 3;
    switch(rot) {
        case 1:
            for (let i = 0; i < verts.length; i+= 3) {
                const xi = verts[i];
                const yi = verts[i + 1];
                const xo = yi;
                const yo = -xi;
                verts[i] = xo;
                verts[i + 1] = yo;
            }
            break;
        case 2:
            for (let i = 0; i < verts.length; i+= 3) {
                const xi = verts[i];
                const yi = verts[i + 1];
                const xo = -xi;
                const yo = -yi;
                verts[i] = xo;
                verts[i + 1] = yo;
            }
            break;
        case 3:
            for (let i = 0; i < verts.length; i+= 3) {
                const xi = verts[i];
                const yi = verts[i + 1];
                const xo = -yi;
                const yo = xi;
                verts[i] = xo;
                verts[i + 1] = yo;
            }
            break;
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
    const collInfo = {
        boo: "hoo",
        pos: pos,
        collide: pos[0] >= 0
    }
    return collInfo;
}

race_track.buildInfo = function () {
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
    //const carPos = race_track.carModel.pos;
    //race_track.infoTree.mod.print("car pos = (" + carPos[0].toFixed(3) + ", " + carPos[1].toFixed(3) + ")");
    race_track.infoTree.mod.print("info obj = " + JSON.stringify(obj, null, "   "));
}


race_track.buildCar = function() {
    const carTree = buildsphere("car", .1875, "maptestnck.png", "texc");
    carTree.scale = [1, 1, .1];
    const car = {
        model: {
            pos: [2, 1, 0]
        },
        tree: carTree
    }
    carTree.trans = car.model.pos;
    return car;
}

race_track.procCar = function() {
    // move around
    const step = .03125; //.0625;
    if (input.keystate[keycodes.RIGHT])
        race_track.carModel.pos[0] += step;
    if (input.keystate[keycodes.LEFT])
    race_track.carModel.pos[0] -= step;
    if (input.keystate[keycodes.UP])
    race_track.carModel.pos[1] += step;
    if (input.keystate[keycodes.DOWN]) {
        race_track.carModel.pos[1] -= step;
    }
    // don't move out of track area
    race_track.carModel.pos[0] = range(
        race_track.trackInfo.minPos[0],
        race_track.carModel.pos[0],
        race_track.trackInfo.maxPos[0]);
    race_track.carModel.pos[1] = range(
        race_track.trackInfo.minPos[1],
        race_track.carModel.pos[1],
        race_track.trackInfo.maxPos[1]);
    //race_track.carTree.trans = race_track.carModel.pos;
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
    race_track.types = makeEnum([
        "blank",
        "straight",
        "turn",
        "startFinish",
    ]);
    race_track.funcs = [
        raceGetBlank,
        raceGetStraight,
        raceGetTurn,
        raceGetStartFinish,
    ];
    const types = race_track.types;
    race_track.trackAData = [
        [
            {type: types.blank, rot: 0},
            {type: types.turn, rot: 3},
            {type: types.straight, rot: 0},
            {type: types.turn, rot: 0},
            {type: types.blank, rot: 0},
        ],
        [
            {type: types.blank, rot: 0},
            {type: types.straight, rot: 1},
            {type: types.blank, rot: 0},
            {type: types.straight, rot: 1},
            {type: types.blank, rot: 0},
        ],
        [
            {type: types.turn, rot: 3},
            {type: types.turn, rot: 1},
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
    race_track.roottree.trans = [0, 0, race_track.depth];

    // data texture tree
    race_track.datatexTree = raceGetDataTex();
    race_track.datatexTree.trans = [5, 1.2, 0];
    race_track.datatexTree.scale = [.5,.5,1];
    race_track.roottree.linkchild(race_track.datatexTree);

    // multi material
    race_track.multiTree = raceGetMultiMat();    
    race_track.multiTree.trans = [4.5,3.4,0];
    race_track.multiTree.scale = [.25,.25,1];
    race_track.roottree.linkchild(race_track.multiTree);
    // make a copy of multi model
    const multi2 = race_track.multiTree.newdup();
    multi2.trans = [5.5, 3.4, 0];
    race_track.roottree.linkchild(multi2);

    // make the track
    const track = race_track.buildtrack(race_track.trackAData);
    race_track.trackRoot = track.tree;
    race_track.roottree.linkchild(race_track.trackRoot);
    race_track.trackInfo = track.info;
    // make the car
    const car = race_track.buildCar(race_track.roottree);
    race_track.carModel = car.model;
    race_track.carTree = car.tree;
    race_track.roottree.linkchild(car.tree);
    // make info text
    race_track.infoTree = race_track.buildInfo();
    race_track.roottree.linkchild(race_track.infoTree);
        
    // camera viewport
	mainvp = defaultviewport();	
	mainvp.clearcolor = [.125,.5,.75,1];

    // add a test debprint
	debprint.addlist("race_track_debug",["race_track.debvars"]);
};

race_track.proc = function() {
	// proc
    race_track.procCar();
    const collInfo = race_track.collideTrack(race_track.trackAData ,race_track.carModel.pos);
    race_track.carTree.mat.color = collInfo.collide
        ? [1, 0, 0, 1] 
        : [1, 1, 1, 1];
    race_track.updateInfo(collInfo);
	doflycam(mainvp); // modify the trs of vp using flycam
	// draw
	beginscene(mainvp);
	race_track.roottree.draw();
};

race_track.exit = function() {
    // ui
	debprint.removelist("race_track_debug");
	clearbuts('race_track_buts');
	// show current usage
	race_track.roottree.log();
	logrc();
	// show usage after cleanup
	race_track.roottree.glfree();
	logger("after roottree glfree\n");
	logrc();
	race_track.roottree = null;
	logger("exiting webgl race_track\n");
};
