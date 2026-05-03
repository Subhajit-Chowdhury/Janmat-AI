import './style.css';
const MULTILINGUAL_PLACEHOLDERS = [
  { lang: 'en', text: 'Ask about elections, voting, timelines...' },
  { lang: 'hi', text: 'वोटर आईडी कैसे बनाएं? (Voter ID kaise banaye?)' },
  { lang: 'bn', text: 'আমার পোলিং বুথ কোথায়? (Amar polling booth kothay?)' },
  { lang: 'ta', text: 'வாக்களிப்பது எப்படி? (Vote pannuvathu eppadi?)' },
  { lang: 'te', text: 'ఓటు వేయడం ఎలా? (Vote veyadam ela?)' },
  { lang: 'mr', text: 'मतदानाची तारीख काय आहे? (Voting date kay ahe?)' },
  { lang: 'gu', text: 'ચૂંટણી પંચ શું છે? (Election Commission shu che?)' },
  { lang: 'kn', text: 'ನನ್ನ ವಾರ್ಡ್ ಯಾವುದು? (Nanna ward yavudu?)' },
  { lang: 'ml', text: 'വോട്ട് ചെയ്യുന്നത് എങ്ങനെ? (Vote cheyyunnath engane?)' },
  { lang: 'pa', text: 'ਮੇਰੀ ਵੋਟ ਕਿੱਥੇ ਹੈ? (Meri vote kithe hai?)' },
  { lang: 'ur', text: 'ووٹ کیسے ڈالیں؟ (Vote kaise dale?)' },
  { lang: 'as', text: 'মোৰ পোলিং বুথ ক’ত? (Mor polling booth kot?)' },
  { lang: 'or', text: 'ମୋର ଭୋଟ କେଉଁଠାରେ ଅଛି? (Mora vote keunthare achi?)' },
  { lang: 'pa', text: 'ਚੋਣਾਂ ਬਾਰੇ ਪੁੱਛੋ (Chonam bare puchho)' },
  { lang: 'sa', text: 'किमहं मतदानं कर्तुं शक्नोमि? (Kimaham matdan karthum shaknomi?)' },
  { lang: 'mai', text: 'हमर वोट कतय अछि? (Hammar vote katay achi?)' },
  { lang: 'ks', text: 'میٛون پولیٛنگ بوتھ کتہِ چُھ؟ (Myon polling booth kati chhu?)' },
  { lang: 'ne', text: 'म कसरी भोट दिन सक्छु? (Ma kasari vote dina sakchu?)' }
];
let placeholderInterval = null;
let currentPlaceholderIndex = 0;
import { askElectAI } from './src/api/gemini.js';
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

const INITIAL_SUGGESTIONS = [
  { icon: '🏛️', label: 'How Elections Work', sub: 'Complete process', q: 'Explain the complete Indian election process step by step' },
  { icon: '🗓️', label: 'Election Timeline', sub: 'Key dates & phases', q: 'What is the timeline of a General Election in India from announcement to result?' },
  { icon: '🗳️', label: 'Register to Vote', sub: 'New voter guide', q: 'How do I register to vote?' },
  { icon: '📋', label: 'Form 6 Guide', sub: 'New application', q: 'What is Form 6 and how to fill it?' },
  { icon: '📍', label: 'Find My Booth', sub: 'Locate station', q: 'How to find my polling booth?' },
  { icon: '🪪', label: 'Valid IDs to Vote', sub: 'Accepted docs', q: 'What valid IDs can I use to vote?' },
  { icon: '📱', label: 'Digital Voter ID', sub: 'e-EPIC download', q: 'How do I download my e-EPIC digital Voter ID?' },
  { icon: '🔍', label: 'Check My Name', sub: 'Voter list search', q: 'How do I check if my name is in the electoral roll?' },
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
  let sessionId = localStorage.getItem('electai_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('electai_session_id', sessionId);
  }
  return sessionId;
}

let currentSessionId = getSessionId();
let isRequestInFlight = false;
let lastUserMessage = null;

