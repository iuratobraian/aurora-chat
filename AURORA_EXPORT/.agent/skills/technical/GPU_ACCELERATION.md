# GPU Acceleration for Aurora

## Purpose

Document how to expose your local GPU to Aurora’s OSS stack so models (Ollama, Codex OSS, Hugging Face runners) can leverage CUDA/DirectML for faster inference.

## Requirements

1. Install NVIDIA CUDA drivers or AMD ROCm/directML runtime depending on your card.  
2. Ensure `nvidia-smi` (or `radeon-smi` for AMD) is on `PATH`.  
3. Configure the model provider (Ollama, Codex OSS) to use GPU in their settings – usually `ollama inference --gpu` or setting `GPU=1` in `.env.aurora`.  
4. Expose `AURORA_GPU=1` and `OLLAMA_GPU=1` (or provider-specific flags) in `.env.aurora` so connectors know GPU is available.

## Operational Steps

1. Run `scripts/aurora-gpu-check.mjs` to detect GPUs before each heavy job and log the status in `.agent/brain/db/activity_log.jsonl`.  
2. Update `.agent/aurora/ai_models.json` to tag models that can use GPU (`"gpu": true`).  
3. When `/ollama` or `/codex` run, they now include `gpu: true` in the logged metadata if the GPU flag exists, guiding the auto-learn digest.  
4. Keep a reminder in `EXPONENTIAL_GROWTH_PLAN.md` stage 3 to verify GPUs before calling large models.
