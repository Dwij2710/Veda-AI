import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient, GROQ_DEFAULT_TEXT_MODEL, extractJson, callGroqWithRetry } from '@/lib/groq';
import type { AnswerBlock, ExtractedQuestion, MappingResult } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an expert exam evaluator. You are given:
1. A list of questions from a printed question paper (with "id", "number", "text").
2. A list of answer blocks extracted from a student's handwritten answer sheet (with "id", "rawLabel", "text", "pageIndex").

Your task is to accurately map each student answer block to the question it answers.

Rules:
1. Match primarily using rawLabel against the question number (e.g. "Q1.", "1", "11 a.", "11 (a)").
2. If rawLabel is missing or ambiguous, use semantic text comparison between the answer transcription and the question content.
3. If an answer spans multiple pages or blocks, group all matching answer block ids under ONE mapping entry in "answerBlockIds" in chronological page order.
4. If a question has NO matching student answer, list its id in "unansweredQuestionIds".
5. If an answer block cannot be matched to any question, list its id in "unmatchedAnswerBlockIds".
6. Every answer block id must appear either in exactly one mapping's "answerBlockIds" OR in "unmatchedAnswerBlockIds".
7. Provide a confidence score (0.0 to 1.0) and a concise reason for each mapping.
8. Output ONLY a valid JSON object.

Expected JSON Shape:
{
  "mappings": [
    {
      "questionId": "q-1-1",
      "answerBlockIds": ["ans-1"],
      "confidence": 0.98,
      "reason": "Matched by written label Q1 and photosynthesis content"
    }
  ],
  "unansweredQuestionIds": ["q-4-4"],
  "unmatchedAnswerBlockIds": []
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const questions: ExtractedQuestion[] = body.questions;
    const answers: AnswerBlock[] = body.answers;
    const customApiKey: string | undefined = req.headers.get('x-groq-api-key') || body.apiKey;

    if (!questions?.length) {
      return NextResponse.json({ error: 'No questions provided for mapping.' }, { status: 400 });
    }

    const groq = getGroqClient(customApiKey);

    const compactQuestions = questions.map((q) => ({ id: q.id, number: q.number, text: q.text }));
    const compactAnswers = answers.map((a) => ({
      id: a.id,
      rawLabel: a.rawLabel,
      text: a.text,
      pageIndex: a.pageIndex
    }));

    const completion: any = await callGroqWithRetry<any>(() =>
      (groq.chat.completions.create as any)({
        model: GROQ_DEFAULT_TEXT_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `QUESTIONS:\n${JSON.stringify(compactQuestions, null, 2)}\n\nSTUDENT ANSWERS:\n${JSON.stringify(
              compactAnswers,
              null,
              2
            )}\n\nGenerate mapping JSON now.`
          }
        ],
        temperature: 0.1,
        max_tokens: 4096,
        reasoning_effort: 'none'
      })
    );

    const rawResponse = completion?.choices?.[0]?.message?.content || '';
    const parsed = extractJson<MappingResult>(rawResponse);

    // Normalize and ensure all IDs are accounted for
    const allAnswerIds = new Set(answers.map((a) => a.id));
    const assignedAnswerIds = new Set<string>();

    const safeMappings = (parsed.mappings || []).map((m) => {
      const validBlockIds = (m.answerBlockIds || []).filter((id) => allAnswerIds.has(id));
      validBlockIds.forEach((id) => assignedAnswerIds.add(id));
      return {
        questionId: m.questionId,
        answerBlockIds: validBlockIds,
        confidence: typeof m.confidence === 'number' ? m.confidence : 0.9,
        reason: m.reason || 'Matched answer content'
      };
    });

    const unansweredQuestionIds = parsed.unansweredQuestionIds || [];
    const unmatchedAnswerBlockIds = [
      ...(parsed.unmatchedAnswerBlockIds || []).filter((id) => allAnswerIds.has(id)),
      ...[...allAnswerIds].filter((id) => !assignedAnswerIds.has(id))
    ];

    const result: MappingResult = {
      mappings: safeMappings,
      unansweredQuestionIds,
      unmatchedAnswerBlockIds: Array.from(new Set(unmatchedAnswerBlockIds))
    };

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('map-answers error:', err);
    return NextResponse.json(
      {
        error:
          err.message ||
          'Failed to map student answers to questions. Please check your Groq API key in Settings.'
      },
      { status: 500 }
    );
  }
}
