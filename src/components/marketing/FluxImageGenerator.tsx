import React, { useState } from 'react';

interface FluxImageGeneratorProps {
    onImageGenerated?: (imageUrl: string) => void;
}

export function FluxImageGenerator({ onImageGenerated }: FluxImageGeneratorProps) {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateImage = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/huggingface/flux', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    prompt,
                    width: 1024,
                    height: 1024,
                    num_inference_steps: 4,
                    guidance_scale: 3.5,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error generating image');
            }

            const data = await response.json();
            setImage(data.image);
            onImageGenerated?.(data.image);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    onKeyDown={(e) => e.key === 'Enter' && generateImage()}
                />
                <button
                    onClick={generateImage}
                    disabled={loading || !prompt.trim()}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                >
                    {loading ? 'Generating...' : 'Generate'}
                </button>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {image && (
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <img src={image} alt="Generated" className="w-full h-auto" />
                    <button
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = image;
                            link.download = 'flux-image.png';
                            link.click();
                        }}
                        className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/70 text-white text-sm hover:bg-black/90 transition-colors"
                    >
                        Download
                    </button>
                </div>
            )}
        </div>
    );
}

export default FluxImageGenerator;
