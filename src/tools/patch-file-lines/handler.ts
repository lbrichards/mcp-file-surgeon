import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';

export async function handlePatchFileLines(request: CallToolRequest) {
    try {
        if (!request.params.arguments || 
            typeof request.params.arguments.file_path !== 'string' ||
            typeof request.params.arguments.start_line !== 'number' ||
            typeof request.params.arguments.end_line !== 'number' ||
            typeof request.params.arguments.replacement !== 'string') {
            throw new Error('Missing or invalid parameters');
        }

        const { 
            file_path, 
            start_line, 
            end_line, 
            replacement,
            preview_only = false,
            context_lines = 2
        } = request.params.arguments;

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
            lines.pop();  // Remove empty string after last newline
        }

        // Create new content array by splicing in the replacement
        const newLines = [...lines];  // Create copy to modify
        const linesToRemove = end_line - start_line + 1;
        const replLines = replacement ? replacement.split('\n') : [];
        newLines.splice(start_line, linesToRemove, ...replLines);

        if (preview_only) {
            // Check if we should show the entire file
            const showingFullFile = (start_line - numContextLines <= 0) && 
                                  (end_line + numContextLines >= lines.length - 1);

            if (showingFullFile) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            preview_only: true,
                            current_content: lines.join('\n'),
                            proposed_content: newLines.join('\n'),
                            context_lines: numContextLines
                        }, null, 2)
                    }]
                };
            }

            // Build preview content
            const buildPreview = (contentLines: string[], isProposed: boolean) => {
                // Collect the lines we want to show
                const preview = [];
                
                // Add leading context (exactly numContextLines)
                const beforeStart = Math.max(0, start_line - numContextLines);
                preview.push(...contentLines.slice(beforeStart, start_line));

                // Add changed content
                if (isProposed) {
                    preview.push(replacement);
                } else {
                    preview.push(...contentLines.slice(start_line, end_line + 1));
                }

                // Add trailing context (exactly numContextLines)
                const afterStart = isProposed ? start_line + 1 : end_line + 1;
                const afterLines = contentLines.slice(afterStart, afterStart + numContextLines);
                
                // If there are more lines after what we're showing, append ellipsis to last context line
                if (afterStart + numContextLines < contentLines.length && afterLines.length > 0) {
                    preview.push(...afterLines.slice(0, -1));
                    preview.push(afterLines[afterLines.length - 1] + '...');
                } else {
                    preview.push(...afterLines);
                }

                return preview.join('\n');
            };

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        preview_only: true,
                        current_content: buildPreview(lines, false),
                        proposed_content: buildPreview(newLines, true),
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
    } catch (error: unknown) {
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