import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient, GROQ_DEFAULT_VISION_MODEL, extractJson, callGroqWithRetry } from '@/lib/groq';
import type { ExtractedQuestion, PageImage } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an expert exam paper parser. You will be provided with page images of an official question paper in printed page order.

Extract every question exactly as printed, in the correct printed order.

Rules:
1. Treat every labelled sub-part as its own separate question entry. For example, "11 (a)" and "11 (b)" (or "11 a.", "11 b.") must be two separate entries, each with its own "number" field (e.g. "11 a.", "11 b.").
2. Preserve the original numbering and labelling style exactly as printed (including roman numerals, letters, parentheses).
3. Extract the full question text including descriptions, choices, or instructions for that question.
4. If marks are printed for a question (e.g. "[2 marks]", "(5)", "10 Marks"), capture the number in "marks". If not present, use null.
5. Record the 0-based page index where each question appears in "pageIndex".
6. Output ONLY a valid JSON object without markdown formatting or conversational text.

Expected JSON Shape:
{
  "questions": [
    {
      "number": "1",
      "text": "Which blood vessel carries blood away from the heart?",
      "marks": 2,
      "pageIndex": 0
    },
    {
      "number": "11 a.",
      "text": "A diagram shows two potted plants...",
      "marks": 2,
      "pageIndex": 1
    }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pages: PageImage[] = body.pages;
    const customApiKey: string | undefined = req.headers.get('x-groq-api-key') || body.apiKey;

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ error: 'No question paper pages provided.' }, { status: 400 });
    }

    const groq = getGroqClient(customApiKey);

    // Build Groq Vision user message content
    const contentBlocks: any[] = [];
    pages.forEach((page) => {
      contentBlocks.push({
        type: 'text',
        text: `Question Paper - Page ${page.pageIndex + 1}:`
      });
      contentBlocks.push({
        type: 'image_url',
        image_url: {
          url: page.dataUrl
        }
      });
    });

    contentBlocks.push({
      type: 'text',
      text: 'Extract all questions from the question paper following the rules and return only the JSON object.'
    });

    const completion: any = await callGroqWithRetry<any>(() =>
      (groq.chat.completions.create as any)({
        model: GROQ_DEFAULT_VISION_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: contentBlocks }
        ],
        temperature: 0.1,
        max_tokens: 4096,
        reasoning_effort: 'none'
      })
    );

    const rawResponse = completion?.choices?.[0]?.message?.content || '';
    const parsed = extractJson<{
      questions: { number: string; text: string; marks: number | null; pageIndex: number }[];
    }>(rawResponse);

    if (!parsed || !Array.isArray(parsed.questions)) {
      throw new Error('Groq model returned unexpected question data format.');
    }

    const questions: ExtractedQuestion[] = parsed.questions.map((q, idx) => ({
      id: `q-${idx + 1}-${slugify(q.number || String(idx + 1))}`,
      number: q.number || String(idx + 1),
      text: q.text,
      marks: q.marks ?? null,
      maxMarks: q.marks ?? null,
      pageIndex: q.pageIndex ?? 0
    }));

    return NextResponse.json({ questions });
  } catch (err: any) {
    console.error('extract-questions error:', err);
    return NextResponse.json(
      {
        error:
          err.message ||
          'Failed to extract questions from question paper. Please check your Groq API key in Settings.'
      },
      { status: 500 }
    );
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 20);
}
