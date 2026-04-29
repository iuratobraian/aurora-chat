import axios from 'axios';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

async function consultKimi() {
    if (!NVIDIA_API_KEY) {
        console.error("NVIDIA_API_KEY missing");
        return;
    }

    const prompt = `
    ARQUITECTO KIMI K2.5 - REVISIÓN DE EMERGENCIA
    
    Tarea: Automatización Aurora TV y Voice Cache.
    Problema: Crash persistente "Server Error" en tvGrid:getUpcomingSlots.
    
    Estado actual de los archivos:
    1. convex/schema/system.ts: Tablas tv_grid, tv_playlists, voice_cache.
    2. convex/tvGrid.ts: Queries getCurrentBroadcast, getUpcomingSlots.
    3. src/server/routes/tts.routes.ts: Rutas con cacheo.
    
    Contexto: Se detectó un error al usar ctx.db.get con un string (userId) en lugar de un Id de Convex. Se corrigió a búsqueda por índice.
    
    Analiza la arquitectura para asegurar:
    - Que no haya cuellos de botella en la grilla.
    - Que el cacheo de voz sea resiliente.
    - Que no haya problemas de tipos o referencias circulares entre subcarpetas.
    
    Respuesta en formato Arquitectura Maestra.
    `;

    try {
        const response = await axios.post(
            'https://integrate.api.nvidia.com/v1/chat/completions',
            {
                model: 'deepseek-ai/deepseek-v3', // Kimi alias or DeepSeek for high reasoning
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                max_tokens: 2000,
            },
            {
                headers: {
                    'Authorization': `Bearer ${NVIDIA_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const content = response.data.choices[0].message.content;
        fs.writeFileSync('scripts/kimi-task-TV-FIX.md', content);
        console.log("Kimi Architecture Review generated at scripts/kimi-task-TV-FIX.md");
        console.log("\n--- KIMI REVIEW ---\n");
        console.log(content);
    } catch (error) {
        console.error("Error consulting Kimi:", error.response?.data || error.message);
    }
}

consultKimi();
