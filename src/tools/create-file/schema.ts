import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TOOL_DESCRIPTIONS } from "../descriptions.js";

export const CREATE_FILE_TOOL: Tool = {
    name: "create_file",
    description: TOOL_DESCRIPTIONS.CREATE_FILE.TOOL,
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: TOOL_DESCRIPTIONS.CREATE_FILE.PARAMS.FILE_PATH
            },
            content: {
                type: "string",
                description: TOOL_DESCRIPTIONS.CREATE_FILE.PARAMS.CONTENT
            }
        },
        required: ["file_path"]
    }
};