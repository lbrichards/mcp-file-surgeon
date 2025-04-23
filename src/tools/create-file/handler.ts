import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';

export async function handleCreateFile(request: CallToolRequest) {
    if (!request.params.arguments || typeof request.params.arguments.file_path !== 'string') {
        return {
            content: [{
                type: "text",
                text: "Error creating file: Missing or invalid file_path parameter"
            }],
            isError: true
        };
    }

    // Check if file exists first
    const fileExists = await fs.access(request.params.arguments.file_path)
        .then(() => true)
        .catch(() => false);
    
    if (fileExists) {
        return {
            content: [{
                type: "text",
                text: "Error creating file: File already exists"
            }],
            isError: true
        };
    }

    try {
        const content: string = typeof request.params.arguments.content === 'string' 
            ? request.params.arguments.content 
            : '';
        await fs.writeFile(request.params.arguments.file_path, content);
        
        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    success: true,
                    message: "File created successfully"
                }, null, 2)
            }]
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            content: [{
                type: "text",
                text: `Error creating file: ${errorMessage}`
            }],
            isError: true
        };
    }
}