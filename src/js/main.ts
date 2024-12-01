// Author: Julian Manders-Jones
// Description:  Mandelbrot infinite zoom
// License: MIT

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Get canvas container
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) {
        throw new Error("Canvas container not found");
    }

    // Create two canvases for double buffering
    const displayCanvas = document.createElement('canvas');
    const bufferCanvas = document.createElement('canvas');
    const displayCtx = displayCanvas.getContext('2d', { 
        alpha: false,
        willReadFrequently: true
    });
    const bufferCtx = bufferCanvas.getContext('2d', { 
        alpha: false,
        willReadFrequently: true
    });

    if (!displayCtx || !bufferCtx) {
        throw new Error("Failed to get canvas contexts");
    }

    // Style and append display canvas
    displayCanvas.style.position = 'absolute';
    displayCanvas.style.top = '0';
    displayCanvas.style.left = '0';
    displayCanvas.style.width = '100%';
    displayCanvas.style.height = '100%';
    displayCanvas.style.cursor = 'crosshair';
    displayCanvas.style.backgroundColor = 'black';
    canvasContainer.appendChild(displayCanvas);

    // UI Elements
    const zoomSpeedSlider = document.getElementById('zoom-speed-slider') as HTMLInputElement;
    const zoomSpeedValue = document.getElementById('zoom-speed-value');
    const statusText = document.getElementById('status-text');
    const increaseSpeedBtn = document.getElementById('increase-speed');
    const decreaseSpeedBtn = document.getElementById('decrease-speed');

    // Animation and rendering parameters
    const targetFPS = 144;
    const frameInterval = 1000 / targetFPS;
    let lastFrameTime = 0;
    let isRendering = false;

    // Mandelbrot view parameters
    let offsetX = -0.7;
    let offsetY = 0.0;
    const maxIterationBase = 40;

    // Zoom parameters
    let zoomFactor = 0.1;
    let baseZoomSpeed = 0.003;
    let zoomSpeedMultiplier = 1.0;
    const maxZoomSpeedMultiplier = 5.0;
    const minZoomSpeedMultiplier = -2.0;

    // Mouse tracking with dampening
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetX = mouseX;
    let targetY = mouseY;
    let currentX = mouseX;
    let currentY = mouseY;
    const dampeningFactor = 0.1;

    // Center point animation
    let targetOffsetX = offsetX;
    let targetOffsetY = offsetY;
    let isAnimatingCenter = false;
    const centerAnimationSpeed = 0.1;

    // Control states
    let isPaused = false;
    let currentVelocityX = 0;
    let currentVelocityY = 0;
    let targetVelocityX = 0;
    let targetVelocityY = 0;

    // Movement parameters
    const movementSpeed = 0.0004;
    const deadZone = 30;
    const maxDeflection = 150;
    const smoothing = 0.2;

    function updateZoomSpeedDisplay() {
        if (zoomSpeedValue) {
            const direction = zoomSpeedMultiplier >= 0 ? '→' : '←';
            const magnitude = Math.abs(zoomSpeedMultiplier).toFixed(1);
            zoomSpeedValue.textContent = `${direction} ×${magnitude}`;
        }
    }

    function updateStatusText(status: string) {
        if (statusText) {
            statusText.textContent = status;
        }
    }

    function adjustZoomSpeed(delta: number) {
        const currentValue = parseInt(zoomSpeedSlider.value);
        const newValue = Math.max(-100, Math.min(100, currentValue + delta));
        zoomSpeedSlider.value = newValue.toString();
        zoomSpeedMultiplier = newValue / 33.33;
        updateZoomSpeedDisplay();
    }

    // Initialize UI
    if (zoomSpeedSlider) {
        zoomSpeedSlider.addEventListener('input', () => {
            zoomSpeedMultiplier = parseInt(zoomSpeedSlider.value) / 33.33;
            updateZoomSpeedDisplay();
        });
    }

    if (increaseSpeedBtn) {
        increaseSpeedBtn.addEventListener('click', () => adjustZoomSpeed(10));
    }

    if (decreaseSpeedBtn) {
        decreaseSpeedBtn.addEventListener('click', () => adjustZoomSpeed(-10));
    }

    // Handle keyboard controls
    document.addEventListener('keydown', (event) => {
        if (event.key === '+' || event.key === '=') {
            adjustZoomSpeed(10);
        } else if (event.key === '-' || event.key === '_') {
            adjustZoomSpeed(-10);
        } else if (event.code === 'Space') {
            event.preventDefault();
            isPaused = !isPaused;
            updateStatusText(isPaused ? 'PAUSED' : 'FLYING');
        }
    });

    // Function to update both canvases
    function updateCanvases() {
        // Get actual pixel dimensions of the container
        const rect = canvasContainer.getBoundingClientRect();
        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);
        
        // Set canvas dimensions to match container size
        displayCanvas.width = width;
        displayCanvas.height = height;
        bufferCanvas.width = width;
        bufferCanvas.height = height;

        // Clear both canvases with black background
        displayCtx.fillStyle = 'black';
        displayCtx.fillRect(0, 0, width, height);
        bufferCtx.fillStyle = 'black';
        bufferCtx.fillRect(0, 0, width, height);
    }

    // Initial setup
    updateCanvases();

    // Handle window resizes
    window.addEventListener('resize', () => {
        updateCanvases();
        drawMandelbrot();
    });

    // Convert screen coordinates to complex plane coordinates
    function screenToComplex(screenX: number, screenY: number): [number, number] {
        const width = displayCanvas.width;
        const height = displayCanvas.height;
        const aspectRatio = width / height;
        const scale = 4 / Math.pow(2, zoomFactor);

        const normalizedX = screenX / width - 0.5;
        const normalizedY = screenY / height - 0.5;

        const scaledX = normalizedX * scale * aspectRatio;
        const scaledY = normalizedY * scale;

        return [
            scaledX + offsetX,
            scaledY + offsetY
        ];
    }

    function calculateMovementVector(mouseX: number, mouseY: number): [number, number] {
        const centerX = displayCanvas.width / 2;
        const centerY = displayCanvas.height / 2;
        
        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance < deadZone) {
            return [0, 0];
        }
        
        const strength = Math.min(Math.pow((distance - deadZone) / (maxDeflection - deadZone), 2), 1);
        
        const normalizedX = (deltaX / distance) * strength;
        const normalizedY = (deltaY / distance) * strength;
        
        return [normalizedX, normalizedY];
    }

    function updateMovement() {
        if (isPaused) {
            targetVelocityX = 0;
            targetVelocityY = 0;
        } else if (!isAnimatingCenter) {
            const [moveX, moveY] = calculateMovementVector(mouseX, mouseY);
            targetVelocityX = moveX * movementSpeed;
            targetVelocityY = moveY * movementSpeed;
        }
        
        currentVelocityX += (targetVelocityX - currentVelocityX) * smoothing;
        currentVelocityY += (targetVelocityY - currentVelocityY) * smoothing;
        
        if (!isAnimatingCenter) {
            offsetX += currentVelocityX;
            offsetY += currentVelocityY;
        }
    }

    function updateCenterAnimation() {
        if (!isAnimatingCenter) return;

        const dx = targetOffsetX - offsetX;
        const dy = targetOffsetY - offsetY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.0001) {
            isAnimatingCenter = false;
            offsetX = targetOffsetX;
            offsetY = targetOffsetY;
            updateStatusText('FLYING');
            return;
        }

        offsetX += dx * centerAnimationSpeed;
        offsetY += dy * centerAnimationSpeed;
    }

    function updateZoom() {
        if (isPaused) return;

        const effectiveZoomSpeed = baseZoomSpeed * zoomSpeedMultiplier;
        zoomFactor *= (1 + effectiveZoomSpeed);
        
        if (zoomFactor > 1e10 || zoomFactor < 0.1) {
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

        const hue = (iterations / maxIterations) * 360;
        const saturation = 100;
        const lightness = 50;

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
        
        const xMin = offsetX - (scale * aspectRatio) / 2;
        const xMax = offsetX + (scale * aspectRatio) / 2;
        const yMin = offsetY - scale / 2;
        const yMax = offsetY + scale / 2;
        
        const imageData = bufferCtx.createImageData(width, height);

        for (let y = 0; y < height; y++) {
            const cy = yMin + (y * (yMax - yMin)) / height;
            
            for (let x = 0; x < width; x++) {
                const cx = xMin + (x * (xMax - xMin)) / width;

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

        bufferCtx.putImageData(imageData, 0, 0);
        displayCtx.drawImage(bufferCanvas, 0, 0);
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
        
        const [newX, newY] = screenToComplex(clickX, clickY);
        
        targetOffsetX = newX;
        targetOffsetY = newY;
        isAnimatingCenter = true;
        updateStatusText('CENTERING');
        
        currentVelocityX = 0;
        currentVelocityY = 0;
        targetVelocityX = 0;
        targetVelocityY = 0;
    });

    // Handle right click to pause/unpause
    displayCanvas.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        isPaused = !isPaused;
        updateStatusText(isPaused ? 'PAUSED' : 'FLYING');
    });

    // Start animation loop
    requestAnimationFrame(function render(currentTime: number) {
        if (!lastFrameTime) lastFrameTime = currentTime;
        
        updateMovement();
        updateCenterAnimation();
        updateZoom();
        drawMandelbrot();
        
        lastFrameTime = currentTime;
        requestAnimationFrame(render);
    });
});
