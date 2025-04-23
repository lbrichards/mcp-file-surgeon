import { promises as fs } from 'fs';
export async function handleWriteFile(request) {
    try {
        if (!request.params.arguments ||
            typeof request.params.arguments.file_path !== 'string' ||
            typeof request.params.arguments.content !== 'string') {
            throw new Error('Missing or invalid parameters');
        }
        await fs.writeFile(request.params.arguments.file_path, request.params.arguments.content);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: "File written successfully"
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            content: [{
                    type: "text",
                    text: `Error writing file: ${errorMessage}`
                }],
            isError: true
        };
    }
}