// ── Skeleton Loading Screen ──
function showSkeletonLoader() {
  const chatMessages = document.getElementById('chat-messages');
  const skeletonDiv = document.createElement('div');
  skeletonDiv.className = 'message ai skeleton-message fade-in';
  skeletonDiv.id = 'skeleton-loader';
  skeletonDiv.innerHTML = `
    <div class="skeleton-avatar"></div>
    <div class="skeleton-body">
      <div class="skeleton-line skeleton-line--long"></div>
      <div class="skeleton-line skeleton-line--medium"></div>
      <div class="skeleton-line skeleton-line--short"></div>
      <div class="skeleton-line skeleton-line--medium"></div>
      <div class="skeleton-typing-label">✨ ElectAI is thinking...</div>
    </div>
  `;
  chatMessages.appendChild(skeletonDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  showScrollToBottom();
}

function removeSkeletonLoader() {
  const skeletonDiv = document.getElementById('skeleton-loader');
  if (skeletonDiv) skeletonDiv.remove();
}

// Legacy alias kept for any other references
function showTypingIndicator() { showSkeletonLoader(); }
function removeTypingIndicator() { removeSkeletonLoader(); }

// ── Scroll to Bottom Button ──
function showScrollToBottom() {
  const btn = document.getElementById('scroll-bottom-btn');
  if (btn) btn.classList.add('visible');
}
function hideScrollToBottom() {
  const btn = document.getElementById('scroll-bottom-btn');
  if (btn) btn.classList.remove('visible');
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
    <div class="ai-avatar" style="background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.25);color:rgba(239,68,68,0.8)">!</div>
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
let isListening = false;

/**
 * Normalize voice-to-text output before sending to AI.
 * Fixes common STT artifacts and phonetic misrecognitions.
 */
function normalizeVoiceInput(text) {
  if (!text) return text;
  let t = text.trim();

  // Fix common STT phonetic errors for Indian election terms
  const fixes = [
    [/\bvoter\s+eye\s+dee\b/gi,      'voter ID'],
    [/\bvooter\b/gi,                 'voter'],
    [/\bvoteer\b/gi,                 'voter'],
    [/\bform\s+(?:six|6|chhe)\b/gi,  'Form 6'],
    [/\bform\s+(?:seven|7|saat)\b/gi,'Form 7'],
    [/\bform\s+(?:eight|8|aath)\b/gi,'Form 8'],
    [/\bepick\b/gi,                  'EPIC'],
    [/\be\s+pick\b/gi,               'e-EPIC'],
    [/\baadhar\b/gi,                 'Aadhaar'],
    [/\badhar\b/gi,                  'Aadhaar'],
    [/\bregistartion\b/gi,           'registration'],
    [/\bregisteration\b/gi,          'registration'],
    [/\bregitration\b/gi,            'registration'],
    [/\bpoling\s+booth\b/gi,         'polling booth'],
    [/\belecton\b/gi,                'election'],
    [/\belection\s+commision\b/gi,   'Election Commission'],
    [/\block\s+sabha\b/gi,           'Lok Sabha'],
    [/\bvidhan\s+sabha\b/gi,         'Vidhan Sabha'],
    [/\brajya\s+sabha\b/gi,          'Rajya Sabha'],
  ];

  for (const [pattern, replacement] of fixes) {
    t = t.replace(pattern, replacement);
  }

  // Collapse multiple spaces
  t = t.replace(/\s{2,}/g, ' ').trim();

  return t;
}

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3; // Pick highest-confidence alternative

  recognition.onresult = (event) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        // Pick the highest-confidence alternative
        let best = event.results[i][0];
        for (let j = 1; j < event.results[i].length; j++) {
          if (event.results[i][j].confidence > best.confidence) best = event.results[i][j];
        }
        final += best.transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    const input = document.getElementById('user-input');
    if (input) {
      input.value = final ? normalizeVoiceInput(final) : interim;
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 200) + 'px';
    }
    showVoiceToast(final ? `✅ "${normalizeVoiceInput(final).trim()}"` : `🎙️ ${interim}...`, final ? 'processing' : 'listening');
  };

  recognition.onerror = (event) => {
    isListening = false;
    setMicActive(false);
    const msgs = {
      'no-speech':      'No speech detected. Tap 🎙️ and try again.',
      'audio-capture':  'No microphone found. Please connect a mic.',
      'not-allowed':    'Mic access denied — allow microphone in browser settings.',
      'network':        'Network error during voice capture. Check connection.',
      'aborted':        'Voice input cancelled.',
      'language-not-supported': 'Language not supported. Switching to English.',
    };
    showVoiceToast(`❌ ${msgs[event.error] || 'Voice error: ' + event.error}`, 'error');
    setTimeout(hideVoiceToast, 3500);
  };

  recognition.onend = () => {
    isListening = false;
    setMicActive(false);
    const input = document.getElementById('user-input');
    const val = input ? input.value.trim() : '';
    if (val) {
      const normalized = normalizeVoiceInput(val);
      if (input) input.value = normalized;
      showVoiceToast(`✅ Sending: "${normalized}"`, 'processing');
      setTimeout(() => { hideVoiceToast(); sendMessage(); }, 600);
    } else {
      hideVoiceToast();
    }
  };
}

