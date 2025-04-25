import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TOOL_DESCRIPTIONS } from "../descriptions.js";

export const PATCH_FILE_POSITIONS_TOOL: Tool = {
    name: "patch_file_positions",
    description: TOOL_DESCRIPTIONS.PATCH_FILE_POSITIONS.TOOL,
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: TOOL_DESCRIPTIONS.PATCH_FILE_POSITIONS.PARAMS.FILE_PATH
            },
            start_pos: {
                type: "number",
                description: TOOL_DESCRIPTIONS.PATCH_FILE_POSITIONS.PARAMS.START_POS
            },
            end_pos: {
                type: "number",
                description: TOOL_DESCRIPTIONS.PATCH_FILE_POSITIONS.PARAMS.END_POS
            },
            replacement: {
                type: "string",
                description: TOOL_DESCRIPTIONS.PATCH_FILE_POSITIONS.PARAMS.REPLACEMENT
            },
            preview_only: {
                type: "boolean",
                description: TOOL_DESCRIPTIONS.PATCH_FILE_POSITIONS.PARAMS.PREVIEW_ONLY,
                default: false
            },
            context_chars: {
                type: "number",
                description: TOOL_DESCRIPTIONS.PATCH_FILE_POSITIONS.PARAMS.CONTEXT_CHARS,
                default: 20
            }
        },
        required: ["file_path", "start_pos", "end_pos", "replacement"]
    }
};