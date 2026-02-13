# Disable Email Confirmation (Sign In Without Verifying Email)

## 1. Turn off confirmation for new signups

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Go to **Authentication** → **Providers** → **Email**.
4. Turn **OFF** the option **"Confirm email"** (or **"Enable email confirmations"**).
5. Save.

New signups will then be able to sign in immediately (no confirmation email is sent).

---

## 2. Fix existing accounts that still show "Email not confirmed"

Turning off the setting above does **not** automatically confirm users who already signed up when confirmation was on. Their account is still "unconfirmed" in the database. Use one of these **one-time** fixes:

### Option A: Confirm via SQL (no keys needed)

1. In Supabase Dashboard go to **SQL Editor**.
2. Run this (replace with your email):

```sql
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'your@email.com';
```

3. Try signing in again in the app.

### Option B: Confirm via script (using service role key)

1. Get your **service_role** key: Supabase Dashboard → **Project Settings** → **API** → under "Project API keys" copy **service_role** (secret). Never commit or share it.
2. From the project root run (replace with the user’s email):

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key npx tsx scripts/confirm-user-email.ts your@email.com
```

3. Try signing in again in the app.
