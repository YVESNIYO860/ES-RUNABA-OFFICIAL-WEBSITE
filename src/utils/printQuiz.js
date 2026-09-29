const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[character]));

const writingLines = (count) => Array.from({ length: count }, () => '<div class="writing-line"></div>').join('');

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
    academicYear: '',
    term: '',
    venue: '',
    instructions: 'Answer all questions. Read each section carefully and show your work where needed.',
    coverMessage: '',
    includeCoverPage: true,
    showWatermark: true,
    ...paperSettings
  };
  const paperSchool = escapeHtml(paper.schoolName || schoolName || 'ES RUNABA');
  const crestUrl = `${window.location.origin}/runaba-logo.png`;
  const coverPage = paper.includeCoverPage
    ? `<section class="cover-page">
        <img class="cover-crest" src="${crestUrl}" alt="ES RUNABA crest" />
        <p class="cover-country">REPUBLIC OF RWANDA</p>
        <p>${escapeHtml(paper.ministry)}</p>
        <p>${escapeHtml(paper.district)}</p>
        <h1>${paperSchool}</h1>
        <h2>${title}</h2>
        <div class="cover-details">
          <p><strong>Subject:</strong> ${escapeHtml(quiz.subject)}</p>
          <p><strong>Class:</strong> ${escapeHtml(quiz.class)}</p>
          ${paper.term ? `<p><strong>Term:</strong> ${escapeHtml(paper.term)}</p>` : ''}
          ${paper.academicYear ? `<p><strong>Academic year:</strong> ${escapeHtml(paper.academicYear)}</p>` : ''}
          ${paper.venue ? `<p><strong>Venue:</strong> ${escapeHtml(paper.venue)}</p>` : ''}
        </div>
        ${paper.coverMessage ? `<p class="cover-message">${escapeHtml(paper.coverMessage)}</p>` : ''}
      </section>`
    : '';
  const watermark = paper.showWatermark
    ? `<img class="watermark" src="${crestUrl}" alt="" />`
    : '';
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
          .cover-page { min-height: 250mm; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; break-after: page; border: 1px solid #cbd5e1; padding: 24mm 18mm; }
          .cover-crest { width: 110px; height: 110px; object-fit: contain; margin-bottom: 20px; }
          .cover-country { color: #173b5e; font-size: 18px; font-weight: 800; }
          .cover-page p { margin: 3px 0; font-weight: 700; }
          .cover-page h1 { margin-top: 14px; color: #173b5e; font-size: 24px; }
          .cover-page h2 { margin-top: 28px; font-size: 22px; }
          .cover-details { margin-top: 28px; width: 100%; text-align: left; }
          .cover-message { margin-top: 28px !important; max-width: 520px; font-weight: 400 !important; }
          h1 { margin: 8px 0 0; font-size: 22px; }
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
          ${coverPage}
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