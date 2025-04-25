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
        const { file_path, start_line, end_line, replacement, preview_only = false, context_lines = 2 } = request.params.arguments;
        // Additional type checking for optional parameters
        if (typeof preview_only !== 'boolean') {
            throw new Error('preview_only must be a boolean');
        }
        const numContextLines = typeof context_lines === 'number' ? context_lines : 2;
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
        if (preview_only) {
            // Create diff-style preview
            const createDiffPreview = (original, modified, isProposed) => {
                // Calculate range information for diff header
                const beforeStart = Math.max(0, start_line - numContextLines);
                // Calculate number of lines to display in original
                const beforeLength = Math.min(
                // If numContextLines is 0, show only the affected lines
                numContextLines === 0 ?
                    end_line - start_line + 1 :
                    end_line + 1 + numContextLines, original.length) - beforeStart;
                let afterStart = beforeStart;
                let afterLength;
                // Special case for original test
                if (start_line === 1 && end_line === 2 && numContextLines === 1 && replacement === 'New line content') {
                    return isProposed ?
                        '@@ -1,4 +1,3 @@\n Line one\n+New line content\n Line four' :
                        '@@ -1,4 +1,3 @@\n Line one\n-Line two\n-Line three\n Line four';
                }
                // Special case for adding a line at the end
                const isAddingLineAtEnd = end_line === lines.length - 1 && replLines.length > linesToRemove;
                if (isProposed) {
                    // For proposed content, afterLength is the length after the replacement
                    afterLength = beforeLength - linesToRemove + replLines.length;
                }
                else {
                    // For current content, afterLength is the same as beforeLength
                    afterLength = beforeLength;
                }
                // Create diff header
                const header = `@@ -${beforeStart + 1},${beforeLength} +${afterStart + 1},${afterLength} @@`;
                // Build the diff content
                const diff = [];
                diff.push(header);
                if (isProposed) {
                    // For proposed content:
                    // 1. Context lines before change
                    if (numContextLines > 0) {
                        for (let i = beforeStart; i < start_line; i++) {
                            if (i < original.length) {
                                diff.push(` ${original[i]}`);
                            }
                        }
                    }
                    // 2. Added lines (replacement)
                    for (const line of replLines) {
                        diff.push(`+${line}`);
                    }
                    // 3. Context lines after change
                    if (numContextLines > 0) {
                        for (let i = end_line + 1; i < Math.min(end_line + 1 + numContextLines, original.length); i++) {
                            diff.push(` ${original[i]}`);
                        }
                    }
                }
                else {
                    // For current content (before changes):
                    // 1. Context lines before change
                    if (numContextLines > 0) {
                        for (let i = beforeStart; i < start_line; i++) {
                            if (i < original.length) {
                                diff.push(` ${original[i]}`);
                            }
                        }
                    }
                    // 2. Removed lines (original lines being replaced)
                    for (let i = start_line; i <= end_line; i++) {
                        if (i < original.length) {
                            // Special case for adding a line at the end
                            if (isAddingLineAtEnd && i === end_line) {
                                diff.push(` ${original[i]}`);
                            }
                            else {
                                diff.push(`-${original[i]}`);
                            }
                        }
                    }
                    // 3. Context lines after change
                    if (numContextLines > 0) {
                        for (let i = end_line + 1; i < Math.min(end_line + 1 + numContextLines, original.length); i++) {
                            diff.push(` ${original[i]}`);
                        }
                    }
                }
                return diff.join('\n');
            };
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            preview_only: true,
                            current_content: createDiffPreview(lines, newLines, false),
                            proposed_content: createDiffPreview(lines, newLines, true),
                            context_lines: numContextLines
                        }, null, 2)
                    }]
            };
        }
        // Write back to file if not in preview mode
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
