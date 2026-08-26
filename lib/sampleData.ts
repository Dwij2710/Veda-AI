import type { AnswerBlock, ExtractedQuestion, GradingResult, MappingResult, PageImage } from './types';

// Questions matching the Figma design Biology Unit Assessment
export const SAMPLE_QUESTIONS: ExtractedQuestion[] = [
  {
    id: 'q-1',
    number: '1',
    text: 'Which blood vessel carries blood away from the heart?',
    marks: 2,
    maxMarks: 2,
    pageIndex: 0
  },
  {
    id: 'q-2',
    number: '2',
    text: 'Which of the following organelles is primarily involved in photosynthesis?',
    marks: 2,
    maxMarks: 2,
    pageIndex: 0
  },
  {
    id: 'q-3',
    number: '3',
    text: 'Explain the role of chloroplasts in photosynthesis, naming the main pigments involved and briefly outlining the two major stages of the process.',
    marks: 2,
    maxMarks: 2,
    pageIndex: 0
  },
  {
    id: 'q-4',
    number: '4',
    text: 'Describe the flow of blood through the human heart starting from the right atrium and ending at the aorta; include the names of valves crossed.',
    marks: 2,
    maxMarks: 2,
    pageIndex: 0
  },
  {
    id: 'q-5',
    number: '5',
    text: 'Draw a labelled diagram of an alveolus showing capillaries and air space (label alveolar sac, capillary, and direction of gas exchange).',
    marks: 2,
    maxMarks: 2,
    pageIndex: 0
  },
  {
    id: 'q-6',
    number: '6',
    text: "Draw a neat labelled diagram of the human digestive system (stomach, small intestine, large intestine, liver, pancreas) and label the site where most absorption occurs.",
    marks: 5,
    maxMarks: 5,
    pageIndex: 1
  },
  {
    id: 'q-7',
    number: '7',
    text: "Draw and label a nephron (Bowman's capsule, glomerulus, proximal tubule, loop of Henle, distal tubule, collecting duct).",
    marks: 5,
    maxMarks: 5,
    pageIndex: 1
  },
  {
    id: 'q-8',
    number: '8',
    text: 'Explain the structural differences between palisade mesophyll and spongy mesophyll and state how each structure aids its function in the leaf.',
    marks: 5,
    maxMarks: 5,
    pageIndex: 1
  },
  {
    id: 'q-9',
    number: '9',
    text: 'Describe the process of transpiration in plants in two to three sentences and name two environmental factors that increase its rate.',
    marks: 5,
    maxMarks: 5,
    pageIndex: 1
  },
  {
    id: 'q-10',
    number: '10',
    text: 'Explain how the structure of xylem vessels facilitates water transport in plants (mention one structural feature and its role).',
    marks: 5,
    maxMarks: 5,
    pageIndex: 2
  },
  {
    id: 'q-11-a',
    number: '11 a.',
    text: 'A diagram shows two potted plants — Plant A in bright light with broad green leaves, Plant B kept in dim light with pale, elongated leaves.',
    marks: 2,
    maxMarks: 2,
    pageIndex: 2
  },
  {
    id: 'q-11-b',
    number: '11 b.',
    text: 'Suggest one practical measure to help Plant B recover.',
    marks: 3,
    maxMarks: 3,
    pageIndex: 2
  },
  {
    id: 'q-12',
    number: '12',
    text: 'A resting person has tidal volume (air per breath) of 0.5 L and breathes 12 times per minute.',
    marks: 5,
    maxMarks: 5,
    pageIndex: 2
  },
  {
    id: 'q-13',
    number: '13',
    text: 'If dead space is 0.15 L per breath, calculate the alveolar ventilation per minute. Show working.',
    marks: 5,
    maxMarks: 5,
    pageIndex: 2
  }
];

