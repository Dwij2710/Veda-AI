'use client';

import { useState } from 'react';
import type { GradingResult, MappingResult, ExtractedQuestion } from '@/lib/types';

interface Props {
  questions: ExtractedQuestion[];
  mapping: MappingResult;
  grading: GradingResult | null;
  gradingLoading: boolean;
}

export default function GradingSummary({ questions, mapping, grading, gradingLoading }: Props) {
  const [showFeedback, setShowFeedback] = useState(false);
  const answeredCount = questions.length - mapping.unansweredQuestionIds.length;

  return (
    <div className="border-b border-gray-200/80 bg-white shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5">
        {/* Statistics Counts */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
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
          {mapping.unmatchedAnswerBlockIds.length > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-amber-500" />
              <span className="font-bold text-amber-700">{mapping.unmatchedAnswerBlockIds.length}</span> unmatched
            </span>
          )}
        </div>

        {/* Right Grading Total & Overall Feedback Toggle */}
        <div className="flex items-center gap-3">
          {gradingLoading ? (
            <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium animate-pulse">
              <span>✦</span> Grading in background...
            </div>
          ) : grading ? (
            <>
              {grading.overallFeedback && (
                <button
                  onClick={() => setShowFeedback((v) => !v)}
                  className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-100 transition shadow-2xs"
                >
                  {showFeedback ? '✕ Hide Summary' : '✦ View Overall Summary'}
                </button>
              )}

              {grading.totalScore != null && grading.totalMaxScore != null && (
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-900 px-3.5 py-1 text-xs font-bold text-white shadow-2xs">
                    Score: {grading.totalScore} / {grading.totalMaxScore}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    {Math.round((grading.totalScore / grading.totalMaxScore) * 100)}%
                  </span>
                </div>
              )}
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
