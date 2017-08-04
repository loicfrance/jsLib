/**
* Created by rfrance on 12/20/2016.
*/
window.utils = window.utils || {};
(function(){
//######################################################################################################################
//#                                                        Vec2                                                        #
//######################################################################################################################
	/** @class utils.geometry2d.Vec2
	 * @memberOf utils.geometry2d
	 * @classdesc a simple class with 2 members : <code>{@link utils.geometry2d.Vec2#x|x}</code> and <!--
	 * --><code>{@link utils.geometry2d.Vec2#y|y}</code>, <!--
	 * -->used to represent points and vectors
	 */
	class Vec2 {
		/** @constructor
		 * @param {number} x - x coordinate
		 * @param {number} y - y coordinate
		 */
		constructor(x, y) {
			/**
			 * @name utils.geometry2d.Vec2#x
			 * @type {number}
			 */
			this.x = x;
			/**
			 * @name utils.geometry2d.Vec2#y
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
		 * square magnitude of this vector, calculated from the coordinates : <code><!--
		 *        -->{@link utils.geometry2d.Vec2#x|x}<sup>2</sup> + {@link utils.geometry2d.Vec2#y|y}<sup>2</sup> <!--
		 *        --></code>
		 * @readonly
		 * @type {number}
		 */
		get squareMagnitude() {
			return this.x * this.x + this.y * this.y;
		}

		/**
		 * magnitude of this Vec2, calculated from the coordinates : <code>&radic;(<!--
		 *        -->{@link utils.geometry2d.Vec2#x|x}<sup>2</sup> + <!--
		 *        -->{@link utils.geometry2d.Vec2#y|y}<sup>2</sup>)</code>.
		 * @type {number}
		 */
		get magnitude() {
			return Math.sqrt(this.x * this.x + this.y * this.y);
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
		 * @return {utils.geometry2d.Vec2} a Vec2 with the same x and y properties
		 */
		clone() {
			return new Vec2(this.x, this.y);
		}

		/**
		 * sets x and y coordinates of this Vec2
		 * @param {number} x - new x coordinate
		 * @param {number} y - new y coordinate
		 * @return {utils.geometry2d.Vec2} this
		 */
		setXY(x, y) {
			this.x = x;
			this.y = y;
			return this;
		}

		/**
		 * sets x and y coordinates to the same as the 'vec' parameter
		 * @param {utils.geometry2d.Vec2} vec
		 * @return {utils.geometry2d.Vec2} this
		 */
		set(vec) {
			this.x = vec.x;
			this.y = vec.y;
			return this;
		}

		/**
		 * sets x and y coordinates to 0
		 * @return {utils.geometry2d.Vec2} this
		 */
		reset() {
			this.x = this.y = 0;
			return this;
		}

		/**
		 * @param {number} x - number to be added to x coordinate
		 * @param {number} y - number to be added to y coordinate
		 * @return {utils.geometry2d.Vec2} this
		 */
		addXY(x, y) {
			this.x += x;
			this.y += y;
			return this;
		}

		/**
		 * @param {utils.geometry2d.Vec2} vec
		 * @return {utils.geometry2d.Vec2} this
		 */
		add(vec) {
			this.x += vec.x;
			this.y += vec.y;
			return this;
		}

		/**
		 * @param {utils.geometry2d.Vec2} vec
		 * @return {utils.geometry2d.Vec2} this
		 */
		remove(vec) {
			this.x -= vec.x;
			this.y -= vec.y;
			return this;
		}

		/**
		 * multiplies x and y coordinates by the parameter.
		 * @param {number} factor
		 * @return {utils.geometry2d.Vec2} this
		 */
		mul(factor) {
			this.x *= factor;
			this.y *= factor;
			return this;
		}

		/**
		 * sets x and y coordinates to make the magnitude = 1.
		 * if x = y = 0, this function does nothing.
		 * @return {utils.geometry2d.Vec2} this
		 */
		normalize() {
			this.mul(1 / (this.magnitude || 1));
			return this;
		}

		/**
		 * sets x and y coordinates to make the magnitude = mag.
		 * @param {number} mag -the new magnitude of this Vec2
		 * @return {utils.geometry2d.Vec2} this
		 */
		setMagnitude(mag) {
			this.magnitude = mag;
			return this;
		}

		/**
		 * x= cos(a)*magnitude, y= sin(a)*magnitude
		 * @param {number} a - new angle(radians) of this Vec2
		 * @return {utils.geometry2d.Vec2} this
		 */
		setAngle(a) {
			this.angle = a;
			return this;
		}

		/**
		 * @param {number} a - angle(radians) to rotate this Vec2
		 * this.angle += a;
		 * @return {utils.geometry2d.Vec2} this
		 */
		rotate(a) {
			this.angle += a;
			return this;
		}

		/**
		 * rotate this Vec2 around the center, and keep the distance to the center
		 * @param {utils.geometry2d.Vec2} center - point to rotate this Vec2 around
		 * @param {number} a - angle(radians) to rotate this Vec2
		 * @return {utils.geometry2d.Vec2} this
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
		 * @return {utils.geometry2d.Vec2} new Vec2 containing unit (magnitude=1) version of this Vec2
		 */
		getUnit() {
			return this.clone().normalize();
		}

		/**
		 * @param {utils.geometry2d.Vec2} [center=Vec2.ZERO]
		 * @return {utils.geometry2d.Vec2} the mirror Vec2 of this Vec2, relative to the center
		 */
		getMirror(center = Vec2.ZERO) {
			return Vec2.translation(this, center).add(center);
		}

		/**
		 * @param {number} [axisX=0]
		 * @return {utils.geometry2d.Vec2} the horizontal mirror Vec2 of this Vec2,
		 * relative to the axisX x coordinate
		 */
		getHorizontalMirror(axisX = 0) {
			return this.clone().mirrorHorizontally();
		}

		/**
		 * @param {number} [axisY=0]
		 * @return {utils.geometry2d.Vec2} the vertical mirror Vec2 of this Vec2,
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
		 * @return {utils.geometry2d.Vec2} this
		 */
		mirrorHorizontally(axisX = 0) {
			this.x = axisX ? 2 * axisX - this.x : -this.x;
			return this;
		}

		/**
		 * same (but faster) as instance.set(instance.getVerticalMirror(axisY))
		 * @param {number} [axisY=0]
		 * @return {utils.geometry2d.Vec2} this
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
		 * @return {utils.geometry2d.Vec2} copy of this Vec2 with rounded coordinates.
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
		 * @return {utils.geometry2d.Vec2} this
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
		 * @param {utils.geometry2d.Vec2} u
		 * @param {utils.geometry2d.Vec2} v
		 * @return {number} the result of the dot product of u and v.
		 */
		static dotProd(u, v) {
			return u.x * v.x + u.y * v.y;
		}

		/**
		 * @static
		 * @param {utils.geometry2d.Vec2} u
		 * @param {utils.geometry2d.Vec2} v
		 * @return {number} the result of the vectorial product of u and v.
		 */
		static vectProd(u, v) {
			return u.x * v.y - u.y * v.x;
		}

		/**
		 * @static
		 * @param {utils.geometry2d.Vec2} A - start point
		 * @param {utils.geometry2d.Vec2} B - end point
		 * @return {utils.geometry2d.Vec2} the translation from A to B
		 */
		static translation(A, B) {
			return new Vec2(B.x - A.x, B.y - A.y);
		}

		/**
		 * @static
		 * @param {utils.geometry2d.Vec2} A
		 * @param {utils.geometry2d.Vec2} B
		 * @return {number} the square euclidian distance between A and B
		 */
		static squareDistance(A, B) {
			let dX = B.x - A.x, dY = B.y - A.y;
			return dX * dX + dY * dY;
		}

		/**
		 * @static
		 * @param {utils.geometry2d.Vec2} A
		 * @param {utils.geometry2d.Vec2} B
		 * @return {number} the euclidian distance between A and B
		 */
		static distance(A, B) {
			return Math.sqrt(Vec2.squareDistance(A, B));
		}

		/**
		 * @static
		 * @param {utils.geometry2d.Vec2} A
		 * @param {utils.geometry2d.Vec2} B
		 * @return {number} the manhattan distance between A and B
		 */
		static manhattanDistance(A, B) {
			return Math.abs(B.x - A.x) + Math.abs(B.y - A.y);
		}

		/**
		 * @static
		 * @param {utils.geometry2d.Vec2} A
		 * @param {utils.geometry2d.Vec2} B
		 * @return {number} the diagonal distance between A and B
		 */
		static diagonalDistance(A, B) {
			return Math.max(Math.abs(B.x - A.x), Math.abs(B.y - A.y));
		}

		/**
		 * @static
		 * @param {utils.geometry2d.Vec2} A
		 * @param {utils.geometry2d.Vec2} B
		 * @param {utils.geometry2d.Vec2} C
		 * @return {boolean} true if AB and AC are in counter-clockwise order,
		 *         false otherwise
		 */
		static ccw(A, B, C) {
			return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
		}

		/**
		 * @static
		 * @param {utils.geometry2d.Vec2} AB
		 * @param {utils.geometry2d.Vec2} AC
		 * @return {boolean} true if AB and AC are in counter-clockwise order,
		 *         false otherwise
		 */
		static ccw2(AB, AC) {
			return AC.y * AB.x > AB.y * AC.x;
		}

		/**
		 * @static
		 * @param {number} rad radians
		 * @param {number} [mag=1] magnitude
		 * @return {utils.geometry2d.Vec2} (cos(rad)*mag, sin(rad)*mag)
		 */
		static createFromAngle(rad, mag = 1) {
			return new Vec2(Math.cos(rad) * mag, Math.sin(rad) * mag);
		}

		/**
		 * @static
		 * @param {number[]} xyxyArray - array of points coordinates ordered
		 *        like this : [x1, y1, x2, y2, x3, y3, ...].
		 * @return {utils.geometry2d.Vec2[]} a Vec2 array : [(x1,y1), (x2,y2), (x3,y3), ...].
		 */
		static createVec2Array(xyxyArray) {
			let len = Math.floor(xyxyArray.length / 2), result = new Array(len), i = len, i2;
			while (i--) {
				i2 = 2 * i;
				result[i] = new Vec2(xyxyArray[i2], xyxyArray[i2 + 1]);
			}
			return result;
		}

		/**
		 * a new <code>{@link utils.geometry2d.Vec2}</code> with <code>x = y = 0</code>
		 * @static
		 * @constant
		 * @readonly
		 * @type {utils.geometry2d.Vec2}
		 */
		static get zero() {
			return new Vec2(0, 0);
		}
	}
	/**
	 * (0,0).
	 * @static
	 * @constant
	 * @memberOf utils.geometry2d.Vec2
	 * @type {utils.geometry2d.Vec2}
	 */
	Vec2.ZERO = Vec2.zero;
//######################################################################################################################
//#                                                        Rect                                                        #
//######################################################################################################################
	/** @class utils.geometry2d.Rect
	 * @memberOf utils.geometry2d
	 * @classdesc a class with four attributes : <code>{@link utils.geometry2d.Rect#left|left}</code>, <!--
	 * --><code>{@link utils.geometry2d.Rect#top|top}</code>, <!--
	 * --><code>{@link utils.geometry2d.Rect#right|right}</code> and <!--
	 * --><code>{@link utils.geometry2d.Rect#bottom|bottom}</code>, used to represent a non-rotated rectangle.
	 */
	class Rect {
		/** @constructor
		 * @param {number} left
		 * @param {number} top
		 * @param {number} right
		 * @param {number} bottom
		 */
		constructor(left, top, right, bottom) {
			/**
			 * @name utils.geometry2d.Rect#left
			 * @type {number}
			 */
			this.left = left;
			/**
			 * @name utils.geometry2d.Rect#top
			 * @type {number}
			 */
			this.top = top;
			/**
			 * @name utils.geometry2d.Rect#right
			 * @type {number}
			 */
			this.right = right;
			/**
			 * @name utils.geometry2d.Rect#bottom
			 * @type {number}
			 */
			this.bottom = bottom;
		}

		/**
		 * width (= right - left) of the instance.
		 * @type {number}
		 * @readonly
		 */
		get width() {
			return this.right - this.left;
		}

		/**
		 * height (= bottom - top) of the instance.
		 * @type {number}
		 * @readonly
		 */
		get height() {
			return this.bottom - this.top
		}

		/**
		 * dimensions ratio(= {@link utils.geometry2d.Rect#width|width} / <!--
		 * -->{@link utils.geometry2d.Rect#height|height}) of the instance.
		 * @type {number}
		 * @readonly
		 */
		get ratio() {
			return this.width / this.height;
		}

		/**
		 * perimeter (= {@link utils.geometry2d.Rect#width|width}*2 + <!--
		 * -->{@link utils.geometry2d.Rect#height|height}*2) of the instance.
		 * @type {number}
		 * @readonly
		 */
		get perimeter() {
			return (this.width + this.height) * 2;
		}

		/**
		 * area (= {@link utils.geometry2d.Rect#width|width} * <!--
		 * -->{@link utils.geometry2d.Rect#height|height}) of the instance.
		 * @type {number}
		 * @readonly
		 */
		get area() {
			return this.width * this.height;
		}

		/**
		 * center of the instance. when modified, keeps the dimensions.
		 * @type {utils.geometry2d.Vec2}
		 */
		get center() {
			return new Vec2(this.left + this.right, this.top + this.bottom).mul(0.5);
		}

		/** @param {utils.geometry2d.Vec2} center */
		set center(center) {
			this.setCenterXY(center.x, center.y);
			return center;
		}

		/**
		 * creates and returns a copy of the instance
		 * @returns {utils.geometry2d.Rect}
		 */
		clone() {
			return new Rect(this.left, this.top, this.right, this.bottom);
		}

		/**
		 * sets the center of the instance to the given point.
		 * @param {utils.geometry2d.Vec2} center
		 * @returns {utils.geometry2d.Rect} <code>this</code>.
		 * @see {@link utils.geometry2d.Rect#setCenterXY(x,y)}
		 * @see {@link utils.geometry2d.Rect#center}
		 */
		setCenter(center) {
			return this.setCenterXY(center.x, center.y);
		}

		/**
		 * sets the center to the given coordinates
		 * @param {number} x new x coordinate of the center
		 * @param {number} y new y coordinate of the center
		 * @returns {utils.geometry2d.Rect} <code>this</code>.
		 * @see {@link utils.geometry2d.Rect#setCenter}
		 * @see {@link utils.geometry2d.Rect#center}
		 */
		setCenterXY(x, y) {
			let w = this.width / 2, h = this.height / 2;
			this.left = x - w;
			this.right = x + w;
			this.top = y - h;
			this.bottom = y + h;
			return this;
		}

		/**
		 * modifes the width and height and keep the center
		 * @param {number} scaleX
		 * @param {number} scaleY
		 * @returns {utils.geometry2d.Rect} <code>this</code>.
		 */
		scale(scaleX, scaleY = scaleX) {
			let dw = this.width * (scaleX - 1) * 0.5, dh = this.height * (scaleY - 1) * 0.5;
			this.left -= dw;
			this.right += dw;
			this.top -= dh;
			this.bottom += dh;
			return this;
		}

		/**
		 * @param {utils.geometry2d.Rect} rect
		 * @returns {boolean} true if the instance the object is called from and the parameter have a common point
		 */
		overlap(rect) {
			return rect.left <= this.right && rect.top <= this.bottom
				&& rect.right >= this.left && rect.bottom >= this.top;
		}

		/**
		 * @param {number} x x coordinate of the point
		 * @param {number} y y coordinate of the point
		 * @returns {boolean} true if the point (x,y) is located inside the rectangle.
		 * @see {@link utils.geometry2d.Rect#containsRect}
		 * @see {@link utils.geometry2d.Rect#contains}
		 */
		containsXY(x, y) {
			return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
		}

		/**
		 * @param {utils.geometry2d.Rect} rect
		 * @returns {boolean} true if the given rect is completely inside the instance rect.
		 * @see {@link utils.geometry2d.Rect#containsXY}
		 * @see {@link utils.geometry2d.Rect#contains}
		 */
		containsRect(rect) {
			return rect.left >= this.left && rect.right <= this.right
				&& rect.top >= this.top && rect.bottom <= this.bottom;
		}

		/**
		 * @param {utils.geometry2d.Vec2} p a point
		 * @returns {boolean} true if the point (p) is located inside the rectangle.
		 * @see {@link utils.geometry2d.Rect#containsXY}
		 * @see {@link utils.geometry2d.Rect#containsRect}
		 */
		contains(p) {
			return p.x >= this.left && p.x <= this.right && p.y >= this.top && p.y <= this.bottom;
		}

		/**
		 * @param {number} x
		 * @returns {boolean} <code>right &lt; x</code>
		 * @see {@link utils.geometry2d.Rect#onLeftOfRect}
		 * @see {@link utils.geometry2d.Rect#onLeftOf}
		 * @see {@link utils.geometry2d.Rect#onRightOfX}
		 * @see {@link utils.geometry2d.Rect#aboveY}
		 * @see {@link utils.geometry2d.Rect#belowY}
		 */
		onLeftOfX(x) {
			return this.right < x;
		}

		/**
		 * @param {utils.geometry2d.Rect} r
		 * @returns {boolean} <code>right &lt; r.left</code>
		 * @see {@link utils.geometry2d.Rect#onLeftOfX}
		 * @see {@link utils.geometry2d.Rect#onLeftOf}
		 * @see {@link utils.geometry2d.Rect#onRightOfRect}
		 * @see {@link utils.geometry2d.Rect#aboveRect}
		 * @see {@link utils.geometry2d.Rect#belowRect}
		 */
		onLeftOfRect(r) {
			return this.right < r.left;
		}

		/**
		 * @param {utils.geometry2d.Vec2} p
		 * @returns {boolean} <code>right &lt; p.x</code>
		 * @see {@link utils.geometry2d.Rect#onLeftOfX}
		 * @see {@link utils.geometry2d.Rect#onLeftOfRect}
		 * @see {@link utils.geometry2d.Rect#onRightOf}
		 * @see {@link utils.geometry2d.Rect#above}
		 * @see {@link utils.geometry2d.Rect#below}
		 */
		onLeftOf(p) {
			return this.right < p.x;
		}

		/**
		 * @param {number} x
		 * @returns {boolean} <code>left &gt; x</code>
		 * @see {@link utils.geometry2d.Rect#onRightOfRect}
		 * @see {@link utils.geometry2d.Rect#onRightOf}
		 * @see {@link utils.geometry2d.Rect#onLeftOfX}
		 * @see {@link utils.geometry2d.Rect#aboveY}
		 * @see {@link utils.geometry2d.Rect#belowY}
		 */
		onRightOfX(x) {
			return this.left > x;
		}

		/**
		 * @param {utils.geometry2d.Rect} r
		 * @returns {boolean} <code>left &gt; r.right</code>
		 * @see {@link utils.geometry2d.Rect#onRightOfX}
		 * @see {@link utils.geometry2d.Rect#onRightOf}
		 * @see {@link utils.geometry2d.Rect#onLeftOfRect}
		 * @see {@link utils.geometry2d.Rect#aboveRect}
		 * @see {@link utils.geometry2d.Rect#belowRect}
		 */
		onRightOfRect(r) {
			return this.left > r.right;
		}

		/**
		 * @param {utils.geometry2d.Vec2} p
		 * @returns {boolean} <code>left &gt; p.x</code>
		 * @see {@link utils.geometry2d.Rect#onRightOfX}
		 * @see {@link utils.geometry2d.Rect#onRightOfRect}
		 * @see {@link utils.geometry2d.Rect#onLeftOf}
		 * @see {@link utils.geometry2d.Rect#above}
		 * @see {@link utils.geometry2d.Rect#below}
		 */
		onRightOf(p) {
			return this.left > p.x;
		}

		/**
		 * @param {number} y
		 * @returns {boolean} <code>bottom &lt; y</code>
		 * @see {@link utils.geometry2d.Rect#aboveRect}
		 * @see {@link utils.geometry2d.Rect#above}
		 * @see {@link utils.geometry2d.Rect#onLeftOfX}
		 * @see {@link utils.geometry2d.Rect#onRightOfX}
		 * @see {@link utils.geometry2d.Rect#belowY}
		 */
		aboveY(y) {
			return this.bottom < y;
		}

		/**
		 * @param {utils.geometry2d.Rect} r
		 * @returns {boolean} <code>bottom &lt; r.top</code>
		 * @see {@link utils.geometry2d.Rect#aboveY}
		 * @see {@link utils.geometry2d.Rect#above}
		 * @see {@link utils.geometry2d.Rect#onLeftOfRect}
		 * @see {@link utils.geometry2d.Rect#onRightOfRect}
		 * @see {@link utils.geometry2d.Rect#belowRect}
		 */
		aboveRect(r) {
			return this.bottom < r.top;
		}

		/**
		 * @param {utils.geometry2d.Vec2} p
		 * @returns {boolean} <code>bottom &lt; y</code>
		 * @see {@link utils.geometry2d.Rect#aboveY}
		 * @see {@link utils.geometry2d.Rect#aboveRect}
		 * @see {@link utils.geometry2d.Rect#onLeftOf}
		 * @see {@link utils.geometry2d.Rect#onRightOf}
		 * @see {@link utils.geometry2d.Rect#below}
		 */
		above(p) {
			return this.bottom < p.y;
		}

		/**
		 * @param {number} y
		 * @returns {boolean} <code>top &gt; y</code>
		 * @see {@link utils.geometry2d.Rect#belowRect}
		 * @see {@link utils.geometry2d.Rect#below}
		 * @see {@link utils.geometry2d.Rect#onLeftOfX}
		 * @see {@link utils.geometry2d.Rect#onRightOfX}
		 * @see {@link utils.geometry2d.Rect#aboveY}
		 */
		belowY(y) {
			return this.top > y;
		}

		/**
		 * @param {utils.geometry2d.Rect} r
		 * @returns {boolean} <code>top &gt; r.bottom</code>
		 * @see {@link utils.geometry2d.Rect#belowY}
		 * @see {@link utils.geometry2d.Rect#below}
		 * @see {@link utils.geometry2d.Rect#onLeftOfRect}
		 * @see {@link utils.geometry2d.Rect#onRightOfRect}
		 * @see {@link utils.geometry2d.Rect#aboveRect}
		 */
		belowRect(r) {
			return this.top > r.bottom;
		}

		/**
		 * @param {utils.geometry2d.Vec2} p
		 * @returns {boolean} <code>top &gt; y</code>
		 * @see {@link utils.geometry2d.Rect#belowY}
		 * @see {@link utils.geometry2d.Rect#belowRect}
		 * @see {@link utils.geometry2d.Rect#onLeftOf}
		 * @see {@link utils.geometry2d.Rect#onRightOf}
		 * @see {@link utils.geometry2d.Rect#above}
		 */
		below(p) {
			return this.top > p.y;
		}

		/**
		 * makes the instance bigger by adding the margin to it's dimensions.
		 * keeps the center at the same position.
		 * <code>left -= margin; right += margin
		 * top -= margin; bottom += margin</code>
		 * @param {number} margin
		 * @returns {utils.geometry2d.Rect} <code>this</code>
		 * @see {@link utils.geometry2d.Rect#addMarginsXY}
		 * @see {@link utils.geometry2d.Rect#addMargins}
		 */
		addMargin(margin) {
			this.left -= margin;
			this.right += margin;
			this.top -= margin;
			this.bottom += margin;
			return this;
		}

		/**
		 * makes the instance bigger by adding the margins to it's dimensions.
		 * keeps the center at the same position.
		 * <code>left -= marginX; right += marginX
		 * top -= marginY; bottom += marginY</code>
		 * @param {number} marginX
		 * @param {number} marginY
		 * @returns {utils.geometry2d.Rect} <code>this</code>
		 * @see {@link utils.geometry2d.Rect#addMargin}
		 * @see {@link utils.geometry2d.Rect#addMargins}
		 */
		addMarginsXY(marginX, marginY) {
			this.left -= marginX;
			this.right += marginX;
			this.top -= marginY;
			this.bottom += marginY;
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
		 * @returns {utils.geometry2d.Rect} <code>this</code>
		 * @see {@link utils.geometry2d.Rect#addMargin}
		 * @see {@link utils.geometry2d.Rect#addMarginsXY}
		 */
		addMargins(marginLeft, marginTop, marginRight, marginBottom) {
			this.left -= marginLeft;
			this.right += marginRight;
			this.top -= marginTop;
			this.bottom += marginBottom;
			return this;
		}

		/**
		 * adds the drawing instructions for this instance to the context.
		 * @param {CanvasRenderingContext2D} context
		 * @see {@link utils.geometry2d.Rect#draw}
		 */
		pushPath(context) {
			context.rect(this.left, this.top, this.width, this.height);
		}

		/**
		 * draws the rect on the canvas
		 * @param {CanvasRenderingContext2D} context
		 * @param {boolean} [fill=false]
		 * @param {boolean} [stroke=!fill]
		 * @see {@link utils.geometry2d.Rect#pushPath}
		 */
		draw(context, fill = false, stroke = !fill) {
			context.beginPath();
			context.rect(this.left, this.top, this.width, this.height);
			fill && context.fill();
			stroke && context.stroke();
		}

		/**
		 * draw the shape on the canvas using its webgl context.
		 * To fill the shape, the draw mode must de TRIANGLE_FAN. To only draw the outline, the mode must be LINE_LOOP.
		 * @param {Float32Array} verticesBuffer
		 * @param {nmuber} [offset=0]
		 * @returns {number} number of points added
		 */
		glSetVertices( vertices, offset=0) {
			vertices[offset] = vertices[offset+4] = this.left;
			vertices[offset+1] = vertices[offset+3] = this.top;
			vertices[offset+2] = vertices[offset+6] = this.right;
			vertices[offset+5] = vertices[offset+7] = this.botttom;
			return 4;
		}

		/**
		 * sets the attributes' values of the instance to the attributes' values of the parameter
		 * @param {utils.geometry2d.Rect} rect
		 * @returns {utils.geometry2d.Rect} <code>this</code>
		 * @see {@link utils.geometry2d.Rect#set}
		 */
		setRect(rect) {
			this.left = rect.left;
			this.right = rect.right;
			this.top = rect.top;
			this.bottom = rect.bottom;
			return this;
		}

		/**
		 * sets the attributes' values to the parameters
		 * @param {number} left
		 * @param {number} top
		 * @param {number} right
		 * @param {number} bottom
		 * @returns {utils.geometry2d.Rect} <code>this</code>
		 * @see {@link utils.geometry2d.Rect#setRect}
		 */
		set(left, top, right, bottom) {
			this.top = top;
			this.left = left;
			this.right = right;
			this.bottom = bottom;
			return this;
		}

		/**
		 * moves the instance according to the given x and y values :
		 * <code>left += x; right += x;
		 * top += y; bottom += y;</code>
		 * @param {number} x
		 * @param {number} y
		 * @returns {utils.geometry2d.Rect} <code>this</code>
		 * @see {@link utils.geometry2d.Rect#move}
		 */
		moveXY(x, y) {
			this.left += x;
			this.right += x;
			this.top += y;
			this.bottom += y;
			return this;
		}

		/**
		 * moves the instance according to the given parameter's attributes :
		 * <code>left += delta.x; right += delta.x;
		 * top += delta.y; bottom += delta.y;</code>
		 * @param {utils.geometry2d.Vec2} delta
		 * @returns {utils.geometry2d.Rect} <code>this</code>
		 * @see {@link utils.geometry2d.Rect#moveXY}
		 */
		move(delta) {
			this.left += delta.x;
			this.right += delta.x;
			this.top += delta.y;
			this.bottom += delta.y;
			return this;
		}

		/**
		 * returns the point corresponding to a certain percent of the instance's outline,
		 * starting at the top left corner.
		 * For example, getPercentPoint(0.5) will return the bottom-right corner.
		 * @param {number} percent - percentage. must be in [0-1[.
		 * @returns {utils.geometry2d.Vec2} the corresponding point.
		 */
		getPercentPoint(percent) {
			if ((percent %= 1) < 0.25) return new Vec2(this.left + percent * 4 * this.width, this.top);
			if (percent < 0.5) return new Vec2(this.right, this.top + (percent * 4 - 1) * this.height);
			if (percent < 0.75) return new Vec2(this.right - (percent * 4 - 2) * this.width, this.bottom);
			return new Vec2(this.left, this.bottom - (percent * 4 - 3) * this.height);
		}

		/**
		 * creates a rectangular {@link utils.geometry2d.Polygon} corresponding to the instance
		 * @returns {utils.geometry2d.Polygon}
		 */
		getShape() {
			return Polygon.Absolute(Vec2.createVec2Array([this.left, this.top, this.right, this.top,
				this.right, this.bottom, this.left, this.bottom]));
		}

		/**
		 * returns a string representing the instance.
		 * @returns {string} [left, top, right, bottom]
		 */
		toString() {
			return ['[', this.left, ', ', this.top, ', ', this.right, ', ', this.bottom, ']'].join('');
		}

		/**
		 * returns the union of the given rectangles, i.e. the rectangle formed by
		 * the minimum left and top, and the maximum right and bottom of all rects.
		 * If the given array is empty, returns <code>null</code>.
		 * @static
		 * @param {utils.geometry2d.Rect[]} rects
		 * @returns {?utils.geometry2d.Rect} union of the rectangles,
		 *        or null if no rectangles were passed as arguments
		 */
		static getUnion(rects) {
			let i = rects.length;
			if (i) {
				let res = rects[--i].clone();
				while (i--) {
					res.left = Math.min(res.left, rects[i].left);
					res.right = Math.max(res.right, rects[i].right);
					res.top = Math.min(res.top, rects[i].top);
					res.bottom = Math.max(res.bottom, rects[i].bottom);
				}
				return res;
			}
			else return null;
		}

		/**
		 * returns the intersection of the given rectangles, i.e. the rectangle formed by
		 * the maximum left and top, and the minimum right and bottom of all rects.
		 * if the max left(resp. top) happen to be higher than the minimum right(resp. bottom),
		 * or if the given array is null, this function returns <code>null</code>.
		 * @static
		 * @param {utils.geometry2d.Rect[]} rects
		 * @returns {?utils.geometry2d.Rect} intersection of the rects, or null.
		 */
		static getIntersection(rects) {
			let i = rects.length;
			if (i) {
				let r = rects[0], maxLeft = r.left, maxTop = r.top, minRight = r.right, minBottom = r.bottom;
				while (--i) {
					r = rects[i];
					if (r.top > maxTop) maxTop = r.top;
					if (r.left > maxLeft) maxLeft = r.left;
					if (r.right < minRight) minRight = r.right;
					if (r.bottom < minBottom) minBottom = r.bottom;
				}
				if (maxLeft <= minRight && maxTop <= minBottom) return new Rect(maxLeft, maxTop, minRight, minBottom);
			}
			return null;
		}

		/**
		 * create a {@link utils.geometry2d.Rect|Rect} where the <code>left</code> and <code>right</code> <!--
		 * -->components are equal to the x coordinate <!--
		 * -->and the <code>top</code> and <code>bottom</code> components to the y coordinate of the given point.
		 * @static
		 * @param {utils.geometry2d.Vec2} p - the point to build the rectangle around
		 * @returns {utils.geometry2d.Rect} the newly created {@link utils.geometry2d.Rect|Rect}
		 * @see {@link utils.geometry2d.Rect#createFromXY}
		 */
		static createFromPoint(p) {
			return new Rect(p.x, p.y, p.x, p.y);
		}

		/**
		 * create a {@link utils.geometry2d.Rect|Rect} where the <code>left</code> and <code>right</code> <!--
		 * -->components are equal to the x parameter <!--
		 * -->and the <code>top</code> and <code>bottom</code> components to the y parameter.
		 * @static
		 * @param x the value of the <code>left</code> and <code>right</code> components of the new
		 *            {@link utils.geometry2d.Rect|Rect}.
		 * @param y the value of the <code>top</code> and <code>bottom</code> components of the new
		 *            {@link utils.geometry2d.Rect|Rect}.
		 * @returns {utils.geometry2d.Rect} the newly created {@link utils.geometry2d.Rect|Rect}
		 */
		static createFromXY(x, y) {
			return new Rect(x, y, x, y);
		}

		/**
		 * create a {@link utils.geometry2d.Rect|Rect} where :
		 * <code>left = min(array[].x)</code>
		 * <code>top = min(array[].y)</code>
		 * <code>right = max(array[].x)</code>
		 * <code>bottom = max(array[].y)</code>.
		 * If the given array is empty, this function returns null.
		 * @static
		 * @param {utils.geometry2d.Vec2[]} array - a points array
		 * @returns {utils.geometry2d.Rect} the newly created {@link utils.geometry2d.Rect|Rect},
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
		 * creates a {@link utils.geometry2d.Rect|Rect} with the specified center, width and height.
		 * @static
		 * @param {utils.geometry2d.Vec2} center
		 * @param {number} width
		 * @param {number} height
		 * @returns {utils.geometry2d.Rect}
		 */
		static createFromCenterWidthHeight(center, width, height = width) {
			return Rect.createFromPoint(center).addMarginsXY(width / 2, height / 2);
		}
	}
	/**
	 * number of points used to draw this shape.
	 * @type {number}
	 * @name utils.geometry2d.Rect#glPointsNumber
	 */
	Rect.prototype.glPointsNumber = 4;
//######################################################################################################################
//#                                                        Shape                                                       #
//######################################################################################################################
	/**
	 * @class utils.geometry2d.Shape
	 * @abstract
	 * @memberOf utils.geometry2d
	 * @classdesc the base class of all shapes. has only one member : <!--
	 * --><code>{@link utils.geometry2d.Shape#center|center}</code>, the center of the shape, <!--
	 * -->and plenty of useful methods with default behavior.
	 */
	class Shape {
		/**
		 * @constructor
		 * @param {utils.geometry2d.Vec2} center the new center of the shape.
		 * the member of the new instance is not the same, the attributes of the parameter are copied to the member.
		 */
		constructor(center) {
			/**
			 * @name utils.geometry2d.Shape#center
			 * @type {utils.geometry2d.Vec2}
			 */
			this.center = center.clone();
		}

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
		 * returns a copy of the <code>{@link utils.geometry2d.Shape#center|center}</code> attribute of the instance.
		 * @returns {utils.geometry2d.Vec2} a copy of the center
		 */
		copyCenter() {
			return this.center.clone();
		}

		/**
		 * sets the center's attributes to the same as the parameter's
		 * @param {utils.geometry2d.Vec2}center
		 * @returns {utils.geometry2d.Shape} <code>this</code>
		 * @see {@link utils.geometry2d.Shape#setCenterXY}
		 */
		setCenter(center) {
			this.center.set(center);
			return this;
		}

		/**
		 * sets the center's attributes to the parameters
		 * @param {number} x
		 * @param {number} y
		 * @returns {utils.geometry2d.Shape} <code>this</code>
		 * @see {@link utils.geometry2d.Shape#setCenter}
		 */
		setCenterXY(x, y) {
			this.center.setXY(x, y);
			return this;
		}

		/**
		 * makes the shape bigger by multiplying it's dimensions by the given factor
		 * @param {number} factor - the number which will multiply the dimensions
		 * @returns {utils.geometry2d.Shape} <code>this</code>
		 * @see {@link utils.geometry2d.Shape#growDistance}
		 */
		scale(factor) {
			return this;
		}

		/**
		 * makes the shape bigger by adding to it's dimensions the given distance
		 * @param {number} delta - the number to add to the dimensions
		 * @returns {utils.geometry2d.Shape} <code>this</code>
		 * @see {@link utils.geometry2d.Shape#scale}
		 */
		growDistance(delta) {
			return this;
		}

		/**
		 * rotates the shape by the given angle in radians.
		 * @param {number} radians - angle.
		 * @returns {utils.geometry2d.Shape} <code>this</code>
		 */
		rotate(radians) {
			return this;
		}

		/**
		 * adds the instructions to draw this instance to the context.
		 * @param {CanvasRenderingContext2D} context
		 * @see {@link utils.geometry2d.Shape#draw}
		 */
		pushPath(context) {
		}

		/**
		 * draw the shape on the canvas using its webgl context.
		 * To fill the shape, the draw mode must de TRIANGLE_FAN. To only draw the outline, the mode must be LINE_LOOP.
		 * @param {Float32Array} verticesBuffer
		 * @param {nmuber} [offset=0]
		 * @returns {number} number of points added
		 */
		glSetVertices(vertices, offset=0) {
			return 0;
		}

		/**
		 * draws the shape on the canvas
		 * @param {CanvasRenderingContext2D} context
		 * @param {boolean} [fill=false]
		 * @param {boolean} [stroke=!fill]
		 * @see {@link utils.geometry2d.Shape#pushPath}
		 */
		draw(context, fill = false, stroke = !fill) {
			context.beginPath();
			this.pushPath(context);
			fill && context.fill();
			stroke && context.stroke();
		}

		/**
		 * returns whether or not the instance intersect (=collide) with the given shape.
		 * @param {utils.geometry2d.Shape} shape
		 * @returns {boolean} true if the 2 shapes intersect.
		 */
		intersect(shape) {
			return false;
		}

		/**
		 * returns the intersection points with the given shape
		 * @param {utils.geometry2d.Shape} shape
		 * @returns {utils.geometry2d.Vec2[]}
		 */
		getIntersectionPoints(shape) {
			return [];
		}

		/**
		 * @param {utils.geometry2d.Vec2} point
		 * @returns {boolean} true if the point is located inside the shape.
		 */
		contains(point) {
			return false;
		}

		/**
		 * returns a {@link utils.geometry2d.Rect|Rect} containing the entire shape.
		 * @returns {utils.geometry2d.Rect} the outside {@link utils.geometry2d.Rect|Rect}
		 */
		getRect() {
			return Rect.createFromPoint(this.center);
		}

		/**
		 * returns the maximum distance to the <code>{@link utils.geometry2d.Shape#center|center}</code> <!--
		 * -->a point of the shape could have.
		 * @returns {number} max distance to <code>{@link utils.geometry2d.Shape#center|center}</code>
		 */
		getRadius() {
			return 0;
		}

		/**
		 * creates a <code>{@link utils.geometry2d.Circle|Circle}</code> with the same center as the shape, <!--
		 * -->and the radius returned by <code>{@link utils.geometry2d.Shape#getRadius|getRadius}</code>.
		 * @returns {utils.geometry2d.Circle}
		 */
		getCircle() {
			return new Circle(this.center, this.getRadius());
		}

		/**
		 * returns the point corresponding to a certain percent of the instance's outline,
		 * the start point depends on the shape.
		 * @param {number} percent - percentage. must be in [0-1[.
		 * @returns {utils.geometry2d.Vec2} the corresponding point.
		 */
		getPercentPoint(percent) {
			return this.center
		};

		/**
		 * returns the closest point of the shape to the given point
		 * @param {utils.geometry2d.Vec2} p
		 * @returns {utils.geometry2d.Vec2} closest point of the shape.
		 */
		closestPointTo(p) {
			return this.center;
		}

		/**
		 * returns a copy of this shape.
		 * @returns {utils.geometry2d.Shape} the instance's copy
		 */
		clone() {
			return new Shape(this.center);
		}

		/**
		 * makes the shape the opposite of itself relative to the given horizontal axis
		 * if no value is set for axisY, the mirror will be made relative to the center's y coordinate.
		 * @param {number} [axisY=center.y]
		 *          ordinate of the horizontal axis
		 * @returns {utils.geometry2d.Shape} <code>this</code>
		 * @see {@link utils.geometry2d.Shape#mirrorHorizontally}
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
		 * @returns {utils.geometry2d.Shape} <code>this</code>
		 * @see {@link utils.geometry2d.Shape#mirrorVertically}
		 */
		mirrorHorizontally(axisX = this.center.x) {
			this.center.mirrorHorizontally(axisX);
			return this;
		}

		/**
		 * moves the shape according to the parameters
		 * @param {number} dX
		 * @param {number} dY
		 * @returns {utils.geometry2d.Shape} <code>this</code>
		 * @see {@link utils.geometry2d.Shape#move}
		 */
		moveXY(dX, dY) {
			this.center.addXY(dX, dY);
			return this;
		}

		/**
		 * moves the shape according to the parameter
		 * @param {utils.geometry2d.Vec2} delta
		 * @returns {utils.geometry2d.Shape}
		 * @returns {utils.geometry2d.Shape} <code>this</code>
		 * @see {@link utils.geometry2d.Shape#moveXY}
		 */
		move(delta) {
			this.center.add(delta);
			return this;
		}
	}
	/**
	 * number of points used to draw this shape.
	 * @type {number}
	 * @name utils.geometry2d.Shape#glPointsNumber
	 */
	Shape.prototype.glPointsNumber = 0;
//######################################################################################################################
//#                                                       Circle                                                       #
//######################################################################################################################
	/**
	 * @class utils.geometry2d.Circle
	 * @augments utils.geometry2d.Shape
	 * @memberOf utils.geometry2d
	 * @classdesc a shape representing a circle. Adds one member to the one present in <!--
	 * --><code>{@link utils.geometry2d.Shape|Shape}</code> : <!--
	 * --><code>{@link utils.geometry2d.Circle#radius|radius}</code>, <!--
	 * -->the radius of the circle.
	 */
	class Circle extends Shape {
		/**
		 * @constructor
		 * @param {utils.geometry2d.Vec2} center
		 * @param {number} radius
		 */
		constructor(center, radius) {
			super(center);
			/**
			 * @name utils.geometry2d.Circle#radius
			 * @type {number}
			 */ this.radius = radius;
		}

		/**
		 * perimeter of the circle : <code>2 \* &pi; \* {@link utils.geometry2d.Circle#radius|radius}</code>
		 * @type {number}
		 */
		get perimeter() {
			return Circle.PI2 * this.radius;
		}

		/**
		 * area of the circle : <code>&pi; \* {@link utils.geometry2d.Circle#radius|radius}<sup>2</sup></code>
		 * @type {number}
		 */
		get area() {
			return Math.pow(this.radius, 2) * Math.PI;
		}

		/**
		 * @description multiplies the radius by the argument.
		 * @param {number} factor
		 * @returns {utils.geometry2d.Circle} <code>this</code>
		 * @see [superclass method]{@link utils.geometry2d.Shape#scale}
		 * @see {@link utils.geometry2d.Circle#growDistance}
		 */
		scale(factor) {
			this.radius *= factor;
			return this;
		}

		/**
		 * adds the argument to the radius.
		 * @param {number} delta
		 * @returns {utils.geometry2d.Circle} <code>this</code>
		 * @see [superclass method]{@link utils.geometry2d.Shape#growDistance}
		 * @see {@link utils.geometry2d.Circle#scale}
		 */
		growDistance(delta) {
			this.radius += delta;
			return this;
		}

		/**
		 * returns the point of the circle, relative to its center, corresponding to the given radians.
		 * @param {number} radians
		 * @returns {utils.geometry2d.Vec2}
		 * @see {@link utils.geometry2d.Circle#pointForAngle}
		 */
		relativePointForAngle(radians) {
			return Vec2.createFromAngle(radians, this.radius);
		}

		/**
		 * returns the point of the circle, in absolute coordinates, corresponding to the given radians.
		 * @param {number} radians
		 * @returns {utils.geometry2d.Vec2}
		 * @see {@link utils.geometry2d.Circle#relativePointForAngle}
		 */
		pointForAngle(radians) {
			return Vec2.createFromAngle(radians, this.radius).add(this.center);
		}

		/**@inheritDoc*/
		pushPath(context) {
			context.arc(this.center.x, this.center.y, this.radius, 0, Circle.PI2, false);
		}
		/**
		 * draws the shape on the canvas
		 * @param {CanvasRenderingContext2D} context
		 * @param {boolean} [fill=false]
		 * @param {boolean} [stroke=!fill]
		 * @see {@link utils.geometry2d.Shape#pushPath}
		 */
		draw(context, fill = false, stroke = !fill) {
			context.beginPath();
			context.arc(this.center.x, this.center.y, this.radius, 0, Circle.PI2, false);
			fill && context.fill();
			stroke && context.stroke();
		}

		/**
		 * draw the shape on the canvas using its webgl context.
		 * To fill the shape, the draw mode must de TRIANGLE_FAN. To only draw the outline, the mode must be LINE_LOOP.
		 * @param {Float32Array} verticesBuffer
		 * @param {nmuber} [offset=0]
		 * @returns {number} number of points added
		 */
		glSetVertices(vertices, offset=0) {
			let n = this.glPointsNumber*2, dA = Circle.PI2/n, a = 0, i = 0;
			while(i < n) {
				vertices[offset+i++] = (t = Vec2.createFromAngle(a += dA, this.radius)).x;
				vertices[offset+i++] = t.y;
			}
			return n/2;
		}

		/**
		 * returns whether or not this circle instance intersect the specified shape.
		 * This function only does the job for {@link utils.geometry2d.Circle} instances. <!--
		 * -->For the instances of other classes,
		 * this function calls their method : <code>shape.intersect(this)</code>
		 * @param {utils.geometry2d.Shape} shape
		 * @returns {boolean}
		 */
		intersect(shape) {
			if (shape instanceof Circle) {
				let d = Vec2.distance(this.center, shape.center);
				return d < this.radius + shape.radius &&
					this.radius < d + shape.radius && // the other circle is not inside this circle
					shape.radius < d + this.radius; // this circle is not inside the other circle
			}
			else return shape.intersect(this);
		}

		/**
		 * returns the intersection points between this circle and the given shape
		 * @param {utils.geometry2d.Shape} shape
		 * @returns {utils.geometry2d.Vec2[]}
		 */
		getIntersectionPoints(shape) {
			if(shape instanceof Circle) {
				let trans = Vec2.translation(this.center, shape.center),
					d2 = trans.squareMagnitude,
					da = Math.acos(d2-shape.radius*shape.radius+this.radius*this.radius)/(2*Math.sqrt(d2)*this.radius),
					a = trans.angle;
				return [Vec2.createFromAngle(a + da, this.radius), Vec2.createFromAngle(a-da, this.radius)];
			} else return shape.getIntersectionPoints(this);
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
			return this.pointForAngle(percent * Circle.PI2);
		}

		/**@inheritDoc*/
		closestPointTo(p) {
			return Vec2.translation(this.center, p).setMagnitude(this.radius);
		}

		/**
		 * @returns {number} the value of the {@link utils.geometry2d.Circle#radius{radius} attribute
		 */
		getRadius() {
			return this.radius;
		}

		/**
		 * creates a copy of the circle. Does the same as {@link utils.geometry2d.Circle#clone}
		 * @returns {utils.geometry2d.Circle}
		 * @see [superclass method]{@link utils.geometry2d.Shape#getCircle}
		 */
		getCircle() {
			return new Circle(this.center, this.radius);
		}

		/**
		 * creates a copy of the circle. Does the same as {@link utils.geometry2d.Circle#getCircle}
		 * @returns {utils.geometry2d.Circle}
		 * @see [superclass method]{@link utils.geometry2d.Shape#clone}
		 */
		clone() {
			return new Circle(this.center, this.radius);
		}

		/**
		 * creates and returns an equivalent polygon.
		 * @param {number} edges - number of edges you want your polygon to have
		 * @param {number} startRadians
		 * @returns {utils.geometry2d.Polygon} the equivalent polygon
		 */
		toPolygon(edges, startRadians = 0) {
			return Polygon.Regular(this.center, [this.radius], edges, startRadians);
		}
	}
	/**
	 * number of points used to draw this shape.
	 * @type {number}
	 * @name utils.geometry2d.Circle#glPointsNumber
	 */
	Circle.prototype.glPointsNumber = 16;
	/**
	 * 2 \* PI
	 * @static
	 * @constant
	 * @memberOf utils.geometry2d.Circle
	 * @type {number}
	 */
	Circle.PI2 = 2 * Math.PI;
	/**
	 * PI / 2
	 * @static
	 * @constant
	 * @memberOf utils.geometry2d.Circle
	 * @type {number}
	 */
	Circle.PI_2 = 2 * Math.PI;
//######################################################################################################################
//#                                                      Ellipsoid                                                     #
//######################################################################################################################
	/**
	 * @class utils.geometry2d.Ellipsoid
	 * @augments utils.geometry2d.Shape
	 * @memberOf utils.geometry2d
	 * @classdesc a shape representing an ellipsoid, optimized for drawing. make sure to always have <!--
	 * -->{@link utils.geometry2d.Ellipsoid#radiusX|radiusX} &ge; <!--
	 * -->{@link utils.geometry2d.Ellipsoid#radiusX|radiusX} for the methods to work properly.
	 * You can reorder radiusX and radiusY by calling the {@utils.geometry2d.Ellipsoid#checkRadius|checkRadius} <!--
	 * -->method.
	 * <b>&#x26A0;</b> ellipsoids cannot be used for collision detection, and most of their methods take time. <!--
	 * -->You can make an ellipsoid-like {@link utils.geometry2d.Polygon|Polygon} by calling the method <!--
	 * -->{@link utils.geometry2d.Ellipsoid#toPolygon|toPolygon}, or directly by calling the static method <!--
	 * -->[Polygon.createEllipsoid]{@link utils.geometry2d.Polygon#createEllipsoid}.
	 */
	class Ellipsoid extends Shape {
		/**
		 * @constructor
		 * @param {utils.geometry2d.Vec2}center
		 * @param {number} radiusX
		 * @param {number} radiusY
		 * @param {number} radians
		 */
		constructor(center, radiusX, radiusY, radians = 0) {
			super(center);
			/**
			 * horizontal radius
			 * @name utils.geometry2d.Ellipsoid#radiusX
			 * @type {number}
			 */
			this.radiusX = radiusX;
			/**
			 * vertical radius;
			 * @name utils.geometry2d.Ellipsoid#radiusY
			 * @type {number}
			 */
			this.radiusY = radiusY;
			/**
			 * @name utils.geometry2d.Ellipsoid#angle
			 * @type {number}
			 */
			this.angle = radians;
		}

		/**
		 * square of the focus distance : <code>{@link utils.geometry2d.Ellipsoid#radiusX|radiusX}<sup>2</sup> <!--
		 * -->- {@link utils.geometry2d.Ellipsoid#radiusY|radiusY}<sup>2</sup></code>
		 * @type {number}
		 * @readonly
		 */
		get squareFocusDistance() {
			return this.radiusX * this.radiusX - this.radiusY * this.radiusY;
		}

		/**
		 * focus distance : <code>&radic;({@link utils.geometry2d.Ellipsoid#radiusX|radiusX}<sup>2</sup> <!--
		 * -->- {@link utils.geometry2d.Ellipsoid#radiusY|radiusY}<sup>2</sup>)</code>
		 * @type {number}
		 * @readonly
		 */
		get focusDistance() {
			return Math.sqrt(this.squareFocusDistance);
		}

		/**
		 * excentricity = <code>([focus distance]{@link utils.geometry2d.Ellipsoid#focusDistance|focusDistance}) <!--
		 * -->/ ([horizontal radius]{@link utils.geometry2d.Ellipsoid#radiusX})</code>
		 * @type {number}
		 */
		get excentricity() {
			return this.focusDistance / this.radiusX;
		}

		/**
		 * approximation of the perimeter of the ellipsoid : <code>&pi; \* &radic;(2 \* <!--
		 * -->({@link utils.geometry2d.Ellipsoid#radiusX|radiusX}<sup>2</sup> <!--
		 * -->+ {@link utils.geometry2d.Ellipsoid#radiusY|radiusY}<sup>2</sup>))</code>
		 * @type {number}
		 */
		get perimeter() {
			return Math.PI * Math.sqrt(2 * this.squareFocusDistance);
		}

		/**
		 * area of the ellipsoid : <code>{@link utils.geometry2d.Ellipsoid#radiusX|radiusX} <!--
		 * -->\* {@link utils.geometry2d.Ellipsoid#radiusY|radiusY} \* &pi;</code>
		 * @type {number}
		 */
		get area() {
			return this.radiusX * this.radiusY * Math.PI;
		}

		/**
		 * makes the ellipsoid the opposite of itself relative to the given vertical axis
		 * if no value is set for axisX, the mirror will be made relative to the center's x coordinate.
		 * @param {number} [axisX=center.x]
		 *          abscissa of the vertical axis
		 * @returns {utils.geometry2d.Shape} <code>this</code>
		 */
		mirrorHorizontally(axisX = this.center.x) {
			this.radians = -this.radians;
			return super.mirrorHorizontally(axisX);
		}

		/**
		 * makes the ellipsoid the opposite of itself relative to the given horizontal axis
		 * if no value is set for axisY, the mirror will be made relative to the center's y coordinate.
		 * @param {number} [axisY=center.y]
		 *          ordinate of the vertical axis
		 * @returns {utils.geometry2d.Shape} <code>this</code>
		 */
		mirrorVertically(axisY = this.center.y) {
			this.radians = -this.radians;
			return super.mirrorVertically(axisY);
		}

		/**
		 * multiplies the vertical and horizontal radius by the given factor.
		 * @param {number} factor
		 * @returns {utils.geometry2d.Ellipsoid} <code>this</code>
		 */
		scale(factor) {
			this.radiusX *= factor;
			this.radiusY *= factor;
			return this;
		}

		/**
		 * adds the argument to the vertical and horizontal radius.
		 * @param {number} delta
		 * @returns {utils.geometry2d.Ellipsoid} <code>this</code>
		 */
		growDistance(delta) {
			this.radiusX += delta;
			this.radiusY += delta;
			return this;
		}

		/**
		 * rotate the ellipsoid by the specified angle, in radians
		 * @param {number} radians
		 * @returns {utils.geometry2d.Ellipsoid} <code>this</code>
		 */
		rotate(radians) {
			this.radians += radians;
			return this;
		}

		/**
		 * sets the {@link utils.geometry2d.Ellipsoid#radians|radians} attribute to the specified value.
		 * @param {number} radians
		 * @returns {utils.geometry2d.Ellipsoid} <code>this</code>
		 */
		setAngle(radians) {
			this.radians = radians;
			return this;
		}

		/**
		 * checks if the horizontal radius is the same as the vertical radius. if they're not, they are inverted, <!--
		 * -->and the ellipsoid rotated anticlockwise for it to look the same.
		 * @returns {utils.geometry2d.Ellipsoid} <code>this</code>
		 */
		checkRadius() {
			if (this.radiusX < this.radiusY) {
				[this.radiusX, this.radiusY] = [this.radiusY, this.radiusX];
				this.setAngle(this.radians + Circle.PI_2);
			}
			return this;
		}

		/**
		 * returns the point of the ellipsoid, relative to its center, corresponding to the given radians.
		 * @param {number} radians
		 * @returns {utils.geometry2d.Vec2}
		 * @see {@link utils.geometry2d.Ellipsoid#pointForAngle}
		 */
		relativePointForAngle(radians) {
			let r = radians - this.radians;
			return new Vec2(this.radiusX * Math.cos(r), this.radiusY * Math.sin(r)).rotate(this.radians);
		}

		/**
		 * returns the point of the ellipsoid, in absolute coordinates, corresponding to the given radians.
		 * @param {number} radians
		 * @returns {utils.geometry2d.Vec2}
		 * @see {@link utils.geometry2d.Ellipsoid#relativePointForAngle}
		 */
		pointForAngle(radians) {
			return this.relativePointForAngle(radians).add(this.center);
		}

		/**
		 * returns the square distance from the center to the ellipsoid for the specified angle in radians
		 * @param {number} radians
		 * @returns {number}
		 * @see {@link utils.geometry2d.Ellipsoid#radiusForAngle}
		 */
		squareRadiusForAngle(radians) {
			return this.relativePointForAngle(radians).squareMagnitude;
		}

		/**
		 * returns the distance from the center to the ellipsoid for the specified angle in radians
		 * @param {number} radians
		 * @returns {number}
		 * @see {@link utils.geometry2d.Ellipsoid#squareRadiusForAngle}
		 */
		radiusForAngle(radians) {
			return Math.sqrt(this.squareRadiusForAngle(radians));
		}

		/**@inheritDoc*/
		pushPath(context) {
			context.ellipse(this.center.x, this.center.y, this.radiusX, this.radiusY, this.radians, 0, Circle.PI2);
		}
		/**
		 * draws the shape on the canvas
		 * @param {CanvasRenderingContext2D} context
		 * @param {boolean} [fill=false]
		 * @param {boolean} [stroke=!fill]
		 * @see {@link utils.geometry2d.Shape#pushPath}
		 */
		draw(context, fill = false, stroke = !fill) {
			context.beginPath();
			context.ellipse(this.center.x, this.center.y, this.radiusX, this.radiusY, this.radians, 0, Circle.PI2);
			fill && context.fill();
			stroke && context.stroke();
		}

		/**
		 * draw the shape on the canvas using its webgl context.
		 * To fill the shape, the draw mode must de TRIANGLE_FAN. To only draw the outline, the mode must be LINE_LOOP.
		 * @param {Float32Array} verticesBuffer
		 * @param {nmuber} [offset=0]
		 * @returns {number} number of points added
		 */
		glSetVertices(vertices, offset=0) {
			let n = this.glPointsNumber*2, dA = Circle.PI2/n, a = 0, i = 0,t;
			while(i < n) {
				vertices[offset+i++] = (t = this.pointForAngle(a += dA)).x;
				vertices[offset+i++] = t.y;
			}
			return n/2;
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
			return this.pointForAngle(Circle.PI2 * percent + this.radians);
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
		 * @returns {@link utils.geometry2d.Polygon} polygon equivalent of this ellipsoid
		 */
		createPolygon(edges) {
			return Polygon.createEllipsoid(this.center, this.radiusX, this.radiusY, edges, this.radians);
		}
	}
	/**
	 * number of points used to draw this shape.
	 * @type {number}
	 * @name utils.geometry2d.Ellipsoid#glPointsNumber
	 */
	Ellipsoid.prototype.glPointsNumber = 16;
//######################################################################################################################
//#                                                        Line                                                        #
//######################################################################################################################
	let A = Vec2.zero, B = Vec2.zero, C = Vec2.zero, D = Vec2.zero, AB = Vec2.zero, AC = Vec2.zero, AD = Vec2.zero,
		u = Vec2.zero, CD = Vec2.zero, d=0, BC = Vec2.zero, BD = Vec2.zero;
	/**
	 * @class utils.geometry2d.Line
	 * @augments utils.geometry2d.Shape
	 * @memberOf utils.geometry2d
	 * @classdesc a linear shape, represented by its center, length and rotation. the representation brings <!--
	 *        -->optimizations for movements, rotations and dimensions changes, but also brings lack of optimization<!--
	 *        --> for collisions and drawing.
	 */
	class Line extends Shape {
		/**
		 * @constructor
		 * @param {utils.geometry2d.Vec2} p0
		 * @param {utils.geometry2d.Vec2} p1
		 */
		constructor(p0, p1) {
			super(p0.clone().add(p1).mul(0.5));
			AB.set(p1).remove(p0);
			/**
			 * the angle, in radians, of the line.
			 * @name utils.geometry2d.Line#angle
			 * @type {number}
			 */
			this.angle = AB.angle;
			/**
			 * the length of the line.
			 * @name utils.geometry2d.Line#length
			 * @type {number}
			 */
			this.length = AB.magnitude;
		}

		/**
		 * start point of the line.
		 * @type {utils.geometry2d.Vec2}
		 */
		get p0() {
			return Vec2.createFromAngle(this.angle).mul(-0.5 * this.length).add(this.center);
		}

		/**
		 * @param {utils.geometry2d.Vec2} p
		 */
		set p0(p) {
			AB.set(this.p1).remove(p);
			this.angle = AB.angle;
			this.length = AB.magnitude;
			this.center.set(AB.mul(0.5).add(p));
			return p;
		}

		/**
		 * end point of the line.
		 * @type {utils.geometry2d.Vec2}
		 */
		get p1() {
			return Vec2.createFromAngle(this.angle).mul(0.5 * this.length).add(this.center);
		}

		/**
		 * @param {utils.geometry2d.Vec2} p
		 */
		set p1(p) {
			AB.set(p).remove(this.p0);
			this.angle = AB.angle;
			this.length = AB.magnitude;
			this.center.set(AB.mul(-0.5).add(p));
			return p;
		}

		/**
		 * vector from start point to end point.
		 * @type {utils.geometry2d.Vec2}
		 * @readonly
		 */
		get vector() {
			return Vec2.createFromAngle(this.angle, this.length);
		}

		/**
		 * unit vector (magnitude=1) from start point to end point.
		 * @type {utils.geometry2d.Vec2}
		 * @readonly
		 */
		get directorVect() {
			return Vec2.createFromAngle(this.angle);
		}

		/**
		 * perimeter of the line : <code>2 \* {@link utils.geometry2d.Line#length|length} </code>
		 * @type {number}
		 * @readonly
		 */
		get perimeter() {
			return this.length * 2;
		}

		/**
		 * sets the {@link utils.geometry2d.Line#angle} attribute to the specified value.
		 * @param {number} radians
		 * @returns {utils.geometry2d.Line} <code>this</code>
		 */
		setAngle(radians) {
			this.angle = radians;
			return this;
		}

		/**
		 * sets the {@link utils.geometry2d.Line#length} attribute to the specified value.
		 * @param {number} length
		 * @returns {utils.geometry2d.Line} <code>this</code>
		 */
		setLength(length) {
			this.length = length;
			return this;
		}

		/**
		 * sets the start point of the line to the specified point.
		 * @param {utils.geometry2d.Vec2} p
		 * @returns {utils.geometry2d.Line} <code>this</code>
		 */
		setP0(p) {
			this.p0 = p;
			return this;
		}

		/**
		 * sets the end point of the line to the specified point.
		 * @param {utils.geometry2d.Vec2} p
		 * @returns {utils.geometry2d.Line} <code>this</code>
		 */
		setP1(p) {
			this.p1 = p;
			return this;
		}

		/**
		 * sets both start and end points to the specified points
		 * @param {utils.geometry2d.Vec2} p0
		 * @param {utils.geometry2d.Vec2} p1
		 * @returns {utils.geometry2d.Line} <code>this</code>
		 */
		setPoints(p0, p1) {
			AB.set(p1).remove(p0);
			this.angle = t.angle;
			this.length = t.magnitude;
			this.center.set(t.mul(0.5).add(p0));
			return this;
		}

		/**
		 * multiplies the line's length by the specified factor.
		 * @param {number} factor
		 * @returns {utils.geometry2d.Line} <code>this</code>
		 */
		scale(factor) {
			this.length *= factor;
			return this;
		}

		/**
		 * add to the line's length twice the parameter.
		 * @param {number} delta
		 * @returns {utils.geometry2d.Line} <code>this</code>
		 */
		growDistance(delta) {
			this.length += 2 * delta;
		}

		/**
		 * rotates the line by the specified angle in radians
		 * @param {number} radians
		 * @returns {utils.geometry2d.Line}
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
		 * @returns {utils.geometry2d.Line} <code>this</code>
		 */
		mirrorVertically(axisY = this.center.y) {
			super.mirrorVertically(axisY);
			this.angle = -this.angle;
			return this;
		}

		/**
		 * makes the line the mirror of itself relative to the given vertical axis
		 * if no value is set for axisX, the mirror will be made relative to the center's x coordinate.
		 * @param {number} [axisX=center.x]
		 *          abscissa of the vertical axis
		 * @returns {utils.geometry2d.Line} <code>this</code>
		 */
		mirrorHorizontally(axisX = this.center.x) {
			super.mirrorHorizontally(axisX);
			this.angle = Math.PI - this.angle;
			return this;
		}

		/**
		 * adds the drawing instructions to the context. Be aware that if you just "fill" the line, <!--
		 * -->it won't be drawn on the canvas, you must "stroke" it to make it appear on the canvas.
		 * @param {CanvasRenderingContext2D} context
		 */
		pushPath(context) {
			AB.setXY(Math.cos(this.angle), Math.sin(this.angle)).mul(this.length*0.5);
			context.moveTo(this.center.x - AB.x, this.center.y - AB.y);
			context.lineTo(this.center.x + AB.x, this.center.y + AB.y);
		}
		/**
		 * draws the shape on the canvas
		 * @param {CanvasRenderingContext2D} context
		 * @param {boolean} [fill=false]
		 * @param {boolean} [stroke=!fill]
		 * @see {@link utils.geometry2d.Shape#pushPath}
		 */
		draw(context, fill = false, stroke = !fill) {
			context.beginPath();
			AB.setXY(Math.cos(this.angle), Math.sin(this.angle)).mul(this.length*0.5);
			context.moveTo(this.center.x - AB.x, this.center.y - AB.y);
			context.lineTo(this.center.x + AB.x, this.center.y + AB.y);
			fill && context.fill();
			stroke && context.stroke();
		}

		/**
		 * draw the shape on the canvas using its webgl context.
		 * To fill the shape, the draw mode must de TRIANGLE_FAN. To only draw the outline, the mode must be LINE_LOOP.
		 * @param {Float32Array} verticesBuffer
		 * @param {nmuber} [offset=0]
		 * @returns {number} number of points added
		 */
		glSetVertices(vertices, offset=0) {
			vertices[offset] = (A = this.p0).x;
			vertices[offset+1] = A.y;
			vertices[offset+2] = (B=this.p1).x;
			vertices[offset+3] = B.y;
			return 2;
		}

		/**
		 * check if the line intersect with the shape.
		 * The checking is only made for {@link utils.geometry2d.Circle} and {@link utils.geometry2d.Line} instances.
		 * if the specified shape is not an instance of those classes, this function returns the result of <!--
		 * --><code>shape.intersect(this)</code>
		 * @param {utils.geometry2d.Shape} shape
		 * @returns {boolean}
		 */
		intersect(shape) {
			if (shape instanceof Circle) {
				A = this.p0;
				B = this.p1;
				if (shape.contains(A)) return !shape.contains(B);
				if (shape.contains(B)) return !shape.contains(A);
				AC.set(shape.center).remove(A);
				u.set(B).remove(A).normalize();
				d = Vec2.dotProd(u, AC);
				/*
				//checking d < 0 and d > length is useless because it would mean A or B is in the circle,
				//which is already check at the beginning of the function
				return Vec2.distance((d < 0) ? A : (d > this.length)? B : u.mul(d).add(A), shape.center)<=shape.radius;
				/*/
				return  (d >= 0 && d <= this.length && Vec2.squareDistance(u.mul(d).add(A), shape.center))
					<= shape.radius*shape.radius;
				//*/
			} else if (shape instanceof Line) {
					//ccw(AC, AD) != ccw(BC, BD)
				if (Vec2.ccw2(AC.set(C = shape.p0).remove(A = this.p0), AD.set(D = shape.p1).remove(A))
					!== Vec2.ccw2(C.remove(B = this.p1), D.remove(B))) {
					AB.set(B).remove(A);
					return Vec2.ccw2(AB, AC) !== Vec2.ccw2(AB, AD);
				}
				else return false;
			}
			else return shape.intersect(this);
		}

		/**
		 * returns the intersection points between this line and the given shape.
		 * The array is empty if the line and the other
		 * @param {utils.geometry2d.Shape} shape
		 * @returns {utils.geometry2d.Vec2[]}
		 */
		getIntersectionPoints(shape) {
			if(shape instanceof Circle) {
				A = this.p0;
				C = shape.center;
				u.set(this.p1.remove(A).normalize());
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
			} else if(shape instanceof Line) {
				let p = Line.intersectionPoint(this, shape);
				if(p.onLine1 && p.onLine2) return [p.point];
				else return [];
			} else return shape.getIntersectionPoints(this);
		}

		/**
		 * returns whether or not the line contains the given point.
		 * As the result is rarely realistic because a line has an infinitely thin width, you should use the <!--
		 * -->{@link utils.geometry2d.Line#distanceToPoint} instead.
		 * @param {utils.geometry2d.Vec2} point
		 * @returns {boolean}
		 */
		contains(point) {
			let v = Vec2.translation(this.center, point), u = this.directorVect;
			return v.equals(u.mul(Vec2.distance(this.center, point))) || v.equals(u.mul(-1));
		}

		/**
		 * returns the closest point of the line to the specified point.
		 * @param {utils.geometry2d.Vec2} p
		 * @returns {utils.geometry2d.Vec2}
		 */
		closestPointTo(p) {
			A = this.p0;
			u = this.directorVect;
			AC.set(p).remove(A);
			d = Vec2.dotProd(u, AC);
			return (d < 0) ? A : (d > this.length) ? u.mul(this.length).add(A) : u.mul(d).add(A);
		}

		/**
		 * return the distance from the closest point of the line to the given point
		 * @param {utils.geometry2d.Vec2} point
		 * @returns {number}
		 */
		distanceToPoint(point) {
			return Vec2.distance(this.closestPointTo(point), point);
		}

		/**
		 * returns the normal vector of the line, the direction depends on the parameter
		 * @param {boolean} [left=true]
		 * @returns {utils.geometry2d.Vec2}
		 */
		getNormalVect(left = true) {
			return this.directorVect.rotate(left ? -Circle.PI_2 : Circle.PI_2);
		}

		/**
		 * creates a new {@link utils.geometry2d.Rect} instance fitted for the line.
		 * @returns {utils.geometry2d.Rect}
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
			return this.length * 0.5;
		}

		/**
		 * creates a copy of the line.
		 * @returns {utils.geometry2d.Line}
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
		 * @param {utils.geometry2d.Line} line1
		 * @param {utils.geometry2d.Line} line2
		 * @returns {?{point: utils.geometry2d.Vec2, onLine1: boolean, onLine2: boolean}}
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
				point: A.add(AB.mul(pos1)),
				onLine1: pos1 > 0 && pos1 < 1,
				onLine2: pos2 > 0 && pos2 < 1
			};
		}

		/**
		 * creates a line from a start point and a vector from start point to end point
		 * @param {utils.geometry2d.Vec2} A
		 * @param {utils.geometry2d.Vec2} AB
		 * @returns {utils.geometry2d.Line}
		 */
		static createFromPointVector(A, AB) {
			return new Line(A, A.clone().add(AB));
		}
	}
	/**
	 * number of points used to draw this shape.
	 * @type {number}
	 * @name utils.geometry2d.Line#glPointsNumber
	 */
	Line.prototype.glPointsNumber = 2;
//######################################################################################################################
//#                                                        Point                                                       #
//######################################################################################################################
	/**
	 * @class utils.geometry2d.Point
	 * @augments utils.geometry2d.Shape
	 * @memberOf utils.geometry2d
	 * @classdesc a very simple shape containing only necessary overridden methods to make it usable
	 */
	class Point extends Shape {
		/**
		 * @constructor
		 * @param {utils.geometry2d.Vec2} p
		 */
		constructor(p) {
			super(p);
		}

		/**
		 * adds drawing instructions to draw a rectangle 2 units sided, centered on <!--
		 * -->[center]{@link utils.geometry2d.Shape#center} attribute.
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
		 * @see {@link utils.geometry2d.Shape#pushPath}
		 */
		draw(context, fill = true, stroke = !fill) {
			context.fillRect(this.center.x - 1, this.center.y - 1, 2, 2);
		}

		/**
		 * draw the shape on the canvas using its webgl context.
		 * To fill the shape, the draw mode must de TRIANGLE_FAN. To only draw the outline, the mode must be LINE_LOOP.
		 * @param {Float32Array} verticesBuffer
		 * @param {nmuber} [offset=0]
		 * @returns {number} number of points added
		 */
		glSetVertices(vertices, offset=0) {
			vertices[offset] = this.center.x;
			vertices[offset+1] = this.center.y;
			return 1;
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
	 * number of points used to draw this shape.
	 * @type {number}
	 * @name utils.geometry2d.Point#glPointsNumber
	 */
	Point.prototype.glPointsNumber = 1;
//######################################################################################################################
//#                                                       Polygon                                                      #
//######################################################################################################################
	let len = 0, i = 0, res = 0, p0 = Vec2.zero, p1 = Vec2.zero;
	// above variables are used to make methods faster and avoid memory leaks creating variables every time
	/**
	 * @class utils.geometry2d.Polygon
	 * @augments utils.geometry2d.Shape
	 * @memberOf utils.geometry2d
	 * @classdesc a class using multiple points, where their coordinates are relative to the center of the shape.
	 * This representation is optimized for movements and transformations, but not optimized for drawing and <!--
	 * -->memory,  because it has all the points in memory (2 numbers each}, plus the center <!--
	 * -->coordinate (2 numbers).
	 */
	class Polygon extends Shape {
		/**
		 * constructor of the Polygon, taking the center and points relative to this center as arguments.
		 * @constructor
		 * @param {utils.geometry2d.Vec2} center
		 * @param {utils.geometry2d.Vec2[]} relativePoints
		 */
		constructor(center, relativePoints) {
			super(center);
			i = relativePoints.length;
			/**
			 * @name utils.geometry2d.Polygon#points
			 * @type {utils.geometry2d.Vec2[]}
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
		 * multiplies the distance to the center of all points by the specified factor
		 * @param {number} factor
		 * @returns {utils.geometry2d.Polygon} <code>this</code>
		 */
		scale(factor) {
			i = this.points.length;
			while (i--) this.points[i].mul(factor);
			return this;
		}

		/**
		 * increase the distance to the center of all points by the specified distance
		 * @param {number} delta
		 * @returns {utils.geometry2d.Polygon} <code>this</code>
		 */
		growDistance(delta) {
			i = this.points.length;
			while (i--) this.points.magnitude += delta;
			return this;
		}

		/**
		 * rotate the instance by the specified angle in radians.
		 * @param {number} radians
		 * @returns {utils.geometry2d.Polygon}
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
		 * @returns {utils.geometry2d.Polygon} <code>this</code>
		 */
		mirrorVertically(axisY = this.center.y) {
			super.mirrorVertically(axisY);
			i = this.points.length;
			while (i--) this.points[i].mirrorVertically();
			return this;
		}

		/**
		 * makes the line the mirror of itself relative to the given vertical axis
		 * if no value is set for axisX, the mirror will be made relative to the center's x coordinate.
		 * @param {number} [axisX=center.x]
		 *          abscissa of the vertical axis
		 * @returns {utils.geometry2d.Polygon} <code>this</code>
		 */
		mirrorHorizontally(axisX) {
			super.mirrorHorizontally(axisX);
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
		 * @see {@link utils.geometry2d.Shape#pushPath}
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
		 * draw the shape on the canvas using its webgl context.
		 * To fill the shape, the draw mode must de TRIANGLE_FAN. To only draw the outline, the mode must be LINE_LOOP.
		 * @param {Float32Array} verticesBuffer
		 * @param {nmuber} [offset=0]
		 * @returns {number} number of points added
		 */
		glSetVertices(vertices, offset=0) {
			let n = this.points.length, dA = Circle.PI2/n, a = 0, i = 0, j=offset, t;
			while(i < n) {
				vertices[j++] = (t = Vec2.getPoint(i++)).x;
				vertices[j++] = t.y;
			}
			return n;
		}

		/**
		 * returns a copy of the point, in absolute coordinates, of the index you specified.
		 * @param {number} index
		 * @returns {utils.geometry2d.Vec2}
		 */
		getPoint(index) {
			return this.points[index].clone().add(this.center);
		}

		/**
		 * returns copies of all the points of the polygon, in absolute coordinates.
		 * @returns {utils.geometry2d.Vec2[]}
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
		 * @returns {utils.geometry2d.Line}
		 */
		getLine(index) {
			len = this.points.length;
			return new Line(this.points[(index++) % len], this.points[index % len]).move(this.center);
		}

		/**
		 * returns the line, in relative coordinates, formed by the points of indices <!--
		 * --><code>index</code> and <code>index+1</code>
		 * @param {number} index the index of the start point
		 * @returns {utils.geometry2d.Line}
		 */
		getRelativeLine(index) {
			len = this.points.length;
			return new Line(this.points[(index++) % len], this.points[index % len]);
		}

		/**
		 * returns the lines forming the polygon
		 * @returns {utils.geometry2d.Line[]}
		 */
		getLines() {
			len = this.points.length;
			i = len;
			let arr = new Array(i);
			while (i--) arr[i] = new Line(this.points[i], this.points[(i + 1) % len]).move(this.center);
			return arr;
		}

		/**
		 * get the normal vector of the line of the specified index
		 * @param {number} index
		 * @returns {utils.geometry2d.Vec2}
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
		 * @returns {utils.geometry2d.Polygon}
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
		 * The checking is only made for {@link utils.geometry2d.Circle}, {@link utils.geometry2d.Line} and <!--
		 * {@link utils.geometry2d.Polygon} instances.
		 * if the specified shape is not an instance of those classes, this function returns the result of <!--
		 * --><code>shape.intersect(this)</code>
		 * @param {utils.geometry2d.Shape} shape
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
			} else while (i--) {
				if (lines[i].intersect(shape)) return true;
			}
			return false;
		}

		/**
		 * returns the intersection points between this polygon and the given shape
		 * @param {utils.geometry2d.Shape} shape
		 * @returns {utils.geometry2d.Vec2[]}
		 */
		getIntersectionPoints(shape) {
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
			} else while(i--) {
				Array.prototype.push.apply(res, lines[i].getIntersectionPoints(shape));
			}
			return res;
		}

		/**
		 * returns the line of the instance intersecting with the given shape, or null if no line is found
		 * If you only want to check lines after a known index, you can put this index as a second parameter <!--
		 * -->of the function.
		 * @param {utils.geometry2d.Shape} shape
		 * @param {number} [startIndex=0]
		 * @returns {?utils.geometry2d.Line}
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
		 * @param {utils.geometry2d.Shape} shape
		 * @param {number} [startIndex=0]
		 * @returns {utils.geometry2d.Line[]}
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
		 * tells if a point is located inside the instance using the following method :
		 * - get the width and height of the instance
		 * - create 4 long enough lines, all starting from the point : one going left, one right, one up and one down
		 * - check if all lines intersect the instance.
		 * this method is not optimized, and work for most polygons, except too complex concave polygons.
		 * @param {utils.geometry2d.Vec2} point
		 * @returns {boolean}
		 */
		contains(point) {
			let rect = this.getRect(), w = rect.width + 10, h = rect.height + 10, endPoint = point.clone(),
				l = new Line(point, endPoint.addXY(-w,0));
			return this.intersect(l)
				&& this.intersect(l.setP1(endPoint.addXY(w+w,0)))
				&& this.intersect(l.setP1(endPoint.addXY(-w,-h)))
				&& this.intersect(l.setP1(endPoint.addXY(0,h+h)));
		}

		/**
		 * creates and returns a {@link utils.geometry2d.Rect} instance fitting the <!--
		 * -->{@link utils.geometry2d.Polygon} instance
		 * @returns {utils.geometry2d.Rect}
		 */
		getRect() {
			let left = 0, top = 0, right = 0, bottom = 0, point, i = this.points.length;
			while (i--) {
				point = this.points[i];
				if (point.x < left) left = point.x; else if (point.x > right) right = point.x;
				if (point.y < top) top = point.y; else if (point.y > bottom) bottom = point.y;
			}
			return new Rect(left, top, right, bottom).move(this.center);
		}

		/**
		 * returns the point of the polygon corresponding to the percentage of the perimeter "walked" on the polygon
		 * @param {number} p
		 * @returns {utils.geometry2d.Vec2}
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
		 * @param {utils.geometry2d.Vec2} p
		 * @returns {?utils.geometry2d.Vec2}
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
		 * -->mean of the points of the instance.
		 * - if the parameter is not null, this method will move all points by the opposite of the specified <!--
		 * -->value, to move the center in the polygon by the value.
		 * <br/>
		 * At the end, the center will remain unchanged, but the points will be moved so the center will look, <!--
		 * relatively to the other points, at the center (delta=null) / moved by delta (delta!==null).
		 * @param {?utils.geometry2d.Vec2} [delta=null]
		 * @returns {utils.geometry2d.Polygon} this
		 */
		redefineCenter(delta = null) {
			let i = this.points.length;
			if (!i) return;
			if (!delta) {
				delta = Vec2.zero;
				let len = i;
				while (i--) delta.add(this.points[i]);
				delta.mul(1 / len);
				this.redefineCenter(delta);
				i = len;
			}
			while (i--) this.points[i].remove(delta);
			return this;
		}

		/**
		 * creates and returns a copy of this instance
		 * @returns {utils.geometry2d.Polygon}
		 */
		clone() {
			return new Polygon(this.center, this.points);
		}

		/**
		 * creates a polygon from absolute points. the center is computed from <!--
		 * -->the average coordinates of the given points
		 * @param {utils.geometry2d.Vec2[]}pointsArray
		 * @returns {utils.geometry2d.Polygon}
		 */
		static Absolute(pointsArray) {
			return new Polygon(Vec2.ZERO, pointsArray).redefineCenter();
		}

		/**
		 * create a rectangular polygon from a center, a width and a height.
		 * @param {utils.geometry2d.Vec2} center
		 * @param {number} width
		 * @param {number} height
		 * @returns {utils.geometry2d.Polygon}
		 */
		static Rectangular(center, width, height) {
			let left = -width * 0.5, top = -height * 0.5, right = left + width, bottom = top + height;
			return new Polygon(center, Vec2.createVec2Array([left, top, right, top, right, bottom, left, bottom]));
		}

		/**
		 * creates an ellipsoid-like polygon
		 * @param {utils.geometry2d.Vec2} center
		 * @param {number} radiusX
		 * @param {number} radiusY
		 * @param {number} edges
		 * @param {number} radians
		 * @returns {utils.geometry2d.Polygon}
		 */
		static Ellipsoidal(center, radiusX, radiusY, edges, radians = 0) {
			let dA = Circle.PI2 / edges, a = Circle.PI2, points = new Array(edges), i = edges;
			while (i--) {
				a -= dA;
				points[i] = Vec2(radiusX * Math.cos(a), radiusY * Math.sin(a));
			}
			return new Polygon(center, points);
		}

		/**
		 * creates a regular polygon. This function can have different behaviors
		 * @param {utils.geometry2d.Vec2} center
		 * @param {number|number[]} radiusArray
		 * @param {number} pointsNumber
		 * @param {number} startRadians
		 * @returns {utils.geometry2d.Polygon}
		 */
		static Regular(center, radiusArray, pointsNumber, startRadians) {
			let dR = (Circle.PI2) / pointsNumber, angle = startRadians, rLen = radiusArray.length,
				p = new Polygon(center, []);
			p.points = new Array(pointsNumber);
			if (rLen !== undefined) {
				let i = -1;
				while (i++ < pointsNumber) {
					p.points[i] = Vec2.createFromAngle(angle, radiusArray[i % rLen]);
					angle += dR;
				}
			}
			else {
				let i = pointsNumber;
				while (i--) {
					p.points[i] = Vec2.createFromAngle(angle, radiusArray);
					angle += dR;
				}
			}
			return p;
		}
	}
//######################################################################################################################
//#                                                         Ray                                                        #
//######################################################################################################################
	/**
	 * @class utils.geometry2d.Ray
	 * @augments utils.geometry2d.Shape
	 * @memberOf utils.geometry2d
	 * @classdesc a class representing an infinite ray, defined by an origin point and the angle of the direction <!--
	 * -->it is pointing toward. the origin of the ray is defined by the <!--
	 * -->{@link utils.geometry2d.Shape#center|center} attribute.
	 */
	class Ray extends Shape {
		/**
		 * @constructor
		 * @param {utils.geometry2d.Vec2} origin
		 * @param {number} radians
		 */
		constructor(origin, radians) {
			super(origin);
			/**
			 * @name utils.geometry2d.Ray#angle
			 * @type {number}
			 */
			this.angle = radians;
		}

		/**
		 * <code>=Infinity</code>
		 * @name utils.geometry2d.Ray#perimeter
		 * @type {Number}
		 * @readonly
		 */
		get perimeter() {
			return Infinity;
		}

		/**
		 * rotates the ray around its origin.
		 * @param {number} radians
		 * @returns {utils.geometry2d.Ray} <code>this</code>
		 */
		rotate(radians) {
			this.angle += radians;
			return this;
		}

		/**
		 * makes the ray the opposite of itself relative to the given horizontal axis
		 * if no value is set for axisY, the mirror will be made relative to the origin's y coordinate.
		 * @param {number} [axisY=center.y] ordinate of the horizontal axis
		 * @returns {utils.geometry2d.Ray} <code>this</code>
		 * @see {@link utils.geometry2d.Ray#mirrorHorizontally}
		 */
		mirrorVertically(axisY = this.center.y) {
			super.mirrorVertically(axisY);
			this.angle = -this.angle;
			return this;
		}

		/**
		 * makes the ray the opposite of itself relative to the given vertical axis
		 * if no value is set for axisX, the mirror will be made relative to the origin's x coordinate.
		 * @param {number} [axisX=center.x]
		 *          abscissa of the vertical axis
		 * @returns {utils.geometry2d.Ray} <code>this</code>
		 * @see {@link utils.geometry2d.Ray#mirrorVertically}
		 */
		mirrorHorizontally(axisX = this.center.x) {
			super.mirrorHorizontally(axisX);
			this.angle = Math.PI - this.angle;
			return this;
		}

		/**
		 * returns the calculated end point of the instance as if the ray was a line stating at the origin <!--
		 * -->and with the specified length.
		 * @param {number} length
		 * @returns {utils.geometry2d.Vec2|Vec2}
		 */
		endPoint(length) {
			return this.center.clone().addXY(Math.cos(this.angle) * length, Math.sin(this.angle) * length);
		}

		/**
		 * creates a {@link utils.geometry2d.Line|Line} starting from the origin of the ray, with the same direction
		 * and with the specified length
		 * @param length
		 * @returns {utils.geometry2d.Line}
		 */
		getLine(length) {
			return Line.createFromPointVector(this.center, Vec2.createFromAngle(this.angle, length));
		}

		/**
		 * adds the drawing instructions to the context. Be aware that if you just "fill" the line, <!--
		 * -->it won't be drawn on the canvas, you must "stroke" it to make it appear on the canvas.
		 * @param {CanvasRenderingContext2D} context
		 */
		pushPath(context) {
			const p = this.endPoint(context.canvas.clientWidth + context.canvas.clientHeight);
			context.moveTo(this.center.x, this.center.y);
			context.moveTo(this.center.x, this.center.y);
			context.lineTo(p.x, p.y);
		}

		/**
		 * draw the shape on the canvas using its webgl context.
		 * To fill the shape, the draw mode must de TRIANGLE_FAN. To only draw the outline, the mode must be LINE_LOOP.
		 * @param {Float32Array} verticesBuffer
		 * @param {nmuber} [offset=0]
		 * @returns {number} number of points added
		 */
		glSetVertices(vertices, offset=0) {
			const t = this.endPoint(Number.MAX_SAFE_INTEGER);
			vertices[offset] = this.center.x;
			vertices[offset+1] = this.center.y;
			vertices[offset+2] = t.x;
			vertices[offset+3] = t.y;
			return 2;
		}

		/**
		 * check if the ray intersect with the shape.
		 * @param {utils.geometry2d.Shape} shape
		 * @returns {boolean}
		 */
		intersect(shape) {
			const rect = shape.getRect();
			return new Line(this.center,
				this.endPoint(Vec2.distance(this.center, shape.center) + rect.width + rect.height)).intersect(shape);
		}

		/**
		 * returns the intersection points between this ray and the given shape
		 * @param {utils.geometry2d.Shape} shape
		 * @returns {utils.geometry2d.Vec2[]}
		 */
		getIntersectionPoints(shape) {
			const rect = shape.getRect();
			return this.getLine(Vec2.distance(this.center, shape.center) + rect.width + rect.height)
				.getIntersectionPoints(shape);
		}

		/**
		 * returns whether or not the line contains the given point.
		 * The result is not really realistic because of number precision
		 * @param {utils.geometry2d.Vec2} point
		 * @returns {boolean}
		 */
		contains(point) {
			return this.endPoint(Vec2.distance(this.center, point)).equals(point);
		}

		/**
		 * creates and returns a {@link utils.geometry2d.Rect} instance fitting the ray, with pone corner <!--
		 * -->at an infinite position.
		 * @returns {utils.geometry2d.Rect}
		 */
		getRect() {
			const endPoint = this.endPoint(Infinity);
			return new Rect(Math.min(endPoint.x, this.center.x), Math.min(endPoint.y, this.center.y),
				Math.max(endPoint.x, this.center.x), Math.max(endPoint.y, this.center.y));
		}

		/**
		 * returns the director vector of the instance.
		 * @returns {utils.geometry2d.Vec2}
		 */
		get directorVect() {
			return Vec2.createFromAngle(this.angle);
		}

		/**
		 * returns the closest point of the instance to the specified point
		 * @param {utils.geometry2d.Vec2} p
		 * @returns {utils.geometry2d.Vec2}
		 */
		closestpointTo(p) {
			let A = this.center, AC = Vec2.translation(A, p), u = this.directorVect, d = Vec2.dotProd(u, AC);
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
		 * @returns {utils.geometry2d.Ray}
		 */
		clone() {
			return new Ray(this.center, this.angle);
		}
	}
	/**
	 * number of points used to draw this shape.
	 * @type {number}
	 * @name utils.geometry2d.Ray#glPointsNumber
	 */
	Ray.prototype.glPointsNumber = 2;

	/**
	 * @memberOf utils
	 * @namespace geometry2d
	 */
	utils.geometry2d = {
		Vec2,
		Rect,
		Shape,
		Circle,
		Ellipsoid,
		Line,
		Point,
		Polygon,
		Ray
	};
})();