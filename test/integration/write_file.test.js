import { createTestClient } from '../utils/mcp_test_client.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('write_file integration test', () => {
    let client;
    const testDir = path.resolve(__dirname, '../tmp/write_test');
    const testFilePath = path.resolve(testDir, 'test.txt');
    
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
        // Clean up test files
        await fs.rm(testFilePath, { force: true });
    });

    afterAll(async () => {
        // Clean up test directory
        await fs.rm(testDir, { recursive: true, force: true });
    });

    test('should write to new file', async () => {
        const content = 'Hello, world!';

        const response = await client.callTool('write_file', {
            file_path: testFilePath,
            content: content
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        
        // Verify file content
        const writtenContent = await fs.readFile(testFilePath, 'utf8');
        expect(writtenContent).toBe(content);
    });

    test('should overwrite existing file', async () => {
        // Create file with initial content
        await fs.writeFile(testFilePath, 'Initial content');
        
        // Overwrite with new content
        const newContent = 'New content';
        const response = await client.callTool('write_file', {
            file_path: testFilePath,
            content: newContent
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        
        // Verify file was overwritten
        const writtenContent = await fs.readFile(testFilePath, 'utf8');
        expect(writtenContent).toBe(newContent);
    });

    test('should write empty string', async () => {
        const response = await client.callTool('write_file', {
            file_path: testFilePath,
            content: ''
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        
        // Verify file is empty
        const stats = await fs.stat(testFilePath);
        expect(stats.size).toBe(0);
    });

    test('should write multi-line content', async () => {
        const content = 'Line 1\nLine 2\nLine 3\n';
        
        const response = await client.callTool('write_file', {
            file_path: testFilePath,
            content: content
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        
        // Verify multi-line content
        const writtenContent = await fs.readFile(testFilePath, 'utf8');
        expect(writtenContent).toBe(content);
    });

    test('should handle missing file_path parameter', async () => {
        await expect(async () => {
            await client.callTool('write_file', {
                content: 'test'
            });
        }).rejects.toThrow('Missing or invalid parameters');
    });

    test('should handle missing content parameter', async () => {
        await expect(async () => {
            await client.callTool('write_file', {
                file_path: testFilePath
            });
        }).rejects.toThrow('Missing or invalid parameters');
    });

    test('should handle write to non-existent directory', async () => {
        const invalidPath = path.resolve(testDir, 'nonexistent', 'test.txt');
        
        await expect(async () => {
            await client.callTool('write_file', {
                file_path: invalidPath,
                content: 'test'
            });
        }).rejects.toThrow('Error writing file: ENOENT');
    });
});