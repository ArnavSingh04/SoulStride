# Database Setup Guide

## Setting Up Supabase Database

### Step 1: Create Tables in Supabase

1. Go to your Supabase project: https://xehvbppisebbzwolyfxj.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Copy the contents of `lib/supabase-schema.sql`
4. Paste it into the SQL Editor and click **Run**

This will create all necessary tables:
- `holy_books` - Stores information about holy books
- `bani_lines` - Stores lines from Guru Granth Sahib
- `prayers` - Stores prayer metadata
- `prayer_lines` - Stores prayer lines with translations

### Step 2: Run Data Migration

After setting up the tables, run the migration scripts to populate the database:

```bash
# Migrate all data at once
npm run migrate:all

# Or migrate separately:
npm run migrate:prayers    # Migrate prayers (faster)
npm run migrate:ggs        # Migrate Guru Granth Sahib (takes longer - 393k+ lines)
```

### Database Schema Overview

#### Holy Books
- Stores metadata about different holy scriptures
- Currently includes Guru Granth Sahib Ji

#### Bani Lines
- Each line from holy books with:
  - Punjabi text
  - English translation
  - English transliteration
  - Page number (Ang)
  - Author and Raag information

#### Prayers
- Daily prayers (Banis) like:
  - Japji Sahib
  - Rehraas Sahib
  - Kirtan Sohila
  - And more...

#### Prayer Lines
- Individual lines of each prayer with:
  - Punjabi text
  - English translation
  - Transliterations

### Features

✅ Full-text search across all content
✅ Multilingual support (Punjabi, English, Hindi)
✅ Page-by-page navigation
✅ Fast query performance with indexes
✅ Row Level Security enabled for public read access

### Notes

- The Guru Granth Sahib migration may take 10-20 minutes due to the large dataset (393k+ lines)
- All data is stored in Supabase PostgreSQL with proper indexing
- The old local data files are kept for reference but are no longer used by the app

