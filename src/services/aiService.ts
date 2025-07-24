


export async function streamAIResponse(userInput: string, onChunk: (text: string) => void): Promise<void> {
  try {
    const response = await fetch('http://localhost:3001/chat-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput }),
    });

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let finalText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const parsed = JSON.parse(line.replace('data: ', ''));
          if (parsed?.content) {
            finalText += parsed.content;
            onChunk(finalText);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error during AI response streaming:', err);
    onChunk('Error getting response.');
  }
}