'use strict';

class GameWarp {
    static keyCodes = {
/*        UP: 1,
        DOWN: 2,
        RIGHT: 4,
        LEFT: 8,
        GO: 16, */
        DISCONNECT: 128
    };

    constructor(numPlayers, curPlayer, gameStatic, root, doChecksum) {
        this.doChecksum = doChecksum;
        this.gameStatic = gameStatic;
        this.game = new gameStatic(numPlayers, curPlayer, root); // instance
        this.validModel = this.game.getCurModel(); // the current model is the init model
        this.validFrameNum = 0;
        this.inputs = [];
        for (let slot = 0; slot < numPlayers; ++slot) {
            const input = [0]; // one extra for prediction
            this.inputs.push(input);
        }
        if (this.doChecksum) {
            this.validModels = [
                {
                    frameNum: this.validFrameNum,
                    model: this.validModel
                }
            ];
        }
    }

    // C to M
    controlToModel(frameNum, slot, keyCode) { // update input buffers with this data: TODO: remove frameNum
        const discon = keyCode & GameWarp.keyCodes.DISCONNECT;
        const input = this.inputs[slot];
        if (!discon && input.length - 1 + this.validFrameNum != frameNum) {
            alertS("frameNum " + frameNum + " != " + input.length + " - 1 " + " validFrameNum " + this.validFrameNum + " !!!");
        }
        if (discon) {
            console.log("controlToModel: DISCONNECT slot " + slot);
        }
        input.push(keyCode);
        //console.log("C2M: frameNum " + frameNum + ", slot " + slot + ", keycode " + GameWarp.#toHex(keyCode));
        /*if (discon) {
				this.curView[slot].mat.color = [.75, 0, 0, 1]; // disconnected color
                return;
        }*/
        /*
        // restart game
        if (keyCode & GameWarp.keyCodes.GO) {
            this.curModel = clone(this.resetModel); // the init model is set to the current model
            return;
        } */
    }

    // M to V
    // get Model to this frameNum, then move it into View
    modelToView(frameNum) {
        //console.log("M2V: frameNum " + frameNum);
        // TIME WARP, step to current frameNum, even when all packets haven't arrived
        // start at valid frameNum and step to current frameNum
        // first rewind time to validFrameNum
        this.game.setCurModel(this.validModel);
        for (let validFrmNum = this.validFrameNum; validFrmNum < frameNum; ++validFrmNum) {
            const playerKeyCodes = [];
            let good = true; // not predicted, valid
            for (let slot = 0; slot < this.inputs.length; ++slot) {
                const input = this.inputs[slot];
                let keyCode = 0; // default
                const inputLength = input.length - 1; // one extra, defaulted to 0's
                // have at least 1 input
                if (validFrmNum < this.validFrameNum) {
                    alert("validFrmNum " + validFrmNum + " < validFrameNum " + this.validFrameNum);
                    good = false; // should never happen
                } else if (validFrmNum - this.validFrameNum >= inputLength) { // predict if possible
                    keyCode = input[inputLength]; // using last known keycode
                    if (keyCode & GameWarp.keyCodes.DISCONNECT) {
                        console.log("discon");
                        good = true; // disconnected is good input
                    } else {
                        good = false;
                    }
                } else { // normal, in range, one extra
                    keyCode = input[1 + validFrmNum - this.validFrameNum]; // still good
                }
                playerKeyCodes.push(keyCode);
            }
            this.game.stepModel(playerKeyCodes);

            if (good) {
                // nothing predicted, save a good validModel
                this.validModel = this.game.getCurModel();
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
        this.game.modelToView();
        // return all the new validModels
        const ret = clone(this.validModels);
        this.validModels = [];
        return ret;
    }
}