// Voice UI helpers
function showVoiceToast(text, state = 'listening') {
  let toast = document.getElementById('voice-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'voice-toast';
    toast.style.cssText = [
      'position:fixed', 'bottom:80px', 'left:50%', 'transform:translateX(-50%)',
      'background:rgba(10,10,15,0.96)', 'border:1px solid rgba(255,153,51,0.4)',
      'color:#fff', 'padding:10px 22px', 'border-radius:50px', 'font-size:0.88rem',
      'z-index:9999', 'display:flex', 'align-items:center', 'gap:10px',
      'backdrop-filter:blur(14px)', 'box-shadow:0 8px 30px rgba(0,0,0,0.5)',
      'transition:opacity 0.3s ease', 'white-space:nowrap'
    ].join(';');
    document.body.appendChild(toast);
  }
  const colors = { listening: '#FF9933', processing: '#138808', error: '#ef4444' };
  const color = colors[state] || '#FF9933';
  const anim = state === 'listening' ? 'animation:micPulse 0.8s ease infinite alternate;' : '';
  const dot = `<span style="width:9px;height:9px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0;${anim}"></span>`;
  toast.innerHTML = `${dot} ${text}`;
  toast.style.opacity = '1';
}

function hideVoiceToast() {
  const toast = document.getElementById('voice-toast');
  if (!toast) return;
  toast.style.opacity = '0';
  setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
}

function setMicActive(active) {
  const btn = document.getElementById('mic-btn');
  if (!btn) return;
  if (active) {
    btn.style.color = '#FF9933';
    btn.style.transform = 'scale(1.2)';
    btn.title = 'Click to stop';
  } else {
    btn.style.color = '';
    btn.style.transform = '';
    btn.title = 'Speak your question';
  }
}

function startRecording() {
  if (isListening) { stopRecording(); return; }
  if (!recognition) {
    showVoiceToast('Voice input not supported. Please use Chrome or Edge.', 'error');
    setTimeout(hideVoiceToast, 3500);
    return;
  }

  // 22 Official Languages Mapping
  const LANG_MAP = {
    'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'ta': 'ta-IN', 'te': 'te-IN',
    'mr': 'mr-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN', 'pa': 'pa-IN',
    'ur': 'ur-IN', 'as': 'as-IN', 'brx': 'brx-IN', 'doi': 'doi-IN', 'ks': 'ks-IN',
    'kok': 'kok-IN', 'mai': 'mai-IN', 'mni': 'mni-IN', 'ne': 'ne-NP', 'or': 'or-IN',
    'sa': 'sa-IN', 'sat': 'sat-IN', 'sd': 'sd-IN'
  };

  const selectedLang = localStorage.getItem('elect_ai_lang') || 'en';
  recognition.lang = LANG_MAP[selectedLang] || 'en-IN';

  isListening = true;
  setMicActive(true);
  showVoiceToast(`🎙️ Listening (${selectedLang.toUpperCase()})...`, 'listening');
  try {
    recognition.start();
  } catch (e) {
    if (e.name !== 'InvalidStateError') {
      isListening = false;
      setMicActive(false);
      hideVoiceToast();
    }
  }
}

function stopRecording() {
  if (recognition && isListening) {
    try { recognition.stop(); } catch (e) {}
  }
  isListening = false;
  setMicActive(false);
}

// Inject micPulse animation
const _micStyle = document.createElement('style');
_micStyle.textContent = '@keyframes micPulse { from{opacity:.5;transform:scale(.9)} to{opacity:1;transform:scale(1.1)} }';
document.head.appendChild(_micStyle);

