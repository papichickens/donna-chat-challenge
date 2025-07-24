// server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAllMeetings, addLoggedMeeting, addUpcomingMeeting } from './src/utils/meetingStorage.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

function extractJson(text) {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(jsonRegex);
  if (match && match[1]) {
    console.log('[DEBUG] Extracted JSON from markdown block.');
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error('[ERROR] Failed to parse extracted JSON from markdown.', e);
      return null;
    }
  }
  try {
    const parsed = JSON.parse(text);
    console.log('[DEBUG] Successfully parsed the entire response as JSON.');
    return parsed;
  } catch(e) {
    console.log('[DEBUG] Response is not a direct JSON object. Treating as text.');
    return null;
  }
}

// Main chat endpoint
app.post('/chat-stream', async (req, res) => {
    const requestStartTime = new Date();
    console.log(`\n\n=== [${requestStartTime.toISOString()}] New /chat-stream request received ===`);
    
    const { userInput } = req.body;
    console.log(`[INFO] User Input: "${userInput}"`);

    const { upcoming, logged } = await getAllMeetings();
    console.log(`[DATA] Fetched ${upcoming.length} upcoming and ${logged.length} logged meetings from storage.`);

    const toolPrompt = `
      You are Donna, a helpful and intelligent sales assistant. Your primary goal is to accurately assist the user based on their request.

      **Your Capabilities:**
      1.  **list_meetings**: When the user asks to see their schedule, upcoming meetings, or logged notes, you MUST retrieve the relevant information from the "Contextual Data" section below and present it in a clear, readable list.
      2.  **tool_use**: When the user explicitly asks to 'log' or 'schedule' a meeting, you MUST respond ONLY with a single, raw JSON object.
      3.  **chat**: For any other conversational question (e.g., "who are you?", "what can you do?"), provide a simple, friendly text answer.

      **Tool-Use Instructions (Capability #2):**
      - If you determine the intent is 'log_meeting' or 'schedule_meeting', your entire response MUST be the JSON object.
      - DO NOT wrap the JSON in markdown or add any other text.
      - The JSON structure MUST be:
        {
          "intent": "log_meeting" | "schedule_meeting",
          "payload": { "with": "string", "company": "string", "notes": "string, for logging only", "topic": "string, for scheduling only", "time": "ISO 8601 string" },
          "response": "A friendly, conversational string confirming the action was taken. This will be shown to the user."
        }

      **Contextual Data:**
      - Current Time: ${new Date().toISOString()}
      - Upcoming Meetings:
      ${upcoming.length > 0 ? upcoming.map(m => `- On ${new Date(m.time).toLocaleString()} you have a meeting with ${m.with} from ${m.company} about '${m.topic}'`).join('\n') : "None"}
      - Logged Meetings:
      ${logged.length > 0 ? logged.map(m => `- You had a meeting with ${m.with}: ${m.notes}`).join('\n') : "None"}

      ---
      **User Request:** "${userInput}"
    `;
    
    console.log('[AI] Sending request to Google AI...');
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
        const result = await model.generateContent(toolPrompt);
        const aiResponseText = result.response.text();
        
        console.log('---------- RAW AI RESPONSE START ----------');
        console.log(aiResponseText);
        console.log('----------- RAW AI RESPONSE END -----------');

        let conversationalResponse = '';

        const jsonResponse = extractJson(aiResponseText);

        if (jsonResponse && jsonResponse.intent && jsonResponse.payload) {
            console.log(`[ACTION] Detected intent: "${jsonResponse.intent}"`);
            const { intent, payload, response } = jsonResponse;

            if (intent === 'log_meeting') {
                console.log('[ACTION] Calling addLoggedMeeting with payload:', payload);
                await addLoggedMeeting({ ...payload, id: Date.now() });
                console.log('[SUCCESS] Meeting successfully logged.');
            } else if (intent === 'schedule_meeting') {
                console.log('[ACTION] Calling addUpcomingMeeting with payload:', payload);
                await addUpcomingMeeting({ ...payload, id: Date.now() });
                console.log('[SUCCESS] Meeting successfully scheduled.');
            }
            conversationalResponse = response || "Action completed successfully.";
        } else {
            console.log("[INFO] No specific action detected. Treating as a regular chat message.");
            conversationalResponse = aiResponseText;
        }

        console.log(`[RESPONSE] Streaming conversational response to client: "${conversationalResponse.substring(0, 150)}..."`);
        for (const char of conversationalResponse) {
            res.write(`data: ${JSON.stringify({ content: char })}\n\n`);
            await new Promise(resolve => setTimeout(resolve, 10)); // Tiny delay for streaming effect
        }

    } catch (error) {
        console.error('[ERROR] An error occurred in the /chat-stream endpoint:', error);
        res.write(`data: ${JSON.stringify({ error: 'An error occurred.' })}\n\n`);
    } finally {
        res.end();
        const requestEndTime = new Date();
        const duration = requestEndTime - requestStartTime;
        console.log(`[INFO] Connection closed. Request took ${duration}ms.`);
        console.log(`=== [${requestEndTime.toISOString()}] End of /chat-stream request ===`);
    }
});


// Other endpoints with basic logging
app.get('/upcoming-meetings', async (req, res) => {
    console.log(`[INFO] GET /upcoming-meetings request received.`);
	try {
		const { upcoming } = await getAllMeetings();
		res.status(200).json(upcoming);
	} catch (error) {
		console.error('[ERROR] Failed to fetch upcoming meetings:', error);
		res.status(500).json({ error: 'Failed to fetch upcoming meetings' });
	}
});

app.get('/logged-meetings', async (req, res) => {
    console.log(`[INFO] GET /logged-meetings request received.`);
	try {
		const { logged } = await getAllMeetings();
		res.status(200).json(logged);
	} catch (error) {
		console.error('[ERROR] Failed to fetch logged meetings:', error);
		res.status(500).json({ error: 'Failed to fetch logged meetings' });
	}
});


app.listen(port, () => {
	console.log(`[SERVER] Express server started successfully. Listening on http://localhost:${port}`);
});