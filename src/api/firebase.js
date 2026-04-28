import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Logs a chat session for analytics and feedback
 */
export async function logChatSession(userQuery, aiResponse) {
  try {
    if (!firebaseConfig.apiKey) {
      console.log("Firebase not configured. Skipping session logging.");
      return;
    }
    
    await addDoc(collection(db, "chat_sessions"), {
      query: userQuery,
      response: aiResponse,
      timestamp: serverTimestamp(),
      platform: "JanMat AI - Web"
    });
  } catch (error) {
    console.error("Firebase Logging Error:", error);
  }
}
