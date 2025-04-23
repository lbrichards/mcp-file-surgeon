import { promises as fs } from 'fs';
export async function handleDeleteFile(request) {
    try {
        if (!request.params.arguments || typeof request.params.arguments.file_path !== 'string') {
            throw new Error('Missing or invalid file_path parameter');
        }
        await fs.unlink(request.params.arguments.file_path);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: "File deleted successfully"
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            content: [{
                    type: "text",
                    text: `Error deleting file: ${errorMessage}`
                }],
            isError: true
        };
    }
}
