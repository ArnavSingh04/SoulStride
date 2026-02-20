import { supabase } from '../lib/supabase-server';
import type { Lesson, LessonBlock } from '../lib/database.types';

/**
 * Comprehensive migration script to convert all 1400 pages of Guru Granth Sahib Ji
 * into structured lessons with varied lesson types and block structures.
 * 
 * Strategy:
 * - Group 2-5 pages (pauris) per lesson
 * - Give special attention to important sections (Mool Mantar, etc.)
 * - Mix different lesson types (precision, meaning, practice, reflection)
 * - Create varied block structures for engagement
 */

interface PageGroup {
  startPage: number;
  endPage: number;
  pages: number[];
  importance: 'high' | 'medium' | 'normal';
  section?: string;
}

// Important sections that need special treatment
const IMPORTANT_SECTIONS: Record<number, { name: string; pages: number[]; importance: 'high' | 'medium' }> = {
  1: { name: 'Mool Mantar', pages: [1], importance: 'high' },
  2: { name: 'Japji Sahib', pages: [1, 2, 3, 4, 5, 6, 7, 8], importance: 'high' },
  3: { name: 'Rehras Sahib', pages: [8, 9, 10], importance: 'medium' },
  4: { name: 'Kirtan Sohila', pages: [12, 13], importance: 'medium' },
};

// Lesson type distribution for variety
const LESSON_TYPES = ['precision', 'meaning', 'practice', 'reflection', 'context'] as const;
type LessonType = typeof LESSON_TYPES[number];

// Block type patterns for different lesson types
const BLOCK_PATTERNS: Record<LessonType, string[]> = {
  precision: ['objective', 'scripture', 'explanation', 'question', 'reflection'],
  meaning: ['objective', 'scripture', 'definition', 'explanation', 'analogy', 'reflection'],
  practice: ['objective', 'scripture', 'explanation', 'question', 'match', 'reflection'],
  reflection: ['objective', 'scripture', 'context', 'guided_reflection', 'summary'],
  context: ['objective', 'scripture', 'context', 'explanation', 'reflection'],
};

/**
 * Determine lesson type based on position and content
 */
function getLessonType(pageNumber: number, importance: 'high' | 'medium' | 'normal'): LessonType {
  // Important sections get more varied types
  if (importance === 'high') {
    const types: LessonType[] = ['precision', 'meaning', 'context'];
    return types[pageNumber % types.length];
  }
  
  // Rotate through all types for variety
  return LESSON_TYPES[pageNumber % LESSON_TYPES.length];
}

/**
 * Group pages into lessons (2-5 pages per lesson)
 * Important sections get fewer pages per lesson for more focus
 */
function groupPagesIntoLessons(totalPages: number): PageGroup[] {
  const groups: PageGroup[] = [];
  let currentPage = 1;
  
  while (currentPage <= totalPages) {
    // Check if current page is in an important section
    let importance: 'high' | 'medium' | 'normal' = 'normal';
    let section: string | undefined;
    let pagesPerLesson = 3; // Default
    
    for (const [key, sectionInfo] of Object.entries(IMPORTANT_SECTIONS)) {
      if (sectionInfo.pages.includes(currentPage)) {
        importance = sectionInfo.importance;
        section = sectionInfo.name;
        // Important sections: 1-2 pages per lesson
        // Medium importance: 2-3 pages per lesson
        pagesPerLesson = importance === 'high' ? 1 : 2;
        break;
      }
    }
    
    // Normal sections: 3-5 pages per lesson (randomized for variety)
    if (importance === 'normal') {
      pagesPerLesson = 3 + Math.floor(Math.random() * 3); // 3-5 pages
    }
    
    const endPage = Math.min(currentPage + pagesPerLesson - 1, totalPages);
    const pages: number[] = [];
    for (let p = currentPage; p <= endPage; p++) {
      pages.push(p);
    }
    
    groups.push({
      startPage: currentPage,
      endPage,
      pages,
      importance,
      section,
    });
    
    currentPage = endPage + 1;
  }
  
  return groups;
}

/**
 * Fetch lines for a page range
 */
async function getPageLines(startPage: number, endPage: number): Promise<any[]> {
  const { data, error } = await supabase
    .from('bani_lines')
    .select('*')
    .eq('holy_book_id', 'guru-granth-sahib')
    .gte('page_number', startPage)
    .lte('page_number', endPage)
    .order('page_number')
    .order('line_order');
  
  if (error) {
    console.error(`Error fetching pages ${startPage}-${endPage}:`, error);
    return [];
  }
  
  return data || [];
}

/**
 * Create lesson blocks based on lesson type and content
 */
