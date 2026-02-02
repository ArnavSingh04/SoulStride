import { supabase } from './supabase';
import type { 
  Prayer, 
  PrayerLine, 
  PrayerWithLines, 
  BaniLine, 
  PageWithLines,
  HolyBook,
  Lesson,
  LessonBlock,
  LessonWithBlocks,
  LessonProgress
} from './database.types';

// ============== HOLY BOOKS ==============

export async function getAllHolyBooks(): Promise<HolyBook[]> {
  const { data, error } = await supabase
    .from('holy_books')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching holy books:', error);
    return [];
  }
  
  return data || [];
}

export async function getHolyBookById(id: string): Promise<HolyBook | null> {
  const { data, error } = await supabase
    .from('holy_books')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching holy book:', error);
    return null;
  }
  
  return data;
}

// ============== PRAYERS ==============

export async function getAllPrayers(holyBookId?: string): Promise<PrayerWithLines[]> {
  let query = supabase
    .from('prayers')
    .select('*');
  
  // Filter by holy book if specified
  if (holyBookId) {
    query = query.eq('holy_book_id', holyBookId);
  }
  
  const { data: prayers, error: prayersError } = await query.order('name');
  
  if (prayersError) {
    console.error('Error fetching prayers:', prayersError);
    return [];
  }
  
  if (!prayers) return [];
  
  // Fetch lines for each prayer
  const prayersWithLines = await Promise.all(
    prayers.map(async (prayer) => {
      const { data: lines, error: linesError } = await supabase
        .from('prayer_lines')
        .select('*')
        .eq('prayer_id', prayer.id)
        .order('line_order');
      
      if (linesError) {
        console.error('Error fetching prayer lines:', linesError);
        return { ...prayer, lines: [] };
      }
      
      return {
        ...prayer,
        lines: lines || []
      };
    })
  );
  
  return prayersWithLines;
}

export async function getPrayersByHolyBook(holyBookId: string): Promise<PrayerWithLines[]> {
  return getAllPrayers(holyBookId);
}

export async function getPrayerById(id: string): Promise<PrayerWithLines | null> {
  const { data: prayer, error: prayerError } = await supabase
    .from('prayers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (prayerError) {
    console.error('Error fetching prayer:', prayerError);
    return null;
  }
  
  const { data: lines, error: linesError } = await supabase
    .from('prayer_lines')
    .select('*')
    .eq('prayer_id', id)
    .order('line_order');
  
  if (linesError) {
    console.error('Error fetching prayer lines:', linesError);
    return { ...prayer, lines: [] };
  }
  
  return {
    ...prayer,
    lines: lines || []
  };
}

export async function searchPrayers(query: string, holyBookId?: string): Promise<PrayerWithLines[]> {
  if (!query.trim()) {
    return getAllPrayers(holyBookId);
  }
  
  // Search in prayers table
  let prayersQuery = supabase
    .from('prayers')
    .select('*')
    .or(`name.ilike.%${query}%,name_punjabi.ilike.%${query}%,description.ilike.%${query}%`);
  
  // Filter by holy book if specified
  if (holyBookId) {
    prayersQuery = prayersQuery.eq('holy_book_id', holyBookId);
  }
  
  const { data: prayers, error: prayersError } = await prayersQuery.order('name');
  
  if (prayersError) {
    console.error('Error searching prayers:', prayersError);
    return [];
  }
  
  // Also search in prayer lines
  const { data: prayerLines, error: linesError } = await supabase
    .from('prayer_lines')
    .select('prayer_id')
    .or(`punjabi.ilike.%${query}%,english.ilike.%${query}%`);
  
  if (linesError) {
    console.error('Error searching prayer lines:', linesError);
  }
  
  // Combine results
  const prayerIds = new Set([
    ...(prayers || []).map(p => p.id),
    ...(prayerLines || []).map(pl => pl.prayer_id)
  ]);
  
  // Fetch complete prayer data with lines
  let prayersWithLines = await Promise.all(
    Array.from(prayerIds).map(async (id) => {
      return await getPrayerById(id);
    })
  );
  
  // Filter by holy book if specified (for results from prayer lines search)
  if (holyBookId) {
    prayersWithLines = prayersWithLines.filter(p => p?.holy_book_id === holyBookId);
  }
  
  return prayersWithLines.filter(p => p !== null) as PrayerWithLines[];
}

