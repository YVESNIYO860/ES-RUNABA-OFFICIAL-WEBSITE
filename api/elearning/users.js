import { createSupabaseAdmin, getRequestProfile } from '../_lib/supabaseAdmin.js';
import { studentAuthEmail } from '../../src/utils/studentAuth.js';
import { generateStudentRegistrationNumber } from '../../src/utils/studentRegistration.js';

const sendError = (response, status, message) => response.status(status).json({ error: message });

export default async function handler(request, response) {
  if (!['POST', 'DELETE'].includes(request.method)) {
    response.setHeader('Allow', 'POST, DELETE');
    return sendError(response, 405, 'Method not allowed.');
  }

  try {
    const admin = createSupabaseAdmin();
    const requester = await getRequestProfile(admin, request);
    if (!requester) return sendError(response, 401, 'Sign in is required.');

    const body = request.body || {};
    if (request.method === 'POST') {
      if (body.type === 'student') {
        if (requester.role !== 'teacher') return sendError(response, 403, 'Teacher access is required.');
        const fullName = String(body.fullName || '').trim();
        const className = String(body.class || '').trim();
        const startYear = Number(body.startYear);
        if (!fullName || !className || !Number.isInteger(startYear)) {
          return sendError(response, 400, 'Student name, class, and enrollment year are required.');
        }

        const { data: existingProfiles, error: listError } = await admin
          .from('profiles')
          .select('reg_number')
          .eq('role', 'student')
          .not('reg_number', 'is', null);
        if (listError) return sendError(response, 500, 'Could not check existing registration numbers.');

        const regNumber = generateStudentRegistrationNumber(fullName, startYear, existingProfiles.map((profile) => ({
          regNumber: profile.reg_number
        })));
        if (!regNumber) return sendError(response, 409, 'No two-digit sequence is available for this name and year.');

        const password = `ESR/${regNumber}`;
        const { data: created, error: createError } = await admin.auth.admin.createUser({
          email: studentAuthEmail(regNumber),
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, reg_number: regNumber, class: className, start_year: startYear }
        });
        if (createError) return sendError(response, 409, createError.message);

        const { data: profile, error: profileError } = await admin
          .from('profiles')
          .update({ full_name: fullName, reg_number: regNumber, class: className, start_year: startYear, subject: body.module || null })
          .eq('id', created.user.id)
          .select('*')
          .single();
        if (profileError) {
          await admin.auth.admin.deleteUser(created.user.id);
          return sendError(response, 500, 'Student account was created, but the profile could not be saved.');
        }

        return response.status(201).json({ student: profile, password });
      }

      if (body.type === 'teacher' || body.type === 'dos') {
        if (requester.role !== 'teacher' || !requester.is_admin) {
          return sendError(response, 403, 'Administrator access is required to register staff.');
        }
        const { fullName, email, username, password, subject, isAdmin = false } = body;
        if (!fullName || !email || !password) return sendError(response, 400, 'Name, email, and password are required.');
        const accountRole = body.type;

        const { data: created, error: createError } = await admin.auth.admin.createUser({
          email: String(email).trim().toLowerCase(),
          password,
          email_confirm: true,
          user_metadata: { full_name: String(fullName).trim() }
        });
        if (createError) return sendError(response, 409, createError.message);

        const { data: profile, error: profileError } = await admin
          .from('profiles')
          .update({
            role: accountRole,
            full_name: String(fullName).trim(),
            email: String(email).trim().toLowerCase(),
            username: username ? String(username).trim() : null,
            subject: subject || null,
            is_admin: accountRole === 'teacher' && Boolean(isAdmin)
          })
          .eq('id', created.user.id)
          .select('*')
          .single();
        if (profileError) {
          await admin.auth.admin.deleteUser(created.user.id);
          return sendError(response, 500, 'Staff account was created, but the profile could not be saved.');
        }

        return response.status(201).json({ profile });
      }

      return sendError(response, 400, 'Unknown account type.');
    }

    const profileId = String(body.id || '');
    if (!profileId) return sendError(response, 400, 'A profile ID is required.');
    if (requester.role !== 'teacher') return sendError(response, 403, 'Teacher access is required.');

    const { data: target, error: targetError } = await admin
      .from('profiles')
      .select('role')
      .eq('id', profileId)
      .single();
    if (targetError) return sendError(response, 404, 'Account not found.');
    if (target.role !== 'student' && !requester.is_admin) {
      return sendError(response, 403, 'Administrator access is required to remove staff.');
    }
    if (profileId === requester.id) return sendError(response, 400, 'You cannot remove your own account.');

    const { error: deleteError } = await admin.auth.admin.deleteUser(profileId);
    if (deleteError) return sendError(response, 500, 'Could not remove the account.');
    return response.status(200).json({ success: true });
  } catch (error) {
    console.error('Supabase user provisioning error:', error);
    return sendError(response, 503, 'Supabase server configuration is unavailable.');
  }
}