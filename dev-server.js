// Eswar, Bala & Co - Smart Café Salem
// React Dev Server (ES Module)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = '0.0.0.0'; // Bind to all interfaces so localhost/127.0.0.1 always connect
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jsx': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  console.log(`[REQ] ${req.method} ${pathname}`);

  if (pathname === '/' || pathname === '/home' || pathname === '/menu' || pathname === '/cart' || pathname === '/checkout' || pathname === '/orders') {
    pathname = '/index.html';
  }

  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(ROOT_DIR, safePath);

  // Check if file exists directly, or under public/ directory
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    const publicPath = path.join(ROOT_DIR, 'public', safePath);
    if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
      filePath = publicPath;
    } else {
      filePath = path.join(ROOT_DIR, 'index.html');
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': data.length,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`Port ${PORT} in use, attempting ${PORT + 1}...`);
    server.listen(PORT + 1, HOST);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`
============================================================
☕ SMART CAFÉ (REACT) — LOCAL DEV SERVER
   Eswar, Bala & Co Flagship
============================================================

  ✔ Localhost Dev Running:
  ➜  http://localhost:${PORT}/
  ➜  http://127.0.0.1:${PORT}/

  React Component Tree:
  📁 src/
     ├── components/ (Navbar.jsx, MenuCard.jsx, Cart.jsx)
     ├── pages/      (Home.jsx, Menu.jsx, Checkout.jsx, Orders.jsx)
     ├── App.jsx
     ├── main.jsx
     ├── bundle.js (Active browser bundle)
     └── index.css

============================================================
Press Ctrl+C to stop
  `);
});
