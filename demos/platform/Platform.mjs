/**
 * @module Platform
 */
import {Materials, RigidBody} from "../../game/physics.min.mjs";
import {Vec2} from "../../geometry2d/Vec2.mjs";
import {GameObject} from "../../game/object.mjs";
import {AABBObject2dCollider, ShapedObjectRenderer} from "../../game/renderer_collider.mjs";
import {randomColor} from "../../utils/colors.mjs";

class Platform extends GameObject {
    constructor(rect) {
        super(rect.center);
        this.setRenderer(new ShapedObjectRenderer(rect, randomColor()));
        this.setCollider(new AABBObject2dCollider(rect));
        this.setSpeed(Vec2.ZERO);
        this.rigidBody = new RigidBody(Materials.Static);
        this.rigidBody.invMass = 0;
    }
    endCollision(gameManager) {
        this.rigidBody.processForces(gameManager.physicWorld, this, gameManager.gameDt);
    }
}
Platform.prototype.renderLayer = 1;
Platform.prototype.collisionPriority = 0;
Platform.prototype.living = false;

export {Platform};
export default Platform;