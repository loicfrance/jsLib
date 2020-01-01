/**
 * @module diagram
 */
class Node {
    constructor() {
        /**
         * @type {Arc[]}
         */
        this.arcs = [];
    }

    /**
     * @param {Arc} arc
     * @return {boolean}
     */
    addArc(arc) {
        if(this.arcs.indexOf(arc) === -1) {
            this.arcs.push(arc);
            return true;
        }
        else return false;
    }
    /**
     * @param {Arc} arc
     * @return {boolean}
     */
    removeArc(arc) {
        const i = this.arcs.indexOf(arc);
        if(i >= 0) {
            this.arcs.splice(i, 1);
            return true;
        }
        return false;
    }
    /**
     * @param {Node} node
     * @return {Arc|null}
     */
    getArcWith(node) {
        let i = this.arcs.length;
        while(i--) {
            if(this.arcs[i].nodes[0] === node || this.arcs[i].nodes[1] === node) {
                return this.arcs[i];
            }
        }
        return null;
    }
}
class Arc {
    /**
     * @param {Node} node1
     * @param {Node} node2
     */
    constructor(node1, node2) {
        this.nodes = [node1, node2];
        node1.addArc(this);
        node2.addArc(this);
    }

    delete() {
        this.nodes[0].removeArc(this);
        this.nodes[1].removeArc(this);
    }
}
class Graph {
    constructor() {
        /**
         * @type {Node[]}
         */
        this.nodes = [];
        /**
         * @type {Arc[]}
         */
        this.arcs = [];
    }

    /**
     * @param {Node} node
     * @return {boolean}
     */
    addNode(node) {
        if(this.nodes.indexOf(node) === -1) {
            this.nodes.push(node);
            return true;
        }
        else return false;
    }
    addNodes(nodes) {
        for(let i=0; i < nodes.length; i++) {
            this.addNode(nodes[i]);
        }
    }
    /**
     * @param {Node} node
     * @return {boolean}
     */
    removeNode(node) {
        const i = this.nodes.indexOf(node);
        if(i >= 0) {
            this.nodes.splice(i, 1);
            return true;
        }
        else return false;
    }
    /**
     * @param {Arc} arc
     * @return {boolean}
     */
    addArc(arc) {
        if(this.arcs.indexOf(arc) === -1) {
            this.arcs.push(arc);
            return true;
        }
        else return false;
    }
    addArcs(arcs) {
        for(let i=0; i < arcs.length; i++) {
            this.addArc(arcs[i]);
        }
    }
    /**
     * @param {Arc} arc
     * @return {boolean}
     */
    removeArc(arc) {
        const i = this.arcs.indexOf(arc);
        if(i >= 0) {
            this.arcs.splice(i, 1);
            return true;
        }
        else return false;
    }
    /**
     * @param {Arc} arc
     */
    destroyArc(arc) {
        arc.delete();
        this.removeArc(arc);
    }
    /**
     * @param {Node} node
     */
    destroyNode(node) {
        this.removeNode(node);
        let arcs = node.arcs.splice(0, node.arcs.length);
        for(let i = arcs.length-1; i >= 0; --i) {
            this.destroyArc(arcs[i]);
        }
    }
    update() {
        let repeat = true;
        while(repeat) {
            repeat = false;
            for (let i = this.nodes.length - 1; i >= 0; --i)
                for (let j = this.nodes[i].arcs.length - 1; j >= 0; --j)
                    this.addArc(this.nodes[i].arcs[j]);

            for (let i = this.arcs.length - 1; i >= 0; --i)
                for (let j = this.arcs[i].nodes.length - 1; j >= 0; --j)
                    if (this.addNode(this.arcs[i].nodes[j]))
                        repeat = true;
        }
    }
}

export {Graph, Node, Arc};