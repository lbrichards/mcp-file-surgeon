import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const GET_FILE_SLICE_TOOL: Tool = {
    name: "get_file_slice",
    description: "Get a portion of a file's content given byte positions",
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: "Path to the file"
            },
            start_position: {
                type: "number",
                description: "Starting byte position"
            },
            length: {
                type: "number",
                description: "Number of bytes to read"
            },
            context_lines: {
                type: "number",
                description: "Number of lines of context to include before/after",
                optional: true,
                default: 2
            }
        },
        required: ["file_path", "start_position", "length"]
    }
};