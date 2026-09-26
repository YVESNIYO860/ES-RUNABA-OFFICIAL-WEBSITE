# Supabase Setup From Scratch

## 1. Create a project

Create a Supabase project for ES RUNABA and save its database password in your password manager. Choose a region close to your users.

## 2. Apply the database schema

In the Supabase dashboard, open **SQL Editor**, create a query, paste the complete contents of `supabase/schema.sql`, and run it. The script creates Auth profiles, e-learning records, attendance, public site content/events, row-level security policies, and the private `elearning-notes` Storage bucket.

The SQL Editor path does not require a database password or CLI login.

### Optional CLI linking

The local CLI was initialized with `supabase init`. To link it, run these commands from the repository root:

```powershell
npx supabase login
npx supabase link --project-ref ovdevbwrrpntvibkucqr
```

When `supabase login` prompts, enter a personal access token from your Supabase account directly in the terminal. Do not paste it into chat. Linking may also ask for the database password; the connection string you supplied still contains `[YOUR-PASSWORD]`. The current `schema.sql` is run from SQL Editor; it is not a CLI migration file.

## 3. Configure Supabase Auth

In **Authentication → Providers**, enable Email/password sign-in. In **Authentication → Settings**, disable public sign-ups so accounts can only be provisioned by authorized staff.

Create the first Auth user with the email `yvesniyonkuru2022@gmail.com` and a strong password. The schema trigger gives that exact email the `teacher` role and `is_admin = true`. If that Auth user already existed before running the schema, run this once in SQL Editor:

```sql
update public.profiles
set role = 'teacher', is_admin = true
where lower(email) = 'yvesniyonkuru2022@gmail.com';
```

After Yves signs in, use **Staff Management** in the e-learning dashboard to provision teachers and a Director of Studies account. Choose **Director of Studies** as the access role for the DOS account. Teachers and DOS can sign in directly at `/teacher-login` and `/dos-login`; neither route requires selecting a class first.

## 4. Add project environment variables

In **Project Settings → API**, copy the Project URL and the publishable/anon key. Copy `.env.example` to `.env.local` and fill in:

```dotenv
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`.env.local` is ignored by Git. The service-role key is highly privileged: never prefix it with `VITE_`, commit it, or paste it into chat. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the Vercel project's server-side environment variables as well.

## 5. Run and deploy

Use `npx vercel dev` to test locally. It runs both the Vite app and the `/api/elearning/users` server function; plain `npm run dev` does not serve that API route. Deploy to Vercel after adding the server-side environment variables.

## What Uses Supabase

Student, teacher, and DOS Auth; student profiles; assignments; quizzes; submissions; quiz results; notes and private note files; attendance; public site content; and school events use Supabase when the environment variables are configured. All teachers and DOS can mark attendance for any current class. The Site Designer and event management are restricted to the system administrator.

The student sign-in URL is `/student-login`, teacher sign-in is `/teacher-login`, and DOS sign-in is `/dos-login`. These routes and the dashboards are outside the public website layout, so e-learning acts as a separate portal experience.

Existing records in browser localStorage are not automatically imported. Keep that browser data until a one-time import has been planned and verified.
