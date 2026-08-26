'use client';

import { useState } from 'react';
import type { GradingResult, MappingResult, ExtractedQuestion } from '@/lib/types';

interface Props {
  questions: ExtractedQuestion[];
  mapping: MappingResult;
  grading: GradingResult | null;
  gradingLoading: boolean;
  activeStudent?: string;
  onSelectStudent?: (studentName: string) => void;
  onOpenReportCard?: () => void;
  onOpenAnalytics?: () => void;
}

export default function GradingSummary({
  questions,
  mapping,
  grading,
  gradingLoading,
  activeStudent = 'Aryan Sharma',
  onSelectStudent,
  onOpenReportCard,
  onOpenAnalytics
}: Props) {
  const [showFeedback, setShowFeedback] = useState(false);
  const answeredCount = questions.length - mapping.unansweredQuestionIds.length;

  const handleExportJsonReport = () => {
    const reportData = {
      evaluatedAt: new Date().toISOString(),
      student: activeStudent,
      summary: {
        totalQuestions: questions.length,
        answeredCount,
        unansweredCount: mapping.unansweredQuestionIds.length,
        unmatchedBlocksCount: mapping.unmatchedAnswerBlockIds.length,
        totalScore: grading?.totalScore ?? null,
        totalMaxScore: grading?.totalMaxScore ?? null,
        percentage:
          grading?.totalScore != null && grading?.totalMaxScore
            ? `${Math.round((grading.totalScore / grading.totalMaxScore) * 100)}%`
            : null,
        executiveSummary: grading?.overallFeedback ?? null
      },
      questions: questions.map((q) => {
        const mapped = mapping.mappings.find((m) => m.questionId === q.id);
        const graded = grading?.perQuestion.find((g) => g.questionId === q.id);
        const isUnanswered = mapping.unansweredQuestionIds.includes(q.id);

        return {
          questionNumber: q.number,
          questionText: q.text,
          maxMarks: graded?.maxScore ?? q.maxMarks ?? q.marks ?? 5,
          score: graded?.score ?? (isUnanswered ? 0 : null),
          verdict: graded?.verdict ?? (isUnanswered ? 'unanswered' : 'evaluated'),
          isAnswered: !isUnanswered,
          mappingConfidence: mapped?.confidence ?? null,
          mappingReason: mapped?.reason ?? null,
          feedback: graded?.feedback ?? null
        };
      })
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VedaAI_Assessment_Report_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsvMarksheet = () => {
    let csv = `Student Name,Total Score,Max Score,Percentage,Grade,${questions.map((q) => `Q${q.number}`).join(',')}\n`;
    const totalScore = grading?.totalScore ?? 0;
    const maxScore = grading?.totalMaxScore ?? 50;
    const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const grade = pct >= 90 ? 'A+' : pct >= 75 ? 'A' : pct >= 60 ? 'B' : 'C';

    const qScores = questions.map((q) => {
      const isUnanswered = mapping.unansweredQuestionIds.includes(q.id);
      const graded = grading?.perQuestion.find((g) => g.questionId === q.id);
      return graded?.score ?? (isUnanswered ? 0 : 0);
    });

    csv += `"${activeStudent}",${totalScore},${maxScore},${pct}%,${grade},${qScores.join(',')}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Classroom_Marksheet_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border-b border-gray-200/80 bg-white shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2.5">
        {/* Statistics Counts & Multi-Student Selector */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 text-xs text-gray-500 font-medium">
          {/* Prominent Multi-Student Switcher Pill */}
          {onSelectStudent && (
            <div className="flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-semibold text-orange-900 shadow-2xs">
              <span className="text-sm">👨‍🎓</span>
              <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">Student:</span>
              <select
                value={activeStudent}
                onChange={(e) => onSelectStudent(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-900 outline-none cursor-pointer pr-1"
              >
                <option value="Aryan Sharma">Aryan Sharma</option>
                <option value="Priya Verma">Priya Verma</option>
                <option value="Rohan Gupta">Rohan Gupta</option>
              </select>
            </div>
          )}

          <span className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-gray-400" />
            <span className="font-bold text-gray-900">{questions.length}</span> questions
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-emerald-700">{answeredCount}</span> answered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-rose-400" />
            <span className="font-bold text-rose-600">{mapping.unansweredQuestionIds.length}</span> unanswered
          </span>
        </div>

        {/* Right Grading Total, Modals & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {gradingLoading ? (
            <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium animate-pulse">
              <span>✦</span> Grading in background...
            </div>
          ) : grading ? (
            <>
              {grading.overallFeedback && (
                <button
                  onClick={() => setShowFeedback((v) => !v)}
                  className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-100 transition shadow-2xs cursor-pointer"
                >
                  {showFeedback ? '✕ Hide Summary' : '✦ View Overall Summary'}
                </button>
              )}

              {grading.totalScore != null && grading.totalMaxScore != null && (
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-bold text-white shadow-2xs">
                    Score: {grading.totalScore} / {grading.totalMaxScore}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    {Math.round((grading.totalScore / grading.totalMaxScore) * 100)}%
                  </span>
                </div>
              )}

              {/* Dynamic Analytics Modal Button */}
              {onOpenAnalytics && (
                <button
                  onClick={onOpenAnalytics}
                  className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition shadow-2xs cursor-pointer"
                  title="View exam score analytics and distribution charts"
                >
                  <span>📊</span>
                  <span className="hidden sm:inline">Analytics</span>
                </button>
              )}

              {/* Dynamic Report Card Modal Button */}
              {onOpenReportCard && (
                <button
                  onClick={onOpenReportCard}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-2xs cursor-pointer"
                  title="Generate printable student report card"
                >
                  <span>📄</span>
                  <span className="hidden sm:inline">Report Card</span>
                </button>
              )}

              {/* Export CSV Marksheet Button */}
              <button
                onClick={handleExportCsvMarksheet}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
                title="Download CSV Marksheet roster"
              >
                <span>📑</span>
                <span className="hidden sm:inline">CSV Marksheet</span>
              </button>

              {/* Export JSON Report Button */}
              <button
                onClick={handleExportJsonReport}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-2xs cursor-pointer"
                title="Download full evaluation report as JSON"
              >
                <span>📥</span>
                <span className="hidden sm:inline">Export</span>
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Expandable Overall Feedback Banner */}
      {showFeedback && grading && grading.overallFeedback && (
        <div className="border-t border-orange-100 bg-orange-50/50 px-6 py-3 text-xs text-gray-700 leading-relaxed animate-in fade-in duration-150">
          <p className="font-bold text-gray-900 mb-0.5 flex items-center gap-1.5">
            <span className="text-[#FF5722]">✦</span> AI Assessment Executive Summary
          </p>
          <p className="text-gray-700">{grading.overallFeedback}</p>
        </div>
      )}
    </div>
  );
}
