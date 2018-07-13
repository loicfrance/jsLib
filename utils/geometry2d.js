/**
* Created by Loic France on 12/20/2016.
*/

/**
 * @module utils/geometry
 */

/**
 * 2 \* PI
 * @static
 * @constant
 * @type {number}
 */
const PI2 = 2 * Math.PI;
/**
 * PI / 2
 * @static
 * @constant
 * @type {number}
 */
const PI_2 = Math.PI/2;

//######################################################################################################################
//#                                                        Vec2                                                        #
//######################################################################################################################
/**
 * A simple class with 2 members : <code>{@link Vec2#x|x}</code> and <code>{@link Vec2#y|y}</code>, <!--
 * -->used to represent points and vectors in a 2-dimensions space
 * @class Vec2
 * @memberOf utils.geometry2d
 * @alias utils.geometry2d.Vec2
 */
class Vec2 {
	/** @constructor
	 * @param {number} x - x coordinate
	 * @param {number} y - y coordinate
	 */
	constructor(x, y) {
		/**
		 * @name Vec2#x
		 * @type {number}
		 */
		this.x = x;
		/**
		 * @name Vec2#y
		 * @type {number}
		 */
		this.y = y;
	}

	/**
	 * angle of this Vec2, computed from the coordinates : <code>atan2(y, x)</code>.
	 * @type {number}
	 */
	get angle() {
		return Math.atan2(this.y, this.x);
	}

	/**
	 * sets the angle of this vector to the given one (in radians) :
	 * <code>x= cos(a)\*magnitude, y= sin(a)\*magnitude</code>
	 * @type {number}
	 */
	set angle(a) {
		const m = this.magnitude;
		if (m) {
			this.x = Math.cos(a) * m;
			this.y = Math.sin(a) * m;
		}
	}

	/**
	 * square magnitude of this vector, calculated from the coordinates : <code>{@link Vec2#x|x}<sup>2</sup> + <!--
	 * -->{@link Vec2#y|y}<sup>2</sup></code>
	 * @readonly
	 * @type {number}
	 */
	get squareMagnitude() {
		/*
		return asm.squareMagnitude(this.x, this.y);
		/*/
		return this.x * this.x + this.y * this.y;
		//*/
	}

	/**
	 * magnitude of this Vec2, calculated from the coordinates : <code>&radic;({@link Vec2#x|x}<sup>2</sup> + <!--
	 * -->{@link Vec2#y|y}<sup>2</sup>)</code>.
	 * @type {number}
	 */
	get magnitude() {
		/*
		return asm.magnitude(this.x, this.y);
		/*/
		return Math.sqrt(this.x * this.x + this.y * this.y);
		//*
	}

	/**
	 * sets the magnitude of the vector to the given one. keeps the angle
	 * sets x and y coordinates to make the magnitude = mag.
	 * @type {number}
	 */
	set magnitude(mag) {
		let m = this.magnitude;
		if (m) this.mul(mag / m); else this.x = mag;
	}

	/**
	 * @return {Vec2} a Vec2 with the same x and y properties
	 */
	clone() {
		return new Vec2(this.x, this.y);
	}

	/**
	 * sets x and y coordinates of this Vec2
	 * @param {number} x - new x coordinate
	 * @param {number} y - new y coordinate
	 * @return {Vec2} this
	 */
	setXY(x, y) {
		this.x = x;
		this.y = y;
		return this;
	}

	/**
	 * sets x and y coordinates to the same as the 'vec' parameter
	 * @param {Vec2} vec
	 * @return {Vec2} this
	 */
	set(vec) {
		this.x = vec.x;
		this.y = vec.y;
		return this;
	}

	/**
	 * sets x and y coordinates to 0
	 * @return {Vec2} this
	 */
	reset() {
		this.x = this.y = 0;
		return this;
	}

	/**
	 * @param {number} x - number to be added to x coordinate
	 * @param {number} y - number to be added to y coordinate
	 * @return {Vec2} this
	 */
	addXY(x, y) {
		this.x += x;
		this.y += y;
		return this;
	}

	/**
	 * @param {Vec2} vec
	 * @return {Vec2} this
	 */
	add(vec) {
		this.x += vec.x;
		this.y += vec.y;
		return this;
	}

	/**
	 * @param {Vec2} vec
	 * @return {Vec2} this
	 */
	remove(vec) {
		this.x -= vec.x;
		this.y -= vec.y;
		return this;
	}

	/**
	 * makes the vector the opposite of itself : p = - p.
	 */
	negate() {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	}

	/**
	 * multiplies x and y coordinates by the parameter.
	 * @param {number} factor
	 * @return {Vec2} this
	 */
	mul(factor) {
		this.x *= factor;
		this.y *= factor;
		return this;
	}

	/**
	 * sets x and y coordinates to make the magnitude = 1.
	 * if x = y = 0, this function does nothing.
	 * @return {Vec2} this
	 */
	normalize() {
		this.mul(1 / (this.magnitude || 1));
		return this;
	}

	/**
	 * sets x and y coordinates to make the magnitude = mag.
	 * @param {number} mag -the new magnitude of this Vec2
	 * @return {Vec2} this
	 */
	setMagnitude(mag) {
		this.magnitude = mag;
		return this;
	}

	/**
	 * x= cos(a)*magnitude, y= sin(a)*magnitude
	 * @param {number} a - new angle(radians) of this Vec2
	 * @return {Vec2} this
	 */
	setAngle(a) {
		this.angle = a;
		return this;
	}

	/**
	 * @param {number} a - angle(radians) to rotate this Vec2
	 * this.angle += a;
	 * @return {Vec2} this
	 */
	rotate(a) {
		this.angle += a;
		return this;
	}

	/**
	 * rotate this Vec2 around the center, and keep the distance to the center
	 * @param {Vec2} center - point to rotate this Vec2 around
	 * @param {number} a - angle(radians) to rotate this Vec2
	 * @return {Vec2} this
	 */
	rotateAround(center, a) {
		return this.set(Vec2.translation(center, this).rotate(a).add(center));
	}

	/**
	 * @return {string} "(x,y)"
	 */
	toString() {
		return ['(', this.x, ',', this.y, ')'].join('');
	}

	/**
	 * @return {boolean} true if this.x=x and this.y=y, false otherwise.
	 */
	equalsXY(x, y) {
		return this.x === x && this.y === y;
	}

	/**
	 * @return {boolean} true if this.x=vec.x and this.y=vec.y, false otherwise.
	 */
	equals(vec) {
		return this.x === vec.x && this.y === vec.y;
	}

	/**
	 * @return {boolean} true if x=y=0, false otherwise.
	 */
	isZero() {
		return !(this.x || this.y);
	}

	/**
	 * @return {Vec2} new Vec2 containing unit (magnitude=1) version of this Vec2
	 */
	getUnit() {
		return this.clone().normalize();
	}

	/**
	 * @param {Vec2} [center=Vec2.ZERO]
	 * @return {Vec2} the mirror Vec2 of this Vec2, relative to the center
	 */
	getMirror(center = Vec2.ZERO) {
		return Vec2.translation(this, center).add(center);
	}

	/**
	 * @param {number} [axisX=0]
	 * @return {Vec2} the horizontal mirror Vec2 of this Vec2,
	 * relative to the axisX x coordinate
	 */
	getHorizontalMirror(axisX = 0) {
		return this.clone().mirrorHorizontally();
	}

	/**
	 * @param {number} [axisY=0]
	 * @return {Vec2} the vertical mirror Vec2 of this Vec2,
	 * relative to the axisY y coordinate
	 */
	getVerticalMirror(axisY = 0) {
		return this.clone().mirrorVertically();
	}

	mirror(center = Vec2.ZERO) {
		this.x = center.x ? 2 * center.x - this.x : -this.x;
		this.y = center.y ? 2 * center.y - this.y : -this.y;
		return this;
	}

	/**
	 * same (but faster) as instance.set(instance.getHorizontalMirror(axisX))
	 * @param {number} [axisX=0]
	 * @return {Vec2} this
	 */
	mirrorHorizontally(axisX = 0) {
		this.x = axisX ? 2 * axisX - this.x : -this.x;
		return this;
	}

	/**
	 * same (but faster) as instance.set(instance.getVerticalMirror(axisY))
	 * @param {number} [axisY=0]
	 * @return {Vec2} this
	 */
	mirrorVertically(axisY = 0) {
		this.y = axisY ? 2 * axisY - this.y : -this.y;
		return this;
	}

	/**
	 * @param {number} [digits=0] - number of digits the result must have.
	 *        if not set (= 0), the result will be the closest integer.

	 * @return {number} rounded value of x coordinate.
	 */
	getRoundedX(digits = 0) {
		if (digits) return parseInt(this.x.toPrecision(digits));
		else return Math.round(this.x);
	}

	/**
	 * @param {number} [digits=0] - number of digits the result must have.
	 *        if not set (= 0), the result will be the closest integer.
	 * @return {number} rounded value of y coordinate.
	 */
	getRoundedY(digits = 0) {
		if (digits) return parseInt(this.y.toPrecision(digits));
		else return Math.round(this.y);
	}

	/**
	 * @param {number} [digits=0] - number of digits the result must have.
	 *        if not set (= 0), the result will be the closest integer.
	 * @return {Vec2} copy of this Vec2 with rounded coordinates.
	 */
	roundedVec(digits = 0) {
		return new Vec2(this.getRoundedX(digits), this.getRoundedY(digits));
	}

	/**
	 * if the magnitude of this Vec2 is not in the interval [min, max],
	 * this method modifies the coordinate to make the magnitude
	 * to the max(if magnitude is higher) or the min (if magnitude is lower).
	 * @param {number} min - the minimum magnitude
	 * @param {number} max - the maximum magnitude
	 * @return {Vec2} this
	 */
	clampMagnitude(min, max) {
		let m = this.magnitude;
		if (m) {
			if (m < min) this.mul(min / m);
			else if (m > max) this.mul(max / m);
		} else this.x = min;
		return this;
	}

	/**
	 * @static
	 * @param {Vec2} u
	 * @param {Vec2} v
	 * @return {number} the result of the dot product of u and v.
	 */
	static dotProd(u, v) {
		/*
		return asm.dotProduct(u.x, u.y, v.x, v.y);
		/*/
		return u.x * v.x + u.y * v.y;
		//*/
	}

	/**
	 * @static
	 * @param {Vec2} u
	 * @param {Vec2} v
	 * @return {number} the result of the vectorial product of u and v.
	 */
	static vectProd(u, v) {
		/*
		return asm.vectorProduct(u.x, u.y, v.x, v.y);
		/*/
		return u.x * v.y - u.y * v.x;
		//*/
	}

	/**
	 * @static
	 * @param {Vec2} A - start point
	 * @param {Vec2} B - end point
	 * @return {Vec2} the translation from A to B
	 */
	static translation(A, B) {
		return new Vec2(B.x - A.x, B.y - A.y);
	}

	/**
	 * @static
	 * @param {Vec2} A
	 * @param {Vec2} B
	 * @return {number} the square euclidian distance between A and B
	 */
	static squareDistance(A, B) {
		/*
		return asm.squareEuclideanDistance(A.x, A.y, B.x, B.y);
		/*/
		let dX = B.x - A.x, dY = B.y - A.y;
		return dX * dX + dY * dY;
		//*/
	}

	/**
	 * @static
	 * @param {Vec2} A
	 * @param {Vec2} B
	 * @return {number} the euclidian distance between A and B
	 */
	static distance(A, B) {
		/*
		return asm.euclideanDistance(A.x, A.y, B.x, B.y);
		/*/
		return Math.sqrt(Vec2.squareDistance(A, B));
		//*/
	}

	/**
	 * @static
	 * @param {Vec2} A
	 * @param {Vec2} B
	 * @return {number} the manhattan distance between A and B
	 */
	static manhattanDistance(A, B) {
		/*
		return asm.manhattanDistance(A.x, A.y, B.x, B.y);
		/*/
		return Math.abs(B.x - A.x) + Math.abs(B.y - A.y);
		//*/
	}

	/**
	 * @static
	 * @param {Vec2} A
	 * @param {Vec2} B
	 * @return {number} the diagonal distance between A and B
	 */
	static diagonalDistance(A, B) {
		/*
		return asm.diagonalDistance(A.x, A.y, B.x, B.y);
		/*/
		return Math.max(Math.abs(B.x - A.x), Math.abs(B.y - A.y));
		//*/
	}

	/**
	 * @static
	 * @param {Vec2} A
	 * @param {Vec2} B
	 * @param {Vec2} C
	 * @return {boolean} true if AB and AC are in counter-clockwise order,
	 *         false otherwise
	 */
	static ccw(A, B, C) {
		/*
		return asm.ccw(A.x, A.y, B.x, B.y, C.x, C.y);
		/*/
		return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
		//*/
	}

	/**
	 * @static
	 * @param {Vec2} AB
	 * @param {Vec2} AC
	 * @return {boolean} true if AB and AC are in counter-clockwise order,
	 *         false otherwise
	 */
	static ccw2(AB, AC) {
		/*
		return asm.ccw2(AB.x, AB.y, AC.x, AC.y);
		/*/
		return AC.y * AB.x > AB.y * AC.x;
		//*/
	}

	/**
	 * @static
	 * @param {number} rad radians
	 * @param {number} [mag=1] magnitude
	 * @return {Vec2} (cos(rad)*mag, sin(rad)*mag)
	 */
	static createFromAngle(rad, mag = 1) {
		return new Vec2(Math.cos(rad) * mag, Math.sin(rad) * mag);
	}

	/**
	 * @static
	 * @param {number[]} xyxyArray - array of points coordinates ordered
	 *        like this : [x1, y1, x2, y2, x3, y3, ...].
	 * @return {Vec2[]} a Vec2 array : [(x1,y1), (x2,y2), (x3,y3), ...].
	 */
	static createVec2Array(xyxyArray) {
		const len = Math.floor(xyxyArray.length / 2), result = new Array(len);
		let i = len, i2;
		while (i--) {
			i2 = 2 * i;
			result[i] = new Vec2(xyxyArray[i2], xyxyArray[i2 + 1]);
		}
		return result;
	}

	/**
	 * @static
	 * @param {Vec2[]} vec2Array - the array of points to convert to the float array
	 * @returns {Float32Array} the array containing all x and y coordinates of the given points, in the form <!--
	 * -->[x1, y1, x2, y2, ... xn, yn]
	 */
	static createFloatArray(vec2Array) {
		const len = vec2Array.length, result = new Float32Array(len*2);
		let i = len, i2;
		while(i--) {
			i2 = i*2;
			result[i2  ] = vec2Array[i].x;
			result[i2+1] = vec2Array[i].y;
		}
		return result;
	}

	/**
	 * a new <code>{@link Vec2}</code> with <code>x = y = 0</code>
	 * @static
	 * @constant
	 * @readonly
	 * @type {Vec2}
	 */
	static get zero() {
		return new Vec2(0, 0);
	}
}
/**
 * (0,0).
 * @static
 * @constant
 * @memberOf Vec2
 * @type {Vec2}
 */
