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
			this.elmt.className = this.elmt.className + ' game_ui';
			/**
			 * @type {utils.geometry2d.Vec2}
			 * @name game.UIElement#position
			 */
			this.position = position ? position.clone() : null;
			/**
			 * @type {boolean}
			 * @name game.UIElement#staticPos
			 */
			this.staticPos = !!staticPos; //convert to bool
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
					pos.addXY(- viewer.visibleRect.xMin, - viewer.visibleRect.yMin);
				}
				pos.x *= scaleX;
				pos.y *= scaleY;
				const canvasStyle = viewer.getCanvasStyle();
				pos.x += (parseFloat(canvasStyle.left) || 0);
				pos.y += (parseFloat(canvasStyle.top ) || 0);
				this.elmt.style.transform = `scale(${scaleX}, ${scaleY}) translate(-50%, -50%)`;
				this.elmt.style.transformOrigin = 'left top';
				this.elmt.style.left = `${Math.round(pos.x)}px`;
				this.elmt.style.top  = `${Math.round(pos.y)}px`;
			}
		}
	}
	return UIElement;
})();
window.game.Viewer = (function() {
	const Rect = utils.geometry2d.Rect;
	const Vec2 = utils.geometry2d.Vec2;
	const defaultResizeFunction = (viewer, maxW, maxH)=> {
		const ratio = viewer.visibleRect.ratio;
		if(maxH * ratio > maxW) maxH = Math.floor(maxW / ratio);
		else if(maxH * ratio < maxW) maxW = Math.floor(maxH * ratio);
		return new Vec2(maxW, maxH);
	};
	/**
	 * The class used by the game manager for the rendering.
	 * @class game.Viewer
	 * @memberOf game
	 */
    class Viewer {
    	constructor({context, visibleRect}) {
		    //private variables used for resize
		    let autoResize = false;
		    let onWindowResize = null;
		    let resizeMargin = 1;
		    let callback = null;
		    let uiDiv = null;
		    let uiElmts = [];
		    let resizeFunction = defaultResizeFunction;
		    /**
		     * @name game.Viewer#context
		     * @type {CanvasRenderingContext2D|WebGLRenderingContext}
		     */
		    this.context = context || null;
		    /**
		     * @name game.Viewer#visibleRect
		     * @type {utils.geometry2d.Rect}
		     */
		    this.visibleRect =
			    visibleRect ?
				    visibleRect.clone()
			    : (this.context && this.context.canvas) ?
				    new Rect(0, 0, this.context.canvas.width, this.context.canvas.height)
			    : new Rect(0,0,0,0);

		    /**
		     * allows the canvas to resize automatically when the window size changes.
		     * The callback function is called after the resize with the first parameter equal to <!--
		     * -->{@link game.RenderEvent.CANVAS_RESIZE} and the second one equal to the rendering context.
		     * @method
		     * @name game.Viewer#useAutoResize
		     * @param {boolean} use
		     * @param {number} [borderMargin]. first use : default to 1. next uses : default to previous values.
		     *
		     */
		    this.useAutoResize = function (use = true, borderMargin = resizeMargin) {
			    resizeMargin = borderMargin;
			    if (autoResize && !use) {
				    window.removeEventListener('resize', onWindowResize, false);
				    window.removeEventListener('fullscreenchange', onWindowResize, false);
				    autoResize = false;
			    }
			    else if (!autoResize && use) {
				    autoResize = true;
				    if (!onWindowResize) {
					    onWindowResize = function (event) {
					    	const canvas = this.context.canvas,
							      parent = canvas.parentNode,
							      display = getComputedStyle(parent).display;
					        parent.style.display = 'none';
							const  container = parent.parentNode || parent,
							/*
							    containerMarginW = container.offsetWidth - container.clientWidth,
							    containerMarginH = container.offsetHeight - container.clientHeight,
							    containerStyle = getComputedStyle(container),
							    containerW = parseFloat(containerStyle.maxWidth) - containerMarginW,
							    containerH = parseFloat(containerStyle.maxHeight) - containerMarginH;
							/*/
							    containerW = container.clientWidth,
							    containerH = container.clientHeight;
							//*/

							let w = containerW - (borderMargin * 2),
							    h = containerH - (borderMargin * 2);
							const wh = resizeFunction(this, w,h);
							w = wh.x; h = wh.y;
						    parent.style.display = display;
						    w -= Math.ceil(canvas.offsetWidth - canvas.clientWidth);
						    h -= Math.ceil(canvas.offsetHeight - canvas.clientHeight);
						    this.setCanvasSize(w, h);
					    }.bind(this);
				    }
				    window.addEventListener('resize', onWindowResize, false);
				    window.addEventListener('fullscreenchange', onWindowResize, false);
				    onWindowResize(null);
			    } else if(use) {
			    	onWindowResize(null);
			    }
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
		     * @param {function(viewer: game.Viewer, maxW: number, maxH: number) : Vec2 } func - takes the maximum <!--
		     * -->width and height in parameters and return the actual width and height of the canvas as <!--
		     * -->{@link utils.geometry2d.Vec2#x|x} and {@link utils.geometry2d.Vec2#y|y} attributes of a <!--
		     * {@link utils.geometry2d.Vec2} instance
		     */
		    this.setResizeFunction = function(func) {
		    	resizeFunction = func || defaultResizeFunction;
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
		    };
		    if(context)this.setUIDiv(context.canvas.parentNode);
		}
		/**
		 * manually changes the size of the canvas, and modifies the scale for the visible rectangle <!--
		 * -->to fit the canvas without the visible rectangle to change. you can change the visible rect and <!--
		 * -->the {@link game.Viewer#updateTransform} method to change the scale.
		 * The callback function is then with the first parameter equal to <!--
		 * -->{@link game.RenderEvent.CANVAS_RESIZE} and the second one equal to the rendering context.
		 * @method
		 * @name game.Viewer#setCanvasSize
		 * @param {number} width
		 * @param {number} height
		 */
		setCanvasSize(width, height) {
			const canvas = this.context.canvas, parent = canvas.parentNode;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			parent.style.width = `${canvas.offsetWidth}px`;
			parent.style.height = `${canvas.offsetHeight}px`;

			this.updateTransform();
			if (this.getCallback()) this.getCallback()(game.RenderEvent.CANVAS_RESIZE, this.context);
		};

		/**
		 * sets the canvas resolution
		 * @param {number} width - number of pixels on the horizontal axis
		 * @param {number} height - number of pixels on the vertical axis
		 */
		setCanvasResolution(width, height) {
			//this.context.canvas.setAttribute('width' , String(width));
			//this.context.canvas.setAttribute('height', String(height));
			this.context.canvas.width = width;
			this.context.canvas.height = height;
			this.updateTransform();
		}

		/**
		 * @return {CSSStyleDeclaration} the computed style of the canvas, acquired with <!--
		 * --><code>getComputedStyle(viewer.context.canvas)</code>
		 */
		getCanvasStyle() {
			return getComputedStyle(this.context.canvas);
		}
		/**
		 * number of game units by screen pixel (=(visible game width)/(canvas width))
		 * @name game.Viewer#scaleX
		 * @type {number}
		 * @readonly
		 */
	    get scaleX() { return this.visibleRect.width/parseInt(this.getCanvasStyle().width); }
	    /**
	     * number of game units by screen pixel (=(visible game height)/(canvas height))
	     * @name game.Viewer#scaleY
	     * @type {number}
	     * @readonly
	     */
	    get scaleY() { return this.visibleRect.height/parseInt(this.getCanvasStyle().height); }
	    /**
	     * changes the scale for the visible rect size to fit the canvas. Don't forget to call this method after <!--
	     * --> you made manual modifications on the visible rect to avoid errors.
	     * Be aware that the game may look stretched if the aspect of the canvas is not the same <!--
	     * -->as the rectangle's {@link utils.geometry2d.Rect#ratio|ratio}
	     */
	    updateTransform() {
		    this.context.setTransform(
			    this.context.canvas.width/this.visibleRect.width, 0,
			    0, this.context.canvas.height/this.visibleRect.height,
			    this.visibleRect.xMin, this.visibleRect.yMin);
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
				pixelCoords.x*this.scaleX+this.visibleRect.xMin,
				pixelCoords.y*this.scaleY+this.visibleRect.yMin);
		}
		/**
		 * gives you the pixel coordinates, relative to the canvas, of a point in the game.
		 * @param {utils.geometry2d.Vec2} gameCoords
		 * @param {utils.geometry2d.Vec2} out
		 * @returns {utils.geometry2d.Vec2} out
		 */
		gameToPixelCoordinatesTransform(gameCoords, out = Vec2.zero) {
			return out.setXY(
				(gameCoords.x-this.visibleRect.xMin)/this.scaleX,
				(gameCoords.y-this.visibleRect.yMin)/this.scaleY);
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
	 * @extends game.Viewer
	 */
    class StandardViewer extends window.game.Viewer {
    	constructor(parameters) {
    		if((!parameters.context) && parameters.canvas)
    			parameters.context = parameters.canvas.getContext('2d');
    		super(parameters);
	    }
	    render(gameManager, objects) {
		    let rect = this.visibleRect, objs, ctx = this.context, l, i, callback = this.getCallback();
		    ctx.clearRect(rect.xMin, rect.yMin, rect.xMax, rect.yMax);
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
						    break;
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
window.game.StandardDifferedViewer = (function(){
	class StandardDifferedViewer extends game.StandardViewer {
		constructor(parameters) {
			super(parameters);
			this.hidden_canvas = this.context.canvas.cloneNode(false);
			this.hidden_context = this.hidden_canvas.getContext('2d');

		}
		//*
		setCanvasSize(width, height, marginX, marginY) {
			const canvas = this.context.canvas, mX = `${marginX}px`, mY = `${marginY}px`;
			canvas.width = canvas.style.width = width;
			canvas.height = canvas.style.height = height;

			if (getComputedStyle(canvas).getPropertyValue('position') === 'absolute') {
				canvas.style.left = mX; canvas.style.top = mY;
			} else {
				canvas.style.marginLeft = mX; canvas.style.marginTop = mY;
			}

			this.hidden_canvas.width = this.hidden_canvas.style.width = width;
			this.hidden_canvas.height = this.hidden_canvas.style.height = height;

			const temp = this.context;
			this.context = this.hidden_context;
			this.updateTransform();
			this.context = temp;
			console.log(width, height, canvas, this.hidden_canvas);
			if (this.getCallback()) this.getCallback()(game.RenderEvent.CANVAS_RESIZE, this.context);
		}
		/*/
		setCanvasSize(width, height, marginX, marginY)
		{
			super.setCanvasSize(width, height, marginX, marginY);
			const temp = this.context;
			this.context = this.hidden_context;
			super.setCanvasSize(width, height, marginX, marginY);
			this.context = temp;

			if (callback) callback(game.RenderEvent.CANVAS_RESIZE, this.context);

		}
		//*/
		render(gameManager, objects) {
			const temp = this.context, w = this.context.canvas.clientWidth, h = this.context.canvas.clientHeight;
			this.context = this.hidden_context;
			super.render(gameManager, objects);
			this.context = temp;
			let rect = this.visibleRect;
			this.context.clearRect(rect.xMin, rect.yMin, rect.xMax, rect.yMax);
			//console.log(this.hidden_canvas.width, this.hidden_canvas.height);
			this.context.drawImage(this.hidden_canvas, 0, 0, w, h, 0, 0, w, h);
		}
	}
	return StandardDifferedViewer;
})();
window.game.WebGLViewer = (function() {

	/**
	 * @class game.WebGLViewer
	 * @memberOf game
	 * @augments game.Viewer
	 * @extends game.Viewer
	 */
	class WebGLViewer extends window.game.Viewer {
		constructor(parameters) {
			if((!parameters.context) && parameters.canvas)
				parameters.context = window.webgl.getContext(parameters.canvas);
			super(parameters);
			const gl = this.gl;
			window.webgl.initContext(gl);
			this.bgColor = [0, 0, 0, 1];
		}

		updateTransform() {
			this.context.viewport(0, 0, this.context.canvas.width, this.context.canvas.height);
			this.updateUI();
		}
		get gl() {
			return this.context;
		}
		setBgColor(red, green, blue, alpha) {
			this.bgColor[0] = red;
			this.bgColor[1] = green;
			this.bgColor[2] = blue;
			this.bgColor[3] = alpha;
		}
		/*
		get scaleX() {
			return this.context.getParameter(this.context.VIEWPORT)[2]/parseInt(this.getCanvasStyle().width);
		}
		get scaleY() {
			return this.context.getParameter(this.context.VIEWPORT)[3]/parseInt(this.getCanvasStyle().height);
		}*/
		render(gameManager, objects) {
			let obj = objects.filter(game.renderableFilter), n = obj.length;
			this.context.clearColor(this.bgColor[0], this.bgColor[1], this.bgColor[2], this.bgColor[3]);
			this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
			while(n--) {
				obj[n].render(this.context);
			}
		}
	}
	return WebGLViewer;
})();