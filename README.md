# MCP File Surgeon

A Model Context Protocol (MCP) server for performing surgical file editing operations.

## Features

- Get file information and metadata
- List directory contents
- Read and write files
- Create and delete files
- Memory-efficient patching of specific lines in files
- Memory-efficient patching of specific character positions in files

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`

## Usage

You can run the server directly:

```
npm start
```

Or use it with Claude by adding it to your Claude configuration:

```json
{
  "mcpServers": {
    "mcp-file-surgeon": {
      "command": "node",
      "args": [
        "/path/to/mcp-file-surgeon/dist/index.js"
      ],
      "cwd": "/path/to/mcp-file-surgeon"
    }
  }
}
```

## Available Tools

- `get_file_info`: Get metadata about a file without reading its contents
- `list_directory`: List contents of a directory
- `read_file`: Read the contents of a file
- `write_file`: Write content to a file (replacing existing content)
- `create_file`: Create a new file with content
- `delete_file`: Delete a file
- `patch_file_lines`: Modify specific lines in a file
- `patch_file_positions`: Modify specific character positions in a file

## License

MIT
