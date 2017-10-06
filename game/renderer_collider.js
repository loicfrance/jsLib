/**
 * Created by rfrance on 12/20/2016.
 */
//######################################################################################################################
//#                                                   ObjectRenderer                                                   #
//######################################################################################################################
window.game.ObjectRenderer = (function() {
	/**
	 * @class game.ObjectRenderer
	 * @memberOf game
	 * @abstract
	 * @classdesc the base class of object renderers. Renderers are used to handle collision detection of objects.
	 */
    class ObjectRenderer {
		constructor() {
		}
		/**
		 * sets the position of the renderer.
		 * @param {utils.geometry2d.Vec2} pos
		 * @returns {game.ObjectRenderer} <code>this</code>
		 */
		setPosition(pos) {
			return this;
		}

		/**
		 * rotates the renderer by the specified angle in radians
		 * @param {number} radians
		 */
		rotate(radians) {
		}

		/**
		 * multiplies the dimensions of the renderer by the specified factor
		 * @param factor
		 */
		scale(factor) {
		}

		/**
		 * draw the renderer on the canvas at the specified position if set and not null
		 * @param {CanvasRenderingContext2D} context2d
		 */
		render(context2d) {
		}

		/**
		 * creates and returns a {@link utils.geometry2d.Rect|Rect} that fits the renderer.
		 * @returns {utils.geometry2d.Rect}
		 */
		getRect() {
			return null;
		}
		/**
		 * returns the maximum distance of the center to a point of the renderer.
		 * @returns {number}
		 */
		getRadius() {
			return 0;
		}
    }
    return ObjectRenderer;
})();
//######################################################################################################################
//#                                                ShapedObjectRenderer                                                #
//######################################################################################################################
window.game.ShapedObjectRenderer = (function() {
	/**
	 * @class game.ShapedObjectRenderer
	 * @augments game.ObjectRenderer
	 * @memberOf game
	 * @classdesc an implementation of the {@link game.ObjectRenderer|ObjectRenderer} using a <!--
	 * -->{@link utils.geometry2d.Shape} instance and a color for drawings.
	 */
	class ShapedObjectRenderer extends game.ObjectRenderer {
		/**
		 * @constructor
		 * @param {utils.geometry2d.Shape}shape
		 * @param {string} color
		 */
		constructor(shape, color = '#FFF') {
			super();
			/**
			 * @name game.ShapedObjectRenderer#shape
			 * @type {utils.geometry2d.Shape}
			 */
			this.shape = shape.clone();
			/**
			 * @name game.ShapedObjectRenderer#color
			 * @type {string}
			 */
			this.color = color;
		}

		/**
		 * sets the renderer's shape center to the specified position
		 * @param {utils.geometry2d.Vec2} pos
		 * @returns {game.ShapedObjectRenderer} <code>this</code>
		 */
		setPosition(pos) {
			this.shape.setCenter(pos);
			return this;
		}

		/**
		 * rotates the shape of the renderer by the specified angle in radians.
		 * @param {number} radians
		 */
		rotate(radians) {
			this.shape.rotate(radians);
		}

		/**
		 * multiplies the dimensions of the shape by the specified factor.
		 * @param {number} factor
		 */
		scale(factor) {
			this.shape.scale(factor);
		}

		/**
		 * returns the {@link game.ShapedObjectRenderer#color|color} attribute of the renderer.
		 * @returns {string}
		 */
		getColor() {
			return this.color;
		}

		/**
		 * sets the {@link game.ShapedObjectRenderer#color|color} attribute of the renderer to the specified value.
		 * @param {string} color
		 */
		setColor(color) {
			this.color = color;
		}

		/**
		 * returns the {@link game.ShapedObjectRenderer#shape|shape} attribute of the renderer.
		 * @returns {utils.geometry2d.Shape}
		 */
		getShape() {
			return this.shape;
		}

		/**
		 * sets the {@link game.ShapedObjectRenderer#shape|shape} attribute of the renderer to a copy of the <!--
		 * -->specified shape.
		 * @param {utils.geometry2d.Shape} shape
		 */
		setShape(shape) {
			this.shape = shape.clone();
		}

		/**
		 * draws the shape on the canvas with the specified color.
		 * @param {CanvasRenderingContext2D} context2d
		 */
		render(context2d) {
			if(!(this.color.substr)) {
				let c = this.color.toString(16);
				if(c.length < 6) c = '0'.repeat(6-c.length)+c;
				this.color = '#'+c;
			}
			this.fill && (context2d.fillStyle = this.color);
			this.stroke && (context2d.strokeStyle = this.color);
			this.shape.draw(context2d, this.fill, this.stroke);
		}
		/**
		 * draws the shape on the canvas with the specified color.
		 * @param {webgl.GlHandler} handler
		 * @param {WebGLRenderingContext} handler.gl - webgl context
		 * @param {Float32Array} handler.vertices - a large-enough array to use (avoids creating arrays every time) <!--
		 * -->to store vertices
		 * @param {WebGLBuffer} handler.glBuffer - the buffer created with <code>gl.createBuffer()</code>
		 * @param {string} handler.positionAttrib - the location of the <code>vec2</code> attribute used for <!--
		 * -->the position of the vertex in the vertex shader
		 * @param {string} handler.colorUniform - the location of the <code>int</code> uniform used for <!--
		 * -->the color in the vertex shader
		 * @param {string} handler.depthUniform - the location of the <code>float</code> uniform used for <!--
		 * -->the depth in the vertex shader
		 */
		renderGL(handler) {
			if(this.color.substr) {
				let c = 0;
				switch(this.color.length) {
					case 4: c = 0xFF;
					case 5: c += parseInt(this.color.substr(1,1),16)*17 << 24
						+ parseInt(this.color.substr(2,1),16)*17 << 16
						+ parseInt(this.color.substr(3,1),16)*17 << 8
						+ parseInt(this.color.substr(4,1),16)*17;
						break;
					case 7: c = 0xFF;
					case 9: c += parseInt(this.color.substr(1,1),16) << 24
						+ parseInt(this.color.substr(3,1),16) << 16
						+ parseInt(this.color.substr(5,1),16) << 8
						+ parseInt(this.color.substr(7,1),16);
						break;
					default: console.stack(this.color + ' is not a valid color');
				}
			}
			handler.gl.uniform1i(handler.colorUniform, this.color);
			handler.gl.bindBuffer(handler.glBuffer);
			let points = this.shape.glSetVertices(handler.vertices);
			handler.gl.bufferData(handler.glBuffer, handler.vertices, handler.gl.STATIC_DRAW);
			gl.vertexAttribPointer(handler.positionAttrib, 2, gl.FLOAT, false, 0, 0);
			gl.drawArrays(this.stroke ? gl.LINE_LOOP : gl.TRIANGLE_FAN, 0, points );
		}
		/**
		 * returns a {@link utils.geometry2d.Rect|Rect} instance fitting the <!--
		 * -->{@link game.ShapedObjectRenderer#shape|shape} attribute of the renderer.
		 * @returns {utils.geometry2d.Rect}
		 */
		getRect() {
			return this.shape.getRect();
		}

		/**
		 * returns the maximum distance of the center to a point of the renderer.
		 * @returns {number}
		 */
		getRadius() {
			return this.shape.getRadius();
		}
	}
	/**
	 * whether or not the renderer should fill the shape. as it is common to all instances of the class, <!--
	 * -->this attribute is generally defined in the prototype of the class, but you can do it anywhere you want <!--
	 * -->for your renderers.
	 * @name game.ShapedObjectRenderer#fill
	 * @type {boolean}
	 */
	ShapedObjectRenderer.prototype.fill = true;
	/**
	 * whether or not the renderer should stroke the shape. as it is common to all instances of the class, <!--
	 * -->this attribute is generally defined in the prototype of the class, but you can do it anywhere you want <!--
	 * -->for your renderers.
	 * @name game.ShapedObjectRenderer#stroke
	 * @type {boolean}
	 */
	ShapedObjectRenderer.prototype.stroke = false;
	return ShapedObjectRenderer;
})();
//######################################################################################################################
//#                                                ImageObjectRenderer                                                 #
//######################################################################################################################
window.game.ImageObjectRenderer = (function() {
	const Rect = utils.geometry2d.Rect;
	/**
	 * @class game.ImageObjectRenderer
	 * @augments game.ObjectRenderer
	 * @memberOf game
	 * @classdesc an implementation of the {@link game.ObjectRenderer|ObjectRenderer} using an image instance and <!--
	 * -->transform informations for drawing
	 */
	class ImageObjectRenderer extends game.ObjectRenderer {
		/**
		 * @constructor
		 * @param {utils.geometry2d.Shape}shape
		 * @param {string} color
		 */
		constructor(image, clipRect= new Rect(0,0, image.width, image.height)) {
			super();
			/**
			 * @name game.ShapedObjectRenderer#shape
			 * @type {utils.geometry2d.Shape}
			 */
			this.image = image;
			this.position = utils.geometry2d.Vec2.zero;
			this.clipRect = clipRect;
		}

		/**
		 * sets the renderer's shape center to the specified position
		 * @param {utils.geometry2d.Vec2} pos
		 * @returns {game.ShapedObjectRenderer} <code>this</code>
		 */
		setPosition(pos) {
			this.position.set(pos);
			return this;
		}

		/**
		 * rotates the shape of the renderer by the specified angle in radians.
		 * @param {number} radians
		 */
		rotate(radians) {
			this.angle += radians;
		}

		/**
		 * multiplies the dimensions of the shape by the specified factor.
		 * @param {number} factor
		 */
		scale(factor) {
			this.scaleX *= factor;
			this.scaleY *= factor;
		}

		/**
		 * returns the {@link game.ImageObjectRenderer#image|image} attribute of the renderer.
		 * @returns {Image}
		 */
		getImage() {
			return this.image;
		}

		/**
		 * sets the {@link game.ImageObjectRenderer#image|image} attribute of the renderer to the <!--
		 * -->specified image.
		 * @param {Image} image
		 */
		setImage(image) {
			this.image = image;
		}
		setImageClipRect(clipRect) {
			this.clipRect.setRect(clipRect);
		}

		/**
		 * draws on the canvas
		 * @param {CanvasRenderingContext2D} context2d
		 */
		render(context2d) {
			if(!this.image.complete) return;
			const w = this.clipRect.width, h = this.clipRect.height, ws = w * this.scaleX, hs = h * this.scaleY;
			if(this.angle) {
				context2d.translate(this.position.x, this.position.y);
				context2d.rotate(this.angle);
				context2d.drawImage(this.image,
					this.clipRect.left, this.clipRect.top, w, h,
					-ws*0.5, -hs*0.5, ws, hs);
				context2d.rotate(-this.angle);
				context2d.translate(-this.position.x, -this.position.y);
			} else context2d.drawImage(this.image,
					this.clipRect.left, this.clipRect.top, w, h,
					this.position.x - ws*0.5, this.position.y - hs*0.5,
					ws, hs);
		}
		/**
		 * draws on the canvas.
		 * @param {webgl.GlHandler} handler
		 * @param {WebGLRenderingContext} handler.gl - webgl context
		 * @param {Float32Array} handler.vertices - a large-enough array to use (avoids creating arrays every time) <!--
		 * -->to store vertices
		 * @param {WebGLBuffer} handler.glBuffer - the buffer created with <code>gl.createBuffer()</code>
		 * @param {string} handler.positionAttrib - the location of the <code>vec2</code> attribute used for <!--
		 * -->the position of the vertex in the vertex shader
		 * @param {string} handler.colorUniform - the location of the <code>int</code> uniform used for <!--
		 * -->the color in the vertex shader
		 * @param {string} handler.depthUniform - the location of the <code>float</code> uniform used for <!--
		 * -->the depth in the vertex shader
		 */
		renderGL(handler) {
		}
		/**
		 * returns a {@link utils.geometry2d.Rect|Rect} instance fitting the <!--
		 * -->{@link game.ImageObjectRenderer#image|image} attribute of the renderer.
		 * @returns {utils.geometry2d.Rect}
		 */
		getRect() {
			return Rect.createFromCenterWidthHeight(this.position,
				this.clipRect.width*this.scaleX, this.clipRect.height*this.scaleY);
		}

		/**
		 * returns the maximum distance of the center to a point of the renderer.
		 * @returns {number}
		 */
		getRadius() {
			const r = this.getRect();
			return Math.max(r.width, r.height);
		}
	}
	utils.tools.merge(ImageObjectRenderer.prototype, {
		angle: 0, scaleX: 1, scaleY: 1
	});
	return ImageObjectRenderer;
})();
//######################################################################################################################
//#                                                 WebGLObjectRenderer                                                #
//######################################################################################################################
window.game.WebGLObjectRenderer = (function() {
	"use strict";
	class WebGLObjectRenderer extends game.ObjectRenderer {
		constructor(shaderProgram) {
			super();
			this.shaderProgram = shaderProgram;
		}
		setPosition(pos) {
			return this;
		}
		rotate(radians) {
		}
		scale(factor) {
		}
		render(glContext) {
			glContext.useProgram(this.shaderProgram);
		}
	}
	return WebGLObjectRenderer;
})();
//######################################################################################################################
//#                                         WebGL2dTransformableObjectRenderer                                         #
//######################################################################################################################
window.game.WebGL2dTransformableObjectRenderer = (function() {
	"use strict";
	class WebGL2dTransformableObjectRenderer extends game.WebGLObjectRenderer {
		constructor(shaderProgram) {
			super();
			this.shaderProgram = shaderProgram;
			this.transformMatrices =[
				[1,0,0,
				 0,1,0,
				 0,0,1],
				[1,0,0,
				 0,1,0,
				 0,0,1],
				[1,0,0,
				 0,1,0,
				 0,0,1]
			];
		}
		get translationMatrix() {
			return this.transformMatrices[0];
		}
		get rotationMatrix() {
			return this.transformMatrices[1];
		}
		get scaleMatrix() {
			return this.transformMatrices[2];
		}
		setPosition(pos) {
			this.transformMatrices[0][6] = pos.x;
			this.transformMatrices[0][7] = pos.y;
			return this;
		}
		rotate(radians) {
			const c = Math.cos(radians), s = Math.sin(radians);
			const a = this.transformMatrices[1][0], b = this.transformMatrices[1][3];
			this.transformMatrices[1][0] =   this.transformMatrices[1][4] = a*c-b*s;
			this.transformMatrices[1][1] = -(this.transformMatrices[1][3] = a*s+b*c);
		}
		scale(factor) {
			this.transformMatrices[2][0] *= factor;
			this.transformMatrices[2][4] *= factor;
		}
		render(glContext) {
			glContext.useProgram(this.shaderProgram);
		}
	}
	return WebGL2dTransformableObjectRenderer;
})();
//######################################################################################################################
//#                                            MultiRenderersObjectRenderer                                            #
//######################################################################################################################
window.game.MultiRenderersObjectRenderer = (function(){
	"use strict";
	/**
	 * @class game.MultiRenderersObjectRenderer
	 * @augments game.ObjectRenderer
	 * @memberOf game
	 * @classdesc an implementation of the {@link game.ObjectRenderer|ObjectRenderer} using several instances of <!--
	 * -->{@link game.ObjectRenderer}.
	 */
	class MultiRenderersObjectRenderer extends game.ObjectRenderer {
		/**
		 * @constructor
		 * @param {game.ObjectRenderer[]} renderers
		 */
		constructor(renderers) {
			super();
			this.renderers = renderers;
			this.renderersNumber = renderers.length;
			this.position = utils.geometry2d.Vec2.zero;
		}
		/**
		 * sets the renderer's shape center to the specified position
		 * @param {utils.geometry2d.Vec2} pos
		 * @returns {game.ShapedObjectRenderer} <code>this</code>
		 */
		setPosition(pos) {
			this.position.set(pos);
			let i = this.renderersNumber;
			while(i--) {
				this.renderers[i].setPosition(pos);
			}
			return this;
		}
		updateRenderersNumber() {
			this.renderersNumber = this.renderers.length;
		}
		/**
		 * rotates the shape of the renderer by the specified angle in radians.
		 * @param {number} radians
		 */
		rotate(radians) {
			let i = this.renderersNumber;
			while(i--) {
				this.renderers[i].rotate(radians);
			}
		}
		/**
		 * multiplies the dimensions by the specified factor.
		 * @param {number} factor
		 */
		scale(factor) {
			let i = this.renderersNumber;
			while(i--) {
				this.renderers[i].scale(factor);
			}
		}
		/**
		 * draws on the canvas
		 * @param {CanvasRenderingContext2D} context2d
		 */
		render(context2d) {
			let i = -1, n = this.renderersNumber;
			while(++i < n) {
				this.renderers[i].render(context2d);
			}
		}
		/**
		 * draws on the canvas.
		 * @param {webgl.GlHandler} handler
		 * @param {WebGLRenderingContext} handler.gl - webgl context
		 * @param {Float32Array} handler.vertices - a large-enough array to use (avoids creating arrays every time) <!--
		 * -->to store vertices
		 * @param {WebGLBuffer} handler.glBuffer - the buffer created with <code>gl.createBuffer()</code>
		 * @param {string} handler.positionAttrib - the location of the <code>vec2</code> attribute used for <!--
		 * -->the position of the vertex in the vertex shader
		 * @param {string} handler.colorUniform - the location of the <code>int</code> uniform used for <!--
		 * -->the color in the vertex shader
		 * @param {string} handler.depthUniform - the location of the <code>float</code> uniform used for <!--
		 * -->the depth in the vertex shader
		 */
		renderGL(handler) {
			let i = -1, n = this.renderersNumber;
			while(++i < n) {
				this.renderers[i].renderGL(handler);
			}
		}
		/**
		 * creates and returns a {@link utils.geometry2d.Rect|Rect} that fits the renderer.
		 * @returns {utils.geometry2d.Rect}
		 */
		getRect() {
			if(this.renderersNumber == 0)
				return utils.geometry2d.Rect.createFromPoint(this.position);
			let rects = new Array(this.renderersNumber), i = this.renderersNumber;
			while(i--) {
				rects[i] = this.renderers[i].getRect();
			}
			return utils.geometry2d.Rect.getUnion(rects);
		}
		/**
		 * returns the maximum distance of the center to a point of the renderer.
		 * @returns {number}
		 */
		getRadius() {
			if(this.renderersNumber == 0) return 0;
			let max = 0, i = this.renderersNumber, r;
			while(i--) {
				r = this.renderers[i].getRadius();
				if(r > max) max = r;
			}
			return max;
		}
	}
	return MultiRenderersObjectRenderer;
})();
//######################################################################################################################
//#                                                   ObjectCollider                                                   #
//######################################################################################################################
window.game.ObjectCollider = (function() {
	/**
	 * @class game.ObjectCollider
	 * @memberOf game
	 * @abstract
	 * @classdesc the base class of object colliders. Colliders are used to handle collision detection of objects.
	 */
	class ObjectCollider {
		/**
		 * @constructor
		 * @param {utils.geometry2d.Rect} rect
		 */
		constructor(rect) {
			/**
			 * @name game.ObjectCollider#rect
			 * @type {utils.geometry2d.Rect}
			 */
			this.rect = rect.clone();
		}
		/**
		 * sets the collider position to the specified one
		 * @param {utils.geometry2d.Vec2} pos
		 * @returns {game.ObjectCollider} <code>this</code>
		 */
		setPosition(pos) {
			this.rect.setCenter(pos); return this;
		}
		/**
		 * rotates the collider with the specified angle in radians.
		 * Automatically called when the {@link game.Object#rotate|rotate} method of the associated object is called.
		 * @param {number} radians
		 */
		rotate(radians) {
		}
		/**
		 * scales the collider with the specified factor.
		 * Automatically called when the {@link game.Object#scale|scale} method of the associated object is called.
		 * @param {number} factor
		 */
		scale(factor) {
		}
		/**
		 * returns the radius of the collider, i.e the maximum distance from the center to any point of the collider.
		 * @returns {number}
		 */
		getRadius() {
			return 0;
		}
		/**
		 * returns the {@link game.ObjectCollider#rect} attribute of the collider
		 * @returns {utils.geometry2d.Rect}
		 */
		getRect() {
			return this.rect;
		}
		/**
		 * returns whether or not this collider can be considered as colliding with the specified collider
		 * is it is inside. Otherwise, the colliders will need to intersect for the <!--
		 * -->{@link game.ObjectCollider#collides|collides} method to return true.
		 * @param {game.ObjectCollider} collider
		 * @returns {boolean}
		 */
		collidesInside(collider) {
			return false;
		}
		/**
		 * prepare the collision detection by acquiring necessary variables, such as the the <!--
		 * -->{@link game.ObjectCollider#rect|rect} attribute.
		 * @param {utils.geometry2d.Vec2} position
		 */
		prepareCollision(position) {
			this.setPosition(position);
		}
		/**
		 * tells the collider that the collision detection is over for this object on this frame.
		 */
		finishCollision() {
		}
		/**
		 * returns true if the two colliders are colliding.
		 * @param {game.ObjectCollider} collider
		 * @returns {boolean}
		 */
		collides(collider) {
			return false;
		}
		/**
		 * draw the collider on the canvas for debug purpose.
		 * @param context2d
		 */
		render(context2d) {
			this.rect.draw(context2d);
		}
	}

	/**
	 * whether or not the object will collide. As this won't change during the life of most objects, it is defined <!--
	 * -->in the prototype. But if you change it for some objects, it  is preferable to define it in the <!--
	 * -->constructor of the object-specific collider.
	 * @name game.ObjectCollider#activated
	 * @type {boolean}
	 */
	ObjectCollider.prototype.activated = true;
	return ObjectCollider;
})();
//######################################################################################################################
//#                                                    AABBCollider                                                    #
//######################################################################################################################
window.game.AABBObjectCollider = (function() {
	"use strict";
	/**
	 * @class game.AABBObjectCollider
	 * @augments game.ObjectCollider
	 * @memberOf game
	 * @classdesc an implementation of the {@link game.ObjectCollider|ObjectCollider} using a <!--
	 * -->an axis-aligned bounding box for collision detection.
	 */
	class AABBObjectCollider extends game.ObjectCollider {
		/**
		 * @constructor
		 * @param {utils.geometry2d.Shape} shape
		 */
		constructor(shape) {
			super(shape.getRect());
			/**
			 * @name game.ShapedObjectCollider#shape}
			 * @type {utils.geometry2d.shapes}
			 */
			this.shape = shape.clone();
		}

		/**
		 * sets the position of the collider.
		 * @param {utils.geometry2d.Vec2} pos
		 * @returns {game.ShapedObjectCollider} <code>this</code>
		 */
		setPosition(pos) {
			this.shape.setCenter(pos); return super.setPosition(pos);
		}

		/**
		 * rotates the {@link game.ShapedObjectCollider#shape}.
		 * @param {number} radians
		 */
		rotate(radians) {
			this.shape.rotate(radians);
		}

		/**
		 * scales the {@link game.ShapedObjectCollider#shape}.
		 * @param {number} factor
		 */
		scale(factor) {
			this.shape.scale(factor);
		}

		/**
		 * returns the {@link game.ShapedObjectCollider#shape}.
		 * @returns {utils.geometry2d.Shape}
		 */
		getShape() {
			return this.shape;
		}

		/**
		 * sets the {@link game.ShapedObjectCollider#shape} to a copy of the argument.
		 * @param {utils.geometry2d.Shape} shape
		 */
		setShape(shape) {
			this.shape = shape.clone();
		}

		/**
		 * returns true if the two colliders are colliding.
		 * @param {game.ObjectCollider} collider
		 * @returns {boolean}
		 */
		collides(collider) {
			if(collider instanceof AABBObjectCollider)
				return collider.rect.overlap(this.rect) &&
					(this.collidesInside(collider) || !collider.rect.containsRect(this.rect)) &&
					(collider.collidesInside(this) || !this.rect.containsRect(collider.rect));
			else return collider.collides(this);
		}

		/**
		 * returns the {@link game.ObjectCollider#rect|rect} attribute of the collider.
		 * @returns {utils.geometry2d.Rect}
		 */
		getRect() {
			return this.rect;
		}

		/**
		 * returns the radius of the collider, i.e the maximum distance from the center to any point of the collider.
		 * @returns {number}
		 */
		getRadius() {
			return Math.sqrt(this.rect.width*this.rect.width + this.rect.height*this.rect.height)*0.5;
		}
	}
	return AABBObjectCollider;
})();
//######################################################################################################################
//#                                                ShapedObjectCollider                                                #
//######################################################################################################################
window.game.ShapedObjectCollider = (function() {
	/**
	 * @class game.ShapedObjectCollider
	 * @augments game.ObjectCollider
	 * @memberOf game
	 * @classdesc an implementation of the {@link game.ObjectCollider|ObjectCollider} using a <!--
	 * -->{@link utils.geometry2d.Shape} instance for collision detection.
	 */
	class ShapedObjectCollider extends game.ObjectCollider {
		/**
		 * @constructor
		 * @param {utils.geometry2d.Shape} shape
		 */
		constructor(shape) {
			super(shape.getRect());
			/**
			 * @name game.ShapedObjectCollider#shape}
			 * @type {utils.geometry2d.shapes}
			 */
			this.shape = shape.clone();
		}

		/**
		 * sets the position of the collider.
		 * @param {utils.geometry2d.Vec2} pos
		 * @returns {game.ShapedObjectCollider} <code>this</code>
		 */
		setPosition(pos) {
			this.shape.setCenter(pos); return super.setPosition(pos);
		}

		/**
		 * rotates the {@link game.ShapedObjectCollider#shape}.
		 * @param {number} radians
		 */
		rotate(radians) {
			this.shape.rotate(radians);
		}

		/**
		 * scales the {@link game.ShapedObjectCollider#shape}.
		 * @param {number} factor
		 */
		scale(factor) {
			this.shape.scale(factor);
		}

		/**
		 * returns the {@link game.ShapedObjectCollider#shape}.
		 * @returns {utils.geometry2d.Shape}
		 */
		getShape() {
			return this.shape;
		}

		/**
		 * sets the {@link game.ShapedObjectCollider#shape} to a copy of the argument.
		 * @param {utils.geometry2d.Shape} shape
		 */
		setShape(shape) {
			this.shape = shape.clone();
		}

		/**
		 * returns true if the two colliders are colliding.
		 * @param {game.ObjectCollider} collider
		 * @returns {boolean}
		 */
		collides(collider) {
			if(collider instanceof game.AABBObjectCollider) {
				if(collider.rect.overlap(this.rect)) {
					let shape = collider.rect.getShape();
					return (this.collidesInside(collider) && shape.contains(this.shape.center)) ||
						(collides.collidesInside(this) && this.shape.contains(shape.center)) ||
						this.shape.intersect(shape);
				}
			} else if(collider instanceof ShapedObjectCollider) {
				return collider.shape && collider.rect.overlap(this.rect) &&
					(this.collidesInside(collider) && collider.shape.contains(this.shape.center)) ||
					(collider.collidesInside(this) && this.shape.contains(collider.shape.center)) ||
					this.shape.intersect(collider.shape);
			} else return collider.collides(this);
		}

		/**
		 * returns the {@link game.ObjectCollider#rect|rect} attribute of the collider after setting the <!--
		 * -->{@link game.ObjectCollider#rect|rect} to the return value of the <!--
		 * -->{@link game.ShapedObjectCollider#shape|shape}'s {@link utils.geometry2d.Shape#getRect|getRect} method.
		 * @returns {utils.geometry2d.Rect}
		 */
		getRect() {
			return this.rect.setRect(this.shape.getRect());
		}

		/**
		 * returns the radius of the collider, i.e the maximum distance from the center to any point of the collider.
		 * @returns {number}
		 */
		getRadius() {
			return this.shape.getRadius();
		}

		/**
		 * draws the rect and the shape on the canvas.
		 * @param {CanvasRenderingContext2D} context2d
		 */
		render(context2d) {
			super.render(context2d);
			this.shape.draw(context2d);
		}

	}
	return ShapedObjectCollider;
})();