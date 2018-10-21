import {GameObject} from "../../game/object.mjs";

import {
    Impulse, Materials, RigidBody,
    UniDirectionalControllerForce, BreakerControllerForce
} from "../../game/physics.mjs";

import {Vec2} from "../../geometry2d/Vec2.mjs";
import {AABBObject2dCollider, ShapedObjectRenderer} from "../../game/renderer_collider.mjs";
import {ShapedParticle} from "../../game/particles.mjs";

/**
 * @module Character
 */
class Character extends GameObject {
    constructor(rect, color) {
        super(rect.center);
        this.setRenderer(new ShapedObjectRenderer(rect, color));
        this.setCollider(new AABBObject2dCollider(rect));
        this.setSpeed(Vec2.ZERO);
        this.rigidBody = new RigidBody(Materials.Static);
        this.rigidBody.invMass = 1; // 100 kg
        this.rigidBody.permanentForces.push(new UniDirectionalControllerForce(0.1)); // left
        this.rigidBody.permanentForces.push(new UniDirectionalControllerForce(0.1)); // right
        this.rigidBody.permanentForces.push(new BreakerControllerForce(new Vec2(1,0), 0.01));
    }
    onFrame(gameManager, dT) {
        gameManager.addObject(new ShapedParticle(this.renderer.shape.clone().scale(0.2), "#00F"));
        super.onFrame(gameManager, dT);
    }
    endCollision(gameManager) {
        this.rigidBody.processForces(gameManager.physicWorld, this, gameManager.gameDt);
    }
    handleCollision(gameManager, objects) {
        super.handleCollision(gameManager, objects);
        let i = objects.length;
        while(i--) {
            if(objects[i].rigidBody)
                RigidBody.resolveCollision(this, this.collider, objects[i], objects[i].collider);
        }
    }
    break(enable) {
        this.rigidBody.permanentForces[2].enabled = enable;
    }
    left(enable) {
        this.rigidBody.permanentForces[1].vector = new Vec2((enable ? -5 : 0),0);
        this.break(this.rigidBody.permanentForces[0].vector.isZero() && this.rigidBody.permanentForces[1].vector.isZero());
    }
    right(enable) {
        this.rigidBody.permanentForces[0].vector = new Vec2((enable ? 5 : 0),0);
        this.break(this.rigidBody.permanentForces[0].vector.isZero() && this.rigidBody.permanentForces[1].vector.isZero());
    }
    jump() {
        this.rigidBody.frameForces.push(new Impulse(new Vec2(0, -5)));
    }
}
Character.prototype.collisionPriority = 1;
Character.prototype.renderLayer = 0;

export {Character};
export default Character;