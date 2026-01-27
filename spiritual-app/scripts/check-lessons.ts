import { supabase } from '../lib/supabase-server';

console.log('🔍 Checking lessons database setup...\n');

async function checkLessons() {
  try {
    // Check if lessons table exists
    console.log('1. Checking if lessons table exists...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('count')
      .limit(1);
    
    if (lessonsError) {
      if (lessonsError.code === '42P01' || lessonsError.message?.includes('does not exist')) {
        console.error('❌ Lessons table does not exist!');
        console.log('\n📝 Please run the database schema migration:');
        console.log('   1. Go to your Supabase dashboard');
        console.log('   2. Navigate to SQL Editor');
        console.log('   3. Run the SQL from: lib/supabase-schema.sql');
        console.log('   4. Make sure to include the lessons and lesson_blocks tables\n');
        return;
      }
      console.error('❌ Error checking lessons table:', lessonsError);
      return;
    }
    
    console.log('✅ Lessons table exists\n');
    
    // Check if lesson_blocks table exists
    console.log('2. Checking if lesson_blocks table exists...');
    const { data: blocks, error: blocksError } = await supabase
      .from('lesson_blocks')
      .select('count')
      .limit(1);
    
    if (blocksError) {
      if (blocksError.code === '42P01' || blocksError.message?.includes('does not exist')) {
        console.error('❌ Lesson_blocks table does not exist!');
        console.log('\n📝 Please run the database schema migration (see above)\n');
        return;
      }
      console.error('❌ Error checking lesson_blocks table:', blocksError);
      return;
    }
    
    console.log('✅ Lesson_blocks table exists\n');
    
    // Count lessons
    console.log('3. Counting lessons...');
    const { count, error: countError } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting lessons:', countError);
      return;
    }
    
    console.log(`📊 Found ${count || 0} lessons in database\n`);
    
    if (count === 0) {
      console.log('⚠️  No lessons found!');
      console.log('\n📝 To create template lessons, run:');
      console.log('   npm run migrate:template-lessons\n');
    } else {
      // List lessons
      const { data: lessonList, error: listError } = await supabase
        .from('lessons')
        .select('id, title, section, order_index')
        .order('section')
        .order('order_index');
      
      if (!listError && lessonList) {
        console.log('📚 Available lessons:');
        lessonList.forEach((lesson) => {
          console.log(`   - ${lesson.title} (${lesson.section}, order: ${lesson.order_index})`);
        });
        console.log('');
      }
    }
    
    // Check blocks
    console.log('4. Checking lesson blocks...');
    const { count: blockCount, error: blockCountError } = await supabase
      .from('lesson_blocks')
      .select('*', { count: 'exact', head: true });
    
    if (blockCountError) {
      console.error('❌ Error counting blocks:', blockCountError);
      return;
    }
    
    console.log(`📦 Found ${blockCount || 0} lesson blocks\n`);
    
    if (count && count > 0 && blockCount === 0) {
      console.log('⚠️  Lessons exist but have no blocks!');
      console.log('   This might indicate incomplete migration.\n');
    }
    
    console.log('✅ Database check complete!\n');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkLessons();
