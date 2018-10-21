/**
 * @module CellularTiledMapLayer
 */
import {TiledMapLayer} from "../../game/TiledMap.mjs";

class CellularTiledMapLayer extends TiledMapLayer {
    constructor(lineStart = 0, columnStart = 0, lines, columns, automate, startValue) {
        super(lineStart, columnStart, lines, columns);
        this.array = new Array(lines);
        this.nextArray = new Array(lines);
        for(let i=0; i < lines; ++i) {
            this.array[i] = new Array(columns);
            this.nextArray[i] = new Array(columns);
            for(let j=0; j< columns; ++j) {
                this.array[i][j] = startValue;
                this.nextArray[i][j] = startValue;
            }
        }
        this.cellularAlgorithm = automate;
    }
    step() {
        let stable = true;
        for(let i=0, j; i < this.lines; i++) {
            for(j=0; j < this.columns; j++) {
                this.nextArray[i][j] = this.cellularAlgorithm(this, this.array, i, j);
                if(this.nextArray[i][j] !== this.array[i][j]) stable = false;
            }
        }
        [this.array,this.nextArray] = [this.nextArray, this.array];
        return stable;
    }
    getValue(column, line) {
        return this.array[line][column];
    }
    setValue(column, line, value) {
        this.array[line][column] = value;
    }
    mooreSum(column, line) {
        return (line === 0) ? (
            (column === 0) ? (
                                                                            this.array[line  ][column+1] +  // X#
                                               this.array[line+1][column] + this.array[line+1][column+1]    // ##
            ) : (column === this.array[line].length-1) ? (
                this.array[line  ][column-1] +                                                              // #X
                this.array[line+1][column-1] + this.array[line+1][column]                                   // ##
            ) :
                this.array[line  ][column-1]                              + this.array[line  ][column+1] +  // #X#
                this.array[line+1][column-1] + this.array[line+1][column] + this.array[line+1][column+1]    // ###
        ) : (line === this.array.length-1) ? (
            (column === 0) ? (
                                               this.array[line-1][column] + this.array[line-1][column+1] +  // ##
                                                                            this.array[line  ][column+1]    // X#
            ) : (column === this.array[line].length-1) ? (
                this.array[line-1][column-1] + this.array[line-1][column] +                                 // ##
                this.array[line  ][column-1]                                                                // #X
            ) :
                this.array[line-1][column-1] + this.array[line-1][column] + this.array[line-1][column+1] +  // ###
                this.array[line  ][column-1] +                              this.array[line  ][column+1]    // #X#
        ) : (column === 0) ? (
                                               this.array[line-1][column] + this.array[line-1][column+1] +  // ##
                                                                            this.array[line  ][column+1] +  // X#
                                               this.array[line+1][column] + this.array[line+1][column+1]    // ##
        ) : (column === this.array[line].length-1) ? (
                this.array[line-1][column-1] + this.array[line-1][column] +                                 // ##
                this.array[line  ][column-1] +                                                              // #X
                this.array[line+1][column-1] + this.array[line+1][column]                                   // ##
            ) :
            this.array[line-1][column-1] + this.array[line-1][column] + this.array[line-1][column+1] +      // ###
            this.array[line  ][column-1] +                              this.array[line  ][column+1] +      // #X#
            this.array[line+1][column-1] + this.array[line+1][column] + this.array[line+1][column+1];       // ###
    }
}

/**
 * @return {number}
 */
const ConwayGameOfLifeAlgorithm = function(layer, array, row, column) {
    const sum = layer.mooreSum(column, row);
    return (sum === 3) ? 1 : (sum === 2) ? array[row][column] : 0 ;
};
/**
 * @return {number}
 */
const CaveGenerationAlgorithm = function(layer, array, row, column) {
    const sum = layer.mooreSum(column, row);
    return (sum < 3) ? 0 : (sum < 5) ? array[row][column] : 1 ;
};


export {CellularTiledMapLayer, ConwayGameOfLifeAlgorithm, CaveGenerationAlgorithm};
export default CellularTiledMapLayer;