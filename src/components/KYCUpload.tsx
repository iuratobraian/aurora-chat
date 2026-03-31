import React, { useState, useRef } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import logger from '../utils/logger';

interface KYCUploadProps {
    oderId: string;
    onUploadComplete?: () => void;
    className?: string;
    compact?: boolean;
}

type DocumentType = 'id' | 'passport' | 'drivers_license';

interface UploadedDocument {
    type: DocumentType;
    preview: string;
    file: File;
    status: 'pending' | 'uploading' | 'uploaded' | 'error';
    progress: number;
}

const documentTypes: { id: DocumentType; name: string; icon: string; description: string }[] = [
    { id: 'id', name: 'DNI / ID Nacional', icon: '🪪', description: 'Documento de identidad nacional' },
    { id: 'passport', name: 'Pasaporte', icon: '📘', description: 'Pasaporte válido' },
    { id: 'drivers_license', name: 'Licencia de Conducir', icon: '🪪', description: 'Licencia de conducir válida' },
];

export default function KYCUpload({ oderId, onUploadComplete, className = '', compact = false }: KYCUploadProps) {
    const uploadDocument = useMutation(api.traderVerification.uploadKYCDocument);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    
    const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) await processFile(file);
    };

    const processFile = async (file: File) => {
        if (!selectedType) {
            setError('Selecciona un tipo de documento primero');
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setError('Solo se aceptan imágenes (JPG, PNG, WebP) o PDF');
            return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('El archivo debe ser menor a 10MB');
            return;
        }

        setCurrentFile(file);
        setError(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const file = e.dataTransfer.files?.[0];
        if (file) await processFile(file);
    };

    const uploadToConvex = async (file: File): Promise<string> => {
        const uploadUrl = await generateUploadUrl();
        
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', uploadUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(progress);
                }
            };
            
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response.storageId);
                } else {
                    reject(new Error('Upload failed'));
                }
            };
            
            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send(file);
        });
    };

    const handleUpload = async () => {
        if (!currentFile || !selectedType) return;

        setUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            const storageId = await uploadToConvex(currentFile);
            const documentUrl = `convex://${storageId}`;
            
            await uploadDocument({
                oderId,
                documentType: selectedType,
                documentUrl,
            });

            setSuccess(true);
            setSelectedType(null);
            setPreviewUrl(null);
            setCurrentFile(null);
            onUploadComplete?.();

            setTimeout(() => setSuccess(false), 4000);
        } catch (err) {
            setError('Error al subir el documento. Intenta de nuevo.');
            logger.error('Upload error:', err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const clearSelection = () => {
        setPreviewUrl(null);
        setCurrentFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`rounded-xl border border-purple-500/30 bg-gray-800/50 p-6 ${className}`}>
            <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📋</span>
                <h2 className="text-xl font-bold">Verificación KYC</h2>
            </div>

            <p className="text-sm text-gray-400 mb-6">
                Sube un documento de identidad para verificar tu cuenta.
                {compact ? '' : ' Tu documento será revisado en 24-48 horas.'}
            </p>

            {success && (
                <div className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/50">
                    <span className="text-green-400 text-sm flex items-center gap-2">
                        <span>✓</span>
                        Documento subido correctamente. Pendiente de revisión.
                    </span>
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50">
                    <span className="text-red-400 text-sm">{error}</span>
                </div>
            )}

            <div className="space-y-3 mb-6">
                {documentTypes.map((doc) => (
                    <button
                        key={doc.id}
                        onClick={() => {
                            if (!previewUrl || selectedType === doc.id) {
                                setSelectedType(doc.id === selectedType ? null : doc.id);
                                clearSelection();
                            }
                        }}
                        className={`
                            w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left
                            ${selectedType === doc.id
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                            }
                        `}
                    >
                        <span className="text-2xl">{doc.icon}</span>
                        <div>
                            <h3 className="font-semibold">{doc.name}</h3>
                            <p className="text-sm text-gray-400">{doc.description}</p>
                        </div>
                        {selectedType === doc.id && (
                            <span className="ml-auto text-purple-400">✓</span>
                        )}
                    </button>
                ))}
            </div>

            <div
                className={`
                    relative rounded-lg border-2 border-dashed p-8 text-center transition-all mb-4
                    ${dragActive
                        ? 'border-purple-500 bg-purple-500/10'
                        : selectedType
                            ? 'border-gray-500 hover:border-purple-500 hover:bg-purple-500/5'
                            : 'border-gray-600'
                    }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileSelect}
                    disabled={!selectedType || uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                
                <div className="pointer-events-none">
                    {previewUrl ? (
                        <div className="space-y-4">
                            <div className="relative mx-auto max-w-xs">
                                {currentFile?.type === 'application/pdf' ? (
                                    <div className="bg-gray-700 p-6 rounded-lg">
                                        <span className="text-5xl block mb-2">📄</span>
                                        <p className="text-sm text-white truncate">{currentFile.name}</p>
                                    </div>
                                ) : (
                                    <img
                                        src={previewUrl}
                                        alt="Vista previa"
                                        className="max-h-40 mx-auto rounded-lg object-contain bg-gray-700"
                                    />
                                )}
                            </div>
                            <p className="text-sm text-gray-400">
                                {(currentFile?.size || 0) / 1024 / 1024 < 1
                                    ? `${((currentFile?.size || 0) / 1024).toFixed(1)} KB`
                                    : `${((currentFile?.size || 0) / 1024 / 1024).toFixed(1)} MB`
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            <span className="text-4xl mb-2 block">📁</span>
                            <p className="text-gray-300 font-medium">
                                {selectedType ? 'Arrastra el archivo aquí o haz clic' : 'Selecciona un tipo de documento primero'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                JPG, PNG, WebP o PDF (máx. 10MB)
                            </p>
                        </>
                    )}
                </div>
            </div>

            {uploading && (
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Subiendo...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-purple-500 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="flex gap-3">
                {previewUrl && (
                    <button
                        onClick={clearSelection}
                        disabled={uploading}
                        className="flex-1 py-3 px-4 rounded-lg border-2 border-gray-600 text-gray-300 hover:bg-gray-700 transition-all disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    onClick={handleUpload}
                    disabled={!previewUrl || !selectedType || uploading}
                    className={`
                        flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                        ${previewUrl && selectedType && !uploading
                            ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    {uploading ? (
                        <>
                            <span className="animate-spin">⏳</span>
                            Subiendo...
                        </>
                    ) : (
                        <>
                            <span>📤</span>
                            Subir Documento
                        </>
                    )}
                </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center flex items-center justify-center gap-1">
                <span>🔒</span>
                Tu documento se almacena de forma segura y solo se usa para verificación.
            </p>
        </div>
    );
}
