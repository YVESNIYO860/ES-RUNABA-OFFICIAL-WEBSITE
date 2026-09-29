import { isSupabaseConfigured, supabase } from '../supabase';
import { schoolClassGroups } from './schoolClasses';
import { runWithLearningActivity } from './learningActivity';

const tableByType = {
  assignments: 'elearning_assignments',
  quizzes: 'elearning_quizzes',
  notes: 'elearning_notes',
  submissions: 'elearning_submissions',
  quizResults: 'elearning_quiz_results'
};

const throwFriendlyDuplicateNameError = (error, entity, indexName) => {
  if (error?.code === '23505' || error?.message?.includes(indexName)) {
    throw new Error(`A ${entity} with that name already exists. Choose a different name.`);
  }
  throw error;
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
  if (type === 'assignments') return { ...row, dueDate: row.due_date, createdBy: row.created_by };
  if (type === 'quizzes') return { ...row, deadline: row.deadline || '', paperSettings: row.paper_settings || {}, createdBy: row.created_by };
  if (type === 'notes') return {
    ...row,
    fileName: row.file_name,
    filePath: row.file_path,
    targetClasses: row.target_classes || [],
    targetStudentIds: row.target_student_ids || [],
    datePosted: row.date_posted
  };
  if (type === 'submissions') return {
    ...row,
    assignmentId: row.assignment_id,
    studentId: row.student_reg_number,
    submittedAt: row.submitted_at,
    fileName: row.file_name,
    filePath: row.file_path,
    fileType: row.file_type
  };
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
      deadline: record.deadline || null,
      paper_settings: record.paperSettings || {},
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
      submitted_at: record.submittedAt,
      file_name: record.fileName || null,
      file_path: record.filePath || null,
      file_type: record.fileType || null
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

export const loadSchoolClasses = async () => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('school_classes').select('name').order('name');
    if (error) throw error;
    return data.map(row => row.name);
  }
  const storedClasses = JSON.parse(localStorage.getItem('school_classes_db') || '[]');
  return [...new Set([...schoolClassGroups.flatMap(group => group.options.map(option => option.value)), ...storedClasses])].sort();
};

export const loadSchoolClassesWithHeads = async () => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('school_classes').select('name, head_teacher_id').order('name');
    if (error) throw error;
    return data.map(row => ({ name: row.name, headTeacherId: row.head_teacher_id }));
  }
  const classes = await loadSchoolClasses();
  const assignedHeads = JSON.parse(localStorage.getItem('class_heads_db') || '{}');
  return classes.map(name => ({ name, headTeacherId: assignedHeads[name] || null }));
};

export const loadHeadedSchoolClasses = async (teacherId) =>
  (await loadSchoolClassesWithHeads())
    .filter(schoolClass => schoolClass.headTeacherId === teacherId)
    .map(schoolClass => schoolClass.name);

export const assignSchoolClassHead = async (className, teacherId) => {
  if (isSupabaseConfigured) {
    const { error } = await supabase.rpc('assign_school_class_head', {
      class_name: className,
      teacher_profile_id: teacherId || null
    });
    if (error) throw error;
    return;
  }
  const assignments = JSON.parse(localStorage.getItem('class_heads_db') || '{}');
  if (teacherId) assignments[className] = teacherId;
  else delete assignments[className];
  localStorage.setItem('class_heads_db', JSON.stringify(assignments));
};

export const createSchoolClass = async (name) => {
  const classes = await loadSchoolClasses();
  if (classes.some(item => item.toLowerCase() === name.toLowerCase())) {
    throw new Error('A class with that name already exists. Choose a different name.');
  }
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('school_classes').insert({ name }).select('name').single();
    if (error) throwFriendlyDuplicateNameError(error, 'class', 'school_classes_name_ci_idx');
    return data.name;
  }
  const nextClasses = [...classes, name].sort();
  localStorage.setItem('school_classes_db', JSON.stringify(nextClasses));
  return name;
};

