/**
 * Created by Loic France on 12/20/2016.
 */
import {Vec2, Circle, Polygon} from "../geometry2d/geometry2d.mjs";
import GameObject from "./object.mjs";
import {ShapedObject2dCollider} from "./renderer_collider.mjs";
import {collisionLayersFilter} from "./manager.mjs";
/**
 * @module game/bullets
 */
//######################################################################################################################
//#                                                       Bullet                                                       #
//######################################################################################################################

/**
 * @class Bullet
 * @memberOf game
 * @augments GameObject
 * @classdesc a simple object defining a bullet, i.e an object that deals damage to the first object <!--
 * -->it touches (if the object can receive damage), and die when it happens.
 */
class Bullet extends GameObject {
	/**
	 * @constructor
	 * @param {GameObject} launcher
	 * @param {Vec2} position
	 * @param {Vec2} speed
	 * @param {number} damage
	 * @param {Rect} maxRect - when the bullet will go out of this rect, it will be destroyed
	 * @param {number} [lifeTime=0]
	 */
	constructor(launcher, position, speed, damage, maxRect, lifeTime=0) {
		super(position, speed);
		/**
		 * @name Bullet#damage
		 * @type {number}
		 */
		this.damage = damage;
		if(lifeTime)
			/**
			 * @name Bullet#lifeTime
			 * @type {number}
			 */
			this.lifeTime = lifeTime;
		/**
		 * @name Bullet#launcher
		 * @type {GameObject}
		 */
		this.launcher = launcher;

		/**
		 * @nam Bullet#maxRect
		 * @type {Rect}
		 */
		this.maxRect = maxRect;
	}
	/**
	 * sets the launcher of the bullet
	 * @param {GameObject} object
	 */
	setLauncher( object ) { this.launcher = object; }

	/**
	 * returns the launcher of the bullet
	 * @returns {GameObject}
	 */
	getLauncher() { return this.launcher; }
	/**
	 * sets the damage dealt by the bullet on the impact
	 * @param {number} value
	 */
	setDamages( value ) { this.damage = value; }
	/**
	 * returns the damage dealt by the bullet on the impact
	 * @returns {number}
	 */
	getDamages() { return this.damage; }
	/**
	 * called by the game manager every frame. moves the bullet.
	 * @param {GameManager} gameManager
	 * @param {number} dT
	 */
	onFrame( gameManager, dT ) {
		super.onFrame(gameManager, dT);
		if(this.lifeTime !== undefined) {
			if(this.lifeTime <=0) this.kill(gameManager);
			this.lifeTime -= dT;
		}
	}
	/**
	 * called once a frame. moves the bullet according to its speed. if the bullet goes out <!--
	 * -->of the game rectangle, is is destroyed.
	 * @param {GameManager} gameManager
	 * @param {number} dT
	 */
	moveOnFrame( gameManager, dT ) {
		super.moveOnFrame(gameManager, dT);
		if(this.isOutOfRect(this.maxRect)) {
			this.kill(gameManager);
		}
	}
	/**
	 * tells if the bullet can collide withe the specified object. returns true if the object is not its launcher
	 * @param {?GameObject} object
	 * @returns {boolean}
	 */
	canCollide( object ) { return this.collider !== undefined && object !== this.launcher; }

	/**
	 * called when the collision is confirmed between the bullet and the specified object
	 * @param {GameManager} gameManager
	 * @param {GameObject} object
	 */
	onCollision( gameManager, object ) {
		if(this.damage && object.receiveDamage) {
			object.receiveDamage(gameManager, this.damage);
			if(this.killOnCollision) {
				this.damage = 0;
				this.kill(gameManager);
			}
		} else if(this.killOnCollision && this.damage) {
			this.kill(gameManager);
		}
	}
}
Bullet.defaultShape = Polygon.Absolute(Vec2.createVec2Array([
	-10,2,   5,2,   7,1,   8,0,   7,1,   5,-2,   -10,-2
]));
Bullet.prototype.renderLayer = 0;
Bullet.prototype.killOnCollision = true;
//######################################################################################################################
//#                                                   BulletCollider                                                   #
//######################################################################################################################

/**
 * @class BulletCollider
 * @memberOf game
 * @augments ShapedObject2dCollider
 * @classdesc the collider to use with bullets. the difference with a standard shaped collider is that <!--
 * -->it can collide when it is inside an object but not touching the outline. it allows bullets to go faster <!--
 * -->than normal objects even if they are small, because the collision will happen event if the the object moves <!--
 * -->too fast to intersect with the outline of the opposite object's collider.
 */
