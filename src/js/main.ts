// Author: Julian Manders-Jones
// License: MIT

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
if (!ctx) {
    throw new Error("Failed to get canvas context");
}
document.body.appendChild(canvas);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let zoom = 1;
let offsetX = -0.7436438870371587; // Interesting point in the Mandelbrot set
let offsetY = 0.1318259043091893;  // Known for its deep zoom potential
const zoomSpeed = 0.01; // Global zoom speed variable
let zoomFactor = 1;

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
    if (!ctx) return;

    const maxIterations = Math.floor(Math.log2(zoomFactor) * 10) + 100; // Increase detail with zoom
    const imageData = ctx.createImageData(canvas.width, canvas.height);

    const aspectRatio = canvas.width / canvas.height;
    const scale = 4 / Math.pow(2, zoomFactor);

    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            const scaledX = (x / canvas.width - 0.5) * scale * aspectRatio + offsetX;
            const scaledY = (y / canvas.height - 0.5) * scale + offsetY;

            const iterations = mandelbrot(scaledX, scaledY, maxIterations);
            const [r, g, b] = getColor(iterations, maxIterations);

            const pixelIndex = (x + y * canvas.width) * 4;
            imageData.data[pixelIndex] = r;
            imageData.data[pixelIndex + 1] = g;
            imageData.data[pixelIndex + 2] = b;
            imageData.data[pixelIndex + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function animate() {
    drawMandelbrot();
    
    // Continuously increase zoom factor
    zoomFactor += zoomSpeed;
    
    requestAnimationFrame(animate);
}

// Start animation
animate();
