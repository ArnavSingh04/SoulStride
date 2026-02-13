import {getStorageUserId} from '@/services/storage-scope';
import {DailyCompletion, RoutineConfig, RoutineData, TIME_SLOT_LABELS, TimeSlot} from '@/types/routine';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ROUTINE_STORAGE_KEY_PREFIX = '@soulstride:routine:';
const COMPLETION_STORAGE_KEY_PREFIX = '@soulstride:completions:';

// Get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  const today = new Date();
  return `${today.getFullYear()}-${
      String(today.getMonth() + 1).padStart(2, '0')}-${
      String(today.getDate()).padStart(2, '0')}`;
}

// Initialize default routine config
function getDefaultRoutineConfig(): RoutineConfig {
  return {
    slots: Object.keys(TIME_SLOT_LABELS)
               .map((slot) => ({
                      timeSlot: slot as TimeSlot,
                      prayerIds: [],
                      reminder: {
                        enabled: false,
                        ...TIME_SLOT_LABELS[slot as TimeSlot].defaultTime
                      }
                    }))
  };
}

// Load routine configuration
export async function loadRoutineConfig(): Promise<RoutineConfig> {
  try {
    const userId = await getStorageUserId();
    const data =
        await AsyncStorage.getItem(ROUTINE_STORAGE_KEY_PREFIX + userId);
    if (data) {
      const parsed = JSON.parse(data);
      // Ensure all time slots exist
      const defaultConfig = getDefaultRoutineConfig();
      const slots = defaultConfig.slots.map(defaultSlot => {
        const savedSlot =
            parsed.slots?.find((s: any) => s.timeSlot === defaultSlot.timeSlot);
        return savedSlot || defaultSlot;
      });
      return {slots};
    }
    return getDefaultRoutineConfig();
  } catch (error) {
    console.error('Error loading routine config:', error);
    return getDefaultRoutineConfig();
  }
}

// Save routine configuration
export async function saveRoutineConfig(config: RoutineConfig): Promise<void> {
  try {
    const userId = await getStorageUserId();
    await AsyncStorage.setItem(
        ROUTINE_STORAGE_KEY_PREFIX + userId, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving routine config:', error);
    throw error;
  }
}

// Load today's completion
export async function loadTodayCompletion(): Promise<DailyCompletion> {
  try {
    const today = getTodayDate();
    const userId = await getStorageUserId();
    const data =
        await AsyncStorage.getItem(COMPLETION_STORAGE_KEY_PREFIX + userId);
    if (data) {
      const completions: DailyCompletion[] = JSON.parse(data);
      const todayCompletion = completions.find(c => c.date === today);
      if (todayCompletion) {
        return todayCompletion;
      }
    }
    return {date: today, completedPrayers: {}};
  } catch (error) {
    console.error('Error loading completion:', error);
    return {date: getTodayDate(), completedPrayers: {}};
  }
}

// Save today's completion
export async function saveTodayCompletion(completion: DailyCompletion):
    Promise<void> {
  try {
    const userId = await getStorageUserId();
    const data =
        await AsyncStorage.getItem(COMPLETION_STORAGE_KEY_PREFIX + userId);
    let completions: DailyCompletion[] = [];
    if (data) {
      completions = JSON.parse(data);
      // Remove old completions (keep only last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cutoffDate = `${thirtyDaysAgo.getFullYear()}-${
          String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${
          String(thirtyDaysAgo.getDate()).padStart(2, '0')}`;
      completions = completions.filter(c => c.date >= cutoffDate);

      // Update or add today's completion
      const index = completions.findIndex(c => c.date === completion.date);
      if (index >= 0) {
        completions[index] = completion;
      } else {
        completions.push(completion);
      }
    } else {
      completions = [completion];
    }
    await AsyncStorage.setItem(
        COMPLETION_STORAGE_KEY_PREFIX + userId, JSON.stringify(completions));
  } catch (error) {
    console.error('Error saving completion:', error);
    throw error;
  }
}

// Toggle prayer completion for today
export async function togglePrayerCompletion(
    prayerId: string, completed: boolean): Promise<void> {
  const today = getTodayDate();
  const completion = await loadTodayCompletion();
  if (completion.date !== today) {
    // New day, reset completion
    completion.date = today;
    completion.completedPrayers = {};
  }
  completion.completedPrayers[prayerId] = completed;
  await saveTodayCompletion(completion);
}

// Get completion stats for today
export async function getTodayStats(config: RoutineConfig):
    Promise<{completed: number; total: number}> {
  const completion = await loadTodayCompletion();
  const today = getTodayDate();

  if (completion.date !== today) {
    return {completed: 0, total: 0};
  }

  const allPrayerIds = config.slots.flatMap(slot => slot.prayerIds);
  const uniquePrayerIds = Array.from(new Set(allPrayerIds));
  const total = uniquePrayerIds.length;
  const completed =
      uniquePrayerIds.filter(id => completion.completedPrayers[id]).length;

  return {completed, total};
}

// Load all recent completions (for streak calculation)
async function loadAllCompletions(): Promise<DailyCompletion[]> {
  try {
    const userId = await getStorageUserId();
    const data =
        await AsyncStorage.getItem(COMPLETION_STORAGE_KEY_PREFIX + userId);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Calculate routine streak: consecutive days up to today where the user
 * completed their full daily routine (completed === total).
 */
export async function getRoutineStreak(config: RoutineConfig): Promise<number> {
  const allPrayerIds = config.slots.flatMap(slot => slot.prayerIds);
  const uniquePrayerIds = Array.from(new Set(allPrayerIds));
  const totalPrayers = uniquePrayerIds.length;
  if (totalPrayers === 0) return 0;

  const completions = await loadAllCompletions();
  const byDate = new Map<string, DailyCompletion>();
  completions.forEach(c => byDate.set(c.date, c));

  let streak = 0;
  const oneDayMs = 24 * 60 * 60 * 1000;
  let d = new Date();

  for (let i = 0; i < 365; i++) {
    const dateStr =
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${
            String(d.getDate()).padStart(2, '0')}`;
    const c = byDate.get(dateStr);
    const completedToday =
        c ? uniquePrayerIds.filter(id => c.completedPrayers[id]).length : 0;
    if (completedToday >= totalPrayers) {
      streak++;
    } else {
      break;
    }
    d.setTime(d.getTime() - oneDayMs);
  }
  return streak;
}
