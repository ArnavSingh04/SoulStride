import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import {Platform} from 'react-native';

const supabaseUrl = 'https://xehvbppisebbzwolyfxj.supabase.co';
const supabaseAnonKey = 'sb_publishable__hDuNtBDlY-y31HijapVAA_k3fwIJwD';

/**
 * Storage adapter:
 * - Web browser: use window.localStorage (when it exists)
 * - Native (iOS/Android): use AsyncStorage
 * - Web SSR / non-browser: use a no-op storage to avoid window/localStorage
 */
function getAuthStorage() {
  // Browser environment with localStorage available
  if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
    return {
      getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
      setItem: (key: string, value: string) => {
        window.localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        window.localStorage.removeItem(key);
        return Promise.resolve();
      },
    };
  }

  // Native mobile (React Native)
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return AsyncStorage;
  }

  // Web SSR or other non-browser environments
  return {
    getItem: () => Promise.resolve(null),
    setItem: () => Promise.resolve(),
    removeItem: () => Promise.resolve(),
  };
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getAuthStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
