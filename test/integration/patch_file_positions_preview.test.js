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
        console.log('Preview mode response:', JSON.stringify(result, null, 2));
        
        // Check that preview mode is recognized
        expect(result.success).toBe(true);
        expect(result.preview_only).toBe(true);
        
        // Check that the preview shows the expected changes
        expect(result).toHaveProperty('current_content');
        expect(result).toHaveProperty('proposed_content');
        
        // For unified diff format
        if (result.current_content.startsWith('@@ ')) {
            // Check diff format
            expect(result.current_content).toMatch(/^@@ -\d+,\d+ \+\d+,\d+ @@/);
            expect(result.proposed_content).toMatch(/^@@ -\d+,\d+ \+\d+,\d+ @@/);
            
            // Check content shows the right context
            expect(result.current_content).toContain('-world');
            expect(result.proposed_content).toContain('+Claude');
        } else {
            // Legacy format fallback
            expect(result.current_content).toContain('world');
            expect(result.proposed_content).toContain('Claude');
        }
        
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
        console.log('Context response:', JSON.stringify(result, null, 2));
        
        expect(result.success).toBe(true);
        expect(result.preview_only).toBe(true);
        
        // With context_chars: 5, and start_pos: 7, we should get "llo, " before the change
        if (result.current_content.startsWith('@@ ')) {
            // Diff format
            expect(result.current_content).toContain(' Hello');
            expect(result.current_content).toContain('-world');
            expect(result.proposed_content).toContain(' Hello');
            expect(result.proposed_content).toContain('+Claude');
        } else {
            // Legacy format
            expect(result.current_content).toContain('llo,');
            expect(result.current_content).toContain('! Thi');
            expect(result.proposed_content).toContain('llo,');
            expect(result.proposed_content).toContain('! Thi');
        }
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
        console.log('Full file response:', JSON.stringify(result, null, 2));
        
        expect(result.success).toBe(true);
        expect(result.preview_only).toBe(true);
        
        // Check that we get the entire content
        const originalContent = await fs.readFile(testFilePath, 'utf8');
        
        // For full file context, we may get regular (non-diff) format
        if (!result.current_content.startsWith('@@ ')) {
            expect(result.current_content).toBe(originalContent);
            expect(result.proposed_content).toContain('Greetings');
            expect(result.proposed_content).not.toContain('Hello');
        } else {
            // Diff format for full file
            expect(result.current_content).toContain('-Hello');
            expect(result.proposed_content).toContain('+Greetings');
        }
    });
    
    // Test with multi-line content
    test('should handle multi-line content with unified diff format', async () => {
        // Create a multi-line test file
        const multilineContent = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
        const multilineFilePath = path.resolve(testDir, 'multiline.txt');
        await fs.writeFile(multilineFilePath, multilineContent, 'utf8');
        
        const response = await client.callTool('patch_file_positions', {
            file_path: multilineFilePath,
            start_pos: 7,    // Middle of Line 2
            end_pos: 19,     // Middle of Line 4
            replacement: 'REPLACED',
            preview_only: true,
            context_chars: 10
        });
        
        const result = JSON.parse(response);
        console.log('Multi-line response:', JSON.stringify(result, null, 2));
        
        expect(result.success).toBe(true);
        expect(result.preview_only).toBe(true);
        
        // Check for unified diff format
        if (result.current_content.startsWith('@@ ')) {
            expect(result.current_content).toMatch(/^@@ -\d+,\d+ \+\d+,\d+ @@/);
            expect(result.proposed_content).toMatch(/^@@ -\d+,\d+ \+\d+,\d+ @@/);
            
            // Proper line prefixes
            expect(result.current_content).toContain(' Line 1');
            expect(result.current_content).toContain('-Line 2');
            expect(result.current_content).toContain('-Line 3');
            expect(result.current_content).toContain('-Line 3');
            // Line 4 is shown as context, not as removed
            expect(result.current_content).toContain(' Line 4');
            
            // Check the proposed content has the expected format
            expect(result.proposed_content).toContain(' Line 1');
            expect(result.proposed_content).toContain('+REPLACED');
            expect(result.proposed_content).toContain(' Line 5');
        }
        
        // Clean up the multi-line file
        await fs.rm(multilineFilePath, { force: true }).catch(() => {});
    });
});