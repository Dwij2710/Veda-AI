'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { AnswerBlock, ExtractedQuestion, GradingResult, MappingResult, PageImage } from '@/lib/types';

interface Props {
  pages: PageImage[];
  answers: AnswerBlock[];
  mapping: MappingResult;
  grading: GradingResult | null;
  selectedQuestion: ExtractedQuestion | null;
  questions: ExtractedQuestion[];
  onSelectQuestion: (id: string) => void;
}

export default function AnswerSheetViewer({
  pages,
  answers,
  mapping,
  grading,
  selectedQuestion,
  questions,
  onSelectQuestion
}: Props) {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeBoxRef = useRef<HTMLDivElement>(null);

  const answerById = useMemo(() => new Map(answers.map((a) => [a.id, a] as const)), [answers]);

  // Find mapping for the currently selected question
  const selectedMapping = selectedQuestion
    ? mapping.mappings.find((m) => m.questionId === selectedQuestion.id)
    : null;

  const selectedBlocks = useMemo(
    () =>
      selectedMapping
        ? (selectedMapping.answerBlockIds
            .map((id) => answerById.get(id))
            .filter(Boolean) as AnswerBlock[])
        : [],
    [selectedMapping, answerById]
  );

  // Pages containing parts of the selected answer
  const pagesWithHighlight = useMemo(
    () => Array.from(new Set(selectedBlocks.map((b) => b.pageIndex))).sort((a, b) => a - b),
    [selectedBlocks]
  );

  // Auto-jump to the page containing the selected answer
  useEffect(() => {
    if (pagesWithHighlight.length > 0) {
      if (!pagesWithHighlight.includes(activePageIndex)) {
        setActivePageIndex(pagesWithHighlight[0]);
      }
    }
  }, [selectedQuestion?.id, pagesWithHighlight, activePageIndex]);

  // Auto-scroll the bounding box into view when selected
  useEffect(() => {
    if (activeBoxRef.current && typeof activeBoxRef.current.scrollIntoView === 'function') {
      activeBoxRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [selectedQuestion?.id, activePageIndex]);

  const currentPage = pages[activePageIndex] || pages[0];
  const totalPages = Math.max(1, pages.length);

  const isUnanswered = selectedQuestion
    ? mapping.unansweredQuestionIds.includes(selectedQuestion.id)
    : false;

  const handleZoomIn = () => setZoom((z) => Math.min(250, z + 15));
  const handleZoomOut = () => setZoom((z) => Math.max(50, z - 15));
  const handleResetZoom = () => setZoom(100);

  const handlePrevPage = () => {
    setActivePageIndex((p) => Math.max(0, p - 1));
  };

  const handleNextPage = () => {
    setActivePageIndex((p) => Math.min(totalPages - 1, p + 1));
  };

  // Find all answer blocks on the current page for two-way clicking
  const answersOnCurrentPage = useMemo(
    () => answers.filter((a) => a.pageIndex === activePageIndex),
    [answers, activePageIndex]
  );

  const handleBlockClick = (block: AnswerBlock) => {
    const matched = mapping.mappings.find((m) => m.answerBlockIds.includes(block.id));
    if (matched && matched.questionId) {
      onSelectQuestion(matched.questionId);
    }
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[#e5e7eb]">
      {/* Dark Top Control Bar matching Figma */}
      <div className="flex h-14 shrink-0 items-center justify-between bg-[#3E3E3E] px-6 text-white shadow-sm">
        {/* Left Title */}
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold tracking-wide text-white">Answer Sheet</h2>
          {selectedQuestion && (
            <span className="hidden sm:inline-block rounded-full bg-[#525252] px-3 py-0.5 text-[11px] font-medium text-gray-200">
              Q{selectedQuestion.number} {isUnanswered ? '(Not Attempted)' : ''}
            </span>
          )}
        </div>

        {/* Right Controls: Zoom & Page Navigation */}
        <div className="flex items-center gap-3">
          {/* Zoom Control Pill */}
          <div className="flex items-center rounded-full bg-[#2B2B2B] px-3 py-1 text-xs font-semibold text-gray-200 shadow-inner">
            <button
              onClick={handleZoomOut}
              className="flex h-5 w-5 items-center justify-center rounded-full text-gray-300 hover:bg-white/10 hover:text-white transition"
              title="Zoom out"
            >
              −
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 text-[11px] text-gray-300 hover:text-white transition"
              title="Reset to 100%"
            >
              {zoom}%
            </button>
            <button
              onClick={handleZoomIn}
              className="flex h-5 w-5 items-center justify-center rounded-full text-gray-300 hover:bg-white/10 hover:text-white transition"
              title="Zoom in"
            >
              +
            </button>
          </div>

          {/* Page Navigation Pill */}
          <div className="flex items-center rounded-full bg-[#2B2B2B] px-3 py-1 text-xs font-semibold text-gray-200 shadow-inner">
            <button
              onClick={handlePrevPage}
              disabled={activePageIndex <= 0}
              className="flex h-5 w-5 items-center justify-center rounded-full text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 transition"
              title="Previous page"
            >
              ‹
            </button>
            <span className="px-2 text-[11px] text-gray-300">
              Page {activePageIndex + 1} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={activePageIndex >= totalPages - 1}
              className="flex h-5 w-5 items-center justify-center rounded-full text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 transition"
              title="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Scroll Container */}
      <div ref={containerRef} className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center items-start">
        {currentPage ? (
          <div
            className="relative transition-all duration-150 origin-top shadow-xl rounded-lg overflow-hidden bg-white max-w-full"
            style={{
              width: `${(zoom / 100) * 820}px`
            }}
          >
            {/* Answer sheet page image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPage.dataUrl}
              alt={`Answer Sheet Page ${activePageIndex + 1}`}
              className="block w-full h-auto select-none pointer-events-none"
            />

            {/* Render all answer blocks on this page with interactive bounding boxes */}
            {answersOnCurrentPage.map((block) => {
              const isBlockActive = selectedBlocks.some((b) => b.id === block.id);
              const mappedItem = mapping.mappings.find((m) => m.answerBlockIds.includes(block.id));
              const q = mappedItem ? questions.find((item) => item.id === mappedItem.questionId) : null;
              const displayLabel = block.rawLabel || (q ? `Q${q.number}` : 'Ans');

              return (
                <div
                  key={block.id}
                  ref={isBlockActive ? activeBoxRef : null}
                  onClick={() => handleBlockClick(block)}
                  className={`group absolute cursor-pointer transition-all duration-200 ${
                    isBlockActive
                      ? 'border-2 border-[#16a34a] bg-emerald-500/10 shadow-[0_0_0_3px_rgba(22,163,74,0.2)] z-20'
                      : 'border border-dashed border-transparent hover:border-emerald-400/80 hover:bg-emerald-500/5 z-10'
                  } rounded-xl`}
                  style={{
                    left: `${block.bbox.x}%`,
                    top: `${block.bbox.y}%`,
                    width: `${block.bbox.width}%`,
                    height: `${block.bbox.height}%`
                  }}
                >
                  {/* Top-Left Pinned Green Label Pill matching Figma */}
                  {isBlockActive && (
                    <div className="absolute -top-3.5 left-2 z-30 flex items-center gap-1 rounded-md bg-[#16a34a] px-2 py-0.5 text-[11px] font-bold text-white shadow-md tracking-tight animate-in fade-in zoom-in-90 duration-150">
                      <span>{displayLabel}</span>
                    </div>
                  )}

                  {/* Hover tooltip for unselected boxes */}
                  {!isBlockActive && (
                    <div className="absolute -top-3 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      {displayLabel} (Click to view)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No answer sheet pages loaded.
          </div>
        )}
      </div>

      {/* Unanswered Notice Banner if applicable */}
      {isUnanswered && selectedQuestion && (
        <div className="border-t border-amber-200 bg-amber-50 px-6 py-2 text-center text-xs font-semibold text-amber-800 flex items-center justify-center gap-2">
          <span>⚠️</span>
          <span>
            Question {selectedQuestion.number} was not attempted in the answer sheet.
          </span>
        </div>
      )}
    </div>
  );
}
