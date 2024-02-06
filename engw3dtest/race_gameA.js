'use strict';

window.GameA = class GameA {
    static keyCodes = {
        UP: 1,
        DOWN: 2,
        RIGHT: 4,
        LEFT: 8,
        GO: 16,
    };

    // assume 1024 by 768 resolution
    constructor(numPlayers, curPlayer, root) {
        this.res = [1024, 768];
        this.margin = 30; // border
        this.size = 30; // radius
        this.viewDepth = glc.clientHeight / 2;
        this.numPlayers = numPlayers;
        this.numNpcsX = 4;
        this.numNpcsY = 6;
        this.numNpcs = this.numNpcsX * this.numNpcsY;
        this.resetModel = this.#modelReset(); // the start model
        this.curModel = clone(this.resetModel); // time warp model, the current model is the init model
        this.step = 25 / 6;
        this.ghostModel = {angle: 0 }; // NO time warp model, this model is for animation, doesn't interact with game
        this.curPlayerView = [];
        this.curNpcView = [];

        // build 3D scene
        const viewParent = new Tree2("viewParent");
        root.linkchild(viewParent);
        // players
        const treeMasterPlyaer = buildsphere("aplayer", this.size, "panel.jpg", "texc");
        treeMasterPlyaer.scale = [1, 1, .01];
        treeMasterPlyaer.mat.color = [.75, .75, .75, 1];
        viewParent.trans = [-glc.clientWidth / 2, -glc.clientHeight / 2, this.viewDepth];
        for (let s = 0; s < numPlayers; ++s) {
            const playerTree = treeMasterPlyaer.newdup();
            if (curPlayer == s) playerTree.mat.color = [1.5, 1.5, 1.5, 1]; // brighter color for self
            this.curPlayerView[s] = playerTree;
            viewParent.linkchild(playerTree);
        }
        treeMasterPlyaer.glfree();
        // npcs
        const treeMasterNpc = buildsphere("anpc", this.size, "panel.jpg", "texc");
        treeMasterNpc.scale = [1, 1, .01];
        treeMasterNpc.mat.color = [.25, .75, .25, 1];
        viewParent.trans = [-glc.clientWidth / 2, -glc.clientHeight / 2, this.viewDepth];
        for (let n = 0; n < this.numNpcs; ++n) {
            const npcTree = treeMasterNpc.newdup();
            this.curNpcView[n] = npcTree;
            viewParent.linkchild(npcTree);
        }
        treeMasterNpc.glfree();

        // add some ghosts
        // standard anim
        const square = buildplanexy("spinner", 20, 20, "maptestnck.png", "tex", 1, 1);
        square.trans = [80, 80, 0];
        square.rotvel = [0, 0, -Math.PI * 2 / 10];
        viewParent.linkchild(square);
        
        // custom anim
        this.squareG = buildplanexy("spinnerG", 20, 20, "maptestnck.png", "tex", 1, 1);
        viewParent.linkchild(this.squareG);

        // test sizes
        const block = buildprism("block",[this.size,this.size,this.size],"maptestnck.png","tex");
        block.trans = [100, 200, 0];
        block.scale = [1, 1, .01];
        viewParent.linkchild(block);

        const plane = buildplanexy("plane", this.size, this.size, "maptestnck.png", "tex", 1, 1);;
        plane.trans = [250, 200, 0];
        viewParent.linkchild(plane);

        const sphere = buildsphere("sphere",this.size,"maptestnck.png","tex");
        sphere.trans = [400, 200, 0];
        sphere.scale = [1, 1, .01];
        viewParent.linkchild(sphere);
        
    }

    getCurModel() {
        return clone(this.curModel);
    }

    setCurModel(model) {
        this.curModel = clone(model);
    }

    // return initial model of the game
    #modelReset() {
        const retModel = {
            players: Array(this.numPlayers),
            npcs: Array(this.numNpcs)
        };
        
        for (let slot = 0; slot < this.numPlayers; ++slot) {
            const player = {
                pos: [
                    200, 500 - slot * 75, 0,
                ],
                desiredPos: null // if mouse click
            }
            retModel.players[slot] = player;
        }
        let n = 0;
        for (let y = 0; y < this.numNpcsY; ++y) {
            for (let x = 0; x < this.numNpcsX; ++x) {
                const npc = {
                    pos: [
                        600 + x * 75, 500 - y * 75, 0,
                    ]
                }
                retModel.npcs[n++] = npc;
            }
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
        mouse: pos and click
    */
    static modelMakeKeyCode() {
        const ret = {};
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
            pos: [input.mx, input.my],
            click: input.mclick[0]
        }
        return ret;
    }

    // let game decide what to do with predictions
    predictLogic(prevInput, frameNum) {
        return prevInput; // full prediction
        //const kc = 0; // wait, no prediction
        //const kc = GameA.keyCodes.RIGHT; // test
        //const kc = GameA.keyCodes.UP | prevInput.kc; // racing, always press GAS
        //const ret = {kc: kc}
        //return kc;
    }

    static separate(pos0, pos1, distSep, extra) {
        const distSep2 = distSep * distSep;
        const dist2 = vec2.sqrDist(pos0, pos1);
        if (dist2 > distSep2) {
            return;
        }
        let delta;
        if (dist2 > 0) {
            delta = vec2.create();
            vec2.sub(delta, pos1, pos0);
            vec2.normalize(delta, delta);
        } else { // same position, separate horizontally
            delta = vec2.fromValues(0, 1);
        }
        vec2.scale(delta, delta, distSep * .5 * extra);
        const mid = vec2.create();
        vec2.add(mid, pos0, pos1);
        vec2.scale(mid, mid, .5); // midpoint is the average
        vec2.sub(pos0, mid, delta); // move out in opposite directions
        vec2.add(pos1, mid, delta);
    }

    // timeWarp
    stepModel(pInputs, frameNum) {
        // movement
        // players
        for (let slot = 0; slot < pInputs.length; ++slot) {
            const pInput = pInputs[slot];
            // keyboard
            const keyCode = pInput.kc;
            const curPlayer = this.curModel.players[slot];
            // reset game
            if (keyCode & GameA.keyCodes.GO) {
                this.curModel = clone(this.resetModel); // the current model is the init model
                curPlayer.desiredPos = null;
                return;
            }
            if (pInput.discon) {
                this.curPlayerView[slot].mat.color = [1.75, 0, 0, 1]; // disconnect color
                curPlayer.desiredPos = null;
                continue;
            }
            const step = this.step
            if (keyCode & GameA.keyCodes.RIGHT) {
                curPlayer.pos[0] += step;
                curPlayer.desiredPos = null;
            }
            if (keyCode & GameA.keyCodes.LEFT) {
                curPlayer.pos[0] -= step;
                curPlayer.desiredPos = null;
            }
            if (keyCode & GameA.keyCodes.UP) {
                curPlayer.pos[1] += step;
                curPlayer.desiredPos = null;
            }
            if (keyCode & GameA.keyCodes.DOWN) {
                curPlayer.pos[1] -= step;
                curPlayer.desiredPos = null;
            }
            if (pInput.mouse) {
                if (pInput.mouse.click) {
                    curPlayer.desiredPos = [
                        range(this.margin, pInput.mouse.pos[0], this.res[0] - this.margin),
                        range(this.margin, glc.clientHeight - pInput.mouse.pos[1], this.res[1] - this.margin)
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
        const extra = 1.01; // move apart a litte more

        // players to players
        for (let i = 0; i < pInputs.length; ++i) {
            const curPlayer0 = this.curModel.players[i];
            for (let j = i + 1; j < pInputs.length; ++j) {
                const curPlayer1 = this.curModel.players[j];
                // move players apart
                GameA.separate(curPlayer0.pos, curPlayer1.pos, 2 * this.size, extra);
            }
        }

        // players to npcs
        for (let i = 0; i < pInputs.length; ++i) {
            const curPlayer = this.curModel.players[i];
            for (let n = 0; n < this.curModel.npcs.length; ++n) {
                const npc = this.curModel.npcs[n];
                // move players and npcs apart
                GameA.separate(curPlayer.pos, npc.pos, 2 * this.size, extra);
            }
        }

        // npcs to npcs
        for (let n0 = 0; n0 < this.curModel.npcs.length; ++n0) {
            const npc0 = this.curModel.npcs[n0];
            for (let n1 = n0 + 1; n1 < this.curModel.npcs.length; ++n1) {
                const npc1 = this.curModel.npcs[n1];
                // move npcs and npcs apart
                GameA.separate(npc0.pos, npc1.pos, 2 * this.size, extra);
            }
        }

        // border to players
        for (let slot = 0; slot < pInputs.length; ++slot) {
            const curPlayer = this.curModel.players[slot];
            curPlayer.pos[0] = range(this.margin, curPlayer.pos[0], this.res[0] - this.margin);
            curPlayer.pos[1] = range(this.margin, curPlayer.pos[1], this.res[1] - this.margin);
        }

        // border to npcs
        for (let n = 0; n < this.curModel.npcs.length; ++n) {
            const npc = this.curModel.npcs[n];
            npc.pos[0] = range(this.margin, npc.pos[0], this.res[0] - this.margin);
            npc.pos[1] = range(this.margin, npc.pos[1], this.res[1] - this.margin);
        }

    }

    // no timeWarp, mainly for animation
    stepGhostModel(frameNum) {
        const ang = this.ghostModel.angle;
        const fpsw = fpswanted <= 0 ? 1 : fpswanted;
        this.ghostModel.angle += 2 * Math.PI / 10 / fpsw;
        this.ghostModel.angle = normalangrad(this.ghostModel.angle);
        this.squareG.trans = [60 * Math.cos(ang) + 80, -60 * Math.sin(ang) + 80 , 0];
    }

    // M to V
    // get Model to this frameNum, then move it into View
    modelToView() {
        // update the view from the model
        // players
        for (let slot = 0; slot < this.curModel.players.length; ++slot) {
            this.curPlayerView[slot].trans = vec3.clone(this.curModel.players[slot].pos);
        }
        // npcs
        for (let n = 0; n < this.curModel.npcs.length; ++n) {
            this.curNpcView[n].trans = vec3.clone(this.curModel.npcs[n].pos);
        }
    }
}
