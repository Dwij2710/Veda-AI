import type { AnswerBlock, ExtractedQuestion, MappingResult, GradingResult } from './types';

/**
 * Extracts structured questions from an SVG question paper text.
 */
export function extractQuestionsFromSvg(svgContent: string): ExtractedQuestion[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const textElements = Array.from(doc.querySelectorAll('text'));

  const questions: ExtractedQuestion[] = [];
  let currentQ: { number: number; textParts: string[]; marks: number; y: number } | null = null;

  textElements.forEach((el) => {
    const text = el.textContent?.trim() || '';
    const y = parseFloat(el.getAttribute('y') || '0');

    const qMatch = text.match(/^Q(\d+)\.?/i);
    if (qMatch) {
      if (currentQ) {
        questions.push({
          id: `q-${currentQ.number}`,
          number: currentQ.number,
          text: currentQ.textParts.join(' ').trim(),
          marks: currentQ.marks,
          maxMarks: currentQ.marks,
          pageIndex: 0
        });
      }
      const num = parseInt(qMatch[1], 10);
      const remainingText = text.replace(/^Q\d+\.?\s*/i, '').replace(/\[\d+\s*Marks\]/i, '').trim();
      currentQ = {
        number: num,
        textParts: remainingText ? [remainingText] : [],
        marks: 5,
        y
      };
    } else if (currentQ) {
      if (text.startsWith('SECTION') || text.includes('End of Question') || text.includes('Instructions')) {
        questions.push({
          id: `q-${currentQ.number}`,
          number: currentQ.number,
          text: currentQ.textParts.join(' ').trim(),
          marks: currentQ.marks,
          maxMarks: currentQ.marks,
          pageIndex: 0
        });
        currentQ = null;
      } else {
        const clean = text.replace(/\[\d+\s*Marks\]/i, '').trim();
        if (clean) currentQ.textParts.push(clean);
      }
    }
  });

  if (currentQ) {
    questions.push({
      id: `q-${currentQ.number}`,
      number: currentQ.number,
      text: currentQ.textParts.join(' ').trim(),
      marks: currentQ.marks,
      maxMarks: currentQ.marks,
      pageIndex: 0
    });
  }

  return questions;
}

/**
 * Extracts structured answers with precise bounding boxes from an SVG answer sheet.
 */
export function extractAnswersFromSvg(svgContent: string, totalHeight = 1700): AnswerBlock[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const textElements = Array.from(doc.querySelectorAll('text'));

  const answers: AnswerBlock[] = [];
  let currentAns: { rawLabel: string; qNum: number; textParts: string[]; startY: number; endY: number } | null = null;

  textElements.forEach((el) => {
    const text = el.textContent?.trim() || '';
    const y = parseFloat(el.getAttribute('y') || '0');

    const ansMatch = text.match(/^Ans\s*(\d+)\.?/i);
    if (ansMatch) {
      if (currentAns) {
        const yPct = Math.max(1, ((currentAns.startY - 35) / totalHeight) * 100);
        const endPct = Math.min(98, ((currentAns.endY + 25) / totalHeight) * 100);
        const hPct = Math.max(5, endPct - yPct);

        answers.push({
          id: `ans-q-${currentAns.qNum}`,
          rawLabel: currentAns.rawLabel,
          text: currentAns.textParts.join(' ').trim(),
          pageIndex: 0,
          bbox: {
            x: 4.5,
            y: Math.round(yPct * 10) / 10,
            width: 91.0,
            height: Math.round(hPct * 10) / 10
          }
        });
      }

      const qNum = parseInt(ansMatch[1], 10);
      const remainingText = text.replace(/^Ans\s*\d+\.?\s*/i, '').trim();
      currentAns = {
        rawLabel: `Ans ${qNum}.`,
        qNum,
        textParts: remainingText ? [remainingText] : [],
        startY: y,
        endY: y
      };
    } else if (currentAns) {
      if (text.startsWith('Student Name:') || text.includes('unattempted')) {
        // End of answers
      } else {
        currentAns.textParts.push(text);
        currentAns.endY = Math.max(currentAns.endY, y);
      }
    }
  });

  if (currentAns) {
    const yPct = Math.max(1, ((currentAns.startY - 35) / totalHeight) * 100);
    const endPct = Math.min(98, ((currentAns.endY + 25) / totalHeight) * 100);
    const hPct = Math.max(5, endPct - yPct);

    answers.push({
      id: `ans-q-${currentAns.qNum}`,
      rawLabel: currentAns.rawLabel,
      text: currentAns.textParts.join(' ').trim(),
      pageIndex: 0,
      bbox: {
        x: 4.5,
        y: Math.round(yPct * 10) / 10,
        width: 91.0,
        height: Math.round(hPct * 10) / 10
      }
    });
  }

  return answers;
}

/**
 * Parses student name from filename cleanly.
 */
export function formatStudentName(filename: string): string {
  let name = filename.replace(/\.(svg|pdf|png|jpg|jpeg)$/i, '');
  name = name.replace(/^Answer_Sheet_Student_\d+_/i, '');
  name = name.replace(/^Student_\d+_/i, '');
  name = name.replace(/^Answer_Sheet_/i, '');
  name = name.replace(/_/g, ' ').trim();
  return name || filename;
}
