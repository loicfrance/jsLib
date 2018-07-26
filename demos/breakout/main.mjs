import {GameEvent, GameManager} from "../../game/manager.mjs";
import {StandardViewer, UIElement} from "../../game/viewers.mjs";
import {Circle, Rect, Vec2} from "../../geometry2d/geometry2d.mjs";
import {InputManager, Key, KeyMap, KeyState} from "../../utils/input.mjs";

import {Ball, Brick, Paddle} from "./Breakout_Objects.mjs";
import {HSVtoRGB, RGBtoHex} from "../../utils/colors.mjs";
import {BBCodeToHTML} from "../../utils/tools.mjs";
import ScoreView from "./ScoreView.mjs";

//<editor-fold desc="Game Manager init" default-state="collapsed">
const gameRect = new Rect(0,0, 160, 100);
const scoreView = new ScoreView();
const GM = new GameManager({
    gameDt: 1/60,
    realDt: 1/60,
    viewer : new StandardViewer({
        canvas: document.getElementById('game_canvas'),
        visibleRect: gameRect,
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
const paddle = new Paddle(new Rect(0,0,20, 5));
const ball = new Ball(new Circle(Vec2.ZERO, 2), Vec2.ZERO);
function gameInit() {
    GM.clearObjects();
    paddle.setPosition(gameRect.center).moveXY(0, gameRect.height/2-10);
    ball.setPosition(paddle.getPosition()).moveXY(10,-10);
    ball.setSpeed(new Vec2(Math.random(), Math.random()).setMagnitude(40));
    GM.addObjects([ball, paddle]);
    for(let i=0; i< 5; i++) {
        for(let j=0; j<8; j++) {
            const color = HSVtoRGB(Math.random(), 1, 1);
            GM.addObject(new Brick(new Rect(j*20+1, i*10+1, j*20+19, i*10+9), RGBtoHex(color.r, color.g, color.b)));
        }
    }
    scoreView.setScore(0);
    GM.start();
}

//<editor-fold desc="Input">
const Input = new InputManager(document.body);
const keyMap = new KeyMap({
    mapping: {
        'left':  [Key.LEFT, Key.Q, Key.A],
        'right': [Key.RIGHT, Key.D],
        "pause": [Key.SPACE, Key.ENTER, Key.ESCAPE]
    },
    callback: (action, keyState) => {
        switch(action) {
            case 'left'  : paddle.speed.x = (keyState === KeyState.PRESSED) ? -60 : 0; break;
            case 'right' : paddle.speed.x = (keyState === KeyState.PRESSED) ?  60 : 0; break;
            case 'pause' : if(keyState === KeyState.RELEASED) GM.isRunning() ? GM.stop() : GM.start(); break;
        }
    }
});
//</editor-fold>

GM.viewer.addUIElement(scoreView);
gameInit();
GM.startRendering();
keyMap.enable(Input);