import Groq from 'groq-sdk';

let defaultGroqClient: Groq | null = null;

export function getGroqClient(customApiKey?: string | null): Groq {
  const apiKey = customApiKey?.trim() || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY is not configured. Please enter your Groq API key in Settings or add it to .env.local'
    );
  }

  if (customApiKey && customApiKey.trim()) {
    return new Groq({ apiKey: customApiKey.trim(), dangerouslyAllowBrowser: true });
  }

  if (!defaultGroqClient) {
    defaultGroqClient = new Groq({ apiKey, dangerouslyAllowBrowser: true });
  }
  return defaultGroqClient;
}

export const GROQ_DEFAULT_VISION_MODEL = 'qwen/qwen3.6-27b';
export const GROQ_DEFAULT_TEXT_MODEL = 'qwen/qwen3.6-27b';

/**
 * Extracts the first valid JSON value (object or array) from a model response
 * that may include <think> tags, markdown code fences, or conversational prose.
 */
export function extractJson<T>(raw: string): T {
  let text = raw.trim();

  // 1. Strip reasoning/thinking tags (e.g. <think>...</think>)
  text = text.replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '').trim();

  // 2. Extract content from markdown code fences if present (prefer the last fence if multiple)
  const fenceMatches = Array.from(text.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi));
  if (fenceMatches.length > 0) {
    text = fenceMatches[fenceMatches.length - 1][1].trim();
  }

  // 3. Find the outermost { or [
  const firstBrace = text.search(/[{[]/);
  if (firstBrace >= 0) {
    text = text.slice(firstBrace);
  }

  // 4. Trim trailing non-JSON characters after the last } or ]
  const lastBrace = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  if (lastBrace !== -1 && lastBrace < text.length - 1) {
    text = text.slice(0, lastBrace + 1);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    // 5. Attempt minor JSON cleanups (trailing commas, smart quotes, comments)
    const cleaned = text
      .replace(/,\s*([}\]])/g, '$1') // trailing commas
      .replace(/[\u201C\u201D]/g, '"') // smart double quotes
      .replace(/[\u2018\u2019]/g, "'") // smart single quotes
      .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1'); // line or block comments

    try {
      return JSON.parse(cleaned) as T;
    } catch {
      // 6. Deep extraction fallback: find any valid JSON block using iterative scan
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '{' || text[i] === '[') {
          for (let j = text.length - 1; j > i; j--) {
            if (
              (text[i] === '{' && text[j] === '}') ||
              (text[i] === '[' && text[j] === ']')
            ) {
              const candidate = text.slice(i, j + 1).replace(/,\s*([}\]])/g, '$1');
              try {
                return JSON.parse(candidate) as T;
              } catch {
                // Continue scanning
              }
            }
          }
        }
      }

      throw new Error(
        `Failed to parse JSON from AI response.\nRaw snippet: ${raw.slice(0, 350)}`
      );
    }
  }
}

/** Converts a data URL (data:image/png;base64,....) into standard base64 format. */
export function dataUrlToBase64(dataUrl: string): { mediaType: string; base64: string; fullDataUrl: string } {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.*)$/);
  if (!match) {
    throw new Error('Invalid image data URL provided.');
  }
  return { mediaType: match[1], base64: match[2], fullDataUrl: dataUrl };
}

/**
 * Robust wrapper to call Groq completions with retry capability
 */
export async function callGroqWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  delayMs = 1200
): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      console.warn(`Groq API attempt ${attempt} failed: ${err.message || err}`);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  throw lastError;
}
