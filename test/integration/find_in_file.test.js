import { createTestClient } from '../utils/mcp_test_client.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('find_in_file integration test', () => {
    let client;
    const testDir = path.resolve(__dirname, '../tmp/find_test');
    const testFilePath = path.resolve(testDir, 'test.txt');
    
    beforeAll(async () => {
        await fs.mkdir(testDir, { recursive: true });
    });
    
    beforeEach(async () => {
        client = await createTestClient();
        // Create a test file with known content
        const content = 'Hello, world! This is a test file.\nSecond line has world in it.\nThird line is here.';
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

    test('should find single occurrence of word', async () => {
        const response = await client.callTool('find_in_file', {
            file_path: testFilePath,
            search_string: 'test'
        });
        
        const result = JSON.parse(response);
        expect(result.found).toBe(true);
        expect(result.total_matches).toBe(1);
        expect(result.matches).toHaveLength(1);
        expect(result.matches[0]).toMatchObject({
            position: expect.any(Number),
            length: 4,
            occurrence: 1
        });
    });

    test('should find multiple occurrences of word', async () => {
        const response = await client.callTool('find_in_file', {
            file_path: testFilePath,
            search_string: 'world'
        });
        
        const result = JSON.parse(response);
        expect(result.found).toBe(true);
        expect(result.total_matches).toBe(2);
        expect(result.matches).toHaveLength(2);
        
        // First occurrence
        expect(result.matches[0]).toMatchObject({
            position: expect.any(Number),
            length: 5,
            occurrence: 1
        });
        
        // Second occurrence
        expect(result.matches[1]).toMatchObject({
            position: expect.any(Number),
            length: 5,
            occurrence: 2
        });
    });

    test('should handle non-existent string', async () => {
        const response = await client.callTool('find_in_file', {
            file_path: testFilePath,
            search_string: 'nonexistent'
        });
        
        const result = JSON.parse(response);
        expect(result.found).toBe(false);
        expect(result.message).toBe('String not found in file');
    });

    test('should handle empty search string', async () => {
        const response = await client.callTool('find_in_file', {
            file_path: testFilePath,
            search_string: ''
        });
        
        const result = JSON.parse(response);
        expect(result.found).toBe(false);
        expect(result.message).toBe('String not found in file');
    });

    test('should handle non-existent file', async () => {
        const nonExistentPath = path.resolve(testDir, 'nonexistent.txt');
        
        await expect(async () => {
            await client.callTool('find_in_file', {
                file_path: nonExistentPath,
                search_string: 'test'
            });
        }).rejects.toThrow('ENOENT');
    });

    test('should handle missing parameters', async () => {
        await expect(async () => {
            await client.callTool('find_in_file', {
                file_path: testFilePath
            });
        }).rejects.toThrow('Missing or invalid parameters');
    });
});