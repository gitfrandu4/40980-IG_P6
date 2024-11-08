import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

let scene, renderer;
let camera, spaceshipCamera, currentCamera;
let camcontrols1;
let planets = [];
let ship;
let gui;
let options = {
	cameraView: 'sistema', // default view is main camera,
};
let cubeCamera;

// Declare the sun and planets globally
let sun;
let mercury, venus, earth, mars, jupiter, saturn, uranus, neptune;

let keyState = {}; // Track keyboard input
let shipMoving = true; // Ship movement state
let previousCameraView = options.cameraView; // Track camera view changes

init();
animationLoop();

function init() {
	// Scene and Renderer
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	document.body.appendChild(renderer.domElement);

	// Cameras
	camera = new THREE.PerspectiveCamera(
		40,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	camera.position.set(0, 50, 100);

	spaceshipCamera = new THREE.PerspectiveCamera(
		60,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);

	currentCamera = camera;

	// Controls
	camcontrols1 = new OrbitControls(camera, renderer.domElement);
	camcontrols1.enableDamping = true;

	// Ambient Light
	const ambientLight = new THREE.AmbientLight(0x444444);
	scene.add(ambientLight);

	// Sun (Light Source)
	const sunTexture = new THREE.TextureLoader().load(
		'https://cdn.glitch.global/4ef4523f-860d-4be6-8e31-51b2292cc4c4/2k_sun.jpg'
	);
	const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
	const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
	sun = new THREE.Mesh(sunGeometry, sunMaterial);
	sun.position.set(0, 0, 0);
	scene.add(sun);

	const sunLight = new THREE.PointLight(0xffffff, 2, 0);
	sunLight.position.set(0, 0, 0);
	sunLight.castShadow = true;
	scene.add(sunLight);

	// Milky Way background
	const milkyWayTexture = new THREE.TextureLoader().load(
		'https://cdn.glitch.global/4ef4523f-860d-4be6-8e31-51b2292cc4c4/8k_stars_milky_way.jpg'
	);
	const milkyWayGeometry = new THREE.SphereGeometry(500, 64, 64);
	const milkyWayMaterial = new THREE.MeshBasicMaterial({
		map: milkyWayTexture,
		side: THREE.BackSide,
	});
	const milkyWay = new THREE.Mesh(milkyWayGeometry, milkyWayMaterial);
	scene.add(milkyWay);

	// Planets
	createPlanets();

	// Spaceship
	createSpaceship();

	// Keyboard Event Listeners
	document.addEventListener('keydown', (event) => {
		keyState[event.code] = true;
	});

	document.addEventListener('keyup', (event) => {
		keyState[event.code] = false;
	});

	// GUI
	gui = new GUI();
	gui
		.add(options, 'cameraView', ['sistema', 'nave'])
		.name('Cámara')
		.onChange(() => {
			// Update controls display
			if (options.cameraView === 'nave') {
				currentCamera = spaceshipCamera;
				camcontrols1.enabled = false;
				document.getElementById('spaceship-controls').style.display = 'block';
				document.getElementById('system-controls').style.display = 'none';
			} else {
				currentCamera = camera;
				camcontrols1.enabled = true;
				document.getElementById('spaceship-controls').style.display = 'none';
				document.getElementById('system-controls').style.display = 'block';
			}
		});

	// Window Resize Handler
	window.addEventListener('resize', onWindowResize);
}

function createPlanets() {
	// Mercury
	const mercuryTexture = new THREE.TextureLoader().load(
		'https://cdn.glitch.global/4ef4523f-860d-4be6-8e31-51b2292cc4c4/2k_mercury.jpg'
	);
	const mercuryGeometry = new THREE.SphereGeometry(1, 32, 32);
	const mercuryMaterial = new THREE.MeshPhongMaterial({ map: mercuryTexture });
	mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
	mercury.castShadow = true;
	mercury.receiveShadow = true;
	const mercuryOrbitRadius = 15;
	const mercuryAngle = Math.random() * Math.PI * 2;
	mercury.position.set(
		mercuryOrbitRadius * Math.cos(mercuryAngle),
		0,
		mercuryOrbitRadius * Math.sin(mercuryAngle)
	);
	mercury.userData = {
		orbitRadius: mercuryOrbitRadius,
		orbitSpeed: 0.02,
		angle: mercuryAngle,
	};
	planets.push(mercury);
	scene.add(mercury);
	drawOrbit(mercuryOrbitRadius);

	// Venus
	const venusTexture = new THREE.TextureLoader().load(
		'https://cdn.glitch.global/4ef4523f-860d-4be6-8e31-51b2292cc4c4/2k_venus_surface.jpg'
	);
	const venusGeometry = new THREE.SphereGeometry(1.5, 32, 32);
	const venusMaterial = new THREE.MeshPhongMaterial({ map: venusTexture });
	venus = new THREE.Mesh(venusGeometry, venusMaterial);
	venus.castShadow = true;
	venus.receiveShadow = true;
	const venusOrbitRadius = 20;
	const venusAngle = Math.random() * Math.PI * 2;
	venus.position.set(
		venusOrbitRadius * Math.cos(venusAngle),
		0,
		venusOrbitRadius * Math.sin(venusAngle)
	);
	venus.userData = {
		orbitRadius: venusOrbitRadius,
		orbitSpeed: 0.015,
		angle: venusAngle,
	};
	planets.push(venus);
	scene.add(venus);
	drawOrbit(venusOrbitRadius);

	// Earth with moon, clouds, and specular map
	const earthTexture = new THREE.TextureLoader().load(
		'https://cdn.glitch.global/4ef4523f-860d-4be6-8e31-51b2292cc4c4/2k_earth_daymap.jpg'
	);
	// const earthSpecular = new THREE.TextureLoader().load(
	// 	'https://cdn.glitch.global/4ef4523f-860d-4be6-8e31-51b2292cc4c4/2k_earth_specular_map.tif'
	// );
	const earthClouds = new THREE.TextureLoader().load(
		'https://cdn.glitch.global/4ef4523f-860d-4be6-8e31-51b2292cc4c4/2k_earth_clouds.jpg'
	);
	const earthGeometry = new THREE.SphereGeometry(2, 32, 32);
	const earthMaterial = new THREE.MeshPhongMaterial({
		map: earthTexture,
		// specularMap: earthSpecular,
		specular: new THREE.Color('grey'),
	});
	earth = new THREE.Mesh(earthGeometry, earthMaterial);
	earth.castShadow = true;
	earth.receiveShadow = true;
	const earthOrbitRadius = 25;
	const earthAngle = Math.random() * Math.PI * 2;
	earth.position.set(
		earthOrbitRadius * Math.cos(earthAngle),
		0,
		earthOrbitRadius * Math.sin(earthAngle)
	);
	earth.userData = {
		orbitRadius: earthOrbitRadius,
		orbitSpeed: 0.01,
		angle: earthAngle,
	};
	earth.position.set(earthOrbitRadius, 0, 0);
	planets.push(earth);
	scene.add(earth);
	drawOrbit(earthOrbitRadius);

	// Earth cloud layer
	const cloudsGeometry = new THREE.SphereGeometry(2.1, 32, 32);
	const cloudsMaterial = new THREE.MeshPhongMaterial({
		map: earthClouds,
		transparent: true,
		opacity: 0.5,
	});
	const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
	earth.add(clouds);

	// Moon
	const moonTexture = new THREE.TextureLoader().load(
		'https://cdn.glitch.global/4ef4523f-860d-4be6-8e31-51b2292cc4c4/2k_moon.jpg'
	);
	const moonGeometry = new THREE.SphereGeometry(0.5, 32, 32);
	const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
	const moon = new THREE.Mesh(moonGeometry, moonMaterial);
	moon.position.set(4, 0, 0); // Positioning relative to Earth
	earth.add(moon);

	// Mars
	const marsTexture = new THREE.TextureLoader().load(
		'https://cdn.glitch.global/4ef4523f-860d-4be6-8e31-51b2292cc4c4/2k_mars.jpg'
	);
	const marsGeometry = new THREE.SphereGeometry(1.2, 32, 32);
	const marsMaterial = new THREE.MeshPhongMaterial({ map: marsTexture });
	mars = new THREE.Mesh(marsGeometry, marsMaterial);
	mars.castShadow = true;
	mars.receiveShadow = true;
	const marsOrbitRadius = 30;
	const marsAngle = Math.random() * Math.PI * 2;
	mars.position.set(
		marsOrbitRadius * Math.cos(marsAngle),
		0,
		marsOrbitRadius * Math.sin(marsAngle)
	);
	mars.userData = {
		orbitRadius: marsOrbitRadius,
		orbitSpeed: 0.008,
		angle: marsAngle,
	};
	planets.push(mars);
	scene.add(mars);
	drawOrbit(marsOrbitRadius);

	// Jupiter
	const jupiterTexture = new THREE.TextureLoader().load(
		'https://cdn.glitch.global/4ef4523f-860d-4be6-8e31-51b2292cc4c4/2k_jupiter.jpg'
	);
	const jupiterGeometry = new THREE.SphereGeometry(4, 32, 32);
	const jupiterMaterial = new THREE.MeshPhongMaterial({ map: jupiterTexture });
	jupiter = new THREE.Mesh(jupiterGeometry, jupiterMaterial);
	jupiter.castShadow = true;
	jupiter.receiveShadow = true;
	const jupiterOrbitRadius = 40;
	const jupiterAngle = Math.random() * Math.PI * 2;
	jupiter.position.set(
		jupiterOrbitRadius * Math.cos(jupiterAngle),
		0,
		jupiterOrbitRadius * Math.sin(jupiterAngle)
	);
	jupiter.userData = {
		orbitRadius: jupiterOrbitRadius,
		orbitSpeed: 0.005,
		angle: jupiterAngle,
	};
	planets.push(jupiter);
	scene.add(jupiter);
	drawOrbit(jupiterOrbitRadius);

	// Saturn with rings
	const saturnTexture = new THREE.TextureLoader().load(
		'https://cdn.glitch.global/4ef4523f-860d-4be6-8e31-51b2292cc4c4/2k_saturn.jpg'
	);
	const saturnGeometry = new THREE.SphereGeometry(3.5, 32, 32);
	const saturnMaterial = new THREE.MeshPhongMaterial({ map: saturnTexture });
	saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
	saturn.castShadow = true;
	saturn.receiveShadow = true;
	const saturnOrbitRadius = 50;
	const saturnAngle = Math.random() * Math.PI * 2;
	saturn.position.set(
		saturnOrbitRadius * Math.cos(saturnAngle),
		0,
		saturnOrbitRadius * Math.sin(saturnAngle)
	);
	saturn.userData = {
		orbitRadius: saturnOrbitRadius,
		orbitSpeed: 0.004,
		angle: saturnAngle,
	};
	planets.push(saturn);
	scene.add(saturn);
	drawOrbit(saturnOrbitRadius);

	// Saturn rings
	const ringGeometry = new THREE.RingGeometry(
		4.5, // radio interno
		8, // radio externo
		128, // segmentos
		1, // número de anillos
		0, // ángulo inicial
		Math.PI * 2 // ángulo final
	);
	const ringMaterial = new THREE.MeshBasicMaterial({
		map: new THREE.TextureLoader().load(
			'https://cdn.glitch.global/4ef4523f-860d-4be6-8e31-51b2292cc4c4/2k_saturn_ring_alpha.png'
		),
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.8,
		alphaTest: 0.1,
	});
	const rings = new THREE.Mesh(ringGeometry, ringMaterial);
	rings.rotation.x = Math.PI / 2;
	saturn.add(rings);

	// Uranus
	const uranusTexture = new THREE.TextureLoader().load(
		'https://cdn.glitch.global/4ef4523f-860d-4be6-8e31-51b2292cc4c4/2k_uranus.jpg'
	);
	const uranusGeometry = new THREE.SphereGeometry(2.5, 32, 32);
	const uranusMaterial = new THREE.MeshPhongMaterial({ map: uranusTexture });
	uranus = new THREE.Mesh(uranusGeometry, uranusMaterial);
	uranus.castShadow = true;
	uranus.receiveShadow = true;
	const uranusOrbitRadius = 60;
	const uranusAngle = Math.random() * Math.PI * 2;
	uranus.position.set(
		uranusOrbitRadius * Math.cos(uranusAngle),
		0,
		uranusOrbitRadius * Math.sin(uranusAngle)
	);
	uranus.userData = {
		orbitRadius: uranusOrbitRadius,
		orbitSpeed: 0.003,
		angle: uranusAngle,
	};
	planets.push(uranus);
	scene.add(uranus);
	drawOrbit(uranusOrbitRadius);

	// Neptune
	const neptuneTexture = new THREE.TextureLoader().load(
		'https://cdn.glitch.global/4ef4523f-860d-4be6-8e31-51b2292cc4c4/2k_neptune.jpg'
	);
	const neptuneGeometry = new THREE.SphereGeometry(2.5, 32, 32);
	const neptuneMaterial = new THREE.MeshPhongMaterial({ map: neptuneTexture });
	neptune = new THREE.Mesh(neptuneGeometry, neptuneMaterial);
	neptune.castShadow = true;
	neptune.receiveShadow = true;
	const neptuneOrbitRadius = 70;
	const neptuneAngle = Math.random() * Math.PI * 2;
	neptune.position.set(
		neptuneOrbitRadius * Math.cos(neptuneAngle),
		0,
		neptuneOrbitRadius * Math.sin(neptuneAngle)
	);
	neptune.userData = {
		orbitRadius: neptuneOrbitRadius,
		orbitSpeed: 0.003,
		angle: neptuneAngle,
	};
	planets.push(neptune);
	scene.add(neptune);
	drawOrbit(neptuneOrbitRadius);
}
function createSpaceship() {
	// Create a WebGLCubeRenderTarget instead of CubeCamera directly
	const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
		format: THREE.RGBFormat,
		generateMipmaps: true,
		minFilter: THREE.LinearMipmapLinearFilter,
	});

	// Create CubeCamera with the render target
	cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
	scene.add(cubeCamera);

	// Create spaceship with reflective material
	const geometry = new THREE.SphereGeometry(2, 32, 32);
	const material = new THREE.MeshBasicMaterial({
		envMap: cubeRenderTarget.texture,
		reflectivity: 1.0,
	});
	ship = new THREE.Mesh(geometry, material);
	ship.position.set(0, 0, 70);
	ship.rotation.y = Math.PI; // Face the ship towards the scene

	// Add camera to ship
	ship.add(spaceshipCamera);
	spaceshipCamera.position.set(10, 20, -10);
	spaceshipCamera.lookAt(sun.position);
	scene.add(ship);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	spaceshipCamera.aspect = window.innerWidth / window.innerHeight;
	spaceshipCamera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animatePlanets() {
	planets.forEach((planet) => {
		planet.userData.angle += planet.userData.orbitSpeed;
		planet.position.set(
			planet.userData.orbitRadius * Math.cos(planet.userData.angle),
			0,
			planet.userData.orbitRadius * Math.sin(planet.userData.angle)
		);
		planet.rotation.y += 0.01;
	});
}

