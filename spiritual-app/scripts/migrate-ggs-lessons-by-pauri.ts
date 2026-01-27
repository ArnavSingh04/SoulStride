import { supabase } from '../lib/supabase-server';
import type { Lesson, LessonBlock } from '../lib/database.types';

/**
 * Comprehensive migration script to convert all 1400 pages of Guru Granth Sahib Ji
 * into structured lessons based on PAURIS (stanzas), not pages.
 * 
 * Structure Understanding:
 * - 31 Raags (musical sections)
 * - Shabads (hymns) within raags
 * - Pauris (stanzas) within shabads/vaars
 * 
 * Examples:
 * - Japji Sahib (Ang 1-8): 38 pauris over 8 pages = ~4.75 pauris/ang
 * - Sukhmani Sahib (Ang 262-296): 24 Ashtpadis × 8 pauris = 192 pauris
 * - Asa di Vaar (Ang 462-475): 24 pauris
 * 
 * Target: 10-20 lessons per page = 14,000-28,000 total lessons
 * Strategy: 1-3 pauris per lesson (depending on importance)
 */

interface Pauri {
  id: string;
  pageNumber: number;
  ang: number;
  pauriNumber: number;
  startLineOrder: number;
  endLineOrder: number;
  lines: any[];
  importance: 'high' | 'medium' | 'normal';
  section?: string;
}

interface PauriGroup {
  pauris: Pauri[];
  startPage: number;
  endPage: number;
  section?: string;
  importance: 'high' | 'medium' | 'normal';
}

// Important sections with known pauri counts
const IMPORTANT_SECTIONS: Record<string, { 
  pages: number[]; 
  pauriCount: number; 
  importance: 'high' | 'medium';
  paurisPerLesson: number;
}> = {
  'Mool Mantar': { 
    pages: [1], 
    pauriCount: 1, 
    importance: 'high',
    paurisPerLesson: 1, // 1 lesson for Mool Mantar
  },
  'Japji Sahib': { 
    pages: [1, 2, 3, 4, 5, 6, 7, 8], 
    pauriCount: 38, 
    importance: 'high',
    paurisPerLesson: 1, // 1 pauri per lesson = 38 lessons for Japji
  },
  'Sukhmani Sahib': { 
    pages: Array.from({length: 35}, (_, i) => 262 + i), // Ang 262-296
    pauriCount: 192, // 24 Ashtpadis × 8 pauris
    importance: 'high',
    paurisPerLesson: 1, // 1 pauri per lesson = 192 lessons
  },
  'Asa di Vaar': { 
    pages: Array.from({length: 14}, (_, i) => 462 + i), // Ang 462-475
    pauriCount: 24,
    importance: 'high',
    paurisPerLesson: 1, // 1 pauri per lesson = 24 lessons
  },
  'Rehras Sahib': {
    pages: [8, 9, 10],
    pauriCount: 6, // Approximate
    importance: 'medium',
    paurisPerLesson: 1, // 1 pauri per lesson
  },
  'Kirtan Sohila': {
    pages: [12, 13],
    pauriCount: 4, // Approximate
    importance: 'medium',
    paurisPerLesson: 1, // 1 pauri per lesson
  },
};

// Lesson type distribution
const LESSON_TYPES = ['precision', 'meaning', 'practice', 'reflection', 'context'] as const;
type LessonType = typeof LESSON_TYPES[number];

// Block patterns for lesson types
const BLOCK_PATTERNS: Record<LessonType, string[]> = {
  precision: ['objective', 'scripture', 'explanation', 'question', 'reflection'],
  meaning: ['objective', 'scripture', 'definition', 'explanation', 'analogy', 'reflection'],
  practice: ['objective', 'scripture', 'explanation', 'question', 'match', 'reflection'],
  reflection: ['objective', 'scripture', 'context', 'guided_reflection', 'summary'],
  context: ['objective', 'scripture', 'context', 'explanation', 'reflection'],
};

/**
 * Identify pauris from text patterns
 * Pauris are typically marked by "॥" (double vertical bars) in Gurmukhi
 */
