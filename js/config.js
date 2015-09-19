/**
 * The height the particles float at
 * @type {Number}
 */
var FLOAT_AMOUNT = 10;
var CHARACTER_FLOAT_AMOUNT = 5;

var CHARACTER_FORMED_CUTOFF = 200;
var CHARACTER_LEFT_BEHIND_CUTOFF = 400;

/**
 * The text the particles form in to
 * @type {String}
 */
var particleText = '3.0';

/**
 * The x/y coordinates of all the particles within certain characters
 * @type {Object}
 */
var particleTextMaps = {
	'3': {
		width: 32,
		particles: [
			{ x: 16, y: 16 }
		]
	},
	'.': {
		width: 32,
		particles: [
			{ x: 32, y: 32 }
		]
	},
	'0': {
		width: 32,
		particles: [
			{ x: 48, y: 48 }
		]
	}
};