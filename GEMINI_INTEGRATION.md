# Gemini Chat Launcher Integration Guide

## Overview

The **Gemini Chat Launcher** module provides a modern, Google Gemini-inspired chat interface for Janmat-AI. It enhances the existing chatbot with:

- 🎤 Voice input support (Speech Recognition API)
- ⚡ Quick action chips (pre-formatted prompts)
- 🍀 "I'm feeling lucky" button (random questions)
- ⚙️ Settings modal (language, theme, preferences)
- 📱 Responsive design (mobile-first)
- ♿ ARIA accessibility labels
- 🎨 Glassmorphism UI (matches existing design)

## Files Included

```
├── src/
│   └── gemini-chat-launcher.js       # Main launcher module (ES6)
├── gemini-chat-launcher.css          # Styling (glassmorphism)
└── GEMINI_INTEGRATION.md             # This file
```

## Installation

### Step 1: Add the CSS to Your HTML

Add the launcher stylesheet to your `index.html` `<head>`:

```html
<link rel="stylesheet" href="./gemini-chat-launcher.css">
```

### Step 2: Import the Module in main.js

```javascript
import GeminiChatLauncher from './src/gemini-chat-launcher.js';
```

### Step 3: Initialize with Your Controller

In your `main.js`, initialize the launcher and connect it to your API:

```javascript
// After your existing API initialization
import GeminiChatLauncher from './src/gemini-chat-launcher.js';
import { sendQueryToGemini } from './src/api/gemini.js';

// Initialize the launcher
const launcher = new GeminiChatLauncher(
  'chat-launcher',  // Container ID in HTML
  {
    sendQuery: async (query) => {
      try {
        const response = await sendQueryToGemini(query);
        // Handle response and display in chat
        displayMessage(response, 'ai');
      } catch (error) {
        console.error('Query failed:', error);
        launcher.showToast('Failed to get response', 'error');
      }
    }
  }
);
```

### Step 4: Add Container to HTML

Add a div with ID `chat-launcher` to your `index.html`:

```html
<body>
  <!-- Add this before your existing #app div -->
  <div id="chat-launcher"></div>
  
  <!-- Existing content -->
  <div id="app">
    <!-- ... -->
  </div>
</body>
```

## API Reference

### Constructor

```javascript
new GeminiChatLauncher(containerId, mainController)
```

**Parameters:**
- `containerId` (string): HTML element ID where launcher will render
- `mainController` (object): Your controller with methods:
  - `sendQuery(query: string)`: Handle user queries

### Methods

#### `handleQuery(query)`
Send a user query to the controller.

```javascript
launcher.handleQuery('How do I register to vote?');
```

#### `showToast(message, type)`
Display a notification toast.

```javascript
launcher.showToast('Settings saved!', 'success');
// Types: 'success', 'error', 'warning', 'info'
```

#### `transitionToChat()`
Animate from launcher view to chat view.

```javascript
launcher.transitionToChat();
```

## Quick Actions Configuration

Quick action chips are predefined prompts. Customize them by editing `handleQuickAction()` in `gemini-chat-launcher.js`:

```javascript
handleQuickAction(action) {
  const prompts = {
    register: 'How can I register as a voter in India?',
    forms: 'Guide me through the ECI voter registration forms',
    // Add more actions here
  };
  // ...
}
```

To add new chips, update the HTML in `init()`:

```html
<div class="quick-action-chip" data-action="your-action">
  <span class="chip-icon">🎯</span>
  <span class="chip-text">Your Action</span>
</div>
```

## Lucky Button Customization

Customize the random questions by editing `handleLuckyClick()`:

```javascript
handleLuckyClick() {
  const luckyQuestions = [
    'Your question here?',
    'Another question?',
    // Add more questions
  ];
  // ...
}
```

## Voice Input Setup

The module uses the Web Speech API (Chrome, Edge, Safari). It automatically:
- Detects available Speech Recognition API
- Sets language to `en-IN` (Indian English)
- Provides fallback for unsupported browsers
- Shows visual feedback during recording

**Mobile Note:** Voice input may require user permission on some devices.

## Settings Modal

Users can configure:
- **Language**: English, हिंदी, తెలుగు, தமிழ், മലയാളം (extensible)
- **Theme**: Dark, Light, Auto
- **Voice Input**: Enable/disable
- **Analytics**: Share anonymous usage data

Settings are saved to `localStorage` as `janmat_settings` JSON.

**Access settings:**
```javascript
const settings = JSON.parse(localStorage.getItem('janmat_settings'));
if (settings && settings.language) {
  // Use language preference
}
```

## Styling Customization

### Color Scheme

Edit CSS variables in `gemini-chat-launcher.css` or your existing `style.css`:

```css
:root {
  --accent-primary: #3b82f6;      /* Blue */
  --accent-secondary: #8b5cf6;    /* Purple */
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
}
```

### Animations

Customize animation timings:

```css
.launcher-content {
  animation: contentSlideUp 0.8s ease-out; /* Adjust duration/easing */
}
```

### Responsive Breakpoints

Launcher is mobile-optimized with breakpoints at:
- Desktop: Full width (900px max)
- Tablet: 768px and below
- Mobile: 480px and below

## Integration Example (Complete)

