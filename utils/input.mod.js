/**
 * Created by Loic France on 12/20/2016.
 */
import Vec2 from "../geometry2d/Vec2.mod.js"
import {objectMatch, objectsEqual} from "./tools.mod.js"
/**
 * @module utils/input
 */
//######################################################################################################################
//#                                             enumerations and callbacks                                             #
//######################################################################################################################
/**
 * @callback keyboardCallback
 * @param {Key|number} keyCode
 * @param {KeyState} keyState
 * @param {InputManager} inputManager
 * @returns {void|boolean} prevent default behavior if returned value interpreted as <code>true</code>
 */
/**
 * @callback mouseCallback
 * @param {MouseEvent} event
 * @param {MouseEvents} evtType
 * @param {MouseButton} button
 * @param {Vec2} position
 * @returns {void|boolean} prevent default behavior.
 */
/**
 * @callback gamepadCallback
 * @param {GamepadEvent} event
 * @param {Gamepad} gamepad
 */
/**
 * @callback InputManager.focusCallback
 * @param {boolean} hasFocus
 */
/**
 * @callback KeyMap.keyMapCallback
 * @param {*} action - action associated to the event's key
 * @param {KeyState} keyState
 * @returns {void|boolean} prevent default key behavior
 */
/**
 * @namespace input
 */
/**
 * @enum {number}
 * @readonly
 */
const KeyState = { RELEASED: 0, PRESSED:1 };
/**
 * @enum {number}
 * @readonly
 */
const Key = {
	BACKSPACE: 8, TAB: 9, ENTER: 13, SHIFT: 16, CTRL: 17,  ALT: 18,  CAPS_LOCK: 20,  ESCAPE: 27, SPACE: 32,	PAGE_UP: 33,
	PAGE_DOWN: 34, END: 35, HOME: 36, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, PRINT_SCR: 44,	INSERT: 45, DELETE: 46,
	ZERO: 48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57, A: 65, B: 66,
	C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82,
	S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90, LEFT_WIN: 91, RIGHT_WIN: 92, SELECT: 93,	NUM_0: 96,
	NUM_1: 97, NUM_2: 98, NUM_3: 99, NUM_4: 100, NUM_5: 101, NUM_6: 102, NUM_7: 103, NUM_8: 104, NUM_9: 105,
	MULTIPLY: 106, ADD: 107, SUBTRACT: 109, DECIMAL_POINT: 110, DIVIDE: 111, F1: 112, F2: 113, F3: 114, F4: 115,
	F5: 116, F6: 117, F7: 118, F8: 119, F9: 120, F10: 121, F11: 122, F12: 123, NUM_LOCK: 144, SCROLL_LOCK: 145,
	SEMI_COLON: 186, EQUAL: 187, COMMA: 188, DASH: 189, PERIOD: 190, FORWARD_SLASH: 191, GRAVE_ACCENT: 192,
	OPEN_BRACKET: 219, BACK_SLASH: 220, CLOSE_BRACKET: 221, SINGLE_QUOTE: 222, FN: 255,
	number: 256
};
/**
 * @enum {string}
 * @readonly
 */
const MouseEvents = {
	UP: 'mouseup', DOWN: 'mousedown', CLICK: 'click', DBCLICK: 'dbclick',
	MOVE: 'mousemove', ENTER: 'mouseover', EXIT: 'mouseout', CTX_MENU: 'contextmenu',
	WHEEL: 'wheel', DRAG: 'drag'
};
/**
 * @enum {number}
 * @readonly
 */
const MouseButton = {
	UNKNOWN: 0, LEFT: 1, RIGHT: 2, MIDDLE: 4, BACK: 8, FORWARD: 16,
	isPressed(evt, button) {
		return evt.buttons ? (evt.buttons & button) !== 0 : false;
	},
	/**
	 *
	 * @param evt
	 * @returns {number} one of {@link MouseButton.LEFT}, {@link MouseButton.RIGHT}, {@link MouseButton.MIDDLE},
	 * 			{@link MouseButton.BACK}, {@link MouseButton.FORWARD}, or {@link MouseButton.UNKNOWN}
	 * 			if the attribute {@link MouseEvent#button} is not defined for the event
	 */
	getEventSource(evt) {
		switch(evt.button) {
			case 0 : return MouseButton.LEFT;
			case 1 : return MouseButton.MIDDLE;
			case 2 : return MouseButton.RIGHT;
			case 3 : return MouseButton.BACK;
			case 4 : return MouseButton.FORWARD;
			default : return MouseButton.UNKNOWN
		}
	}
};
const GamepadEvents = {
	CONNECTED: 'gamepadconnected', DISCONNECTED: 'gamepaddisconnected'
};

//######################################################################################################################
//#                                                    InputManager                                                    #
//######################################################################################################################

