# Notion MCP Server

Official Model Context Protocol server for Notion API integration.

## Overview
Official MCP server from Notion that allows AI agents to interact with Notion workspaces. Provides tools for managing pages, databases, and content.

## Features

### Tools (22 total)
- **Search**: Find pages and databases
- **Create/Update/Delete Pages**: CRUD operations on pages
- **Query Databases**: Filter and sort database entries
- **Create Databases**: Build new Notion databases
- **Add Comments**: Add comments to pages
- **Move Pages**: Relocate pages to different parents
- **Retrieve Metadata**: Get database and page metadata
- **Data Sources**: New v2.0 API support for data sources

## Installation

### Prerequisites
- Notion account
- Notion Integration token (from notion.so/profile/integrations)

### Configuration
```json
{
  "mcpServers": {
    "notionApi": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "ntn_xxxx"
      }
    }
  }
}
```

### Docker Option
```json
{
  "mcpServers": {
    "notionApi": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "-e", "NOTION_TOKEN", "mcp/notion"],
      "env": {
        "NOTION_TOKEN": "ntn_xxxx"
      }
    }
  }
}
```

## Use Cases

### Content Management
- Course curriculum organization
- Lesson planning
- Content calendars

### Student Tracking
- Progress databases
- Assignment tracking
- Grade books

### Collaboration
- Team documentation
- Project management
- Meeting notes

## Security Considerations
- Requires OAuth or Integration token
- Can configure read-only access
- Grant page access explicitly

## Resources
- GitHub: github.com/makenotion/notion-mcp-server
- Docs: developers.notion.com/docs/mcp
