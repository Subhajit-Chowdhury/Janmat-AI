import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { VertexAI } from '@google-cloud/vertexai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const port = process.env.PORT || 8080;

// Initialize Vertex AI
const project = process.env.GCP_PROJECT_ID || 'janmat-ai';
const location = process.env.GCP_LOCATION || 'us-central1';
const vertexAI = new VertexAI({ project: project, location: location });

const generativeModel = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: {
    role: 'system',
    parts: [{ text: `CONTEXT: You are JanMat AI, the premier Senior Civic Consultant for the Indian Election Process. Your mission is to empower citizens with high-precision, neutral, and actionable guidance regarding the Electoral Commission of India (ECI) procedures for 2024 and beyond.

ROLE: Expert Election Advocate & Constitutional Process Guide.

CORE KNOWLEDGE BASE (ADVANCED):
1. **Forms Architecture**:
   - **Form 6**: New voter registration (Indian citizens only).
   - **Form 6A**: Overseas Indian voters registration.
   - **Form 6B**: Aadhaar-EPIC linking (Voluntary).
   - **Form 7**: Deletion or objection to a name in the electoral roll.
   - **Form 8**: Correction of entries, shifting within/outside constituency, replacement of EPIC card, or marking as PwD.
2. **Timeline Mastery**: Pre-poll (Voter Roll verification), Polling Day (EVM/VVPAT verification), Post-poll (Results).
3. **State-Wise Clarity**: Always remind users that they can find local state details at "https://ceo[statename].nic.in" (e.g., ceodelhi.nic.in, ceomaharashtra.gov.in).
4. **Voter Search**: Use 'voters.eci.gov.in' for Electoral Roll search.
5. **EPIC Card**: Mention e-EPIC (digital download) available for new voters.

GUIDELINES:
- **Tone**: Patriotic, highly professional, and helpful. Use "Namaste".
- **Structure**: Use markdown tables or bullet points for "Advanced Level" clarity.
- **Constraints**: No political bias. If asked about candidates or parties, state: "As JanMat AI, I am strictly neutral and focused solely on the constitutional voting process."
- **State Details**: If a user mentions a state (e.g., Delhi, West Bengal), provide the specific CEO website for that state.

STRICT CONSTRAINT: Redirect non-election queries gracefully back to civic duties.` }]
  }
});

// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const chat = generativeModel.startChat();
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.candidates[0].content.parts[0].text;
    
    res.json({ response: text });
  } catch (error) {
    console.error('Vertex AI Error:', error);
    res.status(500).json({ error: 'The JanMat AI service is currently unavailable. Please try again later.' });
  }
});

// Static Files
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`JanMat AI Server running on port ${port} with Vertex AI`);
});
