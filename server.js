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
    parts: [{
      text: `IDENTITY: You are JanMat AI — a calm, knowledgeable guide for Indian elections. You explain simply, clearly, and patiently. Use "Sir/Ma'am" naturally. Never show off.

TONE: Warm, genuine, humble. Short sentences. Everyday words.

CRITICAL: Only state verified facts from ECI and Constitution. If unsure, say: "For accurate info, visit [voters.eci.gov.in](https://voters.eci.gov.in) or [eci.gov.in](https://eci.gov.in)."

CONTEXT MANAGEMENT:
- Remember previous questions in this conversation.
- For registration queries, track: age, area (rural/urban), state, PIN — use to personalize.
- Reference earlier answers when relevant. Don't repeat full context unless asked.

OUTPUT FORMAT (MANDATORY):

[THINKING]
2-3 sentences: What is this about? Which verified fact answers it? What should user do next?
[/THINKING]

[ANSWER]
Simple words. Numbered lists, bullets, ## headers. Clickable URLs: [Link Text](https://url). End with: "Is there anything specific you'd like me to explain in more detail, Sir/Ma'am?"
[/ANSWER]

[REFERENCES]
- Official Govt of India URLs actually used (only ECI, state CEO sites)
[/REFERENCES]

--- VERIFIED KNOWLEDGE BASE ---

1. VOTER REGISTRATION (Form 6)
Eligibility: 18+ years on qualifying date (Jan 1).
Documents: Age proof (Aadhaar/birth cert/10th marksheet), Address proof (Aadhaar/ration/utility), Photo.
Online: voters.eci.gov.in → Login → Fill Form 6 → Upload docs → BLO verifies → e-EPIC download.
Offline: Visit BLO/ERO office, get printed Form 6, submit with docs.
Rural: Gram Panchayat/Pradhan helps. Urban: Ward Office/Municipal Center.

2. FORMS
Form 6: New registration. Form 7: Objection/delete. Form 8: Corrections, shift constituency, replace EPIC.

3. ELECTION TYPES
Lok Sabha: Vote for MP → PM. Vidhan Sabha: Vote for MLA → CM. Rajya Sabha: MLAs vote. Citizens don't.
Panchayat/Municipal: State Election Commission, NOT ECI.
President/VP: Electoral College (MPs+MLAs). Citizens don't vote.

4. KEY OFFICIALS & PORTALS
CEC: Gyanesh Kumar (2025). BLO: Local officer. CEO: State Chief Electoral Officer (ceo[state].nic.in, e.g. ceodelhi.gov.in).
NVSP: voters.eci.gov.in, nvsp.in.

5. VALID IDs AT BOOTH
Aadhaar, Voter ID (EPIC), Passport, Driving Licence, PAN Card, MNREGA Job Card, Bank/Post Passbook with photo, Health Insurance Smart Card, Smart Card (RGI/NPR), Pension doc with photo.

6. SIR & SSR
SIR: House-to-house BLO verification. SSR: Annual draft roll → claims/objections → final roll. Qualifying date: Jan 1.
Delhi SIR 2025: ceodelhi.gov.in

--- END KNOWLEDGE BASE ---`
    }
  ]
}
});

// In-memory conversation store (sessionId → chat history)
const sessionStore = new Map();
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getSessionId(req) {
  return req.headers['x-session-id'] || req.ip || 'default';
}

function cleanupSession(sessionId) {
  setTimeout(() => {
    sessionStore.delete(sessionId);
  }, SESSION_TTL_MS);
}

// Request deduplication map (prompt hash → promise)
const pendingRequests = new Map();

// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({
        error: 'API Key Error: GEMINI_API_KEY is missing. Please configure .env file.'
      });
    }

    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Please enter a valid question.' });
    }

    const trimmedPrompt = prompt.trim();
    const sessionId = getSessionId(req);

    // Deduplication: if same prompt from same session within 2 seconds, return cached
    const requestKey = `${sessionId}:${trimmedPrompt}`;
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey);
    }

    const promise = (async () => {
      // Get or create chat history for this session
      let history = sessionStore.get(sessionId);
      if (!history) {
        history = [];
        cleanupSession(sessionId);
      }

      // Create chat with history
      const chat = generativeModel.startChat({ history });

      // Send message
      const result = await chat.sendMessage(trimmedPrompt);
      const text = result.response.text();

      // Update history (keep last 10 exchanges to save tokens)
      history.push({ role: 'user', parts: [{ text: trimmedPrompt }] });
      history.push({ role: 'model', parts: [{ text: text }] });
      if (history.length > 20) {
        history = history.slice(-20); // keep last 10 Q&A pairs
      }
      sessionStore.set(sessionId, history);

      return res.json({ response: text });
    })();

    pendingRequests.set(requestKey, promise);
    setTimeout(() => pendingRequests.delete(requestKey), 2000);

    return promise;
  } catch (error) {
    console.error('Generative AI Error:', error);
    res.status(500).json({
      error: 'AI service temporarily unavailable. Please try again. ' + (error.message || '')
    });
  }
});

// Static Files
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`JanMat AI Server running on port ${port} with Google Gemini`);
});
