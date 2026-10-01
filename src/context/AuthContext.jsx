import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { normalizeSchoolName } from '../utils/translate';
import { isSupabaseConfigured, supabase } from '../supabase';
import { studentAuthEmail } from '../utils/studentAuth';

const AuthContext = createContext(null);
const AUTH_PROFILE_STORAGE_KEY = 'es_runaba_authenticated_profile';

/* Idle sign-out window, the point at which the user is warned, and how often
   the idle countdown is checked. */
const INACTIVITY_LIMIT_MS = 20 * 60 * 1000;
const INACTIVITY_WARNING_MS = 19 * 60 * 1000;
const ACTIVITY_CHECK_INTERVAL_MS = 15 * 1000;
/* A session recovery attempt gets this long before the portal moves on, so a
   slow network can never trap the app on the loading screen. */
const SESSION_RECOVERY_TIMEOUT_MS = 5 * 1000;
/* Where the reason for an automatic sign-out is kept so the sign-in screen
   can explain why the user must log in again. */
const SESSION_END_STORAGE_KEY = 'es_runaba_session_end';
const LAST_ACTIVITY_STORAGE_KEY = 'es_runaba_last_activity_at';

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

/* Used to try one session recovery after a page refresh, before decision that
   the session really is over. */
const hasCachedAuthenticatedProfile = () => {
  try {
    return Boolean(JSON.parse(localStorage.getItem(AUTH_PROFILE_STORAGE_KEY) || 'null'));
  } catch {
    return false;
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
  subject: profile.subject,
  photoUrl: profile.photo_url || profile.photoUrl || ''
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
  const [sessionWarning, setSessionWarning] = useState(false);
  const [sessionDeadline, setSessionDeadline] = useState(null);
  const [sessionEnded, setSessionEnded] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_END_STORAGE_KEY) || 'null');
    } catch {
      return null;
    }
  });
  const userRef = useRef(null);
  const endReasonRef = useRef(null);
  const recoveryAttemptedRef = useRef(false);
  const lastActivityAtRef = useRef(Date.now());

  /* The idle tracker and the Supabase auth listener need the current user
     without re-subscribing on every profile refresh, so mirror it in a ref. */
  useEffect(() => {
    userRef.current = user;
  }, [user]);

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

  /* Forgets the "session ended" note once the user is back on the sign-in
     screen or signed in again. */
  const clearSessionEnded = useCallback(() => {
    setSessionEnded(null);
    try {
      sessionStorage.removeItem(SESSION_END_STORAGE_KEY);
    } catch {
      /* Storage can be unavailable in private modes; the in-memory state still works. */
    }
  }, []);

  /* Single exit point for signing out. A manual sign-out stays silent, while
     an automatic one (20 minutes idle, or a session that expired) records the
     reason so the sign-in screen can tell the user to log in again. */
  const endSession = useCallback(async (reason = 'manual') => {
    endReasonRef.current = reason;
    recoveryAttemptedRef.current = false;
    const previousUser = userRef.current;
    userRef.current = null;
    setUser(null);
    setSessionWarning(false);
    setSessionDeadline(null);
    localStorage.removeItem('es_runaba_user');
    localStorage.removeItem(AUTH_PROFILE_STORAGE_KEY);
    localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
    if (reason !== 'manual' && previousUser) {
      const ended = {
        reason,
        role: previousUser.role,
        name: previousUser.name || previousUser.fullName || '',
        at: Date.now()
      };
      setSessionEnded(ended);
      try {
        sessionStorage.setItem(SESSION_END_STORAGE_KEY, JSON.stringify(ended));
      } catch {
        /* Keep signing out even when session storage is blocked. */
      }
    }
    if (isSupabaseConfigured) await supabase.auth.signOut();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let isMounted = true;
    let isSessionLoaded = false;
    let queuedSession;
    let latestSyncId = 0;

    /* A refresh hiccup must not log a teacher out mid-lesson, but a slow
       network must not freeze the portal either: the recovery attempt below
       gets a short window, then the session is treated as over. */
    const recoverSessionOnce = async () => {
      try {
        const recoveryAttempt = supabase.auth.refreshSession()
          .then(({ data, error }) => (!error && data?.session?.user ? data.session : null))
          .catch((recoveryError) => {
            console.warn('Could not recover the portal session', recoveryError);
            return null;
          });
        const recoveryTimeout = new Promise((resolve) => {
          window.setTimeout(() => resolve(null), SESSION_RECOVERY_TIMEOUT_MS);
        });
        return await Promise.race([recoveryAttempt, recoveryTimeout]);
      } catch (recoveryError) {
        console.warn('Could not recover the portal session', recoveryError);
        return null;
      }
    };

    const syncUser = async (session) => {
      const syncId = ++latestSyncId;
      if (!session?.user) {
        const shouldTryRecovery = isMounted
          && endReasonRef.current === null
          && !recoveryAttemptedRef.current
          && (userRef.current || hasCachedAuthenticatedProfile());
        if (shouldTryRecovery) {
          recoveryAttemptedRef.current = true;
          const recoveredSession = await recoverSessionOnce();
          if (recoveredSession?.user) {
            await syncUser(recoveredSession);
            return;
          }
        }
        if (syncId !== latestSyncId) return;
        if (isMounted) {
          if (userRef.current) {
            /* The session vanished while the portal was open (expired or
               closed elsewhere): explain that on the sign-in screen instead
               of leaving the dashboard blank. */
            void endSession('expired');
          } else {
            setUser(null);
            localStorage.removeItem(AUTH_PROFILE_STORAGE_KEY);
          }
        }
        /* The auth gate is always released, so the portal can never remain
           stuck on the loading screen. */
        if (isMounted) setIsAuthInitialized(true);
        return;
      }

      endReasonRef.current = null;
      recoveryAttemptedRef.current = false;
      clearSessionEnded();

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
  }, [clearSessionEnded, endSession]);

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
    endReasonRef.current = null;
    clearSessionEnded();
    markActivityNow();
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
    endReasonRef.current = null;
    clearSessionEnded();
    markActivityNow();
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
    endReasonRef.current = null;
    clearSessionEnded();
    markActivityNow();
    return { success: true };
  };

  const logout = useCallback(() => endSession('manual'), [endSession]);

  /* Applies a new profile photo everywhere straight away (header, lists and
     the cached profile used after a refresh), without a reload. */
  const updateUserPhoto = useCallback((photoUrl) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, photoUrl: photoUrl || '' };
      persistAuthenticatedProfile(next);
      return next;
    });
  }, []);

  /* Restarts the idle countdown. Fresh sign-ins and "stay signed in" taps use
     this so they can never inherit a stale timestamp from a previous visit
     (which could otherwise cause an instant sign-out right after logging in). */
  const markActivityNow = useCallback(() => {
    const now = Date.now();
    lastActivityAtRef.current = now;
    try {
      localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(now));
    } catch {
      /* Ignore storage failures; the in-memory timestamp still counts. */
    }
  }, []);

  /* Called by the warning banner: any real interaction counts as activity and
     clears the idle warning, restarting the 20 minute countdown. */
  const staySignedIn = useCallback(() => {
    markActivityNow();
    setSessionWarning(false);
    setSessionDeadline(null);
  }, [markActivityNow]);

  /* Sign the user out after 20 minutes without any activity, so an unattended
     device cannot keep a portal session open. The countdown is checked on an
     interval against a persisted timestamp, so it also stays correct after a
     suspended background tab or a sleeping laptop. Any real interaction
     (typing, clicking, scrolling, key presses, touch) restarts the countdown. */
  useEffect(() => {
    if (!user) return undefined;

    const storedActivity = Number(localStorage.getItem(LAST_ACTIVITY_STORAGE_KEY));
    lastActivityAtRef.current = Number.isFinite(storedActivity) && storedActivity > 0 && storedActivity <= Date.now()
      ? storedActivity
      : Date.now();

    const markActivity = () => {
      lastActivityAtRef.current = Date.now();
      setSessionWarning((current) => (current ? false : current));
      setSessionDeadline((current) => (current ? null : current));
    };

    const checkIdleTime = () => {
      const idleFor = Date.now() - lastActivityAtRef.current;
      if (idleFor >= INACTIVITY_LIMIT_MS) {
        window.clearInterval(intervalId);
        void endSession('inactivity');
        return;
      }
      try {
        localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(lastActivityAtRef.current));
      } catch {
        /* Ignore storage failures; the countdown keeps working in memory. */
      }
      if (idleFor >= INACTIVITY_WARNING_MS) {
        setSessionWarning(true);
        setSessionDeadline(lastActivityAtRef.current + INACTIVITY_LIMIT_MS);
      } else {
        setSessionWarning((current) => (current ? false : current));
        setSessionDeadline((current) => (current ? null : current));
      }
    };

    const handleVisibility = () => {
      // Returning to the tab re-checks the countdown without counting as activity.
      if (document.visibilityState === 'visible') checkIdleTime();
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'wheel', 'touchstart', 'pointerdown', 'focus'];
    events.forEach(event => window.addEventListener(event, markActivity, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibility);
    const intervalId = window.setInterval(checkIdleTime, ACTIVITY_CHECK_INTERVAL_MS);
    checkIdleTime();

    return () => {
      window.clearInterval(intervalId);
      events.forEach(event => window.removeEventListener(event, markActivity));
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user, endSession]);

  return (
    <AuthContext.Provider value={{ user, loginTeacher, loginDos, loginStudent, logout, updateUserPhoto, isInitialized: isInitialized && isAuthInitialized, siteContent, updateSiteContent, sessionWarning, sessionDeadline, sessionEnded, staySignedIn, clearSessionEnded, dismissSessionWarning: staySignedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
