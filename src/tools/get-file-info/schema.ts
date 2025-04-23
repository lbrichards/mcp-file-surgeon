import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const GET_FILE_INFO_TOOL: Tool = {
    name: "get_file_info",
    description: "Get metadata about a file without reading its contents",
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: "Path to the file to inspect"
            }
        },
        required: ["file_path"]
    }
};