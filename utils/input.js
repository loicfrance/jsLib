/**
 * Created by rfrance on 12/20/2016.
 */
window.utils = window.utils || {};
//######################################################################################################################
//#                                             enumerations and callbacks                                             #
//######################################################################################################################
/**
 * @callback utils.input.keyboardCallback
 * @param {utils.input.Key|number} keyCode
 * @param {utils.input.KeyState|number} keyState
 * @returns {void|boolean} prevent default behavior
 */
/**
 * @callback utils.input.mouseCallback
 * @param {MouseEvent} event
 * @param {utils.input.MouseEvent} eventType
 * @param {utils.input.MouseButton} button
 * @param {utils.geometry2d.Vec2} position
 * @returns {void|boolean} prevent default behavior.
 */
/**
 * @callback utils.input.InputManager.focusCallback
 * @param {boolean} hasFocus
 */
/**
 * @callback utils.input.KeyMap.keyMapCallback
 * @param {*} action associated to the event's key
 * @param {utils.input.InputManager.KeyState} keyState
 * @returns {void|boolean} prevent default key behavior
 */
/**
 * @memberOf utils
 * @namespace input
 */
utils.input = {};
/**
 * @memberOf utils.input
 * @enum {number}
 * @readonly
 */
utils.input.KeyState = { RELEASED: 0, PRESSED:1 };
/**
 * @memberOf utils.input
 * @enum {number}
 * @readonly
 */
utils.input.Key = {
	BACKSPACE: 8, TAB: 9, ENTER: 13, SHIFT: 16, CTRL: 17,  ALT: 18,  CAPS_LOCK: 20,  ESCAPE: 27, SPACE: 32,	PAGE_UP: 33,
	PAGE_DOWN: 34, END: 35, HOME: 36, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, PRINT_SCR: 44,	INSERT: 45, DELETE: 46,
	ZERO: 48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57, A: 65, B: 66,
	C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82,
	S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90, LEFT_WIN: 91, RIGH_WIN: 92, SELECT: 93,	NUM_0: 96,
	NUM_1: 97, NUM_2: 98, NUM_3: 99, NUM_4: 100, NUM_5: 101, NUM_6: 102, NUM_7: 103, NUM_8: 104, NUM_9: 105,
	MULTIPLY: 106, ADD: 107, SUBTRACT: 109, DECIMAL_POINT: 110, DIVIDE: 111, F1: 112, F2: 113, F3: 114, F4: 115,
	F5: 116, F6: 117, F7: 118, F8: 119, F9: 120, F10: 121, F11: 122, F12: 123, NUM_LOCK: 144, SCROLL_LOCK: 145,
	SEMI_COLON: 186, EQUAL: 187, COMMA: 188, DASH: 189, PERIOD: 190, FORWARD_SLASH: 191, GRAVE_ACCENT: 192,
	OPEN_BRACKET: 219, BACK_SLASH: 220, CLOSE_BRACKET: 221, SINGLE_QUOTE: 222, FN: 255,
	number: 256
};
/**
 * @memberOf utils.input
 * @enum {string}
 * @readonly
 */
utils.input.MouseEvent = {
	UP: 'onmouseup', DOWN: 'onmousedown', CLICK: 'onclick', DBCLICK: 'ondbclick',
	MOVE: 'onmousemove', ENTER: 'onmouseover', EXIT: 'onmouseout', CTX_MENU: 'contextmenu'
};
/**
 * @memberOf utils.input
 * @enum {number}
 * @readonly
 */
utils.input.MouseButton = { UNKNOWN: 0, LEFT: 1, MIDDLE: 2, RIGHT: 3 }

