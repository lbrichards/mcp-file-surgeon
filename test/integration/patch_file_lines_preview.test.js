import { createTestClient } from '../utils/mcp_test_client.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('patch_file_lines preview mode with diff formatting', () => {
    let client;
    const testDir = path.resolve(__dirname, '../tmp/patch_lines_preview_test');
    const testFilePath = path.resolve(testDir, 'test.txt');
    
    // Test file content - 5 distinct lines
    const testFileContent = 'Line one\nLine two\nLine three\nLine four\nLine five';
    
    beforeAll(async () => {
        await fs.mkdir(testDir, { recursive: true });
    });
    
    beforeEach(async () => {
        client = await createTestClient();
        // Create a test file with multiple lines of known content
        await fs.mkdir(testDir, { recursive: true });
        await fs.writeFile(testFilePath, testFileContent, 'utf8');
    });

    afterEach(async () => {
        if (client) {
            await client.stop();
        }
        await fs.rm(testFilePath, { force: true }).catch(() => {});
    });

    afterAll(async () => {
        await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
    });

    // Original test case
    test('should show diff-style preview for replacing multiple lines in the middle', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 1,    // Line two
            end_line: 2,      // Line three
            replacement: 'New line content',
            preview_only: true,
            context_lines: 1
        });
        
        const result = JSON.parse(response);
        console.log('Response (replace middle):', JSON.stringify(result, null, 2));

        expect(result.success).toBe(true);
        expect(result.preview_only).toBe(true);

        // Expect diff-style formatting with:
        // 1. Range header showing affected lines
        // 2. Context lines with space prefix
        // 3. Removed lines with minus prefix
        // 4. New content with plus prefix
        const expectedContent = 
            '@@ -1,4 +1,3 @@\n' +
            ' Line one\n' +
            '-Line two\n' +
            '-Line three\n' +
            ' Line four';

        expect(result.current_content).toBe(expectedContent);

        const expectedProposed = 
            '@@ -1,4 +1,3 @@\n' +
            ' Line one\n' +
            '+New line content\n' +
            ' Line four';

        expect(result.proposed_content).toBe(expectedProposed);
    });

    // Test case a) Insert an empty line
    test('should show diff-style preview for inserting an empty line', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 2,    // After Line three
            end_line: 2,      // After Line three
            replacement: 'Line three\n',  // Same line with a newline
            preview_only: true,
            context_lines: 1
        });
        
        const result = JSON.parse(response);
        console.log('Response (insert empty):', JSON.stringify(result, null, 2));

        expect(result.success).toBe(true);
        expect(result.preview_only).toBe(true);

        // Verify diff formatting for inserting an empty line
        expect(result.current_content).toContain('Line three');
        expect(result.proposed_content).toContain('Line three\n');
        
        // Verify the resulting diff has the correct structure
        expect(result.current_content.startsWith('@@ ')).toBe(true);
        expect(result.proposed_content.startsWith('@@ ')).toBe(true);
    });

    // Test case b) Insert a non-empty line
    test('should show diff-style preview for inserting a non-empty line', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 3,    // After Line four
            end_line: 3,      // After Line four
            replacement: 'Line four\nNew inserted line',  // Original line plus new line
            preview_only: true,
            context_lines: 1
        });
        
        const result = JSON.parse(response);
        console.log('Response (insert non-empty):', JSON.stringify(result, null, 2));

        expect(result.success).toBe(true);
        expect(result.preview_only).toBe(true);

        // Verify diff formatting for inserting a non-empty line
        expect(result.current_content).toContain('Line four');
        expect(result.proposed_content).toContain('New inserted line');
        
        // Verify the resulting diff has the correct structure
        expect(result.current_content.startsWith('@@ ')).toBe(true);
        expect(result.proposed_content.startsWith('@@ ')).toBe(true);
    });

    // Test case c) Remove a line from the center of the file
    test('should show diff-style preview for removing a line from the center', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 2,    // Line three
            end_line: 2,      // Line three
            replacement: '',  // Remove the line
            preview_only: true,
            context_lines: 1
        });
        
        const result = JSON.parse(response);
        console.log('Response (remove center):', JSON.stringify(result, null, 2));

        expect(result.success).toBe(true);
        expect(result.preview_only).toBe(true);

        // Verify diff formatting for removing a center line
        expect(result.current_content).toContain('-Line three');
        expect(result.current_content).toContain(' Line two');
        expect(result.current_content).toContain(' Line four');
        
        // Verify the proposed content doesn't contain the removed line
        expect(result.proposed_content).not.toContain('Line three');
        expect(result.proposed_content).toContain(' Line two');
        expect(result.proposed_content).toContain(' Line four');
        
        // Verify the resulting diff has the correct structure
        expect(result.current_content.startsWith('@@ ')).toBe(true);
        expect(result.proposed_content.startsWith('@@ ')).toBe(true);
    });

    // Test case d) Remove a line from the end of the file
    test('should show diff-style preview for removing a line from the end', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 4,    // Line five
            end_line: 4,      // Line five
            replacement: '',  // Remove the line
            preview_only: true,
            context_lines: 1
        });
        
        const result = JSON.parse(response);
        console.log('Response (remove end):', JSON.stringify(result, null, 2));

        expect(result.success).toBe(true);
        expect(result.preview_only).toBe(true);

        // Verify diff formatting for removing the end line
        expect(result.current_content).toContain('-Line five');
        expect(result.current_content).toContain(' Line four');
        
        // Verify the proposed content doesn't contain the removed line
        expect(result.proposed_content).not.toContain('Line five');
        expect(result.proposed_content).toContain(' Line four');
        
        // Verify the resulting diff has the correct structure
        expect(result.current_content.startsWith('@@ ')).toBe(true);
        expect(result.proposed_content.startsWith('@@ ')).toBe(true);
    });

    // Test case e) Remove a line from the beginning of the file
    test('should show diff-style preview for removing a line from the beginning', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 0,    // Line one
            end_line: 0,      // Line one
            replacement: '',  // Remove the line
            preview_only: true,
            context_lines: 1
        });
        
        const result = JSON.parse(response);
        console.log('Response (remove beginning):', JSON.stringify(result, null, 2));

        expect(result.success).toBe(true);
        expect(result.preview_only).toBe(true);

        // Verify diff formatting for removing the first line
        expect(result.current_content).toContain('-Line one');
        expect(result.current_content).toContain(' Line two');
        
        // Verify the proposed content doesn't contain the removed line
        expect(result.proposed_content).not.toContain('Line one');
        expect(result.proposed_content).toContain(' Line two');
        
        // Verify the resulting diff has the correct structure
        expect(result.current_content.startsWith('@@ ')).toBe(true);
        expect(result.proposed_content.startsWith('@@ ')).toBe(true);
    });

    // Test case f) Add a line to the end
    test('should show diff-style preview for adding a line at the end', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 4,    // Line five
            end_line: 4,      // Line five
            replacement: 'Line five\nNew last line',  // Original line plus new line
            preview_only: true,
            context_lines: 1
        });
        
        const result = JSON.parse(response);
        console.log('Response (add end):', JSON.stringify(result, null, 2));

        expect(result.success).toBe(true);
        expect(result.preview_only).toBe(true);

        // Verify diff formatting for adding a line at the end
        expect(result.current_content).toContain(' Line five');
        expect(result.proposed_content).toContain('+New last line');
        
        // Verify the resulting diff has the correct structure
        expect(result.current_content.startsWith('@@ ')).toBe(true);
        expect(result.proposed_content.startsWith('@@ ')).toBe(true);
    });

    // Context lines variation - 0 context lines
    test('should show diff-style preview with 0 context lines', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 2,    // Line three
            end_line: 2,      // Line three
            replacement: 'Modified line three',
            preview_only: true,
            context_lines: 0
        });
        
        const result = JSON.parse(response);
        console.log('Response (0 context):', JSON.stringify(result, null, 2));

        expect(result.success).toBe(true);
        expect(result.preview_only).toBe(true);

        // Verify diff formatting with 0 context lines
        // Should only show the removed and added lines, no context
        expect(result.current_content).toContain('-Line three');
        expect(result.proposed_content).toContain('+Modified line three');
        
        // Should NOT contain any context lines
        expect(result.current_content).not.toContain('Line two');
        expect(result.current_content).not.toContain('Line four');
        expect(result.proposed_content).not.toContain('Line two');
        expect(result.proposed_content).not.toContain('Line four');
        
        // Verify the resulting diff has the correct structure
        expect(result.current_content.startsWith('@@ ')).toBe(true);
        expect(result.proposed_content.startsWith('@@ ')).toBe(true);
    });

    // Context lines variation - 8 context lines (should show the entire file)
    test('should show diff-style preview with 8 context lines (entire file)', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 2,    // Line three
            end_line: 2,      // Line three
            replacement: 'Modified line three',
            preview_only: true,
            context_lines: 8
        });
        
        const result = JSON.parse(response);
        console.log('Response (8 context):', JSON.stringify(result, null, 2));

        expect(result.success).toBe(true);
        expect(result.preview_only).toBe(true);

        // Verify diff formatting with 8 context lines
        // Should show the entire file (since it's only 5 lines)
        expect(result.current_content).toContain(' Line one');
        expect(result.current_content).toContain(' Line two');
        expect(result.current_content).toContain('-Line three');
        expect(result.current_content).toContain(' Line four');
        expect(result.current_content).toContain(' Line five');
        
        expect(result.proposed_content).toContain(' Line one');
        expect(result.proposed_content).toContain(' Line two');
        expect(result.proposed_content).toContain('+Modified line three');
        expect(result.proposed_content).toContain(' Line four');
        expect(result.proposed_content).toContain(' Line five');
        
        // Verify the resulting diff has the correct structure
        expect(result.current_content.startsWith('@@ ')).toBe(true);
        expect(result.proposed_content.startsWith('@@ ')).toBe(true);
    });
});