# 🚀 JanMat AI Deployment & Activation Guide

### Phase 1: Wiping the Old Git History (Crucial for the <10MB Rule)
*Note: This phase resets your version history to reduce the repository size from 22MB to under 1MB. It does NOT delete your code.*
1. Delete the hidden git folder: `rm -r -force .git`
2. Initialize a fresh repository: `git init`
3. Add your clean files: `git add .`
4. Commit them: `git commit -m "Initial Commit - JanMat AI"`
5. Rename the branch to main: `git branch -M main`
6. Link your GitHub repo: `git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git`
7. Force push to clear the remote history: `git push -u origin main --force`

### Phase 2: Getting the Gemini API Key
1. Go to Google AI Studio at exactly: `https://aistudio.google.com/app/apikey`
2. Sign in with your Google account.
3. Click the "Create API key" button.
4. Select an existing Google Cloud project or create a new one.
5. Copy the generated API key.
6. Open the `.env` file in your `elect-ai` folder and paste it like this:
   `VITE_GEMINI_API_KEY=your_copied_api_key_here`

### Phase 3: Getting Firebase Studio Credentials
1. Go to the Firebase Console at exactly: `https://console.firebase.google.com/`
2. Click "Add project" and name it "JanMat AI". You can disable Google Analytics for this hackathon.
3. Once the project is created, click the web icon (it looks like `</>`) on the project overview page to "Add an app".
4. Register the app (Name it "JanMat Web").
5. You will see a `firebaseConfig` code block. Copy the values from it and paste them into your `.env` file:
   `VITE_FIREBASE_API_KEY=your_api_key`
   `VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain`
   `VITE_FIREBASE_PROJECT_ID=your_project_id`
   `VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket`
   `VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id`
   `VITE_FIREBASE_APP_ID=your_app_id`
6. Click "Continue to console".
7. In the left menu, click **Build** -> **Firestore Database**.
8. Click "Create database". Start in **Test Mode** (this allows the app to log chat sessions without complex authentication rules). Choose a region close to you (e.g., `asia-south1`).

### Phase 4: Local Testing
1. In your terminal, ensure you are in the `elect-ai` folder.
2. Install dependencies: `npm install`
3. Start the app: `npm run dev`
4. Open the local URL provided (usually `http://localhost:5173`).
5. Chat with JanMat AI. If it responds intelligently, your Gemini key is working. Check your Firestore Database console to see if the chat logs are appearing—if they are, Firebase is working!

### Phase 5: Official Cloud Run Deployment
1. Go to the Google Cloud Console at exactly: `https://console.cloud.google.com/`
2. Ensure you have an active Billing Account linked to your project.
3. Open the "Cloud Shell" (the small terminal icon in the top right corner of the top navigation bar).
4. Clone your clean, lightweight GitHub repo: 
   `git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git`
5. Navigate into the folder:
   `cd YOUR-REPO`
6. Recreate your `.env` file securely inside the Cloud Shell:
   `nano .env`
7. Paste all of your keys (Gemini and Firebase) exactly as they appear in your local `.env` file. Press `Ctrl+O` to save, `Enter` to confirm, and `Ctrl+X` to exit.
8. Run the final deployment command:
   `gcloud run deploy janmat-ai --source . --allow-unauthenticated`
9. Choose your region when prompted (e.g., `asia-south1`).
10. Once the build finishes, it will provide you with a public Service URL (e.g., `https://janmat-ai-xyz.a.run.app`).
