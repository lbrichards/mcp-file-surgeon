import { promises as fs } from 'fs';
export async function handleReadFile(request) {
    try {
        if (!request.params.arguments || typeof request.params.arguments.file_path !== 'string') {
            throw new Error('Missing or invalid file_path parameter');
        }
        const content = await fs.readFile(request.params.arguments.file_path, 'utf8');
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        content: content
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            content: [{
                    type: "text",
                    text: `Error reading file: ${errorMessage}`
                }],
            isError: true
        };
    }
}
