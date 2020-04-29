/**
 * @module main
 */
import {GameManager} from "../../game/manager.mjs";
import {RenderEvent, StandardViewer} from "../../game/viewers.mjs";
import {Rect} from "../../geometry2d/Rect.mjs";
import {InputManager, Key, KeyMap, KeyState, MouseEvents} from "../../utils/input.mjs";
import {GameEvent} from "../../game/manager.min.mjs";
import {Vec2} from "../../geometry2d/Vec2.mjs";
import {loadImage, PRNG, shuffleArray} from "../../utils/tools.mjs";
import {Arc, Graph} from "../../utils/graph.mjs";
import {Circle} from "../../geometry2d/Circle.mjs";
import {Line} from "../../geometry2d/Line.mjs";
import {Polygon} from "../../geometry2d/Polygon.mjs";
import {buildDelaunayGraph, createPoints, DelaunayNode, DelaunayTriangleNode} from "./delaunay.mjs";
import {ImageParticle} from "../../game/particles.mjs";
/*
const rSeed = Math.random()*Number.MAX_SAFE_INTEGER;
/*/
const rSeed = 1740190226;
//*/
const Random = new PRNG(Math.round(rSeed));
console.log("PRNG seed : " + Random.seed);
const GM = new GameManager({
    dt: 1/60,
    viewer: new StandardViewer({
        canvas: document.getElementById('game_canvas'),
        visibleRect: new Rect(-122, -5, 3122, 2222),
        cursor: 'crosshair',
        autoResize: {use: true},
        resolution: {width: 3244, height: 2227},
    }),
    onGameEvent: (gameEvent, number, gameObject) => {
        switch(gameEvent) {
            case GameEvent.GAME_FRAME :
                if(keyMap.isKeyDown(IM, "auto"))
                    step();
                break;
        }
    }
});
//GM.realDt /= 600;
GM.viewer.context.lineWidth = 4;
const rect = new Rect(0, 0, 3000, 2000);
const points = [];
//zones de chaos
points.push.apply(points, createPoints(new Circle(new Vec2(1000, 1050), 150), 100));
points.push.apply(points, createPoints(new Circle(new Vec2(2000, 1050), 150), 100));
//barrieres devant pentes
points.push.apply(points, createPoints(new Rect(450, 1600-22, 450+800, 1600), 400));
points.push.apply(points, createPoints(new Rect(3000-450-800, 1600-22, 3000-450, 1600), 400));
//barrières fin pente
points.push.apply(points, createPoints(new Rect(450+800-22, 1600, 450+800, 2000), 400));
points.push.apply(points, createPoints(new Rect(3000-(450+800), 1600, 3000-(450+800-22), 2000), 400));
//barre milieu balance
points.push.apply(points, createPoints(new Rect(1500-20, 2000-622, 1500+20, 2000), 400));
//zones depart
points.push.apply(points, createPoints(new Rect(0, 300, 450, 1200), 300));
points.push.apply(points, createPoints(new Rect(3000-450, 300, 3000, 1200), 300));


//bords du terrain
points.push.apply(points, createPoints(new Line(new Vec2(0,0), new Vec2(3000,0)), 600));
points.push.apply(points, createPoints(new Line(new Vec2(0,2000), new Vec2(3000,2000)), 600));
points.push(new Vec2(0, 1600));
points.push(new Vec2(3000, 1600));

shuffleArray(points, Random.randomIntFunction);

function step() {
}

let bgImage = undefined;
loadImage("bg.png").then(img=> {
    bgImage = new ImageParticle(rect.center.addXY(0,150), img, Infinity);
    bgImage.scaleX = bgImage.scaleY = rect.width/img.width;
});
const triangles = buildDelaunayGraph(points, rect);
const mouseTriangles = [];
const mouseCursor = new Circle(Vec2.ZERO, 10);
GM.viewer.setCallback(function(evt, context) {
    if(evt === RenderEvent.RENDER_BEGIN) {
        context.fillStyle = "#2196f3";
        context.strokeStyle = "#ffffff";

        rect.draw(context, false);
        if(bgImage) {
            bgImage.render(context);
        }

        for(let i=0; i < triangles.length; i++) {
            triangles[i].render(context);
        }
        const nodeShape = new Circle(Vec2.zero, 10);
        for(let i=0; i < points.length; i++) {
            nodeShape.setCenter(points[i]).draw(context, true);
        }
        context.strokeStyle = "#F00";
        for(let i=0; i< mouseTriangles.length; i++) {
            mouseTriangles[i].draw(context);
        }
        if(mouseCursor) {
            mouseCursor.draw(context, true, true);
        }
    }
});

let keyMap = new KeyMap({
    mapping: {
        'step': [Key.RIGHT],
        'pause': [Key.ESCAPE, Key.ENTER],
        "faster": [Key.UP],
        "slower": [Key.DOWN],
        "auto": [Key.A],
    },
    callback: (evt, keyState)=> {
        switch(evt) {
            case 'pause': if(keyState === KeyState.PRESSED) if(GM.isRunning()) GM.stop(); else GM.start(); break;
            case 'faster': GM.gameDt *= 2; break;
            case 'slower': GM.gameDt *= 0.5; break;
            case 'step' : if(keyState === KeyState.PRESSED) step(); break;
            default: break;
        }
    }
});
const IM = new InputManager(GM.viewer.context.canvas);
IM.setMouseEventsCallback((evt, evtType, btn, pos)=> {
    switch(evtType) {
        case MouseEvents.CLICK :
            GM.viewer.pixelToGameCoordinatesTransform(pos, pos);
            mouseTriangles.splice(0, mouseTriangles.length);
            mouseCursor.setCenter(pos);
            for(let i = 0; i < triangles.length; i++) {
                if(triangles[i].shape.contains(pos)) {
                    mouseTriangles.push(triangles[i].shape);
                }
            }
            return true;
        case MouseEvents.CTX_MENU :
            mouseTriangles.splice(0, mouseTriangles.length);
            return true;
    }
});
keyMap.enable(IM);


GM.start();
GM.startRendering();

