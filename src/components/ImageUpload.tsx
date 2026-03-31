import React, { useCallback, useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useToast } from './ToastProvider';

interface ImageUploadProps {
  onImageUploaded: (storageId: string) => void;
  onImageRemoved: () => void;
  existingImageId?: string | null;
  className?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  onImageRemoved,
  existingImageId,
  className = '',
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { showToast } = useToast();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleFiles = useCallback(async (file: File) => {
    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast('error', 'Formato no válido. Solo JPEG, PNG o WebP');
      return;
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      showToast('error', 'El archivo es muy pesado. Máximo 5MB');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir a Convex
    setUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error('Error al subir imagen');
      }

      const { storageId } = await result.json();
      onImageUploaded(storageId);
      showToast('success', 'Imagen subida exitosamente');
    } catch (error: any) {
      showToast('error', error.message || 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  }, [generateUploadUrl, onImageUploaded, showToast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  }, [handleFiles]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageRemoved();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onImageRemoved]);

  return (
    <div className={`relative ${className}`}>
      {/* Preview si hay imagen existente o preview */}
      {(preview || existingImageId) && (
        <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border border-white/10 group">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" loading="lazy" decoding="async" />
          ) : existingImageId ? (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Imagen cargada</span>
            </div>
          ) : null}
          
          {/* Botón eliminar */}
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 size-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>

          {/* Overlay de upload */}
          {uploading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-white text-sm font-bold">Subiendo...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-primary bg-primary/10'
            : 'border-white/20 hover:border-primary/50 hover:bg-white/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />

        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-gray-400">
            {uploading ? 'cloud_upload' : 'add_photo_alternate'}
          </span>
          
          <div>
            <p className="text-white font-bold mb-1">
              {uploading ? 'Subiendo imagen...' : 'Arrastra tu imagen o haz click aquí'}
            </p>
            <p className="text-xs text-gray-500">
              JPEG, PNG o WebP. Máximo 5MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
