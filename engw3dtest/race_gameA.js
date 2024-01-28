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
        this.curModel = clone(this.resetModel); // the current model is the init model
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
                ]
            }
            retModel[slot] = player;
        }
        return retModel;
    }

    // local input to keycode, helper
    static modelMakeKeyCode(doDiscon) {
        let keyCode = 0;
        if (doDiscon) {
            keyCode += GameWarp.keyCodes.DISCONNECT;
            return keyCode;
        }
        if (input.key == 'g'.charCodeAt(0)) { // restart game
            keyCode += GameA.keyCodes.GO;
            return keyCode;
        }
        if (input.keystate[keycodes.LEFT]) keyCode += GameA.keyCodes.LEFT;
        if (input.keystate[keycodes.RIGHT]) keyCode += GameA.keyCodes.RIGHT;
        if (input.keystate[keycodes.UP]) keyCode += GameA.keyCodes.UP;
        if (input.keystate[keycodes.DOWN]) keyCode += GameA.keyCodes.DOWN;
        return keyCode;
    }

    // let game decide what to do with predictions
    predictLogic(predKeyCode, frameNum) {
        return predKeyCode;
        //return 0;
        //return GameA.keyCodes.RIGHT;
        //return GameA.keyCodes.UP | predKeyCode;
    }

    stepModel(playerKeyCodes, frameNum) {
        for (let slot = 0; slot < playerKeyCodes.length; ++slot) {
            const keyCode = playerKeyCodes[slot];
            // reset game
            if (keyCode & GameA.keyCodes.GO) {
                this.curModel = clone(this.resetModel); // the current model is the init model
                return;
            }
            if (keyCode & GameWarp.keyCodes.DISCONNECT) {
                this.curView[slot].mat.color = [1.75, 0, 0, 1]; // disconnect color
                continue;
            }
            const step = .125;
            if (keyCode & GameA.keyCodes.RIGHT) {
                this.curModel[slot].pos[0] += step;
            }
            if (keyCode & GameA.keyCodes.LEFT) {
                this.curModel[slot].pos[0] -= step;
            }
            if (keyCode & GameA.keyCodes.UP) {
                this.curModel[slot].pos[1] += step;
            }
            if (keyCode & GameA.keyCodes.DOWN) {
                this.curModel[slot].pos[1] -= step;
            }
        }
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
