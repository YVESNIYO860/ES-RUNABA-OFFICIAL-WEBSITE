import React, { createContext, useContext, useState, useEffect } from 'react';
import { normalizeSchoolName } from '../utils/translate';
import { isSupabaseConfigured, supabase } from '../supabase';
import { studentAuthEmail } from '../utils/studentAuth';

const AuthContext = createContext(null);
const AUTH_PROFILE_STORAGE_KEY = 'es_runaba_authenticated_profile';

const getCachedAuthenticatedProfile = (userId) => {
  try {
    const profile = JSON.parse(localStorage.getItem(AUTH_PROFILE_STORAGE_KEY) || 'null');
    return profile?.id === userId ? profile : null;
  } catch {
    return null;
  }
};

const persistAuthenticatedProfile = (profile) => {
  try {
    localStorage.setItem(AUTH_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.warn('Could not cache the signed-in profile for page refresh.', error);
  }
};

const isPrimaryDosAccount = (profile) =>
  profile.role === 'teacher'
  && profile.is_admin
  && profile.email?.toLowerCase() === 'yvesniyonkuru2022@gmail.com';

const mapProfileToUser = (profile) => {
  const role = isPrimaryDosAccount(profile) ? 'dos' : profile.role;
  const fullName = profile.full_name?.trim().toLowerCase() === profile.email?.trim().toLowerCase()
    ? (role === 'dos' ? 'Director of Studies' : 'ES RUNABA User')
    : profile.full_name;
  return {
  id: profile.id,
  role,
  name: fullName,
  fullName,
  email: profile.email,
  username: profile.username,
  isAdmin: profile.is_admin,
  regNumber: profile.reg_number,
  class: profile.class,
  startYear: profile.start_year,
  subject: profile.subject
  };
};

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
  const [isAuthInitialized, setIsAuthInitialized] = useState(!isSupabaseConfigured);
  const [siteContent, setSiteContent] = useState(null);

  const updateSiteContent = async (newContent) => {
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
    localStorage.setItem('es_runaba_content', JSON.stringify(newContent));
    setSiteContent(newContent);
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
          customClasses: [],
          classRenames: {},
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
    let isSessionLoaded = false;
    let queuedSession;
    let latestSyncId = 0;
    const syncUser = async (session) => {
      const syncId = ++latestSyncId;
      if (!session?.user) {
        if (isMounted) {
          setUser(null);
          localStorage.removeItem(AUTH_PROFILE_STORAGE_KEY);
          setIsAuthInitialized(true);
        }
        return;
      }

      const cachedProfile = getCachedAuthenticatedProfile(session.user.id);
      if (isMounted && cachedProfile) {
        setUser(cachedProfile);
        setIsAuthInitialized(true);
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) throw error;
        if (!profile) {
          if (!cachedProfile) console.error('No Supabase profile exists for the signed-in account.');
          return;
        }

        const authenticatedProfile = mapProfileToUser(profile);
        if (isMounted && syncId === latestSyncId) {
          setUser(authenticatedProfile);
          persistAuthenticatedProfile(authenticatedProfile);
        }
      } catch (error) {
        console.error('Failed to load Supabase profile', error);
        if (!cachedProfile && isMounted && syncId === latestSyncId) setUser(null);
      } finally {
        if (isMounted && syncId === latestSyncId) setIsAuthInitialized(true);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      isSessionLoaded = true;
      void syncUser(queuedSession ?? session);
    }).catch((error) => {
      console.error('Failed to restore the Supabase session', error);
      if (isMounted) setIsAuthInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isSessionLoaded) {
        queuedSession = session;
        return;
      }
      void syncUser(session);
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

    const authenticatedProfile = mapProfileToUser(profile);
    setUser(authenticatedProfile);
    persistAuthenticatedProfile(authenticatedProfile);
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
    if (profileError || (profile.role !== 'dos' && !isPrimaryDosAccount(profile))) {
      await supabase.auth.signOut();
      return { success: false, error: 'This account is not registered for Director of Studies access.' };
    }

    const authenticatedProfile = mapProfileToUser(profile);
    setUser(authenticatedProfile);
    persistAuthenticatedProfile(authenticatedProfile);
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
    if (selectedClass && profile.class !== selectedClass) {
      await supabase.auth.signOut();
      return { success: false, error: 'The selected class does not match this student account.' };
    }

    const authenticatedProfile = mapProfileToUser(profile);
    setUser(authenticatedProfile);
    persistAuthenticatedProfile(authenticatedProfile);
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('es_runaba_user');
    localStorage.removeItem(AUTH_PROFILE_STORAGE_KEY);
    if (isSupabaseConfigured) await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loginTeacher, loginDos, loginStudent, logout, isInitialized: isInitialized && isAuthInitialized, siteContent, updateSiteContent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