export const SAMPLE_ANSWERS: AnswerBlock[] = [
  // Page 1 Answers
  {
    id: 'ans-1',
    rawLabel: 'Q1.',
    text: 'Photosynthesis is the process used by green plants and some other organisms to convert light energy into chemical energy.\n6CO2 + 6H2O --(Light/Chlorophyll)--> C6H12O6 + 6O2\n[Diagram of plant absorbing sunlight, CO2, H2O, emitting O2]',
    pageIndex: 0,
    bbox: { x: 5, y: 7, width: 90, height: 34 }
  },
  {
    id: 'ans-2',
    rawLabel: 'Q2.',
    text: 'The process mainly occurs in the chloroplast of the plant cell. It has two main stages:\n1. Light reaction - Captures light energy.\n2. Dark reaction - Uses energy to make glucose.',
    pageIndex: 0,
    bbox: { x: 5, y: 43, width: 90, height: 16 }
  },
  {
    id: 'ans-3',
    rawLabel: 'Q3.',
    text: 'Chloroplasts contain chlorophyll pigment inside thylakoids. Light dependent reaction in thylakoid membranes produces ATP & NADPH. Calvin cycle in stroma fixes CO2 into carbohydrates.',
    pageIndex: 0,
    bbox: { x: 5, y: 62, width: 90, height: 18 }
  },
  {
    id: 'ans-5',
    rawLabel: 'Q5.',
    text: '[Alveolus diagram showing thin squamous epithelium, surrounding blood capillaries with RBCs, O2 diffusing in and CO2 diffusing out].',
    pageIndex: 0,
    bbox: { x: 5, y: 82, width: 90, height: 16 }
  },

  // Page 2 Answers
  {
    id: 'ans-6',
    rawLabel: 'Q6.',
    text: '[Digestive system drawing: esophagus -> stomach -> duodenum -> small intestine with villi labelled as site of maximum absorption, liver, pancreas].',
    pageIndex: 1,
    bbox: { x: 5, y: 6, width: 90, height: 42 }
  },
  {
    id: 'ans-7',
    rawLabel: 'Q7.',
    text: "[Nephron diagram: Glomerulus, Bowman's capsule, Proximal convoluted tubule, Loop of Henle descending & ascending limbs, Distal tubule, Collecting duct].",
    pageIndex: 1,
    bbox: { x: 5, y: 50, width: 90, height: 45 }
  },

  // Page 3 Answers
  {
    id: 'ans-8',
    rawLabel: 'Q8.',
    text: 'Palisade mesophyll cells are vertically elongated and packed tightly with maximum chloroplasts for photosynthesis. Spongy mesophyll cells are loosely arranged with large air spaces for rapid gas exchange.',
    pageIndex: 2,
    bbox: { x: 5, y: 7, width: 90, height: 25 }
  },
  {
    id: 'ans-9',
    rawLabel: 'Q9.',
    text: 'Transpiration is the loss of water vapour from the aerial parts (mostly stomata) of plants. Two factors that increase transpiration rate are: 1. Higher temperature 2. Increased wind velocity.',
    pageIndex: 2,
    bbox: { x: 5, y: 34, width: 90, height: 28 }
  },
  {
    id: 'ans-10',
    rawLabel: 'Q10.',
    text: 'Xylem vessels are made of dead hollow tubes with lignified walls that prevent collapse under high tension, allowing uninterrupted continuous capillary suction of water.',
    pageIndex: 2,
    bbox: { x: 5, y: 64, width: 90, height: 30 }
  },

  // Page 4 Answers
  {
    id: 'ans-11a',
    rawLabel: '11 a.',
    text: 'Plant A received optimal sunlight enabling full chlorophyll synthesis and normal growth. Plant B suffered etiolation due to lack of light, causing chlorophyll breakdown and stem elongation.',
    pageIndex: 3,
    bbox: { x: 5, y: 7, width: 90, height: 22 }
  },
  {
    id: 'ans-11b',
    rawLabel: '11 b.',
    text: 'Move Plant B gradually to an area with adequate diffuse sunlight and ensure proper watering.',
    pageIndex: 3,
    bbox: { x: 5, y: 31, width: 90, height: 18 }
  },
  {
    id: 'ans-12',
    rawLabel: 'Q12.',
    text: 'Total pulmonary ventilation = Tidal volume x Respiratory rate = 0.5 L x 12 breaths/min = 6.0 L/min.',
    pageIndex: 3,
    bbox: { x: 5, y: 52, width: 90, height: 18 }
  },
  {
    id: 'ans-13',
    rawLabel: 'Q13.',
    text: 'Alveolar ventilation = (Tidal Volume - Dead Space) x Respiratory Rate\n= (0.50 L - 0.15 L) x 12\n= 0.35 L x 12 = 4.2 L/min.',
    pageIndex: 3,
    bbox: { x: 5, y: 72, width: 90, height: 22 }
  }
];

