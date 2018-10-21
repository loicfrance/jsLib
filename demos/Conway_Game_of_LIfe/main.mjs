/**
 * @module main
 */
import {GameManager} from "../../game/manager.mjs";
import {RenderEvent, StandardViewer} from "../../game/viewers.mjs";
import {Rect} from "../../geometry2d/Rect.mjs";
import {InputManager, Key, KeyMap, KeyState, MouseButton} from "../../utils/input.mjs";
import {GameEvent} from "../../game/manager.min.mjs";
import {TiledMap} from "../../game/TiledMap.mjs";
import {CaveGenerationAlgorithm, CellularTiledMapLayer, ConwayGameOfLifeAlgorithm} from "../../game/plug-ins/CellularTiledMapLayer.mjs";
import {HSVtoRGB, RGBtoHex} from "../../utils/colors.mjs";
import {Quintic, Quartic, Cubic, Quadratic} from "../../utils/transitions.mjs";
import {Vec2} from "../../geometry2d/Vec2.mjs";
import {PRNG} from "../../utils/tools.mjs";
const Random = new PRNG(Math.round(Math.random()*Number.MAX_SAFE_INTEGER));
console.log("PRNG seed : " + Random.seed);
let stable = false;
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
                if(!stable) {
                    const layer = tiledMap.getLayer('cellular');
                    stable = layer.step();
                }
                break;
        }
    }
});
const tileSize =5;
const tiledMap = new TiledMap(GM.viewer.visibleRect.center, Math.ceil(1280/tileSize),Math.ceil(720/tileSize), tileSize, tileSize);

tiledMap.setLayer('cellular', new CellularTiledMapLayer(0,0,tiledMap.lines,tiledMap.columns,ConwayGameOfLifeAlgorithm, 0));
{
    const layer = tiledMap.getLayer('cellular');
    let i = tiledMap.lines, j;
    while (i--) {
        j = tiledMap.columns;
        while (j--) {
            layer.setValue(j,i, Random.nextFloat() >= 0.5 ? 0 : 1);
        }
    }
}

GM.viewer.setCallback(function(evt, context) {
    if(evt === RenderEvent.RENDER_BEGIN) {
        context.fillStyle = "#FFF";
        context.strokeStyle = "#888";
        const layer = tiledMap.getLayer('cellular');
        let i = layer.lines,j;
        const rect = new Rect(0,0,tiledMap.tileWidth,tiledMap.tileHeight);
        if(IM.getKeyState(Key.A)) {
            while (i--) {
                j = layer.columns;
                while (j--) {
                    if (accumulator[i][j] > 0) {
                        const color = HSVtoRGB(accumulator[i][j]/690, 1,1);
                        context.fillStyle = RGBtoHex(color.r,color.g,color.b);
                        rect.setCenter(tiledMap.getTileCenter(j, i)).draw(context, true, false);
                    }
                }
            }
        } else {
            while (i--) {
                j = layer.columns;
                while (j--) {
                    if (layer.getValue(j, i)) {
                        rect.setCenter(tiledMap.getTileCenter(j, i)).draw(context, true, false);
                    }
                }
            }
        }
    }
});

let keyMap = new KeyMap({
    mapping: {
        'step': [Key.RIGHT],
        'pause': [Key.ESCAPE, Key.ENTER],
        "faster": [Key.UP],
        "slower": [Key.DOWN],
    },
    callback: (evt, keyState)=> {
        switch(evt) {
            case 'pause': if(keyState === KeyState.PRESSED) if(GM.isRunning()) GM.stop(); else GM.start(); break;
            case 'faster': GM.gameDt *= 2; break;
            case 'slower': GM.gameDt *= 0.5; break;
            default: break;
        }
    }
});
const IM = new InputManager(GM.viewer.context.canvas);
IM.setMouseEventsCallback((evt, evtType, btn, pos)=> {
    pos = tiledMap.getTileIndices(GM.viewer.pixelToGameCoordinatesTransform(pos, pos));

    switch(btn) {
        case MouseButton.LEFT :
            tiledMap.getLayer('cellular').setValue(pos.x, pos.y, 1);
            return false;
        case MouseButton.RIGHT :
            tiledMap.getLayer('cellular').setValue(pos.x, pos.y, 0);
            return true;
    }

});
keyMap.enable(IM);


GM.start();
GM.startRendering();

