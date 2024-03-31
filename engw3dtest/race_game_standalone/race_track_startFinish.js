'use strict';

function raceGetStartFinish(rot = 0) {
    const sfModel = Model2.createmodel("track_sf_rot" + rot);
    if (sfModel.refcount == 1) {
        // returns size -1,-1,0 to 1,1,0
        const border = .5; // between grass and pavement
        const sfWidth = .0625;
        const arrowWidth = .25;
        const arrowStart = .375;
        const arrowEnd = .75;
        const verts = [
            // top grass FAN, num verts == 7
            0, 1, 0,
            1, 1, 0,
            1, border, 0,
            sfWidth, border, 0,
            -sfWidth, border, 0,
            -1, border, 0,
            -1, 1, 0,
            // left pavement  FAN, num verts == 4
            -1, -border, 0,
            -1, border, 0,
            -sfWidth, border, 0,
            -sfWidth, -border, 0,
            // sf pavement  FAN, num verts == 4
            -sfWidth, -border, 0,
            -sfWidth, border, 0,
            sfWidth, border, 0,
            sfWidth, -border, 0,
            // right pavement  STRIP, num verts == 9
            sfWidth, -border, 0,
            arrowStart, -arrowWidth, 0,
            1, -border, 0,
            arrowEnd, 0, 0,
            1, border, 0,
            arrowStart, arrowWidth, 0,
            sfWidth, border, 0,
            arrowStart, -arrowWidth, 0,
            sfWidth, -border, 0,
            // arrow num verts == 3
            arrowStart, arrowWidth, 0,
            arrowEnd, 0, 0,
            arrowStart, -arrowWidth, 0,
            // bottom grass FAN, num verts == 7
            0, -1, 0,
            -1, -1, 0,
            -1, -border, 0,
            -sfWidth, -border, 0,
            sfWidth, -border, 0,
            1, -border, 0,
            1, -1, 0,
        ];
        race_track.rotateVerts(verts, rot);
        // make a mesh out of verts
        const sfMesh = {
            "verts": verts
        };
        race_track.mapUVs(sfMesh);
        const grassBright = .375;
        sfModel.setmesh(sfMesh);
        // top
        sfModel.addmat("texc", "grass.jpg", 0, 7, modelflagenums.FAN);
        sfModel.lastMat.color = [grassBright, grassBright, grassBright, 1];
        // left
        sfModel.addmat("tex", "4pl_tile01.jpg", 0, 4, modelflagenums.FAN);
        // sf
        sfModel.addmat("tex", "sanddbl.jpg", 0, 4, modelflagenums.FAN);
        // right
        sfModel.addmat("tex", "4pl_tile01.jpg", 0, 9, modelflagenums.STRIP);
        // arrow
        sfModel.addmat("tex", "sanddbl.jpg", 0, 3); // 1 TRIANGLE
        // bottom
        sfModel.addmat("texc", "grass.jpg", 0, 7, modelflagenums.FAN);
        sfModel.lastMat.color = [grassBright, grassBright, grassBright, 1];
        sfModel.commit();
    }
    const sfTree = new Tree2("track_sf_rot" + rot);
    sfTree.setmodel(sfModel);
    return sfTree;
}
