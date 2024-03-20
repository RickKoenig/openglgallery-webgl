'use strict';

var race_car = {};
// returns object with tree info and a 'model' mvc
race_car.buildCar = function(i, n) {
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
    const colors = [
        [.5, 0, 0, 1],
        [0, .5, 0, 1],
        [0, 0, .5, 1],
        [.25, .25, 0, 1]
    ];
    const wedgeModel = buildMeshModel("carWedge", null, "flat", wedgeMesh);
    const wedgeTree = new Tree2("carWedge");
    wedgeTree.setmodel(wedgeModel);
    wedgeTree.scale = [.45 * carSize, .45 * carSize, .3 * carSize];
    wedgeTree.mat.color = colors[i % colors.length];
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
    const j = Math.floor(i / 2);
    i = i % 2;
    const car = { // model and some trees
        model: {
            pos: [-.25 - .5 * j, -2.75 - .5 * i, 0], // hard coded
            speed: 0,
            dir: CMath.PI * .5,
        },
        treeRot: wholeCarRot, // THIS, don't rotate screen with car
        treeTrans: wholeCarTrans, // OR THIS, rotate screen with car
        attachTree: carAttach,
        tree: wholeCarTrans // root of car
    }
    car.treeTrans.trans = car.model.pos.slice();
    car.treeRot.rot = [0, 0, 0];
    car.treeTrans.rot = [0, 0, 0];
    return car;
};

// move 2 circles apart, simple
race_car.separate = function(posA, posB, distSep, extra) {
    const distSep2 = distSep * distSep;
    const dist2 = vec2.sqrDist(posA, posB);
    if (dist2 > distSep2) {
        return false;
    }
    let delta;
    if (dist2 > 0) {
        delta = vec2.create();
        vec2.sub(delta, posB, posA);
        vec2.normalize(delta, delta);
    } else { // same position, separate horizontally
        delta = vec2.fromValues(0, 1);
    }
    vec2.scale(delta, delta, distSep * .5 * extra);
    const midPoint = vec2.create();
    vec2.add(midPoint, posA, posB);
    vec2.scale(midPoint, midPoint, .5); // midpoint is the average
    vec2.sub(posA, midPoint, delta); // move out in opposite directions
    vec2.add(posB, midPoint, delta);
    return true;
}
race_car.separateCars = function(carModels) {
    const extra = 1.001; // move apart a litte more
    const distSep = .25
    for (let i = 0; i < carModels.length; ++i) {
        const carA = carModels[i];
        for (let j = i + 1; j < carModels.length; ++j) {
            const carB = carModels[j];
            race_car.separate(carA.pos, carB.pos, distSep, extra);
        }
    }
}

race_car.procCar = function(carModels, inputIdx) {
    const dirStep = 1.5;
    const topSpeed = 1 / 32;
    const topRevSpeed = -1 / 64;
    const accel = topSpeed / 128;
    const coast = -topSpeed / 512;
    const brake = -topSpeed / 64;
    for (let i = 0; i < carModels.length; ++i) {
        const carModel = carModels[i]; // this car gets keyboard input
        // move around with keyboard
        if (input.keystate[keycodes.UP] && inputIdx == i) { // accel
            carModel.speed += accel;
        } else if (input.keystate[keycodes.DOWN] && inputIdx == i) { // brake/reverse
            carModel.speed += brake;
        } else { // coast
            if (carModel.speed > 0) {
                carModel.speed += coast;
                if (carModel.speed < 0) {
                    carModel.speed = 0;
                }
            } else if (carModel.speed < 0) {
                carModel.speed -= coast;
                if (carModel.speed > 0) {
                    carModel.speed = 0;
                }
            }
        }
        carModel.speed = range(topRevSpeed, carModel.speed, topSpeed);
        if (input.keystate[keycodes.LEFT] && inputIdx == i) {
            carModel.dir -= dirStep * carModel.speed;
            carModel.dir = normalangrad(carModel.dir);
        }
        if (input.keystate[keycodes.RIGHT] && inputIdx == i) {
            carModel.dir += dirStep * carModel.speed;
            carModel.dir = normalangrad(carModel.dir);
        }
        const stepX = carModel.speed * CMath.sin(carModel.dir);
        const stepY = carModel.speed * CMath.cos(carModel.dir);
        carModel.pos[0] += stepX;
        carModel.pos[1] += stepY;
    }

    // keep cars apart
    race_car.separateCars(carModels);
    
    /*
    // don't move out of entire track area
    const extraBorder = .25;
    carModel.pos[0] = range(
        race_main.trackInfo.minPos[0] - extraBorder,
        carModel.pos[0],
        race_main.trackInfo.maxPos[0] + extraBorder);
    carModel.pos[1] = range(
        race_main.trackInfo.minPos[1] - extraBorder,
        carModel.pos[1],
        race_main.trackInfo.maxPos[1] + extraBorder);*/

    // don't move out of the pavement
    for (let i = 0; i < carModels.length; ++i) {
        const carModel = carModels[i];
        const collInfo = race_track.collideTrack(race_trackData.race_track1 ,carModel.pos);
        if (collInfo.collide) {
            carModel.pos[0] = collInfo.collidePos[0];
            carModel.pos[1] = collInfo.collidePos[1];
        }
    }
};

