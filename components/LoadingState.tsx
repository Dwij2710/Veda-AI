'use client';

import type { PipelineState } from '@/lib/types';

interface Props {
  state: PipelineState;
}

const STAGE_DESCRIPTIONS: Record<PipelineState['stage'], string> = {
  idle: 'Preparing assessment pipeline...',
  rendering: 'Rasterizing PDF & image pages...',
  'extracting-questions': 'Reading Question Paper with Groq Vision...',
  'extracting-answers': 'Segmenting student handwriting & bounding boxes...',
  mapping: 'Mapping student answers to questions...',
  grading: 'Evaluating marks and generating AI feedback...',
  done: 'Extraction & Mapping complete!',
  error: 'An error occurred during extraction.'
};

export default function LoadingState({ state }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 bg-white overflow-hidden">
      <div className="w-full max-w-md text-center">
        {/* Animated Groq / AI Sparkle Graphic */}
        <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
          {/* Pulsing Orange Stars */}
          <div className="text-[#FF5722] animate-bounce duration-1000">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-20 w-20 drop-shadow-md">
              <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />
            </svg>
          </div>

          {/* Orbiting smaller sparkle stars */}
          <div className="absolute top-2 right-2 text-[#FF8C42] animate-ping opacity-75">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
            </svg>
          </div>

          <div className="absolute bottom-3 left-3 text-[#FF5722] animate-pulse">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2l1.2 3.8L17 7l-3.8 1.2L12 12l-1.2-3.8L7 7l3.8-1.2L12 2z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-gray-900">Extracting...</h2>
        <p className="mt-1 text-sm font-medium text-gray-500">This may take a while</p>

        {/* Progress Bar */}
        <div className="mt-8 w-full max-w-sm mx-auto">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF8C42] to-[#FF5722] transition-all duration-500 shadow-xs"
              style={{ width: `${Math.max(8, state.progress)}%` }}
            />
          </div>
          <p className="mt-3 text-xs font-medium text-gray-400 animate-pulse">
            {state.message || STAGE_DESCRIPTIONS[state.stage] || 'Processing...'}
          </p>
        </div>
      </div>
    </div>
  );
}
