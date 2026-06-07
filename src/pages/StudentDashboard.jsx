import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { BookOpen, CheckSquare, UserCircle, LogOut, CheckCircle2, ChevronRight, Send, FileText, Download, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('assignments');

    // Data State
    const [assignments, setAssignments] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [notes, setNotes] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [quizResults, setQuizResults] = useState([]);

    useEffect(() => {
        if (user && user.role === 'student') {
            const allAssignments = JSON.parse(localStorage.getItem('assignments_db') || '[]');
            const allQuizzes = JSON.parse(localStorage.getItem('quizzes_db') || '[]');
            
            // Filter by student's class
            setAssignments(allAssignments.filter(a => a.class === user.class));
            setQuizzes(allQuizzes.filter(q => q.class === user.class));
            
            const allNotes = JSON.parse(localStorage.getItem('notes_db') || '[]');
            setNotes(allNotes.filter(n => n.class === user.class));
            
            setSubmissions(JSON.parse(localStorage.getItem('submissions_db') || '[]'));
            setQuizResults(JSON.parse(localStorage.getItem('quiz_results_db') || '[]'));
        }
    }, [user]);

    if (!user || user.role !== 'student') {
        return <Navigate to="/e-learning" />;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col pt-20 shadow-xl z-10 md:min-h-screen">
                <div className="p-6 border-b border-white/10 text-center">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-school-green">
                        <UserCircle size={48} className="text-slate-400" />
                    </div>
                    <h2 className="text-xl font-bold">{user.fullName}</h2>
                    <p className="text-school-green text-sm mt-1 font-mono">{user.regNumber}</p>
                    <p className="text-slate-400 text-xs mt-1">{user.class}</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {[
                        { id: 'assignments', label: 'My Assignments', icon: BookOpen },
                        { id: 'quizzes', label: 'My Quizzes', icon: CheckSquare },
                        { id: 'notes', label: 'My Notes', icon: FileText },
                        { id: 'profile', label: 'Profile', icon: UserCircle },
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
            <main className="flex-1 p-4 md:p-8 pt-24 overflow-y-auto w-full max-w-4xl mx-auto">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                         {activeTab === 'assignments' && <AssignmentsTab assignments={assignments} submissions={submissions} setSubmissions={setSubmissions} user={user} />}
                         {activeTab === 'quizzes' && <QuizzesTab quizzes={quizzes} quizResults={quizResults} setQuizResults={setQuizResults} user={user} />}
                         {activeTab === 'notes' && <NotesTab notes={notes} />}
                         {activeTab === 'profile' && <ProfileTab user={user} />}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};


const AssignmentsTab = ({ assignments, submissions, setSubmissions, user }) => {
    
    const isSubmitted = (assignmentId) => {
        return submissions.some(s => s.assignmentId === assignmentId && s.studentId === user.regNumber);
    };

    const handleSubmit = (assignmentId) => {
        const newSubmission = { id: Date.now().toString(), assignmentId, studentId: user.regNumber, submittedAt: new Date().toISOString() };
        const updated = [...submissions, newSubmission];
        setSubmissions(updated);
        localStorage.setItem('submissions_db', JSON.stringify(updated));
        alert("Assignment marked as submitted (Demo)");
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-school-blue mb-8">My Assignments</h2>
            {assignments.length === 0 && <p className="text-slate-500 bg-white p-8 rounded-xl text-center shadow-sm">No assignments posted for your class yet.</p>}
            
            <div className="grid grid-cols-1 gap-4">
                {assignments.map(a => {
                    const submitted = isSubmitted(a.id);
                    return (
                        <div key={a.id} className={`card flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-l-4 ${submitted ? 'border-l-school-green opacity-70' : 'border-l-school-blue'}`}>
                            <div className="flex-1">
                                <h3 className="font-bold text-xl mb-1">{a.title}</h3>
                                <div className="flex gap-2 text-xs font-semibold mb-3">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">{a.subject}</span>
                                    <span className={submitted ? 'text-school-green' : 'text-red-500'}>Due: {a.dueDate}</span>
                                </div>
                                <p className="text-slate-600 text-sm">{a.description}</p>
                            </div>
                            <div>
                                {submitted ? (
                                     <div className="flex items-center gap-2 text-school-green font-bold bg-school-green/10 px-4 py-2 rounded-lg">
                                        <CheckCircle2 size={20}/> Submitted
                                     </div>
                                ) : (
                                    <button onClick={() => handleSubmit(a.id)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
                                        Mark Done <CheckCircle2 size={18}/>
                                    </button>
                                )}
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

    const handleSubmitQuiz = () => {
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
        
        const result = { id: Date.now().toString(), quizId: activeQuiz.id, studentId: user.regNumber, score, total, hasEssay };
        const updated = [...quizResults, result];
        setQuizResults(updated);
        localStorage.setItem('quiz_results_db', JSON.stringify(updated));
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
                    <div className={`flex items-center gap-2 font-mono text-xl font-black px-4 py-2 rounded-lg ${timeLeft < 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-800'}`}>
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
                <p className="text-xl font-mono font-bold text-school-blue">{user.regNumber}</p>
            </div>
        </div>
    </div>
);

const NotesTab = ({ notes }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-school-blue mb-8">My Notes & Resources</h2>
            {notes.length === 0 && <p className="text-slate-500 bg-white p-8 rounded-xl text-center shadow-sm">No notes available for your class.</p>}

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
                            <a href={n.fileData} download={n.fileName} className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors" title="Download">
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
