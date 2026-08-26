import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient, GROQ_DEFAULT_TEXT_MODEL, extractJson, callGroqWithRetry } from '@/lib/groq';
import type { AnswerBlock, ExtractedQuestion, GradingResult, MappingResult, PageImage } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an AI exam generation assistant.
The user will describe an exam paper and student answer sheet in natural language (e.g. "Science paper with 7 questions with 3 answered and 4 unanswered" or "Math test with 5 calculus problems, 3 correct and 2 wrong").

Generate a complete, realistic structured dataset that matches the user's prompt exactly.

You must output a single valid JSON object containing:
1. "subject": The subject/topic of the exam (e.g. "Science", "Mathematics", "History", "Physics").
2. "questions": Array of question objects:
   - "id": string like "q-1", "q-2", etc.
   - "number": string like "1", "2", "3", etc.
   - "text": The full question text.
   - "marks": number (e.g. 5)
   - "pageIndex": 0
3. "answers": Array of student answers for the answered questions:
   - "questionNumber": matching question number (e.g. "1")
   - "rawLabel": label written by student (e.g. "Q1.", "Q2.")
   - "text": student's handwritten response
   - "verdict": "correct", "partially_correct", or "incorrect"
   - "score": number marks earned (between 0 and marks)
   - "feedback": 1 to 2 constructive evaluation sentences
4. "unansweredQuestionNumbers": Array of question numbers that were left unanswered (e.g. ["4", "5", "6", "7"])
5. "overallFeedback": 2 to 3 sentences summarizing the student's performance.

