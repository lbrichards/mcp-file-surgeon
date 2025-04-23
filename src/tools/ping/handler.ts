import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";

export async function handlePing(request: CallToolRequest) {
    return {
        content: [{
            type: "text",
            text: "pong"
        }]
    };
}