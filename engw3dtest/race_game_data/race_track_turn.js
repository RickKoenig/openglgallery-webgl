'use strict';

function raceGetTurn(rot = 0) {
    const turnModel = Model2.createmodel("track_turn_rot" + rot);
    if (turnModel.refcount == 1) {
        // returns size -1,-1,0 to 1,1,0
        const segments = 8;
        const border = .5; // between grass and pavement
        const verts = [];
        // inner circle  FAN, num verts == segments + 2
        // left to bottom
        verts.push(-1, -1, 0); // corner
        for (let i = 0; i <= segments; ++i) {
            const ang = i * .5 * Math.PI / segments;
            const x = border * Math.sin(ang) - 1;
            const y = border * Math.cos(ang) - 1;
            verts.push(x, y , 0);
        }
        // pavement  STRIP, num verts == 2 * segments + 2
        // left to bottom
        for (let i = 0; i <= segments; ++i) {
            const ang = i * .5 * Math.PI / segments;
            const ob = 1 + border;
            const sn = Math.sin(ang);
            const cs = Math.cos(ang);
            const ix = border * sn - 1;
            const iy = border * cs - 1;
            verts.push(ix, iy, 0);
            const ox = ob * sn - 1;
            const oy = ob * cs - 1;
            verts.push(ox, oy, 0);
        }
        // outer circle  FAN, num verts == segments + 4
        verts.push(1, 1, 0);
        verts.push(1, -1, 0);
        // bottom to left
        for (let i = 0; i <= segments; ++i) {
            const ang = (segments - i) * .5 * Math.PI / segments;
            const ob = 1 + border;
            const x = ob * Math.sin(ang) - 1;
            const y = ob * Math.cos(ang) - 1;
            verts.push(x, y , 0);
        }
        verts.push(-1, 1, 0);
        race_track.rotateVerts(verts, rot);
        // make a mesh out of verts
        const turnMesh = {
            "verts": verts
        };
        race_track.mapUVs(turnMesh);
        const grassBright = .375;
        turnModel.setmesh(turnMesh);
        turnModel.addmat("texc", "grass.jpg", 0, segments + 2, modelflagenums.FAN);
        turnModel.mats[0].color = [grassBright, grassBright, grassBright, 1];
        turnModel.addmat("tex", "4pl_tile01.jpg", 0, 2 * segments + 2, modelflagenums.STRIP);
        turnModel.addmat("texc", "grass.jpg", 0, segments + 4, modelflagenums.FAN);
        turnModel.mats[2].color = [grassBright, grassBright, grassBright, 1];
        turnModel.commit();
    }
    const turnTree = new Tree2("track_turn_rot" + rot);
    turnTree.setmodel(turnModel);
    return turnTree;
}
