import * as fs from 'fs';
import * as path from 'path';

import { supabase } from '../lib/supabase-server';

interface PrayerLineJSON {
  shabad_id: string;
  punjabi_line: string;
  hindi_translation: string;
  english_translation: string;
  punjabi_meaning: string;
  transliteration: string;
}

interface PrayerFileJSON {
  filename: string;
  num_lines: number;
  lines: PrayerLineJSON[];
}

interface PrayersJSON {
  source: string;
  files: PrayerFileJSON[];
}

// Map filenames to prayer metadata
const prayerMetadata: Record < string, {
  id: string;
  name: string;
  name_punjabi: string;
  name_hindi: string;
  holy_book_id: string;
  type?: string;
  time_of_day?: string;
  description?: string;
}
> = {
  'anand sahib.html': {
    id: 'anand-sahib',
    name: 'Anand Sahib',
    name_punjabi: 'ਅਨੰਦ ਸਾਹਿਬ',
    name_hindi: 'अनंद साहिब',
    holy_book_id: 'guru-granth-sahib',
    type: 'celebration',
    description: 'The Song of Bliss, recited during celebrations'
  },
  'ardaas.html': {
    id: 'ardas',
    name: 'Ardas',
    name_punjabi: 'ਅਰਦਾਸ',
    name_hindi: 'अरदास',
    holy_book_id: 'guru-granth-sahib',
    type: 'supplication',
    description: 'Sikh prayer of supplication'
  },
  'chaupai sahib.html': {
    id: 'chaupai-sahib',
    name: 'Chaupai Sahib',
    name_punjabi: 'ਚੌਪਈ ਸਾਹਿਬ',
    name_hindi: 'चौपई साहिब',
    holy_book_id: 'dasham-granth',
    type: 'protection',
    description: 'Prayer for protection, composed by Guru Gobind Singh Ji'
  },
  'jaap sahib.html': {
    id: 'jaap-sahib',
    name: 'Jaap Sahib',
    name_punjabi: 'ਜਾਪੁ ਸਾਹਿਬ',
    name_hindi: 'जाप साहिब',
    holy_book_id: 'dasham-granth',
    type: 'morning',
    time_of_day: 'morning',
    description: 'Powerful morning prayer composed by Guru Gobind Singh Ji'
  },
  'japji sahib.html': {
    id: 'japji-sahib',
    name: 'Japji Sahib',
    name_punjabi: 'ਜਪੁਜੀ ਸਾਹਿਬ',
    name_hindi: 'जपुजी साहिब',
    holy_book_id: 'guru-granth-sahib',
    type: 'morning',
    time_of_day: 'morning',
    description: 'The morning prayer, first composition in Guru Granth Sahib'
  },
  'rehraas sahib.html': {
    id: 'rehraas-sahib',
    name: 'Rehraas Sahib',
    name_punjabi: 'ਰਹਿਰਾਸ ਸਾਹਿਬ',
    name_hindi: 'रहिरास साहिब',
    holy_book_id: 'guru-granth-sahib',
    type: 'evening',
    time_of_day: 'evening',
    description: 'Evening prayer, recited at sunset'
  },
  'shabad hazare.html': {
    id: 'shabad-hazare',
    name: 'Shabad Hazare',
    name_punjabi: 'ਸ਼ਬਦ ਹਜ਼ਾਰੇ',
    name_hindi: 'शबद हज़ारे',
    holy_book_id: 'guru-granth-sahib',
    type: 'meditation',
    description: 'A thousand Shabads, collection of hymns'
  },
  'sohila sahib.html': {
    id: 'kirtan-sohila',
    name: 'Kirtan Sohila',
    name_punjabi: 'ਕੀਰਤਨ ਸੋਹਿਲਾ',
    name_hindi: 'कीर्तन सोहिला',
    holy_book_id: 'guru-granth-sahib',
    type: 'bedtime',
    time_of_day: 'night',
    description: 'Bedtime prayer, recited before sleeping'
  },
  'tav prasad savaiye.html': {
    id: 'tav-prasad-savaiye',
    name: 'Tav Prasad Savaiye',
    name_punjabi: 'ਤ੍ਵ ਪ੍ਰਸਾਦਿ ਸਵੱਯੇ',
    name_hindi: 'त्व प्रसादि सवय्ये',
    holy_book_id: 'dasham-granth',
    type: 'meditation',
    description: 'Composed by Guru Gobind Singh Ji'
  }
};

