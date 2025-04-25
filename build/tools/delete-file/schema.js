import { TOOL_DESCRIPTIONS } from "../descriptions.js";
export const DELETE_FILE_TOOL = {
    name: "delete_file",
    description: TOOL_DESCRIPTIONS.DELETE_FILE.TOOL,
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: TOOL_DESCRIPTIONS.DELETE_FILE.PARAMS.FILE_PATH
            }
        },
        required: ["file_path"]
    }
};
