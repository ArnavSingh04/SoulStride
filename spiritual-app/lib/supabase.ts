import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://xehvbppisebbzwolyfxj.supabase.co';
const supabaseAnonKey = 'sb_publishable__hDuNtBDlY-y31HijapVAA_k3fwIJwD';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

