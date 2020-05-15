/**
 * Created by Loic France on 12/20/2016.
 */
import {Rect, Vec2} from "../geometry2d/geometry2d.mod.js";
import {merge} from "../utils/tools.mod.js";

/**
 * @module game/renderer_collider
 */
//######################################################################################################################
//#                                                   ObjectRenderer                                                   #
//######################################################################################################################
/**
 * @class ObjectRenderer
 * @memberOf game
 * @abstract
 * @classdesc the base class of object renderers. Renderers are used to handle collision detection of objects.
 */
class ObjectRenderer {
	constructor() {
	}
	/**
	 * sets the position of the renderer.
	 * @param {Vec2} pos
	 * @returns {ObjectRenderer} <code>this</code>
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
	 * creates and returns a {@link Rect|Rect} that fits the renderer.
	 * @returns {Rect}
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
//######################################################################################################################
//#                                                ShapedObjectRenderer                                                #
//######################################################################################################################
/**
 * @class ShapedObjectRenderer
 * @augments ObjectRenderer
 * @memberOf game
 * @classdesc an implementation of the {@link ObjectRenderer|ObjectRenderer} using a <!--
 * -->{@link Shape} instance and a color for drawings.
 */
class ShapedObjectRenderer extends ObjectRenderer {
	/**
	 * @constructor
	 * @param {Shape}shape
	 * @param {string} color
	 */
	constructor(shape, color = '#FFF') {
		super();
		/**
		 * @name ShapedObjectRenderer#shape
		 * @type {Shape}
		 */
		this.setShape(shape);
		/**
		 * @name ShapedObjectRenderer#color
		 * @type {string}
		 */
		this.setColor(color);
	}

	/**
	 * sets the renderer's shape center to the specified position
	 * @param {Vec2} pos
	 * @returns {ShapedObjectRenderer} <code>this</code>
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
	 * returns the {@link ShapedObjectRenderer#color|color} attribute of the renderer.
	 * @returns {string}
	 */
	getColor() {
		return this.color;
	}

	/**
	 * sets the {@link ShapedObjectRenderer#color|color} attribute of the renderer to the specified value.
	 * @param {string} color
	 */
	setColor(color) {
        if(!(color.substr)) {
            let c = color.toString(16);
            if(c.length < 6) c = '0'.repeat(6-c.length)+c;
            this.color = '#'+c;
        } else this.color = color;
	}

	/**
	 * returns the {@link ShapedObjectRenderer#shape|shape} attribute of the renderer.
	 * @returns {Shape}
	 */
	getShape() {
		return this.shape;
	}

	/**
	 * sets the {@link ShapedObjectRenderer#shape|shape} attribute of the renderer to a copy of the <!--
	 * -->specified shape.
	 * @param {Shape} shape
	 */
	setShape(shape) {
		this.shape = shape.clone();
	}

	/**
	 * draws the shape on the canvas with the specified color.
	 * @param {CanvasRenderingContext2D} context2d
	 */
	render(context2d) {
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
			let c = 0; //TODO check switch below
			switch(this.color.length) {
				case 4: // "#RGB"
					c = 0xFF;
				case 5: // "#ARGB"
					c += parseInt(this.color.substr(1,1),16)*17 << 24
					+ parseInt(this.color.substr(2,1),16)*17 << 16
					+ parseInt(this.color.substr(3,1),16)*17 << 8
					+ parseInt(this.color.substr(4,1),16)*17;
					break;
				case 7: // "#RRGGBB"
					c = 0xFF;
				case 9: // "#AARRGGBB"
					c += parseInt(this.color.substr(1,1),16) << 24
					+ parseInt(this.color.substr(3,1),16) << 16
					+ parseInt(this.color.substr(5,1),16) << 8
					+ parseInt(this.color.substr(7,1),16);
					break;
				default: console.stack(this.color + ' is not a valid color');
			}
			this.color = c;
		}
		handler.gl.uniform1i(handler.colorUniform, this.color);
		handler.gl.bindBuffer(handler.glBuffer);
		let points = this.shape.glSetVertices(handler.vertices);
		handler.gl.bufferData(handler.glBuffer, handler.vertices, handler.gl.STATIC_DRAW);
		gl.vertexAttribPointer(handler.positionAttrib, 2, gl.FLOAT, false, 0, 0);
		gl.drawArrays(this.stroke ? gl.LINE_LOOP : gl.TRIANGLE_FAN, 0, points );
	}
	/**
	 * returns a {@link Rect|Rect} instance fitting the <!--
	 * -->{@link ShapedObjectRenderer#shape|shape} attribute of the renderer.
	 * @returns {Rect}
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
 * @name ShapedObjectRenderer#fill
 * @type {boolean}
 */
ShapedObjectRenderer.prototype.fill = true;
/**
 * whether or not the renderer should stroke the shape. as it is common to all instances of the class, <!--
 * -->this attribute is generally defined in the prototype of the class, but you can do it anywhere you want <!--
 * -->for your renderers.
 * @name ShapedObjectRenderer#stroke
 * @type {boolean}
 */
ShapedObjectRenderer.prototype.stroke = false;
//######################################################################################################################
//#                                                ImageObjectRenderer                                                 #
//######################################################################################################################

/**
 * @class ImageObjectRenderer
 * @augments ObjectRenderer
 * @memberOf game
 * @classdesc an implementation of the {@link ObjectRenderer|ObjectRenderer} using an image instance and <!--
 * -->transform informations for drawing
 */
class ImageObjectRenderer extends ObjectRenderer {

