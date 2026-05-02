import './style.css';
import { askJanMat } from './src/api/gemini.js';
import { logChatSession } from './src/api/firebase.js';

// ── Contextual Follow-Up Chips Map ──
const FOLLOW_UP_MAP = [
  {
    keywords: ['lok sabha', 'lower house', 'parliament', 'member of parliament', 'general election', 'who becomes pm', 'central government'],
    chips: [
      { icon: '👑', label: 'Who becomes PM?', sub: 'After results', q: 'How does a Prime Minister get selected after Lok Sabha results?' },
      { icon: '🗳️', label: 'How to vote for MP?', sub: 'Your Lok Sabha vote', q: 'How do I vote for my Member of Parliament (MP) in Lok Sabha elections?' },
      { icon: '📍', label: 'Find my constituency', sub: 'Lok Sabha seat', q: 'How do I find which Lok Sabha constituency I belong to?' },
      { icon: '⚖️', label: 'What is Rajya Sabha?', sub: 'Upper House', q: 'What is Rajya Sabha and how is it different from Lok Sabha?' },
    ]
  },
  {
    keywords: ['rajya sabha', 'upper house', 'council of states', 'indirect election', 'mla vote rajya'],
    chips: [
      { icon: '🏛️', label: 'Lok Sabha vs Rajya Sabha', sub: 'Key differences', q: 'What is the main difference between Lok Sabha and Rajya Sabha?' },
      { icon: '👤', label: 'Who elects Rajya Sabha?', sub: 'MLAs vote here', q: 'Who votes to elect Rajya Sabha members — citizens or MLAs?' },
      { icon: '🗺️', label: 'What is Vidhan Sabha?', sub: 'State Assembly', q: 'What is Vidhan Sabha and how does a Chief Minister get elected?' },
      { icon: '📅', label: 'How often is Rajya Sabha elected?', sub: 'Tenure & rotation', q: 'What is the term of a Rajya Sabha member and how often are elections held?' },
    ]
  },
  {
    keywords: ['vidhan sabha', 'state assembly', 'mla', 'chief minister', 'cm', 'state election', 'state government'],
    chips: [
      { icon: '👑', label: 'Who becomes CM?', sub: 'State election result', q: 'How does a Chief Minister get elected after Vidhan Sabha results?' },
      { icon: '🗳️', label: 'How to vote for MLA?', sub: 'Your state vote', q: 'How do I cast my vote for MLA in Vidhan Sabha elections?' },
      { icon: '🏠', label: 'Panchayat elections', sub: 'Village / Local level', q: 'How do Panchayat elections work and who conducts them?' },
      { icon: '🏛️', label: 'PM vs CM — difference?', sub: 'Central vs State', q: 'What is the difference between Prime Minister and Chief Minister in India?' },
    ]
  },
  {
    keywords: ['voter id', 'voter card', 'epic card', 'first time voter', 'new voter', 'register to vote', 'how to register', 'get voter id'],
    chips: [
      { icon: '📋', label: 'Documents I need', sub: 'For Form 6', q: 'What documents do I need to apply for a Voter ID card?' },
      { icon: '💻', label: 'Apply online — steps', sub: 'voters.eci.gov.in', q: 'How do I apply for a Voter ID online step by step?' },
      { icon: '🏠', label: 'BLO home visit', sub: 'What happens next?', q: 'After submitting Form 6, will a BLO visit my home? What should I expect?' },
      { icon: '📲', label: 'Download e-EPIC', sub: 'Digital voter card', q: 'How do I download my e-EPIC digital Voter ID after registration?' },
    ]
  },
  {
    keywords: ['form 6', 'form6', 'new registration', 'enroll', 'enrollment'],
    chips: [
      { icon: '🌐', label: 'Apply on portal', sub: 'voters.eci.gov.in', q: 'How do I fill and submit Form 6 on the voters.eci.gov.in portal?' },
      { icon: '📄', label: 'Offline Form 6', sub: 'No internet? No problem', q: 'How do I apply for Form 6 offline without internet?' },
      { icon: '🪪', label: 'Documents needed', sub: 'Age + Address Proof', q: 'What are the documents needed for Form 6 voter registration?' },
      { icon: '⏳', label: 'How long does it take?', sub: 'Processing time', q: 'How long does voter registration (Form 6) take to process?' },
    ]
  },
  {
    keywords: ['form 8', 'address change', 'name change', 'correction', 'update details', 'shift', 'moved', 'transfer vote', 'new city', 'new address'],
    chips: [
      { icon: '🏠', label: 'Moved to new city?', sub: 'Transfer your vote', q: 'I moved to a new city. How do I transfer my voter registration using Form 8?' },
      { icon: '✏️', label: 'Correct name/address', sub: 'Fix details', q: 'How do I correct my name or address on my Voter ID using Form 8?' },
      { icon: '📸', label: 'Update photo', sub: 'Replace old photo', q: 'How do I update or replace my photo on my Voter ID card?' },
      { icon: '🔄', label: 'Replace EPIC card', sub: 'Lost or damaged', q: 'My Voter ID card is lost or damaged. How do I get a new one?' },
    ]
  },
  {
    keywords: ['form 7', 'delete', 'deletion', 'objection', 'remove name', 'someone else'],
    chips: [
      { icon: '🔍', label: 'Check if your name exists', sub: 'Electoral roll search', q: 'How do I check if my name is in the electoral roll?' },
      { icon: '📋', label: 'Add name via Form 6', sub: 'If missing from roll', q: 'My name is missing from the voter list. How do I add it using Form 6?' },
      { icon: '📝', label: 'File claim or objection', sub: 'Correction in roll', q: 'How do I file a claim or objection to fix an error in the electoral roll?' },
    ]
  },
  {
    keywords: ['panchayat', 'gram sabha', 'sarpanch', 'gram panchayat', 'zila parishad', 'block panchayat', 'village election', 'rural election'],
    chips: [
      { icon: '🏛️', label: 'ECI or State — who runs it?', sub: 'Important difference', q: 'Who conducts Panchayat elections — ECI or the State Election Commission?' },
      { icon: '🗳️', label: 'How to vote in Panchayat?', sub: 'Your local vote', q: 'How do I vote in Gram Panchayat elections in my village?' },
      { icon: '🗺️', label: 'Panchayat vs Vidhan Sabha', sub: 'What is different?', q: 'What is the difference between Panchayat elections and Vidhan Sabha elections?' },
      { icon: '👤', label: 'Who is Sarpanch?', sub: 'Village head role', q: 'What is the role of a Sarpanch and how is he/she elected?' },
    ]
  },
  {
    keywords: ['polling booth', 'election day', 'how to vote', 'cast vote', 'evm', 'voting machine', 'booth number'],
    chips: [
      { icon: '📍', label: 'Find my polling booth', sub: 'Before election day', q: 'How do I find my polling booth and polling station before election day?' },
      { icon: '🪪', label: 'Which ID to carry?', sub: 'Valid documents at booth', q: 'What valid ID can I use instead of Voter ID at the polling booth?' },
      { icon: '⏰', label: 'Booth timings?', sub: 'When to go vote', q: 'What are the official voting timings at polling booths on election day in India?' },
      { icon: '🖥️', label: 'How does EVM work?', sub: 'Electronic voting', q: 'How does the Electronic Voting Machine (EVM) work on election day?' },
    ]
  },
  {
    keywords: ['president', 'vice president', 'rashtrapati', 'electoral college', 'president election'],
    chips: [
      { icon: '🏛️', label: 'Who votes for President?', sub: 'MPs + MLAs only', q: 'Who votes to elect the President of India — citizens or MPs and MLAs?' },
      { icon: '⚖️', label: 'VP election — how?', sub: 'Vice President', q: 'How is the Vice President of Bharat elected?' },
      { icon: '👑', label: 'PM vs President', sub: 'Who has more power?', q: 'What is the difference between the Prime Minister and the President of India?' },
    ]
  },
  {
    keywords: ['sir 2025', 'ssr', 'special intensive', 'special summary', 'electoral roll', 'voter list', 'blo visit', 'enumeration'],
    chips: [
      { icon: '🔍', label: 'Check your name in roll', sub: 'voters.eci.gov.in', q: 'How do I check if my name is in the electoral roll online?' },
      { icon: '🏠', label: 'BLO visit — what to keep ready?', sub: 'During SIR/SSR', q: 'What should I keep ready when the BLO visits my home during SIR/SSR?' },
      { icon: '📝', label: 'File a claim or objection', sub: 'If details are wrong', q: 'How do I file a claim or objection if my name or details are wrong in the voter list?' },
      { icon: '📋', label: 'Delhi SIR 2025 info', sub: 'ceodelhi.gov.in', q: 'Where can I find official information about Delhi SIR 2025 voter roll revision?' },
    ]
  },
  {
    keywords: ['prime minister', 'pm', 'how is pm elected', 'who is pm'],
    chips: [
      { icon: '🏛️', label: 'Lok Sabha explained', sub: 'Lower House', q: 'What is Lok Sabha and how does it lead to the Prime Minister?' },
      { icon: '🗳️', label: 'My vote for MP?', sub: 'How it works', q: 'How does my vote for MP connect to who becomes Prime Minister?' },
      { icon: '🗺️', label: 'CM vs PM — difference', sub: 'State vs Central', q: 'What is the difference between Chief Minister and Prime Minister in India?' },
    ]
  },
  {
    keywords: ['eci', 'election commission', 'chief election commissioner', 'official portal', 'voters.eci', 'nvsp'],
    chips: [
      { icon: '🌐', label: 'What is voters.eci.gov.in?', sub: 'Official portal guide', q: 'What services can I access on the voters.eci.gov.in portal?' },
      { icon: '👤', label: 'Who is the CEC?', sub: 'Top election official', q: 'Who is the current Chief Election Commissioner of Bharat?' },
      { icon: '📋', label: 'Apply for voter services', sub: 'Forms & more', q: 'Which voter services and forms can I access online through the ECI portal?' },
    ]
  },
  {
    keywords: ['age', '18 years', 'eligible', 'eligibility', 'can i vote', 'am i eligible', 'qualify'],
    chips: [
      { icon: '📋', label: 'Register now (Form 6)', sub: 'If you are 18+', q: 'I am 18 years old. How do I register as a voter using Form 6?' },
      { icon: '📅', label: 'Qualifying date rule', sub: 'January 1st rule', q: 'What is the qualifying date for voter registration eligibility in India?' },
      { icon: '🪪', label: 'Age proof documents', sub: 'What to submit', q: 'What documents are accepted as age proof for voter registration in India?' },
    ]
  },
  {
    keywords: ['e-epic', 'digital voter id', 'download voter', 'digital card', 'phone voter id'],
    chips: [
      { icon: '💻', label: 'Download e-EPIC steps', sub: 'Step by step guide', q: 'How do I download my e-EPIC digital Voter ID from voters.eci.gov.in?' },
      { icon: '📱', label: 'Is digital EPIC valid?', sub: 'At polling booth', q: 'Can I use a digital e-EPIC on my phone instead of a physical voter card at the booth?' },
      { icon: '🔄', label: 'Lost physical card?', sub: 'Get replacement', q: 'I lost my physical Voter ID. How do I get a replacement?' },
    ]
  },
  {
    keywords: ['documents', 'proof', 'aadhaar', 'passport', 'ration card', 'id proof', 'address proof'],
    chips: [
      { icon: '📋', label: 'Form 6 documents', sub: 'New registration', q: 'What documents do I need to apply for Form 6 voter registration?' },
      { icon: '📋', label: 'Form 8 documents', sub: 'Correction/transfer', q: 'What documents do I need to submit with Form 8?' },
      { icon: '🗳️', label: 'Documents at booth', sub: 'Election day IDs', q: 'What ID documents can I use to vote at the polling booth?' },
    ]
  },
  {
    keywords: ['municipal', 'corporation', 'ward', 'urban local body', 'mayor', 'city election'],
    chips: [
      { icon: '🏙️', label: 'Who runs city elections?', sub: 'State SEC — not ECI', q: 'Who conducts Municipal Corporation and ward elections — ECI or the State?' },
      { icon: '🗺️', label: 'Panchayat vs Municipal', sub: 'Rural vs Urban local', q: 'What is the difference between Panchayat elections and Municipal Corporation elections?' },
      { icon: '🗳️', label: 'Vote in ward election', sub: 'How to vote locally', q: 'How do I vote in my ward or Municipal Corporation election?' },
    ]
  },
];

