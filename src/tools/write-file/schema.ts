import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TOOL_DESCRIPTIONS } from "../descriptions.js";

export const WRITE_FILE_TOOL: Tool = {
    name: "write_file",
    description: TOOL_DESCRIPTIONS.WRITE_FILE.TOOL,
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: TOOL_DESCRIPTIONS.WRITE_FILE.PARAMS.FILE_PATH
            },
            content: {
                type: "string",
                description: TOOL_DESCRIPTIONS.WRITE_FILE.PARAMS.CONTENT
            }
        },
        required: ["file_path", "content"]
    }
};