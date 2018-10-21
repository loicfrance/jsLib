/**
 * @module geometry2d/Vec2
 */

/**
 * A simple class with 2 members : <code>{@link Vec2#x|x}</code> and <code>{@link Vec2#y|y}</code>, <!--
 * -->used to represent points and vectors in a 2-dimensions space
 * @class Vec2
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
     * multiply the vector by the matrix
     * <code>m11, m12, dX,</code> <br/>
     * <code>m21, m22, dY,</code> <br/>
     * <code>0  ,   0,  1</code> <br/>
     * @param {Vec2} m11 horizontal scaling
     * @param {Vec2} m12 horizontal skewing
     * @param {Vec2} m21 vertical skewing
     * @param {Vec2} m22 vertical scaling
     * @param {Vec2} [dX=0] horizontal moving
     * @param {Vec2} [dY=0] vertical moving
     */
    transform(m11, m12, m21, m22, dX = 0, dY = 0)
    {
        [this.x, this.y] = [
            m11*this.x + m12*this.y + dX,
            m21*this.x + m22*this.y + dY
        ];
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

export default Vec2;
export {Vec2};