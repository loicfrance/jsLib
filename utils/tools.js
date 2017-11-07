/**
 * @typedef {Object} utils.tools.rgb
 * @property {number} r - integer in [0;255]
 * @property {number} g - integer in [0;255]
 * @property {number} b - integer in [0;255]
 */
/**
 * @typedef {Object} utils.tools.hsv
 * @memberOf utils.tools
 * @property {number} h - integer in [0;359]
 * @property {number} s - integer in [0;255]
 * @property {number} v - integer in [0;255]
 */
/**
 * @namespace utils
 */
window.utils = window.utils || {};
/**
 * @memberOf utils
 * @namespace tools
 */
utils.tools = {
//######################################################################################################################
//#                                                    LayoutGravity                                                   #
//######################################################################################################################

	LayoutGravity: (function() {
		const LayoutGravity = G = {
			LEFT: 1, TOP: 2, RIGHT: 4, BOTTOM: 8, CENTER: 16,
			getRect: (gravity, availableRect, width, height, marginX=0, marginY=marginX)=> {
				availableRect = availableRect.clone().addMarginsXY(-marginX, -marginY);
				if (!(gravity & G.CENTER)) {
					if (gravity) {
						if (!(gravity & G.LEFT) && !(gravity & G.RIGHT)) gravity |= G.LEFT;
						if (!(gravity & G.TOP) && (gravity & G.BOTTOM)) gravity |= G.TOP;
					} else gravity = G.LEFT | G.TOP;
				}
				var left = NaN, top = NaN, right = NaN, bottom = NaN;
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
				(g & G.LEFT) ? G.LEFT : (g & G.RIGHT) ? G.RIGHT :
						(g & G.CENTER) ? G.CENTER :
							defaultG ? defaultG : G.LEFT,
			getVerticalGravity: (g, defaultG = null) =>
				(g & G.TOP) ? G.TOP : (g & G.BOTTOM) ? G.BOTTOM :
						(g & G.CENTER) ? G.CENTER :
							defaultG ? defaultG : G.TOP
		};
		return LayoutGravity;
	})(),
//######################################################################################################################
//#                                                       filters                                                      #
//######################################################################################################################
	/**
	 * a filter to use with Array.prototype.filter function, by binding the first argument <!--
	 * -->to the array elements you want to keep.
	 * @memberOf utils.tools
	 * @example [1,2,3,4].filter(utils.tools.intersectionFilter.bind(undefined, [1,4,5,6])); //[1,4]
	 * @param {Array} array
	 * @param {object} x
	 */
	intersectionFilter: (array, x) => array.indexOf(x) !== -1,
	/**
	 * a filter to use with Array.prototype.filter function, by binding the first argument <!--
	 * -->to the array of element you want to exclude.
	 * @memberOf utils.tools
	 * @example [1,2,3,4].filter(utils.tools.exclusionFilter.bind(undefined, [1,4,5,6])); //[2,3]
	 * @param {Array} array
	 * @param {object} x
	 */
	exclusionFilter: (array, x) => array.indexOf(x) === -1,
	/**
	 * a filter to use with Array.prototype.filter function, by binding the first argument <!--
	 * -->to the class you want your objects to be instances of.
	 * @memberOf utils.tools
	 * @param {class} _class
	 * @param {object} x
	 */
	instanceFilter : (_class, x) => x instanceof _class,

//######################################################################################################################
//#                                                  color conversion                                                  #
//######################################################################################################################
	/**
	 * generates a random hex color
	 * @memberOf utils.tools
	 * @param {number} [octets=3] - number of bytes this color will be on (4 3 or 1.5) (not checked)
	 * @returns {string}
	 */
	randomColor: (octets=3) => '#'+Math.random().toString(16).substr(2,2*octets),
	/**
	 * convert hsv color to rgb
	 * @memberOf utils.tools
	 * @param {number} h - integer in [0;359]
	 * @param {number} s - integer in [0;255]
	 * @param {number} v - integer in [0;255]
	 * @returns {utils.tools.rgb}
	 */
	HSVtoRGB: (h, s, v)=> {
		const i = Math.floor(h * 6),
			f = h * 6 - i,
			p = Math.round((v * (1 - s))*255),
			q = Math.round((v * (1 - f * s))*255),
			t = Math.round((v * (1 - (1 - f) * s))*255);
		v = Math.round(v*255);
		switch (i % 6) {
			case 0: return {r: v, g: t, b: p};
			case 1: return {r: q, g: v, b: p};
			case 2: return {r: p, g: v, b: t};
			case 3: return {r: p, g: q, b: v};
			case 4: return {r: t, g: p, b: v};
			case 5: return {r: v, g: p, b: q};
			default : return {r: 0, g: 0, b: 0};
		}
	},
	/**
	 * convert rgb color to hsv
	 * @memberOf utils.tools
	 * @param {number} r - integer in [0;255]
	 * @param {number} g - integer in [0;255]
	 * @param {number} b - integer in [0;255]
	 * @returns {utils.tools.hsv}
	 */
	RBGtoHSV : (r, g, b)=> {
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
	},
	/**
	 * convert rgb color to hexadecimal string formated color
	 * @memberOf utils.tools
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 * @returns {string}
	 */
	RGBToHex : (r, g, b)=> (r>15?'#':'#0')+((r<<16)+(g<<8)+b).toString(16),
//######################################################################################################################
//#                                                    other methods                                                   #
//######################################################################################################################
	/**
	 * creates a mix of a superclass and several mixins to make a class extend a class and implements mixins.
	 * @memberOf utils.tools
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
	 * class C extends utils.tools.mix(A, B) {
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
	mix: (superclass, ...mixins) => {
		class C extends superclass { }
		let len = mixins.length, i = -1;
		while (++i < len) utils.tools.merge(C.prototype, mixins[i], true);
		return C;
	},
	/**
	 * puts all properties of src in out. if override is false or not set, if a property, <!--
	 * -->of src already exist in the parameter out, they are not overridden.
	 * @memberOf utils.tools
	 * @param {object} out
	 * @param {object} src
	 * @param {boolean} [override=false]
	 */
	merge: (out, src, override = false) => {
		for (let p in src) if (src.hasOwnProperty(p) && (override || !out.hasOwnProperty(p))) out[p] = src[p];
	},
	/**
	 * @memberOf utils.tools
	 * @param {string} url
	 * @returns {Promise} promise resolved with {@link String} object when string is loaded
	 */
	loadString: (url) => {
		return new Promise(resolve => {
			const client = new XMLHttpRequest();
			client.open('GET', url);
			client.onreadystatechange = _ => {
				if(client.readyState == 4 && client.status == 200 || client.status == 0)
					resolve(client.responseText);
			}
			client.send();

		});
	},
	/**
	 * @memberOf utils.tools
	 * @param {string} url
	 * @returns {Promise} promise resolved with {@link Image} object when image is loaded
	 */
	loadImage: (url) => {
		return new Promise(resolve => {
			const img = new Image();
			img.onload = _ => {
				resolve(img);
			}
			img.src = url;
		});
	},
	/**
	 * creates a worker running the specified script
	 * @memberOf utils.tools
	 * @param {string} script
	 * @returns {Worker} newly created web worker runnning the script
	 */
	createScriptWorker: (script) => {
		let blob = new Blob([script],
			{type: 'application/javascript'});
		let url = URL.createObjectURL(blob)
		let worker = new Worker(url);
		URL.revokeObjectURL(url)
		return worker;
	},
	/**
	 * replaces a function that does not exists by the same function with the vendor prefixes.
	 * @example
	 * polyfill(window, 'requestAnimationFrame', ['ms', 'moz', 'webkit', 'o']);
	 * window.reaquestAnimationFrame(frameFunction);
	 * @param {Object} container
	 * @param {string} name
	 * @param {string[]} vendors
	 */
	polyfill: (container, name, vendors) => {
		for(let i = 0; i < vendors.length && !container[name]; i++) {
			container[name] = container[vendors[i] + name] ||
							  container[vendors[i] + name[0].toUpperCase() + name.substr(1)];
		}
	},
	textFileUserDownload(text, fileName) {
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', fileName);
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	},
	/**
	 * convert text with BBcode to html text with equivalent balises
	 * @param {string} bbcode
	 * @returns {*}
	 * @constructor
	 */
	BBCodeToHTML(bbcode) {
		let str = bbcode;
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
	},
	/**
	 *
	 * @param {string} wasmUrl - url to WebAssembly file.
	 * @param {object} importObject - objects to import in wasm
	 * @param {function({module, instance})} callback - called once the wasm module is loaded
	 */
	loadWASM(wasmUrl, imports) {
		return fetch(wasmUrl).then(response =>
			response.arrayBuffer()
		).then(bytes =>
			WebAssembly.instantiate(bytes, imports)
		);
	},
	instanciateWASM(wasmUrl, imports) {
		return utils.tools.loadWASM(wasmUrl, imports).then(results => results.instance);
	}
};
console.stack = ( str ) =>{
	console.error(new Error(str).stack);
};
console.deprecated = ( str ) =>{
	console.stack('deprecated : ' + str);
};
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

CanvasRenderingContext2D.prototype.wrapText = function (text, rect, lineHeight, textGravity, fill = true, stroke = false) {
	let paragraphs = text.split('\n');
	let parLen = paragraphs.length;
	let lines = [], line;
	let linesX = [], lineX = 0;
	let words, len;
	let testLine;
	let metrics;
	let width = 0;
	let rectWidth = rect.width;
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
				if (!(textGravity & Gravity.LEFT)) {
					if (textGravity & Gravity.RIGHT) lineX += this.measureText(line).width - width;
					else if (textGravity & Gravity.CENTER) lineX += (this.measureText(line).width - width) / 2;
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
		if (!(textGravity & Gravity.LEFT)) {
			metrics = this.measureText(line);
			width = metrics.width;
			if (textGravity & Gravity.RIGHT) lineX += rectWidth - width;
			else if (textGravity & Gravity.CENTER) lineX += (rectWidth - width) / 2;
		}
		lines.push(line);
		linesX.push(lineX);
	}
	len = lines.length;
	var y = rect.yMin + lineHeight;
	if (!(textGravity & Gravity.TOP)) {
		if (textGravity & Gravity.BOTTOM) y = rect.yMax - lineHeight * (len - 1);
		else if (textGravity & Gravity.CENTER) y += (rect.height - lineHeight * len) / 2;
	}
	for (n = 0; n < len; n++) {
		if (fill)   this.fillText(lines[n], linesX[n], y);
		if (stroke) this.strokeText(lines[n], linesX[n], y);
		y += lineHeight;
	}
};
let asm = {};
var wasmImports = {
	env: {
		rand: Math.random
	}
};
let wasmCode = new Uint8Array([
	0,97,115,109,1,0,0,0,1,139,128,128,128,0,2,96,0,1,125,96,2,125,125,1,125,2,140,128,128,128,0,1,3,101,110,118,4,114,
	97,110,100,0,0,3,130,128,128,128,0,1,1,4,132,128,128,128,0,1,112,0,0,5,131,128,128,128,0,1,0,1,6,129,128,128,128,0,
	0,7,151,128,128,128,0,2,6,109,101,109,111,114,121,2,0,10,114,97,110,103,101,100,82,97,110,100,0,1,10,147,128,128,
	128,0,1,141,128,128,128,0,0,32,1,32,0,147,16,0,148,32,0,146,11
]);
WebAssembly.instantiate(wasmCode, wasmImports).then(wasm=>{
	asm = wasm.instance.exports;
	//Math.rangedRandom = asm.rangedRand;
});