function createLessonBlocks(
  lessonId: string,
  lessonType: LessonType,
  lines: any[],
  pageGroup: PageGroup
): Omit<LessonBlock, 'id' | 'created_at'>[] {
  const blocks: Omit<LessonBlock, 'id' | 'created_at'>[] = [];
  let blockOrder = 1;
  
  // Get block pattern for this lesson type
  const pattern = BLOCK_PATTERNS[lessonType];
  
  // 1. Objective block
  blocks.push({
    lesson_id: lessonId,
    block_order: blockOrder++,
    block_type: 'objective',
    block_data: {
      text: `Learn and understand the teachings from ${pageGroup.section || `pages ${pageGroup.startPage}-${pageGroup.endPage}`} of Guru Granth Sahib Ji.`,
    },
  });
  
  // 2. Scripture blocks (group lines by page or logical breaks)
  const scriptureLines = lines.slice(0, Math.min(10, lines.length)); // First 10 lines
  if (scriptureLines.length > 0) {
    scriptureLines.forEach((line, idx) => {
      blocks.push({
        lesson_id: lessonId,
        block_order: blockOrder++,
        block_type: 'scripture',
        block_data: {
          gurmukhi: line.punjabi,
          transliteration: line.transliteration_english || '',
          translation: line.english,
          show_by_default: idx === 0, // Show first by default
        },
      });
    });
  }
  
  // 3. Context block (for important sections)
  if (pageGroup.importance === 'high' && pattern.includes('context')) {
    blocks.push({
      lesson_id: lessonId,
      block_order: blockOrder++,
      block_type: 'context',
      block_data: {
        text: `This section holds special significance in Sikh philosophy. Take time to reflect on its deeper meanings.`,
      },
    });
  }
  
  // 4. Explanation block
  if (pattern.includes('explanation')) {
    blocks.push({
      lesson_id: lessonId,
      block_order: blockOrder++,
      block_type: 'explanation',
      block_data: {
        text: `These teachings guide us toward understanding the nature of reality and our relationship with the divine. Reflect on how these words apply to your daily life.`,
      },
    });
  }
  
  // 5. Interactive blocks based on lesson type
  if (lessonType === 'precision' && pattern.includes('question')) {
    // MCQ question
    blocks.push({
      lesson_id: lessonId,
      block_order: blockOrder++,
      block_type: 'question',
      block_data: {
        question_type: 'mcq',
        prompt: 'What is the main theme of this teaching?',
        options: [
          'Divine unity and oneness',
          'Historical events',
          'Ritual practices',
          'Social customs',
        ],
        correct_option: 0,
        feedback: {
          0: 'Correct! These teachings emphasize the fundamental unity of all existence.',
        },
      },
    });
  } else if (lessonType === 'practice' && pattern.includes('match')) {
    // Matching exercise
    blocks.push({
      lesson_id: lessonId,
      block_order: blockOrder++,
      block_type: 'match',
      block_data: {
        prompt: 'Match the Gurmukhi with its English translation',
        pairs: scriptureLines.slice(0, 3).map((line, idx) => ({
          left: line.punjabi.substring(0, 30) + '...',
          right: line.english.substring(0, 50) + '...',
          correct_pair: idx,
        })),
      },
    });
  }
  
  // 6. Reflection block
  if (pattern.includes('reflection')) {
    blocks.push({
      lesson_id: lessonId,
      block_order: blockOrder++,
      block_type: 'reflection',
      block_data: {
        prompt: 'How do these teachings relate to your understanding of spirituality?',
      },
    });
  }
  
  // 7. Summary block
  blocks.push({
    lesson_id: lessonId,
    block_order: blockOrder++,
    block_type: 'summary',
    block_data: {
      text: `You've completed studying pages ${pageGroup.startPage}-${pageGroup.endPage}. Continue your journey to deepen your understanding.`,
    },
  });
  
  return blocks;
}

/**
 * Generate lesson title and metadata
 */
function generateLessonMetadata(pageGroup: PageGroup, lessonIndex: number): {
  title: string;
  title_punjabi: string;
  description: string;
  learning_objective: string;
} {
  if (pageGroup.section) {
    return {
      title: `${pageGroup.section} - Part ${lessonIndex + 1}`,
      title_punjabi: pageGroup.section,
      description: `Study of ${pageGroup.section} from Guru Granth Sahib Ji`,
      learning_objective: `Understand the teachings and significance of ${pageGroup.section}`,
    };
  }
  
  return {
    title: `Pages ${pageGroup.startPage}-${pageGroup.endPage}`,
    title_punjabi: `ਅੰਗ ${pageGroup.startPage}-${pageGroup.endPage}`,
    description: `Study of pages ${pageGroup.startPage}-${pageGroup.endPage} from Guru Granth Sahib Ji`,
    learning_objective: `Learn and reflect on the teachings from pages ${pageGroup.startPage}-${pageGroup.endPage}`,
  };
}

