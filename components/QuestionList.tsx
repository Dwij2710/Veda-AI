'use client';

import { useState } from 'react';
import type { ExtractedQuestion, GradingResult, MappingResult } from '@/lib/types';

interface Props {
  questions: ExtractedQuestion[];
  mapping: MappingResult;
  grading: GradingResult | null;
  selectedQuestionId: string | null;
  onSelect: (id: string) => void;
}

export default function QuestionList({
  questions,
  mapping,
  grading,
  selectedQuestionId,
  onSelect
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    [selectedQuestionId || questions[0]?.id || '']: true
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'answered' | 'unanswered'>('all');

  const isAllExpanded = questions.length > 0 && questions.every((q) => expandedIds[q.id]);

  const toggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedIds({});
    } else {
      const all: Record<string, boolean> = {};
      questions.forEach((q) => {
        all[q.id] = true;
      });
      setExpandedIds(all);
    }
  };

  const toggleCardExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredQuestions = questions.filter((q) => {
    const isUnanswered = mapping.unansweredQuestionIds.includes(q.id);
    if (filterMode === 'answered' && isUnanswered) return false;
    if (filterMode === 'unanswered' && !isUnanswered) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return q.number.toLowerCase().includes(query) || q.text.toLowerCase().includes(query);
  });

  return (
    <div className="flex h-full w-full sm:w-[480px] shrink-0 flex-col border-r border-gray-200/80 bg-[#f8f9fb] overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200/80 bg-white px-5 py-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">
            Extracted Questions <span className="font-normal text-gray-400 text-xs">(from question paper)</span>
          </h2>
          <button
            onClick={toggleExpandAll}
            className="rounded-full border border-gray-200 bg-white px-3.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-2xs cursor-pointer"
          >
            {isAllExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question # or text..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/70 py-1.5 pl-8 pr-3 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-orange-400 focus:bg-white"
            />
            <svg
              className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div className="flex items-center rounded-xl bg-gray-100 p-0.5 text-[11px] font-medium text-gray-500">
            <button
              onClick={() => setFilterMode('all')}
              className={`rounded-lg px-2 py-1 transition ${
                filterMode === 'all' ? 'bg-white font-bold text-gray-900 shadow-2xs' : 'hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode('answered')}
              className={`rounded-lg px-2 py-1 transition ${
                filterMode === 'answered' ? 'bg-white font-bold text-emerald-700 shadow-2xs' : 'hover:text-gray-900'
              }`}
            >
              Answered
            </button>
            <button
              onClick={() => setFilterMode('unanswered')}
              className={`rounded-lg px-2 py-1 transition ${
                filterMode === 'unanswered' ? 'bg-white font-bold text-rose-700 shadow-2xs' : 'hover:text-gray-900'
              }`}
            >
              Unanswered
            </button>
          </div>
        </div>
      </div>

      {/* Questions Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredQuestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-400">
            No questions found matching your filter.
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isSelected = selectedQuestionId === q.id;
            const isExpanded = isSelected || !!expandedIds[q.id];
            const isUnanswered = mapping.unansweredQuestionIds.includes(q.id);
            const graded = grading?.perQuestion.find((g) => g.questionId === q.id);

            // Format score badge
            const maxMarks = graded?.maxScore ?? q.maxMarks ?? q.marks ?? 2;
            const score = graded?.score ?? (isUnanswered ? 0 : null);
            const verdict = graded?.verdict ?? (isUnanswered ? 'unanswered' : null);

            let scoreBadgeColor = 'bg-gray-100 text-gray-600';
            if (verdict === 'correct' || (score !== null && score === maxMarks)) {
              scoreBadgeColor = 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60';
            } else if (verdict === 'incorrect' || (score !== null && score === 0)) {
              scoreBadgeColor = 'bg-rose-50 text-rose-600 font-bold border border-rose-200/60';
            } else if (verdict === 'partially_correct' || (score !== null && score > 0)) {
              scoreBadgeColor = 'bg-amber-50 text-amber-700 font-bold border border-amber-200/60';
            }

            return (
              <div
                key={q.id}
                onClick={() => {
                  onSelect(q.id);
                  setExpandedIds((prev) => ({ ...prev, [q.id]: true }));
                }}
                className={`group relative cursor-pointer rounded-2xl bg-white p-3.5 transition-all shadow-2xs ${
                  isSelected
                    ? 'border-2 border-[#FF5722] ring-2 ring-orange-100 shadow-sm'
                    : 'border border-gray-200/80 hover:border-gray-300'
                }`}
              >
                {/* Top Row: Badge Number + Question Text + Score Pill + Expand Chevron */}
                <div className="flex items-start gap-3">
                  {/* Number Badge */}
                  <div
                    className={`flex h-6 min-w-[24px] px-1.5 items-center justify-center rounded-full text-xs font-bold shrink-0 transition ${
                      isSelected
                        ? 'bg-[#FF5722] text-white'
                        : 'bg-[#3E3E3E] text-white'
                    }`}
                  >
                    {q.number}
                  </div>

                  {/* Question Text */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-xs font-medium text-gray-900 leading-relaxed">
                      {q.text}
                    </p>
                  </div>

                  {/* Score Pill and Chevron */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    {score !== null ? (
                      <span className={`rounded-full px-2.5 py-0.5 text-xs ${scoreBadgeColor}`}>
                        {score}/{maxMarks}
                      </span>
                    ) : q.marks != null ? (
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-500">
                        {q.marks} Marks
                      </span>
                    ) : null}

                    {/* Accordion Chevron */}
                    <button
                      type="button"
                      onClick={(e) => toggleCardExpand(q.id, e)}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                    >
                      <svg
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Section: AI Feedback */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 animate-in fade-in duration-150">
                    <div className="rounded-xl bg-[#fafafc] border border-gray-100 p-2.5">
                      <p className="text-[11px] font-bold text-gray-900 mb-1 flex items-center gap-1">
                        <span className="text-[#FF5722]">✦</span> AI Feedback
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {graded?.feedback ||
                          (isUnanswered
                            ? 'This question was not attempted by the student in the answer sheet.'
                            : 'Answer extracted and mapped to the answer sheet.')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
