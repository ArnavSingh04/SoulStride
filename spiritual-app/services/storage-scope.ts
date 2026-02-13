import {supabase} from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_DEVICE_ID_KEY = '@soulstride:guest-device-id';
/** Legacy key used by lesson-progress-user; migrate to GUEST_DEVICE_ID_KEY */
const LEGACY_GUEST_ID_KEY = '@soulstride:lesson-progress-user-id';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
      .replace(/x/g, () => (Math.random() * 16 | 0).toString(16))
      .replace('y', (Math.random() * 4 | 0 + 8).toString(16));
}

/**
 * Returns the current storage user id: the signed-in user's id when logged in,
 * or a persistent device-local id for guests. All user-specific local data
 * (routine, progress, profile, preferences) should be keyed by this so that
 * switching accounts shows the correct data per account.
 */
export async function getStorageUserId(): Promise<string> {
  const {data: {session}} = await supabase.auth.getSession();
  if (session?.user?.id) return session.user.id;

  let guestId = await AsyncStorage.getItem(GUEST_DEVICE_ID_KEY);
  if (!guestId) {
    // Migrate from legacy key so existing guest progress is preserved
    guestId = await AsyncStorage.getItem(LEGACY_GUEST_ID_KEY);
    if (guestId) {
      await AsyncStorage.setItem(GUEST_DEVICE_ID_KEY, guestId);
    } else {
      guestId = generateUUID();
      await AsyncStorage.setItem(GUEST_DEVICE_ID_KEY, guestId);
    }
  }
  return guestId;
}
