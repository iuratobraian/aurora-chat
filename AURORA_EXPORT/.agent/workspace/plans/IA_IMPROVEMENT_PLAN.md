# Aurora Growth Plan

## Goal
Convert Aurora into an interactive, self-improving assistant that learns from each interaction, ingests new information automatically, and coordinates local/cloud agents without manual intervention.

## Strategy
1. **Signal intake** – every slash command should push metadata (query, connectors used, responses) into `.agent/brain/db/activity_log.jsonl`. Monitor that log weekly to confirm new information is captured.
2. **Knowledge expansion** – regular batches of curated entries (heuristics, teardown insights, agent learnings) are appended to the `*.jsonl` knowledge collections; schedule a weekly `ops:knowledge` task that reviews new content before promotion.
3. **Agent synchronization** – when `/local`, `/ollama`, `/codex`, `/codex-cloud` run, log the response and update `CURRENT_FOCUS.md`/`TASK_BOARD.md` so the next session inherits context.
4. **Connector health** – expose dashboard via `/conectores` that tracks availability and failure count; set guard to alert (via `aurora:status`) when no provider is available and include retry instructions.
5. **Action automation** – extend `aurora-shell` with `/learn <entry>` to capture a short fact, plus `/schedule` tasks for future improvements.

## Next Milestones
1. Implement `activity_log.jsonl` and update `buildChatReply` to store every fallback summary entry.
2. Add automation to push fresh knowledge from successful `/web` or `/ollama` results into the curated collections (with review flag).
3. Add health-check alerts when connectors fail and suggest manual fixes in the chat response.
4. Document the process in `IA_IMPROVEMENT_PLAN.md` (this file) and keep adding milestones as the feature list grows.
