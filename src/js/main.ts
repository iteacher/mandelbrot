// Author: Julian Manders-Jones
// Description:  Mandelbrot infinite zoom
// License: MIT

// Create two canvases for double buffering
const displayCanvas = document.createElement('canvas');
const bufferCanvas = document.createElement('canvas');
const displayCtx = displayCanvas.getContext('2d');
const bufferCtx = bufferCanvas.getContext('2d');

if (!displayCtx || !bufferCtx) {
    throw new Error("Failed to get canvas contexts");
}

// Style and append display canvas
displayCanvas.style.position = 'fixed';
displayCanvas.style.top = '0';
displayCanvas.style.left = '0';
displayCanvas.style.display = 'block';
displayCanvas.style.cursor = 'crosshair'; // Show crosshair cursor
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(displayCanvas);

// Animation and rendering parameters
const targetFPS = 144; // Higher FPS for smoother animation
const frameInterval = 1000 / targetFPS;
let lastFrameTime = 0;
let isRendering = false;

// Mandelbrot view parameters
let offsetX = -0.7; // Center point X
let offsetY = 0.0; // Center point Y
const maxIterationBase = 40; // Base value for max iterations

// Zoom and movement parameters
let zoomFactor = 0.1; // Current zoom level
const zoomSpeed = 0.003; // Forward zoom speed
const movementSpeed = 0.0004; // Increased for better response
const deadZone = 30; // Reduced dead zone for better control
const maxDeflection = 150; // Reduced for more precise control
const smoothing = 0.2; // Increased for more responsive movement

// Flight control state
let isPaused = false;
let currentVelocityX = 0;
let currentVelocityY = 0;
let targetVelocityX = 0;
let targetVelocityY = 0;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Center point animation
let targetOffsetX = offsetX;
let targetOffsetY = offsetY;
let isAnimatingCenter = false;
const centerAnimationSpeed = 0.1; // Speed of center point animation

// Function to update both canvases
function updateCanvases() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    displayCanvas.style.width = width + 'px';
    displayCanvas.style.height = height + 'px';
    displayCanvas.width = width;
    displayCanvas.height = height;
    
    bufferCanvas.width = width;
    bufferCanvas.height = height;
}

// Initial setup
updateCanvases();

// Handle window resizes
window.addEventListener('resize', updateCanvases);

// Convert screen coordinates to complex plane coordinates
function screenToComplex(screenX: number, screenY: number): [number, number] {
    const width = displayCanvas.width;
    const height = displayCanvas.height;
    const aspectRatio = width / height;
    const scale = 4 / Math.pow(2, zoomFactor);

    // Normalize coordinates to [-0.5, 0.5] range
    const normalizedX = screenX / width - 0.5;
    const normalizedY = screenY / height - 0.5;

    // Apply scaling and aspect ratio correction
    const scaledX = normalizedX * scale * aspectRatio;
    const scaledY = normalizedY * scale;

    // Add current offset to get final complex coordinates
    return [
        scaledX + offsetX,
        scaledY + offsetY
    ];
}

function calculateMovementVector(mouseX: number, mouseY: number): [number, number] {
    const centerX = displayCanvas.width / 2;
    const centerY = displayCanvas.height / 2;
    
    // Calculate distance from center
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // If within dead zone, no movement
    if (distance < deadZone) {
        return [0, 0];
    }
    
    // Calculate movement strength (0 to 1) with quadratic scaling for better control
    const strength = Math.min(Math.pow((distance - deadZone) / (maxDeflection - deadZone), 2), 1);
    
    // Normalize the direction vector and apply strength
    const normalizedX = (deltaX / distance) * strength;
    const normalizedY = (deltaY / distance) * strength;
    
    return [normalizedX, normalizedY];
}

