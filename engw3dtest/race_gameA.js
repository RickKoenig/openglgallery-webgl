'use strict';

class GameA {
    static keyCodes = {
        UP: 1,
        DOWN: 2,
        RIGHT: 4,
        LEFT: 8,
        GO: 16,
        DISCONNECT: 128
    };

    constructor(numPlayers, root) {
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
            if (race_ingame.mySlot == s) playerTree.mat.color = [1, 1, 1, 1]; // brighter color for self
            this.curView[s] = playerTree;
            root.linkchild(playerTree);
        }
        treeMaster.glfree();
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
            keyCode += GameA.keyCodes.DISCONNECT;
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

    stepModel(playerKeyCodes) {
        for (let slot = 0; slot < playerKeyCodes.length; ++slot) {
            const keyCode = playerKeyCodes[slot];
            // reset game
            if (keyCode & GameA.keyCodes.GO) {
                this.curModel = clone(this.resetModel); // the current model is the init model
                return;
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

    // C to M
    controlToModel(frameNum, slot, keyCode) { // update input buffers with this data: TODO: remove frameNum
        const discon = keyCode & GameA.keyCodes.DISCONNECT;
        const input = this.inputs[slot];
        if (!discon && input.length - 1 + this.validFrameNum != frameNum) {
            alertS("frameNum " + frameNum + " != " + input.length + " - 1 " + " validFrameNum " + this.validFrameNum + " !!!");
        }
        if (discon) {
            console.log("controlToModel: DISCONNECT slot " + slot);
        }
        input.push(keyCode);
        if (discon) {
			this.curView[slot].mat.color = [.75, 0, 0, 1]; // disconnected color
            return;
        }
        // restart game
        if (keyCode & GameA.keyCodes.GO) {
            this.curModel = clone(this.resetModel); // the init model is set to the current model
            return;
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
