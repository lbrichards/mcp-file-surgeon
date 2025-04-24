import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const PATCH_FILE_POSITIONS_TOOL: Tool = {
    name: "patch_file_positions",
    description: "Modify specific character positions in a file",
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: "Path to the file"
            },
            start_pos: {
                type: "number",
                description: "Starting character position"
            },
            end_pos: {
                type: "number",
                description: "Ending character position (inclusive)"
            },
            replacement: {
                type: "string",
                description: "Text to replace the specified range"
            },
            preview_only: {
                type: "boolean",
                description: "When true, returns a preview without modifying the file",
                default: false
            },
            context_chars: {
                type: "number",
                description: "Number of characters before and after the change to include in preview",
                default: 20
            }
        },
        required: ["file_path", "start_pos", "end_pos", "replacement"]
    }
};