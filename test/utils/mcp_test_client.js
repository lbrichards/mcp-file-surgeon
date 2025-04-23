import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TestClient {
    constructor() {
        this.serverProcess = null;
    }

    async start() {
        // Run our local development version
        const serverPath = path.resolve(__dirname, '../../build/index.js');
        this.serverProcess = spawn('node', [serverPath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // Wait a bit for the server to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return this;
    }

    async callTool(toolName, params, timeout = 3000) {
        if (!this.serverProcess) {
            throw new Error('Server not started');
        }

        const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
                name: toolName,
                arguments: params
            }
        };

        return new Promise((resolve, reject) => {
            let responseReceived = false;

            const timeoutId = setTimeout(() => {
                if (!responseReceived) {
                    console.log('Timeout occurred waiting for server response');
                    reject(new Error('Server response timeout'));
                }
            }, timeout);

            const handleData = (data) => {
                try {
                    console.log('Received server response:', data.toString());
                    const response = JSON.parse(data.toString());
                    responseReceived = true;

                    if (response.result?.isError) {
                        clearTimeout(timeoutId);
                        const errorMessage = response.result.content[0].text;
                        reject(new Error(errorMessage));
                        return;
                    }

                    if (response.result?.content?.[0]?.text) {
                        // For delete_file tool, we need special handling
                        if (toolName === 'delete_file') {
                            try {
                                const resultContent = JSON.parse(response.result.content[0].text);
                                if (response.result.isError || !resultContent.success) {
                                    clearTimeout(timeoutId);
                                    reject(new Error(resultContent.error || 'Error deleting file'));
                                    return;
                                }
                            } catch (err) {
                                // Not JSON content, continue with normal processing
                            }
                        }
                        clearTimeout(timeoutId);
                        resolve(response.result.content[0].text);
                        return;
                    }

                    clearTimeout(timeoutId);
                    resolve(response.result);
                } catch (err) {
                    console.log('Error parsing response:', err);
                    // Don't reject here - might be partial data
                }
            };

            this.serverProcess.stdout.on('data', handleData);
            this.serverProcess.stderr.on('data', (data) => {
                const message = data.toString();
                if (!message.includes('running on stdio')) {
                    console.log('Server stderr:', message);
                }
            });

            // Actually send the request after setting up handlers
            this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
        });
    }

    async stop() {
        if (this.serverProcess) {
            this.serverProcess.kill();
            this.serverProcess = null;
        }
    }
}

export const createTestClient = async () => {
    const client = new TestClient();
    return client.start();
};