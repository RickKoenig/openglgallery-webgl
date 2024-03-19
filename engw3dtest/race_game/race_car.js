'use strict';

var race_car = {};
// returns object with tree info and a 'model' mvc
race_car.buildCar = function() {
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
    const wedgeModel = buildMeshModel("carWedge", null, "flat", wedgeMesh);
    wedgeModel.mat.color = [.5, 0, 0, 1];
    const wedgeTree = new Tree2("carWedge");
    wedgeTree.setmodel(wedgeModel);
    wedgeTree.scale = [.45 * carSize, .45 * carSize, .3 * carSize];
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
    const car = { // model and some trees
        model: {
            pos: [-2.5, -3, 0], // hard coded
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

race_car.procCar = function(carModel) {
    const dirStep = 1.5;
    const topSpeed = 1 / 32;
    const topRevSpeed = -1 / 64;
    const accel = topSpeed / 128;
    const coast = -topSpeed / 512;
    const brake = -topSpeed / 64;
    // move around with keyboard
    if (input.keystate[keycodes.UP]) { // accel
        carModel.speed += accel;
    } else if (input.keystate[keycodes.DOWN]) { // brake/reverse
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
    if (input.keystate[keycodes.LEFT]) {
        carModel.dir -= dirStep * carModel.speed;
        carModel.dir = normalangrad(carModel.dir);
    }
    if (input.keystate[keycodes.RIGHT]) {
        carModel.dir += dirStep * carModel.speed;
        carModel.dir = normalangrad(carModel.dir);
    }
    const stepX = carModel.speed * CMath.sin(carModel.dir);
    const stepY = carModel.speed * CMath.cos(carModel.dir);
    carModel.pos[0] += stepX;
    carModel.pos[1] += stepY;

    // don't move out of entire track area
    const extra = .25;
    carModel.pos[0] = range(
        race_main.trackInfo.minPos[0] - extra,
        carModel.pos[0],
        race_main.trackInfo.maxPos[0] + extra);
    carModel.pos[1] = range(
        race_main.trackInfo.minPos[1] - extra,
        carModel.pos[1],
        race_main.trackInfo.maxPos[1] + extra);
    // don't move out of the pavement
    const collInfo = race_track.collideTrack(race_trackData.race_track1 ,carModel.pos);
    if (collInfo.collide) {
        carModel.pos[0] = collInfo.collidePos[0];
        carModel.pos[1] = collInfo.collidePos[1];
    }
};

