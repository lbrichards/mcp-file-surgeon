import { createTestClient } from '../utils/mcp_test_client.js';
import { TEST_DIR, ensureTestDir, createTestFile, cleanTestFiles } from '../utils/test-helpers.js';
import { promises as fs } from 'fs';
import path from 'path';

describe('delete_file integration test', () => {
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
        await cleanTestFiles('delete_test');
    });

    test('should successfully delete an existing file', async () => {
        // Create the test file first
        const testFilePath = await createTestFile('delete_test.txt', 'test content');
        
        // Call delete_file tool
        const result = await client.callTool('delete_file', {
            file_path: testFilePath
        });

        expect(result).toBeTruthy();
        
        // Verify file no longer exists
        const exists = await fs.access(testFilePath).then(() => true).catch(() => false);
        expect(exists).toBe(false);
    });

    test('should handle attempt to delete non-existent file', async () => {
        const nonExistentPath = path.resolve(TEST_DIR, 'delete_test_nonexistent.txt');
        
        try {
            await client.callTool('delete_file', {
                file_path: nonExistentPath
            });
            throw new Error('Should have thrown');
        } catch (err) {
            expect(err.message).toContain('ENOENT');
        }
    });

    test('should fail when attempting to delete a directory', async () => {
        const dirPath = path.resolve(TEST_DIR, 'delete_test_dir');
        await fs.mkdir(dirPath, { recursive: true });
        await new Promise(resolve => setTimeout(resolve, 100)); // Ensure directory exists
        
        try {
            await client.callTool('delete_file', {
                file_path: dirPath
            });
            throw new Error('Should have thrown');
        } catch (err) {
            expect(err.message).toContain('EPERM');
        }
        
        // Verify directory still exists
        const exists = await fs.access(dirPath).then(() => true).catch(() => false);
        expect(exists).toBe(true);
        
        // Cleanup
        await fs.rmdir(dirPath);
    });
});