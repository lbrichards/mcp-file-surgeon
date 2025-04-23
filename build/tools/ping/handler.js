export async function handlePing(request) {
    return {
        content: [{
                type: "text",
                text: "pong"
            }]
    };
}
