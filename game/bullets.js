/**
 * Created by rfrance on 12/20/2016.
 */
//######################################################################################################################
//#                                                       Bullet                                                       #
//######################################################################################################################
window.game.Bullet = (function() {
	/**
	 * @class game.Bullet
	 * @memberOf game
	 * @augments game.Object
	 * @classdesc a simple object defining a bullet, i.e an object that deals damages to the first object <!--
	 * -->it touches (if the object can receive damages), and die when it happens.
	 */
	class Bullet extends game.Object {
		/**
		 * @constructor
		 * @param {game.Object} launcher
		 * @param {utils.geometry2d.Vec2} position
		 * @param {utils.geometry2d.Vec2} speed
		 * @param {number} damages
		 * @param {number} [lifeTime=0]
		 */
		constructor(launcher, position, speed, damages, lifeTime=0) {
			super(position, speed);
			/**
			 * @name game.Bullet#damages
			 * @type {number}
			 */
			this.damages = damages;
			if(lifeTime)
				/**
				 * @name game.Bullet#lifeTime
				 * @type {number}
				 */
				this.lifeTime = lifeTime;
			/**
			 * @name game.Bullet#launcher
			 * @type {game.Object}
			 */
			this.launcher = launcher;

		}
		/**
		 * sets the launcher of the bullet
		 * @param {game.Object} object
		 */
		setLauncher( object ) { this.launcher = object; }

		/**
		 * returns the launcher of the bullet
		 * @returns {game.Object}
		 */
		getLauncher() { return this.launcher; }
		/**
		 * sets the damages dealt by the bullet on the impact
		 * @param {number} value
		 */
		setDamages( value ) { this.damages = value; }
		/**
		 * returns the damages dealt by the bullet on the impact
		 * @returns {number}
		 */
		getDamages() { return this.damages; }
		/**
		 * called by the game manager every frame. moves the bullet.
		 * @param {game.GameManager} gameManager
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
		 * @param {game.GameManager} gameManager
		 * @param {number} dT
		 */
		moveOnFrame( gameManager, dT ) {
			super.moveOnFrame(gameManager, dT);
			if(this.isOutOfRect(gameManager.gameRect)) {
				this.kill(gameManager);
			}
		}
		/**
		 * tells if the bullet can collide withe the specified object. returns true if the object is not its launcher
		 * @param {?game.Object} object
		 * @returns {boolean}
		 */
		canCollide( object ) { return this.collider !== undefined && object !== this.launcher; }

		/**
		 * called when the collision is confirmed between the bullet and the specified object
		 * @param {game.GameManager} gameManager
		 * @param {game.Object} object
		 */
		onCollision( gameManager, object ) {
			if(this.damages && object.receiveDamages) {
				object.receiveDamages(gameManager, this.damages);
				if(this.killOnCollision) {
					this.damages = 0;
					this.kill(gameManager);
				}
			} else if(this.killOnCollision && this.damages) {
				this.kill(gameManager);
			}
		}
	}
	Bullet.defaultShape = utils.geometry2d.Polygon.Absolute(utils.geometry2d.Vec2.createVec2Array([
		-10,2,   5,2,   7,1,   8,0,   7,1,   5,-2,   -10,-2
	]));
	Bullet.prototype.renderLayer = game.RenderLayer.OBJ3;
	Bullet.prototype.killOnCollision = true;
    return Bullet;
})();
//######################################################################################################################
//#                                                   BulletCollider                                                   #
//######################################################################################################################
window.game.BulletCollider = (function() {
	/**
	 * @class game.BulletCollider
	 * @memberOf game
	 * @augments game.ShapedObject2dCollider
	 * @classdesc the collider to use with bullets. the difference with a standard shaped collider is that <!--
	 * -->it can collide when it is inside an object but not touching the outline. it allows bullets to go faster <!--
	 * -->than normal objects even if they are small, because the collision will happen event if the the object moves <!--
	 * -->too fast to intersect with the outline of the opposite object's collider.
	 */
    class BulletCollider extends game.ShapedObject2dCollider {
		/**
		 * @constructor
		 * @param {utils.geometry2d.Shape} shape
		 */
		constructor(shape) {
			super(shape);
		}
		/**
		 * returns true because bullets collide when they are inside other objects.
		 * @param {game.Object2dCollider} collider
		 * @returns {boolean}
		 */
		collidesInside( collider ) { return true; }
    }

	return BulletCollider;
})();
//######################################################################################################################
//#                                                   BulletCollider                                                   #
//######################################################################################################################
window.game.HomingBullet = (function() {
	let Vec2 = utils.geometry2d.Vec2;
	let getSteeringForce = ( objPos,maxSpd,maxForce,currentSpd,targetPos )=>
		Vec2.translation(objPos, targetPos).setMagnitude(maxSpd)
			.remove(currentSpeed).clampMagnitude(0, maxForce);// maxSpeed=0, steerForce=0, getTarget=0
	/**
	 * @class HomingBullet
	 * @memberOf game
	 * @augments game.Bullet
	 * @classdesc a type of bullet that has a homing property : it searches for the best target to avoid <!--
	 * -->direction changes, and changes it's direction to touch it.
	 */
    class HomingBullet extends game.Bullet {
		/**
		 * @constructor
		 * @param {game.Object} launcher
		 * @param {number} damages
		 * @param {utils.geometry2d.Vec2} position
		 * @param {utils.geometry2d.Vec2} speed
		 * @param {number} lifeTime
		 * @param {number} steerForce
		 * @param {number} maxAngle
		 */
		constructor(launcher, damages, position, speed, lifeTime, steerForce, maxAngle) {
			super(launcher, position, speed, damages, lifeTime);
			/**
			 * @name game.HomingBullet#steerForce
			 * @type {number}
			 */
			this.steerForce = steerForce;
			/**
			 * @name game.HomingBullet#maxSpeed
			 * @type {number}
			 */
			this.maxSpeed = speed.magnitude;
			/**
			 * @name game.HomingBullet#maxAngle
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
		 * @param {number} maxSpeed - result  of the {@link game.HomingBullet#getMaxSpeed|getMaxSpeed} method.
		 * @param {number} distance
		 * @returns {number}
		 */
		getSteerForce( maxSpeed, distance) {
			return this.steerForce*(maxSpeed/Math.pow(distance, 1.2));
		}
		/**
		 * method for private use only. returns the target position to aim to, or null if no target was found.
		 * @param {game.GameManager} gameManager
		 * @returns {?utils.geometry2d.Vec2}
		 */
		getTargetPosition( gameManager ) {
			let res, angle,
				maxAngle = this.maxAngle,
				pos = this.getPosition(),
				//dist = 0,
				targets = gameManager.getObjects(game.collisionLayersFilter.bind(undefined, this.bodyLayer)),
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
		 * @param {game.GameManager} gameManager
		 * @param {number} dT
		 */
		onFrame( gameManager, dT ) {
			let t = this.getTargetPosition(gameManager);
			if(t) {
				let p = this.getPosition(), accel = Vec2.translation(p, t),
					d = accel.magnitude, ms = this.getMaxSpeed(dist), steer = this.getSteerForce(ms, d);
				accel.magnitude = steer;
				accel.add(Game.objects.properties.Homing.getSteeringForce(
					pos, maxSpeed, steer,
					this.getSpeed(), target)).magnitude = steer;
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
    return HomingBullet;
})();