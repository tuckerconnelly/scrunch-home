domready( function () {
	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.z = 5;

	var renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	
	var material = new THREE.MeshBasicMaterial({
		color: 0x562872
	});

	var boxGeometry = new THREE.BoxGeometry( 5, 5, 1 );
	var cube = new THREE.Mesh( geometry, material );

	var cylinderGeometry = new THREE.CylinderGeometry( 5, 5, 1, 32 );
	var cylinder = new THREE.Mesh( cylinderGeometry, material );

	var A = new THREE.Vector2( 0, 0 );
	var B = new THREE.Vector2( 4, 0 );
	var C = new THREE.Vector2( 2, 5 );
	var prismGeometry = new PrismGeometry( [ A, B, C ], 1);
	var prism = new THREE.Mesh( prismGeometry, material );
	prism.position.set( -10, 0, 0 );
	prism.rotation.x = -Math.PI / 2;

	var particleCount = 20;
	// now create the individual particles
	for (var p = 0; p < particleCount; p++) {

		// create a particle with random
		// position values, -250 -> 250
		var pX = Math.random() * 500 - 250;
		var pY = Math.random() * 500 - 250;
		var pZ = Math.random() * 500 - 250;
		var particle = new THREE.Vector3(pX, pY, pZ);
	}

	// add it to the scene
	scene.add(pointCloud);

	function render() {
		requestAnimationFrame( render );



		renderer.render( scene, camera );
	}

	render();
});