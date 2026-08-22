const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.env.PORT) || 3000;
const publicDirectory = path.join(__dirname, '..', 'public');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((request, response) => {
  if (request.url === '/health' && request.method === 'GET') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (request.method === 'GET') {
    const requestedPath = request.url === '/' ? '/index.html' : request.url;
    const filePath = path.normalize(path.join(publicDirectory, requestedPath));

    if (filePath.startsWith(publicDirectory) && fs.existsSync(filePath)) {
      const extension = path.extname(filePath);
      response.writeHead(200, {
        'content-type': contentTypes[extension] || 'application/octet-stream',
      });
      response.end(fs.readFileSync(filePath));
      return;
    }
  }

  response.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(port, () => {
  console.log(`ScoreWizz server listening on http://localhost:${port}`);
});
