// Shared types for Prayer data structures
// Separated to avoid circular dependencies

export interface PrayerLine {
  punjabi: string;
  english: string;
  hindi?: string;
  transliteration_english?: string;
  transliteration_hindi?: string;
}

export interface Prayer {
  id: string;
  holy_book_id: string; // Required: Links to specific holy book
  name: string;
  name_punjabi: string;
  name_hindi?: string;
  description: string;
  type?: string; // e.g., "morning", "evening", "bedtime"
  time_of_day?: string;
  lines: PrayerLine[];
}

export interface HolyBookPrayerCollection {
  holy_book_id: string;
  holy_book_name: string;
  holy_book_name_punjabi: string;
  holy_book_name_hindi?: string;
  prayers: Prayer[];
}

