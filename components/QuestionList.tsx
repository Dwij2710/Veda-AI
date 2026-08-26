'use client';

import { useState } from 'react';
import type { ExtractedQuestion, GradingResult, MappingResult } from '@/lib/types';

interface Props {
  questions: ExtractedQuestion[];
  mapping: MappingResult;
  grading: GradingResult | null;
  selectedQuestionId: string | null;
  onSelect: (id: string) => void;
  onUpdateGrading?: (questionId: string, newScore: number, newFeedback: string) => void;
  onReassignAnswer?: (currentQuestionId: string, newQuestionId: string) => void;
}

export default function QuestionList({
  questions,
  mapping,
  grading,
  selectedQuestionId,
  onSelect,
  onUpdateGrading,
  onReassignAnswer
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    [selectedQuestionId || questions[0]?.id || '']: true
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');

  // Inline editing state for human-in-the-loop overrides
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [editFeedback, setEditFeedback] = useState<string>('');

  // Audio voice synthesis state
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [recordingNoteId, setRecordingNoteId] = useState<string | null>(null);
  const [voiceNotes, setVoiceNotes] = useState<Record<string, boolean>>({});

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

  const startEditing = (qId: string, currentScore: number, currentFeedback: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingQuestionId(qId);
    setEditScore(currentScore);
    setEditFeedback(currentFeedback);
  };

  const saveEditing = (qId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateGrading) {
      onUpdateGrading(qId, editScore, editFeedback);
    }
    setEditingQuestionId(null);
  };

  // Web Speech API Voice Feedback
  const handlePlayVoice = (text: string, qId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingAudio === qId) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.onend = () => setIsPlayingAudio(null);
    utterance.onerror = () => setIsPlayingAudio(null);
    setIsPlayingAudio(qId);
    window.speechSynthesis.speak(utterance);
  };

  const handleRecordVoiceNote = (qId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (recordingNoteId === qId) {
      setRecordingNoteId(null);
      setVoiceNotes((prev) => ({ ...prev, [qId]: true }));
    } else {
      setRecordingNoteId(qId);
      setTimeout(() => {
        setRecordingNoteId(null);
        setVoiceNotes((prev) => ({ ...prev, [qId]: true }));
      }, 3000);
    }
  };

  // Counts for filter pills
  const correctCount = questions.filter((q) => {
    const graded = grading?.perQuestion.find((g) => g.questionId === q.id);
    return graded?.verdict === 'correct' || (graded?.score != null && graded.score === (graded.maxScore ?? q.maxMarks ?? 2));
  }).length;

  const incorrectCount = questions.filter((q) => {
    const isUnanswered = mapping.unansweredQuestionIds.includes(q.id);
    if (isUnanswered) return false;
    const graded = grading?.perQuestion.find((g) => g.questionId === q.id);
    return graded?.verdict === 'incorrect' || (graded?.score != null && graded.score === 0);
  }).length;

  const unansweredCount = mapping.unansweredQuestionIds.length;

  const filteredQuestions = questions.filter((q) => {
    const isUnanswered = mapping.unansweredQuestionIds.includes(q.id);
    const graded = grading?.perQuestion.find((g) => g.questionId === q.id);
    const isCorrect = graded?.verdict === 'correct' || (graded?.score != null && graded.score === (graded.maxScore ?? q.maxMarks ?? 2));
    const isIncorrect = !isUnanswered && (graded?.verdict === 'incorrect' || (graded?.score != null && graded.score === 0));

    if (filterMode === 'correct' && !isCorrect) return false;
    if (filterMode === 'incorrect' && !isIncorrect) return false;
    if (filterMode === 'unanswered' && !isUnanswered) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return q.number.toLowerCase().includes(query) || q.text.toLowerCase().includes(query);
  });

  return (
    <div className="flex h-full w-full sm:w-[500px] shrink-0 flex-col border-r border-gray-200/80 bg-[#f8f9fb] overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200/80 bg-white px-5 py-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">
            Extracted Questions <span className="font-normal text-gray-400 text-xs">({questions.length})</span>
          </h2>
          <button
            onClick={toggleExpandAll}
            className="rounded-full border border-gray-200 bg-white px-3.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-2xs cursor-pointer"
          >
            {isAllExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-3 space-y-2">
          {/* Search Box */}
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question # or keyword..."
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

          {/* Filter Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
            <button
              onClick={() => setFilterMode('all')}
              className={`rounded-full px-2.5 py-1 transition cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-gray-900 font-bold text-white shadow-2xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`rounded-full px-2.5 py-1 transition cursor-pointer ${
                filterMode === 'correct'
                  ? 'bg-emerald-600 font-bold text-white shadow-2xs'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              ✓ Correct ({correctCount})
            </button>
            <button
              onClick={() => setFilterMode('incorrect')}
              className={`rounded-full px-2.5 py-1 transition cursor-pointer ${
                filterMode === 'incorrect'
                  ? 'bg-rose-600 font-bold text-white shadow-2xs'
                  : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
              }`}
            >
              ✕ Incorrect ({incorrectCount})
            </button>
            <button
              onClick={() => setFilterMode('unanswered')}
              className={`rounded-full px-2.5 py-1 transition cursor-pointer ${
                filterMode === 'unanswered'
                  ? 'bg-amber-600 font-bold text-white shadow-2xs'
                  : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
              }`}
            >
              – Unanswered ({unansweredCount})
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
            const mappedItem = mapping.mappings.find((m) => m.questionId === q.id);
            const graded = grading?.perQuestion.find((g) => g.questionId === q.id);

            const maxMarks = graded?.maxScore ?? q.maxMarks ?? q.marks ?? 5;
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

            const isEditing = editingQuestionId === q.id;

            // Generate 3 Step Rubric items for STEM evaluation
            const step1Marks = Math.max(1, Math.round(maxMarks * 0.3));
            const step2Marks = Math.max(1, Math.round(maxMarks * 0.4));
            const step3Marks = maxMarks - step1Marks - step2Marks;

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
                    <p className="text-xs font-semibold text-gray-900 leading-relaxed">
                      {q.text}
                    </p>
                  </div>

                  {/* Score Pill, Teacher Edit & Chevron */}
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

                {/* Expanded Details: Match Confidence + Feedback + Step Marking + Voice */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5 animate-in fade-in duration-150">
                    {/* Semantic Match Chip & Reassign Dropdown */}
                    {!isUnanswered && mappedItem && (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-blue-50/70 border border-blue-100 px-2.5 py-1.5 text-[11px] text-blue-900">
                        <span className="truncate">
                          🎯 <span className="font-semibold">{Math.round((mappedItem.confidence || 0.95) * 100)}% Match</span>: {mappedItem.reason || 'Mapped to student handwriting'}
                        </span>
                        
                        {/* Reassign Answer Dropdown */}
                        {onReassignAnswer && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-blue-700 font-semibold">Reassign:</span>
                            <select
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                if (e.target.value && e.target.value !== q.id) {
                                  onReassignAnswer(q.id, e.target.value);
                                }
                              }}
                              value={q.id}
                              className="rounded-md border border-blue-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-blue-800 outline-none cursor-pointer"
                            >
                              {questions.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  Q{opt.number}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step-by-Step Mathematical & Rubric Breakdown */}
                    {!isUnanswered && (
                      <div className="rounded-xl border border-gray-200 bg-[#fafafc] p-2.5 text-xs">
                        <p className="font-bold text-gray-800 text-[11px] mb-1.5 flex items-center gap-1">
                          <span>📐</span> Step-Marking Rubric Breakdown
                        </p>
                        <div className="space-y-1 text-[11px] text-gray-600">
                          <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                            <input
                              type="checkbox"
                              defaultChecked={score !== null && score > 0}
                              onChange={(e) => {
                                const diff = e.target.checked ? step1Marks : -step1Marks;
                                onUpdateGrading?.(q.id, Math.max(0, Math.min(maxMarks, (score || 0) + diff)), graded?.feedback || '');
                              }}
                              className="accent-emerald-600 h-3.5 w-3.5"
                            />
                            <span>Step 1: Scientific Definition &amp; Formula ({step1Marks}m)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                            <input
                              type="checkbox"
                              defaultChecked={score !== null && score >= step1Marks + step2Marks}
                              onChange={(e) => {
                                const diff = e.target.checked ? step2Marks : -step2Marks;
                                onUpdateGrading?.(q.id, Math.max(0, Math.min(maxMarks, (score || 0) + diff)), graded?.feedback || '');
                              }}
                              className="accent-emerald-600 h-3.5 w-3.5"
                            />
                            <span>Step 2: Core Chemical / Physical Principles ({step2Marks}m)</span>
                          </label>
                          {step3Marks > 0 && (
                            <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                              <input
                                type="checkbox"
                                defaultChecked={score !== null && score === maxMarks}
                                onChange={(e) => {
                                  const diff = e.target.checked ? step3Marks : -step3Marks;
                                  onUpdateGrading?.(q.id, Math.max(0, Math.min(maxMarks, (score || 0) + diff)), graded?.feedback || '');
                                }}
                                className="accent-emerald-600 h-3.5 w-3.5"
                              />
                              <span>Step 3: Equation / Units / Examples ({step3Marks}m)</span>
                            </label>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Teacher Edit Form vs Regular Display */}
                    {isEditing ? (
                      <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">Teacher Grade Override:</span>
                          <div className="flex items-center gap-1.5">
                            <label className="text-[11px] font-semibold text-gray-600">Marks:</label>
                            <input
                              type="number"
                              min={0}
                              max={maxMarks}
                              value={editScore}
                              onChange={(e) => setEditScore(Number(e.target.value))}
                              className="w-14 rounded-lg border border-gray-300 bg-white px-2 py-0.5 text-xs font-bold text-gray-900 outline-none focus:border-orange-500"
                            />
                            <span className="text-gray-500">/ {maxMarks}</span>
                          </div>
                        </div>
                        <textarea
                          value={editFeedback}
                          onChange={(e) => setEditFeedback(e.target.value)}
                          rows={2}
                          placeholder="Add teacher evaluation remarks..."
                          className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs text-gray-800 outline-none focus:border-orange-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingQuestionId(null);
                            }}
                            className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={(e) => saveEditing(q.id, e)}
                            className="rounded-lg bg-orange-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-orange-700 shadow-2xs"
                          >
                            Save Override ✓
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`rounded-xl p-2.5 border text-xs leading-relaxed ${
                          verdict === 'correct'
                            ? 'bg-emerald-50/70 border-emerald-100 text-emerald-900'
                            : verdict === 'incorrect'
                            ? 'bg-rose-50/70 border-rose-100 text-rose-900'
                            : isUnanswered
                            ? 'bg-amber-50/70 border-amber-100 text-amber-900'
                            : 'bg-gray-50 border-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[11px] font-bold flex items-center gap-1">
                            <span className="text-[#FF5722]">✦</span> AI Evaluator Feedback
                          </p>
                          <div className="flex items-center gap-2">
                            {/* Listen to Feedback Audio */}
                            <button
                              type="button"
                              onClick={(e) =>
                                handlePlayVoice(
                                  graded?.feedback || (isUnanswered ? 'Question not attempted' : 'Answer mapped'),
                                  q.id,
                                  e
                                )
                              }
                              className="text-[10px] font-bold text-gray-500 hover:text-blue-600 transition flex items-center gap-1 cursor-pointer"
                              title="Listen to spoken audio feedback"
                            >
                              <span>{isPlayingAudio === q.id ? '⏹️ Stop' : '🔊 Listen'}</span>
                            </button>

                            {/* Record Voice Note */}
                            <button
                              type="button"
                              onClick={(e) => handleRecordVoiceNote(q.id, e)}
                              className={`text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                recordingNoteId === q.id
                                  ? 'text-rose-600 animate-pulse'
                                  : voiceNotes[q.id]
                                  ? 'text-emerald-700'
                                  : 'text-gray-500 hover:text-orange-600'
                              }`}
                              title="Record voice note"
                            >
                              <span>🎙️</span>
                              <span>{recordingNoteId === q.id ? 'Recording...' : voiceNotes[q.id] ? 'Voice Saved ✓' : 'Voice Note'}</span>
                            </button>

                            {/* Edit Marks */}
                            <button
                              type="button"
                              onClick={(e) =>
                                startEditing(
                                  q.id,
                                  score ?? 0,
                                  graded?.feedback || (isUnanswered ? 'Question not attempted' : ''),
                                  e
                                )
                              }
                              className="text-[10px] font-bold text-gray-500 hover:text-orange-600 transition flex items-center gap-1 cursor-pointer"
                              title="Edit marks or remarks"
                            >
                              <span>✏️</span> Edit
                            </button>
                          </div>
                        </div>
                        <p className="text-xs">
                          {graded?.feedback ||
                            (isUnanswered
                              ? 'This question was not attempted by the student on the answer sheet (0 marks).'
                              : 'Answer extracted and mapped to the answer sheet.')}
                        </p>
                      </div>
                    )}
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