// Get summary of prayers grouped by holy book
export async function getPrayersSummaryByHolyBook() {
  const { data: summary, error } = await supabase
    .from('prayers')
    .select('holy_book_id, holy_books(name, name_punjabi, name_hindi)')
    .order('holy_book_id');
  
  if (error) {
    console.error('Error fetching prayers summary:', error);
    return [];
  }
  
  // Group and count prayers by holy book
  const grouped = (summary || []).reduce((acc: any, item: any) => {
    const bookId = item.holy_book_id;
    if (!acc[bookId]) {
      acc[bookId] = {
        holy_book_id: bookId,
        holy_book_name: item.holy_books?.name || bookId,
        holy_book_name_punjabi: item.holy_books?.name_punjabi || '',
        holy_book_name_hindi: item.holy_books?.name_hindi || '',
        prayer_count: 0
      };
    }
    acc[bookId].prayer_count++;
    return acc;
  }, {});
  
  return Object.values(grouped);
}

// ============== GURU GRANTH SAHIB / BANI LINES ==============

export async function getGGSPage(pageNumber: number): Promise<PageWithLines | null> {
  const { data: lines, error } = await supabase
    .from('bani_lines')
    .select('*')
    .eq('page_number', pageNumber)
    .eq('holy_book_id', 'guru-granth-sahib')
    .order('line_order');
  
  if (error) {
    console.error('Error fetching GGS page:', error);
    return null;
  }
  
  if (!lines || lines.length === 0) {
    return null;
  }
  
  return {
    pageNumber,
    lines: lines
  };
}

export async function searchGGS(query: string, limit: number = 50): Promise<BaniLine[]> {
  const { data, error } = await supabase
    .from('bani_lines')
    .select('*')
    .eq('holy_book_id', 'guru-granth-sahib')
    .or(`punjabi.ilike.%${query}%,english.ilike.%${query}%,transliteration_english.ilike.%${query}%`)
    .order('page_number')
    .order('line_order')
    .limit(limit);
  
  if (error) {
    console.error('Error searching GGS:', error);
    return [];
  }
  
  return data || [];
}

export async function getTotalGGSPages(): Promise<number> {
  const { data: holyBook } = await supabase
    .from('holy_books')
    .select('total_pages')
    .eq('id', 'guru-granth-sahib')
    .single();
  
  if (holyBook?.total_pages) {
    return holyBook.total_pages;
  }
  
  // Fallback: count max page number
  const { data } = await supabase
    .from('bani_lines')
    .select('page_number')
    .eq('holy_book_id', 'guru-granth-sahib')
    .order('page_number', { ascending: false })
    .limit(1);
  
  return data?.[0]?.page_number || 1430;
}

export async function getPageByNumber(pageNumber: number): Promise<PageWithLines | null> {
  return getGGSPage(pageNumber);
}

export async function searchPages(query: string): Promise<BaniLine[]> {
  return searchGGS(query);
}

export async function getTotalPages(): Promise<number> {
  return getTotalGGSPages();
}

// ============== LESSONS ==============

/** Fetch lessons with pagination (for learning journey infinite scroll). Returns one page and whether more exist. */
export async function getLessonsPaginated(
  holyBookId: string,
  limit: number,
  offset: number
): Promise<{ lessons: LessonWithBlocks[]; hasMore: boolean }> {
  try {
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('holy_book_id', holyBookId)
      .order('order_index')
      .range(offset, offset + limit - 1);

    if (lessonsError) {
      if (lessonsError.code === '42P01' || lessonsError.message?.includes('does not exist')) {
        throw new Error('Lessons table does not exist. Please run the database schema migration first.');
      }
      throw new Error(`Database error: ${lessonsError.message || 'Unknown error'}`);
    }

    if (!lessons || lessons.length === 0) {
      return { lessons: [], hasMore: false };
    }

    const lessonsWithBlocks = await Promise.all(
      lessons.map(async (lesson) => {
        const { data: blocks, error: blocksError } = await supabase
          .from('lesson_blocks')
          .select('*')
          .eq('lesson_id', lesson.id)
          .order('block_order');

        if (blocksError) {
          console.error(`Error fetching blocks for lesson ${lesson.id}:`, blocksError);
          return { ...lesson, blocks: [] };
        }
        return { ...lesson, blocks: blocks || [] };
      })
    );

    return {
      lessons: lessonsWithBlocks,
      hasMore: lessons.length === limit,
    };
  } catch (error) {
    console.error('Error in getLessonsPaginated:', error);
    throw error;
  }
}