export const deleteSchoolClass = async (name) => {
  if (isSupabaseConfigured) {
    const { error } = await supabase.rpc('delete_school_class', { class_name: name });
    if (error) throw error;
    return;
  }
  const references = ['students_db', 'assignments_db', 'quizzes_db', 'notes_db', 'attendance_db', 'submissions_db', 'quiz_results_db']
    .some(key => JSON.parse(localStorage.getItem(key) || '[]').some(record => record.class === name || record.targetClasses?.includes(name)));
  if (references) throw new Error('This class is still assigned to records. Reassign those records before removing it.');
  const classes = (await loadSchoolClasses()).filter(item => item !== name);
  localStorage.setItem('school_classes_db', JSON.stringify(classes));
};

export const loadSchoolCourses = async () => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('school_courses').select('name').order('name');
    if (error) throw error;
    return data.map(row => row.name);
  }
  const storedCourses = JSON.parse(localStorage.getItem('school_courses_db') || '[]');
  return [...new Set(['BIO', 'MATH', 'ENG', ...storedCourses])].sort();
};

export const createSchoolCourse = async (name) => {
  const courses = await loadSchoolCourses();
  if (courses.some(item => item.toLowerCase() === name.toLowerCase())) {
    throw new Error('A course with that name already exists. Choose a different name.');
  }
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('school_courses').insert({ name }).select('name').single();
    if (error) throwFriendlyDuplicateNameError(error, 'course', 'school_courses_name_ci_idx');
    return data.name;
  }
  localStorage.setItem('school_courses_db', JSON.stringify([...courses, name].sort()));
  return name;
};

export const deleteSchoolCourse = async (name) => {
  if (isSupabaseConfigured) {
    const { error } = await supabase.rpc('delete_school_course', { course_name: name });
    if (error) throw error;
    return;
  }
  const references = ['students_db', 'staff_db', 'assignments_db', 'quizzes_db', 'notes_db']
    .some(key => JSON.parse(localStorage.getItem(key) || '[]').some(record => record.module === name || record.subject === name));
  if (references) throw new Error('This course is still assigned to records. Reassign those records before removing it.');
  const courses = (await loadSchoolCourses()).filter(item => item !== name);
  localStorage.setItem('school_courses_db', JSON.stringify(courses));
};

export const renameSchoolCourse = async (oldName, newName) => {
  const courses = await loadSchoolCourses();
  if (courses.some(course => course !== oldName && course.toLowerCase() === newName.toLowerCase())) {
    throw new Error('A course with that name already exists. Choose a different name.');
  }
  if (isSupabaseConfigured) {
    const { error } = await supabase.rpc('rename_school_course', { old_name: oldName, new_name: newName });
    if (error) throwFriendlyDuplicateNameError(error, 'course', 'school_courses_name_ci_idx');
    return;
  }
  for (const key of ['students_db', 'staff_db', 'assignments_db', 'quizzes_db', 'notes_db']) {
    const records = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify(records.map(record => ({
      ...record,
      ...(record.module === oldName ? { module: newName } : {}),
      ...(record.subject === oldName ? { subject: newName } : {})
    }))));
  }
  const renamedCourses = courses.map(course => course === oldName ? newName : course);
  localStorage.setItem('school_courses_db', JSON.stringify([...new Set(renamedCourses)].sort()));
};

export const renameSchoolClass = async (oldName, newName) => {
  const classes = await loadSchoolClasses();
  if (classes.some(className => className !== oldName && className.toLowerCase() === newName.toLowerCase())) {
    throw new Error('A class with that name already exists. Choose a different name.');
  }
  if (isSupabaseConfigured) {
    const { error } = await supabase.rpc('rename_school_class', {
      old_name: oldName,
      new_name: newName
    });
    if (error) throwFriendlyDuplicateNameError(error, 'class', 'school_classes_name_ci_idx');
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
  const renamedClasses = classes.map(className => className === oldName ? newName : className);
  localStorage.setItem('school_classes_db', JSON.stringify([...new Set(renamedClasses)].sort()));
};

export const provisionAccount = async (account) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Please sign in again before managing accounts.');

  return runWithLearningActivity('Creating your school account', async () => {
    const response = await fetch('/api/elearning/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify(account)
    });
    return parseApiResponse(response, 'Could not create the account.');
  });
};

