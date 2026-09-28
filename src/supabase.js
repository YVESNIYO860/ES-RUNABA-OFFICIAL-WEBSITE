import { createClient } from '@supabase/supabase-js';
import { runWithLearningActivity } from './utils/learningActivity';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const learningFetch = async (input, init) => {
  const requestUrl = typeof input === 'string' || input instanceof URL ? input : input.url;
  const requestPath = new URL(requestUrl, window.location.origin).pathname;
  const method = (init?.method || (typeof input === 'object' && input.method) || 'GET').toUpperCase();
  const learningRoutes = ['/student-dashboard', '/teacher-dashboard', '/student-login', '/teacher-login', '/dos-login', '/super-admin'];
  const isLearningRoute = learningRoutes.some(route => window.location.pathname.startsWith(route));
  const isLearningDataRequest = requestPath.startsWith('/rest/v1/') || requestPath.startsWith('/storage/v1/');

  if (!isLearningRoute || !isLearningDataRequest) return fetch(input, init);

  const message = method === 'GET'
    ? 'Loading your learning workspace'
    : method === 'DELETE'
      ? 'Removing the selected record'
      : method === 'PATCH' || method === 'PUT'
        ? 'Updating your learning workspace'
        : 'Saving your learning changes';

  return runWithLearningActivity(message, () => fetch(input, init));
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: { fetch: learningFetch },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;