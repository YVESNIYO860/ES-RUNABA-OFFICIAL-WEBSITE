import { isSupabaseConfigured, supabase } from '../supabase';

const tableByType = {
  assignments: 'elearning_assignments',
  quizzes: 'elearning_quizzes',
  notes: 'elearning_notes',
  submissions: 'elearning_submissions',
  quizResults: 'elearning_quiz_results'
};

const parseApiResponse = async (response, fallbackMessage) => {
  const responseText = await response.text();
  const contentType = response.headers.get('content-type') || '';
  const isHtmlResponse = contentType.includes('text/html') || responseText.trimStart().startsWith('<');
  if (isHtmlResponse) {
    const localApiHint = import.meta.env.DEV
      ? ' Run `npx vercel dev` locally; `npm run dev` does not serve API routes.'
      : '';
    throw new Error(`The e-learning API returned a web page instead of JSON (HTTP ${response.status}).${localApiHint}`);
  }

  if (!responseText.trim()) {
    if (!response.ok) throw new Error(`${fallbackMessage} (HTTP ${response.status}).`);
    throw new Error('The server returned an empty response. Please try again.');
  }

  let result;
  try {
    result = JSON.parse(responseText);
  } catch {
    if (!response.ok) throw new Error(responseText.trim() || `${fallbackMessage} (HTTP ${response.status}).`);
    throw new Error('The server returned an invalid response. Please try again.');
  }

  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error('The server returned an invalid response. Please try again.');
  }
  if (!response.ok) {
    throw new Error(result.error || `${fallbackMessage} (HTTP ${response.status}).`);
  }
  return result;
};

const toAppRecord = (type, row) => {
  if (type === 'assignments') return { ...row, dueDate: row.due_date };
  if (type === 'notes') return {
    ...row,
    fileName: row.file_name,
    filePath: row.file_path,
    targetClasses: row.target_classes || [],
    targetStudentIds: row.target_student_ids || [],
    datePosted: row.date_posted
  };
  if (type === 'submissions') return { ...row, assignmentId: row.assignment_id, studentId: row.student_reg_number, submittedAt: row.submitted_at };
  if (type === 'quizResults') return { ...row, quizId: row.quiz_id, studentId: row.student_reg_number, hasEssay: row.has_essay };
  return row;
};

const toDatabaseRecord = (type, record, user) => {
  const createdBy = user?.id || null;
  if (type === 'assignments') {
    return {
      id: record.id,
      title: record.title,
      class: record.class,
      subject: record.subject || '',
      description: record.description || '',
      due_date: record.dueDate || null,
      created_by: createdBy
    };
  }
  if (type === 'quizzes') {
    return {
      id: record.id,
      title: record.title,
      class: record.class,
      subject: record.subject || '',
      questions: record.questions || [],
      created_by: createdBy
    };
  }
  if (type === 'notes') {
    return {
      id: record.id,
      title: record.title,
      class: record.class,
      subject: record.subject || '',
      description: record.description || '',
      file_name: record.fileName,
      file_path: record.filePath,
      target_classes: record.targetClasses || [],
      target_student_ids: record.targetStudentIds || [],
      date_posted: record.datePosted || '',
      created_by: createdBy
    };
  }
  if (type === 'submissions') {
    return {
      id: record.id,
      assignment_id: record.assignmentId,
      student_id: user.id,
      student_reg_number: user.regNumber,
      class: user.class,
      submitted_at: record.submittedAt
    };
  }
  if (type === 'quizResults') {
    return {
      id: record.id,
      quiz_id: record.quizId,
      student_id: user.id,
      student_reg_number: user.regNumber,
      class: user.class,
      score: record.score,
      total: record.total,
      has_essay: record.hasEssay
    };
  }
  throw new Error(`Unsupported e-learning record type: ${type}`);
};

export const mapSupabaseProfile = (profile) => ({
  id: profile.id,
  role: profile.role,
  name: profile.full_name,
  fullName: profile.full_name,
  email: profile.email,
  username: profile.username,
  isAdmin: profile.is_admin,
  regNumber: profile.reg_number,
  class: profile.class,
  startYear: profile.start_year,
  module: profile.subject,
  subject: profile.subject
});

export const loadLearningRecords = async (type) => {
  const table = tableByType[type];
  if (!table) throw new Error(`Unsupported e-learning record type: ${type}`);
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  return data.map((row) => toAppRecord(type, row));
};

