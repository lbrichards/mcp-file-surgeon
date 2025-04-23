import { createTestClient } from '../utils/mcp_test_client.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('patch_file_lines integration test', () => {
    let client;
    const testDir = path.resolve(__dirname, '../tmp/patch_lines_test');  // Changed directory name
    const testFilePath = path.resolve(testDir, 'test.txt');
    
    beforeAll(async () => {
        await fs.mkdir(testDir, { recursive: true });
    });
    
    beforeEach(async () => {
        client = await createTestClient();
        // Create a test file with multiple lines
        const content = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\n';
        await fs.writeFile(testFilePath, content, 'utf8');
    });

    afterEach(async () => {
        if (client) {
            await client.stop();
        }
        // Clean up test files
        await fs.rm(testFilePath, { force: true }).catch(() => {});  // Added error handling
    });

    afterAll(async () => {
        // Clean up test directory
        await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});  // Added error handling
    });

    test('should replace single line in middle of file', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 1,  // Line 2 (0-based)
            end_line: 1,    // Line 2
            replacement: 'New Line 2'
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        expect(result.lines_replaced).toBe(1);
        
        // Verify file content
        const content = await fs.readFile(testFilePath, 'utf8');
        expect(content).toBe('Line 1\nNew Line 2\nLine 3\nLine 4\nLine 5\n');
    });

    test('should replace multiple consecutive lines', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 1,  // Line 2
            end_line: 3,    // Line 4
            replacement: 'New Content\nMore New Content'
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        expect(result.lines_replaced).toBe(3);
        
        // Verify file content
        const content = await fs.readFile(testFilePath, 'utf8');
        expect(content).toBe('Line 1\nNew Content\nMore New Content\nLine 5\n');
    });

    test('should handle start_line equal to end_line', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 2,
            end_line: 2,
            replacement: 'Single Line Replacement'
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        expect(result.lines_replaced).toBe(1);
        
        const content = await fs.readFile(testFilePath, 'utf8');
        expect(content).toBe('Line 1\nLine 2\nSingle Line Replacement\nLine 4\nLine 5\n');
    });

    test('should handle missing parameters', async () => {
        await expect(async () => {
            await client.callTool('patch_file_lines', {
                file_path: testFilePath
            });
        }).rejects.toThrow('Missing or invalid parameters');
    });

    test('should handle non-existent file', async () => {
        const nonExistentPath = path.resolve(testDir, 'nonexistent.txt');
        
        await expect(async () => {
            await client.callTool('patch_file_lines', {
                file_path: nonExistentPath,
                start_line: 0,
                end_line: 0,
                replacement: 'test'
            });
        }).rejects.toThrow('ENOENT');
    });

    test('should handle empty replacement string', async () => {
        const response = await client.callTool('patch_file_lines', {
            file_path: testFilePath,
            start_line: 1,
            end_line: 1,  // Changed from 2 to 1 to only remove Line 2
            replacement: ''
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        
        const content = await fs.readFile(testFilePath, 'utf8');
        expect(content).toBe('Line 1\nLine 3\nLine 4\nLine 5\n');
    });
});