function getFollowUpChips(query) {
  const q = query.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of FOLLOW_UP_MAP) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw)) score += kw.split(' ').length;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  return bestScore > 0 ? bestMatch.chips : null;
}

// Parse AI response with validation
function parseAIResponse(raw) {
  if (!raw || typeof raw !== 'string') {
    return {
      thinking: null,
      answer: "I encountered an issue processing the response. Please try again.",
      references: null,
      isValid: false
    };
  }

  const thinkingMatch = raw.match(/\[THINKING\]([\s\S]*?)\[\/THINKING\]/);
  const answerMatch = raw.match(/\[ANSWER\]([\s\S]*?)\[\/ANSWER\]/);
  const referencesMatch = raw.match(/\[REFERENCES\]([\s\S]*?)\[\/REFERENCES\]/);

  // If format is broken, treat entire response as answer
  if (!answerMatch && !thinkingMatch && !referencesMatch) {
    return {
      thinking: null,
      answer: raw,
      references: null,
      isValid: false
    };
  }

  return {
    thinking: thinkingMatch ? thinkingMatch[1].trim() : null,
    answer: answerMatch ? answerMatch[1].trim() : raw,
    references: referencesMatch ? referencesMatch[1].trim() : null,
    isValid: true
  };
}

// Generate stable session ID
function getSessionId() {
  let sessionId = localStorage.getItem('janmat_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('janmat_session_id', sessionId);
  }
  return sessionId;
}

