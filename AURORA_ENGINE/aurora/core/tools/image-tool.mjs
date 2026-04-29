/**
 * image-tool.mjs - Image Processing para Aurora
 * Resize, convert, analyze images
 */
import fs from 'node:fs';
import path from 'node:path';

export class ImageTool {
  constructor() { this.history = []; }

  async execute(params) {
    const { operation, ...args } = params;
    try {
      switch (operation) {
        case 'info': return this.info(args.file);
        case 'base64': return this.toBase64(args.file);
        case 'resize': return this.resize(args);
        case 'compress': return this.compress(args);
        case 'generate': return this.generate(args);
        case 'upload': return this.upload(args);
        default: return { success: false, error: `Unknown: ${operation}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generación de imagen PRO asistida por Aurora
   */
  async generate(params) {
    const { prompt: userPrompt, userId, model } = params;
    const { ImageAssistant } = await import('./image-assistant.mjs');
    const { executeWithFreeProvider, getFreeProviderRouter } = await import('../providers/free-provider-router.mjs');

    // 1. Refinar prompt
    const assistant = new ImageAssistant();
    const { refinedPrompt, category, suggestedFilename, explanation } = await assistant.refine(userPrompt);
    console.log(`✨ Prompt optimizado: ${refinedPrompt}`);

    // 2. Generar imagen
    const router = getFreeProviderRouter();
    const genResult = await router.generateImage({ prompt: refinedPrompt, model });

    if (!genResult.success) throw new Error('Generación fallida');

    // 3. Subir a ImgBB (Hosting Externo)
    console.log(`☁️ Subiendo imagen a ImgBB para hosting permanente...`);
    const uploadResult = await this.upload({ 
      data: genResult.data, 
      isBase64: genResult.isBase64,
      name: suggestedFilename 
    });

    if (!uploadResult.success) throw new Error(`Upload fallido: ${uploadResult.error}`);

    return {
      success: true,
      url: uploadResult.url,
      prompt: refinedPrompt,
      originalPrompt: userPrompt,
      filename: suggestedFilename,
      category: category,
      explanation: explanation
    };
  }

  /**
   * Upload Relay a ImgBB
   */
  async upload(params) {
    const { data, isBase64, name } = params;
    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) return { success: false, error: 'IMGBB_API_KEY no configurada' };

    const formData = new URLSearchParams();
    formData.append('image', data);
    if (name) formData.append('name', name);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData
      });
      const resData = await response.json();

      if (resData.success) {
        return { success: true, url: resData.data.url, delete_url: resData.data.delete_url };
      }
      return { success: false, error: resData.error?.message || 'Error en ImgBB' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  info(file) {
    const stat = fs.statSync(file);
    const ext = path.extname(file).toLowerCase();
    return { success: true, file, size: stat.size, extension: ext, type: this.getMimeType(ext) };
  }

  toBase64(file) {
    const content = fs.readFileSync(file);
    return { success: true, base64: content.toString('base64'), size: content.length };
  }

  resize(params) {
    // Without sharp/jimp, return metadata for manual resize
    return { success: false, error: 'Image resize requires sharp or jimp library. Install with: npm install sharp' };
  }

  compress(params) {
    return { success: false, error: 'Image compression requires sharp library. Install with: npm install sharp' };
  }

  getMimeType(ext) {
    const map = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
    return map[ext] || 'application/octet-stream';
  }

  getSchema() {
    return {
      name: 'image',
      description: 'Image processing: info, base64, resize, compress. Resize/compress require sharp library.',
      parameters: {
        type: 'object',
        properties: {
          operation: { type: 'string', enum: ['info', 'base64', 'resize', 'compress'] },
          file: { type: 'string' },
          width: { type: 'number' },
          height: { type: 'number' },
          quality: { type: 'number' },
        },
        required: ['operation'],
      },
    };
  }
}
