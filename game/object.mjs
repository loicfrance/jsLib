/**
 * Created by Loic on 12/20/2016.
 */
/**
 * @module game/object
 */
import {Vec2} from "../geometry2d/Vec2.mjs";
import {Rect} from "../geometry2d/Rect.mjs";
import {ShapedObjectRenderer, ShapedObject2dCollider} from "./renderer_collider.mjs";

/**
 * @class GameObject
 * @classdesc the base class of all game objects. contains only seven optional attributes : <!--
 * -->position, speed, accel (for the acceleration), angle, rotationSpeed, collider and renderer, <!--
 * -->which are not present at the creation, but can be set using setters and direct access. <!--
 * -->You better should create subclasses of this base class where all needed attributes are created <!--
 * -->in the constructor.
 * There are also three attributes that are defined in the prototype because they are generally common <!--
 * -->to all instances of a class (but you can redefine it  for one object if you want) :
 * - the {@link GameObject#renderLayer|renderLayer}, used to define the drawing priority in decreasing order <!--
 * -->(0:max, < 0:not rendered),
 * - the {@link GameObject#bodyLayer|bodyLayer}, used to define the layer of the object for collision <!--
 * -->detection. has no impact on other things such as frame or drawing priority.
 * - the {@link GameObject#collisionLayers|collisionLayers}, used to define the layers this object <!--
 * -->can collide in.
 */
