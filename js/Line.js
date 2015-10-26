/* jshint globalstrict: true, browser: true */
/* global THREE, TWEEN, PrismGeometry */

'use strict';

/**
 * A connection line
 * @param {Array} particlePool The pool of particles to randomly select from
 * @param {Object} scene The Three.js scene to render to
 */
var Line = function (particlePool, scene) {
	this.initialize(particlePool, scene);
};

Line.prototype = {

	leftToRight: undefined,
	q: undefined,
	theta1: undefined,
	theta2: undefined,

	curve: undefined,
	line: undefined,
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

		this.leftToRight = true;//Math.random() > 0.5;

		var x1 = leftParticle.floatingPositionScaleOpacity.x;
		var y1 = leftParticle.floatingPositionScaleOpacity.y;
		var x2 = rightParticle.floatingPositionScaleOpacity.x;
		var y2 = rightParticle.floatingPositionScaleOpacity.y;

		this.q = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));

		var r = this.q;

		var x3 = (x1 + x2) / 2;
		var y3 = (y1 + y2) / 2;

		var x = x3 - Math.sqrt(Math.pow(r, 2)-Math.pow(this.q/2, 2))*(y1-y2)/this.q;
		var y = y3 - Math.sqrt(Math.pow(r, 2)-Math.pow(this.q/2, 2))*(x2-x1)/this.q;

		this.theta1 = Math.PI - Math.acos((x - x1)/r);
		this.theta2 = Math.PI - Math.acos((x - x2)/r);

		var oneIsNegative = false;

		if (y1 < y) {
			this.theta1 = -this.theta1;
			oneIsNegative = true;
		}
		if (y2 < y) {
			this.theta2 = -this.theta2;
			oneIsNegative = true;
		}

		// Adjust for particle size
		this.theta1 -= Math.PI / this.q * 6;
		this.theta2 += Math.PI / this.q * 6;

		this.curve = new THREE.EllipseCurve(
			x, y,
			r, r,
			this.leftToRight ? this.theta1 : this.theta2, this.leftToRight ? this.theta1 : this.theta2,
			this.leftToRight,
			0
		);

		this.path = new THREE.Path();
		this.geometry = this.path.createGeometry( this.curve.getPoints(50) );
		this.geometry.computeLineDistances();

		this.object = new THREE.Line( this.geometry, new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 20, gapSize: 10 }));

		this.growingTween = new TWEEN.Tween(this.curve)
			.to({
				aEndAngle: this.leftToRight ? this.theta2 : this.theta1
			})
			.onUpdate( function () {
				this.render(scene);
			}.bind(this));

		this.shrinkingTween = new TWEEN.Tween(this.curve)
			.to({
				aStartAngle: this.leftToRight ? this.theta2 : this.theta1
			})
			.onUpdate( function () {
				this.render(scene);
			}.bind(this))
			.onComplete( function () {
				scene.remove(this.object);
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
};