export const deleteProvisionedAccount = async (id) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Please sign in again before managing accounts.');

  return runWithLearningActivity('Removing the school account', async () => {
    const response = await fetch('/api/elearning/users', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ id })
    });
    await parseApiResponse(response, 'Could not remove the account.');
  });
};

export const uploadLearningNote = async (file, className, noteId, userId) => {
  const safeClass = encodeURIComponent(className);
  const safeName = file.name.replace(/[^\w.-]/g, '_');
  const filePath = `${userId}/${safeClass}/${noteId}-${safeName}`;
  const { error } = await supabase.storage
    .from('elearning-notes')
    .upload(filePath, file, { upsert: false, contentType: file.type || 'application/octet-stream' });
  if (error) throw error;
  return filePath;
};

export const uploadStudentWork = async (file, user, assignmentId) => {
  const safeName = file.name.replace(/[^\w.-]/g, '_');
  const filePath = `${user.id}/${assignmentId}/${Date.now()}-${safeName}`;
  const fileType = file.type || safeName.split('.').pop()?.toLowerCase() || 'unknown';
  const { error } = await supabase.storage
    .from('student-work')
    .upload(filePath, file, { upsert: false, contentType: file.type || 'application/octet-stream' });
  if (error) throw error;
  return { filePath, fileType };
};

export const getStudentWorkUrl = async (filePath) => {
  const { data, error } = await supabase.storage
    .from('student-work')
    .createSignedUrl(filePath, 60);
  if (error) throw error;
  return data.signedUrl;
};

export const removeStudentWorkFile = async (filePath) => {
  if (!filePath) return;
  const { error } = await supabase.storage.from('student-work').remove([filePath]);
  if (error) throw error;
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

const mapSchoolUpdate = (row) => ({
  id: row.id,
  type: row.type,
  title: row.title,
  content: row.content,
  isActive: row.is_active,
  createdAt: row.created_at
});

export const loadSchoolUpdates = async () => {
  const { data, error } = await supabase
    .from('school_updates')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapSchoolUpdate);
};

export const loadActiveAnnouncement = async () => {
  const { data, error } = await supabase
    .from('school_updates')
    .select('content')
    .eq('type', 'announcement')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.content || '';
};

export const createSchoolUpdate = async (update, user) => {
  const { data, error } = await supabase
    .from('school_updates')
    .insert({
      type: update.type,
      title: update.title,
      content: update.content,
      is_active: Boolean(update.isActive),
      created_by: user?.id || null
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapSchoolUpdate(data);
};

export const updateSchoolUpdate = async (id, update) => {
  const { data, error } = await supabase
    .from('school_updates')
    .update({
      type: update.type,
      title: update.title,
      content: update.content,
      is_active: Boolean(update.isActive)
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapSchoolUpdate(data);
};

export const deleteSchoolUpdate = async (id) => {
  const { error } = await supabase.from('school_updates').delete().eq('id', id);
  if (error) throw error;
};

export const setSchoolUpdateActive = async (id, isActive) => {
  if (isActive) {
    const { error: deactivateError } = await supabase
      .from('school_updates')
      .update({ is_active: false })
      .eq('type', 'announcement')
      .eq('is_active', true)
      .neq('id', id);
    if (deactivateError) throw deactivateError;
  }

  const { data, error } = await supabase
    .from('school_updates')
    .update({ is_active: isActive })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapSchoolUpdate(data);
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