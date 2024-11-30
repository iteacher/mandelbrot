# Mandelbrot Infinite Zoom

An interactive Mandelbrot set explorer with infinite zoom capabilities, built using TypeScript and HTML5 Canvas.

## Features

- Smooth infinite zoom animation
- Interactive click-to-zoom functionality
- Dynamic color rendering based on zoom level
- Double buffering for optimal performance
- High-performance rendering at 144 FPS
- Automatic iteration adjustment based on zoom level
- Responsive design that adapts to window size

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 14.0.0 or higher)
- npm (usually comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mandelbrot.git
cd mandelbrot
```

2. Install dependencies:
```bash
npm install
```

## Usage

To run the project in development mode:
```bash
npm run start:normal
```
This will start a development server and open the application in your default browser.

## How to Use

1. When the application loads, you'll see the Mandelbrot set with instructions.
2. Click anywhere on the screen to set the center point for zooming.
3. The view will automatically start zooming into your selected point.
4. Click a new location at any time to change the zoom target.

## Technical Details

- **Double Buffering**: Uses two canvases for smooth rendering
- **Dynamic Iteration Scaling**: Automatically adjusts detail level based on zoom depth
- **Optimization Features**:
  - Cardioid and period-2 bulb checking for faster rendering
  - Smooth color transitions using HSL to RGB conversion
  - Efficient coordinate mapping system
  - Frame rate optimization at 144 FPS

## Project Structure

```
mandelbrot/
├── src/                    # Source files
│   ├── js/                # TypeScript files
│   │   └── main.ts        # Main Mandelbrot implementation
│   └── types.d.ts         # TypeScript declarations
├── public/                # Static assets
│   ├── index.html         # HTML entry point
│   └── styles/            # CSS styles
├── webpack.config.js      # Webpack configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies and scripts
```

## Scripts

- `npm run start:normal` - Start the Mandelbrot viewer
- `npm run build` - Create production build
- `npm run watch` - Run with hot-reloading
- `npm run clean` - Clean build directory

## Browser Support

Tested and working in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Technical Implementation

The project implements several key features for optimal Mandelbrot set rendering:

- **Complex Plane Mapping**: Efficiently maps screen coordinates to complex plane coordinates
- **Dynamic Color Generation**: Creates smooth color transitions based on escape-time iterations
- **Performance Optimizations**:
  - Main cardioid and period-2 bulb optimization
  - Double buffering for smooth rendering
  - Efficient pixel-by-pixel calculation
  - Dynamic iteration count based on zoom level

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Julian Manders-Jones
