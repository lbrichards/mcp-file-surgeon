export const CREATE_FILE_TOOL = {
    name: "create_file",
    description: "Create a new file with optional content",
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: "Path to the new file"
            },
            content: {
                type: "string",
                description: "Optional initial content for the file"
            }
        },
        required: ["file_path"]
    }
};