	/**
	 * @constructor
	 * @param {Image} image
	 * @param {Rect} clipRect
	 */
	constructor(image, clipRect= new Rect(0,0, image.width, image.height)) {
		super();
		/**
		 * @name ImageObjectRenderer#image
		 * @type {Image}
		 */
		this.image = image;
		this.position = Vec2.zero;
		this.clipRect = clipRect;
	}

	/**
	 * sets the renderer's shape center to the specified position
	 * @param {Vec2} pos
	 * @returns {ShapedObjectRenderer} <code>this</code>
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
	 * returns the {@link ImageObjectRenderer#image|image} attribute of the renderer.
	 * @returns {Image}
	 */
	getImage() {
		return this.image;
	}

	/**
	 * sets the {@link ImageObjectRenderer#image|image} attribute of the renderer to the <!--
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
				this.clipRect.xMin, this.clipRect.yMin, w, h,
				-ws*0.5, -hs*0.5, ws, hs);
			context2d.rotate(-this.angle);
			context2d.translate(-this.position.x, -this.position.y);
		} else context2d.drawImage(this.image,
				this.clipRect.xMin, this.clipRect.yMin, w, h,
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
	 * returns a {@link Rect|Rect} instance fitting the <!--
	 * -->{@link ImageObjectRenderer#image|image} attribute of the renderer.
	 * @returns {Rect}
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
merge(ImageObjectRenderer.prototype, {
	angle: 0, scaleX: 1, scaleY: 1
});
//######################################################################################################################
//#                                                 WebGLObjectRenderer                                                #
//######################################################################################################################
class WebGLObjectRenderer extends ObjectRenderer {
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
	/**
	 * @param {WebGL2RenderingContext} glContext
	 */
	render(glContext) {
		glContext.useProgram(this.shaderProgram);
	}
}
//######################################################################################################################
//#                                         WebGL2dTransformableObjectRenderer                                         #
//######################################################################################################################
class WebGL2dTransformableObjectRenderer extends WebGLObjectRenderer {
	constructor(shaderProgram) {
		super(shaderProgram);
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
		this.transformMatrices[0][2] = pos.x;
		this.transformMatrices[0][5] = pos.y;
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
}
//######################################################################################################################
//#                                            MultiRenderersObjectRenderer                                            #
//######################################################################################################################
/**
 * @class MultiRenderersObjectRenderer
 * @augments ObjectRenderer
 * @memberOf game
 * @classdesc an implementation of the {@link ObjectRenderer|ObjectRenderer} using several instances of <!--
 * -->{@link ObjectRenderer}.
 */
class MultiRenderersObjectRenderer extends ObjectRenderer {
	/**
	 * @constructor
	 * @param {ObjectRenderer[]} renderers
	 */
	constructor(renderers) {
		super();
		this.renderers = renderers;
		this.renderersNumber = renderers.length;
		this.position = Vec2.zero;
	}
	/**
	 * sets the renderer's shape center to the specified position
	 * @param {Vec2} pos
	 * @returns {ShapedObjectRenderer} <code>this</code>
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
	 * creates and returns a {@link Rect|Rect} that fits the renderer.
	 * @returns {Rect}
	 */
	getRect() {
		if(this.renderersNumber == 0)
			return Rect.createFromPoint(this.position);
		let rects = [], i = this.renderersNumber, r;
		while(i--) {
			r = this.renderers[i].getRect();
			if(r)rects.push(r);
		}
		return Rect.getUnion(rects);
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

	addRenderer(renderer) {
		this.renderers.push(renderer);
		this.updateRenderersNumber();
	}
	removeRenderer(renderer) {
		const i = this.renderers.indexOf(renderer);
		if(i >= 0) {
			this.renderers.splice(i, i+1);
			this.updateRenderersNumber();
		}
	}
}
//######################################################################################################################
//#                                                   ObjectCollider                                                   #
//######################################################################################################################
/**
 * @class ObjectCollider
 * @memberOf game
 * @abstract
 * @classdesc the base class of object colliders. Colliders are used to handle collision detection of objects.
 */
class ObjectCollider {
	/**
	 * @constructor
	 */
	constructor() {
	}
	/**
	 * sets the collider position to the specified one
	 * @param pos
	 * @returns {ObjectCollider} <code>this</code>
	 */
	setPosition(pos) {
		return this;
	}
	/**
	 * scales the collider with the specified factor.
	 * Automatically called when the {@link GameObject#scale|scale} method of the associated object is called.
	 * @param {number} factor
	 */
	scale(factor) {
	}
	/**
	 * returns whether or not this collider can be considered as colliding with the specified collider
	 * is it is inside. Otherwise, the colliders will need to intersect for the <!--
	 * -->{@link ObjectCollider#collides|collides} method to return true.
	 * @param {ObjectCollider} collider
	 * @returns {boolean}
	 */
	collidesInside(collider) {
		return false;
	}
	/**
	 * prepare the collision detection by acquiring necessary variables, such as the the <!--
	 * -->{@link ObjectCollider#rect|rect} attribute.
	 * @param {Vec2} position
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
	 * @param {ObjectCollider} collider
	 * @returns {boolean}
	 */
	collides(collider) {
		return false;
	}
	/**
	 * draw the collider on the canvas for debug purpose.
	 * @param context
	 */
	render(context) {
	}
}

/**
 * whether or not the object will collide. As this won't change during the life of most objects, it is defined <!--
 * -->in the prototype. But if you change it for some objects, it is preferable to define it in the <!--
 * -->constructor of the object-specific collider.
 * @name ObjectCollider#activated
 * @type {boolean}
 */
ObjectCollider.prototype.activated = true;
ObjectCollider.prototype.physic = false;
//######################################################################################################################
//#                                                  Object2dCollider                                                  #
//######################################################################################################################
/**
 * @class Object2dCollider
 * @memberOf game
 * @abstract
 * @classdesc The base class of object colliders, using a {@link Rect} to detect collisions.
 * Colliders are used to handle collision detection of objects.
 */
class Object2dCollider extends ObjectCollider{
	/**
	 * @constructor
	 * @param {Rect} rect
	 */
	constructor(rect) {
		super();
		/**
		 * @name Object2dCollider#rect
		 * @type {Rect}
		 */
		this.rect = rect.clone();
	}
	/**
	 * sets the collider position to the specified one
	 * @param {Vec2} pos
	 * @returns {Object2dCollider} <code>this</code>
	 */
	setPosition(pos) {
		this.rect.setCenter(pos); return this;
	}
	/**
	 * rotates the collider with the specified angle in radians.
	 * Automatically called when the {@link GameObject#rotate|rotate} method of the associated object is called.
	 * @param {number} radians
	 */
	rotate(radians) {
	}
	/**
	 * returns the radius of the collider, i.e the maximum distance from the center to any point of the collider.
	 * @returns {number}
	 */
	getRadius() {
		return 0;
	}
	/**
	 * returns the {@link Object2dCollider#rect} attribute of the collider
	 * @returns {Rect}
	 */
	getRect() {
		return this.rect;
	}
	/**
	 * draw the collider on the canvas for debug purpose.
	 * @param context2d
	 */
	render(context2d) {
		this.rect.draw(context2d);
	}
}
//######################################################################################################################
//#                                                ShapedObject2dCollider                                              #
//######################################################################################################################
/**
 * @class ShapedObject2dCollider
 * @augments Object2dCollider
 * @memberOf game
 * @classdesc an implementation of the {@link Object2dCollider|Object2dCollider} using a <!--
 * -->{@link Shape} instance for collision detection.
 */
class ShapedObject2dCollider extends Object2dCollider {
	/**
	 * @constructor
	 * @param {Shape} shape
	 */
	constructor(shape) {
		super(shape.getRect());
		/**
		 * @name ShapedObject2dCollider#shape}
		 * @type {Shape}
		 */
		this.shape = shape.clone();
	}

