'use strict';

function raceGetBlank() {
    // returns size -1,-1,0 to 1,1,0
    const verts = [
        -1, -1, 0,
        -1, 1, 0,
        1, 1, 0,
        1, -1, 0,
    ];
    // FAN, num verts == 4
    // make a mesh out of verts
    const blankMesh = {
        "verts": verts
    };
    race_track.mapUVs(blankMesh);
    const grassBright = .375;
    const blankModel = buildMeshModel("track_blank", "grass.jpg", "texc", blankMesh, modelflagenums.FAN);
    blankModel.mat.color = [grassBright, grassBright, grassBright, 1];
    const blankTree = new Tree2("track_blank");
    blankTree.setmodel(blankModel);
    return blankTree;
}
