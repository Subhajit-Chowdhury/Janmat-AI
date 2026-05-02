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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Network response was not ok');
    }

    return data.response;
  } catch (error) {
    console.error('Chat Error:', error);
    throw error; // Re-throw for better error handling in UI
  }
}
