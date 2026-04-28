import { describe, it, expect, vi } from 'vitest';
import { askJanMat } from './gemini.js';
import { logChatSession } from './firebase.js';

// Mocking global objects and imports
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockImplementation(() => ({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => 'Mocked AI Response'
        }
      })
    }))
  }))
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: 'mock-id' }),
  serverTimestamp: vi.fn()
}));

describe('JanMat AI API Tests', () => {
  it('askJanMat should return AI response', async () => {
    const response = await askJanMat('How to register?');
    expect(response).toBeDefined();
    // Since we mock the underlying call, we check if it returns a string
    expect(typeof response).toBe('string');
  });

  it('logChatSession should execute without error', async () => {
    await expect(logChatSession('test query', 'test response')).resolves.not.toThrow();
  });
});
