import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { BookOpen, CheckSquare, UserCircle, LogOut, CheckCircle2, ChevronRight, Send, FileText, Download, Timer, Menu, X, MessageSquare, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { saveFirestoreDocument } from '../firebase';
import { getLearningNoteUrl, isSupabaseConfigured, loadLearningRecords, removeStudentWorkFile, saveLearningRecord, uploadStudentWork } from '../utils/elearningStore';
import LearningDashboardFooter from '../components/LearningDashboardFooter';
import LearningContact from '../components/LearningContact';
import LearningSettings from '../components/LearningSettings';
import LearningPortalHeader from '../components/LearningPortalHeader';

const isQuizAvailable = (quiz) => {
    if (!quiz.deadline) return true;
    const [year, month, day] = quiz.deadline.split('-').map(Number);
    if (!year || !month || !day) return true;
    const deadlineEnd = new Date(year, month - 1, day, 23, 59, 59, 999);
    return deadlineEnd >= new Date();
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.readAsDataURL(file);
});

const getFileFormat = (file) => file.name.split('.').pop()?.toUpperCase() || file.type || 'FILE';

const isAssignmentOpen = (dueDate) => {
    if (!dueDate) return true;
    const [year, month, day] = dueDate.split('-').map(Number);
    if (!year || !month || !day) return true;
    return new Date(year, month - 1, day, 23, 59, 59, 999) >= new Date();
};

