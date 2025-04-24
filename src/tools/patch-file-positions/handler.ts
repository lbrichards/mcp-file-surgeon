import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';

export async function handlePatchFilePositions(request: CallToolRequest) {
    try {
        if (!request.params.arguments || 
            typeof request.params.arguments.file_path !== 'string' ||
            typeof request.params.arguments.start_pos !== 'number' ||
            typeof request.params.arguments.end_pos !== 'number' ||
            typeof request.params.arguments.replacement !== 'string') {
            throw new Error('Missing or invalid parameters');
        }

        const { file_path, start_pos, end_pos, replacement } = request.params.arguments;
        const preview_only = request.params.arguments.preview_only === true;
        const context_chars = typeof request.params.arguments.context_chars === 'number' ? 
            request.params.arguments.context_chars : 20;

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
        
        // If preview mode is enabled, return the preview without modifying the file
        if (preview_only) {
            // For small files or large context, just show the whole file
            if (context_chars >= content.length / 2) {
                // Regular preview format for the entire file
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            preview_only: true,
                            message: `Preview of changes at positions ${start_pos}-${end_pos}`,
                            current_content: content,
                            proposed_content: newContent,
                            characters_to_replace: end_pos - start_pos
                        }, null, 2)
                    }]
                };
            }
            
            // Calculate context boundaries, ensuring they don't go out of bounds
            const contextStart = Math.max(0, start_pos - context_chars);
            const contextEnd = Math.min(content.length, end_pos + context_chars);
            
            // Extract content with context
            const currentContentWithContext = content.slice(contextStart, contextEnd);
            const proposedContentWithContext = content.slice(contextStart, start_pos) + 
                                              replacement + 
                                              content.slice(end_pos, contextEnd);
            
            // For unified diff format, we need to identify the lines affected
            // First, get line positions by finding newlines in the content
            const linePositions = [-1]; // Start with -1 to represent position before first line
            for (let i = 0; i < content.length; i++) {
                if (content[i] === '\n') {
                    linePositions.push(i);
                }
            }
            linePositions.push(content.length); // Add position after the last character
            
            // Find which lines are affected by the change
            let startLine = 0;
            let endLine = 0;
            let contextStartLine = 0;
            let contextEndLine = linePositions.length - 2; // Last valid line index
            
            // Find the line containing start_pos
            for (let i = 0; i < linePositions.length - 1; i++) {
                if (start_pos > linePositions[i] && start_pos <= linePositions[i + 1]) {
                    startLine = i;
                    break;
                }
            }
            
            // Find the line containing end_pos
            for (let i = 0; i < linePositions.length - 1; i++) {
                if (end_pos > linePositions[i] && end_pos <= linePositions[i + 1]) {
                    endLine = i;
                    break;
                }
            }
            
            // Find context start line (show context_chars before)
            for (let i = startLine; i >= 0; i--) {
                if (linePositions[i] <= contextStart) {
                    contextStartLine = i;
                    break;
                }
            }
            
            // Find context end line (show context_chars after)
            for (let i = endLine; i < linePositions.length - 1; i++) {
                if (linePositions[i + 1] >= contextEnd) {
                    contextEndLine = i;
                    break;
                }
            }
            
            // For short context, just use the regular format
            if (contextEndLine - contextStartLine <= 2) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            preview_only: true,
                            message: `Preview of changes at positions ${start_pos}-${end_pos}`,
                            current_content: currentContentWithContext,
                            proposed_content: proposedContentWithContext,
                            characters_to_replace: end_pos - start_pos
                        }, null, 2)
                    }]
                };
            }
            
            // Extract lines for the diff format
            const extractLine = (content: string, lineIdx: number) => {
                const lineStart = linePositions[lineIdx] + 1; // +1 to skip the previous newline
                const lineEnd = linePositions[lineIdx + 1];
                return content.slice(lineStart, lineEnd);
            };
            
            // Create diff-style preview for character changes
            const createCharDiffPreview = (original: string, modified: string, isProposed: boolean) => {
                const extractedLines = [];
                
                if (isProposed) {
                    // For proposed content (after changes):
                    // 1. Context lines before change
                    for (let i = contextStartLine; i < startLine; i++) {
                        if (i < 0 || i >= linePositions.length - 1) continue;
                        const lineContent = extractLine(original, i);
                        extractedLines.push(` ${lineContent}`);
                    }
                    
                    // 2. Added lines (replacement)
                    // Split the replacement by newlines and add each line
                    const replacementLines = replacement.split('\n');
                    for (const line of replacementLines) {
                        extractedLines.push(`+${line}`);
                    }
                    
                    // 3. Context lines after change
                    for (let i = endLine + 1; i <= contextEndLine; i++) {
                        if (i < 0 || i >= linePositions.length - 1) continue;
                        const lineContent = extractLine(original, i);
                        extractedLines.push(` ${lineContent}`);
                    }
                } else {
                    // For current content (before changes):
                    // 1. Context lines before change
                    for (let i = contextStartLine; i < startLine; i++) {
                        if (i < 0 || i >= linePositions.length - 1) continue;
                        const lineContent = extractLine(original, i);
                        extractedLines.push(` ${lineContent}`);
                    }
                    
                    // 2. Removed lines (original lines being replaced)
                    for (let i = startLine; i <= endLine; i++) {
                        if (i < 0 || i >= linePositions.length - 1) continue;
                        const lineContent = extractLine(original, i);
                        extractedLines.push(`-${lineContent}`);
                    }
                    
                    // 3. Context lines after change
                    for (let i = endLine + 1; i <= contextEndLine; i++) {
                        if (i < 0 || i >= linePositions.length - 1) continue;
                        const lineContent = extractLine(original, i);
                        extractedLines.push(` ${lineContent}`);
                    }
                }
                
                // Create unified diff header
                // @@ -startLine,numLines +startLine,numLinesAfter @@
                const numLines = contextEndLine - contextStartLine + 1;
                const numLinesAfter = isProposed ? 
                    numLines - (endLine - startLine + 1) + replacement.split('\n').length : 
                    numLines;
                
                const header = `@@ -${contextStartLine + 1},${numLines} +${contextStartLine + 1},${numLinesAfter} @@`;
                
                return [header, ...extractedLines].join('\n');
            };
            
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        preview_only: true,
                        message: `Preview of changes at positions ${start_pos}-${end_pos}`,
                        current_content: createCharDiffPreview(content, newContent, false),
                        proposed_content: createCharDiffPreview(content, newContent, true),
                        characters_to_replace: end_pos - start_pos
                    }, null, 2)
                }]
            };
        }
        
        // If not in preview mode, write the changes to the file
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
    } catch (error: unknown) {
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