import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient, GROQ_DEFAULT_TEXT_MODEL, extractJson, callGroqWithRetry } from '@/lib/groq';
import type { AnswerBlock, ExtractedQuestion, GradingResult, MappingResult } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an expert exam grader evaluating student answers.
You will receive:
- The list of questions from the question paper (with questionId, number, questionText, maxMarks).
- The student's mapped answers (transcriptions, diagrams described, or indication of unanswered).

For EACH question, provide:
1. "verdict": One of "correct", "partially_correct", "incorrect", or "unanswered".
2. "score": Numeric mark scored (between 0 and maxScore). If maxScore is not specified, use a scale out of 2 or 5 depending on depth. If unanswered, score is 0.
3. "maxScore": Max score for this question.
4. "feedback": 1 to 2 constructive, encouraging sentences explaining what was correct, missing, or needs improvement.

Also provide:
- "overallFeedback": 2 to 3 sentences summarizing the student's overall performance, strengths, and recommendations.
- "totalScore": Sum of all individual question scores.
- "totalMaxScore": Sum of all max marks.

Output ONLY a valid JSON object.

Expected JSON Shape:
{
  "perQuestion": [
    {
      "questionId": "q-1-1",
      "verdict": "correct",
      "score": 2,
      "maxScore": 2,
      "feedback": "Excellent work! You correctly identified the answer."
    }
  ],
  "overallFeedback": "Strong overall grasp of core concepts with clear calculations.",
  "totalScore": 38,
  "totalMaxScore": 45
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const questions: ExtractedQuestion[] = body.questions;
    const answers: AnswerBlock[] = body.answers;
    const mapping: MappingResult = body.mapping;
    const customApiKey: string | undefined = req.headers.get('x-groq-api-key') || body.apiKey;

    if (!questions?.length || !mapping) {
      return NextResponse.json({ error: 'Missing questions or mapping data.' }, { status: 400 });
    }

    const groq = getGroqClient(customApiKey);
    const answerMap = new Map(answers.map((a) => [a.id, a] as const));

    const payload = questions.map((q) => {
      const mapped = mapping.mappings.find((m) => m.questionId === q.id);
      const isUnanswered = mapping.unansweredQuestionIds.includes(q.id);
      const studentText = mapped
        ? mapped.answerBlockIds
            .map((id) => answerMap.get(id)?.text)
            .filter(Boolean)
            .join('\n--- Continuation ---\n')
        : null;

      return {
        questionId: q.id,
        number: q.number,
        questionText: q.text,
        maxMarks: q.marks || q.maxMarks || 2,
        unanswered: isUnanswered || !studentText,
        studentAnswer: studentText || '[No answer written / Unanswered]'
      };
    });

    const completion = await callGroqWithRetry(() =>
      (groq.chat.completions.create as any)({
        model: GROQ_DEFAULT_TEXT_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `QUESTIONS AND STUDENT ANSWERS:\n${JSON.stringify(
              payload,
              null,
              2
            )}\n\nPerform assessment grading and feedback evaluation now.`
          }
        ],
        temperature: 0.1,
        max_tokens: 4096,
        reasoning_effort: 'none'
      })
    );

    const rawResponse = completion.choices[0]?.message?.content || '';
    const parsed = extractJson<GradingResult>(rawResponse);

    // Calculate fallback totals if model omitted them
    let calculatedScore = 0;
    let calculatedMax = 0;

    const perQuestion = (parsed.perQuestion || []).map((g) => {
      const q = questions.find((item) => item.id === g.questionId);
      const maxScore = g.maxScore ?? q?.marks ?? q?.maxMarks ?? 2;
      const score = g.score ?? (g.verdict === 'correct' ? maxScore : 0);
      calculatedScore += score;
      calculatedMax += maxScore;

      return {
        questionId: g.questionId,
        verdict: g.verdict || 'ungraded',
        score,
        maxScore,
        feedback: g.feedback || 'Answer reviewed.'
      };
    });

    const gradingResult: GradingResult = {
      perQuestion,
      overallFeedback:
        parsed.overallFeedback ||
        'Assessment review completed. The student demonstrated good conceptual understanding.',
      totalScore: parsed.totalScore ?? calculatedScore,
      totalMaxScore: parsed.totalMaxScore ?? calculatedMax
    };

    return NextResponse.json(gradingResult);
  } catch (err: any) {
    console.error('grade error:', err);
    return NextResponse.json(
      {
        error:
          err.message ||
          'Failed to grade assessment. Please check your Groq API key in Settings.'
      },
      { status: 500 }
    );
  }
}
