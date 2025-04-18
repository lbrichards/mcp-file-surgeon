import fs from 'fs/promises';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

/**
 * Get basic information about a file
 */
export async function getFileInfo(filePath: string) {
  try {
    const stats = await fs.stat(filePath);
    
    return {
      filePath,
      fileName: path.basename(filePath),
      fileSize: stats.size,
      lastModified: stats.mtime,
      isDirectory: stats.isDirectory()
    };
  } catch (error: any) {
    throw new Error(`Failed to get file info: ${error.message}`);
  }
}

/**
 * List contents of a directory
 */
export async function listDirectory(dirPath: string) {
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
  } catch (error: any) {
    throw new Error(`Failed to list directory: ${error.message}`);
  }
}

/**
 * Read file contents
 */
export async function readFile(filePath: string) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return {
      filePath,
      fileName: path.basename(filePath),
      content
    };
  } catch (error: any) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

/**
 * Write content to a file
 */
export async function writeFile(filePath: string, content: string) {
  try {
    await fs.writeFile(filePath, content, 'utf8');
    const fileInfo = await getFileInfo(filePath);
    return {
      success: true,
      message: 'File updated successfully',
      fileInfo
    };
  } catch (error: any) {
    throw new Error(`Failed to write file: ${error.message}`);
  }
}

/**
 * Create a new file with content
 */
export async function createFile(filePath: string, content: string = '') {
  try {
    // Check if file already exists
    try {
      await fs.access(filePath);
      throw new Error('File already exists');
    } catch (err: any) {
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
  } catch (error: any) {
    throw new Error(`Failed to create file: ${error.message}`);
  }
}

/**
 * Delete a file
 */
export async function deleteFile(filePath: string) {
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
  } catch (error: any) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Memory-efficient function to patch specific lines in a file
 * This implementation processes the file line by line without loading it all into memory
 */
export async function patchFileLines(
  filePath: string, 
  startLine: number, 
  endLine: number, 
  replacement: string
) {
  try {
    // Temporary file path
    const tempPath = `${filePath}.tmp`;
    
    // Counters
    let lineCount = 0;
    let inReplaceRange = false;
    let replacementLines = replacement.split('\n');
    let replacementWritten = false;
    
    // Create read and write streams
    const readStream = createReadStream(filePath, { encoding: 'utf8' });
    const writeStream = createWriteStream(tempPath, { encoding: 'utf8' });
    
    // Process the file line by line
    let buffer = '';
    
    for await (const chunk of readStream) {
      buffer += chunk;
      let lineStart = 0;
      let lineEnd = buffer.indexOf('\n');
      
      while (lineEnd !== -1) {
        const line = buffer.substring(lineStart, lineEnd + 1);
        
        if (lineCount === startLine) {
          inReplaceRange = true;
          // Write the replacement content instead of the original lines
          if (!replacementWritten) {
            writeStream.write(replacement);
            if (!replacement.endsWith('\n')) {
              writeStream.write('\n');
            }
            replacementWritten = true;
          }
        } else if (lineCount > startLine && lineCount <= endLine) {
          // Skip these lines as they're being replaced
        } else {
          // Write the original line
          writeStream.write(line);
        }
        
        lineCount++;
        lineStart = lineEnd + 1;
        lineEnd = buffer.indexOf('\n', lineStart);
      }
      
      buffer = buffer.substring(lineStart);
    }
    
    // Handle any remaining content
    if (buffer.length > 0) {
      if (lineCount >= startLine && lineCount <= endLine) {
        // Skip if in the range being replaced
      } else {
        writeStream.write(buffer);
      }
    }
    
    // Close the write stream
    writeStream.end();
    
    // Replace the original file with the temporary file
    await fs.rename(tempPath, filePath);
    
    const fileInfo = await getFileInfo(filePath);
    return {
      success: true,
      message: `Lines ${startLine}-${endLine} modified successfully`,
      linesReplaced: endLine - startLine + 1,
      fileInfo
    };
  } catch (error: any) {
    throw new Error(`Failed to patch file lines: ${error.message}`);
  }
}

/**
 * Memory-efficient function to patch specific character positions in a file
 * This implementation uses streams to avoid loading the entire file into memory
 */
export async function patchFilePositions(
  filePath: string,
  startPos: number,
  endPos: number,
  replacement: string
) {
  try {
    // Validate positions by getting file size
    const stats = await fs.stat(filePath);
    if (startPos < 0 || startPos > stats.size) {
      throw new Error(`Start position ${startPos} is out of range (0-${stats.size})`);
    }
    
    if (endPos < startPos || endPos > stats.size) {
      throw new Error(`End position ${endPos} is out of range (${startPos}-${stats.size})`);
    }
    
    // Temporary file path
    const tempPath = `${filePath}.tmp`;
    
    // Create write stream for output
    const writeStream = createWriteStream(tempPath);
    
    // Write the content before the patch position
    if (startPos > 0) {
      const preStream = createReadStream(filePath, { start: 0, end: startPos - 1 });
      await pipeline(preStream, writeStream, { end: false });
    }
    
    // Write the replacement content
    writeStream.write(replacement);
    
    // Write the content after the patch position
    if (endPos < stats.size) {
      const postStream = createReadStream(filePath, { start: endPos });
      await pipeline(postStream, writeStream, { end: false });
    }
    
    // Close the write stream
    writeStream.end();
    
    // Replace the original file with the temporary file
    await fs.rename(tempPath, filePath);
    
    const fileInfo = await getFileInfo(filePath);
    return {
      success: true,
      message: `Characters ${startPos}-${endPos} modified successfully`,
      charactersReplaced: endPos - startPos,
      fileInfo
    };
  } catch (error: any) {
    throw new Error(`Failed to patch file positions: ${error.message}`);
  }
}
