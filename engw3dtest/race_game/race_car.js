'use strict';

var race_car = {};

race_car.modeStrs = [
    "human",
    "ai",
    "revai",
    "none",
];

race_car.modeEnums = makeEnum(race_car.modeStrs);

// returns object with tree info and a 'model' mvc
race_car.buildCar = function(i, n) {
    // build the car view model
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

    // pick driving mode for each car
    //const mode = race_car.modeEnums.revai;
    //const mode = Math.min(i, race_car.modeEnums.none);
    const mode = i * 2 < n ? race_car.modeEnums.revai : race_car.modeEnums.ai;

    // placement of cars
    i = n - 1 - i; // start in back for player 0
    const j = Math.floor(i / 2);
    i = (i + 1) % 2;
    const car = { // model and some trees
        model: {
            //pos: [-.25 - .5 * j, -2.75 - .5 * i, 0], // TODO:  hard coded
            pos: [-.25 - .5 * j, -2.75 - .5 * i, 0], // hard coded
            speed: 0,
            dir: mode == race_car.modeEnums.revai ? -CMath.PI * .5 :  CMath.PI * .5,
            mode: mode // TODO: move out of model LATER when porting to 'net race'

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
    const distSep = .375;
    for (let i = 0; i < carModels.length; ++i) {
        const carA = carModels[i];
        for (let j = i + 1; j < carModels.length; ++j) {
            const carB = carModels[j];
            race_car.separate(carA.pos, carB.pos, distSep, extra);
        }
    }
}

race_car.procCars = function(carModels, focusIdx) {
    const dirStep = 1.5;
    const topSpeed = 1 / 32;
    const topRevSpeed = -1 / 64;
    const accel = topSpeed / 128;
    const coast = -topSpeed / 512;
    const brake = -topSpeed / 64;
    const slowTurnSpeed = .01;
    const aiNoTurnAng = 5 * CMath.PI / 180; // don't turn if almost heading in right direction
    // change mode of the car with focus
    if (input.key == 'm'.charCodeAt()) {
        const carModel = carModels[focusIdx];
        carModel.mode = (carModel.mode + 1) % race_car.modeStrs.length;
    }
    for (let i = 0; i < carModels.length; ++i) {
        const carModel = carModels[i];
        // move around with keyboard
        let up = 0;
        let down = 0;
        let left = 0;
        let right = 0;
        switch(carModel.mode) {
        case race_car.modeEnums.human:
            up = input.keystate[keycodes.UP];
            down = input.keystate[keycodes.DOWN];
            left = input.keystate[keycodes.LEFT];
            right = input.keystate[keycodes.RIGHT];
            break;
        case race_car.modeEnums.ai:
        case race_car.modeEnums.revai:
            let dir = race_track.getAiTrack(race_trackData.race_track1 ,carModel.pos, carModel.mode == race_car.modeEnums.revai);
            let deltaDir = normalangrad(dir - carModel.dir);
            up = true;
            if (deltaDir >= aiNoTurnAng) {
                right = true;
            } else if (deltaDir <= -aiNoTurnAng) {
                left = true;
            }
            break;
        /*case race_car.modeEnums.none:
            left = true;
            break;*/
        }
        // accel the car
        // this car gets keyboard input
        if (up) { // accel
            carModel.speed += accel;
        } else if (down) { // brake/reverse
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
        // turn the car
        let carTurn = 0;
        if (left) {
            carTurn = -1;
        }
        if (right) {
            carTurn = 1;
        }
        if (carTurn) {
            let turnSpeed = carModel.speed;
            if (turnSpeed >= 0) {
                if (turnSpeed < slowTurnSpeed) {
                    turnSpeed = slowTurnSpeed;
                }
            } else {
                if (turnSpeed > -slowTurnSpeed) {
                    turnSpeed = -slowTurnSpeed;
                }
            }
            carModel.dir += carTurn * dirStep * turnSpeed;
            carModel.dir = normalangrad(carModel.dir);
        }
        // move the car
        const stepX = carModel.speed * CMath.sin(carModel.dir);
        const stepY = carModel.speed * CMath.cos(carModel.dir);
        carModel.pos[0] += stepX;
        carModel.pos[1] += stepY;
    }

    // keep cars apart
    race_car.separateCars(carModels);

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

