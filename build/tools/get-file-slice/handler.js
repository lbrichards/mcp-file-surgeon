import { promises as fs } from 'fs';
export async function handleGetFileSlice(request) {
    try {
        if (!request.params.arguments ||
            typeof request.params.arguments.file_path !== 'string' ||
            typeof request.params.arguments.start_position !== 'number' ||
            typeof request.params.arguments.length !== 'number') {
            throw new Error('Missing or invalid parameters');
        }
        const { file_path, start_position, length } = request.params.arguments;
        const context_lines = typeof request.params.arguments.context_lines === 'number'
            ? request.params.arguments.context_lines
            : 2;
        const fileHandle = await fs.open(file_path, 'r');
        const buffer = Buffer.alloc(length);
        const { bytesRead } = await fileHandle.read(buffer, 0, length, start_position);
        await fileHandle.close();
        let content = buffer.toString('utf8', 0, bytesRead);
        if (context_lines > 0) {
            const fullContent = await fs.readFile(file_path, 'utf8');
            const lines = fullContent.split('\n');
            let targetLineNumber = 0;
            let currentPos = 0;
            for (let i = 0; i < lines.length; i++) {
                if (currentPos + lines[i].length >= start_position) {
                    targetLineNumber = i;
                    break;
                }
                currentPos += lines[i].length + 1;
            }
            const startLine = Math.max(0, targetLineNumber - context_lines);
            const endLine = Math.min(lines.length, targetLineNumber + context_lines + 1);
            const contextContent = lines.slice(startLine, endLine).join('\n');
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            slice: content,
                            with_context: contextContent,
                            line_number: targetLineNumber + 1,
                            context_start_line: startLine + 1,
                            context_end_line: endLine
                        }, null, 2)
                    }]
            };
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        slice: content,
                        bytes_read: bytesRead
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            content: [{
                    type: "text",
                    text: `Error getting file slice: ${errorMessage}`
                }],
            isError: true
        };
    }
}
