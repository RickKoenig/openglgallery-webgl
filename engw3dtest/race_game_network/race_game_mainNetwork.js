'use strict';

// run a networked race game
window.GameB = class RaceGameNetwork {
    static keyCodes = {
        UP: 1,
        DOWN: 2,
        RIGHT: 4,
        LEFT: 8,
        GO: 16,
    };
    static #buildTextInfo = function () {
        const ftree = new Tree2("info");
        const infofontmodel = new ModelFont("infoFont","font0.png","tex",
            1,1,
            60,20,
            true);
        infofontmodel.flags |= modelflagenums.NOZBUFFER;
        const str = "Welcome";
        infofontmodel.print(str);
        // make pixel perfect
        ftree.trans = [-gl.asp, 1, 0];
        ftree.scale = [
            16 * 2 / glc.clientHeight * .5 * 1.5,
            32 * 2 / glc.clientHeight * .5 * 1.5,
            1
        ];
        ftree.setmodel(infofontmodel);
        return ftree;
    };
    
    #updateInfo = function(str) {
        this.infoTree.mod.print(str);
    };
    
    constructor(numNetworkPlayers, curPlayer, root, slotNames) {
        const totalPlayers = 16; // total number of players, including BOTS
        this.numPlayers = Math.max(totalPlayers, numNetworkPlayers); // players without pInputs are BOTS
        this.curPlayer = curPlayer; // network
        this.curPlayerView = curPlayer; // view
        this.resetModel = this.#modelReset(); // the start model
        this.curModel = clone(this.resetModel); // time warp model, the current model is the init model
        this.ghostModel = {}; // NO time warp model, this model is for animation, doesn't interact with game
        this.trackView = [];
        this.carsView = [];
        this.mode = race_car_network.modeEnums.human;
        this.slotNames = slotNames;

        // build 3D scene
        this.infoParent = new Tree2("infoParent");
        this.gameParent = new Tree2("gameParent");
        this.gameParent.trans = [0, 0, 1];
        // move back a little for camera
        this.infoParent.trans = [0, 0, 1];
        root.linkchild(this.infoParent);

        // make info text
        this.infoTree = RaceGameNetwork.#buildTextInfo();
        this.infoParent.linkchild(this.infoTree);
        this.#updateInfo("hi ho!");

        // make game viewport
        this.gameViewPort = defaultviewport();
        mainvp.clearflags = 0;

        // make the track
        const track = race_track.buildtrack(race_trackData.race_track1);
        this.trackInfo = track.info;
        this.trackTree = track.tree;
        this.gameParent.linkchild(this.trackTree);

        // make the car
        this.carTreeRots = [];
        this.carTreeTranss = [];
        this.carTreeAttachs = [];
        this.carWedges = [];
        this.carBodies = [];
        for (let i = 0; i < this.numPlayers; ++i) {
            const car = race_car_network.buildCarView(i, numNetworkPlayers);
            this.carTreeRots.push(car.treeRot); // camera rigging
            this.carTreeTranss.push(car.treeTrans); // camera rigging
            this.carTreeAttachs.push(car.attachTree); // camera rigging
            this.carWedges.push(car.treeWedge);
            this.carBodies.push(car.treeBody);
            this.gameParent.linkchild(car.tree);
        }

        // camera types (views)
        RaceGameNetwork.cameraTypeStrs = [
            "static",
            "scroll",
            "rotScroll",
            "view3D",
        ];
        RaceGameNetwork.cameraTypeEnums = makeEnum(RaceGameNetwork.cameraTypeStrs);
        this.curCameraType = RaceGameNetwork.cameraTypeEnums.scroll;
        this.cameraZoom = .5;
        this.#changeCameraView();
        this.gameViewPort.camattach = this.carTreeAttachs[this.curPlayerView];
    }

    #changeCameraView() {
        switch(this.curCameraType) {
            case RaceGameNetwork.cameraTypeEnums.static:
                this.gameViewPort.incamattach = false;
                this.rotCam = false;
                viewportClearRotTrans(this.gameViewPort);
                break;
            case RaceGameNetwork.cameraTypeEnums.scroll:
                this.gameViewPort.incamattach = true;
                this.rotCam = false;
                viewportClearRotTrans(this.gameViewPort);
                break;
            case RaceGameNetwork.cameraTypeEnums.rotScroll:
                this.gameViewPort.incamattach = true;
                this.rotCam = true;
                viewportClearRotTrans(this.gameViewPort);
                break;
            case RaceGameNetwork.cameraTypeEnums.view3D:
                this.gameViewPort.trans = [0, -1.23, .475];
                this.gameViewPort.rot = [-1.25, 0, 0];
                break;
        }
    }
  
    // return initial model of the game
    #modelReset() {
        const carModel = race_car_network.buildCarModels(this.numPlayers);
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
        //mouse: pos and click
    */
    static modelMakeKeyCode(parent) {
        const ret = {};
        let keyCode = 0;
        // restart game
        if (input.key == 'g'.charCodeAt(0)) {
            keyCode += RaceGameNetwork.keyCodes.GO;
            ret.kc = keyCode;
            return ret;
        }
        switch(parent.mode) {
            case race_car_network.modeEnums.human:
                // move with arrow keys
                if (input.keystate[keycodes.LEFT]) keyCode += RaceGameNetwork.keyCodes.LEFT;
                if (input.keystate[keycodes.RIGHT]) keyCode += RaceGameNetwork.keyCodes.RIGHT;
                if (input.keystate[keycodes.UP]) keyCode += RaceGameNetwork.keyCodes.UP;
                if (input.keystate[keycodes.DOWN]) keyCode += RaceGameNetwork.keyCodes.DOWN;
                break;
            case race_car_network.modeEnums.ai:
            case race_car_network.modeEnums.revai:
                const aiNoTurnAng = 5 * CMath.PI / 180; // don't turn if almost heading in right direction
                const carModel = parent.curModel[parent.curPlayer];
                let dir = race_track.getAiTrack(race_trackData.race_track1, carModel.pos, parent.mode == race_car_network.modeEnums.revai);
                let deltaDir = normalangrad(dir - carModel.dir);
                keyCode |= RaceGameNetwork.keyCodes.UP;
                if (deltaDir >= aiNoTurnAng) {
                    keyCode |= RaceGameNetwork.keyCodes.RIGHT;
                } else if (deltaDir <= -aiNoTurnAng) {
                    keyCode |= RaceGameNetwork.keyCodes.LEFT;;
                }
                break;
            case race_car_network.modeEnums.none:
                break;
        }
        ret.kc = keyCode;
        return ret;
    }

    // let game decide what to do with predictions
    predictLogic(prevInput, frameNum) {
        //return prevInput; // full prediction
        //const kc = 0; // wait, no prediction
        //const kc = RaceGameNetwork.keyCodes.RIGHT; // test, predict right
        const kc = RaceGameNetwork.keyCodes.UP | prevInput.kc; // racing, always press GAS/up
        const ret = {kc: kc}
        return ret;
    }

    // timeWarp
    stepModel(pInputs, frameNum, valid) {
        race_car_network.procCars(this.curModel, pInputs, this);
        if (valid) { // no predictions, final status
            // update info about currently selected car
            const curCarModel = this.curModel[this.curPlayerView];
            const carStatus = curCarModel.discon ? "DISconnected" : "connected";
            let slotName = this.slotNames[this.curPlayerView];
            let modeStr = "";
            if (slotName) {
                modeStr = this.curPlayer == this.curPlayerView
                ? ", mode local " + race_car_network.modeStrs[this.mode]
                : ", mode network " + carStatus;
            } else {
                slotName = "BOT";
            }
            this.#updateInfo("car " + this.curPlayerView + " < " + slotName + " >"
                + modeStr
                + ", speed " + (curCarModel.speed * 5000).toFixed(1)
                + ", dir " + curCarModel.dir.toFixed(3));
        }
    }

    // no timeWarp, mainly for animation
    stepGhostModel(frameNum) {
    }

