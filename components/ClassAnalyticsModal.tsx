'use client';

import type { ExtractedQuestion, GradingResult, MappingResult } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  questions: ExtractedQuestion[];
  mapping: MappingResult;
  grading: GradingResult | null;
}

export default function ClassAnalyticsModal({
  isOpen,
  onClose,
  questions,
  mapping,
  grading
}: Props) {
  if (!isOpen) return null;

  const totalScore = grading?.totalScore ?? 0;
  const totalMaxScore = grading?.totalMaxScore ?? questions.reduce((s, q) => s + (q.maxMarks ?? q.marks ?? 5), 0);
  const percentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

  const totalQuestions = questions.length;
  const answeredCount = totalQuestions - mapping.unansweredQuestionIds.length;
  const attemptRate = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const perfectQuestions = questions.filter((q) => {
    const graded = grading?.perQuestion.find((g) => g.questionId === q.id);
    const max = graded?.maxScore ?? q.maxMarks ?? q.marks ?? 5;
    return graded?.score === max;
  }).length;

  const partialQuestions = questions.filter((q) => {
    const isUnanswered = mapping.unansweredQuestionIds.includes(q.id);
    if (isUnanswered) return false;
    const graded = grading?.perQuestion.find((g) => g.questionId === q.id);
    const max = graded?.maxScore ?? q.maxMarks ?? q.marks ?? 5;
    return graded?.score != null && graded.score > 0 && graded.score < max;
  }).length;

  const zeroQuestions = totalQuestions - perfectQuestions - partialQuestions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-sm font-bold">
              📊
            </span>
            <h2 className="text-sm font-bold text-gray-900">Dynamic Exam Analytics &amp; Insights</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-center">
              <p className="text-[11px] font-semibold text-blue-700">Accuracy Rate</p>
              <p className="text-xl font-black text-blue-900 mt-1">{percentage}%</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-center">
              <p className="text-[11px] font-semibold text-emerald-700">Attempt Rate</p>
              <p className="text-xl font-black text-emerald-900 mt-1">{attemptRate}%</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-center">
              <p className="text-[11px] font-semibold text-amber-700">Full Marks (100%)</p>
              <p className="text-xl font-black text-amber-900 mt-1">{perfectQuestions} Qs</p>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-center">
              <p className="text-[11px] font-semibold text-rose-700">Zero / Unanswered</p>
              <p className="text-xl font-black text-rose-900 mt-1">{zeroQuestions} Qs</p>
            </div>
          </div>

          {/* Performance Distribution Progress Bars */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            <h3 className="text-xs font-bold text-gray-900 mb-3">Score Distribution Breakdown</h3>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-emerald-800">Full Marks (Correct)</span>
                  <span className="font-bold text-gray-700">{perfectQuestions} of {totalQuestions} ({totalQuestions ? Math.round((perfectQuestions / totalQuestions) * 100) : 0}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${totalQuestions ? (perfectQuestions / totalQuestions) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-amber-800">Partial Marks</span>
                  <span className="font-bold text-gray-700">{partialQuestions} of {totalQuestions} ({totalQuestions ? Math.round((partialQuestions / totalQuestions) * 100) : 0}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${totalQuestions ? (partialQuestions / totalQuestions) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-rose-800">Zero / Unattempted</span>
                  <span className="font-bold text-gray-700">{zeroQuestions} of {totalQuestions} ({totalQuestions ? Math.round((zeroQuestions / totalQuestions) * 100) : 0}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-300"
                    style={{ width: `${totalQuestions ? (zeroQuestions / totalQuestions) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Question-by-Question Accuracy Chart */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 mb-2.5">Per-Question Score Performance</h3>
            <div className="space-y-2">
              {questions.map((q) => {
                const isUnanswered = mapping.unansweredQuestionIds.includes(q.id);
                const graded = grading?.perQuestion.find((g) => g.questionId === q.id);
                const max = graded?.maxScore ?? q.maxMarks ?? q.marks ?? 5;
                const score = graded?.score ?? (isUnanswered ? 0 : 0);
                const pct = max > 0 ? Math.round((score / max) * 100) : 0;

                return (
                  <div key={q.id} className="flex items-center gap-3 text-xs bg-white p-2 rounded-lg border border-gray-100">
                    <span className="w-12 font-bold text-gray-800 shrink-0">Q{q.number}</span>
                    <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : 'bg-rose-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-semibold text-gray-700 shrink-0">
                      {score}/{max} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
