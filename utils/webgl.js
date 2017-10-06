/**
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
	createProgram(gl, vertexShader, fragmentShader) {
		const prog = gl.createProgram();
		gl.attachShader(prog, vertexShader);
		gl.attachShader(prog, fragmentShader);
		gl.linkProgram(prog);
		if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
			console.error(new Error(gl.getProgramInfoLog(prog)).stack);
			gl.deleteProgram(prog);
			return;
		}
		return prog;
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
	standardVertexShader : `
		attribute vec3 a_position;
		attribute vec4 a_color;
		
		uniform mat4 uMVMatrix;
		uniform mat4 uPMatrix;
		
		void main(void) {
			f_color = a_color;
			gl_Position = uPMatrix * uMVMatrix * vec4(a_position, 1.0);
		}
	`,
	standard2dVertexShader : `
		attribute vec2 a_position;
		
		uniform int a_color;
		uniform mat3 uMVMatrix;
		
		varying vec4 f_color;
		void main(void) {
            int r = a_color / 256 / 256;
            int g = a_color / 256 - 256*r;
            int b = a_color - 256*(256*r+g);
            f_color = vec4(float(r)/255.0, float(g)/255.0, float(b)/255.0, 1.0);
			gl_Position = vec4(uMVMatrix * vec3(a_position, -1.0), 1.0);
		}
	`,
	standardFragmentShader : `
		precision mediump float;
		varying vec4 f_color;
		
		void main(void) {
			gl_FragColor = color;
		}
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
};