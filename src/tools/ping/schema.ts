import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const PING_TOOL: Tool = {
    name: "ping",
    description: "A simple ping tool that returns pong",
    inputSchema: {
        type: "object",
        properties: {},
        required: []
    }
};