function updateMovement() {
    if (isPaused) {
        targetVelocityX = 0;
        targetVelocityY = 0;
    } else if (!isAnimatingCenter) { // Only update flight controls if not animating to new center
        const [moveX, moveY] = calculateMovementVector(mouseX, mouseY);
        targetVelocityX = moveX * movementSpeed;
        targetVelocityY = moveY * movementSpeed;
    }
    
    // Smooth movement
    currentVelocityX += (targetVelocityX - currentVelocityX) * smoothing;
    currentVelocityY += (targetVelocityY - currentVelocityY) * smoothing;
    
    // Apply movement to offset if not animating to new center
    if (!isAnimatingCenter) {
        offsetX += currentVelocityX;
        offsetY += currentVelocityY;
    }
}

function updateCenterAnimation() {
    if (!isAnimatingCenter) return;

    // Calculate distance to target
    const dx = targetOffsetX - offsetX;
    const dy = targetOffsetY - offsetY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If we're close enough to target, stop animating
    if (distance < 0.0001) {
        isAnimatingCenter = false;
        offsetX = targetOffsetX;
        offsetY = targetOffsetY;
        return;
    }

    // Smoothly move toward target
    offsetX += dx * centerAnimationSpeed;
    offsetY += dy * centerAnimationSpeed;
}

function updateZoom() {
    if (isPaused) return;

    // Constant forward zoom
    zoomFactor *= (1 + zoomSpeed);
    
    // Reset zoom if it gets too large to prevent precision issues
    if (zoomFactor > 1e10) {
        zoomFactor = 0.1;
    }
}

function mandelbrot(x: number, y: number, maxIterations: number): number {
    let real = x;
    let imaginary = y;
    let iterations = 0;
    let zReal = 0;
    let zImaginary = 0;

    while (iterations < maxIterations) {
        const zRealSquared = zReal * zReal;
        const zImaginarySquared = zImaginary * zImaginary;

        if (zRealSquared + zImaginarySquared > 4) {
            break;
        }

        zImaginary = 2 * zReal * zImaginary + imaginary;
        zReal = zRealSquared - zImaginarySquared + real;
        iterations++;
    }

    return iterations;
}

function getColor(iterations: number, maxIterations: number): [number, number, number] {
    if (iterations === maxIterations) return [0, 0, 0];

    // Create a smooth color gradient
    const hue = (iterations / maxIterations) * 360;
    const saturation = 100;
    const lightness = 50;

    // Convert HSL to RGB
    const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = lightness / 100 - c / 2;

    let r = 0, g = 0, b = 0;

    if (hue < 60) { r = c; g = x; }
    else if (hue < 120) { r = x; g = c; }
    else if (hue < 180) { g = c; b = x; }
    else if (hue < 240) { g = x; b = c; }
    else if (hue < 300) { r = x; b = c; }
    else { r = c; b = x; }

    return [
        Math.floor((r + m) * 255),
        Math.floor((g + m) * 255),
        Math.floor((b + m) * 255)
    ];
}

function drawMandelbrot() {
    if (!bufferCtx || !displayCtx) return;

    const maxIterations = Math.floor(Math.log2(zoomFactor) * 5) + maxIterationBase;
    const width = bufferCanvas.width;
    const height = bufferCanvas.height;
    const aspectRatio = width / height;
    const scale = 4 / Math.pow(2, zoomFactor);
    
    // Calculate the complex plane boundaries
    const xMin = offsetX - (scale * aspectRatio) / 2;
    const xMax = offsetX + (scale * aspectRatio) / 2;
    const yMin = offsetY - scale / 2;
    const yMax = offsetY + scale / 2;
    
    // Create image data for the frame
    const imageData = bufferCtx.createImageData(width, height);

    // Render with direct coordinate mapping
    for (let y = 0; y < height; y++) {
        const cy = yMin + (y * (yMax - yMin)) / height;
        
        for (let x = 0; x < width; x++) {
            const cx = xMin + (x * (xMax - xMin)) / width;

            // Quick check if point is in main cardioid or period-2 bulb
            const q = (cx - 0.25) * (cx - 0.25) + cy * cy;
            if (q * (q + (cx - 0.25)) <= 0.25 * cy * cy || 
                (cx + 1) * (cx + 1) + cy * cy <= 0.0625) {
                const pixelIndex = (x + y * width) * 4;
                imageData.data[pixelIndex] = 0;
                imageData.data[pixelIndex + 1] = 0;
                imageData.data[pixelIndex + 2] = 0;
                imageData.data[pixelIndex + 3] = 255;
                continue;
            }

            const iterations = mandelbrot(cx, cy, maxIterations);
            const [r, g, b] = getColor(iterations, maxIterations);

            const pixelIndex = (x + y * width) * 4;
            imageData.data[pixelIndex] = r;
            imageData.data[pixelIndex + 1] = g;
            imageData.data[pixelIndex + 2] = b;
            imageData.data[pixelIndex + 3] = 255;
        }
    }

    // Draw to buffer canvas first
    bufferCtx.putImageData(imageData, 0, 0);
    
    // Then copy to display canvas in one operation
    displayCtx.drawImage(bufferCanvas, 0, 0);
}

