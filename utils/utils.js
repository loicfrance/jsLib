/**
 * @module utils/tools
 */
{
if(window) {
	//not in module, do nothing
} else {
	//import {Rect} from "utils/geometry2d";
}
/**
 * @typedef {Object} rgb
 * @property {number} r - integer in [0;255]
 * @property {number} g - integer in [0;255]
 * @property {number} b - integer in [0;255]
 */
//noinspection JSSuspiciousNameCombination
	/**
 * @typedef {Object} hsv
 * 
 * @property {number} h - integer in [0;359]
 * @property {number} s - integer in [0;255]
 * @property {number} v - integer in [0;255]
 */

//######################################################################################################################
//#                                                    LayoutGravity                                                   #
//######################################################################################################################

const G = {
	LEFT: 1, TOP: 2, RIGHT: 4, BOTTOM: 8, CENTER: 16,
	getRect: (gravity, availableRect, width, height, marginX=0, marginY=marginX)=> {
		availableRect = availableRect.clone().addMarginsXY(-marginX, -marginY);
		if (!(gravity & G.CENTER)) {
			if (gravity) {
				if (!(gravity & G.LEFT) && !(gravity & G.RIGHT)) gravity |= G.LEFT;
				if (!(gravity & G.TOP) && (gravity & G.BOTTOM)) gravity |= G.TOP;
			} else gravity = G.LEFT | G.TOP;
		}
		let left = NaN, top = NaN, right = NaN, bottom = NaN;
		if (gravity & G.CENTER) {
			let w = (availableRect.width - width)/2, h = (availableRect.h.height-height)/2;
			left = availableRect.xMin + w; right = availableRect.xMax - w;
			top = availableRect.yMin + h; bottom = availableRect.yMax - h;
		}
		if (gravity & G.LEFT !== 0) left = availableRect.xMin;
		if (gravity & G.TOP !== 0) top = availableRect.yMin;
		if (gravity & G.RIGHT !== 0) right = availableRect.xMax;
		if (gravity & G.BOTTOM !== 0) bottom = availableRect.yMax;
		if (isNaN(left)) left = right - width;
		else if (isNaN(right)) right = left + width;
		if (isNaN(top)) top = bottom - height;
		else if (isNaN(bottom)) bottom = top + height;
		return new Rect(left, top, right, bottom);
	},
	getHorizontalGravity: (g, defaultG = null) =>
		(g & G.LEFT) ? G.LEFT : (g & G.RIGHT) ? G.RIGHT : (g & G.CENTER) ? G.CENTER : defaultG ? defaultG : G.LEFT,
	getVerticalGravity: (g, defaultG = null) =>
		(g & G.TOP) ? G.TOP : (g & G.BOTTOM) ? G.BOTTOM : (g & G.CENTER) ? G.CENTER : defaultG ? defaultG : G.TOP
};
//######################################################################################################################
//#                                                       filters                                                      #
//######################################################################################################################
/**
 * a filter to use with Array.prototype.filter function, by binding the first argument <!--
 * -->to the array elements you want to keep.
 * 
 * @example [1,2,3,4].filter(intersectionFilter.bind(undefined, [1,4,5,6])); //[1,4]
 * @param {Array} array
 * @param {object} x
 */
const inclusionFilter = (array, x) => array.indexOf(x) !== -1;
/**
 * a filter to use with Array.prototype.filter function, by binding the first argument <!--
 * -->to the array of element you want to exclude.
 * 
 * @example [1,2,3,4].filter(exclusionFilter.bind(undefined, [1,4,5,6])); //[2,3]
 * @param {Array} array
 * @param {object} x
 */
const exclusionFilter = (array, x) => array.indexOf(x) === -1;
/**
 * a filter to use with Array.prototype.filter function, by binding the first argument <!--
 * -->to the class you want your objects to be instances of.
 * 
 * @param {class} _class
 * @param {object} x
 */
const instanceFilter  = (_class, x) => x instanceof _class;

//######################################################################################################################
//#                                                  color conversion                                                  #
//######################################################################################################################
/**
 * generates a random hex color
 * 
 * @param {number} [octets=3] - number of bytes this color will be on (4, 3 or 1.5) (not checked)
 * @returns {string}
 */
const randomColor = (octets=3) => '#'+Math.random().toString(16).substr(2,2*octets);
/**
 * convert hsv color to rgb
 * 
 * @param {number} h - in [0;1]
 * @param {number} s - in [0;1]
 * @param {number} v - in [0;1]
 * @returns {r,g,b}
 */
function HSVtoRGB(h, s, v) {
	const
		i = Math.floor(h * 6),
		f = h * 6 - i,
		p = v * (1 - s),
		q = v * (1 - f * s),
		t = v * (1 - (1 - f) * s);
	let r,g,b;
	switch (i % 6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}
	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255)
	};
}
/**
 * convert rgb color to hsv
 * 
 * @param {number} r - integer in [0;255]
 * @param {number} g - integer in [0;255]
 * @param {number} b - integer in [0;255]
 * @returns {hsv}
 */
function RBGtoHSV(r, g, b) {
	const max = Math.max(r, g, b), min = Math.min(r, g, b),
		d = max - min,
		s = (max === 0 ? 0 : d / max),
		v = max / 255;

	switch (max) {
		case min: return {h: 0, s: s, v: v};
		case r: return { h: ((g - b) + d * (g < b ? 6: 0))/(6*d), s: s, v: v};
		case g: return { h: ((b - r) + d * 2)/(6*d), s: s, v: v};
		case b: return { h: ((r - g) + d * 4)/(6*d), s: s, v: v};
		default : return {h: 0, s: 0, s: 0};
	}
}
/**
 * convert rgb color to hexadecimal string formated color
 * 
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
const RGBToHex = (r, g, b)=> ((r<16 && g < 16 && b < 16) || (r >= 16 && g >= 16 && b >= 16)) ?
				`#${r.toString(16)}${g.toString(16)}${b.toString(16)}` :
				`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
//######################################################################################################################
//#                                                    other methods                                                   #
//######################################################################################################################
/**
 * creates a mix of a superclass and several mixins to make a class extend a class and implements mixins.
 * 
 * @example
 * class A {
 * 	 constructor(x) {
 * 	   this.x = x;
 * 	 }
 *   hello() {
 *     alert('hello ' + this.x);
 * 	 }
 * };
 * var B = {
 *   howRU() {
 *     alert('How are you ?');
 *   }
 * };
 * class C extends mix(A, B) {
 *   constructor(x) {
 *     super(x);
 *	 }
 *	 hello() {
 *	   super.hello();
 *	   this.howRU();
 *	 }
 * }
 *
 * var d = new D('John');
 * d.hello(); // alert('Hi John !'); alert('how are you ?');
 * @param {class} superclass
 * @param {Object} mixins
 * @returns {class}
 */
function mix(superclass, ...mixins) {
	class C extends superclass { }
	let len = mixins.length, i = -1;
	while (++i < len) merge(C.prototype, mixins[i], true);
	return C;
}
/**
 * puts all properties of src in out. if override is false or not set, if a property, <!--
 * -->of src already exist in the parameter out, they are not overridden.
 * 
 * @param {object} out
 * @param {object} src
 * @param {boolean} [override=false]
 */
function merge(out, src, override = false) {
	for (let p in src) if (src.hasOwnProperty(p) && (override || !out.hasOwnProperty(p))) out[p] = src[p];
}
/**
 * 
 * @param {string} url
 * @returns {Promise} promise resolved with {@link String} object when string is loaded
 */
const loadString = (url) =>
	new Promise(resolve => {
		const client = new XMLHttpRequest();
		client.open('GET', url);
		client.onreadystatechange = () => {
			if(client.readyState === 4 && client.status === 200 || client.status === 0)
				resolve(client.responseText);
		}
		client.send();

	});
/**
 * 
 * @param {string} url
 * @returns {Promise} promise resolved with {@link Image} object when image is loaded
 */
const loadImage = (url) =>
	new Promise(resolve => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.src = url;
	});
/**
 * creates a worker running the specified script
 * 
 * @param {string} script
 * @returns {Worker} newly created web worker runnning the script
 */
function createScriptWorker(script) {
	const url = URL.createObjectURL(new Blob([script],
		{type: 'application/javascript'}));
	const worker = new Worker(url);
	URL.revokeObjectURL(url);
	return worker;
}
/**
 * replaces a function that does not exists by the same function with the vendor prefixes.
 * @example
 * polyfill(window, 'requestAnimationFrame', ['ms', 'moz', 'webkit', 'o']);
 * window.reaquestAnimationFrame(frameFunction);
 * @param {Object} container
 * @param {string} name
 * @param {string[]} vendors
 */
function polyfill(container, name, vendors) {
	for(let i = 0; i < vendors.length && !container[name]; i++) {
		container[name] = container[vendors[i] + name] ||
						  container[vendors[i] + name[0].toUpperCase() + name.substr(1)];
	}
}
function waitForEvent(object, event) {
	const attr = `on${event}`;
	return new Promise(r=>{
		const old = object[attr];
		object[attr] = evt => {
			object[attr] = old;
			r(evt)
		};
	});
}
function delay(ms) {
	return new Promise(r=>setTimeout(r, ms));
}
function textFileUserDownload(text, fileName) {
	let element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', fileName);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}
/**
 * convert text with BB code to html text with equivalent tags
 * @param {string} bbCode
 * @returns {*}
 */
function BBCodeToHTML(bbCode) {
	let str = bbCode;
	str = str.replace(/\[b](.+?)\[\/b]/g, "<b>$1</b>");

	str = str.replace(/\[br\/]/g, "");
	str = str.replace(/\[br]/g, "");

	str = str.replace(/\[i](.+?)\[\/i]/g, "<i>$1</i>");

	str = str.replace(/\[u](.+?)\[\/u]/g, "<u>$1</u>");

	str = str.replace(/\[s](.+?)\[\/s]/g, "<s>$1</s>");

	str = str.replace(/\[code](.+?)\[\/code]/g, "<code>$1</code>");
	str = str.replace(/\[pre](.+?)\[\/pre]/g, "<code>$1</code>");

	str = str.replace(/\[style (.+?)](.+?)\[\/style]/g, '<font $1>$2</font>');

	//str.replace(/#\[u](.+?)\[\/u]#si/g,'<span style="text-decoration:underline;">$1</span>',$chaine );
	str = str.replace(/\[size=(.+?)](.+?)\[\/size]/g, '<span style="font-size:$1px;">$2</span>');
	str = str.replace(/\[color=(.+?)](.+?)\[\/color]/g, '<span style="color:$1;">$2</span>');


	str = str.replace(/\[url=([^]+)](.+?)\[\/url]/g,'<a href="$1">$2</a>');
	str = str.replace(/\[url](.+?)\[\/url]/g, '<a href="$1" target="_blank">$1</a>');
	str = str.replace(/\[img](.+?)\[\/img]/g, '<img src="$1" border="0">');


	return str;
}
	/**
	 *
	 * @param {string} wasmUrl - url to WebAssembly file.
	 * @param {object} imports - objects to import in wasm
	 */
const loadWASM = (wasmUrl, imports)=>
		fetch(wasmUrl)
			.then(response => response.arrayBuffer())
			.then(bytes => WebAssembly.instantiate(bytes, imports));

const instanciateWASM = (wasmUrl, imports)=>
		loadWASM(wasmUrl, imports)
			.then(results => results.instance);
/**
 *
 * @param {number} min
 * @param {number} max
 * @return {number} random number between min and max
 */
Math.rangedRandom = ( min, max ) => Math.random()*(max-min)+min;
/**
 * generate a pseudo-gaussian random number in ]-1;1[
 * @return {number}
 */
Math.gaussianRandom = () => (Math.random()+Math.random()+Math.random()
					   +Math.random()+Math.random()+Math.random()-3)/3;

CanvasRenderingContext2D.prototype.wrapText = function(text, rect, lineHeight, textGravity, fill = true, stroke = false) {
	const paragraphs = text.split('\n');
	const parLen = paragraphs.length;
	const rectWidth = rect.width;
	let lines = [], line;
	let linesX = [], lineX = 0;
	let words, len;
	let testLine;
	let metrics;
	let width = 0;
	let n;
	for (let i = 0; i < parLen; i++) {
		words = paragraphs[i].split(' ');
		len = words.length;
		if (!len) {
			lines.push(paragraphs[i]);
			linesX.push(0);
			continue;
		}
		line = words[0];
		for (n = 1; n < len; n++) {
			testLine = line + ' ' + words[n];
			metrics = this.measureText(testLine);
			width = metrics.width;
			if (width > rectWidth && n > 0) {
				lineX = rect.xMin;
				if (!(textGravity & G.LEFT)) {
					if (textGravity & G.RIGHT) lineX += this.measureText(line).width - width;
					else if (textGravity & G.CENTER) lineX += (this.measureText(line).width - width) / 2;
				}
				lines.push(line);
				line = words[n];
				linesX.push(lineX);
			}
			else {
				line = testLine;
			}
		}
		lineX = rect.xMin;
		if (!(textGravity & G.LEFT)) {
			metrics = this.measureText(line);
			width = metrics.width;
			if (textGravity & G.RIGHT) lineX += rectWidth - width;
			else if (textGravity & G.CENTER) lineX += (rectWidth - width) / 2;
		}
		lines.push(line);
		linesX.push(lineX);
	}
	len = lines.length;
	let y = rect.yMin + lineHeight;
	if (!(textGravity & G.TOP)) {
		if (textGravity & G.BOTTOM) y = rect.yMax - lineHeight * (len - 1);
		else if (textGravity & G.CENTER) y += (rect.height - lineHeight * len) / 2;
	}
	for (n = 0; n < len; n++) {
		if (fill)   this.fillText(lines[n], linesX[n], y);
		if (stroke) this.strokeText(lines[n], linesX[n], y);
		y += lineHeight;
	}
};
if(window) {
	window.utils = window.utils || {};
	utils.tools = {
		LayoutGravity : G,
		inclusionFilter,
		exclusionFilter,
		instanceFilter,
		randomColor,
		HSVtoRGB,
		RBGtoHSV,
		RGBToHex,
		mix,
		merge,
		loadString,
		loadImage,
		createScriptWorker,
		polyfill,
		textFileUserDownload,
		BBCodeToHTML,
		loadWASM,
		instanciateWASM

	};
} else {
	/*
	const rangedRandom = Math.rangedRandom;
	const gaussianRandom = Math.gaussianRandom;
	const wrapText = CanvasRenderingContext2D.prototype.wrapText;
	export {
		G as LayoutGravity,
			inclusionFilter,
			exclusionFilter,
			instanceFilter,
			randomColor,
			HSVtoRGB,
			RBGtoHSV,
			RGBToHex,
			mix,
			merge,
			loadString,
			loadImage,
			createScriptWorker,
			polyfill,
			textFileUserDownload,
			BBCodeToHTML,
			loadWASM,
			instanciateWASM,
			rangedRandom,
			gaussianRandom,
			wrapText
	};
	*/
}
}
/**
* Created by rfrance on 12/20/2016.
*/

