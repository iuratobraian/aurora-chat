import { executeWithFreeProvider } from '../providers/free-provider-router.mjs';

/**
 * ImageAssistant - Especialista en Prompt Engineering para Aurora Hive.
 * Transforma ideas simples en prompts detallados para modelos de imagen (DALL-E, Imagen, SDXL).
 */
export class ImageAssistant {
  constructor() {
    this.systemPrompt = `
Eres un experto en Prompt Engineering para modelos de generación de imágenes (SDXL, DALL-E 3, Imagen 4).
Tu misión es recibir una idea básica de un usuario y transformarla en un prompt "PRO" altamente detallado.

REGLAS DE ORO:
1. EXPANSIÓN: Agrega detalles sobre iluminación (cinematic, volumetric, soft), atmósfera, resolución (8k, highly detailed) y estilo artístico.
2. ESTRUCTURA: Usa una estructura clara: [Sujeto], [Acción/Escenario], [Estilo], [Iluminación], [Cámara/Lente], [Render].
3. CATEGORÍA: Clasifica la imagen en una de estas: "Marketing", "UI Design", "Avatar", "Trading Chart", "Ilustration".
4. IDIOMA: El prompt final DEBE estar en INGLÉS (los modelos funcionan mejor así), pero la explicación de lo que hiciste debe estar en ESPAÑOL.

FORMATO DE SALIDA (JSON obligatoriamente):
{
  "refinedPrompt": "PROMPT EN INGLÉS AQUÍ",
  "category": "CATEGORÍA AQUÍ",
  "suggestedFilename": "nombre-archivo-slug.png",
  "explanation": "Breve explicación en español de las mejoras realizadas"
}
`;
  }

  async refine(userPrompt) {
    console.log(`🧠 Aurora IA: Optimizando prompt para generación visual...`);
    
    const task = {
      prompt: `${this.systemPrompt}\n\nUSER IDEA: "${userPrompt}"\n\nResponde SOLO en JSON.`,
      complexity: 'medium',
      maxTokens: 1000,
      temperature: 0.8
    };

    try {
      const response = await executeWithFreeProvider(task);
      const data = JSON.parse(response.content.replace(/```json|```/g, ''));
      return data;
    } catch (error) {
      console.error(`❌ Error en ImageAssistant:`, error.message);
      // Fallback básico si falla la IA de refinamiento
      return {
        refinedPrompt: userPrompt,
        category: 'General',
        suggestedFilename: `generada-${Date.now()}.png`,
        explanation: 'Se usó el prompt original por error en el refinamiento.'
      };
    }
  }
}