class BulletCollider extends ShapedObject2dCollider {
	/**
	 * @constructor
	 * @param {Shape} shape
	 */
	constructor(shape) {
		super(shape);
	}
	/**
	 * returns true because bullets collide when they are inside other objects.
	 * @param {Object2dCollider} collider
	 * @returns {boolean}
	 */
	collidesInside( collider ) { return true; }
}
//######################################################################################################################
//#                                                   BulletCollider                                                   #
//######################################################################################################################
	const getSteeringForce = ( objPos,maxSpd,maxForce,currentSpd,targetPos )=>
		Vec2.translation(objPos, targetPos).setMagnitude(maxSpd)
			.remove(currentSpeed).clampMagnitude(0, maxForce);// maxSpeed=0, steerForce=0, getTarget=0
	/**
	 * @class HomingBullet
	 * @memberOf game
	 * @augments Bullet
	 * @classdesc a type of bullet that has a homing property : it searches for the best target to avoid <!--
	 * -->direction changes, and changes it's direction to touch it.
	 */
    class HomingBullet extends Bullet {
		/**
		 * @constructor
		 * @param {GameObject} launcher
		 * @param {number} damage
		 * @param {Vec2} position
		 * @param {Vec2} speed
		 * @param {Rect} maxRect
		 * @param {number} lifeTime
		 * @param {number} steerForce
		 * @param {number} maxAngle
		 */
		constructor(launcher, damage, position, speed, maxRect, lifeTime, steerForce, maxAngle) {
			super(launcher, position, speed, damage, maxRect, lifeTime);
			/**
			 * @name HomingBullet#steerForce
			 * @type {number}
			 */
			this.steerForce = steerForce;
			/**
			 * @name HomingBullet#maxSpeed
			 * @type {number}
			 */
			this.maxSpeed = speed.magnitude;
			/**
			 * @name HomingBullet#maxAngle
			 * @type {number}
			 */
			this.maxAngle = maxAngle;
			this.angle = 0;
			this.setAccelerationXY(0,0);
		}
		/**
		 * return the maximum speed the bullet can reach depending on the distance to the target.
		 * @param {number} distance
		 * @returns {number}
		 */
		getMaxSpeed( distance ) {
			return this.maxSpeed*(1-Math.sqrt(this.maxSpeed/(150*distance)));
		}
		/**
		 * a method for private use only. returns the appropriate steer force the bullet have to use <!--
		 * -->to aim to its target, depending on its maximum speed and the distance to its target.
		 * @param {number} maxSpeed - result  of the {@link HomingBullet#getMaxSpeed|getMaxSpeed} method.
		 * @param {number} distance
		 * @returns {number}
		 */
		getSteerForce( maxSpeed, distance) {
			return this.steerForce*(maxSpeed/Math.pow(distance, 1.2));
		}
		/**
		 * method for private use only. returns the target position to aim to, or null if no target was found.
		 * @param {GameManager} gameManager
		 * @returns {?Vec2}
		 */
		getTargetPosition( gameManager ) {
			let res, angle,
				maxAngle = this.maxAngle,
				pos = this.getPosition(),
				//dist = 0,
				targets = gameManager.getObjects(collisionLayersFilter.bind(undefined, this.bodyLayer)),
				i = targets.length;
			while(i--) {
				if(targets[i] !== this.launcher) {
					angle = (Vec2.translation(pos, targets[i].getPosition()).angle-this.radians) % (Math.PI*2);
					if(angle > Math.PI) angle = Circle.PI2-angle;
					if(angle < maxAngle) {
						maxAngle = angle;
						res = targets[i];
					}   }   }
			return res? res.getPosition() : null;
		}

		/**
		 * called every frame by the game manager. does the usual frame work, calculate the target position, <!--
		 * -->and set the acceleration to hit it. makes sure the speed do not exceed the maximum.
		 * @param {GameManager} gameManager
		 * @param {number} dT
		 */
		onFrame( gameManager, dT ) {
			let t = this.getTargetPosition(gameManager);
			if(t) {
				let p = this.getPosition(), accel = Vec2.translation(p, t),
					d = accel.magnitude, ms = this.getMaxSpeed(dist), steer = this.getSteerForce(ms, d);
				accel.magnitude = steer;
				accel.add(getSteeringForce(pos, maxSpeed, steer, this.getSpeed(), target)).magnitude = steer;
				this.setAcceleration(accel);
				super.onFrame(gameManager, dT);
				this.setSpeed(this.getSpeed().clampMagnitude(0, maxSpeed));
			} else {
				this.setAccelerationXY(0,0);
				super.onFrame(gameManager, dT);
			}
			const a = this.getSpeed().angle;
			this.rotate(a-this.angle);
			this.angle = a;
		}
    }