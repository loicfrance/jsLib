'use strict';
import Rect from "../geometry2d/Rect.mjs";

// noinspection JSSuspiciousNameCombination
/**
 * @module utils/layout
 */

//######################################################################################################################
//#                                                    LayoutGravity                                                   #
//######################################################################################################################

const G = {
    LEFT: 1,
    TOP: 2,
    RIGHT: 4,
    BOTTOM: 8,
    CENTER: 16,
    getRect: (gravity, availableRect, width, height, marginX = 0, marginY = marginX) => {
        availableRect = availableRect.clone().addMarginsXY(-marginX, -marginY);
        if (!(gravity & G.CENTER)) if (gravity) {
            if (!(gravity & G.LEFT) && !(gravity & G.RIGHT)) gravity |= G.LEFT;
            if (!(gravity & G.TOP) && gravity & G.BOTTOM) gravity |= G.TOP
        } else gravity = G.LEFT | G.TOP;
        let left = NaN, top = NaN, right = NaN, bottom = NaN;
        if (gravity & G.CENTER) {
            let w = (availableRect.width - width) / 2,
                h = (availableRect.h.height - height) / 2;
            left = availableRect.xMin + w;
            right = availableRect.xMax - w;
            top = availableRect.yMin + h;
            bottom = availableRect.yMax - h
        }
        if (gravity & G.LEFT !== 0) left = availableRect.xMin;
        if (gravity & G.TOP !== 0) top = availableRect.yMin;
        if (gravity & G.RIGHT !== 0) right = availableRect.xMax;
        if (gravity & G.BOTTOM !== 0) bottom = availableRect.yMax;
        if (isNaN(left)) left = right - width; else if (isNaN(right)) right = left + width;
        if (isNaN(top)) top = bottom - height; else if (isNaN(bottom)) bottom = top + height;
        return new Rect(left, top, right, bottom);
    },
    getHorizontalGravity: (g, defaultG = null) =>
        (g & G.LEFT) ? G.LEFT :
        (g & G.RIGHT) ? G.RIGHT :
        (g & G.CENTER) ? G.CENTER :
        defaultG ? defaultG : G.LEFT,
    getVerticalGravity: (g, defaultG = null) =>
        (g & G.TOP) ? G.TOP :
        (g & G.BOTTOM) ? G.BOTTOM :
        (g & G.CENTER) ? G.CENTER :
        defaultG ? defaultG : G.TOP
};
export {G as LayoutGravity};
