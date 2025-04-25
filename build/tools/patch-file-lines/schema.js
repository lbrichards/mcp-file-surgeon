export const PATCH_FILE_LINES_TOOL = {
    name: "patch_file_lines",
    description: "Modify specific lines in a file",
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: "Path to the file"
            },
            start_line: {
                type: "number",
                description: "Line number to start modification (0-based)"
            },
            end_line: {
                type: "number",
                description: "Line number to end modification (0-based, inclusive)"
            },
            replacement: {
                type: "string",
                description: "Text to replace the specified lines"
            },
            preview_only: {
                type: "boolean",
                description: "When true, returns a preview without modifying the file",
                default: false
            },
            context_lines: {
                type: "number",
                description: "Number of lines before and after the change to include in preview",
                default: 2
            }
        },
        required: ["file_path", "start_line", "end_line", "replacement"]
    }
};
