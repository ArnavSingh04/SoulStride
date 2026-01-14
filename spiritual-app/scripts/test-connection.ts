import { supabase } from '../lib/supabase';

async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('holy_books')
      .select('count');
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Tables do not exist yet!');
        console.log('\n📋 Please follow these steps:');
        console.log('1. Go to: https://supabase.com/dashboard/project/xehvbppisebbzwolyfxj/sql');
        console.log('2. Open the file: lib/supabase-schema.sql');
        console.log('3. Copy its entire contents');
        console.log('4. Paste into Supabase SQL Editor');
        console.log('5. Click "Run" to create all tables');
        console.log('\nAfter creating tables, run: npm run migrate:prayers\n');
      } else {
        console.log('❌ Connection error:', error.message);
        console.log('Error code:', error.code);
      }
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('✅ Tables exist and are accessible\n');
    
    // Check if data exists
    const { data: prayers } = await supabase.from('prayers').select('count');
    const { data: baniLines } = await supabase.from('bani_lines').select('count');
    
    console.log('📊 Current data:');
    console.log(`   Prayers: ${prayers?.[0]?.count || 0}`);
    console.log(`   Bani Lines: ${baniLines?.[0]?.count || 0}`);
    console.log('\n✨ Database is ready for migration!\n');
    
    return true;
    
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

testConnection();

