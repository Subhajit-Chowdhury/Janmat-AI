# 🗳️ JanMat AI: Complete Setup & Deployment Guide

This guide will take you from a blank screen to a live, AI-powered election guide hosted on Google Cloud. We will do this in two major parts: **API Setup** and **Google Cloud Deployment**.

---

## 🏗️ Part 1: Setting up your API Keys (The "Brain")
*Follow these steps to make JanMat AI functional.*

### 1. Google Gemini API Key (FREE)
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **"Get API key"** on the left.
3. Click **"Create API key in new project"**.
4. Copy the key.
5. Open your project folder, find the `.env` file, and paste it:
   `VITE_GEMINI_API_KEY=your_key_here`

### 2. Firebase Configuration (FREE)
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** ➔ Name it `Janmat-AI`.
3. Click the **Web icon (`</>`)** ➔ Register app as `Janmat-Web`.
4. Copy the values from the `firebaseConfig` object into your `.env` file:
   - `apiKey` ➔ `VITE_FIREBASE_API_KEY`
   - `authDomain` ➔ `VITE_FIREBASE_AUTH_DOMAIN`
   - ...and so on for all 6 variables.

---

## 🚀 Part 2: Deploying to Google Cloud (Cloud Run)
*This makes your app live on the internet for everyone to see.*

### 1. Prepare your Google Cloud Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. If you are new, sign up for the **$300 Free Trial**.
3. Create a **New Project** at the top and name it `Janmat-AI`.

### 2. Enable Necessary Services
1. In the search bar at the top, search for **"Cloud Run"** and click **"Enable"**.
2. Search for **"Cloud Build"** and click **"Enable"**.

### 3. The "One-Command" Deployment
We will use **Cloud Shell** (a free terminal inside your browser) to deploy.

1. Click the **Activate Cloud Shell** button (terminal icon `>_`) in the top right corner of the Google Cloud Console.
2. Upload your project folder to Cloud Shell (or if you have it on GitHub, use `git clone`).
3. **CRITICAL**: Make sure your `.env` file is inside the folder with your keys.
4. Run this command in the Cloud Shell terminal:
   ```bash
   gcloud run deploy janmat-ai --source . --region us-central1 --allow-unauthenticated
   ```
5. **What happens next?**
   - It will ask to create an Artifact Registry repository. Type `y` (Yes).
   - It will build your app and deploy it. This takes about 2-3 minutes.

### 4. Your Live Link
Once finished, you will see a message: 
`Service [janmat-ai] has been deployed and is serving at: https://janmat-ai-xyz.a.run.app`

**Congratulations! Your JanMat AI is now live!** 🎉

---

## 💡 Important Tips for "Top 3" Ranking
- **Cost Control**: Cloud Run only charges when someone visits your site. For testing, it will stay within the **Free Tier**.
- **Security**: Never commit your `.env` file to a public GitHub repository. For Cloud Run, the `.env` is baked into the build safely.
- **Support**: If the build fails, check that your `Dockerfile` and `package.json` are in the root directory.

---
*Built with ❤️ for PromptWars Virtual*
