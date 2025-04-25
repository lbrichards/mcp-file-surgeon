import { TOOL_DESCRIPTIONS } from "../descriptions.js";
export const FIND_IN_FILE_TOOL = {
    name: "find_in_file",
    description: TOOL_DESCRIPTIONS.FIND_IN_FILE.TOOL,
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: TOOL_DESCRIPTIONS.FIND_IN_FILE.PARAMS.FILE_PATH
            },
            search_string: {
                type: "string",
                description: TOOL_DESCRIPTIONS.FIND_IN_FILE.PARAMS.SEARCH_STRING
            }
        },
        required: ["file_path", "search_string"]
    }
};
