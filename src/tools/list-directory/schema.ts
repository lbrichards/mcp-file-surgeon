import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const LIST_DIRECTORY_TOOL: Tool = {
    name: "list_directory",
    description: "List contents of a directory",
    inputSchema: {
        type: "object",
        properties: {
            dir_path: {
                type: "string",
                description: "Directory path to list"
            }
        },
        required: ["dir_path"]
    }
};