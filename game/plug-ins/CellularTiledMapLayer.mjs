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
        const arr = this.array, l = line, c = column;
        return (l === 0) ? (
            (c === 0) ? (
                                              arr[l  ][c+1] +  //  #
                                arr[l+1][c] + arr[l+1][c+1]    // ##
            ) : (c === arr[l].length-1) ? (
                arr[l  ][c-1] +                                // #
                arr[l+1][c-1] + arr[l+1][c]                    // ##
            ) :
                arr[l  ][c-1]               + arr[l  ][c+1] +  // # #
                arr[l+1][c-1] + arr[l+1][c] + arr[l+1][c+1]    // ###
        ) : (l === arr.length-1) ? (
            (c === 0) ? (
                                arr[l-1][c] + arr[l-1][c+1] +  // ##
                                              arr[l  ][c+1]    //  #
            ) : (c === arr[l].length-1) ? (
                arr[l-1][c-1] + arr[l-1][c] +                                 // ##
                arr[l  ][c-1]                                                                // #
            ) :
                arr[l-1][c-1] + arr[l-1][c] + arr[l-1][c+1] +  // ###
                arr[l  ][c-1] +               arr[l  ][c+1]    // # #
        ) : (c === 0) ? (
                                arr[l-1][c] + arr[l-1][c+1] +  // ##
                                              arr[l  ][c+1] +  //  #
                                arr[l+1][c] + arr[l+1][c+1]    // ##
        ) : (c === arr[l].length-1) ? (
                arr[l-1][c-1] + arr[l-1][c] +                  // ##
                arr[l  ][c-1] +                                // #
                arr[l+1][c-1] + arr[l+1][c]                    // ##
            ) :
                arr[l-1][c-1] + arr[l-1][c] + arr[l-1][c+1] +  // ###
                arr[l  ][c-1] +               arr[l  ][c+1] +  // # #
                arr[l+1][c-1] + arr[l+1][c] + arr[l+1][c+1];   // ###
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
/**
 * @return {number}
 */
const HighLifeAlgorithm = function(layer, array, row, column) {
    const sum = layer.mooreSum(column, row);
    return (sum === 3) ? 1 : (sum === 2) ? array[row][column] : (sum === 6) ? !array[row][column] : 0 ;
};


export {CellularTiledMapLayer, ConwayGameOfLifeAlgorithm, CaveGenerationAlgorithm, HighLifeAlgorithm};
export default CellularTiledMapLayer;