async function migratePrayersFromJSON() {
  console.log('═══════════════════════════════════════════');
  console.log('PRAYERS MIGRATION FROM JSON FILE');
  console.log('═══════════════════════════════════════════\n');

  // Read JSON file
  const jsonPath = path.join(__dirname, '../prayers.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON file not found at: ${jsonPath}`);
    process.exit(1);
  }

  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const prayersData: PrayersJSON = JSON.parse(jsonContent);

  console.log(`📖 Found ${prayersData.files.length} prayers in JSON file\n`);

  // STEP 1: Delete ALL existing prayers and prayer lines
  console.log('🗑️  Clearing all existing prayers from database...');
  const {error: deleteLinesError} = await supabase.from('prayer_lines')
                                        .delete()
                                        .neq('id', 0);  // Delete all rows

  if (deleteLinesError) {
    console.error('❌ Error deleting prayer lines:', deleteLinesError);
  } else {
    console.log('✅ Deleted all prayer lines');
  }

  const {error: deletePrayersError} =
      await supabase.from('prayers').delete().neq('id', '');  // Delete all rows

  if (deletePrayersError) {
    console.error('❌ Error deleting prayers:', deletePrayersError);
  } else {
    console.log('✅ Deleted all prayers\n');
  }

  // Ensure holy books exist
  const holyBookIds = new Set(prayersData.files
                                  .map(file => {
                                    const metadata =
                                        prayerMetadata[file.filename];
                                    return metadata?.holy_book_id;
                                  })
                                  .filter(Boolean));

  for (const holyBookId of holyBookIds) {
    if (holyBookId === 'guru-granth-sahib') {
      await supabase.from('holy_books')
          .upsert(
              {
                id: 'guru-granth-sahib',
                name: 'Guru Granth Sahib',
                name_punjabi: 'ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ',
                name_hindi: 'गुरु ग्रंथ साहिब',
                description: 'The eternal Guru of the Sikhs'
              },
              {onConflict: 'id'});
    } else if (holyBookId === 'dasham-granth') {
      await supabase.from('holy_books')
          .upsert(
              {
                id: 'dasham-granth',
                name: 'Dasham Granth',
                name_punjabi: 'ਦਸਮ ਗ੍ਰੰਥ',
                name_hindi: 'दसम ग्रंथ',
                description:
                    'Collection of compositions by Guru Gobind Singh Ji'
              },
              {onConflict: 'id'});
    }
  }

  let successCount = 0;
  let errorCount = 0;
  let totalLines = 0;

  // Process each prayer file
  for (const file of prayersData.files) {
    const metadata = prayerMetadata[file.filename];

    if (!metadata) {
      console.warn(`⚠️  Skipping unknown prayer: ${file.filename}`);
      continue;
    }

    try {
      console.log(
          `\n📿 Processing: ${metadata.name} (${file.lines.length} lines)...`);

      // Insert prayer (no upsert needed since we cleared everything)
      const {error: prayerError} = await supabase.from('prayers').insert({
        id: metadata.id,
        holy_book_id: metadata.holy_book_id,
        name: metadata.name,
        name_punjabi: metadata.name_punjabi,
        name_hindi: metadata.name_hindi,
        description:
            metadata.description || `Prayer from ${metadata.holy_book_id}`,
        type: metadata.type,
        time_of_day: metadata.time_of_day,
      });

      if (prayerError) {
        console.error(
            `❌ Error inserting prayer ${metadata.name}:`, prayerError);
        errorCount++;
        continue;
      }

      // No need to delete - we already cleared everything at the start

      // Prepare prayer lines - filter out empty lines and handle nulls
      const validLines =
          file.lines.map((line, originalIndex) => ({line, originalIndex}))
              .filter(
                  ({line}) => line && line.punjabi_line &&
                      typeof line.punjabi_line === 'string' &&
                      line.english_translation &&
                      typeof line.english_translation === 'string');

      const prayerLines =
          validLines
              .map(({line}, index) => {
                // Safely handle all fields with proper null checks
                const punjabi = typeof line.punjabi_line === 'string' ?
                    line.punjabi_line.trim() :
                    '';
                const english = typeof line.english_translation === 'string' ?
                    line.english_translation.trim() :
                    '';
                const hindi = line.hindi_translation &&
                        typeof line.hindi_translation === 'string' ?
                    line.hindi_translation.trim() :
                    null;
                const transliteration = line.transliteration &&
                        typeof line.transliteration === 'string' ?
                    line.transliteration.trim() :
                    null;

                if (!punjabi || !english) {
                  console.warn(`⚠️  Skipping line ${index} in ${
                      metadata.name} - missing required fields`);
                  return null;
                }

                return {
                  prayer_id: metadata.id,
                  holy_book_id: metadata.holy_book_id,
                  line_order: index,  // Sequential order after filtering
                  punjabi: punjabi,
                  english: english,
                  hindi: hindi || null,
                  transliteration_english: transliteration || null,
                  transliteration_hindi: null,  // Not available in JSON
                };
              })
              .filter(
                  (line): line is NonNullable<typeof line> => line !== null);

      // Verify no duplicate line_orders
      const lineOrders = new Set(prayerLines.map(l => l.line_order));
      if (lineOrders.size !== prayerLines.length) {
        console.warn(`⚠️  Warning: Duplicate line_order values detected in ${
            metadata.name}`);
        // Re-number to ensure uniqueness
        prayerLines.forEach((line, index) => {
          line.line_order = index;
        });
      }

      // Insert lines in batches
      const batchSize = 100;

      for (let i = 0; i < prayerLines.length; i += batchSize) {
        const batch = prayerLines.slice(i, i + batchSize);
        const {error: linesError} =
            await supabase.from('prayer_lines').insert(batch);

        if (linesError) {
          console.error(
              `❌ Error inserting lines for ${metadata.name} (batch ${
                  Math.floor(i / batchSize) + 1}):`,
              linesError);
          throw linesError;
        }
      }

      totalLines += prayerLines.length;
      console.log(`✅ Migrated: ${metadata.name} [${metadata.holy_book_id}] (${
          prayerLines.length} lines)`);
      successCount++;

    } catch (error) {
      console.error(`❌ Unexpected error with prayer ${metadata.name}:`, error);
      errorCount++;
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('📊 MIGRATION SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`✅ Successfully migrated: ${successCount} prayers`);
  console.log(`❌ Failed: ${errorCount} prayers`);
  console.log(`📝 Total lines migrated: ${totalLines}`);
  console.log('\n🎉 JSON prayers migration completed!');
}

// Run migration
migratePrayersFromJSON().catch(console.error);
