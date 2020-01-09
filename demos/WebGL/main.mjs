import {GameManager} from "../../game/manager.mjs";
import {WebGLViewer} from "../../game/viewers.mjs";
import {Rect} from "../../geometry2d/Rect.mjs";
import {GameObject} from "../../game/object.mjs";
import {Vec2} from "../../geometry2d/Vec2.mjs";
import {WebGLObjectRenderer} from "../../game/renderer_collider.mjs";
import {createProgram, createShader, standardFragmentShader} from "../../utils/webgl";
import {loadString} from "../../utils/tools";
import {SimpleShapedObject} from "../../game/object.mjs";
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
