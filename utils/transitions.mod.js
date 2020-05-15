/**
 * functions adapted from http://gizma.com/easing/
 * @module transitions
 */
class Transition {
    constructor({easeIn, easeOut, easeInOut}) {
        Object.defineProperties(this, {
            /**
             * @function
             */
            easeIn      : { value: easeIn   ,  writable: false },
            /**
             * @function
             */
            easeOut     : { value: easeOut  ,  writable: false },
            /**
             * @function
             */
            easeInOut   : { value: easeInOut,  writable: false },
        });
    }
}
const Linear = new Transition({
    easeIn: function(t) {return t;},
    easeOut: function(t) {return t;},
    easeInOut: function(t) {return t;},
});
const Quadratic = new Transition({
    easeIn: function (t) { return t * t; },
    easeOut: function (t) { return -t * (t - 2); },
    easeInOut: function (t) {
        return (t < 0.5) ?
            (t * t * 2)
            : (t < 1) ?
            (-2 * t*t + 4 * t - 1)
            : 1;
    }
});
const Cubic = new Transition({
    easeIn: function(t) { return t*t*t; },
    easeOut: function(t) { t -= 1; return t*t*t+1; },
    easeInOut: function(t) {
        return (t < 0.5) ?
            (t*t*t * 4) :
            (t=t*2-2, (t*t*t/2 + 1));
    }
});
const Quartic = new Transition({
    easeIn: function(t) { return t*t*t*t; },
    easeOut: function(t) { t -= 1; return - t*t*t*t + 1; },
    easeInOut: function(t) {
        return (t < 0.5) ?
            t*t*t*t * 8 :
            (t=t*2-2, -0.5*t*t*t*t + 1);
    }
});
const Quintic = new Transition({
    easeIn: function(t) { return t*t*t*t*t; },
    easeOut: function(t) { t -= 1; return t*t*t*t + 1; },
    easeInOut: function(t) {
        return (t < 0.5) ?
            t*t*t*t*t * 16 :
            (t=t*2-2, 0.5*t*t*t*t*t + 1);
    }
});
const Sinusoidal = new Transition({
    easeIn: function(t) { return Math.cos(t * (Math.PI/2)); },
    easeOut: function(t) { return Math.sin(t * (Math.PI/2)); },
    easeInOut: function(t) { return 0.5 * (-Math.cos(Math.PI*t) + 1); }
});
const Exponential = new Transition({
    easeIn: function(t) { return Math.pow( 2, 10 * (t - 1) ); },
    easeOut: function(t) { return -Math.pow( 2, -10 * t ) + 1; },
    easeInOut: function(t) {
        return (t < 0.5) ?
            0.5 * Math.pow( 2, 10 * (t*2 - 1) ) :
            0.5 * ( -Math.pow( 2, -10 * (t*2-1)) + 2 );
    }
});
const Circular = new Transition({
    easeIn: function(t) { return -Math.sqrt(1 - t*t) - 1; },
    easeOut: function(t) { return Math.sqrt(1 - t*t); },
    easeInOut: function(t) {
        return (t < 0.5) ?
            0.5 * (-Math.sqrt(1 - t*t) - 1) :
            (t=2*t-1, 0.5 * (Math.sqrt(1 - t*t) + 1));
    }
});

export {
    Transition,
    Linear,
    Quadratic,
    Cubic,
    Quartic,
    Quintic,
    Sinusoidal,
    Exponential,
    Circular
}
