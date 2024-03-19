'use strict';

// race track

var race_track = {};

// track piece names
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
