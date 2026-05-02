/**
 * Gemini Chat Interface Module
 * Implements the Google Gemini-style chat UI with quick actions, voice input, and lucky button
 * Integrates with existing main.js controller
 */

export class GeminiChatLauncher {
  constructor(containerId = 'chat-launcher', mainController) {
    this.container = document.getElementById(containerId);
    this.mainController = mainController;
    this.isVoiceActive = false;
    this.voiceRecognition = this.initVoiceRecognition();
    this.init();
  }

  /**
   * Initialize voice recognition API
   */
  initVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not available');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Support Indian English

    recognition.onstart = () => {
      this.isVoiceActive = true;
      document.querySelector('.mic-btn')?.classList.add('active');
    };

    recognition.onend = () => {
      this.isVoiceActive = false;
      document.querySelector('.mic-btn')?.classList.remove('active');
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (event.results[event.results.length - 1].isFinal) {
        this.handleQuery(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.showToast(`Voice error: ${event.error}`, 'error');
    };

    return recognition;
  }

  /**
   * Initialize the launcher UI
   */
  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="gemini-launcher">
        <div class="launcher-backdrop"></div>
        
        <div class="launcher-content">
          <div class="launcher-header">
            <h1 class="launcher-title">Ask JanMat</h1>
            <p class="launcher-subtitle">Your AI guide for Indian elections and voter registration</p>
          </div>

          <div class="launcher-search">
            <div class="search-input-wrapper">
              <div class="input-left-actions">
                <button class="action-icon mic-btn" id="voice-input-btn" 
                        aria-label="Voice Input" title="Click to speak">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </button>
              </div>
              
              <textarea id="launcher-input" 
                        placeholder="Ask about voter registration, election forms, voting process..."
                        rows="1"
                        aria-label="Search JanMat"></textarea>
              
              <div class="input-right-actions">
                <button class="action-icon settings-btn" id="settings-btn"
                        aria-label="Settings" title="Settings">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l1.72-1.35c.15-.12.19-.34.1-.51l-1.63-2.82c-.12-.22-.37-.29-.59-.22l-2.03.81c-.42-.32-.9-.6-1.44-.79l-.31-2.15c-.05-.24-.24-.41-.48-.41h-3.26c-.24 0-.43.17-.48.41l-.31 2.15c-.54.19-1.02.47-1.44.79l-2.03-.81c-.22-.09-.47 0-.59.22l-1.63 2.82c-.1.17-.06.39.1.51l1.72 1.35c-.05.3-.07.62-.07.94s.02.64.07.94l-1.72 1.35c-.15.12-.19.34-.1.51l1.63 2.82c.12.22.37.29.59.22l2.03-.81c.42.32.9.6 1.44.79l.31 2.15c.05.24.24.41.48.41h3.26c.24 0 .43-.17.48-.41l.31-2.15c.54-.19 1.02-.47 1.44-.79l2.03.81c.22.09.47 0 .59-.22l1.63-2.82c.1-.17.06-.39-.1-.51l-1.72-1.35zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <button class="lucky-btn" id="lucky-btn">
            <svg viewBox="0 0 20 20" width="20" height="20">
              <path fill="currentColor" d="M10.5 1.5H5.75A4.25 4.25 0 0 0 1.5 5.75v8.5A4.25 4.25 0 0 0 5.75 18.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-4.75"/>
              <path fill="currentColor" d="M17 2l-6.5 6.5M17 2h-3m3 0v3"/>
              <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.3"/>
            </svg>
            I'm feeling lucky
          </button>

          <div class="quick-actions">
            <div class="quick-action-chip" data-action="register">
              <span class="chip-icon">🗳️</span>
              <span class="chip-text">Voter Registration</span>
            </div>
            
            <div class="quick-action-chip" data-action="forms">
              <span class="chip-icon">📋</span>
              <span class="chip-text">ECI Forms Guide</span>
            </div>
            
            <div class="quick-action-chip" data-action="eligibility">
              <span class="chip-icon">✅</span>
              <span class="chip-text">Check Eligibility</span>
            </div>
            
            <div class="quick-action-chip" data-action="nvsp">
              <span class="chip-icon">🔗</span>
              <span class="chip-text">NVSP Portal</span>
            </div>

            <div class="quick-action-chip" data-action="status">
              <span class="chip-icon">📍</span>
              <span class="chip-text">Voter Status</span>
            </div>

            <div class="quick-action-chip" data-action="updates">
              <span class="chip-icon">📢</span>
              <span class="chip-text">Election Updates</span>
            </div>
          </div>

          <div class="launcher-footer">
            <p>Powered by Gemini 2.0 Flash • Grounded by Google Search • Secure • Multilingual 🇮🇳</p>
          </div>
        </div>
      </div>

      <div id="toast-container" class="toast-container"></div>
    `;

    this.attachEventListeners();
  }

  /**
   * Attach event listeners to UI elements
   */
  attachEventListeners() {
    // Voice input
    document.getElementById('voice-input-btn')?.addEventListener('click', () => {
      if (this.voiceRecognition) {
        if (this.isVoiceActive) {
          this.voiceRecognition.stop();
        } else {
          this.voiceRecognition.start();
        }
      } else {
        this.showToast('Voice input not available in your browser', 'warning');
      }
    });

    // Settings button
    document.getElementById('settings-btn')?.addEventListener('click', () => {
      this.showSettings();
    });

    // Lucky button
    document.getElementById('lucky-btn')?.addEventListener('click', () => {
      this.handleLuckyClick();
    });

    // Text input
    const input = document.getElementById('launcher-input');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleQuery(input.value);
        }
      });

      // Auto-expand textarea
      input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      });
    }

    // Quick action chips
    document.querySelectorAll('.quick-action-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleQuickAction(action);
      });
    });
  }

  /**
   * Handle user query
   */
  handleQuery(query) {
    if (!query.trim()) return;

    // Clear input
    const input = document.getElementById('launcher-input');
    if (input) {
      input.value = '';
      input.style.height = 'auto';
    }

    // Delegate to main controller
    if (this.mainController && this.mainController.sendQuery) {
      this.mainController.sendQuery(query);
      this.transitionToChat();
    }
  }

  /**
   * Handle quick action chips
   */
  handleQuickAction(action) {
    const prompts = {
      register: 'How can I register as a voter in India? What are the requirements?',
      forms: 'Guide me through the ECI voter registration forms (Form 6, 7, 8)',
      eligibility: 'Am I eligible to vote? What are the eligibility criteria?',
      nvsp: 'How do I use the National Voter Service Portal (NVSP)?',
      status: 'How can I check my voter registration status?',
      updates: 'What are the latest election updates and announcements?'
    };

    const prompt = prompts[action] || 'Tell me about voter registration';
    this.handleQuery(prompt);
  }

  /**
   * Handle lucky button - random election-related question
   */
  handleLuckyClick() {
    const luckyQuestions = [
      'What is the voting age in India?',
      'How many votes does each voter get in general elections?',
      'What is the role of the Election Commission of India?',
      'How are constituencies divided in India?',
      'What is the National Register of Citizens?',
      'How long does voter registration processing take?',
      'Can I update my voter registration details online?',
      'What documents do I need to bring to vote?',
      'How is the voter ID card issued?',
      'What is the difference between general elections and bye-elections?'
    ];

    const randomQuestion = luckyQuestions[Math.floor(Math.random() * luckyQuestions.length)];
    this.handleQuery(randomQuestion);
  }

  /**
   * Show settings modal
   */
  showSettings() {
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.innerHTML = `
      <div class="settings-content">
        <div class="settings-header">
          <h2>Settings</h2>
          <button class="close-btn" aria-label="Close">&times;</button>
        </div>
        
        <div class="settings-body">
          <div class="setting-item">
            <label for="lang-select">Language</label>
            <select id="lang-select">
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
              <option value="te">తెలుగు</option>
              <option value="ml">മലയാളം</option>
            </select>
          </div>

          <div class="setting-item">
            <label for="theme-select">Theme</label>
            <select id="theme-select">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div class="setting-item">
            <label>
              <input type="checkbox" id="voice-preference" checked>
              Enable voice input
            </label>
          </div>

          <div class="setting-item">
            <label>
              <input type="checkbox" id="analytics-preference" checked>
              Share anonymous usage data
            </label>
          </div>
        </div>

        <div class="settings-footer">
          <button class="btn-secondary close-modal">Close</button>
          <button class="btn-primary save-settings">Save Settings</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event handlers
    modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('.save-settings').addEventListener('click', () => {
      this.saveSettings(modal);
      modal.remove();
      this.showToast('Settings saved successfully', 'success');
    });

    // Prevent text input when modal is open
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  /**
   * Save user settings
   */
  saveSettings(modal) {
    const settings = {
      language: modal.querySelector('#lang-select').value,
      theme: modal.querySelector('#theme-select').value,
      voiceEnabled: modal.querySelector('#voice-preference').checked,
      analyticsEnabled: modal.querySelector('#analytics-preference').checked
    };

    // Save to localStorage
    localStorage.setItem('janmat_settings', JSON.stringify(settings));

    // Apply settings
    if (settings.language !== 'en') {
      this.showToast(`Language switched to ${settings.language}`, 'info');
    }
    if (settings.theme !== 'dark') {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
  }

  /**
   * Transition from launcher to chat view
   */
  transitionToChat() {
    const launcher = document.querySelector('.gemini-launcher');
    if (launcher) {
      launcher.style.opacity = '0';
      launcher.style.transform = 'scale(0.95)';
      setTimeout(() => {
        launcher.style.display = 'none';
      }, 300);
    }
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container') || this.createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Create toast container if not exists
   */
  createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }
}

// Export for use in main.js
export default GeminiChatLauncher;
