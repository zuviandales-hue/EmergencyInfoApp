# SafeQR

SafeQR is a mobile-first MVP for guardian-managed emergency QR profiles. A logged-in guardian can create profiles, download a QR code, and point scanners to a limited public emergency page at `/p/[public_slug]`.

## Features

- Supabase email/password authentication
- Guardian dashboard to create, edit, disable, and delete profiles
- QR generation with the `qrcode` npm package
- Public emergency page with limited medical and guardian contact information
- Location sharing only after the scanner taps the button
- Scan event storage in Supabase
- Resend email alert with a Google Maps link when location is available
- Row Level Security for owner-managed profiles and public active profile reads

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file:

```bash
cp .env.example .env.local
```

3. Fill in `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SCAN_RATE_LIMIT_SALT=replace-with-a-long-random-string
RESEND_API_KEY=re_your_resend_key
RESEND_ALERT_FROM=SafeQR <alerts@yourdomain.com>
```

4. In Supabase, run the SQL migration in:

```text
supabase/migrations/202606110001_create_safeqr_schema.sql
```

5. Enable Supabase Auth email/password. Add these redirect URLs in Supabase Auth settings:

```text
http://localhost:3000/auth/callback
https://your-vercel-domain.vercel.app/auth/callback
```

6. Start the app:

```bash
npm run dev
```

## Vercel Setup

Add the same environment variables in Vercel. Set `NEXT_PUBLIC_APP_URL` to your production URL, for example:

```bash
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

The dashboard uses the public Supabase anon key with RLS. Public emergency pages and scan alerts use `SUPABASE_SERVICE_ROLE_KEY` only inside server code so anonymous clients cannot query the full `profiles` table directly. Never expose the service role key in browser code.

## Emergency Contact Format

In the profile form, add one contact per line:

```text
Name | relationship | phone | email
Ana Santos | Mother | +1 555 0100 | ana@example.com
Ben Santos | Father | +1 555 0101 | ben@example.com
```

The first contact with a phone or email is used for the public call button and email alert.

## Privacy Notes

- Public pages only query active profiles.
- Anonymous clients cannot directly select `profiles` or insert `scan_events`; public access goes through server routes.
- Public pages do not show guardian names or email addresses. The call button requires a phone link, so use a guardian-safe phone number.
- No full address field is stored or shown.
- Owner account data is not shown publicly.
- A guardian can disable a QR profile without deleting it.
- Location is requested only after the scanner taps the location sharing button.
- Scan alerts are throttled per profile and hashed scanner IP.

## Database Tables

- `profiles`: emergency profile records owned by Supabase Auth users.
- `scan_events`: scan/location events tied to active profiles.

RLS policies are included in the migration for owner management, active public reads, and public scan inserts.
