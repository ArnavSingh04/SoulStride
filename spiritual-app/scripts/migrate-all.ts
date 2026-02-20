import { supabase } from '../lib/supabase-server';

console.log('🚀 Starting complete migration to Supabase...');
console.log('This will migrate all prayers and Guru Granth Sahib Ji data.\n');

async function migrateAll() {
  try {
    // Test connection
    console.log('🔌 Testing Supabase connection...');
    const { data, error } = await supabase.from('holy_books').select('count').single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Failed to connect to Supabase:', error);
      return;
    }
    
    console.log('✅ Successfully connected to Supabase\n');
    
    // Import and run migrations
    console.log('═══════════════════════════════════════════');
    console.log('STEP 1: Migrating Prayers (organized by Holy Book)');
    console.log('═══════════════════════════════════════════\n');
    
    await import('./migrate-prayers');
    
    // Wait a bit before next migration
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n═══════════════════════════════════════════');
    console.log('STEP 2: Migrating Guru Granth Sahib Ji Pages');
    console.log('═══════════════════════════════════════════\n');
    
    await import('./migrate-ggs');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrateAll();

