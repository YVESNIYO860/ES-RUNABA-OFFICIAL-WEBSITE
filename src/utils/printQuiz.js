const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[character]));

const writingLines = (count) => Array.from({ length: count }, () => '<div class="writing-line"></div>').join('');

export const examPaperFormats = [
  { id: 'standard', label: 'Standard Examination', instructions: 'Answer all questions. Read each section carefully and show your work where needed.' },
  { id: 'midterm', label: 'Mid-Term Examination', instructions: 'Answer all required questions. Manage your time across every section.' },
  { id: 'end-term', label: 'End-of-Term Examination', instructions: 'Answer all required questions. Check your work before submitting.' },
  { id: 'weekly-test', label: 'Weekly Test', instructions: 'Answer each question clearly. Keep responses focused on this week\'s topics.' },
  { id: 'monthly-assessment', label: 'Monthly Assessment', instructions: 'Complete all sections. Show calculations and supporting work.' },
  { id: 'mock-national', label: 'Mock National Examination', instructions: 'Follow examination rules. Do not communicate with other candidates.' },
  { id: 'continuous-assessment', label: 'Continuous Assessment', instructions: 'Answer independently and show the steps used to reach each answer.' },
  { id: 'multiple-choice', label: 'Multiple-Choice Paper', instructions: 'Select one answer for each question. Mark answers clearly.' },
  { id: 'short-answer', label: 'Short-Answer Paper', instructions: 'Give concise, precise answers in the spaces provided.' },
  { id: 'essay', label: 'Essay Examination', instructions: 'Plan each response and use clear, well-organized paragraphs.' },
  { id: 'practical', label: 'Practical Assessment', instructions: 'Follow safety instructions, record observations, and show your working.' },
  { id: 'oral', label: 'Oral Assessment', instructions: 'Respond clearly to each prompt. The examiner will record your responses.' },
  { id: 'revision', label: 'Revision Paper', instructions: 'Attempt the questions selected by your teacher and review each section.' },
  { id: 'supplementary', label: 'Supplementary Examination', instructions: 'Answer all required questions independently and follow examination rules.' },
  { id: 'take-home', label: 'Take-Home Assessment', instructions: 'Complete independently by the stated deadline and acknowledge any sources used.' }
];

const getExamFormatLabel = (formatId) => examPaperFormats.find(format => format.id === formatId)?.label || examPaperFormats[0].label;

