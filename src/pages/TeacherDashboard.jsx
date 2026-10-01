import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Users, FileText, CheckSquare, LayoutDashboard, Plus, Trash2, Save, X, Menu, FileUp, Download, CalendarDays, Globe, Edit3, Heart, Shield, BarChart3, Laptop, MessageSquare, BookOpen, Printer, Settings, UserCheck, ArrowLeft, ShieldAlert, Copy, KeyRound, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { saveFirestoreDocument } from '../firebase';
import { generateStudentRegistrationNumber } from '../utils/studentRegistration';
import LearningDashboardFooter from '../components/LearningDashboardFooter';
import LearningContact from '../components/LearningContact';
import LearningSettings from '../components/LearningSettings';
import LearningPortalHeader from '../components/LearningPortalHeader';
import { examPaperFormats, printQuiz } from '../utils/printQuiz';
import {
  deleteLearningRecord,
  createSchoolClass,
  createSchoolCourse,
  deleteSchoolClass,
  deleteSchoolCourse,
  deleteProvisionedAccount,
    loadSchoolClasses,
    loadSchoolCourses,
  deleteSchoolEvent,
  isSupabaseConfigured,
  loadSchoolClassesWithHeads,
  assignSchoolClassHead,
  getStudentWorkUrl,
  loadSchoolEvents,
  loadLearningRecords,
  loadAttendanceRecords,
  loadProfiles,
  mapSupabaseProfile,
  provisionAccount,
  renameSchoolClass,
  renameSchoolCourse,
  removeLearningNoteFile,
  saveLearningRecord,
  saveAttendanceRecords,
  saveSchoolEvent,
  uploadLearningNote
} from '../utils/elearningStore';

const getStaffDashboardTabs = (user) => [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'attendance', label: 'Attendance', icon: CheckSquare },
  ...(user?.role === 'teacher' ? [{ id: 'tools', label: 'Tools', icon: Laptop }] : []),
  ...(user?.role === 'dos' ? [
    { id: 'students', label: 'Students', icon: Users },
    { id: 'events', label: 'Upcoming Events', icon: CalendarDays },
    { id: 'classes', label: 'Classes', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'staff', label: 'Staff & Class Heads', icon: UserCheck },
    { id: 'site-editor', label: 'Site Designer', icon: Globe },
    { id: 'analytics', label: 'Academic Analytics', icon: BarChart3 }
  ] : []),
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'contact', label: 'Contact', icon: MessageSquare }
];