Vec2.ZERO = Vec2.zero;
//######################################################################################################################
//#                                                        Shape                                                       #
//######################################################################################################################
    /**
     * @class Shape
     * @abstract
     * @memberOf utils.geometry2d
     * @alias utils.geometry2d.Shape
     * @classdesc the base class of all shapes. has only one member : <!--
     * --><code>{@link Shape#center|center}</code>, the center of the shape, <!--
     * -->and plenty of useful methods with default behavior.
     */
    class Shape {
        /**
         * @constructor
         */
        constructor() { }

        /**
         * center of the shape
         * @name utils.geometry2d.Shape#center
         * @type {Vec2}
         */

        /**
         * perimeter of the instance.
         * @readonly
         * @type {number}
         */
        get perimeter() {
            return 0;
        }

        /**
         * area of the instance.
         * @readonly
         * @type {number}
         */
        get area() {
            return 0;
        }

        /**
         * returns a copy of the <code>{@link Shape#center|center}</code> attribute of the instance.
         * @returns {Vec2} a copy of the center
         */
        copyCenter() {
            return this.center.clone();
        }

        /**
         * sets the center's attributes to the same as the parameter's
         * @param {Vec2}center
         * @returns {Shape} <code>this</code>
         * @see {@link Shape#setCenterXY}
         */
        setCenter(center) {
            this.center.set(center);
            return this;
        }

        /**
         * sets the center's attributes to the parameters
         * @param {number} x
         * @param {number} y
         * @returns {Shape} <code>this</code>
         * @see {@link Shape#setCenter}
         */
        setCenterXY(x, y) {
            this.center.setXY(x, y);
            return this;
        }

        /**
         * makes the shape bigger by multiplying it's dimensions by the given factor
         * @param {number} factor - the number which will multiply the dimensions
         * @returns {Shape} <code>this</code>
         * @see {@link Shape#growDistance}
         */
        scale(factor) {
            return this;
        }

        /**
         * makes the shape bigger by adding to it's dimensions the given distance
         * @param {number} delta - the number to add to the dimensions
         * @returns {Shape} <code>this</code>
         * @see {@link Shape#scale}
         */
        growDistance(delta) {
            return this;
        }

        /**
         * rotates the shape by the given angle in radians.
         * @param {number} radians - angle.
         * @returns {Shape} <code>this</code>
         */
        rotate(radians) {
            return this;
        }

        /**
         * adds the instructions to draw this instance to the context.
         * @param {CanvasRenderingContext2D} context
         * @see {@link Shape#draw}
         */
        pushPath(context) {
        }

        /**
         * draw the shape on the canvas using its webgl context.
         * To fill the shape, the draw mode must de TRIANGLES.
         * you can acquire how many points will be added to the array or how many triangles will be drawned <!--
         * -->by using the attributes {@link Circle#glPointsNumber} and <!--
         * -->{@link Circle#glTriangles}
         * @param {Array} verticesArray array where the points x and y coordinates will be placed
         * @param {number} vOffset indice of the first free place in the array (must be even)
         * @param {Array} indicesArray array where the indices of the points <!--
         * -->for the triangles to be drawned will be placed
         * @param {number} iOffset indice of the first free place in indicesArray (should be a multiple of 3)
         */
        getVertices(verticesArray, vOffset, indicesArray, iOffset){

        }

        /**
         * draws the shape on the canvas
         * @param {CanvasRenderingContext2D} context
         * @param {boolean} [fill=false]
         * @param {boolean} [stroke=!fill]
         * @see {@link Shape#pushPath}
         */
        draw(context, fill = false, stroke = !fill) {
            context.beginPath();
            this.pushPath(context);
            fill && context.fill();
            stroke && context.stroke();
        }

        /**
         * returns whether or not the instance intersect (=collide) with the given shape.
         * @param {Shape} shape
         * @returns {boolean} true if the 2 shapes intersect.
         */
        intersect(shape) {
            return false;
        }

        /**
         * returns the intersection points with the given shape
         * @param {Shape} shape
         * @returns {Vec2[]}
         */
        getIntersectionPoints(shape) {
            return [];
        }

        /**
         * @param {Vec2} point
         * @returns {boolean} true if the point is located inside the shape.
         */
        contains(point) {
            return false;
        }

        /**
         * returns a {@link Rect|Rect} containing the entire shape.
         * @returns {Rect} the outside {@link Rect|Rect}
         */
        getRect() {
            return Rect.createFromPoint(this.center);
        }

        /**
         * returns the maximum distance to the <code>{@link Shape#center|center}</code> <!--
         * -->a point of the shape could have.
         * @returns {number} max distance to <code>{@link Shape#center|center}</code>
         */
        getRadius() {
            return 0;
        }

        /**
         * creates a <code>{@link Circle|Circle}</code> with the same center as the shape, <!--
         * -->and the radius returned by <code>{@link Shape#getRadius|getRadius}</code>.
         * @returns {Circle}
         */
        getCircle() {
            return new Circle(this.center, this.getRadius());
        }

        /**
         * returns the point corresponding to a certain percent of the instance's outline,
         * the start point depends on the shape.
         * @param {number} percent - percentage. must be in [0-1[.
         * @returns {Vec2} the corresponding point.
         */
        getPercentPoint(percent) {
            return this.center
        };

        /**
         * returns the closest point of the shape to the given point
         * @param {Vec2} p
         * @returns {Vec2} closest point of the shape.
         */
        closestPointTo(p) {
            return this.center;
        }

        /**
         * returns a copy of this shape.
         * @returns {Shape} the instance's copy
         */
        clone() {
            return new Shape();
        }

        /**
         * makes the shape the opposite of itself relative to the given horizontal axis
         * if no value is set for axisY, the mirror will be made relative to the center's y coordinate.
         * @param {number} [axisY=center.y]
         *          ordinate of the horizontal axis
         * @returns {Shape} <code>this</code>
         * @see {@link Shape#mirrorHorizontally}
         */
        mirrorVertically(axisY = this.center.y) {
            this.center.mirrorVertically(axisY);
            return this;
        }

        /**
         * makes the shape the opposite of itself relative to the given vertical axis
         * if no value is set for axisX, the mirror will be made relative to the center's x coordinate.
         * @param {number} [axisX=center.x]
         *          abscissa of the vertical axis
         * @returns {Shape} <code>this</code>
         * @see {@link Shape#mirrorVertically}
         */
        mirrorHorizontally(axisX = this.center.x) {
            this.center.mirrorHorizontally(axisX);
            return this;
        }

        /**
         * moves the shape according to the parameters
         * @param {number} dX
         * @param {number} dY
         * @returns {Shape} <code>this</code>
         * @see {@link Shape#move}
         */
        moveXY(dX, dY) {
            this.center.addXY(dX, dY);
            return this;
        }

        /**
         * moves the shape according to the parameter
         * @param {Vec2} delta
         * @returns {Shape}
         * @returns {Shape} <code>this</code>
         * @see {@link Shape#moveXY}
         */
        move(delta) {
            this.center.add(delta);
            return this;
        }
    }
    /**
     * number of points used to draw this shape.
     * @type {number}
     * @name Shape#glPointsNumber
     */
    Shape.prototype.glPointsNumber = 0;
    /**
     * number of triangles used to draw this shape.
     * @type {number}
     * @name Shape#glTriangles
     */
    Shape.prototype.glTriangles = 0;
//######################################################################################################################
//#                                                        Rect                                                        #
//######################################################################################################################
/**
 * @memberOf utils.geometry2d
 * @class Rect
 * @alias utils.geometry2d.Rect
 * @classdesc a class with four attributes : <code>{@link Rect#left|xMin}</code>, <!--
 * --><code>{@link Rect#top|yMin}</code>, <!--
 * --><code>{@link Rect#right|xMax}</code> and <!--
 * --><code>{@link Rect#bottom|yMax}</code>, used to represent a non-rotated rectangle.
 */
class Rect extends Shape{
	/** @constructor
	 * @param {number} xMin
	 * @param {number} yMin
	 * @param {number} xMax
	 * @param {number} yMax
	 */
	constructor(xMin, yMin, xMax, yMax) {
        super();
        /**
		 * @name Rect#xMin
		 * @type {number}
		 */
		this.xMin = xMin;
		/**
		 * @name Rect#yMin
		 * @type {number}
		 */
		this.yMin = yMin;
		/**
		 * @name Rect#xMax
		 * @type {number}
		 */
		this.xMax = xMax;
		/**
		 * @name Rect#yMax
		 * @type {number}
		 */
		this.yMax = yMax;
	}

	/**
	 * width (= xMax - yMin) of the instance.
	 * @type {number}
	 * @readonly
	 */
	get width() {
		return this.xMax - this.xMin;
	}

	/**
	 * height (= yMax - yMin) of the instance.
	 * @type {number}
	 * @readonly
	 */
	get height() {
		return this.yMax - this.yMin
	}

	/**
	 * dimensions ratio(= {@link Rect#width|width} / <!--
	 * -->{@link Rect#height|height}) of the instance.
	 * @type {number}
	 * @readonly
	 */
	get ratio() {
		return this.width / this.height;
	}

	/**
	 * perimeter (= {@link Rect#width|width}*2 + <!--
	 * -->{@link Rect#height|height}*2) of the instance.
	 * @type {number}
	 * @readonly
	 */
	get perimeter() {
		return (this.width + this.height) * 2;
	}

	/**
	 * area (= {@link Rect#width|width} * <!--
	 * -->{@link Rect#height|height}) of the instance.
	 * @type {number}
	 * @readonly
	 */
	get area() {
		return this.width * this.height;
	}

	/**
	 * center of the instance (computed). to modify it, use {@code rect.center = center}. When modified, keeps the dimensions.
	 * @type {Vec2}
	 */
	get center() {
		return new Vec2(this.xMin + this.xMax, this.yMin + this.yMax).mul(0.5);
	}

	/** @param {Vec2} center */
	set center(center) {
		this.setCenterXY(center.x, center.y);
		return center;
	}

	/**
	 * creates and returns a copy of the instance
	 * @returns {Rect}
	 */
	clone() {
		return new Rect(this.xMin, this.yMin, this.xMax, this.yMax);
	}

	copyCenter() {
		return this.center;
	}

	/**
	 * sets the center of the instance to the given point.
	 * @param {Vec2} center
	 * @returns {Rect} <code>this</code>.
	 * @see {@link Rect#setCenterXY(x,y)}
	 * @see {@link Rect#center}
	 */
	setCenter(center) {
		return this.setCenterXY(center.x, center.y);
	}

	/**
	 * sets the center to the given coordinates
	 * @param {number} x new x coordinate of the center
	 * @param {number} y new y coordinate of the center
	 * @returns {Rect} <code>this</code>.
	 * @see {@link Rect#setCenter}
	 * @see {@link Rect#center}
	 */
	setCenterXY(x, y) {
		let w = this.width / 2, h = this.height / 2;
		this.xMin = x - w;
		this.xMax = x + w;
		this.yMin = y - h;
		this.yMax = y + h;
		return this;
	}

	/**
	 * modifes the width and height and keep the center
	 * @param {number} scaleX
	 * @param {number} scaleY
	 * @returns {Rect} <code>this</code>.
	 */
	scale(scaleX, scaleY = scaleX) {
		let dw = this.width * (scaleX - 1) * 0.5, dh = this.height * (scaleY - 1) * 0.5;
		this.xMin -= dw;
		this.xMax += dw;
		this.yMin -= dh;
		this.yMax += dh;
		return this;
	}

    /**
     * makes the Rect bigger by making the corner further from the center by the given distance.
	 * The ratio width/height is preserved.
     * @param {number} delta - the number to add to the dimensions
     * @returns {Rect} <code>this</code>
     * @see {@link Rect#scale}
     */
	growDistance(delta)
	{
		let toCorner = new Vec2((this.xMax-this.xMin)/2, (this.yMax-this.yMin)/2).setMagnitude(delta);
		this.xMin -= toCorner.x;
		this.xMax += toCorner.x;
		this.yMin -= toCorner.y;
		this.yMax += toCorner.y;
	}

    /**
     * returns whether or not the instance intersect (=collide) with the given shape.
     * @param {Shape} shape
     * @returns {boolean} true if the 2 shapes intersect.
     */
    intersect(shape) {
    	return shape instanceof Rect ? (this.overlap(rect) && !this.containsRect(rect)) : shape.intersect(this);
    }

    /**
     * returns the intersection points with the given shape
     * @param {Shape} shape
     * @returns {Vec2[]}
     */
    getIntersectionPoints(shape) {
        if(shape instanceof Rect) {
        	let array = [];
        	let intersection = Rect.getIntersection([this, shape]);
        	let xSelf = (intersection.xMin == this.xMin);
			const ySelf1 = (intersection.yMin == shape.yMin),
				  ySelf2 = (intersection.yMax == shape.yMax);
        	if(xSelf == ySelf1) array.push(new Vec2(intersection.xMin, intersection.yMin));
			if(xSelf == ySelf2) array.push(new Vec2(intersection.xMin, intersection.yMax));
			xSelf = (intersection.xMax == this.xMax);
            if(xSelf == ySelf1) array.push(new Vec2(intersection.xMax, intersection.yMin));
            if(xSelf == ySelf2) array.push(new Vec2(intersection.xMax, intersection.yMax));
            return array;
        } else return shape.getIntersectionPoints(this);
    }

	/**
	 * @param {Rect} rect
	 * @returns {boolean} true if the instance the object is called from and the parameter have a common point
	 */
	overlap(rect) {
		return rect.xMin <= this.xMax && rect.yMin <= this.yMax
			&& rect.xMax >= this.xMin && rect.yMax >= this.yMin;
	}

	/**
	 * @param {number} x x coordinate of the point
	 * @param {number} y y coordinate of the point
	 * @returns {boolean} true if the point (x,y) is located inside the rectangle.
	 * @see {@link Rect#containsRect}
	 * @see {@link Rect#contains}
	 */
	containsXY(x, y) {
		return x >= this.xMin && x <= this.xMax && y >= this.yMin && y <= this.yMax;
	}

	/**
	 * @param {Rect} rect
	 * @returns {boolean} true if the given rect is completely inside the instance rect.
	 * @see {@link Rect#containsXY}
	 * @see {@link Rect#contains}
	 */
	containsRect(rect) {
		return rect.xMin >= this.xMin && rect.xMax <= this.xMax
			&& rect.yMin >= this.yMin && rect.yMax <= this.yMax;
	}

	/**
	 * @param {Vec2} p a point
	 * @returns {boolean} true if the point (p) is located inside the rectangle.
	 * @see {@link Rect#containsXY}
	 * @see {@link Rect#containsRect}
	 */
	contains(p) {
		return p.x >= this.xMin && p.x <= this.xMax && p.y >= this.yMin && p.y <= this.yMax;
	}

	/**
	 * @param {number} x
	 * @returns {boolean} <code>right &lt; x</code>
	 * @see {@link Rect#onLeftOfRect}
	 * @see {@link Rect#onLeftOf}
	 * @see {@link Rect#onRightOfX}
	 * @see {@link Rect#aboveY}
	 * @see {@link Rect#belowY}
	 */
	onLeftOfX(x) {
		return this.xMax < x;
	}

	/**
	 * @param {Rect} r
	 * @returns {boolean} <code>right &lt; r.xMin</code>
	 * @see {@link Rect#onLeftOfX}
	 * @see {@link Rect#onLeftOf}
	 * @see {@link Rect#onRightOfRect}
	 * @see {@link Rect#aboveRect}
	 * @see {@link Rect#belowRect}
	 */
	onLeftOfRect(r) {
		return this.xMax < r.xMin;
	}

	/**
	 * @param {Vec2} p
	 * @returns {boolean} <code>right &lt; p.x</code>
	 * @see {@link Rect#onLeftOfX}
	 * @see {@link Rect#onLeftOfRect}
	 * @see {@link Rect#onRightOf}
	 * @see {@link Rect#above}
	 * @see {@link Rect#below}
	 */
	onLeftOf(p) {
		return this.xMax < p.x;
	}

