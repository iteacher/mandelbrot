// src/js/main.ts

import * as THREE from 'three';
import particleImage from '../../public/assets/textures/particle.png'; // Corrected path

// Scene Setup
const scene = new THREE.Scene();

// Camera Setup
const camera = new THREE.PerspectiveCamera(
  75, // Field of View
  window.innerWidth / window.innerHeight, // Aspect Ratio
  0.1, // Near Clipping Plane
  5000 // Far Clipping Plane
);
camera.position.z = 1000; // Position the camera away from the origin
camera.lookAt(new THREE.Vector3(0, 0, 0)); // Ensure camera looks at origin

// Renderer Setup
const renderer = new THREE.WebGLRenderer({
  antialias: true, // Smooth edges
  alpha: false,    // Opaque background
});
renderer.setClearColor(0x000000, 1); // Opaque black background
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Handle Window Resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Load Particle Texture
const loader = new THREE.TextureLoader();
const particleTexture = loader.load(particleImage, undefined, undefined, (err) => {
  console.error('Failed to load particle texture:', err);
});
particleTexture.minFilter = THREE.LinearFilter;
particleTexture.magFilter = THREE.LinearFilter;
particleTexture.wrapS = THREE.ClampToEdgeWrapping;
particleTexture.wrapT = THREE.ClampToEdgeWrapping;

// Particle Count
const PARTICLE_COUNT = 100000; // Reduced particle count for testing

// Create BufferGeometry
const geometry = new THREE.BufferGeometry();

// Initialize buffer attributes
const positions = new Float32Array(PARTICLE_COUNT * 3); // x, y, z
const colors = new Float32Array(PARTICLE_COUNT * 3);    // r, g, b
const sizes = new Float32Array(PARTICLE_COUNT);         // size
const velocities = new Float32Array(PARTICLE_COUNT * 3); // vx, vy, vz

// Populate buffer attributes with initial values
for (let i = 0; i < PARTICLE_COUNT; i++) {
  // Position: Random within a cube of size 1000
  positions[i * 3] = (Math.random() - 0.5) * 1000;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;

  // Color: Random RGB
  colors[i * 3] = Math.random();
  colors[i * 3 + 1] = Math.random();
  colors[i * 3 + 2] = Math.random();

  // Size: Base size
  sizes[i] = 5.0;

  // Velocity: Random small values
  velocities[i * 3] = (Math.random() - 0.5) * 2;
  velocities[i * 3 + 1] = (Math.random() - 0.5) * 2;
  velocities[i * 3 + 2] = (Math.random() - 0.5) * 2;
}

// Log particle count and details of 3 random particles
console.log(`Total particles created: ${PARTICLE_COUNT}`);
for (let i = 0; i < 3; i++) {
  const randomIndex = Math.floor(Math.random() * PARTICLE_COUNT);
  console.log(`Particle ${i + 1}: Position = (${positions[randomIndex * 3]}, ${positions[randomIndex * 3 + 1]}, ${positions[randomIndex * 3 + 2]}), Size = ${sizes[randomIndex]}`);
}

// Assign attributes to geometry
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
geometry.setAttribute('particleColor', new THREE.BufferAttribute(colors, 3));
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

// Temporary: Use PointsMaterial for Testing
const material = new THREE.PointsMaterial({
  size: 5,
  map: particleTexture,
  vertexColors: true,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

// Create Points and add to scene
const particles = new THREE.Points(geometry, material);
scene.add(particles);

// Clock for deltaTime
const clock = new THREE.Clock();

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta(); // Time elapsed since last frame in seconds

  // Update particle positions based on velocity
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Update positions
    positions[i * 3] += velocities[i * 3] * deltaTime * 60.0;
    positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime * 60.0;
    positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime * 60.0;

    // Boundary check and reset to origin if out of bounds
    if (
      positions[i * 3] > 1000 || positions[i * 3] < -1000 ||
      positions[i * 3 + 1] > 1000 || positions[i * 3 + 1] < -1000 ||
      positions[i * 3 + 2] > 1000 || positions[i * 3 + 2] < -1000
    ) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }
  }

  // Flag position attribute as needing update
  geometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}

animate();