class GameObject {
	/**
	 * @constructor
	 * @param {Vec2} [position=null]
	 * @param {Vec2} [speed=null]
	 * @param {Vec2} [accel=null]
	 */
	constructor(position = null, speed = null, accel = null) {
		if(position) {
			/**
			 * @name GameObject#position
			 * @type {Vec2}
			 */
			this.position = position.clone();
			if(speed) {
				/**
				 * @name GameObject#speed
				 * @type {Vec2}
				 */
				this.speed = speed.clone();
				if(accel) {
					/**
					 * @name GameObject#accel
					 * @type {Vec2}
					 */
					this.accel = accel.clone();
		}   }   }
	}

//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - - -transform methods - - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************
//-------------------------------------------------------position-------------------------------------------------------
	/**
	 * returns the position of the object, or {@link Vec2.ZERO|Vec2.ZERO} <!--
	 * -->if the attribute does not exist.
	 * @returns {Vec2}
	 */
	getPosition() {
		return this.position || Vec2.ZERO;
	}
	/**
	 * returns a copy of the position of the object
	 * @returns {Vec2|Vec2}
	 */
	copyPosition() {
		return this.getPosition().clone();
	}
	/**
	 * sets the position of the object to the specified one if the attribute exists, creates it otherwise
	 * @param {Vec2} pos
	 * @returns {GameObject} <code>this</code>
	 */
	setPosition(pos) {
		return this.setPositionXY(pos.x, pos.y);
	}
	/**
	 * sets the position of the object to the specified coordinates if the attribute exists, <!--
	 * -->creates it otherwise
	 * @param {number} x
	 * @param {number} y
	 * @returns {GameObject} <code>this</code>
	 */
	setPositionXY(x, y) {
		if(this.position) this.position.setXY(x, y);
		else this.position = new Vec2(x, y);
		return this;
	}

//---------------------------------------------------------speed--------------------------------------------------------
	/**
	 * returns the speed of the object, or {@link Vec2.ZERO|Vec2.ZERO} <!--
	 * -->if the attribute does not exist.
	 * @returns {Vec2}
	 */
	getSpeed() {
		return this.speed || Vec2.ZERO;
	}
	/**
	 * returns a copy of the speed of the object
	 * @returns {Vec2}
	 */
	copySpeed() {
		return this.getSpeed().clone();
	}
	/**
	 * sets the speed of the object to the specified one if the attribute exists, creates it otherwise
	 * @param {Vec2} spd
	 * @returns {GameObject} <code>this</code>
	 */
	setSpeed(spd) {
		return this.setSpeedXY(spd.x, spd.y);
	}
	/**
	 * sets the speed coordinates of the object to the specified values if the attribute exists, <!--
	 * -->creates it otherwise
	 * @param {number} x
	 * @param {number} y
	 * @returns {GameObject}<code>this</code>
	 */
	setSpeedXY(x, y) {
		if (this.speed) this.speed.setXY(x, y);
		else this.speed = new Vec2(x,y);
		return this;
	}

//-----------------------------------------------------acceleration-----------------------------------------------------
	/**
	 * returns the acceleration of the object, or {@link Vec2.ZERO|Vec2.ZERO} <!--
	 * -->if the attrbute does not exist.
	 * @returns {Vec2|Vec2}
	 */
	getAcceleration() {
		return this.accel || Vec2.ZERO;
	}
	/**
	 * returns a copy of the acceleration of the object.
	 * @returns {Vec2|Vec2}
	 */
	copyAcceleration() {
		return this.getAcceleration().clone();
	}
	/**
	 * sets the acceleration of the object to the specified one if the attribute exists, useless otherwise
	 * @param {Vec2} acc
	 * @returns {GameObject} <code>this</code>
	 */
	setAcceleration(acc) {
		this.setAccelerationXY(acc.x, acc.y);
		return this;
	}
	/**
	 * sets the acceleration coordinates of the object to the specified values if the attribute exists, <!--
	 * -->useless otherwise
	 * @param {number} x
	 * @param {number} y
	 */
	setAccelerationXY(x, y) {
		if (this.accel) this.accel.setXY(x, y);
		else this.accel = new Vec2(x,y);
		return this;
	}

//-------------------------------------------------------rotation-------------------------------------------------------
	/**
	 * returns the rotation speed (in radians per second) of the object if it exists, or 0.
	 * @returns {number}
	 */
	getRotationSpeed() {
		return this.rotationSpeed || 0;
	}
	/**
	 * set the rotation speed of the object to the specified value in radians per seconds.
	 * @param radPerSec
	 */
	setRotationSpeed(radPerSec) {
		this.rotationSpeed = radPerSec;
	}
	/**
	 * rotate the object according to the specified angle in radians
	 * @param {number} radians
	 * @returns {GameObject} <code>this</code>
	 */
	rotate(radians) {
		if (this.renderer) this.renderer.rotate(radians);
		if (this.collider) this.collider.rotate(radians);
		return this;
	}

//-------------------------------------------------high-level transforms------------------------------------------------
	/**
	 * moves the object of the specified translation.
	 * @param {Vec2} delta
	 * @returns {GameObject} <code>this</code>
	 */
	move(delta) {
		return this.moveXY(delta.x, delta.y);
	}
	/**
	 * moves the object according to the specified translation coordinates
	 * @param {number} x
	 * @param {number} y
	 * @returns {GameObject} <code>this</code>
	 */
	moveXY(x, y) {
		this.getPosition().addXY(x, y);
		return this;
	}
	/**
	 * increase the object's speed according to the parameter
	 * @param deltaSpd
	 * @returns {GameObject} <code>this</code>
	 */
	accelerate(deltaSpd) {
		return this.accelerateXY(deltaSpd.x, deltaSpd.y);
	}
	/**
	 * increase the object's speed according to the parameters
	 * @param {number} x
	 * @param {number} y
	 * @returns {GameObject} <code>this</code>
	 */
	accelerateXY(x, y) {
		this.getSpeed().addXY(x, y);
		return this;
	}
	/**
	 * change the object size by multiplying it's dimensions by the given factor
	 * @param {number} factor
	 * @returns {GameObject} <code>this</code>
	 */
	scale(factor) {
		if (this.renderer) this.renderer.scale(factor);
		if (this.collider) this.collider.scale(factor);
		return this;
	}

//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - -Rect & Radius getters - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************
	/**
	 * returns the Rect containing the object, ie the collider and the renderer if they exists, <!--
	 * -->and the position point.
	 * @returns {Rect}
	 */
	getRect() {
		return Rect.getUnion([this.getRenderRect(), this.getColliderRect()]);
	}
	/**
	 * returns the Rect containing the object's renderer, or at least the position.
	 * @returns {Rect}
	 */
	getRenderRect() {
		return (this.renderer && this.renderer.setPosition(this.getPosition()).getRect())
			|| Rect.createFromPoint(this.getPosition());
	}
	/**
	 * returns the Rect containing the object's collider, or at least the position.
	 * @returns {Rect}
	 */
	getColliderRect() {
		return (this.collider && this.collider.setPosition(this.getPosition()).getRect())
			|| Rect.createFromPoint(this.getPosition());
	}
	/**
	 * returns the radius of the object, ie the maximum between the radius of the collider and the one of the <!--
	 * -->renderer if they exists, or 0.
	 * @returns {number}
	 */
	getRadius() {
		return Math.max(this.getRenderRadius(), this.getColliderRadius());
	}
	/**
	 * returns the radius of the renderer or 0 if it doesn't exist.
	 * @returns {number}
	 */
	getRenderRadius() {
		return this.renderer ? this.renderer.getRadius() : 0;
	}
	/**
	 * returns the radius of the collider or 0 if it doesn't exist.
	 * @returns {number}
	 */
	getColliderRadius() {
		return this.collider ? this.collider.getRadius() : 0;
	}

//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - - - -frame methods - - - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************
	/**
	 * called once every frame by the game manager
	 * @param {GameManager} gameManager
	 * @param {number} dT
	 */
	onFrame(gameManager, dT) {
		this.moveOnFrame(gameManager, dT);
		this.accelerateOnFrame(gameManager, dT);
		this.rotateOnFrame(gameManager, dT);
	}
	/**
	 * called by the {@link GameObject#onFrame|onFrame} method. moves according speed.
	 * @param {GameManager} gameManager
	 * @param {number} dT
	 */
	moveOnFrame(gameManager, dT) {
		let spd = this.getSpeed();
		if (!spd.isZero()) this.move(spd.clone().mul(dT));
	}
	/**
	 * called by the {@link GameObject#onFrame|onFrame} method. increase speed according acceleration.
	 * @param {GameManager} gameManager
	 * @param {number} dT
	 */
	accelerateOnFrame(gameManager, dT) {
		let acc = this.getAcceleration();
		if (!acc.isZero()) this.accelerate(acc.clone().mul(dT));
	}
	/**
	 * called by the {@link GameObject#onFrame|onFrame} method. rotate according to rotation speed if exists.
	 * @param {GameManager} gameManager
	 * @param {number} dT
	 */
	rotateOnFrame(gameManager, dT) {
		if (this.rotationSpeed) this.rotate(this.rotationSpeed * dT);
	}

//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - - -collision methods - - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************
	/**
	 * sets the <code>collider</code> attribute of the object.
	 * @param {ObjectCollider} collider
	 */
	setCollider( collider ) {
		/**
		 * @name GameObject#collider
		 * @type {ObjectCollider}
		 */
		this.collider = collider;
	}
	/**
	 * tells if the object is able to collide with the specified object
	 * @param {GameObject} object
	 * @returns {boolean}
	 */
	canCollideWith(object) {
		return true;
	}
	/**
	 * called at the beginning of the collision part of a frame, after the game manager has called <!--
	 * -->the onFrame method for all objects. This method is only called for objects with a <!--
	 * -->{@link GameObject#bodyLayer|bodyLayer} greater or equal to 0.
	 */
	prepareCollision() {
		this.collider.prepareCollision(this.getPosition());
	}
	/**
	 * called at the end of the collision part of a frame, after the game manager has called the <!--
	 * -->{@link #handleCollision} method to handle all the collisions during the frame. This method <!--
	 * -->is only called for objects with a {@link GameObject#bodyLayer|bodyLayer} greater or equal to 0.
	 * By default, this method does nothing, but you can override it when using rigidBodies to call the <!--
	 * -->{@link physics.RigidBody#processForces|RigidBody.processForces} method
	 * @param {GameManager} gameManager
	 */
	endCollision(gameManager) {
	}