	/**
	 * @param {number} x
	 * @returns {boolean} <code>left &gt; x</code>
	 * @see {@link Rect#onRightOfRect}
	 * @see {@link Rect#onRightOf}
	 * @see {@link Rect#onLeftOfX}
	 * @see {@link Rect#aboveY}
	 * @see {@link Rect#belowY}
	 */
	onRightOfX(x) {
		return this.xMin > x;
	}

	/**
	 * @param {Rect} r
	 * @returns {boolean} <code>left &gt; r.xMax</code>
	 * @see {@link Rect#onRightOfX}
	 * @see {@link Rect#onRightOf}
	 * @see {@link Rect#onLeftOfRect}
	 * @see {@link Rect#aboveRect}
	 * @see {@link Rect#belowRect}
	 */
	onRightOfRect(r) {
		return this.xMin > r.xMax;
	}

	/**
	 * @param {Vec2} p
	 * @returns {boolean} <code>left &gt; p.x</code>
	 * @see {@link Rect#onRightOfX}
	 * @see {@link Rect#onRightOfRect}
	 * @see {@link Rect#onLeftOf}
	 * @see {@link Rect#above}
	 * @see {@link Rect#below}
	 */
	onRightOf(p) {
		return this.xMin > p.x;
	}

	/**
	 * @param {number} y
	 * @returns {boolean} <code>bottom &lt; y</code>
	 * @see {@link Rect#aboveRect}
	 * @see {@link Rect#above}
	 * @see {@link Rect#onLeftOfX}
	 * @see {@link Rect#onRightOfX}
	 * @see {@link Rect#belowY}
	 */
	aboveY(y) {
		return this.yMax < y;
	}

	/**
	 * @param {Rect} r
	 * @returns {boolean} <code>bottom &lt; r.yMin</code>
	 * @see {@link Rect#aboveY}
	 * @see {@link Rect#above}
	 * @see {@link Rect#onLeftOfRect}
	 * @see {@link Rect#onRightOfRect}
	 * @see {@link Rect#belowRect}
	 */
	aboveRect(r) {
		return this.yMax < r.yMin;
	}

	/**
	 * @param {Vec2} p
	 * @returns {boolean} <code>bottom &lt; y</code>
	 * @see {@link Rect#aboveY}
	 * @see {@link Rect#aboveRect}
	 * @see {@link Rect#onLeftOf}
	 * @see {@link Rect#onRightOf}
	 * @see {@link Rect#below}
	 */
	above(p) {
		return this.yMax < p.y;
	}

	/**
	 * @param {number} y
	 * @returns {boolean} <code>top &gt; y</code>
	 * @see {@link Rect#belowRect}
	 * @see {@link Rect#below}
	 * @see {@link Rect#onLeftOfX}
	 * @see {@link Rect#onRightOfX}
	 * @see {@link Rect#aboveY}
	 */
	belowY(y) {
		return this.yMin > y;
	}

	/**
	 * @param {Rect} r
	 * @returns {boolean} <code>top &gt; r.yMax</code>
	 * @see {@link Rect#belowY}
	 * @see {@link Rect#below}
	 * @see {@link Rect#onLeftOfRect}
	 * @see {@link Rect#onRightOfRect}
	 * @see {@link Rect#aboveRect}
	 */
	belowRect(r) {
		return this.yMin > r.yMax;
	}

	/**
	 * @param {Vec2} p
	 * @returns {boolean} <code>top &gt; y</code>
	 * @see {@link Rect#belowY}
	 * @see {@link Rect#belowRect}
	 * @see {@link Rect#onLeftOf}
	 * @see {@link Rect#onRightOf}
	 * @see {@link Rect#above}
	 */
	below(p) {
		return this.yMin > p.y;
	}

	/**
	 * makes the instance bigger by adding the margin to it's dimensions.
	 * keeps the center at the same position.
	 * <code>left -= margin; right += margin
	 * top -= margin; bottom += margin</code>
	 * @param {number} margin
	 * @returns {Rect} <code>this</code>
	 * @see {@link Rect#addMarginsXY}
	 * @see {@link Rect#addMargins}
	 */
	addMargin(margin) {
		this.xMin -= margin;
		this.xMax += margin;
		this.yMin -= margin;
		this.yMax += margin;
		return this;
	}

	/**
	 * makes the instance bigger by adding the margins to it's dimensions.
	 * keeps the center at the same position.
	 * <code>left -= marginX; right += marginX
	 * top -= marginY; bottom += marginY</code>
	 * @param {number} marginX
	 * @param {number} marginY
	 * @returns {Rect} <code>this</code>
	 * @see {@link Rect#addMargin}
	 * @see {@link Rect#addMargins}
	 */
	addMarginsXY(marginX, marginY) {
		this.xMin -= marginX;
		this.xMax += marginX;
		this.yMin -= marginY;
		this.yMax += marginY;
		return this;
	}

	/**
	 * makes the instance bigger by adding the margins to it's dimensions.
	 * keeps the center at the same position.
	 * <code>left -= marginLeft; right += marginRight
	 * top -= marginTop; bottom += marginBottom</code>
	 * @param {number} marginLeft
	 * @param {number} marginTop
	 * @param {number} marginRight
	 * @param {number} marginBottom
	 * @returns {Rect} <code>this</code>
	 * @see {@link Rect#addMargin}
	 * @see {@link Rect#addMarginsXY}
	 */
	addMargins(marginLeft, marginTop, marginRight, marginBottom) {
		this.xMin -= marginLeft;
		this.xMax += marginRight;
		this.yMin -= marginTop;
		this.yMax += marginBottom;
		return this;
	}

	/**
	 * adds the drawing instructions for this instance to the context.
	 * @param {CanvasRenderingContext2D} context
	 * @see {@link Rect#draw}
	 */
	pushPath(context) {
		context.rect(this.xMin, this.yMin, this.width, this.height);
	}

	/**
	 * draws the rect on the canvas
	 * @param {CanvasRenderingContext2D} context
	 * @param {boolean} [fill=false]
	 * @param {boolean} [stroke=!fill]
	 * @see {@link Rect#pushPath}
	 */
	draw(context, fill = false, stroke = !fill) {
		context.beginPath();
		context.rect(this.xMin, this.yMin, this.width, this.height);
		fill && context.fill();
		stroke && context.stroke();
	}

	/**
	 * draw the shape on the canvas using its webgl context.
	 * To fill the shape, the draw mode must de TRIANGLES.
	 * you can acquire how many points will be added to the array or how many triangles will be drawned <!--
	 * -->by using the attributes {@link Rect#glPointsNumber} and <!--
	 * -->{@link Rect#glTriangles}
	 * @param {Array} verticesArray array where the points x and y coordinates will be placed
	 * @param {number} vOffset indice of the first free place in the array (must be even)
	 * @param {Array} indicesArray array where the indices of the points <!--
	 * -->for the triangles to be drawned will be placed
	 * @param {number} iOffset indice of the first free place in indicesArray (should be a multiple of 3)
	 */
	getVertices(verticesArray, vOffset, indicesArray, iOffset){
		const n = offset/2;
		float32Array[offset++] = this.xMin; //top-left corner
		float32Array[offset++] = this.yMin;
		float32Array[offset++] = this.xMin; //bot-left corner
		float32Array[offset++] = this.yMax;
		float32Array[offset++] = this.xMax; //top-right corner
		float32Array[offset++] = this.yMin;
		float32Array[offset++] = this.xMax; //bot-right corner
		float32Array[offset++] = this.yMax;
		indicesArray[iOffset++] = n;
		indicesArray[iOffset++] = n+1;
		indicesArray[iOffset++] = n+2;
		indicesArray[iOffset++] = n+2;
		indicesArray[iOffset++] = n+1;
		indicesArray[iOffset++] = n+3;
	}

	/**
	 * sets the attributes' values of the instance to the attributes' values of the parameter
	 * @param {Rect} rect
	 * @returns {Rect} <code>this</code>
	 * @see {@link Rect#set}
	 */
	setRect(rect) {
		this.xMin = rect.xMin;
		this.xMax = rect.xMax;
		this.yMin = rect.yMin;
		this.yMax = rect.yMax;
		return this;
	}

	/**
	 * sets the attributes' values to the parameters
	 * @param {number} left
	 * @param {number} top
	 * @param {number} right
	 * @param {number} bottom
	 * @returns {Rect} <code>this</code>
	 * @see {@link Rect#setRect}
	 */
	set(left, top, right, bottom) {
		this.yMin = top;
		this.xMin = left;
		this.xMax = right;
		this.yMax = bottom;
		return this;
	}

	/**
	 * moves the instance according to the given x and y values :
	 * <code>left += x; right += x;
	 * top += y; bottom += y;</code>
	 * @param {number} x
	 * @param {number} y
	 * @returns {Rect} <code>this</code>
	 * @see {@link Rect#move}
	 */
	moveXY(x, y) {
		this.xMin += x;
		this.xMax += x;
		this.yMin += y;
		this.yMax += y;
		return this;
	}

	/**
	 * moves the instance according to the given parameter's attributes :
	 * <code>left += delta.x; right += delta.x;
	 * top += delta.y; bottom += delta.y;</code>
	 * @param {Vec2} delta
	 * @returns {Rect} <code>this</code>
	 * @see {@link Rect#moveXY}
	 */
	move(delta) {
		this.xMin += delta.x;
		this.xMax += delta.x;
		this.yMin += delta.y;
		this.yMax += delta.y;
		return this;
	}

	/**
	 * returns the point corresponding to a certain percent of the instance's outline,
	 * starting at the top left corner.
	 * For example, getPercentPoint(0.5) will return the bottom-right corner.
	 * @param {number} percent - percentage. must be in [0-1[.
	 * @returns {Vec2} the corresponding point.
	 */
	getPercentPoint(percent) {
		if ((percent %= 1) < 0.25) return new Vec2(this.xMin + percent * 4 * this.width, this.yMin);
		if (percent < 0.5) return new Vec2(this.xMax, this.yMin + (percent * 4 - 1) * this.height);
		if (percent < 0.75) return new Vec2(this.xMax - (percent * 4 - 2) * this.width, this.yMax);
		return new Vec2(this.xMin, this.yMax - (percent * 4 - 3) * this.height);
	}

	closestPointTo(point) {
		const p = new Vec2(point.x < this.xMin ? this.xMin : point.x > this.xMax ? this.xMax : point.x,
								point.y > this.yMax ? this.yMax : point.y < this.yMin ? this.yMin : point.y);
		if(p.x > this.xMin && p.x < this.xMax && p.y > this.yMin && p.y < this.yMax) {
			const dx = (p.x - this.xMin) < (this.xMax - p.x) ? (this.xMin - p.x) : (this.xMax - p.x);
			const dy = (p.y - this.yMin) < (this.yMax - p.y) ? (this.yMin - p.y) : (this.yMax - p.y);
			if(Math.abs(dx) < Math.abs(dy)) p.addXY(dx, 0);
			else p.addXY(0, dy);
		}
		return p;
	}

    /**
     * creates a rectangular {@link Polygon} corresponding to the instance
     * @returns {Polygon}
     */
	toPolygon()
	{
        return Polygon.Absolute(Vec2.createVec2Array([this.xMin, this.yMin, this.xMax, this.yMin,
            this.xMax, this.yMax, this.xMin, this.yMax]));
	}
	/**
	 * creates a rectangular {@link Polygon} corresponding to the instance
	 * @returns {Polygon}
     * @deprecated
	 */
	getShape() {
		const error = new Error("Rect.getShape() is deprecated. use Rect.toPolygon() instead. The result is the same.")
		console.error(error.message + "\n" + error.stack);
		return this.toPolygon();
	}

    /**
	 * copy the instance. Implemented for compatibility with the parent Shape class
     * @returns {utils.geometry2d.Rect}
     */
	getRect()
	{
		return this.clone();
	}

	/**
     * returns the maximum distance to the <code>{@link Shape#center|center}</code> <!--
     * -->a point of the shape could have.
     * @returns {number} max distance to <code>{@link Shape#center|center}</code>
     */
	getRadius()
	{
		return Math.sqrt(Math.pow(this.xMax-this.xMin, 2)+Math.pow(this.yMax-this.yMin, 2))/2;
	}
	/**
     * creates a <code>{@link Circle|Circle}</code> with the same center as the shape, <!--
     * -->and the radius returned by <code>{@link Shape#getRadius|getRadius}</code>.
     * @returns {Circle}
     */
	getCircle()
	{
		let dX = (this.xMax-this.xMin)/2, dY = (this.yMax - this.yMin)/2;
		return new Circle(new Vec2(this.xMin+dX, this.yMin+dY), Math.sqrt(dX*dX+dY*dY));
	}
    /**
     * makes the shape the opposite of itself relative to the given horizontal axis
     * if no value is set for axisY, the mirror will be made relative to the center's y coordinate.
     * @param {number} [axisY=center.y]
     *          ordinate of the horizontal axis
     * @returns {Shape} <code>this</code>
     * @see {@link Shape#mirrorHorizontally}
     */
    mirrorVertically(axisY = (this.yMax+this.yMin)/2) {
        const yMax = this.yMin + (axisY - this.yMin);
        this.yMin = this.yMax + (axisY - this.yMax);
        this.yMax = yMax;
        return this;
    }

    /**
     * makes the shape the opposite of itself relative to the given vertical axis
     * if no value is set for axisX, the mirror will be made relative to the center's x coordinate.
     * @param {number} [axisX=center.x]
     *          abscissa of the vertical axis
     * @returns {Shape} <code>this</code>
     * @see {@link Shape#mirrorVertically}
     */
    mirrorHorizontally(axisX = (this.xMax+this.xMin)/2) {
        const xMax = this.xMin + (axisx - this.xMin);
        this.xMin = this.xMax + (axisX - this.xMax);
        this.xMax = xMax;
        return this;
    }
	/**
	 * returns a string representing the instance.
	 * @returns {string} [left, top, right, bottom]
	 */
	toString() {
		return ['[', this.xMin, ', ', this.yMin, ', ', this.xMax, ', ', this.yMax, ']'].join('');
	}

	/**
	 * returns the union of the given rectangles, i.e. the rectangle formed by
	 * the minimum left and top, and the maximum right and bottom of all rects.
	 * If the given array is empty, returns <code>null</code>.
	 * @static
	 * @param {Rect[]} rects
	 * @returns {?Rect} union of the rectangles,
	 *        or null if no rectangles were passed as arguments
	 */
	static getUnion(rects) {
		let i = rects.length;
		if (i) {
			let res = rects[--i].clone();
			while (i--) {
				res.xMin = Math.min(res.xMin, rects[i].xMin);
				res.xMax = Math.max(res.xMax, rects[i].xMax);
				res.yMin = Math.min(res.yMin, rects[i].yMin);
				res.yMax = Math.max(res.yMax, rects[i].yMax);
			}
			return res;
		}
		else return null;
	}

