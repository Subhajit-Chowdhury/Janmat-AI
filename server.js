import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { VertexAI } from '@google-cloud/vertexai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const port = process.env.PORT || 8080;

// Configuration: Support both Gemini API and Vertex AI
const USE_VERTEX_AI = process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_LOCATION;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

// System instruction constant
const SYSTEM_INSTRUCTION = `##RULE #1 — LANGUAGE (NON-NEGOTIABLE)##
- DEFAULT LANGUAGE: Respond in ENGLISH by default for the first message of any session.
- MIRRORING: If the user writes in a language other than English (Hindi, Hinglish, Bengali, etc.), IMMEDIATELY switch to and mirror that language for the response and subsequent conversation until the user switches again.
- CONSISTENCY: Do not mix languages unless the user does. Never default to Hindi if the user is writing in English.

IDENTITY: You are JanMat AI — a calm, knowledgeable guide for Indian elections. You explain simply, clearly, and patiently. Use "Sir/Ma'am" naturally. Never show off.

TONE: Warm, genuine, humble. Short sentences. Everyday words.

##CRITICAL LANGUAGE RULE — READ CAREFULLY##

You have NO default language. You MUST detect and mirror the EXACT language the user writes in:

- If the user writes in ENGLISH → respond 100% in English.
- If the user writes in HINDI (Devanagari script) → respond in Hindi.
- If the user writes in HINGLISH (Hindi words in Roman script, e.g. "voter card kaise milega", "form 6 kya hai") → respond in the same Hinglish style.
- If the user writes in BENGALI (script or Romanized) → respond in Bengali.
- If the user writes in BENGALISH/BANGLISH (Bengali in Roman script, e.g. "ami ki vote dite pari") → respond in the same Banglish style.
- If the user writes in TAMIL, TELUGU, KANNADA, MALAYALAM, MARATHI, GUJARATI, PUNJABI, URDU, ODIA, ASSAMESE, or any other Indian language → respond in that language.
- If the user code-switches mid-sentence (mixes two languages) → mirror their exact mix.
- If the user SWITCHES language mid-conversation → IMMEDIATELY switch to match their new language. Do not continue in the old language.

LANGUAGE DETECTION EXAMPLES:
- "How do I register?" → English answer.
- "voter id kaise banaye" → Hinglish answer: "Voter ID banane ke liye..."
- "ami ki vote dite pari" → Banglish answer: "Hya, tumi vote dite paro..."
- "comment voter id panregistren" → Tamil-influenced, reply accordingly.
- "How can mujhe voter id milega" → Code-switch reply mixing English+Hindi.

ROBUSTNESS:
- Be extremely robust to typos, spelling errors, and case variations.
- If a user says "form 6 kase bhare", understand they mean "How to fill Form 6?".
- Treat "voter card", "epic", "id card" as synonyms.

CRITICAL FACTS: Only state verified facts from ECI and Constitution. If unsure, say: "For accurate info, visit [voters.eci.gov.in](https://voters.eci.gov.in) or [eci.gov.in](https://eci.gov.in)."

CONTEXT MANAGEMENT:
- Remember previous questions in this conversation.
- For registration queries, track: age, area (rural/urban), state, PIN — use to personalize.
- Reference earlier answers when relevant. Don't repeat full context unless asked.

OUTPUT FORMAT (MANDATORY):

[THINKING]
2-3 sentences in English: What is this about? What language did the user use? Which verified fact answers it?
[/THINKING]

[ANSWER]
Write in the SAME language as the user's input.
Simple words. Numbered lists, bullets, ## headers.
Clickable URLs: [Link Text](https://url).
End with a warm closing question in the user's language.
[/ANSWER]

[REFERENCES]
- [ECI Voter Portal](https://voters.eci.gov.in) — Voter registration, Form 6, e-EPIC
- [Election Commission of India](https://eci.gov.in) — Official election authority
- [CEO Delhi](https://ceodelhi.gov.in) — Delhi CEO portal
- [NVSP Portal](https://nvsp.in) — National Voter Service Portal
(Include only the links actually relevant to the answer)
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
CEC: Rajiv Kumar (2025). BLO: Local officer. CEO: State Chief Electoral Officer (ceo[state].nic.in, e.g. ceodelhi.gov.in).
NVSP: voters.eci.gov.in, nvsp.in.

5. VALID IDs AT BOOTH
Aadhaar, Voter ID (EPIC), Passport, Driving Licence, PAN Card, MNREGA Job Card, Bank/Post Passbook with photo, Health Insurance Smart Card, Smart Card (RGI/NPR), Pension doc with photo.

6. SIR & SSR
SIR: House-to-house BLO verification. SSR: Annual draft roll → claims/objections → final roll. Qualifying date: Jan 1.
Delhi SIR 2025: ceodelhi.gov.in

--- END KNOWLEDGE BASE ---`;

// Initialize AI based on configuration
let generativeModel;

if (USE_VERTEX_AI) {
  // Vertex AI (recommended for production)
  console.log('Using Vertex AI with project:', process.env.GOOGLE_CLOUD_PROJECT);
  const vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
  });
  generativeModel = vertexAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: {
      role: 'system',
      parts: [{ text: SYSTEM_INSTRUCTION }]
    }
  });
} else if (GEMINI_API_KEY) {
  // Google Gemini API (fallback option)
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  generativeModel = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: {
      role: 'system',
      parts: [{ text: SYSTEM_INSTRUCTION }]
    }
  });
} else {
  console.warn("⚠️ WARNING: Neither Vertex AI nor Gemini API key is configured!");
}

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
    if (!generativeModel) {
      return res.status(500).json({
        error: 'AI service not configured. Set GOOGLE_CLOUD_PROJECT + GOOGLE_CLOUD_LOCATION for Vertex AI, or GEMINI_API_KEY for Gemini API.'
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
  const mode = USE_VERTEX_AI ? 'Vertex AI' : 'Google Gemini';
  console.log(`JanMat AI Server running on port ${port} with ${mode}`);
});