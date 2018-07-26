import {Vec2, Shape} from "./geometry2d.mjs";
/**
 * @module geometry2d/Point
 */
/**
 * @class Point
 * @augments Shape
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

export default Point;
export {Point};