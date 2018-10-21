import {PI_2, Vec2, Shape, Rect, Circle} from "./geometry2d.mjs";
/**
 * @module geometry2d/Line
 */
let A = Vec2.zero, B = Vec2.zero, C = Vec2.zero, D = Vec2.zero, AB = Vec2.zero, AC = Vec2.zero, AD = Vec2.zero,
    u = Vec2.zero, CD = Vec2.zero, d=0, BC = Vec2.zero, BD = Vec2.zero;
/**
 * @class Line
 * @augments Shape
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
        let d = this.directorVect;//.rotate(left ? -PI_2 : PI_2);
        [d.x,d.y] = left ? [d.y, -d.x] : [-d.y, d.x];
        return d;
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

export default Line;
export {Line};