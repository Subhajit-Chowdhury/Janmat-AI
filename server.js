import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));
const port = process.env.PORT || 8080;

// ─────────────────────────────────────────────
// SYSTEM INSTRUCTION
// ─────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `##RULE #1 — LANGUAGE (NON-NEGOTIABLE)##
- DEFAULT LANGUAGE: Respond in ENGLISH by default for the first message of any session.
- MIRRORING: If the user writes in a language other than English (Hindi, Hinglish, Bengali, etc.), IMMEDIATELY switch to and mirror that language for the response and subsequent conversation until the user switches again.
- CONSISTENCY: Do not mix languages unless the user does. Never default to Hindi if the user is writing in English.

IDENTITY: You are ElectAI — a calm, knowledgeable guide for Indian elections. You explain simply, clearly, and patiently. Use "Sir/Ma'am" naturally. Never show off.

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

##CRITICAL TYPO & VOICE INPUT TOLERANCE RULE##

Users may type with spelling mistakes, grammar errors, or send garbled voice-to-text (STT) transcriptions. You MUST:
- ALWAYS infer the user's INTENT from context, even if words are misspelled, abbreviated, or garbled.
- Treat "voter id", "vooter card", "voter eye dee", "epic card", "voter Id", "EPIC" — all as the same thing.
- Treat "registartion", "regitration", "registeration" — as "registration".
- Treat "form 6", "form six", "form 6 form", "Form6" — all as Form 6 voter registration.
- If a voice input sounds like phonetic approximations (e.g. "how too register voter eye dee"), convert to correct query intent.
- NEVER say "I don't understand your question" due to spelling issues. Always attempt to answer based on inferred intent.
- If genuinely ambiguous, answer the MOST LIKELY interpretation and gently ask for clarification.

LANGUAGE DETECTION EXAMPLES:
- "How do I register?" → English answer.
- "voter id kaise banaye" → Hinglish answer: "Voter ID banane ke liye..."
- "ami ki vote dite pari" → Banglish answer: "Hya, tumi vote dite paro..."
- "vooter registartion form 6" → Infer: voter registration Form 6, answer in English.
- "form chhe kya hota hai" → Infer: Form 6 in Hinglish, answer in Hinglish.

ROBUSTNESS:
- Be extremely robust to typos, spelling errors, case variations, and voice transcription artifacts.
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

// ─────────────────────────────────────────────
// PROVIDER CONFIGURATION
// ─────────────────────────────────────────────

// AI Studio keys — supports up to 3 for round-robin quota sharing
const AI_STUDIO_KEYS = [
  process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean); // Remove undefined/empty entries

// Vertex AI config (optional fallback — uses GCP ADC, no API key needed)
const VERTEX_PROJECT_ID = process.env.VERTEX_PROJECT_ID;
const VERTEX_LOCATION   = process.env.VERTEX_LOCATION || 'us-central1';

// Model cascade list — tried in order on 404/model errors
const MODEL_CASCADE = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.0-pro',
];

// ─────────────────────────────────────────────
// SMART PROVIDER ROUTER
// ─────────────────────────────────────────────
class ProviderRouter {
  constructor() {
    this.aiStudioClients = [];     // Array of {genAI, keyIndex, label}
    this.vertexClient    = null;   // Vertex AI VertexAI instance
    this.currentKeyIndex = 0;      // Round-robin pointer for AI Studio keys
    this.currentModelIndex = 0;    // Model cascade pointer

    // Health state per provider
    this.health = {
      aiStudio: { ok: true, failedAt: null },
      vertex:   { ok: true, failedAt: null },
    };

    // Cooldown: don't retry a failed provider for 60s
    this.COOLDOWN_MS = 60_000;
  }

  async init() {
    // ── Initialize AI Studio clients ──
    if (AI_STUDIO_KEYS.length > 0) {
      for (let i = 0; i < AI_STUDIO_KEYS.length; i++) {
        try {
          const genAI = new GoogleGenerativeAI(AI_STUDIO_KEYS[i]);
          this.aiStudioClients.push({ genAI, keyIndex: i, label: `AI Studio Key ${i + 1}` });
        } catch (e) {
          console.error(`❌ Failed to init AI Studio key ${i + 1}:`, e.message);
        }
      }
      console.log(`✅ AI Studio: ${this.aiStudioClients.length}/${AI_STUDIO_KEYS.length} key(s) initialized`);
    } else {
      console.warn('⚠️  No AI Studio API keys found in environment variables.');
    }

    // ── Initialize Vertex AI client (optional) ──
    if (VERTEX_PROJECT_ID) {
      try {
        const { VertexAI } = await import('@google-cloud/vertexai');
        this.vertexClient = new VertexAI({ project: VERTEX_PROJECT_ID, location: VERTEX_LOCATION });
        console.log(`✅ Vertex AI: project="${VERTEX_PROJECT_ID}" location="${VERTEX_LOCATION}"`);
      } catch (e) {
        console.warn('⚠️  Vertex AI init failed (will skip):', e.message);
        this.vertexClient = null;
      }
    } else {
      console.log('ℹ️  Vertex AI not configured (VERTEX_PROJECT_ID not set) — using AI Studio only');
    }

    if (this.aiStudioClients.length === 0 && !this.vertexClient) {
      throw new Error('No AI provider configured. Please set GEMINI_API_KEY_1 or VERTEX_PROJECT_ID.');
    }
  }