	/**
	 * returns the intersection of the given rectangles, i.e. the rectangle formed by
	 * the maximum xMin and yMin, and the minimum xMax and yMax of all rects.
	 * if the max xMin(resp. yMin) happen to be higher than the minimum xMax(resp. yMax),
	 * or if the given array is null, this function returns <code>null</code>.
	 * @static
	 * @param {Rect[]} rects
	 * @returns {?Rect} intersection of the rects, or null.
	 */
	static getIntersection(rects) {
		let i = rects.length;
		if (i) {
			let r = rects[0], maxLeft = r.xMin, maxTop = r.yMin, minRight = r.xMax, minBottom = r.yMax;
			while (--i) {
				r = rects[i];
				if (r.yMin > maxTop) maxTop = r.yMin;
				if (r.xMin > maxLeft) maxLeft = r.xMin;
				if (r.xMax < minRight) minRight = r.xMax;
				if (r.yMax < minBottom) minBottom = r.yMax;
			}
			if (maxLeft <= minRight && maxTop <= minBottom) return new Rect(maxLeft, maxTop, minRight, minBottom);
		}
		return null;
	}

	/**
	 * create a {@link Rect|Rect} where the <code>xMin</code> and <code>xMax</code> <!--
	 * -->components are equal to the x coordinate <!--
	 * -->and the <code>yMin</code> and <code>yMax</code> components to the y coordinate of the given point.
	 * @static
	 * @param {Vec2} p - the point to build the rectangle around
	 * @returns {Rect} the newly created {@link Rect|Rect}
	 * @see {@link Rect#createFromXY}
	 */
	static createFromPoint(p) {
		return new Rect(p.x, p.y, p.x, p.y);
	}

	/**
	 * create a {@link Rect|Rect} where the <code>left</code> and <code>right</code> <!--
	 * -->components are equal to the x parameter <!--
	 * -->and the <code>top</code> and <code>bottom</code> components to the y parameter.
	 * @static
	 * @param x the value of the <code>left</code> and <code>right</code> components of the new
	 *            {@link Rect|Rect}.
	 * @param y the value of the <code>top</code> and <code>bottom</code> components of the new
	 *            {@link Rect|Rect}.
	 * @returns {Rect} the newly created {@link Rect|Rect}
	 */
	static createFromXY(x, y) {
		return new Rect(x, y, x, y);
	}

	/**
	 * create a {@link Rect|Rect} where :
	 * <code>left = min(array[].x)</code>
	 * <code>top = min(array[].y)</code>
	 * <code>right = max(array[].x)</code>
	 * <code>bottom = max(array[].y)</code>.
	 * If the given array is empty, this function returns null.
	 * @static
	 * @param {Vec2[]} array - a points array
	 * @returns {Rect} the newly created {@link Rect|Rect},
	 *        or null if no points were given
	 */
	static createFromPoints(array) {
		let i = array.length;
		if (i) {
			let minX = array[0].x, maxX = minX, minY = array[0].y, maxY = minY, p;
			while (--i) {
				p = array[i];
				if (p.x < minX) minX = p.x; else if (p.x > maxX) maxX = p.x;
				if (p.y < minY) minY = p.y; else if (p.y > maxY) maxY = p.y;
			}
			return new Rect(minX, minY, maxX, maxY);
		}
	}

	/**
	 * creates a {@link Rect|Rect} with the specified center, width and height.
	 * @static
	 * @param {Vec2} center
	 * @param {number} width
	 * @param {number} height
	 * @returns {Rect}
	 */
	static createFromCenterWidthHeight(center, width, height = width) {
		return Rect.createFromPoint(center).addMarginsXY(width / 2, height / 2);
	}
}
/**
 * number of points used to draw this shape.
 * @type {number}
 * @name Rect#glPointsNumber
 */
Rect.prototype.glPointsNumber = 4;
/**
 * number of triangles used to draw this shape.
 * @type {number}
 * @name Rect#glTriangles
 */
Rect.prototype.glTriangles = 2;
//######################################################################################################################
//#                                                       Circle                                                       #
//######################################################################################################################
/**
 * @class Circle
 * @augments Shape
 * @memberOf utils.geometry2d
 * @alias utils.geometry2d.Circle
 * @classdesc a shape representing a circle. Adds one member to the one present in <!--
 * --><code>{@link Shape|Shape}</code> : <!--
 * --><code>{@link Circle#radius|radius}</code>, <!--
 * -->the radius of the circle.
 */
class Circle extends Shape {
	/**
	 * @constructor
	 * @param {Vec2} center
	 * @param {number} radius
	 */
	constructor(center, radius) {
		super();
		/**
		 * @name Circle#center
		 * the circle's center
		 * @type {Vec2}
		 */
		this.center = center.clone();
		/**
		 * @name Circle#radius
		 * @type {number}
		 */
		this.radius = radius;
	}

	/**
	 * perimeter of the circle : <code>2 \* &pi; \* {@link Circle#radius|radius}</code>
	 * @type {number}
	 */
	get perimeter() {
		return PI2 * this.radius;
	}

	/**
	 * area of the circle : <code>&pi; \* {@link Circle#radius|radius}<sup>2</sup></code>
	 * @type {number}
	 */
	get area() {
		return Math.pow(this.radius, 2) * Math.PI;
	}
	/**
	 * returns a copy of the <code>{@link Shape#center|center}</code> attribute of the instance.
	 * @returns {Vec2} a copy of the center
	 */
	copyCenter() {
		return this.center.clone();
	}

	/**
	 * sets the center's attributes to the same as the parameter's
	 * @param {Vec2}center
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#setCenterXY}
	 */
	setCenter(center) {
		this.center.set(center);
		return this;
	}

	/**
	 * sets the center's attributes to the parameters
	 * @param {number} x
	 * @param {number} y
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#setCenter}
	 */
	setCenterXY(x, y) {
		this.center.setXY(x, y);
		return this;
	}
	/**
	 * makes the shape the opposite of itself relative to the given horizontal axis
	 * if no value is set for axisY, the mirror will be made relative to the center's y coordinate.
	 * @param {number} [axisY=center.y]
	 *          ordinate of the horizontal axis
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#mirrorHorizontally}
	 */
	mirrorVertically(axisY = this.center.y) {
		this.center.mirrorVertically(axisY);
		return this;
	}

	/**
	 * makes the shape the opposite of itself relative to the given vertical axis
	 * if no value is set for axisX, the mirror will be made relative to the center's x coordinate.
	 * @param {number} [axisX=center.x]
	 *          abscissa of the vertical axis
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#mirrorVertically}
	 */
	mirrorHorizontally(axisX = this.center.x) {
		this.center.mirrorHorizontally(axisX);
		return this;
	}

	/**
	 * moves the shape according to the parameters
	 * @param {number} dX
	 * @param {number} dY
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#move}
	 */
	moveXY(dX, dY) {
		this.center.addXY(dX, dY);
		return this;
	}

	/**
	 * moves the shape according to the parameter
	 * @param {Vec2} delta
	 * @returns {Shape}
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#moveXY}
	 */
	move(delta) {
		this.center.add(delta);
		return this;
	}

	/**
	 * @description multiplies the radius by the argument.
	 * @param {number} factor
	 * @returns {Circle} <code>this</code>
	 * @see [superclass method]{@link Shape#scale}
	 * @see {@link Circle#growDistance}
	 */
	scale(factor) {
		this.radius *= factor;
		return this;
	}

	/**
	 * adds the argument to the radius.
	 * @param {number} delta
	 * @returns {Circle} <code>this</code>
	 * @see [superclass method]{@link Shape#growDistance}
	 * @see {@link Circle#scale}
	 */
	growDistance(delta) {
		this.radius += delta;
		return this;
	}

	/**
	 * returns the point of the circle, relative to its center, corresponding to the given radians.
	 * @param {number} radians
	 * @returns {Vec2}
	 * @see {@link Circle#pointForAngle}
	 */
	relativePointForAngle(radians) {
		return Vec2.createFromAngle(radians, this.radius);
	}

	/**
	 * returns the point of the circle, in absolute coordinates, corresponding to the given radians.
	 * @param {number} radians
	 * @returns {Vec2}
	 * @see {@link Circle#relativePointForAngle}
	 */
	pointForAngle(radians) {
		return Vec2.createFromAngle(radians, this.radius).add(this.center);
	}

	/**@inheritDoc*/
	pushPath(context) {
		context.arc(this.center.x, this.center.y, this.radius, 0, PI2, false);
	}
	/**
	 * draws the shape on the canvas
	 * @param {CanvasRenderingContext2D} context
	 * @param {boolean} [fill=false]
	 * @param {boolean} [stroke=!fill]
	 * @see {@link Shape#pushPath}
	 */
	draw(context, fill = false, stroke = !fill) {
		context.beginPath();
		context.arc(this.center.x, this.center.y, this.radius, 0, PI2, false);
		fill && context.fill();
		stroke && context.stroke();
	}

	/**
	 * draw the shape on the canvas using its webgl context.
	 * To fill the shape, the draw mode must de TRIANGLES.
	 * you can acquire how many points will be added to the array or how many triangles will be drawned <!--
	 * -->by using the attributes {@link Circle#glPointsNumber} and <!--
	 * -->{@link Circle#glTriangles}
	 * @param {Array} verticesArray array where the points x and y coordinates will be placed
	 * @param {number} vOffset indice of the first free place in the array (must be even)
	 * @param {Array} indicesArray array where the indices of the points <!--
	 * -->for the triangles to be drawned will be placed
	 * @param {number} iOffset indice of the first free place in indicesArray (should be a multiple of 3)
	 */
	getVertices(verticesArray, vOffset, indicesArray, iOffset){
		const o = vOffset/2;
		let n = this.glPointsNumber, dA = PI2/n, a = -dA, i = -1, t;
		while(++i < n) {
			verticesArray[vOffset++] = (t = Vec2.createFromAngle(a += dA, this.radius)).x;
			verticesArray[vOffset++] = t.y;
			if(i > 1) {
				indicesArray[iOffset++] = o; //first point
				indicesArray[iOffset++] = o+i-1; //previous point
				indicesArray[iOffset++] = o+i; //current point
			}
		}
	}
	/**
	 * number of points used to draw this shape.
	 * @type {number}
	 * @name Circle#glPointsNumber
	 */
	get glTriangles() {
		return this.glPointsNumber-2;
	}

	/**
	 * returns whether or not this circle instance intersect the specified shape.
	 * This function only does the job for {@link Circle} instances. <!--
	 * -->For the instances of other classes,
	 * this function calls their method : <code>shape.intersect(this)</code>
	 * @param {Shape} shape
	 * @returns {boolean}
	 */
	intersect(shape) {
		if (shape instanceof Rect) {
			// TODO optimiser
			return shape.toPolygon().intersect(this);
		}
		else if (shape instanceof Circle) {
			/*
			return !!(asm.circlesIntersect(this.center.x, this.center.y, this.radius,
								shape.center.x, shape.center.y, shape.radius));
			/*/
			let d = Vec2.distance(this.center, shape.center);
			return d <= this.radius + shape.radius &&
				this.radius <= d + shape.radius && // the other circle is not inside this circle
				shape.radius <= d + this.radius; // this circle is not inside the other circle
			//*/
		}
		else return shape.intersect(this);
	}

	/**
	 * returns the intersection points between this circle and the given shape
	 * @param {Shape} shape
	 * @returns {Vec2[]}
	 */
	getIntersectionPoints(shape) {
		if(shape instanceof Rect) {
			//TODO optimiser
			return shape.toPolygon().getIntersectionPoints(this);
		}
		else if(shape instanceof Circle) {
			let trans = Vec2.translation(this.center, shape.center),
				d2 = trans.squareMagnitude,
				da = Math.acos(d2-shape.radius*shape.radius+this.radius*this.radius)/(2*Math.sqrt(d2)*this.radius),
				a = trans.angle;
			return [Vec2.createFromAngle(a + da, this.radius), Vec2.createFromAngle(a-da, this.radius)];
		}
		else return shape.getIntersectionPoints(this);
	}

	/**@inheritDoc*/
	contains(point) {
		return Vec2.distance(this.center, point) <= this.radius;
	}

	/**@inheritDoc*/
	getRect() {
		return Rect.createFromXY(this.center.x, this.center.y).addMargin(this.radius);
	}

	/**@inheritDoc*/
	getPercentPoint(percent) {
		return this.pointForAngle(percent * PI2);
	}

	/**@inheritDoc*/
	closestPointTo(p) {
		return Vec2.translation(this.center, p).setMagnitude(this.radius);
	}

	/**
	 * @returns {number} the value of the {@link Circle#radius{radius} attribute
	 */
	getRadius() {
		return this.radius;
	}

	/**
	 * creates a copy of the circle. Does the same as {@link Circle#clone}
	 * @returns {Circle}
	 * @see [superclass method]{@link Shape#getCircle}
	 */
	getCircle() {
		return new Circle(this.center, this.radius);
	}

	/**
	 * creates a copy of the circle. Does the same as {@link Circle#getCircle}
	 * @returns {Circle}
	 * @see [superclass method]{@link Shape#clone}
	 */
	clone() {
		return new Circle(this.center, this.radius);
	}

	/**
	 * creates and returns an equivalent polygon.
	 * @param {number} edges - number of edges you want your polygon to have
	 * @param {number} startRadians
	 * @returns {Polygon} the equivalent polygon
	 */
	toPolygon(edges, startRadians = 0) {
		return Polygon.Regular(this.center, [this.radius], edges, startRadians);
	}
}
/**
 * number of points used to draw this shape.
 * @type {number}
 * @name Circle#glPointsNumber
 */
Circle.prototype.glPointsNumber = 16;
//######################################################################################################################
//#                                                      Ellipsoid                                                     #
//######################################################################################################################
/**
 * @class Ellipsoid
 * @augments Shape
 * @memberOf utils.geometry2d
 * @alias utils.geometry2d.Ellipsoid
 * @classdesc a shape representing an ellipsoid, optimized for drawing. make sure to always have <!--
 * -->{@link Ellipsoid#radiusX|radiusX} &ge; <!--
 * -->{@link Ellipsoid#radiusX|radiusX} for the methods to work properly.
 * You can reorder radiusX and radiusY by calling the {@Ellipsoid#checkRadius|checkRadius} <!--
 * -->method.
 * <b>&#x26A0;</b> ellipsoids cannot be used for collision detection, and most of their methods take time. <!--
 * -->You can make an ellipsoid-like {@link Polygon|Polygon} by calling the method <!--
 * -->{@link Ellipsoid#toPolygon|toPolygon}, or directly by calling the static method <!--
 * -->[Polygon.createEllipsoid]{@link Polygon#createEllipsoid}.
 */
class Ellipsoid extends Shape {
	/**
	 * @constructor
	 * @param {Vec2}center
	 * @param {number} radiusX
	 * @param {number} radiusY
	 * @param {number} radians
	 */
	constructor(center, radiusX, radiusY, radians = 0) {
		super();
		/**
		 * center of the ellipsoid
		 * @name Ellipsoid#center
		 * @type {Vec2}
		 */
		this.center = center.clone();
		/**
		 * horizontal radius
		 * @name Ellipsoid#radiusX
		 * @type {number}
		 */
		this.radiusX = radiusX;
		/**
		 * vertical radius;
		 * @name Ellipsoid#radiusY
		 * @type {number}
		 */
		this.radiusY = radiusY;
		/**
		 * @name Ellipsoid#angle
		 * @type {number}
		 */
		this.angle = radians;
	}

	/**
	 * square of the focus distance : <code>{@link Ellipsoid#radiusX|radiusX}<sup>2</sup> <!--
	 * -->- {@link Ellipsoid#radiusY|radiusY}<sup>2</sup></code>
	 * @type {number}
	 * @readonly
	 */
	get squareFocusDistance() {
		return this.radiusX * this.radiusX - this.radiusY * this.radiusY;
	}

