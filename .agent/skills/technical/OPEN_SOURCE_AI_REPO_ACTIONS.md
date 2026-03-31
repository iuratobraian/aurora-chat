# Open Source AI Repository Actions

## Referencias clave
- **DeepSeek-V3 / Qwen** – modelos MoE y multi-lingual open releases; use them for training/testing reasoning chains.  
- **Dify / OpenHands platforms** – production-ready stacks that combine RAG, tool calling, and multi-agent orchestration; mimic their telemetry + safeguards.  
- **AutoGen + Semantic Kernel** – event-driven, graph-based agent loops that ensure deterministic role transitions among specialized agents.  
- **LangChain / LangGraph / LlamaIndex** – maintain memory + reasoning across the pipeline, exactly what Aurora needs for `/learn` + knowledge loops.  
- **OpenRouter / Ollama / Codex OSS** – standardize connectors as `ai_model` entries so slash commands know which backend to call.

## Actions for Aurora
1. Mirror LangChain’s memory/multi-agent connectors via the `/learn` command and `teamwork_knowledge` records.  
2. Adopt Dify-style health checks: track connector latency, warn when keys expire, and log those events in `activity_log`.  
3. Apply AutoGen’s structured prompt patterns to the slash commands and the UI chat so each agent (Ollama, Codex, OpenCode) knows its role.  
4. Regularly import model metadata (weights, capabilities) into `.agent/aurora/ai_models.json` when you update your local OSS stack.
