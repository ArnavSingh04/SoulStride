import { supabase } from '../lib/supabase-server';
import { guruGranthSahibPrayers } from '../data/prayers/guru-granth-sahib';
import { dashamGranthPrayers } from '../data/prayers/dasham-granth';
import type { HolyBookPrayerCollection, Prayer } from '../data/prayers/types';

// Create collections array
const prayerCollections: HolyBookPrayerCollection[] = [
  guruGranthSahibPrayers,
  dashamGranthPrayers,
];

// Get all prayers flattened
function getAllPrayers(): Prayer[] {
  return prayerCollections.flatMap(collection => collection.prayers);
}

async function migrateHolyBooks() {
  console.log('📚 Migrating holy books...');
  
  for (const collection of prayerCollections) {
    try {
      const { error } = await supabase
        .from('holy_books')
        .upsert({
          id: collection.holy_book_id,
          name: collection.holy_book_name,
          name_punjabi: collection.holy_book_name_punjabi,
          name_hindi: collection.holy_book_name_hindi,
          description: `Collection of prayers from ${collection.holy_book_name}`,
        }, {
          onConflict: 'id'
        });
      
      if (error) {
        console.error(`❌ Error inserting holy book ${collection.holy_book_name}:`, error);
      } else {
        console.log(`✅ Holy book: ${collection.holy_book_name} (${collection.prayers.length} prayers)`);
      }
    } catch (error) {
      console.error(`❌ Unexpected error with holy book ${collection.holy_book_name}:`, error);
    }
  }
}

async function migratePrayers() {
  console.log('\n🙏 Starting prayers migration to Supabase...');
  
  const allPrayers = getAllPrayers();
  console.log(`Total prayers to migrate: ${allPrayers.length}`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const prayer of allPrayers) {
    try {
      // Insert prayer with holy_book_id
      const { error: prayerError } = await supabase
        .from('prayers')
        .upsert({
          id: prayer.id,
          holy_book_id: prayer.holy_book_id,
          name: prayer.name,
          name_punjabi: prayer.name_punjabi,
          name_hindi: prayer.name_hindi,
          description: prayer.description,
          type: prayer.type,
          time_of_day: prayer.time_of_day,
        }, {
          onConflict: 'id'
        });
      
      if (prayerError) {
        console.error(`❌ Error inserting prayer ${prayer.name}:`, prayerError);
        errorCount++;
        continue;
      }
      
      // Insert prayer lines
      const prayerLines = prayer.lines.map((line, index) => ({
        prayer_id: prayer.id,
        line_order: index,
        punjabi: line.punjabi,
        english: line.english,
        hindi: line.hindi,
        transliteration_english: line.transliteration_english,
        transliteration_hindi: line.transliteration_hindi,
      }));
      
      // Delete existing lines first to avoid conflicts
      await supabase
        .from('prayer_lines')
        .delete()
        .eq('prayer_id', prayer.id);
      
      // Insert new lines in batches (Supabase has a limit)
      const batchSize = 100;
      for (let i = 0; i < prayerLines.length; i += batchSize) {
        const batch = prayerLines.slice(i, i + batchSize);
        const { error: linesError } = await supabase
          .from('prayer_lines')
          .insert(batch);
        
        if (linesError) {
          console.error(`❌ Error inserting lines for ${prayer.name} (batch ${i / batchSize + 1}):`, linesError);
          errorCount++;
          break;
        }
      }
      
      console.log(`✅ Migrated: ${prayer.name} [${prayer.holy_book_id}] (${prayer.lines.length} lines)`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Unexpected error with prayer ${prayer.name}:`, error);
      errorCount++;
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successfully migrated: ${successCount} prayers`);
  console.log(`❌ Failed: ${errorCount} prayers`);
  console.log('\n🎉 Prayers migration completed!');
}

async function migrateAllPrayers() {
  console.log('═══════════════════════════════════════════');
  console.log('PRAYERS MIGRATION - Organized by Holy Book');
  console.log('═══════════════════════════════════════════\n');
  
  // First migrate holy books
  await migrateHolyBooks();
  
  // Then migrate prayers
  await migratePrayers();
}

// Run migration
migrateAllPrayers().catch(console.error);
