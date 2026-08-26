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
import ReportCardModal from '@/components/ReportCardModal';
import ClassAnalyticsModal from '@/components/ClassAnalyticsModal';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'questions' | 'answers'>('questions');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState<string>('Student 1 (Aryan Sharma)');
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

  // Load saved settings on mount & clean up deprecated models
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
    setMobileTab('questions');
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

  // Natural Language Custom Exam Generator
  const handleGenerateCustomExam = async (promptText: string) => {
    setUploadError(null);
    setScreen('processing');
    setSidebarCollapsed(true);
    setMobileTab('questions');
    setPipeline({
      stage: 'extracting-questions',
      progress: 25,
      message: `Generating custom exam: "${promptText}"...`
    });

    try {
      const result = await postJson<{
        subject: string;
        questions: ExtractedQuestion[];
        answers: AnswerBlock[];
        mapping: MappingResult;
        grading: GradingResult;
        answerPages: PageImage[];
      }>('/api/generate-exam', { prompt: promptText }, settings.groqApiKey);

      setPipeline({
        stage: 'mapping',
        progress: 75,
        message: 'Rendering handwritten student answer sheet & bounding boxes...'
      });

      setTimeout(() => {
        setAnswerPages(result.answerPages);
        setQuestions(result.questions);
        setAnswers(result.answers);
        setMapping(result.mapping);
        setGrading(result.grading);
        setSelectedQuestionId(result.questions[0]?.id || null);
        setPipeline({ stage: 'done', progress: 100 });
        setScreen('results');
      }, 400);
    } catch (err: any) {
      console.error('Custom exam generator error:', err);
      setUploadError(err.message || 'Failed to generate custom exam. Please try again.');
      setScreen('upload');
      setSidebarCollapsed(false);
    }
  };

  // Human-in-the-Loop: Teacher score & feedback override
  const handleUpdateGrading = (questionId: string, newScore: number, newFeedback: string) => {
    if (!grading) return;
    const targetQ = questions.find((q) => q.id === questionId);
    const maxScore = targetQ?.maxMarks ?? targetQ?.marks ?? 5;

    const updatedPerQ = grading.perQuestion.map((g) => {
      if (g.questionId === questionId) {
        return {
          ...g,
          score: Math.min(maxScore, Math.max(0, newScore)),
          verdict: (newScore === maxScore ? 'correct' : newScore > 0 ? 'partially_correct' : 'incorrect') as 'correct' | 'partially_correct' | 'incorrect',
          feedback: newFeedback
        };
      }
      return g;
    });

    const newTotal = updatedPerQ.reduce((sum, g) => sum + g.score, 0);

    setGrading({
      ...grading,
      perQuestion: updatedPerQ,
      totalScore: newTotal
    });
  };

  // Human-in-the-Loop: Reassign Answer Block
  const handleReassignAnswer = (currentQuestionId: string, newQuestionId: string) => {
    if (!mapping) return;

    const currentMap = mapping.mappings.find((m) => m.questionId === currentQuestionId);
    const blocksToMove = currentMap?.answerBlockIds || [];

    const newMappings = mapping.mappings
      .filter((m) => m.questionId !== currentQuestionId)
      .map((m) => {
        if (m.questionId === newQuestionId) {
          return {
            ...m,
            answerBlockIds: Array.from(new Set([...m.answerBlockIds, ...blocksToMove])),
            reason: 'Manually linked by teacher'
          };
        }
        return m;
      });

    if (!newMappings.some((m) => m.questionId === newQuestionId) && blocksToMove.length > 0) {
      newMappings.push({
        questionId: newQuestionId,
        answerBlockIds: blocksToMove,
        confidence: 0.98,
        reason: 'Manually linked by teacher'
      });
    }

    const newUnanswered = questions
      .filter((q) => !newMappings.some((m) => m.questionId === q.id && m.answerBlockIds.length > 0))
      .map((q) => q.id);

    setMapping({
      ...mapping,
      mappings: newMappings,
      unansweredQuestionIds: newUnanswered
    });
  };

  async function handleStartMapping() {
    if (!questionPaperFile || !answerSheetFile) return;
    setUploadError(null);
    setScreen('processing');
    setSidebarCollapsed(true);
    setMobileTab('questions');

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
        message: 'Extracting student answers & bounding boxes...'
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
        message: 'Semantically mapping answers to questions...'
      });
      const mappingResult = await postJson<MappingResult>(
        '/api/map-answers',
        { questions: extractedQuestions, answers: extractedAnswers },
        settings.groqApiKey
      );
      setMapping(mappingResult);

      if (extractedQuestions.length > 0) {
        setSelectedQuestionId(extractedQuestions[0].id);
      }

      setPipeline({ stage: 'done', progress: 100 });
      setScreen('results');

      // Asynchronous background grading
      setGradingLoading(true);
      postJson<GradingResult>(
        '/api/grade',
        {
          questions: extractedQuestions,
          answers: extractedAnswers,
          mapping: mappingResult
        },
        settings.groqApiKey
      )
        .then((g) => setGrading(g))
        .catch((e) => console.warn('Background grading notice:', e.message))
        .finally(() => setGradingLoading(false));
    } catch (err: any) {
      console.error('Pipeline failed:', err);
      setUploadError(err.message || 'Pipeline processing failed. Please verify your Groq API key.');
      setScreen('upload');
      setSidebarCollapsed(false);
    }
  }

  function resetAll() {
    setScreen('upload');
    setQuestionPaperFile(null);
    setAnswerSheetFile(null);
    setQuestionPaperPages(null);
    setAnswerSheetPageCount(null);
    setQuestions([]);
    setAnswers([]);
    setMapping(null);
    setGrading(null);
    setSelectedQuestionId(null);
    setUploadError(null);
    setSidebarCollapsed(false);
    setMobileTab('questions');
  }

  async function countPages(file: File, setter: (n: number) => void) {
    try {
      const pages = await fileToPageImages(file, { enhanceContrast: false });
      setter(pages.length);
    } catch {
      // Non-fatal cosmetic page count
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8f9fb] font-sans antialiased text-gray-900">
      {/* Sidebar with Mobile Drawer and Desktop Support */}
      <Sidebar
        collapsed={screen !== 'upload' || sidebarCollapsed}
        mobileOpen={isMobileMenuOpen}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenSettings={() => {
          setIsMobileMenuOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* TopBar with Mobile Hamburger & Notification Support */}
        <TopBar
          onBack={screen !== 'upload' ? resetAll : undefined}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
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
            onGenerateCustomExam={handleGenerateCustomExam}
            error={uploadError}
          />
        )}

        {/* Loading Screen */}
        {screen === 'processing' && <LoadingState state={pipeline} />}

        {/* Mapping Screen (Responsive Desktop Side-by-Side & Mobile Segmented Tabs) */}
        {screen === 'results' && mapping && (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Top Grading & Summary Bar with Student Roster, CSV Marksheet, Report Card & Analytics */}
            <GradingSummary
              questions={questions}
              mapping={mapping}
              grading={grading}
              gradingLoading={gradingLoading}
              activeStudent={activeStudent}
              onSelectStudent={setActiveStudent}
              onOpenReportCard={() => setIsReportCardOpen(true)}
              onOpenAnalytics={() => setIsAnalyticsOpen(true)}
            />

            {/* Mobile Segmented Tab Switcher (Visible only on mobile screens < md) */}
            <div className="md:hidden flex items-center justify-center px-4 py-2 bg-white border-b border-gray-200">
              <div className="flex w-full max-w-xs rounded-full bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setMobileTab('questions')}
                  className={`flex-1 rounded-full py-1.5 text-xs font-bold transition cursor-pointer ${
                    mobileTab === 'questions'
                      ? 'bg-[#2d2d2d] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Questions
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab('answers')}
                  className={`flex-1 rounded-full py-1.5 text-xs font-bold transition cursor-pointer ${
                    mobileTab === 'answers'
                      ? 'bg-[#2d2d2d] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Answer Sheet
                </button>
              </div>
            </div>

            {/* Main Content: Side-by-Side on Desktop, Tabbed on Mobile */}
            <div className="flex min-h-0 flex-1 overflow-hidden flex-col md:flex-row">
              {/* Questions Panel */}
              <div
                className={`${
                  mobileTab === 'questions' ? 'flex' : 'hidden'
                } md:flex flex-1 md:flex-initial md:w-[480px] min-h-0 overflow-hidden`}
              >
                <QuestionList
                  questions={questions}
                  mapping={mapping}
                  grading={grading}
                  selectedQuestionId={selectedQuestionId}
                  onSelect={(id) => {
                    setSelectedQuestionId(id);
                  }}
                  onUpdateGrading={handleUpdateGrading}
                  onReassignAnswer={handleReassignAnswer}
                />
              </div>

              {/* Answer Sheet Viewer Panel */}
              <div
                className={`${
                  mobileTab === 'answers' ? 'flex' : 'hidden'
                } md:flex flex-1 min-h-0 overflow-hidden`}
              >
                <AnswerSheetViewer
                  pages={answerPages}
                  answers={answers}
                  mapping={mapping}
                  grading={grading}
                  questions={questions}
                  selectedQuestion={questions.find((q) => q.id === selectedQuestionId) ?? null}
                  onSelectQuestion={(id) => {
                    setSelectedQuestionId(id);
                  }}
                />
              </div>
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

      {/* Dynamic Student Report Card Modal */}
      {mapping && (
        <ReportCardModal
          isOpen={isReportCardOpen}
          onClose={() => setIsReportCardOpen(false)}
          questions={questions}
          mapping={mapping}
          grading={grading}
          studentName={activeStudent}
        />
      )}

      {/* Dynamic Class Analytics Modal */}
      {mapping && (
        <ClassAnalyticsModal
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
          questions={questions}
          mapping={mapping}
          grading={grading}
        />
      )}
    </div>
  );
}
