import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const DELETE_FILE_TOOL: Tool = {
    name: "delete_file",
    description: "Delete a file",
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: "Path to the file to delete"
            }
        },
        required: ["file_path"]
    }
};