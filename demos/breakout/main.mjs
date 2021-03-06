import {GameEvent, GameManager} from "../../game/manager.mod.js";
import {StandardViewer, UIElement} from "../../game/viewers.mod.js";
import {Circle, Rect, Vec2} from "../../geometry2d/geometry2d.mod.js";
import {InputManager, Key, KeyMap, KeyState} from "../../utils/input.mod.js";

import {Ball, Brick, Paddle} from "./Breakout_Objects.mjs";
import {HSVtoRGB, RGBtoHex} from "../../utils/colors.mod.js";
import {BBCodeToHTML} from "../../utils/tools.mod.js";
import ScoreView from "./ScoreView.mjs";

//<editor-fold desc="Game Manager init" default-state="collapsed">
const gameRect = new Rect(0,0, 160, 90);
const scoreView = new ScoreView();
const GM = new GameManager({
    gameDt: 1/60,
    realDt: 1/60,
    viewer : new StandardViewer({
        canvas: document.getElementById('game_canvas'),
        inGameView: {
            spanX: gameRect.width,
            spanY: gameRect.height,
            center: gameRect.center
        },
        cursor: 'crosshair',
        autoResize: {use: true},
        resolution: {width: 1280, height: 720},
    }),
    onGameEvent : (evt, dT, obj) => {
        switch(evt) {
            case GameEvent.GAME_FRAME :
                if(ball.isOutOfRect(GM.viewer.visibleRect)) {
                    GM.stop();
                    gameInit();
                }
                break;
            case GameEvent.OBJECT_DESTROYED :
                if(obj instanceof Brick) {
                    scoreView.addScore(1);
                }
        }
    },
});
GM.viewer.context.lineWidth = 0.16;
//</editor-fold>
const paddle = new Paddle(new Rect(0,0,20, 1));
const ball = new Ball(new Circle(Vec2.ZERO, 2), Vec2.ZERO);
function gameInit() {
    GM.clearObjects();
    paddle.setPosition(gameRect.center).moveXY(0, gameRect.height/2-10);
    ball.setPosition(paddle.getPosition()).moveXY(10,-10);
    ball.setSpeed(new Vec2(Math.random(), Math.random()).setMagnitude(40));
    GM.addObjects([ball, paddle]);
    for(let i=0; i< 5; i++) {
        for(let j=0; j<8; j++) {
            const color = HSVtoRGB(i*0.2+j*0.02, 1, 1);
            GM.addObject(new Brick(new Rect(j*20+1, i*10+1, j*20+19, i*10+9), RGBtoHex(color.r, color.g, color.b)));
        }
    }
    scoreView.setScore(0);
    GM.start();
}

//<editor-fold desc="Input">
const Input = new InputManager(document.body);
const keyMap = new KeyMap({
    mapping: new Map(Object.entries({
        "left": [
            {code: "ArrowLeft"},
            {code: "Q"},
            {code: "A"},
        ],
        "right": [
            {code: "ArrowRight"},
            {code: "D"},
        ],
        "pause": [
            {code: "Space"},
            {code: "Enter"},
            {code: "Escape"},
        ],
    })),
    callback: (action, evt) => {

        switch(action) {
            case 'left'  : paddle.speed.x = (evt.type === "keydown") ? -60 : 0; break;
            case 'right' : paddle.speed.x = (evt.type === "keydown") ?  60 : 0; break;
            case 'pause' : if(evt.type === "keyup") GM.isRunning() ? GM.stop() : GM.start(); break;
        }
    }
});
//</editor-fold>

GM.viewer.addUIElement(scoreView);
gameInit();
GM.startRendering();
keyMap.enable(document.body, ["keydown", "keyup"]);