	/**
	 * returns true if the instances collides with the parameter object. This method is called after <!--
	 * the {@link GameObject#canCollideWith|canCollideWith} method and before the onCollision method, for both objects
	 * @param {GameObject} obj
	 * @returns {boolean}
	 */
	collides(obj) {
		return this.collider.collides(obj.collider);
	}

	/**
	 * called by the game manager on the top priority object, with all colliding objects in the game, <!--
	 * -->at the end of the frame. This function has to call on onCollision method for the instance <!--
	 * -->and the objects, unless it has decided that the colliison should not be taken into account.
	 * Collisions between objects in the given array are handled in the game manager, so this function <!--
	 * -->should not handle these collisions.
	 * @param {GameManager} gameManager
	 * @param {GameObject[]} objects
	 */
	handleCollision(gameManager, objects) {
		let i=objects.length;
		while(i--) {
			this.onCollision(gameManager, objects[i]);
			objects[i].onCollision(gameManager, this);
		}
	}
	/**
	 * called by the object handling collision between the specified object and the instance. <!--
	 * -->This is the function where collision event must be handled
	 * @param {GameManager}gameManager
	 * @param {GameObject} object
	 */
	onCollision(gameManager, object) {
	}
	/**
	 * returns true if this object can collide with objects which are in the specified layer.
	 * @param {number} layer
	 * @returns {boolean}
	 */
	isInCollisionLayer(layer) {
		return this.collisionLayers.indexOf(layer) >= 0;
	}

//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - - - -render methods- - - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************
	/**
	 * sets the <code>renderer</code> attribute of the object.
	 * @param {ObjectRenderer} renderer
	 */
	setRenderer( renderer ) {
		/**
		 * @name GameObject#renderer
		 * @type {ObjectRenderer}
		 */
		this.renderer = renderer;
	}
	/**
	 * called by the game map to draw the object on the canvas
	 * @param {CanvasRenderingContext2D|WebGLRenderingContext} context
	 */
	render(context) {
		this.renderer && this.renderer.setPosition(this.getPosition()).render(context);
	}
	/**
	 * call this function if you want to draw debug informations on the canvas. draws the collider.
	 * @param {CanvasRenderingContext2D}context
	 */
	renderDebug(context) {
		this.collider && this.collider.render(context);
	}

//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - - - -death methods - - - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************
	/**
	 * kills the object and removes it from the game before the next frame. The <!--
	 * -->{@link GameObject#onDeath|onDeath} method is then called
	 * @param gameManager
	 */
	kill(gameManager) {
		gameManager.removeObject(this);
	}
	/**
	 * called by the game manager the moment the object is removed from the 
	 * @param gameManager
	 */
	onDeath(gameManager) {
	}

//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - - -position checkers - - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************
	//noinspection JSSuspiciousNameCombination
	/**
	 * returns whether or not the object is outside the specified rectangle, augmaented of the specified margins.
	 * @param {Rect} rect
	 * @param {number} [marginX=0]
	 * @param {number} [marginY=marginX]
	 * @returns {boolean}
	 */
	isOutOfRect(rect, marginX = 0, marginY = marginX) {
		let r = this.getRect().addMarginsXY(marginX, marginY);
		return (rect.xMin > r.xMax || rect.xMax < r.xMin || rect.yMin > r.yMax || rect.yMax < r.yMin );
	}

