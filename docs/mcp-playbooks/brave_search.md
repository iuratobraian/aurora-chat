# Brave Search MCP Playbook

## Purpose
Web search for research, documentation, and real-time information.

## Priority
Alta

## Setup
```bash
# Set API key in environment
BRAVE_SEARCH_API_KEY=your_api_key

# Install Brave MCP
npx @modelcontextprotocol/server-brave-search
```

## Key Capabilities

### Search
- Web search
- News search
- Local search
- Image search

### Research
- Gather information
- Find documentation
- Research competitors
- Track trends

## Usage Patterns

### Basic Search
```javascript
brave.search({ query: "Aurora AI agents trends 2026" })
```

### News Search
```javascript
brave.search_news({ query: "AI agent frameworks" })
```

### Local Search
```javascript
brave.search_local({ query: "coffee shops nearby" })
```

## Risk Assessment
- **Risk Level**: Low
- **Data Exposure**: Search queries, IP address
- **Rate Limits**: 2,000 queries/month (free tier)

## Troubleshooting
- No results → Try different query
- Rate limited → Wait or upgrade plan
- API key invalid → Check BRAVE_SEARCH_API_KEY