export const saveLearningRecord = async (type, record, user) => {
  const table = tableByType[type];
  if (!table) throw new Error(`Unsupported e-learning record type: ${type}`);
  const { data, error } = await supabase
    .from(table)
    .upsert(toDatabaseRecord(type, record, user))
    .select('*')
    .single();
  if (error) throw error;
  return toAppRecord(type, data);
};

export const deleteLearningRecord = async (type, id) => {
  const table = tableByType[type];
  if (!table) throw new Error(`Unsupported e-learning record type: ${type}`);
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
};

export const loadProfiles = async (role) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(mapSupabaseProfile);
};

export const renameSchoolClass = async (oldName, newName) => {
  if (isSupabaseConfigured) {
    const { error } = await supabase.rpc('rename_school_class', {
      old_name: oldName,
      new_name: newName
    });
    if (error) throw error;
    return;
  }

  const updateRecords = (key) => {
    const records = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify(records.map(record => ({
      ...record,
      ...(record.class === oldName ? { class: newName } : {}),
      ...(record.targetClasses?.includes(oldName)
        ? { targetClasses: record.targetClasses.map(className => className === oldName ? newName : className) }
        : {})
    }))));
  };

  ['students_db', 'assignments_db', 'quizzes_db', 'notes_db', 'submissions_db', 'quiz_results_db', 'attendance_db']
    .forEach(updateRecords);
};

export const provisionAccount = async (account) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Please sign in again before managing accounts.');

  const response = await fetch('/api/elearning/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`
    },
    body: JSON.stringify(account)
  });
  return parseApiResponse(response, 'Could not create the account.');
};

export const deleteProvisionedAccount = async (id) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Please sign in again before managing accounts.');

  const response = await fetch('/api/elearning/users', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ id })
  });
  await parseApiResponse(response, 'Could not remove the account.');
};

export const uploadLearningNote = async (file, className, noteId) => {
  const safeClass = encodeURIComponent(className);
  const safeName = file.name.replace(/[^\w.-]/g, '_');
  const filePath = `${safeClass}/${noteId}-${safeName}`;
  const { error } = await supabase.storage
    .from('elearning-notes')
    .upload(filePath, file, { upsert: true });
  if (error) throw error;
  return filePath;
};

export const getLearningNoteUrl = async (filePath) => {
  const { data, error } = await supabase.storage
    .from('elearning-notes')
    .createSignedUrl(filePath, 60);
  if (error) throw error;
  return data.signedUrl;
};

export const removeLearningNoteFile = async (filePath) => {
  if (!filePath) return;
  const { error } = await supabase.storage.from('elearning-notes').remove([filePath]);
  if (error) throw error;
};

export const loadAttendanceRecords = async (attendanceDate, className) => {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('attendance_date', attendanceDate)
    .eq('class', className);
  if (error) throw error;
  return data.map((record) => ({
    ...record,
    attendanceDate: record.attendance_date,
    studentId: record.student_id,
    studentRegNumber: record.student_reg_number,
    studentName: record.student_name,
    recordedBy: record.recorded_by
  }));
};

export const saveAttendanceRecords = async (records, user) => {
  const rows = records.map((record) => ({
    id: record.id,
    attendance_date: record.attendanceDate,
    session: record.session || 'Daily',
    class: record.class,
    student_id: record.studentId,
    student_reg_number: record.studentRegNumber,
    student_name: record.studentName,
    status: record.status,
    note: record.note || '',
    recorded_by: user.id
  }));
  const { error } = await supabase.from('attendance_records').upsert(rows);
  if (error) throw error;
};

export const loadSchoolEvents = async () => {
  const { data, error } = await supabase.from('school_events').select('*').order('event_date');
  if (error) throw error;
  return data.map((event) => ({
    id: event.id,
    date: event.event_date,
    title: event.title,
    loc: event.location,
    desc: event.description
  }));
};

export const saveSchoolEvent = async (event, user) => {
  const { error } = await supabase.from('school_events').upsert({
    id: event.id,
    event_date: event.date,
    title: event.title,
    location: event.loc || '',
    description: event.desc || '',
    created_by: user.id
  });
  if (error) throw error;
};

export const deleteSchoolEvent = async (id) => {
  const { error } = await supabase.from('school_events').delete().eq('id', id);
  if (error) throw error;
};

export { isSupabaseConfigured };