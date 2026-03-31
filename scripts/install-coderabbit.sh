#!/usr/bin/env bash
# CodeRabbit CLI Installation Script for TradeShare
# This script installs and configures CodeRabbit CLI for AI-powered code reviews

set -e

echo "🚀 Installing CodeRabbit CLI..."

# Install CodeRabbit CLI
curl -fsSL https://cli.coderabbit.ai/install.sh | sh

# Add to PATH (for current session)
export PATH="$HOME/.local/bin:$PATH"

echo ""
echo "✅ CodeRabbit CLI installed!"
echo ""
echo "📋 Next steps:"
echo "1. Authenticate: coderabbit auth login"
echo "2. Open browser, login to CodeRabbit, copy token"
echo "3. Paste token in terminal"
echo ""
echo "For Claude Code integration, run in Claude Code:"
echo "  /plugin install coderabbit"
echo ""
echo "To run a review:"
echo "  /coderabbit:review"
