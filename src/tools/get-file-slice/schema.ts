import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TOOL_DESCRIPTIONS } from "../descriptions.js";

export const GET_FILE_SLICE_TOOL: Tool = {
    name: "get_file_slice",
    description: TOOL_DESCRIPTIONS.GET_FILE_SLICE.TOOL,
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: TOOL_DESCRIPTIONS.GET_FILE_SLICE.PARAMS.FILE_PATH
            },
            start_position: {
                type: "number",
                description: TOOL_DESCRIPTIONS.GET_FILE_SLICE.PARAMS.START_POSITION
            },
            length: {
                type: "number",
                description: TOOL_DESCRIPTIONS.GET_FILE_SLICE.PARAMS.LENGTH
            },
            context_lines: {
                type: "number",
                description: TOOL_DESCRIPTIONS.GET_FILE_SLICE.PARAMS.CONTEXT_LINES,
                optional: true,
                default: 2
            }
        },
        required: ["file_path", "start_position", "length"]
    }
};