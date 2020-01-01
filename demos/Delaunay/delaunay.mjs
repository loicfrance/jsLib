/**
 * @module delaunay
 */
import {Circle} from "../../geometry2d/Circle.mjs";
import {Arc, Node as GraphNode} from "../../utils/graph.mjs";
import {Vec2} from "../../geometry2d/Vec2.mjs";
import {Rect} from "../../geometry2d/Rect.mjs";
import {Line} from "../../geometry2d/Line.mjs";
import {Polygon} from "../../geometry2d/Polygon.mjs";

class DelaunayNode extends GraphNode {
    constructor(position) {
        super();
        this.position = position.clone();
    }
    static fromPointsArray(points) {
        return points.map(p=>new DelaunayNode(p));
    }
    static fromShape(shape, maxDistance) {
        return DelaunayNode.fromPointsArray(createPoints(shape, maxDistance));
    }
}

class DelaunayTriangleNode extends GraphNode {
    constructor(node1, node2, node3) {
        super();
        this.node1 = node1;
        this.node2 = node2;
        this.node3 = node3;
        let dA = Math.abs(Vec2.translation(node1, node2).angle - Vec2.translation(node1, node3).angle);
        if(dA > Math.PI/2) dA -= Math.PI/2;
        if(dA < Math.PI/1000) this.circle = null;
        else this.circle = Circle.CircumCircle(node1.position, node2.position, node3.position).growDistance(0.1);
        this.createArcs();
        
    }

    canConnect(node) {
        if(!this.circle) return true;
        else return this.circle.contains(node.position);
    }
    createArcs() {
        if(!this.node1.getArcWith(this.node2)) new Arc(this.node1, this.node2);
        if(!this.node2.getArcWith(this.node3)) new Arc(this.node2, this.node3);
        if(!this.node3.getArcWith(this.node1)) new Arc(this.node3, this.node1);
    }
    addArcsToGraph(graph) {
        graph.addArcs([
            this.node1.getArcWith(this.node1),
            this.node2.getArcWith(this.node2),
            this.node3.getArcWith(this.node3)
        ])
    }
}
let triangle_index = 0;
class DelaunayTriangle {
    constructor(point1, point2, point3) {
        this.index = triangle_index++;
        this.points = [
            point1,
            point2,
            point3];
        this.triangles = new Array(3);
        this.shape = Polygon.Absolute(this.points);
        this.circle = Circle.CircumCircle(point1, point2, point3);
        this.searchedActive = false;
    }
    contain(point) {
        return this.shape.contains(point);
    }
    addPoint(point, trianglesList) {
        if(this.searchedActive) return [];
        if(this.circle.contains(point)) { // if triangle needs to be modified
            this.searchedActive = true;
            //remove triangle from list
            trianglesList.splice(trianglesList.indexOf(this), 1);
            const array = [];
            for(let i=0; i< 3; i++) {
                if(this.triangles[i]) {
                    if(this.triangles[i].searchedActive) continue;
                    const newTriangles = this.triangles[i].addPoint(point, trianglesList);
                    if(newTriangles.length === 0) { // border of polygon
                        //create new triangle
                        const newTriangle = new DelaunayTriangle(point, this.points[i], this.points[(i+1)%3]);
                        trianglesList.push(newTriangle);
                        //tell neighbor triangle to change its link
                        this.triangles[i].replaceLink(this, newTriangle);
                        //place neighbor triangle at index 1 because neighboring points are points 1 and 2 in array
                        newTriangle.triangles[1] = this.triangles[i];
                        //set neighbors of new triangles with other new triangles
                        for(let j=0; j< array.length; ++j) {
                            if(!array[j].isFullyNeighbored())
                            newTriangle.setNeighbor(array[j]);
                            if(newTriangle.isFullyNeighbored()) break;
                        }
                        array.push(newTriangle);
                    } else array.push.apply(array, newTriangles);
                } else { // border of graph
                    const newTriangle = new DelaunayTriangle(point, this.points[i], this.points[(i+1)%3]);
                    trianglesList.push(newTriangle);
                    for(let j=0; j< array.length; ++j) {
                        if(!array[j].isFullyNeighbored())
                            newTriangle.setNeighbor(array[j]);
                        if(newTriangle.isFullyNeighbored()) break;
                    }
                    array.push(newTriangle);
                }
            }
            //add missing links
            for(let i=0; i< array.length-1; ++i) {
                if(!array[i].isFullyNeighbored())
                    for(let j=i+1; j< array.length; ++j) {
                        if(!array[j].isFullyNeighbored())
                            array[i].setNeighbor(array[j]);
                        if (array[i].isFullyNeighbored()) break;
                    }
            }

            this.searchedActive = false;
            return array;
        } else return [];
    }
    replaceLink(oldTriangle, newTriangle) {
        this.triangles[this.triangles.indexOf(oldTriangle)] = newTriangle;
    }
    setNeighbor(triangle) {
        for(let i=0; i< 3; i++) {
            const idx = triangle.points.indexOf(this.points[i]);
            if(idx >= 0) {
                const idx2 = triangle.points.indexOf(this.points[(i+1)%3]);
                if(idx2 >= 0) {
                    this.triangles[i] = triangle;
                    triangle.triangles[idx2] = this;
                }
            }
        }
    }
    isFullyNeighbored() {
        return this.triangles[0] && this.triangles[1] && this.triangles[2];
    }
    render(context) {
        context.strokeStyle = "#FFF";
        this.shape.draw(context);
    }
}
function createPoints(shape, maxDistance) {
    const points = [];
    if(shape instanceof Rect) {
        const widthPoints = Math.floor(shape.width/maxDistance)+1,
            heightPoints = Math.floor(shape.height/maxDistance)+1,
            dX = shape.width/widthPoints,
            dY = shape.height/heightPoints;
        for(let i=0; i <=widthPoints; i++) {
            points.push(
                new Vec2(shape.xMin+i*dX, shape.yMin),
                new Vec2(shape.xMin+i*dX, shape.yMax),
            );
        }
        for(let i=1; i <=heightPoints-1; i++) {
            points.push(
                new Vec2(shape.xMin, shape.yMin+i*dY),
                new Vec2(shape.xMax, shape.yMin+i*dY),
            );
        }
    } else if(shape instanceof Line) {
        const delta = shape.vector;
        const nbPts = Math.floor(delta.magnitude/maxDistance)+1;
        delta.magnitude /= nbPts;
        for(let i=0; i <=nbPts; i++) {
            points.push(delta.clone().mul(i).add(shape.p0));
        }
    } else if (shape instanceof Circle) {
        const perimeter = shape.perimeter;
        const nbPts = Math.floor(perimeter/maxDistance);
        //const dA = (perimeter/nbPts)/shape.radius;
        for(let i=0; i < nbPts; i++) {
            points.push(shape.getPercentPoint(i / nbPts));
        }
    }
    return points;
}
function buildDelaunayGraph(points, rect) {
    const externalTriangle = new DelaunayTriangle(
        new Vec2(rect.xMin-rect.width, rect.yMin - rect.height),
        new Vec2(rect.xMax+3*rect.height, rect.yMin-rect.height),
        new Vec2(rect.xMin-rect.width, rect.yMax + 3*rect.width)
        );
    const triangles = [externalTriangle];
    for(let n=0; n < points.length; n++) {
        for(let t=0; t< triangles.length; t++) {
            if(triangles[t].contain(points[n])) {
                triangles[t].addPoint(points[n], triangles);
                break;
            }
        }
    }
    return triangles;
}

export {DelaunayNode, DelaunayTriangleNode, createPoints, buildDelaunayGraph};