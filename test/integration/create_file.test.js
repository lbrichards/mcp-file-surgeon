import { createTestClient } from '../utils/mcp_test_client.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('create_file integration test', () => {
    let client;
    const testDir = path.resolve(__dirname, '../tmp/create_test');
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

    test('should create new file with content', async () => {
        const content = 'Hello, world!';

        const response = await client.callTool('create_file', {
            file_path: testFilePath,
            content: content
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        expect(result.message).toBe('File created successfully');
        
        // Verify file content
        const writtenContent = await fs.readFile(testFilePath, 'utf8');
        expect(writtenContent).toBe(content);
    });

    test('should create empty file when no content provided', async () => {
        const response = await client.callTool('create_file', {
            file_path: testFilePath
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        
        // Verify file exists and is empty
        const stats = await fs.stat(testFilePath);
        expect(stats.size).toBe(0);
    });

    test('should fail when attempting to overwrite existing file', async () => {
        // Create a file first
        const originalContent = 'original content';
        await fs.writeFile(testFilePath, originalContent);
        
        // Attempt to create it again should fail
        await expect(async () => {
            await client.callTool('create_file', {
                file_path: testFilePath,
                content: 'new content'
            });
        }).rejects.toThrow('Error creating file: File already exists');
        
        // Verify original content was preserved
        const content = await fs.readFile(testFilePath, 'utf8');
        expect(content).toBe(originalContent);
    });

    test('should handle missing file_path parameter', async () => {
        await expect(async () => {
            await client.callTool('create_file', {});
        }).rejects.toThrow('Missing or invalid file_path parameter');
    });

    test('should handle creation in non-existent directory', async () => {
        const invalidPath = path.resolve(testDir, 'nonexistent', 'test.txt');
        
        await expect(async () => {
            await client.callTool('create_file', {
                file_path: invalidPath
            });
        }).rejects.toThrow('Error creating file: ENOENT');
    });

    test('should create file with multi-line content', async () => {
        const content = 'Line 1\nLine 2\nLine 3';
        
        const response = await client.callTool('create_file', {
            file_path: testFilePath,
            content: content
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        
        // Verify multi-line content
        const writtenContent = await fs.readFile(testFilePath, 'utf8');
        expect(writtenContent).toBe(content);
    });
});