/**
 * Main migration function
 */
async function migrateGGSLessons() {
  console.log('🚀 Starting Guru Granth Sahib Ji lessons migration...\n');
  
  try {
    // Get total pages
    const { data: holyBook } = await supabase
      .from('holy_books')
      .select('total_pages')
      .eq('id', 'guru-granth-sahib')
      .single();
    
    const totalPages = holyBook?.total_pages || 1430;
    console.log(`📖 Total pages to process: ${totalPages}\n`);
    
    // Group pages into lessons
    const pageGroups = groupPagesIntoLessons(totalPages);
    console.log(`📚 Created ${pageGroups.length} lesson groups\n`);
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    // Process each group
    for (let i = 0; i < pageGroups.length; i++) {
      const pageGroup = pageGroups[i];
      const lessonIndex = i;
      
      // Generate lesson ID
      const lessonId = `ggs_${String(pageGroup.startPage).padStart(4, '0')}_${String(pageGroup.endPage).padStart(4, '0')}`;
      
      // Check if lesson already exists
      const { data: existing } = await supabase
        .from('lessons')
        .select('id')
        .eq('id', lessonId)
        .single();
      
      if (existing) {
        console.log(`⚠️  Lesson ${lessonId} already exists. Skipping...`);
        skipped++;
        continue;
      }
      
      try {
        // Fetch lines for this page range
        const lines = await getPageLines(pageGroup.startPage, pageGroup.endPage);
        
        if (lines.length === 0) {
          console.log(`⚠️  No content found for pages ${pageGroup.startPage}-${pageGroup.endPage}. Skipping...`);
          skipped++;
          continue;
        }
        
        // Determine lesson type
        const lessonType = getLessonType(pageGroup.startPage, pageGroup.importance);
        
        // Generate metadata
        const metadata = generateLessonMetadata(pageGroup, lessonIndex);
        
        // Create lesson
        const lesson: Lesson = {
          id: lessonId,
          holy_book_id: 'guru-granth-sahib',
          section: pageGroup.section || 'Guru Granth Sahib Ji',
          lesson_type: lessonType,
          difficulty: pageGroup.importance === 'high' ? 1 : Math.min(5, Math.floor(pageGroup.startPage / 100) + 1),
          estimated_time_min: pageGroup.importance === 'high' ? 8 : 5,
          learning_objective: metadata.learning_objective,
          title: metadata.title,
          title_punjabi: metadata.title_punjabi,
          description: metadata.description,
          order_index: lessonIndex + 1,
          unlock_after_lesson_id: lessonIndex > 0 ? `ggs_${String(pageGroups[i - 1].startPage).padStart(4, '0')}_${String(pageGroups[i - 1].endPage).padStart(4, '0')}` : undefined,
        };
        
        // Create blocks
        const blocks = createLessonBlocks(lessonId, lessonType, lines, pageGroup);
        
        // Insert lesson
        console.log(`📝 Creating lesson: ${lesson.title} (${blocks.length} blocks)...`);
        const { error: lessonError } = await supabase.from('lessons').insert([lesson]);
        
        if (lessonError) {
          console.error(`❌ Error creating lesson ${lessonId}:`, lessonError);
          errors++;
          continue;
        }
        
        // Insert blocks
        const { error: blocksError } = await supabase.from('lesson_blocks').insert(blocks);
        
        if (blocksError) {
          console.error(`❌ Error creating blocks for ${lessonId}:`, blocksError);
          // Try to clean up the lesson
          await supabase.from('lessons').delete().eq('id', lessonId);
          errors++;
          continue;
        }
        
        console.log(`✅ Created: ${lesson.title} (pages ${pageGroup.startPage}-${pageGroup.endPage}, ${blocks.length} blocks)`);
        created++;
        
        // Progress update every 50 lessons
        if (created % 50 === 0) {
          console.log(`\n📊 Progress: ${created} lessons created, ${skipped} skipped, ${errors} errors\n`);
        }
        
      } catch (err) {
        console.error(`❌ Error processing pages ${pageGroup.startPage}-${pageGroup.endPage}:`, err);
        errors++;
      }
    }
    
    console.log('\n🎉 Guru Granth Sahib Ji lessons migration complete!');
    console.log(`✅ Created: ${created} lessons`);
    console.log(`⚠️  Skipped: ${skipped} lessons (already exist or no content)`);
    console.log(`❌ Errors: ${errors} lessons`);
    console.log(`\nTotal lessons available: ${created + skipped}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateGGSLessons();
