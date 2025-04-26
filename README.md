# MCP File Surgeon

## What is MCP File Surgeon?

MCP File Surgeon is a Model Context Protocol (MCP) server that provides advanced file system operations for AI assistants like Claude. It enables AI assistants to perform precise file operations that would otherwise be impossible through standard interfaces, including:

- Reading and writing files
- Finding specific content within files
- Patching specific lines or positions in files with preview capabilities
- Getting detailed file information and directory listings
- Slicing files to get specific portions of content

## Why MCP File Surgeon is Beneficial

### For Developers
- **Precise Code Edits**: AI assistants can now make surgical edits to specific lines or character positions in your code files
- **Unified Diff Previews**: See exactly what changes will be made before they happen with standard unified diff format previews
- **Better Context Management**: AI assistants can work with only the relevant portions of files instead of entire codebases
- **No More Copy-Paste**: Directly modify files without error-prone copy-paste workflows
- **Context Window Optimization**: By only loading specific portions of files, File Surgeon drastically reduces the amount of context window used, allowing more room for actual work
- **Token Cost Reduction**: Avoid unnecessary token costs from repeatedly loading entire large files just to make small changes

### For Technical Writers and Content Creators
- **Targeted Edits**: Make changes to specific sections of documents without affecting the rest
- **Content Analysis**: Find and extract specific portions of text from large documents
- **File Management**: Organize and manage files programmatically with AI assistance

### System Reliability Advantages
- **Stateless File Interaction**: File Surgeon provides a stateless way to interact with the file system, avoiding the freezing problems that occur when stateless MCP servers try to use stateful editors like vim, nano, etc.
- **Prevent Session Blocking**: When using traditional command-line editors (which are stateful) through an MCP server, the session often locks and blocks - File Surgeon eliminates this problem entirely
- **Safer Large File Handling**: Work with very large files without risk of session freezing or timeouts

## Features

### Core Tools
- `read_file`: Read the contents of a file
- `write_file`: Create or overwrite a file with specified content
- `patch_file_lines`: Make surgical edits to specific line ranges with preview capability
- `patch_file_positions`: Make surgical edits to specific character positions with preview capability
- `find_in_file`: Locate specific content within a file without loading the entire file
- `get_file_slice`: Extract a specific portion of a file's content
- `get_file_info`: Get metadata about a file (size, timestamps, etc.)
- `list_directory`: List the contents of a directory
- `delete_file`: Remove a file from the filesystem
- `copy_file`: Copy a file from one location to another
- `create_file`: Create a new file with optional content

## Prerequisites

Before using MCP File Surgeon, you need to have the following installed on your system:

- **Node.js** (version 16 or later) - The JavaScript runtime environment
- **npm** (comes with Node.js) - The Node.js package manager
- **npx** (comes with npm 5.2+) - The package runner tool

You can verify these are installed by running:
```bash
node --version
npm --version
npx --version
```

If any are missing, visit [Node.js official site](https://nodejs.org/) to download and install the latest version, which will include both npm and npx.

## Installation

### Using with Claude Desktop
To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`  
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-file-surgeon": {
      "command": "npx",
      "args": [
        "-y",
        "@s1larry/mcp-file-surgeon"
      ]
    }
  }
}
```

### Using As a Developer
Install from npm:

```bash
npm install @s1larry/mcp-file-surgeon
```

## Development

Clone and install dependencies:
```bash
git clone https://github.com/lbrichards/mcp-file-surgeon.git
cd mcp-file-surgeon
npm install
```

Build the server:
```bash
npm run build
```

Run tests:
```bash
npm test
```

For development with auto-rebuild:
```bash
npm run watch
```

### Debugging

Since MCP servers communicate over stdio, debugging can be done using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.

## License

MIT
