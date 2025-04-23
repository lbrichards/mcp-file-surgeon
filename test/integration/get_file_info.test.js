import { createTestClient } from '../utils/mcp_test_client.js';
import { TEST_DIR, ensureTestDir, createTestFile, cleanTestFiles } from '../utils/test-helpers.js';
import { promises as fs } from 'fs';
import path from 'path';

describe('get_file_info integration test', () => {
    let client;
    
    beforeAll(async () => {
        await ensureTestDir();
    });
    
    beforeEach(async () => {
        client = await createTestClient();
    });

    afterEach(async () => {
        if (client) {
            await client.stop();
        }
        // Clean up only files from this test
        await cleanTestFiles('info_test');
    });

    test('should return correct file info for existing file', async () => {
        const content = 'test content';
        const testFilePath = await createTestFile('info_test.txt', content);
        
        const response = await client.callTool('get_file_info', {
            file_path: testFilePath
        });
        
        const fileInfo = JSON.parse(response);
        const stats = await fs.stat(testFilePath);
        
        expect(fileInfo).toMatchObject({
            size: stats.size,
            isFile: true,
            isDirectory: false
        });
        
        ['created', 'modified', 'accessed'].forEach(field => {
            const timestamp = new Date(fileInfo[field]);
            expect(timestamp).toBeInstanceOf(Date);
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            expect(timestamp > fiveMinutesAgo).toBeTruthy();
            expect(timestamp <= new Date()).toBeTruthy();
        });
    });

    test('should handle non-existent file', async () => {
        const nonExistentPath = path.resolve(TEST_DIR, 'nonexistent.txt');
        
        await expect(async () => {
            await client.callTool('get_file_info', {
                file_path: nonExistentPath
            });
        }).rejects.toThrow('Error getting file info: ENOENT');
    });

    test('should return directory info', async () => {
        // No need to clean up the TEST_DIR itself as it's managed by global setup
        const response = await client.callTool('get_file_info', {
            file_path: TEST_DIR
        });
        
        const dirInfo = JSON.parse(response);
        expect(dirInfo).toMatchObject({
            isFile: false,
            isDirectory: true
        });
    });
});