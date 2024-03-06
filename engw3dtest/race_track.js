'use strict';

var race_track = {};

race_track.text = "WebGL: Track constructor and builder";
race_track.title = "race_track";

// trees
race_track.roottree;
race_track.multiTree;
race_track.datatexTree;
race_track.trackRoot;
race_track.trackA;

// data texture
race_track.datatex; // data texture

race_track.debvars = {
	testarr:[3,4,[5,7],6],
	testobj:{"hi":40,"ho":[50,99]},
};

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
    return trackRoot;
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
        ],
        [
            {type: types.blank, rot: 0},
            {type: types.straight, rot: 1},
            {type: types.blank, rot: 0},
            {type: types.straight, rot: 1},
        ],
        [
            {type: types.turn, rot: 3},
            {type: types.turn, rot: 1},
            {type: types.blank, rot: 0},
            {type: types.straight, rot: 1},
        ],
        [
            {type: types.turn, rot: 2},
            {type: types.startFinish, rot: 0},
            {type: types.straight, rot: 0},
            {type: types.turn, rot: 1},
        ],
    ];
	logger("entering webgl race_track\n");
	// ui
	setbutsname('race_track_buts');
    // tree root
    race_track.roottree = new Tree2("root");
    race_track.roottree.trans = [0, 0, 5];

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
    multi2.trans = [5.5,3.4,0];
    race_track.roottree.linkchild(multi2);

    race_track.trackRoot = race_track.buildtrack(race_track.trackAData);
    race_track.roottree.linkchild(race_track.trackRoot);
	
    // camera viewport
	mainvp = defaultviewport();	
	mainvp.clearcolor = [.125,.5,.75,1];

    // add a test debprint
	debprint.addlist("race_track_debug",["race_track.debvars"]);
};

race_track.proc = function() {
	// proc
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
