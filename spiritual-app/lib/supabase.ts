import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xehvbppisebbzwolyfxj.supabase.co';
const supabaseAnonKey = 'sb_publishable__hDuNtBDlY-y31HijapVAA_k3fwIJwD';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

