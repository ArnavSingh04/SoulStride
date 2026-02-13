/**
 * One-time script to confirm a user's email so they can sign in without
 * clicking the confirmation link. Use this when you've turned off "Confirm
 * email" in Supabase but existing accounts were created when it was still on.
 *
 * Usage (from project root):
 *   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key npx tsx
 * scripts/confirm-user-email.ts user@example.com
 *
 * Get your service role key: Supabase Dashboard → Project Settings → API →
 * service_role (secret) Never commit or expose the service role key.
 */

const supabaseUrl = 'https://xehvbppisebbzwolyfxj.supabase.co';

async function main() {
  const email = process.argv[2];
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!email) {
    console.error(
        'Usage: SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/confirm-user-email.ts <email>');
    process.exit(1);
  }

  if (!serviceRoleKey) {
    console.error(
        'Set SUPABASE_SERVICE_ROLE_KEY (Supabase Dashboard → Project Settings → API → service_role).');
    process.exit(1);
  }

  const {createClient} = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
  });

  const {data: listData, error: listError} =
      await supabase.auth.admin.listUsers({perPage: 1000});
  if (listError) {
    console.error('Failed to list users:', listError.message);
    process.exit(1);
  }

  const user = listData.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.error('No user found with email:', email);
    process.exit(1);
  }

  const {error: updateError} =
      await supabase.auth.admin.updateUserById(user.id, {email_confirm: true});
  if (updateError) {
    console.error('Failed to confirm email:', updateError.message);
    process.exit(1);
  }

  console.log('Email confirmed for:', user.email);
  console.log('They can sign in now.');
}

main();
