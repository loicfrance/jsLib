/**
 * Created by Loic France on 12/25/2016.
 */

"use strict";
import {Vec2, Rect} from "../geometry2d/geometry2d.mod.js"
import {renderLayerSort, renderableFilter} from "./manager.mod.js";

/**
 * @enum {number}
 */
const RenderEvent = {
	RENDER_BEGIN : 6,
	RENDER_END : 7,
	CANVAS_RESIZE : 8
};
/**
 * @module game/viewer
 */
class UIElement {
	/**
	 * @constructor
	 *
	 * @param {HTMLElement} elmt
	 * @param {Vec2} position
	 * @param {boolean} staticPos
	 */
	constructor(elmt, position, autoScale = true, staticPos = false) {
		/**
		 * @type {HTMLElement}
		 * @name UIElement#elmt
		 */
		this.elmt = elmt;
		this.elmt.classList.add("game_ui");
		/**
		 * @type {Vec2}
		 * @name UIElement#position
		 */
		this.position = position ? position.clone() : null;
		/**
		 * @type {boolean}
		 * @name UIElement#staticPos
		 */
		this.staticPos = !!staticPos;
		/**
		 * @type {boolean}
		 * @name UIElement#autoScale
		 */
		this.autoScale = !!autoScale;
		this.scale = 1;
		this.anchor = new Vec2(0.5, 0.5); // position maps to the center of the element
	}

	/**
	 * called by the {@link Viewer} instace attached to the {@link GameManager} when the window
	 * gets resized or the visible rect is modified.
	 * @param viewer
	 */
	update(viewer) {
		//TODO

		if (this.position && !isNaN(this.position.x) && !isNaN(this.position.y)) {
			let transform = ""
			if (!this.staticPos) {
				let pixelPos = viewer.gameToPixelCoordinatesTransform(this.position);
				this.elmt.style.left = `${Math.round(pixelPos.x)}px`;
				this.elmt.style.top = `${Math.round(pixelPos.y)}px`;
			}
			if (this.autoScale) {
				const scale = viewer.gameToPixelVectorTransform(new Vec2(1,1)).mul(this.scale);
				transform = `scale(${Math.abs(scale.x)}, ${Math.abs(scale.y)}) `;
				this.elmt.style.transformOrigin = 'left top';
			}
			const translate = this.anchor.clone().mul(-100).roundedVec(4);
			transform += `translate(${translate.x}%, ${translate.y}%)`;
			this.elmt.style.transform = transform;
		}
	}
}

const defaultResizeFunction = (viewer, maxW, maxH, preferredRatio= 0)=> {
	let ratio = preferredRatio;
	if(ratio === 0) {
		const rect = viewer.visibleRect;
		const diagonal = new Vec2(rect.width, rect.height);
		viewer.gameToPixelCoordinatesTransform(diagonal, diagonal);
		ratio = diagonal.x/diagonal.y;
	}

	if(maxH * ratio > maxW) maxH = Math.floor(maxW / ratio);
	else if(maxH * ratio < maxW) maxW = Math.floor(maxH * ratio);
	return new Vec2(maxW, maxH);
};

/**
 * The class used by the game manager for the rendering.
 * @class Viewer
 */
