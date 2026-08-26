'use client';

import { useRef } from 'react';

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
  error
}: Props) {
  const canStart = !!questionPaper.file && !!answerSheet.file;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 overflow-y-auto bg-[#f8f9fb]">
      <div className="w-full max-w-3xl text-center">
        {/* Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl flex items-center justify-center flex-wrap gap-2">
          <span>Upload</span>
          <span className="inline-block rounded-xl bg-[#FFE4D6] px-3.5 py-1 text-[#FF5722]">
            Question Paper &amp; Answer Sheets
          </span>
        </h1>
        <p className="mt-3 text-sm font-medium text-gray-500">Upload both files to get started</p>

        {/* Central Teacher Illustration with Concentric Rings */}
        <div className="relative mx-auto my-7 flex h-32 w-32 items-center justify-center">
          {/* Concentric rings */}
          <div className="absolute inset-0 rounded-full bg-[#FFE4D6]/40 animate-pulse" />
          <div className="absolute inset-3 rounded-full bg-[#FFE4D6]/70" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF6B35] to-[#FF8C42] shadow-md text-3xl">
            👩‍🏫
          </div>

          {/* Orbiting small badge icons */}
          <div className="absolute -top-1 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF5722] text-[11px] text-white shadow-xs">
            🕒
          </div>
          <div className="absolute -bottom-1 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF5722] text-[11px] text-white shadow-xs">
            ⚙️
          </div>
          <div className="absolute top-10 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF5722] text-[11px] text-white shadow-xs">
            📷
          </div>
          <div className="absolute top-10 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF5722] text-[11px] text-white shadow-xs">
            ☁️
          </div>
        </div>

        {/* Two Upload Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-4 max-w-2xl mx-auto">
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
              onClick={() => onLoadSampleExam('biology')}
              className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-3.5 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100 transition shadow-2xs cursor-pointer"
            >
              <span>🌱</span>
              <span>Biology Exam (14 Qs, Subparts)</span>
            </button>
            <button
              onClick={() => onLoadSampleExam('physics')}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition shadow-2xs cursor-pointer"
            >
              <span>⚡</span>
              <span>5-Q Physics & Chem Exam (2 Correct, 2 Wrong, 1 Unanswered)</span>
            </button>
          </div>
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
            className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-white text-[11px] font-bold hover:bg-black transition"
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
      className="group flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 p-7 text-center transition hover:border-orange-300 hover:bg-white min-h-[170px]"
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
