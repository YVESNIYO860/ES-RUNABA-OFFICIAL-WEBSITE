const makeTemplates = (entries) => entries.map(([id, title, description]) => ({ id, title, description }));

export const quizTemplates = [
  { id: 'quick-recall', title: 'Quick Recall Check', section: 'Section A - Recall', type: 'radio', duration: 45, points: 1, instructions: 'Answer each question independently. Select the best answer.' },
  { id: 'multiple-choice', title: 'Multiple-Choice Review', section: 'Section A - Multiple Choice', type: 'radio', duration: 60, points: 1, instructions: 'Choose one answer for each question. Review all options before submitting.' },
  { id: 'short-answer', title: 'Short-Answer Check', section: 'Section A - Short Answer', type: 'short_answer', duration: 90, points: 2, instructions: 'Write a concise answer. Spelling and key terms matter.' },
  { id: 'exit-ticket', title: 'Lesson Exit Ticket', section: 'Exit Ticket', type: 'short_answer', duration: 60, points: 1, instructions: 'Answer independently using what you learned in today\'s lesson.' },
  { id: 'weekly-checkpoint', title: 'Weekly Checkpoint', section: 'Section A - This Week', type: 'radio', duration: 60, points: 2, instructions: 'Answer all questions from this week\'s lessons.' },
  { id: 'topic-mastery', title: 'Topic Mastery Quiz', section: 'Section A - Core Concepts', type: 'radio', duration: 75, points: 2, instructions: 'Demonstrate your understanding of the topic. Read each question carefully.' },
  { id: 'vocabulary', title: 'Vocabulary and Key Terms', section: 'Section A - Key Terms', type: 'short_answer', duration: 60, points: 1, instructions: 'Use the correct subject vocabulary in every response.' },
  { id: 'reading-comprehension', title: 'Reading Comprehension', section: 'Section A - Comprehension', type: 'short_answer', duration: 120, points: 2, instructions: 'Read the source carefully and support each response with evidence.' },
  { id: 'calculation-drill', title: 'Calculation Drill', section: 'Section A - Working', type: 'short_answer', duration: 90, points: 2, instructions: 'Show the steps used to reach each answer.' },
  { id: 'practical-theory', title: 'Practical Theory Check', section: 'Section A - Application', type: 'radio', duration: 75, points: 2, instructions: 'Apply the correct method and observe all safety requirements.' },
  { id: 'essay-planning', title: 'Extended Response Practice', section: 'Section A - Written Response', type: 'essay', duration: 180, points: 5, instructions: 'Plan your response, use clear paragraphs, and support your ideas.' },
  { id: 'mid-unit', title: 'Mid-Unit Check', section: 'Section A - Mid-Unit', type: 'radio', duration: 75, points: 2, instructions: 'Answer every question and check your work before submitting.' },
  { id: 'end-unit', title: 'End-of-Unit Review', section: 'Section A - Unit Review', type: 'radio', duration: 90, points: 2, instructions: 'Use knowledge from across the whole unit.' },
  { id: 'revision', title: 'Revision Practice Quiz', section: 'Section A - Revision', type: 'radio', duration: 90, points: 2, instructions: 'Attempt every question, then review any topic you found difficult.' },
  { id: 'diagnostic', title: 'Prior Knowledge Diagnostic', section: 'Section A - Diagnostic', type: 'short_answer', duration: 60, points: 1, instructions: 'Answer from your current understanding. This check is for identifying learning needs.' },
  { id: 'mixed-skills', title: 'Mixed Skills Challenge', section: 'Section A - Skills', type: 'radio', duration: 90, points: 3, instructions: 'Choose the best method for each problem and show working where needed.' }
];