	/**
	 * focus distance : <code>&radic;({@link Ellipsoid#radiusX|radiusX}<sup>2</sup> <!--
	 * -->- {@link Ellipsoid#radiusY|radiusY}<sup>2</sup>)</code>
	 * @type {number}
	 * @readonly
	 */
	get focusDistance() {
		return Math.sqrt(this.squareFocusDistance);
	}

	/**
	 * excentricity = <code>([focus distance]{@link Ellipsoid#focusDistance|focusDistance}) <!--
	 * -->/ ([horizontal radius]{@link Ellipsoid#radiusX})</code>
	 * @type {number}
	 */
	get excentricity() {
		return this.focusDistance / this.radiusX;
	}

	/**
	 * approximation of the perimeter of the ellipsoid : <code>&pi; \* &radic;(2 \* <!--
	 * -->({@link Ellipsoid#radiusX|radiusX}<sup>2</sup> <!--
	 * -->+ {@link Ellipsoid#radiusY|radiusY}<sup>2</sup>))</code>
	 * @type {number}
	 */
	get perimeter() {
		return Math.PI * Math.sqrt(2 * this.squareFocusDistance);
	}

	/**
	 * area of the ellipsoid : <code>{@link Ellipsoid#radiusX|radiusX} <!--
	 * -->\* {@link Ellipsoid#radiusY|radiusY} \* &pi;</code>
	 * @type {number}
	 */
	get area() {
		return this.radiusX * this.radiusY * Math.PI;
	}

	/**
	 * returns a copy of the <code>{@link Shape#center|center}</code> attribute of the instance.
	 * @returns {Vec2} a copy of the center
	 */
	copyCenter() {
		return this.center.clone();
	}

	/**
	 * sets the center's attributes to the same as the parameter's
	 * @param {Vec2}center
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#setCenterXY}
	 */
	setCenter(center) {
		this.center.set(center);
		return this;
	}

	/**
	 * sets the center's attributes to the parameters
	 * @param {number} x
	 * @param {number} y
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#setCenter}
	 */
	setCenterXY(x, y) {
		this.center.setXY(x, y);
		return this;
	}

	/**
	 * makes the ellipsoid the opposite of itself relative to the given vertical axis
	 * if no value is set for axisX, the mirror will be made relative to the center's x coordinate.
	 * @param {number} [axisX=center.x]
	 *          abscissa of the vertical axis
	 * @returns {Shape} <code>this</code>
	 */
	mirrorHorizontally(axisX = this.center.x) {
		this.radians = -this.radians;
		this.center.mirrorHorizontally(axisX);
		return this;
	}

	/**
	 * makes the ellipsoid the opposite of itself relative to the given horizontal axis
	 * if no value is set for axisY, the mirror will be made relative to the center's y coordinate.
	 * @param {number} [axisY=center.y]
	 *          ordinate of the vertical axis
	 * @returns {Shape} <code>this</code>
	 */
	mirrorVertically(axisY = this.center.y) {
		this.radians = -this.radians;
		this.center.mirrorVertically(axisY);
		return this;
	}

	/**
	 * moves the shape according to the parameters
	 * @param {number} dX
	 * @param {number} dY
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#move}
	 */
	moveXY(dX, dY) {
		this.center.addXY(dX, dY);
		return this;
	}

	/**
	 * moves the shape according to the parameter
	 * @param {Vec2} delta
	 * @returns {Shape}
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#moveXY}
	 */
	move(delta) {
		this.center.add(delta);
		return this;
	}

	/**
	 * multiplies the vertical and horizontal radius by the given factor.
	 * @param {number} factor
	 * @returns {Ellipsoid} <code>this</code>
	 */
	scale(factor) {
		this.radiusX *= factor;
		this.radiusY *= factor;
		return this;
	}

	/**
	 * adds the argument to the vertical and horizontal radius.
	 * @param {number} delta
	 * @returns {Ellipsoid} <code>this</code>
	 */
	growDistance(delta) {
		this.radiusX += delta;
		this.radiusY += delta;
		return this;
	}

	/**
	 * rotate the ellipsoid by the specified angle, in radians
	 * @param {number} radians
	 * @returns {Ellipsoid} <code>this</code>
	 */
	rotate(radians) {
		this.radians += radians;
		return this;
	}

	/**
	 * sets the {@link Ellipsoid#radians|radians} attribute to the specified value.
	 * @param {number} radians
	 * @returns {Ellipsoid} <code>this</code>
	 */
	setAngle(radians) {
		this.radians = radians;
		return this;
	}

	/**
	 * checks if the horizontal radius is the same as the vertical radius. if they're not, they are inverted, <!--
	 * -->and the ellipsoid rotated anticlockwise for it to look the same.
	 * @returns {Ellipsoid} <code>this</code>
	 */
	checkRadius() {
		if (this.radiusX < this.radiusY) {
			[this.radiusX, this.radiusY] = [this.radiusY, this.radiusX];
			this.setAngle(this.radians + PI_2);
		}
		return this;
	}

	/**
	 * returns the point of the ellipsoid, relative to its center, corresponding to the given radians.
	 * @param {number} radians
	 * @returns {Vec2}
	 * @see {@link Ellipsoid#pointForAngle}
	 */
	relativePointForAngle(radians) {
		let r = radians - this.radians;
		return new Vec2(this.radiusX * Math.cos(r), this.radiusY * Math.sin(r)).rotate(this.radians);
	}

	/**
	 * returns the point of the ellipsoid, in absolute coordinates, corresponding to the given radians.
	 * @param {number} radians
	 * @returns {Vec2}
	 * @see {@link Ellipsoid#relativePointForAngle}
	 */
	pointForAngle(radians) {
		return this.relativePointForAngle(radians).add(this.center);
	}

	/**
	 * returns the square distance from the center to the ellipsoid for the specified angle in radians
	 * @param {number} radians
	 * @returns {number}
	 * @see {@link Ellipsoid#radiusForAngle}
	 */
	squareRadiusForAngle(radians) {
		return this.relativePointForAngle(radians).squareMagnitude;
	}

	/**
	 * returns the distance from the center to the ellipsoid for the specified angle in radians
	 * @param {number} radians
	 * @returns {number}
	 * @see {@link Ellipsoid#squareRadiusForAngle}
	 */
	radiusForAngle(radians) {
		return Math.sqrt(this.squareRadiusForAngle(radians));
	}

	/**@inheritDoc*/
	pushPath(context) {
		context.ellipse(this.center.x, this.center.y, this.radiusX, this.radiusY, this.radians, 0, PI2);
	}
	/**
	 * draws the shape on the canvas
	 * @param {CanvasRenderingContext2D} context
	 * @param {boolean} [fill=false]
	 * @param {boolean} [stroke=!fill]
	 * @see {@link Shape#pushPath}
	 */
	draw(context, fill = false, stroke = !fill) {
		context.beginPath();
		context.ellipse(this.center.x, this.center.y, this.radiusX, this.radiusY, this.radians, 0, PI2);
		fill && context.fill();
		stroke && context.stroke();
	}
	/**
	 * draw the shape on the canvas using its webgl context.
	 * To fill the shape, the draw mode must de TRIANGLES.
	 * you can acquire how many points will be added to the array or how many triangles will be drawned <!--
	 * -->by using the attributes {@link Ellipsoid#glPointsNumber} and <!--
	 * -->{@link Ellipsoid#glTriangles}
	 * @param {Array} verticesArray array where the points x and y coordinates will be placed
	 * @param {number} vOffset indice of the first free place in the array (must be even)
	 * @param {Array} indicesArray array where the indices of the points <!--
	 * -->for the triangles to be drawned will be placed
	 * @param {number} iOffset indice of the first free place in indicesArray (should be a multiple of 3)
	 */
	getVertices(verticesArray, vOffset, indicesArray, iOffset){
		const o = offset/2;
		let n = this.glPointsNumber-1, dA = PI2/n, a = 0, i = -1;
		while(++i < n) {
			float32Array[vOffset++] = (t = this.pointForAngle(a += dA)).x;
			float32Array[vOffset++] = t.y;
			if(i > 1) {
				indicesArray[iOffset++] = o; //first point
				indicesArray[iOffset++] = o+i; //current point
				indicesArray[iOffset++] = o+i-1; //previous point
			}
		}
	}
	/**
	 * number of points used to draw this shape.
	 * @type {number}
	 * @name Ellipsoid#glPointsNumber
	 */
	get glTriangles() {
		return this.glPointsNumber-1;
	}

	/**@inheritDoc*/
	contains(point) {
		let p = point.clone().remove(this.center);
		return this.squareRadiusForAngle(p.angle) > p.squareMagnitude;
	}

	/**@inheritDoc*/
	getRect() {
		let h, w; //half-height, half-width
		if (this.radians) {
			let a = this.radiusX, b = this.radiusY, alpha = this.radians,
				tanAlpha = Math.tan(alpha), sinAlpha = Math.sin(alpha), cosAlpha = Math.cos(alpha),
				b_a = b / a, t_xMax = Math.atan(-b_a * tanAlpha), t_yMax = Math.atan(b_a / tanAlpha);
			h = Math.abs(a * Math.cos(t_yMax) * sinAlpha + b * Math.sin(t_yMax) * cosAlpha);
			w = Math.abs(a * Math.cos(t_xMax) * cosAlpha + b * Math.sin(t_xMax) * sinAlpha);
		} else {
			h = this.radiusY;
			w = this.radiusX;
		}
		return new Rect(this.center.x - w, this.center.y - h, this.center.x + w, this.center.y + h);
	}

	/**@inheritDoc*/
	getRadius() {
		return this.radiusX;
	}

	/**@inheritDoc*/
	getPercentPoint(percent) {
		return this.pointForAngle(PI2 * percent + this.radians);
	}

	/**@inheritDoc*/
	closestPointTo(p) {
		return this.pointForAngle(Vec2.translation(this.center, p).angle);
	}

	/**@inheritDoc*/
	clone() {
		return new Ellipsoid(this.center, this.radiusX, this.radiusY, this.radians);
	}

	/**
	 * creates and returns the polygon equivalent of the ellipsoid
	 * @param {number} edges
	 * @returns {@link Polygon} polygon equivalent of this ellipsoid
	 */
	toPolygon(edges) {
		return Polygon.createEllipsoid(this.center, this.radiusX, this.radiusY, edges, this.radians);
	}
}
/**
 * number of points used to draw this shape.
 * @type {number}
 * @name Ellipsoid#glPointsNumber
 */
Ellipsoid.prototype.glPointsNumber = 16;
//######################################################################################################################
//#                                                        Line                                                        #
//######################################################################################################################
let A = Vec2.zero, B = Vec2.zero, C = Vec2.zero, D = Vec2.zero, AB = Vec2.zero, AC = Vec2.zero, AD = Vec2.zero,
	u = Vec2.zero, CD = Vec2.zero, d=0, BC = Vec2.zero, BD = Vec2.zero;
/**
 * @class Line
 * @augments Shape
 * @memberOf utils.geometry2d
 * @alias utils.geometry2d.Line
 * @classdesc a linear shape, represented by its center, length and rotation. the representation brings <!--
 *        -->optimizations for movements, rotations and dimensions changes, but also brings lack of optimization<!--
 *        --> for collisions and drawing.
 */
class Line extends Shape {
	/**
	 * @constructor
	 * @param {Vec2} p0
	 * @param {Vec2} p1
	 */
	constructor(p0, p1) {
		super();
		/**
		 * start point of the line.
		 * @type {Vec2}
		 */
		this.p0 = p0.clone();
		/**
		 * end point of the line.
		 * @type {Vec2}
		 */
		this.p1 = p1.clone();
	}

	/**
	 * center of the line
	 * @name Line#center
	 * @returns {Vec2}
	 */
	get center() {
		return A.set(this.p0).add(this.p1).mul(0.5);
	}

	/**
	 * @param {Vec2}center
	 */
	set center(center) {
		const d = Vec2.translation(this.center, center);
		this.p0.add(d);
		this.p1.add(d);
	}
	/**
	 * the length of the line
	 * @name Line#length
	 * @type {number}
	 */
	get length() {
		return Vec2.distance(this.p0, this.p1);
	}

	/**
	 * @param {number} l
	 */
	set length(l) {
		const d = this.vector.setMagnitude((l-this.length)/2);
		this.p1.add(d);
		this.p0.remove(d);
	}
	/**
	 * the angle, in radians, of the line.
	 * @name Line#angle
	 * @type {number}
	 */
	get angle() {
		return Math.atan2(this.p1.y-this.p0.y, this.p1.x, this.p0.x);
	}

	/**
	 * @param {number} radians
	 */
	set angle(radians) {
		const u = this.vector.mul(0.5).setAngle(radians);
		const c = this.center;
		this.p0.set(c).remove(u);
		this.p1.set(c).add(u);
	}

	/**
	 * vector from start point to end point.
	 * @type {Vec2}
	 * @readonly
	 */
	get vector() {
		return Vec2.translation(this.p0, this.p1);
	}

	/**
	 * unit vector (magnitude=1) from start point to end point.
	 * @type {Vec2}
	 * @readonly
	 */
	get directorVect() {
		return Vec2.translation(this.p0, this.p1).normalize();
	}

	/**
	 * perimeter of the line : <code>2 \* {@link Line#length|length} </code>
	 * @type {number}
	 * @readonly
	 */
	get perimeter() {
		return 2*Vec2.distance(this.p0, this.p1);
	}

	/**
	 * sets the {@link Line#angle} attribute to the specified value.
	 * @param {number} radians
	 * @returns {Line} <code>this</code>
	 */
	setAngle(radians) {
		this.angle = radians;
		return this;
	}

	/**
	 * sets the {@link Line#length} attribute to the specified value.
	 * @param {number} length
	 * @returns {Line} <code>this</code>
	 */
	setLength(length) {
		this.length = length;
		return this;
	}

	/**
	 * sets the start point of the line to the specified point.
	 * @param {Vec2} p
	 * @returns {Line} <code>this</code>
	 */
	setP0(p) {
		this.p0.set(p);
		return this;
	}

	/**
	 * sets the end point of the line to the specified point.
	 * @param {Vec2} p
	 * @returns {Line} <code>this</code>
	 */
	setP1(p) {
		this.p1.set(p);
		return this;
	}

	/**
	 * sets both start and end points to the specified points
	 * @param {Vec2} p0
	 * @param {Vec2} p1
	 * @returns {Line} <code>this</code>
	 */
	setPoints(p0, p1) {
		this.p0.set(p0);
		this.p1.set(p1);
		return this;
	}

	/**
	 * sets the center's attributes to the same as the parameter's
	 * @param {Vec2}center
	 * @returns {Line} <code>this</code>
	 * @see {@link Line#setCenterXY}
	 */
	setCenter(center) {
		this.center.set(center);
		return this;
	}

	/**
	 * sets the center's attributes to the parameters
	 * @param {number} x
	 * @param {number} y
	 * @returns {Line} <code>this</code>
	 * @see {@link Line#setCenter}
	 */
	setCenterXY(x, y) {
		const c = this.center;
		const dX = x - c.x, dY = y - c.y;
		this.p0.addXY(dX, dY);
		this.p1.addXY(dX, dY);
		return this;
	}

