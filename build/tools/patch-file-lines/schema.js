import { TOOL_DESCRIPTIONS } from "../descriptions.js";
export const PATCH_FILE_LINES_TOOL = {
    name: "patch_file_lines",
    description: TOOL_DESCRIPTIONS.PATCH_FILE_LINES.TOOL,
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: TOOL_DESCRIPTIONS.PATCH_FILE_LINES.PARAMS.FILE_PATH
            },
            start_line: {
                type: "number",
                description: TOOL_DESCRIPTIONS.PATCH_FILE_LINES.PARAMS.START_LINE
            },
            end_line: {
                type: "number",
                description: TOOL_DESCRIPTIONS.PATCH_FILE_LINES.PARAMS.END_LINE
            },
            replacement: {
                type: "string",
                description: TOOL_DESCRIPTIONS.PATCH_FILE_LINES.PARAMS.REPLACEMENT
            },
            preview_only: {
                type: "boolean",
                description: TOOL_DESCRIPTIONS.PATCH_FILE_LINES.PARAMS.PREVIEW_ONLY,
                default: false
            },
            context_lines: {
                type: "number",
                description: TOOL_DESCRIPTIONS.PATCH_FILE_LINES.PARAMS.CONTEXT_LINES,
                default: 2
            }
        },
        required: ["file_path", "start_line", "end_line", "replacement"]
    }
};
