'use strict';

window.GameA = class GameA {
    static keyCodes = {
        UP: 1,
        DOWN: 2,
        RIGHT: 4,
        LEFT: 8,
        GO: 16,
        //DISCONNECT: 128
    };

    constructor(numPlayers, curPlayer, root) {
        this.numPlayers = numPlayers;
        this.resetModel = GameA.#modelReset(numPlayers); // the start model
        this.curModel = clone(this.resetModel); // time warp model, the current model is the init model
        this.ghostModel = null; // NO time warp model, this model is for animation, doesn't interact with game
        this.curView = [];
        // build 3D scene
        const treeMaster = buildprism("aprism", [.5, .5, .5], "panel.jpg", "texc");
        treeMaster.mat.color = [.75, .75, .75, 1];
        for (let s = 0; s < numPlayers; ++s) {
            const playerTree = treeMaster.newdup();
            playerTree.scale = [.3, .3, .3];
            if (curPlayer == s) playerTree.mat.color = [1, 1, 1, 1]; // brighter color for self
            this.curView[s] = playerTree;
            root.linkchild(playerTree);
        }
        treeMaster.glfree();
    }

    getCurModel() {
        return clone(this.curModel);
    }

    setCurModel(model) {
        this.curModel = clone(model);
    }

    // return initial model of the game
    static #modelReset(numPlayers) {
        const retModel = Array(this.numPlayers);
        for (let slot = 0; slot < numPlayers; ++slot) {
            const player = {
                pos: [
                    -3, 2 - .75 * slot, 5
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
            pos: [input.fmx, input.fmy],
            click: input.mclick[0]
        }
        return ret;
    }

    // let game decide what to do with predictions
    predictLogic(prevInput, frameNum) {
        return prevInput; // full prediction
        //const kc = 0; // wait
        //const kc = GameA.keyCodes.RIGHT; // test
        //const kc = GameA.keyCodes.UP | prevInput.kc; // racing
        //const ret = {kc: kc}
        return kc;
    }

    // timeWarp
    stepModel(pInputs, frameNum) {
        for (let slot = 0; slot < pInputs.length; ++slot) {
            const pInput = pInputs[slot];
            const keyCode = pInput.kc;
            // reset game
            if (keyCode & GameA.keyCodes.GO) {
                this.curModel = clone(this.resetModel); // the current model is the init model
                return;
            }
            if (pInput.discon) {
                this.curView[slot].mat.color = [1.75, 0, 0, 1]; // disconnect color
                continue;
            }
            const step = .125;
            const curPlayer = this.curModel[slot];
            if (keyCode & GameA.keyCodes.RIGHT) {
                curPlayer.pos[0] += step;
            }
            if (keyCode & GameA.keyCodes.LEFT) {
                curPlayer.pos[0] -= step;
            }
            if (keyCode & GameA.keyCodes.UP) {
                curPlayer.pos[1] += step;
            }
            if (keyCode & GameA.keyCodes.DOWN) {
                curPlayer.pos[1] -= step;
            }
            if (pInput.mouse) {
                if (pInput.mouse.click) {
                    curPlayer.desiredPos = Array(2);
                    vec2.scale(curPlayer.desiredPos, pInput.mouse.pos, 5);
                }
            }
            // move to desiredPos
            if (curPlayer.desiredPos) {
                const stepClose = .125;
                const close2 = stepClose * stepClose * .5;
                const dist2 = vec2.sqrDist(curPlayer.desiredPos, curPlayer.pos);
                if (dist2 < close2) {
                    vec2.copy(curPlayer.pos, curPlayer.desiredPos);
                    curPlayer.desiredPos = null;
                } else {
                    const delta = vec2.create();
                    vec2.sub(delta, curPlayer.desiredPos, curPlayer.pos);
                    vec2.normalize(delta, delta);
                    vec2.scale(delta, delta, stepClose);
                    vec2.add(curPlayer.pos, curPlayer.pos, delta);
                }
            }
        }
    }

    // no timeWarp, mainly for animation
    stepGhostModel(frameNum) {
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
