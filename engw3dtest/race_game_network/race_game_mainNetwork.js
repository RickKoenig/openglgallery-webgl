'use strict';

// run a networked race game
window.GameB = class RaceGameNetwork {
    static #keyCodes = {
        UP: 1,
        DOWN: 2,
        RIGHT: 4,
        LEFT: 8,
        GO: 16,
    };
    static #buildTextInfo = function () {
        var ftree = new Tree2("info");
        var infofontmodel = new ModelFont("infoFont","font0.png","tex",
            1,1,
            60,20,
            true);
        //infofontmodel.flags |= modelflagenums.NOZBUFFER;
        var str = "Welcome";
        infofontmodel.print(str);
        // make pixel perfect
        ftree.trans = [-gl.asp, 1, 0];
        ftree.scale = [
            16 * 2 / glc.clientHeight * .5,
            32 * 2 / glc.clientHeight * .5,
            1
        ];
        ftree.setmodel(infofontmodel);
        return ftree;
    };
    
    #updateInfo = function(str) {
        this.infoTree.mod.print(str);
    };
    
    constructor(numPlayers, curPlayer, root) {
        this.size = 30; // radius
        this.viewDepth = glc.clientHeight / 2;
        this.numPlayers = numPlayers;
        this.slotPlayer = curPlayer; // network
        this.curPlayer = curPlayer; // view
        this.resetModel = this.#modelReset(); // the start model
        this.curModel = clone(this.resetModel); // time warp model, the current model is the init model
        this.ghostModel = {}; // NO time warp model, this model is for animation, doesn't interact with game
        this.trackView = [];
        this.carsView = [];

        // build 3D scene
        this.infoParent = new Tree2("infoParent");
        this.gameParent = new Tree2("gameParent");
        this.gameParent.trans = [0, 0, 1];
        // move back a little for camera
        this.infoParent.trans = [0, 0, 1];
        root.linkchild(this.infoParent);
        // view players
        const treeMasterPlayer = buildsphere("aplayer", this.size, "panel.jpg", "texc");
        treeMasterPlayer.scale = [1, 1, .01];
        treeMasterPlayer.mat.color = [.75, .75, .75, 1];
        for (let s = 0; s < numPlayers; ++s) {
            const playerTree = treeMasterPlayer.newdup();
            if (curPlayer == s) playerTree.mat.color = [1.5, 1.5, 1.5, 1]; // brighter color for self
            this.carsView[s] = playerTree;
            this.infoParent.linkchild(playerTree);
        }
        treeMasterPlayer.glfree();
        // view npcsDummy
        const treeMasterDummyNpc = buildsphere("aDummynpc", this.size, "panel.jpg", "texc");
        treeMasterDummyNpc.scale = [1, 1, .01];
        treeMasterDummyNpc.mat.color = [.25, .75, .25, 1];
        for (let n = 0; n < this.numDummyNpcs; ++n) {
            const npcDummyTree = treeMasterDummyNpc.newdup();
            this.curDummyNpcView[n] = npcDummyTree;
            infoParent.linkchild(npcDummyTree);
        }
        treeMasterDummyNpc.glfree();
        
        // view npcsMove
        const treeMasterMoveNpc = buildsphere("aMovenpc", this.size, "panel.jpg", "texc");
        treeMasterMoveNpc.scale = [1, 1, .01];
        treeMasterMoveNpc.mat.color = [1.25, .25, 1.25, 1];
        for (let n = 0; n < this.numMoveNpcs; ++n) {
            const npcMoveTree = treeMasterMoveNpc.newdup();
            this.curMoveNpcView[n] = npcMoveTree;
            infoParent.linkchild(npcMoveTree);
        }
        treeMasterMoveNpc.glfree();

        // make info text
        this.infoTree = RaceGameNetwork.#buildTextInfo();
        this.infoParent.linkchild(this.infoTree);
        this.#updateInfo("hi ho!");

        // make the track
        RaceGameNetwork.gameViewPort = defaultviewport();
        //RaceGameNetwork.gameViewPort.clearflags = 0; // already cleared from mainvp
        mainvp.clearflags = 0;



        const track = race_track.buildtrack(race_trackData.race_track1);
        this.trackInfo = track.info;
        this.trackTree = track.tree;
        this.gameParent.linkchild(this.trackTree);
        //root.linkchild(track.tree);

        // make the car
        this.numPlayers = 1;
        this.curPlayer = 0;
        //this.carModels = [];
        this.carTreeRots = [];
        this.carTreeTranss = [];
        this.carTreeAttachs = [];
        for (let i = 0; i < this.numPlayers; ++i) {
            const car = race_car_network.buildCarView(i, this.numPlayers);
            //this.carModels.push(car.model); // mvc
            this.carTreeRots.push(car.treeRot); // camera rigging
            this.carTreeTranss.push(car.treeTrans); // camera rigging
            this.carTreeAttachs.push(car.attachTree); // camera rigging
            this.gameParent.linkchild(car.tree);
        }
        // camera types (views)
        RaceGameNetwork.gameViewPort.camattach = this.carTreeAttachs[this.curPlayer];
        RaceGameNetwork.cameraTypeStrs = [
            "static",
            "scroll",
            "rotScroll",
            "view3D",
        ];
        RaceGameNetwork.cameraTypeEnums = makeEnum(RaceGameNetwork.cameraTypeStrs);
        RaceGameNetwork.curCameraType = RaceGameNetwork.cameraTypeEnums.scroll;
        //RaceGameNetwork.gameViewPort.zoom = .5;
        RaceGameNetwork.cameraZoom = .5;
        RaceGameNetwork.#changeCameraView();
    }

    static #changeCameraView() {
        switch(this.curCameraType) {
            case this.cameraTypeEnums.static:
                RaceGameNetwork.gameViewPort.incamattach = false;
                this.rotCam = false;
                viewportClearRotTrans(RaceGameNetwork.gameViewPort);
                break;
            case this.cameraTypeEnums.scroll:
                RaceGameNetwork.gameViewPort.incamattach = true;
                this.rotCam = false;
                viewportClearRotTrans(RaceGameNetwork.gameViewPort);
                break;
            case this.cameraTypeEnums.rotScroll:
                RaceGameNetwork.gameViewPort.incamattach = true;
                this.rotCam = true;
                viewportClearRotTrans(RaceGameNetwork.gameViewPort);
                break;
            case this.cameraTypeEnums.view3D:
                RaceGameNetwork.gameViewPort.trans = [0, -1.23, .475];
                RaceGameNetwork.gameViewPort.rot = [-1.25, 0, 0];
                break;
        }
    }
  
    #setNpcsMoving(retModel) {
        const angOffset = retModel.npcsMovingAngle;
        let n = 0;
        const center = [700, 384];
        const startX = 100;
        const stepX = 60;
        for (let j = 0; j < this.numMoveNpcsY; ++j) {
            const ang = j * 2 * CMath.PI / this.numMoveNpcsY + angOffset;
            const cosAng = CMath.cos(ang);
            const sinAng = CMath.sin(ang);
            //console.log("NOTICE: j = " + j + ", " + sinAng + " =  sin ( " + ang + " ) ");
            for (let i = 0; i < this.numMoveNpcsX; ++i) {
                const rad = startX + stepX * i;
                const npc = {
                    pos: [
                        center[0] + cosAng * rad,
                        center[1] + sinAng * rad,
                        0
                    ]
                }
                //console.log("NOTICE2: npc.pos[1] = " + npc.pos[1] + ", from rad = " + rad);
                retModel.npcsMoving[n++] = npc;
            }
        }
    }

    // return initial model of the game
    #modelReset() {
        const carModel = race_car_network.buildCarModels(this.numPlayers);
        //const retModel = []
        //    players: carModel
        //};
        /*
        // players
        for (let slot = 0; slot < this.numPlayers; ++slot) {
            const player = {
                pos: [
                    50, 550 - slot * 75, 0,
                ],
                desiredPos: null // if mouse click
            }
            player.lastPos = vec3.clone(player.pos);
            retModel.players[slot] = player;
        }
        */
        return carModel;
    }

    getCurModel() {
        return clone(this.curModel);
    }

    setCurModel(model) {
        this.curModel = clone(model);
    }

    // local input to keycode, helper
    // return object 
    /* 
        // USER
        kc: bitfield of up, down, left, right
        mouse: pos and click
    */
    static modelMakeKeyCode() {
        const ret = {};
        let keyCode = 0;
        // restart game
        if (input.key == 'g'.charCodeAt(0)) {
            keyCode += GameB.#keyCodes.GO;
            ret.kc = keyCode;
            return ret;
        }
        // move with arrow keys
        if (input.keystate[keycodes.LEFT]) keyCode += GameB.#keyCodes.LEFT;
        if (input.keystate[keycodes.RIGHT]) keyCode += GameB.#keyCodes.RIGHT;
        if (input.keystate[keycodes.UP]) keyCode += GameB.#keyCodes.UP;
        if (input.keystate[keycodes.DOWN]) keyCode += GameB.#keyCodes.DOWN;
        ret.kc = keyCode;
        // move with mouse
        ret.mouse = {
            pos: [input.mx, input.my],
            click: input.mclick[0]
        }
        return ret;
    }

    // let game decide what to do with predictions
    predictLogic(prevInput, frameNum) {
        return prevInput; // full prediction
        //const kc = 0; // wait, no prediction
        //const kc = GameB.#keyCodes.RIGHT; // test, predict right
        //const kc = GameB.#keyCodes.UP | prevInput.kc; // racing, always press GAS/up
        //const ret = {kc: kc}
        //return kc;
    }

    // move 2 circles apart, simple
    static #separate(posA, posB, distSep, extra) {
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
        } else { // same position, #separate horizontally
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

    // move 2 circles apart, but with posB roughly following posA movement direction
    static #separateSticky(posA, lastPosA, posB, distSep, stickyLerp, extra) {
        const distSep2 = distSep * distSep;
        const dist2 = vec2.sqrDist(posA, posB);
        if (dist2 > distSep2) {
            return false;
        }
        let deltaPos;
        if (dist2 > 0) {
            deltaPos = vec2.create();
            vec2.sub(deltaPos, posB, posA);
            vec2.normalize(deltaPos, deltaPos);
        } else { // same position, #separate horizontally
            deltaPos = vec2.fromValues(0, 1);
        }
        const deltaAVel = vec2.create();
        vec2.sub(deltaAVel, posA, lastPosA);
        const moveLen2 = vec2.sqrLen(deltaAVel);
        if (moveLen2 > 0) {
            vec2.normalize(deltaAVel, deltaAVel);
        } else {
            vec2.copy(deltaAVel, deltaPos); // no movement, just use deltaPos
        }
        const delta = vec2.create();
        vec2.lerp(delta, deltaPos, deltaAVel, stickyLerp);

        vec2.normalize(delta, delta);
        vec2.scale(delta, delta, distSep * .5 * extra);
        const midPoint = vec2.create();
        vec2.add(midPoint, posA, posB);
        vec2.scale(midPoint, midPoint, .5); // midpoint is the average
        vec2.sub(posA, midPoint, delta); // move out in opposite directions
        vec2.add(posB, midPoint, delta);
        return true;
    }

    // move circleA away from circleB (circleB doesn't move)
    static #separateA(posA, posB, distSep, extra) {
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
        } else { // same position, #separate horizontally
            delta = vec2.fromValues(0, 1);
        }
        vec2.scale(delta, delta, distSep * extra);
        vec2.sub(posA, posB, delta); // move circleA away from circleB
        return true;
    }

    // timeWarp
    stepModel(pInputs, frameNum) {
        // movement
        // players
        /*
        for (let slot = 0; slot < pInputs.length; ++slot) {
            const pInput = pInputs[slot];
            const curPlayer = this.curModel.players[slot];
            vec3.copy(curPlayer.lastPos, curPlayer.pos);
            if (pInput.discon) {
                this.curPlayerView[slot].mat.color = [1.75, 0, 0, 1]; // disconnect color
                curPlayer.desiredPos = null;
                continue;
            }
            // keyboard
            const keyCode = pInput.kc;
            // reset game
            if (keyCode & GameB.#keyCodes.GO) {
                this.curModel = clone(this.resetModel); // the current model is the init model
                curPlayer.desiredPos = null;
                return;
            }
            /*
            const step = this.step
            if (keyCode & GameB.#keyCodes.RIGHT) {
                curPlayer.pos[0] += step;
                curPlayer.desiredPos = null;
            }
            if (keyCode & GameB.#keyCodes.LEFT) {
                curPlayer.pos[0] -= step;
                curPlayer.desiredPos = null;
            }
            if (keyCode & GameB.#keyCodes.UP) {
                curPlayer.pos[1] += step;
                curPlayer.desiredPos = null;
            }
            if (keyCode & GameB.#keyCodes.DOWN) {
                curPlayer.pos[1] -= step;
                curPlayer.desiredPos = null;
            }
            if (pInput.mouse) {
                if (pInput.mouse.click) {
                    curPlayer.desiredPos = [
                        range(this.margin, pInput.mouse.pos[0], this.res[0] - this.margin),
                        range(this.margin, glc.clientHeight - pInput.mouse.pos[1], this.res[1] - this.margin)
                    ];
                }
            }
            // mouse, move to desiredPos
            if (curPlayer.desiredPos) {
                const close2 = step * step * 2;
                const dist2 = vec2.sqrDist(curPlayer.desiredPos, curPlayer.pos);
                if (dist2 < close2) {
                    vec2.copy(curPlayer.pos, curPlayer.desiredPos);
                    curPlayer.desiredPos = null;
                } else {
                    const delta = vec2.create();
                    vec2.sub(delta, curPlayer.desiredPos, curPlayer.pos);
                    vec2.normalize(delta, delta);
                    vec2.scale(delta, delta, step);
                    vec2.add(curPlayer.pos, curPlayer.pos, delta);
                }
            }
        }*/
        /*
        // npc moves
        this.#setNpcsMoving(this.curModel);
        const movingAngleStep = .005;
        this.curModel.npcsMovingAngle += movingAngleStep;
        this.curModel.npcsMovingAngle = normalangrad(this.curModel.npcsMovingAngle);

        // collisions
        const extra = 1.001; // move apart a litte more

        // players to players
        for (let p0 = 0; p0 < pInputs.length; ++p0) {
            const curPlayer0 = this.curModel.players[p0];
            for (let p1 = p0 + 1; p1 < pInputs.length; ++p1) {
                const curPlayer1 = this.curModel.players[p1];
                // move players apart
                GameA.#separate(curPlayer0.pos, curPlayer1.pos, 2 * this.size, extra);
            }
        }

        // players to npcsDummy
        const sticky = .05;
        for (let p = 0; p < pInputs.length; ++p) {
            const curPlayer = this.curModel.players[p];
            for (let nd = 0; nd < this.curModel.npcsDummy.length; ++nd) {
                const npcd = this.curModel.npcsDummy[nd];
                // move players and npcsDummy apart
                GameA.#separateSticky(curPlayer.pos, curPlayer.lastPos, npcd.pos, 2 * this.size, sticky, extra);
            }
        }

        // npcsDummy to npcsDummy
        for (let n0d = 0; n0d < this.curModel.npcsDummy.length; ++n0d) {
            const npc0d = this.curModel.npcsDummy[n0d];
            for (let n1d = n0d + 1; n1d < this.curModel.npcsDummy.length; ++n1d) {
                const npc1d = this.curModel.npcsDummy[n1d];
                // move npcsDummy and npcsDummy apart
                GameA.#separate(npc0d.pos, npc1d.pos, 2 * this.size, extra);
            }
        }

        // npcsMove to npcsDummy
        for (let nd = 0; nd < this.curModel.npcsDummy.length; ++nd) {
            const npcd = this.curModel.npcsDummy[nd];
            for (let nm = 0; nm < this.curModel.npcsMoving.length; ++nm) {
                const npcm = this.curModel.npcsMoving[nm];
                // move players away from npcsMoving
                GameA.#separateA(npcd.pos, npcm.pos, 2 * this.size, extra);
            }
        }

        // npcsMove to players
        for (let p = 0; p < pInputs.length; ++p) {
            const curPlayer = this.curModel.players[p];
            for (let nm = 0; nm < this.curModel.npcsMoving.length; ++nm) {
                const npcm = this.curModel.npcsMoving[nm];
                // move players away from npcsMoving
                GameA.#separateA(curPlayer.pos, npcm.pos, 2 * this.size, extra);
            }
        }
        
        // border to players
        for (let p = 0; p < pInputs.length; ++p) {
            const curPlayer = this.curModel.players[p];
            curPlayer.pos[0] = range(this.margin, curPlayer.pos[0], this.res[0] - this.margin);
            curPlayer.pos[1] = range(this.margin, curPlayer.pos[1], this.res[1] - this.margin);
        }

        // border to npcsDummy
        for (let nd = 0; nd < this.curModel.npcsDummy.length; ++nd) {
            const npcd = this.curModel.npcsDummy[nd];
            npcd.pos[0] = range(this.margin, npcd.pos[0], this.res[0] - this.margin);
            npcd.pos[1] = range(this.margin, npcd.pos[1], this.res[1] - this.margin);
        }*/
    }

    // no timeWarp, mainly for animation
    stepGhostModel(frameNum) {
    }

    // M to V
    // get Model to this frameNum, then move it into View
    modelToView() {
        // update the view from the model
        // players
        //for (let slot = 0; slot < this.curModel.players.length; ++slot) {
        //    this.carsView[slot].trans = vec3.clone(this.curModel.players[slot].pos);
        //}
    }

    draw() {
        if (input.key == 'v'.charCodeAt()) {
            RaceGameNetwork.curCameraType = (RaceGameNetwork.curCameraType + 1) % RaceGameNetwork.cameraTypeStrs.length;
            RaceGameNetwork.#changeCameraView();
        }
        
        // change zoom
        if (RaceGameNetwork.curCameraType != RaceGameNetwork.cameraTypeEnums.view3D) {
            let delta = input.wheelDelta; // new with chrome, they now have non integer values
            //console.log("wheel delta = " + delta);
            const zf = 1.1;
            let watch = 0;
            while(delta) {
                if (watch > 20) {
                    console.log("watch hit!!");
                    break;
                }
                if (delta > 0) {
                    RaceGameNetwork.cameraZoom *= zf;
                    --delta;
                } else if (delta < 0) {
                    RaceGameNetwork.cameraZoom /= zf;
                    ++delta;
                }
                ++watch;
            }
            RaceGameNetwork.cameraZoom = range(1 / 8, RaceGameNetwork.cameraZoom, 8);
            RaceGameNetwork.gameViewPort.zoom = RaceGameNetwork.cameraZoom;
        } else {
            RaceGameNetwork.gameViewPort.zoom = 2;
        }

        // change car view control
        let changeCarView = 0;
        if (input.key == ']'.charCodeAt()) {
            changeCarView = 1;
        } else if (input.key == '['.charCodeAt()) {
            changeCarView = -1;
        }
        if (changeCarView) {
            this.curPlayer 
                = (this.curPlayer + this.numPlayers + changeCarView) 
                % this.numPlayers;
            RaceGameNetwork.gameViewPort.camattach = this.carTreeAttachs[this.curPlayer];
        }

        //procCars();

        // draw track and cars
        //doflycam(RaceGameNetwork.gameViewPort);
        beginscene(RaceGameNetwork.gameViewPort);
        this.gameParent.draw();
    }

    exit() {
        // show current usage
        logger("before GAME PARENT glfree\n");
        this.gameParent.log();
        logrc();
        // show usage after cleanup
        this.gameParent.glfree();
        logger("after GAME PARENT glfree\n");
        logrc();
    }
}
