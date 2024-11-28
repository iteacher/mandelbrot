// src/js/main.ts

import * as THREE from 'three';

// Scene Setup
const scene = new THREE.Scene();

// Camera Setup
const camera = new THREE.PerspectiveCamera(
  75, // Field of View
  window.innerWidth / window.innerHeight, // Aspect Ratio
  0.1, // Near Clipping Plane
  1000 // Far Clipping Plane
);
camera.position.z = 5; // Position the camera

console.log('Particle initialised');
// Renderer Setup
const renderer = new THREE.WebGLRenderer({
  antialias: true, // Smooth edges
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a single particle (sphere)
const geometry = new THREE.SphereGeometry(0.5, 32, 32); // Radius, width segments, height segments
const material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White color
const particle = new THREE.Mesh(geometry, material);
scene.add(particle); // Add the particle to the scene

// Render the scene
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
