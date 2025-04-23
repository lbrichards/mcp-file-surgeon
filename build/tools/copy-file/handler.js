import { promises as fs } from 'fs';
import path from 'path';
export async function handleCopyFile(request) {
    try {
        if (!request.params.arguments ||
            typeof request.params.arguments.source_path !== 'string' ||
            typeof request.params.arguments.dest_path !== 'string') {
            throw new Error('Missing or invalid source_path or dest_path parameter');
        }
        const { source_path, dest_path, overwrite = false } = request.params.arguments;
        // Check if source exists
        await fs.access(source_path);
        // Check if destination exists (if not overwriting)
        if (!overwrite) {
            try {
                await fs.access(dest_path);
                throw new Error('Destination file already exists and overwrite is false');
            }
            catch (err) {
                if (err.code !== 'ENOENT') {
                    throw err;
                }
                // ENOENT means file doesn't exist, which is what we want
            }
        }
        // Ensure destination directory exists
        await fs.mkdir(path.dirname(dest_path), { recursive: true });
        // Copy the file
        await fs.copyFile(source_path, dest_path);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: "File copied successfully",
                        source: source_path,
                        destination: dest_path
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            content: [{
                    type: "text",
                    text: `Error copying file: ${errorMessage}`
                }],
            isError: true
        };
    }
}
