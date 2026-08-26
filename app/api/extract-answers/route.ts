import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient, GROQ_DEFAULT_VISION_MODEL, extractJson, callGroqWithRetry } from '@/lib/groq';
import type { AnswerBlock, PageImage } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a high-precision document layout analysis and OCR vision assistant for student handwritten answer sheets.
You will be provided with page images of a student's handwritten answer sheet.

Identify every distinct handwritten answer block on each page and calculate precise, non-overlapping bounding boxes.

For each answer block, output:
- "rawLabel": The question number or label the student wrote next to the answer (e.g. "Q1.", "Q2.", "Q3.", "Q4.", "11 a.", "11 b."). If no label is visible, output null.
- "text": Exact transcription of the student's handwritten response (including formulas, equations, or diagram descriptions).
- "pageIndex": The 0-based page index (0 for page 1).
- "bbox": The tight bounding rectangle enclosing that answer block, measured as PERCENTAGES (0 to 100) of the total image dimensions:
    - "x": percentage from the left margin (typically 3% to 6%).
    - "y": percentage from the top edge where this specific answer begins. MUST start immediately ABOVE the question label (e.g. above "Q1.", "Q2.", "Q3.", "Q4.") so the entire label and the first line of handwriting are completely enclosed.
    - "width": percentage width covering the content from left margin to right margin (typically 88% to 94%).
    - "height": vertical percentage height spanning from the top of the question label down to the bottom of the last line of that answer block.

Critical Bounding Box Rules:
1. Precise Vertical Start ("y"): "y" MUST be positioned at the top of the written label for that question. Do NOT shift down or cut off the top line.
2. No Overlaps: The bottom of an answer ("y + height") must NEVER overlap into the next question's label below it. Leave a clear gap before the next question starts.
3. Full Coverage: Ensure the bounding box height cleanly covers the complete answer (text, equations, diagrams) without spilling into subsequent questions.
4. Output Format: Output ONLY valid raw JSON with no conversational commentary or markdown explanations.

Expected JSON Shape:
{
  "answers": [
    {
      "rawLabel": "Q1.",
      "text": "The pH value of a neutral solution...",
      "pageIndex": 0,
      "bbox": { "x": 4, "y": 6, "width": 92, "height": 14 }
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
      text: 'Segment all student handwritten answers on these pages with accurate top-aligned bounding boxes (x, y, width, height) and transcriptions. Output strictly JSON.'
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
      throw new Error('Groq model returned unexpected answer data format.');
    }

    // Step 1: Parse raw blocks
    const rawAnswers = parsed.answers.map((a, idx) => ({
      id: `ans-${a.pageIndex ?? 0}-${idx + 1}-${slugify(a.rawLabel || String(idx + 1))}`,
      rawLabel: a.rawLabel ?? null,
      text: a.text,
      pageIndex: a.pageIndex ?? 0,
      bbox: {
        x: Math.max(0, Math.min(95, Number(a.bbox?.x ?? 4))),
        y: Math.max(0, Math.min(95, Number(a.bbox?.y ?? 5))),
        width: Math.max(10, Math.min(96, Number(a.bbox?.width ?? 92))),
        height: Math.max(4, Math.min(95, Number(a.bbox?.height ?? 15)))
      }
    }));

    // Step 2: Universal Geometric Post-Processing per Page
    // Group answers by page and sort by vertical position (y)
    const processedAnswers: AnswerBlock[] = [];
    const pagesMap = new Map<number, typeof rawAnswers>();

    rawAnswers.forEach((ans) => {
      const p = ans.pageIndex;
      if (!pagesMap.has(p)) pagesMap.set(p, []);
      pagesMap.get(p)!.push(ans);
    });

    pagesMap.forEach((pageAnswers) => {
      // Sort sequentially from top to bottom
      pageAnswers.sort((a, b) => a.bbox.y - b.bbox.y);

      for (let i = 0; i < pageAnswers.length; i++) {
        const current = pageAnswers[i];
        const next = i < pageAnswers.length - 1 ? pageAnswers[i + 1] : null;

        // Apply a small top safety margin (upward expansion) to guarantee label is never cut off
        let y = Math.max(1, current.bbox.y - 1.5);
        let height = current.bbox.height + 2.0;

        // If previous block exists, ensure this block does not start inside the previous block
        if (i > 0) {
          const prev = pageAnswers[i - 1];
          const prevBottom = prev.bbox.y + prev.bbox.height;
          if (y < prevBottom) {
            y = prevBottom + 1.0;
          }
        }

        // Overlap Prevention: Clamp current block's height so it never collides into next block
        if (next) {
          const nextTop = Math.max(1, next.bbox.y - 1.5);
          if (y + height >= nextTop) {
            height = Math.max(5, nextTop - y - 1.5);
          }
        } else {
          // Last block on page: ensure it doesn't exceed 98%
          if (y + height > 98) {
            height = Math.max(5, 98 - y);
          }
        }

        // Standardize horizontal bounds across page for clean card framing
        const x = Math.min(current.bbox.x, 5);
        const width = Math.max(current.bbox.width, 90);

        processedAnswers.push({
          ...current,
          bbox: {
            x: Math.round(x * 10) / 10,
            y: Math.round(y * 10) / 10,
            width: Math.round(width * 10) / 10,
            height: Math.round(height * 10) / 10
          }
        });
      }
    });

    return NextResponse.json({ answers: processedAnswers });
  } catch (err: any) {
    console.error('extract-answers error:', err);
    return NextResponse.json(
      {
        error:
          err.message ||
          'Failed to extract and segment student answers. Please check your Groq API key in Settings.'
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
