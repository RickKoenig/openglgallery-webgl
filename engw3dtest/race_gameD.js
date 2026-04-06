'use strict';

// run a networked test game, minimal, scratch
window.GameD = class GameD {
    static #keyCodes = {
        UP: 1,
        DOWN: 2,
        RIGHT: 4,
        LEFT: 8,
        GO: 16,
    };

    // assume 1024 by 768 resolution
    constructor(numPlayers, youPlayer, root) {
		mainvp.clearcolor = [.25 ,.55, 1, 1];
        this.res = [1024, 768];
        this.size = 80; // radius
        this.margin = this.size; // 300; // border
        this.viewDepth = glc.clientHeight / 2;
        this.numPlayers = numPlayers;

        this.resetModel = this.#modelReset(); // the start model
        this.curModel = clone(this.resetModel); // time warp model, the current model is the init model
        this.step = 4; // how fast players move
        const breakSync = false;
        if (breakSync) { 
            this.step += youPlayer; // give inconsistent results
        }
        this.curPlayerView = [];
        this.curDesiredView = [];
        this.curLineView = [];

        // build 3D scene
        const viewParent = new Tree2("viewParent");
        viewParent.trans = [-glc.clientWidth / 2, -glc.clientHeight / 2, this.viewDepth];
        root.linkchild(viewParent);
        // view players move
        const treeMasterPlayer = buildsphere("aplayer", this.size, "panel.jpg", "texc");
        treeMasterPlayer.scale = [1, 1, .01];
        treeMasterPlayer.mat.color = [.65, .65, .65, 1];
        // and desired move
        const treeMasterDesired = buildsphere("aDesiredNpc", this.size, "Bark.png", "texc");
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

    // return initial model of the game
    #modelReset() {
        const retModel = {
            players: Array(this.numPlayers),
        };
        // players
        for (let slot = 0; slot < this.numPlayers; ++slot) {
            const slotY = slot % 4;
            const slotX = Math.floor(slot / 4);
            const player = {
                pos: [
                    100 + slotX * 190, 100 + slotY * 190, 0,
                ],
                desiredPos: null // if mouse click
            }
            player.lastPos = vec3.clone(player.pos);
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
    /* 
        // USER
        kc: bitfield of up, down, left, right
        mouse: pos and click
    */
    static modelMakeKeyCode() {
        const ret = {};
        let keyCode = 0;
        // restart game
        if (input.key == 'g'.charCodeAt(0)) {
            keyCode += GameD.#keyCodes.GO;
            ret.kc = keyCode;
            return ret;
        }
        // move with arrow keys
        if (input.keystate[keycodes.LEFT]) keyCode += GameD.#keyCodes.LEFT;
        if (input.keystate[keycodes.RIGHT]) keyCode += GameD.#keyCodes.RIGHT;
        if (input.keystate[keycodes.UP]) keyCode += GameD.#keyCodes.UP;
        if (input.keystate[keycodes.DOWN]) keyCode += GameD.#keyCodes.DOWN;
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
        //const kc = GameD.#keyCodes.RIGHT; // test, predict right
        //const kc = GameD.#keyCodes.UP | prevInput.kc; // racing, always press GAS/up
        //const ret = {kc: kc}
        //return kc;
    }

    // move 2 circles apart, simple
    static #separate(posA, posB, distSep, extra) {
        const distSep2 = distSep * distSep;
        const dist2 = vec2.sqrDist(posA, posB);
        if (dist2 > distSep2) {
            return false;
        }
        let delta;
        if (dist2 > 0) {
            delta = vec2.create();
            vec2.sub(delta, posB, posA);
            vec2.normalize(delta, delta);
        } else { // same position, #separate horizontally
            delta = vec2.fromValues(0, 1);
        }
        vec2.scale(delta, delta, distSep * .5 * extra);
        const midPoint = vec2.create();
        vec2.add(midPoint, posA, posB);
        vec2.scale(midPoint, midPoint, .5); // midpoint is the average
        vec2.sub(posA, midPoint, delta); // move out in opposite directions
        vec2.add(posB, midPoint, delta);
        return true;
    }
    // timeWarp
    stepModel(pInputs, frameNum) {
        // movement
        // players
        for (let slot = 0; slot < pInputs.length; ++slot) {
            const pInput = pInputs[slot];
            const curPlayer = this.curModel.players[slot];
            vec3.copy(curPlayer.lastPos, curPlayer.pos);
            if (pInput.discon) {
                this.curPlayerView[slot].mat.color = [1.75, 0, 0, 1]; // disconnect color
                curPlayer.desiredPos = null;
                continue;
            }
            // keyboard
            const keyCode = pInput.kc;
            // reset game
            if (keyCode & GameD.#keyCodes.GO) {
                this.curModel = clone(this.resetModel); // the current model is the init model
                curPlayer.desiredPos = null;
                return;
            }
            const step = this.step
            if (keyCode & GameD.#keyCodes.RIGHT) {
                curPlayer.pos[0] += step;
                curPlayer.desiredPos = null;
            }
            if (keyCode & GameD.#keyCodes.LEFT) {
                curPlayer.pos[0] -= step;
                curPlayer.desiredPos = null;
            }
            if (keyCode & GameD.#keyCodes.UP) {
                curPlayer.pos[1] += step;
                curPlayer.desiredPos = null;
            }
            if (keyCode & GameD.#keyCodes.DOWN) {
                curPlayer.pos[1] -= step;
                curPlayer.desiredPos = null;
            }
            if (pInput.mouse) {
                if (pInput.mouse.click) {
                    curPlayer.desiredPos = [
                        range(this.margin, pInput.mouse.pos[0], this.res[0] - this.margin),
                        range(this.margin, glc.clientHeight - pInput.mouse.pos[1], this.res[1] - this.margin),
                        0
                    ];
                }
            }
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
        }

        // collisions
        const extra = 1.001; // move apart a litte more

        // players to players
        for (let p0 = 0; p0 < pInputs.length; ++p0) {
            const curPlayer0 = this.curModel.players[p0];
            for (let p1 = p0 + 1; p1 < pInputs.length; ++p1) {
                const curPlayer1 = this.curModel.players[p1];
                // move players apart
                GameD.#separate(curPlayer0.pos, curPlayer1.pos, 2 * this.size, extra);
            }
        }

        // border to players
        for (let p = 0; p < pInputs.length; ++p) {
            const curPlayer = this.curModel.players[p];
            curPlayer.pos[0] = range(this.margin, curPlayer.pos[0], this.res[0] - this.margin);
            curPlayer.pos[1] = range(this.margin, curPlayer.pos[1], this.res[1] - this.margin);
        }
    }

    // M to V
    // get Model to this frameNum, then move it into View
    modelToView() {
        // update the view from the model
        // players
        for (let slot = 0; slot < this.curModel.players.length; ++slot) {
            const curPlayer = this.curModel.players[slot];
            this.curPlayerView[slot].trans = vec3.clone(curPlayer.pos);
            const dTree = this.curDesiredView[slot];
            const lTree = this.curLineView[slot];
            if (curPlayer.desiredPos) {
                dTree.trans = vec3.clone(curPlayer.desiredPos);
                lTree.trans = vec3.clone(curPlayer.desiredPos);
                lTree.rot = [0, 0, Math.atan2(curPlayer.pos[1] 
                    - curPlayer.desiredPos[1], curPlayer.pos[0] - curPlayer.desiredPos[0])];
                const dist = vec2.dist(curPlayer.pos, curPlayer.desiredPos);
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
