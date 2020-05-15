/**
 * @module SpaceShip
 */
import {Polygon} from "../../geometry2d/Polygon.mod.js";
import {Vec2} from "../../geometry2d/Vec2.mod.js";
import {GameObject} from "../../game/object.mod.js";
import {ShapedObjectRenderer, ShapedObject2dCollider} from "../../game/renderer_collider.mod.js";
import {merge, mix} from "../../utils/tools.mod.js";
import {health, energy} from "../../game/object_mixins.mod.js";
import {Weapon, Bullet} from "../../game/bullets.mod.js";
import {ASTEROID_COLLISION_LAYER, BULLET_COLLISION_LAYER, SHIP_COLLISION_LAYER} from "./constants.mjs";

const spaceShipShape = new Polygon(Vec2.ZERO, Vec2.createVec2Array([
    1,0,  -1,-0.75,  -0.5,-0.5,  -0.5,0.5,  -1,0.75,
])).scale(20);
const bulletShape = new Polygon(Vec2.ZERO, Vec2.createVec2Array([
    10, 0,    -5, -5,    0, -1,    -30, 0,    0, 1,    -5, 5,
]));
class SpaceshipBullet extends Bullet {
    constructor(gameManager, spaceShip, damage) {
        const dir = Vec2.createFromAngle(spaceShip.direction);
        const pos = dir.clone().mul(spaceShip.getRadius()).add(spaceShip.position);
        super(spaceShip, pos, dir.mul(500), damage, gameManager.viewer.visibleRect);
        this.setRenderer(new ShapedObjectRenderer(bulletShape, "#F00"));
        this.setCollider(new ShapedObject2dCollider(bulletShape));
        this.rotate(spaceShip.direction);
    }
}
merge(SpaceshipBullet.prototype,{
    bodyLayer: BULLET_COLLISION_LAYER,
    collisionLayers: [ASTEROID_COLLISION_LAYER, BULLET_COLLISION_LAYER],
    collisionPriority: 5
}, true);

const bulletGenerator = function (spaceShip, damage, gameManager) {
    if(spaceShip.useEnergy(5)) {
        return new SpaceshipBullet(gameManager, spaceShip, damage);
    } else return null;
};
class SpaceShip extends mix(GameObject, health, energy) {
    constructor(position) {
        super(position, Vec2.ZERO, Vec2.ZERO);
        this.setRenderer(new ShapedObjectRenderer(spaceShipShape, "#0c80ff"));
        this.setCollider(new ShapedObject2dCollider(spaceShipShape));

        this.setMaxHealth(100);
        this.setHealth(100);
        this.setMaxEnergy(100);
        this.setEnergy(100);
        this.energyRecoverSpeed = 33;
        this.control = {
            thrust: false,
            break: false,
            rotateLeft: false,
            rotateRight: false
        };
        this.direction = 0;
        this.weapon = new Weapon(bulletGenerator.bind(undefined, this, 100), 1/5);
    }
    rotate(angle) {
        super.rotate(angle);
        this.direction = (this.direction + angle) % (2*Math.PI);
    }
    onFrame(gameManager, dT) {
        if(this.control.break) this.accel.set(this.speed).mul(-2);
        else if(this.control.thrust) this.accel.setAngle(this.direction).setMagnitude(100);
        else this.accel.set(this.speed).mul(-0.01);

        this.rotationSpeed = (this.control.rotateLeft ? -Math.PI/2 : 0) +
                             (this.control.rotateRight ? Math.PI/2 : 0);
        super.onFrame(gameManager, dT);
        this.weapon.onFrame(gameManager, dT);
        let v = this.maintainInRect(gameManager.viewer.visibleRect);
        if(v.x !== 0) {
            this.speed.x = 0;
        }
        if(v.y !== 0) {
            this.speed.y = 0;
        }
        this.recoverEnergy(this.energyRecoverSpeed * dT);
    }
    fire(enable) {
        if(enable)
            this.weapon.fireOnce();
        this.weapon.autoFire(enable);
    }
}
merge(SpaceShip.prototype,{
    bodyLayer: SHIP_COLLISION_LAYER,
    collisionLayers: [SHIP_COLLISION_LAYER, ASTEROID_COLLISION_LAYER],
    collisionPriority: 10,
}, true);

export {SpaceShip};
export default SpaceShip;