function identifyPauris(lines: any[], pageNumber: number, ang: number): Pauri[] {
  const pauris: Pauri[] = [];
  let currentPauri: any[] = [];
  let pauriNumber = 1;
  let startLineOrder = lines[0]?.line_order || 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    currentPauri.push(line);
    
    // Check if line ends a pauri (contains "॥" or similar markers)
    const punjabiText = line.punjabi || '';
    const endsPauri = punjabiText.includes('॥') || 
                      punjabiText.includes('||') ||
                      punjabiText.trim().endsWith('॥') ||
                      punjabiText.trim().endsWith('||');
    
    // Also check if next line starts a new section (different raag/author)
    const nextLine = lines[i + 1];
    const startsNewSection = nextLine && (
      nextLine.raag !== line.raag ||
      nextLine.author !== line.author ||
      (nextLine.line_order - line.line_order) > 5 // Large gap suggests new section
    );
    
    if (endsPauri || startsNewSection || i === lines.length - 1) {
      if (currentPauri.length > 0) {
        // Determine importance based on section
        let importance: 'high' | 'medium' | 'normal' = 'normal';
        let section: string | undefined;
        
        for (const [sectionName, sectionInfo] of Object.entries(IMPORTANT_SECTIONS)) {
          if (sectionInfo.pages.includes(pageNumber)) {
            importance = sectionInfo.importance;
            section = sectionName;
            break;
          }
        }
        
        pauris.push({
          id: `pauri_${pageNumber}_${ang}_${pauriNumber}`,
          pageNumber,
          ang,
          pauriNumber,
          startLineOrder: currentPauri[0].line_order,
          endLineOrder: currentPauri[currentPauri.length - 1].line_order,
          lines: [...currentPauri],
          importance,
          section,
        });
        
        currentPauri = [];
        pauriNumber++;
      }
    }
  }
  
  // If no pauri markers found, group lines into logical pauris (8-12 lines each)
  if (pauris.length === 0) {
    const linesPerPauri = 10; // Average pauri length
    for (let i = 0; i < lines.length; i += linesPerPauri) {
      const pauriLines = lines.slice(i, i + linesPerPauri);
      if (pauriLines.length > 0) {
        let importance: 'high' | 'medium' | 'normal' = 'normal';
        let section: string | undefined;
        
        for (const [sectionName, sectionInfo] of Object.entries(IMPORTANT_SECTIONS)) {
          if (sectionInfo.pages.includes(pageNumber)) {
            importance = sectionInfo.importance;
            section = sectionName;
            break;
          }
        }
        
        pauris.push({
          id: `pauri_${pageNumber}_${ang}_${Math.floor(i / linesPerPauri) + 1}`,
          pageNumber,
          ang,
          pauriNumber: Math.floor(i / linesPerPauri) + 1,
          startLineOrder: pauriLines[0].line_order,
          endLineOrder: pauriLines[pauriLines.length - 1].line_order,
          lines: pauriLines,
          importance,
          section,
        });
      }
    }
  }
  
  return pauris;
}

/**
 * Group pauris into lessons
 * Important sections: 1 pauri per lesson
 * Normal sections: 2-3 pauris per lesson
 */
function groupPaurisIntoLessons(pauris: Pauri[]): PauriGroup[] {
  const groups: PauriGroup[] = [];
  let i = 0;
  
  while (i < pauris.length) {
    const currentPauri = pauris[i];
    const group: Pauri[] = [currentPauri];
    
    // Determine how many pauris per lesson
    let paurisPerLesson = 2; // Default
    
    if (currentPauri.importance === 'high') {
      paurisPerLesson = 1; // Important: 1 pauri per lesson
    } else if (currentPauri.importance === 'medium') {
      paurisPerLesson = 1; // Medium: also 1 pauri per lesson
    } else {
      // Normal: 2-3 pauris per lesson (randomized for variety)
      paurisPerLesson = 2 + Math.floor(Math.random() * 2); // 2-3 pauris
    }
    
    // Add additional pauris to group
    for (let j = 1; j < paurisPerLesson && i + j < pauris.length; j++) {
      const nextPauri = pauris[i + j];
      // Only group if same importance level
      if (nextPauri.importance === currentPauri.importance) {
        group.push(nextPauri);
      } else {
        break;
      }
    }
    
    groups.push({
      pauris: group,
      startPage: Math.min(...group.map(p => p.pageNumber)),
      endPage: Math.max(...group.map(p => p.pageNumber)),
      section: currentPauri.section,
      importance: currentPauri.importance,
    });
    
    i += group.length;
  }
  
  return groups;
}

/**
 * Fetch lines for a page
 */
