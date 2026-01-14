import { supabase } from './supabase';
import type { 
  Prayer, 
  PrayerLine, 
  PrayerWithLines, 
  BaniLine, 
  PageWithLines,
  HolyBook 
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

