import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = '@soulstride:progress';

export interface UserProgress {
  xp: number;
  /**
   * Current streak count (days in a row with at least one lesson completed).
   */
  streakDays: number;
  /**
   * Last date (YYYY-MM-DD) we incremented streak — so we only increment once
   * per day.
   */
  lastStreakDate: string|null;
  updatedAt: string;
}

const DEFAULT: UserProgress = {
  xp: 0,
  streakDays: 0,
  lastStreakDate: null,
  updatedAt: new Date().toISOString(),
};

function getTodayDate(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${
      String(t.getDate()).padStart(2, '0')}`;
}

export async function loadProgress(): Promise<UserProgress> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return {...DEFAULT};
    const parsed = JSON.parse(raw);
    return {...DEFAULT, ...parsed};
  } catch (e) {
    console.error('Error loading progress:', e);
    return {...DEFAULT};
  }
}

export async function saveProgress(progress: UserProgress): Promise<void> {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({
    ...progress,
    updatedAt: new Date().toISOString(),
  }));
}

const XP_PER_LESSON = 25;

/**
 * Call when the user completes a lesson. Adds XP and updates daily streak
 * (increments streak only once per day).
 */
export async function onLessonCompleted(): Promise<UserProgress> {
  const today = getTodayDate();
  const progress = await loadProgress();

  const next: UserProgress = {
    ...progress,
    xp: progress.xp + XP_PER_LESSON,
    updatedAt: new Date().toISOString(),
  };

  // Only increment streak once per calendar day
  if (progress.lastStreakDate !== today) {
    // If last streak was yesterday, add 1; otherwise reset to 1 (new streak)
    const yesterday = (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${
          String(d.getDate()).padStart(2, '0')}`;
    })();
    if (progress.lastStreakDate === yesterday) {
      next.streakDays = progress.streakDays + 1;
    } else {
      next.streakDays = 1;
    }
    next.lastStreakDate = today;
  }

  await saveProgress(next);
  return next;
}
