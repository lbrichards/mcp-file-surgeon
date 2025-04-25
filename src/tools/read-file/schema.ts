import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TOOL_DESCRIPTIONS } from "../descriptions.js";

export const READ_FILE_TOOL: Tool = {
    name: "read_file",
    description: TOOL_DESCRIPTIONS.READ_FILE.TOOL,
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: TOOL_DESCRIPTIONS.READ_FILE.PARAMS.FILE_PATH
            }
        },
        required: ["file_path"]
    }
};