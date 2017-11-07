/**
 * Created by rfrance on 12/20/2016.
 */
window.game.Object = (function() {
	const Vec2 = utils.geometry2d.Vec2,
		Rect = utils.geometry2d.Rect;
	/**
	 * @memberOf game
	 * @class game.Object
	 * @classdesc the base class of all game objects. contains only seven optional attributes : <!--
	 * -->position, speed, accel (for the acceleration), angle, rotationSpeed, collider and renderer, <!--
	 * -->which are not present at the creation, but can be set using setters and direct access. <!--
	 * -->You better should create subclasses of this base class where all needed attributes are created <!--
	 * -->in the constructor.
	 * There are also three attributes that are defined in the prototype because they are generally common <!--
	 * -->to all instances of a class (but you can redefine it  for one object if you want) :
	 * - the {@link game.Object#renderLayer|renderLayer}, used to define the drawing priority in decreasing order <!--
	 * -->(0:max, < 0:not rendered),
	 * - the {@link game.Object#bodyLayer|bodyLayer}, used to define the layer of the object for collision <!--
	 * -->detection. has no impact on other things such as frame or drawing priority.
	 * - the {@link game.Object#collisionLayers|collisionLayers}, used to define the layers this object <!--
	 * -->can collide in.
	 */
	class GameObject {
		/**
		 * @constructor
		 * @param {utils.geometry2d.Vec2} [position=null]
		 * @param {utils.geometry2d.Vec2} [speed=null]
		 * @param {utils.geometry2d.Vec2} [accel=null]
		 */
		constructor(position = null, speed = null, accel = null) {
			if(position) {
				/**
				 * @name game.Object#position
				 * @type {utils.geometry2d.Vec2}
				 */
				this.position = position.clone();
				if(speed) {
					/**
					 * @name game.Object#speed
					 * @type {utils.geometry2d.Vec2}
					 */
					this.speed = speed.clone();
					if(accel) {
						/**
						 * @name game.Object#accel
						 * @type {utils.geometry2d.Vec2}
						 */
						this.accel = accel.clone();
			}   }   }
		}

//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - - -transform methods - - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************
//-------------------------------------------------------position-------------------------------------------------------
		/**
		 * returns the position of the object, or {@link utils.geometry2d.Vec2.ZERO|Vec2.ZERO} <!--
		 * -->if the attribute does not exist.
		 * @returns {Vec2}
		 */
		getPosition() {
			return this.position || Vec2.ZERO;
		}
		/**
		 * returns a copy of the position of the object
		 * @returns {utils.geometry2d.Vec2|Vec2}
		 */
		copyPosition() {
			return this.getPosition().clone();
		}
		/**
		 * sets the position of the object to the specified one if the attribute exists, creates it otherwise
		 * @param {utils.geometry2d.Vec2} pos
		 * @returns {game.Object} <code>this</code>
		 */
		setPosition(pos) {
			return this.setPositionXY(pos.x, pos.y);
		}
		/**
		 * sets the position of the object to the specified coordinates if the attribute exists, <!--
		 * -->creates it otherwise
		 * @param {number} x
		 * @param {number} y
		 * @returns {game.Object} <code>this</code>
		 */
		setPositionXY(x, y) {
			if(this.position) this.position.setXY(x, y);
			else this.position = new Vec2(x, y);
			return this;
		}

//---------------------------------------------------------speed--------------------------------------------------------
		/**
		 * returns the speed of the object, or {@link utils.geometry2d.Vec2.ZERO|Vec2.ZERO} <!--
		 * -->if the attribute does not exist.
		 * @returns {utils.geometry2d.Vec2}
		 */
		getSpeed() {
			return this.speed || Vec2.ZERO;
		}
		/**
		 * returns a copy of the speed of the object
		 * @returns {utils.geometry2d.Vec2}
		 */
		copySpeed() {
			return this.getSpeed().clone();
		}
		/**
		 * sets the speed of the object to the specified one if the attribute exists, creates it otherwise
		 * @param {utils.geometry2d.Vec2} spd
		 * @returns {game.Object} <code>this</code>
		 */
		setSpeed(spd) {
			return this.setSpeedXY(spd.x, spd.y);
		}
		/**
		 * sets the speed coordinates of the object to the specified values if the attribute exists, <!--
		 * -->creates it otherwise
		 * @param {number} x
		 * @param {number} y
		 * @returns {game.Object}<code>this</code>
		 */
		setSpeedXY(x, y) {
			if (this.speed) this.speed.setXY(x, y);
			else this.speed = new Vec2(x,y);
			return this;
		}

//-----------------------------------------------------acceleration-----------------------------------------------------
		/**
		 * returns the acceleration of the object, or {@link utils.geometry2d.Vec2.ZERO|Vec2.ZERO} <!--
		 * -->if the attrbute does not exist.
		 * @returns {Vec2|utils.geometry2d.Vec2}
		 */
		getAcceleration() {
			return this.accel || Vec2.ZERO;
		}
		/**
		 * returns a copy of the acceleration of the object.
		 * @returns {utils.geometry2d.Vec2|Vec2}
		 */
		copyAcceleration() {
			return this.getAcceleration().clone();
		}
		/**
		 * sets the acceleration of the object to the specified one if the attribute exists, useless otherwise
		 * @param {utils.geometry2d.Vec2} acc
		 * @returns {game.Object} <code>this</code>
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
		 * @returns {game.Object} <code>this</code>
		 */
		rotate(radians) {
			if (this.renderer) this.renderer.rotate(radians);
			if (this.collider) this.collider.rotate(radians);
			return this;
		}

//-------------------------------------------------high-level transforms------------------------------------------------
		/**
		 * moves the object of the specified translation.
		 * @param {utils.geometry2d.Vec2} delta
		 * @returns {game.Object} <code>this</code>
		 */
		move(delta) {
			return this.moveXY(delta.x, delta.y);
		}
		/**
		 * moves the object according to the specified translation coordinates
		 * @param {number} x
		 * @param {number} y
		 * @returns {game.Object} <code>this</code>
		 */
		moveXY(x, y) {
			this.getPosition().addXY(x, y);
			return this;
		}
		/**
		 * increase the object's speed according to the parameter
		 * @param deltaSpd
		 * @returns {game.Object} <code>this</code>
		 */
		accelerate(deltaSpd) {
			return this.accelerateXY(deltaSpd.x, deltaSpd.y);
		}
		/**
		 * increase the object's speed according to the parameters
		 * @param {number} x
		 * @param {number} y
		 * @returns {game.Object} <code>this</code>
		 */
		accelerateXY(x, y) {
			this.getSpeed().addXY(x, y);
			return this;
		}
		/**
		 * change the object size by multiplying it's dimensions by the given factor
		 * @param {number} factor
		 * @returns {game.Object} <code>this</code>
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
		 * @returns {utils.geometry2d.Rect}
		 */
		getRect() {
			return Rect.getUnion([this.getRenderRect(), this.getColliderRect()]);
		}
		/**
		 * returns the Rect containing the object's renderer, or at least the position.
		 * @returns {utils.geometry2d.Rect}
		 */
		getRenderRect() {
			return (this.renderer && this.renderer.setPosition(this.getPosition()).getRect())
				|| Rect.createFromPoint(this.getPosition());
		}
		/**
		 * returns the Rect containing the object's collider, or at least the position.
		 * @returns {utils.geometry2d.Rect}
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
		 * @param {game.GameManager} gameManager
		 * @param {number} dT
		 */
		onFrame(gameManager, dT) {
			this.moveOnFrame(gameManager, dT);
			this.accelerateOnFrame(gameManager, dT);
			this.rotateOnFrame(gameManager, dT);
		}
		/**
		 * called by the {@link game.Object#onFrame|onFrame} method. moves according speed.
		 * @param {game.GameManager} gameManager
		 * @param {number} dT
		 */
		moveOnFrame(gameManager, dT) {
			let spd = this.getSpeed();
			if (!spd.isZero()) this.move(spd.clone().mul(dT));
		}
		/**
		 * called by the {@link game.Object#onFrame|onFrame} method. increase speed according acceleration.
		 * @param {game.GameManager} gameManager
		 * @param {number} dT
		 */
		accelerateOnFrame(gameManager, dT) {
			let acc = this.getAcceleration();
			if (!acc.isZero()) this.accelerate(acc.clone().mul(dT));
		}
		/**
		 * called by the {@link game.Object#onFrame|onFrame} method. rotate according to rotation speed if exists.
		 * @param {game.GameManager} gameManager
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
		 * @param {game.ObjectCollider} collider
		 */
		setCollider( collider ) {
			/**
			 * @name game.Object#collider
			 * @type {game.ObjectCollider}
			 */
			this.collider = collider;
		}
		/**
		 * tells if the object is able to collide with the specified object, or if the object can collide <!--
		 * -->with any object if the parameter is null
		 * @param {?game.Object} [object=null]
		 * @returns {boolean}
		 */
		canCollide(object = null) {
			return this.collider !== undefined && this.collider.activated;
		}
		/**
		 * called at the beginning of the collision part of a frame, after the game manager has called <!--
		 * -->the onFrame method for all objects. This method is only called for objects with a <!--
		 * -->{@link game.Object#bodyLayer|bodyLayer} greater or equal to 0.
		 */
		prepareCollision() {
			this.collider.prepareCollision(this.getPosition());
		}
		/**
		 * returns true if the instances collides with the parameter object. This method is called after <!--
		 * the {@link game.Object#canCollide|canCollide} method and before the onCollision method, for both objects
		 * @param {game.Object} obj
		 * @returns {boolean}
		 */
		collides(obj) {
			return this.collider.collides(obj.collider);
		}

		/**
		 * called by the game manager on the top priority object, with all colliding objects in the game, <!--
		 * -->at the end of the frame. This function has to call on onCollision method for the instance <!--
		 * -->and the objects, unless it has decided that the colliison should not be taken into account.
		 * @param {game.GameManager} gameManager
		 * @param {game.Object[]} objects
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
		 * @param {game.GameManager}gameManager
		 * @param {game.Object} object
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
		 * @param {game.ObjectRenderer} renderer
		 */
		setRenderer( renderer ) {
			/**
			 * @name game.Object#renderer
			 * @type {game.ObjectRenderer}
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
		 * @param {CanvasRenderingContext2D}context2d
		 */
		renderDebug(context) {
			this.collider && this.collider.render(context);
		}

//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - - - -death methods - - - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************
		/**
		 * kills the object and removes it from the game before the next frame. The <!--
		 * -->{@link game.Object#onDeath|onDeath} method is then called
		 * @param gameManager
		 */
		kill(gameManager) {
			gameManager.removeObject(this);
		}
		/**
		 * called by the game manager the moment the object is removed from the game.
		 * @param gameManager
		 */
		onDeath(gameManager) {
		}

//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - - -position checkers - - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************
		//noinspection JSSuspiciousNameCombination
		/**
		 * returns whether or not the object is outside the specified rectangle.
		 * @param {utils.geometry2d.Rect} rect
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
		 * -->{@link game.Object#moveOnFrame|moveOnFrame} method, for example, to make sure the object <!--
		 * -->does not go out of a rectangle.
		 * This function returns the vector used to move the object inside the rectangle.
		 * @param {utils.geometry2d.Rect|Rect} rect
		 * @param {number} marginX
		 * @param {number} marginY
		 * @returns {utils.geometry2d.Vec2}
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
	 * -->for your objects. The default value is {@link game.RenderLayer.OBJ1};
	 * This attributes is used to define an order for the objects to be drawn on the screen, and must be part of <!--
	 * -->the {@link game.RenderLayer} enumeration, or an other number if you handle it in your own game map.
	 * @name game.Object#renderLayer
	 * @type {game.RenderLayer|number}
	 */
	GameObject.prototype.renderLayer = game.RenderLayer.OBJ1;
	/**
	 * the body layer of this object. As it is generally common to all objects of the same class, <!--
	 * -->this attribute is generally defined in the prototype of the class, but you can do it anywhere you want <!--
	 * -->for your objects.
	 * This number defines where the body of the object is located. If an other object want to be able <!--
	 * -->to collide with it, it must have the same number in its {@link game.Object#collisionLayers|collisionLayers} array.
	 * @name game.Object#bodyLayer
	 * @type {number}
	 */
	GameObject.prototype.bodyLayer = 0;
	/**
	 * When two objects are colliding, the object with the highest priority will be the one handling collisions.
	 * If set to a negative number, it cannot handle collision, even with lower priotity objects.
	 * @name game.ObjectcollisionPriority
	 * @type {number}
	 */
	GameObject.prototype.collisionPriority = 0;
	/**
	 * the collision layers of this object. As it is generally common to all objects of the same class, <!--
	 * -->this attribute is generally defined in the prototype of the class, but you can do it anywhere you want <!--
	 * -->for your objects.
	 * This array defines which objects this object can collide with. To collide with an object, <!--
	 * -->this array must contain its {@link game.Object#bodyLayer|bodyLayer} attribute.
	 * @name game.Object#collisionLayers
	 * @type {number[]}
	 */
	GameObject.prototype.collisionLayers = [0];

    return GameObject;
})();