/**
 * @module utils/tools
 */
import {LayoutGravity as G} from "./layout.mjs"
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
 * @param superclass
 * @param {Object} mixins
 * @returns created class
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
	 * TODO improve using https://developers.google.com/web/updates/2018/04/loading-wasm
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
const rangedRandom = ( min, max ) => Math.random()*(max-min)+min;
/**
 * generate a pseudo-gaussian random number in ]-1;1[
 * @return {number}
 */
const gaussianRandom = () => (Math.random()+Math.random()+Math.random()
					   +Math.random()+Math.random()+Math.random()-3)/3;

/**
 *
 * @param text
 * @param rect
 * @param lineHeight
 * @param textGravity
 * @param fill
 * @param stroke
 */
const wrapText = function(text, rect, lineHeight, textGravity, fill = true, stroke = false) {
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
export {
    mix,
    merge,
    loadString,
    loadImage,
    createScriptWorker,
    polyfill,
	waitForEvent,
	delay,
    textFileUserDownload,
    BBCodeToHTML,
    loadWASM,
    instanciateWASM,
	rangedRandom,
    gaussianRandom,
    wrapText
};
