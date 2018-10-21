/**
 * Created by Loic France on 12/25/2016.
 */
import {exclusionFilter, instanceFilter} from "../utils/filters.mjs";
import {Viewer} from "./viewers.mjs";
import {PhysicWorld} from "./physics.mjs";

/**
 * @module game/manager
 */

//<editor-fold desc="Enumerations and Callbacks">
//######################################################################################################################
//#                                             enumerations and callbacks                                             #
//######################################################################################################################
	/**
	 * @callback gameEventCallback
	 * @param {GameEvent} event
	 * @param {number} dT - time since last frame (0 if not necessary).
	 * @param {GameObject} object - object related to the event (null if not necessary)
	 */
	/**
	 * @callback renderEventCallback
	 * @param {RenderEvent} event
	 * @param {CanvasRenderingContext2D} context
	 */
	/**
	 * an enumeration for game events. Some values are never used by the game engine itself, <!--
	 * -->but you can use them yourself
	 * @readonly
	 * @enum {number}
	 * @memberOf game
	 */
const GameEvent = {
		/** a frame just began */
		GAME_FRAME 		 : 1,
		/** the game just resumed/started */
		GAME_START 		 : 2,
		/** the game just stopped/paused */
		GAME_STOP  		 : 3,
		/**
		 * an object as been created (never called automatically).
		 * @see GameManager#fireObjectCreatedEvent
		 */
		OBJECT_CREATED   : 4,
		/**
		 * an object as been destroyed (never called automatically)
		 * @see GameManager#fireObjectDestroyedEvent
		 */
		OBJECT_DESTROYED : 5
	},
//</editor-fold>

//<editor-fold desc="Filters">
//######################################################################################################################
//#                                                       filters                                                      #
//######################################################################################################################

	/**
	 * a filter used by the viewer to remove from the array all objects that are not renderable (renderLayer < 0). <!--
	 * -->Feel free to use this filter.
	 * @static
	 * @param {GameObject} obj
	 * @returns {boolean}
	 */
	renderableFilter = (obj)=> obj.renderLayer >= 0,
	/**
	 * a comparison function used by the game map to sort the objects in the reverse rendering order, <!--
	 * -->because the function starts by the end of the array
	 * @param {GameObject} obj1
	 * @param {GameObject} obj2
	 * @returns {number}
	 */
	renderLayerSort = (obj1, obj2) => obj1.renderLayer - obj2.renderLayer,
	/**
	 * a filter used by the game manager by binding the first argument to layers to get all objects <!--
	 * -->with a {@link GameObject#bodyLayer|bodyLayer} inside one of those layers. Feel free to use this filter.
	 * @static
	 * @param {number[]}layers
	 * @param {GameObject} obj
	 * @returns {boolean}
	 */
	bodyLayerFilter = (layers, obj) => layers.includes(obj.bodyLayer, 0),
	/**
	 * a filter used by the game manager by binding the first argument to a layer to get all objects <!--
	 * -->able to intersect with an object having its {@link GameObject#bodyLayer|bodyLayer} equal to this layer. <!--
	 * -->Feel free to use this filter.
	 * @static
	 * @param {number} layer
	 * @param {GameObject} obj
	 * @returns {boolean}
	 */
	collisionLayersFilter = (layer, obj) => obj.collisionLayers.includes(layer, 0),
	/**
	 * a filter used by the game manager to get all objects able to collide, i.e. with a <!--
	 * -->{@link GameObject#bodyLayer|bodyLayer} >= 0. Feel free to use this filter.
	 * @static
	 * @param {GameObject} obj
	 * @returns {boolean}
	 */
	canCollideFilter = (obj) => obj.bodyLayer >= 0,
	/**
	 * a filter used by the game manager to get all the objects colliding with the specified object.
	 * Feel free to use it.
	 * @param {GameObject} obj1
	 * @param {GameObject} obj2
	 * @returns {boolean} true if obj1 and obj2 are colliding, false otherwise
	 */
	collisionFullFilter  = (obj1, obj2) =>
		(obj1.collisionLayers.includes(obj2.bodyLayer) || obj2.collisionLayers.includes(obj1.bodyLayer)) &&
		obj1.canCollideWith(obj2) && obj2.canCollideWith(obj1)	&& obj1.collides(obj2),
	/**
	 * a sort function used by the game manager to sort object by their collision priority.
	 * @static
	 * @param {GameObject} obj1
	 * @param {GameObject} obj2
	 * @returns {number} -1, 0 or 1
	 */
	collisionPrioritySort = (obj1, obj2) => obj1.collisionPriority - obj2.collisionPriority
