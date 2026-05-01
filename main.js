import './style.css';
import { askJanMat } from './src/api/gemini.js';
import { logChatSession } from './src/api/firebase.js';

// Initialize the App
document.addEventListener('DOMContentLoaded', () => {
  console.log('JanMat AI Initialized');

  // Configure marked.js to open all links in new tabs safely
  if (window.marked) {
    const renderer = new window.marked.Renderer();
    renderer.link = (href, title, text) => {
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="ai-link" title="${title || href}">${text} ↗</a>`;
    };
    window.marked.use({ renderer });
  }

  const sendBtn = document.getElementById('send-msg');
  const input = document.getElementById('user-input');

  if (sendBtn) sendBtn.addEventListener('click', () => sendMessage());

  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Buttery smooth placeholder rotation with opacity fade
    const placeholders = [
      "e.g., How do I register as a first-time voter using Form 6?",
      "e.g., What is the difference between Lok Sabha & Vidhan Sabha?",
      "e.g., Who conducts Panchayat elections — ECI or State?",
      "e.g., I moved cities. How do I transfer my vote? (Form 8)",
      "e.g., How is the Prime Minister of Bharat elected?",
      "e.g., What is Special Intensive Revision (SIR) of electoral rolls?",
      "e.g., How can I find my polling booth on election day?",
      "e.g., What valid IDs can I use to vote at the booth?",
      "e.g., How is the President of Bharat elected?",
      "e.g., What is Form 7 and when do I use it?",
    ];
    let pIndex = 0;
    setInterval(() => {
      input.style.transition = 'opacity 0.5s ease';
      input.style.opacity = '0.25';
      setTimeout(() => {
        pIndex = (pIndex + 1) % placeholders.length;
        input.setAttribute('placeholder', placeholders[pIndex]);
        input.style.opacity = '1';
      }, 500);
    }, 4000);
  }

  // Location Toggle Logic
  const btnRural = document.getElementById('toggle-rural');
  const btnUrban = document.getElementById('toggle-urban');
  if (btnRural && btnUrban) {
    btnRural.addEventListener('click', () => updateLocationContext('rural'));
    btnUrban.addEventListener('click', () => updateLocationContext('urban'));
  }

  // Timeline Item Click logic
  document.querySelectorAll('.timeline-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.timeline-item').forEach(i => i.classList.remove('active'));
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
 * Parses structured AI response into thinking, answer, and references parts.
 */
function parseAIResponse(raw) {
  const thinkingMatch = raw.match(/\[THINKING\]([\s\S]*?)\[\/THINKING\]/);
  const answerMatch = raw.match(/\[ANSWER\]([\s\S]*?)\[\/ANSWER\]/);
  const referencesMatch = raw.match(/\[REFERENCES\]([\s\S]*?)\[\/REFERENCES\]/);
  return {
    thinking: thinkingMatch ? thinkingMatch[1].trim() : null,
    answer: answerMatch ? answerMatch[1].trim() : raw,
    references: referencesMatch ? referencesMatch[1].trim() : null,
  };
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

  // Skeleton Loader
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message ai skeleton-message fade-in';
  loadingDiv.innerHTML = `
    <div class="skeleton skeleton-text" style="width:65%;"></div>
    <div class="skeleton skeleton-text" style="width:80%;margin-top:8px;"></div>
    <div class="skeleton skeleton-text" style="width:50%;margin-top:8px;"></div>
  `;
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  const aiRaw = await askJanMat(text);
  chatMessages.removeChild(loadingDiv);

  // Parse structured sections
  const { thinking, answer, references } = parseAIResponse(aiRaw);
  const parsedAnswer = window.marked ? window.marked.parse(answer) : answer;
  const parsedRefs = references && window.marked ? window.marked.parse(references) : (references || '');

  const aiDiv = document.createElement('div');
  aiDiv.className = 'message ai fade-in markdown-body';

  let html = '';

  // 1. Thinking Toggle
  if (thinking) {
    const thinkId = `think-${Date.now()}`;
    html += `
      <div class="thinking-toggle" onclick="document.getElementById('${thinkId}').classList.toggle('open')">
        <span>🧠</span> Model Reasoning <span class="think-chevron">▾</span>
      </div>
      <div class="thinking-panel" id="${thinkId}">
        <p>${thinking}</p>
      </div>`;
  }

  // 2. Main Answer
  html += `<div class="ai-answer">${parsedAnswer}</div>`;

  // 3. Official Sources
  if (references) {
    html += `
      <div class="references-panel">
        <div class="ref-header">📚 Official Sources</div>
        <div class="ref-body">${parsedRefs}</div>
      </div>`;
  }

  aiDiv.innerHTML = html;

  // 4. Feedback Buttons
  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'feedback-group';
  feedbackDiv.innerHTML = `
    <button class="feedback-btn" onclick="handleFeedback('${text.replace(/'/g, "\\'")}', 'up')" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">👍</button>
    <button class="feedback-btn" onclick="handleFeedback('${text.replace(/'/g, "\\'")}', 'down')" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">👎</button>
  `;
  aiDiv.appendChild(feedbackDiv);

  chatMessages.appendChild(aiDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  logChatSession(text, answer);
}

/**
 * Called when a suggestion chip is clicked — auto-fills and sends the question
 */
window.askChip = (question) => {
  const input = document.getElementById('user-input');
  if (input) {
    input.value = question;
    sendMessage();
  }
};

/**
 * Handles user feedback
 */
window.handleFeedback = (query, type) => {
  console.log(`Feedback: ${type} for: ${query}`);
  alert("Namaste! Thank you for your feedback, Sir/Ma'am.");
};
