import { describe, it, expect } from 'vitest';
import {
  SAMPLE_QUESTIONS,
  SAMPLE_ANSWERS,
  SAMPLE_MAPPING,
  SAMPLE_GRADING,
  SAMPLE_ANSWER_PAGES
} from '@/lib/sampleData';

describe('lib/sampleData.ts - Assessment Data Contract & Edge Cases', () => {
  describe('SAMPLE_QUESTIONS', () => {
    it('should contain all 14 question entries matching the Biology assessment', () => {
      expect(SAMPLE_QUESTIONS.length).toBe(14);
    });

    it('should split subparts 11 a. and 11 b. as separate entries', () => {
      const q11a = SAMPLE_QUESTIONS.find((q) => q.number === '11 a.');
      const q11b = SAMPLE_QUESTIONS.find((q) => q.number === '11 b.');

      expect(q11a).toBeDefined();
      expect(q11b).toBeDefined();
      expect(q11a?.id).not.toBe(q11b?.id);
      expect(q11a?.marks).toBe(2);
      expect(q11b?.marks).toBe(3);
    });

    it('should have valid non-empty text, id, and marks for every question', () => {
      SAMPLE_QUESTIONS.forEach((q) => {
        expect(q.id).toBeDefined();
        expect(q.number).toBeDefined();
        expect(q.text.length).toBeGreaterThan(5);
        expect(q.pageIndex).toBeGreaterThanOrEqual(0);
        expect(q.marks).toBeGreaterThan(0);
      });
    });
  });

  describe('SAMPLE_ANSWERS and Bounding Boxes', () => {
    it('should contain answer blocks with valid bounding boxes within 0-100%', () => {
      SAMPLE_ANSWERS.forEach((ans) => {
        expect(ans.id).toBeDefined();
        expect(ans.text.length).toBeGreaterThan(0);
        expect(ans.pageIndex).toBeGreaterThanOrEqual(0);

        // Bounding Box checks
        expect(ans.bbox.x).toBeGreaterThanOrEqual(0);
        expect(ans.bbox.x).toBeLessThanOrEqual(100);
        expect(ans.bbox.y).toBeGreaterThanOrEqual(0);
        expect(ans.bbox.y).toBeLessThanOrEqual(100);
        expect(ans.bbox.width).toBeGreaterThan(0);
        expect(ans.bbox.width).toBeLessThanOrEqual(100);
        expect(ans.bbox.height).toBeGreaterThan(0);
        expect(ans.bbox.height).toBeLessThanOrEqual(100);
      });
    });

    it('should have answer blocks spanning across multiple pages', () => {
      const pages = new Set(SAMPLE_ANSWERS.map((a) => a.pageIndex));
      expect(pages.size).toBe(4);
      expect(pages.has(0)).toBe(true);
      expect(pages.has(1)).toBe(true);
      expect(pages.has(2)).toBe(true);
      expect(pages.has(3)).toBe(true);
    });
  });

  describe('SAMPLE_MAPPING', () => {
    it('should correctly map student answers to questions', () => {
      expect(SAMPLE_MAPPING.mappings.length).toBeGreaterThan(0);
      SAMPLE_MAPPING.mappings.forEach((m) => {
        expect(m.questionId).toBeDefined();
        expect(m.answerBlockIds.length).toBeGreaterThan(0);
        expect(m.confidence).toBeGreaterThanOrEqual(0);
        expect(m.confidence).toBeLessThanOrEqual(1);
        expect(m.reason.length).toBeGreaterThan(3);
      });
    });

    it('should explicitly identify unanswered questions (q-4)', () => {
      expect(SAMPLE_MAPPING.unansweredQuestionIds).toContain('q-4');
      const q4Mapping = SAMPLE_MAPPING.mappings.find((m) => m.questionId === 'q-4');
      expect(q4Mapping).toBeUndefined();
    });

    it('should correctly map subparts 11 a. and 11 b.', () => {
      const map11a = SAMPLE_MAPPING.mappings.find((m) => m.questionId === 'q-11-a');
      const map11b = SAMPLE_MAPPING.mappings.find((m) => m.questionId === 'q-11-b');
      expect(map11a).toBeDefined();
      expect(map11b).toBeDefined();
      expect(map11a?.answerBlockIds).toContain('ans-11a');
      expect(map11b?.answerBlockIds).toContain('ans-11b');
    });
  });

  describe('SAMPLE_GRADING', () => {
    it('should contain grading breakdown for every question', () => {
      expect(SAMPLE_GRADING.perQuestion.length).toBe(SAMPLE_QUESTIONS.length);
      SAMPLE_GRADING.perQuestion.forEach((g) => {
        expect(g.questionId).toBeDefined();
        expect(['correct', 'partially_correct', 'incorrect', 'unanswered']).toContain(g.verdict);
        expect(g.feedback.length).toBeGreaterThan(5);
      });
    });

    it('should have correct total score sum', () => {
      const sum = SAMPLE_GRADING.perQuestion.reduce((acc, curr) => acc + (curr.score ?? 0), 0);
      const maxSum = SAMPLE_GRADING.perQuestion.reduce((acc, curr) => acc + (curr.maxScore ?? 0), 0);
      expect(SAMPLE_GRADING.totalScore).toBe(sum);
      expect(SAMPLE_GRADING.totalMaxScore).toBe(maxSum);
    });
  });

  describe('SAMPLE_ANSWER_PAGES', () => {
    it('should provide 4 valid SVG data URL page images', () => {
      expect(SAMPLE_ANSWER_PAGES.length).toBe(4);
      SAMPLE_ANSWER_PAGES.forEach((page, idx) => {
        expect(page.pageIndex).toBe(idx);
        expect(page.dataUrl.startsWith('data:image/svg+xml;utf8,')).toBe(true);
        expect(page.width).toBe(800);
        expect(page.height).toBe(1100);
      });
    });
  });
});