;
//</editor-fold>

//<editor-fold desc="GameManager">
//######################################################################################################################
//#                                                     GameManager                                                    #
//######################################################################################################################
class GameManager {
	/**
	 * @constructor
	 * @param {object} [parameters] - object containing properties to set to the game manager
	 * @param {gameEventCallback} [parameters.onGameEvent] - callback function called on various game events
	 * @param {?Viewer} [parameters.viewer] - the object that will be used to render the game
	 * @param {?number} [parameters.gameDt] - the difference (in seconds) between each frame, from the point of view of objects
     * @param {?number} [parameters.realDt] - the difference (in seconds) between each frame, from the point of view of the player
     * @param {?PhysicWorld} [parameters.physicWorld] - the object handling forces applied on all objects (gravity, friction, ...)
	 */
	constructor(parameters) {
//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - - - - -attributes- - - - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************

//------------------------------------------------- private attributes -------------------------------------------------
		const objects = [],
			objectsToAdd = [],
			objectsToRemove = [];

		let objects_length = 0,
			lastStamp = 0,
			callback = null,
			interval = null,
			rafHandler = null;
//-------------------------------------------------- public attributes -------------------------------------------------
		/**
		 * @name GameManager#viewer
		 * @type {?Viewer}
		 */
		this.viewer = null;
		/**
		 * in-game time difference between 2 frames. Default is 1/60 sec
		 * @name GameManager#gameDt
		 * @type {number}
		 */
		this.gameDt = 1/60;
		/**
		 * real time difference between 2 frames. Default is 1/60 sec
		 * @name GameManager#realDt
		 * @type {number}
		 */
		this.realDt = 1/60;
        /**
		 * object handling physics forces applying to all physics objects (like gravity, or air friction)
         * @type {PhysicWorld}
         */
		this.physicWorld = null;
//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - - - - - -methods - - - - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************

//--------------------------------------------------- objects methods --------------------------------------------------
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -getters  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
		/**
		 * get all objects of the game matching the specified filter
		 * @method
		 * @name GameManager#getObjects
		 * @param {function(GameObject):boolean} [filter=null]
		 * @returns {GameObject[]}
		 */
		this.getObjects = function( filter = null ) {
			return filter ? objects.filter(filter) : objects;
		};
		/**
		 * get the index of the object in the game's list of objects.
		 * @method
		 * @name GameManager#getObjectIndex
		 * @param {GameObject} obj
		 * @returns {number} index of obj
		 */
		this.getObjectIndex = function( obj ) {
			return objects.indexOf(obj);
		};
		/**
		 * returns the object located at the specified index.
		 * @method
		 * @name GameManager#getObjectAt
		 * @param {number} index
		 * @returns {GameObject}
		 */
		this.getObjectAt = function( index ) {
			return objects[index];
		};
		/**
		 * returns all instances of the specified gameObject class.
		 * @method
		 * @name GameManager#getInstancesOf
		 * @param objClass
		 * @returns {GameObject[]}
		 */
		this.getInstancesOf = function( objClass ) {
			return this.getObjects(instanceFilter.bind(undefined, objClass));
		};
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -adders-  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
		/**
		 * adds an object to the  It will actually be added between the current frame and the next one.
		 * @method
		 * @name GameManager#addObject
		 * @param {?GameObject} obj
		 * @param {boolean} [check=true] - if true or not set, the method will make sure the object is not <!--
		 * -->already being added to the game
		 */
		this.addObject = function( obj, check=true ) {
			if(check && objectsToAdd.indexOf(obj)!==-1)
				console.stack("the object " + obj + " is already being added to the game");
			else objectsToAdd.push(obj);
		};
		/**
		 * adds several objects to the  They will be added between the current frame and the next one
		 * @method
		 * @name addObjects
		 * @param {GameObject[]} objects
		 * @param {boolean} [check=true] - if true or not set, the method will only add objects that are not <!--
		 * -->already being added to the game
		 */
		this.addObjects = function( objects, check=true ) {
			Array.prototype.push.apply(objectsToAdd,
				check ? objects.filter(exclusionFilter.bind(undefined, objectsToAdd))
					: objects);
		};
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  removers  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
		/**
		 * removes an object from the  It will actually be removed between the current frame <!--
		 * -->and the next one, before new objects are added.
		 * @method
		 * @name GameManager#removeObject
		 * @param {GameObject} obj
		 * @param {boolean} [check=true] - if true or not set, the method will make sure the object is not <!--
		 * -->already being removed from the game
		 */
		this.removeObject = function( obj, check=true ) {
            if (!(check && objectsToRemove.indexOf(obj) !== -1)) objectsToRemove.push(obj);
		};
		/**
		 * removes several objects from the  They will be removed between the current frame <!--
		 * -->and the next one, before new objects are added
		 * @method
		 * @name GameManager#removeObjects
		 * @param {GameObject[]} objects
		 * @param {boolean} [check=true] - if true or not set, the method will only remove objects that are not <!--
		 * -->already being removed to the game
		 */
		this.removeObjects = function( objects, check=true ) {
			Array.prototype.push.apply(objectsToRemove,
				check ? objects.filter(exclusionFilter.bind(undefined, objectsToRemove))
					: objects);
		};
		/**
		 * removes all current objects from the  They will be removed between the current frame <!--
		 * -->and the next one, before new objects are added.
		 * This method does not prevent objects that are about to be added to appear.
		 * @method
		 * @name GameManager#clearObjects
		 */
		this.clearObjects = function() {
            objectsToAdd.splice(0, objectsToAdd.length);
            objectsToRemove.splice(0, objectsToAdd.length);
			this.removeObjects(objects, false);
		};
//--------------------------------------------------- events methods ---------------------------------------------------
		/**
		 * starts or resumes the game, and call the callback method with first parameter <!--
		 * equal to {@link GameEvent.GAME_START}, and the second one equal to 0.
		 * @method
		 * @name GameManager#start
		 */
		this.start = function() {
			if(!this.isRunning()) {
				lastStamp = 0;
				if (callback) callback(GameEvent.GAME_START, 0, null);
				interval = setInterval(gameLoop, this.realDt * 1000);
			}
		};
		/**
		 * stops or pauses the game, and call the callback method with first parameter <!--
		 * equal to {@link GameEvent.GAME_STOP}, and the second one equal to 0.
		 * @method
		 * @name GameManager#stop
		 */
		this.stop = function() {
			if(this.isRunning()) {
				clearInterval(interval);
				interval = null;
				if (callback) callback(GameEvent.GAME_STOP, 0, null);
			}
		};
		/**
		 * tells if the game is currently running.
		 * @returns {boolean}
		 * @method
		 * @name GameManager#isRunning
		 */
		this.isRunning = function () {
			return interval != null;
		};
		this.startRendering = function() {
			if(!rafHandler) rafHandler = requestAnimationFrame(draw);
		};
		this.stopRendering = function() {
			cancelAnimationFrame(rafHandler);
			rafHandler = null;
		};
		this.isRendering = function() {
			return rafHandler != null;
		};
		/**
		 * sets the callback method called for events.
		 * @method
		 * @name GameManager#setEventsCallback
		 * @param {?gameEventCallback} cb
		 */
		this.setEventsCallback = function( cb ) {
			callback = cb;
		};
		/**
		 * returns the callback method called for events, or null if not set
		 * @method
		 * @name GameManager#getEventsCallback
		 * @returns {?gameEventCallback}
		 */
		this.getEventsCallback = function() {
			return callback;
		};
		/**
		 * calls the callback (if present) for the event {@link GameEvent.OBJECT_CREATED} with <!--
		 * -->the specified object as the third parameter. (Second parameter = 0)
		 * @param {GameObject} object -  the newly created object.
		 */
		this.fireObjectCreatedEvent = function(object) {
			if(callback) callback(GameEvent.OBJECT_CREATED, 0, object);
		};
		/**
		 * calls the callback (if present) for the event {@link GameEvent.OBJECT_DESTROYED} with <!--
		 * -->the specified object as the third parameter. (Second parameter = 0)
		 * @param {GameObject} object -  the destroyed object.
		 */
		this.fireObjectDestroyedEvent = function(object) {
			if(callback) callback(GameEvent.OBJECT_DESTROYED, 0, object);
		};
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -onFrame  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -


		const draw = function() {
			if(rafHandler) rafHandler = requestAnimationFrame(draw);
			if(this.viewer)
				this.viewer.render(this, objects);
		}.bind(this);

		const detectCollisions = function() {
			// 1 : get all objects with a collider
			const bodies = objects.filter(canCollideFilter).sort(collisionPrioritySort),
				bodies_save = bodies.slice(),
				len = bodies.length;

			let obj, i, other;

			if(len) {
				i = len;
				// 2 : for each object, prepare the collision
				while(i--) bodies[i].prepareCollision();
				while(obj = bodies.pop()) {
					if(obj.collisionPriority < 0) break;
					// 3 : get all other objects able to collide with the object
					other = bodies.filter(collisionFullFilter.bind(undefined, obj));

					if(other.length) {
						//6 : handle collision
						obj.handleCollision(this, other);
					}
				}
				i = len;
				while(i--) bodies_save[i].endCollision(this);
			}
		}.bind(this);

		//*
		const gameLoop = (function() {
			let obj, i;
			//add new objects
			while(obj=objectsToAdd.pop()) {
				objects.push(obj);
				objects_length++;
			}

			if(callback) callback(GameEvent.GAME_FRAME, this.gameDt, null);

			//execute every living object frame
			i = objects_length;
			while(i--) if(objects[i].living) objects[i].onFrame(this, this.gameDt);

			//handle collisions
			detectCollisions();

			//remove dead objects
			while (obj = objectsToRemove.pop()) {
				i = objects.indexOf(obj);
				if (i >= 0) {
					obj.onDeath(this);
					objects.splice(i, 1);
					objects_length--;
				}
			}
		}).bind(this);
		/*/
		function gameLoop(timeStamp) {
			if(running) {
				updateObjects();
			}
			draw.bind(timeStamp);
			if(running) {
				frame.bind(timeStamp);
				detectCollisions.bind();
			}
			//request next frame
			requestAnimationFrame(gameLoop.bind(this));
		};
		//*/

		if(parameters) {
			if(parameters.viewer instanceof Viewer)
				this.setViewer(parameters.viewer);
			if(parameters.onGameEvent instanceof Function)
				this.setEventsCallback(parameters.onGameEvent);
			if(!isNaN(+parameters.gameDt))
				this.gameDt = +parameters.gameDt;
			if(!isNaN(+parameters.realDt))
				this.realDt = +parameters.realDt;
			if(parameters.physicWorld instanceof PhysicWorld)
				this.physicWorld = parameters.physicWorld;
		}
	}
	setViewer(viewer) {
		this.viewer = viewer;
	}
	getViewer() {
		return this.viewer;
	}
}
//</editor-fold>

export {
	GameEvent,
	renderLayerSort, renderableFilter,
	bodyLayerFilter, collisionLayersFilter, canCollideFilter, collisionFullFilter, collisionPrioritySort,
	GameManager
};