import { createTestClient } from '../utils/mcp_test_client.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('patch_file_positions preview mode', () => {
    let client;
    const testDir = path.resolve(__dirname, '../tmp/patch_positions_preview_test');
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

    test('should support preview mode without modifying file', async () => {
        // Get the original content for later comparison
        const originalContent = await fs.readFile(testFilePath, 'utf8');
        
        // Call the tool with preview mode enabled
        const response = await client.callTool('patch_file_positions', {
            file_path: testFilePath,
            start_pos: 7,   // After "Hello, "
            end_pos: 12,    // Just before "! This"
            replacement: 'Claude',
            preview_only: true
        });
        
        const result = JSON.parse(response);
        
        // Check that preview mode is recognized
        expect(result.success).toBe(true);
        expect(result.preview_only).toBe(true);
        
        // Check that the preview shows the expected changes
        expect(result).toHaveProperty('current_content');
        expect(result).toHaveProperty('proposed_content');
        expect(result.current_content).toContain('world');
        expect(result.proposed_content).toContain('Claude');
        
        // Verify that the file was NOT modified
        const actualContent = await fs.readFile(testFilePath, 'utf8');
        expect(actualContent).toBe(originalContent);
    });
    
    test('should include context around the change in preview mode', async () => {
        const response = await client.callTool('patch_file_positions', {
            file_path: testFilePath,
            start_pos: 7,
            end_pos: 12,
            replacement: 'Claude',
            preview_only: true,
            context_chars: 5  // Show 5 characters before and after the change
        });
        
        const result = JSON.parse(response);
        
        expect(result.success).toBe(true);
        expect(result.preview_only).toBe(true);
        
        // With context_chars: 5, and start_pos: 7, we should get "llo, " before the change
        expect(result.current_content).toContain('llo,');
        expect(result.current_content).toContain('! Thi');
        expect(result.proposed_content).toContain('llo,');
        expect(result.proposed_content).toContain('! Thi');
        
        // The context should be limited based on the context_chars parameter
        expect(result.current_content.length).toBeLessThanOrEqual(
            5 + 5 + 'world'.length + 10 // Add some extra for potential formatting
        );
    });
    
    test('should handle context that exceeds file boundaries', async () => {
        const response = await client.callTool('patch_file_positions', {
            file_path: testFilePath,
            start_pos: 0,  // Start of file
            end_pos: 5,    // End of "Hello"
            replacement: 'Greetings',
            preview_only: true,
            context_chars: 100  // More than file length
        });
        
        const result = JSON.parse(response);
        
        expect(result.success).toBe(true);
        expect(result.preview_only).toBe(true);
        
        // Check that we get the entire content
        const originalContent = await fs.readFile(testFilePath, 'utf8');
        expect(result.current_content).toBe(originalContent);
        expect(result.proposed_content).toContain('Greetings');
        expect(result.proposed_content).not.toContain('Hello');
    });
});