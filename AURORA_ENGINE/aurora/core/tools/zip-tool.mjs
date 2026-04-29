/**
 * zip-tool.mjs - Archive Handling para Aurora
 * Create, extract, list zip files
 */
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
const execAsync = promisify(exec);

export class ZipTool {
  constructor() { this.history = []; }

  async execute(params) {
    const { operation, ...args } = params;
    try {
      switch (operation) {
        case 'create': return await this.create(args);
        case 'extract': return await this.extract(args);
        case 'list': return await this.list(args);
        default: return { success: false, error: `Unknown: ${operation}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async create(params) {
    const { files, output } = params;
    const fileList = Array.isArray(files) ? files.join(' ') : files;
    await execAsync(`tar -czf "${output}" ${fileList}`);
    return { success: true, archive: output };
  }

  async extract(params) {
    const { archive, dest } = params;
    await execAsync(`tar -xzf "${archive}" -C "${dest || '.'}"`);
    return { success: true, archive, dest: dest || '.' };
  }

  async list(params) {
    const { archive } = params;
    const { stdout } = await execAsync(`tar -tzf "${archive}"`);
    return { success: true, files: stdout.trim().split('\n') };
  }

  getSchema() {
    return {
      name: 'zip',
      description: 'Archive handling: create, extract, list tar.gz files.',
      parameters: {
        type: 'object',
        properties: {
          operation: { type: 'string', enum: ['create', 'extract', 'list'] },
          files: { type: ['string', 'array'] },
          output: { type: 'string' },
          archive: { type: 'string' },
          dest: { type: 'string' },
        },
        required: ['operation'],
      },
    };
  }
}
