/**
 * Migrate Jaap Sahib content from jaap_sahib.json into Supabase.
 * - Deletes existing prayer_lines for prayer_id = 'jaap-sahib'
 * - Inserts new lines from jaap_sahib.json (repo root)
 *
 * Run: npx tsx scripts/migrate-jaap-sahib-from-json.ts
 * Or:  npm run migrate:jaap-sahib
 */

import * as fs from 'fs';
import * as path from 'path';

import { supabase } from '../lib/supabase-server';

const JAAP_SAHIB_ID = 'jaap-sahib';
const HOLY_BOOK_ID = 'dasham-granth';
const BATCH_SIZE = 100;

interface JaapSahibLine {
  line_number: number;
  punjabi_text: string;
  hindi_text: string | null;
  english_text: string;
  english_transliteration: string | null;
  hindi_transliteration: string | null;
}

interface JaapSahibJSON {
  title: { punjabi: string; english: string };
  lines: JaapSahibLine[];
}

async function migrateJaapSahib() {
  console.log('═══════════════════════════════════════════');
  console.log('JAAP SAHIB MIGRATION FROM jaap_sahib.json');
  console.log('═══════════════════════════════════════════\n');

  const jsonPath = path.join(__dirname, '../../jaap_sahib.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON file not found at: ${jsonPath}`);
    process.exit(1);
  }

  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const data: JaapSahibJSON = JSON.parse(jsonContent);

  if (!data.lines || !Array.isArray(data.lines)) {
    console.error('❌ Invalid JSON: expected "lines" array');
    process.exit(1);
  }

  // 1. Delete existing Jaap Sahib lines
  console.log('🗑️  Deleting existing Jaap Sahib lines...');
  const { error: deleteError } = await supabase
    .from('prayer_lines')
    .delete()
    .eq('prayer_id', JAAP_SAHIB_ID);

  if (deleteError) {
    console.error('❌ Error deleting prayer lines:', deleteError);
    process.exit(1);
  }
  console.log('✅ Deleted existing Jaap Sahib lines\n');

  // 2. Build rows for prayer_lines (only lines with required punjabi + english)
  const prayerLines = data.lines
    .map((line, index) => {
      const punjabi =
        line.punjabi_text && typeof line.punjabi_text === 'string'
          ? line.punjabi_text.trim()
          : '';
      const english =
        line.english_text && typeof line.english_text === 'string'
          ? line.english_text.trim()
          : '';
      if (!punjabi || !english) {
        console.warn(
          `⚠️  Skipping line ${index + 1} (line_number ${line.line_number}) - missing punjabi or english`
        );
        return null;
      }
      return {
        prayer_id: JAAP_SAHIB_ID,
        holy_book_id: HOLY_BOOK_ID,
        line_order: index,
        punjabi,
        english,
        hindi:
          line.hindi_text && typeof line.hindi_text === 'string'
            ? line.hindi_text.trim()
            : null,
        transliteration_english:
          line.english_transliteration &&
          typeof line.english_transliteration === 'string'
            ? line.english_transliteration.trim()
            : null,
        transliteration_hindi:
          line.hindi_transliteration &&
          typeof line.hindi_transliteration === 'string'
            ? line.hindi_transliteration.trim()
            : null,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (prayerLines.length === 0) {
    console.error('❌ No valid lines to insert');
    process.exit(1);
  }

  // 3. Insert in batches
  console.log(`📿 Inserting ${prayerLines.length} lines...`);
  for (let i = 0; i < prayerLines.length; i += BATCH_SIZE) {
    const batch = prayerLines.slice(i, i + BATCH_SIZE);
    const { error: insertError } = await supabase
      .from('prayer_lines')
      .insert(batch);

    if (insertError) {
      console.error(
        `❌ Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        insertError
      );
      process.exit(1);
    }
  }

  console.log(`✅ Inserted ${prayerLines.length} lines`);
  console.log('\n🎉 Jaap Sahib migration completed!');
}

migrateJaapSahib().catch((err) => {
  console.error(err);
  process.exit(1);
});
