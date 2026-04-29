/**
 * api-test-tool.mjs - HTTP API Testing para Aurora
 */
import http from 'node:http';
import https from 'node:https';

export class ApiTestTool {
  constructor() { this.history = []; }

  async execute(params) {
    const { method = 'GET', url, headers = {}, body, timeout = 10000 } = params;

    try {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method,
        headers,
        timeout,
      };

      const startTime = Date.now();
      const result = await new Promise((resolve, reject) => {
        const req = client.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
            responseTime: Date.now() - startTime,
          }));
        });

        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });

        if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
        req.end();
      });

      this.history.push({ method, url, status: result.status, at: Date.now() });
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getHistory() { return this.history; }
  getSchema() {
    return {
      name: 'api_test',
      description: 'Test HTTP APIs. Send GET/POST/PUT/DELETE requests and analyze responses.',
      parameters: {
        type: 'object',
        properties: {
          method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
          url: { type: 'string' },
          headers: { type: 'object' },
          body: { type: ['object', 'string'] },
          timeout: { type: 'number' },
        },
        required: ['url'],
      },
    };
  }
}