export const SAMPLE_MAPPING: MappingResult = {
  mappings: [
    { questionId: 'q-1', answerBlockIds: ['ans-1'], confidence: 0.98, reason: 'Matched by written label Q1 and content' },
    { questionId: 'q-2', answerBlockIds: ['ans-2'], confidence: 0.99, reason: 'Explicitly labeled Q2 and details chloroplast organelle' },
    { questionId: 'q-3', answerBlockIds: ['ans-3'], confidence: 0.97, reason: 'Matches Q3 discussion on chlorophyll and dark/light reactions' },
    { questionId: 'q-5', answerBlockIds: ['ans-5'], confidence: 0.96, reason: 'Matched alveolus labelled diagram' },
    { questionId: 'q-6', answerBlockIds: ['ans-6'], confidence: 0.98, reason: 'Matched digestive system drawing and absorption site' },
    { questionId: 'q-7', answerBlockIds: ['ans-7'], confidence: 0.99, reason: 'Matched nephron diagram labels' },
    { questionId: 'q-8', answerBlockIds: ['ans-8'], confidence: 0.95, reason: 'Matched mesophyll comparison' },
    { questionId: 'q-9', answerBlockIds: ['ans-9'], confidence: 0.98, reason: 'Matched transpiration definition and environmental factors' },
    { questionId: 'q-10', answerBlockIds: ['ans-10'], confidence: 0.96, reason: 'Matched xylem vessel lignification and water transport' },
    { questionId: 'q-11-a', answerBlockIds: ['ans-11a'], confidence: 0.99, reason: 'Subpart 11a explicitly labeled and explains etiolation' },
    { questionId: 'q-11-b', answerBlockIds: ['ans-11b'], confidence: 0.98, reason: 'Subpart 11b matches remedy for Plant B' },
    { questionId: 'q-12', answerBlockIds: ['ans-12'], confidence: 0.99, reason: 'Matched total ventilation calculation' },
    { questionId: 'q-13', answerBlockIds: ['ans-13'], confidence: 0.99, reason: 'Matched alveolar ventilation formula and numerical working' }
  ],
  unansweredQuestionIds: ['q-4'],
  unmatchedAnswerBlockIds: []
};

export const SAMPLE_GRADING: GradingResult = {
  perQuestion: [
    {
      questionId: 'q-1',
      verdict: 'correct',
      score: 2,
      maxScore: 2,
      feedback: 'Good overview of photosynthesis and general vascular understanding provided.'
    },
    {
      questionId: 'q-2',
      verdict: 'correct',
      score: 2,
      maxScore: 2,
      feedback: 'Excellent work! You correctly identified the chloroplast as the organelle responsible for photosynthesis. Keep it up!'
    },
    {
      questionId: 'q-3',
      verdict: 'correct',
      score: 2,
      maxScore: 2,
      feedback: 'Accurately outlines light and dark reactions along with chlorophyll localization in thylakoids.'
    },
    {
      questionId: 'q-4',
      verdict: 'unanswered',
      score: 0,
      maxScore: 2,
      feedback: 'Question not attempted. Remember to describe tricuspid, pulmonary, bicuspid (mitral), and aortic valves.'
    },
    {
      questionId: 'q-5',
      verdict: 'correct',
      score: 2,
      maxScore: 2,
      feedback: 'Clear, well-labelled diagram of the alveolus with capillaries and diffusion arrows.'
    },
    {
      questionId: 'q-6',
      verdict: 'partially_correct',
      score: 4,
      maxScore: 5,
      feedback: 'Great digestive tract layout; ensure the pancreatic duct connection to duodenum is clearly delineated.'
    },
    {
      questionId: 'q-7',
      verdict: 'correct',
      score: 5,
      maxScore: 5,
      feedback: "All six nephron structures (Bowman's capsule, glomerulus, PCT, loop of Henle, DCT, collecting duct) correctly depicted."
    },
    {
      questionId: 'q-8',
      verdict: 'partially_correct',
      score: 3,
      maxScore: 5,
      feedback: 'Accurate descriptions of palisade cells; include mention of stomatal proximity for spongy mesophyll gas diffusion.'
    },
    {
      questionId: 'q-9',
      verdict: 'correct',
      score: 5,
      maxScore: 5,
      feedback: 'Concise definition and precise environmental factors (temperature, wind velocity).'
    },
    {
      questionId: 'q-10',
      verdict: 'correct',
      score: 4,
      maxScore: 5,
      feedback: 'Well explained. Mentioning annular or spiral lignin deposition would secure full marks.'
    },
    {
      questionId: 'q-11-a',
      verdict: 'correct',
      score: 2,
      maxScore: 2,
      feedback: 'Correctly identifies etiolation and differences in chlorophyll concentration.'
    },
    {
      questionId: 'q-11-b',
      verdict: 'partially_correct',
      score: 1,
      maxScore: 3,
      feedback: 'Good suggestion. Note that light exposure should be acclimatized gradually to avoid photo-oxidation.'
    },
    {
      questionId: 'q-12',
      verdict: 'correct',
      score: 4,
      maxScore: 5,
      feedback: 'Accurate total minute ventilation arithmetic (0.5 L x 12 = 6.0 L/min).'
    },
    {
      questionId: 'q-13',
      verdict: 'correct',
      score: 4,
      maxScore: 5,
      feedback: 'Proper subtraction of dead space (0.35 L) multiplied by breath frequency yielding 4.2 L/min.'
    }
  ],
  overallFeedback: 'Strong performance on physiological calculations, cellular organelle identification, and biological diagrams. Pay closer attention to heart valve pathways and subtle histological details in plant mesophyll.',
  totalScore: 40,
  totalMaxScore: 50
};

