/**
 * Created by Loic France on 11/29/2016.
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