#!/usr/bin/env node

const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const PORT = process.env.PORT || 9000; // Use environment variable or default to 9000
const ROOT_DIR = process.cwd(); // Serve files from the current working directory

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".wasm": "application/wasm",
  ".data": "application/octet-stream",
  ".json": "application/json",
  ".css": "text/css",
  ".gz": "application/octet-stream", // Gzipped files
  ".br": "application/octet-stream", // Brotli-compressed files
};

http.createServer((req, res) => {
  const filePath = path.join(ROOT_DIR, req.url === "/" ? "/index.html" : req.url);
  const ext = path.extname(filePath);

  // Check if the file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }

    // Determine MIME type
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";

    // Set appropriate compression headers for .gz and .br files
    if (filePath.endsWith(".gz")) {
      res.writeHead(200, {
        "Content-Type": mimeType.replace(/\.gz$/, ""),
        "Content-Encoding": "gzip",
      });
      fs.createReadStream(filePath).pipe(res);
    } else if (filePath.endsWith(".br")) {
      res.writeHead(200, {
        "Content-Type": mimeType.replace(/\.br$/, ""),
        "Content-Encoding": "br",
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // Serve regular files and apply compression if the client accepts it
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
  console.log(`Server is running on http://localhost:${PORT}`);
});