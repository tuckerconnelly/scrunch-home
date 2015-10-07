domready( function () {

	// Set up the scene, camera, and renderer
	
	var scene = new THREE.Scene();

	var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = window.innerHeight;
	
	var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	renderer.setSize( window.innerWidth, window.innerHeight);
	document.body.appendChild( renderer.domElement );

	var currentHeight = window.innerHeight;
	var currentWidth = window.innerWidth;

	// Handle resizing/responsiveness

	var particles = [];

	window.addEventListener( 'resize', _.debounce(function () {

		// Mobile browsers trigger resize on scroll for the
		// url bar, which changes the height, so only listen
		// to resize event on width changes
		if (window.innerWidth === currentWidth) {
			return;
		}

		console.log('resize');

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		camera.position.z = window.innerHeight;

		renderer.setSize( window.innerWidth, window.innerHeight );

		particles.forEach( function (particle) {

			particle.floatingPositionScaleOpacity = {
				x: particle.floatingPositionScaleOpacity.x * (window.innerWidth / currentWidth),
				y: particle.floatingPositionScaleOpacity.y * (window.innerHeight / currentHeight),
				scale: particle.floatingPositionScaleOpacity.scale * (window.innerWidth / currentWidth),
				opacity: particle.floatingPositionScaleOpacity.opacity
			};

			particle.characterPositionScaleOpacity = {
				x: particle.characterPositionScaleOpacity.x * (window.innerWidth / currentWidth),
				y: particle.characterPositionScaleOpacity.y * (window.innerWidth / currentWidth),
				scale: window.innerWidth / 1024,
				opacity: particle.characterPositionScaleOpacity.opacity
			};

			if (textFormed !== true) {
				particle.floatingTween.stop();
				particle.mesh.position.set(
					particle.floatingPositionScaleOpacity.x,
					particle.floatingPositionScaleOpacity.y,
					0
				);

				particle.mesh.scale.set(
					particle.floatingPositionScaleOpacity.scale,
					particle.floatingPositionScaleOpacity.scale,
					particle.floatingPositionScaleOpacity.scale
				);

				particle.floatingTween.to({ y: particle.floatingPositionScaleOpacity.y + FLOAT_AMOUNT });
				particle.floatingTween.start();
			} else {
				particle.characterFloatingTween.stop();
				particle.mesh.position.set(
					particle.characterPositionScaleOpacity.x,
					particle.characterPositionScaleOpacity.y,
					0
				);

				particle.mesh.scale.set(
					particle.characterPositionScaleOpacity.scale,
					particle.characterPositionScaleOpacity.scale,
					particle.characterPositionScaleOpacity.scale
				);

				particle.characterFloatingTween.to({ y: particle.characterPositionScaleOpacity.y + FLOAT_AMOUNT });
				particle.characterFloatingTween.start();
			}
		});

		currentWidth = window.innerWidth;
		currentHeight = window.innerHeight;
	}, 1000));

	// Particle stuff

	var n = 0;

	PARTICLE_FORMED_POSITIONS.forEach( function (particleFormedPosition) {
		var particle;

		// innerWidth of 728 gives you three width of 243 * 2 = 486
		// innerHeight of 458 gives you three height of 153 * 2 = 306
		// So with the current camera settings, 1px = .75 threejs units

		var sceneWidth = window.innerWidth * 1.5;
		var sceneHeight = window.innerHeight * 1.5;

		var scaleFactor = Math.random()*1.5+0.5;

		var offScreen = Math.random() > 0.5;

		var floatingPositionScaleOpacity = {
			x: Math.random()*sceneWidth - sceneWidth / 2,
			y: Math.random()*sceneHeight - sceneHeight / 2,
			scale: offScreen ? scaleFactor*(window.innerWidth/1024) + 5 : scaleFactor*(window.innerWidth / 1024),
			opacity: offScreen ? 0 : Math.random() * 0.8 + 0.2
		};

		var characterPositionScaleOpacity = {
			x: particleFormedPosition.x,
			y: particleFormedPosition.y,
			scale: (Math.random()*0.4 + 0.8)*window.innerWidth/1024 * 0.6,
			opacity: Math.random() * 0.4 + 0.6
		};

		switch (n % 3) {
			case 0:
				particle = new Particle(Particle.SQUARE, floatingPositionScaleOpacity, characterPositionScaleOpacity);
				break;
			case 1:
				particle = new Particle(Particle.CIRCLE, floatingPositionScaleOpacity, characterPositionScaleOpacity);
				break;
			case 2:
				particle = new Particle(Particle.TRIANGLE, floatingPositionScaleOpacity, characterPositionScaleOpacity);
				break;
		}

		scene.add(particle.mesh);
		particles.push(particle);

		n++;
	});

	// Render loops

	function render() {
		requestAnimationFrame( render );

		TWEEN.update();

		renderer.render( scene, camera );
	}

	render();

	// Scroll hacking

	var textFormed = false;

	$(document).on('scroll', function () {
		if ($(document).scrollTop() <= CHARACTER_FORMED_CUTOFF && textFormed === true) {
			console.log('dissolve');

			particles.forEach( function (particle) {
				particle.goToFloatingPosition();
			});
			renderer.domElement.style.position = 'fixed';
			renderer.domElement.style.top = '0px';

			$('#init-text')
			.css({
				top: '20px'
			})
			.animate({
				top: 0,
				opacity: 1
			});
			$('#billion-reasons').animate({
				top: (180 + window.innerHeight/2)+'px',
				opacity: 0
			});

			textFormed = false;
		} else if ($(document).scrollTop() > CHARACTER_FORMED_CUTOFF && textFormed === false) {
			console.log('form');

			particles.forEach( function (particle) {
				particle.goToCharacterPosition();
			});
			renderer.domElement.style.position = 'absolute';
			renderer.domElement.style.top = CHARACTER_FORMED_CUTOFF+'px';
			
			$('#init-text').animate({
				top: '-20px',
				opacity: 0
			});
			$('#billion-reasons')
			.css({
				top: (220 + window.innerHeight/2)+'px'
			})
			.animate({
				top: (200 + window.innerHeight/2)+'px',
				opacity: 1
			});

			textFormed = true;
		}
	});

	$(window).on('resize', _.debounce(function () {

		if (window.innerWidth === currentWidth) {
			return;
		}

		var newTop = 450 + window.innerHeight/2;

		$('#billion-reasons').css({
			top: newTop+'px'
		});
	}, 1000));

	$('#billion-reasons').css({
		top: (450 + window.innerHeight/2)+'px'
	});
});