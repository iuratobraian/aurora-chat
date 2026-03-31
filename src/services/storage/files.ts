import { api } from '../../../convex/_generated/api';
import logger from '../../../lib/utils/logger';
import { convex } from './sync';

export const uploadFile = async (file: File): Promise<string> => {
    const cloudName = "dpm4bnral";
    const uploadPreset = "ml_default";
    
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.secure_url;
        }
    } catch (err) {
        logger.warn("Cloudinary Upload Error, falling back:", err);
    }

    if (!convex) {
        return URL.createObjectURL(file);
    }
    try {
        const uploadUrl = await convex.mutation(api.files.generateUploadUrl);
        const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
        });
        const { storageId } = await result.json();
        const url = await convex.query(api.files.getImageUrl, { storageId });
        return url || '';
    } catch (err) {
        logger.error("Convex Upload Error:", err);
        return URL.createObjectURL(file);
    }
};

export const uploadImageUrl = async (url: string): Promise<string> => {
    return url;
};
