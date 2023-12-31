'use strict';

class RaceModel {
    static keyCodes = {
        UP: 1,
        DOWN: 2,
        RIGHT: 4,
        LEFT: 8,
        GO: 16,
        DISCONNECT: 128
    };

    constructor(numPlayers, view) {
        this.resetModel = this.modelReset(numPlayers); // the start model
        this.curModel = clone(this.resetModel); // the current model is the init model
        this.discon = Array(numPlayers); // array of disconnects
        this.curView = view; // tree list for M to V
    }

    modelReset(numPlayers) {
        const ret = Array(numPlayers);
        for (let i = 0; i < numPlayers; ++i) {
            const player = {
                pos: [
                    i * .75 - 3, -3, 5
                ]
            }
            ret[i] = player;
        }
        return ret;
    }

    static modelMakeKeyCode(doDiscon) {
        let keyCode = 0;
        if (doDiscon) {
            keyCode += RaceModel.keyCodes.DISCONNECT;
            return keyCode;
        }
        if (input.key == 'g'.charCodeAt(0)) {
            keyCode += RaceModel.keyCodes.GO;
            return keyCode;
        }
        if (input.keystate[keycodes.LEFT]) keyCode += RaceModel.keyCodes.LEFT;
        if (input.keystate[keycodes.RIGHT]) keyCode += RaceModel.keyCodes.RIGHT;
        if (input.keystate[keycodes.UP]) keyCode += RaceModel.keyCodes.UP;
        if (input.keystate[keycodes.DOWN]) keyCode += RaceModel.keyCodes.DOWN;
        return keyCode;
    }

    // C to M
    controlToModel(frame, slot, keyCode) { // update model with this frame, TODO: implement frame
        if (keyCode & RaceModel.keyCodes.DISCONNECT) {
				this.curView[slot].mat.color = [.75, 0, 0, 1]; // disconnected color
                this.discon[slot] = true;
                return;
        }
        // reset game
        if (keyCode & RaceModel.keyCodes.GO) {
            this.curModel = clone(this.resetModel); // the current model is the init model
            return;
        }
        const step = .025;
        if (keyCode & RaceModel.keyCodes.RIGHT) {
            this.curModel[slot].pos[0] += step;
        }
        if (keyCode & RaceModel.keyCodes.LEFT) {
            this.curModel[slot].pos[0] -= step;
        }
        if (keyCode & RaceModel.keyCodes.UP) {
            this.curModel[slot].pos[1] += step;
        }
        if (keyCode & RaceModel.keyCodes.DOWN) {
            this.curModel[slot].pos[1] -= step;
        }
    }

    // M to V
    modelToView(frame) {
        for (i = 0; i < this.curModel.length; ++i) {
            this.curView[i].trans = vec3.clone(this.curModel[i].pos);
        }
    }
}
