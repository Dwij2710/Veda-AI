import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UploadScreen from '@/components/UploadScreen';
import QuestionList from '@/components/QuestionList';
import AnswerSheetViewer from '@/components/AnswerSheetViewer';
import GradingSummary from '@/components/GradingSummary';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import SettingsModal from '@/components/SettingsModal';
import {
  SAMPLE_QUESTIONS,
  SAMPLE_ANSWERS,
  SAMPLE_MAPPING,
  SAMPLE_GRADING,
  SAMPLE_ANSWER_PAGES
} from '@/lib/sampleData';

describe('UI Components Unit Tests', () => {
  describe('UploadScreen', () => {
    it('renders empty state correctly with disabled Start Mapping button', () => {
      render(
        <UploadScreen
          questionPaper={{ file: null, pageCount: null }}
          answerSheet={{ file: null, pageCount: null }}
          onSelectQuestionPaper={vi.fn()}
          onSelectAnswerSheet={vi.fn()}
          onClearQuestionPaper={vi.fn()}
          onClearAnswerSheet={vi.fn()}
          onStartMapping={vi.fn()}
          onLoadSampleExam={vi.fn()}
        />
      );

      expect(screen.getByText(/Question Paper & Answer Sheets/i)).toBeInTheDocument();
      expect(screen.getByText('Question Paper')).toBeInTheDocument();
      expect(screen.getByText('Answer Sheet')).toBeInTheDocument();

      const startButton = screen.getByRole('button', { name: /Start Mapping/i });
      expect(startButton).toBeDisabled();
    });

    it('renders filled state and enables Start Mapping when both files are selected', () => {
      const qFile = new File(['dummy content'], 'Class_10_Paper.pdf', { type: 'application/pdf' });
      const aFile = new File(['dummy content'], 'Student_1_Answer.pdf', { type: 'application/pdf' });

      render(
        <UploadScreen
          questionPaper={{ file: qFile, pageCount: 2 }}
          answerSheet={{ file: aFile, pageCount: 4 }}
          onSelectQuestionPaper={vi.fn()}
          onSelectAnswerSheet={vi.fn()}
          onClearQuestionPaper={vi.fn()}
          onClearAnswerSheet={vi.fn()}
          onStartMapping={vi.fn()}
          onLoadSampleExam={vi.fn()}
        />
      );

      expect(screen.getByText('Class_10_Paper.pdf')).toBeInTheDocument();
      expect(screen.getByText('Student_1_Answer.pdf')).toBeInTheDocument();

      const startButton = screen.getByRole('button', { name: /Start Mapping/i });
      expect(startButton).not.toBeDisabled();
    });

    it('triggers onLoadSampleExam when clicking sample exam button', () => {
      const loadSampleMock = vi.fn();
      render(
        <UploadScreen
          questionPaper={{ file: null, pageCount: null }}
          answerSheet={{ file: null, pageCount: null }}
          onSelectQuestionPaper={vi.fn()}
          onSelectAnswerSheet={vi.fn()}
          onClearQuestionPaper={vi.fn()}
          onClearAnswerSheet={vi.fn()}
          onStartMapping={vi.fn()}
          onLoadSampleExam={loadSampleMock}
        />
      );

      const sampleButton = screen.getByText(/Biology Exam/i);
      fireEvent.click(sampleButton);
      expect(loadSampleMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('QuestionList', () => {
    it('renders list of extracted questions with correct badges', () => {
      const selectMock = vi.fn();
      render(
        <QuestionList
          questions={SAMPLE_QUESTIONS}
          mapping={SAMPLE_MAPPING}
          grading={SAMPLE_GRADING}
          selectedQuestionId="q-2"
          onSelect={selectMock}
        />
      );

      expect(screen.getByText(/Extracted Questions/i)).toBeInTheDocument();
      expect(screen.getByText('11 a.')).toBeInTheDocument();
      expect(screen.getByText('11 b.')).toBeInTheDocument();
    });

    it('filters questions by search query', () => {
      render(
        <QuestionList
          questions={SAMPLE_QUESTIONS}
          mapping={SAMPLE_MAPPING}
          grading={SAMPLE_GRADING}
          selectedQuestionId="q-2"
          onSelect={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search question/i);
      fireEvent.change(searchInput, { target: { value: 'photosynthesis' } });

      expect(screen.getByText(/organelles is primarily involved in photosynthesis/i)).toBeInTheDocument();
      expect(screen.queryByText(/flow of blood through the human heart/i)).not.toBeInTheDocument();
    });

    it('filters questions by unanswered status tab', () => {
      render(
        <QuestionList
          questions={SAMPLE_QUESTIONS}
          mapping={SAMPLE_MAPPING}
          grading={SAMPLE_GRADING}
          selectedQuestionId="q-2"
          onSelect={vi.fn()}
        />
      );

      const unansweredTab = screen.getByRole('button', { name: /Unanswered/i });
      fireEvent.click(unansweredTab);

      // Question 4 is unanswered
      expect(screen.getByText(/flow of blood through the human heart/i)).toBeInTheDocument();
      // Question 2 is answered so should be filtered out
      expect(screen.queryByText(/organelles is primarily involved in photosynthesis/i)).not.toBeInTheDocument();
    });
  });

  describe('AnswerSheetViewer', () => {
    it('renders answer sheet with zoom controls and page navigation', () => {
      const selectQuestionMock = vi.fn();
      const selectedQ = SAMPLE_QUESTIONS.find((q) => q.id === 'q-2') || null;

      render(
        <AnswerSheetViewer
          pages={SAMPLE_ANSWER_PAGES}
          answers={SAMPLE_ANSWERS}
          mapping={SAMPLE_MAPPING}
          grading={SAMPLE_GRADING}
          selectedQuestion={selectedQ}
          questions={SAMPLE_QUESTIONS}
          onSelectQuestion={selectQuestionMock}
        />
      );

      expect(screen.getByText('Answer Sheet')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 4')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('Q2.')).toBeInTheDocument();
    });

    it('allows zooming in and zooming out', () => {
      const selectedQ = SAMPLE_QUESTIONS.find((q) => q.id === 'q-2') || null;

      render(
        <AnswerSheetViewer
          pages={SAMPLE_ANSWER_PAGES}
          answers={SAMPLE_ANSWERS}
          mapping={SAMPLE_MAPPING}
          grading={SAMPLE_GRADING}
          selectedQuestion={selectedQ}
          questions={SAMPLE_QUESTIONS}
          onSelectQuestion={vi.fn()}
        />
      );

      const zoomInBtn = screen.getByTitle('Zoom in');
      fireEvent.click(zoomInBtn);
      expect(screen.getByText('115%')).toBeInTheDocument();

      const zoomOutBtn = screen.getByTitle('Zoom out');
      fireEvent.click(zoomOutBtn);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('GradingSummary', () => {
    it('renders accurate counts and score summary', () => {
      render(
        <GradingSummary
          questions={SAMPLE_QUESTIONS}
          mapping={SAMPLE_MAPPING}
          grading={SAMPLE_GRADING}
          gradingLoading={false}
        />
      );

      expect(screen.getByText('14')).toBeInTheDocument(); // 14 total questions
      expect(screen.getByText('13')).toBeInTheDocument(); // 13 answered
      expect(screen.getByText('1')).toBeInTheDocument(); // 1 unanswered
      expect(screen.getByText(/Score: 40 \/ 50/i)).toBeInTheDocument();
    });

    it('toggles overall feedback visibility', () => {
      render(
        <GradingSummary
          questions={SAMPLE_QUESTIONS}
          mapping={SAMPLE_MAPPING}
          grading={SAMPLE_GRADING}
          gradingLoading={false}
        />
      );

      const toggleBtn = screen.getByText(/View Overall Summary/i);
      fireEvent.click(toggleBtn);

      expect(screen.getByText(/AI Assessment Executive Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/Strong performance on physiological calculations/i)).toBeInTheDocument();
    });
  });

  describe('Sidebar & TopBar', () => {
    it('renders Sidebar with VedaAI branding and exams active item', () => {
      render(<Sidebar collapsed={false} />);
      expect(screen.getByText('VedaAI')).toBeInTheDocument();
      expect(screen.getByText(/AI Teacher.*Toolkit/i)).toBeInTheDocument();
      expect(screen.getByText('Exams')).toBeInTheDocument();
      expect(screen.getByText('Delhi Public School')).toBeInTheDocument();
    });

    it('renders TopBar with user profile and navigation', () => {
      render(<TopBar />);
      expect(screen.getByText('Exams')).toBeInTheDocument();
      expect(screen.getByText('Madhur Rastogi')).toBeInTheDocument();
      expect(screen.getByText('MR')).toBeInTheDocument();
    });
  });

  describe('SettingsModal', () => {
    it('renders settings modal with API key input and save action', () => {
      const saveMock = vi.fn();
      const closeMock = vi.fn();
      const initialSettings = {
        groqApiKey: 'gsk_test_123',
        visionModel: 'qwen/qwen3.6-27b',
        textModel: 'qwen/qwen3.6-27b',
        enhanceContrast: true
      };

      render(
        <SettingsModal
          isOpen={true}
          onClose={closeMock}
          settings={initialSettings}
          onSave={saveMock}
        />
      );

      expect(screen.getByText(/AI & Model Settings/i)).toBeInTheDocument();
      const saveBtn = screen.getByRole('button', { name: /Save Settings/i });
      fireEvent.click(saveBtn);
      expect(saveMock).toHaveBeenCalledTimes(1);
    });
  });
});
