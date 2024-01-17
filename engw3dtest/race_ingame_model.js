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

    constructor(numPlayers, view, doChecksum) {
        this.doChecksum = doChecksum;
        this.resetModel = RaceModel.#modelReset(numPlayers); // the start model
        this.curModel = clone(this.resetModel); // the current model is the init model
        this.validModel = clone(this.resetModel); // last valid model with all inputs
        this.validFrameNum = 0;
        this.inputs = [];
        for (let slot = 0; slot < numPlayers; ++slot) {
            const input = [0]; // one extra for prediction
            this.inputs.push(input);
        }
        this.curView = view; // tree list for M to V
        if (this.doChecksum) {
            this.validModels = [
                {
                    frameNum: this.validFrameNum,
                    model: this.validModel
                }
            ];
        }
    }

    static #toHex(kc) {
        return kc.toString(16).toUpperCase().padStart(2,'0');
    }

    // return initial model of the game
    static #modelReset(numPlayers) {
        const ret = Array(numPlayers);
        for (let slot = 0; slot < numPlayers; ++slot) {
            const player = {
                pos: [
                    -3, 2 - .75 * slot, 5
                ]
            }
            ret[slot] = player;
        }
        return ret;
    }

    // local input to keycode, helper
    static modelMakeKeyCode(doDiscon) {
        let keyCode = 0;
        if (doDiscon) {
            keyCode += RaceModel.keyCodes.DISCONNECT;
            return keyCode;
        }
        if (input.key == 'g'.charCodeAt(0)) { // restart game
            keyCode += RaceModel.keyCodes.GO;
            return keyCode;
        }
        if (input.keystate[keycodes.LEFT]) keyCode += RaceModel.keyCodes.LEFT;
        if (input.keystate[keycodes.RIGHT]) keyCode += RaceModel.keyCodes.RIGHT;
        if (input.keystate[keycodes.UP]) keyCode += RaceModel.keyCodes.UP;
        if (input.keystate[keycodes.DOWN]) keyCode += RaceModel.keyCodes.DOWN;
        return keyCode;
    }

    #stepModel(playerKeyCodes) {
        for (let slot = 0; slot < playerKeyCodes.length; ++slot) {
            const keyCode = playerKeyCodes[slot];
            // reset game
            if (keyCode & RaceModel.keyCodes.GO) {
                this.curModel = clone(this.resetModel); // the current model is the init model
                return;
            }
            const step = .125;
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
    }

    // C to M
    controlToModel(frameNum, slot, keyCode) { // update input buffers with this data: TODO: remove frameNum
        const discon = keyCode & RaceModel.keyCodes.DISCONNECT;
        const input = this.inputs[slot];
        if (!discon && input.length - 1 + this.validFrameNum != frameNum) {
            alertS("frameNum " + frameNum + " != " + input.length + " - 1 " + " validFrameNum " + this.validFrameNum + " !!!");
        }
        if (discon) {
            console.log("controlToModel: DISCONNECT slot " + slot);
        }
        input.push(keyCode);
        //console.log("C2M: frameNum " + frameNum + ", slot " + slot + ", keycode " + RaceModel.#toHex(keyCode));
        if (discon) {
				this.curView[slot].mat.color = [.75, 0, 0, 1]; // disconnected color
                return;
        }
        // restart game
        if (keyCode & RaceModel.keyCodes.GO) {
            this.curModel = clone(this.resetModel); // the init model is set to the current model
            return;
        }
    }

    // M to V
    // get Model to this frameNum, then move it into View
    modelToView(frameNum) {
        //console.log("M2V: frameNum " + frameNum);
        // TIME WARP, step to current frameNum, even when all packets haven't arrived
        // start at valid frameNum and step to current frameNum
        // first rewind time to validFrameNum
        this.curModel = clone(this.validModel);
        for (let validFrmNum = this.validFrameNum; validFrmNum < frameNum; ++validFrmNum) {
            const playerKeyCodes = [];
            let good = true; // not predicted, valid
            for (let slot = 0; slot < this.inputs.length; ++slot) {
                const input = this.inputs[slot];
                let keyCode = 0; // default
                const inputLength = input.length - 1; // one extra
                // have at least 1 input
                if (validFrmNum < this.validFrameNum) {
                    alert("validFrmNum " + validFrmNum + " < validFrameNum " + this.validFrameNum);
                    good = false; // should never happen
                } else if (validFrmNum - this.validFrameNum >= inputLength) { // predict if possible
                    keyCode = input[inputLength]; // using last known keycode
                    if (!(keyCode & RaceModel.keyCodes.DISCONNECT)) {
                        good = false; // disconnected is good input
                    }
                } else { // normal, in range, one extra
                    keyCode = input[1 + validFrmNum - this.validFrameNum]; // still good
                }
                playerKeyCodes.push(keyCode);
            }
            this.#stepModel(playerKeyCodes);

            if (good) {
                // save a good validModel
                this.validModel = clone(this.curModel);
                ++this.validFrameNum;
                //console.log("good frame = " + this.validFrameNum);
                if (this.doChecksum) {
                    this.validModels.push ({
                        frameNum: this.validFrameNum,
                        model: this.validModel
                    });
                }
                // erase the past inputs that is no longer needed, Langoliers
                for (let slot = 0; slot < this.inputs.length; ++slot) {
                    const input = this.inputs[slot];
                    // keep at least 1 for discon
                    if (input.length > 1) {
                        input.shift(); // Langoliers
                    }
                }
            }
        }
        // update the view from the model
        for (let slot = 0; slot < this.curModel.length; ++slot) {
            this.curView[slot].trans = vec3.clone(this.curModel[slot].pos);
        }
        const ret = clone(this.validModels);
        this.validModels = [];
        return ret;
    }
}