//___________________________________________________private constants__________________________________________________
const KEYS_NUMBER = Key.number;
const KEY_STATE = KeyState;
const MOUSE_BTN = MouseButton;

const modifierKeys = [
	Key.SHIFT,
	Key.CTRL,
	Key.ALT,
	Key.LEFT_WIN,
	Key.RIGHT_WIN
];

function isModifierKey(key) {
	switch(key) {
		case Key.SHIFT :
		case Key.CTRL :
		case Key.ALT :
		case Key.LEFT_WIN :
		case Key.RIGHT_WIN :
			return true;
		default:
			return false;
	}
}

function onKeyEvt(keyStates, callbacks, state, evt) {
	if (keyStates[evt.keyCode] !== state) {
		keyStates[evt.keyCode] = state;
		let len = callbacks.length;
		for (let i = 0; i < len; i++)
			if (callbacks[i](evt.keyCode, state, this)) evt.preventDefault();
	}
}
function actionFilter(modifierKeys, action) {
	if (action.modifierKeys.length === modifierKeys.length) {
		for (let i = 0; i < modifierKeys.length; i++) {
			if (action.modifierKeys.indexOf(modifierKeys[i]) < 0)
				return false;
		}
		return true;
	} else {
		return false;
	}
}

/**
 * @class InputManager
 * @classdesc a class managing keyboard and mouse events, related to a particular HTMLElement
 */
