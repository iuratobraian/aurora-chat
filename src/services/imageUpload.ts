/**
 * ImageUploadService – subida de imágenes y videos desde el navegador sin backend propio.
 *
 * ESTRATEGIA (cascada):
 *  1. Cloudinary unsigned preset – CDN global, CORS nativo, 25 GB gratis/mes ✅
 *  2. ImgBB API              – fallback imágenes, free tier 32 MB
 *  3. Base64 en memoria      – último recurso (no persiste entre reloads)
 *
 * Para videos: Cloudinary soporta video con el mismo preset/cloud name.
 * Usa el endpoint /video/upload en lugar de /image/upload.
 *
 * ─── SETUP CLOUDINARY ───────────────────────────────────────────────────────
 * Cloud name  : dpm4bnral
 * Preset name : tradeshare_uploads  (debe existir como "Unsigned" en el dashboard)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import logger from '../utils/logger';

const CLOUDINARY_CLOUD_NAME    = 'dpm4bnral';
const CLOUDINARY_UPLOAD_PRESET = 'tradeshare_uploads';

import { extractYoutubeId as extractYoutubeIdUtil } from '../utils/youtube';

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export const ImageUploadService = {
    /**
     * Sube una imagen y retorna la URL permanente (CDN).
     */
    uploadImage: async (file: File): Promise<string> => {
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);


        // ── Método 1: Cloudinary (unsigned preset) ────────────────────────────
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: 'POST', body: fd }
            );

            const data = await res.json();

            if (res.ok && data?.secure_url) {

                return data.secure_url as string;
            }

            logger.warn('[ImageUpload] Cloudinary error response:', data?.error?.message || data);
        } catch (e) {
            logger.warn('[ImageUpload] Cloudinary fetch falló:', e);
        }

        // ── Método 2: Server relay (ImgBB) ───────────────────────────────────────
        try {
            const base64Image = await fileToBase64(file);
            
            const res = await fetch('/api/upload/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image }),
            });

            const data = await res.json();

            if (res.ok && data?.url) {
                return data.url;
            }

            logger.warn('[ImageUpload] Server relay error:', data?.error);
        } catch (e) {
            logger.warn('[ImageUpload] Server relay fetch falló:', e);
        }

        // ── Método 3: Base64 (fallback local — no persiste entre reloads) ─────
        logger.warn('[ImageUpload] ⚠️ Usando base64 local. Configura Cloudinary o ImgBB.');
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * Sube un video a Cloudinary usando el mismo preset gratuito.
     * Soporta MP4, MOV, WebM. Límite free: 25GB almacenamiento.
     * Retorna la URL pública de streaming + un poster thumbnail.
     */
    uploadVideo: async (
        file: File,
        onProgress?: (pct: number) => void
    ): Promise<{ url: string; thumbnail: string; duration?: number }> => {
        const sizeMB = file.size / 1024 / 1024;


        if (sizeMB > 100) {
            throw new Error('El video supera el límite de 100 MB. Por favor comprime el archivo.');
        }

        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        fd.append('resource_type', 'video');

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && onProgress) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            };

            xhr.onload = () => {
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (xhr.status === 200 && data?.secure_url) {

                        // Generate thumbnail URL
                        const thumbnail = data.secure_url
                            .replace('/upload/', '/upload/so_0,f_jpg,w_800,c_fill/')
                            .replace(/\.\w+$/, '.jpg');
                        resolve({
                            url: data.secure_url,
                            thumbnail,
                            duration: data.duration
                        });
                    } else {
                        const errMsg = (JSON.parse(xhr.responseText))?.error?.message || 'Error uploading video';
                        reject(new Error(errMsg));
                    }
                } catch {
                    reject(new Error('Error parsing Cloudinary response'));
                }
            };

            xhr.onerror = () => reject(new Error('Network error during video upload'));
            xhr.send(fd);
        });
    },

    /** Extrae el ID de YouTube de una URL pegada */
    extractYoutubeId: extractYoutubeIdUtil,

    /** Valida tipo y tamaño antes de subir. Acepta imagen o video. */
    validate: (file: File, maxMB = 100): { ok: boolean; error?: string; type: 'image' | 'video' | 'unknown' } => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            return { ok: false, error: 'Solo se aceptan imágenes (JPG, PNG, WebP) o videos (MP4, MOV, WebM).', type: 'unknown' };
        }
        const limit = isImage ? 15 : 100;
        if (file.size > limit * 1024 * 1024) {
            return { ok: false, error: `El archivo supera el límite de ${limit} MB.`, type: isImage ? 'image' : 'video' };
        }
        return { ok: true, type: isImage ? 'image' : 'video' };
    }
};

// Alias para compatibilidad con el servicio anterior
export const PostimgService = {
    uploadImage: ImageUploadService.uploadImage
};
