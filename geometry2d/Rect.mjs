import {Vec2, Shape, Circle, Polygon, ConvexPolygon} from "./geometry2d.mjs";
/**
 * @module geometry2d/Rect
 */
/**
 * @class Rect
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
        return shape instanceof Rect ? (this.overlap(shape) && !this.containsRect(shape)) : shape.intersect(this);
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
     * creates a rectangular {@link ConvexPolygon} corresponding to the instance
     * @returns {ConvexPolygon}
     */
    toPolygon() {
    return ConvexPolygon.Absolute(Vec2.createVec2Array([this.xMin, this.yMin, this.xMax, this.yMin,
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

export default Rect;
export {Rect};