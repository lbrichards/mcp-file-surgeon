import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const READ_FILE_TOOL: Tool = {
    name: "read_file",
    description: "Read content of a file",
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: "Path to the file to read"
            }
        },
        required: ["file_path"]
    }
};