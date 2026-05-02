# 🏛️ ElectAI Architecture Overview

ElectAI is a premium, full-stack AI application designed to provide verified, real-time information about the Indian Election process. This document outlines the architectural decisions and tool usage that make it a "Top Tier" submission.

---

## 🏗️ System Components

### 1. **Core Brain: Google Gemini 2.0 Flash (via Vertex AI)**
- **Why**: We chose Gemini 2.0 Flash for its incredible speed, native multilinguality, and advanced reasoning capabilities.
- **Grounding**: Unlike standard chatbots, ElectAI is **Grounded by Google Search**. It performs real-time search queries to verify facts against the latest Election Commission of India (ECI) announcements before responding.
- **Platform**: Hosted on **Vertex AI** (Google Cloud Platform) for enterprise-grade reliability and low-latency inference.

### 2. **Memory & Analytics: Firebase Studio (Firestore)**
- **Persistent Storage**: Every chat session is logged to **Cloud Firestore** in real-time. This allows for session continuity and future analytics.
- **Logic**: Implemented in `src/api/firebase.js` to automatically create collections and documents on the fly.

### 3. **Infrastructure: Cloud Run**
- **Containerization**: The entire application is containerized using **Docker** for consistent behavior across development and production.
- **Serverless**: Deployed on **Google Cloud Run** to handle scale automatically while maintaining zero cost during idle periods (Free Tier optimization).

### 4. **UI/UX: Modern Web Stack**
- **Vanilla JS + Vite**: We prioritized performance by using a lightning-fast Vite build system and native JavaScript for minimal overhead.
- **Glassmorphism Design**: A premium, "Google Gemini" inspired UI that feels alive with micro-animations and a responsive layout.
- **Accessibility**: High-contrast ratios, ARIA labels, and keyboard-friendly navigation.

---

## 🔄 Data Flow

1. **User Input**: A user asks a question (via text or voice) in any Indian language.
2. **Backend Processing**: The Express.js server on Cloud Run receives the request.
3. **AI Generation (with Grounding)**: 
   - Vertex AI receives the prompt.
   - It triggers a Google Search if needed to verify facts.
   - It mirrors the user's language based on our **Language-Mirroring Prompt Engineering**.
4. **Persistent Logging**: The query and response are simultaneously saved to **Firestore**.
5. **Grounded Response**: The user receives a formatted, verified answer with official ECI references.

---

## 🛠️ Tool Usage Summary (Submission Essentials)

| Tool | Usage | Purpose |
| :--- | :--- | :--- |
| **Anti-Gravity** | Primary Development Partner | Code architecture, debugging, and audit. |
| **Cloud Run** | Production Hosting | Global availability and scalability. |
| **Gemini 2.0** | Core LLM | NLP, Language Mirroring, and Reasoning. |
| **Vertex AI** | AI Management | Enterprise API access and Grounding tools. |
| **Firebase** | Backend Database | Real-time logging and session management. |
