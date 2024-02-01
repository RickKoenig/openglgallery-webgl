'use strict';

class GameWarp {

    constructor(numPlayers, curPlayer, gameStatic, root, doChecksum) {
        this.doChecksum = doChecksum;
        this.gameStatic = gameStatic;
        this.game = new gameStatic(numPlayers, curPlayer, root); // instance
        this.validModel = this.game.getCurModel(); // the current model is the init model
        this.validFrameNum = 0;
        this.inputs = [];
        for (let slot = 0; slot < numPlayers; ++slot) {
            const input = [
                {
                    kc: 0,
                    discon: false
                }
            ]; // one extra for prediction
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

    static #toHex(kc) {
        return kc.toString(16).toUpperCase().padStart(2,'0');
    }

    // C to M
    controlToModel(frameNum, slot, pInput) { // update input buffers with this data: TODO: remove frameNum
        const discon = pInput.discon;
        const input = this.inputs[slot];
        if (!discon && input.length - 1 + this.validFrameNum != frameNum) {
            alertS("AAA, frameNum " + frameNum + " != " 
                + input.length + " - 1 " + " + validFrameNum " 
                + this.validFrameNum + " !!!");
        }
        if (discon) {
            console.log("controlToModel: DISCONNECT slot " + slot);
        }
        input.push(pInput);
        //console.log("C2M: frameNum " + frameNum + ", slot " + slot + ", pInput.keycode " + GameWarp.#toHex(pInput.kc));
    }

    // M to V
    // get Model to this frameNum, then move it into View
    modelToView(frameNum) {
        //console.log("M2V: frameNum " + frameNum);
        // TIME WARP, step to current frameNum, even when all packets haven't arrived
        // start at valid frameNum and step to current frameNum
        // first rewind time to validFrameNum
        //console.log("step ghost model on frame " + frameNum);
        //this.game.stepGhostModel(frameNum);
        this.game.setCurModel(this.validModel);
        for (let frm = this.validFrameNum; frm < frameNum; ++frm) {
            const pInputs = [];
            let good = true; // not predicted, valid
            for (let slot = 0; slot < this.inputs.length; ++slot) {
                const input = this.inputs[slot];
                let pInput = {}; // default
                const inputLength = input.length - 1; // one extra, defaulted to 0's
                // have at least 1 input
                if (frm < this.validFrameNum) {
                    alert("frm " + frm + " < validFrameNum " + this.validFrameNum);
                    good = false; // should never happen
                } else if (frm - this.validFrameNum >= inputLength) { // predict if possible
                    pInput = input[inputLength]; // using last known keycode
                    if (pInput.discon) {
                        //console.log("discon");
                    } else {
                        pInput = this.game.predictLogic(pInput, frm); // let game decide predict
                        good = false;
                    }
                } else { // normal, in range, one extra
                    pInput = input[1 + frm - this.validFrameNum]; // still good
                }
                pInputs.push(pInput);
            }
            //console.log("step model on frame " + frm + " good = " + good);
            this.game.stepModel(pInputs, frm);

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
        // return all the new validModels for checksum
        const ret = clone(this.validModels);
        this.validModels = [];
        return ret;
    }
}
