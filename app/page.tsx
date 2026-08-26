'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import UploadScreen from '@/components/UploadScreen';
import LoadingState from '@/components/LoadingState';
import QuestionList from '@/components/QuestionList';
import AnswerSheetViewer from '@/components/AnswerSheetViewer';
import GradingSummary from '@/components/GradingSummary';
import SettingsModal from '@/components/SettingsModal';
import { fileToPageImages } from '@/lib/pdfToImages';
import {
  SAMPLE_QUESTIONS,
  SAMPLE_ANSWERS,
  SAMPLE_MAPPING,
  SAMPLE_GRADING,
  SAMPLE_ANSWER_PAGES,
  SAMPLE_PHYSICS_QUESTIONS,
  SAMPLE_PHYSICS_ANSWERS,
  SAMPLE_PHYSICS_MAPPING,
  SAMPLE_PHYSICS_GRADING,
  SAMPLE_PHYSICS_ANSWER_PAGES
} from '@/lib/sampleData';
import type {
  AnswerBlock,
  AppSettings,
  ExtractedQuestion,
  GradingResult,
  MappingResult,
  PageImage,
  PipelineState
} from '@/lib/types';

type Screen = 'upload' | 'processing' | 'results';

const DEFAULT_SETTINGS: AppSettings = {
  groqApiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || '',
  visionModel: 'qwen/qwen3.6-27b',
  textModel: 'qwen/qwen3.6-27b',
  enhanceContrast: true
};

