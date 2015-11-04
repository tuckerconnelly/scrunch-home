domready( function () {

	var scale = Math.pow(window.innerWidth / 512, 0.5);

	// Set up the scene, camera, and renderer
	
	var adjustedInnerHeight = window.innerHeight * 1.2;
	
	var scene = new THREE.Scene();

	var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / (adjustedInnerHeight), 1, 1000);
	camera.position.z = adjustedInnerHeight;
	
	var renderer = window.WebGLRenderingContext ? new THREE.WebGLRenderer({ alpha: true, antialias: true }) : new THREE.CanvasRenderer({ alpha: true, antialias: true });
	renderer.setSize( window.innerWidth, adjustedInnerHeight);
	document.body.appendChild( renderer.domElement );

	var currentHeight = adjustedInnerHeight;
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

		var oldScale = scale;
		scale = Math.pow(window.innerWidth / 512, 0.5);

		camera.aspect = window.innerWidth / (adjustedInnerHeight);
		camera.updateProjectionMatrix();
		camera.position.z = adjustedInnerHeight;

		renderer.setSize( window.innerWidth, adjustedInnerHeight );

		particles.forEach( function (particle) {

			particle.floatingPositionScaleOpacity = {
				x: particle.floatingPositionScaleOpacity.x * (1 / oldScale) * scale,
				y: particle.floatingPositionScaleOpacity.y * (1 / oldScale) * scale,
				scale: particle.floatingPositionScaleOpacity.scale * (1 / oldScale) * scale,
				opacity: particle.floatingPositionScaleOpacity.opacity
			};

			particle.characterPositionScaleOpacity = {
				x: particle.characterPositionScaleOpacity.x * (1 / oldScale) * scale,
				y: particle.characterPositionScaleOpacity.y * (1 / oldScale) * scale,
				scale: particle.characterPositionScaleOpacity.scale * (1 / oldScale) * scale,
				opacity: particle.characterPositionScaleOpacity.opacity
			};

			partical.focalPoint = {
				x: particle.floatingPositionScaleOpacity.x*FOCAL_POINT_SPREAD + FOCAL_POINT.X*scale,
				y: particle.floatingPositionScaleOpacity.y*FOCAL_POINT_SPREAD + FOCAL_POINT.Y*scale
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

				particle.createFloatingTween();
				particle.floatingTween.start(currentTime - Math.random()*2000);
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

				particle.createCharacterFloatingTween();
				particle.characterFloatingTween.start(currentTime - Math.random()*2000);
			}
		});

		if (textFormed === false) {
			line.growingTween.stop();
			line.shrinkingTween.stop();
			scene.remove(line.object);
			makeLine();
		}

		currentWidth = window.innerWidth;
		currentHeight = adjustedInnerHeight;
	}, 1000));

	// Particle stuff
	
	var foregroundParticles = [];
	var n = 0;

	var one = false;

	PARTICLE_FORMED_POSITIONS.forEach( function (particleFormedPosition, index) {
		var particle;

		// innerWidth of 728 gives you three width of 243 * 2 = 486
		// innerHeight of 458 gives you three height of 153 * 2 = 306
		// So with the current camera settings, 1px = .75 threejs units

		var sceneWidth = window.innerWidth * 1.5;
		var sceneHeight = adjustedInnerHeight * 1.5;

		var topRight = Math.random() > 0.5 ;

		var x;
		var y;

		// Guarantee at least two particles on screen for
		// connection lines
		if (n < 3) {
			x = Math.random()*sceneWidth*0.80 - sceneWidth*0.40;
			y = Math.random()*sceneHeight*0.80 - sceneHeight*0.40;
		} else if (topRight !== true) {
			x = Math.random()*sceneWidth*1.5 - sceneWidth*0.75;
			y = Math.random()*sceneHeight*1.5 - sceneHeight*0.75;
		} else {
			var randomNumber = Math.random();
			// Divide them evenly into 3 groups: one above screen, one to
			// the top right of the screen, and one to the right of the
			// screen
			// Top right
			if (randomNumber > 0.67) {
				x = sceneWidth/2 + Math.random()*sceneWidth/4 + 100;
				y = sceneHeight/2 + Math.random()*sceneHeight/4 + 100;
			// Above
			} else if (randomNumber > 0.33) {
				x = Math.random()*sceneWidth/2;
				y = sceneHeight/2 + Math.random()*sceneHeight/4 + 100;
			// Right
			} else {
				x = sceneWidth/2 + Math.random()*sceneWidth/4 + 100;
				y = sceneHeight/2 - Math.random()*sceneHeight;
			}
		}

		if (n > 2) {
			x *= scale;
			y *= scale;
		}

		var offScreen = false;

		if (
			x < -sceneWidth/2 - 75 ||
			x > sceneWidth/2 + 75 ||
			y < -sceneHeight/2 - 75 ||
			y > sceneHeight/2 + 75
		) {
			offScreen = true;
		}

		var theX = 20;
		var theY = -100;
		if (!one) {
			theX = 40;
			theY = 300;
			one = true;
		}

		var floatingPositionScaleOpacity = {
			x: x,
			y: y,
			scale: offScreen ? (Math.random()*3+2.5)*scale : (Math.random()*1.5+0.5)*scale,
			opacity: Math.random() * 0.5 + 0.1
		};

		var characterPositionScaleOpacity = {
			x: particleFormedPosition.x * scale,
			y: particleFormedPosition.y * scale,
			scale: (Math.random()*0.5 + 0.1)*scale,
			opacity: Math.random() * 0.1 + 0.9
		};

		var focalPoint = {
			x: x*FOCAL_POINT_SPREAD + FOCAL_POINT.X*scale,
			y: y*FOCAL_POINT_SPREAD + FOCAL_POINT.Y*scale
		};

		switch (n % 3) {
			case 0:
				particle = new Particle(Particle.SQUARE, floatingPositionScaleOpacity, characterPositionScaleOpacity, focalPoint);
				break;
			case 1:
				particle = new Particle(Particle.CIRCLE, floatingPositionScaleOpacity, characterPositionScaleOpacity, focalPoint);
				break;
			case 2:
				particle = new Particle(Particle.TRIANGLE, floatingPositionScaleOpacity, characterPositionScaleOpacity, focalPoint);
				break;
		}

		scene.add(particle.mesh);
		particles.push(particle);

		if (
			x > -sceneWidth/2 + 25 &&
			x < sceneWidth/2 - 25 &&
			y > -sceneHeight/2 + 25 &&
			y < sceneHeight/2 - 25
		) {
			foregroundParticles.push(particle);
		}

		n++;
	});

	particles = particles.sort( function (a, b) {
		if (a.characterPositionScaleOpacity.x < b.characterPositionScaleOpacity.x) {
			return -1;
		}

		if (a.characterPositionScaleOpacity.x > b.characterPositionScaleOpacity.x) {
			return 1;
		}

		return 0;
	});

	// Scroll hacking

	var textFormed = false;
	var toCharacterTimeouts = [];
	var lineTimeout;

	$(document).on('scroll', function () {
		if ($(document).scrollTop() <= CHARACTER_FORMED_CUTOFF && textFormed === true) {
			console.log('dissolve');

			$('#init-text').stop();

			toCharacterTimeouts.forEach( function (toCharacterTimeout) {
				clearTimeout(toCharacterTimeout);
			});

			particles.forEach( function (particle) {
				particle.goToFloatingPosition(currentTime);
			});
			renderer.domElement.style.position = 'fixed';
			renderer.domElement.style.top = '0px';

			$('#billion-reasons').animate({
				top: $('#billion-reasons').height() + adjustedInnerHeight/2 +'px',
				opacity: 0
			}, TRANSITION_TIME / 4, 'easeInQuad', function () {
				$('#init-text')
					.css({
						top: '-5rem'
					})
					.animate({
						top: 0,
						opacity: 1
					}, TRANSITION_TIME / 4, 'easeOutQuad');
			});

			lineTimeout = setTimeout( function () {
				makeLine();
			}, 1500);

			textFormed = false;
		} else if ($(document).scrollTop() > CHARACTER_FORMED_CUTOFF && textFormed === false) {
			console.log('form');

			$('#billion-reasons').stop();

			var delayBetweenParticles = TRANSITION_TIME * 0.2 / PARTICLE_FORMED_POSITIONS.length;

			particles.forEach( function (particle, index) {
				toCharacterTimeouts.push(setTimeout( function () {
					particle.goToCharacterPosition(currentTime);
				}, index * delayBetweenParticles));
			});
			renderer.domElement.style.position = 'absolute';
			renderer.domElement.style.top = CHARACTER_FORMED_CUTOFF+'px';
			
			$('#init-text').animate({
				top: '-4rem',
				opacity: 0
			}, TRANSITION_TIME / 2, 'easeInQuad', function () {
				$('#billion-reasons')
					.css({
						top: ($('#billion-reasons').height() + adjustedInnerHeight/2)+'px'
					})
					.animate({
						top: (200 + adjustedInnerHeight/2)+'px',
						opacity: 1
					}, TRANSITION_TIME / 2, 'easeOutBack');
			});
		
			clearTimeout(lineTimeout);
			line.growingTween.stop();
			line.shrinkingTween.stop();
			scene.remove(line.object);

			textFormed = true;
		}
	});

	$(window).on('resize', _.debounce(function () {

		if (window.innerWidth === currentWidth) {
			return;
		}
/*
		var newTop = 450 + window.innerHeight/2;

		$('#billion-reasons').css({
			top: newTop+'px'
		});*/
	}, 1000));

	$('#billion-reasons').css({
		top: (450 + window.innerHeight/2)+'px'
	});


	// Lines

	var line;

	var makeLine = function () {
		line = new Line(foregroundParticles, scene);
		line.once('death', function () {
			makeLine();
		});
	};

	makeLine();

	// Render loops

	var currentTime;

	function render(time) {
		requestAnimationFrame( render );

		currentTime = time;

		TWEEN.update(time);

		renderer.render( scene, camera );
	}

	render();
});