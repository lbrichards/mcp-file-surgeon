import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const TEST_DIR = path.resolve(__dirname, '../tmp');

export async function ensureTestDir() {
    try {
        await fs.access(TEST_DIR);
        console.log('Test directory exists:', TEST_DIR);
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log('Creating test directory:', TEST_DIR);
            await fs.mkdir(TEST_DIR, { recursive: true });
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('Test directory created');
        } else {
            throw err;
        }
    }
}

export async function cleanTestFiles(filePattern) {
    try {
        console.log('Cleaning test files matching:', filePattern);
        const files = await fs.readdir(TEST_DIR);
        for (const file of files) {
            if (file.includes(filePattern)) {
                const filePath = path.join(TEST_DIR, file);
                const stat = await fs.stat(filePath);
                if (stat.isDirectory()) {
                    await fs.rmdir(filePath);
                } else {
                    await fs.unlink(filePath);
                }
                console.log('Cleaned up:', filePath);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }
}

export async function createTestFile(filename, content) {
    await ensureTestDir();
    const filePath = path.join(TEST_DIR, filename);
    console.log('Creating test file:', filePath);
    await fs.writeFile(filePath, content);
    
    // Verify file was written
    try {
        await new Promise(resolve => setTimeout(resolve, 100));
        await fs.access(filePath);
        const writtenContent = await fs.readFile(filePath, 'utf8');
        if (writtenContent !== content) {
            throw new Error('File content verification failed');
        }
        console.log('Test file created and verified:', filePath);
        return filePath;
    } catch (err) {
        console.error('Failed to create/verify test file:', filePath, err);
        throw new Error(`Failed to create test file: ${err.message}`);
    }
}

export async function assertFileContent(filePath, expectedContent) {
    console.log('Verifying file content:', filePath);
    await new Promise(resolve => setTimeout(resolve, 100));
    const content = await fs.readFile(filePath, 'utf8');
    expect(content).toBe(expectedContent);
    console.log('File content verified successfully');
}

export async function assertFileExists(filePath) {
    console.log('Checking file exists:', filePath);
    await new Promise(resolve => setTimeout(resolve, 100));
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
    console.log('File existence verified');
}

export async function assertFileNotExists(filePath) {
    console.log('Checking file does not exist:', filePath);
    await new Promise(resolve => setTimeout(resolve, 100));
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    expect(exists).toBe(false);
    console.log('File non-existence verified');
}