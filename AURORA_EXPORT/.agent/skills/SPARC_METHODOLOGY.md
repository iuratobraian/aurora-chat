---
name: sparc_methodology
description: SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology for complex multi-step development tasks. Use when implementing new features, refactoring modules, or building multi-agent pipelines.
---

# SPARC Methodology for TradeShare

SPARC is the preferred methodology when complexity is high. It ensures clear phases and prevents drift.

## Phases

### S — Specification
Define the exact problem, user story, and acceptance criteria.
- What does the user/system need?
- What are the edge cases?
- What files/modules are affected?
- What tests will confirm success?

### P — Pseudocode
Write high-level pseudocode before touching real code.
- No actual TypeScript yet
- Define function signatures and data flow
- Identify dependencies and Convex queries/mutations needed

### A — Architecture
Design the implementation structure.
- Which files will be created or modified?
- What types/interfaces are needed?
- How does this interact with existing modules?
- Define Convex schema changes if needed

### R — Refinement
Implement with iteration.
- Write code following the architecture plan
- Add TypeScript types
- Handle error cases
- Add logging via `logger` where appropriate

### C — Completion
Validate and finalize.
- Run `npm run lint`
- Run `npm test` or relevant test file
- Update `AGENT_LOG.md` with a clear entry
- Update `TASK_BOARD.md` status to `done`

## SPARC Agent Types

| Phase | Primary Agent | Support |
|-------|---------------|---------|
| Specification | `researcher`, `planner` | `sparc-coord` |
| Pseudocode | `sparc-coder`, `coder` | `researcher` |
| Architecture | `system-architect`, `architecture` | `sparc-coord` |
| Refinement | `coder`, `sparc-coder` | `tester`, `reviewer` |
| Completion | `tester`, `reviewer` | `sparc-coord` |

## Example SPARC Invocation

```bash
# Via claude-flow CLI
npx @claude-flow/cli@latest agent use sparc-coord "Implementar sistema de alertas para señales de trading"

# Or via swarm with SPARC roles
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy sparc
```

## TradeShare SPARC Checkpoints

After each phase, store findings in memory:
```bash
npx @claude-flow/cli@latest memory store \
  --key "sparc-[feature]-[phase]" \
  --value "[findings]" \
  --namespace tradeshare-sparc
```

## Anti-Drift Rules for SPARC
1. **Never skip Specification** — jumping to code causes drift
2. **Architect validates Pseudocode** before Refinement starts
3. **Tester writes test stubs during Architecture** phase
4. **Reviewer must approve Completion** before `TASK_BOARD.md` update
5. **All agents write to shared memory namespace** — no siloed context
