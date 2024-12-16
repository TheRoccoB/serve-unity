# serve-unity

A lightweight Node.js server designed to serve Unity WebGL builds with proper compression headers for Gzip and Brotli.

## Features

- Supports serving Unity WebGL builds with **Gzip** and **Brotli** compression.
- Correctly handles `Content-Type` and `Content-Encoding` headers for Unity files (e.g., `.wasm`, `.js`, `.data`).
- Automatically decodes URL-encoded paths (e.g., files with spaces in names).
- Easy to use and install globally.

## Installation

To install `serve-unity` globally via npm:

```bash
npm install -g serve-unity
```

## Usage

### Basic Usage

Run the server in the directory containing your Unity WebGL build:

```
serve-unity <port>
```

Open your browser and go to: http://localhost:9000

### Default Behavior

If you don’t specify a port, the server defaults to 9000:

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## Author
Rocco Balsamo

Enjoy fast and simple Unity WebGL serving with serve-unity! 🎮