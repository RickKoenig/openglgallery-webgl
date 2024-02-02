'use strict';

window.GameA = class GameA {
    static keyCodes = {
        UP: 1,
        DOWN: 2,
        RIGHT: 4,
        LEFT: 8,
        GO: 16,
    };

    // assume 1024 by 768 resolution
    constructor(numPlayers, curPlayer, root) {
        this.res = [1024, 768];
        this.viewDepth = glc.clientHeight / 2;
        this.numPlayers = numPlayers;
        this.resetModel = this.#modelReset(numPlayers); // the start model
        this.curModel = clone(this.resetModel); // time warp model, the current model is the init model
        this.ghostModel = {angle: 0 }; // NO time warp model, this model is for animation, doesn't interact with game
        this.curView = [];

        // build 3D scene
        const treeMaster = buildprism("aprism", [20, 20, 20], "panel.jpg", "texc");
        treeMaster.mat.color = [.75, .75, .75, 1];
        const viewParent = new Tree2("viewParent");
        viewParent.trans = [-glc.clientWidth / 2, -glc.clientHeight / 2, this.viewDepth];
        for (let s = 0; s < numPlayers; ++s) {
            const playerTree = treeMaster.newdup();
            if (curPlayer == s) playerTree.mat.color = [1.5, 1.5, 1.5, 1]; // brighter color for self
            this.curView[s] = playerTree;
            viewParent.linkchild(playerTree);
        }
        root.linkchild(viewParent);
        treeMaster.glfree();

        // add some ghosts
        // standard anim
        const square = buildplanexy("spinner", 3, 30, "Bark.png", "tex", 1, 1);
        square.trans = [0,30,0];
        const squareParent = new Tree2("spinnerParent");
        squareParent.trans = [100, 550 , 0];
        squareParent.rotvel = [0, 0, -Math.PI * 2 / 10];
        squareParent.linkchild(square);
        viewParent.linkchild(squareParent);
        
        // custom anim
        this.squareG = buildplanexy("spinnerG", 10, 10, "maptestnck.png", "tex", 1, 1);
        viewParent.linkchild(this.squareG);
    }

    getCurModel() {
        return clone(this.curModel);
    }

    setCurModel(model) {
        this.curModel = clone(model);
    }

    // return initial model of the game
    #modelReset(numPlayers) {
        const retModel = Array(this.numPlayers);
        for (let slot = 0; slot < numPlayers; ++slot) {
            const player = {
                pos: [
                    200, 500- slot * 75, 0,
                    //glc.clientWidth, glc.clientHeight, 0
                ],
                desiredPos: null // if mouse click
            }
            retModel[slot] = player;
        }
        return retModel;
    }

    // local input to keycode, helper
    // return object 
    /* 
        // SYSTEM
        discon: true, false
        // USER
        kc: bitfield of up, down, left, right
        mouse: pos and click
    */
    static modelMakeKeyCode(doDiscon) {
        const ret = {
            discon: doDiscon
        };
        if (doDiscon) {
            return ret;
        }
        let keyCode = 0;
        if (input.key == 'g'.charCodeAt(0)) { // restart game
            keyCode += GameA.keyCodes.GO;
            ret.kc = keyCode;
            return ret;
        }
        if (input.keystate[keycodes.LEFT]) keyCode += GameA.keyCodes.LEFT;
        if (input.keystate[keycodes.RIGHT]) keyCode += GameA.keyCodes.RIGHT;
        if (input.keystate[keycodes.UP]) keyCode += GameA.keyCodes.UP;
        if (input.keystate[keycodes.DOWN]) keyCode += GameA.keyCodes.DOWN;
        ret.kc = keyCode;
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
        //const kc = GameA.keyCodes.RIGHT; // test
        //const kc = GameA.keyCodes.UP | prevInput.kc; // racing, always press GAS
        //const ret = {kc: kc}
        //return kc;
    }

    // timeWarp
    stepModel(pInputs, frameNum) {
        for (let slot = 0; slot < pInputs.length; ++slot) {
            const pInput = pInputs[slot];
            const keyCode = pInput.kc;
            // reset game
            const curPlayer = this.curModel[slot];
            if (keyCode & GameA.keyCodes.GO) {
                this.curModel = clone(this.resetModel); // the current model is the init model
                curPlayer.desiredPos = null;
                return;
            }
            if (pInput.discon) {
                this.curView[slot].mat.color = [1.75, 0, 0, 1]; // disconnect color
                curPlayer.desiredPos = null;
                continue;
            }
            const step = 25;
            if (keyCode & GameA.keyCodes.RIGHT) {
                curPlayer.pos[0] += step;
                curPlayer.desiredPos = null;
            }
            if (keyCode & GameA.keyCodes.LEFT) {
                curPlayer.pos[0] -= step;
                curPlayer.desiredPos = null;
            }
            if (keyCode & GameA.keyCodes.UP) {
                curPlayer.pos[1] += step;
                curPlayer.desiredPos = null;
            }
            if (keyCode & GameA.keyCodes.DOWN) {
                curPlayer.pos[1] -= step;
                curPlayer.desiredPos = null;
            }
            if (pInput.mouse) {
                if (pInput.mouse.click) {
                    curPlayer.desiredPos = [
                        pInput.mouse.pos[0],
                        glc.clientHeight - pInput.mouse.pos[1]
                    ];
                }
            }
            // move to desiredPos
            if (curPlayer.desiredPos) {
                //const stepClose = .125;
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
        }
    }

    // no timeWarp, mainly for animation
    stepGhostModel(frameNum) {
        const ang = this.ghostModel.angle;
        const fpsw = fpswanted <= 0 ? 1 : fpswanted;
        this.ghostModel.angle += 2 * Math.PI / 10 / fpsw;
        this.ghostModel.angle = normalangrad(this.ghostModel.angle);
        this.squareG.trans = [60 * Math.sin(ang) + 100, 60 * Math.cos(ang) + 550 , 0];
    }

    // M to V
    // get Model to this frameNum, then move it into View
    modelToView() {
        // update the view from the model
        for (let slot = 0; slot < this.curModel.length; ++slot) {
            this.curView[slot].trans = vec3.clone(this.curModel[slot].pos);
        }
    }
}
