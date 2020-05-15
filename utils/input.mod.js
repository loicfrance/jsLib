/**
 * Created by Loic France on 12/20/2016.
 */
import Vec2 from "../geometry2d/Vec2.mod.js"
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
				for (let evtType in GamepadEvents) {
					if(GamepadEvents.hasOwnProperty(evtType)) {
						const e = GamepadEvents[evtType];
						this.element[e] = onGamepadEvt.bind(this, callback, e);
					}
				}
			} else {
                for (let evtType in GamepadEvents) {
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
/**
 * @class KeyMap
 * @classdesc a useful class to use with {@link InputManager|InputManager} class to make <!--
 * -->easy-to-use keymaps. call {@link KeyMap#apply|apply} method to use it, <!--
 * -->{@link KeyMap#setAction|setAction} to add mappings, and <!--
 * -->{@link KeyMap#setCallback|setCallback} to add a callback method called when event occur on <!--
 * -->selected keys.
 */
class KeyMap {

    /**
	 * @param {{keys: Key|Key[]|number|number[]?, action:*}[]} mapping
     * @param {KeyMap.keyMapCallback} callback
     */
	constructor({ mapping = null, callback = null}) {
		/**
		 *
		 * @type {{key: Key|number, modifiers: Key|Key[]|number|number[]?, action:*}[]}
		 */
		let actions = [];
		let cb = undefined;
//--------------------------------------------------- private methods --------------------------------------------------
		const inputCallback = (keyCode, keyState, inputManager)=> {
			if (cb) {
				const modifiers = inputManager.getActiveModifiers();
				if(modifiers.indexOf(keyCode) >= 0) {
					keyCode = modifiers.unshift();
				}
				let a = this.getAction(keyCode, modifiers);

				return (a && cb(a, keyState)) || false;
			}
		};
		const getActionIndex = (key, modifiers)=> {
			if (!Array.isArray(modifiers))
				modifiers = [modifiers];

			modifiers = modifiers.sort((a,b)=>a-b);

			for(let i=0; i< actions.length; i++) {
				if(key === actions[i].key) {
					if (modifiers.length === actions[i].modifiers.length) {
						let found = true;
						for(let j=0; j<modifiers.length; j++) {
							if(modifiers[j] !== actions[i].modifiers[j]) {
								found = false;
								break;
							}
						}
						if(found) {
							return i;
						}
					}
				}
			}
			return -1;
		};
//--------------------------------------------------- public methods ---------------------------------------------------
		/**
		 * @function
		 * @name KeyMap#setAction
		 * @param {Key|Key[]|number|number[]} keys
		 * @param {*?} action
		 */
		this.setAction = (keys, action = null)=> {
			if (!Array.isArray(keys))
				keys = [keys];

			const mainKeys = keys.filter(k=>!isModifierKey(k));
			const modifierKeys = keys.filter(k=>isModifierKey(k)).sort((k1,k2)=>k1-k2);
			if(mainKeys.length > 1) {
				console.error("cannot use multiple primary keys at the same time :", mainKeys);
				return;
			}
			if(mainKeys.length === 0)
				mainKeys.push(modifierKeys.unshift());

			const key = mainKeys[0];
			let found = false;
			const newAction = {key: key, modifiers: modifierKeys, action: action};
			const idx = getActionIndex(key, modifierKeys);

			if (action === null || action === undefined) {
				if(idx >= 0) actions.splice(idx, 1);
			} else {
				if(idx >= 0) actions[idx] = newAction;
				else actions.push(newAction);
			}
		};
		/**
		 * @function
		 * @name KeyMap#getAction
		 * @param {Key|number} key
		 * @param {Key|Key[]|number|number[]} modifiers
		 * @returns {*|null} action associated to the specified key with specified modifiers
		 */
		this.getAction = (key, modifiers = []) => {
			const idx = getActionIndex(key, modifiers);
			return (idx >= 0)
				? actions[idx].action
				: null;
		};
		/**
		 * returns whether or not at least one key associated to the specified action is pressed
		 * @function
		 * @name KeyMap#isKeyPressed
		 * @param {InputManager} inputManager
		 * @param {*} action
		 * @returns {boolean} true if at least one key associated to the specified action is pressed
		 */
		this.isKeyPressed = (inputManager, action) => {
			for(let i=0; i < actions.length; i++) {
				if(actions[i].action === action) {
					let ok = (inputManager.getKeyState(actions[i].key) === KeyState.PRESSED);
					let j = 0;
					while(ok && j < actions[i].modifiers.length) {
						ok = (inputManager.getKeyState(actions[i].modifiers[j]) === KeyState.PRESSED);
						j++;
					}
					if(ok) return true;
				}
			}
			return false;
		};
		/**
		 * returns the set of keys associated with the specified action.
		 * @function
		 * @name KeyMap#getKeys
		 * @param {*} action
		 * @returns {(Key[]|number[])[]} key codes
		 */
		this.getKeys = action => {
			const result = [];
			for(let i=0; i< actions.length; i++) {
				if(actions[i].action === action) {
					const keys = [action[i].key];
					keys.push(action[i].modifiers);
					result.push(keys);
				}
			}
			return result;
		};
		/**
		 * sets the callback function which will be called when a useful keyboard event happens.
		 * @function
		 * @name KeyMap#setCallback
		 * @param {KeyMap.keyMapCallback} callback
		 */
		this.setCallback = callback => { cb = callback; };
		/**
		 * allow the instance to catch keyboard events by adding a callback function using the parameter's <!--
		 * -->{@link InputManager#addKeyCallback|addKeyCallback} method.
		 * @function
		 * @name KeyMap#enable
		 * @param {InputManager} inputManager
		 */
		this.enable = function(inputManager) {
			inputManager.addKeyCallback(inputCallback);
			inputManager.enableKeyboardListener(true);
		};
		/**
		 * removes the callback function from the keyboard listener of the parameter.
		 * @function
		 * @name KeyMap#disable
		 * @param {InputManager} inputManager
		 */
		this.disable = function(inputManager) {
			inputManager.removeKeyCallback(inputCallback);
			inputManager.enableKeyboardListener(false);
		};

		if(mapping != null) {
			for (let i=0; i<mapping.length; i++) {
				this.setAction(mapping[i].keys, mapping[i].action);
			}
		}
		if(callback != null && callback instanceof Function) {
			this.setCallback(callback)
		}
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
