/* jshint globalstrict: true, browser: true */
/* global THREE, TWEEN, PrismGeometry */

'use strict';

/**
 * A floating particle
 * @param {Object} floatingPosition The coordinates of the floating position
 * @param {Object} characterPosition The coordinates of the character position
 */
var Particle = function (type, floatingPosition, characterPosition) {
	this.initialize(type, floatingPosition, characterPosition);
};

Particle.SQUARE = 0;
Particle.CIRCLE = 1;
Particle.TRIANGLE = 2;

Particle.prototype = {

	mesh: undefined,

	floatingPositionScaleOpacity: undefined,
	characterPositionScaleOpacity: undefined,
	currentPositionScaleOpacity: undefined,

	floatingTween: undefined,
	characterFloatingTween: undefined,
	toFloatingTween: undefined,
	toCharacterTween: undefined,

	floatingTimeout: undefined,

	initialize: function (type, floatingPosition, characterPosition) {

		var scaleFactor = (Math.random()*2);

		this.floatingPositionScaleOpacity = {
			x: floatingPosition.x,
			y: floatingPosition.y,
			scale: scaleFactor*(window.innerWidth / 1024),
			opacity: Math.random() * 0.8 + 0.2
		};

		this.characterPositionScaleOpacity = {
			x: characterPosition.x,
			y: characterPosition.y,
			scale: window.innerWidth/1024,
			opacity: 1
		};

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

		this.mesh.position.set(this.floatingPositionScaleOpacity.x, this.floatingPositionScaleOpacity.y, 1);

		// Start the tween
		this.floatingTween = new TWEEN.Tween( this.mesh.position )
			.to({
				y: this.floatingPositionScaleOpacity.y + FLOAT_AMOUNT
			}, 2000)
			.easing( TWEEN.Easing.Sinusoidal.InOut )
			.repeat(Infinity)
			.yoyo(true);

		this.characterFloatingTween = new TWEEN.Tween( this.mesh.position )
			.to({
				y: this.characterPositionScaleOpacity.y + CHARACTER_FLOAT_AMOUNT
			}, 2000)
			.easing( TWEEN.Easing.Sinusoidal.InOut )
			.repeat(Infinity)
			.yoyo(true);

		// Delay the starting time of the tween, so the floats are staggered
		
		this.floatingTimeout = setTimeout( function () {
			this.floatingTween.start();
		}.bind(this), Math.random()*4000);
	},

	goToCharacterPosition: function () {
		this.floatingTween.stop();
		clearTimeout(this.floatingTimeout);

		var currentPositionScaleOpacity = {
			x: this.mesh.position.x,
			y: this.mesh.position.y,
			scale: this.floatingPositionScaleOpacity.scale,
			opacity: this.floatingPositionScaleOpacity.opacity
		};

		var particle = this;

		this.toCharacterTween = new TWEEN.Tween( currentPositionScaleOpacity )
			.to(this.characterPositionScaleOpacity, 1000)
			.onUpdate( function (e) {
				particle.mesh.position.set(this.x, this.y, 1);
				particle.mesh.scale.set(this.scale, this.scale, this.scale);
				particle.mesh.material.opacity = this.opacity;
			})
			.easing( TWEEN.Easing.Sinusoidal.InOut )
			.onComplete( function () {
				this.floatingTimeout = setTimeout( function () {
					this.characterFloatingTween.start();
				}.bind(this), Math.random()*4000);
			}.bind(this));

		this.toCharacterTween.start();
	},

	goToFloatingPosition: function () {
		this.characterFloatingTween.stop();
		clearTimeout(this.floatingTimeout);

		var currentPositionScaleOpacity = {
			x: this.mesh.position.x,
			y: this.mesh.position.y,
			scale: this.characterPositionScaleOpacity.scale,
			opacity: this.characterPositionScaleOpacity.opacity
		};

		var particle = this;

		this.toFloatingTween = new TWEEN.Tween( currentPositionScaleOpacity )
			.to(this.floatingPositionScaleOpacity, 1000)
			.onUpdate( function (e) {
				particle.mesh.position.set(this.x, this.y, 1);
				particle.mesh.scale.set(this.scale, this.scale, this.scale);
				particle.mesh.material.opacity = this.opacity;
			})
			.easing( TWEEN.Easing.Sinusoidal.InOut )
			.onComplete( function () {
				this.floatingTimeout = setTimeout( function () {
					this.floatingTween.start();
				}.bind(this), Math.random()*4000);
			}.bind(this));

		this.toFloatingTween.start();
	}
};