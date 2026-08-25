# VedaAI — AI Assessment Extraction & Answer Mapping Platform

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.35-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Groq AI](https://img.shields.io/badge/Groq_API-Qwen_3.6_27B-F55036?style=for-the-badge&logo=fastapi)](https://groq.com/)
[![Vitest](https://img.shields.io/badge/Vitest-39%20Tests%20Passing-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev/)

> An intelligent, full-stack AI platform built for teachers to upload printed question papers alongside handwritten student answer sheets, automatically extract and segment answers with visual bounding boxes, semantically map answers to questions, and deliver real-time AI grading with per-question feedback.

---

## 🌟 Overview & Highlights

Evaluating handwritten student exam papers against complex multi-part question papers is time-consuming and prone to errors. **VedaAI** automates this end-to-end evaluation pipeline with high precision:

- **Pixel-Perfect Figma Replication**: Replicates the teacher evaluation dashboard, upload cards, sparkle loading animations, and interactive answer sheet viewer.
- **Multimodal AI OCR & Segmentation**: Powered by **Groq's `qwen/qwen3.6-27b`** for ultra-fast vision extraction and structured text parsing.
- **Interactive Two-Way Mapping**:
  - Clicking any extracted question highlights the student's handwritten answer on the exact page with a percentage-accurate green overlay and pinned `Q2` badge.
  - Clicking a bounding box on the answer sheet immediately highlights and expands the corresponding question in the accordion.
- **1-Click Preloaded Biology Exam Demo**: Built-in sample exam featuring 14 questions, subparts, handwritten notebook pages, diagrams, equations, and grading results for instantaneous evaluation.

---

## 🎯 Core Features

### 1. Dual Upload Interface
- Upload printed question papers and student handwritten answer sheets as **PDFs or Images** (PNG, JPEG, SVG, WebP).
- Live preview showing file format badge, filename, file size, and page counts with instant removal/reset actions.
- Client-side pre-processing using `pdfjs-dist` and HTML5 Canvas with **contrast enhancement** to boost faint pencil handwriting.

### 2. Printed Question Extraction
- Extracts all questions in exact printed order.
- **Sub-part Splitting**: Automatically isolates sub-questions into distinct evaluatable entries (e.g. `11 a.` and `11 b.`).
- Preserves original numbering formats (Roman numerals, alphabetical letters, integers).
- Extracts printed mark schemes per question (e.g. `[2 Marks]`, `[5 Marks]`).

### 3. Handwritten Answer Segmentation & Bounding Boxes
- Detects handwritten answers, chemical formulas, equations, and hand-drawn biological diagrams.
- Computes percentage-based normalized coordinates (`bbox: { x, y, width, height }`) for responsive overlay across any screen resolution or zoom level.

### 4. Semantic Answer Mapping & Edge Cases
- **Out-of-Order Answers**: Successfully maps answers even if a student solved `Q5` before `Q1`.
- **Unanswered Questions**: Flags unattempted questions with prominent `– Unanswered` tags and `0` marks.
- **Multi-Page Continuations**: Combines answer blocks that span multiple pages, providing seamless cross-page navigation.
- **Unmatched Content**: Highlights rough work or extra drawings not linked to any question.

### 5. Automated AI Grading & Feedback
- Computes numerical scores for each question (`2/2`, `4/5`, `0/2`, `1/3`).
- Provides 1–2 constructive, pedagogical feedback sentences per question.
- Delivers an overall performance executive summary with total score percentage.

### 6. Interactive Answer Sheet Viewer
- **Smooth Zoom Controls** (`-`, `100%`, `+` with reset).
- **Page Navigator** (`< Page 1 of 4 >`).
- Smooth auto-scrolling that centers the active bounding box upon question selection.

---

## 🏗️ Architecture & Multimodal AI Pipeline

```
  ┌───────────────────────────┐         ┌───────────────────────────────┐
  │  Printed Question Paper   │         │  Handwritten Answer Sheet     │
  │     (PDF / Image)         │         │        (PDF / Image)          │
  └─────────────┬─────────────┘         └───────────────┬───────────────┘
                │                                       │
                ▼                                       ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │  Client-Side Image Pipeline (pdfjs-dist + Canvas Contrast Boost)    │
  └─────────────────────────────────┬───────────────────────────────────┘
                                    │
       ┌────────────────────────────┴────────────────────────────┐
       ▼                                                         ▼
┌──────────────────────────────┐         ┌──────────────────────────────┐
│  /api/extract-questions      │         │  /api/extract-answers        │
│  Groq: qwen/qwen3.6-27b      │         │  Groq: qwen/qwen3.6-27b      │
│  - Extracts questions & marks│         │  - Vision OCR Segmentation   │
│  - Splits 11 a. & 11 b.      │         │  - Bounding Boxes {x,y,w,h}  │
└──────────────┬───────────────┘         └──────────────┬───────────────┘
               │                                        │
               └────────────────────┬───────────────────┘
                                    ▼
                     ┌──────────────────────────────┐
                     │  /api/map-answers            │
                     │  Groq: qwen/qwen3.6-27b      │
                     │  - Out-of-order mapping      │
                     │  - Multi-page continuation   │
                     │  - Unanswered & orphan tags  │
                     └──────────────┬───────────────┘
                                    ▼
                     ┌──────────────────────────────┐
                     │  /api/grade                  │
                     │  Groq: qwen/qwen3.6-27b      │
                     │  - Verdicts & numeric marks  │
                     │  - Per-question AI feedback  │
                     │  - Executive summary         │
                     └──────────────┬───────────────┘
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │  Interactive Split-Screen Evaluation Dashboard (UI)     │
       │  - Question accordion + Score badges + Feedback         │
       │  - Canvas zoom + Green bounding boxes + Page navigation │
       └─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | React Server Components & API routes |
| **Language** | TypeScript | Strict type safety and interface contracts |
| **Styling** | Tailwind CSS | Custom utility tokens, glassmorphism, responsive grid |
| **Typography** | Plus Jakarta Sans & Caveat | Modern UI typography + realistic handwriting font |
| **AI Vision & LLM** | Groq SDK (`groq-sdk`) | Ultra-low latency inference with `qwen/qwen3.6-27b` |
| **PDF Processing** | `pdfjs-dist` | In-browser client-side rendering (zero backend binaries) |
| **Testing** | Vitest + React Testing Library | Full unit, component, and integration test suite |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm**: `v9.0.0` or higher
- **Groq API Key**: Free key from [console.groq.com](https://console.groq.com/keys)

### 1. Clone the Repository
```bash
git clone https://github.com/Dwij2710/Veda-AI.git
cd Veda-AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory (or use `.env`):
```env
# Groq AI API Key
GROQ_API_KEY=gsk_your_groq_api_key_here
NEXT_PUBLIC_GROQ_API_KEY=gsk_your_groq_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing & Verification

The codebase includes an automated test suite covering utility functions, API contracts, bounding box math, data integrity, and UI components:

```bash
# Run all automated tests
npm run test
```

### Test Suite Coverage (39 / 39 Passing):
- **`tests/groq.test.ts` (15 tests)**:
  - `<think>` tag stripping for reasoning models.
  - Markdown fence parsing and deep iterative JSON block extraction.
  - Smart quotes and trailing comma sanitization.
  - API retry logic with exponential backoff.
- **`tests/sampleData.test.ts` (11 tests)**:
  - 14 Biology questions validation.
  - Subpart isolation (`11 a.`, `11 b.`).
  - Bounding box boundary checks ($0 \le x,y,w,h \le 100\%$).
  - Multi-page answer block tracking and unanswered question detection (`q-4`).
- **`tests/components.test.tsx` (13 tests)**:
  - `UploadScreen` empty/filled states, dropzone events, and 1-click sample button.
  - `QuestionList` search filtering, status tabs (`All`, `Answered`, `Unanswered`), and accordion toggling.
  - `AnswerSheetViewer` zoom controls, page transitions, and bounding box highlights.
  - `GradingSummary`, `Sidebar`, `TopBar`, and `SettingsModal`.

---

## 📁 Repository Structure

```
veda-ai/
├── app/
│   ├── api/
│   │   ├── extract-questions/route.ts  # Groq Vision question extraction
│   │   ├── extract-answers/route.ts    # Groq Vision answer segmentation & bbox
│   │   ├── map-answers/route.ts        # Semantic answer-to-question mapping
│   │   └── grade/route.ts              # Automated assessment grading & feedback
│   ├── favicon.ico
│   ├── globals.css                     # Custom fonts & Tailwind utilities
│   ├── layout.tsx                      # Root HTML shell & metadata
│   └── page.tsx                        # Main state orchestrator & pipeline
├── components/
│   ├── UploadScreen.tsx                # Figma upload cards & teacher graphics
│   ├── LoadingState.tsx                # Sparkle loading state with progress bar
│   ├── QuestionList.tsx                # Left panel: questions list & AI feedback
│   ├── AnswerSheetViewer.tsx           # Right panel: canvas, zoom & green overlays
│   ├── GradingSummary.tsx              # Score badge strip & executive summary
│   ├── Sidebar.tsx                     # Collapsible navigation chrome
│   ├── TopBar.tsx                      # Header navigation & user profile
│   └── SettingsModal.tsx               # Groq API settings & connection tester
├── lib/
│   ├── groq.ts                         # Groq client, model constants, extractJson
│   ├── pdfToImages.ts                  # PDF.js rasterizer + contrast enhancer
│   ├── sampleData.ts                   # Preloaded Biology exam (SVG notebooks)
│   └── types.ts                        # TypeScript contracts and data shapes
├── public/
│   ├── Sample_Question_Paper.svg       # Standalone 1-page sample question paper
│   └── Sample_Answer_Sheet.svg         # Standalone 1-page handwritten answer sheet
├── tests/
│   ├── setup.ts                        # Vitest setup & DOM mocks
│   ├── groq.test.ts                    # Groq SDK & JSON parsing unit tests
│   ├── sampleData.test.ts              # Data contracts & edge cases tests
│   └── components.test.tsx             # React UI component tests
├── .env.example                        # Template for environment variables
├── package.json                        # Dependencies and scripts
├── vitest.config.ts                    # Vitest test configuration
└── README.md                           # Documentation
```

---

## 📋 Assignment Requirements Compliance

| Requirement from `Assignment.md` | Implementation Details | Status |
| :--- | :--- | :---: |
| **Dual file upload & processing state** | Dual cards with file stats + animated sparkle loading screen | ✅ Completed |
| **Extract questions in printed order** | Order preserved in Vision prompt & output array index | ✅ Completed |
| **Treat sub-parts separately** | Subparts like `11 a.` & `11 b.` separated with distinct scores and boxes | ✅ Completed |
| **Preserve question numbering** | Original labels (Roman, letters, numbers) maintained exactly | ✅ Completed |
| **Handle out-of-order answers** | Semantic mapping engine maps answers regardless of written sequence | ✅ Completed |
| **Handle unanswered questions** | Explicitly flagged in `unansweredQuestionIds` and surfaced in UI | ✅ Completed |
| **Handle unmatched content** | Orphan drawings/notes tagged in `unmatchedAnswerBlockIds` | ✅ Completed |
| **Highlight exact answer region** | Responsive green bounding box overlay with pinned `Q2` badge | ✅ Completed |
| **Multi-page answer spans** | Multiple boxes grouped across pages with auto-page navigation | ✅ Completed |
| **Figma Design Fidelity** | 1-to-1 match across all screens (Empty, Filled, Loading, Mapping) | ✅ Completed |
| **Technical Constraints** | Next.js 14, Groq API, no auth required, no DB required | ✅ Completed |

---

## 👤 Author

- **GitHub**: [@Dwij2710](https://github.com/Dwij2710)
- **Project**: [Veda-AI](https://github.com/Dwij2710/Veda-AI)
