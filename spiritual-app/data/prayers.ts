/**
 * Prayers data module
 * Re-exports from database service for backward compatibility
 *
 * Note: This app now uses Supabase database for all prayer data.
 * The functions here fetch data from the database rather than local files.
 *
 * npm run migrate:prayers:json
 */

import {getAllPrayers as getAllPrayersDB, getPrayerById as getPrayerByIdDB, searchPrayers as searchPrayersDB,} from '@/lib/database.service';
import type {Prayer, PrayerWithLines} from '@/lib/database.types';

// Re-export types
export type {Prayer, PrayerWithLines};

// Re-export functions with async wrappers
export async function getAllPrayers(): Promise<PrayerWithLines[]> {
  return getAllPrayersDB();
}

export async function getPrayerById(id: string): Promise<PrayerWithLines|null> {
  return getPrayerByIdDB(id);
}

export async function searchPrayers(query: string): Promise<PrayerWithLines[]> {
  return searchPrayersDB(query);
}
