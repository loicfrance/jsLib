import {GameEvent, GameManager} from "../../game/manager.mod.js";
import {StandardViewer} from "../../game/viewers.mod.js";
import {Vec2, Rect} from "../../geometry2d/geometry2d.mod.js";
import {InputManager, Key, KeyMap, KeyState} from "../../utils/input.mod.js";
import PlayerCharacter from "./PlayerCharacter.mjs";
const gameRect = new Rect(-45,-100,60, 45);
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
            case GameEvent.GAME_FRAME : break;
            case GameEvent.OBJECT_DESTROYED : break;
        }
    },
});
const player = new PlayerCharacter(Vec2.ZERO);

const input = new InputManager(document.body);
const keyMap = new KeyMap({
    mapping: {
        'left': [Key.LEFT, Key.A, Key.Q],
        'right': [Key.RIGHT, Key.D],
        'up': [Key.UP, Key.W, Key.Z],
        'down': [Key.DOWN, Key.S]
    },
    callback: (action, state)=> {
        switch(action) {
            case 'left': case 'up': case 'right': case 'down': case 'shoot':
                player.control[action] = (state === KeyState.PRESSED);
                break;
        }
    }

});
GM.addObject(player);
GM.start();
GM.startRendering();
keyMap.enable(input);
