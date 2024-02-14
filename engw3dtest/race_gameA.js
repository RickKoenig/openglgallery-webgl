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
        // push these npcs around
        this.numDummyNpcsX = 4;
        this.numDummyNpcsY = 6;
        this.numDummyNpcs = this.numDummyNpcsX * this.numDummyNpcsY;
        // these npcs move and push everything else
        this.numMoveNpcsX = 3;
        this.numMoveNpcsY = 6;
        this.numMoveNpcs = this.numMoveNpcsX * this.numMoveNpcsY;

        this.resetModel = this.#modelReset(); // the start model
        this.curModel = clone(this.resetModel); // time warp model, the current model is the init model
        this.step = 4; // how fast players move
        this.ghostModel = {angle: 0 }; // NO time warp model, this model is for animation, doesn't interact with game
        this.curPlayerView = [];
        this.curDummyNpcView = [];
        this.curMoveNpcView = [];

        // build 3D scene
        const viewParent = new Tree2("viewParent");
        root.linkchild(viewParent);
        // view players
        const treeMasterPlayer = buildsphere("aplayer", this.size, "panel.jpg", "texc");
        treeMasterPlayer.scale = [1, 1, .01];
        treeMasterPlayer.mat.color = [.75, .75, .75, 1];
        viewParent.trans = [-glc.clientWidth / 2, -glc.clientHeight / 2, this.viewDepth];
        for (let s = 0; s < numPlayers; ++s) {
            const playerTree = treeMasterPlayer.newdup();
            if (curPlayer == s) playerTree.mat.color = [1.5, 1.5, 1.5, 1]; // brighter color for self
            this.curPlayerView[s] = playerTree;
            viewParent.linkchild(playerTree);
        }
        treeMasterPlayer.glfree();
        // view npcsDummy
        const treeMasterDummyNpc = buildsphere("aDummynpc", this.size, "panel.jpg", "texc");
        treeMasterDummyNpc.scale = [1, 1, .01];
        treeMasterDummyNpc.mat.color = [.25, .75, .25, 1];
        for (let n = 0; n < this.numDummyNpcs; ++n) {
            const npcDummyTree = treeMasterDummyNpc.newdup();
            this.curDummyNpcView[n] = npcDummyTree;
            viewParent.linkchild(npcDummyTree);
        }
        treeMasterDummyNpc.glfree();
        
        // view npcsMove
        const treeMasterMoveNpc = buildsphere("aMovenpc", this.size, "panel.jpg", "texc");
        treeMasterMoveNpc.scale = [1, 1, .01];
        treeMasterMoveNpc.mat.color = [1.25, .25, 1.25, 1];
        for (let n = 0; n < this.numMoveNpcs; ++n) {
            const npcMoveTree = treeMasterMoveNpc.newdup();
            this.curMoveNpcView[n] = npcMoveTree;
            viewParent.linkchild(npcMoveTree);
        }
        treeMasterMoveNpc.glfree();

        // add some ghosts
        // standard anim
        const square = buildplanexy("spinner", this.size / 2, this.size / 2, "maptestnck.png", "tex", 1, 1);
        square.trans = [50, 50, 0];
        square.rotvel = [0, 0, -Math.PI * 2 / 10];
        viewParent.linkchild(square);
        
        // custom anim
        this.squareG = buildplanexy("spinnerG", this.size / 2, this.size / 2, "maptestnck.png", "tex", 1, 1);
        viewParent.linkchild(this.squareG);

        // test sizes
        const block = buildprism("block",[this.size / 2,this.size / 2,this.size / 2],"maptestnck.png","tex");
        block.trans = [150, 50, 0];
        block.scale = [1, 1, .01];
        viewParent.linkchild(block);

        const plane = buildplanexy("plane", this.size / 2, this.size / 2, "maptestnck.png", "tex", 1, 1);;
        plane.trans = [200, 50, 0];
        viewParent.linkchild(plane);

        const sphere = buildsphere("sphere",this.size / 2,"maptestnck.png","tex");
        sphere.trans = [250, 50, 0];
        sphere.scale = [1, 1, .01];
        viewParent.linkchild(sphere);
        
    }

    #setNpcsMoving(retModel) {
        const angOffset = retModel.npcsMovingAngle;
        let n = 0;
        const center = [700, 384];
        const startX = 100;
        const stepX = 60;
        for (let j = 0; j < this.numMoveNpcsY; ++j) {
            const ang = j * 2 * Math.PI / this.numMoveNpcsY + angOffset;
            const cosAng = Math.cos(ang);
            const sinAng = Math.sin(ang);
            for (let i = 0; i < this.numMoveNpcsX; ++i) {
                const rad = startX + stepX * i;
                const npc = {
                    pos: [
                        center[0] + cosAng * rad,
                        center[1] + sinAng * rad,
                        0
                    ]
                }
                retModel.npcsMoving[n++] = npc;
            }
        }
    }

    // return initial model of the game
    #modelReset() {
        const retModel = {
            players: Array(this.numPlayers),
            npcsDummy: Array(this.numDummyNpcs),
            npcsMoving: Array(this.numMovingNpcs),
            npcsMovingAngle: 0
        };
        // players
        for (let slot = 0; slot < this.numPlayers; ++slot) {
            const player = {
                pos: [
                    50, 550 - slot * 75, 0,
                ],
                desiredPos: null // if mouse click
            }
            player.lastPos = vec3.clone(player.pos);
            retModel.players[slot] = player;
        }
        // npc dummys
        let n = 0;
        for (let y = 0; y < this.numDummyNpcsY; ++y) {
            for (let x = 0; x < this.numDummyNpcsX; ++x) {
                const npc = {
                    pos: [
                        //700 + x * 75, 550 - y * 75, 0,
                        150 + x * 75, 550 - y * 75, 0,
                    ]
                }
                retModel.npcsDummy[n++] = npc;
            }
        }
        // npc moves
        this.#setNpcsMoving(retModel);
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
            keyCode += GameA.keyCodes.GO;
            ret.kc = keyCode;
            return ret;
        }
        // move with arrow keys
        if (input.keystate[keycodes.LEFT]) keyCode += GameA.keyCodes.LEFT;
        if (input.keystate[keycodes.RIGHT]) keyCode += GameA.keyCodes.RIGHT;
        if (input.keystate[keycodes.UP]) keyCode += GameA.keyCodes.UP;
        if (input.keystate[keycodes.DOWN]) keyCode += GameA.keyCodes.DOWN;
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
        //const kc = GameA.keyCodes.RIGHT; // test, predict right
        //const kc = GameA.keyCodes.UP | prevInput.kc; // racing, always press GAS/up
        //const ret = {kc: kc}
        //return kc;
    }

    // move 2 circles apart, simple
    static separate(posA, posB, distSep, extra) {
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
        } else { // same position, separate horizontally
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

    // move 2 circles apart, but with posB roughly following posA movement direction
    static separateSticky(posA, lastPosA, posB, distSep, stickyLerp, extra) {
        const distSep2 = distSep * distSep;
        const dist2 = vec2.sqrDist(posA, posB);
        if (dist2 > distSep2) {
            return false;
        }
        let deltaPos;
        if (dist2 > 0) {
            deltaPos = vec2.create();
            vec2.sub(deltaPos, posB, posA);
            vec2.normalize(deltaPos, deltaPos);
        } else { // same position, separate horizontally
            deltaPos = vec2.fromValues(0, 1);
        }
        const deltaAVel = vec2.create();
        vec2.sub(deltaAVel, posA, lastPosA);
        const moveLen2 = vec2.sqrLen(deltaAVel);
        if (moveLen2 > 0) {
            vec2.normalize(deltaAVel, deltaAVel);
        } else {
            vec2.copy(deltaAVel, deltaPos); // no movement, just use deltaPos
        }
        const delta = vec2.create();
        vec2.lerp(delta, deltaPos, deltaAVel, stickyLerp);

        vec2.normalize(delta, delta);
        vec2.scale(delta, delta, distSep * .5 * extra);
        const midPoint = vec2.create();
        vec2.add(midPoint, posA, posB);
        vec2.scale(midPoint, midPoint, .5); // midpoint is the average
        vec2.sub(posA, midPoint, delta); // move out in opposite directions
        vec2.add(posB, midPoint, delta);
        return true;
    }

    // move circleA away from circleB (circleB doesn't move)
    static separateA(posA, posB, distSep, extra) {
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
        } else { // same position, separate horizontally
            delta = vec2.fromValues(0, 1);
        }
        vec2.scale(delta, delta, distSep * extra);
        vec2.sub(posA, posB, delta); // move circleA away from circleB
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
            if (keyCode & GameA.keyCodes.GO) {
                this.curModel = clone(this.resetModel); // the current model is the init model
                curPlayer.desiredPos = null;
                return;
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
        // npc moves
        this.#setNpcsMoving(this.curModel);
        const movingAngleStep = .005;
        this.curModel.npcsMovingAngle += movingAngleStep;
        this.curModel.npcsMovingAngle = normalangrad(this.curModel.npcsMovingAngle);

        // collisions
        const extra = 1.001; // move apart a litte more

        // players to players
        for (let p0 = 0; p0 < pInputs.length; ++p0) {
            const curPlayer0 = this.curModel.players[p0];
            for (let p1 = p0 + 1; p1 < pInputs.length; ++p1) {
                const curPlayer1 = this.curModel.players[p1];
                // move players apart
                GameA.separate(curPlayer0.pos, curPlayer1.pos, 2 * this.size, extra);
            }
        }

        // players to npcsDummy
        const sticky = .05;
        for (let p = 0; p < pInputs.length; ++p) {
            const curPlayer = this.curModel.players[p];
            for (let nd = 0; nd < this.curModel.npcsDummy.length; ++nd) {
                const npcd = this.curModel.npcsDummy[nd];
                // move players and npcsDummy apart
                GameA.separateSticky(curPlayer.pos, curPlayer.lastPos, npcd.pos, 2 * this.size, sticky, extra);
            }
        }

        // npcsDummy to npcsDummy
        for (let n0d = 0; n0d < this.curModel.npcsDummy.length; ++n0d) {
            const npc0d = this.curModel.npcsDummy[n0d];
            for (let n1d = n0d + 1; n1d < this.curModel.npcsDummy.length; ++n1d) {
                const npc1d = this.curModel.npcsDummy[n1d];
                // move npcsDummy and npcsDummy apart
                GameA.separate(npc0d.pos, npc1d.pos, 2 * this.size, extra);
            }
        }

        // npcsMove to npcsDummy
        for (let nd = 0; nd < this.curModel.npcsDummy.length; ++nd) {
            const npcd = this.curModel.npcsDummy[nd];
            for (let nm = 0; nm < this.curModel.npcsMoving.length; ++nm) {
                const npcm = this.curModel.npcsMoving[nm];
                // move players away from npcsMoving
                GameA.separateA(npcd.pos, npcm.pos, 2 * this.size, extra);
            }
        }

        // npcsMove to players
        for (let p = 0; p < pInputs.length; ++p) {
            const curPlayer = this.curModel.players[p];
            for (let nm = 0; nm < this.curModel.npcsMoving.length; ++nm) {
                const npcm = this.curModel.npcsMoving[nm];
                // move players away from npcsMoving
                GameA.separateA(curPlayer.pos, npcm.pos, 2 * this.size, extra);
            }
        }
        
        // border to players
        for (let p = 0; p < pInputs.length; ++p) {
            const curPlayer = this.curModel.players[p];
            curPlayer.pos[0] = range(this.margin, curPlayer.pos[0], this.res[0] - this.margin);
            curPlayer.pos[1] = range(this.margin, curPlayer.pos[1], this.res[1] - this.margin);
        }

        // border to npcsDummy
        for (let nd = 0; nd < this.curModel.npcsDummy.length; ++nd) {
            const npcd = this.curModel.npcsDummy[nd];
            npcd.pos[0] = range(this.margin, npcd.pos[0], this.res[0] - this.margin);
            npcd.pos[1] = range(this.margin, npcd.pos[1], this.res[1] - this.margin);
        }
    }

    // no timeWarp, mainly for animation
    stepGhostModel(frameNum) {
        const ang = this.ghostModel.angle;
        const fpsw = fpswanted <= 0 ? 1 : fpswanted;
        this.ghostModel.angle += 2 * Math.PI / 10 / fpsw;
        this.ghostModel.angle = normalangrad(this.ghostModel.angle);
        this.squareG.trans = [40 * Math.cos(ang) + 50, -40 * Math.sin(ang) + 50 , 0];
    }

    // M to V
    // get Model to this frameNum, then move it into View
    modelToView() {
        // update the view from the model
        // players
        for (let slot = 0; slot < this.curModel.players.length; ++slot) {
            this.curPlayerView[slot].trans = vec3.clone(this.curModel.players[slot].pos);
        }
        // npcsDummy
        for (let n = 0; n < this.curModel.npcsDummy.length; ++n) {
            this.curDummyNpcView[n].trans = vec3.clone(this.curModel.npcsDummy[n].pos);
        }
        // npcsMove
        for (let n = 0; n < this.curModel.npcsMoving.length; ++n) {
            this.curMoveNpcView[n].trans = vec3.clone(this.curModel.npcsMoving[n].pos);
        }
    }
}
