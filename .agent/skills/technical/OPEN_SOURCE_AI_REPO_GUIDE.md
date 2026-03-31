# Open-source AI Repository Guide

## Purpose

Frame Aurora’s growth using lessons from top open-source AI platforms (Hugging Face, Ollama, LM Studio, OpenRouter, Codex OSS) so we can keep improving signal, connectors, and multi-agent collaboration.

## Key Insights

- **Model hosting patterns** (Hugging Face/LM Studio):
  - keep metadata per model (name, tags, capabilities) in `.agent/aurora/ai_models.json`.
  - expose `GET /models` so Aurora can list what’s running locally/cloud before assigning work.
- **Connector orchestration** (OpenRouter):
  - treat each provider as an agent with health, cost, latency; log failures into `.agent/brain/db/activity_log.jsonl`.
- **Agent middle-layer** (Ollama / Codex CLI):
  - shell wrappers (`aurora-agent-bridge.mjs`) should handle retries, logging, and fallback to another model when the primary fails.
- **Knowledge distillation** (Hugging Face spaces + Codex experience):
  - convert useful outputs into `.jsonl` records tagged `source:repo` so Aurora tracks provenance before trusting the fact.

## Next Steps

- Create `.agent/aurora/ai_models.json` with sample open-source models and providers.
- Update `/conectores` response to expose this metadata so `/apis` and chat can mention the exact model name before a slash command.
- Add a “repo intelligence” entry to the knowledge files (e.g., `.agent/brain/db/teamwork_knowledge.jsonl`) referencing Hugging Face, Ollama, Codex docs as sources so the plan can cite them.
