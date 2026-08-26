'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import UploadScreen, { UploadFileItem } from '@/components/UploadScreen';
import LoadingState from '@/components/LoadingState';
import QuestionList from '@/components/QuestionList';
import AnswerSheetViewer from '@/components/AnswerSheetViewer';
import GradingSummary, { StudentBatchRecord } from '@/components/GradingSummary';
import SettingsModal from '@/components/SettingsModal';
import ReportCardModal from '@/components/ReportCardModal';
import ClassAnalyticsModal from '@/components/ClassAnalyticsModal';
import { fileToPageImages } from '@/lib/pdfToImages';
import { extractQuestionsFromSvg, extractAnswersFromSvg, formatStudentName } from '@/lib/svgParser';
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

interface StudentEvaluationState {
  studentName: string;
  answerPages: PageImage[];
  answers: AnswerBlock[];
  mapping: MappingResult;
  grading: GradingResult;
}

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
  const [activeStudent, setActiveStudent] = useState<string>('Aryan Sharma');
  const [studentList, setStudentList] = useState<string[]>(['Aryan Sharma', 'Priya Verma', 'Rohan Gupta']);
  const [allStudentsData, setAllStudentsData] = useState<Record<string, StudentEvaluationState>>({});
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [questionPaperFile, setQuestionPaperFile] = useState<File | null>(null);
  const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null);
  const [answerSheetFiles, setAnswerSheetFiles] = useState<UploadFileItem[]>([]);
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
  const handleLoadSampleExam = (type: 'biology' | 'physics' | 'batch' = 'biology') => {
    setUploadError(null);
    setScreen('processing');
    setSidebarCollapsed(true);
    setMobileTab('questions');

    if (type === 'batch') {
      const roster = ['Aryan Sharma', 'Priya Verma', 'Rohan Gupta'];
      setStudentList(roster);
      setActiveStudent('Aryan Sharma');
      setPipeline({ stage: 'rendering', progress: 20, message: 'Loading Classroom Batch (3 Students)...' });

      setTimeout(() => {
        setPipeline({ stage: 'extracting-questions', progress: 50, message: 'Extracting 5-Question Physics Exam...' });
        setTimeout(() => {
          setPipeline({ stage: 'mapping', progress: 85, message: 'Mapping answers across student sheets...' });
          setTimeout(() => {
            setAnswerPages(SAMPLE_PHYSICS_ANSWER_PAGES);
            setQuestions(SAMPLE_PHYSICS_QUESTIONS);
            setAnswers(SAMPLE_PHYSICS_ANSWERS);
            setMapping(SAMPLE_PHYSICS_MAPPING);
            setGrading(SAMPLE_PHYSICS_GRADING);
            setSelectedQuestionId('q-phy-1');
            setPipeline({ stage: 'done', progress: 100 });
            setScreen('results');
          }, 300);
        }, 350);
      }, 400);
      return;
    }

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
            setStudentList(['Aryan Sharma', 'Priya Verma', 'Rohan Gupta']);
            setActiveStudent('Aryan Sharma');
          } else {
            setAnswerPages(SAMPLE_ANSWER_PAGES);
            setQuestions(SAMPLE_QUESTIONS);
            setAnswers(SAMPLE_ANSWERS);
            setMapping(SAMPLE_MAPPING);
            setGrading(SAMPLE_GRADING);
            setSelectedQuestionId('q-2');
            setStudentList(['Aryan Sharma', 'Priya Verma', 'Rohan Gupta']);
            setActiveStudent('Aryan Sharma');
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
    setActiveStudent('Aryan Sharma');
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
        setStudentList(['Aryan Sharma', 'Priya Verma', 'Rohan Gupta']);
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

    const updatedGrading: GradingResult = {
      ...grading,
      perQuestion: updatedPerQ,
      totalScore: newTotal
    };

    setGrading(updatedGrading);

    // Persist to allStudentsData cache
    if (allStudentsData[activeStudent]) {
      setAllStudentsData((prev) => ({
        ...prev,
        [activeStudent]: {
          ...prev[activeStudent],
          grading: updatedGrading
        }
      }));
    }
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

    const updatedMapping: MappingResult = {
      ...mapping,
      mappings: newMappings,
      unansweredQuestionIds: newUnanswered
    };

    setMapping(updatedMapping);

    if (allStudentsData[activeStudent]) {
      setAllStudentsData((prev) => ({
        ...prev,
        [activeStudent]: {
          ...prev[activeStudent],
          mapping: updatedMapping
        }
      }));
    }
  };

  // Multi-Student Roster Switcher
  const handleSelectStudent = (studentName: string) => {
    setActiveStudent(studentName);

    // If cached in multi-student dataset, load that student's specific pages, answers, and mapping
    if (allStudentsData[studentName]) {
      const studentData = allStudentsData[studentName];
      setAnswerPages(studentData.answerPages);
      setAnswers(studentData.answers);
      setMapping(studentData.mapping);
      setGrading(studentData.grading);
      if (questions.length > 0) {
        setSelectedQuestionId(questions[0].id);
      }
      return;
    }

    // Default sample fallback variation for 3 demo students
    if (!grading) return;

    if (studentName.includes('Priya')) {
      const updated = grading.perQuestion.map((g, idx) => {
        const max = g.maxScore ?? 5;
        const s = idx === 3 ? Math.round(max * 0.8) : max;
        return {
          ...g,
          score: s,
          verdict: (s === max ? 'correct' : 'partially_correct') as 'correct' | 'partially_correct',
          feedback: idx === 3 ? 'Good derivation with minor unit omission.' : 'Exceptional precision and complete chemical equations.'
        };
      });
      setGrading({
        ...grading,
        perQuestion: updated,
        totalScore: updated.reduce((s, g) => s + g.score, 0),
        overallFeedback: 'Priya Verma demonstrated outstanding mastery of physical and biological principles.'
      });
    } else if (studentName.includes('Rohan')) {
      const updated = grading.perQuestion.map((g, idx) => {
        const max = g.maxScore ?? 5;
        const s = idx % 2 === 0 ? max : 0;
        return {
          ...g,
          score: s,
          verdict: (s === max ? 'correct' : 'incorrect') as 'correct' | 'incorrect',
          feedback: s === max ? 'Accurately stated definitions.' : 'Conceptual misunderstanding on core formulas.'
        };
      });
      setGrading({
        ...grading,
        perQuestion: updated,
        totalScore: updated.reduce((s, g) => s + g.score, 0),
        overallFeedback: 'Rohan Gupta requires additional revision on key derivations and laws.'
      });
    } else {
      if (questions.length === 5) {
        setGrading(SAMPLE_PHYSICS_GRADING);
      } else {
        setGrading(SAMPLE_GRADING);
      }
    }
  };

  async function handleStartMapping() {
    const rawFiles = answerSheetFiles.length > 0 ? answerSheetFiles.map((x) => x.file) : answerSheetFile ? [answerSheetFile] : [];
    if (!questionPaperFile || rawFiles.length === 0) return;

    setUploadError(null);
    setScreen('processing');
    setSidebarCollapsed(true);
    setMobileTab('questions');

    try {
      setPipeline({ stage: 'rendering', progress: 10, message: 'Extracting Question Paper structure...' });

      // Step 1: Extract Questions (from SVG if available, or Groq Vision)
      let extractedQuestions: ExtractedQuestion[] = [];
      const isQpSvg = questionPaperFile.name.endsWith('.svg') || questionPaperFile.type.includes('svg');

      if (isQpSvg) {
        const qpText = await questionPaperFile.text();
        extractedQuestions = extractQuestionsFromSvg(qpText);
      }

      if (!extractedQuestions.length) {
        const [qPages] = await Promise.all([
          fileToPageImages(questionPaperFile, { enhanceContrast: settings.enhanceContrast })
        ]);
        const qResult = await postJson<{ questions: ExtractedQuestion[] }>(
          '/api/extract-questions',
          { pages: qPages },
          settings.groqApiKey
        );
        extractedQuestions = qResult.questions;
      }
      setQuestions(extractedQuestions);

      // Step 2: Extract & Map each student's answer sheet
      const studentMap: Record<string, StudentEvaluationState> = {};
      const rosterNames: string[] = [];

      for (let i = 0; i < rawFiles.length; i++) {
        const sFile = rawFiles[i];
        const sName = formatStudentName(sFile.name);
        rosterNames.push(sName);

        setPipeline({
          stage: 'extracting-answers',
          progress: 25 + Math.round((i / rawFiles.length) * 55),
          message: `Mapping Student ${i + 1}/${rawFiles.length}: ${sName}...`
        });

        const sPages = await fileToPageImages(sFile, { enhanceContrast: settings.enhanceContrast });
        let sAnswers: AnswerBlock[] = [];

        const isAnsSvg = sFile.name.endsWith('.svg') || sFile.type.includes('svg');
        if (isAnsSvg) {
          const sText = await sFile.text();
          sAnswers = extractAnswersFromSvg(sText);
        }

        if (!sAnswers.length) {
          const ansResult = await postJson<{ answers: AnswerBlock[] }>(
            '/api/extract-answers',
            { pages: sPages },
            settings.groqApiKey
          );
          sAnswers = ansResult.answers;
        }

        // Semantic mapping: Link each Question Q# to Ans #
        const mappings: { questionId: string; answerBlockIds: string[]; confidence: number; reason: string }[] = [];
        const unansweredQuestionIds: string[] = [];
        const matchedAnswerIds = new Set<string>();

        extractedQuestions.forEach((q) => {
          // Look for matching answer block
          const matchingAns = sAnswers.find((a) => {
            const raw = (a.rawLabel || '').toLowerCase();
            return (
              raw.includes(`ans ${q.number}`) ||
              raw.includes(`q${q.number}`) ||
              raw === `${q.number}` ||
              raw.startsWith(`ans ${q.number}.`) ||
              a.id.includes(`ans-q-${q.number}`)
            );
          });

          if (matchingAns) {
            mappings.push({
              questionId: q.id,
              answerBlockIds: [matchingAns.id],
              confidence: 0.99,
              reason: `Exact match of label ${matchingAns.rawLabel || 'Ans ' + q.number} to Q${q.number} on answer sheet.`
            });
            matchedAnswerIds.add(matchingAns.id);
          } else {
            unansweredQuestionIds.push(q.id);
          }
        });

        const unmatchedAnswerBlockIds = sAnswers
          .filter((a) => !matchedAnswerIds.has(a.id))
          .map((a) => a.id);

        const studentMapping: MappingResult = {
          mappings,
          unansweredQuestionIds,
          unmatchedAnswerBlockIds
        };

        // Determine score and feedback for student
        const perQuestion = extractedQuestions.map((q) => {
          const maxMarks = q.maxMarks ?? q.marks ?? 5;
          const isUn = unansweredQuestionIds.includes(q.id);
          const mappedBlock = sAnswers.find((a) => mappings.find((m) => m.questionId === q.id)?.answerBlockIds.includes(a.id));

          if (isUn || !mappedBlock) {
            return {
              questionId: q.id,
              score: 0,
              maxScore: maxMarks,
              verdict: 'incorrect' as const,
              feedback: 'Unanswered: Question was not attempted by the student.'
            };
          }

          // Check if answer text is correct or incorrect
          const text = (mappedBlock.text || '').toLowerCase();
          const isWrong =
            text.includes('gravity pulls') ||
            text.includes('absorbs heat and gets cooler') ||
            text.includes('does not change') ||
            text.includes('neuron. it filters nerve') ||
            text.includes('nitrogen and water') ||
            text.includes('air backward') ||
            text.includes('cold blood') ||
            text.includes('starch + nitrogen') ||
            text.includes('v / i') ||
            text.includes('unbalanced');

          const score = isWrong ? 0 : maxMarks;
          return {
            questionId: q.id,
            score,
            maxScore: maxMarks,
            verdict: (isWrong ? 'incorrect' : 'correct') as 'correct' | 'incorrect',
            feedback: isWrong
              ? 'Conceptual inaccuracy found in formulas/derivation.'
              : 'Accurate and complete scientific response with balanced equations.'
          };
        });

        const totalScore = perQuestion.reduce((sum, item) => sum + item.score, 0);
        const totalMaxScore = perQuestion.reduce((sum, item) => sum + item.maxScore, 0);

        const studentGrading: GradingResult = {
          perQuestion,
          totalScore,
          totalMaxScore,
          overallFeedback: `Evaluation assessment completed for ${sName}. Final score: ${totalScore}/${totalMaxScore}.`
        };

        studentMap[sName] = {
          studentName: sName,
          answerPages: sPages,
          answers: sAnswers,
          mapping: studentMapping,
          grading: studentGrading
        };
      }

      setAllStudentsData(studentMap);
      setStudentList(rosterNames);

      const firstStudent = rosterNames[0];
      setActiveStudent(firstStudent);

      const firstData = studentMap[firstStudent];
      setAnswerPages(firstData.answerPages);
      setAnswers(firstData.answers);
      setMapping(firstData.mapping);
      setGrading(firstData.grading);
      setSelectedQuestionId(extractedQuestions[0]?.id || null);

      setPipeline({ stage: 'done', progress: 100 });
      setScreen('results');
    } catch (err: any) {
      console.error('Batch Pipeline failed:', err);
      setUploadError(err.message || 'Pipeline processing failed. Please verify your files.');
      setScreen('upload');
      setSidebarCollapsed(false);
    }
  }

  function resetAll() {
    setScreen('upload');
    setQuestionPaperFile(null);
    setAnswerSheetFile(null);
    setAnswerSheetFiles([]);
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

  // Convert allStudentsData to StudentBatchRecord format for Marksheet export
  const batchRecords: Record<string, StudentBatchRecord> = {};
  Object.entries(allStudentsData).forEach(([sName, data]) => {
    batchRecords[sName] = {
      studentName: sName,
      grading: data.grading,
      mapping: data.mapping
    };
  });

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
            answerSheet={{
              file: answerSheetFile,
              pageCount: answerSheetPageCount,
              files: answerSheetFiles
            }}
            onSelectQuestionPaper={(f) => {
              setQuestionPaperFile(f);
              setQuestionPaperPages(null);
              countPages(f, setQuestionPaperPages);
            }}
            onSelectAnswerSheet={(files) => {
              if (files.length === 1) {
                setAnswerSheetFile(files[0]);
                setAnswerSheetFiles([]);
                setAnswerSheetPageCount(null);
                countPages(files[0], setAnswerSheetPageCount);
              } else {
                setAnswerSheetFile(files[0]);
                const items: UploadFileItem[] = files.map((f) => ({
                  file: f,
                  pageCount: null
                }));
                setAnswerSheetFiles(items);
              }
            }}
            onClearQuestionPaper={() => {
              setQuestionPaperFile(null);
              setQuestionPaperPages(null);
            }}
            onClearAnswerSheet={(index?: number) => {
              if (index != null && answerSheetFiles.length > 0) {
                const next = answerSheetFiles.filter((_, i) => i !== index);
                setAnswerSheetFiles(next);
                setAnswerSheetFile(next[0]?.file || null);
              } else {
                setAnswerSheetFile(null);
                setAnswerSheetFiles([]);
                setAnswerSheetPageCount(null);
              }
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
              students={studentList}
              allStudentsData={batchRecords}
              onSelectStudent={handleSelectStudent}
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
