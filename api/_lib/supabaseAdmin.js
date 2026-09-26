import { createClient } from '@supabase/supabase-js';

export const createSupabaseAdmin = () => {
  const serverEnv = globalThis.process?.env || {};
  const url = serverEnv.SUPABASE_URL;
  const serviceRoleKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error('Supabase server credentials are not configured.');

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
};

export const getRequestProfile = async (admin, request) => {
  const token = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;

  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user) return null;

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profileError ? null : profile;
};