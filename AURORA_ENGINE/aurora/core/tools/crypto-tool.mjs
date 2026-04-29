/**
 * crypto-tool.mjs - Encryption/Hash para Aurora
 * Hash, encrypt, decrypt, generate keys
 */
import crypto from 'node:crypto';

export class CryptoTool {
  constructor() { this.history = []; }

  async execute(params) {
    const { operation, ...args } = params;
    try {
      switch (operation) {
        case 'hash': return this.hash(args);
        case 'random': return this.random(args);
        case 'uuid': return this.uuid();
        case 'verify': return this.verify(args);
        default: return { success: false, error: `Unknown: ${operation}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  hash(params) {
    const { data, algorithm = 'sha256' } = params;
    const hash = crypto.createHash(algorithm).update(data).digest('hex');
    return { success: true, algorithm, hash };
  }

  random(params) {
    const { length = 32, encoding = 'hex' } = params;
    const bytes = Math.ceil(length / 2);
    const random = crypto.randomBytes(bytes).toString(encoding).substring(0, length);
    return { success: true, random };
  }

  uuid() {
    return { success: true, uuid: crypto.randomUUID() };
  }

  verify(params) {
    const { data, hash, algorithm = 'sha256' } = params;
    const computed = crypto.createHash(algorithm).update(data).digest('hex');
    const match = computed === hash;
    return { success: true, match, algorithm };
  }

  getSchema() {
    return {
      name: 'crypto',
      description: 'Crypto operations: hash (sha256/md5/sha512), random bytes, uuid, verify hash.',
      parameters: {
        type: 'object',
        properties: {
          operation: { type: 'string', enum: ['hash', 'random', 'uuid', 'verify'] },
          data: { type: 'string' },
          algorithm: { type: 'string' },
          hash: { type: 'string' },
          length: { type: 'number' },
          encoding: { type: 'string', enum: ['hex', 'base64'] },
        },
        required: ['operation'],
      },
    };
  }
}
