import React, { createContext, useContext, useState, useEffect } from 'react';
import { normalizeSchoolName } from '../utils/translate';
import { isSupabaseConfigured, supabase } from '../supabase';
import { studentAuthEmail } from '../utils/studentAuth';

const AuthContext = createContext(null);

const mapProfileToUser = (profile) => ({
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
  subject: profile.subject
});

const deepMergeContent = (defaults, overrides) => {
  const result = { ...defaults };
  if (!overrides || typeof overrides !== 'object') return result;

  Object.keys(overrides).forEach((key) => {
    if (overrides[key] && typeof overrides[key] === 'object' && !Array.isArray(overrides[key]) && defaults[key]) {
      result[key] = deepMergeContent(defaults[key], overrides[key]);
    } else {
      result[key] = overrides[key];
    }
  });
  return result;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [siteContent, setSiteContent] = useState(null);

  const updateSiteContent = async (newContent) => {
    setSiteContent(newContent);
    localStorage.setItem('es_runaba_content', JSON.stringify(newContent));
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('site_content').upsert({
        id: 'main',
        content: newContent,
        updated_by: user?.id || null,
        updated_at: new Date().toISOString()
      });
      if (error) {
        console.error('Failed to save site content to Supabase', error);
        throw error;
      }
    }
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
      if (!isSupabaseConfigured) localStorage.removeItem('es_runaba_user');
      const storedStaff = localStorage.getItem('staff_db');
      if (storedStaff) {
        const staffRecords = JSON.parse(storedStaff);
        const nonDemoStaff = staffRecords.filter((staff) => !(
          staff.id === 'teacher_1' &&
          staff.username === 'teacher' &&
          staff.email === 'teacher@runaba.edu'
        ));
        if (nonDemoStaff.length !== staffRecords.length) {
          localStorage.setItem('staff_db', JSON.stringify(nonDemoStaff));
        }
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

      // Load Site Content with Migration/Merge logic
      const storedContent = localStorage.getItem('es_runaba_content');
      if (!storedContent) {
        localStorage.setItem('es_runaba_content', JSON.stringify(defaultContent));
        setSiteContent(defaultContent);
      } else {
        const parsed = JSON.parse(storedContent);
        const merged = deepMergeContent(defaultContent, parsed);
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

      if (isSupabaseConfigured) {
        supabase.from('site_content').select('content').eq('id', 'main').maybeSingle()
          .then(({ data, error }) => {
            if (error) {
              console.error('Failed to load site content from Supabase', error);
              return;
            }
            if (data?.content) setSiteContent(deepMergeContent(defaultContent, data.content));
          })
          .catch((error) => console.error('Failed to load site content from Supabase', error));
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

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let isMounted = true;
    const syncUser = async (session) => {
      if (!session?.user) {
        if (isMounted) setUser(null);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Failed to load Supabase profile', error);
        return;
      }
      if (isMounted) setUser(mapProfileToUser(profile));
    };

    supabase.auth.getSession().then(({ data: { session } }) => syncUser(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      Promise.resolve().then(() => syncUser(session));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginTeacher = async (username, password) => {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase sign-in is not configured for this deployment.' };

    const { data, error } = await supabase.auth.signInWithPassword({ email: username, password });
    if (error) return { success: false, error: 'Invalid email or password.' };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (profileError || profile.role !== 'teacher') {
      await supabase.auth.signOut();
      return { success: false, error: 'This account is not registered for teacher access.' };
    }

    setUser(mapProfileToUser(profile));
    return { success: true };
  };

  const loginDos = async (username, password) => {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase sign-in is not configured for this deployment.' };

    const { data, error } = await supabase.auth.signInWithPassword({ email: username, password });
    if (error) return { success: false, error: 'Invalid email or password.' };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (profileError || profile.role !== 'dos') {
      await supabase.auth.signOut();
      return { success: false, error: 'This account is not registered for Director of Studies access.' };
    }

    setUser(mapProfileToUser(profile));
    return { success: true };
  };

  const loginStudent = async (regNumber, password, selectedClass = null) => {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase sign-in is not configured for this deployment.' };

    const { data, error } = await supabase.auth.signInWithPassword({
      email: studentAuthEmail(regNumber),
      password
    });
    if (error) return { success: false, error: 'Invalid registration number or password.' };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (profileError || profile.role !== 'student') {
      await supabase.auth.signOut();
      return { success: false, error: 'This account is not registered for student access.' };
    }

    setUser(mapProfileToUser(profile));
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('es_runaba_user');
    if (isSupabaseConfigured) await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loginTeacher, loginDos, loginStudent, logout, isInitialized, siteContent, updateSiteContent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
