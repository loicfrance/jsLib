import {GameManager} from "../../game/manager.mod.js";
import {WebGLViewer} from "../../game/viewers.mod.js";
import {Rect} from "../../geometry2d/Rect.mod.js";
import {GameObject} from "../../game/object.mod.js";
import {Vec2} from "../../geometry2d/Vec2.mod.js";
import {WebGLObjectRenderer} from "../../game/renderer_collider.mod.js";
import {createProgram, createShader, standardFragmentShader} from "../../utils/webgl.mod.js";
import {loadString} from "../../utils/tools.mod.js";
import {SimpleShapedObject} from "../../game/object.mod.js";
import {SimpleWebGLRenderer} from "./SimpleWebGLRenderer.mjs";

const width  = 1280;
const height = 720;

window.onload = function() {
    const GM = new GameManager({
        dt: 1 / 60,
        viewer: new WebGLViewer({
            canvas: document.getElementById('game_canvas'),
            visibleRect: new Rect(0, 0, width, height),
            cursor: 'crosshair',
            autoResize: {use: true},
            resolution: {width: width, height: height},
        })
    });
    const GL = GM.getViewer().gl;
    let shaderProgram;
    const object = new GameObject(new Vec2(width/2, height/2));
    SimpleWebGLRenderer.loadShaders(GL).then(r => {
        object.setRenderer(new SimpleWebGLRenderer());
    });
};
