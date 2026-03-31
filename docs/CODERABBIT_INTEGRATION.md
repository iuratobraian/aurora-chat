# CodeRabbit Integration Guide for TradeShare

> AI-powered code reviews integrated with Claude Code for autonomous development workflows

## Overview

This document describes how to integrate CodeRabbit with Claude Code/OpenCode for enhanced AI-powered code reviews in the TradeShare development workflow.

## What is CodeRabbit?

CodeRabbit is an AI-powered code review platform that:
- Spots race conditions, memory leaks, and logic errors
- Provides context-rich feedback for AI agents
- Integrates with Claude Code for autonomous fixing

## Installation

### 1. Install CodeRabbit CLI

```bash
# Linux/macOS
curl -fsSL https://cli.coderabbit.ai/install.sh | sh

# Windows (WSL required)
wsl curl -fsSL https://cli.coderabbit.ai/install.sh | wsl bash
```

Or use the provided script:
```bash
./scripts/install-coderabbit.sh
```

### 2. Authenticate

```bash
coderabbit auth login
```

This will:
1. Open a browser window
2. Log you into CodeRabbit
3. Generate an authentication token
4. Paste the token back in terminal

### 3. Install Claude Code Plugin

In Claude Code or OpenCode, run:
```
/plugin install coderabbit
```

Or from command line:
```bash
claude plugin install coderabbit
```

## Usage

### Running Code Reviews

```bash
/coderabbit:review
```

### Review Options

```bash
/coderabbit:review                    # Review all changes
/coderabbit:review committed          # Only committed changes
/coderabbit:review uncommitted        # Only uncommitted changes
/coderabbit:review --base main       # Compare against main branch
```

### Natural Language

```
Review my code
Check for security issues
What's wrong with my changes?
```

## Integration with Aurora (Our AI Agent)

Aurora can leverage CodeRabbit for:

1. **Pre-commit Reviews**: Before committing, run `/coderabbit:review` to catch issues
2. **Security Scanning**: `Check for security issues` to identify vulnerabilities
3. **Quality Gates**: Automated checks in the development workflow

### Recommended Workflow

```
1. Aurora implements feature
2. Aurora runs: /coderabbit:review uncommitted
3. CodeRabbit analyzes and reports issues
4. Aurora fixes critical issues
5. Commit with confidence
```

## Configuration

### CodeRabbit reads claude.md

Add project-specific context to `.claude.md`:

```markdown
## Code Review Standards

For this project:
- TypeScript + React best practices apply
- Always check for:
  - Memory leaks in React components
  - Race conditions in async operations
  - Security vulnerabilities in auth flows
- Security first: no secrets in code, validate all inputs
```

## Troubleshooting

### Plugin not found
```bash
/plugin marketplace add coderabbitai/claude-plugin
/plugin install coderabbit
```

### CLI not authenticated
```bash
coderabbit auth status
coderabbit auth login
```

### Review taking too long
- Review smaller changesets
- Use `/coderabbit:review uncommitted` for faster reviews
- Work on focused feature branches

## Benefits for TradeShare

1. **Catch Critical Bugs**: Security issues, race conditions, memory leaks
2. **Consistent Quality**: Automated reviews on every feature
3. **Faster Development**: AI fixes issues autonomously
4. **Knowledge Transfer**: Learn best practices from AI feedback

## Pro Tip

Add to your pre-commit hook:

```bash
#!/bin/bash
coderabbit review --uncommitted || echo "CodeRabbit review failed"
```

---

**Last Updated**: 2026-03-27
**Integrado por**: Aurora Mente Maestra
