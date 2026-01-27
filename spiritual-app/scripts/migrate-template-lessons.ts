import { supabase } from '../lib/supabase-server';
import type { Lesson, LessonBlock } from '../lib/database.types';

console.log('🚀 Starting template lessons migration...\n');

// Template lessons covering different sections of SGGS
const templateLessons: Array<{
  lesson: Lesson;
  blocks: Omit<LessonBlock, 'id' | 'created_at'>[];
}> = [
  // Lesson 1: Ik Oankar (Japji Sahib - Foundation)
  {
    lesson: {
      id: 'japji_01_ik_onkar',
      holy_book_id: 'guru-granth-sahib',
      section: 'Japji Sahib',
      lesson_type: 'precision',
      difficulty: 1,
      estimated_time_min: 4,
      learning_objective: 'Understand the precise meaning of Ik Oankar',
      title: 'Ik Oankar: The Foundation',
      title_punjabi: 'ੴ: ਮੂਲ',
      description: 'Learn the foundational concept of Ik Oankar',
      order_index: 1,
    },
    blocks: [
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
        block_type: 'explanation',
        block_data: {
          text: 'Ik Oankar is not a numerical statement about gods. It points to the unity of all existence—being, creation, and reality as one.',
        },
      },
      {
        lesson_id: 'japji_01_ik_onkar',
        block_order: 4,
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
            2: 'Correct! Ik Oankar points to the fundamental oneness of all existence.',
          },
        },
      },
      {
        lesson_id: 'japji_01_ik_onkar',
        block_order: 5,
        block_type: 'reflection',
        block_data: {
          prompt: 'Where do you experience separation that this teaching challenges?',
        },
      },
    ],
  },

  // Lesson 2: Satnam (Japji Sahib)
  {
    lesson: {
      id: 'japji_02_satnam',
      holy_book_id: 'guru-granth-sahib',
      section: 'Japji Sahib',
      lesson_type: 'meaning',
      difficulty: 1,
      estimated_time_min: 5,
      learning_objective: 'Understand the meaning of Satnam (True Name)',
      title: 'Satnam: The True Name',
      title_punjabi: 'ਸਤਿ ਨਾਮੁ',
      description: 'Explore the concept of the True Name',
      order_index: 2,
      unlock_after_lesson_id: 'japji_01_ik_onkar',
    },
    blocks: [
      {
        lesson_id: 'japji_02_satnam',
        block_order: 1,
        block_type: 'objective',
        block_data: {
          text: 'Understand what Satnam means and how it relates to our daily practice.',
        },
      },
      {
        lesson_id: 'japji_02_satnam',
        block_order: 2,
        block_type: 'scripture',
        block_data: {
          gurmukhi: 'ਸਤਿ ਨਾਮੁ',
          transliteration: 'Satnam',
          translation: 'True Name',
          show_by_default: true,
        },
      },
      {
        lesson_id: 'japji_02_satnam',
        block_order: 3,
        block_type: 'definition',
        block_data: {
          term: 'Satnam',
          gloss: 'The True Name / The Eternal Reality',
          notes: [
            'Not just a word to repeat',
            'Points to the underlying truth of existence',
            'The name that is always true, never changing',
          ],
        },
      },
      {
        lesson_id: 'japji_02_satnam',
        block_order: 4,
        block_type: 'explanation',
        block_data: {
          text: 'Satnam is not a label we give to something separate. It is the very essence of reality itself—that which is eternally true, beyond time and change.',
        },
      },
      {
        lesson_id: 'japji_02_satnam',
        block_order: 5,
        block_type: 'analogy',
        block_data: {
          title: 'Like the ocean and its name',
          text: 'Just as "ocean" points to the vast water itself, Satnam points to the reality it names—not separate from it.',
        },
      },
      {
        lesson_id: 'japji_02_satnam',
        block_order: 6,
        block_type: 'scenario_choice',
        block_data: {
          situation: 'You feel disconnected and are looking for something real and lasting.',
          question: 'How might understanding Satnam help?',
          options: [
            'It gives you a mantra to repeat',
            'It points you to what is always true within and around you',
            'It is just a philosophical concept',
            'It requires special rituals',
          ],
          correct_option: 1,
          feedback: {
            1: 'Yes! Satnam points to the eternal truth that is always present, not something to achieve but to recognize.',
          },
        },
      },
    ],
  },

  // Lesson 3: Hukam (Japji Sahib)
  {
    lesson: {
      id: 'japji_03_hukam',
      holy_book_id: 'guru-granth-sahib',
      section: 'Japji Sahib',
      lesson_type: 'precision',
      difficulty: 2,
      estimated_time_min: 6,
      learning_objective: 'Understand Hukam and how it differs from fatalism',
      title: 'Hukam: Divine Order',
      title_punjabi: 'ਹੁਕਮਿ',
      description: 'Learn about Hukam and wise response',
      order_index: 3,
      unlock_after_lesson_id: 'japji_02_satnam',
    },
    blocks: [
      {
        lesson_id: 'japji_03_hukam',
        block_order: 1,
        block_type: 'objective',
        block_data: {
          text: 'Understand what Hukam means in daily life.',
        },
      },
      {
        lesson_id: 'japji_03_hukam',
        block_order: 2,
        block_type: 'scripture',
        block_data: {
          gurmukhi: 'ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ ਨਾਨਕ ਲਿਖਿਆ ਨਾਲਿ',
          transliteration: 'Hukami rajai chalna Nanak likhia nal',
          translation: 'To walk in the way of Hukam is Nanak\'s writing',
          show_by_default: true,
        },
      },
      {
        lesson_id: 'japji_03_hukam',
        block_order: 3,
        block_type: 'common_misconception',
        block_data: {
          misconception: 'Hukam means everything is fixed so effort is useless.',
          correction: 'Effort matters—alignment is the point, not resignation. Hukam is the order of reality; we respond wisely within it.',
        },
      },
      {
        lesson_id: 'japji_03_hukam',
        block_order: 4,
        block_type: 'analogy',
        block_data: {
          title: 'Like weather vs control',
          text: 'You can\'t control the weather, but you can choose how you prepare and respond. Hukam is like the weather—the order of reality. Your response is your choice.',
        },
      },
      {
        lesson_id: 'japji_03_hukam',
        block_order: 5,
        block_type: 'scenario_choice',
        block_data: {
          situation: 'Your plan fails at the last minute.',
          question: 'What aligns best with Hukam?',
          options: [
            'Quit trying',
            'Panic and blame others',
            'Adapt with calm effort',
            'Blame fate',
          ],
          correct_option: 2,
          feedback: {
            2: 'Alignment is response, not resignation. Accept what is, then respond wisely.',
          },
        },
      },
      {
        lesson_id: 'japji_03_hukam',
        block_order: 6,
        block_type: 'summary',
        block_data: {
          key_takeaways: [
            'Hukam is the underlying order of reality',
            'It is not fatalism—effort and response matter',
            'Alignment means wise response, not passive resignation',
          ],
        },
      },
    ],
  },

  // Lesson 4: Naam (Japji Sahib)
  {
    lesson: {
      id: 'japji_04_naam',
      holy_book_id: 'guru-granth-sahib',
      section: 'Japji Sahib',
      lesson_type: 'meaning',
      difficulty: 2,
      estimated_time_min: 5,
      learning_objective: 'Understand Naam and its practice',
      title: 'Naam: The Living Presence',
      title_punjabi: 'ਨਾਮੁ',
      description: 'Explore Naam and how to connect with it',
      order_index: 4,
      unlock_after_lesson_id: 'japji_03_hukam',
    },
    blocks: [
      {
        lesson_id: 'japji_04_naam',
        block_order: 1,
        block_type: 'objective',
        block_data: {
          text: 'Understand what Naam is and how to practice it.',
        },
      },
      {
        lesson_id: 'japji_04_naam',
        block_order: 2,
        block_type: 'definition',
        block_data: {
          term: 'Naam',
          gloss: 'The Living Presence / The Name that is Reality',
          notes: [
            'Not just a word to chant',
            'The living presence of the divine',
            'Can be experienced, not just understood intellectually',
          ],
        },
      },
      {
        lesson_id: 'japji_04_naam',
        block_order: 3,
        block_type: 'explanation',
        block_data: {
          text: 'Naam is the living presence of the divine that permeates all existence. It is not something separate from creation but the very essence of it.',
        },
      },
      {
        lesson_id: 'japji_04_naam',
        block_order: 4,
        block_type: 'match',
        block_data: {
          left: ['Naam', 'Haumai', 'Hukam'],
          right: ['Living presence', 'Ego', 'Divine order'],
          answer_map: {
            'Naam': 'Living presence',
            'Haumai': 'Ego',
            'Hukam': 'Divine order',
          },
        },
      },
      {
        lesson_id: 'japji_04_naam',
        block_order: 5,
        block_type: 'reflection',
        block_data: {
          prompt: 'Where in your daily life do you sense a presence greater than your individual self?',
        },
      },
    ],
  },

  // Lesson 5: First Pauri - Understanding Creation (Japji Sahib)
  {
    lesson: {
      id: 'japji_05_first_pauri',
      holy_book_id: 'guru-granth-sahib',
      section: 'Japji Sahib',
      lesson_type: 'meaning',
      difficulty: 2,
      estimated_time_min: 7,
      learning_objective: 'Understand the first pauri of Japji Sahib',
      title: 'First Pauri: The Nature of Creation',
      title_punjabi: 'ਪਹਿਲੀ ਪਉੜੀ',
      description: 'Deep dive into the first pauri',
      order_index: 5,
      unlock_after_lesson_id: 'japji_04_naam',
    },
    blocks: [
      {
        lesson_id: 'japji_05_first_pauri',
        block_order: 1,
        block_type: 'objective',
        block_data: {
          text: 'Understand the meaning and significance of the first pauri.',
        },
      },
      {
        lesson_id: 'japji_05_first_pauri',
        block_order: 2,
        block_type: 'scripture',
        block_data: {
          gurmukhi: 'ਸੋਚੈ ਸੋਚਿ ਨ ਹੋਵਈ ਜੇ ਸੋਚੀ ਲਖ ਵਾਰ',
          transliteration: 'Sochai soch na hovai je sochi lakh var',
          translation: 'By thinking, one cannot think it, even by thinking hundreds of thousands of times',
          show_by_default: true,
        },
      },
      {
        lesson_id: 'japji_05_first_pauri',
        block_order: 3,
        block_type: 'context',
        block_data: {
          text: 'This is the first pauri of Japji Sahib, following the Mool Mantar. It establishes that the divine cannot be understood through intellectual effort alone.',
        },
      },
      {
        lesson_id: 'japji_05_first_pauri',
        block_order: 4,
        block_type: 'explanation',
        block_data: {
          text: 'The pauri teaches that the divine cannot be grasped through thinking alone. No amount of intellectual effort can fully comprehend the infinite. This points to the need for direct experience rather than just conceptual understanding.',
        },
      },
      {
        lesson_id: 'japji_05_first_pauri',
        block_order: 5,
        block_type: 'question',
        block_data: {
          question_type: 'mcq',
          prompt: 'What does this pauri suggest about understanding the divine?',
          options: [
            'We need to think harder',
            'Intellectual understanding alone is insufficient',
            'Thinking is useless',
            'Only scholars can understand',
          ],
          correct_option: 1,
          feedback: {
            1: 'Correct! The pauri suggests that while thinking has value, direct experience is needed beyond intellectual understanding.',
          },
        },
      },
      {
        lesson_id: 'japji_05_first_pauri',
        block_order: 6,
        block_type: 'guided_reflection',
        block_data: {
          steps: [
            { prompt: 'When have you tried to understand something through thinking alone?' },
            { prompt: 'What was missing from that approach?' },
            { prompt: 'What might direct experience look like in your spiritual practice?' },
          ],
        },
      },
    ],
  },

  // Lesson 6: Rehras Sahib - Introduction
  {
    lesson: {
      id: 'rehras_01_intro',
      holy_book_id: 'guru-granth-sahib',
      section: 'Rehras Sahib',
      lesson_type: 'meaning',
      difficulty: 1,
      estimated_time_min: 4,
      learning_objective: 'Understand the purpose and structure of Rehras Sahib',
      title: 'Rehras Sahib: Evening Prayer',
      title_punjabi: 'ਰਹਿਰਾਸਿ ਸਾਹਿਬ',
      description: 'Introduction to Rehras Sahib',
      order_index: 1,
    },
    blocks: [
      {
        lesson_id: 'rehras_01_intro',
        block_order: 1,
        block_type: 'objective',
        block_data: {
          text: 'Understand when and why Rehras Sahib is recited.',
        },
      },
      {
        lesson_id: 'rehras_01_intro',
        block_order: 2,
        block_type: 'context',
        block_data: {
          text: 'Rehras Sahib is the evening prayer in Sikhism, typically recited at sunset. It is a compilation of hymns from Guru Granth Sahib that express gratitude and reflection.',
        },
      },
      {
        lesson_id: 'rehras_01_intro',
        block_order: 3,
        block_type: 'explanation',
        block_data: {
          text: 'Rehras Sahib serves as a time of reflection at the end of the day. It helps us express gratitude, acknowledge the divine presence, and prepare for rest with a clear mind.',
        },
      },
      {
        lesson_id: 'rehras_01_intro',
        block_order: 4,
        block_type: 'intention',
        block_data: {
          prompt: 'Set an intention for incorporating Rehras Sahib into your evening practice.',
          examples: [
            'Recite Rehras Sahib before dinner',
            'Reflect on the day while reciting',
            'Express gratitude for the day\'s blessings',
          ],
        },
      },
    ],
  },

  // Lesson 7: Kirtan Sohila - Introduction
  {
    lesson: {
      id: 'kirtan_sohila_01_intro',
      holy_book_id: 'guru-granth-sahib',
      section: 'Kirtan Sohila',
      lesson_type: 'meaning',
      difficulty: 1,
      estimated_time_min: 4,
      learning_objective: 'Understand Kirtan Sohila and its significance',
      title: 'Kirtan Sohila: Night Prayer',
      title_punjabi: 'ਕੀਰਤਨ ਸੋਹਿਲਾ',
      description: 'Introduction to Kirtan Sohila',
      order_index: 1,
    },
    blocks: [
      {
        lesson_id: 'kirtan_sohila_01_intro',
        block_order: 1,
        block_type: 'objective',
        block_data: {
          text: 'Understand the purpose of Kirtan Sohila.',
        },
      },
      {
        lesson_id: 'kirtan_sohila_01_intro',
        block_order: 2,
        block_type: 'context',
        block_data: {
          text: 'Kirtan Sohila is the night prayer, traditionally recited before sleep. It is also recited during cremation ceremonies, reminding us of the impermanence of life.',
        },
      },
      {
        lesson_id: 'kirtan_sohila_01_intro',
        block_order: 3,
        block_type: 'explanation',
        block_data: {
          text: 'Kirtan Sohila helps us end the day with peace and acceptance. It reminds us that each day is a gift and prepares us to rest with gratitude and surrender.',
        },
      },
      {
        lesson_id: 'kirtan_sohila_01_intro',
        block_order: 4,
        block_type: 'reflection',
        block_data: {
          prompt: 'How might reciting Kirtan Sohila before sleep change your relationship with rest and the end of each day?',
        },
      },
    ],
  },
];

async function migrateTemplateLessons() {
  try {
    let created = 0;
    let skipped = 0;

    for (const { lesson, blocks } of templateLessons) {
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

      // Insert lesson
      console.log(`📝 Creating lesson: ${lesson.title}...`);
      const { error: lessonError } = await supabase.from('lessons').insert([lesson]);

      if (lessonError) {
        console.error(`❌ Error creating lesson ${lesson.id}:`, lessonError);
        continue;
      }

      // Insert blocks
      const { error: blocksError } = await supabase.from('lesson_blocks').insert(blocks);

      if (blocksError) {
        console.error(`❌ Error creating blocks for ${lesson.id}:`, blocksError);
        // Try to clean up the lesson
        await supabase.from('lessons').delete().eq('id', lesson.id);
        continue;
      }

      console.log(`✅ Created: ${lesson.title} (${blocks.length} blocks)`);
      created++;
    }

    console.log('\n🎉 Template lessons migration complete!');
    console.log(`✅ Created: ${created} lessons`);
    console.log(`⚠️  Skipped: ${skipped} lessons (already exist)`);
    console.log(`\nTotal lessons available: ${created + skipped}`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrateTemplateLessons();
