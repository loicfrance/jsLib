/**
 * Created by rfrance on 1/21/2017.
 */
window.game.Board = (function(){
	"use strict";
	/**
	 * @memberOf game
	 * @class game.Board
	 * @augments game.Object
	 * @classdesc An object defining a board on the field.
	 */
	class Board extends game.Object {
		/**
		 * @constructor
		 * @param {utils.geometry2d.Vec2} position
		 * @param {number} columns
		 * @param {number} lines
		 * @param {number} cellWidth
		 * @param {number} cellHeight
		 */
		constructor(position, columns, lines, cellWidth, cellHeight) {
			super(position);
			/**
			 * @name game.Board#lines
			 * @type {number}
			 */
			this.lines = lines;
			/**
			 * @name game.Board#columns
			 * @type {number}
			 */
			this.columns = columns;
			/**
			 * @name game.Board#cellWidth
			 * @type {number}
			 */
			this.cellWidth = cellWidth;
			/**
			 * @name game.Board#cellHeight
			 * @type {number}
			 */
			this.cellHeight = cellHeight;
			/**
			 * @name game.Board#occupationMap
			 * @type {Array.<Array.<number>>}
			 */
			this.occupationMap = new Array(lines);
			let i, j;
			for(i=0; i<lines; i++) {
				this.occupationMap[i] = new Array(columns);
				for(j=0; j<columns; j++) {
					this.occupationMap[i][j] = 0;
				}
			}
		}
//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - - - -board getters - - - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************
		/**
		 * @name game.Board#boardRect
		 * @type {utils.geometry2d.Rect}
		 * @readonly
		 */
		get boardRect() {
			return utils.geometry2d.Rect.createFromCenterWidthHeight(this.position, this.boardWidth, this.boardHeight);
		}
		/**
		 * @name game.Board#boardWidth
		 * @type {number}
		 * @readonly
		 */
		get boardWidth() {
			return this.cellWidth * this.columns;
		}
		/**
		 * @name game.Board#boardHeight
		 * @type {number}
		 * @readonly
		 */
		get boardHeight() {
			return this.cellHeight * this.lines;
		}
//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - - - - cell getters - - - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************
		/**
		 * returns the Rect corresponding to the selected cell of the board
		 * @param {number} line
		 * @param {number} column
		 * @returns {utils.geometry2d.Rect}
		 */
		getCellRect(column, line) {
			let left = this.position.x + (column - this.columns*0.5)*this.cellWidth,
				top  = this.position.y + (line - this.lines*0.5)*this.cellHeight;
			return new utils.geometry2d.Rect(left, top, left+this.cellWidth, top+this.cellHeight);
		}
		/**
		 * returns the center of the selected cell
		 * @param {number} column
		 * @param {number} line
		 * @returns {utils.geometry2d.Vec2}
		 */
		getCellCenter(column, line) {
			let dX = (this.columns*0.5 - 0.5 - column)*this.cellWidth, dY = (this.lines*0.5 - 0.5 - line)*this.cellHeight;
			return this.position.clone().addXY(-dX, -dY);
		}
		/**
		 * returns the index of the board column containing the specified x coordinate
		 * @param {number} gameX
		 * @returns {number}
		 */
		getColumn( gameX ) {
			//return Math.floor((gameX - this.position.x + this.boardWidth/2)/this.cellWidth)
			return Math.floor(this.columns*0.5 + (gameX - this.position.x)/this.cellWidth);
		}
		/**
		 * returns the index of the board line containing the specified y coordinate
		 * @param {number} gameY
		 * @returns {number}
		 */
		getLine( gameY ) {
			return Math.floor(this.lines*0.5 + (gameY - this.position.y)/this.cellHeight);
		}

		getCellIndices( gamePos ) {
			return new utils.geometry2d.Vec2(this.getColumn(gamePos.x), this.getLine(gamePos.y));
		}

//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - - - - -grid render - - - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************
		/**
		 * draws the grid on the canvas with the specified color
		 * @param {CanvasRenderingContext2D}context
		 * @param {string} color
		 */
		renderGrid(context, color) {
			context.strokeStyle = color;
			let r = this.boardRect;
			let t = r.left;
			context.beginPath();
			while(t <= r.right) {
				context.moveTo(t, r.top);
				context.lineTo(t, r.bottom);
				t += this.cellWidth;
			}
			t = r.top;
			while(t <= r.bottom) {
				context.moveTo(r.left, t);
				context.lineTo(r.right, t);
				t += this.cellHeight;
			}
			context.stroke();
		}
		scale(factor) {
			super.scale(factor);
			this.cellWidth *= factor;
			this.cellHeight *= factor;
		}
//______________________________________________________________________________________________________________________
// - - - - - - - - - - - - - - - - - - - - - - - - -occupation methods- - - - - - - - - - - - - - - - - - - - - - - - -
//**********************************************************************************************************************
		isOccupated(column, line) {
			return column < this.columns && line < this.lines && this.occupationMap[line][column] == 1;
		}
		setOccupated(column, line, occupated) {
			return (column < this.columns && line && this.lines) ?
				!!(this.occupationMap[line][column] = occupated ? 1 : 0) && true : false;
		}
		addOccupation(column, line, occupationSubMap) {
			let subH = occupationSubMap.length, subW;
			let top = line - Math.floor(subH/2), left;
			let i, j;
			for(i = 0; i < subH; i++) {
				subW = occupationSubMap[i].length;
				left = column - Math.floor(subW/2);
				for(j = 0; j < subW; j++) {
					this.occupationMap[top+i][left+j] = occupationSubMap[i][j] ? 1 : 0;
				}
			}
		}

		/**
		 * adds an occupation submap to the occupation map
		 * @param columns
		 * @param lines
		 * @param occupationSubMaps
		 */
		addOccupations(columns, lines, occupationSubMaps) {
			let i=Math.min(columns.length, lines.length, occupationSubMaps.length);
			while(i--) {
				this.addOccupation(columns[i], lines[i], occupationSubMaps[i]);
			}
		}
		/**
		 * reset the occupation map by filling it with 0
		 */
		clearOccupation() {
			for(i=0; i<this.lines; i++) {
				for(j=0; j<this.columns; j++) {
					this.occupationMap[i][j] = 0;
				}
			}
		}

		/**
		 * Must be called when you change the board dimension for the occupation map to be changed too.
		 * The right column and bottom lines will be changed (added or removed, not the left and top :
		 * @example
		 * .________.......__________
		 * |.#....# |.....|.#....#...|
		 * |...#...#| --> |...#...#..|
		 * |....#...|.....|____#_____|
		 * |_#______|.......(10 x 3)
		 * .(8 x 4)
		 */
		onDimensionsChange() {
			let newMap = new Array(this.lines);
			let oldHeight = this.occupationMap.length, oldWidth;
			let i, j;
			for(i = Math.min(oldHeight, this.lines)-1; i >= 0; i--) {
				newMap = new Array(this.columns);
				oldWidth = this.occupationMap[i].length;
				for(j = Math.min(oldWidth, this.columns)-1; j >= 0; j--) {
					newMap[i][j] = this.occupationMap[i][j];
				}
				for(j = oldWidth; j< this.columns; j++) {
					newMap[i][j] = 0;
				}
			}
			for(i = oldHeight; i < this.lines; i++) {
				for(j=0; j< this.columns; j++) {
					newMap[i][j] = 0;
				}
			}
		}
		/**
		 * returns an optimized path from the start point (given in index coordinates) and the end point <!--
		 * -->(given in index coordinates). The result is an array of {@link utils.geometry2d.Vec2|Vec2} <!--
		 * -->in index coordinates describing the path from the start point to the end point, including <!--
		 * -->the end point but excluding the start point.
		 * @param {utils.geometry2d.Vec2} start - x = column index, y = line index
		 * @param {utils.geometry2d.Vec2} end   - x = column index, y = line index
		 * @returns {utils.geometry2d.Vec2[]} [(i,j), (i,j), (i,j)]
		 */
		leePath(start, end) {

			if(this.occupationMap[start.y][start.x] || this.occupationMap[end.y][end.x]) return [];
			let heatMap = new Array(this.lines),
				i, j, list, newFifo, p, len;

			for(i = 0; i < this.lines; i++) {
				heatMap[i] = new Array(this.columns);
				for(j = 0; j < this.columns; j++) {
					heatMap[i][j] = this.occupationMap[i][j]? -1 : 0;
				}
			}

			list = [];
			newFifo = [start];
			heatMap[start.y][start.x] = 1;
			while(newFifo.length && heatMap[end.y][end.x] == 0) {
				list = newFifo;
				newFifo = [];
				len = list.length;
				i = -1;
				while(++i < len) { p = list[i];
					if (p.y > 0 && this.occupationMap[p.y - 1][p.x] == 0 && heatMap[p.y - 1][p.x] == 0) {
						heatMap[p.y-1][p.x] = heatMap[p.y][p.x] + 1;
						newFifo.push(p.clone().addXY(0, -1));
					}
					if (p.y < this.lines-1 && this.occupationMap[p.y + 1][p.x] == 0 && heatMap[p.y + 1][p.x] == 0) {
						heatMap[p.y+1][p.x] = heatMap[p.y][p.x] + 1;
						newFifo.push(p.clone().addXY(0, 1));
					}
					if (p.x > 0 && this.occupationMap[p.y][p.x - 1] == 0 && heatMap[p.y][p.x - 1] == 0) {
						heatMap[p.y][p.x-1] = heatMap[p.y][p.x] + 1;
						newFifo.push(p.clone().addXY(-1, 0));
					}
					if (p.x < this.columns-1 && this.occupationMap[p.y][p.x + 1] == 0 && heatMap[p.y][p.x + 1] == 0) {
						heatMap[p.y][p.x+1] = heatMap[p.y][p.x] + 1;
						newFifo.push(p.clone().addXY(1, 0));
					}
				}
			}
			let heat = heatMap[end.y][end.x];
			if(heat != 0) {
				let path = new Array(heat-1);
				p = end.clone();
				let lastDir = 0;
				let nextDir = 0;
				while(heat != 1) {
					path[--heat - 1] = p.clone();
					if(p.y > 0 && heatMap[p.y-1][p.x] == heat) {
						nextDir = 1 // go up
					}
					if(p.y < this.lines-1 && heatMap[p.y+1][p.x] == heat) {
						if(lastDir==0 || nextDir == lastDir) nextDir = 2; // go down
					}
					if(p.x > 0 && heatMap[p.y][p.x-1] == heat) {
						if(lastDir==0 || nextDir == lastDir) nextDir = 3; // go left
					}
					if(p.x < this.columns-1 && heatMap[p.y][p.x+1] == heat) {
						if(lastDir==0 || nextDir == lastDir) nextDir = 4; // go right
					}
					switch(nextDir) {
						case 1 : p.addXY( 0,-1); break;
						case 2 : p.addXY( 0, 1); break;
						case 3 : p.addXY(-1, 0); break;
						case 4 : p.addXY( 1, 0); break;
					}
					lastDir = nextDir;
				}
				return path;
			}
			else return [];
		}
	}
	return Board;
})();