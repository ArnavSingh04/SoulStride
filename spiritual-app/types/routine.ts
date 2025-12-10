import { Prayer } from '@/data/prayers';

export type TimeSlot = 'amrit-vayla' | 'morning' | 'evening' | 'night';

export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export interface RoutineSlot {
  timeSlot: TimeSlot;
  prayerIds: string[];
  reminder: ReminderSettings;
}

export interface RoutineConfig {
  slots: RoutineSlot[];
}

export interface DailyCompletion {
  date: string; // YYYY-MM-DD format
  completedPrayers: {
    [prayerId: string]: boolean;
  };
}

export interface RoutineData {
  config: RoutineConfig;
  completions: DailyCompletion[];
}

export const TIME_SLOT_LABELS: Record<TimeSlot, { name: string; namePunjabi: string; defaultTime: { hour: number; minute: number } }> = {
  'amrit-vayla': {
    name: 'Amrit Vayla',
    namePunjabi: 'ਅੰਮ੍ਰਿਤ ਵੇਲਾ',
    defaultTime: { hour: 4, minute: 0 }
  },
  'morning': {
    name: 'Morning',
    namePunjabi: 'ਸਵੇਰ',
    defaultTime: { hour: 7, minute: 0 }
  },
  'evening': {
    name: 'Evening',
    namePunjabi: 'ਸ਼ਾਮ',
    defaultTime: { hour: 6, minute: 0 }
  },
  'night': {
    name: 'Night',
    namePunjabi: 'ਰਾਤ',
    defaultTime: { hour: 9, minute: 0 }
  }
};

