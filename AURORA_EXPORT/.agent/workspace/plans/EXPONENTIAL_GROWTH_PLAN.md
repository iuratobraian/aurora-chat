# Aurora Exponential Growth Plan

## Stage 1: Signal Loop (weekly)
1. Log every slash command input/output to `.agent/brain/db/activity_log.jsonl` with metadata (command, connectors, response summary).
2. Summarize the week into `.agent/aurora/activity_digests.jsonl` after inspecting `activity_log`.

## Stage 2: Knowledge Authority
1. Build `/learn <fact>` in `scripts/aurora-shell.mjs` to append curated facts into `.agent/brain/db/teamwork_knowledge.jsonl`.
2. Expand `buildChatReply` to cite new facts before falling back to web search.
3. Schedule `ops:knowledge` tasks to review additions and categorize tags (commands, connectors, agents).

## Stage 3: Connector & Agent Health
1. Extend `/conectores` & `/apis` to show model metadata from `.agent/aurora/ai_models.json`.
2. Emit warnings in chat when connector health drops; embed instructions (e.g., set `BRAVE_SEARCH_API_KEY`).
3. Use `/local`, `/ollama`, `/codex` logs to update `CURRENT_FOCUS.md` so focus stays current.

## Stage 4: Automation & Training
1. Implement guard scripts (`ops:connectors`, `ops:agents`) to run weekly and re-validate keys.
2. Introduce `/learn` command to capture new knowledge as part of interactions.
3. Continue adding curated records referencing open-source repos, recorded under `teamwork_knowledge`.
