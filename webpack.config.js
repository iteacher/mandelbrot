const path = require('path');

module.exports = {
  mode: 'development', // Set mode to development
  entry: './src/js/main.ts', // Set entry point to main.ts
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/', // Important for dev server
    clean: true, // Clean the output directory before emit
  },
  module: {
    rules: [
      {
        test: /\.png$/, // Add loader for PNG files
        type: 'asset/resource',
      },
      {
        test: /\.css$/, // Add loader for CSS files
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.ts$/, // Add loader for TypeScript files
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'], // Resolve TypeScript and JavaScript files
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), // Serve static files from the public directory
    },
    historyApiFallback: true, // Enable fallback for single-page applications
    port: 8081, // Ensure this matches your running port
    open: true, // Automatically open the browser
  },
  // Other configurations...
};
