import {polyfill} from "./tools.mod.js";

/**
 * @module utils/audio
 */
polyfill(window, "AudioContext", ["webkit"]);
function loadSound(audioContext, onResult, onError, url) {
		const request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		// Decode asynchronously
		request.onload = function() {
			context.decodeAudioData(request.response, onResult, onError);
		};
		request.send();
	}
	/**
	 * <code>
	 * __________________________________________________________________________________________________________
	 * |_octave_|___C___|_C#/Db_|___D___|_D#/Eb_|___E___|___F___|_F#/Gb_|___G___|_G#/Ab_|___A___|_A#/Bb_|___B___|
	 * |        |   0   |   1   |   2   |   3   |   4   |   5   |   6   |   7   |   8   |   9   |   10  |   11  |
	 * |   -5   | 8.176 | 8.662 | 9.177 | 9.723 | 10.30 | 10.91 | 11.56 | 12.25 | 12.98 | 13.75 |`14.57 | 15.43 |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |   -4   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |   -3   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |   -2   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |   -1   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |    0   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |    1   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |    2   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |    3   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |    4   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * |        |
	 * |    5   |
	 * |________|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|_______|
	 * </code>
	 * @param {number} semitones - midi identification number (see <!--
	 * -->http://www.electronics.dit.ie/staff/tscarff/Music_technology/midi/midi_note_numbers_for_octaves.htm <!--
	 * -->or http://tonalsoft.com/pub/news/pitch-bend.aspx) <!--
	 * -->for a list of all ids)
	 * @return {number} the note frequency, in Hz
	 */
function getNoteFreq(semitones) {
		return 440*(Math.pow(2, semitones-69));
	}
function createSinusOscillator(audioContext, freq) {
		let o = audioContext.createOscillator();
		o.type = "sine";
		o.frequency.value = freq;
		return o;
	}
function createSquareOscillator(audioContext, freq) {
		let o = audioContext.createOscillator();
		o.type = "square";
		o.frequency.value = freq;
		return o;
	}
function createTriangleOscillator(audioContext, freq) {
		let o = audioContext.createOscillator();
		o.type = "triangle";
		o.frequency.value = freq;
		return o;
	}
function createSawToothOscillator(audioContext, freq) {
		let o = audioContext.createOscillator();
		o.type = "sawtooth";
		o.frequency.value = freq;
		return o;
	}
function createCustomOscillator(audioContext, freq, periodicWave) {
		let o = audioContext.createOscillator();
		o.type = "custom";
		o.frequency.value = freq;
		o.setPeriodicWave(periodicWave);
		return o;
	}
function connectNodes(nodes) {
	let i, n = nodes.length;
	for(i=0; i< n-1; i++) {
		nodes[i].connect(nodes[i+1]);
	}
}

export {
	loadSound,
	getNoteFreq,
	createSinusOscillator,
	createSquareOscillator,
	createTriangleOscillator,
	createSawToothOscillator,
	createCustomOscillator,
	connectNodes
}