export const assignmentTemplates = makeTemplates([
  ['practice-set', 'Practice Problem Set', 'Complete the problems independently. Show every step, label your answers, and check your work before submission.'],
  ['reading-response', 'Reading Response', 'Read the assigned text. Summarize its main idea, explain two supporting details, and include evidence from the text.'],
  ['research-brief', 'Short Research Brief', 'Investigate the topic using reliable sources. Submit a one-page summary, key findings, and a list of sources.'],
  ['lab-report', 'Science Lab Report', 'Record the aim, materials, method, observations, results, and conclusion. Follow laboratory safety rules.'],
  ['essay', 'Structured Essay', 'Write an introduction, organized body paragraphs, and a conclusion. Support each main point with evidence.'],
  ['worked-examples', 'Worked Examples', 'Solve each example and show your method. Include units and explain any important decisions.'],
  ['field-observation', 'Field Observation', 'Observe the assigned environment. Record accurate notes, identify patterns, and explain your findings.'],
  ['case-study', 'Case Study Analysis', 'Read the case, identify the main issue, apply relevant concepts, and recommend a solution with reasons.'],
  ['revision-sheet', 'Revision Sheet', 'Answer the review questions and make a brief list of topics you need to practise further.'],
  ['oral-presentation', 'Oral Presentation', 'Prepare a short presentation with a clear introduction, key points, and conclusion. Cite any sources used.'],
  ['group-project', 'Group Project Milestone', 'Submit the agreed group deliverable and identify each member\'s contribution and next steps.'],
  ['concept-map', 'Concept Map', 'Create a concept map that links the key terms. Label each connection and add a short explanation.'],
  ['data-investigation', 'Data Investigation', 'Organize the supplied data, show your calculations, describe the pattern, and support a conclusion.'],
  ['language-writing', 'Writing Skills Practice', 'Complete the writing task using accurate grammar, clear paragraphs, and appropriate vocabulary.'],
  ['homework', 'Lesson Follow-Up', 'Review today\'s lesson and complete the assigned questions. Bring any questions to the next class.'],
  ['reflection', 'Learning Reflection', 'Describe what you learned, what challenged you, and one specific step you will take next.']
]);

export const lessonTemplates = makeTemplates([
  ['chapter-notes', 'Chapter Notes', 'Key ideas, definitions, and examples from this chapter. Add page references and a short recap.'],
  ['study-guide', 'Study Guide', 'Use this guide to review the essential concepts, vocabulary, worked examples, and revision questions.'],
  ['worksheet', 'Practice Worksheet', 'Complete the activities in order. Show your working and check your responses against the lesson objectives.'],
  ['lab-handout', 'Laboratory Handout', 'Review the aim, materials, procedure, safety guidance, and observation table before the practical.'],
  ['reading-pack', 'Reading Pack', 'Read the selected material and note unfamiliar terms, central ideas, and questions for discussion.'],
  ['revision-pack', 'Revision Pack', 'Use these summaries and exercises to revise the unit. Prioritize the sections you find most difficult.'],
  ['worked-solutions', 'Worked Solutions', 'Follow each worked example and compare the method with your own. Retry any question before viewing its solution.'],
  ['vocabulary-list', 'Vocabulary List', 'Review each term, definition, and example. Add your own example for every new word.'],
  ['lesson-slides', 'Lesson Slides', 'Slides and supporting examples for the lesson. Review the key points and complete the follow-up task.'],
  ['project-brief', 'Project Brief', 'Project purpose, expected outcome, milestones, assessment criteria, and submission guidance.'],
  ['exam-guide', 'Examination Guide', 'Review the paper structure, timing guidance, command words, and preparation checklist.'],
  ['reference-sheet', 'Reference Sheet', 'A concise collection of formulas, rules, diagrams, or reference information for this topic.'],
  ['case-material', 'Case Study Materials', 'Background information and source material for the case. Use evidence from this resource in your analysis.'],
  ['field-guide', 'Fieldwork Guide', 'Fieldwork objectives, equipment list, observation prompts, safety guidance, and recording tables.'],
  ['audio-transcript', 'Listening Transcript', 'Transcript and vocabulary notes for the listening activity. Revisit the audio before completing the questions.'],
  ['catch-up-notes', 'Catch-Up Notes', 'A concise recap of the lesson, essential examples, and tasks to complete if you were absent.']
]);