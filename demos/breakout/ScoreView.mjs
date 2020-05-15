/**
 * @module ScoreView
 */
import {UIElement} from "../../game/viewers.mod.js";
import {BBCodeToHTML} from "../../utils/tools.mod.js";
import {Vec2} from "../../geometry2d/Vec2.mod.js";

class ScoreView extends UIElement{
    constructor() {
        const p = document.createElement('p');
        p.style.background = 'transparent';
        p.style.border = '1px solid white';
        p.style.display = 'inline-block';
        p.style.webkitTextStroke = "0.5px #000";
        p.style.color = "white";
        super(p, Vec2.ZERO, true, true);
        this.anchor.setXY(0,0);
        this.scale = 0.3;
        this.setScore(0);
    }
    setScore(value) {
        this.score = value;
        this.elmt.innerHTML = BBCodeToHTML(`you have [b]${value}[/b] points`);
    }
    addScore(value) {
        this.setScore(this.score + value);
    }
}

export {ScoreView};
export default ScoreView;