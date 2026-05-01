# 🗳️ JanMat AI (Bharat Election Guide)
### *Empowering the Indian Electorate through Intelligent Guidance.*

![Project Banner](https://img.shields.io/badge/Challenge-Election_Process_Education-blueviolet?style=for-the-badge)
![Target](https://img.shields.io/badge/Audience-Indian_Voters-orange?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Powered_By-Google_Gemini-blue?style=for-the-badge)

---

## 📖 Project Overview

### 📌 Chosen Vertical
**Challenge 2: Election Process Education.**
In India, the world's largest democracy, millions of potential voters are deterred by the perceived complexity of the election process. Critical information about **Form 6 (Registration)**, **BLO verification**, and **polling booth discovery** is scattered. We chose this vertical to transform this complex bureaucratic process into an **interactive, easy-to-follow educational experience**.

### 🧠 Approach and Logic
To secure a top standing and provide genuine value, our logic revolves around a **Context-Role-Constraint** framework powered by Google Gemini:
- **Role-Based Persona**: The AI acts as a "Senior Civic Consultant" programmed to provide *Layman Breakdowns* and avoid bureaucratic jargon.
- **Contextual Awareness**: The prompt logic dictates specific pathways for Form 6 vs. Form 8.
- **Strict Neutrality**: Built-in guardrails strictly prevent political bias or hallucinated officer names.
- **Formatting Logic**: The AI is instructed to output Markdown, which our frontend parses (`marked.js`) into beautiful HTML with rich visuals, satisfying the "easy-to-follow" requirement.

### ⚙️ How the Solution Works
We developed **JanMat AI** using a disciplined "brick-by-brick" implementation strategy with Antigravity:
- **Context-Aware Demographic Toggle**: A brilliant 'Rural vs. Urban' interactive switch that dynamically alters the timeline advice (e.g., Gram Panchayat vs. Ward Office) to account for India's diverse accessibility needs.
- **Premium UI/UX**: A high-end, glassmorphic design system built with Vanilla CSS ensures the platform feels modern and accessible.
- **Interactive ECI Timeline**: A visual, step-by-step roadmap of the **Election Commission of India (ECI)** process for interactive exploration.
- **Backend AI Engine**: A Node.js backend connects securely to **Google Gemini 1.5 Flash** (via Vertex AI). It intercepts user questions, injects our engineered system prompt, and returns structured educational guidance.
- **Strategic Deployment**: Leveraging **Google Cloud Run** for containerized deployment and **Firebase Studio** for real-time session logging.

### 🏆 Impact & Results
**JanMat AI** serves as a premium civic education platform that:
- **Demystifies Registration**: Breaks down complex forms into simple, visual steps.
- **Enhances Accessibility**: Provides a friendly AI companion (JanMat) who speaks the user's language.

---

## 🛠️ Mandatory Tool Usage (PromptWars Requirements)
This project explicitly leverages the following Google services:
- **AI Core**: [Google Gemini 1.5 Flash](https://aistudio.google.com/) via Vertex AI.
- **Compute**: [Google Cloud Run](https://cloud.google.com/run) (Containerized Deployment).
- **Storage/Auth**: [Firebase Studio](https://firebase.google.com/) (Session management).
- **Architect**: **Google Antigravity** (Used for code generation and auditing).

## 🤔 Any Assumptions Made
- **User Demographics**: Assumed target users are primarily English-speaking Indian citizens comfortable with mobile or desktop web browsing.
- **Firebase Configuration**: Assumed that the Firebase Studio environment is pre-configured with the necessary read/write rules for session logging.
- **API Availability**: Assumed that the Google Gemini API (Vertex AI) remains highly available and responds within acceptable latency limits for real-time interactions.

## 🗺️ Roadmap
- [x] **Phase 1**: Indian Localization & Strategic Branding
- [x] **Phase 2**: ECI Process Timeline & Premium UI
- [x] **Phase 3**: Vertex AI & Firebase Connection (Enhanced UI & Logging)
- [/] **Phase 4**: Cloud Run Deployment & Submission (Dockerfile Created)

---
*Built with ❤️ for PromptWars Virtual | #BuildwithAI #PromptWarsVirtual*