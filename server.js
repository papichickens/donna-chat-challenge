import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { getSampleMeetings } from './src/utils/models.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize Google Ai client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
// const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// The endpoint your React app will call
app.post('/chat-stream', async (req, res) => {
  const { userInput } = req.body;

  // --- Integrate meeting data just like before ---
  const meetings = getSampleMeetings();
  const meetingsContext = meetings.map(m => `- ${new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} with ${m.with} about ${m.topic}`).join('\n');

  const prompt = `You are Donna, a helpful AI assistant for salespeople. Be concise. Here is the user's upcoming meeting schedule:\n${meetingsContext}\n\nUser question: "${userInput}"`;

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    // Call the Gemini API to get a streamed response
    const result = await model.generateContentStream(prompt);

    // Send data chunks as they arrive from the API
    for await (const chunk of result.stream) {
      const content = chunk.text();
      if (content) {
        // The data format must be `data: ...\n\n`
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
  } catch (error) {
    console.error('Error streaming from Google AI:', error);
    res.write(`data: ${JSON.stringify({ error: 'An error occurred.' })}\n\n`);
  } finally {
    // End the connection when the stream is finished
    res.end();
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});