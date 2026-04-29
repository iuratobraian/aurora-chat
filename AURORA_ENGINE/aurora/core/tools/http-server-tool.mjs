/**
 * http-server-tool.mjs - Local HTTP Server para Aurora
 * Serve files, API mock, static hosting
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

export class HttpServerTool {
  constructor() { this.server = null; this.port = null; }

  async execute(params) {
    const { operation, ...args } = params;
    try {
      switch (operation) {
        case 'start': return await this.start(args);
        case 'stop': return await this.stop();
        case 'status': return this.status();
        default: return { success: false, error: `Unknown: ${operation}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async start(params) {
    if (this.server) return { success: false, error: 'Server already running', port: this.port };

    const { dir = '.', port = 8080, spa = false } = params;
    const root = path.resolve(dir);

    this.server = http.createServer((req, res) => {
      // Sanitize URL path to prevent path traversal
      let safePath = req.url.split('?')[0].split('#')[0];
      safePath = path.normalize(safePath).replace(/^(\.\.[/\\])+/, '');
      let filePath = path.join(root, safePath === '/' ? 'index.html' : safePath);

      // Verify the resolved path is within root
      if (!filePath.startsWith(root)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      if (spa && !fs.existsSync(filePath)) {
        filePath = path.join(root, 'index.html');
      }

      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
        '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
        '.gif': 'image/gif', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2',
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';

      try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    return new Promise((resolve) => {
      this.server.listen(port, () => {
        this.port = port;
        resolve({ success: true, port, url: `http://localhost:${port}` });
      });
    });
  }

  async stop() {
    if (!this.server) return { success: false, error: 'No server running' };
    return new Promise((resolve) => {
      this.server.close(() => {
        this.server = null;
        this.port = null;
        resolve({ success: true });
      });
    });
  }

  status() {
    return { running: !!this.server, port: this.port };
  }

  getSchema() {
    return {
      name: 'http_server',
      description: 'Local HTTP server for static files, SPA hosting, API mock.',
      parameters: {
        type: 'object',
        properties: {
          operation: { type: 'string', enum: ['start', 'stop', 'status'] },
          dir: { type: 'string' },
          port: { type: 'number' },
          spa: { type: 'boolean' },
        },
        required: ['operation'],
      },
    };
  }
}
