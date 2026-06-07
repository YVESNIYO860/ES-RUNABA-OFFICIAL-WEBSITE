import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Users, FileText, CheckSquare, LayoutDashboard, Plus, Trash2, Save, X, FileUp, Download, CalendarDays, Globe, Edit3, Heart, Shield, BarChart3, Laptop } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const TeacherDashboard = () => {
  const { user, siteContent, updateSiteContent } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data State
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    try {
      setStudents(JSON.parse(localStorage.getItem('students_db') || '[]'));
      setAssignments(JSON.parse(localStorage.getItem('assignments_db') || '[]'));
      setQuizzes(JSON.parse(localStorage.getItem('quizzes_db') || '[]'));
      setNotes(JSON.parse(localStorage.getItem('notes_db') || '[]'));
      setEvents(JSON.parse(localStorage.getItem('events_db') || '[]'));
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    }
  }, []);

  if (!user || user.role !== 'teacher') {
    return <Navigate to="/elearning" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar sidebar */}
      <aside className="w-full md:w-64 bg-school-blue text-white flex flex-col pt-20 shadow-xl z-10 md:min-h-screen">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold tracking-tight uppercase">Management</h2>
          <p className="text-slate-300 text-sm mt-1">Portal | Welcome, {user.name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'assignments', label: 'Assignments', icon: FileText },
            { id: 'quizzes', label: 'Quizzes', icon: CheckSquare },
            { id: 'notes', label: 'Notes & Resources', icon: FileUp },
            ...(user.isAdmin ? [
              { id: 'events', label: 'Upcoming Events', icon: CalendarDays },
              { id: 'site-editor', label: 'Site Designer', icon: Globe },
              { id: 'staff', label: 'Staff Management', icon: Shield },
              { id: 'analytics', label: 'Academic Analytics', icon: BarChart3 }
            ] : []),
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${activeTab === tab.id ? 'bg-school-green text-white font-medium' : 'hover:bg-white/10 text-slate-300'}`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pt-24 overflow-y-auto w-full max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <OverviewTab students={students} assignments={assignments} quizzes={quizzes} />}
            {activeTab === 'students' && <StudentsTab students={students} setStudents={setStudents} />}
            { activeTab === 'assignments' && <AssignmentsTab assignments={assignments} setAssignments={setAssignments} /> }
            { activeTab === 'quizzes' && <QuizzesTab quizzes={quizzes} setQuizzes={setQuizzes} /> }
            { activeTab === 'notes' && <NotesTab notes={notes} setNotes={setNotes} /> }
            { activeTab === 'events' && <EventsTab events={events} setEvents={setEvents} /> }
            { activeTab === 'site-editor' && <SiteEditorTab siteContent={siteContent} updateSiteContent={updateSiteContent} /> }
            { activeTab === 'staff' && <StaffTab /> }
            { activeTab === 'analytics' && <AnalyticsTab /> }
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- TABS ---

const OverviewTab = ({ students, assignments, quizzes }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-school-blue mb-8">Dashboard Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  </div>
);

const StudentsTab = ({ students, setStudents }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', class: 'Senior 1', module: 'BIO', password: 'password123' });

  const handleAdd = (e) => {
    e.preventDefault();
    const count = students.length + 1;
    const regNumber = `2026/ESR/${formData.module.toUpperCase()}/${String(count).padStart(3, '0')}`;
    const newStudent = { ...formData, regNumber, id: Date.now().toString() };
    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem('students_db', JSON.stringify(updated));
    setShowAdd(false);
    setFormData({ fullName: '', class: 'Senior 1', module: 'BIO', password: 'password123' });
  };

  const handleDelete = (id) => {
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
              <select value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full border border-slate-300 rounded-md p-2">
                <option>Senior 1</option><option>Senior 2</option><option>Senior 3</option>
                <option>Senior 4 MEG</option><option>Senior 4 MCE</option><option>Senior 4 PCB</option>
                <option>Senior 5 MEG</option><option>Senior 5 MCE</option><option>Senior 5 PCB</option>
                <option>Senior 6 MEG</option><option>Senior 6 MCE</option><option>Senior 6 PCB</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Module / Subject Code</label>
              <input required type="text" value={formData.module} onChange={e => setFormData({...formData, module: e.target.value.toUpperCase()})} className="w-full border border-slate-300 rounded-md p-2" placeholder="e.g. BIO, MATH, ENG" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Initial Password</label>
              <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border border-slate-300 rounded-md p-2" />
            </div>
          </div>
          <button type="submit" className="btn-primary mt-4 flex items-center gap-2"><Save size={18} /> Save Student</button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
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
                <td className="p-4 font-mono text-sm font-bold text-school-blue">{s.regNumber}</td>
                <td className="p-4 font-medium text-slate-800">{s.fullName}</td>
                <td className="p-4 text-slate-600">{s.class}</td>
                <td className="p-4 text-sm text-slate-500 font-mono">{s.password}</td>
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

const AssignmentsTab = ({ assignments, setAssignments }) => {
   const [showAdd, setShowAdd] = useState(false);
   const [formData, setFormData] = useState({ title: '', class: 'Senior 4 MCE', subject: '', description: '', dueDate: '' });

   const handleAdd = (e) => {
    e.preventDefault();
    const newAssignment = { ...formData, id: Date.now().toString() };
    const updated = [...assignments, newAssignment];
    setAssignments(updated);
    localStorage.setItem('assignments_db', JSON.stringify(updated));
    setShowAdd(false);
    setFormData({ title: '', class: 'Senior 4 MCE', subject: '', description: '', dueDate: '' });
   };

   const handleDelete = (id) => {
    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);
    localStorage.setItem('assignments_db', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-school-blue">Assignments</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-secondary flex items-center gap-2">
          {showAdd ? <X size={20} /> : <Plus size={20} />} {showAdd ? 'Cancel' : 'Create Assignment'}
        </button>
      </div>

       {showAdd && (
        <form onSubmit={handleAdd} className="card bg-white p-6 mb-8 border-2 border-school-blue/20">
          <h3 className="text-xl font-bold mb-4">New Assignment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full border border-slate-300 rounded-md p-2" placeholder="e.g. Mathematics" />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Class</label>
              <select value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full border border-slate-300 rounded-md p-2">
                <option>Senior 1</option><option>Senior 2</option><option>Senior 3</option>
                <option>Senior 4 MEG</option><option>Senior 4 MCE</option><option>Senior 4 PCB</option>
                <option>Senior 5 MEG</option><option>Senior 5 MCE</option><option>Senior 5 PCB</option>
                <option>Senior 6 MEG</option><option>Senior 6 MCE</option><option>Senior 6 PCB</option>
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
                  <button onClick={() => handleDelete(a.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                  <h3 className="font-bold text-lg">{a.title}</h3>
                  <div className="flex gap-2 text-xs font-semibold mt-2 mb-3">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">{a.subject}</span>
                      <span className="bg-school-green/10 text-school-green px-2 py-1 rounded">{a.class}</span>
                  </div>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{a.description}</p>
                  <p className="text-xs font-bold text-red-500">Due: {a.dueDate}</p>
              </div>
          ))}
      </div>
    </div>
  );
};

const QuizzesTab = ({ quizzes, setQuizzes }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ title: '', class: 'Senior 4 MCE', subject: '' });
  const [question, setQuestion] = useState({ type: 'radio', section: 'Section A - General', duration: 60, q: '', opt1: '', opt2: '', opt3: '', opt4: '', correct: 'opt1', points: 1 });
  const [questions, setQuestions] = useState([]);

  const addQuestion = (e) => {
      e.preventDefault();
      // Basic validation for short answer
      if (question.type === 'short_answer' && !question.correct) {
          return alert("Short Answer requires an exact correct answer for auto-grading.");
      }
      setQuestions([...questions, { ...question, id: Date.now().toString() }]);
      setQuestion({ ...question, type: 'radio', q: '', opt1: '', opt2: '', opt3: '', opt4: '', correct: 'opt1', points: 1 });
  };

  const handleCreateQuiz = () => {
      if(questions.length === 0) return alert("Add at least one question.");
      const newQuiz = { ...formData, questions, id: Date.now().toString() };
      const updated = [...quizzes, newQuiz];
      setQuizzes(updated);
      localStorage.setItem('quizzes_db', JSON.stringify(updated));
      setShowAdd(false);
      setFormData({ title: '', class: 'Senior 4 MCE', subject: '' });
      setQuestions([]);
  };

  const handleDelete = (id) => {
    const updated = quizzes.filter(q => q.id !== id);
    setQuizzes(updated);
    localStorage.setItem('quizzes_db', JSON.stringify(updated));
  }


  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-school-blue">Quizzes</h2>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-secondary flex items-center gap-2">
            {showAdd ? <X size={20} /> : <Plus size={20} />} {showAdd ? 'Cancel' : 'Create Quiz'}
          </button>
        </div>

        {showAdd && (
            <div className="card bg-white p-6 mb-8 border-2 border-purple-500/20">
                <h3 className="text-xl font-bold mb-4 text-purple-700">Quiz Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <input type="text" placeholder="Exam Title" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="border p-2 rounded" />
                    <input type="text" placeholder="Subject" value={formData.subject} onChange={e=>setFormData({...formData, subject: e.target.value})} className="border p-2 rounded" />
                    <select value={formData.class} onChange={e=>setFormData({...formData, class: e.target.value})} className="border p-2 rounded">
                        <option>Senior 1</option><option>Senior 2</option><option>Senior 3</option>
                        <option>Senior 4 MEG</option><option>Senior 4 MCE</option><option>Senior 4 PCB</option>
                        <option>Senior 5 MEG</option><option>Senior 5 MCE</option><option>Senior 5 PCB</option>
                        <option>Senior 6 MEG</option><option>Senior 6 MCE</option><option>Senior 6 PCB</option>
                    </select>
                </div>

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
                    <button onClick={handleCreateQuiz} disabled={!formData.title || questions.length===0} className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">Save & Publish Quiz</button>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.length === 0 && <p className="text-slate-500">No quizzes created yet.</p>}
            {quizzes.map(q => (
                <div key={q.id} className="card relative border-t-4 border-t-purple-500">
                    <button onClick={() => handleDelete(q.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                    <h3 className="font-bold text-lg">{q.title}</h3>
                    <div className="flex gap-2 text-xs font-semibold mt-2 mb-3">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">{q.subject}</span>
                        <span className="bg-purple-500/10 text-purple-600 px-2 py-1 rounded">{q.class}</span>
                        <span className="bg-slate-800 text-white px-2 py-1 rounded">{q.questions.length} Qs</span>
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">Strict Paging</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
  );
}

const NotesTab = ({ notes, setNotes }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({ title: '', class: 'Senior 4 MCE', subject: '', description: '' });
    const [fileData, setFileData] = useState(null);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1.5MB size limit to avoid blowing up localStorage
        if (file.size > 1.5 * 1024 * 1024) {
             setError("File is too large. Maximum size is 1.5MB.");
             setFileData(null);
             setFileName('');
             return;
        }
        setError('');
        setFileName(file.name);

        const reader = new FileReader();
        reader.onloadend = () => {
            setFileData(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!fileData) return alert("Please select a valid file under 1.5MB");

        const newNote = {
            id: Date.now().toString(),
            title: formData.title,
            subject: formData.subject,
            class: formData.class,
            description: formData.description,
            fileName: fileName,
            fileData: fileData,
            datePosted: new Date().toLocaleDateString()
        };

        const updated = [...notes, newNote];
        try {
            localStorage.setItem('notes_db', JSON.stringify(updated));
            setNotes(updated);
            setShowAdd(false);
            setFormData({ title: '', class: 'Senior 4 MCE', subject: '', description: '' });
            setFileData(null);
            setFileName('');
        } catch (err) {
            alert("Storage quota exceeded! The file might be too large for local storage.");
        }
    };

    const handleDelete = (id) => {
        const updated = notes.filter(n => n.id !== id);
        setNotes(updated);
        localStorage.setItem('notes_db', JSON.stringify(updated));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-school-blue">Notes & Resources</h2>
                <button onClick={() => setShowAdd(!showAdd)} className="btn-secondary flex items-center gap-2">
                    {showAdd ? <X size={20} /> : <Plus size={20} />} {showAdd ? 'Cancel' : 'Upload File'}
                </button>
            </div>

            {showAdd && (
                <form onSubmit={handleAdd} className="card bg-white p-6 mb-8 border-2 border-school-blue/20">
                    <h3 className="text-xl font-bold mb-4">Upload New Material</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-300 rounded-md p-2" placeholder="e.g. Chapter 1 Notes" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full border border-slate-300 rounded-md p-2" placeholder="e.g. Physics" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Target Class</label>
                            <select value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full border border-slate-300 rounded-md p-2">
                                <option>Senior 1</option><option>Senior 2</option><option>Senior 3</option>
                                <option>Senior 4 MEG</option><option>Senior 4 MCE</option><option>Senior 4 PCB</option>
                                <option>Senior 5 MEG</option><option>Senior 5 MCE</option><option>Senior 5 PCB</option>
                                <option>Senior 6 MEG</option><option>Senior 6 MCE</option><option>Senior 6 PCB</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">File (PDF, DOCX) - Max 1.5MB</label>
                            <input required type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} className="w-full border border-slate-300 rounded-md p-1.5 text-sm" />
                            {error && <p className="text-red-500 text-xs mt-1 font-bold">{error}</p>}
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                             <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-300 rounded-md p-2"></textarea>
                        </div>
                    </div>
                    <button type="submit" disabled={!fileData || error} className="btn-primary mt-4 flex items-center gap-2 disabled:opacity-50"><FileUp size={18} /> Upload Resource</button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.length === 0 && <p className="text-slate-500">No notes uploaded yet.</p>}
                {notes.map(n => (
                    <div key={n.id} className="card relative border-t-4 border-t-blue-500 flex flex-col">
                        <button onClick={() => handleDelete(n.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                        <h3 className="font-bold text-lg mb-1">{n.title}</h3>
                        <div className="flex gap-2 text-xs font-semibold mb-3">
                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">{n.subject}</span>
                            <span className="bg-blue-500/10 text-blue-600 px-2 py-1 rounded">{n.class}</span>
                        </div>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{n.description}</p>
                        
                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-mono flex items-center gap-1"><FileText size={14}/> {n.fileName}</span>
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

const EventsTab = ({ events, setEvents }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ date: '', title: '', loc: '', desc: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    const newEvent = { ...formData, id: Date.now().toString() };
    const updated = [...events, newEvent];
    setEvents(updated);
    localStorage.setItem('events_db', JSON.stringify(updated));
    setShowAdd(false);
    setFormData({ date: '', title: '', loc: '', desc: '' });
  };

  const handleDelete = (id) => {
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
              <span className="text-xs font-bold text-school-blue mt-2 block">📍 {ev.loc}</span>
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

  if (!localContent) return <div className="p-8 text-center text-slate-500">Loading Site Settings...</div>;

  const handleSave = () => {
    updateSiteContent(localContent);
    alert('Site content updated successfully! Refresh the website to see changes.');
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
        <button onClick={handleSave} className="btn-primary flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
          <Save size={20} /> Save All Changes
        </button>
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
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', subject: 'General', role: 'teacher', isAdmin: false });

  useEffect(() => {
    setStaffList(JSON.parse(localStorage.getItem('staff_db') || '[]'));
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    const newStaff = { ...formData, id: 'staff_' + Date.now().toString() };
    const updated = [...staffList, newStaff];
    setStaffList(updated);
    localStorage.setItem('staff_db', JSON.stringify(updated));
    setShowAdd(false);
    setFormData({ name: '', username: '', email: '', password: '', subject: 'General', role: 'teacher', isAdmin: false });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      const updated = staffList.filter(s => s.id !== id);
      setStaffList(updated);
      localStorage.setItem('staff_db', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-school-blue">Staff Database</h2>
          <p className="text-slate-500 text-sm mt-1">Manage platform access for teachers and administrators.</p>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Username (for login)</label>
              <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase()})} className="w-full border border-slate-300 rounded-md p-2" placeholder="e.g. johndoe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Initial Password</label>
              <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border border-slate-300 rounded-md p-2" placeholder="Strong password" />
            </div>
            <div className="md:col-span-2 pt-2">
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
            </div>
          </div>
          <button type="submit" className="btn-primary mt-6 flex items-center gap-2"><Save size={18} /> Register Staff Account</button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-medium text-sm border-b border-slate-200">
              <th className="p-4">Name</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Contact Info</th>
              <th className="p-4">Role / Access</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length === 0 ? (<tr><td colSpan="6" className="p-8 text-center text-slate-500">No staff members registered.</td></tr>) : null}
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
    </div>
  );
};

const AnalyticsTab = () => {
  const [metrics, setMetrics] = useState({ teachers: 0, students: 0, materials: 0 });
  const [teacherRoster, setTeacherRoster] = useState([]);

  useEffect(() => {
    // Collect all databases
    const studentsDB = JSON.parse(localStorage.getItem('students_db') || '[]');
    const staffDB = JSON.parse(localStorage.getItem('staff_db') || '[]');
    const notesDB = JSON.parse(localStorage.getItem('notes_db') || '[]');
    const quizzesDB = JSON.parse(localStorage.getItem('quizzes_db') || '[]');
    const assignmentsDB = JSON.parse(localStorage.getItem('assignments_db') || '[]');

    // Metric Calculations
    setMetrics({
      teachers: staffDB.length,
      students: studentsDB.length,
      materials: notesDB.length + quizzesDB.length + assignmentsDB.length
    });

    // Correlation Engine: Cross reference staff subject with student module
    const mappedRoster = staffDB.map(teacher => {
      // Find students whose module loosely matches the teacher's subject module (e.g., both contain 'MATH' or 'BIO')
      const targetSubj = (teacher.subject || '').toUpperCase().trim();
      const assignedStudents = targetSubj === 'ADMIN' || targetSubj === 'GENERAL' || targetSubj === ''
         ? [] 
         : studentsDB.filter(s => (s.module || '').toUpperCase().includes(targetSubj));

      return {
        ...teacher,
        assignedCount: assignedStudents.length,
        studentSample: assignedStudents.slice(0, 3) // Sample of students to display
      };
    });

    setTeacherRoster(mappedRoster);
  }, []);

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
