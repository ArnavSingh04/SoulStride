import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useRNColorScheme } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = '@soulstride:theme-mode';

type ThemePreferenceContextValue = {
  mode: ThemeMode;
  resolvedColorScheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => Promise<void>;
  loading: boolean;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | undefined>(undefined);

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme() ?? 'light';
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setModeState(stored);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const resolvedColorScheme = useMemo<'light' | 'dark'>(() => {
    if (mode === 'system') return systemScheme;
    return mode;
  }, [mode, systemScheme]);

  const setMode = async (next: ThemeMode) => {
    setModeState(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <ThemePreferenceContext.Provider value={{ mode, resolvedColorScheme, setMode, loading }}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) throw new Error('useThemePreference must be used within ThemePreferenceProvider');
  return ctx;
}

