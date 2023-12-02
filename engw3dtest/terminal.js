'use strict';

class Terminal {
    constructor(modelFont, cmdCallback) {
        this.modelFont = modelFont;
        this.maxX = this.modelFont.maxcols;
        this.maxY = this.modelFont.maxrows;
        this.modelFont.mat.color = [1, 1, 1, 1]; // white
        this.cmdCallback = cmdCallback;
        this.prompt = cmdCallback ? ">" : "================";
        this.blinkDelay = 60; // 1 second
        this.blink = 0;
        this.updateTime = 0;
        this.cursor = "_";
        this.mainStr = '\n'.repeat(this.maxY - 2);
        this.mainStr += "Welcome"; // results, etc.
        this.maxRowCount = this.maxY - 1; // how many rows to keep in mainStr, reserve one row for cmdStr
        this.cmdStr = ""; // type in a command here, below mainStr
        this.#update(); // redraw
    }

    // trim off the top to scroll the string up
    #pruneStr(str) {
        const nlc = this.#getNewLineCount(str);
        if (nlc >= this.maxRowCount) {
            let removeNL = nlc - this.maxRowCount + 1;
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
        var pStr = this.mainStr + '\n' + this.prompt + this.cmdStr;
        if (this.blink * 2 >= this.blinkDelay) {
            pStr += this.cursor;
        }
        this.modelFont.print(pStr);
        const normColor = Bitmap32p.colorStrToArray("white");
        const hilitColor = Bitmap32p.colorStrToArray("lightgreen");
        vec4.lerp(this.modelFont.mat.color, normColor, hilitColor, this.updateTime);     
    }

    setPrompt(p) {
        this.prompt = p;
        this.updateTime = 1;
        this.#update();
    }

    print(str) {
        console.log("terminal print '" + str + "'");
        //str = doWordWrap(str, 5);
        str = doWordWrap(str, this.maxX);
        this.mainStr += '\n' + str + '\n';
        this.mainStr = this.#pruneStr(this.mainStr);
        this.updateTime = 1;
        this.#update();
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
                    this.cmdCallback(this.cmdStr);
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
        // hilit changes with updateTime
        this.updateTime -= .01;
        if (this.updateTime < 0) {
            this.updateTime = 0;
        }
        this.#update(); // redraw
    }
};