import { promises as fs } from 'fs';
export async function handleGetFileInfo(request) {
    try {
        if (!request.params.arguments || typeof request.params.arguments.file_path !== 'string') {
            throw new Error('Missing or invalid file_path parameter');
        }
        const fileStats = await fs.stat(request.params.arguments.file_path);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        size: fileStats.size,
                        isFile: fileStats.isFile(),
                        isDirectory: fileStats.isDirectory(),
                        created: fileStats.birthtime,
                        modified: fileStats.mtime,
                        accessed: fileStats.atime,
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            content: [{
                    type: "text",
                    text: `Error getting file info: ${errorMessage}`
                }],
            isError: true
        };
    }
}
