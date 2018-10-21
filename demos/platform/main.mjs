import {GameEvent, GameManager} from "../../game/manager.mjs"
import {StandardViewer} from "../../game/viewers.mjs";
import {Rect} from "../../geometry2d/Rect.mjs";
import {AmbientFriction, Force, PhysicWorld} from "../../game/physics.mjs";
import {InputManager, Key, KeyMap, KeyState} from "../../utils/input.mjs";
import Platform from "./Platform.mjs";
import {Vec2} from "../../geometry2d/Vec2.mjs";
import Character from "./Character.mjs";

const GM = new GameManager({
    gameDt: 1/60,
    realDt: 1/60,
    viewer : new StandardViewer({
        canvas: document.getElementById('game_canvas'),
        visibleRect: new Rect(-8, -4.5, 16+8, 9+4.5),
        cursor: 'crosshair',
        autoResize: {use: true},
        resolution: {width: 1280, height: 720},
    }),
    onGameEvent : (evt, dT, obj) => {
        switch(evt) {
            case GameEvent.GAME_FRAME : break;
            case GameEvent.OBJECT_DESTROYED : break;
        }
    },
    physicWorld: new PhysicWorld(),
});
GM.physicWorld.forces.push(new Force(new Vec2(0, 10)));
GM.physicWorld.forces.push(new AmbientFriction());

const character = new Character(new Rect(0,0,0.5,0.5), '#F00').moveXY(1,7);
const input = new InputManager(document.body);
const keyMap = new KeyMap({
    mapping: {
        'left'  : [Key.LEFT, Key.A, Key.Q],
        'up'    : [Key.UP, Key.Z, Key.W],
        'right' : [Key.RIGHT, Key.D],
        'down'  : [Key.DOWN, Key.S],
        'pause' : [Key.ESCAPE, Key.ENTER],
    },
    callback: (action, keyState) => {

        switch(action) {
            case 'left' : character.left(keyState === KeyState.PRESSED);break;
            case 'up'   : if(keyState === KeyState.PRESSED) character.jump(); break;
            case 'right': character.right(keyState === KeyState.PRESSED);break;
            case 'down' : break;
            case 'pause': if(keyState === KeyState.RELEASED) GM.isRunning() ? GM.stop() : GM.start(); break;
        }
    }
});
GM.addObjects([
    character,
    new Platform(new Rect(5, 7, 8, 7.5)),
    new Platform(new Rect(0,0,1,9)),
    new Platform(new Rect(1,8,16,9))
]);
GM.start();
GM.startRendering();
keyMap.enable(input);