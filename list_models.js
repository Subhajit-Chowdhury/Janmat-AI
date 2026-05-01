import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("No API key found in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log("Available models:");
    data.models.forEach(m => console.log(m.name));
  } catch(e) {
    console.error("Error fetching models", e);
  }
}

run();
