import { createTestClient } from '../utils/mcp_test_client.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('read_file integration test', () => {
    let client;
    const testDir = path.resolve(__dirname, '../tmp/read_test');
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

    test('should read small text file', async () => {
        const content = 'Hello, world!';
        await fs.writeFile(testFilePath, content);

        const response = await client.callTool('read_file', {
            file_path: testFilePath
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        expect(result.content).toBe(content);
    });

    test('should read file with multiple lines', async () => {
        const content = 'Line 1\nLine 2\nLine 3\n';
        await fs.writeFile(testFilePath, content);

        const response = await client.callTool('read_file', {
            file_path: testFilePath
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        expect(result.content).toBe(content);
    });

    test('should read empty file', async () => {
        await fs.writeFile(testFilePath, '');

        const response = await client.callTool('read_file', {
            file_path: testFilePath
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        expect(result.content).toBe('');
    });

    test('should handle non-existent file', async () => {
        const nonExistentPath = path.resolve(testDir, 'nonexistent.txt');
        
        await expect(async () => {
            await client.callTool('read_file', {
                file_path: nonExistentPath
            });
        }).rejects.toThrow('Error reading file: ENOENT');
    });

    test('should handle missing file_path parameter', async () => {
        await expect(async () => {
            await client.callTool('read_file', {});
        }).rejects.toThrow('Missing or invalid file_path parameter');
    });

    test('should read file with special characters', async () => {
        const content = 'Special chars: !@#$%^&*()_+\nΣλληνικά\n漢字\n';
        await fs.writeFile(testFilePath, content);

        const response = await client.callTool('read_file', {
            file_path: testFilePath
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        expect(result.content).toBe(content);
    });
});