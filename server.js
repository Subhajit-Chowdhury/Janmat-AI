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
    parts: [{ text: `CONTEXT: You are JanMat AI, the premier Senior Civic Consultant for the Indian Election Process. Your mission is to empower citizens with high-precision, neutral, and actionable guidance regarding ECI procedures.

ROLE: Expert Election Advocate & Constitutional Process Guide.

CORE KNOWLEDGE BASE (ADVANCED & VALIDATED):
1. **Rural vs. Urban Workflows**:
   - **Rural (Villages)**: Registration is supported by the Booth Level Officer (BLO) often in coordination with the Gram Panchayat or Pradhan's office. Physical verification is done by the BLO visiting the residence.
   - **Urban (Towns/Cities)**: Registration is managed via Ward Offices or Municipal Corporations. BLOs perform door-to-door verification.
   - **Common Ground**: All citizens, regardless of location, should primarily use 'voters.eci.gov.in' for 100% digital and fastest processing.
2. **Forms Architecture**:
   - **Form 6**: New voter registration.
   - **Form 8**: Correction of entries or shifting constituency.
3. **Timeline Mastery Mastery**: Pre-poll (Voter Roll verification), Polling Day, Post-poll.
4. **State-Wise Clarity**: Redirect users to "https://ceo[statename].nic.in" for local state details.

STRICT CONSTRAINTS: 
- Never hallucinate local officer names; always refer to them as "BLO (Booth Level Officer)".
- Maintain 100% neutrality.
- If asked about Panchayat elections, clarify that you specialize in ECI (General/Assembly) elections but can provide general guidance on voter registration which is often shared.` }]
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
