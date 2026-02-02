/**
 * Migrate lesson data from lessons.json (from lessonCreation.py) into
 * lessons, lesson_blocks, and lesson_progress tables.
 *
 * Prerequisites:
 * 1. Run update-lessons-schema.sql if your DB doesn't have source/tags on lessons.
 * 2. Run clear-lessons-data.ts to wipe existing lesson data (or run this script with --clear).
 *
 * Usage:
 *   npx tsx scripts/migrate-lessons-from-json.ts [path/to/lessons.json]
 *   npx tsx scripts/migrate-lessons-from-json.ts --clear  (clear then migrate from ./lessons.json)
 *
 * Default path: spiritual-app/lessons.json
 */

import { supabase } from '../lib/supabase-server';
import * as fs from 'fs';
import * as path from 'path';

const DEFAULT_HOLY_BOOK_ID = 'guru-granth-sahib';
const DEFAULT_SECTION = 'Learning Path';

interface LessonJsonBlock {
  type: string;
  text?: string;
  scenario?: string;
  choices?: { id: string; text: string }[];
  best_choice?: string;
  why?: string;
  question?: string;
  answer?: string;
}

interface LessonJson {
  lesson_id: string;
  source: { pauri_indices?: number[]; ang_range?: { start: number; end: number } };
  tags: string[];
  blocks: LessonJsonBlock[];
}

function mapBlockToDb(block: LessonJsonBlock, blockOrder: number): { block_type: string; block_data: object } {
  switch (block.type) {
    case 'guided_reading':
      return { block_type: 'context', block_data: { text: block.text || '' } };
    case 'meaning':
      return { block_type: 'explanation', block_data: { text: block.text || '' } };
    case 'situation': {
      const choices = block.choices || [];
      const options = choices.map((c) => c.text);
      const bestIdx = choices.findIndex((c) => c.id === block.best_choice);
      const correctOption = bestIdx >= 0 ? bestIdx : 0;
      const feedback: Record<number, string> = {};
      if (block.why && correctOption >= 0) feedback[correctOption] = block.why;
      return {
        block_type: 'scenario_choice',
        block_data: {
          situation: block.scenario || '',
          question: '',
          options,
          correct_option: correctOption,
          feedback: Object.keys(feedback).length ? feedback : undefined,
        },
      };
    }
    case 'check':
      return {
        block_type: 'question',
        block_data: {
          question_type: 'mcq' as const,
          prompt: block.question || '',
          options: block.answer ? [block.answer] : [],
          correct_option: 0,
        },
      };
    case 'close':
      return { block_type: 'context', block_data: { text: block.text || '' } };
    default:
      return { block_type: 'context', block_data: { text: (block as any).text || JSON.stringify(block) } };
  }
}

async function ensureHolyBook() {
  const { data } = await supabase.from('holy_books').select('id').eq('id', DEFAULT_HOLY_BOOK_ID).single();
  if (!data) {
    const { error } = await supabase.from('holy_books').insert({
      id: DEFAULT_HOLY_BOOK_ID,
      name: 'Guru Granth Sahib',
      name_punjabi: 'ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ',
      description: 'Central religious scripture of Sikhism',
    });
    if (error) {
      console.warn('Could not insert holy book (may already exist):', error.message);
    }
  }
}

async function clearData() {
  await supabase.from('lesson_progress').delete().gte('id', 0);
  await supabase.from('lesson_blocks').delete().gte('id', 0);
  await supabase.from('lessons').delete().like('id', '%');
  console.log('   Cleared lesson_progress, lesson_blocks, lessons.');
}

async function migrate() {
  const args = process.argv.slice(2);
  const clearFirst = args.includes('--clear');
  const fileArg = args.find((a) => !a.startsWith('--'));
  const jsonPath = fileArg
    ? path.resolve(fileArg)
    : path.resolve(__dirname, '..', 'lessons.json');

  console.log('📚 Migrate lessons from JSON to Supabase\n');
  console.log('   JSON path:', jsonPath);

  if (!fs.existsSync(jsonPath)) {
    console.error('❌ File not found:', jsonPath);
    process.exit(1);
  }

  let lessons: LessonJson[];
  try {
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    lessons = JSON.parse(raw);
  } catch (e) {
    console.error('❌ Failed to read/parse JSON:', e);
    process.exit(1);
  }

  if (!Array.isArray(lessons) || lessons.length === 0) {
    console.error('❌ JSON must be a non-empty array of lesson objects.');
    process.exit(1);
  }

  await ensureHolyBook();

  if (clearFirst) {
    console.log('\n🗑️  Clearing existing lesson data...');
    await clearData();
  }

  console.log(`\n📝 Inserting ${lessons.length} lessons...\n`);

  let created = 0;
  let errors = 0;
  const BATCH = 50;

  for (let i = 0; i < lessons.length; i += BATCH) {
    const batch = lessons.slice(i, i + BATCH);
    for (const le of batch) {
      const lessonId = le.lesson_id;
      const orderIndex = lessons.indexOf(le) + 1;

      const lessonRow = {
        id: lessonId,
        holy_book_id: DEFAULT_HOLY_BOOK_ID,
        section: DEFAULT_SECTION,
        order_index: orderIndex,
        difficulty: 1,
        estimated_time_min: 5,
        source: le.source || null,
        tags: le.tags || null,
      };

      const { error: lessonError } = await supabase.from('lessons').insert(lessonRow);
      if (lessonError) {
        console.error(`   ❌ Lesson ${lessonId}:`, lessonError.message);
        errors++;
        continue;
      }

      const blockRows = (le.blocks || []).map((block, idx) => {
        const { block_type, block_data } = mapBlockToDb(block, idx + 1);
        return {
          lesson_id: lessonId,
          block_order: idx + 1,
          block_type,
          block_data,
        };
      });

      if (blockRows.length > 0) {
        const { error: blocksError } = await supabase.from('lesson_blocks').insert(blockRows);
        if (blocksError) {
          console.error(`   ❌ Blocks for ${lessonId}:`, blocksError.message);
          await supabase.from('lessons').delete().eq('id', lessonId);
          errors++;
          continue;
        }
      }

      created++;
      if (created % 100 === 0) console.log(`   … ${created} lessons`);
    }
  }

  console.log('\n🎉 Migration complete.');
  console.log(`   ✅ Created: ${created} lessons`);
  if (errors) console.log(`   ❌ Errors: ${errors}`);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
