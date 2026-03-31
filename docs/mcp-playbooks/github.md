# GitHub MCP Playbook

## Purpose
Issues, PRs, checks, code search, and repository operations.

## Priority
Alta

## Setup
```bash
# Install GitHub MCP
npx @modelcontextprotocol/server-github <GITHUB_TOKEN>
```

## Key Capabilities

### Repository Operations
- List issues and PRs
- Create issues and PRs
- Review code
- Check CI/CD status

### Code Search
- Search across repositories
- Find files and functions
- Review code history

## Usage Patterns

### Find Issues
```javascript
// Search for open issues
github.search_issues({ query: "repo:owner/repo is:issue is:open" })
```

### Create Issue
```javascript
github.create_issue({
  owner: "owner",
  repo: "repo",
  title: "Issue title",
  body: "Issue description"
})
```

### Check PR Status
```javascript
github.get_pull_request({
  owner: "owner", 
  repo: "repo",
  pull_number: 123
})
```

## Risk Assessment
- **Risk Level**: Medium
- **Data Exposure**: Repository metadata, code contents
- **Rate Limits**: 5,000 requests/hour for authenticated users

## Troubleshooting
- Token expired → Regenerate GitHub token
- Rate limited → Wait and retry with exponential backoff
- Permission denied → Check token scopes