/**
 * @module utils/geometry
 */
{
//######################################################################################################################
//#                                                        Vec2                                                        #
//######################################################################################################################
/**
 * A simple class with 2 members : <code>{@link Vec2#x|x}</code> and <code>{@link Vec2#y|y}</code>, <!--
 * -->used to represent points and vectors in a 2-dimensions space
 * @class Vec2
 */
class Vec2 {
	/** @constructor
	 * @param {number} x - x coordinate
	 * @param {number} y - y coordinate
	 */
	constructor(x, y) {
		/**
		 * @name Vec2#x
		 * @type {number}
		 */
		this.x = x;
		/**
		 * @name Vec2#y
		 * @type {number}
		 */
		this.y = y;
	}

	/**
	 * angle of this Vec2, computed from the coordinates : <code>atan2(y, x)</code>.
	 * @type {number}
	 */
	get angle() {
		return Math.atan2(this.y, this.x);
	}

	/**
	 * sets the angle of this vector to the given one (in radians) :
	 * <code>x= cos(a)\*magnitude, y= sin(a)\*magnitude</code>
	 * @type {number}
	 */
	set angle(a) {
		const m = this.magnitude;
		if (m) {
			this.x = Math.cos(a) * m;
			this.y = Math.sin(a) * m;
		}
	}

	/**
	 * square magnitude of this vector, calculated from the coordinates : <code>{@link Vec2#x|x}<sup>2</sup> + <!--
	 * -->{@link Vec2#y|y}<sup>2</sup></code>
	 * @readonly
	 * @type {number}
	 */
	get squareMagnitude() {
		/*
		return asm.squareMagnitude(this.x, this.y);
		/*/
		return this.x * this.x + this.y * this.y;
		//*/
	}

	/**
	 * magnitude of this Vec2, calculated from the coordinates : <code>&radic;({@link Vec2#x|x}<sup>2</sup> + <!--
	 * -->{@link Vec2#y|y}<sup>2</sup>)</code>.
	 * @type {number}
	 */
	get magnitude() {
		/*
		return asm.magnitude(this.x, this.y);
		/*/
		return Math.sqrt(this.x * this.x + this.y * this.y);
		//*
	}

	/**
	 * sets the magnitude of the vector to the given one. keeps the angle
	 * sets x and y coordinates to make the magnitude = mag.
	 * @type {number}
	 */
	set magnitude(mag) {
		let m = this.magnitude;
		if (m) this.mul(mag / m); else this.x = mag;
	}

	/**
	 * @return {Vec2} a Vec2 with the same x and y properties
	 */
	clone() {
		return new Vec2(this.x, this.y);
	}

	/**
	 * sets x and y coordinates of this Vec2
	 * @param {number} x - new x coordinate
	 * @param {number} y - new y coordinate
	 * @return {Vec2} this
	 */
	setXY(x, y) {
		this.x = x;
		this.y = y;
		return this;
	}

	/**
	 * sets x and y coordinates to the same as the 'vec' parameter
	 * @param {Vec2} vec
	 * @return {Vec2} this
	 */
	set(vec) {
		this.x = vec.x;
		this.y = vec.y;
		return this;
	}

	/**
	 * sets x and y coordinates to 0
	 * @return {Vec2} this
	 */
	reset() {
		this.x = this.y = 0;
		return this;
	}

	/**
	 * @param {number} x - number to be added to x coordinate
	 * @param {number} y - number to be added to y coordinate
	 * @return {Vec2} this
	 */
	addXY(x, y) {
		this.x += x;
		this.y += y;
		return this;
	}

	/**
	 * @param {Vec2} vec
	 * @return {Vec2} this
	 */
	add(vec) {
		this.x += vec.x;
		this.y += vec.y;
		return this;
	}

	/**
	 * @param {Vec2} vec
	 * @return {Vec2} this
	 */
	remove(vec) {
		this.x -= vec.x;
		this.y -= vec.y;
		return this;
	}

	/**
	 * multiplies x and y coordinates by the parameter.
	 * @param {number} factor
	 * @return {Vec2} this
	 */
	mul(factor) {
		this.x *= factor;
		this.y *= factor;
		return this;
	}

	/**
	 * sets x and y coordinates to make the magnitude = 1.
	 * if x = y = 0, this function does nothing.
	 * @return {Vec2} this
	 */
	normalize() {
		this.mul(1 / (this.magnitude || 1));
		return this;
	}

	/**
	 * sets x and y coordinates to make the magnitude = mag.
	 * @param {number} mag -the new magnitude of this Vec2
	 * @return {Vec2} this
	 */
	setMagnitude(mag) {
		this.magnitude = mag;
		return this;
	}

	/**
	 * x= cos(a)*magnitude, y= sin(a)*magnitude
	 * @param {number} a - new angle(radians) of this Vec2
	 * @return {Vec2} this
	 */
	setAngle(a) {
		this.angle = a;
		return this;
	}

	/**
	 * @param {number} a - angle(radians) to rotate this Vec2
	 * this.angle += a;
	 * @return {Vec2} this
	 */
	rotate(a) {
		this.angle += a;
		return this;
	}

	/**
	 * rotate this Vec2 around the center, and keep the distance to the center
	 * @param {Vec2} center - point to rotate this Vec2 around
	 * @param {number} a - angle(radians) to rotate this Vec2
	 * @return {Vec2} this
	 */
	rotateAround(center, a) {
		return this.set(Vec2.translation(center, this).rotate(a).add(center));
	}

	/**
	 * @return {string} "(x,y)"
	 */
	toString() {
		return ['(', this.x, ',', this.y, ')'].join('');
	}

	/**
	 * @return {boolean} true if this.x=x and this.y=y, false otherwise.
	 */
	equalsXY(x, y) {
		return this.x === x && this.y === y;
	}

	/**
	 * @return {boolean} true if this.x=vec.x and this.y=vec.y, false otherwise.
	 */
	equals(vec) {
		return this.x === vec.x && this.y === vec.y;
	}

	/**
	 * @return {boolean} true if x=y=0, false otherwise.
	 */
	isZero() {
		return !(this.x || this.y);
	}

	/**
	 * @return {Vec2} new Vec2 containing unit (magnitude=1) version of this Vec2
	 */
	getUnit() {
		return this.clone().normalize();
	}

	/**
	 * @param {Vec2} [center=Vec2.ZERO]
	 * @return {Vec2} the mirror Vec2 of this Vec2, relative to the center
	 */
	getMirror(center = Vec2.ZERO) {
		return Vec2.translation(this, center).add(center);
	}

	/**
	 * @param {number} [axisX=0]
	 * @return {Vec2} the horizontal mirror Vec2 of this Vec2,
	 * relative to the axisX x coordinate
	 */
	getHorizontalMirror(axisX = 0) {
		return this.clone().mirrorHorizontally();
	}

	/**
	 * @param {number} [axisY=0]
	 * @return {Vec2} the vertical mirror Vec2 of this Vec2,
	 * relative to the axisY y coordinate
	 */
	getVerticalMirror(axisY = 0) {
		return this.clone().mirrorVertically();
	}

	mirror(center = Vec2.ZERO) {
		this.x = center.x ? 2 * center.x - this.x : -this.x;
		this.y = center.y ? 2 * center.y - this.y : -this.y;
		return this;
	}

	/**
	 * same (but faster) as instance.set(instance.getHorizontalMirror(axisX))
	 * @param {number} [axisX=0]
	 * @return {Vec2} this
	 */
	mirrorHorizontally(axisX = 0) {
		this.x = axisX ? 2 * axisX - this.x : -this.x;
		return this;
	}

	/**
	 * same (but faster) as instance.set(instance.getVerticalMirror(axisY))
	 * @param {number} [axisY=0]
	 * @return {Vec2} this
	 */
	mirrorVertically(axisY = 0) {
		this.y = axisY ? 2 * axisY - this.y : -this.y;
		return this;
	}

	/**
	 * @param {number} [digits=0] - number of digits the result must have.
	 *        if not set (= 0), the result will be the closest integer.

	 * @return {number} rounded value of x coordinate.
	 */
	getRoundedX(digits = 0) {
		if (digits) return parseInt(this.x.toPrecision(digits));
		else return Math.round(this.x);
	}

	/**
	 * @param {number} [digits=0] - number of digits the result must have.
	 *        if not set (= 0), the result will be the closest integer.
	 * @return {number} rounded value of y coordinate.
	 */
	getRoundedY(digits = 0) {
		if (digits) return parseInt(this.y.toPrecision(digits));
		else return Math.round(this.y);
	}

	/**
	 * @param {number} [digits=0] - number of digits the result must have.
	 *        if not set (= 0), the result will be the closest integer.
	 * @return {Vec2} copy of this Vec2 with rounded coordinates.
	 */
	roundedVec(digits = 0) {
		return new Vec2(this.getRoundedX(digits), this.getRoundedY(digits));
	}

	/**
	 * if the magnitude of this Vec2 is not in the interval [min, max],
	 * this method modifies the coordinate to make the magnitude
	 * to the max(if magnitude is higher) or the min (if magnitude is lower).
	 * @param {number} min - the minimum magnitude
	 * @param {number} max - the maximum magnitude
	 * @return {Vec2} this
	 */
	clampMagnitude(min, max) {
		let m = this.magnitude;
		if (m) {
			if (m < min) this.mul(min / m);
			else if (m > max) this.mul(max / m);
		} else this.x = min;
		return this;
	}

	/**
	 * @static
	 * @param {Vec2} u
	 * @param {Vec2} v
	 * @return {number} the result of the dot product of u and v.
	 */
	static dotProd(u, v) {
		/*
		return asm.dotProduct(u.x, u.y, v.x, v.y);
		/*/
		return u.x * v.x + u.y * v.y;
		//*/
	}

	/**
	 * @static
	 * @param {Vec2} u
	 * @param {Vec2} v
	 * @return {number} the result of the vectorial product of u and v.
	 */
	static vectProd(u, v) {
		/*
		return asm.vectorProduct(u.x, u.y, v.x, v.y);
		/*/
		return u.x * v.y - u.y * v.x;
		//*/
	}

	/**
	 * @static
	 * @param {Vec2} A - start point
	 * @param {Vec2} B - end point
	 * @return {Vec2} the translation from A to B
	 */
	static translation(A, B) {
		return new Vec2(B.x - A.x, B.y - A.y);
	}

	/**
	 * @static
	 * @param {Vec2} A
	 * @param {Vec2} B
	 * @return {number} the square euclidian distance between A and B
	 */
	static squareDistance(A, B) {
		/*
		return asm.squareEuclideanDistance(A.x, A.y, B.x, B.y);
		/*/
		let dX = B.x - A.x, dY = B.y - A.y;
		return dX * dX + dY * dY;
		//*/
	}

	/**
	 * @static
	 * @param {Vec2} A
	 * @param {Vec2} B
	 * @return {number} the euclidian distance between A and B
	 */
	static distance(A, B) {
		/*
		return asm.euclideanDistance(A.x, A.y, B.x, B.y);
		/*/
		return Math.sqrt(Vec2.squareDistance(A, B));
		//*/
	}

	/**
	 * @static
	 * @param {Vec2} A
	 * @param {Vec2} B
	 * @return {number} the manhattan distance between A and B
	 */
	static manhattanDistance(A, B) {
		/*
		return asm.manhattanDistance(A.x, A.y, B.x, B.y);
		/*/
		return Math.abs(B.x - A.x) + Math.abs(B.y - A.y);
		//*/
	}

	/**
	 * @static
	 * @param {Vec2} A
	 * @param {Vec2} B
	 * @return {number} the diagonal distance between A and B
	 */
	static diagonalDistance(A, B) {
		/*
		return asm.diagonalDistance(A.x, A.y, B.x, B.y);
		/*/
		return Math.max(Math.abs(B.x - A.x), Math.abs(B.y - A.y));
		//*/
	}

	/**
	 * @static
	 * @param {Vec2} A
	 * @param {Vec2} B
	 * @param {Vec2} C
	 * @return {boolean} true if AB and AC are in counter-clockwise order,
	 *         false otherwise
	 */
	static ccw(A, B, C) {
		/*
		return asm.ccw(A.x, A.y, B.x, B.y, C.x, C.y);
		/*/
		return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
		//*/
	}

	/**
	 * @static
	 * @param {Vec2} AB
	 * @param {Vec2} AC
	 * @return {boolean} true if AB and AC are in counter-clockwise order,
	 *         false otherwise
	 */
	static ccw2(AB, AC) {
		/*
		return asm.ccw2(AB.x, AB.y, AC.x, AC.y);
		/*/
		return AC.y * AB.x > AB.y * AC.x;
		//*/
	}

	/**
	 * @static
	 * @param {number} rad radians
	 * @param {number} [mag=1] magnitude
	 * @return {Vec2} (cos(rad)*mag, sin(rad)*mag)
	 */
	static createFromAngle(rad, mag = 1) {
		return new Vec2(Math.cos(rad) * mag, Math.sin(rad) * mag);
	}

	/**
	 * @static
	 * @param {number[]} xyxyArray - array of points coordinates ordered
	 *        like this : [x1, y1, x2, y2, x3, y3, ...].
	 * @return {Vec2[]} a Vec2 array : [(x1,y1), (x2,y2), (x3,y3), ...].
	 */
	static createVec2Array(xyxyArray) {
		const len = Math.floor(xyxyArray.length / 2), result = new Array(len);
		let i = len, i2;
		while (i--) {
			i2 = 2 * i;
			result[i] = new Vec2(xyxyArray[i2], xyxyArray[i2 + 1]);
		}
		return result;
	}

	/**
	 * @static
	 * @param {Vec2[]} vec2Array - the array of points to convert to the float array
	 * @returns {Float32Array} the array containing all x and y coordinates of the given points, in the form <!--
	 * -->[x1, y1, x2, y2, ... xn, yn]
	 */
	static createFloatArray(vec2Array) {
		const len = vec2Array.length, result = new Float32Array(len*2);
		let i = len, i2;
		while(i--) {
			i2 = i*2;
			result[i2  ] = vec2Array[i].x;
			result[i2+1] = vec2Array[i].y;
		}
		return result;
	}

	/**
	 * a new <code>{@link Vec2}</code> with <code>x = y = 0</code>
	 * @static
	 * @constant
	 * @readonly
	 * @type {Vec2}
	 */
	static get zero() {
		return new Vec2(0, 0);
	}
}
/**
 * (0,0).
 * @static
 * @constant
 * @memberOf Vec2
 * @type {Vec2}
 */
Vec2.ZERO = Vec2.zero;
//######################################################################################################################
//#                                                        Rect                                                        #
//######################################################################################################################
/** @class Rect
 * @memberOf utils.geometry2d
 * @classdesc a class with four attributes : <code>{@link Rect#left|xMin}</code>, <!--
 * --><code>{@link Rect#top|yMin}</code>, <!--
 * --><code>{@link Rect#right|xMax}</code> and <!--
 * --><code>{@link Rect#bottom|yMax}</code>, used to represent a non-rotated rectangle.
 */
class Rect {
	/** @constructor
	 * @param {number} xMin
	 * @param {number} yMin
	 * @param {number} xMax
	 * @param {number} yMax
	 */
	constructor(xMin, yMin, xMax, yMax) {
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
	 * width (= right - left) of the instance.
	 * @type {number}
	 * @readonly
	 */
	get width() {
		return this.xMax - this.xMin;
	}

	/**
	 * height (= bottom - top) of the instance.
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
	 * center of the instance. when modified, keeps the dimensions.
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

	/**
	 * creates a rectangular {@link Polygon} corresponding to the instance
	 * @returns {Polygon}
	 */
	getShape() {
		return Polygon.Absolute(Vec2.createVec2Array([this.xMin, this.yMin, this.xMax, this.yMin,
			this.xMax, this.yMax, this.xMin, this.yMax]));
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
	 * the maximum left and top, and the minimum right and bottom of all rects.
	 * if the max left(resp. top) happen to be higher than the minimum right(resp. bottom),
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
	 * create a {@link Rect|Rect} where the <code>left</code> and <code>right</code> <!--
	 * -->components are equal to the x coordinate <!--
	 * -->and the <code>top</code> and <code>bottom</code> components to the y coordinate of the given point.
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
//######################################################################################################################
//#                                                        Shape                                                       #
//######################################################################################################################
/**
 * @class Shape
 * @abstract
 * @memberOf utils.geometry2d
 * @classdesc the base class of all shapes. has only one member : <!--
 * --><code>{@link Shape#center|center}</code>, the center of the shape, <!--
 * -->and plenty of useful methods with default behavior.
 */
class Shape {
	/**
	 * @constructor
	 * @param {Vec2} center the new center of the shape.
	 * The member of the new instance is not the same, the attributes of the parameter are copied to the member.
	 * If undefined, the member won't be set, but the superclass has to provide a getter and a setter<!--
	 * --> to modify the shape's center
	 */
	constructor(center) {
		/**
		 * @name Shape#center
		 * @type {Vec2}
		 */
		if(center) this.center = center.clone();
	}

	/**
	 * perimeter of the instance.
	 * @readonly
	 * @type {number}
	 */
	get perimeter() {
		return 0;
	}

	/**
	 * area of the instance.
	 * @readonly
	 * @type {number}
	 */
	get area() {
		return 0;
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
	 * makes the shape bigger by multiplying it's dimensions by the given factor
	 * @param {number} factor - the number which will multiply the dimensions
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#growDistance}
	 */
	scale(factor) {
		return this;
	}

	/**
	 * makes the shape bigger by adding to it's dimensions the given distance
	 * @param {number} delta - the number to add to the dimensions
	 * @returns {Shape} <code>this</code>
	 * @see {@link Shape#scale}
	 */
	growDistance(delta) {
		return this;
	}

	/**
	 * rotates the shape by the given angle in radians.
	 * @param {number} radians - angle.
	 * @returns {Shape} <code>this</code>
	 */
	rotate(radians) {
		return this;
	}

	/**
	 * adds the instructions to draw this instance to the context.
	 * @param {CanvasRenderingContext2D} context
	 * @see {@link Shape#draw}
	 */
	pushPath(context) {
	}

	/**
	 * draw the shape on the canvas using its webgl context.
	 * To fill the shape, the draw mode must de TRIANGLES.
	 * you can acquire how many points will be added to the array or how many triangles will be drawned <!--
	 * -->by using the attributes {@link Circle#glPointsNumber} and <!--
	 * -->{@link Circle#glTriangles}
	 * @param {Array} verticesArray array where the points x and y coordinates will be placed
	 * @param {number} vOffset indice of the first free place in the array (must be even)
	 * @param {Array} indicesArray array where the indices of the points <!--
	 * -->for the triangles to be drawned will be placed
	 * @param {number} iOffset indice of the first free place in indicesArray (should be a multiple of 3)
	 */
	getVertices(verticesArray, vOffset, indicesArray, iOffset){

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
		this.pushPath(context);
		fill && context.fill();
		stroke && context.stroke();
	}

	/**
	 * returns whether or not the instance intersect (=collide) with the given shape.
	 * @param {Shape} shape
	 * @returns {boolean} true if the 2 shapes intersect.
	 */
	intersect(shape) {
		return false;
	}

	/**
	 * returns the intersection points with the given shape
	 * @param {Shape} shape
	 * @returns {Vec2[]}
	 */
	getIntersectionPoints(shape) {
		return [];
	}

	/**
	 * @param {Vec2} point
	 * @returns {boolean} true if the point is located inside the shape.
	 */
	contains(point) {
		return false;
	}

	/**
	 * returns a {@link Rect|Rect} containing the entire shape.
	 * @returns {Rect} the outside {@link Rect|Rect}
	 */
	getRect() {
		return Rect.createFromPoint(this.center);
	}

	/**
	 * returns the maximum distance to the <code>{@link Shape#center|center}</code> <!--
	 * -->a point of the shape could have.
	 * @returns {number} max distance to <code>{@link Shape#center|center}</code>
	 */
	getRadius() {
		return 0;
	}

	/**
	 * creates a <code>{@link Circle|Circle}</code> with the same center as the shape, <!--
	 * -->and the radius returned by <code>{@link Shape#getRadius|getRadius}</code>.
	 * @returns {Circle}
	 */
	getCircle() {
		return new Circle(this.center, this.getRadius());
	}

	/**
	 * returns the point corresponding to a certain percent of the instance's outline,
	 * the start point depends on the shape.
	 * @param {number} percent - percentage. must be in [0-1[.
	 * @returns {Vec2} the corresponding point.
	 */
	getPercentPoint(percent) {
		return this.center
	};

	/**
	 * returns the closest point of the shape to the given point
	 * @param {Vec2} p
	 * @returns {Vec2} closest point of the shape.
	 */
	closestPointTo(p) {
		return this.center;
	}

	/**
	 * returns a copy of this shape.
	 * @returns {Shape} the instance's copy
	 */
	clone() {
		return new Shape(this.center);
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
}
/**
 * number of points used to draw this shape.
 * @type {number}
 * @name Shape#glPointsNumber
 */
Shape.prototype.glPointsNumber = 0;
/**
 * number of triangles used to draw this shape.
 * @type {number}
 * @name Shape#glTriangles
 */
Shape.prototype.glTriangles = 0;
//######################################################################################################################
//#                                                       Circle                                                       #
//######################################################################################################################
/**
 * @class Circle
 * @augments Shape
 * @memberOf utils.geometry2d
 * @classdesc a shape representing a circle. Adds one member to the one present in <!--
 * --><code>{@link Shape|Shape}</code> : <!--
 * --><code>{@link Circle#radius|radius}</code>, <!--
 * -->the radius of the circle.
 */
class Circle extends Shape {
	/**
	 * @constructor
	 * @param {Vec2} center
	 * @param {number} radius
	 */
	constructor(center, radius) {
		super(center);
		/**
		 * @name Circle#radius
		 * @type {number}
		 */ this.radius = radius;
	}

	/**
	 * perimeter of the circle : <code>2 \* &pi; \* {@link Circle#radius|radius}</code>
	 * @type {number}
	 */
	get perimeter() {
		return Circle.PI2 * this.radius;
	}

	/**
	 * area of the circle : <code>&pi; \* {@link Circle#radius|radius}<sup>2</sup></code>
	 * @type {number}
	 */
	get area() {
		return Math.pow(this.radius, 2) * Math.PI;
	}

	/**
	 * @description multiplies the radius by the argument.
	 * @param {number} factor
	 * @returns {Circle} <code>this</code>
	 * @see [superclass method]{@link Shape#scale}
	 * @see {@link Circle#growDistance}
	 */
	scale(factor) {
		this.radius *= factor;
		return this;
	}

	/**
	 * adds the argument to the radius.
	 * @param {number} delta
	 * @returns {Circle} <code>this</code>
	 * @see [superclass method]{@link Shape#growDistance}
	 * @see {@link Circle#scale}
	 */
	growDistance(delta) {
		this.radius += delta;
		return this;
	}

	/**
	 * returns the point of the circle, relative to its center, corresponding to the given radians.
	 * @param {number} radians
	 * @returns {Vec2}
	 * @see {@link Circle#pointForAngle}
	 */
	relativePointForAngle(radians) {
		return Vec2.createFromAngle(radians, this.radius);
	}

	/**
	 * returns the point of the circle, in absolute coordinates, corresponding to the given radians.
	 * @param {number} radians
	 * @returns {Vec2}
	 * @see {@link Circle#relativePointForAngle}
	 */
	pointForAngle(radians) {
		return Vec2.createFromAngle(radians, this.radius).add(this.center);
	}

	/**@inheritDoc*/
	pushPath(context) {
		context.arc(this.center.x, this.center.y, this.radius, 0, Circle.PI2, false);
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
		context.arc(this.center.x, this.center.y, this.radius, 0, Circle.PI2, false);
		fill && context.fill();
		stroke && context.stroke();
	}

	/**
	 * draw the shape on the canvas using its webgl context.
	 * To fill the shape, the draw mode must de TRIANGLES.
	 * you can acquire how many points will be added to the array or how many triangles will be drawned <!--
	 * -->by using the attributes {@link Circle#glPointsNumber} and <!--
	 * -->{@link Circle#glTriangles}
	 * @param {Array} verticesArray array where the points x and y coordinates will be placed
	 * @param {number} vOffset indice of the first free place in the array (must be even)
	 * @param {Array} indicesArray array where the indices of the points <!--
	 * -->for the triangles to be drawned will be placed
	 * @param {number} iOffset indice of the first free place in indicesArray (should be a multiple of 3)
	 */
	getVertices(verticesArray, vOffset, indicesArray, iOffset){
		const o = vOffset/2;
		let n = this.glPointsNumber, dA = Circle.PI2/n, a = -dA, i = -1, t;
		while(++i < n) {
			verticesArray[vOffset++] = (t = Vec2.createFromAngle(a += dA, this.radius)).x;
			verticesArray[vOffset++] = t.y;
			if(i > 1) {
				indicesArray[iOffset++] = o; //first point
				indicesArray[iOffset++] = o+i-1; //previous point
				indicesArray[iOffset++] = o+i; //current point
			}
		}
	}
	/**
	 * number of points used to draw this shape.
	 * @type {number}
	 * @name Circle#glPointsNumber
	 */
	get glTriangles() {
		return this.glPointsNumber-2;
	}

	/**
	 * returns whether or not this circle instance intersect the specified shape.
	 * This function only does the job for {@link Circle} instances. <!--
	 * -->For the instances of other classes,
	 * this function calls their method : <code>shape.intersect(this)</code>
	 * @param {Shape} shape
	 * @returns {boolean}
	 */
	intersect(shape) {
		if (shape instanceof Circle) {
			/*
			return !!(asm.circlesIntersect(this.center.x, this.center.y, this.radius,
								shape.center.x, shape.center.y, shape.radius));
			/*/
			let d = Vec2.distance(this.center, shape.center);
			return d < this.radius + shape.radius &&
				this.radius < d + shape.radius && // the other circle is not inside this circle
				shape.radius < d + this.radius; // this circle is not inside the other circle
			//*/
		}
		else return shape.intersect(this);
	}

	/**
	 * returns the intersection points between this circle and the given shape
	 * @param {Shape} shape
	 * @returns {Vec2[]}
	 */
	getIntersectionPoints(shape) {
		if(shape instanceof Circle) {
			let trans = Vec2.translation(this.center, shape.center),
				d2 = trans.squareMagnitude,
				da = Math.acos(d2-shape.radius*shape.radius+this.radius*this.radius)/(2*Math.sqrt(d2)*this.radius),
				a = trans.angle;
			return [Vec2.createFromAngle(a + da, this.radius), Vec2.createFromAngle(a-da, this.radius)];
		} else return shape.getIntersectionPoints(this);
	}

	/**@inheritDoc*/
	contains(point) {
		return Vec2.distance(this.center, point) <= this.radius;
	}

	/**@inheritDoc*/
	getRect() {
		return Rect.createFromXY(this.center.x, this.center.y).addMargin(this.radius);
	}

	/**@inheritDoc*/
	getPercentPoint(percent) {
		return this.pointForAngle(percent * Circle.PI2);
	}

	/**@inheritDoc*/
	closestPointTo(p) {
		return Vec2.translation(this.center, p).setMagnitude(this.radius);
	}

	/**
	 * @returns {number} the value of the {@link Circle#radius{radius} attribute
	 */
	getRadius() {
		return this.radius;
	}

	/**
	 * creates a copy of the circle. Does the same as {@link Circle#clone}
	 * @returns {Circle}
	 * @see [superclass method]{@link Shape#getCircle}
	 */
	getCircle() {
		return new Circle(this.center, this.radius);
	}

	/**
	 * creates a copy of the circle. Does the same as {@link Circle#getCircle}
	 * @returns {Circle}
	 * @see [superclass method]{@link Shape#clone}
	 */
	clone() {
		return new Circle(this.center, this.radius);
	}

	/**
	 * creates and returns an equivalent polygon.
	 * @param {number} edges - number of edges you want your polygon to have
	 * @param {number} startRadians
	 * @returns {Polygon} the equivalent polygon
	 */
	toPolygon(edges, startRadians = 0) {
		return Polygon.Regular(this.center, [this.radius], edges, startRadians);
	}
}
/**
 * number of points used to draw this shape.
 * @type {number}
 * @name Circle#glPointsNumber
 */
Circle.prototype.glPointsNumber = 16;
/**
 * 2 \* PI
 * @static
 * @constant
 * @memberOf Circle
 * @type {number}
 */
Circle.PI2 = 2 * Math.PI;
/**
 * PI / 2
 * @static
 * @constant
 * @memberOf Circle
 * @type {number}
 */
Circle.PI_2 = 2 * Math.PI;
//######################################################################################################################
//#                                                      Ellipsoid                                                     #
//######################################################################################################################
/**
 * @class Ellipsoid
 * @augments Shape
 * @memberOf utils.geometry2d
 * @classdesc a shape representing an ellipsoid, optimized for drawing. make sure to always have <!--
 * -->{@link Ellipsoid#radiusX|radiusX} &ge; <!--
 * -->{@link Ellipsoid#radiusX|radiusX} for the methods to work properly.
 * You can reorder radiusX and radiusY by calling the {@Ellipsoid#checkRadius|checkRadius} <!--
 * -->method.
 * <b>&#x26A0;</b> ellipsoids cannot be used for collision detection, and most of their methods take time. <!--
 * -->You can make an ellipsoid-like {@link Polygon|Polygon} by calling the method <!--
 * -->{@link Ellipsoid#toPolygon|toPolygon}, or directly by calling the static method <!--
 * -->[Polygon.createEllipsoid]{@link Polygon#createEllipsoid}.
 */
class Ellipsoid extends Shape {
	/**
	 * @constructor
	 * @param {Vec2}center
	 * @param {number} radiusX
	 * @param {number} radiusY
	 * @param {number} radians
	 */
	constructor(center, radiusX, radiusY, radians = 0) {
		super(center);
		/**
		 * horizontal radius
		 * @name Ellipsoid#radiusX
		 * @type {number}
		 */
		this.radiusX = radiusX;
		/**
		 * vertical radius;
		 * @name Ellipsoid#radiusY
		 * @type {number}
		 */
		this.radiusY = radiusY;
		/**
		 * @name Ellipsoid#angle
		 * @type {number}
		 */
		this.angle = radians;
	}

	/**
	 * square of the focus distance : <code>{@link Ellipsoid#radiusX|radiusX}<sup>2</sup> <!--
	 * -->- {@link Ellipsoid#radiusY|radiusY}<sup>2</sup></code>
	 * @type {number}
	 * @readonly
	 */
	get squareFocusDistance() {
		return this.radiusX * this.radiusX - this.radiusY * this.radiusY;
	}

	/**
	 * focus distance : <code>&radic;({@link Ellipsoid#radiusX|radiusX}<sup>2</sup> <!--
	 * -->- {@link Ellipsoid#radiusY|radiusY}<sup>2</sup>)</code>
	 * @type {number}
	 * @readonly
	 */
	get focusDistance() {
		return Math.sqrt(this.squareFocusDistance);
	}

	/**
	 * excentricity = <code>([focus distance]{@link Ellipsoid#focusDistance|focusDistance}) <!--
	 * -->/ ([horizontal radius]{@link Ellipsoid#radiusX})</code>
	 * @type {number}
	 */
	get excentricity() {
		return this.focusDistance / this.radiusX;
	}

	/**
	 * approximation of the perimeter of the ellipsoid : <code>&pi; \* &radic;(2 \* <!--
	 * -->({@link Ellipsoid#radiusX|radiusX}<sup>2</sup> <!--
	 * -->+ {@link Ellipsoid#radiusY|radiusY}<sup>2</sup>))</code>
	 * @type {number}
	 */
	get perimeter() {
		return Math.PI * Math.sqrt(2 * this.squareFocusDistance);
	}

	/**
	 * area of the ellipsoid : <code>{@link Ellipsoid#radiusX|radiusX} <!--
	 * -->\* {@link Ellipsoid#radiusY|radiusY} \* &pi;</code>
	 * @type {number}
	 */
	get area() {
		return this.radiusX * this.radiusY * Math.PI;
	}

	/**
	 * makes the ellipsoid the opposite of itself relative to the given vertical axis
	 * if no value is set for axisX, the mirror will be made relative to the center's x coordinate.
	 * @param {number} [axisX=center.x]
	 *          abscissa of the vertical axis
	 * @returns {Shape} <code>this</code>
	 */
	mirrorHorizontally(axisX = this.center.x) {
		this.radians = -this.radians;
		return super.mirrorHorizontally(axisX);
	}

	/**
	 * makes the ellipsoid the opposite of itself relative to the given horizontal axis
	 * if no value is set for axisY, the mirror will be made relative to the center's y coordinate.
	 * @param {number} [axisY=center.y]
	 *          ordinate of the vertical axis
	 * @returns {Shape} <code>this</code>
	 */
	mirrorVertically(axisY = this.center.y) {
		this.radians = -this.radians;
		return super.mirrorVertically(axisY);
	}

	/**
	 * multiplies the vertical and horizontal radius by the given factor.
	 * @param {number} factor
	 * @returns {Ellipsoid} <code>this</code>
	 */
	scale(factor) {
		this.radiusX *= factor;
		this.radiusY *= factor;
		return this;
	}

	/**
	 * adds the argument to the vertical and horizontal radius.
	 * @param {number} delta
	 * @returns {Ellipsoid} <code>this</code>
	 */
	growDistance(delta) {
		this.radiusX += delta;
		this.radiusY += delta;
		return this;
	}

	/**
	 * rotate the ellipsoid by the specified angle, in radians
	 * @param {number} radians
	 * @returns {Ellipsoid} <code>this</code>
	 */
	rotate(radians) {
		this.radians += radians;
		return this;
	}

	/**
	 * sets the {@link Ellipsoid#radians|radians} attribute to the specified value.
	 * @param {number} radians
	 * @returns {Ellipsoid} <code>this</code>
	 */
	setAngle(radians) {
		this.radians = radians;
		return this;
	}

	/**
	 * checks if the horizontal radius is the same as the vertical radius. if they're not, they are inverted, <!--
	 * -->and the ellipsoid rotated anticlockwise for it to look the same.
	 * @returns {Ellipsoid} <code>this</code>
	 */
	checkRadius() {
		if (this.radiusX < this.radiusY) {
			[this.radiusX, this.radiusY] = [this.radiusY, this.radiusX];
			this.setAngle(this.radians + Circle.PI_2);
		}
		return this;
	}

	/**
	 * returns the point of the ellipsoid, relative to its center, corresponding to the given radians.
	 * @param {number} radians
	 * @returns {Vec2}
	 * @see {@link Ellipsoid#pointForAngle}
	 */
	relativePointForAngle(radians) {
		let r = radians - this.radians;
		return new Vec2(this.radiusX * Math.cos(r), this.radiusY * Math.sin(r)).rotate(this.radians);
	}

	/**
	 * returns the point of the ellipsoid, in absolute coordinates, corresponding to the given radians.
	 * @param {number} radians
	 * @returns {Vec2}
	 * @see {@link Ellipsoid#relativePointForAngle}
	 */
	pointForAngle(radians) {
		return this.relativePointForAngle(radians).add(this.center);
	}

	/**
	 * returns the square distance from the center to the ellipsoid for the specified angle in radians
	 * @param {number} radians
	 * @returns {number}
	 * @see {@link Ellipsoid#radiusForAngle}
	 */
	squareRadiusForAngle(radians) {
		return this.relativePointForAngle(radians).squareMagnitude;
	}

	/**
	 * returns the distance from the center to the ellipsoid for the specified angle in radians
	 * @param {number} radians
	 * @returns {number}
	 * @see {@link Ellipsoid#squareRadiusForAngle}
	 */
	radiusForAngle(radians) {
		return Math.sqrt(this.squareRadiusForAngle(radians));
	}

	/**@inheritDoc*/
	pushPath(context) {
		context.ellipse(this.center.x, this.center.y, this.radiusX, this.radiusY, this.radians, 0, Circle.PI2);
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
		context.ellipse(this.center.x, this.center.y, this.radiusX, this.radiusY, this.radians, 0, Circle.PI2);
		fill && context.fill();
		stroke && context.stroke();
	}
	/**
	 * draw the shape on the canvas using its webgl context.
	 * To fill the shape, the draw mode must de TRIANGLES.
	 * you can acquire how many points will be added to the array or how many triangles will be drawned <!--
	 * -->by using the attributes {@link Ellipsoid#glPointsNumber} and <!--
	 * -->{@link Ellipsoid#glTriangles}
	 * @param {Array} verticesArray array where the points x and y coordinates will be placed
	 * @param {number} vOffset indice of the first free place in the array (must be even)
	 * @param {Array} indicesArray array where the indices of the points <!--
	 * -->for the triangles to be drawned will be placed
	 * @param {number} iOffset indice of the first free place in indicesArray (should be a multiple of 3)
	 */
	getVertices(verticesArray, vOffset, indicesArray, iOffset){
		const o = offset/2;
		let n = this.glPointsNumber-1, dA = Circle.PI2/n, a = 0, i = -1;
		while(++i < n) {
			float32Array[vOffset++] = (t = this.pointForAngle(a += dA)).x;
			float32Array[vOffset++] = t.y;
			if(i > 1) {
				indicesArray[iOffset++] = o; //first point
				indicesArray[iOffset++] = o+i; //current point
				indicesArray[iOffset++] = o+i-1; //previous point
			}
		}
	}
	/**
	 * number of points used to draw this shape.
	 * @type {number}
	 * @name Ellipsoid#glPointsNumber
	 */
	get glTriangles() {
		return this.glPointsNumber-1;
	}

	/**@inheritDoc*/
	contains(point) {
		let p = point.clone().remove(this.center);
		return this.squareRadiusForAngle(p.angle) > p.squareMagnitude;
	}

	/**@inheritDoc*/
	getRect() {
		let h, w; //half-height, half-width
		if (this.radians) {
			let a = this.radiusX, b = this.radiusY, alpha = this.radians,
				tanAlpha = Math.tan(alpha), sinAlpha = Math.sin(alpha), cosAlpha = Math.cos(alpha),
				b_a = b / a, t_xMax = Math.atan(-b_a * tanAlpha), t_yMax = Math.atan(b_a / tanAlpha);
			h = Math.abs(a * Math.cos(t_yMax) * sinAlpha + b * Math.sin(t_yMax) * cosAlpha);
			w = Math.abs(a * Math.cos(t_xMax) * cosAlpha + b * Math.sin(t_xMax) * sinAlpha);
		} else {
			h = this.radiusY;
			w = this.radiusX;
		}
		return new Rect(this.center.x - w, this.center.y - h, this.center.x + w, this.center.y + h);
	}

	/**@inheritDoc*/
	getRadius() {
		return this.radiusX;
	}

	/**@inheritDoc*/
	getPercentPoint(percent) {
		return this.pointForAngle(Circle.PI2 * percent + this.radians);
	}

	/**@inheritDoc*/
	closestPointTo(p) {
		return this.pointForAngle(Vec2.translation(this.center, p).angle);
	}

	/**@inheritDoc*/
	clone() {
		return new Ellipsoid(this.center, this.radiusX, this.radiusY, this.radians);
	}

	/**
	 * creates and returns the polygon equivalent of the ellipsoid
	 * @param {number} edges
	 * @returns {@link Polygon} polygon equivalent of this ellipsoid
	 */
	createPolygon(edges) {
		return Polygon.createEllipsoid(this.center, this.radiusX, this.radiusY, edges, this.radians);
	}
}
/**
 * number of points used to draw this shape.
 * @type {number}
 * @name Ellipsoid#glPointsNumber
 */
Ellipsoid.prototype.glPointsNumber = 16;
//######################################################################################################################
//#                                                        Line                                                        #
//######################################################################################################################
let A = Vec2.zero, B = Vec2.zero, C = Vec2.zero, D = Vec2.zero, AB = Vec2.zero, AC = Vec2.zero, AD = Vec2.zero,
	u = Vec2.zero, CD = Vec2.zero, d=0, BC = Vec2.zero, BD = Vec2.zero;
/**
 * @class Line
 * @augments Shape
 * @memberOf utils.geometry2d
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
		super(undefined);
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
	get center() {
		return A.set(this.p0).add(this.p1).mul(0.5);
	}
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
		this.center = center;
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
		if (shape instanceof Circle) {
			/*
			return asm.circleLineIntersect(shape.center.x, shape.center.y, shape.radius, this.p0.x, this.p0.y,
											this.p1.x, this.p1.y);
			/*/
			if (shape.contains(this.p0) != shape.contains(this.p1)) return true;
			const l = this.length;
			AC.set(shape.center).remove(this.p0);
			u.set(this.p1).remove(this.p0).mul(1/length);
			d = Vec2.dotProd(u, AC);

			//checking d < 0 and d > length is useless because it would mean A or B is in the circle,
			//which is already check at the beginning of the function
			//return Vec2.distance((d < 0) ? A : (d > this.length)? B : u.mul(d).add(A), shape.center)<=shape.radius;

			return  (d >= 0 && d <= l && Vec2.squareDistance(u.mul(d).add(this.p0), shape.center)
				<= shape.radius*shape.radius);
			//*/
		} else if (shape instanceof Line) {
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
		if(shape instanceof Circle) {
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
		} else if(shape instanceof Line) {
			let p = Line.intersectionPoint(this, shape);
			if(p.onLine1 && p.onLine2) return [p.point];
			else return [];
		} else return shape.getIntersectionPoints(this);
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
		return this.directorVect.rotate(left ? -Circle.PI_2 : Circle.PI_2);
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
//######################################################################################################################
//#                                                        Point                                                       #
//######################################################################################################################
/**
 * @class Point
 * @augments Shape
 * @memberOf utils.geometry2d
 * @classdesc a very simple shape containing only necessary overridden methods to make it usable
 */
class Point extends Shape {
	/**
	 * @constructor
	 * @param {Vec2} p
	 */
	constructor(p) {
		super(p);
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
		context.fillRect(this.center.x - 1, this.center.y - 1, 2, 2);
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
//######################################################################################################################
//#                                                       Polygon                                                      #
//######################################################################################################################
let len = 0, i = 0, res = 0, p0 = Vec2.zero, p1 = Vec2.zero;
// above variables are used to make methods faster and avoid memory leaks creating variables every time
/**
 * @class Polygon
 * @augments Shape
 * @memberOf utils.geometry2d
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
		super(center);
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
		i = this.points.length;
		while (i--) this.points[i].angle += radians;
		return this;
	}

	/**
	 * makes the line the mirror of itself relative to the given horizontal axis
	 * if no value is set for axisY, the mirror will be made relative to the center's y coordinate.
	 * @param {number} [axisY=center.y]
	 *          ordinate of the horizontal axis
	 * @returns {Polygon} <code>this</code>
	 */
	mirrorVertically(axisY = this.center.y) {
		super.mirrorVertically(axisY);
		i = this.points.length;
		while (i--) this.points[i].mirrorVertically();
		return this;
	}

	/**
	 * makes the line the mirror of itself relative to the given vertical axis
	 * if no value is set for axisX, the mirror will be made relative to the center's x coordinate.
	 * @param {number} [axisX=center.x]
	 *          abscissa of the vertical axis
	 * @returns {Polygon} <code>this</code>
	 */
	mirrorHorizontally(axisX) {
		super.mirrorHorizontally(axisX);
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
	 * divide the polygon into several new convex polygons, without creating intermediate points
	 * @return {[Polygon]} convex polygons
	 */
	divideConvex() {
		let polygons = [];
		let points = this.points.slice(0);
		let n = points.length;
		if(n < 4) return [new Polygon(this.center, points)];
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
			polygons.push(new Polygon(this.center, array));
			if(n < 4) break;
		}
		polygons.push(new Polygon(this.center, points));
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
		} else while (i--) {
			if (lines[i].intersect(shape)) return true;
		}
		return false;
	}

	/**
	 * returns the intersection points between this polygon and the given shape
	 * @param {Shape} shape
	 * @returns {Vec2[]}
	 */
	getIntersectionPoints(shape) {
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
		} else while(i--) {
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
			let len = i;
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
		return new Polygon(Vec2.ZERO, pointsArray).redefineCenter();
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
		let dA = Circle.PI2 / edges, a = Circle.PI2, points = new Array(edges), i = edges;
		while (i--) {
			a -= dA;
			points[i] = Vec2(radiusX * Math.cos(a), radiusY * Math.sin(a));
		}
		return new Polygon(center, points);
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
		let dR = (Circle.PI2) / pointsNumber, angle = startRadians, rLen = radiusArray.length,
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
//######################################################################################################################
//#                                                         Ray                                                        #
//######################################################################################################################
/**
 * @class Ray
 * @augments Shape
 * @memberOf utils.geometry2d
 * @classdesc a class representing an infinite ray, defined by an origin point and the angle of the direction <!--
 * -->it is pointing toward. the origin of the ray is defined by the <!--
 * -->{@link Shape#center|center} attribute.
 */
class Ray extends Shape {
	/**
	 * @constructor
	 * @param {Vec2} origin
	 * @param {number} radians
	 */
	constructor(origin, radians) {
		super(origin);
		/**
		 * @name Ray#angle
		 * @type {number}
		 */
		this.angle = radians;
	}

	/**
	 * <code>=Infinity</code>
	 * @name Ray#perimeter
	 * @type {Number}
	 * @readonly
	 */
	get perimeter() {
		return Infinity;
	}

	/**
	 * rotates the ray around its origin.
	 * @param {number} radians
	 * @returns {Ray} <code>this</code>
	 */
	rotate(radians) {
		this.angle += radians;
		return this;
	}

	/**
	 * makes the ray the opposite of itself relative to the given horizontal axis
	 * if no value is set for axisY, the mirror will be made relative to the origin's y coordinate.
	 * @param {number} [axisY=center.y] ordinate of the horizontal axis
	 * @returns {Ray} <code>this</code>
	 * @see {@link Ray#mirrorHorizontally}
	 */
	mirrorVertically(axisY = this.center.y) {
		super.mirrorVertically(axisY);
		this.angle = -this.angle;
		return this;
	}

	/**
	 * makes the ray the opposite of itself relative to the given vertical axis
	 * if no value is set for axisX, the mirror will be made relative to the origin's x coordinate.
	 * @param {number} [axisX=center.x]
	 *          abscissa of the vertical axis
	 * @returns {Ray} <code>this</code>
	 * @see {@link Ray#mirrorVertically}
	 */
	mirrorHorizontally(axisX = this.center.x) {
		super.mirrorHorizontally(axisX);
		this.angle = Math.PI - this.angle;
		return this;
	}

	/**
	 * returns the calculated end point of the instance as if the ray was a line stating at the origin <!--
	 * -->and with the specified length.
	 * @param {number} length
	 * @returns {Vec2|Vec2}
	 */
	endPoint(length) {
		return this.center.clone().addXY(Math.cos(this.angle) * length, Math.sin(this.angle) * length);
	}

	/**
	 * creates a {@link Line|Line} starting from the origin of the ray, with the same direction
	 * and with the specified length
	 * @param length
	 * @returns {Line}
	 */
	getLine(length) {
		return Line.createFromPointVector(this.center, Vec2.createFromAngle(this.angle, length));
	}

	/**
	 * adds the drawing instructions to the context. Be aware that if you just "fill" the line, <!--
	 * -->it won't be drawn on the canvas, you must "stroke" it to make it appear on the canvas.
	 * @param {CanvasRenderingContext2D} context
	 */
	pushPath(context) {
		const p = this.endPoint(context.canvas.clientWidth + context.canvas.clientHeight);
		context.moveTo(this.center.x, this.center.y);
		context.moveTo(this.center.x, this.center.y);
		context.lineTo(p.x, p.y);
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
		const o = offset/2, t = this.endPoint(Number.MAX_SAFE_INTEGER);
		verticesArray[vOffset++] = this.center.x;
		verticesArray[vOffset++] = this.center.y;
		verticesArray[vOffset++] = t.x;
		verticesArray[vOffset++] = t.y;
		indicesArray[iOffset++] = o;
		indicesArray[iOffset++] = o+1;
		indicesArray[iOffset++] = o;
	}

	/**
	 * check if the ray intersect with the shape.
	 * @param {Shape} shape
	 * @returns {boolean}
	 */
	intersect(shape) {
		const rect = shape.getRect();
		return new Line(this.center,
			this.endPoint(Vec2.distance(this.center, shape.center) + rect.width + rect.height)).intersect(shape);
	}

	/**
	 * returns the intersection points between this ray and the given shape
	 * @param {Shape} shape
	 * @returns {Vec2[]}
	 */
	getIntersectionPoints(shape) {
		const rect = shape.getRect();
		return this.getLine(Vec2.distance(this.center, shape.center) + rect.width + rect.height)
			.getIntersectionPoints(shape);
	}

	/**
	 * returns whether or not the line contains the given point.
	 * The result is not really realistic because of number precision
	 * @param {Vec2} point
	 * @returns {boolean}
	 */
	contains(point) {
		return this.endPoint(Vec2.distance(this.center, point)).equals(point);
	}

	/**
	 * creates and returns a {@link Rect} instance fitting the ray, with pone corner <!--
	 * -->at an infinite position.
	 * @returns {Rect}
	 */
	getRect() {
		const endPoint = this.endPoint(Infinity);
		return new Rect(Math.min(endPoint.x, this.center.x), Math.min(endPoint.y, this.center.y),
			Math.max(endPoint.x, this.center.x), Math.max(endPoint.y, this.center.y));
	}

	/**
	 * returns the director vector of the instance.
	 * @returns {Vec2}
	 */
	get directorVect() {
		return Vec2.createFromAngle(this.angle);
	}

	/**
	 * returns the closest point of the instance to the specified point
	 * @param {Vec2} p
	 * @returns {Vec2}
	 */
	closestpointTo(p) {
		let A = this.center, AC = Vec2.translation(A, p), u = this.directorVect, d = Vec2.dotProd(u, AC);
		return d < 0 ? u.set(A) : u.mul(d).add(A);
	}

	/**
	 * implemented for the needs of getCircle function, but not very useful as it only returns an infinite number
	 * @returns {number}
	 */
	getRadius() {
		return Infinity;
	}

	/**
	 * returns a copy of the instance.
	 * @returns {Ray}
	 */
	clone() {
		return new Ray(this.center, this.angle);
	}
}
/**
 * number of points used to draw this shape.
 * @type {number}
 * @name Ray#glPointsNumber
 */
Ray.prototype.glPointsNumber = 2;
/**
 * number of triangles used to draw this shape.
 * @type {number}
 * @name Ray#glTriangles
 */
Ray.prototype.glTrinagles = 1;


let asm = {};
let wasmCode = new Uint8Array([
	0,97,115,109,1,0,0,0,1,189,128,128,128,0,7,96,1,125,1,125,96,6,125,125,125,125,125,125,1,127,96,4,125,125,125,
	125,1,127,96,2,125,125,1,125,96,4,125,125,125,125,1,125,96,7,125,125,125,125,125,125,125,1,127,96,8,125,125,125,
	125,125,125,125,125,1,125,3,142,128,128,128,0,13,1,2,3,3,4,4,4,4,4,4,1,5,6,4,132,128,128,128,0,1,112,0,0,5,131,
	128,128,128,0,1,0,1,6,129,128,128,128,0,0,7,225,129,128,128,0,14,6,109,101,109,111,114,121,2,0,3,99,99,119,0,0,
	4,99,99,119,50,0,1,15,115,113,117,97,114,101,77,97,103,110,105,116,117,100,101,0,2,9,109,97,103,110,105,116,117,
	100,101,0,3,10,100,111,116,80,114,111,100,117,99,116,0,4,13,118,101,99,116,111,114,80,114,111,100,117,99,116,0,
	5,23,115,113,117,97,114,101,69,117,99,108,105,100,101,97,110,68,105,115,116,97,110,99,101,0,6,17,101,117,99,108,
	105,100,101,97,110,68,105,115,116,97,110,99,101,0,7,17,109,97,110,104,97,116,116,97,110,68,105,115,116,97,110,
	99,101,0,8,16,100,105,97,103,111,110,97,108,68,105,115,116,97,110,99,101,0,9,16,99,105,114,99,108,101,115,73,
	110,116,101,114,115,101,99,116,0,10,19,99,105,114,99,108,101,76,105,110,101,73,110,116,101,114,115,101,99,116,0,
	11,14,108,105,110,101,115,73,110,116,101,114,115,101,99,116,0,12,10,236,132,128,128,0,13,153,128,128,128,0,0,32,
	2,32,0,147,32,5,32,1,147,148,32,3,32,1,147,32,4,32,0,147,148,94,11,141,128,128,128,0,0,32,0,32,3,148,32,1,32,2,
	148,94,11,141,128,128,128,0,0,32,0,32,0,148,32,1,32,1,148,146,11,142,128,128,128,0,0,32,0,32,0,148,32,1,32,1,
	148,146,145,11,141,128,128,128,0,0,32,0,32,2,148,32,1,32,3,148,146,11,141,128,128,128,0,0,32,0,32,3,148,32,1,32,
	2,148,147,11,151,128,128,128,0,0,32,2,32,0,147,34,2,32,2,148,32,3,32,1,147,34,2,32,2,148,146,11,152,128,128,128,
	0,0,32,2,32,0,147,34,2,32,2,148,32,3,32,1,147,34,2,32,2,148,146,145,11,158,128,128,128,0,1,1,127,32,2,32,0,147,
	32,3,32,1,147,146,168,34,4,32,4,65,31,117,34,4,106,32,4,115,178,11,182,128,128,128,0,1,1,127,32,2,32,0,147,168,
	34,4,32,4,65,31,117,34,4,106,32,4,115,178,34,2,32,3,32,1,147,168,34,4,32,4,65,31,117,34,4,106,32,4,115,178,34,0,
	32,2,32,0,94,27,11,178,128,128,128,0,0,32,3,32,0,147,34,3,32,3,148,32,4,32,1,147,34,3,32,3,148,146,145,34,3,32,
	2,146,32,5,94,32,3,32,2,32,5,146,93,32,3,32,5,146,32,2,94,113,113,11,173,129,128,128,0,2,3,125,1,127,65,1,33,10,
	2,64,32,0,32,3,147,34,7,32,7,148,32,1,32,4,147,34,8,32,8,148,146,145,32,2,93,32,0,32,5,147,34,9,32,9,148,32,1,
	32,6,147,34,9,32,9,148,146,145,32,2,93,115,13,0,65,0,33,10,32,7,32,5,32,3,147,34,5,32,5,32,5,148,32,6,32,4,147,
	34,5,32,5,148,146,145,34,6,149,34,9,148,32,8,32,5,32,6,149,34,7,148,146,34,5,67,0,0,0,0,93,13,0,32,5,32,6,94,13,
	0,32,0,32,9,32,5,148,32,3,146,147,34,0,32,0,148,32,1,32,7,32,5,148,32,4,146,147,34,0,32,0,148,146,32,2,32,2,148,
	95,33,10,11,32,10,11,237,128,128,128,0,1,4,125,67,0,0,0,0,33,11,2,64,32,4,32,0,147,34,4,32,7,32,1,147,34,10,148,
	32,5,32,1,147,34,8,32,6,32,0,147,34,9,148,94,32,5,32,2,147,32,7,32,3,147,148,32,5,32,3,147,32,6,32,2,147,148,94,
	70,13,0,32,2,32,0,147,34,5,32,8,148,32,3,32,1,147,34,1,32,4,148,94,32,5,32,10,148,32,1,32,9,148,94,115,179,33,
	11,11,32,11,11
]);

if(WebAssembly) WebAssembly.instantiate(wasmCode, {/* imports */}).then(wasm=>{
	asm = wasm.instance.exports;
});
if(window) {
	//not in module
	window.utils = window.utils || {};
	utils.geometry2d = {
		Vec2, Rect, Shape, Circle, Ellipsoid, Line, Point, Polygon, Ray
	}
} else {
	//export {Vec2, Rect, Shape, Circle, Ellipsoid, Line, Point, Polygon, Ray};
}
}
/**
 * Created by rfrance on 12/20/2016.
 */
/**
 * @module utils/input
 */
{
if(window) {
	//not in module, do nothing
} else {
	//import {Vec2} from "utils/geometry2d";
}
//######################################################################################################################
//#                                             enumerations and callbacks                                             #
//######################################################################################################################
/**
 * @callback keyboardCallback
 * @param {Key|number} keyCode
 * @param {KeyState|number} keyState
 * @returns {void|boolean} prevent default behavior
 */
/**
 * @callback mouseCallback
 * @param {MouseEvent} event
 * @param {MouseEvent} eventType
 * @param {MouseButton} button
 * @param {module:utils/geometry.Vec2} position
 * @returns {void|boolean} prevent default behavior.
 */
/**
 * @callback InputManager.focusCallback
 * @param {boolean} hasFocus
 */
/**
 * @callback KeyMap.keyMapCallback
 * @param {*} action associated to the event's key
 * @param {InputManager.KeyState} keyState
 * @returns {void|boolean} prevent default key behavior
 */
/**
 * @memberOf utils
 * @namespace input
 */
/**
 * @enum {number}
 * @readonly
 */
const KeyState = { RELEASED: 0, PRESSED:1 };
/**
 * @enum {number}
 * @readonly
 */
const Key = {
	BACKSPACE: 8, TAB: 9, ENTER: 13, SHIFT: 16, CTRL: 17,  ALT: 18,  CAPS_LOCK: 20,  ESCAPE: 27, SPACE: 32,	PAGE_UP: 33,
	PAGE_DOWN: 34, END: 35, HOME: 36, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, PRINT_SCR: 44,	INSERT: 45, DELETE: 46,
	ZERO: 48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57, A: 65, B: 66,
	C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82,
	S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90, LEFT_WIN: 91, RIGH_WIN: 92, SELECT: 93,	NUM_0: 96,
	NUM_1: 97, NUM_2: 98, NUM_3: 99, NUM_4: 100, NUM_5: 101, NUM_6: 102, NUM_7: 103, NUM_8: 104, NUM_9: 105,
	MULTIPLY: 106, ADD: 107, SUBTRACT: 109, DECIMAL_POINT: 110, DIVIDE: 111, F1: 112, F2: 113, F3: 114, F4: 115,
	F5: 116, F6: 117, F7: 118, F8: 119, F9: 120, F10: 121, F11: 122, F12: 123, NUM_LOCK: 144, SCROLL_LOCK: 145,
	SEMI_COLON: 186, EQUAL: 187, COMMA: 188, DASH: 189, PERIOD: 190, FORWARD_SLASH: 191, GRAVE_ACCENT: 192,
	OPEN_BRACKET: 219, BACK_SLASH: 220, CLOSE_BRACKET: 221, SINGLE_QUOTE: 222, FN: 255,
	number: 256
};
/**
 * @enum {string}
 * @readonly
 */
const MouseEvent = {
	UP: 'onmouseup', DOWN: 'onmousedown', CLICK: 'onclick', DBCLICK: 'ondbclick',
	MOVE: 'onmousemove', ENTER: 'onmouseover', EXIT: 'onmouseout', CTX_MENU: 'oncontextmenu'
};
/**
 * @enum {number}
 * @readonly
 */
const MouseButton = { UNKNOWN: 0, LEFT: 1, MIDDLE: 2, RIGHT: 3 }

//######################################################################################################################
//#                                                    InputManager                                                    #
//######################################################################################################################

//___________________________________________________private constants__________________________________________________
const KEYS_NUMBER = Key.number;
const KEY_STATE = KeyState;
const MOUSE_BTN = MouseButton;

const fixMouseWhich = evt => {
	if (!evt.which && evt.button) {
		evt.which =
			((evt.button % 8 - evt.button % 4) === 4) ? MOUSE_BTN.MIDDLE :
				((evt.button % 4 - evt.button % 2) === 2) ? MOUSE_BTN.RIGHT :
					((evt.button % 2) === 1) ? MOUSE_BTN.LEFT :
						MOUSE_BTN.UNKNOWN;
	}
};
const onKeyEvt = (keyStates, callbacks, state, evt) => {
	if (keyStates[evt.keyCode] !== state) {
		keyStates[evt.keyCode] = state;
		let len = callbacks.length;
		for (let i = 0; i < len; i++)
			if (callbacks[i](evt.keyCode, state)) evt.preventDefault();
	}
}

/**
 * @class InputManager
 * @classdesc a class managing keyboard and mouse events, related to a particular HTMLElement
 */
class InputManager {
	/**
	 * @constructor
	 * @param {HTMLElement} element
	 */
	constructor(element) {
		/**
		 * @name InputManager#element
		 * @type {HTMLElement}
		 */
		this.element = element;

		let keyStates = new Uint8Array(KEYS_NUMBER);
		for (let i = KEYS_NUMBER - 1; i >= 0; i--) {
			keyStates[i] = KEY_STATE.RELEASED;
		}
		/**
		 * @name InputManager~_keyboardCallbacks
		 * @type {Array.<keyboardCallback>}
		 * @private
		 */
		let keyboardCallbacks = [];
//____________________________________________________private methods___________________________________________________
		const onKeyUp = onKeyEvt.bind(this, keyStates, keyboardCallbacks, KEY_STATE.RELEASED);
		const onKeyDown = onKeyEvt.bind(this, keyStates, keyboardCallbacks, KEY_STATE.PRESSED);
		const getVec = evt => {
			let elmtRect = this.element.getBoundingClientRect();
			return new Vec2(
				evt.pageX - elmtRect.left,
				evt.pageY - elmtRect.top);
		}
		const onMouseEvt = (callback, evtType, evt) => {
			fixMouseWhich(evt);
			if (callback(evt, evtType, evt.which, getVec(evt))) evt.preventDefault();
		}
//____________________________________________________public methods____________________________________________________
//* * * * * * * * * * * * * * * * * * * * * * * * * * * *keyboard* * * * * * * * * * * * * * * * * * * * * * * * * * * *
		/**
		 * enable or disable the keyboard listener in capturing on bubbling mode, depending <!--
		 * -->on the 2nd parameter value
		 * @function
		 * @name InputManager#enableKeyboardListener
		 * @param {boolean} enable
		 * @param {boolean} [capturingMode=true]
		 */
		this.enableKeyboardListener = function (enable, capturingMode = true) {
			if (enable) {
				if (this.element != document && !this.element.hasAttribute('tabindex')) {
					this.element.setAttribute('tabindex', -1); // so it can receive keyboard events
				}
				this.element.addEventListener('keydown', onKeyDown, capturingMode);
				this.element.addEventListener('keyup', onKeyUp, capturingMode);
			} else {
				this.element.removeEventListener('keydown', onKeyDown);
				this.element.removeEventListener('keyup', onKeyUp);
			}
		};
		/**
		 * adds a keyboard events callback. don't forget to launch the capture of keyboard events by calling <!--
		 * -->{@link InputManager#enableKeyboardListener} method
		 * @function
		 * @name InputManager#addKeyCallback
		 * @param {keyboardCallback} callback
		 */
		this.addKeyCallback = (callback) => {
			keyboardCallbacks.push(callback);
		};
		/**
		 * removes a keyboard events callback.
		 * @function
		 * @name InputManager#removeKeyCallback
		 * @param {keyboardCallback} callback
		 */
		this.removeKeyCallback = (callback) => {
			keyboardCallbacks.remove(callback);
		};
		/**
		 * returns the state of the key
		 * @function
		 * @name InputManager#getKeyState
		 * @param {number} keyCode
		 * @returns {KeyState} key state : one of <!--
		 * -->{@link KeyState.RELEASED|RELEASED} and <!--
		 * -->{@link KeyState.PRESSED|PRESSED}
		 */
		this.getKeyState = keyCode => keyStates[keyCode];
//* * * * * * * * * * * * * * * * * * * * * * * * * * * * mouse* * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		/**
		 * @function
		 * @name InputManager#setMouseEventsCallback
		 * @param {mouseCallback} callback
		 */
		this.setMouseEventsCallback = function (callback) {
			if (callback) {
				let e;
				for (let evtType in MouseEvent) {
					if (MouseEvent.hasOwnProperty(evtType)) {
						e = MouseEvent[evtType];
						this.element[e] = onMouseEvt.bind(this, callback, e);
					}
				}
			} else {
				for (let evtType in MouseEvent) {
					if (MouseEvent.hasOwnProperty(evtType)) {
						this.element[MouseEvent[evtType]] = null;
					}
				}
			}
		};
//* * * * * * * * * * * * * * * * * * * * * * focus, pointer lock, fullscreen* * * * * * * * * * * * * * * * * * * * * *
		/**
		 * @function
		 * @name InputManager#setFocusCallback
		 * @param {focusCallback} callback
		 */
		this.setFocusCallback = (callback) => {
			if (callback) {
				this.element.onfocus = _ => callback(true);
				this.element.onblur = _ => callback(false);
			} else {
				this.element.onfocus = null;
				this.element.onblur = null;
			}
		};
		/**
		 * requests pointer lock
		 * @function
		 * @name InputManager#pointerLock
		 * @param eventListener
		 */
		this.pointerLock = (eventListener) => {
			if (eventListener) {
				if (eventListener.pointerLockChange) {
					document.addEventListener('pointerlockchange', eventListener.pointerLockChange, false);
					document.addEventListener('mozpointerlockchange', eventListener.pointerLockChange, false);
					document.addEventListener('webkitpointerlockchange', eventListener.pointerLockChange, false);
				}
				if (eventListener.pointerLockError) {
					document.addEventListener('pointerlockerror', eventListener.pointerLockError, false);
					document.addEventListener('mozpointerlockerror', eventListener.pointerLockError, false);
					document.addEventListener('webkitpointerlockerror', eventListener.pointerLockError, false);
				}
			}
			if (document.webkitFullscreenElement === this.element ||
				document.mozFullscreenElement === this.element ||
				document.fullscreenElement === this.element) {
				this.element.requestPointerLock = this.element.requestPointerLock ||
					this.element.mozRequestPointerLock ||
					this.element.webkitRequestPointerLock;
				this.element.requestPointerLock();
			}
		};
		/**
		 * requests full screen
		 * @function
		 * @name InputManager#fullScreen
		 * @param callback
		 */
		this.fullScreen = (callback) => {
			element.requestFullscreen = element.requestFullscreen ||
				element.mozRequestFullscreen ||
				element.mozRequestFullScreen || // 'S' instead of 's' in the old API.
				element.webkitRequestFullscreen;
			element.requestFullscreen();
			if (callback) {
				document.addEventListener('fullscreenchange', callback, false);
				document.addEventListener('mozfullscreenchange', callback, false);
				document.addEventListener('webkitfullscreenchange', callback, false);
			}
		};
	}
}
//######################################################################################################################
//#                                                       KeyMap                                                       #
//######################################################################################################################
/**
 * @class KeyMap
 * @classdesc a useful class to use with {@link InputManager|InputManager} class to make <!--
 * -->easy-to-use keymaps. call {@link KeyMap#apply|apply} method to use it, <!--
 * -->{@link KeyMap#setAction|setAction} to add mappings, and <!--
 * -->{@link KeyMap#setCallback|setCallback} to add a callback method called when event occur on <!--
 * -->selected keys.
 */
class KeyMap {
	/**
	 * @constructor
	 */
	constructor() {
		let actions = new Array(Key.number);
		let cb = undefined;
//--------------------------------------------------- private methods --------------------------------------------------
		const callback = (keyCode, keyState)=> {
			if (cb) {
				let a = this.getAction(keyCode);
				return (a && cb(a, keyState)) || false;
			}
		};
//--------------------------------------------------- public methods ---------------------------------------------------
		/**
		 * @function
		 * @name KeyMap#setAction
		 * @param {Key|Key[]|number|number[]} keyCode
		 * @param {number|string|*} action
		 */
		this.setAction = (keyCode, action)=> {
			if(keyCode.length) {
				for(let i=0; i<keyCode.length; i++) {
					this.setAction(keyCode[i], action);
				}
			}
			else {
				if(action == undefined) {
					if(actions[keyCode] != undefined) actions[keyCode] = undefined;
				} else actions[keyCode] = action;
			}
		};
		/**
		 * @function
		 * @name KeyMap#getAction
		 * @param {Key|number} keyCode
		 * @returns {number|string|*} action associated to the key
		 */
		this.getAction = keyCode => {
			return actions[keyCode];
		};
		/**
		 * returns whether or not at least one key associated to the specified action is pressed
		 * @function
		 * @name KeyMap#isKeyDown
		 * @param {InputManager} inputManager
		 * @param {*} action
		 * @returns {boolean} true if at least one key associated to the specified action is pressed
		 */
		this.isKeyDown = (inputManager, action) => {
			let code=-1;
			do {
				code = actions.indexOf(action, code+1);
				if(code!== -1)
					if(inputManager.getKeyState(code) === InputManager.KeyState.DOWN) return true;
			} while(code!==-1);
			return false;
		};
		/**
		 * returns the set of keys associated with the specified action.
		 * @function
		 * @name KeyMap#getKeys
		 * @param {*} action
		 * @returns {InputManager.Key[]|number[]} key codes
		 */
		this.getKeys = action => {
			let codes = [], i = actions.indexOf(action);
			while(i !== -1) { codes.push(i); i = actions.indexOf(action, i+1); }
			return codes;
		};
		/**
		 * sets the callback function which will be called when a useful keyboard event happens.
		 * @function
		 * @name KeyMap#setCallback
		 * @param {KeyMap.keyMapCallback} callback
		 */
		this.setCallback = callback => { cb = callback; };
		/**
		 * allow the instance to catch keyboard events by adding a callback function using the parameter's <!--
		 * -->{@link InputManager#addKeyCallback|addKeyCallback} method.
		 * @function
		 * @name KeyMap#enable
		 * @param {InputManager} inputManager
		 */
		this.enable = function(inputManager) {
			inputManager.addKeyCallback(callback);
		};
		/**
		 * removes the callback function from the keyboard listener of the parameter.
		 * @function
		 * @name KeyMap#disable
		 * @param {InputManager} inputManager
		 */
		this.disable = function(inputManager) {
			inputManager.removeKeyCallback(callback);
		};
	}
}
if(window) {
	window.utils = window.utils || {};
	utils.input = {
		KeyState,
		Key,
		MouseEvent,
		MouseButton,
		InputManager,
		KeyMap

	}
} else {
	/*
	export {
		KeyState,
		Key,
		MouseEvent,
		MouseButton,
		InputManager,
		KeyMap
	};
	*/
}
}
{
	/**
	 * @class utils.p2p.PeerConnection
	 * A class used to handle P2P connection.
	 * @example
	 * //### BOTH USERS ###
	 *
	 * peer = new PeerConnection();
	 *
	 * //### USER 1 ###
	 *
	 * peer.createOffer()
	 *      .then(({description, candidate})=> {
	 *          //send description and candidate to user 2
	 *      });
	 *
	 * //### USER 2 ###
	 *
	 * peer.createAnswer({remote: {description, candidate}})
	 *      .then(({description, candidate})=> {
	 *          //send description and candidate to user 1
	 *      });
	 * //### USER 1 ###
	 *
	 * peer.onOfferAnswer({description, candidate});
	 *
	 * //### BOTH USERS ###
	 *
	 * peer.waitRx().then( ()=> {
	 *          //ready to communicate !
	 *          peer.onclose = ()=>
	 *          peer.onMsg = ({data})=>{
	 *              //process incoming data
	 *          }
	 *          peer.send(data);
	 *      });
	 *
	 */
	class PeerConnection {
		/**
		 * @constructor
		 * @param {Object} config
		 * @param {RTCConfiguration} config.pcConfig - configuration for the RTCPeerConnection
		 * @param {string} config.chName - name of the output channel (and the input channel on the remote peer)
		 * @param {RTCDataChannelInit} config.txConfig - configuration for the output RTCChannel
		 */
		constructor({pcConfig, chName, txConfig}) {
			this.pc = new RTCPeerConnection(pcConfig);
		}

		createDataChannel(name, config) {
			return this.pc.createDataChannel(name || "", config);
		}

		addTrack(track, ...streams) {
			return this.pc.addTrack(track, ...streams);
		}

		/**
		 * creates a {@link Promise} resolved with a {@link RTCDataChannel} when the 'datachannel' event is fired <!--
		 * -->on the {@link RTCPeerConnection}.
		 * @returns {Promise<RTCDataChannel>} the created {@link Promise}
		 */
		waitDataChannel() {
			return new Promise(resolve => {
				this.pc.ondatachannel = ({channel})=> {
					this.pc.ondatachannel = null;
					resolve(channel);
				};
			})
		}

		/**
		 * creates a {@link Promise} resolved with a {@link RTCTrackEvent} when the the 'track' event is fired <!--
		 * -->on the {@link RTCPeerConnection}.
		 * @returns {Promise<RTCTrackEvent>}
		 */
		waitTrack() {
			return new Promise(resolve => {
				this.pc.ontrack = (evt)=> {
					this.ontrack = null;
					resolve(evt);
				};
			})
		}

		/**
		 * initialize the connection by creating an offer to be answered by a remote peer
		 * @param {RTCOfferOptions} options - passed to {@link RTCPeerConnection.createOffer} function
		 * @returns {Promise<{description, candidate}>} resolved when the local peer is ready to accept a <!--
		 * -->remote peer, with the peer's local description and the candidate to pass to the remote peer.
		 */
		createOffer(options) {
			return new Promise((resolve, reject) => {
				this.pc.onicecandidate = (evt)=> {
					if(!evt.candidate) return;
					this.candidate = evt.candidate;
					resolve({description: this.pc.localDescription, candidate: this.candidate});
				}
				this.pc.createOffer(options).then((desc)=>{
					this.pc.setLocalDescription(desc);
				}, reject);
			})
		}

		/**
		 * must be called after {@link createOffer} with the remote description and candidate
		 * @param {Object} remote
		 * @param {RTCCandidate|Object} remote.candidate
		 * @param {RTCSessionDescription|Object} remote.description
		 */
		onOfferAnswer({candidate, description}) {
			this.pc.setRemoteDescription(description);
			this.pc.addIceCandidate(candidate);
		}

		/**
		 * initialize the connection by answering the remote peer's answer
		 * @param {Object} remote
		 * @param {RTCCandidate|Object} remote.candidate
		 * @param {RTCSessionDescription|Object} remote.description
		 * @param {RTCAnswerOptions} options
		 * @returns {Promise<{description, candidate}>}
		 */
		createAnswer({candidate, description}, options) {
			this.pc.setRemoteDescription(description);
			this.pc.addIceCandidate(candidate);
			return new Promise((resolve, reject) => {
				let a = false;
				this.pc.onicecandidate = (evt)=> {
					if(!evt.candidate) return;
					this.candidate = evt.candidate;
					resolve({description: this.pc.localDescription, candidate: this.candidate});
				}
				this.pc.createAnswer(options).then((desc)=>{
					this.pc.setLocalDescription(desc);
				}, reject);
			})
		}
	}
	function test3() {
		var peer1 = new PeerConnection();
		peer1.tx = peer1.createDataChannel("peer 1 -> 2");
		var peer2 = new PeerConnection();
		peer2.tx = peer2.createDataChannel("peer 2 -> 1");
		const onMsg = function({data}) {
			alert(`${this.label} >> ${data}`);
		}
		peer1.createOffer()
			.then((desc_cand)=>peer2.createAnswer(desc_cand))
			.then((desc_cand)=>peer1.onOfferAnswer(desc_cand))
			.then(()=>peer1.waitDataChannel())
			.then(channel=>channel.onmessage = onMsg)
			.then(()=>peer2.waitDataChannel())
			.then(channel=>channel.onmessage = onMsg)
			.then(_=>console.log("finish"))
			.then(_=>peer1.tx.readyState == 'open' || utils.tools.waitForEvent(peer1.tx, 'open'))
			.then(peer1.tx.send('Hello'));
	}
	window.utils = window.utils || {};
	window.utils.p2p = {
		PeerConnection
	};
}utils.tools.polyfill(window, "AudioContext", ["webkit"]);
utils.audio = {
	loadSound(audioContext, onResult, onError, url) {
		const request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		// Decode asynchronously
		request.onload = function() {
			context.decodeAudioData(request.response, onResult, onError);
		}
		request.send();
	},
	/**
	 * <code>
	 * __________________________________________________________________________________________________________
	 * |_octave_|___C___|_C#/Db_|___D___|_D#/Eb_|___E___|___F___|_F#/Gb_|___G___|_G#/Ab_|___A___|_A#/Bb_|___B___|
	 * |        |   0   |   1   |   2   |   3   |   4   |   5   |   6   |   7   |   8   |   9   |   10  |   11  |
	 * |   -5   | 8.176 | 8.662 | 9.177 | 9.723 | 10.30 | 10.91 | 11.56 | 12.25 | 12.98 | 13.75 |`14.57 | 15.43 |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |   -4   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |   -3   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |   -2   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |   -1   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |    0   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |    1   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |    2   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |    3   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |    4   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |    5   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * </code>
	 * @param {number} midi identification number (see <!--
	 * -->http://www.electronics.dit.ie/staff/tscarff/Music_technology/midi/midi_note_numbers_for_octaves.htm <!--
	 * -->or http://tonalsoft.com/pub/news/pitch-bend.aspx) <!--
	 * -->for a list of all ids)
	 * @return {number} the note frequency, in Hz
	 */
	getNoteFreq(semitones) {
		return 440*(Math.pow(2, noteId-69));
	},
	createSinusOscillator(audioContext, freq) {
		let o = audioContext.createOscillator();
		o.type = "sine";
		o.frequency.value = freq;
		return o;
	},
	createSquareOscillator(audioContext, freq) {
		let o = audioContext.createOscillator();
		o.type = "square";
		o.frequency.value = freq;
		return o;
	},
	createTriangleOscillator(audioContext, freq) {
		let o = audioContext.createOscillator();
		o.type = "triangle";
		o.frequency.value = freq;
		return o;
	},
	createSawToothOscillator(audioContext, freq) {
		let o = audioContext.createOscillator();
		o.type = "sawtooth";
		o.frequency.value = freq;
		return o;
	},
	createCustomOscillator(audioContext, freq, periodicWave) {
		let o = audioContext.createOscillator();
		o.type = "custom";
		o.frequency.value = freq;
		o.setPeriodicWave(periodicWave);
		return o;
	},
	connectNodes(nodes) {
		let i, n = nodes.length;
		for(i=0; i< n-1; i++) {
			nodes[i].connect(nodes[i+1]);
		}
	},
}/**
 * Created by rfrance on 11/29/2016.
 */
window['webgl'] = {
	getContext(canvas) {
		return canvas.getContext("webgl2")
			|| canvas.getContext("webgl")
			|| canvas.getContext("experimental-webgl");
	},
	/**
	 * @param {WebGLRenderingContext} gl
	 */
	initContext(gl) {
		gl.clearColor(0.0, 0.0, 0.0, 1.0); // set clear color to opaque black
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL); // near objects hide far objects
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT); //clear depth and color buffer
	},
	setAlphaEnabled(gl, enable) {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		if(enable) gl.enable(gl.BLEND);
		else gl.disable(gl.BLEND);
	},
	createShader(gl, shaderScript, type) {
		let shader;
		if((type != WebGLRenderingContext.VERTEX_SHADER) || type != (WebGLRenderingContext.FRAGMENT_SHADER)) {
			switch (type) {
				case 'vertex' : type = WebGLRenderingContext.VERTEX_SHADER; break;
				case 'fragment' : type = WebGLRenderingContext.FRAGMENT_SHADER; break;
				default :
					console.error(new Error(
						`'${type}' is not a valid shader type. only 'vertex' and 'fragment' are accepted as shader type.
						you can also use VERTEX_SHADER or FRAGMENT_SHADER constants of the WebGLRenderingContext class`
					).stack);
					return;
			}
		}
		shader = gl.createShader(type);
		gl.shaderSource(shader, shaderScript);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error(new Error(gl.getShaderInfoLog(shader)).stack);
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	},
	/**
	 *
	 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl
	 * @param {WebGLShader|string} vertexShader
	 * @param {WebGLShader|string} fragmentShader
	 * @returns {WebGLProgram}
	 */
	createProgram(gl, vertexShader, fragmentShader) {
		const prog = gl.createProgram();
		if(  vertexShader.substr)
			gl.attachShader(prog, webgl.createShader(gl,   vertexShader, 'vertex'  ));
		else gl.attachShader(prog, vertexShader);
		if(fragmentShader.substr)
			gl.attachShader(prog, webgl.createShader(gl, fragmentShader, 'fragment'));
		else gl.attachShader(prog, fragmentShader);

		gl.linkProgram(prog);
		if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
			console.error(new Error(gl.getProgramInfoLog(prog)).stack);
			gl.deleteProgram(prog);
			return;
		}
		return prog;
	},
	getAttribLocations(gl, program, names) {
		let result = new Array(names.length);
		for(let i=0; i<names.length; i++) {
			result[i] = gl.getAttribLocation(program, names[i]);
		}
		return result;
	},
	getUniformLocations(gl, program, names) {
		let result = new Array(names.length);
		for(let i=0; i<names.length; i++) {
			result[i] = gl.getUniformLocation(program, names[i]);
		}
		return result;
	},
	/**
	 * creates a {@link WebGLBuffer} buffer, binds it and copy the datas in it, using the methods <!--
	 * -->{@link https://developer.mozilla.org/fr/docs/Web/API/WebGLRenderingContext/bufferData} and <!--
	 * -->{@link https://developer.mozilla.org/fr/docs/Web/API/WebGLRenderingContext/bindBuffer}. <!--
	 * -->Use these links for more details
	 *
	 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl - the WebGL context used
	 * @param {GLEnum|number} target - specifies the binding point. e.g: gl.ARRAY_BUFFER, for vertex attributes, or <!--
	 * -->gl.ELEMENT_ARRAY_BUFFER, for element indices.
	 * @param {ArrayBuffer} srcData - data that will be copied in the data store
	 * @param {GLEnum|number} usage - specifies the usage of the data store. e.g: gl.STATIC_DRAW, <!--
	 * -->gl.DYNAMIC_DRAW, gl.STREAM_DRAW.
	 * @param {GLuint|number} srcOffset - specifies the element index offset where to start reading the buffer
	 * @param {GLuint|number} length - specifies the number of elements to read from the buffer. <!--
	 * -->Default to 0 (read to the end)
	 */
	createAttribBuffer(gl, target, srcData, usage = WebGLRenderingContext.STATIC_DRAW, srcOffset=0, length = 0) {
		const buffer = gl.createBuffer();
		gl.bindBuffer(target, buffer);
		gl.bufferData(target, srcData, usage, srcOffset, length);
		return buffer;
	},
	standardFragmentShader : `#version 300 es
precision mediump float;
in vec4 v_color;
out vec4 outColor;
void main() { outColor = v_color; }
	`,
	createMVMat3: function(tx, ty, rad, scaleX, scaleY) {
		let cos = Math.cos(rad), sin = Math.sin(rad);
		return [ cos * scaleX , -sin * scaleY , 0,
				 sin * scaleX ,  cos * scaleY , 0,
					  tx      ,       ty      , 1];
	},
	translationMat3: function(dX, dY) {
		return [1,0,0,  0,1,0,  dX,dY,1];
	},
	rotationMat3: function(rad) {
		return [cos,-sin,0,  sin,cos,0,  0,0,1];
	},
	scaleMat3: function(scaleX, scaleY) {
		return [scaleX,0,0,  0,scaleY,0,  0,0,1];
	},
	perspectiveMat4: function(fov, aspect, zNear, zFar) {
		const f = Math.tan(Math.PI*0.5 - 0.5 * fov),
			  rangeInv = 1.0 / (zNear-zFar);
		/*
		return [
			1/16, 0, 0, 0,
			0, 1/9, 0, 0,
			0, 0, 1, -1,
			0, 0, 0, 1
		];
		/*/
		return [
			f/aspect, 0, 0                          , 0 ,
			0       , f, 0                          , 0 ,
			0       , 0, (zNear + zFar) * rangeInv  , -1,
			0       , 0, zNear * zFar * rangeInv * 2, 1
		];//*/
	},
	projectionMat4: function(xmin, xmax, ymin, ymax, zNear, zFar) {
		const w = xmax - xmin, h = ymax - ymin, d = zFar - zNear;
		return [
			2/w, 0 , 0 , -(xmax+xmin)/w,
			0 , 2/h, 0 , -(ymax+ymin)/h,
			0 , 0 , -2/d, -(zFar+zNear)/d,
			0 , 0 , 0 , 1
		];
	},
	identityMat4: function() {
		return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
	}
};