	/**
	 * returns the center of the line. equivalent to line.center
	 * @returns {Vec2}
	 */
	copyCenter() {
		return this.center;
	}
	/**
	 * moves the shape according to the parameters
	 * @param {number} dX
	 * @param {number} dY
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#move}
	 */
	moveXY(dX, dY) {
		this.p0.addXY(dX, dY);
		this.p1.addXY(dX, dY);
		return this;
	}

	/**
	 * moves the shape according to the parameter
	 * @param {Vec2} delta
	 * @returns {Shape}
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#moveXY}
	 */
	move(delta) {
		this.p0.add(delta);
		this.p1.add(delta);
		return this;
	}

	/**
	 * multiplies the line's length by the specified factor.
	 * @param {number} factor
	 * @returns {Line} <code>this</code>
	 */
	scale(factor) {
		const u = this.p1.clone().remove(this.p0).mul(0.5*factor);
		this.p1.add(u);
		this.p0.remove(u);
		return this;
	}

	/**
	 * add to the line's length twice the parameter.
	 * @param {number} delta
	 * @returns {Line} <code>this</code>
	 */
	growDistance(delta) {
		const l = this.length;
		return this.scale((l+delta)/l);
	}

	/**
	 * rotates the line by the specified angle in radians
	 * @param {number} radians
	 * @returns {Line}
	 */
	rotate(radians) {
		this.angle += radians;
		return this;
	}

	/**
	 * makes the line the mirror of itself relative to the given horizontal axis
	 * if no value is set for axisY, the mirror will be made relative to the center's y coordinate.
	 * @param {number} [axisY=center.y]
	 *          ordinate of the horizontal axis
	 * @returns {Line} <code>this</code>
	 */
	mirrorVertically(axisY = (this.p0.y+this.p1.y)/2) {
		this.p0.mirrorVertically(axisY);
		this.p1.mirrorVertically(axisY);
		return this;
	}

	/**
	 * makes the line the mirror of itself relative to the given vertical axis
	 * if no value is set for axisX, the mirror will be made relative to the center's x coordinate.
	 * @param {number} [axisX=center.x]
	 *          abscissa of the vertical axis
	 * @returns {Line} <code>this</code>
	 */
	mirrorHorizontally(axisX = (this.p0.x+this.p1.x)/2) {
		this.p0.mirrorHorizontally(axisX);
		this.p1.mirrorHorizontally(axisX);
		return this;
	}

	/**
	 * adds the drawing instructions to the context. Be aware that if you just "fill" the line, <!--
	 * -->it won't be drawn on the canvas, you must "stroke" it to make it appear on the canvas.
	 * @param {CanvasRenderingContext2D} context
	 */
	pushPath(context) {
		context.moveTo(this.p0.x, this.p0.y);
		context.lineTo(this.p1.x, this.p1.y);
	}
	/**
	 * draws the shape on the canvas
	 * @param {CanvasRenderingContext2D} context
	 * @param {boolean} [fill=false]
	 * @param {boolean} [stroke=!fill]
	 * @see {@link Shape#pushPath}
	 */
	draw(context, fill = false, stroke = !fill) {
		context.beginPath();
		context.moveTo(this.p0.x, this.p0.y);
		context.lineTo(this.p1.x, this.p1.y);
		fill && context.fill();
		stroke && context.stroke();
	}

	/**
	 * draw the shape on the canvas using its webgl context.
	 * To fill the shape, the draw mode must de TRIANGLES.
	 * you can acquire how many points will be added to the array or how many triangles will be drawned <!--
	 * -->by using the attributes {@link Line#glPointsNumber} and <!--
	 * -->{@link Line#glTriangles}
	 * @param {Array} verticesArray array where the points x and y coordinates will be placed
	 * @param {number} vOffset indice of the first free place in the array (must be even)
	 * @param {Array} indicesArray array where the indices of the points <!--
	 * -->for the triangles to be drawned will be placed
	 * @param {number} iOffset indice of the first free place in indicesArray (should be a multiple of 3)
	 */
	getVertices(verticesArray, vOffset, indicesArray, iOffset){
		const o = offset/2, A = this.p0, B= this.p1;
		verticesArray[vOffset++] = A.x;
		verticesArray[vOffset++] = A.y;
		verticesArray[vOffset++] = B.x;
		verticesArray[vOffset++] = B.y;
		indicesArray[iOffset++] = o;
		indicesArray[iOffset++] = o+1;
		indicesArray[iOffset++] = o;
	}

	/**
	 * check if the line intersect with the shape.
	 * The checking is only made for {@link Circle} and {@link Line} instances.
	 * if the specified shape is not an instance of those classes, this function returns the result of <!--
	 * --><code>shape.intersect(this)</code>
	 * @param {Shape} shape
	 * @returns {boolean}
	 */
	intersect(shape) {
		if(shape instanceof Rect) {
			//TODO optimiser
			return shape.toPolygon().intersect(this);
		}
		else if (shape instanceof Circle) {
			/*
			return asm.circleLineIntersect(shape.center.x, shape.center.y, shape.radius, this.p0.x, this.p0.y,
											this.p1.x, this.p1.y);
			/*/
			if (shape.contains(this.p0) != shape.contains(this.p1)) return true;
			const l = this.length;
			AC.set(shape.center).remove(this.p0);
			u.set(this.p1).remove(this.p0).mul(1/this.length);
			d = Vec2.dotProd(u, AC);

			//checking d < 0 and d > length is useless because it would mean A or B is in the circle,
			//which is already check at the beginning of the function
			//return Vec2.distance((d < 0) ? A : (d > this.length)? B : u.mul(d).add(A), shape.center)<=shape.radius;

			return  (d >= 0 && d <= l && Vec2.squareDistance(u.mul(d).add(this.p0), shape.center)
				<= shape.radius*shape.radius);
			//*/
		}
		else if (shape instanceof Line) {
			/*
			return asm.linesIntersect(this.p0.x, this.p0.y, this.p1.x, this.p1.y, C.x, C.y, D.x, D.y);
			/*/
				//ccw(AC, AD) != ccw(BC, BD)
			if (Vec2.ccw2(AC.set(shape.p0).remove(this.p0), AD.set(shape.p1).remove(this.p0))
				!== Vec2.ccw(this.p1, shape.p0, shape.p1)) {
				AB.set(this.p1).remove(this.p0);
				return Vec2.ccw2(AB, AC) !== Vec2.ccw2(AB, AD);
			}
			else return false;
			//*/
		}
		else return shape.intersect(this);
	}

	/**
	 * returns the intersection points between this line and the given shape.
	 * The array is empty if the line and the other
	 * @param {Shape} shape
	 * @returns {Vec2[]}
	 */
	getIntersectionPoints(shape) {
		if(shape instanceof Rect) {
			//TODO optimiser
			return shape.toPolygon().getIntersectionPoints(this);
		}
		else if(shape instanceof Circle) {
			A = this.p0.clone();
			C = shape.center;
			u.set(this.p1).remove(A).normalize();
			let a = u.x*u.x + u.y*u.y, b = 2*(u.x*(A.x-C.x)+u.y*(A.y-C.y)),
				c = A.x*(A.x-2*C.x) + C.x*C.x + A.y*(A.y-2*C.y) + C.y*C.y - radius*radius;
			d = b*b - 4*a*c;
			if(d==0) {
				d = -b/(2*a);
				if(d >= 0) return A.add(u.mul(d));
			} else if(d > 0) {
				d = Math.sqrt(d);
				a *= 2;
				let l1 = (-b-d)/a, l2 = (-b+d)/a;
				if(l1 >= 0) {
					if(l2 >= 0) {
						return [B.set(u).mul(l1).add(A), A.add(u.mul(l2))];
					} else return [A.add(u.mul(l1))];
				} else if(l2 >= 0) {
					return [A.add(u.mul(l2))];
				}
			} else return [];
		}
		else if(shape instanceof Line) {
			let p = Line.intersectionPoint(this, shape);
			if(p.onLine1 && p.onLine2) return [p.point];
			else return [];
		}
		else return shape.getIntersectionPoints(this);
	}

	/**
	 * returns whether or not the line contains the given point.
	 * As the result is rarely realistic because a line has an infinitely thin width, you should use the <!--
	 * -->{@link Line#distanceToPoint} instead.
	 * @param {Vec2} point
	 * @returns {boolean}
	 */
	contains(point) {
		return point.equals(this.p0) || point.equals(this.p1) ||
			(Vec2.distance(this.p0, point) + Vec2.distance(this.p1, point)) == Vec2.distance(this.p0, this.p1);

	}

	/**
	 * returns the closest point of the line to the specified point.
	 * @param {Vec2} p
	 * @returns {Vec2}
	 */
	closestPointTo(p) {
		A = this.p0;
		u = this.directorVect;
		AC.set(p).remove(A);
		d = Vec2.dotProd(u, AC);
		return (d < 0) ? u.set(A) : (d < this.length) ? u.mul(d).add(A) : u.set(this.p1);
	}

	/**
	 * return the distance from the closest point of the line to the given point
	 * @param {Vec2} point
	 * @returns {number}
	 */
	distanceToPoint(point) {
		return Vec2.distance(this.closestPointTo(point), point);
	}

	/**
	 * returns the normal vector of the line, the direction depends on the parameter
	 * @param {boolean} [left=true]
	 * @returns {Vec2}
	 */
	getNormalVect(left = true) {
		return this.directorVect.rotate(left ? -PI_2 : PI_2);
	}

	/**
	 * creates a new {@link Rect} instance fitted for the line.
	 * @returns {Rect}
	 */
	getRect() {
		A = this.p0;
		B = this.p1;
		let left, top, right, bottom;
		if (A.x < B.x) {
			left = A.x;
			right = B.x;
		} else {
			left = B.x;
			right = A.x;
		}
		if (A.y < B.y) {
			top = A.y;
			bottom = B.y;
		} else {
			top = B.y;
			bottom = A.y;
		}
		return new Rect(left, top, right, bottom);
	}

	/**
	 * returns the half length of the line
	 * @returns {number}
	 */
	geRadius() {
		return Vec2.distance(this.p0, this.p1) * 0.5;
	}

	/**
	 * creates a copy of the line.
	 * @returns {Line}
	 */
	clone() {
		return new Line(this.p0, this.p1);
	}

	/**
	 * returns an object with 3 properties :
	 *    the first one, 'point',  is the point where the 2 lines intersect,
	 *    the second one, 'onLine1', is true if the point is on the segment 'line1',
	 *    the third one, 'onLine2', is true if the point is on the segment 'line2'.
	 * If the two lines are parallel, this method returns null.
	 * @param {Line} line1
	 * @param {Line} line2
	 * @returns {?{point: Vec2, onLine1: boolean, onLine2: boolean}}
	 */
	static intersectionPoint(line1, line2) {
		A = line1.p0;
		C = line2.p0;
		AB.set(line1.p1).remove(A);
		CD.set(line2.p1).remove(C);
		d = CD.y * AB.x - CD.x * AB.y; // = AB ^ CD = det([AB CD])
		if (!d) return null;
		let CA = Vec2.translation(C, A),
			pos1 = (CD.x * CA.y - CD.y * CA.x) / d,
			pos2 = (AB.x * CA.y - AB.y * CA.x) / d;
		return {
			point: AB.mul(pos1).add(A),
			onLine1: pos1 > 0 && pos1 < 1,
			onLine2: pos2 > 0 && pos2 < 1
		};
	}

	/**
	 * creates a line from a start point and a vector from start point to end point
	 * @param {Vec2} A
	 * @param {Vec2} AB
	 * @returns {Line}
	 */
	static createFromPointVector(A, AB) {
		return new Line(A, A.clone().add(AB));
	}
}
/**
 * number of points used to draw this shape.
 * @type {number}
 * @name Line#glPointsNumber
 */
Line.prototype.glPointsNumber = 2;
/**
 * number of triangles used to draw this shape.
 * @type {number}
 * @name Line#glTriangles
 */
Line.prototype.glPointsNumber = 1;
//######################################################################################################################
//#                                                        Point                                                       #
//######################################################################################################################
/**
 * @class Point
 * @augments Shape
 * @memberOf utils.geometry2d
 * @alias utils.geometry2d.Point
 * @classdesc a very simple shape containing only necessary overridden methods to make it usable
 */
class Point extends Shape {
	/**
	 * @constructor
	 * @param {Vec2} p
	 */
	constructor(p) {
		super();
		/**
		 * position of the point
		 * @name Point#center
		 * @type {Vec2}
		 */
		this.center = p.clone();
	}/**
	 * returns a copy of the <code>{@link Shape#center|center}</code> attribute of the instance.
	 * @returns {Vec2} a copy of the center
	 */
	copyCenter() {
		return this.center.clone();
	}

	/**
	 * sets the center's attributes to the same as the parameter's
	 * @param {Vec2}center
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#setCenterXY}
	 */
	setCenter(center) {
		this.center.set(center);
		return this;
	}

	/**
	 * sets the center's attributes to the parameters
	 * @param {number} x
	 * @param {number} y
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#setCenter}
	 */
	setCenterXY(x, y) {
		this.center.setXY(x, y);
		return this;
	}

	/**
	 * makes the shape the opposite of itself relative to the given horizontal axis
	 * if no value is set for axisY, the mirror will be made relative to the center's y coordinate.
	 * @param {number} [axisY=center.y]
	 *          ordinate of the horizontal axis
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#mirrorHorizontally}
	 */
	mirrorVertically(axisY = this.center.y) {
		this.center.mirrorVertically(axisY);
		return this;
	}

	/**
	 * makes the shape the opposite of itself relative to the given vertical axis
	 * if no value is set for axisX, the mirror will be made relative to the center's x coordinate.
	 * @param {number} [axisX=center.x]
	 *          abscissa of the vertical axis
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#mirrorVertically}
	 */
	mirrorHorizontally(axisX = this.center.x) {
		this.center.mirrorHorizontally(axisX);
		return this;
	}

	/**
	 * moves the shape according to the parameters
	 * @param {number} dX
	 * @param {number} dY
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#move}
	 */
	moveXY(dX, dY) {
		this.center.addXY(dX, dY);
		return this;
	}

	/**
	 * moves the shape according to the parameter
	 * @param {Vec2} delta
	 * @returns {Shape}
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#moveXY}
	 */
	move(delta) {
		this.center.add(delta);
		return this;
	}

	/**
	 * adds drawing instructions to draw a rectangle 2 units sided, centered on <!--
	 * -->[center]{@link Shape#center} attribute.
	 * @param context
	 */
	pushPath(context) {
		context.rect(this.center.x - 0.5, this.center.y - 0.5, 1, 1);
	}

	/**
	 * draws the shape on the canvas
	 * @param {CanvasRenderingContext2D} context
	 * @param {boolean} [fill=true]
	 * @param {boolean} [stroke=!fill]
	 * @see {@link Shape#pushPath}
	 */
	draw(context, fill = true, stroke = !fill) {
		context.fillRect(this.center.x - this.drawThickness, this.center.y - this.drawThickness,
			2*this.drawThickness, 2*this.drawThickness);
	}

	/**
	 * draw the shape on the canvas using its webgl context.
	 * To fill the shape, the draw mode must de TRIANGLES.
	 * you can acquire how many points will be added to the array or how many triangles will be drawned <!--
	 * -->by using the attributes {@link Point#glPointsNumber} and <!--
	 * -->{@link Point#glTriangles}
	 * @param {Array} verticesArray array where the points x and y coordinates will be placed
	 * @param {number} vOffset indice of the first free place in the array (must be even)
	 * @param {Array} indicesArray array where the indices of the points <!--
	 * -->for the triangles to be drawned will be placed
	 * @param {number} iOffset indice of the first free place in indicesArray (should be a multiple of 3)
	 */
	getVertices(verticesArray, vOffset, indicesArray, iOffset){
		const o = offset/2;
		verticesArray[vOffset++] = this.center.x;
		verticesArray[vOffset++] = this.center.y;
		indicesArray[iOffset++] = o;
		indicesArray[iOffset++] = o;
		indicesArray[iOffset++] = o;
	}

