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
-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Allow public read access on holy_books" ON holy_books;
DROP POLICY IF EXISTS "Allow public read access on bani_lines" ON bani_lines;
DROP POLICY IF EXISTS "Allow public read access on prayers" ON prayers;
DROP POLICY IF EXISTS "Allow public read access on prayer_lines" ON prayer_lines;

CREATE POLICY "Allow public read access on holy_books" ON holy_books FOR SELECT USING (true);
CREATE POLICY "Allow public read access on bani_lines" ON bani_lines FOR SELECT USING (true);
CREATE POLICY "Allow public read access on prayers" ON prayers FOR SELECT USING (true);
CREATE POLICY "Allow public read access on prayer_lines" ON prayer_lines FOR SELECT USING (true);

-- Public write access policies (for migrations and data seeding)
-- Note: In production, you may want to restrict these to authenticated users or service role
-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Allow public insert on holy_books" ON holy_books;
DROP POLICY IF EXISTS "Allow public update on holy_books" ON holy_books;
DROP POLICY IF EXISTS "Allow public delete on holy_books" ON holy_books;

DROP POLICY IF EXISTS "Allow public insert on bani_lines" ON bani_lines;
DROP POLICY IF EXISTS "Allow public update on bani_lines" ON bani_lines;
DROP POLICY IF EXISTS "Allow public delete on bani_lines" ON bani_lines;

DROP POLICY IF EXISTS "Allow public insert on prayers" ON prayers;
DROP POLICY IF EXISTS "Allow public update on prayers" ON prayers;
DROP POLICY IF EXISTS "Allow public delete on prayers" ON prayers;

DROP POLICY IF EXISTS "Allow public insert on prayer_lines" ON prayer_lines;
DROP POLICY IF EXISTS "Allow public update on prayer_lines" ON prayer_lines;
DROP POLICY IF EXISTS "Allow public delete on prayer_lines" ON prayer_lines;

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

-- ============== LEARNING JOURNEY / LESSONS ==============

-- Table: lessons
-- Stores structured lessons for learning journey (similar to Duolingo)
CREATE TABLE IF NOT EXISTS lessons (
  id VARCHAR(100) PRIMARY KEY,
  holy_book_id VARCHAR(100) NOT NULL REFERENCES holy_books(id) ON DELETE CASCADE,
  section VARCHAR(255) NOT NULL, -- e.g., "Japji Sahib", "Rehras Sahib"
  lesson_type VARCHAR(50), -- e.g., "precision", "meaning", "practice"
  difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  estimated_time_min INTEGER DEFAULT 5,
  learning_objective TEXT,
  title VARCHAR(255),
  title_punjabi VARCHAR(255),
  description TEXT,
  order_index INTEGER NOT NULL, -- Order within section
  unlock_after_lesson_id VARCHAR(100) REFERENCES lessons(id) ON DELETE SET NULL, -- Dependency
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: lesson_blocks
-- Stores individual blocks/pages within a lesson (JSONB for flexibility)
CREATE TABLE IF NOT EXISTS lesson_blocks (
  id BIGSERIAL PRIMARY KEY,
  lesson_id VARCHAR(100) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  block_order INTEGER NOT NULL, -- Order within lesson
  block_type VARCHAR(50) NOT NULL, -- e.g., "scripture", "explanation", "question", etc.
  block_data JSONB NOT NULL, -- Flexible JSON structure for different block types
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(lesson_id, block_order)
);

-- Table: lesson_progress (for user progress tracking)
-- Note: This will be used when user authentication is implemented
CREATE TABLE IF NOT EXISTS lesson_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID, -- Will reference auth.users when auth is set up
  lesson_id VARCHAR(100) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score DECIMAL(5,2), -- Percentage score (0-100)
  current_block_order INTEGER DEFAULT 0, -- Last completed block
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Indexes for lessons
CREATE INDEX IF NOT EXISTS idx_lessons_holy_book ON lessons(holy_book_id);
CREATE INDEX IF NOT EXISTS idx_lessons_section ON lessons(section);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(section, order_index);
CREATE INDEX IF NOT EXISTS idx_lesson_blocks_lesson ON lesson_blocks(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_blocks_order ON lesson_blocks(lesson_id, block_order);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);

-- Full-text search for lessons
CREATE INDEX IF NOT EXISTS idx_lessons_search ON lessons 
  USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || learning_objective));

-- Enable RLS for lessons tables
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Public read access policies
-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Allow public read access on lessons" ON lessons;
DROP POLICY IF EXISTS "Allow public read access on lesson_blocks" ON lesson_blocks;
DROP POLICY IF EXISTS "Allow public read access on lesson_progress" ON lesson_progress;

CREATE POLICY "Allow public read access on lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "Allow public read access on lesson_blocks" ON lesson_blocks FOR SELECT USING (true);
CREATE POLICY "Allow public read access on lesson_progress" ON lesson_progress FOR SELECT USING (true);

-- Public write access policies (for migrations and data seeding)
-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Allow public insert on lessons" ON lessons;
DROP POLICY IF EXISTS "Allow public update on lessons" ON lessons;
DROP POLICY IF EXISTS "Allow public delete on lessons" ON lessons;

DROP POLICY IF EXISTS "Allow public insert on lesson_blocks" ON lesson_blocks;
DROP POLICY IF EXISTS "Allow public update on lesson_blocks" ON lesson_blocks;
DROP POLICY IF EXISTS "Allow public delete on lesson_blocks" ON lesson_blocks;

DROP POLICY IF EXISTS "Allow public insert on lesson_progress" ON lesson_progress;
DROP POLICY IF EXISTS "Allow public update on lesson_progress" ON lesson_progress;
DROP POLICY IF EXISTS "Allow public delete on lesson_progress" ON lesson_progress;

CREATE POLICY "Allow public insert on lessons" ON lessons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on lessons" ON lessons FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on lessons" ON lessons FOR DELETE USING (true);

CREATE POLICY "Allow public insert on lesson_blocks" ON lesson_blocks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on lesson_blocks" ON lesson_blocks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on lesson_blocks" ON lesson_blocks FOR DELETE USING (true);

CREATE POLICY "Allow public insert on lesson_progress" ON lesson_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on lesson_progress" ON lesson_progress FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on lesson_progress" ON lesson_progress FOR DELETE USING (true);

