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
          motto: "HUMILITY, UNITY, GOD'S LOVE",
          logo: "/runaba-logo.png",
          contact: {
            phone: "0788 859 152",
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
            discoverImage: "/slide_campus.png",
            passRate: "99% National Exam Pass Rate: Across both O-Level & A-Level.",
            staffRate: "100% Dedicated Staff: Passionate and certified educators.",
            facilities: ['Modern Science Labs', 'Extensive Library', 'Sports Complex', 'Secure Environment', 'ICT Integration', 'Mentorship Programs']
          }
        },
        about: {
          hero: {
            image: "/slide_campus.png",
            motto: "HUMILITY, UNITY, GOD'S LOVE"
          },
          headTeacher: {
            name: "Father BAZAMANZA Jean Nepomuscene",
            role: "Head Teacher, ES RUNABA",
            message: "Welcome to ES RUNABA. We are dedicated to creating a nurturing and dynamic environment. By building modern facilities like our new refectory and laboratories, we have transformed our students' experience, proudly driving our national exam success rate to 99% in both O-Level and A-Level. Excellence is our standard.",
            image: "/builder.jpeg"
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
        const normalizeMotto = (value) => {
          const motto = String(value || '').trim();
          return ['ORA PRO NOBIS', 'Ora Pro Nobis', 'Ora Pro nobis'].includes(motto)
            ? "HUMILITY, UNITY, GOD'S LOVE"
            : motto || defaultContent.general.motto;
        };

        merged.general.motto = normalizeMotto(merged.general.motto);
        merged.general.logo = defaultContent.general.logo;
        merged.general.contact.phone = defaultContent.general.contact.phone;
        if (merged.about?.hero) {
          merged.about.hero.motto = normalizeMotto(merged.about.hero.motto);
        }

        merged.general.schoolName = normalizeSchoolName(merged.general.schoolName);
        if (merged.general.logo !== parsed.general?.logo || merged.general.contact.phone !== parsed.general?.contact?.phone || merged.general.schoolName !== parsed.general?.schoolName || merged.general.motto !== parsed.general?.motto || (merged.about?.hero?.motto !== parsed.about?.hero?.motto)) {
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

  const normalizeClassName = (value) => {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/senior/g, 's')
      .replace(/\s+/g, '')
      .replace(/-/g, '');
  };

  const buildStudentPassword = (selectedClass, regNumber) => {
    const safeReg = String(regNumber || '').trim();
    return safeReg ? `ESR/${safeReg}` : 'ESR/student';
  };

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

  const loginStudent = (regNumber, password, selectedClass = null) => {
    const normalizedReg = String(regNumber || '').trim();
    const normalizedPassword = String(password || '').trim();
    const expectedPassword = buildStudentPassword(selectedClass, normalizedReg);
    const normalizedSelectedClass = normalizeClassName(selectedClass);

    const students = JSON.parse(localStorage.getItem('students_db') || '[]');
    const matchingStudent = students.find((s) => s.regNumber === normalizedReg);

    if (matchingStudent && normalizedSelectedClass && normalizeClassName(matchingStudent.class) !== normalizedSelectedClass) {
      return { success: false, error: 'This student account is not assigned to the selected class.' };
    }

    const student = students.find((s) => {
      const storedPassword = String(s.password || '').trim();
      return s.regNumber === normalizedReg && (
        storedPassword === normalizedPassword ||
        storedPassword === expectedPassword ||
        normalizedPassword === expectedPassword
      );
    });

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
    <AuthContext.Provider value={{ user, loginTeacher, loginStudent, buildStudentPassword, logout, isInitialized, siteContent, updateSiteContent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
