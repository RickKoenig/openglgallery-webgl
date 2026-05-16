'use strict';

// timewarp for 1 player, simple stuff
// stripped down version of GameWarp for standalone, no networking
class GameWarp_standalone {
    constructor(numPlayers, curPlayer, gameStatic, root, slotNames) {
        this.gameStatic = gameStatic;
        this.game = new gameStatic(numPlayers, curPlayer, root, slotNames); // instance
        this.validModel = this.game.getCurModel(); // the current model is the init model
    }

    // C to M
    controlToModel(frameNum, slot, pInput) { // update input buffers with this data: TODO: remove frameNum
        this.pInput = pInput;
    }

    // M to V
    // get Model to this frameNum, then move it into View
    modelToView(frameNum) {
        this.game.setCurModel(this.validModel);
        const pInputs = [this.pInput];
        this.game.stepModel(pInputs, frm);
        this.validModel = this.game.getCurModel();
        // update the view from the model
        this.game.modelToView();
    }

    // finer control over multi viewports
    draw() {
        this.game.draw();
    }

    exit() {
        this.game.exit();
    }
}
