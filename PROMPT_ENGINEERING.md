# 🧠 ElectAI: Prompt Engineering & AI Logic

To achieve a "Top Tier" score in the PromptWars challenge, we didn't just write a simple system prompt. We engineered a robust, anti-hallucination, and multilingual-first logic.

---

## 🚀 The "Mirroring" Strategy (Language First)

One of our key goals was to make the AI feel natural to every Indian citizen, regardless of their language.

### How it works:
- **Zero-Default Latency**: The AI is instructed to NEVER default to a single language. 
- **Dynamic Detection**: It identifies the user's script (Devanagari, Tamil, Roman, etc.) and style (Hinglish, Banglish) instantly.
- **Mirroring**: It responds in the **EXACT same linguistic style**. If you ask in Hinglish, it answers in Hinglish. This builds instant rapport and accessibility.

---

## 🛡️ Anti-Hallucination & Grounding

AI Hallucinations are a major risk for election chatbots. We solved this using a multi-layer approach:

### 1. **Verified Knowledge Base**
We injected a hard-coded "Verified Knowledge Base" into the system prompt. This contains the core facts from the ECI (Forms, Eligibility, Portals).

### 2. **Vertex AI Grounding (Google Search)**
For real-time queries (e.g., "When are the 2025 SIR dates for Delhi?"), the AI is enabled with **Google Search Grounding**. It searches the live web, extracts the latest official info, and cites its sources.

### 3. **The "Uncertainty" Protocol**
If the AI cannot verify a fact, it is strictly forbidden from guessing. It must respond with:
> "For 100% accurate information, please visit the official ECI portal at [voters.eci.gov.in](https://voters.eci.gov.in)."

---

## 📝 Prompt Evolution

- **Initial State**: A basic chat prompt.
- **Problem**: Defaulted to Hindi too often; hallucinated on specific dates.
- **Iteration 1**: Added strict "Language Mirroring" rules.
- **Iteration 2**: Integrated the "Verified Knowledge Base" section.
- **Final Version**: Enabled Vertex AI Grounding and added a specific `[THINKING]` block for model transparency.

---

## 📊 Human-Designed vs. AI-Generated

| Feature | Human Designed | AI Managed |
| :--- | :--- | :--- |
| **Logic Flow** | Verification checks, Reference links. | Natural language synthesis. |
| **Identity** | Calm, humble, "JanMat" persona. | Tone consistency and nuance. |
| **Grounding** | Integration of Search tools. | Selection of relevant search queries. |
| **Formatting** | Markdown structure, Bullet points. | Complex layout generation. |
