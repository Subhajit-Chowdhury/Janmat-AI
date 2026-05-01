import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const port = process.env.PORT || 8080;

// Initialize Google Generative AI
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ WARNING: GEMINI_API_KEY (or VITE_GEMINI_API_KEY) is not set in the environment variables!");
  console.warn("Please add your Gemini API Key to a .env file to enable the AI chat feature.");
}

const genAI = new GoogleGenerativeAI(apiKey || 'missing-key');
const generativeModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: {
    role: 'system',
    parts: [{ text: `CONTEXT: You are JanMat AI, an interactive educational assistant designed for the "Election Process Education" challenge. Your mission is to help users understand the Indian election process, timelines, and steps in an interactive and easy-to-follow way.

ROLE: Expert Election Educator. Always provide "Layman Breakdowns" and "Simple Step-by-Step" instructions. Keep answers concise, highly interactive, and avoid overly bureaucratic jargon.

CORE KNOWLEDGE BASE (TIMELINES & STEPS):
1. **Registration Steps**: Explain Form 6 (new voters) and Form 8 (corrections/shifting). Detail the difference between Rural (Gram Panchayat/BLO) and Urban (Ward Office/BLO) verification steps.
2. **Timelines**: Break down the process into: Pre-poll (Registration & Roll Check), Polling Day (Finding Booth, ID required), and Post-poll.
3. **Interactive Guidance**: Ask follow-up questions to keep the user engaged (e.g., "Are you applying from a rural or urban area?" or "Do you need help finding your polling booth?").
4. **Digital First**: Always recommend 'voters.eci.gov.in' as the primary step.

STRICT CONSTRAINTS: 
- Never hallucinate local officer names; always refer to them as "BLO (Booth Level Officer)".
- Maintain 100% neutrality.
- Your primary goal is education and making the process easy to follow.` }]
  }
});

// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'API Key Error: GEMINI_API_KEY (or VITE_GEMINI_API_KEY) is missing. Please configure it in the .env file.' 
      });
    }

    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const chat = generativeModel.startChat();
    const result = await chat.sendMessage(prompt);
    const text = result.response.text();
    
    res.json({ response: text });
  } catch (error) {
    console.error('Generative AI Error:', error);
    res.status(500).json({ 
      error: 'The JanMat AI service is currently unavailable. Please try again later. Details: ' + error.message 
    });
  }
});

// Static Files
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`JanMat AI Server running on port ${port} with Google Generative AI`);
});
