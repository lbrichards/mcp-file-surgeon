import { createTestClient } from '../utils/mcp_test_client.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('get_file_slice integration test', () => {
    let client;
    const testDir = path.resolve(__dirname, '../tmp');
    const testFilePath = path.resolve(testDir, 'slice_test.txt');
    
    beforeAll(async () => {
        await fs.mkdir(testDir, { recursive: true });
    });
    
    beforeEach(async () => {
        client = await createTestClient();
    });

    afterEach(async () => {
        if (client) {
            await client.stop();
        }
        // Clean up only files from this test
        await fs.rm(testFilePath, { force: true });
    });

    test('should get basic slice without context', async () => {
        const content = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
        await fs.writeFile(testFilePath, content);

        // Get the slice starting at 'Line 2' (7 bytes in)
        const response = await client.callTool('get_file_slice', {
            file_path: testFilePath,
            start_position: 7,
            length: 6,
            context_lines: 0
        });

        const result = JSON.parse(response);
        expect(result.slice).toBe('Line 2');
        expect(result.bytes_read).toBe(6);
    });

    test('should get slice with context lines', async () => {
        const content = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
        await fs.writeFile(testFilePath, content);

        const response = await client.callTool('get_file_slice', {
            file_path: testFilePath,
            start_position: 14,
            length: 6,
            context_lines: 1
        });

        const result = JSON.parse(response);
        expect(result.slice).toBe('Line 3');
        expect(result.with_context).toBe('Line 2\nLine 3\nLine 4');
        expect(result.line_number).toBe(3);
        expect(result.context_start_line).toBe(2);
        expect(result.context_end_line).toBe(4);
    });

    test('should handle missing parameters', async () => {
        await expect(async () => {
            await client.callTool('get_file_slice', {
                file_path: testFilePath,
                // Missing start_position and length
            });
        }).rejects.toThrow('Missing or invalid parameters');
    });

    test('should handle non-existent file', async () => {
        const nonExistentPath = path.resolve(testDir, 'nonexistent.txt');
        
        await expect(async () => {
            await client.callTool('get_file_slice', {
                file_path: nonExistentPath,
                start_position: 0,
                length: 10
            });
        }).rejects.toThrow('Error getting file slice: ENOENT');
    });

    test('should handle start position at end of file', async () => {
        const content = 'Line 1\nLine 2';
        await fs.writeFile(testFilePath, content);

        const response = await client.callTool('get_file_slice', {
            file_path: testFilePath,
            start_position: content.length,
            length: 5,
            context_lines: 0
        });

        const result = JSON.parse(response);
        expect(result.slice).toBe('');
        expect(result.bytes_read).toBe(0);
    });

    test('should use default context lines if not specified', async () => {
        const content = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
        await fs.writeFile(testFilePath, content);

        const response = await client.callTool('get_file_slice', {
            file_path: testFilePath,
            start_position: 14,
            length: 6
            // context_lines not specified, should default to 2
        });

        const result = JSON.parse(response);
        expect(result.slice).toBe('Line 3');
        expect(result.with_context).toBe('Line 1\nLine 2\nLine 3\nLine 4\nLine 5');
        expect(result.line_number).toBe(3);
        expect(result.context_start_line).toBe(1);
        expect(result.context_end_line).toBe(5);
    });
});