	/**
	 * sets the position of the collider.
	 * @param {Vec2} pos
	 * @returns {ShapedObject2dCollider} <code>this</code>
	 */
	setPosition(pos) {
		this.rect.setRect(this.shape.setCenter(pos).getRect()); return this;
	}

	/**
	 * rotates the {@link ShapedObject2dCollider#shape}.
	 * @param {number} radians
	 */
	rotate(radians) {
		this.shape.rotate(radians);
	}

	/**
	 * scales the {@link ShapedObject2dCollider#shape}.
	 * @param {number} factor
	 */
	scale(factor) {
		this.shape.scale(factor);
	}

	/**
	 * returns the {@link ShapedObject2dCollider#shape}.
	 * @returns {Shape}
	 */
	getShape() {
		return this.shape;
	}

	/**
	 * returns the {@link Shape} used to compute collision
	 * @returns {Shape}
	 */
	getCollisionShape() {
		return this.getShape();
	}

	/**
	 * sets the {@link ShapedObject2dCollider#shape} to a copy of the argument.
	 * @param {Shape} shape
	 */
	setShape(shape) {
		this.shape = shape.clone();
	}

	/**
	 * returns true if the two colliders are colliding.
	 * @param {ObjectCollider} collider
	 * @returns {boolean}
	 */
	collides(collider) {
		if(collider instanceof ShapedObject2dCollider) {
			if(!collider.rect.overlap(this.rect)) return false;
			const shape = collider.getCollisionShape();

			return (this.collidesInside(collider) && shape.contains(this.shape.center)) ||
				   (collider.collidesInside(this) && this.shape.contains(shape.center)) ||
					this.shape.intersect(shape);

		} else return (collider instanceof Object2dCollider) && collider.collides(this);
	}

