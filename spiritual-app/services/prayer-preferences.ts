import AsyncStorage from '@react-native-async-storage/async-storage';

const PRAYER_PREFERENCES_KEY = '@soulstride:prayer-preferences';

export type PrayerLanguage = 'punjabi' | 'english' | 'hindi';
export type ContentType = 'original' | 'translation' | 'transliteration';

export interface PrayerPreferences {
  primaryLanguage: PrayerLanguage;
  showOriginal: boolean;
  showTranslation: boolean;
  showTransliteration: boolean;
  translationLanguage?: 'english' | 'hindi'; // Which translation to show if showTranslation is true
  selectedHolyBookIds?: string[]; // User's selected holy books/faith (can select multiple)
}

// Default preferences
function getDefaultPreferences(): PrayerPreferences {
  return {
    primaryLanguage: 'punjabi',
    showOriginal: true,
    showTranslation: true,
    showTransliteration: true,
    translationLanguage: 'english'
  };
}

// Load prayer preferences
export async function loadPrayerPreferences(): Promise<PrayerPreferences> {
  try {
    const data = await AsyncStorage.getItem(PRAYER_PREFERENCES_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Merge with defaults to ensure all fields exist
      return { ...getDefaultPreferences(), ...parsed };
    }
    return getDefaultPreferences();
  } catch (error) {
    console.error('Error loading prayer preferences:', error);
    return getDefaultPreferences();
  }
}

// Save prayer preferences
export async function savePrayerPreferences(preferences: PrayerPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(PRAYER_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving prayer preferences:', error);
    throw error;
  }
}

// Update specific preference
export async function updatePrayerPreference<K extends keyof PrayerPreferences>(
  key: K,
  value: PrayerPreferences[K]
): Promise<void> {
  const current = await loadPrayerPreferences();
  const updated = { ...current, [key]: value };
  await savePrayerPreferences(updated);
}
