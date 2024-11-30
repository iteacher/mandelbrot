// src/js/main_flaming1.ts

import * as THREE from 'three';

// Scene Setup
const scene = new THREE.Scene();
console.log('main_flaming1.ts loaded');

// Camera Setup
const camera = new THREE.PerspectiveCamera(
  75, // Field of View
  window.innerWidth / window.innerHeight, // Aspect Ratio
  0.1, // Near Clipping Plane
  1000 // Far Clipping Plane
);
camera.position.z = 50; // Move the camera closer to the particles

// Renderer Setup
const renderer = new THREE.WebGLRenderer({
  antialias: true, // Smooth edges
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create particles
const PARTICLE_COUNT = 10000; // Increased for denser smoke effect
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3); // x, y, z
const sizes = new Float32Array(PARTICLE_COUNT); // size
const opacities = new Float32Array(PARTICLE_COUNT); // opacity for burning effect
const velocities = new Float32Array(PARTICLE_COUNT * 3); // for movement

// Populate buffer attributes with initial values
for (let i = 0; i < PARTICLE_COUNT; i++) {
  // Position: Random within a smaller cube for denser appearance
  positions[i * 3] = (Math.random() - 0.5) * 300;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 300;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 300;

  // Size: Varied sizes for more natural look
  sizes[i] = Math.random() * 12 + 6;

  // Opacity: Random for burning effect
  opacities[i] = Math.random() * 0.7 + 0.1;
  
  // Velocity: Slow upward drift
  velocities[i * 3] = (Math.random() - 0.5) * 0.2;
  velocities[i * 3 + 1] = Math.random() * 0.2; // Upward drift
  velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
}

// Assign attributes to geometry
// Author: Julian Manders-Jones
// License: MIT

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

// Create custom shader material for burning effect
const material = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    time: { value: 0 }
  },
  vertexShader: `
    attribute float size;
    attribute float opacity;
    varying float vOpacity;
    
    void main() {
      vOpacity = opacity;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying float vOpacity;
    uniform float time;

    void main() {
      float r = length(gl_PointCoord - vec2(0.5));
      if (r > 0.5) discard;

      // Flickering effect
      float flicker = 0.5 + 0.5 * sin(time * 10.0 + gl_FragCoord.x * 0.1);
      float alpha = smoothstep(0.5, 0.0, r) * vOpacity * flicker;

      // Color gradient for burning effect
      vec3 color = vec3(1.0, 0.5, 0.0) * flicker; // Reddish-orange color
      gl_FragColor = vec4(color, alpha);
    }
  `
});

// Create Points and add to scene
const particles = new THREE.Points(geometry, material);
scene.add(particles);

// Animation
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  material.uniforms.time.value += delta;

  // Update particle positions
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] += velocities[i * 3];
    positions[i * 3 + 1] += velocities[i * 3 + 1];
    positions[i * 3 + 2] += velocities[i * 3 + 2];

    // Reset particles that move too far
    if (positions[i * 3 + 1] > 150) {
      positions[i * 3 + 1] = -150;
      positions[i * 3] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
    }
  }

  geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
