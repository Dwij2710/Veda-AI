import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractJson, dataUrlToBase64, getGroqClient, callGroqWithRetry } from '@/lib/groq';

describe('lib/groq.ts - JSON and Data URL Utilities', () => {
  describe('extractJson', () => {
    it('should parse standard JSON object', () => {
      const input = '{"questions": [{"number": "1", "text": "What is biology?"}]}';
      const result = extractJson<{ questions: { number: string; text: string }[] }>(input);
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].number).toBe('1');
    });

    it('should extract JSON wrapped in markdown code blocks', () => {
      const input = `Here is your extracted output:
\`\`\`json
{
  "answers": [
    { "rawLabel": "Q1.", "text": "Photosynthesis process" }
  ]
}
\`\`\`
Hope this helps!`;
      const result = extractJson<{ answers: { rawLabel: string; text: string }[] }>(input);
      expect(result.answers).toHaveLength(1);
      expect(result.answers[0].rawLabel).toBe('Q1.');
    });

    it('should strip <think> reasoning tags emitted by Qwen/DeepSeek models', () => {
      const input = `<think>
The user wants to segment the handwritten answers from the image.
Looking at Q1, Q2...
</think>
\`\`\`json
{
  "answers": [
    { "rawLabel": "Q1.", "text": "Photosynthesis is the process..." }
  ]
}
\`\`\``;
      const result = extractJson<{ answers: { rawLabel: string; text: string }[] }>(input);
      expect(result.answers).toHaveLength(1);
      expect(result.answers[0].rawLabel).toBe('Q1.');
    });

    it('should clean trailing commas before closing braces', () => {
      const input = '{"number": "1", "score": 2, }';
      const result = extractJson<{ number: string; score: number }>(input);
      expect(result.number).toBe('1');
      expect(result.score).toBe(2);
    });

    it('should replace unicode smart quotes with valid JSON quotes', () => {
      const input = '{\u201Ctitle\u201D: \u201CTest Assessment\u201D}';
      const result = extractJson<{ title: string }>(input);
      expect(result.title).toBe('Test Assessment');
    });

    it('should throw an error for unparseable garbage input', () => {
      expect(() => extractJson('This is purely text with no json at all.')).toThrow(
        /Failed to parse JSON/
      );
    });
  });

  describe('dataUrlToBase64', () => {
    it('should extract mediaType and base64 from a valid PNG data URL', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const result = dataUrlToBase64(dataUrl);
      expect(result.mediaType).toBe('image/png');
      expect(result.base64).toBe('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    });

    it('should extract mediaType from a JPEG data URL', () => {
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/';
      const result = dataUrlToBase64(dataUrl);
      expect(result.mediaType).toBe('image/jpeg');
    });

    it('should throw an error on invalid data URLs', () => {
      expect(() => dataUrlToBase64('invalid-string')).toThrow('Invalid image data URL provided.');
    });
  });

  describe('getGroqClient', () => {
    const originalEnv = process.env.GROQ_API_KEY;

    beforeEach(() => {
      process.env.GROQ_API_KEY = originalEnv;
    });

    it('should initialize with custom API key provided', () => {
      const client = getGroqClient('gsk_test_custom_key_123');
      expect(client).toBeDefined();
      expect(client.apiKey).toBe('gsk_test_custom_key_123');
    });

    it('should initialize with environment variable if no custom key is provided', () => {
      process.env.GROQ_API_KEY = 'gsk_test_env_key_456';
      const client = getGroqClient();
      expect(client).toBeDefined();
      expect(client.apiKey).toBe('gsk_test_env_key_456');
    });

    it('should throw an error if no API key is available', () => {
      delete process.env.GROQ_API_KEY;
      expect(() => getGroqClient(null)).toThrow(/GROQ_API_KEY is not configured/);
    });
  });

  describe('callGroqWithRetry', () => {
    it('should succeed immediately when function succeeds on attempt 1', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const result = await callGroqWithRetry(mockFn, 2, 10);
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and return result on subsequent success', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Rate limit exceeded'))
        .mockResolvedValueOnce('recovered');

      const result = await callGroqWithRetry(mockFn, 2, 10);
      expect(result).toBe('recovered');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should throw error after exhausting all retries', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Persistent error'));
      await expect(callGroqWithRetry(mockFn, 2, 10)).rejects.toThrow('Persistent error');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
});