	//noinspection JSSuspiciousNameCombination (for marginX = marginY)
	/**
	 * maintains the object inside the specified rectangle. you can call this method inside the <!--
	 * -->{@link GameObject#moveOnFrame|moveOnFrame} method, for example, to make sure the object <!--
	 * -->does not go out of a rectangle.
	 * This function returns the vector used to move the object inside the rectangle.
	 * @param {Rect|Rect} rect
	 * @param {number} marginX
	 * @param {number} marginY
	 * @returns {Vec2}
	 */
	maintainInRect(rect, marginX = 0, marginY = marginX) {
		rect = rect.clone().addMarginsXY(-marginX, -marginY);
		let objRect = this.getRect(),
			delta = new Vec2(
				rect.xMin > objRect.xMin ? rect.xMin - objRect.xMin :
					rect.xMax < objRect.xMax ? rect.xMax - objRect.xMax :
						0,
				rect.yMin > objRect.yMin ? rect.yMin - objRect.yMin :
					rect.yMax < objRect.yMax ? rect.yMax - objRect.yMax :
						0);
		if (!delta.isZero()) {
			this.moveXY(delta.x, delta.y);
		}
		return delta;
	}
}
//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - -attributes with default value - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************
/**
 * the render layer of this object. As it is generally common to all objects of the same class, <!--
 * -->this attribute is generally defined in the prototype of the class, but you can do it anywhere you want <!--
 * -->for your objects. The default value is 0;
 * This attributes is used to define an order for the objects to be drawn on the screen.
 * An object with a renderLayer of 0 will be above an object with the renderLayer of 1
 * @name GameObject#renderLayer
 * @type {number}
 */
GameObject.prototype.renderLayer = 0;
/**
 * the body layer of this object. As it is generally common to all objects of the same class, <!--
 * -->this attribute is generally defined in the prototype of the class, but you can do it anywhere you want <!--
 * -->for your objects.
 * This number defines where the body of the object is located. If an other object want to be able <!--
 * -->to collide with it, it must have the same number in its <!--
 * -->{@link GameObject#collisionLayers|collisionLayers} array.
 * A body layer equal to -1 means that the object will never collide with any other object.
 * @name GameObject#bodyLayer
 * @type {number}
 */
GameObject.prototype.bodyLayer = 0;
/**
 * When two objects are colliding, the object with the highest priority will be the one handling collisions.
 * If set to a negative number, it cannot handle collision, even with lower priority objects.
 * @name ObjectcollisionPriority
 * @type {number}
 */
GameObject.prototype.collisionPriority = 0;
/**
 * the collision layers of this object. As it is generally common to all objects of the same class, <!--
 * -->this attribute is generally defined in the prototype of the class, but you can do it anywhere you want <!--
 * -->for your objects.
 * This array defines which objects this object can collide with. To collide with an object, <!--
 * -->this array must contain its {@link GameObject#bodyLayer|bodyLayer} attribute.
 * @name GameObject#collisionLayers
 * @type {number[]}
 */
GameObject.prototype.collisionLayers = [0];

/**
 * whether or not this object needs to have its 'onFrame' function called each game loop. As it is generally <!--
 * -->common to all objects of the same class, this attribute is generally defined in the prototype <!--
 * -->of the class, but you can do it anywhere you want for your objects. You can also use it <!--
 * -->as a member attribute and modify it during the game to change the object's living state
 * @name GameObject#living
 * @type {boolean}
 */
GameObject.prototype.living = true;

class SimpleShapedObject extends GameObject {
	constructor(shape, color) {
		super(shape.center);
		this.setRenderer(new ShapedObjectRenderer(shape, color));
		this.setCollider(new ShapedObject2dCollider(shape));
	}
}
export default GameObject;
export { GameObject, SimpleShapedObject };