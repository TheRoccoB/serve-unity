#!/usr/bin/env node

const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const PORT = process.argv[2] ? parseInt(process.argv[2], 10) : 9000;
const ROOT_DIR = process.cwd(); // Serve files from the current working directory

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".wasm": "application/wasm",
  ".data": "application/octet-stream",
  ".json": "application/json",
  ".css": "text/css",
};

// Helper function to get the original file MIME type
function getMimeType(filePath) {
  if (filePath.endsWith(".gz")) {
    return MIME_TYPES[path.extname(filePath.replace(".gz", ""))] || "application/octet-stream";
  } else if (filePath.endsWith(".br")) {
    return MIME_TYPES[path.extname(filePath.replace(".br", ""))] || "application/octet-stream";
  }
  return MIME_TYPES[path.extname(filePath)] || "application/octet-stream";
}

http.createServer((req, res) => {
  const filePath = path.join(ROOT_DIR, req.url === "/" ? "/index.html" : req.url);

  // Check if the file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }

    const mimeType = getMimeType(filePath);

    // Serve precompressed files
    if (filePath.endsWith(".gz")) {
      res.writeHead(200, {
        "Content-Type": mimeType,
        "Content-Encoding": "gzip",
      });
      fs.createReadStream(filePath).pipe(res);
    } else if (filePath.endsWith(".br")) {
      res.writeHead(200, {
        "Content-Type": mimeType,
        "Content-Encoding": "br",
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // Serve regular files and dynamically compress if supported
      const acceptEncoding = req.headers["accept-encoding"] || "";
      if (acceptEncoding.includes("br")) {
        res.writeHead(200, { "Content-Type": mimeType, "Content-Encoding": "br" });
        fs.createReadStream(filePath).pipe(zlib.createBrotliCompress()).pipe(res);
      } else if (acceptEncoding.includes("gzip")) {
        res.writeHead(200, { "Content-Type": mimeType, "Content-Encoding": "gzip" });
        fs.createReadStream(filePath).pipe(zlib.createGzip()).pipe(res);
      } else {
        res.writeHead(200, { "Content-Type": mimeType });
        fs.createReadStream(filePath).pipe(res);
      }
    }
  });
}).listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}. Press Ctrl+C to stop.`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nServer stopped. Cool game to share? Upload at https://simmer.io/upload/.");
  process.exit(0);
});