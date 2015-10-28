/* jshint globalstrict: true, browser: true */
/* global _, EventEmitter, THREE, TWEEN, BASE_LINE_ANIMATION_TIME, LINE_SPEED */

'use strict';

/**
 * A connection line
 * @param {Array} particlePool The pool of particles to randomly select from
 * @param {Object} scene The Three.js scene to render to
 */
var Line = function (particlePool, scene) {
	this.initialize(particlePool, scene);
};

Line.prototype = _.extend(EventEmitter.prototype, {

	curve: undefined,
	geometry: undefined,
	object: undefined,

	initialize: function (particlePool, scene) {
		var selectedParticles = [];
		while (selectedParticles.length < 2) {
			var index = Math.round(Math.random() * (particlePool.length - 1));
			if (selectedParticles[0] === index) {
				continue;
			}
			selectedParticles.push(index);
		}

		var leftParticle = particlePool[selectedParticles[0]];
		var rightParticle = particlePool[selectedParticles[1]];

		if (leftParticle.floatingPositionScaleOpacity.x > rightParticle.floatingPositionScaleOpacity.x) {
			leftParticle = particlePool[selectedParticles[1]];
			rightParticle = particlePool[selectedParticles[0]];
		}

		var leftToRight = Math.random() > 0.5;

		var x1 = leftParticle.floatingPositionScaleOpacity.x;
		var y1 = leftParticle.floatingPositionScaleOpacity.y;
		var x2 = rightParticle.floatingPositionScaleOpacity.x;
		var y2 = rightParticle.floatingPositionScaleOpacity.y;

		var q = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));

		var r = q;

		var x3 = (x1 + x2) / 2;
		var y3 = (y1 + y2) / 2;

		var x = x3 - Math.sqrt(Math.pow(r, 2)-Math.pow(q/2, 2))*(y1-y2)/q;
		var y = y3 - Math.sqrt(Math.pow(r, 2)-Math.pow(q/2, 2))*(x2-x1)/q;

		var theta1 = Math.PI - Math.acos((x - x1)/r);
		var theta2 = Math.PI - Math.acos((x - x2)/r);

		var oneIsNegative = false;

		if (y1 < y) {
			theta1 = 2*Math.PI-theta1;
			if (x1 > x) {
				theta1 += 2*Math.PI;
			}
			oneIsNegative = true;
		}
		if (y2 < y) {
			theta2 = -theta2;
			if (x2 < x) {
				theta2 += 2*Math.PI;
			}
			oneIsNegative = true;
		}

		// Adjust for particle size
		theta1 -= Math.PI / q * 6;
		theta2 += Math.PI / q * 6;

		var distance = Math.abs(theta2 - theta1) * Math.PI * r;

		this.curve = new THREE.EllipseCurve(
			x, y,
			r, r,
			leftToRight ? theta1 : theta2, leftToRight ? theta1 : theta2,
			leftToRight,
			0
		);

		this.path = new THREE.Path();
		this.geometry = this.path.createGeometry( this.curve.getPoints(50) );
		this.geometry.computeLineDistances();

		this.object = new THREE.Line( this.geometry, new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 20, gapSize: 10 }));

		this.growingTween = new TWEEN.Tween(this.curve)
			.to({
				aEndAngle: leftToRight ? theta2 : theta1
			}, BASE_LINE_ANIMATION_TIME/2 + distance / LINE_SPEED)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate( function () {
				this.render(scene);
			}.bind(this));

		this.shrinkingTween = new TWEEN.Tween(this.curve)
			.to({
				aStartAngle: leftToRight ? theta2 : theta1
			}, BASE_LINE_ANIMATION_TIME/2 + distance / LINE_SPEED)
			.easing(TWEEN.Easing.Quadratic.In)
			.onUpdate( function () {
				this.render(scene);
			}.bind(this))
			.onComplete( function () {
				scene.remove(this.object);
				this.trigger('death');
			}.bind(this));

		this.growingTween
			.chain(this.shrinkingTween)
			.start();
	},

	render: function (scene) {
		scene.remove(this.object);

		this.geometry = this.path.createGeometry( this.curve.getPoints(50) );
		this.geometry.computeLineDistances();

		this.object.geometry = this.geometry;

		scene.add(this.object);
	}
});