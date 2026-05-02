/**
 * Quick Integration Example for Gemini Chat Launcher
 * Copy relevant parts of this into your main.js
 */

// ============================================================================
// STEP 1: Add imports at the top of main.js
// ============================================================================

import GeminiChatLauncher from './src/gemini-chat-launcher.js';
import { queryGeminiAPI, testConnection } from './src/api/gemini.js';
import { saveConversationToFirestore, getUserSession } from './src/api/firebase.js';

// ============================================================================
// STEP 2: Initialize the launcher (after DOM is loaded)
// ============================================================================

let launcher;
let currentUserId = null;
let conversationId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize user session
  const session = await getUserSession();
  currentUserId = session?.userId;
  conversationId = `conv_${Date.now()}`;

  // Initialize the launcher
  launcher = new GeminiChatLauncher('chat-launcher', {
    sendQuery: handleUserQuery
  });

  // Transition from launcher to chat once first query arrives
  launcher.on('query-sent', () => {
    document.querySelector('#chat-launcher').style.display = 'none';
    document.querySelector('#primary-chat').style.display = 'block';
  });

  console.log('Gemini Chat Launcher initialized');
});

// ============================================================================
// STEP 3: Main query handler (connect to your Gemini API)
// ============================================================================

async function handleUserQuery(userQuery) {
  if (!userQuery.trim()) return;

  try {
    // 1. Display user message immediately
    addMessageToChat({
      text: userQuery,
      sender: 'user',
      timestamp: new Date()
    });

    // 2. Show "thinking" indicator
    showTypingIndicator();

    // 3. Query Gemini API (use your existing gemini.js wrapper)
    const aiResponse = await queryGeminiAPI({
      query: userQuery,
      systemContext: getSystemInstruction(),
      conversationHistory: getConversationHistory()
    });

    // 4. Hide typing indicator
    hideTypingIndicator();

    // 5. Display AI response
    addMessageToChat({
      text: aiResponse.content,
      sender: 'ai',
      timestamp: new Date(),
      metadata: {
        modelVersion: aiResponse.modelVersion,
        processingTime: aiResponse.processingTime
      }
    });

    // 6. Save to Firestore for analytics & history
    if (currentUserId) {
      await saveConversationToFirestore({
        conversationId,
        userId: currentUserId,
        exchange: {
          userQuery,
          aiResponse: aiResponse.content,
          timestamp: new Date(),
          metadata: aiResponse.metadata
        }
      });
    }

    // 7. Show success toast (optional)
    launcher.showToast('Response received', 'success');

  } catch (error) {
    hideTypingIndicator();

    console.error('Query error:', error);

    // Check if it's a rate limit error
    if (error.message?.includes('rate limit')) {
      launcher.showToast(
        'Too many requests. Please wait a moment.',
        'warning'
      );
      // Optionally implement exponential backoff
      setTimeout(() => handleUserQuery(userQuery), 5000);
    } else {
      launcher.showToast(
        `Error: ${error.message || 'Failed to get response'}`,
        'error'
      );
    }

    // Add error message to chat
    addMessageToChat({
      text: 'Sorry, I encountered an error. Please try again.',
      sender: 'system',
      timestamp: new Date(),
      isError: true
    });
  }
}

// ============================================================================
// STEP 4: Helper functions for chat management
// ============================================================================

function addMessageToChat(message) {
  const chatContainer = document.getElementById('chat-messages');
  const messageEl = document.createElement('div');

  messageEl.className = `message message-${message.sender}`;
  messageEl.setAttribute('role', 'article');
  messageEl.setAttribute('aria-label', `${message.sender} message: ${message.text}`);

  if (message.sender === 'user') {
    messageEl.innerHTML = `
      <div class="message-content user-message">
        ${escapeHtml(message.text)}
      </div>
      <div class="message-timestamp">${formatTime(message.timestamp)}</div>
    `;
  } else if (message.sender === 'ai') {
    messageEl.innerHTML = `
      <div class="message-content ai-message">
        ${marked(message.text)} <!-- If using marked.js for markdown -->
      </div>
      <div class="message-footer">
        <span class="message-timestamp">${formatTime(message.timestamp)}</span>
        <button class="message-action-btn copy-btn" 
                aria-label="Copy message"
                onclick="copyToClipboard('${escapeAttr(message.text)}')" >
          📋 Copy
        </button>
      </div>
    `;
  } else if (message.sender === 'system') {
    messageEl.classList.add(message.isError ? 'error' : 'info');
    messageEl.innerHTML = `<div class="message-content system">${message.text}</div>`;
  }

  chatContainer.appendChild(messageEl);

  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Add fade-in animation
  messageEl.style.animation = 'fadeIn 0.3s ease-out';
}

function showTypingIndicator() {
  const chatContainer = document.getElementById('chat-messages');
  const indicator = document.createElement('div');
  indicator.id = 'typing-indicator';
  indicator.className = 'message message-ai';
  indicator.innerHTML = `
    <div class="typing-dots">
      <span></span><span></span><span></span>
    </div>
  `;
  chatContainer.appendChild(indicator);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => indicator.remove(), 300);
  }
}

function getConversationHistory() {
  const messages = document.querySelectorAll('#chat-messages .message-user, #chat-messages .message-ai');
  return Array.from(messages).map(msg => ({
    role: msg.classList.contains('message-user') ? 'user' : 'assistant',
    content: msg.textContent.trim()
  }));
}

