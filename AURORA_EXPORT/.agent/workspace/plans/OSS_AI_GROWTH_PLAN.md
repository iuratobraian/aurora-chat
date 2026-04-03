# OSS AI Growth Plan for Aurora

## Objective

Ingest insights from the most active GitHub open-source AI agent repositories (Qwen/Qwen-Agent, Warp, CopilotKit, VoltAgent, LangChain, ActivePieces, Agno, Langfuse) so Aurora gains stateful memory, observability, and multi-agent orchestration best practices.

## Pillars
1. **Agent infrastructure** – Mirror VoltAgent and AutoGen/Moltbot to keep skills registries, role definitions, and secure tool chains. Add `skills/OSS_AGENT_SKILLS.md` capturing key patterns, and integrate `activity_log` hooks so each agent call records the skill used.  
2. **Memory + observability** – Adopt LangChain/Langfuse tracing by tagging each `/learn` entry with `sourceRepo` and storing evaluation metrics (latency, success rate) in `.agent/aurora/activity_digests.jsonl`.  
3. **Research + RAG** – Use CopilotKit/OpenRouter ideas to offer a “research canvas”: add slash command `/research <repo>` that fetches README/pinned docs (via `searchWeb`) and stores key pointers in `.agent/brain/db/oss_ai_repos.jsonl`.  
4. **GPU + performance** – Follow Warp/ActivePieces guidance on GPU acceleration by expanding `.agent/skills/GPU_ACCELERATION.md` and ensuring `scripts/aurora-gpu-check.mjs` logs driver info before heavy ops.  
5. **Community feedback** – Pull in OSS README insights (Qwen, DeepSeek, Agno) and cite them in chat responses when requested for references; new knowledge entries referencing these repos were just added.

## Action Plan
1. Extend `/research` to target GitHub repos (QwenLM/qwen-code, CopilotKit, warp.dev, voltagent/awesome-agent-skills, langchain-ai/deepagents, agno-agi/agno, langfuse/langfuse). Capture summary on success, error message on failure.  
2. Schedule weekly `ops:activity` + `ops:auto-learn` runs, then review `activity_digests` to spot connectors or commands needing tuning.  
3. When `/conectores` lists `aiModels`, include `sourceRepo` metadata pulled from the new `.agent/brain/db/oss_ai_repos.jsonl`.  
4. Document each new fact with `source: github.com/<repo>` so Aurora can say “aprendí esto de VoltAgent…” when replying.  
5. Keep hooking new repositories (OpenHands/Dify, Agno, DeepSeek) by referencing their docs, so you always have a living OSS knowledge base feeding the brain.
