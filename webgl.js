/**
 * Created by rfrance on 11/29/2016.
 */
window['webgl'] = {
	getGLContext(canvas) {
		return canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	},
	/**
	 * @param {WebGLRenderingContext} gl
	 */
	initGLContext(gl) {
		gl.clearColor(0.0, 0.0, 0.0, 1.0); // set clear color to opaque black
		gl.depthFunc(gl.LEQUAL); // near objects hide far objects
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT); //clear depth and color buffer
	},
	createGLShader(gl, shaderScript, type) {
		let shader;
		switch(type) {
			case 'vertex'  : shader = gl.createShader(gl.  VERTEX_SHADER); break;
			case 'fragment': shader = gl.createShader(gl.FRAGMENT_SHADER); break;
			default: console.error(new Error(type + ' is not a valid shader type. only \'vertex\' and \'fragment\''
				+ ' are accepted as shader type.').stack);
		}
		gl.shaderSource(shader, shaderScript);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error(new Error(gl.getShaderInfoLog(shader)).stack);
			return null;
		}

		return shader;
	},
	addGLShaderProgram(gl, vertexShader, fragmentShader) {
		let prog = gl.createProgram();
		gl.attachShader(prog, vertexShader);
		gl.attachShader(prog, fragmentShader);
		gl.linkProgram(prog);
		if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
			console.error(new Error(gl.getProgramInfoLog(prog)).stack);
		}
		return prog;
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
		return [         cos * scaleX         ,         -sin * scaleY         , 0,
				         sin * scaleX         ,          cos * scaleY         , 0,
				scaleX * (tx * cos + ty * sin), scaleY * (ty * cos - ty * sin), 1];
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
	GlHandler: (function(){
		class GlBufferHandler {
			constructor(gl) {
				this.gl = gl;
			}
		}
		return GlBufferHandler;
	})
};