export const COPY_FILE_TOOL = {
    name: "copy_file",
    description: "Copy a file from source to destination",
    inputSchema: {
        type: "object",
        properties: {
            source_path: {
                type: "string",
                description: "Path to the source file"
            },
            dest_path: {
                type: "string",
                description: "Path where the file should be copied"
            },
            overwrite: {
                type: "boolean",
                description: "Whether to overwrite if destination exists",
                default: false
            }
        },
        required: ["source_path", "dest_path"]
    }
};
