'use strict';

class Terminal {
    constructor(rootTree, backColor, cmdCallback, params) {
        let cols = 120;
        let rows = 45;
        let glyphx = 8;
        let glyphy = 16;
        let offx = 8;
        let offy = 8;
        let scale = 1;

        if (params) {
            if (params.cols) cols = params.cols;
            if (params.rows) rows = params.rows;
            if (params.offx) offx = params.offx;
            if (params.offy) offy = params.offy;
            if (params.scale) scale = params.scale;
        }

        const depth = glc.clientHeight / 2;
        const W2 = glc.clientWidth / 2
        offx += -W2;
        offy = -offy;
        offy += depth;

        this.backgnd = buildplanexy01(makeuniq("aplane2"), glyphx * cols, glyphy * rows, null, "flat", 1, 1);
        this.backgnd.mod.flags |= modelflagenums.NOZBUFFER;
        this.backgnd.mod.mat.color = backColor;
        this.backgnd.trans = [offx, offy, depth];
        this.backgnd.scale = [scale, scale, scale];
        rootTree.linkchild(this.backgnd);
        
        this.modelFont = new ModelFont(makeuniq("terminalModelFont"), "font0.png", "texc", glyphx, glyphy, cols, rows, false);
        this.modelFont.flags |= modelflagenums.NOZBUFFER;
        this.treeFont = new Tree2("terminalTreeFont");
        this.treeFont.setmodel(this.modelFont);
        this.treeFont.trans = [offx, offy, depth];
        this.treeFont.scale = [scale, scale, scale];
        rootTree.linkchild(this.treeFont);
    
        this.maxX = this.modelFont.maxcols;
        this.maxY = this.modelFont.maxrows;
        this.modelFont.mat.color = [1, 1, 1, 1]; // white
        this.cmdCallback = cmdCallback;
        this.prompt = cmdCallback ? ">" : "";
        this.blinkDelay = 60; // 1 second
        this.blink = 0;
        this.updateTime = 0;
        this.cursor = "_";
        this.mainStr = '\n'.repeat(Math.max(0, this.maxY - 2));
        //this.mainStr += "Welcome"; // results, etc.
        this.maxRowCount = this.maxY - 1; // how many rows to keep in mainStr, reserve one row for cmdStr
        this.cmdStr = ""; // type in a command here, below mainStr
        this.#update(); // redraw
    }

    // trim off the top to scroll the string up
    #pruneStr(str) {
        const nlc = this.#getNewLineCount(str);
        if (nlc >= this.maxRowCount) {
            let removeNL = nlc - this.maxRowCount;
            if (this.cmdCallback) {
                ++removeNL; // make room for prompt
            }
            while(removeNL--) {
                const idx = str.indexOf('\n');
                if (idx == -1) {
                    alert("#pruneStr: idx = " + idx); // should never happen
                }
                str = str.slice(idx + 1); // remove string before and including newline
            }
        }
        return str;
    }

    #getNewLineCount(str) {
        let cnt = 0;
        let pos = str.indexOf('\n');
        while(pos !== -1) {
            ++cnt;
            pos = str.indexOf('\n', pos + 1);
        }
        return cnt;
    }

    #update() { // update model font
        if (!this.cmdCallback) {
            // output only, no prompt, no cursor etc.
            this.modelFont.print(this.mainStr);
            return;
        }
        let pStr = this.mainStr + '\n' + this.prompt + this.cmdStr;
        if (this.blink * 2 >= this.blinkDelay) {
            pStr += this.cursor;
        }
        this.modelFont.print(pStr);
        const normColor = Bitmap32p.colorStrToArray("white");
        const hilitColor = Bitmap32p.colorStrToArray("green");
        vec4.lerp(this.modelFont.mat.color, normColor, hilitColor, this.updateTime);
   }

    setPrompt(p) {
        this.prompt = p;
        this.updateTime = 1;
        this.#update();
    }

    print(str) {
        if (!str) return;
        //console.log("terminal print '" + str + "'");
        str = doWordWrap(str, this.maxX);
        if (this.cmdCallback) {
            this.mainStr += '\n' + str + '\n';
        } else {
            this.mainStr += '\n' + str;
        }
        this.mainStr = this.#pruneStr(this.mainStr);
        this.updateTime = 1;
        this.#update();
    }

    doShow(show) {
        if (show) {
            this.backgnd.flags &= !treeflagenums.DONTDRAWC;
            this.treeFont.flags &= !treeflagenums.DONTDRAWC;       
         } else {
            this.backgnd.flags |= treeflagenums.DONTDRAWC;
            this.treeFont.flags |= treeflagenums.DONTDRAWC;       
        }
    }

    clear() {
        //console.log(" ############### call clear");
        this.mainStr = "";
    }

    proc(key) {
        if (key) {
            switch(key) {
                case keycodes.BACKSPACE:
                    this.cmdStr = this.cmdStr.slice(0, -1);
                    break;
                case keycodes.RETURN:
                    this.mainStr += '\n' + this.prompt + this.cmdStr;
                    this.mainStr = this.#pruneStr(this.mainStr);
                    this.cmdCallback?.(this.cmdStr);
                    this.cmdStr = "";
                    break;
                default:
                    if (key >= 32 && key < 128) { // plain old ascii characters
                        this.cmdStr += String.fromCharCode(key);
                    }
                    break;
            }
        }
        // do blink
        ++this.blink;
        if (this.blink > this.blinkDelay) {
            this.blink = 0;
        }
        // rebuild model if necessary
        // hilit color changes with updateTime
        this.updateTime -= .03;
        if (this.updateTime < 0) {
            this.updateTime = 0;
        }
        this.#update(); // redraw
    }

    onresize() {
        const depth = glc.clientHeight / 2;
        this.backgnd.trans[2] = depth;
        this.treeFont.trans[2] = depth;
    }
};