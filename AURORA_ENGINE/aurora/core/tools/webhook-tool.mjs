/**
 * webhook-tool.mjs - Webhook Handling para Aurora
 * Create, test, and manage webhooks
 */
import http from 'node:http';
import https from 'node:https';
import crypto from 'node:crypto';

export class WebhookTool {
  constructor() { this.webhooks = new Map(); this.history = []; }

  async execute(params) {
    const { operation, ...args } = params;
    try {
      switch (operation) {
        case 'send': return await this.send(args);
        case 'verify': return this.verify(args);
        case 'test': return await this.test(args);
        default: return { success: false, error: `Unknown: ${operation}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async send(params) {
    const { url, payload, secret, headers = {} } = params;

    if (secret) {
      headers['X-Webhook-Signature'] = this.sign(payload, secret);
    }
    headers['Content-Type'] = 'application/json';

    return new Promise((resolve) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      const req = client.request({
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers,
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          this.history.push({ url, status: res.statusCode, at: Date.now() });
          resolve({ success: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body: data });
        });
      });
      req.on('error', (e) => resolve({ success: false, error: e.message }));
      req.write(JSON.stringify(payload));
      req.end();
    });
  }

  verify(params) {
    const { payload, signature, secret } = params;
    const expected = this.sign(payload, secret);
    return { valid: signature === expected };
  }

  async test(params) {
    const { url } = params;
    const testPayload = { test: true, timestamp: Date.now(), message: 'Aurora webhook test' };
    return this.send({ url, payload: testPayload });
  }

  sign(payload, secret) {
    return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
  }

  getSchema() {
    return {
      name: 'webhook',
      description: 'Webhook operations: send, verify signature, test endpoint.',
      parameters: {
        type: 'object',
        properties: {
          operation: { type: 'string', enum: ['send', 'verify', 'test'] },
          url: { type: 'string' },
          payload: { type: 'object' },
          secret: { type: 'string' },
          signature: { type: 'string' },
        },
        required: ['operation'],
      },
    };
  }
}
