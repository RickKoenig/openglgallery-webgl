'use strict';

function raceGetTurn(rot = 0) {
    const turnmodelmulti = Model2.createmodel("track_multiTurn_rot" + rot);
    if (turnmodelmulti.refcount == 1) {
        // returns size -1,-1,0 to 1,1,0
        const segments = 8;
        const border = .5; // between grass and pavement
        const verts = [];
        // inner circle  FAN, num verts == segments + 2
        // left to bottom
        verts.push(-1, -1, 0); // corner
        for (let i = 0; i <= segments; ++i) {
            const ang = i * .5 * CMath.PI / segments;
            const x = border * CMath.sin(ang) - 1;
            const y = border * CMath.cos(ang) - 1;
            verts.push(x, y , 0);
        }
        // pavement  STRIP, num verts == 2 * segments + 2
        // left to bottom
        for (let i = 0; i <= segments; ++i) {
            const ang = i * .5 * CMath.PI / segments;
            const ob = 1 + border;
            const sn = CMath.sin(ang);
            const cs = CMath.cos(ang);
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
            const ang = (segments - i) * .5 * CMath.PI / segments;
            const ob = 1 + border;
            const x = ob * CMath.sin(ang) - 1;
            const y = ob * CMath.cos(ang) - 1;
            verts.push(x, y , 0);
        }
        verts.push(-1, 1, 0);
        race_track.rotateVerts(verts, rot);
        // make a mesh out of verts
        const turnMeshMulti = {
            "verts": verts
        };
        race_track.mapUVs(turnMeshMulti);
        const grassBright = .375;
        turnmodelmulti.setmesh(turnMeshMulti);
        turnmodelmulti.addmat("texc", "grass.jpg", 0, segments + 2, modelflagenums.FAN);
        turnmodelmulti.mats[0].color = [grassBright, grassBright, grassBright, 1];
        turnmodelmulti.addmat("tex", "4pl_tile01.jpg", 0, 2 * segments + 2, modelflagenums.STRIP);
        turnmodelmulti.addmat("texc", "grass.jpg", 0, segments + 4, modelflagenums.FAN);
        turnmodelmulti.mats[2].color = [grassBright, grassBright, grassBright, 1];
        turnmodelmulti.commit();
    }
    const turnTree = new Tree2("track_multiTurn_rot" + rot);
    turnTree.setmodel(turnmodelmulti);
    return turnTree;
}
