# JanMat AI (जनमत AI) 🇮🇳
### Your Premium Guide to Indian Elections

**JanMat AI** is a state-of-the-art, multi-lingual AI assistant designed to democratize election literacy in India. Built for the **PromptWars Challenge (Vertical 2: Election Process Education)**, it simplifies complex voter registration processes, polling booth navigation, and electoral rules into an interactive, human-centric experience.

---

## 🎯 Chosen Vertical
**Vertical 2: Election Process Education**
JanMat AI focuses on transforming the bureaucratic complexity of the Indian electoral system into a conversational journey. It addresses the diverse linguistic landscape of India, ensuring that every citizen—regardless of their primary language or digital literacy—can understand their rights and the voting process.

---

## 🚀 Key Features & Google Services Integration

### 1. 🧠 Intelligent Conversational Core (Gemini 1.5 Flash)
- **Context-Aware Responses**: Uses advanced system prompting to maintain a helpful, "Sir/Ma'am" humble persona.
- **Language Mirroring**: Automatically detects and mirrors the user's language (English, Hindi, Hinglish, Bengali, Tamil, etc.), supporting 22 official Indian languages.
- **Dynamic Reasoning**: Provides real-time answers about Form 6, EPIC verification, and polling protocols.

### 2. 🔊 Accessible Voice Experience (Web Speech API)
- **Natural Voice Input**: Reliable one-click voice recording for hands-free queries.
- **Neural TTS**: High-quality, language-specific Text-to-Speech with Play/Pause/Stop controls, utilizing Google's neural voice engines for natural pronunciation.

### 3. 🗺️ Interactive Voter Journey
- **Visual Timelines**: A step-by-step interactive guide through registration, verification, and voting.
- **Location-Sensitive Context**: Switches between Rural and Urban workflows to provide accurate local instructions (e.g., BLO verification vs. Ward Office protocols).

### 4. 📊 Data Persistence (Firebase Studio)
- **Session Tracking**: Securely logs chat sessions for long-term history and analytics.
- **Scalable Real-time Storage**: Handles multiple simultaneous conversations without state loss.

### 5. ☁️ Production Deployment (Google Cloud Run)
- **Scalable Architecture**: Deployed as a containerized service on Cloud Run for high availability and low-latency performance during peak election cycles.

---

## 🛠️ Technical Architecture

### **The Stack**
- **Frontend**: Vanilla JavaScript + Vite + CSS3 (Glassmorphism & Magic Glow aesthetics).
- **Backend**: Node.js + Express (Server-side proxy for API security).
- **AI Engine**: Google Gemini 1.5 Flash API.
- **Database**: Firebase Firestore (for session logging).
- **Styling**: Premium custom CSS with tricolor "JanMat" theme.

### **Approach & Logic**
1. **Security-First**: API keys are strictly managed via environment variables and a server-side proxy to prevent client-side exposure.
2. **Inclusive Design**: Prioritized accessibility through ARIA labels, high-contrast themes, and multi-language support.
3. **Logic Flow**: The system uses a "Decision-Tree to AI" hybrid model. Fixed journey steps provide structure, while the AI assistant handles unstructured, complex queries.

---

## 📝 Tool Usage & Evolution
- **Tools Used & Why Selected**:
    - **Anti-Gravity**: Used as the primary AI pair-programming agent for rapid prototyping, end-to-end auditing, debugging API quota issues, and structuring the deployment architecture.
    - **Gemini 1.5 Flash**: Selected for its superior reasoning in Indian cultural contexts, low latency, and its efficiency in handling multi-lingual code-switching (Hinglish/Banglish).
    - **Firebase Studio**: Chosen for seamless session logging and real-time database capabilities.
    - **Google Cloud Run**: Selected for scalable, containerized production deployment.
- **Prompt Evolution**: Started with simple task-based prompts. Evolved into a detailed **System Instruction** model that strictly enforces language mirroring and a specific "Humble Guide" persona.
- **GenAI vs. Human Design**:
    - **GenAI**: Handled the complex natural language understanding, reasoning for election queries, and dynamic suggestion generation.
    - **Human Design**: Crafted the tricolor UI aesthetic, the interactive timeline component, the location-switching logic, and the security architecture.

---

## 📦 Submission Checklist Compliance
- [x] **Vertical**: Election Process Education (Vertical 2)
- [x] **Repository**: Public GitHub Repo with a single branch.
- [x] **Size**: < 10MB (optimized assets, ignored node_modules).
- [x] **Security**: No hardcoded keys; server-side proxy implemented.
- [x] **Google Services**: Meaningful integration of Gemini, Cloud Run, and Firebase.

---

## 🚀 Getting Started
1. Clone the repository.
2. Run `npm install`.
3. Set up your `.env` with `GEMINI_API_KEY` and Firebase credentials.
4. Start the dev server: `npm run dev`.

---
*Developed for the PromptWars Challenge 2026. Empowering every vote through AI.*