import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TOOL_DESCRIPTIONS } from "../descriptions.js";

export const LIST_DIRECTORY_TOOL: Tool = {
    name: "list_directory",
    description: TOOL_DESCRIPTIONS.LIST_DIRECTORY.TOOL,
    inputSchema: {
        type: "object",
        properties: {
            dir_path: {
                type: "string",
                description: TOOL_DESCRIPTIONS.LIST_DIRECTORY.PARAMS.DIR_PATH
            }
        },
        required: ["dir_path"]
    }
};