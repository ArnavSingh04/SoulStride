import {getStorageUserId} from '@/services/storage-scope';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_PROFILE_KEY_PREFIX = '@soulstride:user-profile:';
const ONBOARDING_COMPLETE_KEY_PREFIX = '@soulstride:onboarding-complete:';

export type ComfortLanguage = 'punjabi'|'english'|'hindi';

export interface UserProfile {
  name: string;
  dailyMinutes: number;
  comfortLanguage: ComfortLanguage;
  selectedHolyBookIds: string[];
  createdAt: string;
  updatedAt: string;
}

export function getDefaultUserProfile(): UserProfile {
  const now = new Date().toISOString();
  return {
    name: '',
    dailyMinutes: 10,
    comfortLanguage: 'english',
    selectedHolyBookIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export async function loadUserProfile(): Promise<UserProfile> {
  try {
    const userId = await getStorageUserId();
    const data = await AsyncStorage.getItem(USER_PROFILE_KEY_PREFIX + userId);
    if (!data) return getDefaultUserProfile();
    const parsed = JSON.parse(data);
    return {...getDefaultUserProfile(), ...parsed};
  } catch (e) {
    console.error('Error loading user profile:', e);
    return getDefaultUserProfile();
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const userId = await getStorageUserId();
  await AsyncStorage.setItem(
      USER_PROFILE_KEY_PREFIX + userId, JSON.stringify(profile));
}

export async function updateUserProfile(patch: Partial<UserProfile>):
    Promise<UserProfile> {
  const current = await loadUserProfile();
  const updated: UserProfile = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await saveUserProfile(updated);
  return updated;
}

export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const userId = await getStorageUserId();
    const v =
        await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY_PREFIX + userId);
    return v === 'true';
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(value: boolean): Promise<void> {
  const userId = await getStorageUserId();
  await AsyncStorage.setItem(
      ONBOARDING_COMPLETE_KEY_PREFIX + userId, value ? 'true' : 'false');
}

export async function resetOnboarding(): Promise<void> {
  const userId = await getStorageUserId();
  await AsyncStorage.multiRemove([
    USER_PROFILE_KEY_PREFIX + userId,
    ONBOARDING_COMPLETE_KEY_PREFIX + userId,
  ]);
}
