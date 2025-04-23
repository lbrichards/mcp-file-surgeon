import { createTestClient } from '../utils/mcp_test_client.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('list_directory integration test', () => {
    let client;
    const testDir = path.resolve(__dirname, '../tmp/list_test');
    
    beforeAll(async () => {
        // Create test directory
        await fs.mkdir(testDir, { recursive: true });
    });
    
    beforeEach(async () => {
        client = await createTestClient();
    });

    afterEach(async () => {
        if (client) {
            await client.stop();
        }
    });

    afterAll(async () => {
        // Clean up test directory and contents
        await fs.rm(testDir, { recursive: true, force: true });
    });

    test('should list empty directory', async () => {
        const response = await client.callTool('list_directory', {
            dir_path: testDir
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        expect(result.entries).toEqual([]);
    });

    test('should list directory with files and subdirectories', async () => {
        // Create test structure
        await fs.writeFile(path.join(testDir, 'file1.txt'), 'content');
        await fs.writeFile(path.join(testDir, 'file2.txt'), 'content');
        await fs.mkdir(path.join(testDir, 'subdir'));
        
        const response = await client.callTool('list_directory', {
            dir_path: testDir
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        
        // Verify files are found
        expect(result.entries).toContainEqual({
            name: 'file1.txt',
            isDirectory: false,
            isFile: true,
            isSymlink: false
        });
        expect(result.entries).toContainEqual({
            name: 'file2.txt',
            isDirectory: false,
            isFile: true,
            isSymlink: false
        });
        
        // Verify subdirectory is found
        expect(result.entries).toContainEqual({
            name: 'subdir',
            isDirectory: true,
            isFile: false,
            isSymlink: false
        });
        
        // Check total number of entries
        expect(result.entries.length).toBe(3);
    });

    test('should handle non-existent directory', async () => {
        const nonExistentPath = path.resolve(testDir, 'nonexistent');
        
        await expect(async () => {
            await client.callTool('list_directory', {
                dir_path: nonExistentPath
            });
        }).rejects.toThrow('Error listing directory: ENOENT');
    });

    test('should handle missing dir_path parameter', async () => {
        await expect(async () => {
            await client.callTool('list_directory', {});
        }).rejects.toThrow('Missing or invalid dir_path parameter');
    });

    test('should list directory with symlink', async () => {
        // Create a file and a symlink to it
        const targetFile = path.join(testDir, 'target.txt');
        const linkFile = path.join(testDir, 'link.txt');
        
        await fs.writeFile(targetFile, 'content');
        await fs.symlink(targetFile, linkFile);
        
        const response = await client.callTool('list_directory', {
            dir_path: testDir
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        
        // Verify symlink is correctly identified
        expect(result.entries).toContainEqual({
            name: 'link.txt',
            isDirectory: false,
            isFile: false,
            isSymlink: true
        });
        
        // Clean up symlink
        await fs.unlink(linkFile);
    });
});