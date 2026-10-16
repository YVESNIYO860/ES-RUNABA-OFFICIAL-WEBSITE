import { createSupabaseAdmin, getRequestProfile } from './_lib/supabaseAdmin.js';

const sendError = (response, status, message) => response.status(status).json({ error: message });
const isManager = (profile) => profile?.role === 'dos' || Boolean(profile?.is_admin);
const isUuid = (value) => /^[0-9a-f-]{36}$/i.test(String(value || ''));

const loadProfiles = async (admin, ids) => {
  const profileIds = [...new Set(ids.filter(Boolean))];
  if (!profileIds.length) return new Map();
  const { data, error } = await admin
    .from('profiles')
    .select('id, role, full_name, email, is_admin')
    .in('id', profileIds);
  if (error) throw error;
  return new Map((data || []).map(profile => [profile.id, profile]));
};

const getThread = async (admin, threadId) => {
  const { data, error } = await admin.from('school_message_threads').select('*').eq('id', threadId).maybeSingle();
  if (error) throw error;
  return data;
};

const canViewThread = (thread, profile) =>
  isManager(profile) || thread.user_a_id === profile.id || thread.user_b_id === profile.id;

const getThreadMessages = async (admin, threadId) => {
  const { data, error } = await admin
    .from('school_messages')
    .select('id, thread_id, sender_id, body, created_at, read_at')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(500);
  if (error) throw error;
  return data || [];
};