// model to view
    #m2v(i) {
        this.carTreeTranss[i].trans = this.curModel[i].pos.slice(); // update view
        if (this.rotCam) {
            this.carTreeTranss[i].rot[2] = -this.curModel[i].dir; // update view
            this.carTreeRots[i].rot[2] = 0; // update view
        } else {
            this.carTreeTranss[i].rot[2] = 0; // update view
            this.carTreeRots[i].rot[2] = -this.curModel[i].dir; // update view
        }
    }

    // M to V
    // get Model to this frameNum, then move it into View
    modelToView() {
        for (let i = 0; i < this.numPlayers; ++i) {
            this.#m2v(i); // model to view
        }
        // change view
        if (input.key == 'v'.charCodeAt()) {
            this.curCameraType = (this.curCameraType + 1) % RaceGameNetwork.cameraTypeStrs.length;
            this.#changeCameraView();
        }
        
        // change zoom
        if (this.curCameraType != RaceGameNetwork.cameraTypeEnums.view3D) {
            let delta = input.wheelDelta; // new with chrome, they now have non integer values
            const zf = 1.1;
            let watch = 0;
            while(delta) {
                if (watch > 20) {
                    console.log("watch hit!!");
                    break;
                }
                if (delta > 0) {
                    this.cameraZoom *= zf;
                    --delta;
                } else if (delta < 0) {
                    this.cameraZoom /= zf;
                    ++delta;
                }
                ++watch;
            }
            this.cameraZoom = range(1 / 8, this.cameraZoom, 8);
            this.gameViewPort.zoom = this.cameraZoom;
        } else {
            this.gameViewPort.zoom = 2;
        }

        // change car view
        let changeCarView = 0;
        if (input.key == ']'.charCodeAt()) {
            changeCarView = 1;
        } else if (input.key == '['.charCodeAt()) {
            changeCarView = -1;
        }
        if (changeCarView) {
            this.curPlayerView 
                = (this.curPlayerView + this.numPlayers + changeCarView) 
                % this.numPlayers;
            this.gameViewPort.camattach = this.carTreeAttachs[this.curPlayerView];
        }
        // change mode of self car (you)
        if (input.key == 'm'.charCodeAt()) {
            this.mode = (this.mode + 1) % race_car_network.modeStrs.length;
        }
    }

    draw() {
        // draw track and cars
        //doflycam(this.gameViewPort);
        beginscene(this.gameViewPort);
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
