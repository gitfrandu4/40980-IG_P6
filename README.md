# 🌌 Sistema Solar Interactivo con Three.js


![Three.js](https://img.shields.io/badge/Three.js-%23FFFFFF.svg?style=for-the-badge&logo=three.js&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)

## Tabla de Contenidos

- [🌌 Sistema Solar Interactivo con Three.js](#-sistema-solar-interactivo-con-threejs)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Introducción](#introducción)
    - [Ejemplo mínimo](#ejemplo-mínimo)
    - [Objetos](#objetos)
    - [Modularidad](#modularidad)
    - [Asistentes](#asistentes)
    - [Control orbital](#control-orbital)
    - [Coordenadas del puntero](#coordenadas-del-puntero)
    - [Rotaciones arbitrarias](#rotaciones-arbitrarias)
  - [Detalles Técnicos](#detalles-técnicos)
  - [Mejoras Futuras](#mejoras-futuras)
  - [Tarea: Sistema Planetario](#tarea-sistema-planetario)
    - [Características](#características)
    - [Conceptos Aplicados](#conceptos-aplicados)
      - [Luces](#luces)
      - [Sombras](#sombras)
      - [Materiales y Texturas](#materiales-y-texturas)
      - [Control de Cámara](#control-de-cámara)
    - [Instalación](#instalación)
    - [Uso](#uso)
  - [Código Destacado](#código-destacado)
    - [Creación de Planetas](#creación-de-planetas)
    - [Animación de Planetas](#animación-de-planetas)
    - [Control de la Nave Espacial](#control-de-la-nave-espacial)
  - [Referencias](#referencias)

## Introducción

Este proyecto es una representación interactiva del sistema solar utilizando **Three.js**, una biblioteca de JavaScript para crear gráficos 3D en el navegador. El objetivo es simular un sistema planetario con al menos cinco planetas y una luna, permitiendo alternar entre dos vistas:

- **Vista del Sistema**: Una visión general del sistema solar.
- **Vista de la Nave**: Una vista en primera persona desde una nave espacial que puede explorar el sistema.

<img src="./images/planetary-simulation.gif" alt="Sistema Solar Interactivo" width="800">

### Ejemplo mínimo

Comenzamos con un ejemplo básico que dibuja un cubo verde. El siguiente código crea una escena, una cámara, un renderizador y agrega un cubo a la escena:

```javascript
import * as THREE from “three”;

// Crear la escena
const scene = new THREE.Scene();

// Configurar la cámara
const camera = new THREE.PerspectiveCamera(
  75, // Campo de visión
  window.innerWidth / window.innerHeight, // Relación de aspecto
  0.1, // Plano cercano
  1000 // Plano lejano
);

// Configurar el renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear una geometría de cubo
const geometry = new THREE.BoxGeometry(1, 1, 1);

// Crear un material básico de color verde
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// Crear el cubo y agregarlo a la escena
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Posicionar la cámara
camera.position.z = 5;

// Función de animación
function animate() {
  requestAnimationFrame(animate);

  // Rotar el cubo en cada frame
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}
animate();
```

### Objetos

Three.js proporciona varias geometrías predefinidas. Por ejemplo, para crear una esfera en lugar de un cubo:

```javascript
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0x156289, wireframe: true });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);
```

Ejercicios:

* Modifica la propiedad wireframe del material entre true y false. ¿Qué observas?

### Modularidad

Para manejar múltiples objetos y mantener el código organizado, es útil crear funciones para crear objetos. Por ejemplo:

```javascript
function createSphere(radius, widthSegments, heightSegments, color) {
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const sphere = new THREE.Mesh(geometry, material);
  return sphere;
}

// Uso de la función
const sphere1 = createSphere(1, 32, 32, 0xff0000);
sphere1.position.x = -2;
scene.add(sphere1);

const sphere2 = createSphere(1, 32, 32, 0x0000ff);
sphere2.position.x = 2;
scene.add(sphere2);
```

### Asistentes

Para ayudar a visualizar la escena, puedes agregar asistentes como una rejilla:

```javascript
// Crear una rejilla de referencia
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);
```

### Control orbital

Para permitir que el usuario explore la escena con el ratón, puedes utilizar OrbitControls:

```javascript
import { OrbitControls } from ‘three/examples/jsm/controls/OrbitControls.js’;

const controls = new OrbitControls(camera, renderer.domElement);
```

### Coordenadas del puntero

Puedes utilizar Raycaster para detectar interacciones con objetos en la escena:

```javascript
// Crear un raycaster y un vector para almacenar la posición del ratón
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Evento al mover el ratón
function onMouseMove(event) {
  // Normalizar coordenadas del ratón
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // Actualizar el raycaster
  raycaster.setFromCamera(mouse, camera);

  // Calcular intersecciones
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    // Interacción con el objeto
    intersects[0].object.material.color.set(0xff0000);
  }
}

window.addEventListener(‘mousemove’, onMouseMove, false);
```

Ejercicio:

* Aplica `Raycaster` para seleccionar esferas en tu escena y cambiar su color al hacer clic.

### Rotaciones arbitrarias

Para simular órbitas de planetas alrededor de una estrella:

```javascript
function createPlanet(distance, size, speed, color) {
  const planet = createSphere(size, 32, 32, color);
    planet.userData = { distance: distance, speed: speed };
    scene.add(planet);
    return planet;
  }

  // En la función de animación
  planets.forEach(function(planet) {
    planet.position.x = Math.cos(time * planet.userData.speed) * planet.userData.distance;
    planet.position.z = Math.sin(time * planet.userData.speed) * planet.userData.distance;
  });
```

## Detalles Técnicos

- **Texturas**: Las texturas se cargan utilizando `THREE.TextureLoader()` y se aplican a **materiales Phong** para permitir reflejos especulares.
- **Iluminación**:
  - **Luz Ambiental**: Proporciona una iluminación base para todos los objetos.
  - **Luz Puntual (Sol)**: Simula la luz emitida por el sol, afectando a los planetas y otros objetos.
- **Materiales**:
  - **MeshPhongMaterial**: Utilizado para planetas y objetos que requieren interacción con la luz.
  - **MeshBasicMaterial**: Utilizado para el sol y el fondo estelar, ya que no necesitan reaccionar a la iluminación de la escena.
- **Física**:
  - **Órbitas Planetarias**: Calculadas y animadas mediante actualización de ángulos y posiciones en cada frame.
  - **Rotación de Planetas**: Cada planeta rota sobre su propio eje para simular el día planetario.

## Mejoras Futuras

* **Añadir Más Planetas o Satélites**: Como Plutón o satélites de otros planetas.
* **Implementar Colisiones**: Detectar colisiones entre la nave y planetas para mayor interactividad.
* **Añadir Sonido**: Incorporar efectos de sonido para una experiencia más inmersiva.
* **Optimización**: Mejorar el rendimiento en dispositivos de bajos recursos.

## Tarea: Sistema Planetario

### Características

- 🌍 **Sistema Solar Completo**: Incluye el Sol, ocho planetas, sus órbitas y una luna.
- 🚀 **Nave Espacial Interactiva**: Controla una nave espacial y explora el sistema solar.
- 🎥 **Cambio de Cámara**: Alterna entre la vista del sistema y la vista desde la nave.
- 💡 **Luces y Sombras Realistas**: Utiliza diferentes tipos de luces y sombras para mayor realismo.
- 🎨 **Materiales y Texturas Detalladas**: Cada planeta tiene texturas detalladas, incluyendo mapas de rugosidad y especulares.
- 🛠️ **Interfaz Interactiva**: Controla parámetros de la escena mediante una GUI.

### Conceptos Aplicados

#### Luces

Se han implementado diferentes tipos de luces para iluminar la escena de manera realista:

- **Luz Ambiente**: Proporciona una iluminación base uniforme en toda la escena. No tiene dirección ni posición específica.
  
  ```javascript
  const ambientLight = new THREE.AmbientLight(0x444444);
  scene.add(ambientLight);
  ```

- **Luz Direccional**: Emula la luz del Sol que ilumina los planetas desde una dirección específica.

  ```javascript
  const sunLight = new THREE.PointLight(0xffffff, 2, 0);
  sunLight.position.set(0, 0, 0);
  sunLight.castShadow = true;
  scene.add(sunLight);
  ```

#### Sombras 

Para añadir realismo, se han activado sombras en los objetos:

- **Activación de Sombras en el Renderizador**:

  ```javascript
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  ```

- **Objetos que Proyectan y Reciben Sombras**:

  ```javascript
  mercury.castShadow = true;
  mercury.receiveShadow = true;
  ```

#### Materiales y Texturas

Se utilizan materiales avanzados y texturas detalladas para los planetas y la nave:

- **Texturas Difusas, de Rugosidad y Especulares**: Para simular detalles como relieves y brillos.

  ```javascript
  const earthTexture = new THREE.TextureLoader().load('ruta_a_la_textura');
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    bumpMap: earthBumpMap,
    bumpScale: 0.5,
    specularMap: earthSpecularMap,
    specular: new THREE.Color('grey'),
  });
  ```
  - **Materiales Phong**: Se utilizan materiales Phong para los planetas, permitiendo reflejos especulares y respuestas realistas a la iluminación.

- **Transparencias y Nubes**: Para simular la atmósfera terrestre con capas de nubes.

  ```javascript
  const cloudsMaterial = new THREE.MeshPhongMaterial({
    map: earthClouds,
    transparent: true,
    opacity: 0.5,
  });
  const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
  earth.add(clouds);
  ```

#### Control de Cámara

Se implementan controles para navegar por la escena y alternar entre vistas:

- **OrbitControls**: Permite orbitar alrededor del sistema solar en la vista general.

  ```javascript
  const camcontrols1 = new OrbitControls(camera, renderer.domElement);
  camcontrols1.enableDamping = true;
  ```

- **Cámara de la Nave**: Vista en primera persona desde la nave espacial.

  ```javascript
  spaceshipCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  ship.add(spaceshipCamera);
  ```

- **Interfaz GUI**: Para cambiar entre las diferentes vistas de cámara.

  ```javascript
  gui.add(options, 'cameraView', ['sistema', 'nave']).name('Cámara').onChange(() => {
    if (options.cameraView === 'nave') {
      currentCamera = spaceshipCamera;
    } else {
      currentCamera = camera;
    }
  });
  ```

### Instalación

1. **Clona el repositorio**:

   ```bash
   git clone https://github.com/gitfrandu4/ThreeJS-Sistema-Solar.git
   ```

2. **Instala las dependencias**:

   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**:

   ```bash
   npm start
   ```

### Uso

- **Vista del Sistema**: Usa el mouse y los controles de órbita para explorar el sistema solar.
- **Vista de la Nave**: Cambia a la cámara de la nave y utiliza las teclas para controlarla:
  - **Flechas o WASD**: Para mover la nave.
  - **Q/E**: Para ascender o descender.

## Código Destacado

### Creación de Planetas

Se utiliza una función personalizada para crear cada planeta con sus propiedades y texturas:

```javascript
function createPlanet(name, size, textureUrl, orbitRadius, orbitSpeed) {
  const texture = new THREE.TextureLoader().load(textureUrl);
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshPhongMaterial({ map: texture });
  const planet = new THREE.Mesh(geometry, material);
  planet.castShadow = true;
  planet.receiveShadow = true;
  // Configuración de órbita
  planet.userData = {
    orbitRadius: orbitRadius,
    orbitSpeed: orbitSpeed,
    angle: Math.random() * Math.PI * 2,
  };
  scene.add(planet);
  return planet;
}
```

### Animación de Planetas

Los planetas orbitan alrededor del Sol mediante una función de animación:

```javascript
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
```

### Control de la Nave Espacial

La nave espacial se controla mediante eventos de teclado:

```javascript
document.addEventListener('keydown', (event) => {
  keyState[event.code] = true;
});

document.addEventListener('keyup', (event) => {
  keyState[event.code] = false;
});

function controlSpaceship() {
  const moveSpeed = 0.5;
  const rotationSpeed = 0.05;

  if (keyState['ArrowUp'] || keyState['KeyW']) {
    ship.translateZ(-moveSpeed);
  }
  if (keyState['ArrowDown'] || keyState['KeyS']) {
    ship.translateZ(moveSpeed);
  }
  if (keyState['ArrowLeft'] || keyState['KeyA']) {
    ship.rotation.y += rotationSpeed;
  }
  if (keyState['ArrowRight'] || keyState['KeyD']) {
    ship.rotation.y -= rotationSpeed;
  }
  // Ascenso y descenso
  if (keyState['KeyQ']) {
    ship.translateY(moveSpeed);
  }
  if (keyState['KeyE']) {
    ship.translateY(-moveSpeed);
  }
}
```

## Referencias

- [Documentación](https://threejs.org/docs/index.html)  
- [Three.js Textures](https://www.solarsystemscope.com/textures/)
