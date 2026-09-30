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
        if (requester.role !== 'dos' && !requester.is_admin) return sendError(response, 403, 'Only the Director of Studies can manage student accounts.');
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

        return response.status(201).json({ profile, password, type: 'student' });
      }

      if (body.type === 'teacher' || body.type === 'dos') {
        if (requester.role !== 'dos' && !requester.is_admin) {
          return sendError(response, 403, 'Only the Director of Studies can manage staff accounts.');
        }

        const role = body.type === 'dos' ? 'dos' : 'teacher';
        if (role === 'dos' && !requester.is_admin) {
          return sendError(response, 403, 'Only the school administrator can register another Director of Studies.');
        }

        const fullName = String(body.fullName || '').trim();
        const email = String(body.email || '').trim().toLowerCase();
        const username = String(body.username || '').trim().toLowerCase();
        const password = String(body.password || '');
        const subject = String(body.subject || '').trim().toUpperCase();

        if (!fullName) return sendError(response, 400, 'The staff member\'s full name is required.');
        if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) {
          return sendError(response, 400, 'Enter a valid staff email address.');
        }
        if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(username)) {
          return sendError(response, 400, 'The username must be 3-32 characters using letters, numbers, dots, dashes or underscores.');
        }
        if (password.length < 8) {
          return sendError(response, 400, 'The initial password must be at least 8 characters long.');
        }

        const { data: usernameTaken, error: usernameError } = await admin
          .from('profiles')
          .select('id')
          .ilike('username', username)
          .limit(1);
        if (usernameError) return sendError(response, 500, 'Could not check existing usernames.');
        if (usernameTaken?.length) return sendError(response, 409, `The username "${username}" is already taken.`);

        const { data: emailTaken, error: emailError } = await admin
          .from('profiles')
          .select('id')
          .ilike('email', email)
          .limit(1);
        if (emailError) return sendError(response, 500, 'Could not check existing email addresses.');
        if (emailTaken?.length) return sendError(response, 409, 'An account with this email address already exists.');

        const { data: created, error: createError } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, role }
        });
        if (createError) {
          const duplicate = /already|registered|exists/i.test(createError.message || '');
          return duplicate
            ? sendError(response, 409, 'An account with this email address already exists.')
            : sendError(response, 500, 'Could not create the staff account.');
        }

        /* The sign-up trigger defaults every new auth user to the student role,
           so the staff role and profile details are applied straight after. */
        const { data: profile, error: profileError } = await admin
          .from('profiles')
          .update({
            role,
            full_name: fullName,
            email,
            username,
            subject: subject || 'General',
            is_admin: Boolean(body.isAdmin),
            reg_number: null,
            class: null,
            start_year: null
          })
          .eq('id', created.user.id)
          .select('*')
          .single();
        if (profileError) {
          await admin.auth.admin.deleteUser(created.user.id);
          return sendError(response, 500, 'The staff account was created, but the profile could not be saved.');
        }

        return response.status(201).json({ profile, password, type: role });
      }

      return sendError(response, 400, 'Unknown account type.');
    }

    const profileId = String(body.id || '');
    if (!profileId) return sendError(response, 400, 'A profile ID is required.');
    if (requester.role !== 'dos' && !requester.is_admin) {
      return sendError(response, 403, 'Only the Director of Studies can manage school accounts.');
    }
    if (profileId === requester.id) return sendError(response, 400, 'You cannot remove your own account.');

    const { data: target, error: targetError } = await admin
      .from('profiles')
      .select('role, is_admin')
      .eq('id', profileId)
      .single();
    if (targetError) return sendError(response, 404, 'Account not found.');
    if (target.role === 'dos' || target.is_admin) {
      return sendError(response, 403, 'Director of Studies and administrator accounts cannot be removed from the e-learning dashboard.');
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(profileId);
    if (deleteError) return sendError(response, 500, 'Could not remove the account.');
    return response.status(200).json({ success: true });
  } catch (error) {
    console.error('Supabase user provisioning error:', error);
    const message = error.message === 'Supabase server credentials are not configured.'
      ? 'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to the Vercel server environment, then redeploy.'
      : 'Supabase server configuration is unavailable.';
    return sendError(response, 503, message);
  }
}