import AsyncStorage from '@react-native-async-storage/async-storage';

const PRAYER_PREFERENCES_KEY = '@soulstride:prayer-preferences';

export type PrayerLanguage = 'punjabi' | 'english' | 'hindi';
export type ContentType = 'original' | 'translation' | 'transliteration';

export interface PrayerPreferences {
  primaryLanguage: PrayerLanguage;
  showOriginal: boolean;
  showTranslation: boolean;
  showTransliteration: boolean;
  translationLanguage?: 'english' | 'hindi';
  selectedHolyBookIds: string[]; // required in-app; default []
}

function getDefaultPreferences(): PrayerPreferences {
  return {
    primaryLanguage: 'punjabi',
    showOriginal: true,
    showTranslation: true,
    showTransliteration: true,
    translationLanguage: 'english',
    selectedHolyBookIds: [],
  };
}

export async function loadPrayerPreferences(): Promise<PrayerPreferences> {
  try {
    const data = await AsyncStorage.getItem(PRAYER_PREFERENCES_KEY);
    if (!data) return getDefaultPreferences();

    const parsed = JSON.parse(data);
    // Back-compat: migrate older single-selection key to multi-selection
    const migrated =
      parsed?.selectedHolyBookId && !parsed?.selectedHolyBookIds
        ? { ...parsed, selectedHolyBookIds: [parsed.selectedHolyBookId] }
        : parsed;

    return { ...getDefaultPreferences(), ...migrated };
  } catch (error) {
    console.error('Error loading prayer preferences:', error);
    return getDefaultPreferences();
  }
}

export async function savePrayerPreferences(preferences: PrayerPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(PRAYER_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving prayer preferences:', error);
    throw error;
  }
}

export async function updatePrayerPreference<K extends keyof PrayerPreferences>(
  key: K,
  value: PrayerPreferences[K]
): Promise<void> {
  const current = await loadPrayerPreferences();
  const updated = { ...current, [key]: value };
  await savePrayerPreferences(updated);
}
