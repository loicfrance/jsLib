"use strict";
(function(context){
	const Vec2 = utils.geometry2d.Vec2;
	const Rect = utils.geometry2d.Rect;

	const GridHelper = {
		/**
		 * @param {Array<Array<*>>} obstacleMap - map containing values that can be considered as true (obstacle) <!--
		 * -->or false (no obstacle). For example, 1 for obstacles and 0 for not-obstacles
		 * @param columnStart - column of the map where the the heat map will have its hottest point
		 * @param lineStart - line of the map where the heat map will have its hottest point
		 * @param heatStart - the hottest point of the heat map, at the start point (columnStart,lineStart).
		 * @returns {Array} the heat map of the map starting from the specified point
		 */
		heatMap(obstacleMap, columnStart, lineStart, heatStart) {
			let lines = obstacleMap.length, i, j, list, fifo, c, l, len;

			const heatMap = new Array(i = lines);
			while(i--) {
				heatMap[i] = new Array(j = obstacleMap[i].length);
				while(j--) heatMap[i][j] = obstacleMap[i][j] ? -1 : 0;
			}
			list = [];
			fifo = [lineStart, columnStart];
			heatMap[lineStart][columnStart] = heatStart;

			while(len = fifo.length) {
				list = fifo;
				fifo = [];
				i = 0;
				while(i < len) { l = list[i]; c = list[i+1]; i += 2;
					if(l > 0 && heatMap[l - 1][c] === 0) {
						heatMap[l - 1][c] = heatMap[l][c]-1;
						if(heatMap[l][c] > 2) fifo.push(l-1, c);
					}
					if(l < lines - 1 && heatMap[l + 1][c] === 0) {
						heatMap[l + 1][c] = heatMap[l][c]-1;
						if(heatMap[l][c] > 2) fifo.push(l+1, c);
					}
					if(c > 0 && heatMap[l][c - 1] === 0) {
						heatMap[l][c - 1] = heatMap[l][c]-1;
						if(heatMap[l][c] > 2) fifo.push(l, c-1);
					}
					if(c < heatMap[l].length - 1 && heatMap[l][c + 1] === 0) {
						heatMap[l][c + 1] = heatMap[l][c]-1;
						if(heatMap[l][c] > 2) fifo.push(l, c+1);
					}
				}
			}
			return heatMap;
		},
		leePath(obstacleMap, colStart, lineStart, colEnd, lineEnd, maxDistance) {
			const heatMap = GridHelper.heatMap(obstacleMap, colStart, lineStart, maxDistance+1);
			let heat = heatMap[lineEnd][colEnd];
			let d = maxDistance - heat;
			if(heat !== 0) {
				let path = new Array(d);
				let l = lineEnd, c = colEnd;
				let lastDir = 0;
				let nextDir = 0;
				while(d--) {
					path[d] = new Vec2(c,l);
					heat++;
					if(l > 0 && heatMap[l-1][c] === heat) { nextDir = 1 // go up
					}
					if(l < this.lines-1 && heatMap[l+1][c] === heat) {
						if(lastDir === 0 || nextDir === lastDir) nextDir = 2; // go down
					}
					if(c > 0 && heatMap[l][c-1] == heat) {
						if(lastDir === 0 || nextDir === lastDir) nextDir = 3; // go left
					}
					if(c < this.columns-1 && heatMap[l][c+1] === heat) {
						if(lastDir === 0 || nextDir === lastDir) nextDir = 4; // go right
					}
					switch(nextDir) {
						case 1 : l--; break;
						case 2 : l++; break;
						case 3 : c--; break;
						case 4 : c++; break;
					}
					lastDir = nextDir;
				}
				return path;
			}
			else return [];
		},
		/**
		 * returns an optimized path from the start point (at (colStart,lineStart)) to the end point <!--
		 * -->(at (colEnd, lineEnd) using the A* algorithm. The result is an array of <!--
		 * -->{@link utils.geometry2d.Vec2|Vec2} in index coordinates (x=column, y=line) describing the path <!--
		 * -->from the start point to the end point, including the end point but excluding the start point.
		 * @param {Array<Array<*>>} obstacleMap - map containing values that can be considered as true (obstacle) <!--
		 * -->or false (no obstacle). For example, 1 for obstacles and 0 for not-obstacles
		 * @param {number} colStart - column of the map where the path should start
		 * @param {number} lineStart - line of the map where the path should start
		 * @param {number} colEnd - column of the map where the path should stop
		 * @param {number} lineEnd - line of the map where the path should stop
		 * @param {boolean} allowDiagonals - whether or not you allow diagonals to be used. Defaults to true
		 * @returns {utils.geometry2d.Vec2[]} the path of {@link utils.geometry2d.Vec2 Vec2} <!--
		 * -->in index coordinates: [(col,line), (col,line), (col,line)]
		 */
		aStarPath(obstacleMap, colStart, lineStart, colEnd, lineEnd, allowDiagonals = true) {
			const map = obstacleMap, lines = map.length, end = new Vec2(colEnd, lineEnd);
			let openList = [], openListFG = [], closeList = [], closeListF = [],
				n, i, j, minF, minI, q, successors, f, g, q_fg, skip, finish = false,
				distance = Vec2.squareDistance;
			openList.push(new Vec2(colStart, lineStart));
			openListFG.push(new Vec2(0, 0));
			while((n = openList.length) > 0 && !finish) {
				minF = openListFG[0].x; minI = 0; i = n;
				while(--i) {
					if(openListFG[i].x < minF) {
						minI = i;
						minF = openListFG[i].x;
					}
				}
				q = openList.splice(minI, 1)[0];
				q_fg = openListFG.splice(minI, 1)[0];
				successors = [];
				i = 0;
				if(q.y > 0 && map[q.y-1][q.x] === 0) { i += 1; successors.push(new Vec2(q.x, q.y-1)); }
				if(q.x > 0 && map[q.y][q.x-1] === 0) { i += 2; successors.push(new Vec2(q.x-1, q.y)); }
				if(q.y < lines-1 && map[q.y+1][q.x] === 0)
				{ i += 4; successors.push(new Vec2(q.x, q.y+1)); }
				if(q.x < map[q.y].length-1 && map[q.y][q.x+1] === 0)
				{ i += 8; successors.push(new Vec2(q.x+1, q.y)); }
				if(allowDiagonals) {
					if(i%4 === 3 && map[q.y-1][q.x-1] === 0) successors.push(new Vec2(q.x-1, q.y-1));
					if(i%2 === 1 && i > 8 && map[q.y-1][q.x+1] === 0)
						successors.push(new Vec2(q.x+1, q.y-1));
					if((i>>1)%4 === 3 && map[q.y+1][q.x-1] === 0) successors.push(new Vec2(q.x-1, q.y+1));
					if((i>>2) === 3 && map[q.y+1][q.x+1] === 0) successors.push(new Vec2(q.x+1, q.y+1));
				}
				i = successors.length;
				while(i--) {
					if( successors[i].y < 0 || successors[i].y >= lines ||
						successors[i].x < 0 || successors[i].x >= map[successors[i].y].length)
						continue;
					if(map[successors[i].y][successors[i].x] !== 0)
						continue;
					if(successors[i].equals(end)) {
						closeList.push(q);
						closeList.push(end);
						finish = true;
						break;
					}
					j = n - 1;
					g = q_fg.y + distance(q, successors[i]);
					f = g + distance(successors[i], end);
					while(j--) {
						if(openList[j].equals(successors[i])) {
							if(f > openListFG[j].x) {
								skip = true;
							}
						}
					}
					if(skip) { skip = false; continue; }
					j = closeList.length;
					while(j--) {
						if(closeList[j].equals(successors[i])) {
							if(f > closeListF[i]) {
								skip = true;
							}
						}
					}
					if(skip) { skip = false; continue; }
					openList.push(successors[i]);
					openListFG.push(new Vec2(f, g));
				}
				if(!finish) {
					closeList.push(q);
					closeListF.push(q_fg.x);
				}
			}
			return closeList;
		},
		lineOfSightTest(obstacleMap, colStart, lineStart, colEnd, lineEnd) {
			//TODO
			console.log('lineOfSightTest not implemented yet');
		}
	};

	/**
	 * @class game.TiledMapLayer
	 * @abstract
	 */
	class TiledMapLayer {
		constructor(lineStart, columnStart, lines, columns) {
			this.lineStart = lineStart;
			this.columnStart = columnStart;
			this.lines = lines;
			this.columns = columns;
		}
		getValue(column, line) {
			return 0;
		}
		getSubArray(columnStart, lineStart, columns = this.columns - columnStart, lines = this.lines - lineStart) {
			let i = lines, j;
			const array = new Array(i);
			while(i--) {
				j = columns;
				array[i] = new Array(j);
				while(j--) {
					array[i][j] = this.getValue(i + lineStart, j + columnStart);
				}
			}
			return array;
		}
	}
	class TiledMapStaticLayer  extends TiledMapLayer{
		constructor(lineStart, columnStart, array ) {
			const lines = array.length || 0,
				  columns = lines > 0 ? array[0].length : 0;
			super(lineStart, columnStart, lines, columns);
			this.array = array;
		}
		getValue(column, line) {
			return (0 <= line && 0 <= column && line < this.lines && column < this.columns) ?
				this.array[line][column] : 0
		}
		setValue(column, line, value) {
			if(0 <= line && 0 <= column && line < this.lines && column < this.columns)
				this.array[line][column] = value;
		}
		setSubArray(columnStart, lineStart, array) {
			let i = array.length, j;
			while(i--) {
				j = array[i].length;
				while(j--) {
					this.setValue(i + columnStart, j + lineStart, array[i][j]);
				}
			}
		}
	}
	class TiledMapStaticBinaryLayer extends TiledMapStaticLayer {
		constructor(lineStart, columnStart, array) {
			let i = array.length, j;
			while(i--) { j = array[i].length; while(j--) array[i][j] = array[i][j] ? 1 : 0;}
			super(lineStart, columnStart, array);
		}
		setValue(column, line, value) {
			super.setValue(column, line, value ? 1 : 0);
		}
	}
	class TiledMapObjectsOccupationLayer extends TiledMapLayer {
		constructor(tiledMap, lineStart, columnStart, lines, columns) {
			super(lineStart, columnStart, lines, columns);
			this.objects = [];
			this.tiledMap = tiledMap;
		}
		addObject(obj) {
			this.objects.push(obj);
		}
		removeObject(obj) {
			const i = this.objects.indexOf(obj);
			if(i >= 0) this.objects.splice(i,1);
		}
		getValue(col, line) {
			let cell, subMap, i = this.objects.length, l, c;
			while(i--) {
				cell = this.tiledMap.getTileIndices(this.objects[i].getPosition());
				subMap = this.objects[i].tilesOccupation;
				if(subMap && subMap.length > 0) {
					const subH = subMap.length,
						  top = cell.y - Math.floor((subH-1)/2);
					l = line - top;
					if(l >= 0 && l < subH) {
						const subW = subMap[l].length,
							  left = cell.x - Math.floor((subW-1)/2);
						c = col - left;
						if(c >= 0 && c < subW && subMap[l][c])
							return 1;
					}
				}
			}
			return 0;
		}
		getObjectsOnTile(col, line) {
			let cell, subMap, i = this.objects.length, l, c, obj;
			const objects = [];
			while(i--) {
				obj = this.objects[i];
				cell = this.tiledMap.getTileIndices(obj.getPosition());
				subMap = obj.tilesOccupation;
				if(subMap && subMap.length > 0) {
					const subH = subMap.length,
						top = cell.y - Math.floor((subH-1)/2);
					l = line - top;
					if(l >= 0 && l < subH) {
						const subW = subMap[l].length,
							left = cell.x - Math.floor((subW-1)/2);
						c = col - left;
						if(c >= 0 && c < subW && subMap[l][c])
							objects.push(obj);
					}
				}
			}
			return objects;
		}
		getSubArray(columnStart, lineStart, columns = this.columns - columnStart, lines = this.lines - lineStart) {
			let cell, subMap,obj, i = lines, j;
			const array = new Array(i);
			while(i--) {
				j = columns;
				array[i] = new Array(j);
				while(j--) array[i][j] = 0;
			}

			i = this.objects.length;
			while(i--) {
				obj = this.objects[i];
				cell = this.tiledMap.getTileIndices(obj.getPosition()).addXY(-this.columnStart, -this.lineStart);
				subMap = obj.tilesOccupation;
				if (subMap && subMap.length > 0) {
					const subH = subMap.length;
					const top = cell.y - Math.floor((subH - 1) / 2);
					let ii, l, c, subW, left;
					for(ii = 0; ii < subH; ii++) {
						l = top + ii - lineStart;
						if(l < 0 || l >= lines) continue;
						subW = subMap[ii].length;
						left = cell.x - Math.floor((subW - 1) / 2);
						for(j = 0; j < subW; j++) {
							c = left + j - columnStart;
							if(c < 0 || c >=  columns) continue;
							array[l][c] = subMap[ii][j] ? 1 : 0;
						}
					}
				}
			}
			return array;
		}
	}

	class TiledMap extends game.Object {
		constructor(position, columns, lines, tileWidth, tileHeight) {
			super(position);
			this.lines = lines;
			this.columns = columns;
			/**
			 * 
			 * @type {Array<game.TiledMapLayer>}
			 */
			this.layers = [];
			this.tileWidth = tileWidth;
			this.tileHeight = tileHeight;

		}
		get mapWidth() {
			return this.tileWidth * this.columns;
		}
		get mapHeight() {
			return this.tileHeight * this.lines;
		}
		getMapRect() {
			return Rect.createFromCenterWidthHeight(this.position, this.mapWidth, this.mapHeight);
		}
		getRect() {
			return Rect.getUnion([this.getMapRect(), this.getRenderRect(), this.getColliderRect()]);
		}
		scale(factor) {
			super.scale(factor);
			this.tileWidth *= factor;
			this.tileHeight *= factor;
		}
//######################################################################################################################
//#                                              layers getters / setters                                              #
//######################################################################################################################
		setLayer(id, tiledLayer) {
			this.layers[id] = tiledLayer;
		}
			
		getLayer(id) {
			return layers[id];
		}
		getLayersOnTile(column, line) {
			const layers = [];
			for(let id in this.layers) {
				if(!this.layers.hasOwnProperty(id)) continue;
				const layer = this.layers[id];
				if( layer.lineStart < line && layer.columnStart < column &&
					layer.lineStart + layer.lines > line &&
					layer.columnStart + layer.columns > column) {

					layers.push(layer);
				}
			}
		}
		getLayerId(layer) {
			let id = null;
			for(let _id in this.layers) {
				if(this.layers.hasOwnProperty(_id) && layer === this.layers[_id]) {
					id = _id;
					break;
				}
			}
			return id;
		}
		getMapArray(layerId) {
			return this.getLayer(layerId).array;
		}
		getValue(column, line, layerId) {
			const l = this.getLayer(layerId);
			return l.getValue(column - l.columnStart, line - l.lineStart);
		}
//######################################################################################################################
//#                                         game position <=> map tile indices                                         #
//######################################################################################################################
		/**
		 * returns the center of the selected cell
		 * @param {number} column
		 * @param {number} line
		 * @returns {utils.geometry2d.Vec2}
		 */
		getTileCenter(column, line) {
			let dX = (this.columns*0.5 - 0.5 - column) * this.tileWidth,
				dY = (this.lines*0.5 - 0.5 - line) * this.tileHeight;
			return this.position.clone().addXY(-dX, -dY);
		}
		/**
		 * returns the index of the board column containing the specified x coordinate
		 * @param {number} gameX
		 * @returns {number}
		 */
		getColumn(gameX) { return Math.floor(this.columns*0.5 + (gameX - this.position.x)/this.tileWidth); }
		/**
		 * returns the index of the board line containing the specified y coordinate
		 * @param {number} gameY
		 * @returns {number}
		 */
		getLine(gameY) { return Math.floor(this.lines*0.5 + (gameY - this.position.y)/this.tileHeight); }
		/**
		 * convert a game position to a board indices position
		 * @param {utils.geometry2d.Vec2} gamePos - the position you want to convert
		 * @returns {utils.geometry2d.Vec2} - the converted position : x = column index, y = row index
		 */
		getTileIndices(gamePos) { return new Vec2(this.getColumn(gamePos.x), this.getLine(gamePos.y)); }

		getTileRect(column, line) {
			return Rect.createFromCenterWidthHeight(this.getTileCenter(column, line), this.tileWidth, this.tileHeight);
		}
	}
	context.GridHelper = GridHelper;
	context.TiledMap = TiledMap;
	context.TiledMapLayer = TiledMapLayer;
	context.TiledMapStaticLayer = TiledMapStaticLayer;
	context.TiledMapStaticBinaryLayer = TiledMapStaticBinaryLayer;
	context.TiledMapObjectsOccupationLayer = TiledMapObjectsOccupationLayer;
})(window.game);