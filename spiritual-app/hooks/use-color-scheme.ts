import { useColorScheme as useRNColorScheme } from 'react-native';
import { useThemePreference } from '@/contexts/ThemePreferenceContext';

export function useColorScheme() {
  // If provider is present, use the resolved scheme; otherwise fall back to system.
  try {
    const { resolvedColorScheme } = useThemePreference();
    return resolvedColorScheme;
  } catch {
    return useRNColorScheme() ?? 'light';
  }
}