function getSystemInstruction() {
  // Return the system prompt that defines JanMat's behavior
  return `You are JanMat, a Senior Civic Consultant from the Election Commission of India.
Your role is to help Indian citizens with:
- Voter registration and eligibility
- Election Commission of India (ECI) forms (Form 6, 7, 8)
- Voting process and procedures
- National Voter Service Portal (NVSP)
- Electoral rights and responsibilities

Always:
- Provide accurate, official information
- Cite ECI guidelines when relevant
- Use simple, accessible language
- Support multiple Indian languages
- Maintain a professional, helpful tone`;
}

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(text) {
  return text.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    launcher.showToast('Copied to clipboard', 'success');
  }).catch(() => {
    launcher.showToast('Failed to copy', 'error');
  });
}

// ============================================================================
// STEP 5: Skill-based quick actions (optional enhancement)
// ============================================================================

// You can extend the launcher to handle skill-specific flows:
export function handleQuickActionWithContext(action) {
  const skillContext = {
    register: {
      prompt: 'How can I register as a voter in India?',
      followUpQuestions: [
        'What documents do I need?',
        'How long does it take?',
        'Can I register online?'
      ]
    },
    forms: {
      prompt: 'Guide me through the ECI voter registration forms',
      followUpQuestions: [
        'What is Form 6?',
        'What is Form 7?',
        'What is Form 8?',
        'Which form do I need?'
      ]
    },
    status: {
      prompt: 'How can I check my voter registration status?',
      followUpQuestions: [
        'I lost my voter ID',
        'Update my registration details',
        'Transfer my registration'
      ]
    }
  };

  const context = skillContext[action];
  if (context) {
    handleUserQuery(context.prompt);
    // Store follow-up questions for quick suggestions
    window.nextSuggestions = context.followUpQuestions;
  }
}

// ============================================================================
// STEP 6: Optional - Add to your existing HTML
// ============================================================================

/*
Add this to index.html if not already present:

<head>
  <!-- Add after your existing stylesheets -->
  <link rel="stylesheet" href="./gemini-chat-launcher.css">
</head>

<body>
  <!-- Add this div before your existing #app div -->
  <div id="chat-launcher"></div>

  <!-- Your existing app structure -->
  <div id="app">
    <header class="navbar">
      <!-- ... -->
    </header>

    <main id="home" class="hero-section">
      <div class="chat-container-main">
        <div class="primary-chat" id="primary-chat" style="display:none;">
          <div class="chat-messages" id="chat-messages">
            <!-- Messages will appear here -->
          </div>
          
          <div class="ai-input-wrapper">
            <div class="input-container-floating" id="input-pill">
              <textarea id="user-input" 
                        placeholder="Ask anything about Indian elections..."
                        rows="1"></textarea>
              <button id="send-msg" class="send-btn-minimal" aria-label="Send Message">
                <!-- Send icon SVG -->
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Scripts -->
  <script type="module" src="./main.js"></script>
</body>
*/

// ============================================================================
// STEP 7: Optional - Add styling for animations
// ============================================================================

const styles = `
  /* Typing indicator animation */
  .typing-dots {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
  }

  .typing-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--accent-primary);
    animation: typing 1.4s infinite;
  }

  .typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 60%, 100% {
      opacity: 0.5;
      transform: translateY(0);
    }
    30% {
      opacity: 1;
      transform: translateY(-10px);
    }
  }

  /* Message animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }

  /* Message styling */
  .message {
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
    animation: fadeIn 0.3s ease-out;
  }

  .message-user {
    align-items: flex-end;
  }

  .message-ai {
    align-items: flex-start;
  }

  .message-content {
    padding: 12px 16px;
    border-radius: 16px;
    max-width: 70%;
    word-wrap: break-word;
  }

  .user-message {
    background: var(--accent-primary);
    color: white;
    border-radius: 16px 16px 4px 16px;
  }

  .ai-message {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 16px 16px 16px 4px;
    color: var(--text-primary);
  }

  .message-timestamp {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 4px;
    padding: 0 8px;
  }

  .message-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    padding: 0 8px;
  }

  .message-action-btn {
    padding: 4px 8px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s ease;
  }

  .message-action-btn:hover {
    color: var(--accent-primary);
  }

  @media (max-width: 768px) {
    .message-content {
      max-width: 85%;
    }
  }
`;

// ============================================================================
// TESTING
// ============================================================================

/*
To test the integration:

1. Open browser console (F12)
2. Check if launcher initializes:
   window.launcher !== undefined  // Should be true

3. Test voice input:
   - Click the microphone icon
   - Speak: "How do I register to vote?"
   - Check console for transcript

4. Test quick actions:
   - Click any quick action chip
   - Verify query is sent

5. Test settings:
   - Click settings (gear icon)
   - Change language/theme
   - Verify localStorage:
     JSON.parse(localStorage.getItem('janmat_settings'))

6. Test error handling:
   - Unplug internet
   - Try to send a query
   - Verify error toast appears

7. Performance:
   - Open DevTools Network tab
   - Note launcher.js and launcher.css sizes
   - Check Lighthouse score
*/

// ============================================================================
// DEBUGGING TIPS
// ============================================================================

// Enable verbose logging:
window.DEBUG_LAUNCHER = true;

if (window.DEBUG_LAUNCHER) {
  console.log('[LAUNCHER] Initialization started');
  console.log('[LAUNCHER] Container:', document.getElementById('chat-launcher'));
  console.log('[LAUNCHER] Voice API available:', !!window.SpeechRecognition);
  console.log('[LAUNCHER] localStorage available:', typeof(Storage) !== "undefined");
}

export {
  handleUserQuery,
  addMessageToChat,
  handleQuickActionWithContext
};