//######################################################################################################################
//#                                                    InputManager                                                    #
//######################################################################################################################
utils.input.InputManager = (function() {
//___________________________________________________private constants__________________________________________________
	const KEYS_NUMBER = utils.input.Key.number;
	const KEY_STATE = utils.input.KeyState;
	const MOUSE_BTN = utils.input.MouseButton;

	const fixMouseWhich = evt => {
		if(!evt.which && evt.button) {
			evt.which =
				((evt.button % 8 - evt.button % 4)===4) ? MOUSE_BTN.MIDDLE :
				((evt.button % 4 - evt.button % 2)===2) ? MOUSE_BTN.RIGHT :
				((evt.button % 2				 )===1) ? MOUSE_BTN.LEFT :
				MOUSE_BTN.UNKNOWN;
		}
	};
	const onKeyEvt = (keyStates, callbacks, state, evt)=> {
		if (keyStates[evt.keyCode] !== state) {
			keyStates[evt.keyCode] = state;
			let len = callbacks.length;
			for (let i = 0; i < len; i++)
				if (callbacks[i](evt.keyCode, state))
					evt.preventDefault();
		}
	}
	/**
	 * @class utils.input.InputManager
	 * @memberOf utils.input
	 * @classdesc a class managing keyboard and mouse events, related to a particular HTMLElement
	 */
	class InputManager {
		/**
		 * @constructor
		 * @param {HTMLElement} element
		 */
		constructor(element) {
			/**
			 * @name utils.input.InputManager#element
			 * @type {HTMLElement}
			 */
			this.element = element;

			let keyStates= new Uint8Array(KEYS_NUMBER);
			for (let i = KEYS_NUMBER - 1; i >= 0; i--) {
				keyStates[i] = KEY_STATE.RELEASED;
			}
			/**
			 * @name utils.input.InputManager~_keyboardCallbacks
			 * @type {Array.<utils.input.keyboardCallback>}
			 * @private
			 */
			let keyboardCallbacks = [];
//____________________________________________________private methods___________________________________________________
			const onKeyUp   = onKeyEvt.bind(this, keyStates, keyboardCallbacks, KEY_STATE.RELEASED);
			const onKeyDown = onKeyEvt.bind(this, keyStates, keyboardCallbacks, KEY_STATE.PRESSED);
			const getVec = evt => {
				let elmtRect = this.element.getBoundingClientRect();
				return new utils.geometry2d.Vec2(
					evt.pageX - elmtRect.left,
					evt.pageY - elmtRect.top);
			}
			const onMouseEvt = (callback, evtType, evt) => {
				fixMouseWhich(evt);
				return callback(evt, evtType, evt.which, getVec(evt));
			}
//____________________________________________________public methods____________________________________________________
//* * * * * * * * * * * * * * * * * * * * * * * * * * * *keyboard* * * * * * * * * * * * * * * * * * * * * * * * * * * *
			/**
			 * enable or disable the keyboard listener in capturing on bubbling mode, depending <!--
			 * -->on the 2nd parameter value
			 * @function
			 * @name utils.input.InputManager#enableKeyboardListener
			 * @param {boolean} enable
			 * @param {boolean} [capturingMode=true]
			 */
			this.enableKeyboardListener = function(enable, capturingMode = true) {
				if(enable) {
					if(this.element != document && !this.element.hasAttribute('tabindex')) {
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
			 * -->{@link utils.input.InputManager#enableKeyboardListener} method
			 * @function
			 * @name utils.input.InputManager#addKeyCallback
			 * @param {utils.input.keyboardCallback} callback
			 */
			this.addKeyCallback = (callback)=> {
				keyboardCallbacks.push(callback);
			};
			/**
			 * removes a keyboard events callback.
			 * @function
			 * @name utils.input.InputManager#removeKeyCallback
			 * @param {utils.input.keyboardCallback} callback
			 */
			this.removeKeyCallback = (callback)=> {
				keyboardCallbacks.remove(callback);
			};
			/**
			 * returns the state of the key
			 * @function
			 * @name utils.input.InputManager#getKeyState
			 * @param {number} keyCode
			 * @returns {utils.input.KeyState} key state : one of <!--
			 * -->{@link utils.input.KeyState.RELEASED|RELEASED} and <!--
			 * -->{@link utils.input.KeyState.PRESSED|PRESSED}
			 */
			this.getKeyState = keyCode=> keyStates[keyCode];
//* * * * * * * * * * * * * * * * * * * * * * * * * * * * mouse* * * * * * * * * * * * * * * * * * * * * * * * * * * * *
			/**
			 * @function
			 * @name utils.input.InputManager#setMouseEventsCallback
			 * @param {utils.input.mouseCallback}callback
			 */
			this.setMouseEventsCallback = function(callback) {
				if(callback) {
					let e;
					for(let evtType in utils.input.MouseEvent) {
						if(utils.input.MouseEvent.hasOwnProperty(evtType)) {
							e = utils.input.MouseEvent[evtType];
							this.element[e] = onMouseEvt.bind(this, callback, e);
						}
					}
				} else {
					for(let evtType in utils.input.MouseEvent) {
						if(utils.input.MouseEvent.hasOwnProperty(evtType)) {
							this.element[utils.input.MouseEvent[evtType]] = null;
						}
					}
				}
			};
//* * * * * * * * * * * * * * * * * * * * * * focus, pointer lock, fullscreen* * * * * * * * * * * * * * * * * * * * * *
			/**
			 * @function
			 * @name utils.input.InputManager#setFocusCallback
			 * @param {utils.input.focusCallback} callback
			 */
			this.setFocusCallback = (callback)=> {
				if(callback) {
					this.element.onfocus = _ => callback(true);
					this.element.onblur = _ => callback(false);
				} else {
					this.element.onfocus = null;
					this.element.onblur = null;
				}
			};
			/**
			 * requests pointer lock
			 * @function
			 * @name utils.input.InputManager#pointerLock
			 * @param eventListener
			 */
			this.pointerLock = (eventListener) => {
				if(eventListener) {
					if(eventListener.pointerLockChange) {
						document.addEventListener('pointerlockchange', eventListener.pointerLockChange, false);
						document.addEventListener('mozpointerlockchange', eventListener.pointerLockChange, false);
						document.addEventListener('webkitpointerlockchange', eventListener.pointerLockChange, false);
					}
					if(eventListener.pointerLockError) {
						document.addEventListener('pointerlockerror', eventListener.pointerLockError, false);
						document.addEventListener('mozpointerlockerror', eventListener.pointerLockError, false);
						document.addEventListener('webkitpointerlockerror', eventListener.pointerLockError, false);
					}
				}
				if(document.webkitFullscreenElement === this.element ||
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
			 * @name utils.input.InputManager#fullScreen
			 * @param callback
			 */
			this.fullScreen = (callback)=> {
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
    return InputManager;
})();
//######################################################################################################################
//#                                                       KeyMap                                                       #
//######################################################################################################################
utils.input.KeyMap = (function() {
	/**
	 * @memberOf utils.input
	 * @class utils.input.KeyMap
	 * @classdesc a useful class to use with {@link utils.input.InputManager|InputManager} class to make <!--
	 * -->easy-to-use keymaps. call {@link utils.input.KeyMap#apply|apply} method to use it, <!--
	 * -->{@link utils.input.KeyMap#setAction|setAction} to add mappings, and <!--
	 * -->{@link utils.input.KeyMap#setCallback|setCallback} to add a callback method called when event occur on <!--
	 * -->selected keys.
	 */
    class KeyMap {
		/**
		 * @constructor
		 */
		constructor() {
			let actions = new Array(utils.input.Key.number);
			let cb = undefined;
//--------------------------------------------------- private methods --------------------------------------------------
			const callback = (keyCode, keyState)=> {
				if (cb) {
					let a = this.getAction(keyCode);
					return (a && cb(a, keyState)) || false;
				}
			};
//--------------------------------------------------- public methods ---------------------------------------------------
			/**
			 * @function
			 * @name utils.input.KeyMap#setAction
			 * @param {utils.input.Key|utils.input.Key[]|number|number[]} keyCode
			 * @param {number|string|*} action
			 */
			this.setAction = (keyCode, action)=> {
				if(keyCode.length) {
					for(let i=0; i<keyCode.length; i++) {
						this.setAction(keyCode[i], action);
					}
				}
				else {
					if(action == undefined) {
						if(actions[keyCode] != undefined) actions[keyCode] = undefined;
					} else actions[keyCode] = action;
				}
			};
			/**
			 * @function
			 * @name utils.input.KeyMap#getAction
			 * @param {utils.input.Key|number} keyCode
			 * @returns {number|string|*} action associated to the key
			 */
			this.getAction = keyCode => {
				return actions[keyCode];
			};
			/**
			 * returns whether or not at least one key associated to the specified action is pressed
			 * @function
			 * @name utils.input.KeyMap#isKeyDown
			 * @param {utils.input.InputManager} inputManager
			 * @param {*} action
			 * @returns {boolean} true if at least one key associated to the specified action is pressed
			 */
			this.isKeyDown = (inputManager, action) => {
				let code=-1;
				do {
					code = actions.indexOf(action, code+1);
					if(code!== -1)
						if(inputManager.getKeyState(code) === utils.input.InputManager.KeyState.DOWN) return true;
				} while(code!==-1);
				return false;
			};
			/**
			 * returns the set of keys associated with the specified action.
			 * @function
			 * @name utils.input.KeyMap#getKeys
			 * @param {*} action
			 * @returns {utils.input.InputManager.Key[]|number[]} key codes
			 */
			this.getKeys = action => {
				let codes = [], i = actions.indexOf(action);
				while(i !== -1) { codes.push(i); i = actions.indexOf(action, i+1); }
				return codes;
			};
			/**
			 * sets the callback function which will be called when a useful keyboard event happens.
			 * @function
			 * @name utils.input.KeyMap#setCallback
			 * @param {utils.input.KeyMap.keyMapCallback} callback
			 */
			this.setCallback = callback => { cb = callback; };
			/**
			 * allow the instance to catch keyboard events by adding a callback function using the parameter's <!--
			 * -->{@link utils.input.InputManager#addKeyCallback|addKeyCallback} method.
			 * @function
			 * @name utils.input.KeyMap#enable
			 * @param {utils.input.InputManager} inputManager
			 */
			this.enable = function(inputManager) {
				inputManager.addKeyCallback(callback);
			};
			/**
			 * removes the callback function from the keyboard listener of the parameter.
			 * @function
			 * @name utils.input.KeyMap#disable
			 * @param {utils.input.InputManager} inputManager
			 */
			this.disable = function(inputManager) {
				inputManager.removeKeyCallback(callback);
			};
		}
	}
	return KeyMap;
})();
