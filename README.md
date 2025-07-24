
## Getting Started

Follow these steps to run the application locally on your machine.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd donna-chat
```

### 2. Install Dependencies

```bash
npm install
```

This will install both frontend and backend dependencies (if using a unified setup).

### 3. Set Up Environment Variables

1. Create a `.env` file in the root directory.
2. Add your Google Gemini API key:

```env
GOOGLE_API_KEY="your-api-key-here"
```

You can get a free API key from [Google AI Studio](https://makersuite.google.com/).

### 4. Run the Application

You'll need to open two terminal windows:

**Terminal 1: Start the Backend**

```bash
node server.js
```

You should see:

```
[SERVER] Express server started successfully. Listening on http://localhost:3001
```

**Terminal 2: Start the Frontend**

```bash
npm run dev
```

You’ll see something like:

```
Local: http://localhost:5173/
```

### 5. Open in Browser

Go to [http://localhost:5173](http://localhost:5173) to use the Donna AI assistant.