  // ── Check if a provider is in cooldown ──
  _isHealthy(provider) {
    const h = this.health[provider];
    if (h.ok) return true;
    const elapsed = Date.now() - h.failedAt;
    if (elapsed > this.COOLDOWN_MS) {
      h.ok = true; // Reset after cooldown
      h.failedAt = null;
      console.log(`🔄 Provider "${provider}" recovered from cooldown.`);
      return true;
    }
    return false;
  }

  _markFailed(provider) {
    this.health[provider] = { ok: false, failedAt: Date.now() };
    console.warn(`⚠️  Provider "${provider}" marked unhealthy for ${this.COOLDOWN_MS / 1000}s.`);
  }

  _markOk(provider) {
    if (!this.health[provider].ok) {
      this.health[provider] = { ok: true, failedAt: null };
      console.log(`✅ Provider "${provider}" back to healthy.`);
    }
  }

  // ── Get next AI Studio client (round-robin) ──
  _nextAiStudioClient() {
    if (this.aiStudioClients.length === 0) return null;
    const client = this.aiStudioClients[this.currentKeyIndex % this.aiStudioClients.length];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.aiStudioClients.length;
    return client;
  }

  // ── Try AI Studio with model cascade ──
  async _tryAiStudio(history, prompt) {
    if (!this._isHealthy('aiStudio') || this.aiStudioClients.length === 0) return null;

    const client = this._nextAiStudioClient();
    console.log(`→ Using ${client.label}, model cascade starting at index ${this.currentModelIndex}`);

    // Try each model in cascade order
    for (let mi = 0; mi < MODEL_CASCADE.length; mi++) {
      const modelName = MODEL_CASCADE[(this.currentModelIndex + mi) % MODEL_CASCADE.length];
      try {
        const model = client.genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: { role: 'system', parts: [{ text: SYSTEM_INSTRUCTION }] },
        });

        const chat   = model.startChat({ history });
        const result = await chat.sendMessage(prompt);
        const text   = result.response.text();

        // Success — record which model worked
        this.currentModelIndex = (this.currentModelIndex + mi) % MODEL_CASCADE.length;
        this._markOk('aiStudio');
        console.log(`✅ AI Studio response via ${client.label} (${modelName})`);
        return text;

      } catch (err) {
        const status = err?.status || err?.httpErrorCode || 0;
        const isModelError = status === 404 || (err.message || '').includes('not found') || (err.message || '').includes('404');
        const isQuotaError = status === 429 || (err.message || '').includes('quota') || (err.message || '').includes('RESOURCE_EXHAUSTED');
        const isServerError = status >= 500;

        if (isModelError) {
          console.warn(`⚠️  Model "${modelName}" not available via ${client.label} — trying next model`);
          continue; // Try next model in cascade
        }
        if (isQuotaError) {
          console.warn(`⚠️  Quota exceeded on ${client.label} — will try Vertex AI`);
          this._markFailed('aiStudio');
          return null; // Signal to try Vertex
        }
        if (isServerError) {
          console.warn(`⚠️  Server error on ${client.label} — will try Vertex AI`);
          this._markFailed('aiStudio');
          return null;
        }
        // Other errors — don't cascade, surface
        throw err;
      }
    }

    // All models exhausted
    this._markFailed('aiStudio');
    return null;
  }

  // ── Try Vertex AI with model cascade ──
  async _tryVertex(history, prompt) {
    if (!this._isHealthy('vertex') || !this.vertexClient) return null;

    console.log('→ Trying Vertex AI fallback...');

    for (let mi = 0; mi < MODEL_CASCADE.length; mi++) {
      const modelName = MODEL_CASCADE[mi];
      try {
        const generativeModel = this.vertexClient.preview.getGenerativeModel({
          model: modelName,
          generation_config: { max_output_tokens: 2048, temperature: 0.7 },
        });

        // Convert history to Vertex format
        const vertexHistory = history.map(h => ({
          role: h.role === 'model' ? 'model' : 'user',
          parts: h.parts,
        }));

        const chat   = generativeModel.startChat({ history: vertexHistory });
        const result = await chat.sendMessage([{ text: prompt }]);
        const text   = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error('Empty response from Vertex AI');

        this._markOk('vertex');
        console.log(`✅ Vertex AI response via model: ${modelName}`);
        return text;

      } catch (err) {
        const isModelError = (err.message || '').includes('404') || (err.message || '').includes('not found');
        if (isModelError) {
          console.warn(`⚠️  Vertex model "${modelName}" not found — trying next`);
          continue;
        }
        console.error(`❌ Vertex AI error (${modelName}):`, err.message);
        this._markFailed('vertex');
        return null;
      }
    }

    this._markFailed('vertex');
    return null;
  }

  // ── Main send method: AI Studio → Vertex → error ──
  async sendMessage(history, prompt) {
    // 1. Try AI Studio
    let response = await this._tryAiStudio(history, prompt);
    if (response) return response;

    // 2. Try Vertex AI fallback
    response = await this._tryVertex(history, prompt);
    if (response) return response;

    // 3. Both failed
    throw new Error('AI service is temporarily unavailable. Please try again in a moment.');
  }

  // ── Status report for health endpoint ──
  getStatus() {
    return {
      aiStudio: {
        keys: this.aiStudioClients.length,
        healthy: this._isHealthy('aiStudio'),
        currentKeyIndex: this.currentKeyIndex,
      },
      vertex: {
        configured: !!this.vertexClient,
        project: VERTEX_PROJECT_ID || null,
        healthy: this._isHealthy('vertex'),
      },
      models: MODEL_CASCADE,
      currentModelIndex: this.currentModelIndex,
    };
  }
}

