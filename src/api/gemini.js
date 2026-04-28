/**
 * Calls the JanMat AI Server (Vertex AI Backend)
 * @param {string} prompt - User's query
 * @returns {Promise<string>} - AI response
 */
export async function askJanMat(prompt) {
  try {
    // In development, we use relative URL which Vite proxies or we call localhost:8080
    // In production (Cloud Run), the frontend and backend are on the same domain
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Chat Error:', error);
    return "Namaste! I'm having a bit of a technical glitch. Please try asking again in a moment.";
  }
}