class InputManager {
	/**
	 * @constructor
	 * @param {HTMLElement} element
	 */
	constructor(element) {
		/**
		 * @name InputManager#element
		 * @type {HTMLElement}
		 */
		this.element = element;

		/**
		 *
		 * @type {Uint8Array|KeyState[]}
		 */
		let keyStates = new Uint8Array(KEYS_NUMBER);
		for (let i = KEYS_NUMBER - 1; i >= 0; i--) {
			keyStates[i] = KEY_STATE.RELEASED;
		}
		/**
		 * @name InputManager~_keyboardCallbacks
		 * @type {Array.<keyboardCallback>}
		 * @private
		 */
		let keyboardCallbacks = [];
//____________________________________________________private methods___________________________________________________
		const onKeyUp = onKeyEvt.bind(this, keyStates, keyboardCallbacks, KEY_STATE.RELEASED);
		const onKeyDown = onKeyEvt.bind(this, keyStates, keyboardCallbacks, KEY_STATE.PRESSED);

		const onGamepadEvt = (callback, evtType, evt) => {
			callback(evtType, evt.gamepad);
		};
//____________________________________________________public methods____________________________________________________
//* * * * * * * * * * * * * * * * * * * * * * * * * * * *keyboard* * * * * * * * * * * * * * * * * * * * * * * * * * * *
		/**
		 * enable or disable the keyboard listener in capturing on bubbling mode, depending <!--
		 * -->on the 2nd parameter value
		 * @function
		 * @name InputManager#enableKeyboardListener
		 * @param {boolean} enable
		 * @param {boolean} [capturingMode=true]
		 */
		this.enableKeyboardListener = function (enable, capturingMode = true) {
			if (enable) {
				if (this.element !== document && !this.element.hasAttribute('tabindex')) {
					this.element.setAttribute('tabindex', -1); // so it can receive keyboard events
				}
				this.element.addEventListener('keydown', onKeyDown, capturingMode);
				this.element.addEventListener('keyup', onKeyUp, capturingMode);
			} else {
				this.element.removeEventListener('keydown', onKeyDown);
				this.element.removeEventListener('keyup', onKeyUp);
			}
		};
		/**
		 * adds a keyboard events callback. don't forget to launch the capture of keyboard events by calling <!--
		 * -->{@link InputManager#enableKeyboardListener} method
		 * @function
		 * @name InputManager#addKeyCallback
		 * @param {keyboardCallback} callback
		 */
		this.addKeyCallback = (callback) => {
			keyboardCallbacks.push(callback);
		};
		/**
		 * removes a keyboard events callback.
		 * @function
		 * @name InputManager#removeKeyCallback
		 * @param {keyboardCallback} callback
		 */
		this.removeKeyCallback = (callback) => {
			keyboardCallbacks.splice(keyboardCallbacks.indexOf(callback), 1);
		};
		/**
		 * returns the state of the key
		 * @function
		 * @name InputManager#getKeyState
		 * @param {number} keyCode
		 * @returns {KeyState} key state : one of <!--
		 * -->{@link KeyState.RELEASED|RELEASED} and <!--
		 * -->{@link KeyState.PRESSED|PRESSED}
		 */
		this.getKeyState = keyCode => keyStates[keyCode];

		/**
		 * returns the list of pressed modifier keys
		 * @function
		 * @name InputManager#getActiveModifiers
		 * @returns {(Key|number)[]}
		 */
		this.getActiveModifiers = ()=> {
			return modifierKeys.filter(k=>this.getKeyState(k) === KeyState.PRESSED);
		};
//* * * * * * * * * * * * * * * * * * * * * * * * * * * * mouse* * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		/**
		 * returns the position of the mouse relative to the element bounding rectangle
		 * @param {MouseEvent} evt
		 * @returns {Vec2}
		 */
		this.getRelativeEvtPos = evt => {
			let elmtRect = this.element.getBoundingClientRect();
			return new Vec2(
				evt.pageX - elmtRect.left,
				evt.pageY - elmtRect.top);
		};
		/**
		 * @function
		 * @name InputManager#addEventsCallback
		 * @param {string[]} events
		 * @param {EventListener} callback
		 * @param {boolean | AddEventListenerOptions} options
		 */
		this.addEventsCallback = function (events, callback, options = undefined) {
			let i = events.length;
			while(i--) {
				this.element.addEventListener(events[i], callback, options);
			}
		};
		/**
		 * @function
		 * @name InputManager#removeEventsCallback
		 * @param {string[]} events
		 * @param {EventListener} callback
		 * @param {boolean| AddEventListenerOptions}
		 */
		this.removeEventsCallback = function(events, callback, options = undefined) {
			let i = events.length;
			while(i--) {
				this.element.removeEventListener(events[i], callback, options);
			}
		}
//* * * * * * * * * * * * * * * * * * * * * * * * * * * *gamepad * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		/**
		 *
		 * @param {gamepadCallback} callback
		 * @param {number} autoUpdatePeriod
		 */
		this.setGamePadEventsCallback = function (callback, autoUpdatePeriod=1/60) {
			if(callback) {
				for (const evtType of GamepadEvents) {
					if(GamepadEvents.hasOwnProperty(evtType)) {
						const e = GamepadEvents[evtType];
						this.element[e] = onGamepadEvt.bind(this, callback, e);
					}
				}
			} else {
                for (const evtType of GamepadEvents) {
                    if (GamepadEvents.hasOwnProperty(evtType)) {
                        this.element[GamepadEvents[evtType]] = null;
                    }
                }
			}
		};
//* * * * * * * * * * * * * * * * * * * * * * focus, pointer lock, fullscreen* * * * * * * * * * * * * * * * * * * * * *
		/**
		 * @function
		 * @name InputManager#setFocusCallback
		 * @param {focusCallback} callback
		 */
		this.setFocusCallback = (callback) => {
			if (callback) {
				this.element.onfocus = () => callback(true);
				this.element.onblur = () => callback(false);
			} else {
				this.element.onfocus = null;
				this.element.onblur = null;
			}
		};
		/**
		 * requests pointer lock
		 * @function
		 * @name InputManager#pointerLock
		 * @param eventListener
		 */
		this.pointerLock = (eventListener) => {
			if (eventListener) {
				if (eventListener.pointerLockChange) {
					document.addEventListener('pointerlockchange', eventListener.pointerLockChange, false);
					document.addEventListener('mozpointerlockchange', eventListener.pointerLockChange, false);
					document.addEventListener('webkitpointerlockchange', eventListener.pointerLockChange, false);
				}
				if (eventListener.pointerLockError) {
					document.addEventListener('pointerlockerror', eventListener.pointerLockError, false);
					document.addEventListener('mozpointerlockerror', eventListener.pointerLockError, false);
					document.addEventListener('webkitpointerlockerror', eventListener.pointerLockError, false);
				}
			}
			if (document.webkitFullscreenElement === this.element ||
				document.mozFullscreenElement === this.element ||
				document.fullscreenElement === this.element) {
				this.element.requestPointerLock = this.element.requestPointerLock ||
					this.element.mozRequestPointerLock ||
					this.element.webkitRequestPointerLock;
				this.element.requestPointerLock();
			}
		};
		/**
		 * requests full screen
		 * @function
		 * @name InputManager#fullScreen
		 * @param callback
		 */
		this.fullScreen = (callback) => {
			element.requestFullscreen = element.requestFullscreen ||
				element.mozRequestFullscreen ||
				element.mozRequestFullScreen || // 'S' instead of 's' in the old API.
				element.webkitRequestFullscreen;
			element.requestFullscreen();
			if (callback) {
				document.addEventListener('fullscreenchange', callback, false);
				document.addEventListener('mozfullscreenchange', callback, false);
				document.addEventListener('webkitfullscreenchange', callback, false);
			}
		};
	}
}
//######################################################################################################################
//#                                                       KeyMap                                                       #
//######################################################################################################################

const keyEventListenerSym = Symbol();
const callbackSym = Symbol();
const mappingSym = Symbol();