class Viewer {
	/**
	 * @constructor
	 * @param context
	 * @param res_x
	 * @param res_y
	 * @param autoResize
	 * @param resizeMargin
	 * @param cursor
	 */
	constructor({
					context,
					inGameView: {
						spanX= 1,
						spanY= 1,
						tilt= 0,
						center = Vec2.ZERO,
						mirrorV = false,
						mirrorH = false
					} = {spanX: 0, spanY: 0, tilt: 0, center: Vec2.ZERO, mirrorV: false, mirroH: false},
					resolution: {width: res_x, height: res_y} = {width: 0, height: 0},
					autoResize: {use = false, margin = 1},
					cursor = null}) {
		//private variables used for resize
		let autoResize = false;
		let onWindowResize = null;
		let resizeMargin = 1;
		let requestRatio = 1;
		let callback = null;
		let uiDiv = null;
		let uiElmts = [];
		this.transformMatrix = [
			[1,0,0],
			[0,1,0],
			//[0,0,1] unnecessary
		];
		this.inverseTransformMatrix = [
			[1,0,0],
			[0,1,0],
			//[0,0,1] unnecessary
		];
		this.inGameSpanX = spanX;
		this.inGameSpanY = spanY;
		this.inGameViewCenter = center.clone();
		this.viewTiltAngle = tilt;
		this.mirrorH = mirrorH;
		this.mirrorV = mirrorV;
		this.visibleRect = new Rect(-1, -1, 1, 1);

		let resizeFunction = defaultResizeFunction;
		/**
		 * @name Viewer#context
		 * @type {CanvasRenderingContext2D|WebGLRenderingContext}
		 */
		this.context = context || null;
		/*
		/**
		 * @name Viewer#visibleRect
		 * @type {Rect}
		 //
		this.visibleRect =
			visibleRect ?
				visibleRect.clone()
			: (this.context && this.context.canvas) ?
				new Rect(0, 0, this.context.canvas.width, this.context.canvas.height)
			: new Rect(0,0,0,0);
		*/
		/**
		 * allows the canvas to resize automatically when the window size changes.
		 * The callback function is called after the resize with the first parameter equal to <!--
		 * -->{@link RenderEvent.CANVAS_RESIZE} and the second one equal to the rendering context.
		 * @method
		 * @name Viewer#useAutoResize
		 * @param {boolean} use
		 * @param {number} [borderMargin]. first use : default to 1. next uses : default to previous values.
		 *
		 */


		this.useAutoResize = function (use = true, borderMargin = resizeMargin, preferredRatio = requestRatio) {
			resizeMargin = borderMargin;
			requestRatio = preferredRatio;
			if (autoResize && !use) {
				window.removeEventListener('resize', onWindowResize, false);
				window.removeEventListener('fullscreenchange', onWindowResize, false);
				autoResize = false;
			}
			else if (!autoResize && use) {
				autoResize = true;
				if (!onWindowResize) {
					onWindowResize = function (event) {
						this.updateCanvasSize();
					}.bind(this);
				}
				window.addEventListener('resize', onWindowResize, false);
				window.addEventListener('fullscreenchange', onWindowResize, false);
				onWindowResize(null);
			} else if(use) {
				onWindowResize(null);
			}
		};

		this.updateCanvasSize = function() {
			const canvas = this.context.canvas,
			parent = canvas.parentNode,
			display = getComputedStyle(parent).display;
			parent.style.display = 'none';
			const  container = parent.parentNode || parent,
				containerW = container.clientWidth,
				containerH = container.clientHeight;

			let w = containerW - (resizeMargin * 2),
				h = containerH - (resizeMargin * 2);
			const wh = resizeFunction(this, w,h, requestRatio);
			parent.style.display = display;
			w = wh.x - Math.ceil(canvas.offsetWidth - canvas.clientWidth);
			h = wh.y - Math.ceil(canvas.offsetHeight - canvas.clientHeight);
			this.setCanvasSize(w, h);
		}

		/**
		 * sets the callback function called for rendering events. See {@link RenderEvent} <!--
		 * -->for a list of all possible events
		 * @method
		 * @name Viewer#setCallback
		 * @param {?renderEventCallback} cb
		 */
		this.setCallback = function (cb) {
			callback = cb;
		};
		/**
		 * returns the callback function called for rendering events. See {@link RenderEvent} <!--
		 * -->for a list of all possible events
		 * @method
		 * @name Viewer#getCallback
		 * @returns {?renderEventCallback}
		 */
		this.getCallback = function() {
			return callback;
		};
		/**
		 * @param {function(viewer: Viewer, maxW: number, maxH: number) : Vec2 } func - takes the maximum <!--
		 * -->width and height in parameters and return the actual width and height of the canvas as <!--
		 * -->{@link Vec2#x|x} and {@link Vec2#y|y} attributes of a <!--
		 * {@link Vec2} instance.
		 * The function is immediately called
		 */
		this.setResizeFunction = function(func) {
			resizeFunction = func || defaultResizeFunction;
			this.updateCanvasSize();
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
		 * adds a {@link UIElement} to the user interface
		 * @method
		 * @param {UIElement} elmt - the element to add to the UI
		 */
		this.addUIElement = function(elmt) {
			uiDiv.appendChild(elmt.elmt);
			uiElmts.push(elmt);
			elmt.update(this);
		};
		/**
		 * remove the {@link UIElement} from the user interface
		 * @param {UIElement} elmt
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
		 * calls the {@link UIElement#update update(viewer)} method of every element to transform it.
		 */
		this.updateUI = function() {
			let i = uiElmts.length;
			while(i--) {
				uiElmts[i].update(this);
			}
		};

		if(context)this.setUIDiv(context.canvas.parentNode);
		if(!isNaN(res_x) && !isNaN(res_y) && res_x > 0 && res_y > 0) {
			this.setCanvasResolution(res_x, res_y);
		}
		if (context)
			this.useAutoResize(use, margin, context.canvas.width / context.canvas.height);
		if(cursor != null) this.cursor = cursor;

		this.setTransform(tilt, mirrorH, mirrorV, spanX, spanY, center);
	}
	/**
	 * manually changes the size of the canvas, and modifies the scale for the visible rectangle <!--
	 * -->to fit the canvas without the visible rectangle to change. you can change the visible rect and <!--
	 * -->the {@link Viewer#updateTransform} method to change the scale.
	 * The callback function is then with the first parameter equal to <!--
	 * -->{@link RenderEvent.CANVAS_RESIZE} and the second one equal to the rendering context.
	 * @method
	 * @name Viewer#setCanvasSize
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
		if (this.getCallback()) this.getCallback()(RenderEvent.CANVAS_RESIZE, this.context);
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

	setTransform(rotation, mirrorH, mirrorV, spanX, spanY, viewCenter)
	{
		this.viewTiltAngle = rotation;
		this.mirrorH = mirrorH;
		this.mirrorV = mirrorV;
		this.inGameSpanX = spanX;
		this.inGameSpanY = spanY;
		this.inGameViewCenter = viewCenter;
		const sX = 2/spanX, sY = 2/spanY;
		const cos = Math.cos(rotation);
		const sin = Math.sin(rotation);
		const mX = mirrorH ? -1 : 1;
		const mY = mirrorV ? -1 : 1;
		const a = mX*cos*sX;
		const b = -mY*sin*sX;
		const c = mX*sin*sY;
		const d = mY*cos*sY;
		const dx = -viewCenter.x * a + -viewCenter.y * c;
		const dy = -viewCenter.x * b + -viewCenter.y * d;
		this.transformMatrix[0][0] = a;
		this.transformMatrix[1][0] = b;
		this.transformMatrix[0][1] = c;
		this.transformMatrix[1][1] = d;
		this.transformMatrix[0][2] = dx;
		this.transformMatrix[1][2] = dy;
		const det = a*d - b*c;
		this.inverseTransformMatrix[0][0] = d / det;
		this.inverseTransformMatrix[0][1] = -c / det;
		this.inverseTransformMatrix[0][2] = (c*dy - d*dx) / det;
		this.inverseTransformMatrix[1][0] = -b / det;
		this.inverseTransformMatrix[1][1] = a / det;
		this.inverseTransformMatrix[1][2] = (b*dx - a*dy) / det;
		this.visibleRect.setRect(Rect.createFromCenterWidthHeight(viewCenter, spanX, spanY)); // TODO change to consider rotation and mirror
		this.updateTransform();
	}

	// noinspection JSSuspiciousNameCombination
	/**
	 * @param {number} factorX
	 * @param {number} factorY
	 * @param {Vec2} origin
	 */
	zoom(factorX, factorY=factorX, origin=this.inGameViewCenter)
	{
		const newCenter = Vec2.translation(origin, this.inGameViewCenter);
		newCenter.x /= factorX;
		newCenter.y /= factorY;
		newCenter.add(origin);
		this.setTransform(this.viewTiltAngle, this.mirrorH, this.mirrorV,
			this.inGameSpanX/factorX, this.inGameSpanY/factorY, newCenter);
	}

	/**
	 * @param {number} radians
	 * @param {Vec2} origin
	 */
	rotate(radians, origin=this.inGameViewCenter) {
		const newCenter = Vec2.translation(origin, this.inGameViewCenter).rotate(-radians).add(origin);
		this.setTransform(this.viewTiltAngle+radians, this.mirrorH, this.mirrorV,
			this.inGameSpanX, this.inGameSpanY, newCenter);
	}

	/**
	 * @param {Vec2} delta
	 */
	translate(delta) {
		this.setTransform(this.viewTiltAngle, this.mirrorH, this.mirrorV,
			this.inGameSpanX, this.inGameSpanY, this.inGameViewCenter.add(delta));
	}

	/**
	 * number of game units by screen pixel (=(visible game width)/(canvas width))
	 * @name Viewer#scaleX
	 * @type {number}
	 * @readonly
	 */
	//get scaleX() { return this.visibleRect.width/parseInt(this.getCanvasStyle().width); }
	/**
	 * number of game units by screen pixel (=(visible game height)/(canvas height))
	 * @name Viewer#scaleY
	 * @type {number}
	 * @readonly
	 */
	//get scaleY() { return this.visibleRect.height/parseInt(this.getCanvasStyle().height); }
	/**
	 * changes the scale for the visible rect size to fit the canvas. Don't forget to call this method after <!--
	 * --> you made manual modifications on the visible rect to avoid errors.
	 * Be aware that the game may look stretched if the aspect of the canvas is not the same <!--
	 * -->as the rectangle's {@link Rect#ratio|ratio}
	 */
	updateTransform() {
		const halfCanvasWidth = this.context.canvas.width/2;
		const halfCanvasHeight = this.context.canvas.height/2;

		// set rectangle to unit rectangle
		// (-1,-1)---(+1,-1)
		//    |			|
		// (-1,+1)---(+1,+1)
		this.context.setTransform(halfCanvasWidth, 0, 0, halfCanvasHeight, halfCanvasWidth, halfCanvasHeight);

		this.context.transform(
			this.transformMatrix[0][0],
			this.transformMatrix[1][0],
			this.transformMatrix[0][1],
			this.transformMatrix[1][1],
			this.transformMatrix[0][2],
			this.transformMatrix[1][2]);
		this.updateUI();
	}
	/**
	 * gives you the in-game equivalent vector of a vector given in pixel coordinates.
	 * @param {Vec2} pixelVector
	 * @param {Vec2} out
	 * @returns {Vec2} out
	 */
	pixelToGameVectorTransform(pixelVector, out = Vec2.zero) {
		const M = this.inverseTransformMatrix;
		const style = this.getCanvasStyle();
		const halfW = parseInt(style.width)/2;
		const halfH = parseInt(style.height)/2;
		out.set(pixelVector);
		out.x /= halfW;
		out.y /= halfH;
		return out.setXY(
			out.x*M[0][0]+out.y*M[0][1],
			out.x*M[1][0]+out.y*M[1][1]);
	}
	pageToPixelCoordinatesTransform(pageCoords, out = Vec2.zero) {
		const elmtRect = this.context.canvas.getBoundingClientRect();
		return out.setXY(pageCoords.x - elmtRect.left, pageCoords.y - elmtRect.top);
	}
	pageToGameCoordinatesTransform(pageCoords, out = Vec2.zero) {
		return this.pixelToGameCoordinatesTransform(this.pageToPixelCoordinatesTransform(pageCoords, out), out);
	}
	/**
	 * gives you the game coordinates of a point given in pixel coordinates relative to the canvas.
	 * @param {Vec2} pixelCoords
	 * @param {Vec2} out
	 * @returns {Vec2} out
	 */
	pixelToGameCoordinatesTransform(pixelCoords, out = Vec2.zero) {
		const M = this.inverseTransformMatrix;
		const style = this.getCanvasStyle();
		const halfW = parseInt(style.width)/2;
		const halfH = parseInt(style.height)/2;
		out.set(pixelCoords).addXY(-halfW, -halfH); // relative to center
		out.x /= halfW;
		out.y /= halfH;
		return out.setXY(
			out.x*M[0][0]+out.y*M[0][1] + M[0][2],
			out.x*M[1][0]+out.y*M[1][1] + M[1][2]);
	}
	/**
	 * gives you the pixel equivalent, of a vector in the game coordinates
	 * @param {Vec2} gameVector
	 * @param {Vec2} out
	 * @returns {Vec2} out
	 */
	gameToPixelVectorTransform(gameVector, out = Vec2.zero) {
		const M = this.transformMatrix;
		const style = this.getCanvasStyle();
		const halfW = parseInt(style.width)/2;
		const halfH = parseInt(style.height)/2;
		out.setXY(
			gameVector.x*M[0][0]+gameVector.y*M[0][1],
			gameVector.x*M[1][0]+gameVector.y*M[1][1]);
		out.x *= halfW;
		out.y *= halfH;
		return out;
	}

	/**
	 * gives you the pixel coordinates, relative to the canvas, of a point in the game coordinates
	 * @param {Vec2} gameCoords
	 * @param {Vec2} out
	 * @returns {Vec2} out
	 */
	gameToPixelCoordinatesTransform(gameCoords, out = Vec2.zero) {
		const M = this.transformMatrix;
		const style = this.getCanvasStyle();
		const halfW = parseInt(style.width)/2;
		const halfH = parseInt(style.height)/2;
		out.setXY(
			gameCoords.x*M[0][0]+gameCoords.y*M[0][1] + M[0][2],
			gameCoords.x*M[1][0]+gameCoords.y*M[1][1] + M[1][2]);
		out.x *= halfW;
		out.y *= halfH;
		return out.addXY(halfW, halfH);
	}

	/**
	 *
	 * @param rect
	 */
	setVisibleRect(rect) {
		this.setTransform(0, this.mirrorH, this.mirrorV, rect.width, rect.height, rect.center)
	}
	/**
	 * called by the game manager after a frame to draw objects on the canvas.
	 * The callback function is called at the beginning and at the end of the function, and at the <!--
	 * -->beginning and the end of the drawing of every layer, with the first parameter equal to <!--
	 * -->{@link RenderEvent.RENDER_BEGIN}, {@link RenderEvent.RENDER_END}, <!--
	 * -->{@link RenderEvent.RENDER_LAYER_BEGIN} or {@link RenderEvent.RENDER_LAYER_END} <!--
	 * and the second one equal to the rendering context.
	 * @name Viewer#render
	 * @param {GameManager} gameManager
	 * @param {GameObject[]} objects
	 * @abstract
	 */
	render( gameManager, objects) { }

	get cursor() { return this.getCanvasStyle().cursor; }
	set cursor(cursor) { this.context.canvas.style.cursor = cursor; }
}

/**
 * @class StandardViewer
 * @memberOf game
 * @augments Viewer
 * @extends Viewer
 */
class StandardViewer extends Viewer {
	constructor(parameters) {
		if((!parameters.context) && parameters.canvas)
			parameters.context = parameters.canvas.getContext('2d');
		super(parameters);
		this.context.lineWidth = Math.min(this.visibleRect.width, this.visibleRect.height)/500;
	}
	drawBackground() {
		const rect = this.visibleRect;
		this.context.clearRect(rect.xMin, rect.yMin, rect.width, rect.height);
	}
	render(gameManager, objects) {
		let rect = this.visibleRect, objs, ctx = this.context, l, i, callback = this.getCallback();
		this.drawBackground();
		if(callback) {
			ctx.save();
			callback(RenderEvent.RENDER_BEGIN, ctx);
		}
		objs = objects.sort(renderLayerSort);
		if(!(i = objs.length))
			return;
		//noinspection StatementWithEmptyBodyJS
		while(i && objs[--i].renderLayer < 0);
		if(i>=0) {
			do {
				if(!objs[i].isOutOfRect(rect)) objs[i].render(ctx);

			} while(i--);
		}
		if(callback) {
			callback(RenderEvent.RENDER_END, ctx);
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
class StandardDifferedViewer extends StandardViewer {
	constructor(parameters) {
		super(parameters);
		this.hidden_canvas = this.context.canvas.cloneNode(false);
		this.hidden_context = this.hidden_canvas.getContext('2d');

	}
	//*
	setCanvasSize(width, height) {
		this.hidden_canvas.style.width = width;
		this.hidden_canvas.style.height = height;
		super.setCanvasSize(width, height);
		if (this.getCallback()) this.getCallback()(RenderEvent.CANVAS_RESIZE, this.context);
	}
	updateTransform() {
		const temp = this.context;
		this.context = this.hidden_context;
		super.updateTransform();
		this.context = temp;
	}
	setCanvasResolution(width, height) {
		this.context.canvas.width = width;
		this.context.canvas.height = height;

		this.hidden_canvas.width = width;
		this.hidden_canvas.height = height;
	}
	/*/
	setCanvasSize(width, height, marginX, marginY)
	{
		super.setCanvasSize(width, height, marginX, marginY);
		const temp = this.context;
		this.context = this.hidden_context;
		super.setCanvasSize(width, height, marginX, marginY);
		this.context = temp;

		if (callback) callback(RenderEvent.CANVAS_RESIZE, this.context);

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
	setImageSmoothingEnabled(enabled) {
		super.setImageSmoothingEnabled(enabled);
		const temp = this.context;
		this.context = this.hidden_context;
		super.setImageSmoothingEnabled(enabled);
		this.context = temp;
	}
}

/**
 * @class WebGLViewer
 * @memberOf game
 * @augments Viewer
 * @extends Viewer
 */
class WebGLViewer extends Viewer {
	constructor(parameters) {
		if((!parameters.context) && parameters.canvas)
			parameters.context = webgl.getContext(parameters.canvas);
		super(parameters);
		const gl = this.gl;
		webgl.initContext(gl);
		this.bgColor = [0, 0, 0, 1];
	}

	updateTransform() {
		this.context.viewport(0, 0, this.context.canvas.width, this.context.canvas.height);
		this.updateUI();
	}
	get gl() { //alias for context
		return this.context;
	}
	setBgColor(red, green, blue, alpha) {
		this.bgColor[0] = red;
		this.bgColor[1] = green;
		this.bgColor[2] = blue;
		this.bgColor[3] = alpha;
	}
	useFrameBuffer( frameBufferShaderProgram, samplersLocations) {
		this.frameBuffer = this.context.createFramebuffer();
		this.context.bindFramebuffer(this.context.FRAMEBUFFER, this.frameBuffer);
		this.frameProgram = frameBufferShaderProgram;
		this.frameSamplersLocs = samplersLocations;
	}

	/*
	get scaleX() {
		return this.context.getParameter(this.context.VIEWPORT)[2]/parseInt(this.getCanvasStyle().width);
	}
	get scaleY() {
		return this.context.getParameter(this.context.VIEWPORT)[3]/parseInt(this.getCanvasStyle().height);
	}*/
	render(gameManager, objects) {
		const obj = objects.filter(renderableFilter), gl = this.context;
		let n = obj.length;
		gl.clearColor(this.bgColor[0], this.bgColor[1], this.bgColor[2], this.bgColor[3]);
		gl.clear(this.context.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		if(this.callback) this.callback(RenderEvent.RENDER_BEGIN, gl);

		if(this.frameBuffer) gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
		while(n--) obj[n].render(gl);
		if(this.frameBuffer) {
			gl.useProgram(this.frameProgram);
			gl.uniform1i(this.frameSamplersLocs[0], gl.COLOR);
		}

		if(this.callback) this.callback(RenderEvent.RENDER_END, gl);
	}
}

export {RenderEvent, UIElement, Viewer, StandardViewer, StandardDifferedViewer, WebGLViewer};