// Generates SVG-based realistic student handwritten exam sheet pages
function generateNotebookPageSvg(pageNumber: number): string {
  const width = 800;
  const height = 1100;
  const lineSpacing = 32;
  const leftMargin = 90;

  let linesSvg = '';
  for (let y = 70; y < height - 40; y += lineSpacing) {
    linesSvg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#dbe4f0" stroke-width="1.2" />`;
  }

  let contentSvg = '';

  if (pageNumber === 1) {
    contentSvg = `
      <!-- Q1 -->
      <text x="35" y="105" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">Q1.</text>
      <text x="110" y="105" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">Photosynthesis is the process used by</text>
      <text x="110" y="137" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">green plants and some other organisms</text>
      <text x="110" y="169" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">to convert light energy into chemical</text>
      <text x="110" y="201" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">energy.</text>

      <!-- Chemical Equation Box -->
      <rect x="120" y="225" width="580" height="52" fill="#f8fafc" stroke="#334155" stroke-width="1.5" rx="4" />
      <text x="140" y="258" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" font-weight="600" fill="#0f172a">
        6CO₂ + 6H₂O  ──( Light / Chlorophyll )──&gt;  C₆H₁₂O₆ + 6O₂
      </text>

      <!-- Plant Diagram -->
      <g transform="translate(360, 290)">
        <!-- Sun -->
        <circle cx="200" cy="30" r="18" fill="none" stroke="#0f172a" stroke-width="1.8" />
        <path d="M200,5 L200,0 M200,55 L200,60 M175,30 L170,30 M225,30 L230,30 M182,12 L178,8 M218,48 L222,52 M182,48 L178,52 M218,12 L222,8" stroke="#0f172a" stroke-width="1.8" />
        <text x="225" y="34" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#0f172a">Sunlight</text>
        <path d="M190,45 L130,75" stroke="#0f172a" stroke-width="1.5" marker-end="url(#arrow)" />

        <!-- Plant Stem & Leaves -->
        <path d="M100,65 Q100,120 100,140" fill="none" stroke="#0f172a" stroke-width="2.5" />
        <path d="M100,65 C60,40 40,75 100,90" fill="none" stroke="#0f172a" stroke-width="2" />
        <path d="M100,65 C140,40 160,75 100,90" fill="none" stroke="#0f172a" stroke-width="2" />
        <path d="M100,95 C50,85 50,120 100,115" fill="none" stroke="#0f172a" stroke-width="2" />
        <path d="M100,95 C150,85 150,120 100,115" fill="none" stroke="#0f172a" stroke-width="2" />

        <!-- Gas arrows -->
        <path d="M-10,80 L40,80" stroke="#0f172a" stroke-width="1.5" />
        <polygon points="40,80 32,76 32,84" fill="#0f172a" />
        <text x="-90" y="75" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#0f172a">Carbon</text>
        <text x="-90" y="93" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#0f172a">dioxide</text>

        <path d="M160,80 L210,80" stroke="#0f172a" stroke-width="1.5" />
        <polygon points="210,80 202,76 202,84" fill="#0f172a" />
        <text x="220" y="85" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#0f172a">Oxygen</text>

        <!-- Soil line & roots -->
        <line x1="30" y1="140" x2="170" y2="140" stroke="#0f172a" stroke-width="2" stroke-dasharray="3,3" />
        <path d="M100,140 Q80,165 70,180 M100,140 Q105,170 105,185 M100,140 Q125,160 140,175" fill="none" stroke="#0f172a" stroke-width="1.8" />
        <text x="160" y="165" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#0f172a">Water</text>
      </g>

      <!-- Q2 -->
      <text x="35" y="495" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">Q2.</text>
      <text x="110" y="495" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">The process mainly occurs in the</text>
      <text x="110" y="527" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">chloroplast of the plant cell. It has</text>
      <text x="110" y="559" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">two main stages:</text>
      <text x="110" y="591" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">1. Light reaction – Captures light energy.</text>
      <text x="110" y="623" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">2. Dark reaction – Uses energy to</text>
      <text x="140" y="655" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">make glucose.</text>

      <!-- Q3 -->
      <text x="35" y="715" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">Q3.</text>
      <text x="110" y="715" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">Chlorophyll pigment in thylakoid membranes absorbs</text>
      <text x="110" y="747" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">blue &amp; red wavelengths. ATP &amp; NADPH generated power</text>
      <text x="110" y="779" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">the Calvin Cycle in the stroma.</text>

      <!-- Q5 -->
      <text x="35" y="935" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">Q5.</text>
      <text x="110" y="935" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">Alveolus structure: Thin 1-cell thick membrane</text>
      <text x="110" y="967" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">maximizes diffusion rate across dense capillary mesh.</text>
    `;
  } else if (pageNumber === 2) {
    contentSvg = `
      <!-- Q6 Diagram -->
      <text x="35" y="105" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">Q6.</text>
      <text x="110" y="105" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">Human Digestive System Diagram &amp; Site of Absorption:</text>
      <g transform="translate(180, 130)">
        <path d="M120,10 L120,60 Q100,90 140,110 Q190,120 180,160 Q160,190 130,210" fill="none" stroke="#0f172a" stroke-width="2" />
        <rect x="70" y="70" width="60" height="40" rx="10" fill="#f1f5f9" stroke="#0f172a" stroke-width="1.8" />
        <text x="10" y="95" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#0f172a">Stomach</text>
        <path d="M65,90 L75,90" stroke="#0f172a" stroke-width="1.5" />

        <ellipse cx="220" cy="110" rx="40" ry="25" fill="#f1f5f9" stroke="#0f172a" stroke-width="1.8" />
        <text x="270" y="115" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#0f172a">Liver</text>

        <rect x="110" y="170" width="100" height="90" rx="8" fill="#f8fafc" stroke="#0f172a" stroke-width="2" />
        <path d="M120,180 Q160,190 130,210 Q180,220 150,245" fill="none" stroke="#0f172a" stroke-width="2" />
        <text x="230" y="215" font-family="'Caveat', cursive, sans-serif" font-size="20" font-weight="700" fill="#16a34a">Small Intestine (Villi)</text>
        <text x="230" y="235" font-family="'Caveat', cursive, sans-serif" font-size="18" fill="#15803d">*Max absorption site</text>
      </g>

      <!-- Q7 Nephron -->
      <text x="35" y="580" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">Q7.</text>
      <text x="110" y="580" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">Nephron structure and functional components:</text>
      <g transform="translate(180, 600)">
        <path d="M60,40 C30,40 30,90 60,90 L120,90 L120,160 Q120,220 160,220 Q200,220 200,160 L200,70 L260,70 L260,240" fill="none" stroke="#0f172a" stroke-width="2.2" />
        <circle cx="45" cy="65" r="14" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.8" />
        <text x="-40" y="65" font-family="'Caveat', cursive, sans-serif" font-size="18" fill="#0f172a">Glomerulus</text>
        <text x="10" y="115" font-family="'Caveat', cursive, sans-serif" font-size="18" fill="#0f172a">PCT</text>
        <text x="135" y="245" font-family="'Caveat', cursive, sans-serif" font-size="18" fill="#0f172a">Loop of Henle</text>
        <text x="270" y="160" font-family="'Caveat', cursive, sans-serif" font-size="18" fill="#0f172a">Collecting Duct</text>
      </g>
    `;
  } else if (pageNumber === 3) {
    contentSvg = `
      <!-- Q8 -->
      <text x="35" y="105" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">Q8.</text>
      <text x="110" y="105" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">Palisade mesophyll cells are vertically arranged,</text>
      <text x="110" y="137" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">closely packed with high chloroplast density to</text>
      <text x="110" y="169" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">capture maximum light.</text>
      <text x="110" y="201" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">Spongy mesophyll cells are loosely packed with</text>
      <text x="110" y="233" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">intercellular air spaces for CO₂/O₂ gas diffusion.</text>

      <!-- Q9 -->
      <text x="35" y="395" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">Q9.</text>
      <text x="110" y="395" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">Transpiration is the evaporative loss of water</text>
      <text x="110" y="427" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">vapour from aerial parts through stomata.</text>
      <text x="110" y="459" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">Two environmental factors increasing its rate are:</text>
      <text x="110" y="491" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">1. Higher ambient temperature</text>
      <text x="110" y="523" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">2. Higher air velocity (wind speed)</text>

      <!-- Q10 -->
      <text x="35" y="735" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">Q10.</text>
      <text x="110" y="735" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">Xylem vessels form continuous hollow non-living tubes</text>
      <text x="110" y="767" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">reinforced with lignin rings. This structure resists</text>
      <text x="110" y="799" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">inward tension created by transpirational pull.</text>
    `;
  } else {
    contentSvg = `
      <!-- Q11 a -->
      <text x="35" y="105" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">11 a.</text>
      <text x="110" y="105" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">Plant A developed broad green leaves due to active</text>
      <text x="110" y="137" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">chlorophyll synthesis. Plant B underwent etiolation</text>
      <text x="110" y="169" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">due to dim light, resulting in elongated pale stems.</text>

      <!-- Q11 b -->
      <text x="35" y="365" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">11 b.</text>
      <text x="110" y="365" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">Move Plant B to an area with adequate diffuse sunlight</text>
      <text x="110" y="397" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">and provide balanced nutrient supply.</text>

      <!-- Q12 -->
      <text x="35" y="600" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">Q12.</text>
      <text x="110" y="600" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">Total Pulmonary Ventilation = Tidal volume x Rate</text>
      <text x="110" y="632" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">= 0.5 L x 12 breaths/min = 6.0 L/min</text>

      <!-- Q13 -->
      <text x="35" y="820" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">Q13.</text>
      <text x="110" y="820" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">Alveolar Ventilation = (Tidal Vol - Dead Space) x Rate</text>
      <text x="110" y="852" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">= (0.50 L - 0.15 L) x 12</text>
      <text x="110" y="884" font-family="'Caveat', 'Segoe Print', cursive, sans-serif" font-size="24" fill="#1e293b">= 0.35 L x 12 = 4.2 L/min</text>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&amp;display=swap');
      </style>
      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#0f172a" />
      </marker>
    </defs>

    <!-- Paper Background -->
    <rect width="${width}" height="${height}" fill="#fbfaf6" />

    <!-- Notebook Left Red Margin Line -->
    <line x1="${leftMargin}" y1="0" x2="${leftMargin}" y2="${height}" stroke="#fca5a5" stroke-width="1.8" />
    <line x1="${leftMargin + 4}" y1="0" x2="${leftMargin + 4}" y2="${height}" stroke="#fee2e2" stroke-width="1" />

    <!-- Top Red Margin -->
    <line x1="0" y1="50" x2="${width}" y2="50" stroke="#fca5a5" stroke-width="1.8" />

    <!-- Ruled Blue Lines -->
    ${linesSvg}

    <!-- Page Content -->
    ${contentSvg}
  </svg>`;

  // Convert SVG to data URL (UTF-8 encoded)
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_ANSWER_PAGES: PageImage[] = [
  { pageIndex: 0, width: 800, height: 1100, dataUrl: generateNotebookPageSvg(1) },
  { pageIndex: 1, width: 800, height: 1100, dataUrl: generateNotebookPageSvg(2) },
  { pageIndex: 2, width: 800, height: 1100, dataUrl: generateNotebookPageSvg(3) },
  { pageIndex: 3, width: 800, height: 1100, dataUrl: generateNotebookPageSvg(4) }
];

// ==========================================
// 5-Question Physics & Chemistry Exam (2 Correct, 2 Incorrect, 1 Unanswered)
// ==========================================
export const SAMPLE_PHYSICS_QUESTIONS: ExtractedQuestion[] = [
  {
    id: 'q-phy-1',
    number: '1',
    text: 'What is the pH value of a neutral aqueous solution at 25°C, and what color change is observed when blue litmus paper is dipped into dilute hydrochloric acid (HCl)?',
    marks: 5,
    maxMarks: 5,
    pageIndex: 0
  },
  {
    id: 'q-phy-2',
    number: '2',
    text: 'Define an exothermic chemical reaction and provide one balanced chemical equation representing a common exothermic reaction.',
    marks: 5,
    maxMarks: 5,
    pageIndex: 0
  },
  {
    id: 'q-phy-3',
    number: '3',
    text: 'Name the only metal that exists as a liquid at room temperature (25°C), and name the only non-metal that exists as a liquid at room temperature.',
    marks: 5,
    maxMarks: 5,
    pageIndex: 0
  },
  {
    id: 'q-phy-4',
    number: '4',
    text: "State Ohm's Law and write its mathematical formula relating Voltage (V), Current (I), and Resistance (R). If resistance is doubled at constant voltage, what happens to current?",
    marks: 5,
    maxMarks: 5,
    pageIndex: 0
  },
  {
    id: 'q-phy-5',
    number: '5',
    text: "State Snell's Law of refraction of light and write the formula for the refractive index (n) of a medium in terms of the speed of light in vacuum (c) and in the medium (v).",
    marks: 5,
    maxMarks: 5,
    pageIndex: 0
  }
];

export const SAMPLE_PHYSICS_ANSWERS: AnswerBlock[] = [
  {
    id: 'ans-phy-1',
    rawLabel: 'Q1.',
    text: 'The pH value of a neutral aqueous solution at 25°C is exactly 7. When blue litmus paper is dipped into dilute hydrochloric acid (HCl), the litmus paper turns red due to the acidic hydrogen ions (H+).',
    pageIndex: 0,
    bbox: { x: 4, y: 7, width: 92, height: 12 }
  },
  {
    id: 'ans-phy-2',
    rawLabel: 'Q2.',
    text: 'An exothermic reaction is a chemical change that releases energy to its surroundings, typically as heat and light. Equation: CH4 + 2O2 -> CO2 + 2H2O + Heat Energy (Combustion of Methane).',
    pageIndex: 0,
    bbox: { x: 4, y: 23, width: 92, height: 13 }
  },
  {
    id: 'ans-phy-3',
    rawLabel: 'Q3.',
    text: 'Gallium is the only metal that exists as a liquid at room temperature. Chlorine gas is the only non-metal that stays in liquid form at room temperature and pressure.',
    pageIndex: 0,
    bbox: { x: 4, y: 40, width: 92, height: 12 }
  },
  {
    id: 'ans-phy-4',
    rawLabel: 'Q4.',
    text: "According to Ohm's Law, Voltage equals Current divided by Resistance (V = I / R). Therefore, when resistance is doubled at constant potential difference, the current also doubles.",
    pageIndex: 0,
    bbox: { x: 4, y: 56, width: 92, height: 12 }
  }
];

export const SAMPLE_PHYSICS_MAPPING: MappingResult = {
  mappings: [
    {
      questionId: 'q-phy-1',
      answerBlockIds: ['ans-phy-1'],
      confidence: 0.99,
      reason: 'Matched by handwritten label Q1 and pH 7 / litmus acidic color change'
    },
    {
      questionId: 'q-phy-2',
      answerBlockIds: ['ans-phy-2'],
      confidence: 0.98,
      reason: 'Matched by handwritten label Q2 and methane combustion equation'
    },
    {
      questionId: 'q-phy-3',
      answerBlockIds: ['ans-phy-3'],
      confidence: 0.97,
      reason: 'Matched by handwritten label Q3 and liquid metal / non-metal response'
    },
    {
      questionId: 'q-phy-4',
      answerBlockIds: ['ans-phy-4'],
      confidence: 0.98,
      reason: "Matched by handwritten label Q4 and Ohm's Law formula"
    }
  ],
  unansweredQuestionIds: ['q-phy-5'],
  unmatchedAnswerBlockIds: []
};

export const SAMPLE_PHYSICS_GRADING: GradingResult = {
  perQuestion: [
    {
      questionId: 'q-phy-1',
      verdict: 'correct',
      score: 5,
      maxScore: 5,
      feedback: 'Excellent work! Correctly identified pH 7 for neutral solutions and red color transition for blue litmus in acid.'
    },
    {
      questionId: 'q-phy-2',
      verdict: 'correct',
      score: 5,
      maxScore: 5,
      feedback: 'Great answer with a clear thermodynamic definition and a correct balanced methane combustion equation.'
    },
    {
      questionId: 'q-phy-3',
      verdict: 'incorrect',
      score: 0,
      maxScore: 5,
      feedback: 'Incorrect elements. Mercury (Hg) is the liquid metal and Bromine (Br₂) is the liquid non-metal at 25°C.'
    },
    {
      questionId: 'q-phy-4',
      verdict: 'incorrect',
      score: 0,
      maxScore: 5,
      feedback: "Incorrect formula and conclusion. Ohm's Law is V = I × R; doubling resistance halves the current (I = V / R)."
    },
    {
      questionId: 'q-phy-5',
      verdict: 'unanswered',
      score: 0,
      maxScore: 5,
      feedback: 'Question not attempted by student.'
    }
  ],
  overallFeedback:
    'Demonstrates good understanding of basic chemistry (pH and exothermic reactions), but needs conceptual revision on periodic table physical states and electric circuit formulas.',
  totalScore: 10,
  totalMaxScore: 25
};

function generatePhysicsNotebookPageSvg(): string {
  const width = 800;
  const height = 1100;
  const leftMargin = 90;

  let linesSvg = '';
  for (let y = 70; y <= 980; y += 32) {
    linesSvg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#dbe4f0" stroke-width="1.2" />\n`;
  }

  const contentSvg = `
    <!-- Q1 (CORRECT) -->
    <text x="35" y="98" font-family="'Caveat', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">Q1.</text>
    <text x="110" y="98" font-family="'Caveat', cursive, sans-serif" font-size="23" fill="#1e293b">The pH value of a neutral aqueous solution at 25°C is exactly 7.</text>
    <text x="110" y="130" font-family="'Caveat', cursive, sans-serif" font-size="23" fill="#1e293b">When blue litmus paper is dipped into dilute hydrochloric acid (HCl),</text>
    <text x="110" y="162" font-family="'Caveat', cursive, sans-serif" font-size="23" fill="#1e293b">the litmus paper turns red due to the acidic hydrogen ions (H⁺).</text>

    <!-- Q2 (CORRECT) -->
    <text x="35" y="270" font-family="'Caveat', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">Q2.</text>
    <text x="110" y="270" font-family="'Caveat', cursive, sans-serif" font-size="23" fill="#1e293b">An exothermic reaction is a chemical change that releases energy</text>
    <text x="110" y="302" font-family="'Caveat', cursive, sans-serif" font-size="23" fill="#1e293b">to its surroundings, typically as heat and light.</text>
    <rect x="110" y="318" width="580" height="42" fill="#f8fafc" stroke="#334155" stroke-width="1.2" rx="4" />
    <text x="130" y="347" font-family="'Caveat', cursive, sans-serif" font-size="22" font-weight="600" fill="#0f172a">
      CH₄ + 2O₂  ──&gt;  CO₂ + 2H₂O + Heat Energy  (Combustion of Methane)
    </text>

    <!-- Q3 (INCORRECT) -->
    <text x="35" y="470" font-family="'Caveat', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">Q3.</text>
    <text x="110" y="470" font-family="'Caveat', cursive, sans-serif" font-size="23" fill="#1e293b">Gallium is the only metal that exists as a liquid at room temperature.</text>
    <text x="110" y="502" font-family="'Caveat', cursive, sans-serif" font-size="23" fill="#1e293b">Chlorine gas is the only non-metal that stays in liquid form at</text>
    <text x="110" y="534" font-family="'Caveat', cursive, sans-serif" font-size="23" fill="#1e293b">room temperature and pressure.</text>

    <!-- Q4 (INCORRECT) -->
    <text x="35" y="640" font-family="'Caveat', cursive, sans-serif" font-size="28" font-weight="700" fill="#1e3a8a">Q4.</text>
    <text x="110" y="640" font-family="'Caveat', cursive, sans-serif" font-size="23" fill="#1e293b">According to Ohm's Law, Voltage equals Current divided by</text>
    <text x="110" y="672" font-family="'Caveat', cursive, sans-serif" font-size="23" fill="#1e293b">Resistance (V = I / R). Therefore, when resistance is doubled</text>
    <text x="110" y="704" font-family="'Caveat', cursive, sans-serif" font-size="23" fill="#1e293b">at constant potential difference, the current also doubles.</text>
  `;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&amp;display=swap');
      </style>
    </defs>
    <rect width="${width}" height="${height}" fill="#fbfaf6" />
    <line x1="${leftMargin}" y1="0" x2="${leftMargin}" y2="${height}" stroke="#fca5a5" stroke-width="1.8" />
    <line x1="${leftMargin + 4}" y1="0" x2="${leftMargin + 4}" y2="${height}" stroke="#fee2e2" stroke-width="1" />
    <line x1="0" y1="50" x2="${width}" y2="50" stroke="#fca5a5" stroke-width="1.8" />
    ${linesSvg}
    ${contentSvg}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_PHYSICS_ANSWER_PAGES: PageImage[] = [
  { pageIndex: 0, width: 800, height: 1100, dataUrl: generatePhysicsNotebookPageSvg() }
];

