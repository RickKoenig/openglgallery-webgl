'use strict';

// run a networked test game, fixed point
window.GameC = class GameC {
    static keep = true;
    static #keyCodes = {
        UP: 1,
        DOWN: 2,
        RIGHT: 4,
        LEFT: 8,
        GO: 16,
    };

    // assume 1024 by 768 resolution
    constructor(numPlayers, youPlayer, root) {
        this.FP = new FMathBigIntInstanceALT(3, 16); // fixed point
		mainvp.clearcolor = [.75 ,.55, 1, 1];
        const size = 80;
        if (GameC.keep) {
            this.res = [1024, 768];
            this.size = size; // radius
            this.margin = size; // 300; // border
            this.FrightMargin = this.FP.create(this.res[0] - this.size);
            this.FbotMargin = this.FP.create(this.res[1] - this.size);
            this.FtopLeftMargin = this.FP.create(this.margin);
            this.viewDepth = glc.clientHeight / 2;
        }
        this.numPlayers = numPlayers;

        this.resetModel = this.#modelReset(); // the start model
        this.curModel = clone(this.resetModel); // time warp model, the current model is the init model
        this.step = this.FP.create(4); // how fast players move


        const breakSync = false;
        if (breakSync) { 
            //this.step += youPlayer; // give inconsistent results
            this.step = this.FP.add(this.step, this.FP.create(youPlayer));
            
            //this.curModel.players[youPlayer].pos[0] += 15;
            this.curModel.players[youPlayer].pos[0] 
                = this.FP.add(this.curModel.players[youPlayer].pos[0], this.FP.create(15));
        }


        if (GameC.keep) {
            this.curPlayerView = [];
            this.curDesiredView = [];
            this.curLineView = [];
        }

        if (GameC.keep) {
            // build 3D scene
            const viewParent = new Tree2("viewParent");
            viewParent.trans = [-glc.clientWidth / 2, -glc.clientHeight / 2, this.viewDepth];
            root.linkchild(viewParent);
            // view players move
            const treeMasterPlayer = buildsphere("aplayer", size, "panel.jpg", "texc");
            treeMasterPlayer.scale = [1, 1, .01];
            treeMasterPlayer.mat.color = [.65, .65, .65, 1];
            // and desired move
            const treeMasterDesired = buildsphere("aDesiredNpc", size, "Bark.png", "texc");
            treeMasterDesired.scale = [1, 1, .01];
            treeMasterDesired.mat.color = [.65, .65, .65, 1];
            // and connecting line
            const treeMasterLine = new Tree2("aplane");
            const treeOffset = buildplanexy("aplaneOffset", 1, 1, "maptestnck.png", "tex");
            treeOffset.trans = [1, 0, 0];
            treeMasterLine.scale = [1, 3, 1];
            treeMasterLine.rot = [0, 0, 0];
            treeMasterLine.linkchild(treeOffset);

            for (let s = 0; s < numPlayers; ++s) {
                const playerTree = treeMasterPlayer.newdup();
                const desiredTree = treeMasterDesired.newdup();
                const lineTree = treeMasterLine.newdup();
                if (youPlayer == s) {
                    playerTree.mat.color = [1, 1, 1, 1]; // brighter color for self
                    desiredTree.mat.color = [1, 1, 1, 1]; // brighter color for self
                }
                this.curPlayerView[s] = playerTree;
                this.curDesiredView[s] = desiredTree;
                this.curLineView[s] = lineTree;
                viewParent.linkchild(playerTree);
                viewParent.linkchild(desiredTree);
                viewParent.linkchild(lineTree);
            }
            treeMasterPlayer.glfree();
            treeMasterDesired.glfree();
            treeMasterLine.glfree();
        }
    }

    // return initial model of the game
    #modelReset() {
        const retModel = {
            players: Array(this.numPlayers),
        };
        // players
        for (let slot = 0; slot < this.numPlayers; ++slot) {
            const slotY = slot % 4;
            const slotX = Math.floor(slot / 4);
            const pos = [this.FP.create(100 + slotX * 190), this.FP.create(100 + slotY * 190)];
            const player = {
                pos: pos,
                desiredPos: null // if mouse click
            };
            retModel.players[slot] = player;
        }
        return retModel;
    }

    getCurModel() {
        return clone(this.curModel);
    }

    setCurModel(model) {
        this.curModel = clone(model);
    }

    // local input to keycode, helper
    // return object 
    //
        // USER
    //    kc: bitfield of up, down, left, right
    //    mouse: pos and click
    //
    static modelMakeKeyCode() {
        const ret = {};
        let keyCode = 0;
        // restart game
        if (input.key == 'g'.charCodeAt(0)) {
            keyCode += GameC.#keyCodes.GO;
            ret.kc = keyCode;
            return ret;
        }
        // move with arrow keys
        if (input.keystate[keycodes.LEFT]) keyCode += GameC.#keyCodes.LEFT;
        if (input.keystate[keycodes.RIGHT]) keyCode += GameC.#keyCodes.RIGHT;
        if (input.keystate[keycodes.UP]) keyCode += GameC.#keyCodes.UP;
        if (input.keystate[keycodes.DOWN]) keyCode += GameC.#keyCodes.DOWN;
        ret.kc = keyCode;
        // move with mouse
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
        //const kc = GameC.#keyCodes.RIGHT; // test, predict right
        //const kc = GameC.#keyCodes.UP | prevInput.kc; // racing, always press GAS/up
        //const ret = {kc: kc}
        //return kc;
    }

    // timeWarp
    stepModel(pInputs, frameNum) {
        //return;
        // movement
        // players
        for (let slot = 0; slot < pInputs.length; ++slot) {
            const pInput = pInputs[slot];
            const curPlayer = this.curModel.players[slot];
            if (pInput.discon) {
                this.curPlayerView[slot].mat.color = [1.75, 0, 0, 1]; // disconnect color
                curPlayer.desiredPos = null;
                continue;
            }
            // keyboard
            const keyCode = pInput.kc;
            // reset game
            if (keyCode & GameC.#keyCodes.GO) {
                this.curModel = clone(this.resetModel); // the current model is the init model
                curPlayer.desiredPos = null;
                return;
            }
            const step = this.step
            if (keyCode & GameC.#keyCodes.RIGHT) {
                //curPlayer.pos[0] += step;
                curPlayer.pos[0] = this.FP.add(curPlayer.pos[0], step);
                curPlayer.desiredPos = null;
            }
            if (keyCode & GameC.#keyCodes.LEFT) {
                //curPlayer.pos[0] -= step;
                curPlayer.pos[0] = this.FP.sub(curPlayer.pos[0], step);
                curPlayer.desiredPos = null;
            }
            if (keyCode & GameC.#keyCodes.UP) {
                //curPlayer.pos[1] += step;
                curPlayer.pos[1] = this.FP.add(curPlayer.pos[1], step);
                curPlayer.desiredPos = null;
            }
            if (keyCode & GameC.#keyCodes.DOWN) {
                //curPlayer.pos[1] -= step;
                curPlayer.pos[1] = this.FP.sub(curPlayer.pos[1], step);
                curPlayer.desiredPos = null;
            }
            if (pInput.mouse) {
                if (pInput.mouse.click) {
                    let x = this.FP.create(pInput.mouse.pos[0]);
                    let y = this.FP.create(glc.clientHeight - 1 - pInput.mouse.pos[1]);
                    x = this.FP.range(this.FtopLeftMargin, x, this.FrightMargin);
                    y = this.FP.range(this.FtopLeftMargin, y, this.FbotMargin);
                    curPlayer.desiredPos = [x, y];
                    console.log("desired pos = " + this.FP.toNumber(x) + ", " + this.FP.toNumber(y));
                }
            }
            /*
            // mouse, move to desiredPos
            if (curPlayer.desiredPos) {
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
            */
        }

        // collisions
        const extra = 1.001; // move apart a litte more

        // border to players
        for (let p = 0; p < pInputs.length; ++p) {
            const curPlayer = this.curModel.players[p];
            curPlayer.pos[0] = this.FP.range(this.FtopLeftMargin, curPlayer.pos[0], this.FrightMargin);
            curPlayer.pos[1] = this.FP.range(this.FtopLeftMargin, curPlayer.pos[1], this.FbotMargin);
        }
    }

    // M to V
    // get Model to this frameNum, then move it into View
    modelToView() {
        if (!GameC.keep) {
            return;
        }
        // update the view from the model
        // players
        for (let slot = 0; slot < this.curModel.players.length; ++slot) {
            const curPlayer = this.curModel.players[slot];
            const pTree = this.curPlayerView[slot];
            pTree.trans = vec2Fix.toNumber(curPlayer.pos, this.FP);
            const dTree = this.curDesiredView[slot];
            const lTree = this.curLineView[slot];
            if (curPlayer.desiredPos) {
                dTree.trans = vec2Fix.toNumber(curPlayer.desiredPos, this.FP);
                lTree.trans = vec3.clone(dTree.trans);
                lTree.rot = [0, 0, Math.atan2(
                      pTree.trans[1] - dTree.trans[1]
                    , pTree.trans[0] - dTree.trans[0])
                ];
                const dist = vec2.dist(pTree.trans, dTree.trans);
                lTree.scale[0] = dist / 2;

                dTree.flags &= ~treeflagenums.DONTDRAWC;	
                lTree.flags &= ~treeflagenums.DONTDRAWC;	
            } else {
                dTree.flags |= treeflagenums.DONTDRAWC;	
                lTree.flags |= treeflagenums.DONTDRAWC;
            }
        }
    }

    // finer control over multi viewports
    draw() {
    }

    exit() {
    }
}
