import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient, GROQ_DEFAULT_VISION_MODEL, extractJson, callGroqWithRetry } from '@/lib/groq';
import type { AnswerBlock, PageImage } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an expert handwritten student exam answer sheet evaluator.
You will be provided with page images of a student's handwritten answer sheet.

Identify each distinct handwritten answer block or section on each page.

For each answer block, output:
- "rawLabel": The question number or label the student wrote next to the answer (e.g. "Q1.", "Q2.", "3", "11 a.", "Q11(b)"). If no label is visible, output null.
- "text": Best-effort transcription of the handwriting, chemical formulas, equations, or descriptions of drawings in this block.
- "pageIndex": The 0-based page index where this answer appears.
- "bbox": The bounding box surrounding the answer's handwritten content on that page, measured as PERCENTAGES (0 to 100) of the full page dimensions:
    - x: percentage from left edge (0-100)
    - y: percentage from top edge (0-100)
    - width: percentage width of the bounding box (0-100)
    - height: percentage height of the bounding box (0-100)

Rules:
1. Provide accurate bounding boxes that wrap the student's handwriting and diagrams for that answer block.
2. If an answer continues across multiple pages, output separate answer blocks for each page (one per page).
3. If questions were answered out of order, record the raw label as written.
4. Output ONLY valid JSON. Do NOT output reasoning or conversational text.

Expected JSON Shape:
{
  "answers": [
    {
      "rawLabel": "Q1.",
      "text": "Photosynthesis is the process used by green plants...",
      "pageIndex": 0,
      "bbox": { "x": 5, "y": 7, "width": 90, "height": 34 }
    },
    {
      "rawLabel": "Q2.",
      "text": "The process mainly occurs in the chloroplast...",
      "pageIndex": 0,
      "bbox": { "x": 5, "y": 43, "width": 90, "height": 16 }
    }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pages: PageImage[] = body.pages;
    const customApiKey: string | undefined = req.headers.get('x-groq-api-key') || body.apiKey;

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ error: 'No answer sheet pages provided.' }, { status: 400 });
    }

    const groq = getGroqClient(customApiKey);

    const contentBlocks: any[] = [];
    pages.forEach((page) => {
      contentBlocks.push({
        type: 'text',
        text: `Answer Sheet - Page ${page.pageIndex + 1}:`
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
      text: 'Segment all student handwritten answers on these pages and provide their bounding boxes and text. Return only JSON.'
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
      answers: {
        rawLabel: string | null;
        text: string;
        pageIndex: number;
        bbox: { x: number; y: number; width: number; height: number };
      }[];
    }>(rawResponse);

    if (!parsed || !Array.isArray(parsed.answers)) {
      throw new Error('Groq model returned unexpected answer segmentation format.');
    }

    const answers: AnswerBlock[] = parsed.answers.map((a, idx) => ({
      id: `ans-${idx + 1}`,
      rawLabel: a.rawLabel ?? null,
      text: a.text || '',
      pageIndex: a.pageIndex ?? 0,
      bbox: clampBbox(a.bbox)
    }));

    return NextResponse.json({ answers });
  } catch (err: any) {
    console.error('extract-answers error:', err);
    return NextResponse.json(
      {
        error:
          err.message ||
          'Failed to extract answers from answer sheet. Please check your Groq API key in Settings.'
      },
      { status: 500 }
    );
  }
}

function clampBbox(bbox: { x: number; y: number; width: number; height: number } | undefined) {
  const clamp = (v: number) => Math.max(0, Math.min(100, isNaN(v) ? 0 : v));
  return {
    x: clamp(bbox?.x ?? 5),
    y: clamp(bbox?.y ?? 5),
    width: Math.max(5, clamp(bbox?.width ?? 90)),
    height: Math.max(4, clamp(bbox?.height ?? 15))
  };
}
