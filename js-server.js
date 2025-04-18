#!/usr/bin/env node

// Using CommonJS require to avoid module resolution issues
const fs = require('fs/promises');
const path = require('path');
const { createReadStream, createWriteStream } = require('fs');
const { pipeline } = require('stream/promises');

// Basic file operations
async function getFileInfo(filePath) {
  try {
    const stats = await fs.stat(filePath);
    
    return {
      filePath,
      fileName: path.basename(filePath),
      fileSize: stats.size,
      lastModified: stats.mtime,
      isDirectory: stats.isDirectory()
    };
  } catch (error) {
    throw new Error(`Failed to get file info: ${error.message}`);
  }
}

async function listDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    const files = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(dirPath, entry.name);
        return getFileInfo(entryPath);
      })
    );
    
    return {
      dirPath,
      files
    };
  } catch (error) {
    throw new Error(`Failed to list directory: ${error.message}`);
  }
}

async function readFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return {
      filePath,
      fileName: path.basename(filePath),
      content
    };
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

async function writeFile(filePath, content) {
  try {
    await fs.writeFile(filePath, content, 'utf8');
    const fileInfo = await getFileInfo(filePath);
    return {
      success: true,
      message: 'File updated successfully',
      fileInfo
    };
  } catch (error) {
    throw new Error(`Failed to write file: ${error.message}`);
  }
}

