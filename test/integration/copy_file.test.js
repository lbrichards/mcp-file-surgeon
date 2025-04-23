import { createTestClient } from '../utils/mcp_test_client.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('copy_file integration test', () => {
    let client;
    const testDir = path.resolve(__dirname, '../tmp/copy_test');
    const sourceDir = path.join(testDir, 'source');
    const destDir = path.join(testDir, 'dest');
    
    beforeAll(async () => {
        await fs.mkdir(sourceDir, { recursive: true });
        await fs.mkdir(destDir, { recursive: true });
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
        await fs.rm(testDir, { recursive: true, force: true });
    });

    test('should copy a file', async () => {
        const sourceFile = path.join(sourceDir, 'test.txt');
        const destFile = path.join(destDir, 'test_copy.txt');
        const content = 'Test content';

        await fs.writeFile(sourceFile, content);

        const response = await client.callTool('copy_file', {
            source_path: sourceFile,
            dest_path: destFile
        });

        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        expect(result.source).toBe(sourceFile);
        expect(result.destination).toBe(destFile);

        // Verify file was copied correctly
        const copiedContent = await fs.readFile(destFile, 'utf8');
        expect(copiedContent).toBe(content);
    });

    test('should handle non-existent source file', async () => {
        const nonExistentFile = path.join(sourceDir, 'nonexistent.txt');
        const destFile = path.join(destDir, 'should_not_exist.txt');

        await expect(async () => {
            await client.callTool('copy_file', {
                source_path: nonExistentFile,
                dest_path: destFile
            });
        }).rejects.toThrow('Error copying file: ENOENT');
    });

    test('should not overwrite existing file by default', async () => {
        const sourceFile = path.join(sourceDir, 'source.txt');
        const destFile = path.join(destDir, 'existing.txt');
        
        await fs.writeFile(sourceFile, 'source content');
        await fs.writeFile(destFile, 'original content');

        await expect(async () => {
            await client.callTool('copy_file', {
                source_path: sourceFile,
                dest_path: destFile
            });
        }).rejects.toThrow('Error copying file: Destination file already exists and overwrite is false');

        // Verify original content was preserved
        const content = await fs.readFile(destFile, 'utf8');
        expect(content).toBe('original content');
    });

    test('should overwrite when overwrite flag is true', async () => {
        const sourceFile = path.join(sourceDir, 'new.txt');
        const destFile = path.join(destDir, 'target.txt');
        
        await fs.writeFile(sourceFile, 'new content');
        await fs.writeFile(destFile, 'old content');

        const response = await client.callTool('copy_file', {
            source_path: sourceFile,
            dest_path: destFile,
            overwrite: true
        });

        const result = JSON.parse(response);
        expect(result.success).toBe(true);

        // Verify content was overwritten
        const content = await fs.readFile(destFile, 'utf8');
        expect(content).toBe('new content');
    });

    test('should create destination directory if it does not exist', async () => {
        const sourceFile = path.join(sourceDir, 'test.txt');
        const newDestDir = path.join(destDir, 'nested', 'dir');
        const destFile = path.join(newDestDir, 'test.txt');
        
        await fs.writeFile(sourceFile, 'test content');

        const response = await client.callTool('copy_file', {
            source_path: sourceFile,
            dest_path: destFile
        });

        const result = JSON.parse(response);
        expect(result.success).toBe(true);

        // Verify directory was created and file was copied
        const content = await fs.readFile(destFile, 'utf8');
        expect(content).toBe('test content');
    });
});