let currentSessionId = getSessionId();
let isRequestInFlight = false;
let lastUserMessage = null;

// Typing indicator
function showTypingIndicator() {
  const chatMessages = document.getElementById('chat-messages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message ai typing-indicator fade-in';
  typingDiv.id = 'typing-indicator';
  typingDiv.innerHTML = `
    <div class="typing-dots">
      <span></span><span></span><span></span>
    </div>
  `;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const typingDiv = document.getElementById('typing-indicator');
  if (typingDiv) typingDiv.remove();
}

// Error display
function showError(message) {
  const chatMessages = document.getElementById('chat-messages');
  removeTypingIndicator();

  // Clean up the message for user-friendliness
  let userMessage = message;
  if (message.includes('JSON') || message.includes('json') || message.includes('parse')) {
    userMessage = 'The server took too long to respond. Please try again.';
  } else if (message.includes('fetch') || message.includes('network') || message.includes('Network')) {
    userMessage = 'Network issue. Please check your internet connection.';
  } else if (message.includes('500') || message.includes('unavailable')) {
    userMessage = 'Our AI server is busy right now. Please try again in a moment.';
  }

  const errorDiv = document.createElement('div');
  errorDiv.className = 'message ai error-message fade-in';
  errorDiv.innerHTML = `
    <div class="ai-avatar" style="background:linear-gradient(135deg,#ef4444,#dc2626)">!</div>
    <div class="ai-text error-text">
      <p>${userMessage}</p>
      <button class="retry-btn" onclick="window.retryLastMessage()">↻ Try Again</button>
    </div>
  `;
  chatMessages.appendChild(errorDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

window.retryLastMessage = async function() {
  const errorDiv = document.querySelector('.error-message');
  if (errorDiv) errorDiv.remove();
  if (lastUserMessage) {
    await sendMessage(lastUserMessage);
  }
};

// Speech Recognition Setup
let recognition = null;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById('user-input');
    if (input) {
      input.value = transcript;
      sendMessage();
    }
    stopRecording();
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    stopRecording();
    alert('Voice input error: ' + event.error);
  };

  recognition.onend = () => {
    stopRecording();
  };
}

function startRecording() {
  if (!recognition) {
    alert('Speech recognition is not supported in this browser.');
    return;
  }
  document.getElementById('record-overlay').classList.remove('hidden');
  recognition.start();
}

function stopRecording() {
  document.getElementById('record-overlay').classList.add('hidden');
  if (recognition) recognition.stop();
}

// Main send message function
async function sendMessage(manualText = null) {
  if (isRequestInFlight) return;

  const input = document.getElementById('user-input');
  const chatMessages = document.getElementById('chat-messages');
  const chatContainer = document.querySelector('.chat-container-main');
  const text = manualText || input.value.trim();

  // Input validation
  if (!text || text.length < 2) {
    if (!manualText) {
      input.focus();
    }
    return;
  }

  // Hide welcome screen on first message
  if (chatContainer && !chatContainer.classList.contains('has-messages')) {
    chatContainer.classList.add('has-messages');
    document.getElementById('initial-suggestions').style.display = 'none';
  }

  if (!manualText) {
    input.value = '';
    input.style.height = 'auto'; // Reset height after send
  }

  isRequestInFlight = true;
  lastUserMessage = text;

  const sendBtn = document.getElementById('send-msg');
  if (sendBtn) sendBtn.disabled = true;

  // User message bubble
  const userDiv = document.createElement('div');
  userDiv.className = 'message user fade-in';
  userDiv.textContent = text;
  chatMessages.appendChild(userDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  showTypingIndicator();

  try {
    // Send raw prompt - AI will auto-detect language
    const aiRaw = await askJanMat(text, currentSessionId);
    removeTypingIndicator();

    const { thinking, answer, references, isValid } = parseAIResponse(aiRaw);
    const parsedAnswer = window.marked ? window.marked.parse(answer) : answer;
    const parsedRefs = references && window.marked ? window.marked.parse(references) : (references || '');

    const aiDiv = document.createElement('div');
    aiDiv.className = 'message ai fade-in markdown-body';

    let html = `<div class="ai-avatar">AI</div><div class="ai-text">`;

    // Thinking Toggle
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

    // Main Answer
    html += `<div class="ai-answer">${parsedAnswer}</div>`;

    // References
    if (references) {
      html += `
        <div class="references-panel">
          <div class="ref-header">📚 Official Sources</div>
          <div class="ref-body">${parsedRefs}</div>
        </div>`;
    }

    // Format warning if needed
    if (!isValid) {
      html += `<div class="format-warning"><small>⚠️ Response format may be incomplete</small></div>`;
    }

    html += `</div></div>`;
    aiDiv.innerHTML = html;

    // Follow-up Chips
    const followUps = getFollowUpChips(text);
    if (followUps && followUps.length > 0) {
      const chipsDiv = document.createElement('div');
      chipsDiv.className = 'suggestion-chips response-chips';
      chipsDiv.innerHTML = `<div class="chips-label">💡 You might also want to ask:</div>` +
        followUps.slice(0, 4).map(c =>
          `<button class="chip" onclick="askChip('${c.q.replace(/'/g, "\\'")}')">
            ${c.icon} ${c.label}<span>${c.sub}</span>
          </button>`
        ).join('');
      aiDiv.appendChild(chipsDiv);
    }

    // Feedback Buttons
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'feedback-group';
    feedbackDiv.innerHTML = `
      <button class="feedback-btn" onclick="handleFeedback('${text.replace(/'/g, "\\'")}', 'up')" title="Helpful">👍</button>
      <button class="feedback-btn" onclick="handleFeedback('${text.replace(/'/g, "\\'")}', 'down')" title="Not helpful">👎</button>
    `;
    aiDiv.appendChild(feedbackDiv);

    chatMessages.appendChild(aiDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    logChatSession(text, answer);
    isRequestInFlight = false;

    if (sendBtn) sendBtn.disabled = false;
  } catch (error) {
    removeTypingIndicator();
    console.error('Chat Error:', error);
    showError(error.message || 'Something went wrong. Please try again.');
    isRequestInFlight = false;
    if (sendBtn) sendBtn.disabled = false;
  }
}

window.askChip = (question) => {
  const input = document.getElementById('user-input');
  if (input) {
    input.value = question;
    sendMessage();
  }
};

window.handleFeedback = (query, type) => {
  console.log(`Feedback: ${type} for: ${query}`);
  alert("Namaste! Thank you for your feedback, Sir/Ma'am.");
};

// Copy to clipboard utility
window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Show brief feedback
    const btn = event.target.closest('.copy-url-btn');
    if (btn) {
      const original = btn.textContent;
      btn.textContent = '✓ Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1500);
    }
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
};

// Dynamic greeting based on time of day
function getDynamicGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return { title: 'Up late? Let\'s help you learn 🌙', sub: 'Your trusted AI guide for Indian elections' };
  if (hour < 12) return { title: 'Good Morning! How can I help? ☀️', sub: 'Start your day by learning about your voting rights' };
  if (hour < 17) return { title: 'Good Afternoon! What can I help with?', sub: 'Get instant answers about Indian elections — in any language' };
  if (hour < 21) return { title: 'Good Evening! Ask me anything 🌅', sub: 'Your AI-powered election assistant is ready' };
  return { title: 'Good Night! Still curious? 🌙', sub: 'Ask about voter registration, polling booths & more' };
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('JanMat AI Initialized');

  // Set dynamic greeting
  const greeting = getDynamicGreeting();
  const greetEl = document.getElementById('dynamic-greeting');
  const subEl = document.getElementById('dynamic-subtitle');
  if (greetEl) greetEl.textContent = greeting.title;
  if (subEl) subEl.textContent = greeting.sub;

  if (window.marked) {
    const renderer = new window.marked.Renderer();
    renderer.link = (href, title, text) => {
      // Ensure href is a string to avoid "href.replace is not a function" errors
      const hrefStr = String(href || '');
      const displayUrl = hrefStr.replace(/^https?:\/\//, '').replace(/\/$/, '');
      return `<span class="link-with-copy">
        <a href="${hrefStr}" target="_blank" rel="noopener noreferrer" class="ai-link" title="${title || hrefStr}">${text} ↗</a>
        <span class="link-url-display">${displayUrl}</span>
        <button class="copy-url-btn" onclick="copyToClipboard('${hrefStr}')" title="Copy link">📋 Copy</button>
      </span>`;
    };
    window.marked.use({ renderer });
  }

  const sendBtn = document.getElementById('send-msg');
  const input = document.getElementById('user-input');
  const micBtn = document.getElementById('mic-btn');
  const stopRecordBtn = document.getElementById('stop-record');

  if (sendBtn) sendBtn.addEventListener('click', () => sendMessage());
  if (micBtn) micBtn.addEventListener('click', startRecording);
  if (stopRecordBtn) stopRecordBtn.addEventListener('click', stopRecording);

  if (input) {
    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 200) + 'px';
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Rotating placeholders
    const placeholders = [
      "Ask about Voter Registration...",
      "voter card kaise milega?",
      "How to find my polling booth?",
      "ami ki vote dite pari?",
      "What documents do I need for Voter ID?",
      "Form 6 kya hota hai?",
    ];
    let pIndex = 0;
    setInterval(() => {
      pIndex = (pIndex + 1) % placeholders.length;
      input.setAttribute('placeholder', placeholders[pIndex]);
    }, 4000);
  }

  // Location Toggle
  const btnRural = document.getElementById('toggle-rural');
  const btnUrban = document.getElementById('toggle-urban');
  if (btnRural && btnUrban) {
    btnRural.addEventListener('click', () => updateLocationContext('rural'));
    btnUrban.addEventListener('click', () => updateLocationContext('urban'));
  }

  // Timeline interactions
  document.querySelectorAll('.timeline-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.timeline-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
});

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
