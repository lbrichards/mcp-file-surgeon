import { promises as fs } from 'fs';
export async function handlePatchFilePositions(request) {
    try {
        if (!request.params.arguments ||
            typeof request.params.arguments.file_path !== 'string' ||
            typeof request.params.arguments.start_pos !== 'number' ||
            typeof request.params.arguments.end_pos !== 'number' ||
            typeof request.params.arguments.replacement !== 'string') {
            throw new Error('Missing or invalid parameters');
        }
        const { file_path, start_pos, end_pos, replacement } = request.params.arguments;
        // Validate file exists and get size
        const stats = await fs.stat(file_path);
        // Validate positions against file size
        if (start_pos < 0 || start_pos > stats.size) {
            throw new Error(`Start position ${start_pos} is out of range (0-${stats.size})`);
        }
        if (end_pos < start_pos || end_pos > stats.size) {
            throw new Error(`End position ${end_pos} is out of range (${start_pos}-${stats.size})`);
        }
        // Read the file content
        const content = await fs.readFile(file_path, 'utf8');
        // Create new content by splicing in the replacement
        const newContent = content.slice(0, start_pos) + replacement + content.slice(end_pos);
        // Write the modified content back to the file
        await fs.writeFile(file_path, newContent, 'utf8');
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: `Characters ${start_pos}-${end_pos} modified successfully`,
                        characters_replaced: end_pos - start_pos
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            content: [{
                    type: "text",
                    text: `Error patching file positions: ${errorMessage}`
                }],
            isError: true
        };
    }
}