	/**
	 * creates a copy of this point
	 * @returns {Point}
	 */
	clone() {
		return new Point(this.center);
	}
}

/**
 * size of the drawn point in a standard context2d.
 * @type {number}
 * @name Point#drawThickness
 */
Point.prototype.drawThickness = 1;
/**
 * number of points used to draw this shape.
 * @type {number}
 * @name Point#glPointsNumber
 */
Point.prototype.glPointsNumber = 1;
/**
 * number of triangles used to draw this shape.
 * @type {number}
 * @name Point#glTriangles
 */
Point.prototype.glPointsNumber = 1;
//######################################################################################################################
//#                                                       Polygon                                                      #
//######################################################################################################################
let len = 0, i = 0, res = 0, p0 = Vec2.zero, p1 = Vec2.zero;
// above variables are used to make methods faster and avoid memory leaks creating variables every time
/**
 * @class Polygon
 * @augments Shape
 * @memberOf utils.geometry2d
 * @alias utils.geometry2d.Polygon
 * @classdesc a class using multiple points, where their coordinates are relative to the center of the shape.
 * This representation is optimized for movements and transformations, but not optimized for drawing and <!--
 * -->memory,  because it has all the points in memory (2 numbers each), plus the center <!--
 * -->coordinate (2 numbers).
 */
class Polygon extends Shape {
	/**
	 * constructor of the Polygon, taking the center and points relative to this center as arguments.
	 * @constructor
	 * @param {Vec2} center
	 * @param {Vec2[]} relativePoints
	 */
	constructor(center, relativePoints) {
		super();
		/**
		 * center of the polygon
		 * @name Polygon#center
		 * @type {Vec2}
		 */
		this.center = center.clone();
		i = relativePoints.length;
		/**
		 * @name Polygon#points
		 * @type {Vec2[]}
		 */
		this.points = new Array(i);
		while (i--) this.points[i] = relativePoints[i].clone();
	}

	/**
	 * perimeter of the instance
	 * @type {number}
	 * @readonly
	 */
	get perimeter() {
		i = this.points.length - 1;
		res = Vec2.distance(this.points[0], this.points[i]);
		while (i) res += Vec2.distance(this.points[i--], this.points[i]);
		return res;
	}

	/**
	 * area of the instance
	 * @type {number}
	 * @readonly
	 */
	get area() {
		res = 0;
		i = this.points.length;
		p1 = this.points[0];
		while (i--) {
			p0 = this.points[i];
			res += (p0.x + p1.x) * (p0.y - p1.y);
			p1 = p0;
		}
		return res / 2;
	}

	/**
	 * returns a copy of the <code>{@link Shape#center|center}</code> attribute of the instance.
	 * @returns {Vec2} a copy of the center
	 */
	copyCenter() {
		return this.center.clone();
	}

	/**
	 * sets the center's attributes to the same as the parameter's
	 * @param {Vec2}center
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#setCenterXY}
	 */
	setCenter(center) {
		this.center.set(center);
		return this;
	}

	/**
	 * sets the center's attributes to the parameters
	 * @param {number} x
	 * @param {number} y
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#setCenter}
	 */
	setCenterXY(x, y) {
		this.center.setXY(x, y);
		return this;
	}

	/**
	 * moves the shape according to the parameters
	 * @param {number} dX
	 * @param {number} dY
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#move}
	 */
	moveXY(dX, dY) {
		this.center.addXY(dX, dY);
		return this;
	}

	/**
	 * moves the shape according to the parameter
	 * @param {Vec2} delta
	 * @returns {Shape}
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#moveXY}
	 */
	move(delta) {
		this.center.add(delta);
		return this;
	}

	/**
	 * multiplies the distance to the center of all points by the specified factor
	 * @param {number} factor
	 * @returns {Polygon} <code>this</code>
	 */
	scale(factor) {
		i = this.points.length;
		while (i--) this.points[i].mul(factor);
		return this;
	}

	/**
	 * increase the distance to the center of all points by the specified distance
	 * @param {number} delta
	 * @returns {Polygon} <code>this</code>
	 */
	growDistance(delta) {
		i = this.points.length;
		while (i--) this.points.magnitude += delta;
		return this;
	}

	/**
	 * rotate the instance by the specified angle in radians.
	 * @param {number} radians
	 * @returns {Polygon}
	 */
	rotate(radians) {
		i = this.points.length;
		while (i--) this.points[i].angle += radians;
		return this;
	}

	/**
	 * makes the line the mirror of itself relative to the given horizontal axis
	 * if no value is set for axisY, the mirror will be made relative to the center's y coordinate.
	 * @param {number} [axisY=center.y]
	 *          ordinate of the horizontal axis
	 * @returns {Polygon} <code>this</code>
	 */
	mirrorVertically(axisY = this.center.y) {
		this.center.mirrorVertically(axisY);
		i = this.points.length;
		while (i--) this.points[i].mirrorVertically();
		return this;
	}

	/**
	 * makes the line the mirror of itself relative to the given vertical axis
	 * if no value is set for axisX, the mirror will be made relative to the center's x coordinate.
	 * @param {number} [axisX=center.x]
	 *          abscissa of the vertical axis
	 * @returns {Polygon} <code>this</code>
	 */
	mirrorHorizontally(axisX) {
		this.center.mirrorHorizontally(axisX);
		i = this.points.length;
		while (i--) this.points[i].mirrorHorizontally();
		return this;
	}

	/**
	 * adds to the context the drawing instructions to draw the polygon.
	 * @param {CanvasRenderingContext2D} context
	 */
	pushPath(context) {
		len = this.points.length;
		if (len) {
			context.translate(this.center.x, this.center.y);
			context.moveTo(this.points[0].x, this.points[0].y);
			i = 1;
			while(i < len) context.lineTo(this.points[i].x, this.points[i++].y);
			context.lineTo(this.points[0].x, this.points[0].y);
			context.translate(-this.center.x, -this.center.y);
		}
	}
	/**
	 * draws the shape on the canvas
	 * @param {CanvasRenderingContext2D} context
	 * @param {boolean} [fill=false]
	 * @param {boolean} [stroke=!fill]
	 * @see {@link Shape#pushPath}
	 */
	draw(context, fill = false, stroke = !fill) {
		context.beginPath();
		len = this.points.length;
		if (len) {
			context.translate(this.center.x, this.center.y);
			context.moveTo(this.points[0].x, this.points[0].y);
			i = 1;
			while(i < len) context.lineTo(this.points[i].x, this.points[i++].y);
			context.closePath();
			context.translate(-this.center.x, -this.center.y);
		}
		fill && context.fill();
		stroke && context.stroke();
	}
	/**
	 * number of points used to draw this shape.
	 * @type {number}
	 */
	get glPointsNumber() {
		return this.points.length;
	}
	/**
	 * number of triangles used to draw this shape.
	 * @type {number}
	 */
	get glTriangles() {
		return this.points.length-2;
	}

	/**
	 * @returns {boolean} true if the points of the polygon are in the counter-clockwise order
	 */
	ccw() {
		const n = this.points.length;
		let z = 0, i, j;
		for(i = 0, j = 1; i < n; i++, j++) {
			if(j == n) j = 0;
			z += (this.points[i].y + this.points[j].y)*(this.points[j].x - this.points[i].x);
		}
		return z <= 0;
	}
	/**
	 * divide the polygon into several new convex polygons, without creating intermediate points
	 * @return {[Polygon]} convex polygons
	 */
	divideConvex() {
		let polygons = [];
		let points = this.points.slice(0);
		let n = points.length;
		if(n < 4) return [new Polygon(this.center, points)];
		const ccw = this.ccw();
		let i=0;
		while(n > 3) {
			let prv = points[(i - 1 + n) % n], cur = points[i], nxt = points[(i + 1) % n];
			while(i < n && Vec2.ccw(prv, cur, nxt) == ccw) {
				i++;
				prv = cur;
				cur = nxt;
				nxt = points[(i + 1) % n];
			}
			if(i == n) break;
			let j = (i - 3 + n) % n;
			while( (Vec2.ccw(prv, cur, points[j]) == ccw) &&
					(Vec2.ccw(points[j], points[(j+1)%n], points[(j+2)%n]) == ccw))
				j = (j - 1 + n) % n;
			j++;

			let array = [points[j % n]];
			j = (j + 1) % n;
			while(j != i) {
				array.push(points.splice(j, 1)[0]);
				if(j < i) i--;
				n--;
				j = j % n;
			}
			array.push(points[i]);
			polygons.push(new Polygon(this.center, array));
			if(n < 4) break;
		}
		polygons.push(new Polygon(this.center, points));
		return polygons;
	}

	/**
	 * draw the shape on the canvas using its webgl context.
	 * To fill the shape, the draw mode must de TRIANGLES.
	 * you can acquire how many points will be added to the array or how many triangles will be drawned <!--
	 * -->by using the attributes {@link Polygon#glPointsNumber} and <!--
	 * -->{@link Polygon#glTriangles}
	 * @param {Array} verticesArray array where the points x and y coordinates will be placed
	 * @param {number} vOffset indice of the first free place in the array (must be even)
	 * @param {Array} indicesArray array where the indices of the points <!--
	 * -->for the triangles to be drawned will be placed
	 * @param {number} iOffset indice of the first free place in indicesArray (should be a multiple of 3)
	 */
	getVertices(verticesArray, vOffset, indicesArray, iOffset){
		const o = vOffset/2, n = this.points.length;
		let i = 0;
		while(i < n) {
			if(i>1) {
				indicesArray[iOffset++] = o
				indicesArray[iOffset++] = o+i-1;
				indicesArray[iOffset++] = o+i;
			}
			verticesArray[vOffset++] = this.points[i  ].x+this.center.x;
			verticesArray[vOffset++] = this.points[i++].y+this.center.y;
		}
	}

	/**
	 * returns a copy of the point, in absolute coordinates, of the index you specified.
	 * @param {number} index
	 * @returns {Vec2}
	 */
	getPoint(index) {
		return this.points[index].clone().add(this.center);
	}

	/**
	 * returns copies of all the points of the polygon, in absolute coordinates.
	 * @returns {Vec2[]}
	 */
	getPoints() {
		i = this.points.length;
		let arr = new Array(i);
		while (i--) arr[i] = this.points[i].clone().add(this.center);
		return arr;
	}

	/**
	 * returns the line, in absolute coordinates, formed by the points of indices <!--
	 * --><code>index</code> and <code>index+1</code>
	 * @param {number} index the index of the start point
	 * @returns {Line}
	 */
	getLine(index) {
		len = this.points.length;
		return new Line(this.points[(index++) % len], this.points[index % len]).move(this.center);
	}

	/**
	 * returns the line, in relative coordinates, formed by the points of indices <!--
	 * --><code>index</code> and <code>index+1</code>
	 * @param {number} index the index of the start point
	 * @returns {Line}
	 */
	getRelativeLine(index) {
		len = this.points.length;
		return new Line(this.points[(index++) % len], this.points[index % len]);
	}

	/**
	 * returns the lines forming the polygon
	 * @returns {Line[]}
	 */
	getLines() {
		len = this.points.length;
		i = len;
		let arr = new Array(i);
		while (i--) arr[i] = new Line(this.points[i], this.points[(i + 1) % len]).move(this.center);
		return arr;
	}

	/**
	 * get the normal vector of the line of the specified index. The direction depends onthe order of the points.
	 * @param {number} index
	 * @returns {Vec2}
	 */
	getNormalVectForLine(index) {
		return this.getLine(index).getNormalVect(false);
	}

	/**
	 * rotate the order the points are registered in the polygon
	 * @param {number} delta number of indices the points have to change
	 */
	rotatePointsOrder(delta) {
		if (delta % 1) delta = Math.round(delta);
		len = this.points.length;
		i = len;
		let p = new Array(len);
		while (i--) p[i] = this.points[(i + delta) % len];
		i = len;
		while (i--) this.points[i] = p[i];
	}

	/**
	 * creates a polygon located inside the instance, where the lines are distant from their originals <!--
	 * -->by the specified distance.
	 * @param {number} distance
	 * @returns {Polygon}
	 */
	getReducedPolygon(distance) {
		let n = this.points.length, points = new Array(len), p, l1, l2, i;
		for (i = 0; i < n; i++) {
			p = this.points[i].clone();
			l1 = i ? this.getRelativeLine(i - 1)
				: this.getRelativeLine(n - 1);
			l2 = this.getRelativeLine(i);
			l1.move(l1.getNormalVect().mul(distance));
			l2.move(l2.getNormalVect().mul(distance));
			points[i] = Line.intersectionPoint(l1, l2);
		}
		return new Polygon(this.center, points);
	}

	/**
	 * checks if the intersect with the shape.
	 * The checking is only made for {@link Circle}, {@link Line} and <!--
	 * {@link Polygon} instances.
	 * if the specified shape is not an instance of those classes, this function returns the result of <!--
	 * --><code>shape.intersect(this)</code>
	 * @param {Shape} shape
	 * @returns {boolean}
	 */
	intersect(shape) {
		let lines = this.getLines(), i = lines.length;
		if (!i) return false;
		if (shape instanceof Polygon) {
			let lines2 = shape.getLines(), len = lines2.length, l, j;
			while (i--) {
				l = lines[i];
				j = len;
				while (j--) {
					if (lines2[j].intersect(l)) return true;
				}
			}
		}
		else while (i--) {
			if (lines[i].intersect(shape)) return true;
		}
		return false;
	}

	/**
	 * returns the intersection points between this polygon and the given shape
	 * @param {Shape} shape
	 * @returns {Vec2[]}
	 */
	getIntersectionPoints(shape) { //TODO performance : instead of getting lines in global coords.,
		// move other shape to local coords.
		let lines = this.getLines(), i = lines.length, res = [];
		if(!i) return [];
		if(shape instanceof Polygon) {
			let lines2 = shape.getLines(), len = lines2.length, l, j;
			while(i--) {
				l = lines[i];
				j = len;
				while(j--) {
					Array.prototype.push.apply(res, lines2[j].getIntersectionPoints(l));
				}
			}
		}
		else while(i--) {
			Array.prototype.push.apply(res, lines[i].getIntersectionPoints(shape));
		}
		return res;
	}

	/**
	 * returns the line of the instance intersecting with the given shape, or null if no line is found
	 * If you only want to check lines after a known index, you can put this index as a second parameter <!--
	 * -->of the function.
	 * @param {Shape} shape
	 * @param {number} [startIndex=0]
	 * @returns {?Line}
	 */
	getIntersectionLine(shape, startIndex = 0) {
		let lines = this.getLines(), i = lines.length;
		if (i <= startIndex) return null;
		if (shape instanceof Polygon) {
			let lines2 = shape.getLines(), len = lines2.length, l, j;
			while (i-- > startIndex) {
				l = lines[i];
				j = len;
				while (j--) {
					if (lines2[j].intersect(l)) return l;
				}
			}
		} else while (i-- > startIndex) {
			if (lines[i].intersect(shape)) return lines[i];
		}
		return null;
	}