export default async function handler(request, response) {
  if (!['GET', 'POST', 'PATCH'].includes(request.method)) {
    response.setHeader('Allow', 'GET, POST, PATCH');
    return sendError(response, 405, 'Method not allowed.');
  }

  try {
    const admin = createSupabaseAdmin();
    const profile = await getRequestProfile(admin, request);
    if (!profile) return sendError(response, 401, 'Sign in to open your messages.');

    if (request.method === 'GET') {
      const threadId = String(request.query?.threadId || '');
      if (threadId) {
        if (!isUuid(threadId)) return sendError(response, 400, 'A valid thread ID is required.');
        const thread = await getThread(admin, threadId);
        if (!thread || !canViewThread(thread, profile)) return sendError(response, 404, 'Conversation not found.');

        const messages = await getThreadMessages(admin, threadId);
        const profiles = await loadProfiles(admin, [
          thread.user_a_id,
          thread.user_b_id,
          ...messages.map(message => message.sender_id)
        ]);
        return response.status(200).json({
          messages: messages.map(message => ({
            ...message,
            sender: profiles.get(message.sender_id) || null
          }))
        });
      }

      let threadQuery = admin
        .from('school_message_threads')
        .select('id, user_a_id, user_b_id, subject, last_message, last_sender_id, last_message_at, created_at')
        .order('last_message_at', { ascending: false })
        .limit(200);
      if (!isManager(profile)) {
        threadQuery = threadQuery.or(`user_a_id.eq.${profile.id},user_b_id.eq.${profile.id}`);
      }
      const { data: threadRows, error: threadError } = await threadQuery;
      if (threadError) throw threadError;
      const threads = threadRows || [];
      const participantIds = threads.flatMap(thread => [thread.user_a_id, thread.user_b_id, thread.last_sender_id]);
      const [participantProfiles, unreadResult] = await Promise.all([
        loadProfiles(admin, participantIds),
        threads.length
          ? admin.from('school_messages')
            .select('thread_id')
            .in('thread_id', threads.map(thread => thread.id))
            .neq('sender_id', profile.id)
            .is('read_at', null)
          : Promise.resolve({ data: [], error: null })
      ]);
      if (unreadResult.error) throw unreadResult.error;
      const unreadCounts = new Map();
      (unreadResult.data || []).forEach(({ thread_id: id }) => unreadCounts.set(id, (unreadCounts.get(id) || 0) + 1));

      let recipients = [];
      if (profile.role === 'student') {
        const { data, error } = await admin
          .from('profiles')
          .select('id, role, full_name, email')
          .in('role', ['teacher', 'dos'])
          .order('full_name');
        if (error) throw error;
        recipients = data || [];
      } else if (isManager(profile)) {
        const { data, error } = await admin
          .from('profiles')
          .select('id, role, full_name, email')
          .in('role', ['student', 'teacher'])
          .neq('id', profile.id)
          .order('full_name');
        if (error) throw error;
        recipients = data || [];
      } else if (profile.role === 'teacher') {
        const { data, error } = await admin
          .from('profiles')
          .select('id, role, full_name, email')
          .in('role', ['student', 'dos'])
          .order('full_name');
        if (error) throw error;
        recipients = data || [];
      }

      return response.status(200).json({
        recipients,
        threads: threads.map(thread => ({
          ...thread,
          participantA: participantProfiles.get(thread.user_a_id) || null,
          participantB: participantProfiles.get(thread.user_b_id) || null,
          lastSender: participantProfiles.get(thread.last_sender_id) || null,
          unreadCount: unreadCounts.get(thread.id) || 0
        }))
      });
    }

    if (request.method === 'PATCH') {
      const threadId = String(request.body?.threadId || '');
      if (!isUuid(threadId)) return sendError(response, 400, 'A valid thread ID is required.');
      const thread = await getThread(admin, threadId);
      if (!thread || !canViewThread(thread, profile)) return sendError(response, 404, 'Conversation not found.');
      const { error } = await admin
        .from('school_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .neq('sender_id', profile.id)
        .is('read_at', null);
      if (error) throw error;
      return response.status(200).json({ success: true });
    }

    const body = String(request.body?.body || '').trim();
    if (!body || body.length > 5000) return sendError(response, 400, 'Enter a message up to 5,000 characters.');
    const threadId = String(request.body?.threadId || '');

    if (threadId) {
      if (!isUuid(threadId)) return sendError(response, 400, 'A valid thread ID is required.');
      const thread = await getThread(admin, threadId);
      if (!thread || !canViewThread(thread, profile)) return sendError(response, 404, 'Conversation not found.');
      const { data: message, error } = await admin
        .from('school_messages')
        .insert({ thread_id: threadId, sender_id: profile.id, body })
        .select('id, thread_id, sender_id, body, created_at, read_at')
        .single();
      if (error) throw error;
      const { error: updateError } = await admin
        .from('school_message_threads')
        .update({ last_message: body, last_sender_id: profile.id, last_message_at: message.created_at })
        .eq('id', threadId);
      if (updateError) throw updateError;
      return response.status(201).json({ message: { ...message, sender: profile } });
    }

    const recipientId = String(request.body?.recipientId || '');
    const subject = String(request.body?.subject || '').trim();
    if (!isUuid(recipientId)) return sendError(response, 400, 'Choose a recipient.');
    if (!subject || subject.length > 160) return sendError(response, 400, 'Enter a subject up to 160 characters.');
    const { data: recipient, error: recipientError } = await admin
      .from('profiles')
      .select('id, role, full_name, email, is_admin')
      .eq('id', recipientId)
      .maybeSingle();
    if (recipientError) throw recipientError;
    if (!recipient) return sendError(response, 404, 'Recipient not found.');

    const validStudentRecipient = profile.role === 'student'
      && ['teacher', 'dos'].includes(recipient.role);
    const validManagerRecipient = isManager(profile)
      && ['student', 'teacher'].includes(recipient.role);
    const validTeacherRecipient = profile.role === 'teacher'
      && ['student', 'dos'].includes(recipient.role);
    if (!validStudentRecipient && !validManagerRecipient && !validTeacherRecipient) {
      return sendError(response, 403, 'You cannot start a conversation with this account.');
    }

    const now = new Date().toISOString();
    const { data: thread, error: createError } = await admin
      .from('school_message_threads')
      .insert({
        user_a_id: profile.id,
        user_b_id: recipient.id,
        subject,
        last_message: body,
        last_sender_id: profile.id,
        last_message_at: now,
        created_by: profile.id
      })
      .select('*')
      .single();
    if (createError) throw createError;

    const { data: message, error: messageError } = await admin
      .from('school_messages')
      .insert({ thread_id: thread.id, sender_id: profile.id, body })
      .select('id, thread_id, sender_id, body, created_at, read_at')
      .single();
    if (messageError) {
      await admin.from('school_message_threads').delete().eq('id', thread.id);
      throw messageError;
    }

    return response.status(201).json({
      thread: {
        ...thread,
        participantA: profile,
        participantB: recipient,
        lastSender: profile,
        unreadCount: 0
      },
      message: { ...message, sender: profile }
    });
  } catch (error) {
    console.error('School messaging API error:', error);
    if (error.message === 'Supabase server credentials are not configured.') {
      return sendError(response, 503, 'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to the server environment, then redeploy.');
    }
    if (['42P01', 'PGRST205'].includes(error.code)) {
      return sendError(response, 503, 'School messaging is not configured. Apply supabase/2026-10-school-messaging.sql in Supabase SQL Editor.');
    }
    return sendError(response, 500, 'Could not complete this messaging request. Please retry.');
  }
}