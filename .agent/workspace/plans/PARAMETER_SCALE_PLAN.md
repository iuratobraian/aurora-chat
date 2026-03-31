# Ruta hacia modelos de miles de millones de parámetros

## Meta

Migrar a agentes con 3B-8B parámetros aprovechando infraestructura local (GPU/CUDA/DirectML) y los conectores OSS que ya configuramos, manteniendo Aurora como glue para entrenamiento, despliegue y observabilidad.

## Etapas
1. **Diagnóstico de hardware** – validar GPUs (nvidia-smi/rocm-smi), memoria y energía. El script `scripts/aurora-gpu-check.mjs` ya detecta drivers; expandir para medir VRAM libre y latencia de I/O.
2. **Stack OSS escalable** – adoptar modelos open-source listados (`DeepSeek-V3`, `Qwen`, `Mistral-8x7B`, `Stability-Instruct`) y gestionarlos vía `ai_models.json`. Cada modelo debe tener:
   - flags de GPU (`gpuCapable`)
   - endpoint local (`OLLAMA_BASE_URL`, `Codex`, `OpenRouter`)
   - token de seguridad y límites (registro en `.env.aurora`)
3. **Pipeline de entrenamiento** – usar frameworks abiertos (Hugging Face Accelerate, DeepSeek Trainer, Ollama Fine-tune) conectados mediante scripts:
   - captura dataset (RAG, code, prompts) desde actividad log.
   - entrenar/afinar localmente o en nube con tokens.
   - versionar pesos en `.agent/aurora/models/`.
4. **Auto-mejora** – serializar resoluciones en `/learn` y `activity_log`, luego ejecutar `ops:auto-learn` para generar datos de entrenamiento. Cada ciclo produce un nuevo `oss_ai_repos` y actualiza el knowledge base.
5. **Monitorización y gobernanza** – cada comando `/web`, `/research` y `/codex` registra métricas (latencia, tokens, success) en `.agent/aurora/activity_metrics.json` y `activity_digest`; activar alertas si el uso supera umbrales o los modelos se saturan.

## Scripts necesarios
- `scripts/aurora-train-loop.mjs` – lanza entrenamientos escalables con Hugging Face + local GPU.
- `scripts/aurora-models-status.mjs` – resume disponibilidad de modelos 3B-8B, GPU, fallas y fallback.
- `scripts/aurora-gpu-check.mjs` ya está; ampliarlo para mostrar VRAM libre y temperaturas cada hora.

## Cronograma sugerido
1. semana 1: inventario de hardware y modelos OSS, actualizar `ai_models.json`.
2. semana 2: automatizar `/learn` + `ops:auto-learn`, añadir `activity_metrics`.
3. semana 3: entrenamiento de un modelo 3B en local (prueba con DeepSeek-V3 o Qwen-3B).
4. semana 4: desplegar en Aurora (actualizar `/conectores`, registrar en plan de crecimiento, documentar en `GPU_ACCELERATION`).
