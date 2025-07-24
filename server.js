import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAllMeetings } from './src/utils/meetingStorage.js';
import { addLoggedMeeting, addUpcomingMeeting } from './src/utils/meetingStorage.js';

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

	const { upcoming, logged } = await getAllMeetings();
	const format = (m, type) => {
		const time = new Date(m.time).toLocaleString();
		if (type === "upcoming") {
			return `- ${time} with ${m.with} (${m.company}): ${m.topic || ""}`;
		} else {
			return `- ${time} — Logged meeting with ${m.with} (${m.company}): ${m.notes || ""}`;
		}
	};

	const prompt = `
		You are Donna, a helpful assistant for salespeople.

		You can:
		- Help users view their upcoming meetings
		- Log meeting summaries with people they just met
		- Add new meetings to their schedule

		Here are the user's current meetings:
		Upcoming:
		${upcoming.map(m => format(m, "upcoming")).join('\n')}

		Logged:
		${logged.map(m => format(m, "logged")).join('\n')}

		Conversation:
		User: "${userInput}"
	`;

	// headers for SSE
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.flushHeaders();

	try {
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

app.post('/add-logged-meeting', async (req, res) => {
	const meeting = req.body;
	if (!meeting.with || !meeting.time) {
		return res.status(400).json({ error: 'Missing meeting details' });
	}

	await addLoggedMeeting({ ...meeting, id: Date.now() });
	res.status(200).json({ success: true });
});

app.post('/add-upcoming-meeting', async (req, res) => {
	const meeting = req.body;
	if (!meeting.with || !meeting.time) {
		return res.status(400).json({ error: 'Missing meeting details' });
	}

	await addUpcomingMeeting({ ...meeting, id: Date.now() });
	res.status(200).json({ success: true });
});

app.get('/upcoming-meetings', async (req, res) => {
	try {
		const { upcoming } = await getAllMeetings();
		res.status(200).json(upcoming);
	} catch (error) {
		console.error('Error reading upcoming meetings:', error);
		res.status(500).json({ error: 'Failed to fetch upcoming meetings' });
	}
});

app.get('/logged-meetings', async (req, res) => {
	try {
		const { logged } = await getAllMeetings();
		res.status(200).json(logged);
	} catch (error) {
		console.error('Error reading logged meetings:', error);
		res.status(500).json({ error: 'Failed to fetch logged meetings' });
	}
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});