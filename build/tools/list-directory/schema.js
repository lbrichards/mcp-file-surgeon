import { TOOL_DESCRIPTIONS } from "../descriptions.js";
export const LIST_DIRECTORY_TOOL = {
    name: "list_directory",
    description: TOOL_DESCRIPTIONS.LIST_DIRECTORY.TOOL,
    inputSchema: {
        type: "object",
        properties: {
            dir_path: {
                type: "string",
                description: TOOL_DESCRIPTIONS.LIST_DIRECTORY.PARAMS.DIR_PATH
            }
        },
        required: ["dir_path"]
    }
};
