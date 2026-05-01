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

  // Location Toggle Logic
  const btnRural = document.getElementById('toggle-rural');
  const btnUrban = document.getElementById('toggle-urban');
  
  if (btnRural && btnUrban) {
    btnRural.addEventListener('click', () => updateLocationContext('rural'));
    btnUrban.addEventListener('click', () => updateLocationContext('urban'));
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
 * Updates the timeline text based on Rural vs Urban selection
 */
function updateLocationContext(type) {
  const btnRural = document.getElementById('toggle-rural');
  const btnUrban = document.getElementById('toggle-urban');
  const h1 = document.getElementById('step-1-how');
  const h2 = document.getElementById('step-2-how');
  const h3 = document.getElementById('step-3-how');

  if (type === 'rural') {
    btnRural.classList.add('active');
    btnUrban.classList.remove('active');
    h1.innerHTML = '<strong>How:</strong> Apply online. For Rural areas, your local BLO will coordinate with the Gram Panchayat for verification.';
    h2.innerHTML = '<strong>How:</strong> The BLO visits your residence. In Rural areas, you can also consult your Pradhan\'s office for status.';
    h3.innerHTML = '<strong>How:</strong> Locate your booth and carry a valid ID. In Rural areas, check the local primary school or community hall.';
  } else {
    btnUrban.classList.add('active');
    btnRural.classList.remove('active');
    h1.innerHTML = '<strong>How:</strong> Apply online via ECI Portal. In Urban areas, verification is handled by Ward Offices or Municipal Centers.';
    h2.innerHTML = '<strong>How:</strong> BLO verification at your door. You can visit your local Ward Office for any queries or help.';
    h3.innerHTML = '<strong>How:</strong> Check your assigned polling station at a nearby Government School or Community Center.';
  }
}

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
  aiDiv.className = 'message ai fade-in markdown-body';
  
  // Parse Markdown using the marked library we just added
  const parsedHtml = window.marked ? window.marked.parse(aiResponse) : aiResponse;
  aiDiv.innerHTML = parsedHtml;
  
  // Add Feedback Buttons
  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'feedback-group';
  feedbackDiv.innerHTML = `
    <button class="feedback-btn" style="background:transparent; border:none; cursor:pointer; font-size:1.2rem; transition:transform 0.2s;" onclick="handleFeedback('${text.replace(/'/g, "\\'")}', 'up')" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">👍</button>
    <button class="feedback-btn" style="background:transparent; border:none; cursor:pointer; font-size:1.2rem; transition:transform 0.2s;" onclick="handleFeedback('${text.replace(/'/g, "\\'")}', 'down')" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">👎</button>
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
