/**
 * @module Asteroid
 */
import {GameObject} from "../../game/object.mjs";
import {ShapedObject2dCollider, ShapedObjectRenderer} from "../../game/renderer_collider.mjs";
import {merge, PRNG} from "../../utils/tools.mjs";
import {Quadratic} from "../../utils/transitions.mjs";
import {
    ASTEROID_BIG_POINTS as BIG_POINTS,
    ASTEROID_SMALL_POINTS as SMALL_POINTS,
    ASTEROID_BIG_SIZE as BIG_SIZE,
    ASTEROID_SMALL_SIZE as SMALL_SIZE,
    ASTEROID_COLLISION_LAYER as BODY_LAYER,
    ASTEROID_DIVIDE_NUMBER as DIVIDE_NUMBER,
    ASTEROID_MAX_SPEED as MAX_SPEED,
    ASTEROID_MAX_ROTATION_SPEED as MAX_ROT_SPEED, SHIP_COLLISION_LAYER, BULLET_COLLISION_LAYER
} from "./constants.mjs";
import Polygon from "../../geometry2d/Polygon.mjs";
import {Vec2} from "../../geometry2d/Vec2.mjs";
import {ParticleExplosion} from "../../game/particles.mjs";

const Random = new PRNG(123);

class Asteroid extends GameObject {
    constructor(position, speed, rotationSpeed, shape) {
        super(position, speed);
        this.rotationSpeed = rotationSpeed;
        this.setRenderer(new ShapedObjectRenderer(shape, "#FFF"));
        this.renderer.fill = false;
        this.renderer.stroke = true;
        this.setCollider(new ShapedObject2dCollider(shape));
        this.exploded = false;
    }
    onFrame(gameManager, dT) {
        super.onFrame(gameManager, dT);
        if(this.isOutOfRect(gameManager.viewer.visibleRect, gameManager.viewer.visibleRect.width/50))
            this.kill(gameManager);
    }
    onDeath(gameManager) {
        super.onDeath(gameManager);
        if(this.exploded) { //death inside visible rect
            if(this.getRadius() >= BIG_SIZE.min) { //explosion
                const number = Random.nextRanged(DIVIDE_NUMBER.min, DIVIDE_NUMBER.max+1);
                console.log(`explode in ${number} small asteroids`);
                let angle = Random.nextFloat() * Math.PI * 2;
                const dA = Math.PI * 2 / number;
                for(let i=0; i< number; i++) {
                    const shape = Asteroid.createShape(false);
                    const speed = Vec2.createFromAngle(angle + Random.nextFloat()* dA/2 - dA/4, 1);
                    angle += dA;
                    const pos = speed.clone().mul(shape.getRadius()*1.3).add(this.position);
                    gameManager.addObject(new Asteroid(pos, speed.mul(MAX_SPEED), Random.nextFloat()*MAX_ROT_SPEED, shape));
                }
            }
            gameManager.addObject(new ParticleExplosion(this.position, 100));
        }
    }
    onCollision(gameManager, dT) {
        this.exploded = true;
        this.kill(gameManager);
    }
    static createShape(big) {
        const points = big ? Random.nextRanged(BIG_POINTS.min, BIG_POINTS.max) : Random.nextRanged(SMALL_POINTS.min, SMALL_POINTS.max);
        const min_size = big ? BIG_SIZE.min : SMALL_SIZE.min;
        const max_size = big ? BIG_SIZE.max : SMALL_SIZE.max;
        let radius = [Random.nextRangedFloat(min_size, max_size)];
        for(let i=1; i < points; ++i) {
            radius.push(Random.nextRangedFloat(Math.max(min_size, radius[i-1]-3), Math.min(max_size, radius[i-1]+3)));
        }
        radius[points-1] = (radius[points-1] + radius[0]) / 2;
        return Polygon.Regular(Vec2.ZERO, radius, points, Random.nextRangedFloat(0, Math.PI*2)).redefineCenter().setCenter(Vec2.ZERO);
    }
}
merge(Asteroid.prototype,  {
    bodyLayer: BODY_LAYER,
    collisionLayers: [BODY_LAYER, SHIP_COLLISION_LAYER, BULLET_COLLISION_LAYER]
}, true);

class AsteroidSpawner extends GameObject {
    constructor(startRate, maxRate) {
        super();
        this.maxRate = maxRate;
        this.startRate = startRate;
        this.time = 0;
        this.spawned = 0;
    }
    onFrame(gameManager, dT) {
        this.time += dT;
        const rate = Quadratic.easeInOut(this.time / 60) * (this.maxRate-this.startRate)+this.startRate;
        const newSpawn = this.spawned + rate * dT;
        const number = Math.floor(newSpawn) - Math.floor(this.spawned);
        this.spawned = newSpawn;
        if(number > 0) {
            for(let i=0; i<number; ++i) {
                const shape = Asteroid.createShape(true);
                const rect = shape.getRect();
                const pos = gameManager.viewer.visibleRect.clone()
                        .addMargins(rect.xMax, rect.yMax, -rect.xMin, -rect.xMin)
                        .getPercentPoint(Random.nextFloat());
                const speed = Vec2.translation(pos, gameManager.viewer.visibleRect.center)
                        .rotate(Random.nextFloat() * Math.PI/2 - Math.PI/4)
                        .setMagnitude(Random.nextFloat() * MAX_SPEED);
                const rotSpeed = Random.nextFloat() * MAX_ROT_SPEED;
                const asteroid = new Asteroid(pos, speed, rotSpeed, shape);
                gameManager.addObject(asteroid, false);
            }
        }
    }
}
merge(AsteroidSpawner.prototype, {
    bodyLayer: -1
}, true);

export {Asteroid, AsteroidSpawner};
export default Asteroid;