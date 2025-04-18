#!/usr/bin/env node
// Try this import approach instead
// src/index.ts
// For ESM modules (recommended for TypeScript)
import { MCPServer } from "@modelcontextprotocol/sdk/dist/esm/server/mcp.js";
import { z } from "zod";
import * as fileService from './services/fileService.js'; // Note the .js extension
// Create the MCP server
const server = new MCPServer({
    name: "mcp-file-surgeon"
});
// Register file info tool
server.tool("get_file_info", "Get metadata about a file without reading its contents", z.object({
    file_path: z.string().describe("Path to the file"),
}), async (params) => {
    try {
        const fileInfo = await fileService.getFileInfo(params.file_path);
        return {
            file_path: fileInfo.filePath,
            file_name: fileInfo.fileName,
            file_size: fileInfo.fileSize,
            last_modified: fileInfo.lastModified.toISOString(),
            is_directory: fileInfo.isDirectory
        };
    }
    catch (error) {
        throw new Error(`Failed to get file info: ${error.message}`);
    }
});
// Register list directory tool
server.tool("list_directory", "List the contents of a directory", z.object({
    dir_path: z.string().describe("Path to the directory"),
}), async (params) => {
    try {
        const contents = await fileService.listDirectory(params.dir_path);
        return {
            dir_path: contents.dirPath,
            files: contents.files.map((file) => ({
                file_path: file.filePath,
                file_name: file.fileName,
                file_size: file.fileSize,
                last_modified: file.lastModified.toISOString(),
                is_directory: file.isDirectory
            }))
        };
    }
    catch (error) {
        throw new Error(`Failed to list directory: ${error.message}`);
    }
});
// Register read file tool
server.tool("read_file", "Read the contents of a file", z.object({
    file_path: z.string().describe("Path to the file"),
}), async (params) => {
    try {
        const fileContent = await fileService.readFile(params.file_path);
        return {
            file_path: fileContent.filePath,
            file_name: fileContent.fileName,
            content: fileContent.content
        };
    }
    catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
    }
});
// Register write file tool
server.tool("write_file", "Write content to a file (replacing existing content)", z.object({
    file_path: z.string().describe("Path to the file"),
    content: z.string().describe("Content to write to the file"),
}), async (params) => {
    try {
        const result = await fileService.writeFile(params.file_path, params.content);
        return {
            success: result.success,
            message: result.message,
            file_info: result.fileInfo ? {
                file_path: result.fileInfo.filePath,
                file_name: result.fileInfo.fileName,
                file_size: result.fileInfo.fileSize,
                last_modified: result.fileInfo.lastModified.toISOString(),
                is_directory: result.fileInfo.isDirectory
            } : undefined
        };
    }
    catch (error) {
        throw new Error(`Failed to write file: ${error.message}`);
    }
});
// Register create file tool
server.tool("create_file", "Create a new file with content", z.object({
    file_path: z.string().describe("Path for the new file"),
    content: z.string().optional().describe("Initial content for the file"),
}), async (params) => {
    try {
        const result = await fileService.createFile(params.file_path, params.content || '');
        return {
            success: result.success,
            message: result.message,
            file_info: result.fileInfo ? {
                file_path: result.fileInfo.filePath,
                file_name: result.fileInfo.fileName,
                file_size: result.fileInfo.fileSize,
                last_modified: result.fileInfo.lastModified.toISOString(),
                is_directory: result.fileInfo.isDirectory
            } : undefined
        };
    }
    catch (error) {
        throw new Error(`Failed to create file: ${error.message}`);
    }
});
// Register delete file tool
server.tool("delete_file", "Delete a file", z.object({
    file_path: z.string().describe("Path to the file to delete"),
}), async (params) => {
    try {
        const result = await fileService.deleteFile(params.file_path);
        return {
            success: result.success,
            message: result.message,
            file_info: result.fileInfo ? {
                file_path: result.fileInfo.filePath,
                file_name: result.fileInfo.fileName,
                file_size: result.fileInfo.fileSize,
                last_modified: result.fileInfo.lastModified.toISOString(),
                is_directory: result.fileInfo.isDirectory
            } : undefined
        };
    }
    catch (error) {
        throw new Error(`Failed to delete file: ${error.message}`);
    }
});
// Register patch file lines tool
server.tool("patch_file_lines", "Modify specific lines in a file", z.object({
    file_path: z.string().describe("Path to the file"),
    start_line: z.number().int().min(0).describe("Line number to start modification (0-based)"),
    end_line: z.number().int().min(0).describe("Line number to end modification (0-based, inclusive)"),
    replacement: z.string().describe("Text to replace the specified lines"),
}), async (params) => {
    try {
        const result = await fileService.patchFileLines(params.file_path, params.start_line, params.end_line, params.replacement);
        return {
            success: result.success,
            message: result.message,
            lines_replaced: result.linesReplaced,
            file_info: result.fileInfo ? {
                file_path: result.fileInfo.filePath,
                file_name: result.fileInfo.fileName,
                file_size: result.fileInfo.fileSize,
                last_modified: result.fileInfo.lastModified.toISOString(),
                is_directory: result.fileInfo.isDirectory
            } : undefined
        };
    }
    catch (error) {
        throw new Error(`Failed to patch file lines: ${error.message}`);
    }
});
// Register patch file positions tool
server.tool("patch_file_positions", "Modify specific character positions in a file", z.object({
    file_path: z.string().describe("Path to the file"),
    start_pos: z.number().int().min(0).describe("Starting character position"),
    end_pos: z.number().int().min(0).describe("Ending character position (inclusive)"),
    replacement: z.string().describe("Text to replace the specified range"),
}), async (params) => {
    try {
        const result = await fileService.patchFilePositions(params.file_path, params.start_pos, params.end_pos, params.replacement);
        return {
            success: result.success,
            message: result.message,
            characters_replaced: result.charactersReplaced,
            file_info: result.fileInfo ? {
                file_path: result.fileInfo.filePath,
                file_name: result.fileInfo.fileName,
                file_size: result.fileInfo.fileSize,
                last_modified: result.fileInfo.lastModified.toISOString(),
                is_directory: result.fileInfo.isDirectory
            } : undefined
        };
    }
    catch (error) {
        throw new Error(`Failed to patch file positions: ${error.message}`);
    }
});
// Start the server
server.run();
console.log("MCP file surgeon server started");