async function postJson<T>(url: string, body: unknown, apiKey?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['x-groq-api-key'] = apiKey;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || `Request to ${url} failed`);
  }
  return json as T;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('upload');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [questionPaperFile, setQuestionPaperFile] = useState<File | null>(null);
  const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null);
  const [questionPaperPages, setQuestionPaperPages] = useState<number | null>(null);
  const [answerSheetPageCount, setAnswerSheetPageCount] = useState<number | null>(null);

  const [pipeline, setPipeline] = useState<PipelineState>({ stage: 'idle', progress: 0 });
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [answerPages, setAnswerPages] = useState<PageImage[]>([]);
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerBlock[]>([]);
  const [mapping, setMapping] = useState<MappingResult | null>(null);
  const [grading, setGrading] = useState<GradingResult | null>(null);
  const [gradingLoading, setGradingLoading] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  // Load saved settings on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('veda_app_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.visionModel?.includes('llama-3.2') || !parsed.visionModel) {
          parsed.visionModel = 'qwen/qwen3.6-27b';
        }
        if (parsed.textModel?.includes('llama') || !parsed.textModel) {
          parsed.textModel = 'qwen/qwen3.6-27b';
        }
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('veda_app_settings', JSON.stringify(newSettings));
    } catch {
      // Ignore localStorage errors
    }
  };

  // 1-Click Sample Exam Loader
  const handleLoadSampleExam = (type: 'biology' | 'physics' = 'biology') => {
    setUploadError(null);
    setScreen('processing');
    setSidebarCollapsed(true);
    const examLabel = type === 'physics' ? '5-Q Physics & Chem Exam' : 'Biology Unit Exam';
    setPipeline({ stage: 'rendering', progress: 20, message: `Loading ${examLabel}...` });

    setTimeout(() => {
      setPipeline({ stage: 'extracting-questions', progress: 50, message: 'Extracting questions...' });
      setTimeout(() => {
        setPipeline({ stage: 'mapping', progress: 85, message: 'Mapping answers...' });
        setTimeout(() => {
          if (type === 'physics') {
            setAnswerPages(SAMPLE_PHYSICS_ANSWER_PAGES);
            setQuestions(SAMPLE_PHYSICS_QUESTIONS);
            setAnswers(SAMPLE_PHYSICS_ANSWERS);
            setMapping(SAMPLE_PHYSICS_MAPPING);
            setGrading(SAMPLE_PHYSICS_GRADING);
            setSelectedQuestionId('q-phy-1');
          } else {
            setAnswerPages(SAMPLE_ANSWER_PAGES);
            setQuestions(SAMPLE_QUESTIONS);
            setAnswers(SAMPLE_ANSWERS);
            setMapping(SAMPLE_MAPPING);
            setGrading(SAMPLE_GRADING);
            setSelectedQuestionId('q-2'); // Highlight Q2 chloroplast as in Figma mockup
          }
          setPipeline({ stage: 'done', progress: 100 });
          setScreen('results');
        }, 300);
      }, 350);
    }, 400);
  };

  async function handleStartMapping() {
    if (!questionPaperFile || !answerSheetFile) return;
    setUploadError(null);
    setScreen('processing');
    setSidebarCollapsed(true);

    try {
      setPipeline({ stage: 'rendering', progress: 8, message: 'Rasterizing PDF & image pages...' });
      const [qPages, aPages] = await Promise.all([
        fileToPageImages(questionPaperFile, { enhanceContrast: settings.enhanceContrast }),
        fileToPageImages(answerSheetFile, { enhanceContrast: settings.enhanceContrast })
      ]);
      setAnswerPages(aPages);

      setPipeline({
        stage: 'extracting-questions',
        progress: 30,
        message: 'Extracting questions with Groq Vision...'
      });
      const { questions: extractedQuestions } = await postJson<{ questions: ExtractedQuestion[] }>(
        '/api/extract-questions',
        { pages: qPages },
        settings.groqApiKey
      );
      setQuestions(extractedQuestions);

      setPipeline({
        stage: 'extracting-answers',
        progress: 60,
        message: 'Segmenting student handwritten answers & bounding boxes...'
      });
      const { answers: extractedAnswers } = await postJson<{ answers: AnswerBlock[] }>(
        '/api/extract-answers',
        { pages: aPages },
        settings.groqApiKey
      );
      setAnswers(extractedAnswers);

      setPipeline({
        stage: 'mapping',
        progress: 85,
        message: 'Mapping student answers to questions...'
      });
      const mappingResult = await postJson<MappingResult>(
        '/api/map-answers',
        {
          questions: extractedQuestions,
          answers: extractedAnswers
        },
        settings.groqApiKey
      );
      setMapping(mappingResult);

      setPipeline({ stage: 'done', progress: 100, message: 'Complete!' });
      setSelectedQuestionId(extractedQuestions[0]?.id ?? null);
      setScreen('results');

      // Run grading in background
      setGradingLoading(true);
      try {
        const gradingResult = await postJson<GradingResult>(
          '/api/grade',
          {
            questions: extractedQuestions,
            answers: extractedAnswers,
            mapping: mappingResult
          },
          settings.groqApiKey
        );
        setGrading(gradingResult);
      } catch (gradeErr) {
        console.error('Grading background error:', gradeErr);
      } finally {
        setGradingLoading(false);
      }
    } catch (err: any) {
      console.error('Pipeline error:', err);
      setPipeline({ stage: 'error', progress: 0, message: err.message });
      setUploadError(err.message || 'Something went wrong while processing your files.');
      setScreen('upload');
      setSidebarCollapsed(false);
    }
  }

  function resetAll() {
    setScreen('upload');
    setSidebarCollapsed(false);
    setQuestionPaperFile(null);
    setAnswerSheetFile(null);
    setQuestionPaperPages(null);
    setAnswerSheetPageCount(null);
    setAnswerPages([]);
    setQuestions([]);
    setAnswers([]);
    setMapping(null);
    setGrading(null);
    setSelectedQuestionId(null);
    setUploadError(null);
    setPipeline({ stage: 'idle', progress: 0 });
  }

  async function countPages(file: File, setter: (n: number) => void) {
    try {
      const pages = await fileToPageImages(file);
      setter(pages.length);
    } catch {
      // Non-fatal cosmetic page count
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8f9fb] font-sans antialiased text-gray-900">
      {/* Collapsible Sidebar */}
      <Sidebar
        collapsed={screen !== 'upload' || sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* TopBar */}
        <TopBar
          onBack={screen !== 'upload' ? resetAll : undefined}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Upload Screen */}
        {screen === 'upload' && (
          <UploadScreen
            questionPaper={{ file: questionPaperFile, pageCount: questionPaperPages }}
            answerSheet={{ file: answerSheetFile, pageCount: answerSheetPageCount }}
            onSelectQuestionPaper={(f) => {
              setQuestionPaperFile(f);
              setQuestionPaperPages(null);
              countPages(f, setQuestionPaperPages);
            }}
            onSelectAnswerSheet={(f) => {
              setAnswerSheetFile(f);
              setAnswerSheetPageCount(null);
              countPages(f, setAnswerSheetPageCount);
            }}
            onClearQuestionPaper={() => {
              setQuestionPaperFile(null);
              setQuestionPaperPages(null);
            }}
            onClearAnswerSheet={() => {
              setAnswerSheetFile(null);
              setAnswerSheetPageCount(null);
            }}
            onStartMapping={handleStartMapping}
            onLoadSampleExam={handleLoadSampleExam}
            error={uploadError}
          />
        )}

        {/* Loading Screen */}
        {screen === 'processing' && <LoadingState state={pipeline} />}

        {/* Side-by-side Results Screen */}
        {screen === 'results' && mapping && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <GradingSummary
              questions={questions}
              mapping={mapping}
              grading={grading}
              gradingLoading={gradingLoading}
            />

            <div className="flex min-h-0 flex-1 overflow-hidden">
              <QuestionList
                questions={questions}
                mapping={mapping}
                grading={grading}
                selectedQuestionId={selectedQuestionId}
                onSelect={setSelectedQuestionId}
              />
              <AnswerSheetViewer
                pages={answerPages}
                answers={answers}
                mapping={mapping}
                grading={grading}
                questions={questions}
                selectedQuestion={questions.find((q) => q.id === selectedQuestionId) ?? null}
                onSelectQuestion={setSelectedQuestionId}
              />
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
