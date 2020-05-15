/**
 * @module Breakout_Objects
 */
import {Vec2} from "../../geometry2d/geometry2d.mod.js";
import {randomColor} from "../../utils/colors.mod.js";
import {SimpleShapedObject} from "../../game/object.mod.js";
import {TraceDrawer} from "../../game/particles.mod.js"

class Brick extends SimpleShapedObject {}
Brick.prototype.living = false;

class Paddle extends SimpleShapedObject {
    constructor(rect) {
        super(rect, randomColor());
        this.setSpeed(Vec2.ZERO);
    }
    onFrame(gameManager, dT) {
        super.onFrame(gameManager, dT);
        this.maintainInRect(gameManager.viewer.visibleRect);
    }
}
const traceDrawer = new TraceDrawer("red", 1.0);
class Ball extends SimpleShapedObject {
    constructor(circle, speed) {
        super(circle, randomColor());
        this.setSpeed(speed);
    }
    onFrame(gameManager, dT) {
        const pos = this.copyPosition();
        super.onFrame(gameManager, dT);
        const rect = this.getRect(), vRect = gameManager.viewer.visibleRect;
        if     (rect.xMin <= vRect.xMin) { this.speed.x = Math.abs(this.speed.x);  this.speed.mul(1.01); }
        else if(rect.xMax >= vRect.xMax) { this.speed.x = -Math.abs(this.speed.x); this.speed.mul(1.01); }
        if     (rect.yMin <= vRect.yMin) { this.speed.y = Math.abs(this.speed.y);  this.speed.mul(1.01); }
        traceDrawer.onMovement(gameManager, this, pos, this.position);
    }
    onCollision(gameManager, object) {
        if(object instanceof Brick) {
            const rect = object.getColliderRect();
            const closest = rect.closestPointTo(this.position);
            const delta = Vec2.translation(object.position, closest);
            if(Math.abs(Math.abs(delta.x) - rect.width/2) < 0.1) { //hit left or right side
                if(this.speed.x * delta.x < 0) this.speed.mirrorHorizontally();
            }
            if(Math.abs(Math.abs(delta.y) - rect.height/2) < 0.1) { //hit top or bottom side
                if(this.speed.y * delta.y < 0) this.speed.mirrorVertically();
            }
            object.kill(gameManager);
            gameManager.fireObjectDestroyedEvent(object);
        } else if(object instanceof Paddle) {
            const normal = new Vec2(this.position.x - object.position.x, -10);
            normal.magnitude = this.speed.magnitude;
            this.speed = normal;
        }
        this.speed.mul(1.01);
        this.renderer.color = randomColor();
    }
}

export {Ball, Paddle, Brick};