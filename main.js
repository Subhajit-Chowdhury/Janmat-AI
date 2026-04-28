import './style.css';
import { askJanMat } from './src/api/gemini.js';
import { logChatSession } from './src/api/firebase.js';

// Initialize the App
document.addEventListener('DOMContentLoaded', () => {
  console.log('JanMat AI Initialized');
  
  const startBtn = document.getElementById('start-journey');
  const askBtn = document.getElementById('ask-ai');
  const interactiveContent = document.getElementById('interactive-content');

  // Handle Journey Start
  startBtn.addEventListener('click', () => {
    renderTimeline();
  });

  // Handle AI Chat Start
  askBtn.addEventListener('click', () => {
    renderChatInterface();
  });
});

/**
 * Renders the Interactive Indian Election Timeline
 */
function renderTimeline() {
  const container = document.getElementById('interactive-content');
  container.innerHTML = `
    <h2 class="section-title">Your ECI Election Journey</h2>
    <div class="timeline" id="election-timeline">
      <div class="timeline-item active" data-step="1">
        <div class="step-num">1</div>
        <div class="step-content">
          <h3>Voter Registration (Form 6)</h3>
          <p>Register on the NVSP portal or Voter Helpline App. Ensure your name is in the Electoral Roll.</p>
          <div class="details" style="margin-top: 1rem; font-size: 0.85rem; color: var(--accent-primary);">
            ➜ Required: Age Proof, Address Proof, Photograph.<br>
            <span style="color: var(--text-secondary); opacity: 0.8;">Note: Use Form 6 for NEW voters only.</span>
          </div>
        </div>
      </div>
      <div class="timeline-item" data-step="2">
        <div class="step-num">2</div>
        <div class="step-content">
          <h3>Verify Details (BLO)</h3>
          <p>Booth Level Officers (BLO) will verify your details. Check your EPIC card status online.</p>
          <div class="details" style="margin-top: 1rem; font-size: 0.85rem; color: var(--accent-secondary);">
            ➜ BLO will visit your residence for verification.
          </div>
        </div>
      </div>
      <div class="timeline-item" data-step="3">
        <div class="step-num">3</div>
        <div class="step-content">
          <h3>Polling Day</h3>
          <p>Carry your EPIC card or approved ID. Visit your assigned booth and cast your vote!</p>
          <div class="details" style="margin-top: 1rem; font-size: 0.85rem; color: #10b981;">
            ➜ Use the "Know Your Polling Station" tool on NVSP.
          </div>
        </div>
      </div>
    </div>
  `;

  // Add click listeners to timeline items
  const items = document.querySelectorAll('.timeline-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

/**
 * Renders the AI Chat Interface
 */
function renderChatInterface() {
  const container = document.getElementById('interactive-content');
  container.innerHTML = `
    <h2 class="section-title">Ask JanMat AI</h2>
    <div class="chat-box">
      <div class="chat-messages" id="chat-messages">
        <div class="message ai">Namaste! I'm JanMat AI. How can I help you understand the Indian election process today?</div>
      </div>
      <div class="chat-input-group">
        <input type="text" id="user-input" placeholder="e.g., How do I apply for a new Voter ID?">
        <button id="send-msg">Send</button>
      </div>
    </div>
  `;

  const sendBtn = document.getElementById('send-msg');
  const input = document.getElementById('user-input');

  sendBtn.addEventListener('click', () => sendMessage());
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
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
  userDiv.className = 'message user';
  userDiv.textContent = text;
  chatMessages.appendChild(userDiv);

  input.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Add "Thinking..." indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message ai loading';
  loadingDiv.textContent = 'JanMat is thinking';
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Call Gemini AI
  const aiResponse = await askJanMat(text);
  
  // Remove loading and append real AI response
  chatMessages.removeChild(loadingDiv);
  const aiDiv = document.createElement('div');
  aiDiv.className = 'message ai';
  aiDiv.textContent = aiResponse;
  
  // Add Feedback Buttons
  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'feedback-group';
  feedbackDiv.innerHTML = `
    <button class="feedback-btn" onclick="handleFeedback('${text}', 'up')">👍</button>
    <button class="feedback-btn" onclick="handleFeedback('${text}', 'down')">👎</button>
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
  // You could log this to a separate collection in Firebase
  alert("Namaste! Thank you for your feedback.");
};
