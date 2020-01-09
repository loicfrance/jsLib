import {WebGLObjectRenderer} from "../../game/renderer_collider.mjs";
import {loadString} from "../../utils/tools.mjs";
import {standardFragmentShader, getUniformLocations, ShaderInfo} from "../../utils/webgl.mjs";
import {createAttribBuffer} from "../../utils/webgl";

/**
 *
 * @type {ShaderInfo}
 */
let shader = null;
const attributes = {
    a_position : 0,
    a_vectors : 1
};
const uniforms = {
    u_camera : 0,
    u_depth : 1
};
/**
 * @param gl
 * @returns {Promise}
 */
function loadShaders(gl) {
    return loadString("vertex_shader.glsl").then(
        (text)=> {
            shader = new ShaderInfo(gl, text, standardFragmentShader, Object.keys(attributes), Object.keys(uniforms));
        });
}

class SimpleWebGLRenderer extends WebGLObjectRenderer {
    constructor(gl) {
        super(shader.program);
        this.attr_buf = shader.attr_locs.map((loc, i)=>gl.createBuffer());
        this.index_buff = gl.createBuffer();

    }
}
SimpleWebGLRenderer.loadShaders = loadShaders;

export {SimpleWebGLRenderer}