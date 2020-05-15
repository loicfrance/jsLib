/**
 * @module main
 */
import {GameManager} from "../../game/manager.mod.js";
import {RenderEvent, StandardViewer} from "../../game/viewers.mod.js";
import {Rect} from "../../geometry2d/Rect.mod.js";
import {InputManager, Key, KeyMap, KeyState, MouseButton} from "../../utils/input.mod.js";
import {GameEvent} from "../../game/manager.min.mjs";
import {DebugTiledMapRenderer, TiledMap} from "../../game/TiledMap.mod.js";
import {
    CaveGenerationAlgorithm,
    CellularTiledMapLayer,
    ConwayGameOfLifeAlgorithm,
    HighLifeAlgorithm
} from "../../game/plug-ins/CellularTiledMapLayer.mod.js";
import {PRNG, createOneDimensionGaussianFunction} from "../../utils/tools.mod.js";
import {Perlin, Simplex} from "../../utils/noise.mod.js";

const Random = new PRNG(Math.round(Math.random()*Number.MAX_SAFE_INTEGER));
console.log("PRNG seed : " + Random.seed);
let stable = false;
let display_grid = true;
const noiseGen = new Simplex(Random, 2);
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
                    if(keyMap.isKeyDown(IM, "auto"))
                        stable = layer.step();
                }
                break;
            default :
                break;
        }
    }
});
const tileSize = 3;
const tiledMap = new TiledMap(GM.viewer.visibleRect.center,
    Math.ceil(1280/tileSize),
    Math.ceil(720/tileSize),
    tileSize, tileSize);

const accumulator = new Array(tiledMap.lines);
for (let i=0; i<accumulator.length; i++) {
    accumulator[i] = new Array(tiledMap.columns);
    for(let j=0; j<accumulator.length; j++)
        accumulator[i][j] = 0;
}
//tiledMap.setRenderer(new DebugTiledMapRenderer(tiledMap, "#888"));
GM.addObject(tiledMap);

tiledMap.setLayer('cellular', new CellularTiledMapLayer(0,0,tiledMap.lines,tiledMap.columns,
    ConwayGameOfLifeAlgorithm, 0));
/*
{
    const layer = tiledMap.getLayer('cellular');
    const factor = 2 / (tiledMap.columns);
    const law = createOneDimensionGaussianFunction(0, 1);
    let i = tiledMap.lines, j, min = 0, max = 0;
    while (i--) {
        j = tiledMap.columns;
        while (j--) {
            const dx = j-(tiledMap.columns/2);
            const dy = i-(tiledMap.lines/2);
            const dist = Math.sqrt(dx * dx + dy * dy)/(tiledMap.lines*4);
            // noinspection PointlessArithmeticExpressionJS
            const noise =
                //noiseGen.noise([j/256,i/256])*128 +
                noiseGen.noise([j/128,i/128])*64 +
                noiseGen.noise([j/64,i/64])*32 +
                noiseGen.noise([j/32,i/32])*16 +
                noiseGen.noise([j/16,i/16])*8 +
                noiseGen.noise([j/8,i/8])*4 +
                noiseGen.noise([j/4,i/4])*2 +
                noiseGen.noise([j/2,i/2]) +
                0
            ;
            if(noise < min) min = noise;
            if(noise > max) max = noise;
            accumulator[i][j] = noise;
            layer.setValue(j, i, (noise > 0) ? 1 : 0);
            //layer.setValue(j,i, (Random.nextFloat() >= law(dist) ? 0 : 1));
        }
    }
    const noise_range = max-min;
    i = tiledMap.lines;
    console.log(min, max);
    while(i--) {
        j = tiledMap.columns;
        while (j--) {
            accumulator[i][j] = ((accumulator[i][j] - min) / noise_range);// * (-3/4)+(4/5)+0.001;
            //accumulator[i][j] = 0;
        }
    }
    window.accumulator = accumulator;
}
*/
GM.viewer.setCallback(function(evt, context) {
    if(evt === RenderEvent.RENDER_BEGIN) {
        window.context = context;
        const layer = tiledMap.getLayer('cellular');
        let i = layer.lines,j;
        const rect = new Rect(0, 0, tiledMap.tileWidth, tiledMap.tileHeight);
        if(IM.getKeyState(Key.B)) {
            while (i--) {
                j = layer.columns;
                while (j--) {
                    //*
                    const gray = (Math.round(accumulator[i][j]*255)).toString(16).padStart(2,'0');
                    context.fillStyle = `#${gray}${gray}${gray}`;
                    /*/
                    const color = HSVtoRGB(accumulator[i][j], 1,1);
                    context.fillStyle = RGBtoHex(color.r,color.g,color.b);
                    //*/
                    rect.setCenter(tiledMap.getTileCenter(j, i)).draw(context, true, false);
                }
            }
        } else {
            context.fillStyle = "#FFF";
            while (i--) {
                if (display_grid === true) {
                    j = layer.columns;
                    while (j--) {
                        if (layer.getValue(j, i)) {
                            rect.setCenter(tiledMap.getTileCenter(j, i)).draw(context, true, false);
                        }
                    }
                }
            }
        }
    } else if(evt === RenderEvent.RENDER_END) {
        //context.fillStyle = "#F00";
        //new CircleMod(tiledMap.position, 10).draw(context, true);
    }
});

let keyMap = new KeyMap({
    mapping: {
        'step': [Key.RIGHT],
        'pause': [Key.ESCAPE, Key.ENTER],
        "faster": [Key.UP],
        "slower": [Key.DOWN],
        "auto": [Key.A],
        "grid": [Key.G],
    },
    callback: (evt, keyState)=> {
        switch(evt) {
            case 'pause'    : if(keyState === KeyState.PRESSED) if(GM.isRunning()) GM.stop(); else GM.start(); break;
            case 'faster'   : GM.gameDt *= 2; break;
            case 'slower'   : GM.gameDt *= 0.5; break;
            case 'grid'     : if(keyState === KeyState.PRESSED) display_grid = !display_grid; break;
            default: break;
        }
    }
});
const IM = new InputManager(GM.viewer.context.canvas);
IM.setMouseEventsCallback((evt, evtType, btn, pos)=> {
    pos = tiledMap.getTileIndices(GM.viewer.pixelToGameCoordinatesTransform(pos, pos));
    if (tiledMap.checkIndices(pos.x, pos.y))
        switch(btn) {
            case MouseButton.LEFT :
                tiledMap.getLayer('cellular').setValue(pos.x, pos.y, 1);
                stable = false;
                return false;
            case MouseButton.RIGHT :
                tiledMap.getLayer('cellular').setValue(pos.x, pos.y, 0);
                stable = false;
                return true;
        }

});
keyMap.enable(IM);


GM.start();
GM.startRendering();