// ─────────────────────────────────────────────
// INITIALIZE ROUTER
// ─────────────────────────────────────────────
const router = new ProviderRouter();

// Top-level await in ESM — ensures model is ready before first request
await router.init();

// ─────────────────────────────────────────────
// SESSION STORE (in-memory)
// ─────────────────────────────────────────────
const sessionStore = new Map();
const SESSION_MAX_HISTORY = 20; // Keep last 20 messages (10 turns)

// ─────────────────────────────────────────────
// CONCURRENCY LIMITER
// ─────────────────────────────────────────────
const MAX_CONCURRENT = 8;
let activeRequests = 0;
const requestQueue = [];

function acquireSlot() {
  return new Promise((resolve) => {
    if (activeRequests < MAX_CONCURRENT) {
      activeRequests++;
      resolve();
    } else {
      requestQueue.push(resolve);
    }
  });
}

function releaseSlot() {
  if (requestQueue.length > 0) {
    const next = requestQueue.shift();
    next(); // activeRequests stays the same — one out, one in
  } else {
    activeRequests--;
  }
}

// ─────────────────────────────────────────────
// HEALTH CHECK ENDPOINT
// ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    providers: router.getStatus(),
    activeRequests,
    queuedRequests: requestQueue.length,
  });
});

// ─────────────────────────────────────────────
// AI CHAT ENDPOINT
// ─────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  let slotAcquired = false;
  try {
    const { prompt } = req.body;

    // Input validation
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Please enter a valid question.' });
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length > 4000) {
      return res.status(400).json({ error: 'Message too long. Please keep it under 4000 characters.' });
    }

    const sessionId = (req.headers['x-session-id'] || 'default-session').substring(0, 128);

    // Acquire concurrency slot
    await acquireSlot();
    slotAcquired = true;

    // Get or create session history
    let history = sessionStore.get(sessionId) || [];

    // Send to smart router (AI Studio → Vertex AI fallback)
    const text = await router.sendMessage(history, trimmedPrompt);

    // Update session history
    history.push({ role: 'user',  parts: [{ text: trimmedPrompt }] });
    history.push({ role: 'model', parts: [{ text }] });

    // Trim to max history window
    if (history.length > SESSION_MAX_HISTORY) {
      history = history.slice(history.length - SESSION_MAX_HISTORY);
    }
    sessionStore.set(sessionId, history);

    res.json({ response: text });

  } catch (error) {
    console.error('Chat endpoint error:', error.message);
    if (!res.headersSent) {
      // Sanitize error — don't leak internal details
      const isUserFacingError = error.message.includes('temporarily unavailable') ||
                                error.message.includes('too long') ||
                                error.message.includes('valid question');
      res.status(500).json({
        error: isUserFacingError
          ? error.message
          : 'AI service is temporarily unavailable. Please try again.',
      });
    }
  } finally {
    if (slotAcquired) releaseSlot();
  }
});

// ─────────────────────────────────────────────
// STATIC FILES + SPA FALLBACK
// ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
app.listen(port, () => {
  const { aiStudio, vertex } = router.getStatus();
  console.log(`\n🚀 ElectAI Server running on port ${port}`);
  console.log(`   AI Studio: ${aiStudio.keys} key(s) | Healthy: ${aiStudio.healthy}`);
  console.log(`   Vertex AI: ${vertex.configured ? `✅ ${vertex.project}` : '⬛ not configured'}`);
  console.log(`   Models: ${MODEL_CASCADE.join(' → ')}`);
  console.log(`   Health: http://localhost:${port}/api/health\n`);
});