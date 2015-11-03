/* jshint globalstrict: true, browser: true, newcap: false */
/* global THREE, TWEEN, BezierEasing, PrismGeometry, TRANSITION_TIME, FOCAL_POINT, FLOAT_AMOUNT, CHARACTER_FLOAT_AMOUNT */

'use strict';

/**
 * A floating particle
 * @param {Object} floatingPosition The coordinates of the floating position
 * @param {Object} characterPosition The coordinates of the character position
 */
var Particle = function (type, floatingPositionScaleOpacity, characterPositionScaleOpacity, focalPoint) {
	this.initialize(type, floatingPositionScaleOpacity, characterPositionScaleOpacity, focalPoint);
};

Particle.SQUARE = 0;
Particle.CIRCLE = 1;
Particle.TRIANGLE = 2;

Particle.prototype = {

	mesh: undefined,

	floatingPositionScaleOpacity: undefined,
	characterPositionScaleOpacity: undefined,
	currentPositionScaleOpacity: undefined,
	focalPoint: undefined,

	floatingTween: undefined,
	characterFloatingTween: undefined,
	toFloatingTween: undefined,

	toFocalXTween: undefined,
	toFocalYTween: undefined,
	toCharacterXTween: undefined,
	toCharacterYTween: undefined,
	toBelowCharacterYTween: undefined,
	toCharacterScaleTween: undefined,
	toCharacterOpacityTween: undefined,
	toCharacterOpacityTweenTwo: undefined,

	floatingTimeout: undefined,

	initialize: function (type, floatingPositionScaleOpacity, characterPositionScaleOpacity, focalPoint) {

		this.floatingPositionScaleOpacity = floatingPositionScaleOpacity;
		this.characterPositionScaleOpacity = characterPositionScaleOpacity;
		this.focalPoint = focalPoint;

		// Create the material and geometries
		var material = new THREE.MeshBasicMaterial({
			color: 0x562872,
			opacity: this.floatingPositionScaleOpacity.opacity,
			transparent: true
		});

		var boxGeometry = new THREE.BoxGeometry( 20, 20, 0 );
		var cylinderGeometry = new THREE.CylinderGeometry( 10, 10, 0, 32 );

		var A = new THREE.Vector2( -10, -10 );
		var B = new THREE.Vector2( 10, -10 );
		var C = new THREE.Vector2( 0, 10 );
		var prismGeometry = new PrismGeometry( [ A, B, C ], 0);

		// Create the shape based on the passed type
		// Also set initial rotation :)
		switch (type) {
			case Particle.SQUARE:
				this.mesh = new THREE.Mesh( boxGeometry, material );
				this.mesh.rotation.z = Math.random() * Math.PI * 4 - Math.PI * 2;
				break;
			case Particle.CIRCLE:
				this.mesh = new THREE.Mesh( cylinderGeometry, material );
				// Need to set x rotation on the cylinder because it starts with a side-view
				this.mesh.rotation.x = -Math.PI / 2;
				break;
			case Particle.TRIANGLE:
				this.mesh = new THREE.Mesh( prismGeometry, material );
				this.mesh.rotation.z = Math.random() * Math.PI * 4 - Math.PI * 2;
				break;
		}

		this.mesh.scale.set(
			this.floatingPositionScaleOpacity.scale,
			this.floatingPositionScaleOpacity.scale,
			this.floatingPositionScaleOpacity.scale
		);

		var floatingDelay = Math.random()*2000;
		var floatingStartY = this.interpolateFloatingStartY(floatingDelay);

		this.mesh.position.set(this.floatingPositionScaleOpacity.x, floatingStartY, 0);

		var particle = this;

		// Start the tween
		this.createFloatingTween();

		// Delay the starting time of the tween, so the floats are staggered
		this.floatingTween.start(-floatingDelay);
	},

	killTweens: function () {
		this.floatingTween.stop();
		if (this.characterFloatingTween !== undefined) {
			this.characterFloatingTween.stop();
		}
		if (this.toFloatingTween !== undefined) {
			this.toFloatingTween.stop();
		}
		if (this.toCharacterYTween !== undefined) {
			this.toFocalXTween.stop();
			this.toFocalYTween.stop();
			this.toCharacterXTween.stop();
			this.toBelowCharacterYTween.stop();
			this.toCharacterYTween.stop();
			this.toCharacterScaleTween.stop();
			this.toCharacterOpacityTween.stop();
		}
		clearTimeout(this.floatingTimeout);
	},

	goToCharacterPosition: function (currentTime) {
		this.killTweens();

		var currentPositionScaleOpacity = {
			x: this.mesh.position.x,
			scale: this.mesh.scale.x,
			opacity: this.mesh.material.opacity
		};

		var particle = this;

		var backInOutBezierEasing = BezierEasing(0.000, -0.500, 1.000, 1.500).get;
		var bounceOutBezierEasing = BezierEasing(0.620, 1.650, 0.570, 0.805).get;

		var floatingDelay = Math.random()*2000;
		var characterFloatingStartY = this.interpolateFloatingStartY(floatingDelay, true);

		var leftOfFocal = this.floatingPositionScaleOpacity.x < FOCAL_POINT.X;

		this.toFocalXTween = new TWEEN.Tween(this.mesh.position)
			.to({
				x: this.focalPoint.x
			}, TRANSITION_TIME*0.3)
			.easing(leftOfFocal ? TWEEN.Easing.Back.Out : TWEEN.Easing.Quadratic.Out );

		this.toCharacterXTween = new TWEEN.Tween(this.mesh.position)
			.to({
				x: this.characterPositionScaleOpacity.x
			}, TRANSITION_TIME*0.3)
			.easing(TWEEN.Easing.Quadratic.InOut);

		this.toFocalYTween = new TWEEN.Tween(this.mesh.position)
			.to({
				y: this.focalPoint.y
			}, TRANSITION_TIME*0.3)
			.easing(backInOutBezierEasing);

		this.toBelowCharacterYTween = new TWEEN.Tween(this.mesh.position)
			.to({
				y: this.characterPositionScaleOpacity.y - 10
			}, TRANSITION_TIME*0.3)
			.easing(bounceOutBezierEasing);

		this.toCharacterYTween = new TWEEN.Tween(this.mesh.position)
			.to({
				y: characterFloatingStartY
			}, TRANSITION_TIME*0.3)
			.easing(TWEEN.Easing.Cubic.Out)
			.onComplete( function () {
				this.createCharacterFloatingTween();
				this.characterFloatingTween.start(currentTime + TRANSITION_TIME - floatingDelay);
			}.bind(this));

		this.toFocalXTween.chain(this.toCharacterXTween);
		this.toFocalYTween.chain(this.toBelowCharacterYTween);
		this.toBelowCharacterYTween.chain(this.toCharacterYTween);

		this.toCharacterScaleTween = new TWEEN.Tween({
				scale: this.mesh.scale.x
			})
			.to({
				scale: this.characterPositionScaleOpacity.scale
			}, TRANSITION_TIME*0.6)
			.easing(TWEEN.Easing.Linear.None)
			.onUpdate( function () {
				particle.mesh.scale.set(this.scale, this.scale, this.scale);
			});

		var sceneWidth = window.innerWidth * 1.5;
		var sceneHeight = window.innerHeight * 1.2 * 1.5;
		var distanceRatioX = Math.abs(FOCAL_POINT.X - this.floatingPositionScaleOpacity.x) / (sceneWidth*1.5/2);
		var distanceRatioY = Math.abs(FOCAL_POINT.Y - this.floatingPositionScaleOpacity.y) / (sceneHeight*1.5/2);

		var focalPointOpacity = (distanceRatioX*0.5+0.5)*0.5 + (distanceRatioY*0.5+0.5)*0.5;

		this.toCharacterOpacityTween = new TWEEN.Tween({
				opacity: this.mesh.material.opacity
			})
			.to({
				opacity: focalPointOpacity
			}, TRANSITION_TIME*0.4)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate( function () {
				particle.mesh.material.opacity = this.opacity;
			});

		this.toCharacterOpacityTweenTwo = new TWEEN.Tween({
				opacity: focalPointOpacity
			})
			.to({
				opacity: this.characterPositionScaleOpacity.opacity
			}, TRANSITION_TIME*0.2)
			.easing(TWEEN.Easing.Quadratic.In)
			.onUpdate( function () {
				particle.mesh.material.opacity = this.opacity;
			});

		this.toCharacterOpacityTween.chain(this.toCharacterOpacityTweenTwo);

		this.toFocalXTween.start();
		this.toFocalYTween.start();
		this.toCharacterScaleTween.start();
		this.toCharacterOpacityTween.start();
	},

	goToFloatingPosition: function (currentTime) {
		this.killTweens();

		var currentPositionScaleOpacity = {
			x: this.mesh.position.x,
			y: this.mesh.position.y,
			scale: this.mesh.scale.x,
			opacity: this.mesh.material.opacity
		};
		
		var floatingDelay = Math.random()*2000;
		var floatingStartY = this.interpolateFloatingStartY(floatingDelay);

		var particle = this;


		this.toFloatingTween = new TWEEN.Tween( currentPositionScaleOpacity )
			.to({
				x: this.floatingPositionScaleOpacity.x,
				y: floatingStartY,
				scale: this.floatingPositionScaleOpacity.scale,
				opacity: this.floatingPositionScaleOpacity.opacity
			}, TRANSITION_TIME/2)
			.onUpdate( function (e) {
				particle.mesh.position.set(this.x, this.y, 0);
				particle.mesh.scale.set(this.scale, this.scale, this.scale);
				particle.mesh.material.opacity = this.opacity;
			})
			.easing( TWEEN.Easing.Sinusoidal.InOut )
			.onComplete( function () {
				this.createFloatingTween();
				this.floatingTween.start(currentTime + TRANSITION_TIME/2 - floatingDelay);
			}.bind(this));

		this.toFloatingTween.start();
	},

	interpolateFloatingStartY: function (floatingDelay, characterPosition) {
		var value = TWEEN.Easing.Sinusoidal.InOut(floatingDelay / 2000);

		var start;
		var end;

		if (characterPosition === true) {
			start = this.characterPositionScaleOpacity.y;
			end = this.characterPositionScaleOpacity.y + CHARACTER_FLOAT_AMOUNT*(window.innerWidth/1024);
		} else {
			start = this.floatingPositionScaleOpacity.y;
			end = this.floatingPositionScaleOpacity.y + FLOAT_AMOUNT*(window.innerWidth/1024);
		}

		return start + ( end - start ) * value;
	},

	createFloatingTween: function () {
		var particle = this;

		this.floatingTween = new TWEEN.Tween({
				y: this.floatingPositionScaleOpacity.y
			})
			.to({
				y: this.floatingPositionScaleOpacity.y + FLOAT_AMOUNT*(window.innerWidth/1024)
			}, 2000)
			.onUpdate( function () {
				particle.mesh.position.y = this.y;
			})
			.easing( TWEEN.Easing.Sinusoidal.InOut )
			.repeat(Infinity)
			.yoyo(true);
	},

	createCharacterFloatingTween: function () {
		var particle = this;

		this.characterFloatingTween = new TWEEN.Tween({
				y: this.characterPositionScaleOpacity.y
			})
			.to({
				y: this.characterPositionScaleOpacity.y + CHARACTER_FLOAT_AMOUNT*(window.innerWidth/1024)
			}, 2000)
			.onUpdate( function () {
				particle.mesh.position.y = this.y;
			})
			.easing( TWEEN.Easing.Sinusoidal.InOut )
			.repeat(Infinity)
			.yoyo(true);
	}
};