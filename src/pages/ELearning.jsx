import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, Laptop, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ELearning = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    // Auth context
    const { loginStudent } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        regNumber: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        setTimeout(() => {
            const result = loginStudent(formData.regNumber, formData.password);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => navigate('/student-dashboard'), 1000);
            } else {
                setError(result.error);
                setIsLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="flex flex-col">
             {/* Hero Section */}
            <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden bg-school-blue">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-school-blue to-transparent opacity-80"></div>
                <div className="absolute inset-0 bg-school-blue/40"></div>
                
                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-4 text-white"
                    >
                        E-Learning Portal
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-200 max-w-2xl mx-auto"
                    >
                        Access your courses, assignments, and take quizzes anywhere, anytime.
                    </motion.p>
                </div>
            </section>

            <div className="flex-1 flex items-center justify-center py-20 px-4 bg-slate-50 relative">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden relative z-10"
                >
                    {success ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-10 text-center space-y-6"
                        >
                            <div className="w-20 h-20 bg-school-green/10 text-school-green rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800">Welcome Back!</h2>
                            <p className="text-slate-600">
                                Signing you into the learning portal...
                            </p>
                        </motion.div>
                    ) : (
                        <div className="p-8 md:p-10">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-school-blue text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-school-blue/20">
                                    <Laptop size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Student Login</h2>
                                <p className="text-slate-500 text-sm mt-2 font-medium bg-amber-50 text-amber-700 py-2 rounded-md">Note: Student accounts are created by teachers.</p>
                            </div>

                            <AnimatePresence mode="wait">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-3 border border-red-100"
                                        >
                                            <AlertCircle size={18} />
                                            {error}
                                        </motion.div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Registration Number</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input 
                                                type="text" 
                                                name="regNumber"
                                                required
                                                value={formData.regNumber}
                                                onChange={handleChange}
                                                placeholder="e.g. 2024/ESR/001"
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-school-blue focus:ring-4 focus:ring-school-blue/10 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input 
                                                type="password" 
                                                name="password"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-school-blue focus:ring-4 focus:ring-school-blue/10 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="w-full btn-primary py-4 mt-6 flex items-center justify-center gap-2 group disabled:opacity-70"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Login to Dashboard
                                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ELearning;
