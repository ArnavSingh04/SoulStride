import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xehvbppisebbzwolyfxj.supabase.co';
const supabaseAnonKey = 'sb_publishable__hDuNtBDlY-y31HijapVAA_k3fwIJwD';

// Server-side Supabase client for migration scripts
// This doesn't use AsyncStorage (which requires a browser/React Native environment)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist sessions in Node.js
    autoRefreshToken: false, // No need for token refresh in scripts
    detectSessionInUrl: false,
  },
});
