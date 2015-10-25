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
				scale: particle.characterPositionScaleOpacity.scale / currentWidth * window.innerWidth,
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
	
	var foregroundParticles = [];
	var n = 0;

	var one = false;

	PARTICLE_FORMED_POSITIONS.forEach( function (particleFormedPosition) {
		var particle;

		// innerWidth of 728 gives you three width of 243 * 2 = 486
		// innerHeight of 458 gives you three height of 153 * 2 = 306
		// So with the current camera settings, 1px = .75 threejs units

		var sceneWidth = window.innerWidth * 1.5;
		var sceneHeight = window.innerHeight * 1.5;

		var scaleFactor = Math.random()*1.5+0.5;

		var offScreen = false; //Math.random() > 0.5;


		var theX = 0;
		var theY = 0;
		if (!one) {
			theX = 0;
			theY = 150;
			one = true;
		}

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

		if (offScreen === false) {
			foregroundParticles.push(particle);
		}

		n++;
	});

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


	// Lines

	var line = {};

	var makeLine = function () {
		line = {
			leftToRight: undefined,
			q: undefined,
			theta1: undefined,
			theta2: undefined,

			curve: undefined,
			line: undefined,
			geometry: undefined,
			object: undefined
		};

		var selectedParticles = [];
		while (selectedParticles.length < 2) {
			var index = Math.round(Math.random() * (foregroundParticles.length - 1));
			if (selectedParticles[0] === index) {
				continue;
			}
			selectedParticles.push(index);
		}

		var leftParticle = foregroundParticles[selectedParticles[0]];
		var rightParticle = foregroundParticles[selectedParticles[1]];

		if (leftParticle.floatingPositionScaleOpacity.x > rightParticle.floatingPositionScaleOpacity.x) {
			leftParticle = foregroundParticles[selectedParticles[1]];
			rightParticle = foregroundParticles[selectedParticles[0]];
		}

		line.leftToRight = Math.random() > 0.5;

		var x1 = leftParticle.floatingPositionScaleOpacity.x;
		var y1 = leftParticle.floatingPositionScaleOpacity.y;
		var x2 = rightParticle.floatingPositionScaleOpacity.x;
		var y2 = rightParticle.floatingPositionScaleOpacity.y;

		line.q = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));

		var r = line.q;

		var x3 = (x1 + x2) / 2;
		var y3 = (y1 + y2) / 2;

		var x = x3 - Math.sqrt(Math.pow(r, 2)-Math.pow(line.q/2, 2))*(y1-y2)/line.q;
		var y = y3 - Math.sqrt(Math.pow(r, 2)-Math.pow(line.q/2, 2))*(x2-x1)/line.q;

		line.theta1 = Math.PI - Math.acos((x - x1)/r);
		line.theta2 = Math.PI - Math.acos((x - x2)/r);

		var oneIsNegative = false;

		if (y1 < y) {
			line.theta1 = -line.theta1;
			oneIsNegative = true;
		}
		if (y2 < y) {
			line.theta2 = -line.theta2;
			oneIsNegative = true;
		}

		// Adjust for particle size
		line.theta1 -= Math.PI / line.q * 6;
		line.theta2 += Math.PI / line.q * 6;

		console.log(line.theta1 *180/Math.PI, line.theta2 * 180/Math.PI)

		line.curve = new THREE.EllipseCurve(
			x, y,
			r, r,
			line.theta1, line.theta1, //line.leftToRight ? line.theta1 : line.theta2, line.leftToRight ? line.theta2 : line.theta1,
			true,
			0
		);

		line.path = new THREE.Path();
		line.geometry = line.path.createGeometry( line.curve.getPoints(50) );
		line.geometry.computeLineDistances();

		line.object = new THREE.Line( line.geometry, new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 20, gapSize: 10 }));
	};

	makeLine();
	//setInterval(makeLine, 3000);

	// Render loops
	
	var renderLine = function () {
		scene.remove(line.object);

		line.geometry = line.path.createGeometry( line.curve.getPoints(50) );
		line.geometry.computeLineDistances();

		line.object.geometry = line.geometry;

		scene.add(line.object);
	};

	function render(time) {
		requestAnimationFrame( render );

		TWEEN.update();

		var adjustedLineSpeed = LINE_SPEED / line.q;

		if (line.curve.aEndAngle - adjustedLineSpeed > line.theta2) {
			line.curve.aEndAngle -= adjustedLineSpeed;
			renderLine();
		} else if (line.curve.aStartAngle - adjustedLineSpeed > line.curve.aEndAngle) {
			line.curve.aStartAngle -= LINE_SPEED / line.q;
			renderLine();
		} else {
			scene.remove(line.object);
			makeLine();
		}

		renderer.render( scene, camera );
	}

	render();
});