/**
 * Clear all data from lesson_progress, lesson_blocks, and lessons tables.
 * Run this before migrating from lessons.json to get a clean slate.
 *
 * Usage: npx tsx scripts/clear-lessons-data.ts
 */

import { supabase } from '../lib/supabase-server';

async function clearLessonsData() {
  console.log('🗑️  Clearing lessons data...\n');

  try {
    // Order matters: progress -> blocks -> lessons (FKs)
    const { error: progressError } = await supabase.from('lesson_progress').delete().gte('id', 0);
    if (progressError) {
      console.error('Error clearing lesson_progress:', progressError.message);
      throw progressError;
    }
    console.log('   ✅ lesson_progress cleared');

    const { error: blocksError } = await supabase.from('lesson_blocks').delete().gte('id', 0);
    if (blocksError) {
      console.error('Error clearing lesson_blocks:', blocksError.message);
      throw blocksError;
    }
    console.log('   ✅ lesson_blocks cleared');

    const { error: lessonsError } = await supabase.from('lessons').delete().like('id', '%');
    if (lessonsError) {
      console.error('Error clearing lessons:', lessonsError.message);
      throw lessonsError;
    }
    console.log('   ✅ lessons cleared');

    console.log('\n✅ All lesson data cleared. You can now run: npm run migrate:lessons-from-json');
  } catch (err) {
    console.error('❌ Failed to clear data:', err);
    process.exit(1);
  }
}

clearLessonsData();