/**
 * @class KeyMap
 * @classdesc a useful class to use with {@link InputManager|InputManager} class to make <!--
 * -->easy-to-use keymaps. call {@link KeyMap#apply|apply} method to use it, <!--
 * -->{@link KeyMap#setAction|setAction} to add mappings, and <!--
 * -->{@link KeyMap#setCallback|setCallback} to add a callback method called when event occur on <!--
 * -->selected keys.
 */
class KeyMap {
	[keyEventListenerSym] = ((evt)=> {
		if(this[callbackSym]) {
			let action = this.getAction(evt);
			if(action)
				return this[callbackSym](action, evt) || false;
			else return false;
		}
	}).bind(this);

	/**
	 * @type {function(action:*, evt:KeyboardEvent):(boolean?)}
	 */
	[callbackSym] = undefined;
	[mappingSym] = new Map();

    /**
	 * @param {Map} mapping - action -> keys dictionary
     * @param {function(action:*, evt:KeyboardEvent):(boolean|void)} callback
     */
	constructor({ mapping = undefined, callback = undefined}) {

		if (mapping) {
			for(const [key, evtFilter] of mapping) {
				if (Array.isArray(evtFilter)) {
					for (let i = 0; i < evtFilter.length; i++)
						this.setAction(evtFilter[i], key);
				} else this.setAction(evtFilter, key);
			}
		}
		if (callback != null && callback instanceof Function) {
			this.setCallback(callback)
		}
	}

	/**
	 * @param {function(action:*, evt:KeyboardEvent):(boolean|void)} callback
	 */
	setCallback(callback) { this[callbackSym] = callback; }

	/**
	 * @param {HTMLElement} element
	 * @param {string} events
	 */
	enable(element, events, options) {
		if(Array.isArray(events)) {
			for(let i=0; i<events.length; i++) {
				element.addEventListener(events[i], this[keyEventListenerSym], options);
			}
		} else element.addEventListener(events, this[keyEventListenerSym], options);
	};

	/**
	 * @param {HTMLElement} element
	 * @param {string} events
	 */
	disable(element, events, options) {
		if(Array.isArray(events)) {
			for(let i=0; i<events.length; i++) {
				element.removeEventListener(events[i], this[keyEventListenerSym], options);
			}
		} else element.removeEventListener(events, this[keyEventListenerSym], options);
	};

	/**
	 * @function
	 * @name KeyMap#setAction
	 * @param {Object} keyEventFilter
	 * @param {string} keyEventFilter.code?
	 * @param {string} keyEventFilter.key?
	 * @param {*?} action
	 */
	setAction = (keyEventFilter, action = undefined)=> {
		if(!keyEventFilter.code && !keyEventFilter.key)
			throw Error("one of the attrributes 'code' or 'key' must be defined");

		const id = keyEventFilter.hasOwnProperty('code') ? keyEventFilter.code
				: /^a-z$/.test(keyEventFilter.key) ? keyEventFilter.key.toUpperCase()
				: keyEventFilter.key;
		const actions = this[mappingSym].get(id);

		if (actions === undefined) {
			if (action)
				this[mappingSym].set(id, [{keyEventFilter: keyEventFilter, action: action}]);
		}
		else {
			let alreadyThere = false;
			for(let i = 0; i < actions.length; i++) {
				if(objectsEqual(actions[i].keyEventFilter, keyEventFilter)) {
					if(action)
						actions[i].action = action;
					else
						actions.splice(i, 1);
					break;
				}
			}
			if(action)
				actions.push({keyEventFilter: keyEventFilter, action: action});
		}
	}

	/**
	 * @function
	 * @name KeyMap#getAction
	 * @param {KeyboardEvent} evt
	 * @returns {*|null} action associated to the keyboard event
	 */
	getAction(evt) {
		let key = evt.code, modifyKey = false;
		let actions = this[mappingSym].get(key);
		if(!actions) {
			const key = /^[a-z]$/.test(evt.key) ? evt.key.toUpperCase() : evt.key;
			if(evt.key !== key)
				modifyKey = true;
			actions = this[mappingSym].get(key);
		}

		if(actions) {
			let maxAttrLen = 0;
			let action;
			for(let i=0; i<actions.length; i++) {
				const attrLen = Object.keys(actions[i].keyEventFilter).length
				const filter = actions[i].keyEventFilter;
				if(modifyKey)
					filter.key = evt.key;
				if(attrLen > maxAttrLen && objectMatch(evt, filter)) {
					maxAttrLen = attrLen;
					action = actions[i].action;
				}
				if(modifyKey)
					filter.key = key;
			}
			if(maxAttrLen > 0) {
				return action;
			}
		}
		return undefined;
	}
}
//TODO add gamepad support

export {
	KeyState,
	Key,
	MouseEvents,
	MouseButton,
	InputManager,
	KeyMap
};