async function createFile(filePath, content = '') {
  try {
    // Check if file already exists
    try {
      await fs.access(filePath);
      throw new Error('File already exists');
    } catch (err) {
      // File doesn't exist, we can proceed
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
    
    // Create the file
    await fs.writeFile(filePath, content, 'utf8');
    const fileInfo = await getFileInfo(filePath);
    
    return {
      success: true,
      message: 'File created successfully',
      fileInfo
    };
  } catch (error) {
    throw new Error(`Failed to create file: ${error.message}`);
  }
}

async function deleteFile(filePath) {
  try {
    // Get file info before deletion
    const fileInfo = await getFileInfo(filePath);
    
    // Delete the file
    await fs.unlink(filePath);
    
    return {
      success: true,
      message: 'File deleted successfully',
      fileInfo
    };
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

async function patchFileLines(filePath, startLine, endLine, replacement) {
  try {
    // Temporary file path
    const tempPath = `${filePath}.tmp`;
    
    // Read all lines - this is simpler for the JS version
    // We could optimize this for large files if needed
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Validate line numbers
    if (startLine < 0 || startLine >= lines.length) {
      throw new Error(`Start line ${startLine} is out of range (0-${lines.length - 1})`);
    }
    
    if (endLine < startLine || endLine >= lines.length) {
      throw new Error(`End line ${endLine} is out of range (${startLine}-${lines.length - 1})`);
    }
    
    // Create new content by replacing specified lines
    const replacementLines = replacement.split('\n');
    const newLines = [
      ...lines.slice(0, startLine),
      ...replacementLines,
      ...lines.slice(endLine + 1)
    ];
    
    // Join lines back to string
    const newContent = newLines.join('\n');
    
    // Write the modified content back to the file
    await fs.writeFile(tempPath, newContent, 'utf8');
    await fs.rename(tempPath, filePath);
    
    const fileInfo = await getFileInfo(filePath);
    return {
      success: true,
      message: `Lines ${startLine}-${endLine} modified successfully`,
      linesReplaced: endLine - startLine + 1,
      fileInfo
    };
  } catch (error) {
    throw new Error(`Failed to patch file lines: ${error.message}`);
  }
}

async function patchFilePositions(filePath, startPos, endPos, replacement) {
  try {
    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    
    // Validate positions
    if (startPos < 0 || startPos > content.length) {
      throw new Error(`Start position ${startPos} is out of range (0-${content.length})`);
    }
    
    if (endPos < startPos || endPos > content.length) {
      throw new Error(`End position ${endPos} is out of range (${startPos}-${content.length})`);
    }
    
    // Create new content by replacing specified range
    const newContent = content.substring(0, startPos) + replacement + content.substring(endPos);
    
    // Write the modified content back to the file
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, newContent, 'utf8');
    await fs.rename(tempPath, filePath);
    
    const fileInfo = await getFileInfo(filePath);
    return {
      success: true,
      message: `Characters ${startPos}-${endPos} modified successfully`,
      charactersReplaced: endPos - startPos,
      fileInfo
    };
  } catch (error) {
    throw new Error(`Failed to patch file positions: ${error.message}`);
  }
}

// For MCP interface compatibility
// Define a simple protocol that Claude can use
// This implements a basic STDIO-based protocol

// Standard output for responses
function sendResponse(id, result) {
  console.log(JSON.stringify({
    id,
    result
  }));
}

// Standard output for errors
function sendError(id, message) {
  console.error(JSON.stringify({
    id,
    error: {
      message
    }
  }));
}

// Read from standard input
process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = '';

// Process incoming requests
process.stdin.on('data', (chunk) => {
  inputBuffer += chunk;
  
  // Process complete JSON objects
  const lines = inputBuffer.split('\n');
  inputBuffer = lines.pop(); // Keep the last incomplete line in the buffer
  
  for (const line of lines) {
    if (line.trim() === '') continue;
    
    try {
      const request = JSON.parse(line);
      processRequest(request);
    } catch (error) {
      console.error(`Failed to parse request: ${error.message}`);
    }
  }
});

// Process a request
async function processRequest(request) {
  const { id, method, params } = request;
  
  // Handle known methods
  try {
    if (method === 'list_tools') {
      sendResponse(id, {
        tools: [
          {
            name: 'get_file_info',
            description: 'Get metadata about a file without reading its contents',
            parameters: {
              properties: {
                file_path: { type: 'string', description: 'Path to the file' }
              },
              required: ['file_path']
            }
          },
          {
            name: 'list_directory',
            description: 'List the contents of a directory',
            parameters: {
              properties: {
                dir_path: { type: 'string', description: 'Path to the directory' }
              },
              required: ['dir_path']
            }
          },
          {
            name: 'read_file',
            description: 'Read the contents of a file',
            parameters: {
              properties: {
                file_path: { type: 'string', description: 'Path to the file' }
              },
              required: ['file_path']
            }
          },
          {
            name: 'write_file',
            description: 'Write content to a file (replacing existing content)',
            parameters: {
              properties: {
                file_path: { type: 'string', description: 'Path to the file' },
                content: { type: 'string', description: 'Content to write to the file' }
              },
              required: ['file_path', 'content']
            }
          },
          {
            name: 'create_file',
            description: 'Create a new file with content',
            parameters: {
              properties: {
                file_path: { type: 'string', description: 'Path for the new file' },
                content: { type: 'string', description: 'Initial content for the file' }
              },
              required: ['file_path']
            }
          },
          {
            name: 'delete_file',
            description: 'Delete a file',
            parameters: {
              properties: {
                file_path: { type: 'string', description: 'Path to the file to delete' }
              },
              required: ['file_path']
            }
          },
          {
            name: 'patch_file_lines',
            description: 'Modify specific lines in a file',
            parameters: {
              properties: {
                file_path: { type: 'string', description: 'Path to the file' },
                start_line: { type: 'integer', description: 'Line number to start modification (0-based)' },
                end_line: { type: 'integer', description: 'Line number to end modification (0-based, inclusive)' },
                replacement: { type: 'string', description: 'Text to replace the specified lines' }
              },
              required: ['file_path', 'start_line', 'end_line', 'replacement']
            }
          },
          {
            name: 'patch_file_positions',
            description: 'Modify specific character positions in a file',
            parameters: {
              properties: {
                file_path: { type: 'string', description: 'Path to the file' },
                start_pos: { type: 'integer', description: 'Starting character position' },
                end_pos: { type: 'integer', description: 'Ending character position (inclusive)' },
                replacement: { type: 'string', description: 'Text to replace the specified range' }
              },
              required: ['file_path', 'start_pos', 'end_pos', 'replacement']
            }
          }
        ]
      });
      return;
    }
    
    if (method === 'call_tool') {
      const { tool, parameters } = params;
      
      // Route to the appropriate function
      let result;
      switch (tool) {
        case 'get_file_info':
          result = await getFileInfo(parameters.file_path);
          break;
        case 'list_directory':
          result = await listDirectory(parameters.dir_path);
          break;
        case 'read_file':
          result = await readFile(parameters.file_path);
          break;
        case 'write_file':
          result = await writeFile(parameters.file_path, parameters.content);
          break;
        case 'create_file':
          result = await createFile(parameters.file_path, parameters.content || '');
          break;
        case 'delete_file':
          result = await deleteFile(parameters.file_path);
          break;
        case 'patch_file_lines':
          result = await patchFileLines(
            parameters.file_path,
            parameters.start_line,
            parameters.end_line,
            parameters.replacement
          );
          break;
        case 'patch_file_positions':
          result = await patchFilePositions(
            parameters.file_path,
            parameters.start_pos,
            parameters.end_pos,
            parameters.replacement
          );
          break;
        default:
          throw new Error(`Unknown tool: ${tool}`);
      }
      
      sendResponse(id, result);
      return;
    }
    
    // Unknown method
    throw new Error(`Unknown method: ${method}`);
  } catch (error) {
    sendError(id, error.message);
  }
}

// Send server info to stdout
console.log(JSON.stringify({
  server_info: {
    name: 'mcp-file-surgeon',
    version: '0.1.0'
  }
}));

console.error('MCP file surgeon server started');