export const printQuiz = (quiz, schoolName = 'ES RUNABA', { includeAnswerKey = false, preparationPlace = '', paperSettings = {} } = {}) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.alert('Allow pop-ups to print this exam.');
    return;
  }

  const questions = (quiz.questions || []).map((question, index) => {
    const options = question.type === 'radio'
      ? `<div class="options">${['opt1', 'opt2', 'opt3', 'opt4'].map((key, optionIndex) => (
          `<div><span class="option-marker">${String.fromCharCode(65 + optionIndex)}.</span> ${escapeHtml(question[key])}</div>`
        )).join('')}</div>`
      : question.type === 'essay'
        ? `<div class="essay-lines">${writingLines(7)}</div>`
        : `<div class="short-answer">${writingLines(2)}</div>`;

    return `<article class="question">
      <div class="question-heading"><span>${index + 1}. ${escapeHtml(question.q)}</span><span class="points">${Number(question.points) || 1} pt</span></div>
      ${options}
    </article>`;
  });

  const answerKey = includeAnswerKey
    ? `<section class="answer-key page-break"><h2>Teacher Answer Key</h2>${(quiz.questions || []).map((question, index) => {
        const answer = question.type === 'radio'
          ? `${String.fromCharCode(65 + Math.max(0, ['opt1', 'opt2', 'opt3', 'opt4'].indexOf(question.correct)))}. ${escapeHtml(question[question.correct])}`
          : question.type === 'essay'
            ? 'Manual review'
            : escapeHtml(question.correct);
        return `<p><strong>${index + 1}.</strong> ${answer}</p>`;
      }).join('')}</section>`
    : '';

  const durationSeconds = (quiz.questions || []).reduce((total, question) => total + (Number(question.duration) || 0), 0);
  const durationMinutes = Math.ceil(durationSeconds / 60);
  const title = escapeHtml(quiz.title || 'Examination');
  const paper = {
    ministry: 'MINISTRY OF EDUCATION',
    district: 'BURERA DISTRICT',
    schoolName: schoolName || 'ES RUNABA',
    examFormat: 'standard',
    academicYear: '',
    term: '',
    venue: '',
    instructions: 'Answer all questions. Read each section carefully and show your work where needed.',
    ...paperSettings
  };
  const paperSchool = escapeHtml(paper.schoolName || schoolName || 'ES RUNABA');
  const crestUrl = `${window.location.origin}/runaba-logo.png`;
  const watermark = `<img class="watermark" src="${crestUrl}" alt="" />`;
  const documentHtml = `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title} | ${escapeHtml(schoolName)}</title>
        <style>
          * { box-sizing: border-box; }
          @page { size: A4; margin: 15mm; }
          body { margin: 0; padding: 32px; color: #172033; font: 14px/1.5 Arial, sans-serif; }
          .paper { max-width: 800px; margin: 0 auto; }
          .letterhead { display: grid; grid-template-columns: 72px 1fr 72px; align-items: center; gap: 16px; text-align: center; border-bottom: 2px solid #173b5e; padding-bottom: 16px; }
          .crest { width: 68px; height: 68px; object-fit: contain; }
          .letterhead p { margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; }
          .letterhead .school { margin-top: 4px; color: #173b5e; font-size: 18px; font-weight: 800; letter-spacing: 0.08em; }
          .exam-label { color: #64748b; font-size: 9px; font-weight: 700; letter-spacing: 0.1em; }
          .watermark { position: fixed; width: 310px; max-height: 310px; object-fit: contain; left: 50%; top: 50%; transform: translate(-50%, -50%); opacity: 0.075; z-index: -1; }
          h1 { margin: 8px 0 0; font-size: 22px; }
          .format-label { margin-top: 6px; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
          .metadata { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin: 20px 0; }
          .metadata div { border-bottom: 1px solid #9aa5b1; padding: 4px 0; }
          .instructions { margin: 16px 0 24px; padding: 10px 12px; background: #f1f5f9; }
          .section-title { margin: 24px 0 12px; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; font-weight: 700; }
          .question { margin: 18px 0 24px; break-inside: avoid; }
          .page-break { break-before: page; }
          .answer-key h2 { color: #173b5e; border-bottom: 2px solid #173b5e; padding-bottom: 8px; }
          .question-heading { display: flex; justify-content: space-between; gap: 16px; font-weight: 700; }
          .points { white-space: nowrap; font-weight: 400; }
          .options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin: 12px 0 0 18px; }
          .option-marker { font-weight: 700; }
          .essay-lines, .short-answer { margin: 10px 0 0 18px; }
          .writing-line { height: 28px; border-bottom: 1px solid #cbd5e1; }
          footer { margin-top: 36px; border-top: 1px solid #94a3b8; padding-top: 10px; text-align: center; color: #475569; font-size: 11px; }
          @media print { body { padding: 0; } .paper { max-width: none; } }
        </style>
      </head>
      <body>
        ${watermark}
        <main class="paper">
          <header class="letterhead">
            <img class="crest" src="${window.location.origin}/runaba-logo.png" alt="ES RUNABA crest" />
            <div>
              <p>REPUBLIC OF RWANDA</p>
              <p>${escapeHtml(paper.ministry)}</p>
              <p>${escapeHtml(paper.district)}</p>
              <p class="school">${paperSchool}</p>
              ${paper.term ? `<p>${escapeHtml(paper.term)}</p>` : ''}
              ${paper.academicYear ? `<p>${escapeHtml(paper.academicYear)}</p>` : ''}
            </div>
            <span class="exam-label">EXAMINATION</span>
          </header>
          <h1>${title}</h1>
          <p class="format-label">${escapeHtml(getExamFormatLabel(paper.examFormat))}</p>
          <section class="metadata">
            <div><strong>Subject:</strong> ${escapeHtml(quiz.subject)}</div>
            <div><strong>Class:</strong> ${escapeHtml(quiz.class)}</div>
            <div><strong>Place of preparation:</strong> ${escapeHtml(preparationPlace || 'ES RUNABA')}</div>
            <div><strong>Examination venue:</strong> ${escapeHtml(paper.venue || 'Not specified')}</div>
            <div><strong>Student name:</strong></div>
            <div><strong>Registration number:</strong></div>
            <div><strong>Date:</strong></div>
            <div><strong>Questions:</strong> ${(quiz.questions || []).length}${durationMinutes ? ` · <strong>Duration:</strong> ${durationMinutes} min` : ''}</div>
          </section>
          <p class="instructions"><strong>Instructions:</strong> ${escapeHtml(paper.instructions)}</p>
          ${(quiz.questions || []).map((question, index) => `${question.section && (index === 0 || question.section !== quiz.questions[index - 1]?.section) ? `<h2 class="section-title">${escapeHtml(question.section)}</h2>` : ''}${questions[index]}`).join('')}
          ${answerKey}
          <footer>${paperSchool} · E-Learning</footer>
        </main>
        <script>window.addEventListener('load', () => { window.focus(); window.print(); });</script>
      </body>
    </html>`;

  printWindow.document.open();
  printWindow.document.write(documentHtml);
  printWindow.document.close();
};