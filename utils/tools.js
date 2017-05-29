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
					left = availableRect.left + w; right = availableRect.right - w;
					top = availableRect.top + h; bottom = availableRect.bottom - h;
				}
				if (gravity & G.LEFT !== 0) left = availableRect.left;
				if (gravity & G.TOP !== 0) top = availableRect.top;
				if (gravity & G.RIGHT !== 0) right = availableRect.right;
				if (gravity & G.BOTTOM !== 0) bottom = availableRect.bottom;
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
	 * @param {number} [octets=3] - number of bits this color will be on (32 or 24)
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
	 * gets a string returned by a specified url by calling the callback function with the returned <!--
	 * -->text as argument.
	 * @memberOf utils.tools
	 * @param {string} url
	 * @param {function(string)} callback
	 */
	getStringFromUrl: (url, callback) => {
		let client = new XMLHttpRequest();
		client.open('GET', url);
		client.onreadystatechange = _ => callback(client.responseText);
		client.send();
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
	}
};
console.stack = ( str ) =>{
	console.error(new Error(str).stack);
};
console.deprecated = ( str ) =>{
	console.stack('deprecated : ' + str);
};