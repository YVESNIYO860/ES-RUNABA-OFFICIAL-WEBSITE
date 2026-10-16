import { createSupabaseAdmin, getRequestProfile } from './_lib/supabaseAdmin.js';

const sendError = (response, status, message) => response.status(status).json({ error: message });
const canManageMessages = (profile) => profile?.role === 'dos' || profile?.is_admin;
const isMissingSiteMessagesTable = (error) =>
  ['42P01', 'PGRST205'].includes(error?.code)
  || (/site_messages/i.test(error?.message || '') && /does not exist|could not find|schema cache/i.test(error?.message || ''));
const isMissingSenderPhoneColumn = (error) =>
  /sender_phone/i.test(error?.message || '')
  && (['42703', 'PGRST204'].includes(error?.code) || /column|schema cache|does not exist/i.test(error?.message || ''));

export default async function handler(request, response) {
  if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(request.method)) {
    response.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return sendError(response, 405, 'Method not allowed.');
  }

  try {
    const admin = createSupabaseAdmin();

    if (request.method === 'POST') {
      const body = request.body || {};
      const senderName = String(body.name || '').trim();
      const senderEmail = String(body.email || '').trim().toLowerCase();
      const senderPhone = String(body.phone || '').trim();
      const subject = String(body.subject || '').trim();
      const message = String(body.message || '').trim();

      if (!senderName || senderName.length > 120) return sendError(response, 400, 'Enter a name with no more than 120 characters.');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(senderEmail) || senderEmail.length > 254) {
        return sendError(response, 400, 'Enter a valid email address.');
      }
      if (senderPhone.length > 32 || (senderPhone && !/^[+\d().\s-]+$/.test(senderPhone))) {
        return sendError(response, 400, 'Enter a valid phone number with no more than 32 characters.');
      }
      if (!subject || subject.length > 200) return sendError(response, 400, 'Enter a subject with no more than 200 characters.');
      if (!message || message.length > 5000) return sendError(response, 400, 'Enter a message with no more than 5,000 characters.');

      let { error } = await admin.from('site_messages').insert({
        sender_name: senderName,
        sender_email: senderEmail,
        sender_phone: senderPhone,
        subject,
        message
      });
      if (isMissingSenderPhoneColumn(error)) {
        ({ error } = await admin.from('site_messages').insert({
          sender_name: senderName,
          sender_email: senderEmail,
          subject,
          message
        }));
      }
      if (error) {
        console.error('Website message submission failed:', error);
        if (isMissingSiteMessagesTable(error)) {
          return sendError(response, 503, 'The website inbox is not configured. Apply supabase/2026-10-site-messages.sql in Supabase SQL Editor.');
        }
        return sendError(response, 500, 'Your message could not be saved. Please try again later.');
      }
      return response.status(201).json({ success: true });
    }

    const requester = await getRequestProfile(admin, request);
    if (!requester) return sendError(response, 401, 'Sign in is required.');
    if (!canManageMessages(requester)) return sendError(response, 403, 'Only the Director of Studies can manage website messages.');

    if (request.method === 'GET') {
      let { data, error } = await admin
        .from('site_messages')
        .select('id, sender_name, sender_email, sender_phone, subject, message, is_read, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (isMissingSenderPhoneColumn(error)) {
        ({ data, error } = await admin
          .from('site_messages')
          .select('id, sender_name, sender_email, subject, message, is_read, created_at')
          .order('created_at', { ascending: false })
          .limit(200));
        if (!error) data = (data || []).map(message => ({ ...message, sender_phone: '' }));
      }
      if (error) {
        console.error('Website messages could not be loaded:', error);
        if (isMissingSiteMessagesTable(error)) {
          return sendError(response, 503, 'The website inbox is not configured. Apply supabase/2026-10-site-messages.sql in Supabase SQL Editor.');
        }
        const migrationHint = isMissingSenderPhoneColumn(error)
          ? ' Apply supabase/2026-10-site-messages.sql in Supabase SQL Editor, then retry.'
          : '';
        return sendError(response, 500, `Could not load website messages.${migrationHint}`);
      }
      return response.status(200).json({ messages: data || [] });
    }

    const id = String(request.body?.id || '');
    if (!/^[0-9a-f-]{36}$/i.test(id)) return sendError(response, 400, 'A valid message ID is required.');

    if (request.method === 'DELETE') {
      const { data, error } = await admin
        .from('site_messages')
        .delete()
        .eq('id', id)
        .select('id')
        .maybeSingle();
      if (error) return sendError(response, 500, 'Could not delete this message.');
      if (!data) return sendError(response, 404, 'Message not found.');
      return response.status(200).json({ success: true });
    }

    if (typeof request.body?.isRead !== 'boolean') {
      return sendError(response, 400, 'A read status is required.');
    }
    const { data, error } = await admin
      .from('site_messages')
      .update({ is_read: request.body.isRead })
      .eq('id', id)
      .select('id, is_read')
      .maybeSingle();
    if (error) return sendError(response, 500, 'Could not update this message.');
    if (!data) return sendError(response, 404, 'Message not found.');
    return response.status(200).json({ message: data });
  } catch (error) {
    console.error('Website messages API error:', error);
    const message = error.message === 'Supabase server credentials are not configured.'
      ? 'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to the Vercel server environment, then redeploy.'
      : 'The website messages service is unavailable.';
    return sendError(response, 503, message);
  }
}