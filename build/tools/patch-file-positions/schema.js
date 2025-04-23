export const PATCH_FILE_POSITIONS_TOOL = {
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
            }
        },
        required: ["file_path", "start_pos", "end_pos", "replacement"]
    }
};
