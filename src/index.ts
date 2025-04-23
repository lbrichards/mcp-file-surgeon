#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolRequest
} from "@modelcontextprotocol/sdk/types.js";


import { promises as fs } from 'fs';
import { PING_TOOL, handlePing } from './tools/ping/index.js';
import { DELETE_FILE_TOOL, handleDeleteFile } from './tools/delete-file/index.js';
import { GET_FILE_INFO_TOOL, handleGetFileInfo } from './tools/get-file-info/index.js';
import { LIST_DIRECTORY_TOOL, handleListDirectory } from './tools/list-directory/index.js';
import { READ_FILE_TOOL, handleReadFile } from './tools/read-file/index.js';
import { COPY_FILE_TOOL, handleCopyFile } from './tools/copy-file/index.js';
import { WRITE_FILE_TOOL, handleWriteFile } from './tools/write-file/index.js';
import { PATCH_FILE_LINES_TOOL, handlePatchFileLines } from './tools/patch-file-lines/index.js';

async function runServer() {
  const server = new Server(
    {
      name: "file-surgeon-server",
      version: "0.2.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      PING_TOOL,
      DELETE_FILE_TOOL,
      GET_FILE_INFO_TOOL,
      LIST_DIRECTORY_TOOL,
      READ_FILE_TOOL,
      COPY_FILE_TOOL,
      WRITE_FILE_TOOL,
      PATCH_FILE_LINES_TOOL
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    if (request.params.name === "ping") {
      return handlePing(request);
    }

    if (request.params.name === "delete_file") {
      return handleDeleteFile(request);
    }

    if (request.params.name === "get_file_info") {
      return handleGetFileInfo(request);
    }

    if (request.params.name === "list_directory") {
      return handleListDirectory(request);
    }

    if (request.params.name === "read_file") {
      return handleReadFile(request);
    }

    if (request.params.name === "copy_file") {
      return handleCopyFile(request);
    }

    if (request.params.name === "write_file") {
      return handleWriteFile(request);
    }

    if (request.params.name === "patch_file_lines") {
      return handlePatchFileLines(request);
    }

    return {
      content: [{
        type: "text",
        text: `Unknown tool: ${request.params.name}`
      }],
      isError: true
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("File Surgeon MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});