// Centralized Prayer Data Management
// Organizes prayers by holy book for better separation and management

// Import and re-export types from types.ts
import type { PrayerLine, Prayer, HolyBookPrayerCollection } from './types';
export type { PrayerLine, Prayer, HolyBookPrayerCollection };

// Import prayers from each holy book
import { guruGranthSahibPrayers } from './guru-granth-sahib';
import { dashamGranthPrayers } from './dasham-granth';
// Add more imports as you add more holy books
// import { bhagavadGitaPrayers } from './bhagavad-gita';

// Export organized collection by holy book
export const prayerCollections: HolyBookPrayerCollection[] = [
  guruGranthSahibPrayers,
  dashamGranthPrayers,
  // Add more collections here as needed
  // bhagavadGitaPrayers,
];

// Helper function to get all prayers (flattened)
export function getAllPrayers(): Prayer[] {
  return prayerCollections.flatMap(collection => collection.prayers);
}

// Helper function to get prayers by holy book
export function getPrayersByHolyBook(holyBookId: string): Prayer[] {
  const collection = prayerCollections.find(c => c.holy_book_id === holyBookId);
  return collection?.prayers || [];
}

// Helper function to get prayer by ID
export function getPrayerById(id: string): Prayer | undefined {
  return getAllPrayers().find(prayer => prayer.id === id);
}

// Helper function to search prayers
export function searchPrayers(query: string, holyBookId?: string): Prayer[] {
  const lowerQuery = query.toLowerCase();
  const prayers = holyBookId 
    ? getPrayersByHolyBook(holyBookId)
    : getAllPrayers();
  
  return prayers.filter(prayer => 
    prayer.name.toLowerCase().includes(lowerQuery) ||
    prayer.name_punjabi.toLowerCase().includes(lowerQuery) ||
    prayer.description.toLowerCase().includes(lowerQuery) ||
    prayer.lines.some(line => 
      line.punjabi.toLowerCase().includes(lowerQuery) ||
      line.english.toLowerCase().includes(lowerQuery)
    )
  );
}

// Get list of holy books with prayer counts
export function getHolyBooksSummary() {
  return prayerCollections.map(collection => ({
    id: collection.holy_book_id,
    name: collection.holy_book_name,
    name_punjabi: collection.holy_book_name_punjabi,
    name_hindi: collection.holy_book_name_hindi,
    prayer_count: collection.prayers.length,
  }));
}