async function getPageLines(pageNumber: number): Promise<any[]> {
  const { data, error } = await supabase
    .from('bani_lines')
    .select('*')
    .eq('holy_book_id', 'guru-granth-sahib')
    .eq('page_number', pageNumber)
    .order('line_order');
  
  if (error) {
    console.error(`Error fetching page ${pageNumber}:`, error);
    return [];
  }
  
  return data || [];
}

/**
 * Get lesson type based on position and importance
 */
function getLessonType(pauriNumber: number, importance: 'high' | 'medium' | 'normal'): LessonType {
  if (importance === 'high') {
    const types: LessonType[] = ['precision', 'meaning', 'context'];
    return types[pauriNumber % types.length];
  }
  return LESSON_TYPES[pauriNumber % LESSON_TYPES.length];
}

/**
 * Create lesson blocks
 */
function createLessonBlocks(
  lessonId: string,
  lessonType: LessonType,
  pauriGroup: PauriGroup
): Omit<LessonBlock, 'id' | 'created_at'>[] {
  const blocks: Omit<LessonBlock, 'id' | 'created_at'>[] = [];
  let blockOrder = 1;
  const pattern = BLOCK_PATTERNS[lessonType];
  
  // Collect all lines from all pauris in group
  const allLines = pauriGroup.pauris.flatMap(p => p.lines);
  
  // 1. Objective
  blocks.push({
    lesson_id: lessonId,
    block_order: blockOrder++,
    block_type: 'objective',
    block_data: {
      text: `Study and understand ${pauriGroup.pauris.length} pauri${pauriGroup.pauris.length > 1 ? 's' : ''} from ${pauriGroup.section || `page ${pauriGroup.startPage}`} of Guru Granth Sahib Ji.`,
    },
  });
  
  // 2. Scripture blocks (show key lines from each pauri)
  pauriGroup.pauris.forEach((pauri, pauriIdx) => {
    // Show first 3-5 lines of each pauri
    const linesToShow = pauri.lines.slice(0, Math.min(5, pauri.lines.length));
    linesToShow.forEach((line, lineIdx) => {
      blocks.push({
        lesson_id: lessonId,
        block_order: blockOrder++,
        block_type: 'scripture',
        block_data: {
          gurmukhi: line.punjabi,
          transliteration: line.transliteration_english || '',
          translation: line.english,
          show_by_default: pauriIdx === 0 && lineIdx === 0,
        },
      });
    });
  });
  
  // 3. Context (for important sections)
  if (pauriGroup.importance === 'high' && pattern.includes('context')) {
    blocks.push({
      lesson_id: lessonId,
      block_order: blockOrder++,
      block_type: 'context',
      block_data: {
        text: `This ${pauriGroup.section || 'section'} holds special significance in Sikh philosophy. Reflect deeply on its teachings.`,
      },
    });
  }
  
  // 4. Explanation
  if (pattern.includes('explanation')) {
    blocks.push({
      lesson_id: lessonId,
      block_order: blockOrder++,
      block_type: 'explanation',
      block_data: {
        text: `These pauris convey profound spiritual teachings. Consider how these words guide your understanding of the divine and your relationship with creation.`,
      },
    });
  }
  
  // 5. Interactive blocks
  if (lessonType === 'precision' && pattern.includes('question')) {
    blocks.push({
      lesson_id: lessonId,
      block_order: blockOrder++,
      block_type: 'question',
      block_data: {
        question_type: 'mcq',
        prompt: 'What is the central theme of these teachings?',
        options: [
          'Divine unity and oneness',
          'Historical narratives',
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
    const sampleLines = allLines.slice(0, 3);
    blocks.push({
      lesson_id: lessonId,
      block_order: blockOrder++,
      block_type: 'match',
      block_data: {
        prompt: 'Match the Gurmukhi with its English translation',
        pairs: sampleLines.map((line, idx) => ({
          left: line.punjabi.substring(0, 40) + '...',
          right: line.english.substring(0, 60) + '...',
          correct_pair: idx,
        })),
      },
    });
  }
  
  // 6. Reflection
  if (pattern.includes('reflection')) {
    blocks.push({
      lesson_id: lessonId,
      block_order: blockOrder++,
      block_type: 'reflection',
      block_data: {
        prompt: `How do these ${pauriGroup.pauris.length} pauri${pauriGroup.pauris.length > 1 ? 's' : ''} relate to your spiritual practice?`,
      },
    });
  }
  
  // 7. Summary
  blocks.push({
    lesson_id: lessonId,
    block_order: blockOrder++,
    block_type: 'summary',
    block_data: {
      text: `You've completed studying ${pauriGroup.pauris.length} pauri${pauriGroup.pauris.length > 1 ? 's' : ''} from ${pauriGroup.section || `page ${pauriGroup.startPage}`}. Continue your journey.`,
    },
  });
  
  return blocks;
}

/**
 * Main migration function
 */
async function migrateGGSLessonsByPauri() {
  console.log('🚀 Starting Guru Granth Sahib lessons migration (by Pauri)...\n');
  
  try {
    // Get total pages
    const { data: holyBook } = await supabase
      .from('holy_books')
      .select('total_pages')
      .eq('id', 'guru-granth-sahib')
      .single();
    
    const totalPages = holyBook?.total_pages || 1430;
    console.log(`📖 Total pages to process: ${totalPages}\n`);
    
    let allPauris: Pauri[] = [];
    let totalLessons = 0;
    
    // Process each page to identify pauris
    console.log('🔍 Identifying pauris from pages...\n');
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const lines = await getPageLines(pageNum);
      if (lines.length === 0) continue;
      
      const ang = lines[0]?.ang || pageNum;
      const pauris = identifyPauris(lines, pageNum, ang);
      allPauris.push(...pauris);
      
      if (pageNum % 100 === 0) {
        console.log(`  Processed ${pageNum}/${totalPages} pages, found ${allPauris.length} pauris so far...`);
      }
    }
    
    console.log(`\n✅ Identified ${allPauris.length} total pauris\n`);
    
    // Group pauris into lessons
    const pauriGroups = groupPaurisIntoLessons(allPauris);
    console.log(`📚 Created ${pauriGroups.length} lesson groups\n`);
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    // Process each group
    for (let i = 0; i < pauriGroups.length; i++) {
      const group = pauriGroups[i];
      const pauriNumbers = group.pauris.map(p => p.pauriNumber).join('-');
      const lessonId = `ggs_p${group.startPage}_pauri${pauriNumbers}`;
      
      // Check if exists
      const { data: existing } = await supabase
        .from('lessons')
        .select('id')
        .eq('id', lessonId)
        .single();
      
      if (existing) {
        skipped++;
        continue;
      }
      
      try {
        const lessonType = getLessonType(group.pauris[0].pauriNumber, group.importance);
        const blocks = createLessonBlocks(lessonId, lessonType, group);
        
        const lesson: Lesson = {
          id: lessonId,
          holy_book_id: 'guru-granth-sahib',
          section: group.section || 'Guru Granth Sahib',
          lesson_type: lessonType,
          difficulty: group.importance === 'high' ? 1 : Math.min(5, Math.floor(group.startPage / 100) + 1),
          estimated_time_min: group.importance === 'high' ? 8 : 5,
          learning_objective: `Study ${group.pauris.length} pauri${group.pauris.length > 1 ? 's' : ''} from ${group.section || `page ${group.startPage}`}`,
          title: `${group.section || `Page ${group.startPage}`} - Pauri ${pauriNumbers}`,
          title_punjabi: group.section || `ਅੰਗ ${group.startPage}`,
          description: `Study of ${group.pauris.length} pauri${group.pauris.length > 1 ? 's' : ''} from Guru Granth Sahib Ji`,
          order_index: i + 1,
          unlock_after_lesson_id: i > 0 ? (() => {
            const prevGroup = pauriGroups[i - 1];
            const prevPauriNumbers = prevGroup.pauris.map(p => p.pauriNumber).join('-');
            return `ggs_p${prevGroup.startPage}_pauri${prevPauriNumbers}`;
          })() : undefined,
        };
        
        // Insert lesson
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
          await supabase.from('lessons').delete().eq('id', lessonId);
          errors++;
          continue;
        }
        
        created++;
        
        if (created % 100 === 0) {
          console.log(`📊 Progress: ${created} lessons created, ${skipped} skipped, ${errors} errors`);
        }
        
      } catch (err) {
        console.error(`❌ Error processing group ${i}:`, err);
        errors++;
      }
    }
    
    console.log('\n🎉 Migration complete!');
    console.log(`✅ Created: ${created} lessons`);
    console.log(`⚠️  Skipped: ${skipped} lessons`);
    console.log(`❌ Errors: ${errors} lessons`);
    console.log(`\n📊 Total: ${allPauris.length} pauris → ${pauriGroups.length} lesson groups`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

migrateGGSLessonsByPauri();
