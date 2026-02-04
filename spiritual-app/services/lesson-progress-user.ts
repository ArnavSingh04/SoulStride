import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_USER_ID_KEY = '@soulstride:lesson-progress-user-id';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
      .replace(/x/g, () => (Math.random() * 16 | 0).toString(16))
      .replace('y', (Math.random() * 4 | 0 + 8).toString(16));
}

/**
 * Returns a persistent user id for lesson progress.
 * When the user is logged in, use their auth id; otherwise use a device-local
 * UUID stored in AsyncStorage so anonymous users still have progress tracked.
 */
export async function getLessonProgressUserId(authUserId: string|null):
    Promise<string> {
  if (authUserId) return authUserId;
  let localId = await AsyncStorage.getItem(LOCAL_USER_ID_KEY);
  if (!localId) {
    localId = generateUUID();
    await AsyncStorage.setItem(LOCAL_USER_ID_KEY, localId);
  }
  return localId;
}
