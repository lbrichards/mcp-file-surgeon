import { promises as fs } from 'fs';
export async function handleFindInFile(request) {
    try {
        if (!request.params.arguments ||
            typeof request.params.arguments.file_path !== 'string' ||
            typeof request.params.arguments.search_string !== 'string') {
            throw new Error('Missing or invalid parameters');
        }
        const { file_path, search_string } = request.params.arguments;
        // Handle empty search string early
        if (search_string === '') {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            found: false,
                            message: "String not found in file"
                        }, null, 2)
                    }]
            };
        }
        const fileContent = await fs.readFile(file_path, 'utf8');
        const matches = [];
        let position = -1;
        let currentPos = 0;
        let occurrence = 0;
        while ((position = fileContent.indexOf(search_string, currentPos)) !== -1) {
            occurrence++;
            matches.push({
                position,
                length: search_string.length,
                occurrence
            });
            currentPos = position + 1;
        }
        if (matches.length === 0) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            found: false,
                            message: "String not found in file"
                        }, null, 2)
                    }]
            };
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        found: true,
                        matches,
                        total_matches: matches.length
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            content: [{
                    type: "text",
                    text: `Error searching file: ${errorMessage}`
                }],
            isError: true
        };
    }
}