	/**
	 * returns the lines of the instance intersecting with the given shape, or null if no line is found.
	 * If you only want to check lines after a known index, you can put this index as a second parameter <!--
	 * -->of the function.
	 * @param {Shape} shape
	 * @param {number} [startIndex=0]
	 * @returns {Line[]}
	 */
	getIntersectionLines(shape, startIndex = 0) {
		let lines = this.getLines(), i = lines.length;
		let result = [];
		if (shape instanceof Polygon) {
			let lines2 = shape.getLines(), len = lines2.length, l, j;
			while (i-- > startIndex) {
				l = lines[i];
				j = len;
				while (j--) {
					if (lines2[j].intersect(l)) result.push(l);
				}
			}
		}
		else while (i-- > startIndex) {
			if (lines[i].intersect(shape)) result.push(lines[i]);
		}
		return result;
	}

	/**
	 * tells if the specified point is located inside the polygon
	 * @param {Vec2} point
	 * @returns {boolean}
	 */
	contains(point) {
		const n = this.points.length;
		const A = Vec2.zero, B = this.points[0].clone();
		point = point.clone().remove(this.center);
		let i, j;
		let nb = 0;
		for(i=0; i< n; i++) {
			A.set(B);
			B.set(this.points[(i+1) % n]);
			// skip lines completely above or below the point, ...
			if( ((A.y > point.y) && (B.y > point.y)) ||
				((A.y < point.y) && (B.y < point.y)) ||
				// ... lines completely on the left of the point, ...
				((A.x < point.x) && (B.x < point.x)) ||
				((A.y == point.y) && (B.y < point.y)) ||
				((A.y < point.y) && (B.y == point.y)) ||
				// ... horizontal lines,
				(A.y == B.y) ||
				// and lines that cross the horizontal line on the left of the point
				(((A.x > point.x) && (B.x < point.x)) && Vec2.ccw(point, B, A)) ||
				(((A.x < point.x) && (B.x > point.x)) && Vec2.ccw(point, A, B))
				)
				continue;

			nb++;
		}
		return (nb % 2) === 1;
	}

	/**
	 * creates and returns a {@link Rect} instance fitting the <!--
	 * -->{@link Polygon} instance
	 * @returns {Rect}
	 */
	getRect() {
		let point, i = this.points.length-1;
		let xmin = this.points[i].x, ymin = this.points[i].y, xmax = xmin, ymax = ymin;
		while (i--) {
			point = this.points[i];
			if (point.x < xmin) xmin = point.x; else if (point.x > xmax) xmax = point.x;
			if (point.y < ymin) ymin = point.y; else if (point.y > ymax) ymax = point.y;
		}
		return new Rect(xmin, ymin, xmax, ymax).move(this.center);
	}

	/**
	 * returns the point of the polygon corresponding to the percentage of the perimeter "walked" on the polygon
	 * @param {number} p
	 * @returns {Vec2}
	 */
	getPercentPoint(p) {
		let dist = this.perimeter * (p % 1), lines = this.getLines(), len = lines.length, l, i;
		for (i = 0; i < len; i++) {
			l = lines[i].length;
			if (l > dist) return lines[i].getPercentPoint(dist / l);
			else dist -= l;
		}
		return this.points[i].add(this.center);
	}

	/**
	 * returns the closest point of the instance to the specified point.
	 * @param {Vec2} p
	 * @returns {?Vec2}
	 */
	closestPointTo(p) {
		let closest = null, d, D = Number.MAX_SAFE_INTEGER, l = this.getLines(), i = l.length, c;
		while (i--) {
			c = l[i].closestPointTo(p);
			d = Vec2.squareDistance(c, p);
			if (d < D) {
				closest = c;
				D = d;
			}
		}
		return closest;
	}

	/**
	 * returns the maximum distance of a point of the polygon to the center.
	 * @returns {number}
	 */
	getRadius() {
		let r = 0, mag, i;
		for (i = this.points.length - 1; i >= 0; i--) {
			mag = this.points[i].squareMagnitude;
			if (mag > r) r = mag;
		}
		return Math.sqrt(r);
	}

	/**
	 * this method can take two behaviors, depending on the parameter :
	 * - if the parameter is null (or not set), this method will move the points to make the center be at the <!--
	 * -->mean of the points of the polygon.
	 * - if the parameter is not null, this method will move all points by the opposite of the specified <!--
	 * -->value, to move the center in the polygon by the value.
	 * <br/>
	 * At the end, the center will remain unchanged, but the points will be moved so the center will look, <!--
	 * relatively to the other points, [at the center (delta==null) / moved by delta (delta!==null)].
	 * @param {?Vec2} [delta=null]
	 * @returns {Polygon} this
	 */
	redefineCenter(delta = null) {
		let i = this.points.length;
		if (!i) return;
		if (!delta) {
			delta = Vec2.zero;
			const len = i;
			while (i--) delta.add(this.points[i]);
			delta.mul(1 / len);
			i = len;
		}
		while (i--) this.points[i].remove(delta);
		return this;
	}

	/**
	 * creates and returns a copy of this instance
	 * @returns {Polygon}
	 */
	clone() {
		return new Polygon(this.center, this.points);
	}

	/**
	 * creates a polygon from absolute points. the center is computed from <!--
	 * -->the average coordinates of the given points
	 * @param {Vec2[]}pointsArray
	 * @returns {Polygon}
	 */
	static Absolute(pointsArray) {
		const len = pointsArray.length;
		const c = Vec2.zero;
		let i = len;
		while(i--) {
			c.add(pointsArray[i]);
		}
		return new Polygon(c.mul(1/len), pointsArray).redefineCenter(c);
	}

	/**
	 * create a rectangular polygon from a center, a width and a height.
	 * @param {Vec2} center
	 * @param {number} width
	 * @param {number} height
	 * @returns {Polygon}
	 */
	static Rectangular(center, width, height) {
		let left = -width * 0.5, top = -height * 0.5, right = left + width, bottom = top + height;
		return new Polygon(center, Vec2.createVec2Array([left, top, right, top, right, bottom, left, bottom]));
	}

	/**
	 * creates an ellipsoid-like polygon
	 * @param {Vec2} center
	 * @param {number} radiusX
	 * @param {number} radiusY
	 * @param {number} edges
	 * @param {number} radians
	 * @returns {Polygon}
	 */
	static Ellipsoidal(center, radiusX, radiusY, edges, radians = 0) {
		let dA = PI2 / edges, a = PI2, points = new Array(edges), i = edges;
		while (i--) {
			a -= dA;
			points[i] = Vec2(radiusX * Math.cos(a), radiusY * Math.sin(a));
		}
		return new Polygon(center, points);
	}

	/**
	 * creates a regular polygon. This function can have different behaviors
	 * @param {Vec2} center
	 * @param {number|number[]} radiusArray
	 * @param {number} pointsNumber
	 * @param {number} startRadians
	 * @returns {Polygon}
	 */
	static Regular(center, radiusArray, pointsNumber, startRadians) {
		let dR = (PI2) / pointsNumber, angle = startRadians, rLen = radiusArray.length,
			p = new Polygon(center, []);
		p.points = new Array(pointsNumber);
		if (rLen !== undefined) {
			let i = -1;
			while (++i < pointsNumber) {
				p.points[i] = Vec2.createFromAngle(angle, radiusArray[i % rLen]);
				angle += dR;
			}
		}
		else {
			let i = pointsNumber;
			while (i--) {
				p.points[i] = Vec2.createFromAngle(angle, radiusArray);
				angle -= dR;
			}
		}
		return p;
	}
}
//######################################################################################################################
//#                                                         Ray                                                        #
//######################################################################################################################
/**
 * @class Ray
 * @augments Shape
 * @memberOf utils.geometry2d
 * @alias utils.geometry2d.Ray
 * @classdesc a class representing an infinite ray, defined by an origin point and the angle of the direction <!--
 * -->it is pointing toward. the origin of the ray is defined by the <!--
 * -->{@link Shape#center|center} attribute.
 */
class Ray extends Shape {
	/**
	 * @constructor
	 * @param {Vec2} origin
	 * @param {number} radians
	 */
	constructor(origin, radians) {
		super();
		/**
		 * origin of the Ray
		 * @name Ray#origin
		 * @type {Vec2}
		 */
		this.origin = origin;
		/**
		 * @name Ray#angle
		 * @type {number}
		 */
		this.angle = radians;
	}

	/**
	 * origin of the Ray. Equivalent to ray.origin
	 * @name Ray#center
	 * @returns {Vec2}
	 */
	get center() { return this.origin; }

	/**
	 * @param {Vec2} center
	 */
	set center(center) { this.origin.set(center); }

	/**
	 * <code>=Infinity</code>
	 * @name Ray#perimeter
	 * @type {Number}
	 * @readonly
	 */
	get perimeter() {
		return Infinity;
	}


	/**
	 * moves the shape according to the parameters
	 * @param {number} dX
	 * @param {number} dY
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#move}
	 */
	moveXY(dX, dY) {
		this.origin.addXY(dX, dY);
		return this;
	}

	/**
	 * moves the shape according to the parameter
	 * @param {Vec2} delta
	 * @returns {Shape}
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#moveXY}
	 */
	move(delta) {
		this.origin.add(delta);
		return this;
	}
	/**
	 * rotates the ray around its origin.
	 * @param {number} radians
	 * @returns {Ray} <code>this</code>
	 */
	rotate(radians) {
		this.angle += radians;
		return this;
	}

	/**
	 * makes the ray the opposite of itself relative to the given horizontal axis
	 * if no value is set for axisY, the mirror will be made relative to the origin's y coordinate.
	 * @param {number} [axisY=center.y] ordinate of the horizontal axis
	 * @returns {Ray} <code>this</code>
	 * @see {@link Ray#mirrorHorizontally}
	 */
	mirrorVertically(axisY = this.center.y) {
		this.origin.mirrorVertically(axisY);
		this.angle = -this.angle;
		return this;
	}

	/**
	 * makes the ray the opposite of itself relative to the given vertical axis
	 * if no value is set for axisX, the mirror will be made relative to the origin's x coordinate.
	 * @param {number} [axisX=center.x]
	 *          abscissa of the vertical axis
	 * @returns {Ray} <code>this</code>
	 * @see {@link Ray#mirrorVertically}
	 */
	mirrorHorizontally(axisX = this.center.x) {
		this.origin.mirrorHorizontally(axisX);
		this.angle = Math.PI - this.angle;
		return this;
	}

	/**
	 * returns the calculated end point of the instance as if the ray was a line stating at the origin <!--
	 * -->and with the specified length.
	 * @param {number} length
	 * @returns {Vec2|Vec2}
	 */
	endPoint(length) {
		return this.origin.clone().addXY(Math.cos(this.angle) * length, Math.sin(this.angle) * length);
	}

	/**
	 * creates a {@link Line|Line} starting from the origin of the ray, with the same direction
	 * and with the specified length
	 * @param length
	 * @returns {Line}
	 */
	getLine(length) {
		return Line.createFromPointVector(this.origin, Vec2.createFromAngle(this.angle, length));
	}

	/**
	 * adds the drawing instructions to the context. Be aware that if you just "fill" the line, <!--
	 * -->it won't be drawn on the canvas, you must "stroke" it to make it appear on the canvas.
	 * @param {CanvasRenderingContext2D} context
	 */
	pushPath(context) {
		const p = this.endPoint(context.canvas.clientWidth + context.canvas.clientHeight);
		context.moveTo(this.origin.x, this.origin.y);
		context.moveTo(this.origin.x, this.origin.y);
		context.lineTo(p.x, p.y);
	}

	/**
	 * draw the shape on the canvas using its webgl context.
	 * To fill the shape, the draw mode must de TRIANGLES.
	 * you can acquire how many points will be added to the array or how many triangles will be drawned <!--
	 * -->by using the attributes {@link Line#glPointsNumber} and <!--
	 * -->{@link Line#glTriangles}
	 * @param {Array} verticesArray array where the points x and y coordinates will be placed
	 * @param {number} vOffset indice of the first free place in the array (must be even)
	 * @param {Array} indicesArray array where the indices of the points <!--
	 * -->for the triangles to be drawned will be placed
	 * @param {number} iOffset indice of the first free place in indicesArray (should be a multiple of 3)
	 */
	getVertices(verticesArray, vOffset, indicesArray, iOffset){
		const o = offset/2, t = this.endPoint(Number.MAX_SAFE_INTEGER);
		verticesArray[vOffset++] = this.origin.x;
		verticesArray[vOffset++] = this.origin.y;
		verticesArray[vOffset++] = t.x;
		verticesArray[vOffset++] = t.y;
		indicesArray[iOffset++] = o;
		indicesArray[iOffset++] = o+1;
		indicesArray[iOffset++] = o;
	}

	/**
	 * check if the ray intersect with the shape.
	 * @param {Shape} shape
	 * @returns {boolean}
	 */
	intersect(shape) {
		const rect = (shape instanceof Rect) ? shape : shape.getRect();
		return new Line(this.center,
			this.endPoint(Vec2.distance(this.origin, shape.center) + rect.width + rect.height)).intersect(shape);
	}

	/**
	 * returns the intersection points between this ray and the given shape
	 * @param {Shape} shape
	 * @returns {Vec2[]}
	 */
	getIntersectionPoints(shape) {
        const rect = (shape instanceof Rect) ? shape : shape.getRect();
		return this.getLine(Vec2.distance(this.origin, shape.center) + rect.width + rect.height)
			.getIntersectionPoints(shape);
	}

	/**
	 * returns whether or not the line contains the given point.
	 * The result is not really realistic because of number precision
	 * @param {Vec2} point
	 * @returns {boolean}
	 */
	contains(point) {
		return this.endPoint(Vec2.distance(this.origin, point)).equals(point);
	}

	/**
	 * creates and returns a {@link Rect} instance fitting the ray, with pone corner <!--
	 * -->at an infinite position.
	 * @returns {Rect}
	 */
	getRect() {
		const endPoint = this.endPoint(Infinity);
		return new Rect(Math.min(endPoint.x, this.origin.x), Math.min(endPoint.y, this.origin.y),
			Math.max(endPoint.x, this.origin.x), Math.max(endPoint.y, this.origin.y));
	}

	/**
	 * returns the director vector of the instance.
	 * @returns {Vec2}
	 */
	get directorVect() {
		return Vec2.createFromAngle(this.angle);
	}

	/**
	 * returns the closest point of the instance to the specified point
	 * @param {Vec2} p
	 * @returns {Vec2}
	 */
	closestpointTo(p) {
		let A = this.origin, AC = Vec2.translation(A, p), u = this.directorVect, d = Vec2.dotProd(u, AC);
		return d < 0 ? u.set(A) : u.mul(d).add(A);
	}

	/**
	 * implemented for the needs of getCircle function, but not very useful as it only returns an infinite number
	 * @returns {number}
	 */
	getRadius() {
		return Infinity;
	}

	/**
	 * returns a copy of the instance.
	 * @returns {Ray}
	 */
	clone() {
		return new Ray(this.origin, this.angle);
	}
}
/**
 * number of points used to draw this shape.
 * @type {number}
 * @name Ray#glPointsNumber
 */
Ray.prototype.glPointsNumber = 2;
/**
 * number of triangles used to draw this shape.
 * @type {number}
 * @name Ray#glTriangles
 */
Ray.prototype.glTrinagles = 1;

export {PI2, PI_2, Vec2, Rect, Shape, Circle, Ellipsoid, Line, Point, Polygon, Ray};