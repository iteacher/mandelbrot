# Particle System

A high-performance particle system built with Three.js and TypeScript, featuring a realistic smoke effect with thousands of particles.

## Features

- Real-time particle rendering using WebGL
- Custom shader implementation for smooth smoke effect
- Thousands of particles with individual properties (size, opacity, velocity)
- Continuous particle animation with upward drift
- Responsive design that adapts to window size

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 14.0.0 or higher)
- npm (usually comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/particle_system.git
cd particle_system
```

2. Install dependencies:
```bash
npm install
```

## Development

To run the project in development mode with hot-reloading:
```bash
npm run dev
```
This will start a development server at `http://localhost:8081`

## Building

To create a production build:
```bash
npm run build
```
The built files will be in the `dist` directory.

## Project Structure

```
particle_system/
├── src/                    # Source files
│   ├── js/                # TypeScript files
│   │   └── main.ts        # Main application file
│   ├── styles/            # CSS styles
│   │   └── styles.css     # Global styles
│   └── types.d.ts         # TypeScript declarations
├── public/                # Static assets
│   ├── index.html         # HTML entry point
│   └── assets/            # Images and other assets
├── dist/                  # Compiled files (git-ignored)
├── webpack.config.js      # Webpack configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies and scripts
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run clean` - Clean build directory

## Technical Details

- Built with Three.js for 3D rendering
- TypeScript for type-safe code
- Webpack for bundling
- Custom WebGL shaders for particle effects
- Responsive design using window resize events

## Browser Support

Tested and working in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Three.js for the powerful 3D rendering capabilities
- The WebGL and Three.js communities for their valuable resources and examples
