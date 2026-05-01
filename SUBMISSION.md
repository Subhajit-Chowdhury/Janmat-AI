# 🗳️ JanMat AI - Ultimate Submission Package

## 🏁 1. Tool Usage Enforcement (Explicit Documentation)
This project strictly follows the "Google Services Only" mandate for PromptWars Virtual.

### Which tools were used & Why they were selected:
| Mandatory Tool | Why it was selected for JanMat AI |
| :--- | :--- |
| **Google Antigravity** | Selected as the Lead Architect for code generation, auditing, and "brick-by-brick" building to ensure 100% rule compliance and high-speed iteration. |
| **Google Cloud Run** | Chosen to provide a scalable, Industry-Standard production hosting environment via Docker containers. |
| **Gemini 1.5 Flash (via Vertex AI)** | Selected as the core LLM engine because it provides high-speed, intelligent, and highly accurate election guidance required for real-time chat. |
| **Firebase Studio** | Selected for database management to enable real-time session logging and civic feedback analytics. |

### How prompts evolved:
We followed an iterative evolution strategy to achieve "Top 1" accuracy:
- **v1 (Basic)**: Simple chatbot with basic election knowledge. (Too vague, sometimes hallucinated).
- **v2 (Role-Based)**: Added "Senior Civic Consultant" persona and Form numbers (6, 7, 8). Improved structure.
- **v3 (Production Ready)**: Integrated specific "Rural vs Urban" context rules, 100% strict neutrality guardrails, and Markdown formatting commands to ensure the response was "easy-to-follow".

### What GenAI handled vs What humans designed:
- **Human-Designed**: Strategic branding (JanMat), the "National Saffron/Green" color palette, the 3-step Journey logic, the Rural/Urban accessibility toggle, and the core Prompt Engineering rules.
- **GenAI-Handled**: Dynamic content generation logic, CSS transition refinements, markdown parsing integration (`marked.js`), and writing the boilerplate Node.js/Express server structure.

---

## 🏗️ 2. Validation Mechanisms
We ensured genuine adoption and learning through the following mechanisms:

### Architecture and Prompt Flow Description
1. **Frontend Request**: User interacts with the Vanilla JS UI and sends a query.
2. **Backend Interception**: The Node.js Express server (`server.js`) intercepts the query.
3. **Prompt Injection**: The server prepends our strictly engineered `systemInstruction` (Context-Role-Constraint framework) to the user's query.
4. **Vertex AI Processing**: Gemini 1.5 Flash processes the prompt and returns a strictly formatted markdown response.
5. **Frontend Parsing**: The UI receives the markdown and uses `marked.js` to render it into a beautifully formatted, easy-to-read glassmorphic chat bubble.

### Tool Usage Explanation in LinkedIn Post
> **Transforming Civic Education with JanMat AI & Google Cloud**
> 
> Proud to submit **JanMat AI** for the #PromptWars Virtual Challenge! 🗳️
>
> We built a premium, glassmorphic guide for the Indian Election Process using:
> 🚀 **Google Gemini 1.5 Flash** for intelligent, neutral guidance.
> ☁️ **Cloud Run** for scalable containerized deployment.
> 🔥 **Firebase Studio** for real-time session analytics.
> 🛠️ **Google Antigravity** for high-precision "brick-by-brick" development.
>
> #BuildWithAI #GoogleCloud #PromptWarsVirtual #CivicTech #IndiaElections

---

## 🏆 3. Problem Statement Alignment
- **Chosen Vertical**: Indian Election Process Education.
- **Solution**: A premium, interactive portal that simplifies the bureaucratic process into a visual timeline and an intelligent AI companion.
- **Accessibility Focus**: Implemented a dynamic Rural vs. Urban toggle that adapts the timeline steps to cater to India's diverse demographic needs, explicitly solving for "easy-to-follow" instructions for everyone.

---

## 🤔 4. Assumptions Made
- Users have basic internet access and a modern browser.
- Users are primarily seeking information about the Indian General/Assembly election processes.
- The ECI website URLs follow the `ceo[statename].nic.in` standard pattern.
