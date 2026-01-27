import { supabase } from '../lib/supabase-server';
import type { Lesson, LessonBlock } from '../lib/database.types';

console.log('🚀 Starting sample lesson migration...\n');

// Sample lesson: Ik Oankar (from user's example)
const sampleLesson: Lesson = {
  id: 'japji_01_ik_onkar',
  holy_book_id: 'guru-granth-sahib',
  section: 'Japji Sahib',
  lesson_type: 'precision',
  difficulty: 1,
  estimated_time_min: 4,
  learning_objective: 'Understand the precise meaning of Ik Oankar',
  title: 'Ik Oankar: The Foundation',
  title_punjabi: 'ੴ: ਮੂਲ',
  description: 'Learn the foundational concept of Ik Oankar and its profound meaning',
  order_index: 1,
};

const sampleBlocks: Omit<LessonBlock, 'id' | 'created_at'>[] = [
  {
    lesson_id: 'japji_01_ik_onkar',
    block_order: 1,
    block_type: 'objective',
    block_data: {
      text: 'Understand what Ik Oankar means in the context of Sikh philosophy.',
    },
  },
  {
    lesson_id: 'japji_01_ik_onkar',
    block_order: 2,
    block_type: 'scripture',
    block_data: {
      gurmukhi: 'ੴ',
      transliteration: 'Ik Oankar',
      translation: 'One Universal Reality',
      show_by_default: true,
    },
  },
  {
    lesson_id: 'japji_01_ik_onkar',
    block_order: 3,
    block_type: 'context',
    block_data: {
      text: 'This appears at the very beginning of Japji Sahib, establishing the foundational principle before all other teachings.',
    },
  },
  {
    lesson_id: 'japji_01_ik_onkar',
    block_order: 4,
    block_type: 'explanation',
    block_data: {
      text: 'Ik Oankar is not a numerical statement about gods. It points to the unity of all existence—being, creation, and reality as one. The symbol ੴ combines "Ik" (one) with "Oankar" (the primal sound, the creative force), indicating that the One is both transcendent and immanent.',
    },
  },
  {
    lesson_id: 'japji_01_ik_onkar',
    block_order: 5,
    block_type: 'definition',
    block_data: {
      term: 'Ik Oankar',
      gloss: 'One Universal Reality / The One Creative Force',
      notes: [
        'Not "one god" in a numerical sense',
        'Points to the fundamental unity of all existence',
        'Both transcendent (beyond) and immanent (within)',
      ],
    },
  },
  {
    lesson_id: 'japji_01_ik_onkar',
    block_order: 6,
    block_type: 'common_misconception',
    block_data: {
      misconception: 'Ik Oankar means there is only one god, separate from creation.',
      correction: 'Ik Oankar points to the unity of all existence—the One is not separate from creation but is the very essence of reality itself.',
    },
  },
  {
    lesson_id: 'japji_01_ik_onkar',
    block_order: 7,
    block_type: 'question',
    block_data: {
      question_type: 'mcq',
      prompt: 'Which interpretation best reflects Ik Oankar?',
      options: [
        'There is only one god',
        'God exists separately from creation',
        'All existence is fundamentally one',
        'It is a poetic symbol without meaning',
      ],
      correct_option: 2,
      feedback: {
        0: 'Ik Oankar is not about counting gods, but about the nature of reality itself.',
        1: 'The teaching emphasizes unity, not separation between creator and creation.',
        2: 'Correct! Ik Oankar points to the fundamental oneness of all existence.',
        3: 'The symbol carries deep philosophical meaning about the nature of reality.',
      },
    },
  },
  {
    lesson_id: 'japji_01_ik_onkar',
    block_order: 8,
    block_type: 'reflection',
    block_data: {
      prompt: 'Where do you experience separation that this teaching challenges? How might seeing unity change your perspective?',
    },
  },
  {
    lesson_id: 'japji_01_ik_onkar',
    block_order: 9,
    block_type: 'summary',
    block_data: {
      key_takeaways: [
        'Ik Oankar is not about counting gods, but about the nature of reality',
        'It points to the fundamental unity of all existence',
        'The One is both transcendent and immanent',
        'This teaching challenges our sense of separation',
      ],
    },
  },
];

async function migrateSampleLesson() {
  try {
    // Check if lesson already exists
    const { data: existing } = await supabase
      .from('lessons')
      .select('id')
      .eq('id', sampleLesson.id)
      .single();

    if (existing) {
      console.log(`⚠️  Lesson ${sampleLesson.id} already exists. Skipping...`);
      return;
    }

    // Insert lesson
    console.log(`📝 Creating lesson: ${sampleLesson.title}...`);
    const { error: lessonError } = await supabase.from('lessons').insert([sampleLesson]);

    if (lessonError) {
      console.error('❌ Error creating lesson:', lessonError);
      return;
    }

    console.log('✅ Lesson created successfully\n');

    // Insert blocks
    console.log(`📦 Creating ${sampleBlocks.length} lesson blocks...`);
    const { error: blocksError } = await supabase.from('lesson_blocks').insert(sampleBlocks);

    if (blocksError) {
      console.error('❌ Error creating blocks:', blocksError);
      return;
    }

    console.log('✅ All blocks created successfully\n');
    console.log('🎉 Sample lesson migration complete!');
    console.log(`\nLesson ID: ${sampleLesson.id}`);
    console.log(`Section: ${sampleLesson.section}`);
    console.log(`Blocks: ${sampleBlocks.length}`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrateSampleLesson();