const studentTabs = [
    { id: 'assignments', label: 'My Assignments', icon: BookOpen },
    { id: 'quizzes', label: 'My Quizzes', icon: CheckSquare },
    { id: 'notes', label: 'My Lessons', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'contact', label: 'Contact', icon: MessageSquare },
];

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem(`es_runaba_learning_home_${user?.id}`);
        return studentTabs.some(tab => tab.id === savedTab) ? savedTab : 'assignments';
    });
    const [isNavOpen, setIsNavOpen] = useState(false);

    // Data State
    const [assignments, setAssignments] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [notes, setNotes] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [quizResults, setQuizResults] = useState([]);

    useEffect(() => {
        if (!user || user.role !== 'student') return undefined;
        let isActive = true;

        const loadDashboardData = async () => {
            try {
                if (isSupabaseConfigured) {
                    const [classAssignments, classQuizzes, classNotes, studentSubmissions, studentQuizResults] = await Promise.all([
                        loadLearningRecords('assignments'),
                        loadLearningRecords('quizzes'),
                        loadLearningRecords('notes'),
                        loadLearningRecords('submissions'),
                        loadLearningRecords('quizResults')
                    ]);
                    if (!isActive) return;
                    setAssignments(classAssignments);
                    setQuizzes(classQuizzes.filter(isQuizAvailable));
                    setNotes(classNotes);
                    setSubmissions(studentSubmissions);
                    setQuizResults(studentQuizResults);
                    return;
                }

                const allAssignments = JSON.parse(localStorage.getItem('assignments_db') || '[]');
                const allQuizzes = JSON.parse(localStorage.getItem('quizzes_db') || '[]');
                const allNotes = JSON.parse(localStorage.getItem('notes_db') || '[]');
                if (!isActive) return;
                setAssignments(allAssignments.filter(a => a.class === user.class));
                setQuizzes(allQuizzes.filter(q => q.class === user.class && isQuizAvailable(q)));
                setNotes(allNotes.filter(note => {
                    const targetClasses = note.targetClasses || [];
                    const targetStudentIds = note.targetStudentIds || [];
                    if (targetClasses.length || targetStudentIds.length) {
                        return targetClasses.includes(user.class) || targetStudentIds.includes(user.id);
                    }
                    return note.class === user.class;
                }));
                setSubmissions(JSON.parse(localStorage.getItem('submissions_db') || '[]'));
                setQuizResults(JSON.parse(localStorage.getItem('quiz_results_db') || '[]'));
            } catch (error) {
                console.error('Failed to load student learning data', error);
            }
        };

        loadDashboardData();
        return () => { isActive = false; };
    }, [user]);

    if (!user || user.role !== 'student') {
        return <Navigate to="/elearning" />;
    }

    return (
                <div className="min-h-screen bg-slate-50">
                    <LearningPortalHeader user={user} />
                    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="z-10 flex w-full shrink-0 flex-col bg-slate-900 pt-4 text-white shadow-xl md:sticky md:top-0 md:min-h-screen md:w-64 md:pt-0">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4 text-left sm:p-6 md:flex-col md:text-center">
                    <div className="hidden h-20 w-20 bg-slate-800 rounded-full items-center justify-center mx-auto mb-4 border-2 border-school-green md:flex">
                        <UserCircle size={48} className="text-slate-400" />
                    </div>
                    <div className="min-w-0 md:w-full">
                        <h2 className="truncate text-lg font-bold md:text-xl">{user.fullName}</h2>
                        <p className="mt-1 truncate text-sm text-school-green">{user.regNumber}</p>
                        <p className="mt-1 truncate text-xs text-slate-400">{user.class}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsNavOpen(open => !open)}
                        aria-label={isNavOpen ? 'Close dashboard menu' : 'Open dashboard menu'}
                        aria-expanded={isNavOpen}
                        aria-controls="student-dashboard-nav"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/20 text-white hover:bg-white/10 md:hidden"
                    >
                        {isNavOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
                <nav id="student-dashboard-nav" className={`${isNavOpen ? 'flex' : 'hidden'} flex-col gap-1 border-t border-white/10 px-3 pb-4 pt-3 sm:px-4 md:flex md:flex-1 md:gap-2 md:overflow-visible md:border-0 md:pb-4 md:pt-2`}>
                    {studentTabs.map(tab => (
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
            <div className="flex min-w-0 flex-1 flex-col">
            <main className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto p-4 pt-5 sm:pt-6 md:p-8">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                         {activeTab === 'assignments' && <AssignmentsTab assignments={assignments} submissions={submissions} setSubmissions={setSubmissions} user={user} />}
                         {activeTab === 'quizzes' && <QuizzesTab quizzes={quizzes} quizResults={quizResults} setQuizResults={setQuizResults} user={user} />}
                         {activeTab === 'notes' && <NotesTab notes={notes} />}
                         {activeTab === 'profile' && <ProfileTab user={user} />}
                         {activeTab === 'settings' && <LearningSettings user={user} views={studentTabs} />}
                         {activeTab === 'contact' && <LearningContact />}
                    </motion.div>
            </main>
            <LearningDashboardFooter user={user} onLogout={logout} onContact={() => setActiveTab('contact')} />
            </div>
                    </div>
        </div>
    );
};


const AssignmentsTab = ({ assignments, submissions, setSubmissions, user }) => {
    const [selectedFiles, setSelectedFiles] = useState({});
    const [messages, setMessages] = useState({});

    const getSubmission = (assignmentId) => submissions.find(submission => submission.assignmentId === assignmentId && submission.studentId === user.regNumber);

    const handleSubmit = async (assignment) => {
        const file = selectedFiles[assignment.id];
        if (!file) {
            setMessages(current => ({ ...current, [assignment.id]: 'Choose a file to upload first.' }));
            return;
        }
        const maximumSize = isSupabaseConfigured ? 25 * 1024 * 1024 : 1.5 * 1024 * 1024;
        if (file.size > maximumSize) {
            setMessages(current => ({ ...current, [assignment.id]: `The selected file exceeds the ${isSupabaseConfigured ? '25 MB' : '1.5 MB demo'} upload limit.` }));
            return;
        }

        const previousSubmission = getSubmission(assignment.id);
        let uploadedFilePath = '';
        setMessages(current => ({ ...current, [assignment.id]: 'Uploading your work...' }));
        try {
            const upload = isSupabaseConfigured
                ? await uploadStudentWork(file, user, assignment.id)
                : { filePath: await readFileAsDataUrl(file), fileType: getFileFormat(file) };
            uploadedFilePath = upload.filePath;
            const submission = {
                id: previousSubmission?.id || `${assignment.id}-${user.id}`,
                assignmentId: assignment.id,
                studentId: user.regNumber,
                class: user.class,
                submittedAt: new Date().toISOString(),
                fileName: file.name,
                filePath: upload.filePath,
                fileType: upload.fileType
            };

            if (isSupabaseConfigured) {
                const savedSubmission = await saveLearningRecord('submissions', submission, user);
                setSubmissions(current => [...current.filter(item => item.id !== savedSubmission.id), savedSubmission]);
                if (previousSubmission?.filePath && previousSubmission.filePath !== upload.filePath) {
                    await removeStudentWorkFile(previousSubmission.filePath).catch(() => {});
                }
            } else {
                const updated = [...submissions.filter(item => item.assignmentId !== assignment.id || item.studentId !== user.regNumber), submission];
                setSubmissions(updated);
                localStorage.setItem('submissions_db', JSON.stringify(updated));
            }
            setSelectedFiles(current => ({ ...current, [assignment.id]: null }));
            setMessages(current => ({ ...current, [assignment.id]: `Submitted ${file.name} (${getFileFormat(file)}).` }));
        } catch (error) {
            if (uploadedFilePath && isSupabaseConfigured) await removeStudentWorkFile(uploadedFilePath).catch(() => {});
            setMessages(current => ({ ...current, [assignment.id]: error.message || 'Could not upload this file.' }));
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-school-blue mb-8">My Assignments</h2>
            {assignments.length === 0 && <p className="text-slate-500 bg-white p-8 rounded-xl text-center shadow-sm">No assignments posted for your class yet.</p>}
            
            <div className="grid grid-cols-1 gap-4">
                {assignments.map(a => {
                    const submission = getSubmission(a.id);
                    const isOpen = isAssignmentOpen(a.dueDate);
                    const selectedFile = selectedFiles[a.id];
                    return (
                        <div key={a.id} className={`card flex flex-col md:flex-row gap-6 items-start justify-between border-l-4 ${submission ? 'border-l-school-green' : 'border-l-school-blue'}`}>
                            <div className="flex-1">
                                <h3 className="font-bold text-xl mb-1">{a.title}</h3>
                                <div className="flex gap-2 text-xs font-semibold mb-3">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">{a.subject}</span>
                                    {a.dueDate && <span className={isOpen ? 'text-slate-500' : 'text-red-600'}>Due: {a.dueDate}</span>}
                                </div>
                                <p className="text-slate-600 text-sm">{a.description}</p>
                                {submission?.fileName && <p className="mt-3 text-xs font-semibold text-school-green">Submitted: {submission.fileName} ({submission.fileType || 'FILE'})</p>}
                            </div>
                            <div className="w-full space-y-2 md:max-w-xs">
                                {isOpen ? (
                                    <>
                                      <label className="block text-xs font-semibold text-slate-600">{submission ? 'Replace submitted work' : 'Upload your work'}
                                        <input type="file" onChange={event => setSelectedFiles(current => ({ ...current, [a.id]: event.target.files?.[0] || null }))} className="mt-1 block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-school-blue/10 file:px-3 file:py-2 file:font-semibold file:text-school-blue" />
                                      </label>
                                      {selectedFile && <p className="break-all text-xs text-slate-500">Detected format: {getFileFormat(selectedFile)}</p>}
                                      <button type="button" disabled={!selectedFile} onClick={() => handleSubmit(a)} className="btn-primary flex items-center gap-2 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50">
                                        {submission ? 'Update work' : 'Submit work'} <Send size={16} />
                                      </button>
                                    </>
                                ) : (
                                    <p className="text-sm font-semibold text-red-600">Submission deadline passed.</p>
                                )}
                                {messages[a.id] && <p role="status" className="text-xs text-slate-600">{messages[a.id]}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const QuizzesTab = ({ quizzes, quizResults, setQuizResults, user }) => {
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const getResult = (quizId) => {
        return quizResults.find(r => r.quizId === quizId && r.studentId === user.regNumber);
    };

    const handleStart = (quiz) => {
        setActiveQuiz(quiz);
        setAnswers({});
        setCurrentIndex(0);
        setTimeLeft(quiz.questions[0]?.duration || 60);
    };

    const handleSubmitQuiz = async () => {
        let score = 0;
        let total = 0;
        let hasEssay = false;

        activeQuiz.questions.forEach((q, index) => {
            if (q.type === 'essay') {
                hasEssay = true;
                // essays are not auto-graded for points
            } else {
                total += (q.points || 1);
                // check if correct
                const isCorrect = q.type === 'short_answer'
                     ? answers[index]?.trim().toLowerCase() === q.correct?.trim().toLowerCase()
                     : answers[index] === q.correct;
                
                if (isCorrect) score += (q.points || 1);
            }
        });
        
        const result = { id: Date.now().toString(), quizId: activeQuiz.id, studentId: user.regNumber, class: user.class, score, total, hasEssay };
        if (isSupabaseConfigured) {
            try {
                const savedResult = await saveLearningRecord('quizResults', result, user);
                setQuizResults(current => [...current, savedResult]);
            } catch (error) {
                alert(error.message || 'Could not save your quiz result.');
                return;
            }
            setActiveQuiz(null);
            setAnswers({});
            setTimeLeft(null);
            return;
        }
        const updated = [...quizResults, result];
        setQuizResults(updated);
        localStorage.setItem('quiz_results_db', JSON.stringify(updated));
        saveFirestoreDocument('quiz_results', result).catch((error) => console.error('Failed to sync quiz result to Firebase', error));
        setActiveQuiz(null);
        setAnswers({});
        setTimeLeft(null);
    };

    const handleNextQuestion = () => {
        if (currentIndex < activeQuiz.questions.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setTimeLeft(activeQuiz.questions[nextIndex].duration || 60);
        } else {
            handleSubmitQuiz();
        }
    };

    useEffect(() => {
        if (!activeQuiz) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [activeQuiz, currentIndex]);

    useEffect(() => {
        if (activeQuiz && timeLeft === 0) {
            handleNextQuestion();
        }
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (activeQuiz) {
        const q = activeQuiz.questions[currentIndex];

        return (
            <div className="card space-y-6">
                <div className="sticky top-0 bg-white z-10 py-4 mb-4 border-b flex justify-between items-center shadow-sm -mx-6 px-6">
                    <div>
                        <h2 className="text-2xl font-bold">{activeQuiz.title}</h2>
                        <span className="bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full text-sm inline-block mt-2">{activeQuiz.subject}</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xl font-black px-4 py-2 rounded-lg ${timeLeft < 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-800'}`}>
                        <Timer size={24} />
                        {formatTime(timeLeft)}
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                        <span className="font-bold text-slate-500 uppercase tracking-widest text-sm">{q.section || 'General'}</span>
                        <span className="bg-slate-800 text-white font-bold px-3 py-1 rounded-md text-sm">Question {currentIndex + 1} of {activeQuiz.questions.length}</span>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-start mb-6">
                            <p className="font-bold text-xl">{currentIndex + 1}. {q.q}</p>
                            {q.type !== 'essay' && <span className="bg-slate-200 text-slate-600 font-bold px-2 py-1 rounded text-xs">{q.points || 1} pt{q.points !== 1 && 's'}</span>}
                            {q.type === 'essay' && <span className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-xs">Essay (Manual Review)</span>}
                        </div>
                        
                        {q.type === 'radio' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {['opt1', 'opt2', 'opt3', 'opt4'].map(optKey => (
                                    <label key={optKey} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${answers[currentIndex] === optKey ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500' : 'bg-white border-slate-200 hover:border-purple-300 shadow-sm'}`}>
                                        <input type="radio" name={`q-${currentIndex}`} value={optKey} checked={answers[currentIndex] === optKey} onChange={() => setAnswers({...answers, [currentIndex]: optKey})} className="w-5 h-5 text-purple-600" />
                                        <span className="text-lg">{q[optKey]}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {q.type === 'short_answer' && (
                            <input type="text" placeholder="Type your answer here..." value={answers[currentIndex] || ''} onChange={e => setAnswers({...answers, [currentIndex]: e.target.value})} className="w-full border border-slate-300 p-4 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-lg" />
                        )}

                        {q.type === 'essay' && (
                            <textarea placeholder="Write your essay or detailed answer here..." rows="6" value={answers[currentIndex] || ''} onChange={e => setAnswers({...answers, [currentIndex]: e.target.value})} className="w-full border border-slate-300 p-4 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-lg"></textarea>
                        )}
                    </div>
                </div>

                <div className="flex justify-between pt-6 border-t mt-8">
                    <span className="text-xs text-slate-400 font-bold uppercase mt-4">Auto-advances when timer hits 0</span>
                    <button onClick={handleNextQuestion} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-md">
                        {currentIndex < activeQuiz.questions.length - 1 ? 'Next Question' : 'Submit Exam'} <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-school-blue mb-8">My Quizzes</h2>
             {quizzes.length === 0 && <p className="text-slate-500 bg-white p-8 rounded-xl text-center shadow-sm">No quizzes available for your class.</p>}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quizzes.map(q => {
                    const result = getResult(q.id);
                    return (
                        <div key={q.id} className="card border-t-4 border-t-purple-500 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-xl">{q.title}</h3>
                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-semibold mt-2 inline-block">{q.subject}</span>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <span className="bg-purple-50 text-purple-600 text-xs font-bold px-2 py-1 rounded block">{q.questions.length} Qs</span>
                                    <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 block uppercase tracking-wider">Timed paging</span>
                                </div>
                            </div>
                            
                            <div className="mt-auto pt-6">
                                {result ? (
                                    <div className="bg-slate-50 rounded-lg p-3 text-center border">
                                        <p className="text-xs text-slate-500 font-bold tracking-wider uppercase mb-1">{result.hasEssay ? 'Score (Pending Review)' : 'Final Score'}</p>
                                        <p className="text-2xl font-black text-purple-600">{result.score} <span className="text-lg text-slate-400">/ {result.total}</span></p>
                                    </div>
                                ) : (
                                    <button onClick={() => handleStart(q)} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-purple-600 transition-colors flex justify-center items-center gap-2">
                                        Start Quiz <ChevronRight size={20}/>
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
             </div>
        </div>
    );
};

const ProfileTab = ({ user }) => (
    <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-school-blue mb-8">My Profile</h2>
        <div className="card text-center py-12">
             <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-school-green/20">
                <UserCircle size={80} className="text-slate-300" />
            </div>
            <h3 className="text-3xl font-bold mb-2">{user.fullName}</h3>
            <p className="text-xl text-slate-500 mb-6">{user.class}</p>

            <div className="bg-slate-50 inline-block p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Registration Number</p>
                <p className="text-xl font-bold text-school-blue">{user.regNumber}</p>
            </div>
        </div>
    </div>
);

const NotesTab = ({ notes }) => {
    const [signedUrls, setSignedUrls] = useState({});

    useEffect(() => {
        if (!isSupabaseConfigured) return undefined;
        let isActive = true;
        Promise.all(notes.filter(note => note.filePath).map(async note => [note.id, await getLearningNoteUrl(note.filePath)]))
            .then(entries => {
                if (isActive) setSignedUrls(Object.fromEntries(entries));
            })
            .catch(error => console.error('Failed to create note download links', error));
        return () => { isActive = false; };
    }, [notes]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-school-blue mb-8">My Lessons & Resources</h2>
            {notes.length === 0 && <p className="text-slate-500 bg-white p-8 rounded-xl text-center shadow-sm">No lessons available for your class.</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notes.map(n => (
                    <div key={n.id} className="card border-t-4 border-t-blue-500 flex flex-col">
                        <h3 className="font-bold text-xl mb-1">{n.title}</h3>
                        <div className="flex gap-2 text-xs font-semibold mb-3">
                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">{n.subject}</span>
                            <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded flex items-center gap-1"><FileText size={12}/> {n.fileName}</span>
                        </div>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-3">{n.description}</p>
                        
                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-400">Posted: {n.datePosted}</span>
                            <a href={signedUrls[n.id] || n.fileData || '#'} target={n.filePath ? '_blank' : undefined} rel={n.filePath ? 'noreferrer' : undefined} download={n.filePath ? undefined : n.fileName} className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors" title="Download">
                                Download <Download size={18} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentDashboard;
