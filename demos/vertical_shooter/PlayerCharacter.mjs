/**
 * @module PlayerCharacter
 */
import {Character} from "./Character.mjs";
import {Polygon} from "../../geometry2d/Polygon.mod.js";
import Vec2 from "../../geometry2d/Vec2.mod.js";
import {ShapedObjectRenderer, ShapedObject2dCollider} from "../../game/renderer_collider.mod.js";

class PlayerCharacter extends Character {
    constructor(pos) {
        super(pos);
        const shape = new Polygon(Vec2.ZERO, Vec2.createVec2Array([
            0,-10,
            2,-2,
            4,0,
            -4,0,
            -2,-2
        ]));
        this.setRenderer(new ShapedObjectRenderer(shape));
        this.setCollider(new ShapedObject2dCollider(shape));
        this.control = {
            left: false,
            up: false,
            right: false,
            down: false,
            shoot: false,
            speed: 40,
        }
    }
    moveOnFrame(gameManager, dT) {
        super.moveOnFrame(gameManager, dT);
        const ctrl = Vec2.zero;
        if(this.control.left !== this.control.right) ctrl.x = this.control.left ? -1 : 1;
        if(this.control.up !== this.control.down) ctrl.y = this.control.up ? -1 : 1;

        if(!ctrl.isZero()) {
            ctrl.magnitude = this.control.speed*dT;
            this.move(ctrl);
        }
        this.maintainInRect(gameManager.viewer.visibleRect);
    }

}

export {PlayerCharacter};
export default PlayerCharacter;