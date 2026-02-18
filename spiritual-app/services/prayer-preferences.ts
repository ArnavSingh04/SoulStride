import {getStorageUserId} from '@/services/storage-scope';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRAYER_PREFERENCES_KEY_PREFIX = '@soulstride:prayer-preferences:';

export type PrayerLanguage = 'punjabi'|'english'|'hindi';
export type ContentType = 'original'|'translation'|'transliteration';
export type ContentFontSize = 'small'|'medium'|'large';

export interface PrayerPreferences {
  primaryLanguage: PrayerLanguage;
  showOriginal: boolean;
  showTranslation: boolean;
  showTransliteration: boolean;
  translationLanguage?: 'english'|'hindi';
  selectedHolyBookIds: string[];  // required in-app; default []
  contentFontSize?: ContentFontSize;  // only for prayers/holy book content
}

function getDefaultPreferences(): PrayerPreferences {
  return {
    primaryLanguage: 'punjabi',
    showOriginal: true,
    showTranslation: false,
    showTransliteration: false,
    translationLanguage: 'english',
    selectedHolyBookIds: [],
    contentFontSize: 'medium',
  };
}

export async function loadPrayerPreferences(): Promise<PrayerPreferences> {
  try {
    const userId = await getStorageUserId();
    const data =
        await AsyncStorage.getItem(PRAYER_PREFERENCES_KEY_PREFIX + userId);
    if (!data) return getDefaultPreferences();

    const parsed = JSON.parse(data);
    // Back-compat: migrate older single-selection key to multi-selection
    const migrated =
        parsed?.selectedHolyBookId && !parsed?.selectedHolyBookIds ?
        {...parsed, selectedHolyBookIds: [parsed.selectedHolyBookId]} :
        parsed;

    return {...getDefaultPreferences(), ...migrated};
  } catch (error) {
    console.error('Error loading prayer preferences:', error);
    return getDefaultPreferences();
  }
}

export async function savePrayerPreferences(preferences: PrayerPreferences):
    Promise<void> {
  try {
    const userId = await getStorageUserId();
    await AsyncStorage.setItem(
        PRAYER_PREFERENCES_KEY_PREFIX + userId, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving prayer preferences:', error);
    throw error;
  }
}

/** Scale factor for prayer/holy book content text (only used on Prayers page). */
export function getContentFontSizeScale(size: ContentFontSize | undefined): number {
  switch (size) {
    case 'small': return 0.9;
    case 'large': return 1.15;
    default: return 1;
  }
}

export async function updatePrayerPreference<K extends keyof PrayerPreferences>(
    key: K, value: PrayerPreferences[K]): Promise<void> {
  const current = await loadPrayerPreferences();
  const updated = {...current, [key]: value};
  await savePrayerPreferences(updated);
}
