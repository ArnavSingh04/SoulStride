-- Supabase Schema for SoulStride Spiritual App
-- This schema supports multiple holy books with multilingual support

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: holy_books
-- Stores information about different holy books (e.g., Guru Granth Sahib, etc.)
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
-- Stores individual lines from holy books with multilingual support
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
-- Stores prayers/banis with metadata
-- Each prayer MUST be associated with a holy book
CREATE TABLE IF NOT EXISTS prayers (
  id VARCHAR(100) PRIMARY KEY,
  holy_book_id VARCHAR(100) NOT NULL REFERENCES holy_books(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_punjabi VARCHAR(255) NOT NULL,
  name_hindi VARCHAR(255),
  description TEXT,
  type VARCHAR(50),
  time_of_day VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: prayer_lines
-- Stores individual lines of prayers with multilingual support
CREATE TABLE IF NOT EXISTS prayer_lines (
  id BIGSERIAL PRIMARY KEY,
  prayer_id VARCHAR(100) REFERENCES prayers(id) ON DELETE CASCADE,
  holy_book_id VARCHAR(100) REFERENCES holy_books(id) ON DELETE CASCADE,
  line_order INTEGER NOT NULL,
  punjabi TEXT NOT NULL,
  english TEXT NOT NULL,
  hindi TEXT,
  transliteration_english TEXT,
  transliteration_hindi TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(prayer_id, line_order)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bani_lines_holy_book ON bani_lines(holy_book_id);
CREATE INDEX IF NOT EXISTS idx_bani_lines_page ON bani_lines(page_number);
CREATE INDEX IF NOT EXISTS idx_bani_lines_ang ON bani_lines(ang);
CREATE INDEX IF NOT EXISTS idx_prayer_lines_prayer ON prayer_lines(prayer_id);
CREATE INDEX IF NOT EXISTS idx_prayer_lines_holy_book ON prayer_lines(holy_book_id);
CREATE INDEX IF NOT EXISTS idx_prayers_holy_book ON prayers(holy_book_id);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_bani_lines_search ON bani_lines 
  USING gin(to_tsvector('english', punjabi || ' ' || english));
  
CREATE INDEX IF NOT EXISTS idx_prayer_lines_search ON prayer_lines 
  USING gin(to_tsvector('english', punjabi || ' ' || english));

-- Enable Row Level Security (RLS)
ALTER TABLE holy_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE bani_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_lines ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Allow public read access on holy_books" ON holy_books FOR SELECT USING (true);
CREATE POLICY "Allow public read access on bani_lines" ON bani_lines FOR SELECT USING (true);
CREATE POLICY "Allow public read access on prayers" ON prayers FOR SELECT USING (true);
CREATE POLICY "Allow public read access on prayer_lines" ON prayer_lines FOR SELECT USING (true);

-- Public write access policies (for migrations and data seeding)
-- Note: In production, you may want to restrict these to authenticated users or service role
CREATE POLICY "Allow public insert on holy_books" ON holy_books FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on holy_books" ON holy_books FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on holy_books" ON holy_books FOR DELETE USING (true);

CREATE POLICY "Allow public insert on bani_lines" ON bani_lines FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on bani_lines" ON bani_lines FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on bani_lines" ON bani_lines FOR DELETE USING (true);

CREATE POLICY "Allow public insert on prayers" ON prayers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on prayers" ON prayers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on prayers" ON prayers FOR DELETE USING (true);

CREATE POLICY "Allow public insert on prayer_lines" ON prayer_lines FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on prayer_lines" ON prayer_lines FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on prayer_lines" ON prayer_lines FOR DELETE USING (true);

