// Shared types used across client and server for the assessment pipeline.

export interface PageImage {
  pageIndex: number; // 0-based
  dataUrl: string; // base64 PNG/JPEG data URL, used for on-screen rendering
  width: number;
  height: number;
}

export interface ExtractedQuestion {
  id: string; // stable id, e.g. "q-1", "q-11-a"
  number: string; // printed numbering, e.g. "1", "2", "11 a.", "11 (b)"
  text: string;
  marks?: number | null;
  maxMarks?: number | null;
  pageIndex: number; // page in the question paper where this question appears
}

export interface BoundingBox {
  x: number; // % from left, 0-100
  y: number; // % from top, 0-100
  width: number; // % of page width
  height: number; // % of page height
}

export interface AnswerBlock {
  id: string; // stable id, e.g. "a-1"
  rawLabel: string | null; // number/label the student wrote, e.g. "Q1", "11(a)" or null
  text: string; // best-effort transcription of the handwriting
  pageIndex: number; // page in the answer sheet (0-based)
  bbox: BoundingBox; // percentage-based box on that page
}

export interface MappedAnswer {
  questionId: string | null; // null => unmatched answer
  answerBlockIds: string[]; // one or more AnswerBlock ids (multi-page spans)
  confidence: number; // 0-1
  reason: string; // short justification from the model
}

export interface MappingResult {
  mappings: MappedAnswer[];
  unansweredQuestionIds: string[];
  unmatchedAnswerBlockIds: string[];
}

export type Verdict = 'correct' | 'partially_correct' | 'incorrect' | 'unanswered' | 'ungraded';

export interface GradedQuestion {
  questionId: string;
  verdict: Verdict;
  score: number | null;
  maxScore: number | null;
  feedback: string;
}

export interface GradingResult {
  perQuestion: GradedQuestion[];
  overallFeedback: string;
  totalScore: number | null;
  totalMaxScore: number | null;
}

export interface PipelineState {
  stage:
    | 'idle'
    | 'rendering'
    | 'extracting-questions'
    | 'extracting-answers'
    | 'mapping'
    | 'grading'
    | 'done'
    | 'error';
  message?: string;
  progress: number; // 0-100
}

export interface AppSettings {
  groqApiKey: string;
  visionModel: string;
  textModel: string;
  enhanceContrast: boolean;
}
