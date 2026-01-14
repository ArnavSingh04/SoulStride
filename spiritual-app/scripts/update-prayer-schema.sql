-- Migration Script: Update Prayers Schema to Require Holy Book ID
-- This script updates the prayers table to make holy_book_id required

-- Step 1: First, ensure all existing prayers have a holy_book_id
-- (In case there are any NULL values, set them to a default)
UPDATE prayers 
SET holy_book_id = 'guru-granth-sahib' 
WHERE holy_book_id IS NULL;

-- Step 2: Drop the old foreign key constraint if it exists
ALTER TABLE prayers 
DROP CONSTRAINT IF EXISTS prayers_holy_book_id_fkey;

-- Step 3: Alter the column to make it NOT NULL
ALTER TABLE prayers 
ALTER COLUMN holy_book_id SET NOT NULL;

-- Step 4: Re-add the foreign key constraint with CASCADE delete
ALTER TABLE prayers
ADD CONSTRAINT prayers_holy_book_id_fkey 
FOREIGN KEY (holy_book_id) 
REFERENCES holy_books(id) 
ON DELETE CASCADE;

-- Step 5: Add an index for better query performance when filtering by holy book
CREATE INDEX IF NOT EXISTS idx_prayers_holy_book ON prayers(holy_book_id);

COMMENT ON COLUMN prayers.holy_book_id IS 'Required foreign key linking prayer to its source holy book';

