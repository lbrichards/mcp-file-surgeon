import { createTestClient } from '../utils/mcp_test_client.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('patch_file_positions integration test', () => {
    let client;
    const testDir = path.resolve(__dirname, '../tmp/patch_positions_test');
    const testFilePath = path.resolve(testDir, 'test.txt');
    
    beforeAll(async () => {
        await fs.mkdir(testDir, { recursive: true });
    });
    
    beforeEach(async () => {
        client = await createTestClient();
        // Create a test file with known content
        const content = 'Hello, world! This is a test file.';
        await fs.mkdir(testDir, { recursive: true });
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

    test('debug string positions', async () => {
        const content = 'Hello, world! This is a test file.';
        console.log('String:', content);
        console.log('Length:', content.length);
        console.log('Positions:');
        for (let i = 0; i < content.length; i++) {
            console.log(`Position ${i}: "${content[i]}"`);
        }
        // Always pass - this is just for debugging
        expect(true).toBe(true);
    });

    test('should replace characters in middle of file', async () => {
        const response = await client.callTool('patch_file_positions', {
            file_path: testFilePath,
            start_pos: 7,   // After "Hello, "
            end_pos: 12,    // Just before "! This"
            replacement: 'Claude'
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        expect(result.characters_replaced).toBe(5);  // "world" is 5 characters
        
        const content = await fs.readFile(testFilePath, 'utf8');
        expect(content).toBe('Hello, Claude! This is a test file.');
    });

    test('should handle single space deletion', async () => {
        const response = await client.callTool('patch_file_positions', {
            file_path: testFilePath,
            start_pos: 13,  // The space after "!"
            end_pos: 14,    // Just before "T"
            replacement: ''
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        
        const content = await fs.readFile(testFilePath, 'utf8');
        expect(content).toBe('Hello, world!This is a test file.');
    });

    test('should handle word deletion', async () => {
        const response = await client.callTool('patch_file_positions', {
            file_path: testFilePath,
            start_pos: 14,  // Start of "This"
            end_pos: 19,    // End of "This" including trailing space
            replacement: ''
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        
        const content = await fs.readFile(testFilePath, 'utf8');
        expect(content).toBe('Hello, world! is a test file.');
    });

    test('should handle start_pos equal to end_pos (insertion)', async () => {
        const response = await client.callTool('patch_file_positions', {
            file_path: testFilePath,
            start_pos: 13,  // After "!"
            end_pos: 13,    // Same position (insertion point)
            replacement: ' Hello again,'
        });
        
        const result = JSON.parse(response);
        expect(result.success).toBe(true);
        
        const content = await fs.readFile(testFilePath, 'utf8');
        expect(content).toBe('Hello, world! Hello again, This is a test file.');
    });

    test('should handle out of range positions', async () => {
        await expect(async () => {
            await client.callTool('patch_file_positions', {
                file_path: testFilePath,
                start_pos: 1000,
                end_pos: 1001,
                replacement: 'test'
            });
        }).rejects.toThrow('out of range');
    });

    test('should handle missing parameters', async () => {
        await expect(async () => {
            await client.callTool('patch_file_positions', {
                file_path: testFilePath
            });
        }).rejects.toThrow('Missing or invalid parameters');
    });

    test('should handle non-existent file', async () => {
        const nonExistentPath = path.resolve(testDir, 'nonexistent.txt');
        
        await expect(async () => {
            await client.callTool('patch_file_positions', {
                file_path: nonExistentPath,
                start_pos: 0,
                end_pos: 5,
                replacement: 'test'
            });
        }).rejects.toThrow('ENOENT');
    });

    test('should work with FIND_IN_FILE_TOOL', async () => {
        // First find the position of "world"
        const findResponse = await client.callTool('find_in_file', {
            file_path: testFilePath,
            search_string: 'world'
        });
        
        const findResult = JSON.parse(findResponse);
        expect(findResult.found).toBe(true);
        expect(findResult.matches.length).toBeGreaterThan(0);
        
        const match = findResult.matches[0];
        expect(match).toHaveProperty('position');
        expect(match).toHaveProperty('length');
        
        // Now patch that position
        const patchResponse = await client.callTool('patch_file_positions', {
            file_path: testFilePath,
            start_pos: match.position,
            end_pos: match.position + match.length,
            replacement: 'Claude'
        });
        
        const patchResult = JSON.parse(patchResponse);
        expect(patchResult.success).toBe(true);
        
        const content = await fs.readFile(testFilePath, 'utf8');
        expect(content).toBe('Hello, Claude! This is a test file.');
    });
});