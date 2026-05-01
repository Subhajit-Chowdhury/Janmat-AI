/**
 * Calls the JanMat AI Server (Generative AI Backend)
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Network response was not ok');
    }

    return data.response;
  } catch (error) {
    console.error('Chat Error:', error);
    return `Namaste! I'm having a bit of a technical glitch. Error details: ${error.message}`;
  }
}