const TeacherDashboard = () => {
  const { user, logout, siteContent, updateSiteContent } = useAuth();
  const dashboardTabs = getStaffDashboardTabs(user);
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem(`es_runaba_learning_home_${user?.id}`);
    return dashboardTabs.some(tab => tab.id === savedTab) ? savedTab : 'overview';
  });
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Data State
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [events, setEvents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [headedClasses, setHeadedClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const classGroups = classes.length
    ? [{ label: 'Classes', options: classes.map(name => ({ value: name, label: name })) }]
    : [];

  useEffect(() => {
    let isActive = true;

    /* Each source loads independently: one failing query (for example a
       column missing from an out-of-date database) must not blank the whole
       dashboard, which previously left the portal showing nothing at all. */
    const settle = async (loader, fallback) => {
      try {
        return await loader();
      } catch (error) {
        console.error('Dashboard data load failed', error);
        setLoadError((current) => current || error?.message || 'Some portal data could not be loaded.');
        return fallback;
      }
    };

    const loadDashboardData = async () => {
      if (isSupabaseConfigured) {
        const [studentRecords, eventRecords, classRecords, courseRecords, classHeadRecords,
          assignmentRecords, quizRecords, noteRecords, submissionRecords] = await Promise.all([
          settle(() => loadProfiles('student'), []),
          settle(() => loadSchoolEvents(), []),
          settle(() => loadSchoolClasses(), []),
          settle(() => loadSchoolCourses(), []),
          settle(() => (user.role === 'teacher' ? loadSchoolClassesWithHeads() : Promise.resolve([])), []),
          settle(() => loadLearningRecords('assignments'), []),
          settle(() => loadLearningRecords('quizzes'), []),
          settle(() => loadLearningRecords('notes'), []),
          settle(() => loadLearningRecords('submissions'), [])
        ]);
        if (!isActive) return;
        setStudents(studentRecords);
        setEvents(eventRecords);
        setClasses(classRecords);
        setCourses(courseRecords);
        setHeadedClasses(classHeadRecords
          .filter(schoolClass => schoolClass.headTeacherId === user.id)
          .map(schoolClass => schoolClass.name));
        setAssignments(assignmentRecords);
        setQuizzes(quizRecords);
        setNotes(noteRecords);
        setSubmissions(submissionRecords);
        setIsLoadingData(false);
        return;
      }

      if (!isActive) return;
      setStudents(JSON.parse(localStorage.getItem('students_db') || '[]'));
      setAssignments(JSON.parse(localStorage.getItem('assignments_db') || '[]').filter(record => user.role === 'dos' || record.createdBy === user.id));
      setQuizzes(JSON.parse(localStorage.getItem('quizzes_db') || '[]').filter(record => user.role === 'dos' || record.createdBy === user.id));
      setNotes(JSON.parse(localStorage.getItem('notes_db') || '[]').filter(note => user.role === 'dos' || note.createdBy === user.id));
      setSubmissions(JSON.parse(localStorage.getItem('submissions_db') || '[]'));
      setEvents(JSON.parse(localStorage.getItem('events_db') || '[]'));
      setClasses(await settle(() => loadSchoolClasses(), []));
      setCourses(await settle(() => loadSchoolCourses(), []));
      if (user.role === 'teacher') {
        const classHeadRecords = await settle(() => loadSchoolClassesWithHeads(), []);
        setHeadedClasses(classHeadRecords
          .filter(schoolClass => schoolClass.headTeacherId === user.id)
          .map(schoolClass => schoolClass.name));
      }
      setIsLoadingData(false);
    };

    loadDashboardData();
    return () => { isActive = false; };
  }, []);

  /* Signed in with the wrong role: explain instead of silently bouncing,
     which previously looked like a blank or broken page. */
  if (user && !['teacher', 'dos'].includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-lg border border-slate-300 bg-white p-8 text-center shadow-[0_.5rem_1rem_rgba(0,0,0,.15)]">
          <ShieldAlert size={40} className="mx-auto text-amber-500" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Staff access only</h1>
          <p className="mt-2 text-sm text-slate-600">
            You are signed in as <strong>{user.role === 'student' ? 'a student' : user.role}</strong>. This
            dashboard is reserved for teachers and the Director of Studies.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to={user.role === 'student' ? '/student-dashboard' : '/'}
              className="rounded bg-school-blue px-4 py-2 text-sm font-bold text-white transition hover:bg-school-blue-dark"
            >
              {user.role === 'student' ? 'Go to my dashboard' : 'Back to website'}
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-school-blue hover:text-school-blue"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/elearning" />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <LearningPortalHeader user={user} />
      <div className="flex flex-col md:h-[calc(100vh-4rem)] md:flex-row md:overflow-hidden">
      {/* Sidebar sidebar */}
      <aside className="z-10 flex w-full shrink-0 flex-col bg-school-blue pt-4 text-white shadow-xl md:h-full md:w-64 md:overflow-y-auto md:pt-0">
        <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-b border-white/10">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight uppercase">{user.role === 'dos' ? 'Studies Office' : 'Management'}</h2>
            <p className="mt-1 truncate text-sm text-slate-300">Portal | Welcome, {user.name}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsNavOpen(open => !open)}
            aria-label={isNavOpen ? 'Close dashboard menu' : 'Open dashboard menu'}
            aria-expanded={isNavOpen}
            aria-controls="teacher-dashboard-nav"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/20 text-white hover:bg-white/10 md:hidden"
          >
            {isNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav id="teacher-dashboard-nav" className={`${isNavOpen ? 'flex' : 'hidden'} flex-col gap-1 border-t border-white/10 px-3 pb-4 pt-3 sm:px-4 md:flex md:flex-1 md:gap-2 md:overflow-visible md:border-0 md:pb-4 md:pt-2`}>
          {dashboardTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                localStorage.setItem(`es_runaba_learning_home_${user.id}`, tab.id);
                setIsNavOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors md:px-4 ${activeTab === tab.id ? 'bg-school-green font-medium text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col md:overflow-hidden">
      <main className="mx-auto w-full max-w-6xl flex-1 p-4 pt-5 sm:pt-6 md:overflow-y-auto md:p-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
            {loadError && (
              <div role="alert" className="mb-6 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <strong>Some portal data could not be loaded.</strong> {loadError}
              </div>
            )}
            {activeTab === 'overview' && <OverviewTab students={students} assignments={assignments} quizzes={quizzes} classes={classes} headedClasses={headedClasses} isLoading={isLoadingData} />}
            {activeTab === 'attendance' && <AttendanceTab students={students} user={user} classGroups={user.role === 'teacher' && headedClasses.length ? [{ label: 'My headed classes', options: headedClasses.map(name => ({ value: name, label: name })) }] : classGroups} />}
            {activeTab === 'students' && user.role === 'dos' && <StudentsTab students={students} setStudents={setStudents} classGroups={classGroups} courses={courses} />}
            { activeTab === 'tools' && user.role === 'teacher' && <TeachingToolsTab onSelect={setActiveTab} /> }
            { activeTab === 'assignments' && user.role === 'teacher' && <AssignmentsTab assignments={assignments} setAssignments={setAssignments} submissions={submissions} students={students} headedClasses={headedClasses} canManage user={user} classGroups={classGroups} courses={courses} onBack={() => setActiveTab('tools')} /> }
            { activeTab === 'exam-prep' && user.role === 'teacher' && <QuizzesTab mode="exam" quizzes={quizzes} setQuizzes={setQuizzes} canManage user={user} classGroups={classGroups} courses={courses} schoolName={siteContent?.general?.schoolName} onBack={() => setActiveTab('tools')} /> }
            { activeTab === 'quizzes' && user.role === 'teacher' && <QuizzesTab mode="quiz" quizzes={quizzes} setQuizzes={setQuizzes} canManage user={user} classGroups={classGroups} courses={courses} schoolName={siteContent?.general?.schoolName} onBack={() => setActiveTab('tools')} /> }
            { activeTab === 'notes' && user.role === 'teacher' && <NotesTab notes={notes} setNotes={setNotes} canManage user={user} students={students} classGroups={classGroups} courses={courses} onBack={() => setActiveTab('tools')} /> }
            { activeTab === 'classes' && user.role === 'dos' && <ClassesTab classes={classes} setClasses={setClasses} onClassRenamed={(oldName, newName) => {
              setStudents(current => current.map(student => student.class === oldName ? { ...student, class: newName } : student));
              setAssignments(current => current.map(assignment => assignment.class === oldName ? { ...assignment, class: newName } : assignment));
              setQuizzes(current => current.map(quiz => quiz.class === oldName ? { ...quiz, class: newName } : quiz));
              setNotes(current => current.map(note => ({
                ...note,
                class: note.class === oldName ? newName : note.class,
                targetClasses: note.targetClasses?.map(className => className === oldName ? newName : className) || []
              })));
            }} /> }
            { activeTab === 'staff' && user.role === 'dos' && <StaffTab /> }
            { activeTab === 'courses' && user.role === 'dos' && <CoursesTab courses={courses} setCourses={setCourses} onCourseRenamed={(oldName, newName) => {
              setStudents(current => current.map(student => student.module === oldName ? { ...student, module: newName } : student));
              setAssignments(current => current.map(assignment => assignment.subject === oldName ? { ...assignment, subject: newName } : assignment));
              setQuizzes(current => current.map(quiz => quiz.subject === oldName ? { ...quiz, subject: newName } : quiz));
              setNotes(current => current.map(note => note.subject === oldName ? { ...note, subject: newName } : note));
            }} /> }
            { activeTab === 'events' && user.role === 'dos' && <EventsTab events={events} setEvents={setEvents} user={user} /> }
            { activeTab === 'site-editor' && user.role === 'dos' && <SiteEditorTab siteContent={siteContent} updateSiteContent={updateSiteContent} /> }
            { activeTab === 'analytics' && user.role === 'dos' && <AnalyticsTab students={students} assignments={assignments} quizzes={quizzes} notes={notes} /> }
            { activeTab === 'settings' && <LearningSettings user={user} views={dashboardTabs} /> }
            { activeTab === 'contact' && <LearningContact /> }
        </motion.div>
      </main>
      <LearningDashboardFooter user={user} onLogout={logout} onContact={() => setActiveTab('contact')} />
      </div>
      </div>
    </div>
  );
};

// --- TABS ---

const TeachingToolsTab = ({ onSelect }) => {
  const tools = [
    { id: 'exam-prep', label: 'Exam Preparator', description: 'Build a formal paper, choose one of 15 formats, and prepare its print header.', icon: Printer },
    { id: 'quizzes', label: 'Quizzes', description: 'Create timed quizzes for students to complete in the e-learning portal.', icon: CheckSquare },
    { id: 'assignments', label: 'Assignments', description: 'Post class work, add deadlines, and review submissions from your headed classes.', icon: FileText },
    { id: 'notes', label: 'Lessons & Resources', description: 'Upload and update your own teaching resources for selected classes or students.', icon: FileUp }
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-school-green">Teacher workspace</p>
        <h2 className="mt-2 text-3xl font-bold text-school-blue">Teaching Tools</h2>
        <p className="mt-2 text-sm text-slate-600">Choose a teaching task to continue.</p>
      </header>
      <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
        {tools.map(({ id, label, description, icon: Icon }) => (
          <button key={id} type="button" onClick={() => onSelect(id)} className="flex w-full items-center gap-4 px-4 py-5 text-left hover:bg-slate-50">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-school-blue/5 text-school-blue"><Icon size={20} /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-slate-900">{label}</span>
              <span className="mt-1 block text-sm text-slate-600">{description}</span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-slate-400" />
          </button>
        ))}
      </div>
    </div>
  );
};


const ClassesTab = ({ classes, setClasses, onClassRenamed }) => {
  const [newName, setNewName] = useState('');
  const [editingName, setEditingName] = useState('');
  const [editingClass, setEditingClass] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async (event) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    try {
      const created = await createSchoolClass(name);
      setClasses(current => [...new Set([...current, created])].sort());
      setNewName('');
      setError('');
    } catch (saveError) {
      setError(saveError.message || 'Could not add the class.');
    }
  };

  const handleRename = async (event) => {
    event.preventDefault();
    const name = editingName.trim();
    if (!name || !editingClass) return;
    try {
      await renameSchoolClass(editingClass, name);
      setClasses(current => [...new Set(current.map(item => item === editingClass ? name : item))].sort());
      onClassRenamed(editingClass, name);
      setEditingClass('');
      setEditingName('');
      setError('');
    } catch (saveError) {
      setError(saveError.message || 'Could not rename the class.');
    }
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Remove class "${name}"? Classes still used by students or learning records cannot be removed.`)) return;
    try {
      await deleteSchoolClass(name);
      setClasses(current => current.filter(item => item !== name));
      setError('');
    } catch (deleteError) {
      setError(deleteError.message || 'Could not remove the class. Reassign its records first.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-school-blue">Classes</h2>
        <p className="mt-1 text-sm text-slate-600">Classes are stored separately. Renaming updates enrolled students and their lessons, assignments, quizzes, and attendance.</p>
      </div>
      <form onSubmit={handleCreate} className="flex flex-col gap-3 border-y border-slate-200 bg-white py-4 sm:flex-row">
        <input value={newName} onChange={event => setNewName(event.target.value)} aria-label="New class name" placeholder="New class name" className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2"><Plus size={18} /> Add class</button>
      </form>
      {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
      <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
        {classes.map(name => (
          <div key={name} className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4">
            {editingClass === name ? (
              <form onSubmit={handleRename} className="flex min-w-0 flex-1 flex-wrap gap-2">
                <input autoFocus value={editingName} onChange={event => setEditingName(event.target.value)} aria-label={`Rename ${name}`} className="min-w-[12rem] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <button type="submit" className="font-semibold text-school-blue hover:text-school-green">Save</button>
                <button type="button" onClick={() => setEditingClass('')} className="font-medium text-slate-500 hover:text-slate-800">Cancel</button>
              </form>
            ) : (
              <>
                <span className="min-w-0 truncate text-sm font-medium text-slate-800">{name}</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => { setEditingClass(name); setEditingName(name); setError(''); }} className="font-semibold text-school-blue hover:text-school-green">Rename</button>
                  <button type="button" onClick={() => handleDelete(name)} aria-label={`Remove ${name}`} className="text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                </div>
              </>
            )}
          </div>
        ))}
        {classes.length === 0 && <p className="px-4 py-6 text-sm text-slate-500">No classes are registered yet.</p>}
      </div>
    </div>
  );
};

const CoursesTab = ({ courses, setCourses, onCourseRenamed }) => {
  const [newName, setNewName] = useState('');
  const [editingName, setEditingName] = useState('');
  const [editingCourse, setEditingCourse] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async (event) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    try {
      const created = await createSchoolCourse(name);
      setCourses(current => [...new Set([...current, created])].sort());
      setNewName('');
      setError('');
    } catch (saveError) {
      setError(saveError.message || 'Could not add the course.');
    }
  };

  const handleRename = async (event) => {
    event.preventDefault();
    const name = editingName.trim();
    if (!name || !editingCourse) return;
    try {
      await renameSchoolCourse(editingCourse, name);
      setCourses(current => [...new Set(current.map(item => item === editingCourse ? name : item))].sort());
      onCourseRenamed(editingCourse, name);
      setEditingCourse('');
      setEditingName('');
      setError('');
    } catch (saveError) {
      setError(saveError.message || 'Could not rename the course.');
    }
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Remove course "${name}"? Courses still used by students or learning records cannot be removed.`)) return;
    try {
      await deleteSchoolCourse(name);
      setCourses(current => current.filter(item => item !== name));
      setError('');
    } catch (deleteError) {
      setError(deleteError.message || 'Could not remove the course. Reassign its records first.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-school-blue">Courses</h2>
        <p className="mt-1 text-sm text-slate-600">Courses are managed independently from classes. Renaming updates existing student and learning records.</p>
      </div>
      <form onSubmit={handleCreate} className="flex flex-col gap-3 border-y border-slate-200 bg-white py-4 sm:flex-row">
        <input value={newName} onChange={event => setNewName(event.target.value)} aria-label="New course name" placeholder="New course name" className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2"><Plus size={18} /> Add course</button>
      </form>
      {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
      <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
        {courses.map(name => (
          <div key={name} className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4">
            {editingCourse === name ? (
              <form onSubmit={handleRename} className="flex min-w-0 flex-1 flex-wrap gap-2">
                <input autoFocus value={editingName} onChange={event => setEditingName(event.target.value)} aria-label={`Rename ${name}`} className="min-w-[12rem] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <button type="submit" className="font-semibold text-school-blue hover:text-school-green">Save</button>
                <button type="button" onClick={() => setEditingCourse('')} className="font-medium text-slate-500 hover:text-slate-800">Cancel</button>
              </form>
            ) : (
              <>
                <span className="min-w-0 truncate text-sm font-medium text-slate-800">{name}</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => { setEditingCourse(name); setEditingName(name); setError(''); }} className="font-semibold text-school-blue hover:text-school-green">Rename</button>
                  <button type="button" onClick={() => handleDelete(name)} aria-label={`Remove ${name}`} className="text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                </div>
              </>
            )}
          </div>
        ))}
        {courses.length === 0 && <p className="px-4 py-6 text-sm text-slate-500">No courses are registered yet.</p>}
      </div>
    </div>
  );
};

const AttendanceTab = ({ students, user, classGroups }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [statusByStudent, setStatusByStudent] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const classStudents = students.filter((student) => student.class === selectedClass);
  const availableGroups = classGroups.filter(group => group.options.length > 0);
  const noClassesAvailable = availableGroups.length === 0;

  useEffect(() => {
    if (!selectedClass) {
      setStatusByStudent({});
      return undefined;
    }

    let isActive = true;
    setIsLoading(true);
    setMessage('');
    const loadRegister = async () => {
      try {
        const records = isSupabaseConfigured
          ? await loadAttendanceRecords(attendanceDate, selectedClass)
          : JSON.parse(localStorage.getItem('attendance_db') || '[]').filter((record) =>
              record.attendanceDate === attendanceDate && record.class === selectedClass
            );
        if (isActive) setStatusByStudent(Object.fromEntries(records.map((record) => [record.studentId || record.student_id, record.status])));
      } catch (error) {
        if (isActive) setMessage(error.message || 'Could not load this attendance register.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadRegister();
    return () => { isActive = false; };
  }, [attendanceDate, selectedClass]);

  const handleSave = async () => {
    const records = classStudents
      .filter((student) => statusByStudent[student.id])
      .map((student) => ({
        id: `${attendanceDate}-${encodeURIComponent(selectedClass)}-${student.id}`,
        attendanceDate,
        session: 'Daily',
        class: selectedClass,
        studentId: student.id,
        studentRegNumber: student.regNumber,
        studentName: student.fullName || student.name,
        status: statusByStudent[student.id],
        note: ''
      }));

    if (records.length === 0) {
      setMessage('Mark at least one student before saving.');
      return;
    }

    setIsSaving(true);
    setMessage('');
    try {
      if (isSupabaseConfigured) {
        await saveAttendanceRecords(records, user);
      } else {
        const existing = JSON.parse(localStorage.getItem('attendance_db') || '[]');
        const recordIds = new Set(records.map((record) => record.id));
        localStorage.setItem('attendance_db', JSON.stringify([...existing.filter((record) => !recordIds.has(record.id)), ...records]));
      }
      setMessage(`Saved attendance for ${records.length} students.`);
    } catch (error) {
      setMessage(error.message || 'Could not save attendance.');
    } finally {
      setIsSaving(false);
    }
  };

  const markAllPresent = () => {
    setStatusByStudent(Object.fromEntries(classStudents.map((student) => [student.id, 'present'])));
  };

  const statusCounts = ['present', 'absent', 'late', 'excused'].map((status) => ({
    status,
    count: Object.values(statusByStudent).filter((value) => value === status).length
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-school-green">Daily register</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Attendance</h2>
          <p className="mt-1 text-sm text-slate-600">Mark attendance for any class.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {statusCounts.map(({ status, count }) => (
            <span key={status} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 capitalize text-slate-700">{status}: {count}</span>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_200px_auto] sm:items-end">
        <div className="min-w-0">
          <label htmlFor="attendance-class" className="mb-1.5 block text-sm font-semibold text-slate-700">Class</label>
          <select id="attendance-class" value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)} disabled={noClassesAvailable} className="w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500">
            <option value="">Choose a class</option>
            {classGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="attendance-date" className="mb-1.5 block text-sm font-semibold text-slate-700">Date</label>
          <input id="attendance-date" type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm" />
        </div>
        <button type="button" onClick={markAllPresent} disabled={!classStudents.length} className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Mark all present</button>
      </div>

      {message && <p role="status" className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</p>}
      {noClassesAvailable ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
          {user.role === 'teacher'
            ? 'You are not a class head yet. Ask the Director of Studies to assign you a class, or choose a class from the list above.'
            : 'No classes have been registered yet. Add classes before taking attendance.'}
        </p>
      ) : !selectedClass ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">Choose a class to open its register.</p>
      ) : isLoading ? (
        <p className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">Loading register...</p>
      ) : classStudents.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">No students are registered in this class.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="hidden grid-cols-[minmax(0,1fr)_140px_180px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 sm:grid">
            <span>Student</span><span>Reg. number</span><span>Status</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {classStudents.map((student) => (
              <li key={student.id} className="grid grid-cols-1 gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_140px_180px] sm:items-center sm:gap-4">
                <span className="font-semibold text-slate-900">{student.fullName || student.name}</span>
                <span className="text-sm text-slate-500">{student.regNumber}</span>
                <select aria-label={`Attendance status for ${student.fullName || student.name}`} value={statusByStudent[student.id] || ''} onChange={(event) => setStatusByStudent((current) => ({ ...current, [student.id]: event.target.value }))} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                  <option value="">Not marked</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <button type="button" onClick={handleSave} disabled={!selectedClass || isSaving || isLoading || !classStudents.length} className="w-full rounded-md bg-school-blue px-5 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
          {isSaving ? 'Saving...' : 'Save attendance'}
        </button>
      </div>
    </div>
  );
};

const OverviewTab = ({ students, assignments, quizzes, classes, headedClasses = [], isLoading }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-school-blue mb-8">Dashboard Overview</h2>
    {isLoading && (
      <p className="rounded-lg border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
        Loading your portal data...
      </p>
    )}
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div className="card border-t-4 border-t-school-blue">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-school-blue/10 text-school-blue rounded-xl"><Users size={32} /></div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Students</p>
            <h3 className="text-3xl font-black text-slate-800">{students.length}</h3>
          </div>
        </div>
      </div>
      <div className="card border-t-4 border-t-school-green">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-school-green/10 text-school-green rounded-xl"><FileText size={32} /></div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Assignments</p>
            <h3 className="text-3xl font-black text-slate-800">{assignments.length}</h3>
          </div>
        </div>
      </div>
      <div className="card border-t-4 border-t-purple-500">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-purple-500/10 text-purple-600 rounded-xl"><CheckSquare size={32} /></div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Quizzes</p>
            <h3 className="text-3xl font-black text-slate-800">{quizzes.length}</h3>
          </div>
        </div>
      </div>
      <div className="card border-t-4 border-t-slate-400">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-500/10 text-slate-600 rounded-xl"><BookOpen size={32} /></div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Registered Classes</p>
            <h3 className="text-3xl font-black text-slate-800">{classes.length}</h3>
          </div>
        </div>
      </div>
    </div>

    {!isLoading && students.length === 0 && assignments.length === 0 && quizzes.length === 0 && classes.length === 0 && (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
        <p className="font-semibold text-slate-700">No portal records yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
          Once classes, students and lessons are registered they will appear here. Use the sidebar to
          manage classes, students and staff.
        </p>
      </div>
    )}

    {!isLoading && classes.length > 0 && (
      <section className="card">
        <h3 className="text-lg font-bold text-school-blue">Registered classes</h3>
        <p className="mt-1 text-sm text-slate-600">
          {headedClasses.length
            ? `You are the class head for ${headedClasses.length} of these classes.`
            : 'Class head assignments are managed by the Director of Studies.'}
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map(name => (
            <li key={name} className="flex items-center justify-between gap-3 rounded border border-slate-200 px-3 py-2 text-sm">
              <span className="font-medium text-slate-700">{name}</span>
              {headedClasses.includes(name) && (
                <span className="rounded-full bg-school-green/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-school-green">
                  Class head
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    )}
  </div>
);

const StudentsTab = ({ students, setStudents, classGroups, courses }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState(() => ({ fullName: '', class: 'Senior 1', module: 'BIO', startYear: new Date().getFullYear() }));
  const registrationPreview = generateStudentRegistrationNumber(formData.fullName, formData.startYear, students);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (isSupabaseConfigured) {
      try {
        const result = await provisionAccount({
          type: 'student',
          fullName: formData.fullName,
          startYear: formData.startYear,
          class: formData.class,
          module: formData.module
        });
        const newStudent = { ...mapSupabaseProfile(result.profile), password: result.password };
        setStudents(current => [...current, newStudent]);
        setShowAdd(false);
        setFormData({ fullName: '', class: 'Senior 1', module: 'BIO', startYear: new Date().getFullYear() });
      } catch (error) {
        alert(error.message || 'Could not register the student.');
      }
      return;
    }

    const regNumber = generateStudentRegistrationNumber(formData.fullName, formData.startYear, students);
    if (!regNumber) {
      alert('No two-digit registration sequence is available for this name and enrollment year.');
      return;
    }
    const password = `ESR/${regNumber}`;
    const newStudent = { ...formData, regNumber, password, id: Date.now().toString() };
    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem('students_db', JSON.stringify(updated));
    saveFirestoreDocument('students', newStudent).catch((error) => console.error('Failed to sync student to Firebase', error));
    setShowAdd(false);
    setFormData({ fullName: '', class: 'Senior 1', module: 'BIO', startYear: new Date().getFullYear() });
  };

  const handleDelete = async (id) => {
    if (isSupabaseConfigured) {
      try {
        await deleteProvisionedAccount(id);
        setStudents(current => current.filter(student => student.id !== id));
      } catch (error) {
        alert(error.message || 'Could not remove the student.');
      }
      return;
    }

    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    localStorage.setItem('students_db', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-school-blue">Student Management</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-secondary flex items-center gap-2">
          {showAdd ? <X size={20} /> : <Plus size={20} />} {showAdd ? 'Cancel' : 'Add Student'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="card bg-white p-6 mb-8 border-2 border-school-green/20">
          <h3 className="text-xl font-bold mb-4">Register New Student</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full border border-slate-300 rounded-md p-2" placeholder="e.g. Jean Nsengiyumva" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year Started at ES RUNABA</label>
              <input required type="number" min="1900" max={new Date().getFullYear()} value={formData.startYear} onChange={e => setFormData({...formData, startYear: Number(e.target.value)})} className="w-full border border-slate-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
              <select value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full border border-slate-300 rounded-md p-2">
                {classGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((classOption) => (
                      <option key={classOption.value} value={classOption.value}>{classOption.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Module / Subject Code</label>
              <select required value={formData.module} onChange={e => setFormData({...formData, module: e.target.value})} className="w-full border border-slate-300 rounded-md p-2">
                <option value="">Select course</option>
                {courses.map(course => <option key={course} value={course}>{course}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              Registration number: <span className="font-bold text-school-blue">{registrationPreview || 'Enter a name to preview'}</span>
            </div>
            <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              The student password will be generated automatically from the registration number.
            </div>
          </div>
          <button type="submit" className="btn-primary mt-4 flex items-center gap-2"><Save size={18} /> Save Student</button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-medium text-sm border-b border-slate-200">
              <th className="p-4">Reg Number</th>
              <th className="p-4">Name</th>
              <th className="p-4">Class</th>
              <th className="p-4">Password</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (<tr><td colSpan="5" className="p-8 text-center text-slate-500">No students registered yet.</td></tr>) : null}
            {students.map(s => (
              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 text-sm font-bold text-school-blue">{s.regNumber}</td>
                <td className="p-4 font-medium text-slate-800">{s.fullName}</td>
                <td className="p-4 text-slate-600">{s.class}</td>
                <td className="p-4 text-sm text-slate-500">{s.password || (isSupabaseConfigured ? 'Supabase Auth' : '')}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AssignmentsTab = ({ assignments, setAssignments, submissions, students, headedClasses, canManage, user, classGroups, courses, onBack }) => {
   const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ title: '', class: 'Senior 4 Stream 1', subject: '', description: '', dueDate: '' });
  const [downloadingSubmission, setDownloadingSubmission] = useState('');

  const openStudentWork = async (submission) => {
    setDownloadingSubmission(submission.id);
    try {
      const url = submission.filePath?.startsWith('data:') ? submission.filePath : await getStudentWorkUrl(submission.filePath);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      window.alert(error.message || 'Could not open the student submission.');
    } finally {
      setDownloadingSubmission('');
    }
  };

   const handleAdd = async (e) => {
    e.preventDefault();
    const newAssignment = { ...formData, id: Date.now().toString(), createdBy: user.id };
    if (isSupabaseConfigured) {
      try {
        const savedAssignment = await saveLearningRecord('assignments', newAssignment, user);
        setAssignments(current => [...current, savedAssignment]);
        setShowAdd(false);
        setFormData({ title: '', class: 'Senior 4 Stream 1', subject: '', description: '', dueDate: '' });
      } catch (error) {
        alert(error.message || 'Could not save the assignment.');
      }
      return;
    }

    const updated = [...assignments, newAssignment];
    setAssignments(updated);
    localStorage.setItem('assignments_db', JSON.stringify(updated));
    setShowAdd(false);
    setFormData({ title: '', class: 'Senior 4 Stream 1', subject: '', description: '', dueDate: '' });
   };

   const handleDelete = async (id) => {
    if (isSupabaseConfigured) {
      try {
        await deleteLearningRecord('assignments', id);
        setAssignments(current => current.filter(assignment => assignment.id !== id));
      } catch (error) {
        alert(error.message || 'Could not remove the assignment.');
      }
      return;
    }

    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);
    localStorage.setItem('assignments_db', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          {onBack && <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-school-blue hover:text-school-green"><ArrowLeft size={16} /> Back to Tools</button>}
          <h2 className="text-3xl font-bold text-school-blue">Assignments</h2>
        </div>
        {canManage && <button onClick={() => setShowAdd(!showAdd)} className="btn-secondary flex items-center gap-2">
          {showAdd ? <X size={20} /> : <Plus size={20} />} {showAdd ? 'Cancel' : 'Create Assignment'}
        </button>}
      </div>

       {showAdd && canManage && (
        <form onSubmit={handleAdd} className="card bg-white p-6 mb-8 border-2 border-school-blue/20">
          <h3 className="text-xl font-bold mb-4">New Assignment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <select required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full border border-slate-300 rounded-md p-2">
                <option value="">Select course</option>
                {courses.map(course => <option key={course} value={course}>{course}</option>)}
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Class</label>
              <select value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full border border-slate-300 rounded-md p-2">
                {classGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((classOption) => (
                      <option key={classOption.value} value={classOption.value}>{classOption.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input required type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full border border-slate-300 rounded-md p-2" />
            </div>
            <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Description / Instructions</label>
                 <textarea required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-300 rounded-md p-2"></textarea>
            </div>
          </div>
          <button type="submit" className="btn-primary mt-4 flex items-center gap-2"><Save size={18} /> Post Assignment</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.length === 0 && <p className="text-slate-500">No assignments created yet.</p>}
          {assignments.map(a => (
              <div key={a.id} className="card relative border-l-4 border-l-school-blue">
                  {canManage && <button onClick={() => handleDelete(a.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>}
                  <h3 className="font-bold text-lg">{a.title}</h3>
                  <div className="flex gap-2 text-xs font-semibold mt-2 mb-3">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">{a.subject}</span>
                      <span className="bg-school-green/10 text-school-green px-2 py-1 rounded">{a.class}</span>
                  </div>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{a.description}</p>
                  <p className="text-xs font-bold text-red-500">Due: {a.dueDate}</p>
                  {(user.role === 'dos' || headedClasses.includes(a.class)) && (
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Student submissions</p>
                      {submissions.filter(submission => submission.assignmentId === a.id).length === 0 ? (
                        <p className="text-xs text-slate-500">No work submitted yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          {submissions.filter(submission => submission.assignmentId === a.id).map(submission => {
                            const student = students.find(record => record.regNumber === submission.studentId);
                            return (
                              <li key={submission.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-800">{student?.fullName || submission.studentId}</p>
                                  <p className="truncate text-xs text-slate-500">{submission.fileName || 'Legacy submission'}{submission.fileType ? ` Â· ${submission.fileType}` : ''}</p>
                                </div>
                                {submission.filePath && <button type="button" onClick={() => openStudentWork(submission)} disabled={downloadingSubmission === submission.id} className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-school-blue hover:text-school-green disabled:opacity-50">
                                  <Download size={15} /> {downloadingSubmission === submission.id ? 'Opening...' : 'Open work'}
                                </button>}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
              </div>
          ))}
      </div>
    </div>
  );
};

const createQuizDraft = (schoolName = 'ES RUNABA', assessmentType = 'exam') => ({
  title: '',
  class: 'Senior 4 Stream 1',
  subject: '',
  deadline: '',
  paperSettings: {
    assessmentType,
    ministry: 'MINISTRY OF EDUCATION',
    district: 'BURERA DISTRICT',
    schoolName: schoolName || 'ES RUNABA',
    examFormat: 'standard',
    academicYear: String(new Date().getFullYear()),
    term: '',
    venue: '',
    instructions: 'Answer all questions. Read each section carefully and show your work where needed.',
  }
});

const QuizzesTab = ({ mode = 'quiz', quizzes, setQuizzes, canManage, user, classGroups, courses, schoolName, onBack }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState(() => createQuizDraft(schoolName, mode));
  const [question, setQuestion] = useState({ type: 'radio', section: 'Section A - General', duration: 60, q: '', opt1: '', opt2: '', opt3: '', opt4: '', correct: 'opt1', points: 1 });
  const [questions, setQuestions] = useState([]);
  const visibleAssessments = quizzes.filter(quiz => (quiz.paperSettings?.assessmentType || 'quiz') === mode);

  const updatePaperSetting = (field, value) => setFormData(current => ({
    ...current,
    paperSettings: { ...current.paperSettings, [field]: value }
  }));

  const handleExamFormatChange = (formatId) => {
    const format = examPaperFormats.find(item => item.id === formatId) || examPaperFormats[0];
    setFormData(current => ({
      ...current,
      paperSettings: {
        ...current.paperSettings,
        examFormat: format.id,
        instructions: format.instructions
      }
    }));
  };

  const addQuestion = (e) => {
      e.preventDefault();
      // Basic validation for short answer
      if (question.type === 'short_answer' && !question.correct) {
          return alert("Short Answer requires an exact correct answer for auto-grading.");
      }
      setQuestions([...questions, { ...question, id: Date.now().toString() }]);
      setQuestion({ ...question, type: 'radio', q: '', opt1: '', opt2: '', opt3: '', opt4: '', correct: 'opt1', points: 1 });
  };

  const handleCreateQuiz = async () => {
      if(questions.length === 0) return alert("Add at least one question.");
      const newQuiz = { ...formData, paperSettings: { ...formData.paperSettings, assessmentType: mode }, questions, id: Date.now().toString(), createdBy: user.id };
      if (isSupabaseConfigured) {
        try {
          const savedQuiz = await saveLearningRecord('quizzes', newQuiz, user);
          setQuizzes(current => [...current, savedQuiz]);
        } catch (error) {
          alert(error.message || 'Could not save the quiz.');
          return;
        }
      } else {
      const updated = [...quizzes, newQuiz];
      setQuizzes(updated);
      localStorage.setItem('quizzes_db', JSON.stringify(updated));
      }
      setShowAdd(false);
      setFormData(createQuizDraft(schoolName, mode));
      setQuestions([]);
  };

  const handleDelete = async (id) => {
    if (isSupabaseConfigured) {
      try {
        await deleteLearningRecord('quizzes', id);
        setQuizzes(current => current.filter(quiz => quiz.id !== id));
      } catch (error) {
        alert(error.message || 'Could not remove the quiz.');
      }
      return;
    }

    const updated = quizzes.filter(q => q.id !== id);
    setQuizzes(updated);
    localStorage.setItem('quizzes_db', JSON.stringify(updated));
  }


  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            {onBack && <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-school-blue hover:text-school-green"><ArrowLeft size={16} /> Back to Tools</button>}
            <h2 className="text-3xl font-bold text-school-blue">{mode === 'exam' ? 'Exam Preparator' : 'Quizzes'}</h2>
          </div>
          {canManage && <button onClick={() => setShowAdd(!showAdd)} className="btn-secondary flex items-center gap-2">
            {showAdd ? <X size={20} /> : <Plus size={20} />} {showAdd ? 'Cancel' : mode === 'exam' ? 'Prepare Exam' : 'Create Quiz'}
          </button>}
        </div>

        {showAdd && canManage && (
            <div className="card bg-white p-6 mb-8 border-2 border-purple-500/20">
          <h3 className="text-xl font-bold mb-4 text-purple-700">{mode === 'exam' ? 'Exam Paper Builder' : 'Quiz Builder'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <input type="text" placeholder="Exam Title" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="border p-2 rounded" />
                    <select required value={formData.subject} onChange={e=>setFormData({...formData, subject: e.target.value})} className="border p-2 rounded">
                      <option value="">Select course</option>
                      {courses.map(course => <option key={course} value={course}>{course}</option>)}
                    </select>
                    <select value={formData.class} onChange={e=>setFormData({...formData, class: e.target.value})} className="border p-2 rounded">
                        {classGroups.map((group) => (
                          <optgroup key={group.label} label={group.label}>
                            {group.options.map((classOption) => (
                              <option key={classOption.value} value={classOption.value}>{classOption.label}</option>
                            ))}
                          </optgroup>
                        ))}
                    </select>
                    <label className="text-xs font-semibold text-slate-600">Deadline
                      <input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} className="mt-1 w-full border p-2 rounded text-sm" />
                    </label>
                </div>

                {mode === 'exam' && <details open className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
                  <summary className="cursor-pointer font-bold text-slate-800">Exam header and paper format</summary>
                  <p className="mt-2 text-xs text-slate-500">Choose a paper format and review the official header before publishing. The logo prints as a watermark; no separate cover page is added.</p>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Exam format
                      <select value={formData.paperSettings.examFormat} onChange={event => handleExamFormatChange(event.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm">
                        {examPaperFormats.map(format => <option key={format.id} value={format.id}>{format.label}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-semibold text-slate-600">Ministry header<input value={formData.paperSettings.ministry} onChange={event => updatePaperSetting('ministry', event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" /></label>
                    <label className="text-xs font-semibold text-slate-600">District<input value={formData.paperSettings.district} onChange={event => updatePaperSetting('district', event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" /></label>
                    <label className="text-xs font-semibold text-slate-600">School name<input value={formData.paperSettings.schoolName} onChange={event => updatePaperSetting('schoolName', event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" /></label>
                    <label className="text-xs font-semibold text-slate-600">Academic year<input value={formData.paperSettings.academicYear} onChange={event => updatePaperSetting('academicYear', event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" /></label>
                    <label className="text-xs font-semibold text-slate-600">Term<input value={formData.paperSettings.term} onChange={event => updatePaperSetting('term', event.target.value)} placeholder="e.g. Term I" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" /></label>
                    <label className="text-xs font-semibold text-slate-600">Examination venue<input value={formData.paperSettings.venue} onChange={event => updatePaperSetting('venue', event.target.value)} placeholder="e.g. ES RUNABA Examination Hall" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" /></label>
                    <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Instructions<textarea rows="2" value={formData.paperSettings.instructions} onChange={event => updatePaperSetting('instructions', event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" /></label>
                  </div>
                  <p className="mt-4 text-xs font-semibold text-school-green">The ES RUNABA logo will be printed as a watermark.</p>
                </details>}

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-slate-700">Add Question</h4>
                        <select value={question.type} onChange={e=>setQuestion({...question, type: e.target.value, correct: e.target.value === 'radio' ? 'opt1' : ''})} className="border p-1 rounded text-sm bg-white font-bold text-purple-600 border-purple-200">
                            <option value="radio">Multiple Choice</option>
                            <option value="short_answer">Short Answer</option>
                            <option value="essay">Essay</option>
                        </select>
                    </div>
                    <form onSubmit={addQuestion} className="space-y-3">
                        <div className="flex gap-2 text-sm bg-purple-50 p-2 rounded border border-purple-100">
                             <input required type="text" placeholder="Section Name (e.g. Section A)" value={question.section} onChange={e=>setQuestion({...question, section: e.target.value})} className="flex-1 border p-1.5 rounded" />
                             <input required type="number" min="5" placeholder="Seconds" value={question.duration} onChange={e=>setQuestion({...question, duration: parseInt(e.target.value) || 60})} className="w-24 border p-1.5 rounded text-center" title="Time Limit (Seconds)" />
                        </div>
                        <div className="flex gap-2">
                             <input required type="text" placeholder="Question Text" value={question.q} onChange={e=>setQuestion({...question, q: e.target.value})} className="flex-1 border p-2 rounded" />
                             <input required type="number" min="1" placeholder="Pts" value={question.points} onChange={e=>setQuestion({...question, points: parseInt(e.target.value) || 1})} className="w-16 border p-2 rounded text-center" title="Points" />
                        </div>
                        
                        {question.type === 'radio' && (
                            <>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <input required type="text" placeholder="Option 1" value={question.opt1} onChange={e=>setQuestion({...question, opt1: e.target.value})} className="border p-2 rounded" />
                                    <input required type="text" placeholder="Option 2" value={question.opt2} onChange={e=>setQuestion({...question, opt2: e.target.value})} className="border p-2 rounded" />
                                    <input required type="text" placeholder="Option 3" value={question.opt3} onChange={e=>setQuestion({...question, opt3: e.target.value})} className="border p-2 rounded" />
                                    <input required type="text" placeholder="Option 4" value={question.opt4} onChange={e=>setQuestion({...question, opt4: e.target.value})} className="border p-2 rounded" />
                                </div>
                                <div className="flex items-center gap-4 mt-2">
                                     <label className="text-sm font-bold">Correct Answer:</label>
                                     <select value={question.correct} onChange={e=>setQuestion({...question, correct: e.target.value})} className="border p-1 rounded text-sm">
                                        <option value="opt1">Option 1</option><option value="opt2">Option 2</option>
                                        <option value="opt3">Option 3</option><option value="opt4">Option 4</option>
                                     </select>
                                </div>
                            </>
                        )}
                        {question.type === 'short_answer' && (
                             <input required type="text" placeholder="Exact Correct Answer" value={question.correct} onChange={e=>setQuestion({...question, correct: e.target.value})} className="w-full border p-2 rounded text-sm border-green-300 bg-green-50" />
                        )}
                        {question.type === 'essay' && (
                            <p className="text-xs text-slate-500 italic border-l-2 border-slate-300 pl-2">Essay questions are evaluated manually and will be marked "Pending Review" on auto-submission.</p>
                        )}
                        
                        <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded font-bold w-full mt-2 hover:bg-slate-700">Add {question.type === 'essay' ? 'Essay' : 'Question'} to Exam</button>
                    </form>
                </div>

                <div className="mt-4">
                    <p className="text-sm font-bold text-slate-500 mb-2">{questions.length} Questions Added</p>
                    <button onClick={handleCreateQuiz} disabled={!formData.title || questions.length===0} className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">{mode === 'exam' ? 'Publish Exam Paper' : 'Save & Publish Quiz'}</button>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleAssessments.length === 0 && <p className="text-slate-500">{mode === 'exam' ? 'No exam papers prepared yet.' : 'No quizzes created yet.'}</p>}
            {visibleAssessments.map(q => (
                <div key={q.id} className="card relative border-t-4 border-t-purple-500">
                    <div className="absolute top-4 right-4 flex items-center gap-3">
                      <button type="button" onClick={() => printQuiz(q, schoolName || 'ES RUNABA', { includeAnswerKey: localStorage.getItem(`es_runaba_include_answer_key_${user.id}`) === 'true', preparationPlace: localStorage.getItem(`es_runaba_exam_preparation_place_${user.id}`) || '', paperSettings: q.paperSettings || {} })} aria-label={`Print ${q.title}`} title="Print or save exam as PDF" className="text-school-blue hover:text-school-green"><Printer size={18} /></button>
                      {canManage && <button type="button" onClick={() => handleDelete(q.id)} aria-label={`Delete ${q.title}`} className="text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>}
                    </div>
                    <h3 className="font-bold text-lg">{q.title}</h3>
                    <div className="flex gap-2 text-xs font-semibold mt-2 mb-3">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">{q.subject}</span>
                        <span className="bg-purple-500/10 text-purple-600 px-2 py-1 rounded">{q.class}</span>
                        <span className="bg-slate-800 text-white px-2 py-1 rounded">{q.questions.length} Qs</span>
                        {q.deadline && <span className="bg-red-50 text-red-700 px-2 py-1 rounded">Until {q.deadline}</span>}
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">Strict Paging</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
  );
}

const NotesTab = ({ notes, setNotes, canManage, user, students, classGroups, courses, onBack }) => {
    const [showAdd, setShowAdd] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
    const [formData, setFormData] = useState({ title: '', class: 'Senior 4 Stream 1', subject: '', description: '', targetClasses: ['Senior 4 Stream 1'], targetStudentIds: [] });
    const [fileData, setFileData] = useState(null);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const [studentSearch, setStudentSearch] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

           const maximumSize = isSupabaseConfigured ? 25 * 1024 * 1024 : 1.5 * 1024 * 1024;
           if (file.size > maximumSize) {
             setError(`File is too large. Maximum size is ${isSupabaseConfigured ? '25 MB' : '1.5 MB in demo mode'}.`);
             setFileData(null);
             setFileName('');
             return;
        }
        setError('');
        setFileName(file.name);

        if (isSupabaseConfigured) {
          setFileData(file);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFileData(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const resetEditor = () => {
        setShowAdd(false);
        setEditingNote(null);
        setFormData({ title: '', class: 'Senior 4 Stream 1', subject: '', description: '', targetClasses: ['Senior 4 Stream 1'], targetStudentIds: [] });
        setFileData(null);
        setFileName('');
        setStudentSearch('');
        setError('');
    };

    const handleEdit = (note) => {
        setEditingNote(note);
        setShowAdd(true);
        setFormData({
            title: note.title || '',
            class: note.class || 'Senior 4 Stream 1',
            subject: note.subject || '',
            description: note.description || '',
            targetClasses: note.targetClasses?.length ? note.targetClasses : (note.targetStudentIds?.length ? [] : [note.class]),
            targetStudentIds: note.targetStudentIds || []
        });
        setFileData(null);
        setFileName(note.fileName || '');
        setStudentSearch('');
        setError('');
    };

      const openNewNote = () => {
        setEditingNote(null);
        setFormData({ title: '', class: 'Senior 4 Stream 1', subject: '', description: '', targetClasses: ['Senior 4 Stream 1'], targetStudentIds: [] });
        setFileData(null);
        setFileName('');
        setStudentSearch('');
        setError('');
        setShowAdd(true);
      };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!fileData && !editingNote) return alert("Please select a valid file under 1.5MB");

      if (isSupabaseConfigured) {
        const noteId = editingNote?.id || Date.now().toString();
        let uploadedFilePath = '';
        let newUploadPath = '';
        try {
          uploadedFilePath = editingNote?.filePath || '';
          if (fileData) {
            const uploadId = editingNote ? `${noteId}-${Date.now()}` : noteId;
            newUploadPath = await uploadLearningNote(fileData, formData.targetClasses[0] || 'selected-students', uploadId, user.id);
            uploadedFilePath = newUploadPath;
          }
          const savedNote = await saveLearningRecord('notes', {
            ...formData,
            class: formData.targetClasses[0] || 'Selected students',
            id: noteId,
            fileName: fileData ? fileName : editingNote.fileName,
            filePath: uploadedFilePath,
            datePosted: editingNote?.datePosted || new Date().toLocaleDateString()
          }, user);
          setNotes(current => editingNote
            ? current.map(note => note.id === editingNote.id ? savedNote : note)
            : [...current, savedNote]);
          if (newUploadPath && editingNote?.filePath && editingNote.filePath !== newUploadPath) {
            await removeLearningNoteFile(editingNote.filePath).catch(() => {});
          }
          resetEditor();
        } catch (uploadError) {
          if (newUploadPath) await removeLearningNoteFile(newUploadPath).catch(() => {});
          alert(uploadError.message || 'Could not save the note.');
        }
        return;
      }

        const newNote = {
            ...editingNote,
            id: editingNote?.id || Date.now().toString(),
            title: formData.title,
            subject: formData.subject,
            class: formData.targetClasses[0] || 'Selected students',
            description: formData.description,
            targetClasses: formData.targetClasses,
            targetStudentIds: formData.targetStudentIds,
            fileName: fileData ? fileName : editingNote?.fileName || fileName,
            fileData: fileData || editingNote?.fileData,
            createdBy: editingNote?.createdBy || user.id,
            datePosted: editingNote?.datePosted || new Date().toLocaleDateString()
        };

        const updated = editingNote
            ? notes.map(note => note.id === editingNote.id ? newNote : note)
            : [...notes, newNote];
        try {
            localStorage.setItem('notes_db', JSON.stringify(updated));
            setNotes(updated);
            resetEditor();
        } catch (err) {
            alert("Storage quota exceeded! The file might be too large for local storage.");
        }
    };

    const handleDelete = async (id) => {
      if (isSupabaseConfigured) {
        const note = notes.find(item => item.id === id);
        try {
          await removeLearningNoteFile(note?.filePath);
          await deleteLearningRecord('notes', id);
          setNotes(current => current.filter(item => item.id !== id));
        } catch (error) {
          alert(error.message || 'Could not remove the note.');
        }
        return;
      }

        const updated = notes.filter(n => n.id !== id);
        setNotes(updated);
        localStorage.setItem('notes_db', JSON.stringify(updated));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                  {onBack && <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-school-blue hover:text-school-green"><ArrowLeft size={16} /> Back to Tools</button>}
                  <h2 className="text-3xl font-bold text-school-blue">Lessons & Resources</h2>
                </div>
                {canManage && <button type="button" onClick={showAdd ? resetEditor : openNewNote} className="btn-secondary flex items-center gap-2">
                  {showAdd ? <X size={20} /> : <Plus size={20} />} {showAdd ? 'Cancel' : user.role === 'dos' ? 'Add Lesson' : 'Upload File'}
                </button>}
            </div>

            {showAdd && canManage && (
                <form onSubmit={handleAdd} className="card bg-white p-6 mb-8 border-2 border-school-blue/20">
                    <h3 className="text-xl font-bold mb-4">{editingNote ? 'Update Lesson' : user.role === 'dos' ? 'Add Lesson' : 'Upload New Material'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-300 rounded-md p-2" placeholder="e.g. Chapter 1 Notes" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <select required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full border border-slate-300 rounded-md p-2">
                              <option value="">Select course</option>
                              {courses.map(course => <option key={course} value={course}>{course}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <label className="block text-sm font-medium text-slate-700">Target Classes</label>
                              <p className="text-xs text-slate-500">Choose one or more classes for this lesson.</p>
                            </div>
                            <div className="flex gap-3 text-sm">
                              <button type="button" onClick={() => setFormData(current => ({ ...current, targetClasses: classGroups.flatMap(group => group.options.map(classOption => classOption.value)) }))} className="font-medium text-school-blue hover:text-school-green">Select all</button>
                              <button type="button" onClick={() => setFormData(current => ({ ...current, targetClasses: [] }))} className="font-medium text-slate-500 hover:text-slate-800">Clear</button>
                            </div>
                          </div>
                          <div className="grid max-h-56 grid-cols-1 gap-3 overflow-y-auto rounded-md border border-slate-200 bg-white p-3 sm:grid-cols-2">
                            {classGroups.map(group => (
                              <fieldset key={group.label} className="space-y-1">
                                <legend className="mb-1 text-xs font-bold uppercase text-slate-500">{group.label}</legend>
                                {group.options.map(classOption => (
                                  <label key={classOption.value} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-sm hover:bg-slate-50">
                                    <input
                                      type="checkbox"
                                      checked={formData.targetClasses.includes(classOption.value)}
                                      onChange={event => setFormData(current => ({
                                        ...current,
                                        targetClasses: event.target.checked
                                          ? [...current.targetClasses, classOption.value]
                                          : current.targetClasses.filter(className => className !== classOption.value)
                                      }))}
                                    />
                                    {classOption.label}
                                  </label>
                                ))}
                              </fieldset>
                            ))}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Assign to specific students (optional)</label>
                            <input
                                type="search"
                                value={studentSearch}
                                onChange={e => setStudentSearch(e.target.value)}
                                placeholder="Search by student, registration number, or class"
                                className="mb-2 w-full border border-slate-300 rounded-md p-2"
                            />
                            <div className="max-h-56 overflow-y-auto rounded-md border border-slate-200 bg-white p-2">
                                {students
                                  .filter(student => `${student.fullName || student.name || ''} ${student.regNumber || ''} ${student.class || ''}`.toLowerCase().includes(studentSearch.trim().toLowerCase()))
                                  .map(student => (
                                    <label key={student.id} className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 text-sm hover:bg-slate-50">
                                      <input
                                        type="checkbox"
                                        checked={formData.targetStudentIds.includes(student.id)}
                                        onChange={event => setFormData(current => ({
                                          ...current,
                                          targetStudentIds: event.target.checked
                                            ? [...current.targetStudentIds, student.id]
                                            : current.targetStudentIds.filter(id => id !== student.id)
                                        }))}
                                      />
                                      <span className="min-w-0 flex-1 truncate">{student.fullName || student.name} <span className="text-slate-500">({student.class})</span></span>
                                      <span className="shrink-0 text-xs text-slate-500">{student.regNumber}</span>
                                    </label>
                                  ))}
                                {students.length === 0 && <p className="px-2 py-3 text-sm text-slate-500">Add students first to assign this lesson individually.</p>}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{formData.targetClasses.length || formData.targetStudentIds.length ? `Selected ${formData.targetClasses.length} class${formData.targetClasses.length === 1 ? '' : 'es'} and ${formData.targetStudentIds.length} individual student${formData.targetStudentIds.length === 1 ? '' : 's'}.` : 'Select at least one class or student.'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">File (any format) - Max {isSupabaseConfigured ? '25 MB' : '1.5 MB in demo mode'}</label>
                            {editingNote && <p className="mb-1 text-xs text-slate-500">Current file: {editingNote.fileName}. Select a file only to replace it.</p>}
                              <input required={!editingNote} type="file" onChange={handleFileChange} className="w-full border border-slate-300 rounded-md p-1.5 text-sm" />
                            {error && <p className="text-red-500 text-xs mt-1 font-bold">{error}</p>}
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                             <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-300 rounded-md p-2"></textarea>
                        </div>
                    </div>
                    <button type="submit" disabled={(!fileData && !editingNote) || error || (!formData.targetClasses.length && !formData.targetStudentIds.length)} className="btn-primary mt-4 flex items-center gap-2 disabled:opacity-50"><FileUp size={18} /> {editingNote ? 'Save Changes' : user.role === 'dos' ? 'Add Lesson' : 'Upload Resource'}</button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.length === 0 && <p className="text-slate-500">No notes uploaded yet.</p>}
                {notes.map(n => (
                    <div key={n.id} className="card relative border-t-4 border-t-blue-500 flex flex-col">
                        <div className="absolute right-4 top-4 flex gap-2">
                          {canManage && <button type="button" onClick={() => handleEdit(n)} className="inline-flex items-center gap-1 text-sm font-semibold text-school-blue hover:text-school-green" title="Edit lesson"><Edit3 size={16} /> Edit</button>}
                          {canManage && <button type="button" onClick={() => handleDelete(n.id)} className="text-slate-400 hover:text-red-500" title="Delete lesson"><Trash2 size={18}/></button>}
                        </div>
                        <h3 className="font-bold text-lg mb-1">{n.title}</h3>
                        <div className="flex gap-2 text-xs font-semibold mb-3">
                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">{n.subject}</span>
                            <span title={n.targetClasses?.join(', ')} className="max-w-full truncate bg-blue-500/10 px-2 py-1 text-blue-600 rounded">{n.targetClasses?.length ? `${n.targetClasses.join(', ')}${n.targetStudentIds?.length ? ` + ${n.targetStudentIds.length} students` : ''}` : n.targetStudentIds?.length ? `${n.targetStudentIds.length} selected students` : n.class}</span>
                        </div>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{n.description}</p>
                        
                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-400 flex items-center gap-1"><FileText size={14}/> {n.fileName}</span>
                            <a href={n.fileData} download={n.fileName} className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-lg" title="Download">
                                <Download size={18} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EventsTab = ({ events, setEvents, user }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ date: '', title: '', loc: '', desc: '' });

  const handleAdd = async (e) => {
    e.preventDefault();
    const newEvent = { ...formData, id: Date.now().toString() };
    if (isSupabaseConfigured) {
      try {
        await saveSchoolEvent(newEvent, user);
        setEvents(current => [...current, newEvent]);
        setShowAdd(false);
        setFormData({ date: '', title: '', loc: '', desc: '' });
      } catch (error) {
        alert(error.message || 'Could not save the event.');
      }
      return;
    }

    const updated = [...events, newEvent];
    setEvents(updated);
    localStorage.setItem('events_db', JSON.stringify(updated));
    setShowAdd(false);
    setFormData({ date: '', title: '', loc: '', desc: '' });
  };

  const handleDelete = async (id) => {
    if (isSupabaseConfigured) {
      try {
        await deleteSchoolEvent(id);
        setEvents(current => current.filter(event => event.id !== id));
      } catch (error) {
        alert(error.message || 'Could not remove the event.');
      }
      return;
    }

    const updated = events.filter(ev => ev.id !== id);
    setEvents(updated);
    localStorage.setItem('events_db', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-school-blue">Upcoming Events</h2>
          <p className="text-slate-500 text-sm mt-1">These events appear on the School Life page for all visitors.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-secondary flex items-center gap-2">
          {showAdd ? <X size={20} /> : <Plus size={20} />} {showAdd ? 'Cancel' : 'Add Event'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="card bg-white p-6 mb-8 border-2 border-school-green/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><CalendarDays size={20} className="text-school-green" /> New Event</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date (e.g. 15 Aug)</label>
              <input required type="text" placeholder="e.g. 15 Aug" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border border-slate-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
              <input required type="text" placeholder="e.g. End of Term Ceremony" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input required type="text" placeholder="e.g. School Assembly Ground" value={formData.loc} onChange={e => setFormData({...formData, loc: e.target.value})} className="w-full border border-slate-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input required type="text" placeholder="Brief description of the event" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full border border-slate-300 rounded-md p-2" />
            </div>
          </div>
          <button type="submit" className="btn-primary mt-4 flex items-center gap-2"><Save size={18} /> Publish Event</button>
        </form>
      )}

      <div className="space-y-4">
        {events.length === 0 && <p className="text-slate-500 italic">No events scheduled yet. Click "Add Event" to create one.</p>}
        {events.map(ev => (
          <div key={ev.id} className="flex items-center gap-6 p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-school-blue text-white w-20 h-20 rounded-xl flex flex-col items-center justify-center shrink-0 shadow">
              <span className="text-2xl font-black leading-none">{ev.date.split(' ')[0]}</span>
              <span className="text-xs uppercase font-bold text-school-green mt-1 tracking-widest">{ev.date.split(' ')[1] || ''}</span>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-slate-800">{ev.title}</h4>
              <p className="text-slate-500 text-sm mt-1">{ev.desc}</p>
              <span className="text-xs font-bold text-school-blue mt-2 block">ðŸ“ {ev.loc}</span>
            </div>
            <button onClick={() => handleDelete(ev.id)} className="text-slate-400 hover:text-red-500 p-2 transition-colors">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SiteEditorTab = ({ siteContent, updateSiteContent }) => {
  const [localContent, setLocalContent] = useState(siteContent);
  const [activeSection, setActiveSection] = useState('general');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => setLocalContent(siteContent), [siteContent]);

  if (!localContent) return <div className="p-8 text-center text-slate-500">Loading Site Settings...</div>;

  const handleSave = async () => {
    setSaveStatus('Saving changes...');
    try {
      await updateSiteContent(localContent);
      setSaveStatus('Changes saved for site visitors.');
    } catch (error) {
      setSaveStatus(error.message || 'Could not save site content.');
    }
  };

  const updateNested = (category, field, value) => {
    setLocalContent({
      ...localContent,
      [category]: { ...localContent[category], [field]: value }
    });
  };

  const updateAnnouncement = (field, value) => {
    setLocalContent({
      ...localContent,
      general: {
        ...localContent.general,
        announcement: { ...localContent.general.announcement, [field]: value }
      }
    });
  };

  const updateContact = (field, value) => {
    setLocalContent({
      ...localContent,
      general: {
        ...localContent.general,
        contact: { ...localContent.general.contact, [field]: value }
      }
    });
  };

  const updateDiscovery = (field, value) => {
    setLocalContent({
      ...localContent,
      home: {
        ...localContent.home,
        about: { ...localContent.home.about, [field]: value }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-school-blue">Site Designer</h2>
          <p className="text-slate-500 text-sm mt-1">Manage all visual and text content of the website.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {saveStatus && <p role="status" className="text-sm text-slate-600">{saveStatus}</p>}
          <button onClick={handleSave} disabled={saveStatus === 'Saving changes...'} className="btn-primary flex items-center gap-2 shadow-lg disabled:opacity-60">
            <Save size={20} /> Save All Changes
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'general', label: 'Branding', icon: Globe },
          { id: 'home', label: 'Home Page', icon: Edit3 },
          { id: 'about', label: 'About Page', icon: Users },
          { id: 'headteacher', label: 'Head Teacher', icon: Heart },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap ${activeSection === s.id ? 'bg-school-blue text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-school-blue'}`}
          >
            <s.icon size={16} /> {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeSection === 'general' && (
          <div className="card space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h3 className="text-xl font-bold border-b pb-4">Branding & Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">School Name</label>
                <input 
                  type="text" 
                  value={localContent.general.schoolName} 
                  onChange={e => updateNested('general', 'schoolName', e.target.value)} 
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-school-blue outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">School Motto</label>
                <input 
                  type="text" 
                  value={localContent.general.motto} 
                  onChange={e => updateNested('general', 'motto', e.target.value)} 
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-school-blue outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Logo Path (from public/ folder)</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={localContent.general.logo} 
                    onChange={e => updateNested('general', 'logo', e.target.value)} 
                    className="flex-1 border p-3 rounded-xl focus:ring-2 focus:ring-school-blue outline-none"
                  />
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center border">
                    <img src={localContent.general.logo} alt="Preview" className="w-10 h-10 object-contain" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">* Ensure the image file exists in your public folder.</p>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <h4 className="md:col-span-2 text-sm font-bold text-school-blue">Contact Information</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wider uppercase">Phone Number</label>
                  <input type="text" value={localContent.general.contact.phone} onChange={e => updateContact('phone', e.target.value)} className="w-full border p-2 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wider uppercase">Email Address</label>
                  <input type="text" value={localContent.general.contact.email} onChange={e => updateContact('email', e.target.value)} className="w-full border p-2 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wider uppercase">Physical Location</label>
                  <input type="text" value={localContent.general.contact.location} onChange={e => updateContact('location', e.target.value)} className="w-full border p-2 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wider uppercase">Map Text / Coordinates</label>
                  <input type="text" value={localContent.general.contact.mapCoords} onChange={e => updateContact('mapCoords', e.target.value)} className="w-full border p-2 rounded-lg" />
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 gap-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-school-blue uppercase tracking-tight">Announcement Bar</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Status:</span>
                    <button 
                      onClick={() => updateAnnouncement('isActive', !localContent.general.announcement.isActive)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                        localContent.general.announcement.isActive 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {localContent.general.announcement.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Announcement Message</label>
                  <textarea 
                    value={localContent.general.announcement.text} 
                    onChange={e => updateAnnouncement('text', e.target.value)} 
                    className="w-full border p-3 rounded-xl bg-slate-50 focus:bg-white focus:border-school-blue outline-none transition-all text-sm font-medium resize-none h-20"
                    placeholder="Type your important announcement here..."
                  />
                  <p className="text-[10px] text-slate-400 italic px-1 leading-relaxed">
                    * This message will appear at the very top of the website for all visitors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'home' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="card space-y-6">
              <h3 className="text-xl font-bold border-b pb-4 flex items-center gap-2 text-school-green"><Image size={24}/> Hero Slideshow</h3>
              <div className="space-y-6">
                {localContent.home.hero.map((slide, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 relative group">
                    <span className="absolute -top-3 left-4 bg-school-blue text-white text-[10px] px-2 py-1 rounded-full font-bold">Slide {idx + 1}</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-4">
                        <input 
                          type="text" 
                          placeholder="Slide Title" 
                          value={slide.title} 
                          onChange={e => {
                            const newHero = [...localContent.home.hero];
                            newHero[idx].title = e.target.value;
                            setLocalContent({...localContent, home: { ...localContent.home, hero: newHero }});
                          }} 
                          className="w-full border p-2 rounded-lg text-sm"
                        />
                        <textarea 
                          placeholder="Subtitle" 
                          rows="2" 
                          value={slide.subtitle} 
                          onChange={e => {
                            const newHero = [...localContent.home.hero];
                            newHero[idx].subtitle = e.target.value;
                            setLocalContent({...localContent, home: { ...localContent.home, hero: newHero }});
                          }} 
                          className="w-full border p-2 rounded-lg text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          placeholder="Image URL / Path" 
                          value={slide.src} 
                          onChange={e => {
                            const newHero = [...localContent.home.hero];
                            newHero[idx].src = e.target.value;
                            setLocalContent({...localContent, home: { ...localContent.home, hero: newHero }});
                          }} 
                          className="w-full border p-2 rounded-lg text-sm"
                        />
                        <div className="h-20 w-full rounded-lg overflow-hidden border">
                          <img src={slide.src} className="w-full h-full object-cover" alt="Preview"/>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card space-y-6">
              <h3 className="text-xl font-bold border-b pb-4">Home Discovery Section</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Main Title</label>
                  <input type="text" value={localContent.home.about.discoverTitle} onChange={e => updateDiscovery('discoverTitle', e.target.value)} className="w-full border p-3 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">History/About Text</label>
                  <textarea rows="3" value={localContent.home.about.discoverText} onChange={e => updateDiscovery('discoverText', e.target.value)} className="w-full border p-3 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Primary Stat (e.g. Pass Rate)</label>
                    <input type="text" value={localContent.home.about.passRate} onChange={e => updateDiscovery('passRate', e.target.value)} className="w-full border p-3 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Secondary Stat (e.g. Staff)</label>
                    <input type="text" value={localContent.home.about.staffRate} onChange={e => updateDiscovery('staffRate', e.target.value)} className="w-full border p-3 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'about' && (
          <div className="card space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h3 className="text-xl font-bold border-b pb-4">About Page Hero</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Hero Image Background</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={siteContent.about.hero.image} 
                    onChange={e => {
                      setLocalContent({
                        ...localContent,
                        about: { ...localContent.about, hero: { ...localContent.about.hero, image: e.target.value } }
                      });
                    }} 
                    className="flex-1 border p-3 rounded-xl"
                  />
                  <img src={localContent.about.hero.image} className="w-20 h-14 object-cover rounded shadow" alt="preview"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Hero Subtitle / Motto</label>
                <input 
                  type="text" 
                  value={localContent.about.hero.motto} 
                  onChange={e => {
                    setLocalContent({
                      ...localContent,
                      about: { ...localContent.about, hero: { ...localContent.about.hero, motto: e.target.value } }
                    });
                  }} 
                  className="w-full border p-3 rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'headteacher' && (
          <div className="card space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h3 className="text-xl font-bold border-b pb-4">Head Teacher Message</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-slate-700 mb-2">Portrait Image</label>
                <input 
                  type="text" 
                  value={localContent.about.headTeacher.image} 
                  onChange={e => {
                    setLocalContent({
                      ...localContent,
                      about: { ...localContent.about, headTeacher: { ...localContent.about.headTeacher, image: e.target.value } }
                    });
                  }} 
                  className="w-full border p-2 rounded-lg text-xs mb-3"
                />
                <img src={localContent.about.headTeacher.image} className="w-full aspect-square object-cover rounded-2xl shadow-lg" alt="Headteacher"/>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Name & Titles</label>
                  <input 
                    type="text" 
                    value={localContent.about.headTeacher.name} 
                    onChange={e => {
                      setLocalContent({
                        ...localContent,
                        about: { ...localContent.about, headTeacher: { ...localContent.about.headTeacher, name: e.target.value } }
                      });
                    }} 
                    className="w-full border p-3 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Message Content</label>
                  <textarea 
                    rows="8" 
                    value={localContent.about.headTeacher.message} 
                    onChange={e => {
                      setLocalContent({
                        ...localContent,
                        about: { ...localContent.about, headTeacher: { ...localContent.about.headTeacher, message: e.target.value } }
                      });
                    }} 
                    className="w-full border p-3 rounded-xl leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
const StaffTab = () => {
  const [staffList, setStaffList] = useState([]);
  const [schoolClasses, setSchoolClasses] = useState([]);
  const [savingClass, setSavingClass] = useState('');
  const [headMessage, setHeadMessage] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', subject: 'General', role: 'teacher', isAdmin: false });
  const [newCredentials, setNewCredentials] = useState(null);
  const [savingStaff, setSavingStaff] = useState(false);
  const [staffMessage, setStaffMessage] = useState('');
  const [copiedField, setCopiedField] = useState('');

  useEffect(() => {
    let isActive = true;
    const loadStaff = async () => {
      /* Staff and class heads load independently. Previously one failing
         query aborted this whole handler before either state was set, which
         left the tab completely blank. */
      let staff = [];
      try {
        staff = isSupabaseConfigured
          ? (await Promise.all([loadProfiles('teacher'), loadProfiles('dos')])).flat()
          : JSON.parse(localStorage.getItem('staff_db') || '[]');
      } catch (error) {
        console.error('Failed to load staff records', error);
      }

      let classRecords = [];
      if (isSupabaseConfigured) {
        try {
          classRecords = await loadSchoolClassesWithHeads();
        } catch (error) {
          console.error('Failed to load class head assignments', error);
          setHeadMessage('Class head assignments need a database update. Classes are listed below.');
          try {
            classRecords = (await loadSchoolClasses()).map(name => ({ name, headTeacherId: null }));
          } catch (fallbackError) {
            console.error('Failed to load classes', fallbackError);
          }
        }
      }

      if (isActive) {
        setStaffList(staff);
        setSchoolClasses(classRecords);
      }
    };
    loadStaff();
    return () => { isActive = false; };
  }, []);

  const handleAssignHead = async (className, teacherId) => {
    setSavingClass(className);
    setHeadMessage('');
    try {
      await assignSchoolClassHead(className, teacherId);
      setSchoolClasses(current => current.map(schoolClass => schoolClass.name === className
        ? { ...schoolClass, headTeacherId: teacherId || null }
        : schoolClass));
      setHeadMessage(`Head teacher updated for ${className}.`);
    } catch (error) {
      setHeadMessage(error.message || 'Could not assign the class head.');
    } finally {
      setSavingClass('');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setStaffMessage(null);
    setNewCredentials(null);

    if (formData.password.length < 8) {
      setStaffMessage({ tone: 'error', text: 'Choose an initial password of at least 8 characters.' });
      return;
    }

    if (isSupabaseConfigured) {
      setSavingStaff(true);
      try {
        const result = await provisionAccount({
          type: formData.role,
          fullName: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          subject: formData.subject,
          isAdmin: formData.isAdmin
        });
        const created = mapSupabaseProfile(result.profile);
        setStaffList(current => [...current, created]);
        setNewCredentials({
          name: created.name,
          username: created.username || formData.username,
          email: created.email || formData.email,
          password: result.password || formData.password,
          role: created.role
        });
        setShowAdd(false);
        setStaffMessage({ tone: 'success', text: `${created.name} can now sign in to the e-learning dashboard.` });
        setFormData({ name: '', username: '', email: '', password: '', subject: 'General', role: 'teacher', isAdmin: false });
      } catch (error) {
        setStaffMessage({ tone: 'error', text: error.message || 'Could not register staff.' });
      } finally {
        setSavingStaff(false);
      }
      return;
    }

    const newStaff = { ...formData, id: 'staff_' + Date.now().toString() };
    const updated = [...staffList, newStaff];
    setStaffList(updated);
    localStorage.setItem('staff_db', JSON.stringify(updated));
    setShowAdd(false);
    setFormData({ name: '', username: '', email: '', password: '', subject: 'General', role: 'teacher', isAdmin: false });
  };

  const handleDelete = async (id) => {
    const member = staffList.find(s => s.id === id);
    if (!confirm(`Remove ${member?.name || 'this staff member'}? They will lose access to the e-learning dashboard immediately.`)) return;
    setStaffMessage(null);

    if (isSupabaseConfigured) {
      try {
        await deleteProvisionedAccount(id);
        setStaffList(current => current.filter(staff => staff.id !== id));
        setSchoolClasses(current => current.map(schoolClass => (
          schoolClass.headTeacherId === id ? { ...schoolClass, headTeacherId: null } : schoolClass
        )));
        setStaffMessage({ tone: 'success', text: `${member?.name || 'The staff member'} was removed.` });
      } catch (error) {
        setStaffMessage({ tone: 'error', text: error.message || 'Could not remove staff.' });
      }
      return;
    }

    const updated = staffList.filter(s => s.id !== id);
    setStaffList(updated);
    localStorage.setItem('staff_db', JSON.stringify(updated));
  };

  const copyCredential = async (field, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (error) {
      console.error('Could not copy to the clipboard', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-school-blue">Staff &amp; Class Heads</h2>
          <p className="text-slate-500 text-sm mt-1">Register teachers and administrators, then assign a class head to lead each class.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-secondary flex items-center gap-2">
          {showAdd ? <X size={20} /> : <Plus size={20} />} {showAdd ? 'Cancel' : 'Register Staff'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="card bg-white p-6 mb-8 border-2 border-school-blue/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Shield size={20} className="text-school-blue" /> Register New Staff</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-md p-2" placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-300 rounded-md p-2" placeholder="e.g. john@runaba.edu" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject Expertise (Module)</label>
              <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value.toUpperCase()})} className="w-full border border-slate-300 rounded-md p-2" placeholder="e.g. BIO, MATH, ADMIN" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Access role</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value, isAdmin: e.target.value === 'teacher' ? formData.isAdmin : false})} className="w-full border border-slate-300 rounded-md p-2">
                <option value="teacher">Teacher</option>
                <option value="dos">Director of Studies</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username (for login)</label>
              <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase()})} className="w-full border border-slate-300 rounded-md p-2" placeholder="e.g. johndoe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Initial Password</label>
              <input required type="password" autoComplete="new-password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border border-slate-300 rounded-md p-2" placeholder="Strong password" />
            </div>
            {formData.role === 'teacher' && <div className="md:col-span-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={formData.isAdmin} 
                  onChange={e => setFormData({...formData, isAdmin: e.target.checked})} 
                  className="w-5 h-5 text-school-blue rounded"
                />
                <span className="font-bold text-sm text-slate-700">Grant Administrator Access (Sub-Admin)</span>
              </label>
              <p className="text-xs text-slate-400 mt-1 ml-8">Admins can edit the website, manage events, and view the staff database.</p>
            </div>}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
            <p className="text-xs text-slate-500 max-w-md">
              {formData.role === 'dos'
                ? 'This account gets full Director of Studies access to the e-learning dashboard.'
                : 'The teacher signs in with this username or email and the initial password you set.'}
            </p>
            <button type="submit" disabled={savingStaff} className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              <Save size={18} /> {savingStaff ? 'Registering…' : 'Register Staff Account'}
            </button>
          </div>
        </form>
      )}

      {staffMessage && (
        <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${staffMessage.tone === 'error'
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {staffMessage.text}
        </div>
      )}

      {newCredentials && (
        <div className="card bg-white p-6 mb-8 border-2 border-school-green/30">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-school-green/10">
                <KeyRound size={20} className="text-school-green" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-school-blue">Sign-in details for {newCredentials.name}</h3>
                <p className="text-sm text-slate-500">Share these once. The password is not stored and cannot be shown again.</p>
              </div>
            </div>
            <button type="button" onClick={() => setNewCredentials(null)} className="text-slate-400 hover:text-slate-600" aria-label="Dismiss sign-in details">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { key: 'username', label: 'Username', value: newCredentials.username },
              { key: 'email', label: 'Email', value: newCredentials.email },
              { key: 'password', label: 'Initial password', value: newCredentials.password }
            ].map(({ key, label, value }) => (
              <div key={key} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</div>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-mono text-slate-800 break-all">{value}</code>
                  <button type="button" onClick={() => copyCredential(key, value)} className="text-slate-400 hover:text-school-blue shrink-0" aria-label={`Copy ${label}`}>
                    <Copy size={15} />
                  </button>
                </div>
                {copiedField === key && <div className="text-[10px] text-school-green font-bold mt-1">Copied</div>}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Role: <span className="font-bold uppercase text-slate-700">{newCredentials.role === 'dos' ? 'Director of Studies' : 'Teacher'}</span>
            {newCredentials.role === 'teacher' ? ' — assign this teacher as a class head below.' : ''}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-medium text-sm border-b border-slate-200">
              <th className="p-4">Name</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Contact Info</th>
              <th className="p-4">Role / Access</th>
              <th className="p-4">Classes Led</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length === 0 ? (<tr><td colSpan="7" className="p-8 text-center text-slate-500">No staff members registered.</td></tr>) : null}
            {staffList.map(s => (
              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-800">{s.name}</td>
                <td className="p-4 font-black uppercase text-xs tracking-widest text-school-green">{s.subject || 'GENERAL'}</td>
                <td className="p-4">
                   <div className="text-sm font-medium text-school-blue">{s.email}</div>
                   <div className="text-xs text-slate-400 mt-0.5">user: {s.username}</div>
                </td>
                <td className="p-4">
                   {s.isAdmin ? (
                     <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1 w-max">
                       <Shield size={12} /> Admin
                     </span>
                   ) : s.role === 'dos' ? (
                     <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                       Director of Studies
                     </span>
                   ) : (
                     <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                       Teacher
                     </span>
                   )}
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Active
                  </span>
                </td>
                 <td className="p-4">
                   {(() => {
                     const led = schoolClasses.filter(schoolClass => schoolClass.headTeacherId === s.id).map(schoolClass => schoolClass.name);
                     if (led.length === 0) return <span className="text-xs text-slate-400">â€”</span>;
                     return (
                       <div className="flex flex-wrap gap-1">
                         {led.map(className => (
                           <span key={className} className="rounded border border-school-green/20 bg-school-green/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-school-green">
                             {className}
                           </span>
                         ))}
                       </div>
                     );
                   })()}
                 </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 p-2 border border-red-100 rounded-lg hover:bg-red-50 transition-colors" title="Revoke Access">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Class head assignment */}
      <div className="mt-10">
        <h3 className="text-xl font-bold text-school-blue">Class Heads</h3>
        <p className="mt-1 text-sm text-slate-600">Assign one teacher to lead each class. Class heads can mark attendance and review student work for their assigned classes.</p>
        {headMessage && <p role="status" className="mt-3 border-y border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{headMessage}</p>}
        <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200 bg-white">
          {schoolClasses.map(schoolClass => (
            <label key={schoolClass.name} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold text-slate-800">{schoolClass.name}</span>
              <select
                aria-label={`Class head for ${schoolClass.name}`}
                value={schoolClass.headTeacherId || ''}
                disabled={savingClass === schoolClass.name}
                onChange={event => handleAssignHead(schoolClass.name, event.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm sm:max-w-sm"
              >
                <option value="">No class head assigned</option>
                {staffList.filter(staff => staff.role === 'teacher').map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.fullName || teacher.name}</option>
                ))}
              </select>
            </label>
          ))}
          {schoolClasses.length === 0 && <p className="px-4 py-8 text-sm text-slate-500">Register classes before assigning class heads.</p>}
        </div>
      </div>
    </div>
  );
};

const AnalyticsTab = ({ students, assignments, quizzes, notes }) => {
  const [metrics, setMetrics] = useState({ teachers: 0, students: 0, materials: 0 });
  const [teacherRoster, setTeacherRoster] = useState([]);

  useEffect(() => {
    let isActive = true;
    const loadAnalytics = async () => {
      try {
        const staffDB = isSupabaseConfigured
          ? await loadProfiles('teacher')
          : JSON.parse(localStorage.getItem('staff_db') || '[]');
        if (!isActive) return;

        setMetrics({
          teachers: staffDB.length,
          students: students.length,
          materials: notes.length + quizzes.length + assignments.length
        });

        const mappedRoster = staffDB.map(teacher => {
          const targetSubj = (teacher.subject || '').toUpperCase().trim();
          const assignedStudents = targetSubj === 'ADMIN' || targetSubj === 'GENERAL' || targetSubj === ''
            ? []
            : students.filter(student => (student.module || '').toUpperCase().includes(targetSubj));

          return {
            ...teacher,
            assignedCount: assignedStudents.length,
            studentSample: assignedStudents.slice(0, 3)
          };
        });

        setTeacherRoster(mappedRoster);
      } catch (error) {
        console.error('Failed to load analytics', error);
      }
    };

    loadAnalytics();
    return () => { isActive = false; };
  }, [students, assignments, quizzes, notes]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-school-blue">E-Learning Analytics</h2>
        <p className="text-slate-500 text-sm mt-1">Cross-referencing staff modules and student enrollment activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-l-4 border-l-amber-500 flex flex-col justify-center h-32 relative overflow-hidden">
           <div className="relative z-10 flex items-center justify-between">
              <div>
                 <p className="text-xs font-black uppercase text-amber-500 tracking-widest mb-1">Total Verified Teachers</p>
                 <p className="text-4xl font-black text-slate-800">{metrics.teachers}</p>
              </div>
              <Shield className="text-amber-500 opacity-20" size={48} />
           </div>
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 -mt-10 -mr-10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="card border-l-4 border-l-school-blue flex flex-col justify-center h-32 relative overflow-hidden">
           <div className="relative z-10 flex items-center justify-between">
              <div>
                 <p className="text-xs font-black uppercase text-school-blue tracking-widest mb-1">Registered Students</p>
                 <p className="text-4xl font-black text-slate-800">{metrics.students}</p>
              </div>
              <Users className="text-school-blue opacity-20" size={48} />
           </div>
           <div className="absolute top-0 right-0 w-32 h-32 bg-school-blue/5 -mt-10 -mr-10 rounded-full blur-2xl"></div>
        </div>

        <div className="card border-l-4 border-l-school-green flex flex-col justify-center h-32 relative overflow-hidden">
           <div className="relative z-10 flex items-center justify-between">
              <div>
                 <p className="text-xs font-black uppercase text-school-green tracking-widest mb-1">Digital Materials</p>
                 <p className="text-4xl font-black text-slate-800">{metrics.materials}</p>
              </div>
              <FileUp className="text-school-green opacity-20" size={48} />
           </div>
           <div className="absolute top-0 right-0 w-32 h-32 bg-school-green/5 -mt-10 -mr-10 rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
           <BarChart3 className="text-school-blue" size={24} />
           <h3 className="font-bold text-xl text-slate-800">Teacher to Student Correlation</h3>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <th className="p-4 pl-6">Instructor Name</th>
                <th className="p-4">Academic Module</th>
                <th className="p-4">Direct Students Found</th>
                <th className="p-4 pr-6">Student Activity Sample</th>
              </tr>
            </thead>
            <tbody>
              {teacherRoster.map(t => (
                <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="p-4 pl-6">
                     <div className="font-bold text-slate-800 group-hover:text-school-blue transition-colors">{t.name}</div>
                     <div className="text-xs text-slate-400 mt-1">{t.email}</div>
                  </td>
                  <td className="p-4">
                     <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] w-max block ${
                        t.subject === 'GENERAL' || t.subject === 'ADMIN' ? 'bg-slate-100 text-slate-500' : 'bg-school-green/10 text-school-green border border-school-green/20'
                     }`}>
                        {t.subject || 'General'}
                     </span>
                  </td>
                  <td className="p-4">
                    {t.assignedCount > 0 ? (
                       <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-school-blue text-white flex items-center justify-center font-bold text-sm shadow-md">
                           {t.assignedCount}
                         </div>
                         <span className="text-xs font-bold text-slate-500">Enrolled</span>
                       </div>
                    ) : (
                       <span className="text-xs italic text-slate-400">No students found matching this module.</span>
                    )}
                  </td>
                  <td className="p-4 pr-6">
                    {t.studentSample.length > 0 ? (
                      <div className="flex -space-x-2">
                        {t.studentSample.map((s, idx) => (
                          <div key={idx} className="w-8 h-8 rounded-full bg-white border-2 border-slate-100 shadow flex items-center justify-center text-[10px] font-bold text-slate-600 relative group/avatar">
                            {s.fullName.substring(0, 2).toUpperCase()}
                            <span className="absolute bottom-full mb-1 bg-slate-900 text-white text-[10px] py-0.5 px-2 rounded opacity-0 group-hover/avatar:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                              {s.fullName} ({s.class})
                            </span>
                          </div>
                        ))}
                        {t.assignedCount > 3 && (
                          <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white shadow flex items-center justify-center text-[10px] font-black text-slate-400">
                            +{t.assignedCount - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-2xl text-slate-200">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
