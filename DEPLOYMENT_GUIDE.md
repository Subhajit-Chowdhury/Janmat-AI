# 🚀 JanMat AI: Setup & Deployment Guide (100% Free Tier)

Follow this step-by-step guide to get JanMat AI up and running on the cloud without spending a single penny.

---

## 🔑 Phase 1: Getting Your API Keys (Free)

We use **Google Gemini API** because it offers a very generous free tier for developers.

### 1. Google AI Studio (Gemini API)
1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Sign in with your Google Account.
3.  Click on **"Get API Key"** in the top left sidebar.
4.  Click **"Create API key in new project"**.
5.  **Copy the key** and save it somewhere safe. You will need this for your `.env` file.
    *   *Cost:* **Free** (up to 15 requests per minute, which is plenty for testing).

---

## 🛠️ Phase 2: Local Project Setup

Before deploying, ensure your local environment is configured.

1.  **Environment Variables**:
    *   Create a file named `.env` in the root folder of the project.
    *   Add your Gemini API Key:
        ```env
        GEMINI_API_KEY=your_copied_key_here
        ```
2.  **Install Dependencies**:
    *   Open your terminal in the project folder and run:
        ```bash
        npm install
        ```
3.  **Test Locally**:
    *   Run the project to make sure everything works:
        ```bash
        npm run dev
        ```
    *   Open `http://localhost:5173` in your browser.

---

## ☁️ Phase 3: Deploying to Google Cloud (Free)

We will use **Google Cloud Run**, which has a "Free Forever" tier for small projects.

### 1. Install Google Cloud SDK
1.  Download and install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install).
2.  Open your terminal and login:
    ```bash
    gcloud auth login
    ```

### 2. Create a Google Cloud Project
1.  Create a new project (replace `my-janmat-project` with a unique name):
    ```bash
    gcloud projects create my-janmat-project
    ```
2.  Set the project as active:
    ```bash
    gcloud config set project my-janmat-project
    ```

### 3. Enable Required Services
Run these commands to enable the services we need:
```bash
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 4. Build and Deploy
Run this single command from your project root to deploy:
```bash
gcloud run deploy janmat-ai --source . --region us-central1 --allow-unauthenticated --set-env-vars="GEMINI_API_KEY=your_api_key_here"
```
*   *Note:* Replace `your_api_key_here` with your actual key from Phase 1.
*   *Note:* Cloud Run will automatically detect the `Dockerfile` and build it.

---

## ✅ Phase 4: Final Checklist for Success

1.  **Verify UI**: Ensure the chat looks "Premium" and the Ashoka Chakra is rotating.
2.  **Test Languages**: Ask "Aadhar card kaise banaye?" (Hinglish) or "Voter ID apply steps" (English) to verify the AI's robustness.
3.  **Check Mobile**: Open the live URL on your phone; the chat should be fluid and easy to use.

---

### 💡 Pro-Tip for Top Position
To ensure 100% accuracy and avoid hallucinations, the AI is instructed to only use verified knowledge from the **Election Commission of India (ECI)**. If it's unsure, it will direct you to official websites. This builds trust with the user!
