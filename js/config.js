/**
 * The height the particles float at
 * @type {Number}
 */
var FLOAT_AMOUNT = 5;
var CHARACTER_FLOAT_AMOUNT = 5;

/**
 * The pixels the particles form into their characters at
 * @type {Number}
 */
var CHARACTER_FORMED_CUTOFF = 200;

var TRANSITION_TIME = 2000;

var FOCAL_POINT = {
	X: 100,
	Y: 200
};

FOCAL_POINT_SPREAD = 0.25;

/*

Line speed is calculated by adding the base animation time
(in ms) to the distance/line speed (line speed is threejs units
per ms). This gives a nice balance between long distances being
slightly longer, but not too much longer, than short distances
between particles.

If you want shorter distances to be faster and
longer distances slower, decrease the base animation time
and increase the speed, and vice versa.

Reading that back it sounds super fucking confusing haha.
If you have questions email me web@tuckerconnelly.com

 */

var BASE_LINE_ANIMATION_TIME = 1000;
var LINE_SPEED = 1.5;

/**
 * The x/y coordinates of all the particles when formed
 * @type {Object}
 */
var PARTICLE_FORMED_POSITIONS = [
	{ x: -48, y: -48 },
	{ x: -40, y: -40 },
	{ x: -32, y: -32 },
	{ x: -24, y: -24 },
	{ x: -16, y: -16 },
	{ x: -8, y: -8 },
	{ x: 0, y: 0 },
	{ x: 8, y: 8 },
	{ x: 16, y: 16 },
	{ x: 24, y: 24 },
	{ x: 32, y: 32 },
	{ x: 40, y: 40 },
	{ x: 48, y: 48 },

	{ x: -48, y: 48 },
	{ x: -40, y: 40 },
	{ x: -32, y: 32 },
	{ x: -24, y: 24 },
	{ x: -16, y: 16 },
	{ x: -8, y: 8 },
	{ x: 0, y: 0 },
	{ x: 8, y: -8 },
	{ x: 16, y: -16 },
	{ x: 24, y: -24 },
	{ x: 32, y: -32 },
	{ x: 40, y: -40 },
	{ x: 48, y: -48 }
];