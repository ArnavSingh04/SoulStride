-- Add source and tags columns to lessons table (for lessons.json migration)
-- Run this if you already have the lessons table and need to add the new columns.
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS source JSONB;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS tags JSONB;
