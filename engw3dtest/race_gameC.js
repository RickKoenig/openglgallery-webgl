'use strict';

// run a networked test game, fixed point
window.GameC = class GameC {
    keyCodes = {
        UP: 1,
        DOWN: 2,
        RIGHT: 4,
        LEFT: 8,
        GO: 16,
    };

    // assume 1024 by 768 resolution
    constructor(numPlayers, youPlayer, root) {
        this.FP = new FMathBigIntInstance(3, 16); // fixed point
        this.FPvec2 = new vec2Fix(this.FP);
		mainvp.clearcolor = [.5 ,.55, 1, 1];
        const size = 30;

        this.res = [1024, 768];
        this.size = size; // radius
        this.margin = size; // 300; // border
        this.FPSize = this.FP.create(size);
        this.FrightMargin = this.FP.create(this.res[0] - this.size);
        this.FbotMargin = this.FP.create(this.res[1] - this.size);
        this.FtopLeftMargin = this.FP.create(this.margin);
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
        this.npcsMoving = Array(this.numMoveNpcs);

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

        this.ghostModel = {angle: 0 }; // NO time warp model, this model is for animation, doesn't interact with game

        this.curPlayerView = [];
        this.curDesiredView = [];
        this.curLineView = [];
        this.curDummyNpcView = [];
        this.curMoveNpcView = [];

        // build 3D scene
        const viewParent = new Tree2("viewParent");
        viewParent.trans = [-this.res[0] / 2, -this.res[1] / 2, this.res[1] / 2];
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
            if (n < this.numMoveNpcsX) {
                npcMoveTree.mat.color = [1.75, .25, 1.75, 1];
            }
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
        block.rotvel = [0, 1, 0];
        //block.scale = [1, 1, .01];
        viewParent.linkchild(block);

        const plane = buildplanexy("plane", this.size / 2, this.size / 2, "maptestnck.png", "tex", 1, 1);
	    plane.mod.flags |= modelflagenums.DOUBLESIDED;
        plane.trans = [200, 50, 0];
        plane.rotvel = [0, 1, 0];
        viewParent.linkchild(plane);

        // cursor
        this.sphere = buildsphere("sphere",this.size / 2,"maptestnck.png","tex");
        this.sphere.trans = [250, 50, 0];
        this.sphere.rotvel = [0, 1, 0];
        viewParent.linkchild(this.sphere);


        // corners
        let sphere = this.sphere.newdup();
        sphere.trans = [0, 0, 0];
        sphere.rotvel = [0, 1, 0];
        viewParent.linkchild(sphere);
        
        sphere = this.sphere.newdup();
        sphere.trans = [this.res[0], 0, 0];
        sphere.rotvel = [0, 1, 0];
        viewParent.linkchild(sphere);

        sphere = this.sphere.newdup();
        sphere.trans = [0, this.res[1], 0];
        sphere.rotvel = [0, 1, 0];
        viewParent.linkchild(sphere);

        sphere = this.sphere.newdup();
        sphere.trans = [this.res[0], this.res[1], 0];
        sphere.rotvel = [0, 1, 0];
        viewParent.linkchild(sphere);

        const backgnd = buildplanexy("backgnd", this.res[0] / 2, this.res[1] / 2, "maptestnck.png", "texc", 1, 1, 4, 3);
        backgnd.mod.mat.color = [1, 1, 1, .125];
	    backgnd.mod.flags |= modelflagenums.DOUBLESIDED | modelflagenums.HASALPHA | modelflagenums.NOZBUFFER;
        backgnd.trans = [this.res[0] / 2, this.res[1] / 2, 0];
        viewParent.linkchild(backgnd);
    }

    #setNpcsMoving(retModel) {
        const angOffset = retModel.npcsMovingAngle;
        let n = 0;
        const center = this.FPvec2.create([700, 384]);
        const startX = 100;
        const stepX = 60;
        const FPmovesY = this.FP.create(this.numMoveNpcsY);
        for (let j = 0; j < this.numMoveNpcsY; ++j) {
            // const ang = j * 2 * Math.PI / this.numMoveNpcsY + angOffset;
            let ang = this.FP.create(j * 2);
            ang = this.FP.mul(ang, this.FP.PI);
            ang = this.FP.div(ang, FPmovesY);
            ang = this.FP.add(ang, angOffset);
            const cosAng = this.FP.cos(ang);
            const sinAng = this.FP.sin(ang);
            //console.log("NOTICE: j = " + j + ", " + sinAng + " =  sin ( " + ang + " ) ");
            for (let i = 0; i < this.numMoveNpcsX; ++i) {
                const rad = this.FP.create(startX + stepX * i);
                const npc = {
                    pos: [
                        center[0] + this.FP.mul(cosAng, rad),
                        center[1] + this.FP.mul(sinAng, rad)
                    ]
                }
                //console.log("NOTICE2: npc.pos[1] = " + npc.pos[1] + ", from rad = " + rad);
                this.npcsMoving[n++] = npc;
            }
        }
    }

    // return initial model of the game
    #modelReset() {
        const retModel = {
            players: Array(this.numPlayers),
            npcsDummy: Array(this.numDummyNpcs),
            npcsMovingAngle: 0n
        };
        // players
        for (let slot = 0; slot < this.numPlayers; ++slot) {
                    //50, 550 - slot * 75, 0,
            const pos = [this.FP.create(50), this.FP.create(550 - slot * 75)];
            const player = {
                pos: pos,
                desiredPos: null // if mouse click
            };
            player.lastPos = this.FPvec2.clone(player.pos);
            retModel.players[slot] = player;
        }
        // npc dummys
        let n = 0;
        for (let y = 0; y < this.numDummyNpcsY; ++y) {
            for (let x = 0; x < this.numDummyNpcsX; ++x) {
            const pos = this.FPvec2.create([150 + x * 75, 550 - y * 75]);
                const npc = {
                    pos: pos
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
    //
        // USER
    //    kc: bitfield of up, down, left, right
    //    mouse: pos and click
    //
    modelMakeKeyCode() {
        const ret = {};
        let keyCode = 0;
        // restart game
        if (input.key == 'g'.charCodeAt(0)) {
            keyCode += this.keyCodes.GO;
            ret.kc = keyCode;
            return ret;
        }
        // move with arrow keys
        if (input.keystate[keycodes.LEFT]) keyCode += this.keyCodes.LEFT;
        if (input.keystate[keycodes.RIGHT]) keyCode += this.keyCodes.RIGHT;
        if (input.keystate[keycodes.UP]) keyCode += this.keyCodes.UP;
        if (input.keystate[keycodes.DOWN]) keyCode += this.keyCodes.DOWN;
        ret.kc = keyCode;
        // move with mouse
        this.mox = input.fmx * this.res[1] / 2 + this.res[0] / 2;
        this.moy = input.fmy * this.res[1] / 2 + this.res[1] / 2;
        //console.log("fm = " + input.fmx.toFixed(3) + " " + input.fmy + " mox = " + this.mox + " moy = " + this.moy);
        ret.mouse = {
            pos: [this.mox, this.moy],
            click: input.mclick[0]
        }
        return ret;
    }

    // let game decide what to do with predictions
    predictLogic(prevInput, frameNum) {
        return prevInput; // full prediction
        //const kc = 0; // wait, no prediction
        //const kc = this.keyCodes.RIGHT; // test, predict right
        //const kc = this.keyCodes.UP | prevInput.kc; // racing, always press GAS/up
        //const ret = {kc: kc}
        //return kc;
    }

    // move 2 circles apart, simple
    #separate(posA, posB, distSep, extra, FPvec2) {
        const distSep2 = FPvec2.FP.mul(distSep, distSep);
        const dist2 = FPvec2.sqrDist(posA, posB);
        if (dist2 > distSep2) {
            return false; // too far apart
        }
        let delta;
        if (dist2 > 0n) {
            delta = FPvec2.create();
            FPvec2.sub(delta, posB, posA);
            FPvec2.normalize(delta, delta);
        } else { // same position
            delta = FPvec2.create([1, 0]); // right on top of each other, separate horizontally
        }
        // move apart in direction of delta with some 'extra' factor
        FPvec2.scale(delta, delta, FPvec2.FP.mul(FPvec2.FP.mul(distSep, this.FP.HALF), extra));
        const midPoint = FPvec2.create();
        FPvec2.add(midPoint, posA, posB);
        FPvec2.scale(midPoint, midPoint, FPvec2.FP.HALF); // midpoint is the average
        FPvec2.sub(posA, midPoint, delta); // move out in opposite directions
        FPvec2.add(posB, midPoint, delta);
        return true;
    }

    // move 2 circles apart, but with posB roughly following posA movement direction
    #separateSticky(posA, lastPosA, posB, distSep, stickyLerp, extra, FPvec2) {
        const distSep2 = FPvec2.FP.mul(distSep, distSep);
        const dist2 = FPvec2.sqrDist(posA, posB);
        if (dist2 > distSep2) {
            return false; // too far apart
        }
        let deltaPos; // normal
        if (dist2 > 0) {
            deltaPos = FPvec2.create();
            FPvec2.sub(deltaPos, posB, posA);
            FPvec2.normalize(deltaPos, deltaPos);
        } else { // same position, #separate horizontally
            deltaPos = FPvec2.create(1, 0);
        }
        const deltaAVel = FPvec2.create(); // sticky
        FPvec2.sub(deltaAVel, posA, lastPosA);
        const moveLen2 = FPvec2.sqrLen(deltaAVel);
        if (moveLen2 > 0n) {
            FPvec2.normalize(deltaAVel, deltaAVel);
        } else {
            FPvec2.copy(deltaAVel, deltaPos); // no movement, just use deltaPos
        }
        const delta = FPvec2.create();
        FPvec2.lerp(delta, deltaPos, deltaAVel, stickyLerp);
        //FPvec2.copy(delta, deltaAVel);

        FPvec2.normalize(delta, delta);
        FPvec2.scale(delta, delta, this.FP.mul(this.FP.mul(distSep, this.FP.HALF), extra));
        const midPoint = FPvec2.create();
        FPvec2.add(midPoint, posA, posB);
        FPvec2.scale(midPoint, midPoint, this.FP.HALF); // midpoint is the average
        FPvec2.sub(posA, midPoint, delta); // move out in opposite directions
        FPvec2.add(posB, midPoint, delta);
        return true;
    }

    // move circleA away from circleB (circleB doesn't move)
    #separateA(posA, posB, distSep, extra, FPvec2) {
        const distSep2 = this.FPvec2.FP.mul(distSep, distSep);
        const dist2 = this.FPvec2.sqrDist(posA, posB);
        if (dist2 > distSep2) {
            return false; // too far apart
        }
        let delta;
        if (dist2 > 0n) {
            delta = FPvec2.create();
            FPvec2.sub(delta, posB, posA);
            FPvec2.normalize(delta, delta);
        } else { // same position, #separate horizontally
            delta = FPvec2.create([1, 0]);
        }
        FPvec2.scale(delta, delta, FPvec2.FP.mul(distSep, extra));
        FPvec2.sub(posA, posB, delta); // move circleA away from circleB
        return true;
    }

    // timeWarp
    stepModel(pInputs, frameNum) {
        //return;
        // movement
        // players
        for (let slot = 0; slot < pInputs.length; ++slot) {
            const pInput = pInputs[slot];
            const curPlayer = this.curModel.players[slot];
            this.FPvec2.copy(curPlayer.lastPos, curPlayer.pos);
            if (pInput.discon) {
                this.curPlayerView[slot].mat.color = [1.75, 0, 0, 1]; // disconnect color
                curPlayer.desiredPos = null;
                continue;
            }
            // keyboard
            const keyCode = pInput.kc;
            // reset game
            if (keyCode & this.keyCodes.GO) {
                this.curModel = clone(this.resetModel); // the current model is the init model
                curPlayer.desiredPos = null;
                return;
            }
            const step = this.step
            if (keyCode & this.keyCodes.RIGHT) {
                //curPlayer.pos[0] += step;
                curPlayer.pos[0] = this.FP.add(curPlayer.pos[0], step);
                curPlayer.desiredPos = null;
            }
            if (keyCode & this.keyCodes.LEFT) {
                //curPlayer.pos[0] -= step;
                curPlayer.pos[0] = this.FP.sub(curPlayer.pos[0], step);
                curPlayer.desiredPos = null;
            }
            if (keyCode & this.keyCodes.UP) {
                //curPlayer.pos[1] += step;
                curPlayer.pos[1] = this.FP.add(curPlayer.pos[1], step);
                curPlayer.desiredPos = null;
            }
            if (keyCode & this.keyCodes.DOWN) {
                //curPlayer.pos[1] -= step;
                curPlayer.pos[1] = this.FP.sub(curPlayer.pos[1], step);
                curPlayer.desiredPos = null;
            }
            if (pInput.mouse) {
                if (pInput.mouse.click) {
                    let x = this.FP.create(pInput.mouse.pos[0]);
                    let y = this.FP.create(pInput.mouse.pos[1]);
                    x = this.FP.range(this.FtopLeftMargin, x, this.FrightMargin);
                    y = this.FP.range(this.FtopLeftMargin, y, this.FbotMargin);
                    curPlayer.desiredPos = [
                        x, y, 0
                    ];
                }
            }
            
            // mouse, move to desiredPos
            if (curPlayer.desiredPos) {
                //const close2 = step * step * 2;
                const close2 = this.FP.mul(this.FP.mul(step, step), this.FP.TWO);
                const dist2 = this.FPvec2.squaredDistance(curPlayer.desiredPos, curPlayer.pos);
                if (dist2 < close2) {
                    this.FPvec2.copy(curPlayer.pos, curPlayer.desiredPos);
                    curPlayer.desiredPos = null;
                } else {
                    const delta = this.FPvec2.create();
                    this.FPvec2.sub(delta, curPlayer.desiredPos, curPlayer.pos);
                    this.FPvec2.normalize(delta, delta);
                    this.FPvec2.scale(delta, delta, step);
                    this.FPvec2.add(curPlayer.pos, curPlayer.pos, delta);
                }
            }
        }

        // npc moves
        this.#setNpcsMoving(this.curModel);
        const movingAngleStep = this.FP.create(.005);
        this.curModel.npcsMovingAngle = this.FP.add(this.curModel.npcsMovingAngle, movingAngleStep);
        this.curModel.npcsMovingAngle = this.FP.normAngRad(this.curModel.npcsMovingAngle);

        // collisions
        const extra = this.FP.create(1.001); // move apart a litte more, trust
        const size2 = this.FP.mul(this.FP.TWO, this.FPSize);
        // players to players
        for (let p0 = 0; p0 < pInputs.length; ++p0) {
            const curPlayer0 = this.curModel.players[p0];
            for (let p1 = p0 + 1; p1 < pInputs.length; ++p1) {
                const curPlayer1 = this.curModel.players[p1];
                // move players apart
                this.#separate(curPlayer0.pos, curPlayer1.pos, size2, extra, this.FPvec2);
            }
        }

        // players to npcsDummy
        const sticky = this.FP.create(.05);
        for (let p = 0; p < pInputs.length; ++p) {
            const curPlayer = this.curModel.players[p];
            for (let nd = 0; nd < this.curModel.npcsDummy.length; ++nd) {
                const npcd = this.curModel.npcsDummy[nd];
                // move players and npcsDummy apart
                this.#separateSticky(curPlayer.pos, curPlayer.lastPos, npcd.pos, size2, sticky, extra, this.FPvec2);
            }
        }

        // npcsDummy to npcsDummy
        for (let n0d = 0; n0d < this.curModel.npcsDummy.length; ++n0d) {
            const npc0d = this.curModel.npcsDummy[n0d];
            for (let n1d = n0d + 1; n1d < this.curModel.npcsDummy.length; ++n1d) {
                const npc1d = this.curModel.npcsDummy[n1d];
                // move npcsDummy and npcsDummy apart
                this.#separate(npc0d.pos, npc1d.pos, size2, extra, this.FPvec2);
            }
        }

        // npcsMove to npcsDummy
        for (let nd = 0; nd < this.curModel.npcsDummy.length; ++nd) {
            const npcd = this.curModel.npcsDummy[nd];
            for (let nm = 0; nm < this.npcsMoving.length; ++nm) {
                const npcm = this.npcsMoving[nm];
                // move players away from npcsMoving
                this.#separateA(npcd.pos, npcm.pos, size2, extra,this.FPvec2);
            }
        }

        // npcsMove to players
        for (let p = 0; p < pInputs.length; ++p) {
            const curPlayer = this.curModel.players[p];
            for (let nm = 0; nm < this.npcsMoving.length; ++nm) {
                const npcm = this.npcsMoving[nm];
                // move players away from npcsMoving
                this.#separateA(curPlayer.pos, npcm.pos, size2, extra, this.FPvec2);
            }
        }
        
        // border to players
        for (let p = 0; p < pInputs.length; ++p) {
            const curPlayer = this.curModel.players[p];
            curPlayer.pos[0] = this.FP.range(this.FtopLeftMargin, curPlayer.pos[0], this.FrightMargin);
            curPlayer.pos[1] = this.FP.range(this.FtopLeftMargin, curPlayer.pos[1], this.FbotMargin);
        }

        // border to npcsDummy
        for (let nd = 0; nd < this.curModel.npcsDummy.length; ++nd) {
            const npcd = this.curModel.npcsDummy[nd];
            npcd.pos[0] = this.FP.range(this.FtopLeftMargin, npcd.pos[0], this.FrightMargin);
            npcd.pos[1] = this.FP.range(this.FtopLeftMargin, npcd.pos[1], this.FbotMargin);
        }
    }

    // no timeWarp, mainly for animation
    stepGhostModel(frameNum) {
        input.extraWidth = mainvp.extraWidth;
        input.extraHeight = mainvp.extraHeight;
        const ang = this.ghostModel.angle;
        const fpsw = fpswanted <= 0 ? 1 : fpswanted;
        this.ghostModel.angle += 2 * Math.PI / 10 / fpsw;
        this.ghostModel.angle = normalangrad(this.ghostModel.angle);
        this.squareG.trans = [40 * Math.cos(ang) + 50, -40 * Math.sin(ang) + 50 , 0];
        // cursor
        this.sphere.trans = [this.mox, this.moy, 0];
    }

    // M to V
    // get Model to this frameNum, then move it into View
    modelToView() {
        // update the view from the model
        // players
        for (let slot = 0; slot < this.curModel.players.length; ++slot) {
            const curPlayer = this.curModel.players[slot];
            const pTree = this.curPlayerView[slot];
            pTree.trans = this.FPvec2.toNumber(curPlayer.pos);
            const dTree = this.curDesiredView[slot];
            const lTree = this.curLineView[slot];
            if (curPlayer.desiredPos) {
                dTree.trans = this.FPvec2.toNumber(curPlayer.desiredPos);
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

        // npcsDummy
        for (let n = 0; n < this.curModel.npcsDummy.length; ++n) {
            this.curDummyNpcView[n].trans = this.FPvec2.toNumber(this.curModel.npcsDummy[n].pos);
        }
        
        // npcsMove
        for (let n = 0; n < this.npcsMoving.length; ++n) {
            //this.curMoveNpcView[n].trans = vec3.clone(this.npcsMoving[n].pos);
            this.curMoveNpcView[n].trans = this.FPvec2.toNumber(this.npcsMoving[n].pos);
        }
        
    }

    // finer control over multi viewports
    draw() {
    }

    exit() {
        input.extraWidth = 1;
        input.extraHeight = 1;
    }
}
