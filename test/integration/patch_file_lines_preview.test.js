import { createTestClient } from '../utils/mcp_test_client.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('patch_file_lines preview mode', () => {
    let client;
    const testDir = path.resolve(__dirname, '../tmp/patch_lines_preview_test');
    const testFilePath = path.resolve(testDir, 'test.txt');
    const TOTAL_LINES = 5; // Line one through Line five
    
    beforeAll(async () => {
        await fs.mkdir(testDir, { recursive: true });
    });
    
    beforeEach(async () => {
        client = await createTestClient();
        // Create a test file with multiple lines of known content
        const content = 'Line one\nLine two\nLine three\nLine four\nLine five';
        await fs.mkdir(testDir, { recursive: true });
        await fs.writeFile(testFilePath, content, 'utf8');
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

    // Existing position-based tests...
    test('should handle line replacement in middle of file', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 1,
            end_line: 2,
            replacement: 'New line content',
            preview_only: true,
            context_lines: 1
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        expect(result.preview_only).toBe(true);
        
        const lines = result.current_content.split('\n');
        expect(lines.length).toBe(4); // One before, two changed, one after
        expect(lines[0]).toBe('Line one');
        expect(lines[1]).toBe('Line two');
        expect(lines[2]).toBe('Line three');
        expect(lines[3]).toBe('Line four...');
    });

    test('should handle line deletion in middle of file', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 2,
            end_line: 2,
            replacement: '',  // Delete Line three
            preview_only: true,
            context_lines: 1
        });
        
        const result = JSON.parse(response);
        const lines = result.current_content.split('\n');
        expect(lines.length).toBe(3); // One before, deleted line, one after
        expect(lines[0]).toBe('Line two');
        expect(lines[1]).toBe('Line three');
        expect(lines[2]).toBe('Line four...');
    });

    test('should handle line insertion in middle of file', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 2,  // Insert after Line three
            end_line: 1,    // end < start signals insertion
            replacement: 'New inserted line',
            preview_only: true,
            context_lines: 1
        });
        
        const result = JSON.parse(response);
        const lines = result.proposed_content.split('\n');
        expect(lines[0]).toBe('Line two');
        expect(lines[1]).toBe('New inserted line');
        expect(lines[2]).toBe('Line three...');
    });

    test('should handle changes at start of file', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 0,
            end_line: 0,
            replacement: 'New first line',
            preview_only: true,
            context_lines: 1
        });
        
        const result = JSON.parse(response);
        const lines = result.current_content.split('\n');
        expect(lines.length).toBe(2); // Changed first line, one after
        expect(lines[0]).toBe('Line one');
        expect(lines[1]).toBe('Line two...');
    });

    test('should handle changes at end of file', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 4,  // Line five
            end_line: 4,
            replacement: 'New last line',
            preview_only: true,
            context_lines: 1
        });
        
        const result = JSON.parse(response);
        const lines = result.current_content.split('\n');
        expect(lines.length).toBe(2); // One before, changed last line
        expect(lines[0]).toBe('Line four');
        expect(lines[1]).toBe('Line five');
    });

    // New context line variation tests
    test('should show only changed lines with zero context', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 1,
            end_line: 2,
            replacement: 'New line content',
            preview_only: true,
            context_lines: 0
        });
        
        const result = JSON.parse(response);
        const lines = result.current_content.split('\n');
        expect(lines.length).toBe(2); // Only the changed lines
        expect(lines[0]).toBe('Line two');
        expect(lines[1]).toBe('Line three');
        expect(result.current_content).not.toContain('Line one');
        expect(result.current_content).not.toContain('Line four');
    });

    test('should show entire file with context lines equal to file length', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 1,
            end_line: 2,
            replacement: 'New line content',
            preview_only: true,
            context_lines: TOTAL_LINES
        });
        
        const result = JSON.parse(response);
        expect(result.current_content).toBe('Line one\nLine two\nLine three\nLine four\nLine five');
        expect(result.proposed_content).toBe('Line one\nNew line content\nLine four\nLine five');
    });

    test('should show entire file with context lines greater than file length', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 1,
            end_line: 2,
            replacement: 'New line content',
            preview_only: true,
            context_lines: 8
        });
        
        const result = JSON.parse(response);
        expect(result.current_content).toBe('Line one\nLine two\nLine three\nLine four\nLine five');
        expect(result.proposed_content).toBe('Line one\nNew line content\nLine four\nLine five');
    });

    test('should handle one context line correctly', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 1,
            end_line: 2,
            replacement: 'New line content',
            preview_only: true,
            context_lines: 1
        });
        
        const result = JSON.parse(response);
        const lines = result.current_content.split('\n');
        expect(lines.length).toBe(4); // One before + two changed + one after
        expect(lines[0]).toBe('Line one');  // Context before
        expect(lines[1]).toBe('Line two');  // First changed
        expect(lines[2]).toBe('Line three'); // Second changed
        expect(lines[3]).toBe('Line four...'); // Context after with ellipsis
    });
});