import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';

export async function handleListDirectory(request: CallToolRequest) {
    try {
        if (!request.params.arguments || typeof request.params.arguments.dir_path !== 'string') {
            throw new Error('Missing or invalid dir_path parameter');
        }

        const entries = await fs.readdir(request.params.arguments.dir_path, { withFileTypes: true });
        const contents = entries.map(entry => ({
            name: entry.name,
            isDirectory: entry.isDirectory(),
            isFile: entry.isFile(),
            isSymlink: entry.isSymbolicLink()
        }));

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    success: true,
                    entries: contents
                }, null, 2)
            }]
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            content: [{
                type: "text",
                text: `Error listing directory: ${errorMessage}`
            }],
            isError: true
        };
    }
}