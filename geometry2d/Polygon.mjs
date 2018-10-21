import {PI2, Vec2, Shape, Rect, Circle, Line} from "./geometry2d.mjs";
/**
 * @module geometry2d/Polygon
 */
let len = 0, i = 0, res = 0, p0 = Vec2.zero, p1 = Vec2.zero;
// above variables are used to make methods faster and avoid memory leaks creating variables every time
/**
 * @class Polygon
 * @augments Shape
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
        const c = Math.cos(radians), s = Math.sin(radians);
        i = this.points.length;
        while (i--) this.points[i].transform(c,-s,s,c,0,0);
        return this;
    }

    /**
     * makes the polygon the mirror of itself relative to the given horizontal axis
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
     * makes the polygon the mirror of itself relative to the given vertical axis
     * if no value is set for axisX, the mirror will be made relative to the center's x coordinate.
     * @param {number} [axisX=center.x]
     *          abscissa of the vertical axis
     * @returns {Polygon} <code>this</code>
     */
    mirrorHorizontally(axisX = this.center.x) {
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
     * inverts the order of the points. This can be used to make the points in ccw order if they are not,
     * or the opposite.
     * @returns {Polygon} <code>this</code>
     */
    invertPointsOrder() {
        let l = (this.points.length-1)/2, r = l>>0
        l = r==l ? l : r+1;
        while(r++,l--)
            [this.points[l], this.points[r]] = [this.points[r], this.points[l]];
        return this;
    }
    /**
     * divide the polygon into several new convex polygons, without creating intermediate points
     * @return {[Polygon]} convex polygons
     */
    divideConvex() {
        let polygons = [];
        let points = this.points.slice(0);
        let n = points.length;
        if(n < 4) return [ConvexPolygon.createCCW(this.center, points)];
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
            polygons.push(ConvexPolygon.createCCW(this.center, array));
            if(n < 4) break;
        }
        polygons.push(ConvexPolygon.createCCW(this.center, points));
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
     * returns the Support Point (in global coordinates) of the polygon for the specified direction.
     * The support point is the corner of the polygon that is the farthest away along a given direction.
     * If there is 2 points at equal distance, only the one with the highest index is retrieved
     * @param {Vec2} direction
     * @return {Vec2} support point for the given direction
     */
    supportPoint(direction)
    {
        let bestProj = -Infinity,
            bestPoint, i = this.points.length;
        while(i--) {
            const p = this.points[i], proj = Vec2.dotProd(p, direction);
            if(proj > bestProj)
            {
                bestProj = proj;
                bestPoint = p;
            }
        }
        return bestPoint.clone().add(this.center);
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
        return new ConvexPolygon(center, points);
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
class ConvexPolygon extends Polygon {
    constructor(center, relativePoints)
    {
        super(center, relativePoints);
    }
    clone()
    {
        return new ConvexPolygon(this.center, this.points);
    }
    intersect(shape) {
        if(shape instanceof Circle) {
            let i = this.points.length;
            //let bestD = -Infinity, bestI = -1;
            while(i--)
            {
                const norm = this.getNormalVectForLine(i);
                const support = shape.center.add(norm.clone().mul(shape.radius))
                const d = Vec2.dotProd(norm, support.remove(this.points[i]).remove(this.center));
                if(d > 0) return false;
                /*
                if(d > bestD) {
                    bestD = d;
                    bestI = i;
                }
                */
            }
            return true;
        }
        if (shape instanceof ConvexPolygon) {
            let i = this.points.length;
            //let bestD = -Infinity, bestI = -1;
            while(i--)
            {
                const norm = this.getNormalVectForLine(i);
                const support = shape.supportPoint(norm.mirror()); // supportPoint(-norm)
                const d = -Vec2.dotProd(norm, support.remove(this.points[i]).remove(this.center)); // norm * (support - point)
                if(d > 0) return false;
                /*
                if(d > bestD) {
                    bestD = d;
                    bestI = i;
                }
                */
            }
            return true;
        } else super.intersect(this);
    }
    static createCCW(center, points)
    {
        const p = new ConvexPolygon(center, points);
        if(!p.ccw())
            p.invertPointsOrder();
        return p;
    }
}

export default Polygon;
export {Polygon, ConvexPolygon};