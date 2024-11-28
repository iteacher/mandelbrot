/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/main.ts":
/*!************************!*\
  !*** ./src/js/main.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n/* harmony import */ var _public_assets_textures_particle_png__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../public/assets/textures/particle.png */ \"./public/assets/textures/particle.png\");\n// src/js/main.ts\n\n // Adjust the path if necessary\n// Scene Setup\nvar scene = new three__WEBPACK_IMPORTED_MODULE_1__.Scene();\n// Camera Setup\nvar camera = new three__WEBPACK_IMPORTED_MODULE_1__.PerspectiveCamera(75, // Field of View\nwindow.innerWidth / window.innerHeight, // Aspect Ratio\n0.1, // Near Clipping Plane\n5000 // Far Clipping Plane\n);\ncamera.position.z = 1000; // Position the camera away from the origin\n// Renderer Setup\nvar renderer = new three__WEBPACK_IMPORTED_MODULE_1__.WebGLRenderer({\n    antialias: true,\n    alpha: true, // Transparent background\n});\nrenderer.setSize(window.innerWidth, window.innerHeight);\nrenderer.setPixelRatio(window.devicePixelRatio);\nrenderer.setClearColor(0x000000, 0); // Transparent background\ndocument.body.appendChild(renderer.domElement);\n// Handle Window Resize\nwindow.addEventListener('resize', onWindowResize, false);\nfunction onWindowResize() {\n    camera.aspect = window.innerWidth / window.innerHeight;\n    camera.updateProjectionMatrix();\n    renderer.setSize(window.innerWidth, window.innerHeight);\n}\n// Load Particle Texture\nvar loader = new three__WEBPACK_IMPORTED_MODULE_1__.TextureLoader();\nvar particleTexture = loader.load(_public_assets_textures_particle_png__WEBPACK_IMPORTED_MODULE_0__, undefined, undefined, function (err) {\n    console.error('Failed to load particle texture:', err);\n});\nparticleTexture.minFilter = three__WEBPACK_IMPORTED_MODULE_1__.LinearFilter;\nparticleTexture.magFilter = three__WEBPACK_IMPORTED_MODULE_1__.LinearFilter;\nparticleTexture.wrapS = three__WEBPACK_IMPORTED_MODULE_1__.ClampToEdgeWrapping;\nparticleTexture.wrapT = three__WEBPACK_IMPORTED_MODULE_1__.ClampToEdgeWrapping;\n// Particle Count\nvar PARTICLE_COUNT = 100; // 1 Million Particles\n// Create BufferGeometry\nvar geometry = new three__WEBPACK_IMPORTED_MODULE_1__.BufferGeometry();\n// Initialize buffer attributes\nvar positions = new Float32Array(PARTICLE_COUNT * 3); // x, y, z\nvar colors = new Float32Array(PARTICLE_COUNT * 3); // r, g, b\nvar sizes = new Float32Array(PARTICLE_COUNT); // size\nvar velocities = new Float32Array(PARTICLE_COUNT * 3); // vx, vy, vz\n// Populate buffer attributes with initial values\nfor (var i = 0; i < PARTICLE_COUNT; i++) {\n    // Position: Random within a cube of size 1000\n    positions[i * 3] = (Math.random() - 0.5) * 1000;\n    positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;\n    positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;\n    // Color: Random RGB\n    colors[i * 3] = Math.random();\n    colors[i * 3 + 1] = Math.random();\n    colors[i * 3 + 2] = Math.random();\n    // Size: Base size, can be randomized\n    sizes[i] = 5.0;\n    // Velocity: Random small values\n    velocities[i * 3] = (Math.random() - 0.5) * 2;\n    velocities[i * 3 + 1] = (Math.random() - 0.5) * 2;\n    velocities[i * 3 + 2] = (Math.random() - 0.5) * 2;\n}\n// Assign attributes to geometry\ngeometry.setAttribute('position', new three__WEBPACK_IMPORTED_MODULE_1__.BufferAttribute(positions, 3));\ngeometry.setAttribute('particleColor', new three__WEBPACK_IMPORTED_MODULE_1__.BufferAttribute(colors, 3)); // Renamed\ngeometry.setAttribute('size', new three__WEBPACK_IMPORTED_MODULE_1__.BufferAttribute(sizes, 1));\ngeometry.setAttribute('velocity', new three__WEBPACK_IMPORTED_MODULE_1__.BufferAttribute(velocities, 3));\n// Shader Material with Anti-Aliasing\nvar material = new three__WEBPACK_IMPORTED_MODULE_1__.ShaderMaterial({\n    vertexShader: /* GLSL */ \"\\n    attribute float size;\\n    attribute vec3 particleColor; // Renamed to avoid conflict\\n    attribute vec3 velocity;\\n    varying vec3 vColor;\\n    uniform float time;\\n    uniform float deltaTime;\\n\\n    void main() {\\n      vColor = particleColor;\\n\\n      // Update position based on velocity and deltaTime\\n      vec3 updatedPosition = position + velocity * deltaTime;\\n\\n      // Simple boundary check and recycle to origin\\n      if (updatedPosition.x > 1000.0 || updatedPosition.x < -1000.0 ||\\n          updatedPosition.y > 1000.0 || updatedPosition.y < -1000.0 ||\\n          updatedPosition.z > 1000.0 || updatedPosition.z < -1000.0) {\\n        updatedPosition = vec3(0.0, 0.0, 0.0); // Reset position to origin\\n        // Optionally, randomize velocity or other properties here\\n      }\\n\\n      vec4 mvPosition = modelViewMatrix * vec4(updatedPosition, 1.0);\\n      gl_PointSize = size * (300.0 / -mvPosition.z);\\n      gl_Position = projectionMatrix * mvPosition;\\n    }\\n  \",\n    fragmentShader: /* GLSL */ \"\\n    uniform sampler2D particleTexture;\\n    varying vec3 vColor;\\n\\n    void main() {\\n      vec4 texColor = texture2D(particleTexture, gl_PointCoord);\\n      if (texColor.a < 0.1) discard; // Discard low alpha fragments for anti-aliasing\\n      gl_FragColor = vec4(vColor, 1.0) * texColor;\\n    }\\n  \",\n    uniforms: {\n        particleTexture: { value: particleTexture },\n        time: { value: 0.0 },\n        deltaTime: { value: 0.0 },\n    },\n    vertexColors: true,\n    transparent: true,\n    depthWrite: false,\n    blending: three__WEBPACK_IMPORTED_MODULE_1__.AdditiveBlending, // Enhances glow effect; can use THREE.NormalBlending for standard\n});\n// Create Points and add to scene\nvar particles = new three__WEBPACK_IMPORTED_MODULE_1__.Points(geometry, material);\nscene.add(particles);\n// Clock for deltaTime\nvar clock = new three__WEBPACK_IMPORTED_MODULE_1__.Clock();\n// Animation Loop\nfunction animate() {\n    requestAnimationFrame(animate);\n    var deltaTime = clock.getDelta(); // Time elapsed since last frame in seconds\n    // Update uniforms\n    material.uniforms.time.value += deltaTime;\n    material.uniforms.deltaTime.value = deltaTime * 60.0; // Scale to simulate 60 FPS\n    renderer.render(scene, camera);\n}\nanimate();\n\n\n//# sourceURL=webpack://particle_system/./src/js/main.ts?");

/***/ }),

/***/ "./public/assets/textures/particle.png":
/*!*********************************************!*\
  !*** ./public/assets/textures/particle.png ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("module.exports = __webpack_require__.p + \"./public/assets/textures/particle.png\";\n\n//# sourceURL=webpack://particle_system/./public/assets/textures/particle.png?");

/***/ }),

/***/ "./node_modules/three/build/three.module.js":
/*!**************************************************!*\
  !*** ./node_modules/three/build/three.module.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "/";
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/js/main.ts");
/******/ 	
/******/ })()
;