function drawOrbit(radius) {
	const points = [];
	const segments = 64;

	for (let i = 0; i <= segments; i++) {
		const theta = (i / segments) * Math.PI * 2;
		points.push(
			new THREE.Vector3(radius * Math.cos(theta), 0, radius * Math.sin(theta))
		);
	}

	const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
	const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
	const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
	scene.add(orbit);
}

function animationLoop() {
	requestAnimationFrame(animationLoop);

	animatePlanets();

	// Rotate the sun for visual effect
	sun.rotation.y += 0.005;

	// Check for camera view change to reset the ship
	if (previousCameraView !== options.cameraView) {
		if (options.cameraView === 'sistema') {
			// Reset the ship to initial state
			ship.position.set(0, 0, 70);
			ship.rotation.set(0, Math.PI, 0);
			shipMoving = true; // Ensure the ship moves automatically
		}
		previousCameraView = options.cameraView;
	}

	// Spaceship Controls
	if (options.cameraView === 'nave') {
		if (shipMoving) {
			const moveSpeed = 0.5;
			const rotationSpeed = 0.05;

			if (keyState['ArrowUp']) {
				ship.rotation.x += rotationSpeed;
			}
			if (keyState['ArrowDown']) {
				ship.rotation.x -= rotationSpeed;
			}
			if (keyState['ArrowLeft']) {
				ship.rotation.y += rotationSpeed;
			}
			if (keyState['ArrowRight']) {
				ship.rotation.y -= rotationSpeed;
			}
			if (keyState['KeyQ']) {
				ship.translateY(moveSpeed);
			}
			if (keyState['KeyE']) {
				ship.translateY(-moveSpeed);
			}
			if (keyState['KeyW']) {
				ship.translateZ(moveSpeed);
			}
			if (keyState['KeyS']) {
				ship.translateZ(-moveSpeed);
			}
			if (keyState['KeyA']) {
				ship.translateX(moveSpeed);
			}
			if (keyState['KeyD']) {
				ship.translateX(-moveSpeed);
			}
		}
	} else {
		// In main view, ship moves automatically
		ship.position.z -= 0.1;
		if (ship.position.z < -100) {
			ship.position.set(0, 0, 70);
			ship.rotation.set(0, Math.PI, 0);
		}
	}

	// Update cube camera for reflections
	if (ship.visible) {
		ship.visible = false;
		cubeCamera.position.copy(ship.position);
		cubeCamera.update(renderer, scene);
		ship.visible = true;
	}

	// Update currentCamera based on options
	if (options.cameraView === 'sistema') {
		currentCamera = camera;
	} else {
		currentCamera = spaceshipCamera;
	}

	// Update controls
	if (currentCamera === camera) {
		camcontrols1.update();
	}

	// Render the scene with the current camera
	renderer.render(scene, currentCamera);
}
