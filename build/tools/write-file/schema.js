export const WRITE_FILE_TOOL = {
    name: "write_file",
    description: "Write content to a file, replacing existing content",
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: "Path to the file to write"
            },
            content: {
                type: "string",
                description: "Content to write to the file"
            }
        },
        required: ["file_path", "content"]
    }
};
