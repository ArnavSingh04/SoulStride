import { supabase } from '../lib/supabase-server';
import { guruGranthSahibData } from '../data/guruGranthSahib';

async function migrateGuruGranthSahib() {
  console.log('📖 Starting Guru Granth Sahib Ji migration to Supabase...');
  console.log(`Total pages to migrate: ${guruGranthSahibData.length}`);
  
  // First, insert or update the holy book record
  console.log('\n📚 Creating holy book record...');
  const { error: bookError } = await supabase
    .from('holy_books')
    .upsert({
      id: 'guru-granth-sahib',
      name: 'Guru Granth Sahib Ji',
      name_punjabi: 'ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ',
      description: 'The central religious scripture of Sikhism, regarded as the final, sovereign and eternal Guru',
      total_pages: guruGranthSahibData.length,
    }, {
      onConflict: 'id'
    });
  
  if (bookError) {
    console.error('❌ Error creating holy book record:', bookError);
    return;
  }
  
  console.log('✅ Holy book record created');
  console.log('\n📄 Starting pages migration...');
  console.log('This may take a while...\n');
  
  let successCount = 0;
  let errorCount = 0;
  let totalLines = 0;
  
  // Process pages one by one
  for (let i = 0; i < guruGranthSahibData.length; i++) {
    const page = guruGranthSahibData[i];
    
    try {
      // Prepare lines data
      const baniLines = page.lines.map((line: any, index: number) => ({
        holy_book_id: 'guru-granth-sahib',
        page_number: page.pageNumber,
        ang: line.ang || null,
        line_number: line.line || null,
        line_order: index,
        punjabi: line.punjabi,
        english: line.english,
        transliteration_english: line.transliteration || null,
      }));
      
      totalLines += baniLines.length;
      
      // Delete existing lines for this page first
      await supabase
        .from('bani_lines')
        .delete()
        .eq('holy_book_id', 'guru-granth-sahib')
        .eq('page_number', page.pageNumber);
      
      // Insert lines in smaller batches
      const lineBatchSize = 100;
      for (let j = 0; j < baniLines.length; j += lineBatchSize) {
        const lineBatch = baniLines.slice(j, j + lineBatchSize);
        const { error: linesError } = await supabase
          .from('bani_lines')
          .insert(lineBatch);
        
        if (linesError) {
          console.error(`❌ Error inserting lines for page ${page.pageNumber}:`, linesError);
          errorCount++;
          break;
        }
      }
      
      successCount++;
      
      // Log progress every 10 pages
      if ((i + 1) % 10 === 0) {
        console.log(`⏳ Progress: ${i + 1}/${guruGranthSahibData.length} pages migrated...`);
      }
      
      // Small delay to avoid overwhelming the database
      if ((i + 1) % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      console.error(`❌ Unexpected error with page ${page.pageNumber}:`, error);
      errorCount++;
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successfully migrated: ${successCount} pages`);
  console.log(`📝 Total lines migrated: ${totalLines}`);
  console.log(`❌ Failed: ${errorCount} pages`);
  console.log('\n🎉 Guru Granth Sahib Ji migration completed!');
}

// Run migration
migrateGuruGranthSahib().catch(console.error);

