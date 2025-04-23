import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const FIND_IN_FILE_TOOL: Tool = {
    name: "find_in_file",
    description: "Find the byte position of a string in a file without loading the entire file",
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: "Path to the file to search"
            },
            search_string: {
                type: "string",
                description: "String to find in the file"
            }
        },
        required: ["file_path", "search_string"]
    }
};