```javascript
// main.js
import GeminiChatLauncher from './src/gemini-chat-launcher.js';
import { queryGeminiAPI } from './src/api/gemini.js';
import { saveToFirestore } from './src/api/firebase.js';

// Initialize launcher
const launcher = new GeminiChatLauncher('chat-launcher', {
  async sendQuery(userQuery) {
    try {
      // Show loading state
      document.querySelector('.chat-messages').innerHTML += 
        '<div class="message loading">JanMat is thinking...</div>';

      // Query Gemini
      const aiResponse = await queryGeminiAPI(userQuery);

      // Save to Firestore
      await saveToFirestore({
        query: userQuery,
        response: aiResponse,
        timestamp: new Date(),
        userId: getCurrentUserId()
      });

      // Display response
      document.querySelector('.chat-messages').innerHTML +=
        `<div class="message ai">${aiResponse}</div>`;

      // Transition to chat view
      launcher.transitionToChat();
    } catch (error) {
      launcher.showToast('Error: ' + error.message, 'error');
    }
  }
});

// Listen for launcher interactions
document.addEventListener('launcher-ready', () => {
  console.log('Gemini Chat Launcher initialized');
});
```

## Accessibility Features

✅ ARIA labels on all interactive elements  
✅ Keyboard navigation support (Enter to send)  
✅ Semantic HTML structure  
✅ High contrast colors (WCAG AA)  
✅ Focus indicators on buttons  

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Includes Voice API |
| Edge | ✅ Full | Includes Voice API |
| Firefox | ⚠️ Partial | Voice API unavailable |
| Safari | ✅ Full | Includes Voice API |
| Mobile Chrome | ✅ Full | Requires permission |
| Mobile Safari | ✅ Full | Requires permission |

## Performance Optimization

### Lighthouse Scores

To optimize performance:

1. **Lazy load animations**
   ```javascript
   // Only animate on user interaction
   const options = {
     threshold: 0.1,
     rootMargin: '50px'
   };
   ```

2. **Minimize reflows**
   - Batch DOM updates
   - Use `requestAnimationFrame` for animations

3. **Optimize images**
   - SVG icons already optimized
   - Emoji rendering is native (no images)

### Bundle Size

- `gemini-chat-launcher.js`: ~6KB minified
- `gemini-chat-launcher.css`: ~8KB minified
- **Total with gzip**: ~5KB

## Troubleshooting

### Voice Input Not Working

```javascript
// Check if Speech API is available
console.log(!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

// Grant microphone permission on mobile
// Browser will prompt automatically on first use
```

### Settings Not Persisting

```javascript
// Verify localStorage is available
if (typeof(Storage) !== "undefined") {
  localStorage.setItem('test', 'value');
  console.log('localStorage available');
}

// Check browser privacy mode (may disable localStorage)
```

### Styling Not Applied

1. Ensure CSS file is linked in `<head>`
2. Check CSS variable definitions in `:root`
3. Verify no conflicting CSS rules
4. Clear browser cache (Ctrl+Shift+Delete)

### Launcher Not Rendering

```javascript
// Verify container exists
const container = document.getElementById('chat-launcher');
if (!container) {
  console.error('Container #chat-launcher not found in HTML');
}

// Check for JavaScript errors
console.log('GeminiChatLauncher loaded:', typeof GeminiChatLauncher);
```

## Event Handling

Listen for launcher events:

```javascript
// When launcher initializes
window.addEventListener('launcher-ready', () => {
  console.log('Launcher ready');
});

// When user sends a message
document.addEventListener('message-sent', (e) => {
  console.log('User query:', e.detail.query);
});

// When settings change
document.addEventListener('settings-changed', (e) => {
  console.log('New settings:', e.detail.settings);
});
```

## Advanced: Custom Voice Recognition

Override voice behavior:

```javascript
class CustomGeminiLauncher extends GeminiChatLauncher {
  initVoiceRecognition() {
    const recognition = super.initVoiceRecognition();
    
    // Add custom behavior
    recognition.onstart = () => {
      console.log('Recording started...');
      // Play sound, show indicator, etc.
    };
    
    return recognition;
  }
}
```

## Advanced: Custom Analytics

Track user interactions:

```javascript
const launcher = new GeminiChatLauncher('chat-launcher', {
  async sendQuery(query) {
    // Track event
    gtag('event', 'launcher_query', {
      query_length: query.length,
      query_type: 'voice' // or 'text' or 'chip'
    });
    
    // Send to Gemini API
    // ...
  }
});
```

## Migration from Old UI

If replacing an existing chat UI:

1. **Backup old HTML**: Save current `index.html`
2. **Update imports**: Add new CSS/JS imports
3. **Test flows**: Ensure all queries work
4. **Monitor errors**: Check browser console
5. **Gather feedback**: User test for UX

### Breaking Changes

None! The launcher is designed to coexist with existing UI.

## Support & Feedback

For issues or feature requests:
1. Check browser console for errors
2. Verify all files are correctly linked
3. Test in different browser (rule out compatibility)
4. Review integration guide above
5. Contact: [your-support-email]

## License

Same as Janmat-AI parent project.

---

**Last Updated:** May 2, 2026  
**Version:** 1.0.0  
**Compatibility:** Janmat-AI main branch
