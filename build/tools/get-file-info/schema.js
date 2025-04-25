import { TOOL_DESCRIPTIONS } from "../descriptions.js";
export const GET_FILE_INFO_TOOL = {
    name: "get_file_info",
    description: TOOL_DESCRIPTIONS.GET_FILE_INFO.TOOL,
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: TOOL_DESCRIPTIONS.GET_FILE_INFO.PARAMS.FILE_PATH
            }
        },
        required: ["file_path"]
    }
};
