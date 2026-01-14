-- Fix RLS Policies to Allow Inserts
-- Run this in Supabase SQL Editor if you already created tables

-- Drop existing policies if they exist
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

-- Create new write policies
-- holy_books
CREATE POLICY "Allow public insert on holy_books" ON holy_books FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on holy_books" ON holy_books FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on holy_books" ON holy_books FOR DELETE USING (true);

-- bani_lines
CREATE POLICY "Allow public insert on bani_lines" ON bani_lines FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on bani_lines" ON bani_lines FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on bani_lines" ON bani_lines FOR DELETE USING (true);

-- prayers
CREATE POLICY "Allow public insert on prayers" ON prayers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on prayers" ON prayers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on prayers" ON prayers FOR DELETE USING (true);

-- prayer_lines
CREATE POLICY "Allow public insert on prayer_lines" ON prayer_lines FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on prayer_lines" ON prayer_lines FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on prayer_lines" ON prayer_lines FOR DELETE USING (true);

