import React, { createContext, useContext, useState, useEffect } from 'react';
import { normalizeSchoolName } from '../utils/translate';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [siteContent, setSiteContent] = useState(null);

  const updateSiteContent = (newContent) => {
    setSiteContent(newContent);
    localStorage.setItem('es_runaba_content', JSON.stringify(newContent));
  };

  // Initialize from localStorage
  useEffect(() => {
    const defaultContent = {
        general: {
          schoolName: "ES RUNABA",
          motto: "ORA PRO NOBIS",
          logo: "/runaba-logo.png",
          contact: {
            phone: "+250 783 883 046",
            email: "info@esrunaba.edu",
            location: "Burera, Butaro, Rwanda",
            mapCoords: "Runaba Sector, Burera District"
          },
          announcement: {
            text: "Welcome to the official ES RUNABA website! We are dedicated to excellence in education.",
            isActive: true
          }
        },
        home: {
          hero: [
            { src: '/slide_classroom.png', title: 'WELCOME TO ES RUNABA', subtitle: 'Where discipline and skill starts from. Started for deep learning and academic excellence.', color: 'from-school-blue/80' },
            { src: '/slide_sports.png', title: 'Thriving Sports Culture', subtitle: 'We nurture champions on and off the field — discipline, teamwork, and fun.', color: 'from-emerald-900/80' },
            { src: '/slide_lab.png', title: 'State-of-the-Art Labs', subtitle: 'Science & ICT laboratories equipped to spark curiosity and innovation.', color: 'from-indigo-900/80' },
            { src: '/slide_graduation.png', title: 'Celebrating Success', subtitle: 'Proud graduates who carry the RUNABA spirit into university and beyond.', color: 'from-amber-900/80' },
            { src: '/slide_campus.png', title: 'Our Beautiful School', subtitle: 'Nestled in the green hills of Burera — a peaceful haven for focused learning.', color: 'from-teal-900/80' }
          ],
          about: {
            discoverTitle: "Shaping the Leaders of Tomorrow",
            discoverText: "Founded in 2003, ES RUNABA has evolved into a premier educational institution in Burera. We provide a holistic learning environment where academic excellence meets character development, guided by a visionary leadership team.",
            discoverImage: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop",
            passRate: "99% National Exam Pass Rate: Across both O-Level & A-Level.",
            staffRate: "100% Dedicated Staff: Passionate and certified educators.",
            facilities: ['Modern Science Labs', 'Extensive Library', 'Sports Complex', 'Secure Environment', 'ICT Integration', 'Mentorship Programs']
          }
        },
        about: {
          hero: {
            image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop",
            motto: "Ora Pro Nobis"
          },
          headTeacher: {
            name: "Father BAZAMANZA Jean Nepomuscene",
            role: "Head Teacher, ES RUNABA",
            message: "Welcome to ES RUNABA. We are dedicated to creating a nurturing and dynamic environment. By building modern facilities like our new refectory and laboratories, we have transformed our students' experience, proudly driving our national exam success rate to 99% in both O-Level and A-Level. Excellence is our standard.",
            image: "https://images.unsplash.com/photo-1544168190-79c17527004f?q=80&w=1976&auto=format&fit=crop"
          }
        }
      };

    try {
      const storedUser = localStorage.getItem('es_runaba_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // Initialize DB if not exists
      const dbs = ['students_db', 'assignments_db', 'quizzes_db', 'submissions_db', 'quiz_results_db', 'notes_db'];
      dbs.forEach(db => {
        if (!localStorage.getItem(db)) localStorage.setItem(db, JSON.stringify([]));
      });

      if (!localStorage.getItem('events_db')) {
        localStorage.setItem('events_db', JSON.stringify([
          { id: '1', date: '15 May', title: 'National Science Fair', loc: 'Kigali Arena', desc: 'Our senior students will present their innovative projects at the national level.' },
          { id: '2', date: '22 Jun', title: 'ES RUNABA Cultural Day', loc: 'School Assembly', desc: 'A celebration of Rwandan culture through music, dance, and poetry.' },
          { id: '3', date: '10 Jul', title: 'Inter-House Sports Finals', loc: 'Main Field', desc: 'The climax of the school sports season. Which house will take the cup?' }
        ]));
      }

      if (!localStorage.getItem('staff_db')) {
        localStorage.setItem('staff_db', JSON.stringify([
          { id: 'teacher_1', name: 'Admin Teacher', username: 'teacher', email: 'teacher@runaba.edu', password: 'runaba2024', role: 'teacher', isAdmin: false }
        ]));
      }

      // Load Site Content with Migration/Merge logic
      const storedContent = localStorage.getItem('es_runaba_content');
      if (!storedContent) {
        localStorage.setItem('es_runaba_content', JSON.stringify(defaultContent));
        setSiteContent(defaultContent);
      } else {
        const parsed = JSON.parse(storedContent);
        
        // Deep merge helper to ensure all keys exist
        const deepMerge = (def, par) => {
          const result = { ...def };
          if (!par || typeof par !== 'object') return result;
          
          Object.keys(par).forEach(key => {
            if (par[key] && typeof par[key] === 'object' && !Array.isArray(par[key]) && def[key]) {
              result[key] = deepMerge(def[key], par[key]);
            } else {
              result[key] = par[key];
            }
          });
          return result;
        };

        const merged = deepMerge(defaultContent, parsed);
        merged.general.schoolName = normalizeSchoolName(merged.general.schoolName);
        if (merged.general.schoolName !== parsed.general?.schoolName) {
          localStorage.setItem('es_runaba_content', JSON.stringify(merged));
        }
        setSiteContent(merged);
      }
    } catch (err) {
      console.error("Initialization error:", err);
      localStorage.removeItem('es_runaba_content');
      setSiteContent(defaultContent);
    } finally {
      setTimeout(() => {
        setIsInitialized(true);
      }, 800);
    }
  }, []);

  const loginTeacher = (username, password) => {
    // 1. Root / Builder Login (Absolute Override)
    if (
      (username === 'yvesniyonkuru2022@gmail.com' || username === 'yvesniyonkuru') &&
      password === 'yvesniyonkuru'
    ) {
      const adminUser = { role: 'teacher', name: 'NIYONKURU Yves', email: 'yvesniyonkuru2022@gmail.com', isAdmin: true };
      setUser(adminUser);
      localStorage.setItem('es_runaba_user', JSON.stringify(adminUser));
      return { success: true };
    }

    // 2. Database Login for regular Staff/Admins
    const staffDB = JSON.parse(localStorage.getItem('staff_db') || '[]');
    const matchingStaff = staffDB.find(s => 
      (s.username === username || s.email === username) && s.password === password
    );

    if (matchingStaff) {
      const staffUser = { role: 'teacher', name: matchingStaff.name, email: matchingStaff.email, isAdmin: matchingStaff.isAdmin };
      setUser(staffUser);
      localStorage.setItem('es_runaba_user', JSON.stringify(staffUser));
      return { success: true };
    }

    return { success: false, error: 'Invalid credentials. Please check your username/email and password.' };
  };

  const loginStudent = (regNumber, password) => {
    const students = JSON.parse(localStorage.getItem('students_db') || '[]');
    const student = students.find(s => s.regNumber === regNumber && s.password === password);
    
    if (student) {
      const studentUser = { role: 'student', ...student };
      setUser(studentUser);
      localStorage.setItem('es_runaba_user', JSON.stringify(studentUser));
      return { success: true };
    }
    return { success: false, error: 'Invalid registration number or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('es_runaba_user');
  };

  return (
    <AuthContext.Provider value={{ user, loginTeacher, loginStudent, logout, isInitialized, siteContent, updateSiteContent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
