/**
 * @module main
 */
import {GameManager} from "../../game/manager.mjs";
import {StandardViewer} from "../../game/viewers.mjs";
import {Rect} from "../../geometry2d/Rect.mjs";
import {InputManager, Key, KeyMap, KeyState} from "../../utils/input.mjs";
import {GameEvent} from "../../game/manager.min.mjs";
import {AsteroidSpawner} from "./Asteroid.mjs";
import SpaceShip from "./SpaceShip.mjs";

const GM = new GameManager({
    dt: 1/60,
    viewer: new StandardViewer({
        canvas: document.getElementById('game_canvas'),
        visibleRect: new Rect(0, 0, 1280, 720),
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
    mapping: {
        'left': [Key.LEFT, Key.Q, Key.A],
        'up': [Key.UP, Key.Z, Key.W],
        'right': [Key.RIGHT, Key.D],
        'down': [Key.DOWN, Key.S],
        'pause': [Key.ESCAPE, Key.ENTER],
        'shoot': [Key.SPACE],
        "faster": [Key.P],
        "slower": [Key.M],
    },
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