	/**
	 * returns the {@link Object2dCollider#rect|rect} attribute of the collider after setting the <!--
	 * -->{@link Object2dCollider#rect|rect} to the return value of the <!--
	 * -->{@link ShapedObject2dCollider#shape|shape}'s {@link Shape#getRect|getRect} method.
	 * @returns {Rect}
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
//######################################################################################################################
//#                                                    AABBCollider                                                    #
//######################################################################################################################
/**
 * @class AABBObject2dCollider
 * @augments Object2dCollider
 * @memberOf game
 * @classdesc an implementation of the {@link Object2dCollider|Object2dCollider} using the <!--
 * -->Axis-Aligned Bounding Box (AABB) of a moving shape for collision detection. the AABB is computed <!--
 * -->each frame from the shape
 */
class AABBObject2dCollider extends ShapedObject2dCollider {
	/**
	 * @constructor
	 * @param {Shape} shape
	 */
	constructor(shape) {
		super(shape);
	}

	/**
	 * @inheritDoc
	 * @returns {Shape}
	 */
	getCollisionShape() {
		return this.rect.getShape();
	}


	/**
	 * returns true if the two colliders are colliding.
	 * @param {ObjectCollider} collider
	 * @returns {boolean}
	 */
	collides(collider) {
		if(collider instanceof AABBObject2dCollider)
			return collider.rect.overlap(this.rect) &&
				(this.collidesInside(collider) || !collider.rect.containsRect(this.rect)) &&
				(collider.collidesInside(this) || !this.rect.containsRect(collider.rect));
		else return (collider instanceof Object2dCollider) && collider.collides(this);
	}

	/**
	 * returns the radius of the collider, i.e the maximum distance from the center to any point of the collider.
	 * @returns {number}
	 */
	getRadius() {
		return Math.sqrt(this.rect.width*this.rect.width + this.rect.height*this.rect.height)*0.5;
	}
}

//######################################################################################################################
//#                                               CircularObject2dCollider                                             #
//######################################################################################################################
/**
	 * @class CircularObject2dCollider
	 * @augments Object2dCollider
	 * @memberOf game
	 * @classdesc an implementation of the {@link Object2dCollider} using a <!--
	 * -->{@link Circle} instance for collision detection
	 */
class CircularObject2dCollider extends ShapedObject2dCollider {
	constructor(circle) {
		super(circle);
	}
	get circle() { return this.shape; }
	set circle(circle) { this.shape = circle; }

	getCollisionShape() {
		return new this.shape.getCircle();
	}
	/**
	 * returns true if the two colliders are colliding.
	 * @param {ObjectCollider} collider
	 * @returns {boolean}
	 */
	collides(collider) {
		if(collider instanceof CircularObject2dCollider) {
			const d = Vec2.distance(this.shape.center, collider.shape.center);
			return d < this.shape.radius + collider.shape.radius &&
				(!this.collidesInside(collider) && d + this.shape.radius > collider.shape.radius) ||
				(!collider.collidesInside(this) && d + collider.shape.radius > this.shape.radius);
		}
		else return (collider instanceof Object2dCollider) && collider.collides(this);
	}
}

export {
	ObjectRenderer,
	ShapedObjectRenderer,
	ImageObjectRenderer,
	WebGLObjectRenderer,
	MultiRenderersObjectRenderer,
	WebGL2dTransformableObjectRenderer,
	ObjectCollider,
	Object2dCollider,
	ShapedObject2dCollider,
	AABBObject2dCollider,
	CircularObject2dCollider
};