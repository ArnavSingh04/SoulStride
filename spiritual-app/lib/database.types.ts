// Database Types for Supabase

export interface HolyBook {
  id: string;
  name: string;
  name_punjabi: string;
  name_hindi?: string;
  description: string;
  total_pages?: number;
  created_at?: string;
}

export interface BaniLine {
  id: number;
  holy_book_id: string;
  page_number?: number;
  ang?: number;
  line_number?: number;
  line_order: number;
  punjabi: string;
  english: string;
  hindi?: string;
  transliteration_english?: string;
  transliteration_hindi?: string;
  author?: string;
  raag?: string;
  created_at?: string;
}

export interface Prayer {
  id: string;
  holy_book_id: string; // Required: Every prayer must belong to a holy book
  name: string;
  name_punjabi: string;
  name_hindi?: string;
  description: string;
  type?: string;
  time_of_day?: string;
  created_at?: string;
}

export interface PrayerLine {
  id: number;
  prayer_id: string;
  line_order: number;
  punjabi: string;
  english: string;
  hindi?: string;
  transliteration_english?: string;
  transliteration_hindi?: string;
  created_at?: string;
}

// Response types for API calls
export interface PrayerWithLines extends Prayer {
  lines: PrayerLine[];
}

export interface PageWithLines {
  pageNumber: number;
  lines: BaniLine[];
}

