import { promises as fs } from 'fs';
export async function handlePatchFileLines(request) {
    try {
        if (!request.params.arguments ||
            typeof request.params.arguments.file_path !== 'string' ||
            typeof request.params.arguments.start_line !== 'number' ||
            typeof request.params.arguments.end_line !== 'number' ||
            typeof request.params.arguments.replacement !== 'string') {
            throw new Error('Missing or invalid parameters');
        }
        const { file_path, start_line, end_line, replacement } = request.params.arguments;
        // Read the entire file into lines
        const content = await fs.readFile(file_path, 'utf8');
        const lines = content.split('\n');
        // Handle the case where the last line doesn't end with newline
        const endsWithNewline = content.endsWith('\n');
        if (endsWithNewline && lines[lines.length - 1] === '') {
            lines.pop(); // Remove empty string after last newline
        }
        // Create new content array by splicing in the replacement
        const newLines = [...lines]; // Create copy to modify
        const linesToRemove = end_line - start_line + 1;
        const replLines = replacement ? replacement.split('\n') : [];
        newLines.splice(start_line, linesToRemove, ...replLines);
        // Write back to file
        const newContent = newLines.join('\n') + (endsWithNewline ? '\n' : '');
        await fs.writeFile(file_path, newContent);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: `Lines ${start_line}-${end_line} modified successfully`,
                        lines_replaced: linesToRemove
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            content: [{
                    type: "text",
                    text: `Error patching file lines: ${errorMessage}`
                }],
            isError: true
        };
    }
}
