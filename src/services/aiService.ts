// src/services/aiService.ts

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
    let currentResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // --- NEW: After the stream is done, check if we need to refresh ---
        // This is a simple way to update the meetings page.
        if (userInput.toLowerCase().includes('log') || userInput.toLowerCase().includes('schedule')) {
            // Use a small delay to ensure the user reads the final message.
            setTimeout(() => {
                // This will only reload if the user is currently on the meetings page.
                // A more advanced solution would use global state management.
                if(window.location.pathname.includes('/meetings')) {
                    window.location.reload();
                }
            }, 1000);
        }
        break;
      }
      
      // The logic here remains mostly the same, but it will now build the response chunk by chunk.
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const json = line.replace('data: ', '');
            const parsed = JSON.parse(json);
            if (parsed?.content) {
              currentResponse += parsed.content; // Append the new character/chunk
              onChunk(currentResponse);       // Update the UI with the full current string
            }
          } catch(e) {
            // Ignore lines that are not valid JSON
          }
        }
      }
    }
  } catch (err) {
    console.error('Error during AI response streaming:', err);
    onChunk('Sorry, an error occurred while trying to get a response.');
  }
}