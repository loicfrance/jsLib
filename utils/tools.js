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
		};
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
