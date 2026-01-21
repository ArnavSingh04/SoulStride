import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useThemePreference } from '@/contexts/ThemePreferenceContext';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // If provider is present, prefer app setting; otherwise use system.
  let colorScheme: 'light' | 'dark' = useRNColorScheme() ?? 'light';
  try {
    const { resolvedColorScheme } = useThemePreference();
    colorScheme = resolvedColorScheme;
  } catch {
    // ignore (provider not mounted yet)
  }

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
