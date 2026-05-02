/**
 * Calls the JanMat AI Server (Generative AI Backend)
 * @param {string} prompt - User's query
 * @param {string} [sessionId] - Optional session ID for conversation continuity
 * @returns {Promise<string>} - AI response
 */
export async function askJanMat(prompt, sessionId = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt }),
    });

    // Handle non-JSON responses gracefully
    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      const text = await response.text();
      if (!text || text.trim().length === 0) {
        throw new Error('Server returned an empty response. Please try again.');
      }
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error('Server returned an invalid response. Please try again.');
      }
    } else {
      // Non-JSON response (e.g. HTML error page)
      const rawText = await response.text();
      throw new Error(
        response.status >= 500
          ? 'Server is temporarily unavailable. Please try again in a moment.'
          : rawText.substring(0, 200) || 'Unexpected server response.'
      );
    }

    if (!response.ok) {
      throw new Error(data.error || `Server error (${response.status}). Please try again.`);
    }

    if (!data.response) {
      throw new Error('AI did not return a response. Please rephrase your question.');
    }

    return data.response;
  } catch (error) {
    console.error('Chat Error:', error);
    // Provide user-friendly error messages
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    throw error;
  }
}