export async function getAllLessons(holyBookId?: string, section?: string): Promise<LessonWithBlocks[]> {
  try {
    let query = supabase
      .from('lessons')
      .select('*');
    
    if (holyBookId) {
      query = query.eq('holy_book_id', holyBookId);
    }
    
    if (section) {
      query = query.eq('section', section);
    }
    
    const { data: lessons, error: lessonsError } = await query.order('order_index');
    
    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      console.error('Error details:', JSON.stringify(lessonsError, null, 2));
      // Check if table doesn't exist
      if (lessonsError.code === '42P01' || lessonsError.message?.includes('does not exist')) {
        throw new Error('Lessons table does not exist. Please run the database schema migration first.');
      }
      throw new Error(`Database error: ${lessonsError.message || 'Unknown error'}`);
    }
    
    if (!lessons || lessons.length === 0) {
      console.log('No lessons found in database');
      return [];
    }
    
    console.log(`Found ${lessons.length} lessons`);
  
    // Fetch blocks for each lesson
    const lessonsWithBlocks = await Promise.all(
      lessons.map(async (lesson) => {
        const { data: blocks, error: blocksError } = await supabase
          .from('lesson_blocks')
          .select('*')
          .eq('lesson_id', lesson.id)
          .order('block_order');
        
        if (blocksError) {
          console.error(`Error fetching blocks for lesson ${lesson.id}:`, blocksError);
          return { ...lesson, blocks: [] };
        }
        
        return {
          ...lesson,
          blocks: blocks || []
        };
      })
    );
    
    return lessonsWithBlocks;
  } catch (error) {
    console.error('Error in getAllLessons:', error);
    throw error; // Re-throw to let component handle it
  }
}

export async function getLessonById(id: string): Promise<LessonWithBlocks | null> {
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single();
  
  if (lessonError) {
    console.error('Error fetching lesson:', lessonError);
    return null;
  }
  
  const { data: blocks, error: blocksError } = await supabase
    .from('lesson_blocks')
    .select('*')
    .eq('lesson_id', id)
    .order('block_order');
  
  if (blocksError) {
    console.error('Error fetching lesson blocks:', blocksError);
    return { ...lesson, blocks: [] };
  }
  
  return {
    ...lesson,
    blocks: blocks || []
  };
}

export async function getLessonsBySection(section: string, holyBookId?: string): Promise<LessonWithBlocks[]> {
  return getAllLessons(holyBookId, section);
}

export async function getLessonsByHolyBook(holyBookId: string): Promise<LessonWithBlocks[]> {
  return getAllLessons(holyBookId);
}

export async function searchLessons(query: string, holyBookId?: string): Promise<LessonWithBlocks[]> {
  if (!query.trim()) {
    return getAllLessons(holyBookId);
  }
  
  let lessonsQuery = supabase
    .from('lessons')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,learning_objective.ilike.%${query}%,section.ilike.%${query}%`);
  
  if (holyBookId) {
    lessonsQuery = lessonsQuery.eq('holy_book_id', holyBookId);
  }
  
  const { data: lessons, error: lessonsError } = await lessonsQuery.order('order_index');
  
  if (lessonsError) {
    console.error('Error searching lessons:', lessonsError);
    return [];
  }
  
  if (!lessons || lessons.length === 0) {
    return [];
  }
  
  // Fetch blocks for each lesson
  const lessonsWithBlocks = await Promise.all(
    lessons.map(async (lesson) => {
      const { data: blocks } = await supabase
        .from('lesson_blocks')
        .select('*')
        .eq('lesson_id', lesson.id)
        .order('block_order');
      
      return {
        ...lesson,
        blocks: blocks || []
      };
    })
  );
  
  return lessonsWithBlocks;
}

// Lesson progress functions (for when user auth is implemented)
export async function getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | null> {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();
  
  if (error) {
    console.error('Error fetching lesson progress:', error);
    return null;
  }
  
  return data;
}

export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  progress: Partial<LessonProgress>
): Promise<LessonProgress | null> {
  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      ...progress,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,lesson_id'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error updating lesson progress:', error);
    return null;
  }
  
  return data;
}

export async function getUserProgressForSection(userId: string, section: string): Promise<LessonProgress[]> {
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('section', section);
  
  if (!lessons || lessons.length === 0) {
    return [];
  }
  
  const lessonIds = lessons.map(l => l.id);
  
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds);
  
  if (error) {
    console.error('Error fetching user progress:', error);
    return [];
  }
  
  return data || [];
}