Output strictly valid JSON with no conversational text.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt: string = body.prompt || 'Science paper with 5 questions, 3 answered and 2 unanswered';
    const customApiKey: string | undefined = req.headers.get('x-groq-api-key') || body.apiKey;

    const groq = getGroqClient(customApiKey);

    const completion: any = await callGroqWithRetry<any>(() =>
      (groq.chat.completions.create as any)({
        model: GROQ_DEFAULT_TEXT_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Generate an exam based on this request: "${prompt}"` }
        ],
        temperature: 0.2,
        max_tokens: 4096,
        reasoning_effort: 'none'
      })
    );

    const rawResponse = completion?.choices?.[0]?.message?.content || '';
    const parsed = extractJson<{
      subject?: string;
      questions: { id?: string; number: string; text: string; marks?: number; pageIndex?: number }[];
      answers: {
        questionNumber: string;
        rawLabel?: string;
        text: string;
        verdict?: 'correct' | 'partially_correct' | 'incorrect';
        score?: number;
        feedback?: string;
      }[];
      unansweredQuestionNumbers: string[];
      overallFeedback?: string;
    }>(rawResponse);

    if (!parsed || !Array.isArray(parsed.questions)) {
      throw new Error('AI failed to generate a valid exam structure. Please try a different prompt.');
    }

    // 1. Build ExtractedQuestions
    const questions: ExtractedQuestion[] = parsed.questions.map((q, idx) => ({
      id: `q-gen-${idx + 1}-${q.number}`,
      number: q.number || String(idx + 1),
      text: q.text,
      marks: q.marks ?? 5,
      maxMarks: q.marks ?? 5,
      pageIndex: 0
    }));

    // 2. Build Answers and Calculate Vertical Coordinates
    // Space the answers evenly on the notebook page
    const totalAnswered = parsed.answers.length;
    const blockHeightPct = totalAnswered > 0 ? Math.min(18, Math.floor(75 / totalAnswered)) : 15;
    const startY = 8;

    const answers: AnswerBlock[] = [];
    const answerMappings: { questionId: string; answerBlockIds: string[]; confidence: number; reason: string }[] = [];
    const perQuestionGrading: GradingResult['perQuestion'] = [];

    parsed.answers.forEach((ans, idx) => {
      const qNum = ans.questionNumber;
      const matchedQ = questions.find((q) => q.number === qNum) || questions[idx];
      const qId = matchedQ ? matchedQ.id : `q-gen-${idx + 1}`;
      const ansId = `ans-gen-${idx + 1}`;
      const y = startY + idx * (blockHeightPct + 3);

      answers.push({
        id: ansId,
        rawLabel: ans.rawLabel || `Q${qNum}.`,
        text: ans.text,
        pageIndex: 0,
        bbox: {
          x: 4,
          y: Math.round(y * 10) / 10,
          width: 92,
          height: Math.round(blockHeightPct * 10) / 10
        }
      });

      answerMappings.push({
        questionId: qId,
        answerBlockIds: [ansId],
        confidence: 0.98,
        reason: `Matched by written label Q${qNum} and answer content`
      });

      const maxMarks = matchedQ?.maxMarks ?? 5;
      const score = ans.score != null ? ans.score : ans.verdict === 'correct' ? maxMarks : ans.verdict === 'partially_correct' ? Math.round(maxMarks / 2) : 0;

      perQuestionGrading.push({
        questionId: qId,
        verdict: ans.verdict || (score === maxMarks ? 'correct' : score > 0 ? 'partially_correct' : 'incorrect'),
        score,
        maxScore: maxMarks,
        feedback: ans.feedback || (score === maxMarks ? 'Well answered!' : 'Needs improvement on core concepts.')
      });
    });

    // 3. Unanswered questions handling
    const unansweredIds: string[] = [];
    questions.forEach((q) => {
      const isAnswered = answerMappings.some((m) => m.questionId === q.id);
      if (!isAnswered) {
        unansweredIds.push(q.id);
        perQuestionGrading.push({
          questionId: q.id,
          verdict: 'unanswered',
          score: 0,
          maxScore: q.maxMarks ?? 5,
          feedback: 'Question not attempted by student.'
        });
      }
    });

    const mapping: MappingResult = {
      mappings: answerMappings,
      unansweredQuestionIds: unansweredIds,
      unmatchedAnswerBlockIds: []
    };

    const totalScore = perQuestionGrading.reduce((sum, g) => sum + g.score, 0);
    const totalMaxScore = perQuestionGrading.reduce((sum, g) => sum + g.maxScore, 0);

    const grading: GradingResult = {
      perQuestion: perQuestionGrading,
      totalScore,
      totalMaxScore,
      overallFeedback: parsed.overallFeedback || `Student answered ${answers.length} out of ${questions.length} questions.`
    };

    // 4. Generate SVG notebook page for the answer sheet
    const svgNotebookDataUrl = generateDynamicNotebookSvg(answers);

    const answerPages: PageImage[] = [
      {
        pageIndex: 0,
        width: 800,
        height: 1100,
        dataUrl: svgNotebookDataUrl
      }
    ];

    return NextResponse.json({
      subject: parsed.subject || 'Custom Exam',
      questions,
      answers,
      mapping,
      grading,
      answerPages
    });
  } catch (err: any) {
    console.error('generate-exam error:', err);
    return NextResponse.json(
      {
        error: err.message || 'Failed to generate custom exam.'
      },
      { status: 500 }
    );
  }
}

function generateDynamicNotebookSvg(answers: AnswerBlock[]): string {
  const width = 800;
  const height = 1100;
  const leftMargin = 90;

  let linesSvg = '';
  for (let y = 70; y <= 1040; y += 32) {
    linesSvg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#dbe4f0" stroke-width="1.2" />\n`;
  }

  let contentSvg = '';
  answers.forEach((ans) => {
    const topPx = (ans.bbox.y / 100) * height + 24;
    const label = ans.rawLabel || 'Ans.';

    // Split text into chunks of ~55 chars for multi-line handwriting
    const words = ans.text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((w) => {
      if ((currentLine + ' ' + w).length > 55) {
        lines.push(currentLine.trim());
        currentLine = w;
      } else {
        currentLine += (currentLine ? ' ' : '') + w;
      }
    });
    if (currentLine) lines.push(currentLine.trim());

    contentSvg += `
      <!-- ${label} -->
      <text x="35" y="${topPx}" font-family="'Caveat', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">${escapeXml(label)}</text>
    `;

    lines.slice(0, 4).forEach((line, lIdx) => {
      contentSvg += `
        <text x="110" y="${topPx + lIdx * 32}" font-family="'Caveat', cursive, sans-serif" font-size="23" fill="#1e293b">${escapeXml(line)}</text>
      `;
    });
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&amp;display=swap');
      </style>
    </defs>
    <rect width="${width}" height="${height}" fill="#fbfaf6" />
    <line x1="${leftMargin}" y1="0" x2="${leftMargin}" y2="${height}" stroke="#fca5a5" stroke-width="1.8" />
    <line x1="${leftMargin + 4}" y1="0" x2="${leftMargin + 4}" y2="${height}" stroke="#fee2e2" stroke-width="1" />
    <line x1="0" y1="50" x2="${width}" y2="50" stroke="#fca5a5" stroke-width="1.8" />
    ${linesSvg}
    ${contentSvg}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
