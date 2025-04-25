import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TOOL_DESCRIPTIONS } from "../descriptions.js";

export const PING_TOOL: Tool = {
    name: "ping",
    description: TOOL_DESCRIPTIONS.PING.TOOL,
    inputSchema: {
        type: "object",
        properties: {},
        required: []
    }
};