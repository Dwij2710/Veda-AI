'use client';

import type { ExtractedQuestion, GradingResult, MappingResult } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  questions: ExtractedQuestion[];
  mapping: MappingResult;
  grading: GradingResult | null;
  studentName?: string;
  examTitle?: string;
}

export default function ReportCardModal({
  isOpen,
  onClose,
  questions,
  mapping,
  grading,
  studentName = 'Aryan Sharma',
  examTitle = 'Evaluation Assessment'
}: Props) {
  if (!isOpen) return null;

  const totalScore = grading?.totalScore ?? 0;
  const totalMaxScore = grading?.totalMaxScore ?? questions.reduce((s, q) => s + (q.maxMarks ?? q.marks ?? 5), 0);
  const percentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

  let gradeBadge = 'A+';
  let gradeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (percentage < 40) {
    gradeBadge = 'F (Needs Improvement)';
    gradeColor = 'text-rose-700 bg-rose-50 border-rose-200';
  } else if (percentage < 60) {
    gradeBadge = 'C (Satisfactory)';
    gradeColor = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (percentage < 75) {
    gradeBadge = 'B (Good)';
    gradeColor = 'text-blue-700 bg-blue-50 border-blue-200';
  } else if (percentage < 90) {
    gradeBadge = 'A (Very Good)';
    gradeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else {
    gradeBadge = 'A+ (Outstanding)';
    gradeColor = 'text-emerald-800 bg-emerald-100 border-emerald-300';
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-200">
        {/* Modal Top Action Bar (hidden in print) */}
        <div className="print:hidden flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-orange-600 text-sm font-bold">
              📄
            </span>
            <h2 className="text-sm font-bold text-gray-900">Student Evaluation Report Card</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-black transition cursor-pointer shadow-sm"
            >
              <span>🖨️</span>
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Report Card Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-gray-900 bg-white">
          {/* Header Banner with School Details */}
          <div className="flex items-start justify-between border-b border-gray-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm">
                  V
                </span>
                <h1 className="text-lg font-black tracking-tight text-gray-900">VedaAI Assessment System</h1>
              </div>
              <p className="text-xs font-semibold text-gray-500 mt-1">Delhi Public School • Automated Vision Evaluation</p>
              <p className="text-xs text-gray-400">Date: {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
            </div>

            <div className={`rounded-xl border px-3.5 py-2 text-center ${gradeColor}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Grade Awarded</p>
              <p className="text-sm font-black mt-0.5">{gradeBadge}</p>
            </div>
          </div>

          {/* Student & Score Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
              <p className="text-[11px] font-medium text-gray-400">Student</p>
              <p className="text-xs font-bold text-gray-900 mt-0.5">{studentName}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
              <p className="text-[11px] font-medium text-gray-400">Exam Scope</p>
              <p className="text-xs font-bold text-gray-900 mt-0.5">{questions.length} Questions</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
              <p className="text-[11px] font-medium text-gray-400">Total Score</p>
              <p className="text-xs font-bold text-gray-900 mt-0.5">{totalScore} / {totalMaxScore}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
              <p className="text-[11px] font-medium text-gray-400">Accuracy</p>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">{percentage}%</p>
            </div>
          </div>

          {/* Executive AI Remarks */}
          {grading?.overallFeedback && (
            <div className="rounded-xl bg-orange-50/60 border border-orange-200/80 p-4 text-xs leading-relaxed">
              <p className="font-bold text-orange-900 mb-1 flex items-center gap-1.5">
                <span>✦</span> AI Evaluator Executive Remarks
              </p>
              <p className="text-gray-800">{grading.overallFeedback}</p>
            </div>
          )}

          {/* Question-by-Question Breakdown Table */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
              Question-by-Question Marks Breakdown
            </h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 font-bold text-gray-700">
                    <th className="py-2.5 px-3">Q#</th>
                    <th className="py-2.5 px-3">Question Description</th>
                    <th className="py-2.5 px-3 text-center">Score</th>
                    <th className="py-2.5 px-3">Evaluation Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {questions.map((q) => {
                    const isUnanswered = mapping.unansweredQuestionIds.includes(q.id);
                    const graded = grading?.perQuestion.find((g) => g.questionId === q.id);
                    const maxScore = graded?.maxScore ?? q.maxMarks ?? q.marks ?? 5;
                    const score = graded?.score ?? (isUnanswered ? 0 : 0);

                    return (
                      <tr key={q.id} className="hover:bg-gray-50/50">
                        <td className="py-2.5 px-3 font-bold text-gray-900">{q.number}</td>
                        <td className="py-2.5 px-3 text-gray-700 font-medium max-w-xs truncate">{q.text}</td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[11px] ${
                              score === maxScore
                                ? 'bg-emerald-100 text-emerald-800'
                                : score > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {score}/{maxScore}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 text-[11px]">
                          {graded?.feedback || (isUnanswered ? 'Not attempted' : 'Evaluated')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Teacher Signature Line */}
          <div className="pt-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div>
              <p className="font-semibold text-gray-800">Evaluator: Dwij Prajapati</p>
              <p className="text-[11px] text-gray-400">Senior STEM Faculty • VedaAI Evaluator</p>
            </div>
            <div className="text-right">
              <div className="w-36 border-b border-gray-400 pb-1 mb-1 font-serif italic text-gray-700">
                Dwij Prajapati
              </div>
              <p className="text-[10px] text-gray-400">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
