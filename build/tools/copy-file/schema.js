import { TOOL_DESCRIPTIONS } from "../descriptions.js";
export const COPY_FILE_TOOL = {
    name: "copy_file",
    description: TOOL_DESCRIPTIONS.COPY_FILE.TOOL,
    inputSchema: {
        type: "object",
        properties: {
            source_path: {
                type: "string",
                description: TOOL_DESCRIPTIONS.COPY_FILE.PARAMS.SOURCE_PATH
            },
            dest_path: {
                type: "string",
                description: TOOL_DESCRIPTIONS.COPY_FILE.PARAMS.DEST_PATH
            },
            overwrite: {
                type: "boolean",
                description: TOOL_DESCRIPTIONS.COPY_FILE.PARAMS.OVERWRITE,
                default: false
            }
        },
        required: ["source_path", "dest_path"]
    }
};
