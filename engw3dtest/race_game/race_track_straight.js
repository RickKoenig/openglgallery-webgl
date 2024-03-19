'use strict';

function raceGetStraight(rot = 0) {
    rot &= 1;
    const straightModel = Model2.createmodel("track_straight_rot" + rot);
    if (straightModel.refcount == 1) {
        // returns size -1,-1,0 to 1,1,0
        const border = .5; // between grass and pavement
        const verts = [
        // top grass FAN, num verts == 4
            -1, 1, 0,
            1, 1, 0,
            1, border, 0,
            -1, border, 0,
        // middle pavement FAN, num verts == 4
            -1, border, 0,
            1, border, 0,
            1, -border, 0,
            -1, -border, 0,
        // bottom grass FAN, num verts == 4
            -1, -border, 0,
            1, -border, 0,
            1, -1, 0,
            -1, -1, 0,
        ];
        race_track.rotateVerts(verts, rot);
        // make a mesh out of verts
        const straightMesh = {
            "verts": verts
        };
        race_track.mapUVs(straightMesh);
        const grassBright = .375;
        straightModel.setmesh(straightMesh);
        straightModel.addmat("texc", "grass.jpg", 0, 4, modelflagenums.FAN);
        straightModel.mats[0].color = [grassBright, grassBright, grassBright, 1];
        straightModel.addmat("tex", "4pl_tile01.jpg", 0, 4, modelflagenums.FAN);
        straightModel.addmat("texc", "grass.jpg", 0, 4, modelflagenums.FAN);
        straightModel.mats[2].color = [grassBright, grassBright, grassBright, 1];
        straightModel.commit();
    }
    const straightTree = new Tree2("track_straight_rot" + rot);
    straightTree.setmodel(straightModel);
    return straightTree;
}
