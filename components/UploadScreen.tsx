'use client';

import { useRef, useState } from 'react';

interface UploadFileState {
  file: File | null;
  pageCount: number | null;
}

interface Props {
  questionPaper: UploadFileState;
  answerSheet: UploadFileState;
  onSelectQuestionPaper: (file: File) => void;
  onSelectAnswerSheet: (file: File) => void;
  onClearQuestionPaper: () => void;
  onClearAnswerSheet: () => void;
  onStartMapping: () => void;
  onLoadSampleExam: (type?: 'biology' | 'physics') => void;
  onGenerateCustomExam?: (prompt: string) => void;
  error?: string | null;
}

export default function UploadScreen({
  questionPaper,
  answerSheet,
  onSelectQuestionPaper,
  onSelectAnswerSheet,
  onClearQuestionPaper,
  onClearAnswerSheet,
  onStartMapping,
  onLoadSampleExam,
  onGenerateCustomExam,
  error
}: Props) {
  const [customPrompt, setCustomPrompt] = useState('');
  const canStart = !!questionPaper.file && !!answerSheet.file;

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8 bg-[#fdfdfd] overflow-y-auto">
      <div className="w-full max-w-2xl text-center py-6">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          Upload <span className="text-[#FF5722] font-black">Question Paper & Answer Sheets</span>
        </h1>
        <p className="mt-1 text-xs text-gray-500 font-medium">
          Upload both files to get started
        </p>

        {/* Central Teacher Graphic / Avatar */}
        <div className="my-6 flex justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center">
            {/* Concentric rings */}
            <div className="absolute inset-0 rounded-full bg-orange-50/60 animate-ping opacity-25" />
            <div className="absolute inset-1 rounded-full border border-orange-200/60" />
            <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-orange-400 to-amber-300 opacity-90 shadow-md flex items-center justify-center text-white text-3xl">
              👩‍🏫
            </div>

            {/* Orbiting mini badges */}
            <span className="absolute -top-1 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white shadow">
              ⏱
            </span>
            <span className="absolute bottom-0 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-400 text-[10px] text-white shadow">
              ⚙
            </span>
            <span className="absolute top-6 -left-3 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white shadow">
              📄
            </span>
            <span className="absolute top-6 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-orange-400 text-[10px] text-white shadow">
              ☁
            </span>
          </div>
        </div>

        {/* Dual Upload Dropzone Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Question Paper Card */}
          <UploadCard
            label="Question Paper"
            state={questionPaper}
            onSelect={onSelectQuestionPaper}
            onClear={onClearQuestionPaper}
          />

          {/* Answer Sheet Card */}
          <UploadCard
            label="Answer Sheet"
            state={answerSheet}
            onSelect={onSelectAnswerSheet}
            onClear={onClearAnswerSheet}
          />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mt-5 mx-auto max-w-xl rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={onStartMapping}
            disabled={!canStart}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-semibold shadow-sm transition ${
              canStart
                ? 'bg-[#3E3E3E] text-white hover:bg-gray-900 active:scale-98 cursor-pointer'
                : 'cursor-not-allowed bg-gray-300 text-gray-500'
            }`}
          >
            <span>Start Mapping</span>
            <span>→</span>
          </button>

          <p className="text-xs text-gray-400 font-medium">
            Once both files are uploaded, you&apos;ll be able to map answers with questions
          </p>

          {/* 1-Click Sample Exam Demo Buttons */}
          <div className="mt-2 pt-3 border-t border-gray-200/60 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-gray-400 font-medium">1-Click Test Demos:</span>
            <button
              type="button"
              onClick={() => onLoadSampleExam('biology')}
              className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-3.5 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100 transition shadow-2xs cursor-pointer"
            >
              <span>🌱</span>
              <span>Biology Exam (14 Qs, Subparts)</span>
            </button>
            <button
              type="button"
              onClick={() => onLoadSampleExam('physics')}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition shadow-2xs cursor-pointer"
            >
              <span>⚡</span>
              <span>5-Q Physics & Chem Exam (2 Correct, 2 Wrong, 1 Unanswered)</span>
            </button>
          </div>

          {/* AI Dynamic Natural Language Exam Generator */}
          {onGenerateCustomExam && (
            <div className="mt-3 pt-3 border-t border-gray-200/60 w-full max-w-xl text-center">
              <p className="text-xs font-bold text-gray-800 flex items-center justify-center gap-1.5 mb-2">
                <span className="text-orange-500">✨</span>
                <span>Generate Custom Exam with AI Prompt</span>
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customPrompt.trim()) onGenerateCustomExam(customPrompt.trim());
                }}
                className="flex items-center gap-2 rounded-2xl bg-white border border-gray-200 p-1.5 shadow-sm focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100"
              >
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder='e.g. "Science paper with 7 questions with 3 answered and 4 unanswered"'
                  className="flex-1 px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 outline-none bg-transparent"
                />
                <button
                  type="submit"
                  disabled={!customPrompt.trim()}
                  className="inline-flex items-center gap-1 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                >
                  <span>Generate &amp; Map</span>
                  <span>✦</span>
                </button>
              </form>

              {/* Quick Suggestion Chips */}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-gray-500">
                <span className="text-gray-400">Suggestions:</span>
                <button
                  type="button"
                  onClick={() => setCustomPrompt('Science paper with 7 questions with 3 answered and 4 unanswered')}
                  className="rounded-full bg-gray-100 px-2.5 py-0.5 hover:bg-orange-50 hover:text-orange-600 transition cursor-pointer"
                >
                  &ldquo;7 Qs (3 answered, 4 unanswered)&rdquo;
                </button>
                <button
                  type="button"
                  onClick={() => setCustomPrompt('Math calculus exam with 6 questions, 4 correct and 2 incorrect')}
                  className="rounded-full bg-gray-100 px-2.5 py-0.5 hover:bg-orange-50 hover:text-orange-600 transition cursor-pointer"
                >
                  &ldquo;Math (4 correct, 2 incorrect)&rdquo;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadCard({
  label,
  state,
  onSelect,
  onClear
}: {
  label: string;
  state: UploadFileState;
  onSelect: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Filled State matching Figma Screenshot
  if (state.file) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200/80 bg-white/40 p-5 flex items-center justify-center min-h-[170px]">
        <div className="relative flex w-full items-center gap-3.5 rounded-2xl bg-white p-4 shadow-sm border border-gray-100/90 text-left">
          {/* PDF/Image Icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 font-bold text-xs border border-red-100">
            {state.file.type === 'application/pdf' ? 'PDF' : 'IMG'}
          </div>

          {/* File details */}
          <div className="min-w-0 flex-1 pr-6">
            <p className="truncate text-xs font-bold text-gray-900">{state.file.name}</p>
            <p className="text-[11px] font-medium text-gray-400 mt-0.5">
              {formatFileSize(state.file.size)}
              {state.pageCount ? ` • ${state.pageCount} Page${state.pageCount > 1 ? 's' : ''}` : ''}
            </p>
          </div>

          {/* Remove Cross Button */}
          <button
            onClick={onClear}
            className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-white text-[11px] font-bold hover:bg-black transition cursor-pointer"
            title={`Remove ${label}`}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // Empty State matching Figma Screenshot
  return (
    <button
      onClick={() => inputRef.current?.click()}
      className="group flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 p-7 text-center transition hover:border-orange-300 hover:bg-white min-h-[170px] cursor-pointer"
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onSelect(f);
          e.target.value = '';
        }}
      />

      {/* Upload Box Icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 group-hover:bg-orange-50 group-hover:text-orange-500 transition">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          <polyline points="7 9 12 4 17 9" />
          <line x1="12" y1="4" x2="12" y2="16" />
        </svg>
      </div>

      <p className="text-xs font-semibold text-gray-800">
        Upload <span className="text-[#FF5722]">{label}</span>
      </p>
      <p className="text-[11px] font-medium text-gray-400">Max 10MB</p>
    </button>
  );
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0.0MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 0.1) {
    return `${mb.toFixed(1)}MB`;
  }
  const kb = bytes / 1024;
  if (kb >= 1) {
    return `${kb.toFixed(1)}KB`;
  }
  return `${bytes}B`;
}