// Initial mic button listener
document.addEventListener('DOMContentLoaded', () => {
  const micBtn = document.getElementById('mic-btn');
  if (micBtn) micBtn.addEventListener('click', startRecording);
});

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
    const homeEl = document.getElementById('home');
    if (homeEl) homeEl.classList.add('has-messages');
    
    // Enable app-level scrolling for long conversations
    document.getElementById('app').classList.add('has-messages-active');
    
    const suggestionsContainer = document.getElementById('dynamic-suggestions-container');
    if (suggestionsContainer) {
      // Don't hide, just keep it visible
      suggestionsContainer.style.display = 'flex';
    }
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

  showSkeletonLoader();

  try {
    // Send raw prompt - AI will auto-detect language and respond in same language
    const aiRaw = await askElectAI(text, currentSessionId);
    removeSkeletonLoader();

    const { thinking, answer, references, isValid } = parseAIResponse(aiRaw);
    const parsedAnswer = window.marked ? window.marked.parse(answer) : answer;
    const parsedRefs = references && window.marked ? window.marked.parse(references) : (references || '');

    const msgId = `ai-msg-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const aiDiv = document.createElement('div');
    aiDiv.className = 'message ai fade-in markdown-body ai-glow-msg';
    aiDiv.id = msgId;

    let html = `<div class="ai-avatar">AI</div><div class="ai-text">`;

    // Thinking Toggle
    if (thinking) {
      const thinkId = `think-${Date.now()}`;
      html += `
        <div class="thinking-wrapper">
          <button class="thinking-pill" onclick="this.nextElementSibling.classList.toggle('open'); this.querySelector('.think-chevron').classList.toggle('rotated')">
            <span class="think-icon">🧠</span> Model Reasoning <span class="think-chevron">▾</span>
          </button>
          <div class="thinking-panel" id="${thinkId}">
            <p>${thinking}</p>
          </div>
        </div>`;
    }

    // Main Answer
    html += `<div class="ai-answer">${parsedAnswer}</div>`;

    // References — always show with canonical ECI links
    const defaultRefs = `
      <ul>
        <li><a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer">🌐 voters.eci.gov.in</a> — Voter registration, Form 6/8, e-EPIC download</li>
        <li><a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">🏛️ eci.gov.in</a> — Election Commission of India (official)</li>
        <li><a href="https://nvsp.in" target="_blank" rel="noopener noreferrer">📋 nvsp.in</a> — National Voter Service Portal</li>
        <li><a href="https://ceodelhi.gov.in" target="_blank" rel="noopener noreferrer">📍 ceodelhi.gov.in</a> — Delhi Chief Electoral Officer</li>
      </ul>`;
    const refsHtml = references ? parsedRefs : defaultRefs;
    html += `
      <div class="references-panel">
        <div class="ref-header" onclick="this.nextElementSibling.classList.toggle('open-refs')">📚 Official References <span class="ref-chevron">▾</span></div>
        <div class="ref-body open-refs">${refsHtml}</div>
      </div>`;

    // Format warning if needed
    if (!isValid) {
      html += `<div class="format-warning"><small>⚠️ Response format may be incomplete</small></div>`;
    }

    // Action Bar (copy + listen + timestamp)
    html += `
      <div class="msg-action-bar">
        <div class="action-left">
          <span class="msg-timestamp">${timestamp}</span>
        </div>
        <div class="action-right">
          <div class="tts-container" id="tts-container-${msgId}">
            <button class="action-msg-btn listen-btn" onclick="speakMessage('${msgId}')" title="Listen to response">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.01,19.86 21,16.28 21,12C21,7.72 18.01,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.02C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/></svg>
              Listen
            </button>
          </div>
          <button class="action-msg-btn copy-msg-btn" onclick="copyMessageText('${msgId}')" title="Copy response">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/></svg>
            Copy
          </button>
        </div>
      </div>`;

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
      <button class="feedback-btn" onclick="handleFeedback(this)" data-type="up" title="Helpful">👍</button>
      <button class="feedback-btn" onclick="handleFeedback(this)" data-type="down" title="Not helpful">👎</button>
    `;
    aiDiv.appendChild(feedbackDiv);

    chatMessages.appendChild(aiDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    hideScrollToBottom();

    logChatSession(text, answer);
    isRequestInFlight = false;

    if (sendBtn) sendBtn.disabled = false;
    
    // Refresh suggestions based on the last query
    setDynamicSuggestions(text);
  } catch (error) {
    removeSkeletonLoader();
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

window.handleFeedback = (btn) => {
  const type = btn.dataset.type;
  const group = btn.closest('.feedback-group');
  if (!group) return;
  group.querySelectorAll('.feedback-btn').forEach(b => b.classList.remove('fb-active'));
  btn.classList.add('fb-active');
  btn.textContent = type === 'up' ? '👍 Thanks!' : '👎 Noted';
  setTimeout(() => {
    group.querySelectorAll('.feedback-btn').forEach(b => b.classList.remove('fb-active'));
    btn.textContent = type === 'up' ? '👍' : '👎';
  }, 2000);
};

// ── Enhanced Text to Speech ──
let currentUtterance = null;
const synth = window.speechSynthesis;

const LANG_VOICE_MAP = {
  'hi': ['hi-IN', 'Google हिन्दी'],
  'bn': ['bn-IN', 'Google বাংলা'],
  'ta': ['ta-IN', 'Google தமிழ்'],
  'te': ['te-IN', 'Google తెలుగు'],
  'kn': ['kn-IN', 'Google ಕನ್ನಡ'],
  'ml': ['ml-IN', 'Google മലയാളം'],
  'mr': ['mr-IN', 'Google मराठी'],
  'gu': ['gu-IN', 'Google ગુજરાતી'],
  'pa': ['pa-IN', 'Google ਪੰਜਾਬੀ'],
  'or': ['or-IN', 'Google ଓଡ଼ିଆ'],
  'as': ['as-IN', 'Google অসমীয়া'],
  'ur': ['ur-PK', 'Google اردو'],
  'en': ['en-IN', 'Google US English'],
  'sa': ['hi-IN', 'Sanskrit'], // Fallback to Hindi engine
  'ne': ['ne-NP', 'Nepali'],
  'kok': ['hi-IN', 'Konkani'],
  'sd': ['hi-IN', 'Sindhi']
};

function getBestVoice(langCode) {
  const voices = synth.getVoices();
  const target = LANG_VOICE_MAP[langCode] || ['en-IN', 'Google US English'];
  
  // Try to find exact match or "Google" natural voice
  const voice = voices.find(v => v.lang === target[0] && (v.name.includes('Google') || v.name.includes('Natural'))) 
         || voices.find(v => v.lang.startsWith(langCode)) 
         || voices.find(v => v.lang.includes('IN'))
         || voices.find(v => v.name.includes('Indian'))
         || voices[0];
  return voice;
}

window.speakMessage = function(msgId) {
  const msgEl = document.getElementById(msgId);
  if (!msgEl) return;
  const text = msgEl.querySelector('.ai-answer').innerText;
  
  if (synth.speaking) {
    synth.cancel();
    if (currentUtterance && currentUtterance.msgId === msgId) {
      updateTTSUI(msgId, 'idle');
      currentUtterance = null;
      return;
    }
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.msgId = msgId;

  // Detect Language
  let lang = 'en';
  if (/[अ-ह]/.test(text)) lang = 'hi';
  else if (/[অ-হ]/.test(text)) lang = 'bn';
  else if (/[அ-ஹ]/.test(text)) lang = 'ta';
  else if (/[అ-హ]/.test(text)) lang = 'te';
  
  const voice = getBestVoice(lang);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }

  utterance.onstart = () => updateTTSUI(msgId, 'playing');
  utterance.onpause = () => updateTTSUI(msgId, 'paused');
  utterance.onresume = () => updateTTSUI(msgId, 'playing');
  utterance.onend = () => {
    updateTTSUI(msgId, 'idle');
    currentUtterance = null;
  };

  synth.speak(utterance);
  currentUtterance = utterance;
};

function updateTTSUI(msgId, state) {
  const container = document.getElementById(`tts-container-${msgId}`);
  if (!container) return;

  if (state === 'idle') {
    container.innerHTML = `
      <button class="action-msg-btn listen-btn" onclick="speakMessage('${msgId}')" title="Listen">
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.01,19.86 21,16.28 21,12C21,7.72 18.01,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.02C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/></svg>
        Listen
      </button>`;
    return;
  }

  container.innerHTML = `
    <div class="tts-controls">
      <button class="tts-btn ${state === 'playing' ? 'active' : ''}" onclick="toggleTTSPause()" title="${state === 'playing' ? 'Pause' : 'Resume'}">
        ${state === 'playing' ? 
          '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z"/></svg>' : 
          '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z"/></svg>'}
      </button>
      <button class="tts-btn" onclick="stopTTS()" title="Stop">
        <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M18,18H6V6H18V18Z"/></svg>
      </button>
      <span class="tts-status-text">${state}</span>
    </div>
  `;
}

window.toggleTTSPause = function() {
  if (synth.paused) synth.resume();
  else synth.pause();
};

window.stopTTS = function() {
  synth.cancel();
  if (currentUtterance) {
    updateTTSUI(currentUtterance.msgId, 'idle');
    currentUtterance = null;
  }
};

// Clear chat
window.clearChat = function() {
  const chatMessages = document.getElementById('chat-messages');
  const container = document.querySelector('.chat-container-main');
  const suggestions = document.getElementById('dynamic-suggestions-container');
  if (chatMessages) chatMessages.innerHTML = '';
  if (container) container.classList.remove('has-messages');
  const homeEl = document.getElementById('home');
  if (homeEl) homeEl.classList.remove('has-messages');
  if (suggestions) {
    suggestions.style.display = 'grid';
    setDynamicSuggestions(); 
  }
  currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('electai_session_id', currentSessionId);
  hideScrollToBottom();
};

// Copy AI message text
window.copyMessageText = function(msgId) {
  const msgEl = document.getElementById(msgId);
  if (!msgEl) return;
  const answerEl = msgEl.querySelector('.ai-answer');
  const text = answerEl ? answerEl.innerText : msgEl.innerText;
  navigator.clipboard.writeText(text).then(() => {
    const btn = msgEl.querySelector('.copy-msg-btn');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✅ Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1800);
    }
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
};

// Dynamic greeting — multiple creative options per time slot, picks randomly on each refresh
function getDynamicGreeting() {
  const hour = new Date().getHours();
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  if (hour < 5) return pick([
    { title: 'Still up? Democracy never sleeps, and neither do you 🌙', sub: 'Your curiosity about elections at this hour is exactly what civic India needs.' },
    { title: 'Midnight scholar. Election champion. 🌙', sub: 'Most people are asleep. You\'re learning how democracy works. Respect.' },
    { title: 'The polls open at dawn. You\'re already prepared 🕯️', sub: 'Asking election questions at this hour? That\'s dedication India deserves.' },
    { title: '2 AM and still curious about your rights? 🌟', sub: 'That\'s not insomnia. That\'s civic spirit. Let\'s make it count.' },
  ]);

  if (hour < 9) return pick([
    { title: 'Early riser, informed voter ☀️', sub: 'Starting your day with election knowledge? That\'s the spirit of an active citizen.' },
    { title: 'First chai, then democracy ☕', sub: 'You\'re up early and you\'re here. That says everything about you.' },
    { title: 'Sunrise energy, civic clarity 🌄', sub: 'The best voters are the ones who learn before the noise begins.' },
    { title: 'Good morning, future voter! 🌅', sub: 'Your day starts with a question. India needs more people like you.' },
  ]);

  if (hour < 12) return pick([
    { title: 'Good Morning! Your vote is your voice 🗳️', sub: 'Ask me anything about Indian elections — in Hindi, English, or any language.' },
    { title: 'Morning momentum — let\'s talk elections 🔆', sub: 'Form 6, polling booths, voter ID — I know it all. What do you want to know?' },
    { title: 'You showed up. That already makes you different 🌟', sub: 'Most people never ask. You\'re here. Let\'s make this count.' },
    { title: 'Good morning! Informed citizens make stronger democracies 🏛️', sub: 'I\'m here to answer every election question you\'ve ever had.' },
  ]);

  if (hour < 14) return pick([
    { title: 'Midday check-in — what\'s on your mind? 💡', sub: 'From Form 6 to polling booths, I\'ve got all your election questions covered.' },
    { title: 'Lunch break wisdom 🍱', sub: 'Five minutes with ElectAI could answer questions you\'ve had for years.' },
    { title: 'Peak hours, peak curiosity 🔥', sub: 'Democracy runs all day. So do I. Ask away.' },
    { title: 'You\'re thinking about elections over lunch? 🏅', sub: 'That\'s not common. And that\'s exactly what makes it powerful.' },
  ]);

  if (hour < 17) return pick([
    { title: 'Good Afternoon! Ready to learn together? 📚', sub: 'Millions of Indians don\'t know their voter rights. You\'re about to be different.' },
    { title: 'Afternoon conversations, democratic foundations 🇮🇳', sub: 'Every informed question you ask makes the next election a little better.' },
    { title: 'Still here, still curious 🌤️', sub: 'Your questions aren\'t just questions. They\'re the foundation of a stronger vote.' },
    { title: 'The booth is yours. Let\'s make sure you\'re ready for it ✅', sub: 'I know election rules, forms, timelines and voter rights — all in one place.' },
  ]);

  if (hour < 19) return pick([
    { title: 'Evening vibes, civic minds 🌅', sub: 'The best time to learn how your vote shapes India\'s future.' },
    { title: 'Golden hour. Perfect time to understand your vote 🌇', sub: 'The day isn\'t done yet, and neither is your right to know.' },
    { title: 'Before dinner, a little democracy? 🍽️', sub: 'Most people scroll. You\'re here learning your rights. That\'s rare.' },
    { title: 'Evening you, curious you, empowered you 💪', sub: 'Elections aren\'t just events — they\'re your moment. I\'ll help you own it.' },
  ]);

  if (hour < 21) return pick([
    { title: 'Election questions don\'t have office hours 🌆', sub: 'And neither do I. Ask me anything — I\'m always here.' },
    { title: 'You came back. I noticed 👀', sub: 'Whether it\'s your first question or your fiftieth — I\'ve got you.' },
    { title: 'Evening, fellow democracy enthusiast 🙌', sub: 'Your question tonight might be the answer someone else needed tomorrow.' },
    { title: 'This is your time. This is your vote 🗳️', sub: 'Ask boldly. Democracy rewards the informed.' },
    { title: 'Here again? Respect. 🌟', sub: 'The more you know about elections, the more powerful your vote becomes.' },
  ]);

  if (hour < 23) return pick([
    { title: 'Winding down, but still curious? 🌙', sub: 'One question tonight could make you a more informed voter tomorrow.' },
    { title: 'Late evening scholar 📖', sub: 'You\'re still here while most have switched off. That matters.' },
    { title: 'Night mode. Civic mode 🌙', sub: 'The quieter it gets, the clearer your rights become. Ask me.' },
    { title: 'One last question before you rest? 🌛', sub: 'I promise I won\'t judge the hour. Democracy doesn\'t either.' },
  ]);

  return pick([
    { title: 'Late night, deep questions — I respect that 🌟', sub: 'The kind of citizen who learns about elections past midnight? India needs more of you.' },
    { title: 'Midnight and still thinking about your vote 🏅', sub: 'You\'re probably the most prepared voter in your neighbourhood right now.' },
    { title: 'The world is asleep. You\'re learning democracy 🌌', sub: 'That\'s not just curiosity. That\'s citizenship at its finest.' },
    { title: 'Even at midnight, your vote matters 🕛', sub: 'Ask your question. I\'ll be here. Always.' },
  ]);
}

function setDynamicSuggestions(query = null) {
  const container = document.getElementById('dynamic-suggestions-container');
  if (!container) return;

  const chips = query ? (getFollowUpChips(query) || INITIAL_SUGGESTIONS) : INITIAL_SUGGESTIONS;
  const shuffled = [...chips].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 2);

  container.innerHTML = selected.map(s => `
    <button class="suggestion-card fade-in" onclick="askChip('${s.q.replace(/'/g, "\\'")}')">
      <span class="card-icon">${s.icon}</span>
      <div class="card-text">
        <strong>${s.label}</strong>
        <p>${s.sub}</p>
      </div>
    </button>
  `).join('');
}


document.addEventListener('DOMContentLoaded', () => {
  console.log('ElectAI Initialized');

  // Set dynamic greeting
  const greeting = getDynamicGreeting();
  const greetEl = document.getElementById('dynamic-greeting');
  const subEl = document.getElementById('dynamic-subtitle');
  if (greetEl) greetEl.textContent = greeting.title;
  if (subEl) subEl.textContent = greeting.sub;

  // Set dynamic suggestions (2 random ones)
  setDynamicSuggestions();

  if (window.marked) {
    const renderer = new window.marked.Renderer();

    // marked v5+ passes a single token object; v4 passes (href, title, text)
    renderer.link = function(hrefOrToken, title, text) {
      let hrefStr, titleStr, textStr;
      if (hrefOrToken && typeof hrefOrToken === 'object') {
        // marked v5+ token object
        hrefStr  = String(hrefOrToken.href  || '');
        titleStr = String(hrefOrToken.title || hrefStr);
        textStr  = hrefOrToken.text || hrefStr;
      } else {
        // marked v4 separate args
        hrefStr  = String(hrefOrToken || '');
        titleStr = String(title || hrefStr);
        textStr  = text || hrefStr;
      }
      const displayUrl = hrefStr.replace(/^https?:\/\//, '').replace(/\/$/, '');
      return `<span class="link-with-copy">
        <a href="${hrefStr}" target="_blank" rel="noopener noreferrer" class="ai-link" title="${titleStr}">${textStr} ↗</a>
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

  // Scroll-to-bottom FAB: show when user scrolls up in chat
  const chatMsgs = document.getElementById('chat-messages');
  if (chatMsgs) {
    chatMsgs.addEventListener('scroll', () => {
      const distFromBottom = chatMsgs.scrollHeight - chatMsgs.scrollTop - chatMsgs.clientHeight;
      if (distFromBottom > 80) showScrollToBottom();
      else hideScrollToBottom();
    });
  }

  // Expose hideScrollToBottom globally for inline onclick in HTML
  window.hideScrollToBottom = hideScrollToBottom;

  // Language switcher logic
  const langSwitcher = document.getElementById('lang-switcher');
  if (langSwitcher) {
    const savedLang = localStorage.getItem('elect_ai_lang');
    if (savedLang) langSwitcher.value = savedLang;
    
    langSwitcher.addEventListener('change', (e) => {
      const lang = e.target.value;
      localStorage.setItem('elect_ai_lang', lang);
      updateUILanguage(lang);
    });
    
    // Set initial UI language
    updateUILanguage(localStorage.getItem('elect_ai_lang') || 'en');
    startPlaceholderRotation();
  }
});

function startPlaceholderRotation() {
  const input = document.getElementById('user-input');
  if (!input || placeholderInterval) return;

  // Creative shuffle: Start with English, then shuffle the rest
  const others = MULTILINGUAL_PLACEHOLDERS.slice(1).sort(() => Math.random() - 0.5);
  const shuffledPlaceholders = [MULTILINGUAL_PLACEHOLDERS[0], ...others];

  placeholderInterval = setInterval(() => {
    if (input.value === '' && document.activeElement !== input) {
      // Trigger buttery transition
      input.classList.remove('placeholder-transition');
      void input.offsetWidth; // Force reflow
      input.classList.add('placeholder-transition');

      // Change text mid-fade
      setTimeout(() => {
        currentPlaceholderIndex = (currentPlaceholderIndex + 1) % shuffledPlaceholders.length;
        input.placeholder = shuffledPlaceholders[currentPlaceholderIndex].text;
      }, 400); // Sync with CSS timing
    }
  }, 6000); // 6s interval for natural reading
}

function updateUILanguage(lang) {
  if (placeholderInterval) {
    clearInterval(placeholderInterval);
    placeholderInterval = null;
  }
  const placeholders = {
    'en': 'Ask about elections, voting, timelines...',
    'hi': 'चुनाव, मतदान और समयसीमा के बारे में पूछें...',
    'bn': 'নির্বাচন, ভোটদান এবং সময়সীমা সম্পর্কে জিজ্ঞাসা করুন...',
    'ta': 'தேர்தல்கள், வாக்களிப்பு மற்றும் காலக்கெடு பற்றி கேளுங்கள்...',
    'te': 'ఎన్నికలు, ఓటింగ్ మరియు టైమ్‌లైన్ల గురించి అడగండి...',
    'mr': 'निवडणुका, मतदान आणि वेळापत्रकाबद्दल विचारा...',
    'gu': 'ચૂંટણી, મતદાન અને સમયરેખા વિશે પૂછો...',
    'kn': 'ಚುನಾವಣೆಗಳು, ಮತದಾನ ಮತ್ತು ಟೈಮ್‌ಲೈನ್‌ಗಳ ಬಗ್ಗೆ ಕೇಳಿ...',
    'ml': 'തിരഞ്ഞെടുപ്പ്, വോട്ടിംഗ്, ടൈംലൈനുകൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കുക...',
    'pa': 'ਚੋਣਾਂ, ਵੋਟਿੰਗ ਅਤੇ ਸਮਾਂ ਸੀਮਾ ਬਾਰੇ ਪੁੱਛੋ...',
    'ur': 'انتخابات، ووٹنگ اور ٹائم لائنز کے بارے में پوچھیں...'
  };
  
  const input = document.getElementById('user-input');
  if (input) input.placeholder = placeholders[lang] || placeholders['en'];
  
  const subtitle = document.getElementById('dynamic-subtitle');
  if (subtitle && lang !== 'en') {
    subtitle.innerText = 'Ask in your native language — we understand all 22 official languages of India 🇮🇳';
  }
}


function updateLocationContext(type) {
  const btnRural = document.getElementById('toggle-rural');
  const btnUrban = document.getElementById('toggle-urban');
  const h1 = document.getElementById('step-1-how');
  const h2 = document.getElementById('step-2-how');
  const h3 = document.getElementById('step-3-how');

  if (type === 'rural') {
    btnRural.classList.add('active');
    btnUrban.classList.remove('active');
    h1.innerHTML = '<strong>How:</strong> Apply online at <a href="https://voters.eci.gov.in/" target="_blank" class="inline-link">voters.eci.gov.in</a>. For Rural areas, your local BLO will coordinate with the Gram Panchayat for verification.';
    h2.innerHTML = '<strong>How:</strong> The BLO visits your residence. In Rural areas, you can also consult your Pradhan\'s office or check status at <a href="https://voters.eci.gov.in/voter/search" target="_blank" class="inline-link">voters.eci.gov.in/voter/search</a>';
    h3.innerHTML = '<strong>How:</strong> Locate your booth at <a href="https://electoralsearch.eci.gov.in/" target="_blank" class="inline-link">electoralsearch.eci.gov.in</a> and carry a valid ID. In Rural areas, check the local primary school or community hall.';
  } else {
    btnUrban.classList.add('active');
    btnRural.classList.remove('active');
    h1.innerHTML = '<strong>How:</strong> Apply online via ECI Portal at <a href="https://voters.eci.gov.in/" target="_blank" class="inline-link">voters.eci.gov.in</a>. In Urban areas, verification is handled by Ward Offices or Municipal Centers.';
    h2.innerHTML = '<strong>How:</strong> BLO verification at your door. You can visit your local Ward Office or check status at <a href="https://voters.eci.gov.in/voter/search" target="_blank" class="inline-link">voters.eci.gov.in/voter/search</a>';
    h3.innerHTML = '<strong>How:</strong> Check your assigned polling station at <a href="https://electoralsearch.eci.gov.in/" target="_blank" class="inline-link">electoralsearch.eci.gov.in</a> or visit a nearby Government School or Community Center.';
  }
}
