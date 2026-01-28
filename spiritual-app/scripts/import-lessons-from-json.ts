import { supabase } from '../lib/supabase-server';
import type { Lesson, LessonBlock } from '../lib/database.types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Import lessons from a JSON file into Supabase
 * 
 * Usage:
 *   ts-node scripts/import-lessons-from-json.ts path/to/lessons.json
 * 
 * Or provide JSON directly via stdin:
 *   cat lessons.json | ts-node scripts/import-lessons-from-json.ts
 */

interface LessonImport {
  lesson: Lesson;
  blocks: Omit<LessonBlock, 'id' | 'created_at' | 'lesson_id'>[];
}

async function importLessonsFromJSON(jsonData: LessonImport[]) {
  try {
    let created = 0;
    let skipped = 0;
    let errors = 0;

    console.log(`📚 Starting import of ${jsonData.length} lesson(s)...\n`);

    for (const { lesson, blocks } of jsonData) {
      // Validate lesson data
      if (!lesson.id || !lesson.holy_book_id || !lesson.section) {
        console.error(`❌ Invalid lesson: missing required fields (id, holy_book_id, or section)`);
        errors++;
        continue;
      }

      // Validate blocks
      if (!blocks || blocks.length === 0) {
        console.error(`❌ Lesson ${lesson.id} has no blocks. Skipping...`);
        errors++;
        continue;
      }

      // Check if lesson already exists
      const { data: existing } = await supabase
        .from('lessons')
        .select('id')
        .eq('id', lesson.id)
        .single();

      if (existing) {
        console.log(`⚠️  Lesson ${lesson.id} already exists. Skipping...`);
        skipped++;
        continue;
      }

      // Validate holy_book_id exists
      const { data: holyBook } = await supabase
        .from('holy_books')
        .select('id')
        .eq('id', lesson.holy_book_id)
        .single();

      if (!holyBook) {
        console.error(`❌ Holy book ${lesson.holy_book_id} does not exist. Skipping lesson ${lesson.id}...`);
        errors++;
        continue;
      }

      // Prepare blocks with lesson_id
      const blocksWithLessonId = blocks.map((block, index) => ({
        ...block,
        lesson_id: lesson.id,
        block_order: block.block_order || index + 1, // Auto-assign if missing
      }));

      // Sort blocks by block_order
      blocksWithLessonId.sort((a, b) => a.block_order - b.block_order);

      // Insert lesson
      console.log(`📝 Creating lesson: ${lesson.title || lesson.id}...`);
      const { error: lessonError } = await supabase.from('lessons').insert([lesson]);

      if (lessonError) {
        console.error(`❌ Error creating lesson ${lesson.id}:`, lessonError.message);
        errors++;
        continue;
      }

      // Insert blocks
      console.log(`   📦 Creating ${blocksWithLessonId.length} block(s)...`);
      const { error: blocksError } = await supabase
        .from('lesson_blocks')
        .insert(blocksWithLessonId);

      if (blocksError) {
        console.error(`❌ Error creating blocks for ${lesson.id}:`, blocksError.message);
        // Try to clean up the lesson
        await supabase.from('lessons').delete().eq('id', lesson.id);
        errors++;
        continue;
      }

      console.log(`✅ Created: ${lesson.title || lesson.id} (${blocksWithLessonId.length} blocks)\n`);
      created++;
    }

    console.log('\n🎉 Import complete!');
    console.log(`✅ Created: ${created} lesson(s)`);
    console.log(`⚠️  Skipped: ${skipped} lesson(s) (already exist)`);
    console.log(`❌ Errors: ${errors} lesson(s)`);
    console.log(`\nTotal processed: ${jsonData.length}`);
  } catch (error) {
    console.error('❌ Import failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  let jsonData: LessonImport[];

  if (args.length > 0) {
    // Read from file
    const filePath = path.resolve(args[0]);
    console.log(`📂 Reading from file: ${filePath}\n`);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      jsonData = JSON.parse(fileContent);
    } catch (error) {
      console.error('❌ Error reading/parsing JSON file:', error);
      process.exit(1);
    }
  } else {
    // Read from stdin
    console.log('📥 Reading JSON from stdin...\n');
    let input = '';

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      input += chunk;
    });

    process.stdin.on('end', async () => {
      try {
        jsonData = JSON.parse(input);
        await importLessonsFromJSON(Array.isArray(jsonData) ? jsonData : [jsonData]);
      } catch (error) {
        console.error('❌ Error parsing JSON:', error);
        process.exit(1);
      }
    });

    return; // Exit early, will continue in stdin handler
  }

  // Validate JSON structure
  if (!Array.isArray(jsonData)) {
    console.error('❌ JSON must be an array of lesson objects');
    process.exit(1);
  }

  await importLessonsFromJSON(jsonData);
}

main();
