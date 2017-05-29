/**
 * Created by rfrance on 12/20/2016.
 */
/**
 * @namespace game
 */
window.game = {

//######################################################################################################################
//#                                             enumerations and callbacks                                             #
//######################################################################################################################
	/**
	 * @callback game.gameEventCallback
	 * @param {game.GameEvent} event
	 * @param {number} dT - time since last frame (0 if not necessary).
	 */
	/**
	 * @callback game.renderEventCallback
	 * @param {game.RenderEvent} event
	 * @param {CanvasRenderingContext2D} context
	 */
	/**
	 * an enumeration for game events. Some values are never used by the game engine itself, <!--
	 * -->but you can use them yourself
	 * @readonly
	 * @enum {number}
	 * @memberOf game
	 */
	GameEvent: {
		/** a frame just began */
		GAME_FRAME 		 : 1,
		/** the game just resumed/started */
		GAME_START 		 : 2,
		/** the game just stopped/paused */
		GAME_STOP  		 : 3,
		/** an object as been created (never called automatically) */
		OBJECT_CREATED   : 4,
		/** an object as been destroyed (never called automatically) */
		OBJECT_DESTROYED : 5
	},
	/**
	 * @memberOf game
	 * @enum {number}
	 */
	RenderEvent: {
		RENDER_BEGIN : 6,
		RENDER_END : 7,
		RENDER_LAYER_BEGIN : 8,
		RENDER_LAYER_END : 9,
		CANVAS_RESIZE : 10
	},
	/**
	 * @memberOf game
	 * @enum {number}
	 */
	RenderLayer: {
		NONE : -1,
		BG1 : 0,
		BG2 : 1,
		BG3 : 2,
		OBJ1 : 3,
		OBJ2 : 4,
		OBJ3 : 5,
		PARTICLES : 6,
		UI : 7
	},
//######################################################################################################################
//#                                                     GameManager                                                    #
//######################################################################################################################
	GameManager: (function() {
		/**
		 * @class game.GameManager
		 * @memberOf game
		 * @classdesc the most important class of a game. call the frame, death and collision methods of all objects, <!--
		 * -->call the render method of the gameMap, ...
		 * To add an object to the game, you must call the {@link game.GameManager#addObject|addObject} method, and to <!--
		 * -->remove an object, you must call the {@link game.GameManager#removeObject|removeObject} method.
		 * This way, {@link game.Object#onDeath} method of the destroyed objects when they are removed from the game.
		 * To start or resume the game, call the {@link game.GameManager#start|start} method, <!--
		 * -->and to pause or stop the game, call the {@link game.GameManager#stop|stop} method. You can get <!--
		 * -->the current state (running or not) by calling the {@link game.GameManager#isRunning|isRunning} method.
		 * You can apply a {@link game.gameEventCallback|callback} method which will be called when the game <!--
		 * -->is started or resumed, when it is stopped or paused, and when a frame begins.
		 */
		class GameManager {
			constructor() {
//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - - - - -attributes- - - - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************

//------------------------------------------------- private attributes -------------------------------------------------
				let objects = [];
				let objectsToAdd = [];
				let objectsToRemove = [];
				let objects_length = 0;
				let lastStamp = 0;
				let callback = null;
				let running = false;
//-------------------------------------------------- public attributes -------------------------------------------------
				/**
				 * @name game.GameManager#gameMap
				 * @type {?game.AbstractGameMap}
				 */
				this.gameMap = null;
//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - - - - - -methods - - - - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************

//--------------------------------------------------- objects methods --------------------------------------------------
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -getters  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
				/**
				 * get all objects of the game matching the specified filter
				 * @method
				 * @name game.GameManager#getObjects
				 * @param {function(game.Object):boolean} [filter=null]
				 * @returns {game.Object[]}
				 */
				this.getObjects = function( filter = null ) {
					return filter ?  objects.filter(filter) : objects;
				};
				/**
				 * get the index of the object in the game's list of objects.
				 * @method
				 * @name game.GameManager#getObjectIndex
				 * @param {game.Object} obj
				 * @returns {number} index of obj
				 */
				this.getObjectIndex = function( obj ) {
					return objects.indexOf(obj);
				};
				/**
				 * returns the object located at the specified index.
				 * @method
				 * @name game.GameManager#getObjectAt
				 * @param {number} index
				 * @returns {game.Object}
				 */
				this.getObjectAt = function( index ) {
					return objects[index];
				};
				/**
				 * returns all instances of the specified gameObject class.
				 * @method
				 * @name game.GameManager#getInstancesOf
				 * @param {class} objClass
				 * @returns {game.Object[]}
				 */
				this.getInstancesOf = function( objClass ) {
					return this.getObjects(tools.instanceFilter.bind(undefined, objClass));
				};
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -adders-  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
				/**
				 * adds an object to the game. It will actually be added between the current frame and the next one.
				 * @method
				 * @name game.GameManager#addObject
				 * @param {game.Object} obj
				 * @param {boolean} [check=true] - if true or not set, the method will make sure the object is not <!--
				 * -->already being added to the game
				 */
				this.addObject = function( obj, check=true ) {
					if(check && objectsToAdd.indexOf(obj)!==-1)
						console.stack("the object " + obj + " is already being added to the game");
					else objectsToAdd.push(obj);
				};
				/**
				 * adds several objects to the game. They will be added between the current frame and the next one
				 * @method
				 * @name game.GameManager#addObjects
				 * @param {game.Object[]} objects
				 * @param {boolean} [check=true] - if true or not set, the method will only add objects that are not <!--
				 * -->already being added to the game
				 */
				this.addObjects = function( objects, check=true ) {
					Array.prototype.push.apply(objectsToAdd,
						check ? objects.filter(tools.exclusionFilter.bind(undefined, objectsToAdd))
							: objects);
				};
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  removers  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
				/**
				 * removes an object from the game. It will actually be removed between the current frame <!--
				 * -->and the next one, before new objects are added.
				 * @method
				 * @name game.GameManager#removeObject
				 * @param {game.Object} obj
				 * @param {boolean} [check=true] - if true or not set, the method will make sure the object is not <!--
				 * -->already being removed from the game
				 */
				this.removeObject = function( obj, check=true ) {
					if(check && objectsToRemove.indexOf(obj) !== -1)
						console.stack("the object " + obj + " is already being removed from the game");
					else objectsToRemove.push(obj);
				};
				/**
				 * removes several objects from the game. They will be removed between the current frame <!--
				 * -->and the next one, before new objects are added
				 * @method
				 * @name game.GameManager#removeObjects
				 * @param {game.Object[]} objects
				 * @param {boolean} [check=true] - if true or not set, the method will only remove objects that are not <!--
				 * -->already being removed to the game
				 */
				this.removeObjects = function( objects, check=true ) {
					Array.prototype.push.apply(objectsToRemove,
						check ? objects.filter(tools.exclusionFilter.bind(undefined, objectsToRemove))
							: objects);
				};
				/**
				 * removes all current objects from the game. They will be removed between the current frame <!--
				 * -->and the next one, before new objects are added.
				 * This method does not prevent objects that are about to be added to appear.
				 * @method
				 * @name game.GameManager#clearObjects
				 */
				this.clearObjects = function() {
					this.removeObjects(objects);
				};
//--------------------------------------------------- events methods ---------------------------------------------------
				/**
				 * starts or resumes the game, and call the callback method with first parameter <!--
				 * equal to {@link game.GameEvent.GAME_START}, and the second one equal to 0.
				 * @method
				 * @name game.GameManager#start
				 */
				this.start = function() {
					running = true;
					lastStamp = 0;
					if(callback) callback(GameEvent.GAME_START, 0);
					requestAnimationFrame(onFrame.bind(this));
				};
				/**
				 * stops or pauses the game, and call the callback method with first parameter <!--
				 * equal to {@link game.GameEvent.GAME_STOP}, and the second one equal to 0.
				 * @method
				 * @name game.GameManager#stop
				 */
				this.stop = function() {
					running = false;
					if(callback) callback(GameEvent.GAME_STOP, 0);
				};
				/**
				 * tells if the game is currently running.
				 * @returns {boolean}
				 * @method
				 * @name game.GameManager#isRunning
				 */
				this.isRunning = function () {
					return running;
				};
				/**
				 * sets the callback method called for events.
				 * @method
				 * @name game.GameManager#setEventsCallback
				 * @param {?game.gameEventCallback} cb
				 */
				this.setEventsCallback = function( cb ) {
					callback = cb;
				};
				/**
				 * returns the callback method called for events, or null if not set
				 * @method
				 * @name game.GameManager#getEventsCallback
				 * @returns {?game.gameEventCallback}
				 */
				this.getEventsCallback = function() {
					return callback;
				};
// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -onFrame  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -
				let onFrame = function(timeStamp) {
					let obj, index = -1, i, dT, j, bodies, len, other;
					if(running) {
						// 1 : remove dead objects
						while (obj = objectsToRemove.pop()) {
							index = objects.indexOf(obj);
							if (index > -1) {
								obj.onDeath(this);
								objects.splice(index, 1);
								objects_length--;
							}
						}
					}
					// 13 : render all objects on the screen
					if(this.gameMap && !this.gameMap.isAsynchronousUsed()) {
						this.gameMap.render(this, objects);
					}
					if(running) {
						// 2 : add new objects
						while(obj=objectsToAdd.pop()) {
							objects.push(obj);
							objects_length++;
						}
						// 3 : get dT
						dT = (timeStamp - lastStamp)/1000;
						if(!dT) return;
						lastStamp = timeStamp;
						if(dT > 0.1) dT = 0.1;
						// 4  : call callback method
						if(callback) callback(GameEvent.GAME_FRAME, dT);
						if(this.gameMap && this.gameMap.isAsynchronousUsed()) {
							this.gameMap.render(this, objects);
						}
						// 5 : call onFrame of all objects
						i = objects_length;
						while(i--) objects[i].onFrame(this, dT);
						// 6 : get all objects with a collider
						bodies = objects.filter(game.canCollideFilter);
						len = bodies.length;
						if(len) {
							i = len;
							// 7 : for each object, prepare the collision
							while(i--) bodies[i].prepareCollision();
							while(obj = bodies.pop()) {
								// 9 : get all other objects able to collide with the object
								other = bodies.filter(game.collisionLayersFilter.bind(undefined, obj.bodyLayer));
								j = other.length;
								while(j--) {
									// 10 : check collision
									if(obj.canCollide(other[j]) && other[j].canCollide(obj) && obj.collides(other[j])) {
										// 11 : call onCollision method
										obj.onCollision(this, other[j]);
										other[j].onCollision(this, obj);
									}
								}
								//12 : tell all objects that collision is finished
								obj.finishCollision();
							}
						}
					}
					// 14 : request next frame
					requestAnimationFrame(onFrame.bind(this));
				};
			}
			getMap() {
				return this.gameMap;
			}
		}
		return GameManager;
	})(),
//######################################################################################################################
//#                                                       GameMap                                                      #
//######################################################################################################################
	GameMap: (function() {
		/**
		 * @class
		 * @memberOf game
		 */
		class GameMap {
			constructor( canvas, gameRect, useWebGL = false ) {
				/**
				 * @name game.GameMap#context
				 * @type {CanvasRenderingContext2D|WebGLRenderingContext}
				 */
				this.context = canvas.getContext(useWebGL ? 'webgl' : '2d');
				this.context.font = "20px Verdana";
				/**
				 * @name game.GameMap#gameRect
				 * @type {utils.geometry2d.Rect}
				 */
				this.gameRect = gameRect.clone();
				/**
				 * @name game.GameMap#visibleRect
				 * @type {utils.geometry2d.Rect}
				 */
				this.visibleRect = gameRect.clone();
				/**
				 * @name game.GameMap#layer_min
				 * @type {game.RenderLayer}
				 */
				this.layer_min = game.RenderLayer.BG1;
				/**
				 * @name game.GameMap#layer_max
				 * @type {game.RenderLayer}
				 */
				this.layer_max = game.RenderLayer.UI;

				//private variables used for resize
				let autoResize = false;
				let onWindowResize = null;
				let resizeMargin=4;
				let callback = null;
				let worker = null;
				/**
				 * allows the canvas to resize automatically when the window size changes.
				 * The callback function is called after the resize with the first parameter equal to <!--
				 * -->{@link game.RenderEvent.CANVAS_RESIZE} and the second one equal to the rendering context.
				 * @method
				 * @name game.GameMap#useAutoResize
				 * @param {boolean} use
				 * @param {number} [borderMargin]. first use : default to 4. next uses : default to previous values.
				 */
				this.useAutoResize = function(use=true, borderMargin=resizeMargin) {
					resizeMargin = borderMargin;
					if(autoResize && !use) {
						window.removeEventListener('resize', onWindowResize, false);
						window.removeEventListener('fullscreenchange', onWindowResize, false);
					}
					else if(!autoResize && use) {
						autoResize = true;
						if(!onWindowResize) {
							onWindowResize = function(event) {
								let parent = this.context.canvas.parentNode,
									parentW = parent.offsetWidth,
									parentH = parent.offsetHeight,
									ratio = this.visibleRect.ratio,
									w = parentW - borderMargin,
									h = Math.min(parentH-borderMargin, w/ratio);
								w = h*ratio;
								let left = (parentW-w)*0.5,
									top = (parentH-h)*0.5-borderMargin;
								this.setCanvasSize(w, h, left, top);
							}.bind(this);
						}
						window.addEventListener('resize', onWindowResize, false);
						window.addEventListener('fullscreenchange', onWindowResize, false);
						onWindowResize(null);
					}
				};
				/**
				 * manually changes the size of the canvas, and modifies the scale for the visible rectangle <!--
				 * -->to fit the canvas without the visible rectangle to change. you can change the visible rect and <!--
				 * -->the {@link game.GameMap#updateScale} method to change the scale.
				 * The callback function is then with the first parameter equal to <!--
				 * -->{@link game.RenderEvent.CANVAS_RESIZE} and the second one equal to the rendering context.
				 * @method
				 * @name game.GameMap#setCanvasSize
				 * @param {number} width
				 * @param {number} height
				 * @param {number} marginX
				 * @param {number} marginY
				 */
				this.setCanvasSize = function(width, height, marginX, marginY) {
					let canvas = this.context.canvas;
					canvas.width = width; canvas.height = height;
					canvas.style.marginLeft = marginX.toString() + "px";
					canvas.style.marginTop = marginY.toString() + "px";
					this.updateScale();
					if(callback) callback(RenderEvent.CANVAS_RESIZE, this.context);
				};
				/**
				 * sets the callback function called for rendering events. See {@link game.RenderEvent}
				 * for a list of all possible events
				 * @method
				 * @name game.GameMap#setCallback
				 * @param {?game.renderEventCallback} cb
				 */
				this.setCallback = function( cb ) { callback = cb; };
				/**
				 * use this function if you want to activate the asynchronous rendering.
				 * @method
				 * @name game.GameMap#useAsynchronous
				 * @param {boolean} use
				 */
				this.useAsynchronous = function( use ) {
					if(use && !worker) {
						worker = new Worker("async_render.js");
					} else if(worker != null) {
						worker.terminate();
					}
				};
				/**
				 * return true if the asynchronous mode is enabled.
				 * @method
				 * @name game.GameMap#isAsynchronousUsed
				 * @returns {boolean}
				 */
				this.isAsynchronousUsed = function() {
					return worker != null;
				};
				/**
				 * called by the game manager after a frame to draw objects on the canvas.
				 * The callback function is called at the beginning and at the end of the function, and at the <!--
				 * -->beginning and the end of the drawing of every layer, with the first parameter equal to <!--
				 * -->{@link game.RenderEvent.RENDER_BEGIN}, {@link game.RenderEvent.RENDER_END}, <!--
				 * -->{@link game.RenderEvent.RENDER_LAYER_BEGIN} or {@link game.RenderEvent.RENDER_LAYER_END} <!--
				 * and the second one equal to the rendering context.
				 * @method
				 * @name game.GameMap#render
				 * @param {game.GameManager} gameManager
				 * @param {game.Object[]} objects
				 */
				this.render = function( gameManager, objects) {
					if(worker) {
						worker.postMessage({
							ctx: this.context,
							rect: this.visibleRect,
							objects: objects,
							filter: game.renderLayerFilter,
							layerMin: this.layer_min,
							layerMax: this.layer_max,
							callback: callback,
							renderEvents: RenderEvent
						});
					} else {
						let rect = this.visibleRect, objs, ctx = this.context, l, i;
						ctx.clearRect(rect.left, rect.top, rect.right, rect.bottom);
						if(callback) {
							ctx.save();
							callback(RenderEvent.RENDER_BEGIN, ctx);
						}
						objs = objects.sort(game.renderLayerSort);
						i = objs.length;
						while(i && objs[--i].renderLayer < 0);
						if(i) {
							if(callback) {
								callback(game.RenderEvent.RENDER_LAYER_BEGIN, ctx);
							}
							l = objs[i].renderLayer;
							while(i--) {
								if(objs[i].renderLayer > l) {
									if(callback) {
										callback(game.RenderEvent.RENDER_LAYER_END, ctx);
										callback(game.RenderEvent.RENDER_LAYER_BEGIN, ctx);
									}
									ctx.restore();
									ctx.save();
									l = Math.round(objs[i].renderLayer+0.5);
								}
								if(!objs[i].isOutOfRect(rect)) objs[i].render(ctx);
							}
							if(callback) {
								callback(game.RenderEvent.RENDER_LAYER_END, ctx);
							}
						}
						if(callback) {
							callback(game.RenderEvent.RENDER_END, ctx);
							ctx.restore();
						}

					}
				}
			}
			/**
			 * background of the canvas
			 * @name game.GameMap#background
			 * @type {*}
			 */
			get background() { return this.context.canvas.style.background; }
			set background( bg ) { this.context.canvas.style.background = bg; return bg; }

			/**
			 * number of game units by pixel (=(visible game width)/(canvas width))
			 * @name game.GameMap#background
			 * @type {number}
			 * @readonly
			 */
			get scaleX() { return this.visibleRect.width/this.context.canvas.width; }
			/**
			 * number of game units by pixel (=(visible game height)/(canvas height))
			 * @name game.GameMap#background
			 * @type {number}
			 * @readonly
			 */
			get scaleY() { return this.visibleRect.height/this.context.canvas.height; }

			/**
			 * changes the scale for the visible rect size to fit the canvas. Don't forget to call this method after <!--
			 * --> you made manual modifications on the visible rect to avoid errors.
			 * Be aware that the game may look stretched if the aspect of the canvas is not the same <!--
			 * -->as the rectangle's {@link utils.geometry2d.Rect#ratio|ratio}
			 */
			updateScale() {
				this.context.setTransform(
					this.context.canvas.width/this.visibleRect.width, 0, 0,
					this.context.canvas.height/this.visibleRect.height, 0, 0);
			}
			/**
			 * gives you the game coordinates of a point given in pixel coordinates relative to the canvas.
			 * @param {utils.geometry2d.Vec2} pixelCoords
			 * @param {utils.geometry2d.Vec2} out
			 * @returns {utils.geometry2d.Vec2} out
			 */
			pixelToGameCoordinatesTransform(pixelCoords, out = Vec2.zero) {
				return out.setXY(
					pixelCoords.x*this.scaleX+this.visibleRect.left,
					pixelCoords.y*this.scaleY+this.visibleRect.top);
			}
			/**
			 * gives you the pixel coordinates, relative to the canvas, of a point in the game.
			 * @param {utils.geometry2d.Vec2} gameCoords
			 * @param {utils.geometry2d.Vec2} out
			 * @returns {utils.geometry2d.Vec2} out
			 */
			gameToPixelCoordinatesTransform(gameCoords, out = Vec2.zero) {
				return out.setXY(
					(gameCoords.x-this.visibleRect.left)/this.scaleX,
					(gameCoords.y-this.visibleRect.top)/this.scaleY);
			}
		}
	    return GameMap;
	})(),
//######################################################################################################################
//#                                                       filters                                                      #
//######################################################################################################################
	/**
	 * a filter used by the game manager by binding the first argument to a<!--
	 * -->rendering layer to get all objects of the same render layer. Feel free to use this filter.
	 * @static
	 * @param {number} layer
	 * @param {game.Object} obj
	 * @returns {boolean}
	 */
	renderLayerFilter: (layer, obj) => obj.renderLayer === layer,
	/**
	 * a comparison function used by the game map to sort the objects in the reverse rendering order, <!--
	 * -->because the function starts by the end of the array
	 * @param {game.Object} obj1
	 * @param {game.Object} obj2
	 * @returns {number}
	 */
	renderLayerSort: (obj1, obj2) => obj2.renderLayer - obj1.renderLayer,
	/**
	 * a filter used by the game manager by binding the first argument to layers to get all objects <!--
	 * -->with a {@link game.Object#bodyLayer|bodyLayer} inside one of those layers. Feel free to use this filter.
	 * @static
	 * @param {number[]}layers
	 * @param {game.Object} obj
	 * @returns {boolean}
	 */
	bodyLayerFilter: (layers, obj) => layers.indexOf(obj.bodyLayer) >= 0,
	/**
	 * a filter used by the game manager by binding the first argument to a layer to get all objects <!--
	 * -->able to intersect with an object having its {@link game.Object#bodyLayer|bodyLayer} equal to this layer. <!--
	 * -->Feel free to use this filter.
	 * @static
	 * @param {number} layer
	 * @param {game.Object} obj
	 * @returns {boolean}
	 */
	collisionLayersFilter: (layer, obj) => obj.collisionLayers.indexOf(layer) >= 0,
	/**
	 * a filter used by the game manager to get all objects able to collide, i.e. with a <!--
	 * -->{@link game.Object#bodyLayer|bodyLayer} >= 0. Feel free to use this filter.
	 * @static
	 * @param {game.Object} obj
	 * @returns {boolean}
	 */
	canCollideFilter: (obj) => obj.bodyLayer >= 0 && obj.canCollide()
};