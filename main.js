import './style.css';
import { askJanMat } from './src/api/gemini.js';
import { logChatSession } from './src/api/firebase.js';

// Initialize the App
document.addEventListener('DOMContentLoaded', () => {
  console.log('JanMat AI (Market Standard) Initialized');
  
  const sendBtn = document.getElementById('send-msg');
  const input = document.getElementById('user-input');

  if (sendBtn) {
    sendBtn.addEventListener('click', () => sendMessage());
  }
  
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  // Timeline Item Click logic
  const items = document.querySelectorAll('.timeline-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
});

/**
 * Handles sending a message in the chat
 */
async function sendMessage() {
  const input = document.getElementById('user-input');
  const chatMessages = document.getElementById('chat-messages');
  const text = input.value.trim();

  if (!text) return;

  // Append user message
  const userDiv = document.createElement('div');
  userDiv.className = 'message user fade-in';
  userDiv.textContent = text;
  chatMessages.appendChild(userDiv);

  input.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Add Skeleton Loader indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message ai skeleton-message fade-in';
  loadingDiv.innerHTML = `
    <div class="skeleton skeleton-text" style="width: 100px;"></div>
    <div class="skeleton skeleton-text" style="width: 200px;"></div>
  `;
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Call Vertex AI (via our server)
  const aiResponse = await askJanMat(text);
  
  // Remove loading and append real AI response
  chatMessages.removeChild(loadingDiv);
  const aiDiv = document.createElement('div');
  aiDiv.className = 'message ai fade-in';
  aiDiv.textContent = aiResponse;
  
  // Add Feedback Buttons
  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'feedback-group';
  feedbackDiv.innerHTML = `
    <button class="feedback-btn" onclick="handleFeedback('${text.replace(/'/g, "\\'")}', 'up')">👍</button>
    <button class="feedback-btn" onclick="handleFeedback('${text.replace(/'/g, "\\'")}', 'down')">👎</button>
  `;
  aiDiv.appendChild(feedbackDiv);
  
  chatMessages.appendChild(aiDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Log session to Firebase
  logChatSession(text, aiResponse);
}

/**
 * Handles user feedback on AI responses
 */
window.handleFeedback = (query, type) => {
  console.log(`Feedback received: ${type} for query: ${query}`);
  alert("Namaste! Thank you for your feedback.");
};
