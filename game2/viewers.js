/**
 * Created by Loic France on 12/25/2016.
 */
"use strict";
window.game.UIElement = (function(){
	class UIElement {
		/**
		 * @constructor
		 *
		 * @param {HTMLElement} elmt
		 * @param {utils.geometry2d.Vec2} position
		 * @param {boolean} staticPos
		 */
		constructor(elmt, position, staticPos = false) {
			/**
			 * @type {HTMLElement}
			 * @name game.UIElement#elmt
			 */
			this.elmt = elmt;
			this.elmt.className = 'game_ui';
			/**
			 * @type {utils.geometry2d.Vec2}
			 * @name game.UIElement#position
			 */
			this.position = position.clone();
			/**
			 * @type {boolean}
			 * @name game.UIElement#staticPos
			 */
			this.staticPos = !!staticPos;
		}

		/**
		 * called by the {@link game.Viewer} instace attached to the {@link game.GameManager} when the window
		 * gets resized or the visible rect is modified.
		 * @param viewer
		 */
		update(viewer) {
			let scaleX = 1/viewer.scaleX, scaleY = 1/viewer.scaleY;
			if(this.position && !isNaN(this.position.x) && !isNaN(this.position.y)) {
				let pos = this.position.clone();
				if(!this.staticPos) {
					pos.addXY(- viewer.visibleRect.left, - viewer.visibleRect.top);
				}
				pos.x *= scaleX;
				pos.y *= scaleY;
				pos.x += (parseFloat(viewer.context.canvas.style.left) || 0) - (this.elmt.clientWidth  * scaleX)/2;
				pos.y += (parseFloat(viewer.context.canvas.style.top ) || 0) - (this.elmt.clientHeight * scaleY)/2;
				this.elmt.style.transform = `scale(${scaleX}, ${scaleY})`;
				this.elmt.style.transformOrigin = 'left top';
				this.elmt.style.left = `${Math.round(pos.x)}px`;
				this.elmt.style.top  = `${Math.round(pos.y)}px`;
			}
		}
	}
	return UIElement;
})();
window.game.Viewer = (function() {
	let Rect = utils.geometry2d.Rect;
	/**
	 * The class used by the game manager for the rendering.
	 * @class game.Viewer
	 * @memberOf game
	 */
    class Viewer {
    	constructor(drawingContext) {
		    //private variables used for resize
		    let autoResize = false;
		    let onWindowResize = null;
		    let resizeMargin = 0;
		    let callback = null;
		    let uiDiv = null;
		    let uiElmts = [];
		    /**
		     * @name game.Viewer#context
		     * @type {CanvasRenderingContext2D|WebGLRenderingContext}
		     */
		    this.context = drawingContext;
		    /**
		     * @name game.Viewer#visibleRect
		     * @type {utils.geometry2d.Rect}
		     */
		    this.visibleRect = new Rect(0, 0, this.context.canvas.width, this.context.canvas.height);

		    /**
		     * allows the canvas to resize automatically when the window size changes.
		     * The callback function is called after the resize with the first parameter equal to <!--
		     * -->{@link game.RenderEvent.CANVAS_RESIZE} and the second one equal to the rendering context.
		     * @method
		     * @name game.Viewer#useAutoResize
		     * @param {boolean} use
		     * @param {number} [borderMargin]. first use : default to 4. next uses : default to previous values.
		     */
		    this.useAutoResize = function (use = true, borderMargin = resizeMargin) {
			    resizeMargin = borderMargin;
			    if (autoResize && !use) {
				    window.removeEventListener('resize', onWindowResize, false);
				    window.removeEventListener('fullscreenchange', onWindowResize, false);
			    }
			    else if (!autoResize && use) {
				    autoResize = true;
				    if (!onWindowResize) {
					    onWindowResize = function (event) {
						    let parent = this.context.canvas.parentNode,
							    parentW = parent.offsetWidth,
							    parentH = parent.offsetHeight,
							    ratio = this.visibleRect.ratio,
							    w = parentW - (borderMargin * 2),
							    h = Math.min(parentH - (borderMargin * 2), w / ratio);
						    w = h * ratio;
						    let left = (parentW - w) * 0.5,
							    top = (parentH - h) * 0.5;
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
		     * -->the {@link game.Viewer#updateScale} method to change the scale.
		     * The callback function is then with the first parameter equal to <!--
		     * -->{@link game.RenderEvent.CANVAS_RESIZE} and the second one equal to the rendering context.
		     * @method
		     * @name game.Viewer#setCanvasSize
		     * @param {number} width
		     * @param {number} height
		     * @param {number} marginX
		     * @param {number} marginY
		     */
		    this.setCanvasSize = function (width, height, marginX, marginY) {
			    let canvas = this.context.canvas;
			    canvas.width = canvas.style.width = width;
			    canvas.height = canvas.style.height = height;
			    if(getComputedStyle(canvas).getPropertyValue('position') === 'absolute') {
				    canvas.style.left = marginX.toString() + "px";
				    canvas.style.top = marginY.toString() + "px";
			    } else {
				    canvas.style.marginLeft = marginX.toString() + "px";
				    canvas.style.marginTop = marginY.toString() + "px";
			    }
			    this.updateTransform();
			    if (callback) callback(game.RenderEvent.CANVAS_RESIZE, this.context);
		    };
		    /**
		     * sets the callback function called for rendering events. See {@link game.RenderEvent} <!--
		     * -->for a list of all possible events
		     * @method
		     * @name game.Viewer#setCallback
		     * @param {?game.renderEventCallback} cb
		     */
		    this.setCallback = function (cb) {
			    callback = cb;
		    };
		    /**
		     * returns the callback function called for rendering events. See {@link game.RenderEvent} <!--
		     * -->for a list of all possible events
		     * @method
		     * @name game.Viewer#getCallback
		     * @returns {?game.renderEventCallback}
		     */
		    this.getCallback = function() {
		    	return callback;
		    };
		    /**
		     * sets the {@link HTMLDivElement } used to place UI elements. <!--
		     * -->this div will be maintained the same size as the canvas element
		     * @method
		     * @param {HTMLDivElement} divElement
		     */
		    this.setUIDiv = function(divElement) {
			    uiDiv = divElement;
		    };
		    /**
		     * @method
		     * @returns {!HTMLDivElement} the div used to place ui elements
		     */
		    this.getUIDiv = function() {
		    	return uiDiv;
		    };
		    /**
		     * adds a {@link game.UIElement} to the user interface
		     * @method
		     * @param {game.UIElement} elmt - the element to add to the UI
		     */
		    this.addUIElement = function(elmt) {
			    uiDiv.appendChild(elmt.elmt);
			    uiElmts.push(elmt);
		    };
		    /**
		     * remove the {@link game.UIElement} from the user interface
		     * @param {game.UIElement} elmt
		     */
		    this.removeUIElement = function(elmt) {
		    	let i = uiElmts.indexOf(elmt);
		    	if(i >= 0) {
				    uiElmts.splice(i, 1);
		    		uiDiv.removeChild(elmt.elmt);
			    }

		    };
		    /**
		     * called after the window has been resized or the visible game rect modified.
		     * calls the {@link game.UIElement#update update(viewer)} method of every element to transform it.
		     */
		    this.updateUI = function() {
		    	let i = uiElmts.length;
		    	while(i--) {
		    		uiElmts[i].update(this);
			    }
		    }
	    }
		/**
		 * number of game units by pixel (=(visible game width)/(canvas width))
		 * @name game.Viewer#scaleX
		 * @type {number}
		 * @readonly
		 */
	    get scaleX() { return this.visibleRect.width/this.context.canvas.width; }
	    /**
	     * number of game units by pixel (=(visible game height)/(canvas height))
	     * @name game.Viewer#scaleY
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
	    updateTransform() {
		    this.context.setTransform(
			    this.context.canvas.width/this.visibleRect.width, 0, 0,
			    this.context.canvas.height/this.visibleRect.height, this.visibleRect.left, this.visibleRect.top);
			this.updateUI();
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
		/**
		 * called by the game manager after a frame to draw objects on the canvas.
		 * The callback function is called at the beginning and at the end of the function, and at the <!--
		 * -->beginning and the end of the drawing of every layer, with the first parameter equal to <!--
		 * -->{@link game.RenderEvent.RENDER_BEGIN}, {@link game.RenderEvent.RENDER_END}, <!--
		 * -->{@link game.RenderEvent.RENDER_LAYER_BEGIN} or {@link game.RenderEvent.RENDER_LAYER_END} <!--
		 * and the second one equal to the rendering context.
		 * @name game.Viewer#render
		 * @param {game.GameManager} gameManager
		 * @param {game.Object[]} objects
		 * @abstract
		 */
		render( gameManager, objects) { }

    }
    return Viewer;
})();
window.game.StandardViewer = (function() {
	/**
	 * @class game.StandardViewer
	 * @memberOf game
	 * @augments game.Viewer
	 */
    class StandardViewer extends window.game.Viewer {
    	constructor(canvas) {
    		super(canvas.getContext('2d'));
	    }
	    render(gameManager, objects) {
		    let rect = this.visibleRect, objs, ctx = this.context, l, i, callback = this.getCallback();
		    ctx.clearRect(rect.left, rect.top, rect.right, rect.bottom);
		    if(callback) {
			    ctx.save();
			    callback(game.RenderEvent.RENDER_BEGIN, ctx);
		    }
		    objs = objects.sort(game.renderLayerSort);
		    if(!(i = objs.length))
		    	return;
		    //noinspection StatementWithEmptyBodyJS
		    while(i && objs[--i].renderLayer < 0);
		    if(i>=0) {
			    if(callback) {
				    callback(game.RenderEvent.RENDER_LAYER_BEGIN, ctx);
			    }
			    l = objs[i].renderLayer;
			    do {
				    if(objs[i].renderLayer < l) {
					    if(objs[i].renderLayer < 0) {
						    if(callback) callback(game.RenderEvent.RENDER_LAYER_END, ctx);
						    ctx.restore();
					    }
					    if(callback) {
						    callback(game.RenderEvent.RENDER_LAYER_END, ctx);
						    callback(game.RenderEvent.RENDER_LAYER_BEGIN, ctx);
					    }
					    ctx.restore();
					    ctx.save();
					    l = Math.ceil(objs[i].renderLayer);
				    }
				    if(!objs[i].isOutOfRect(rect)) objs[i].render(ctx);

			    } while(i--);
			    if(callback) {
				    callback(game.RenderEvent.RENDER_LAYER_END, ctx);
			    }
		    }
		    if(callback) {
			    callback(game.RenderEvent.RENDER_END, ctx);
			    ctx.restore();
		    }
	    }

		/**
		 * enables or disables image smoothing for the {@link CanvasRenderingContext2D context}
		 * @param {boolean} enabled
		 */
		setImageSmoothingEnabled(enabled) {
            this.context.imageSmoothingEnabled = enabled;
	    }
    }
    return StandardViewer;
})();
window.game.WebGLViewer = (function() {
	let vertexShader =`
		uniform int u_color;
		uniform int u_useTexture;
		uniform mat3 uMVMatrix;
		uniform float u_depth;
		
		attribute vec2 a_position;
		
		varying vec4 f_color;
		void main(void) {
            int r = a_color / 256 / 256;
            int g = a_color / 256 - 256*r;
            int b = a_color - 256*(256*r+g);
            f_color = vec4(float(r)/255.0, float(g)/255.0, float(b)/255.0, 1.0);
			gl_Position = vec4(uMVMatrix * vec3(a_position, -1.0), depth);
		}`;
	/**
	 * @class game.WebGLViewer
	 * @memberOf game
	 * @augments game.Viewer
	 */
	class WebGLViewer extends window.game.Viewer {
		constructor(canvas, maxObjectPoints=100) {
			super(window.webgl.getGLContext(canvas));
			window.webgl.initGLContext(this.context);
			let vs = webgl.createGLShader(this.context, webgl.standard2dVertexShader, 'vertex');
			let fs = webgl.createGLShader(this.context, webgl.standardFragmentShader, 'fragment');
			this.shaderProgram = webgl.addGLShaderProgram(this.context, vs, fs);
			this.vertices = new Float32Array(maxObjectPoints*2);
			this.colors = new Uint32Array(maxObjectPoints);
			this.positionAttrib = this.context.getAttribLocation(this.shaderProgram, 'a_position');
			this.colorAttrib = this.context.getAttribLocation(this.shaderProgram, 'a_color');
		}
		get scaleX() {
			return this.context.getParameter(this.context.VIEWPORT);
		}
		updateScale() {
			this.context.viewport(this.visibleRect.left , this.visibleRect.top,
								  this.visibleRect.width, this.visibleRect.height);
		}
		render(gameManager, objects) {
			let obj = objects.splice().filter(game.renderableFilter), n = obj.length,
				drawHandler = new webgl.GlBufferHandler(this.context);
			utils.tools.merge(drawHandler, {
				vertices: this.vertices,
				colors: this.colors,
				glBuffer: this.context.createBuffer(),
				positionAttrib: this.positionAttrib,
				colorAttrib: this.colorAttrib
			});
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			while(n--) {
				obj[n].renderGL(drawHandler);
			}
		}
	}
	return WebGLViewer;
})();