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

// Zoom parameters
let zoomFactor = 0.1; // Current zoom level
const zoomSpeed = 0.003; // Reduced speed for smoother zooming

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

function updateZoom() {
    // Use exponential zoom for consistent visual speed
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

// Add instruction text
const instructionText = "Click anywhere to set zoom center";
function drawInstructions() {
    if (!displayCtx) return;
    displayCtx.font = '24px Arial';
    displayCtx.fillStyle = 'white';
    displayCtx.textAlign = 'center';
    displayCtx.fillText(instructionText, displayCanvas.width / 2, 40);
}

// Flag to track if animation has started
let animationStarted = false;

// Handle mouse clicks to set zoom center
displayCanvas.addEventListener('click', (event) => {
    const rect = displayCanvas.getBoundingClientRect();
    
    // Get click position in canvas coordinates
    const canvasX = (event.clientX - rect.left) * (displayCanvas.width / rect.width);
    const canvasY = (event.clientY - rect.top) * (displayCanvas.height / rect.height);
    
    // Convert click coordinates to complex plane coordinates
    const [newX, newY] = screenToComplex(canvasX, canvasY);
    
    // Update the center point
    offsetX = newX;
    offsetY = newY;
    
    // Start animation if this is the first click
    if (!animationStarted) {
        animationStarted = true;
    }
});

// Start animation loop
requestAnimationFrame(function render(currentTime: number) {
    if (!lastFrameTime) lastFrameTime = currentTime;
    
    if (animationStarted) {
        updateZoom();
    }
    
    drawMandelbrot();
    
    if (!animationStarted) {
        drawInstructions();
    }
    
    lastFrameTime = currentTime;
    requestAnimationFrame(render);
});
