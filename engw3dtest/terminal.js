'use strict';

class Terminal {
    constructor(modelFont, cmdCallback) {
        this.modelFont = modelFont;
        this.maxX = this.modelFont.maxcols;
        this.maxY = this.modelFont.maxrows;
        this.cmdCallback = cmdCallback;
        this.prompt = ">";
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

    #update(str) { // update model font
        this.modelFont.print(this.mainStr + '\n' + this.prompt + this.cmdStr + this.cursor);
    }

    proc(key) {
        if (key) {
            switch(key) {
                case keycodes.BACKSPACE:
                    this.cmdStr = this.cmdStr.slice(0, -1);
                    break;
                case keycodes.RETURN:
                    this.mainStr += '\n' + this.prompt + this.cmdStr;
                    let result = this.cmdCallback(this.cmdStr);
                    this.mainStr += '\n' + result + '\n';
                    this.mainStr = this.#pruneStr(this.mainStr);
                    this.cmdStr = "";
                    break;
                default:
                    this.cmdStr += String.fromCharCode(key);
                    break;
            }
            this.#update(); // redraw
        }
    }
};