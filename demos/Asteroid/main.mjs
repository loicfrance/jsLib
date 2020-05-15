/**
 * @module main
 */
import {GameManager} from "../../game/manager.mod.js";
import {StandardViewer} from "../../game/viewers.mod.js";
import {Vec2, Rect} from "../../geometry2d/geometry2d.mod.js";
import {InputManager, Key, KeyMap, KeyState} from "../../utils/input.mod.js";
import {GameEvent} from "../../game/manager.mod.js";
import {AsteroidSpawner} from "./Asteroid.mjs";
import SpaceShip from "./SpaceShip.mjs";

const GM = new GameManager({
    dt: 1/60,
    viewer: new StandardViewer({
        canvas: document.getElementById('game_canvas'),
        inGameView: {
            spanX: 1280,
            spanY: 720,
            center: new Vec2(1280, 720).mul(0.5)
        },
        cursor: 'crosshair',
        autoResize: {use: true},
        resolution: {width: 1280, height: 720},
    }),
    onGameEvent: (gameEvent, number, gameObject) => {
        switch(gameEvent) {
            case GameEvent.GAME_FRAME :
                break;
        }
    }
});

const ship = new SpaceShip(GM.viewer.visibleRect.center);
GM.addObject(ship);

let keyMap = new KeyMap({
    mapping: [
        {keys: Key.LEFT, action: 'left'},
        {keys: Key.Q, action: 'left'},
        {keys: Key.A, action: 'left'},
        {keys: Key.UP, action: 'up'},
        {keys: Key.Z, action: 'up'},
        {keys: Key.W, action: 'up'},
        {keys: Key.RIGHT, action: 'right'},
        {keys: Key.D, action: 'right'},
        {keys: Key.DOWN, action: 'down'},
        {keys: Key.S, action: 'down'},
        {keys: Key.ESCAPE, action: 'pause'},
        {keys: Key.ENTER, action: 'pause'},
        {keys: Key.SPACE, action: 'shoot'},
        {keys: Key.P, action: 'faster'},
        {keys: Key.M, action: 'slower'},
    ],
    callback: (evt, keyState)=> {
        switch(evt) {
            case 'left': ship.control.rotateLeft = (keyState === KeyState.PRESSED); break;
            case 'up': ship.control.thrust = (keyState === KeyState.PRESSED); break;
            case 'right': ship.control.rotateRight = (keyState === KeyState.PRESSED); break;
            case 'down': ship.control.break = (keyState === KeyState.PRESSED); break;
            case 'shoot': ship.fire(keyState === KeyState.PRESSED); break;
            case 'pause': if(keyState === KeyState.PRESSED) if(GM.isRunning()) GM.stop(); else GM.start(); break;
            case 'faster': GM.gameDt *= 2; break;
            case 'slower': GM.gameDt *= 0.5; break;
            default: break;
        }
    }
});
const IM = new InputManager(GM.viewer.context.canvas);
keyMap.enable(IM);

GM.addObject(new AsteroidSpawner(0.3, 1.5));

GM.start();
GM.startRendering();

