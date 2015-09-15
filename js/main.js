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

	window.addEventListener( 'resize', function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		camera.position.z = window.innerHeight;

		renderer.setSize( window.innerWidth, window.innerHeight );

		particles.forEach( function (particle) {
			particle.floatingTween.stop();
			particle.mesh.position.set(
				particle.floatingPosition.x * (window.innerWidth / currentWidth),
				particle.floatingPosition.y * (window.innerHeight / currentHeight),
				particle.floatingPosition.z
			);

			particle.floatingPosition = {
				x: particle.mesh.position.x,
				y: particle.mesh.position.y,
				z: particle.mesh.position.z
			};

			particle.mesh.scale.set(
				particle.mesh.scale.x * (window.innerWidth / currentWidth),
				particle.mesh.scale.y * (window.innerWidth / currentWidth),
				particle.mesh.scale.z * (window.innerWidth / currentWidth)
			);

			particle.floatingTween.to({ y: particle.floatingPosition.y + FLOAT_AMOUNT });
			particle.floatingTween.start();
		});

		currentWidth = window.innerWidth;
		currentHeight = window.innerHeight;
	});

	// Particle stuff

	var particleTextChars = particleText.split('');

	var n = 0;

	particleTextChars.forEach( function (particleTextChar) {
		particleTextMaps[particleTextChar].particles.forEach( function (particlePosition) {
			var particle;

			// innerWidth of 728 gives you three width of 243 * 2 = 486
			// innerHeight of 458 gives you three height of 153 * 2 = 306
			// So with the current camera settings, 1px = .75 threejs units

			var sceneWidth = window.innerWidth * 1.5;
			var sceneHeight = window.innerHeight * 1.5;

			var floatingPosition = {
				x: Math.random()*sceneWidth - sceneWidth / 2,
				y: Math.random()*sceneHeight - sceneHeight / 2,
				z: 0
			};

			switch (n % 3) {
				case 0:
					particle = new Particle(Particle.SQUARE, floatingPosition, particlePosition);
					break;
				case 1:
					particle = new Particle(Particle.CIRCLE, floatingPosition, particlePosition);
					break;
				case 2:
					particle = new Particle(Particle.TRIANGLE, floatingPosition, particlePosition);
					break;
			}

			scene.add(particle.mesh);
			particles.push(particle);

			n++;
		});
	});

	// Render loops

	function render() {
		requestAnimationFrame( render );

		TWEEN.update();

		renderer.render( scene, camera );
	}

	render();

	// Scroll hacking

	var numberFormed = false;

	window.addEventListener('scroll', function () {
		if (document.body.scrollTop > 200 && numberFormed === false) {
			numberFormed = true;
			console.log('form');

			particles.forEach( function (particle) {
				particle.goToCharacterPosition();
			});
		} else if (document.body.scrollTop <= 200 && numberFormed === true) {
			numberFormed = false;
			console.log('dissolve');

			particles.forEach( function (particle) {
				particle.goToFloatingPosition();
			});
		}
	});
});