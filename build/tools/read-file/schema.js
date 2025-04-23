export const READ_FILE_TOOL = {
    name: "read_file",
    description: "Read content of a file",
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: "Path to the file to read"
            }
        },
        required: ["file_path"]
    }
};
