# Filesystem MCP Playbook

## Purpose
Local file operations, reading, writing, and directory management.

## Priority
Alta

## Setup
```bash
# Filesystem MCP is usually built-in
# Configure allowed directories in .env or config
FILESYSTEM_ALLOWED_DIRS="/path/to/project"
```

## Key Capabilities

### File Operations
- Read files
- Write files
- Create directories
- List directories
- Search files

### File Analysis
- Count lines
- Find patterns
- Analyze structure

## Usage Patterns

### Read File
```javascript
filesystem.read_file({ path: "/path/to/file.txt" })
```

### Write File
```javascript
filesystem.write_file({
  path: "/path/to/file.txt",
  content: "File content"
})
```

### List Directory
```javascript
filesystem.list_directory({ path: "/path/to/dir" })
```

### Search Files
```javascript
filesystem.search_files({
  path: "/path/to/search",
  pattern: "*.ts"
})
```

## Risk Assessment
- **Risk Level**: High
- **Data Exposure**: All local files
- **Mitigation**: Configure allowed directories strictly

## Troubleshooting
- Permission denied → Check file permissions
- File not found → Verify path exists
- Write failed → Check disk space and permissions
