import {getStorageUserId} from '@/services/storage-scope';

/**
 * Returns the user id used for lesson progress (DB and any local tracking).
 * When logged in this is the auth user id; when guest it is a device-local id.
 * Use this so lesson progress is always scoped to the current account.
 */
export async function getLessonProgressUserId(_authUserId?: string|null):
    Promise<string> {
  return getStorageUserId();
}
