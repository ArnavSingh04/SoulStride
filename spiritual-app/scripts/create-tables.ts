import { supabase } from '../lib/supabase';

async function createTables() {
  console.log('🏗️  Creating database tables...\n');
  
  const schema = `
    -- Table: holy_books
    CREATE TABLE IF NOT EXISTS holy_books (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      name_punjabi VARCHAR(255) NOT NULL,
      name_hindi VARCHAR(255),
      description TEXT,
      total_pages INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Table: bani_lines
    CREATE TABLE IF NOT EXISTS bani_lines (
      id BIGSERIAL PRIMARY KEY,
      holy_book_id VARCHAR(100) REFERENCES holy_books(id) ON DELETE CASCADE,
      page_number INTEGER,
      ang INTEGER,
      line_number INTEGER,
      line_order INTEGER NOT NULL,
      punjabi TEXT NOT NULL,
      english TEXT NOT NULL,
      hindi TEXT,
      transliteration_english TEXT,
      transliteration_hindi TEXT,
      author VARCHAR(255),
      raag VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Table: prayers
    CREATE TABLE IF NOT EXISTS prayers (
      id VARCHAR(100) PRIMARY KEY,
      holy_book_id VARCHAR(100) REFERENCES holy_books(id) ON DELETE SET NULL,
      name VARCHAR(255) NOT NULL,
      name_punjabi VARCHAR(255) NOT NULL,
      name_hindi VARCHAR(255),
      description TEXT,
      type VARCHAR(50),
      time_of_day VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Table: prayer_lines
    CREATE TABLE IF NOT EXISTS prayer_lines (
      id BIGSERIAL PRIMARY KEY,
      prayer_id VARCHAR(100) REFERENCES prayers(id) ON DELETE CASCADE,
      line_order INTEGER NOT NULL,
      punjabi TEXT NOT NULL,
      english TEXT NOT NULL,
      hindi TEXT,
      transliteration_english TEXT,
      transliteration_hindi TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(prayer_id, line_order)
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_bani_lines_holy_book ON bani_lines(holy_book_id);
    CREATE INDEX IF NOT EXISTS idx_bani_lines_page ON bani_lines(page_number);
    CREATE INDEX IF NOT EXISTS idx_bani_lines_ang ON bani_lines(ang);
    CREATE INDEX IF NOT EXISTS idx_prayer_lines_prayer ON prayer_lines(prayer_id);
    CREATE INDEX IF NOT EXISTS idx_prayers_holy_book ON prayers(holy_book_id);
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.log('❌ Note: Direct SQL execution requires database admin access.');
      console.log('\n📋 Please create tables manually:');
      console.log('1. Go to: https://supabase.com/dashboard/project/xehvbppisebbzwolyfxj/sql');
      console.log('2. Open: lib/supabase-schema.sql');
      console.log('3. Copy & paste into SQL Editor');
      console.log('4. Click "Run"\n');
      return false;
    }
    
    console.log('✅ Tables created successfully!\n');
    return true;
    
  } catch (error: any) {
    console.log('❌ Cannot execute SQL directly with this API key.');
    console.log('\n📋 Manual setup required:');
    console.log('1. Go to: https://supabase.com/dashboard/project/xehvbppisebbzwolyfxj/sql');
    console.log('2. Open: lib/supabase-schema.sql');
    console.log('3. Copy the entire file contents');
    console.log('4. Paste into Supabase SQL Editor');
    console.log('5. Click "Run" to create all tables');
    console.log('\nThen run: npm run db:test\n');
    return false;
  }
}

createTables();