// Draw UI elements
function drawUI() {
    if (!displayCtx) return;
    
    const width = displayCanvas.width;
    const height = displayCanvas.height;
    
    // Draw movement vector indicator
    const centerX = width / 2;
    const centerY = height / 2;
    const vectorScale = 50; // Scale factor for vector visualization
    
    displayCtx.beginPath();
    displayCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    displayCtx.lineWidth = 2;
    
    // Draw vector line
    displayCtx.moveTo(centerX, centerY);
    displayCtx.lineTo(
        centerX + currentVelocityX * vectorScale * 1000,
        centerY + currentVelocityY * vectorScale * 1000
    );
    displayCtx.stroke();
    
    // Draw dead zone circle
    displayCtx.beginPath();
    displayCtx.arc(centerX, centerY, deadZone, 0, Math.PI * 2);
    displayCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    displayCtx.stroke();
    
    // Draw instructions
    displayCtx.font = '18px Arial';
    displayCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    displayCtx.textAlign = 'left';
    
    const instructions = [
        "Controls:",
        "• Move mouse to steer",
        "• Click to center on point",
        "• Space or Right-click to pause",
        isPaused ? "Status: PAUSED" : isAnimatingCenter ? "Status: CENTERING" : "Status: FLYING"
    ];
    
    instructions.forEach((text, index) => {
        displayCtx.fillText(text, 20, 30 + (index * 25));
    });
}

// Track mouse movement
displayCanvas.addEventListener('mousemove', (event) => {
    const rect = displayCanvas.getBoundingClientRect();
    mouseX = (event.clientX - rect.left) * (displayCanvas.width / rect.width);
    mouseY = (event.clientY - rect.top) * (displayCanvas.height / rect.height);
});

// Handle clicks to set new center point
displayCanvas.addEventListener('click', (event) => {
    const rect = displayCanvas.getBoundingClientRect();
    const clickX = (event.clientX - rect.left) * (displayCanvas.width / rect.width);
    const clickY = (event.clientY - rect.top) * (displayCanvas.height / rect.height);
    
    // Convert click position to complex coordinates
    const [newX, newY] = screenToComplex(clickX, clickY);
    
    // Set new target center
    targetOffsetX = newX;
    targetOffsetY = newY;
    isAnimatingCenter = true;
    
    // Reset velocities
    currentVelocityX = 0;
    currentVelocityY = 0;
    targetVelocityX = 0;
    targetVelocityY = 0;
});

// Handle right click to pause/unpause
displayCanvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    isPaused = !isPaused;
});

// Handle spacebar to pause/unpause
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        isPaused = !isPaused;
    }
});

// Start animation loop
requestAnimationFrame(function render(currentTime: number) {
    if (!lastFrameTime) lastFrameTime = currentTime;
    
    updateMovement();
    updateCenterAnimation();
    updateZoom();
    drawMandelbrot();
    drawUI();
    
    lastFrameTime = currentTime;
    requestAnimationFrame(render);
});
