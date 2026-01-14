# Prayer Schema Migration Guide

## Overview

The prayer storage system has been redesigned to properly separate prayers from different holy books. This migration ensures better organization, data integrity, and scalability.

## What Changed?

### Before (Old Structure)
```
data/prayers.ts
  - All prayers mixed together
  - No holy book association
  - Single flat file with all prayer data
```

### After (New Structure)
```
data/prayers/
  ├── index.ts                 # Main exports & utilities
  ├── guru-granth-sahib.ts     # Prayers from Guru Granth Sahib
  ├── dasham-granth.ts         # Prayers from Dasham Granth
  └── README.md                # Documentation
```

## Key Improvements

### 1. Separation by Holy Book
Each holy book's prayers are now stored in separate files, making it easy to:
- Manage prayers independently
- Add new holy books without touching existing data
- Filter and query by source
- Maintain clear attribution

### 2. Required `holy_book_id` Field
Every prayer now **must** have a `holy_book_id` that links it to its source:
```typescript
interface Prayer {
  id: string;
  holy_book_id: string;  // ← Now REQUIRED
  name: string;
  name_punjabi: string;
  // ... other fields
}
```

### 3. Database Schema Updates
- `prayers.holy_book_id` is now `NOT NULL`
- Foreign key constraint: `ON DELETE CASCADE` (instead of `SET NULL`)
- New index on `holy_book_id` for better query performance

### 4. Enhanced API Functions
New database service functions support filtering by holy book:
```typescript
// Get all prayers (optionally filter by holy book)
getAllPrayers(holyBookId?: string)

// Get prayers from specific holy book
getPrayersByHolyBook(holyBookId: string)

// Search prayers (optionally within a holy book)
searchPrayers(query: string, holyBookId?: string)

// Get summary of prayers grouped by holy book
getPrayersSummaryByHolyBook()
```

## Migration Steps

### Step 1: Update Database Schema (Optional but Recommended)

If you have existing data in Supabase, run the schema update:

```bash
# Apply the schema migration SQL
# This will update existing prayers to require holy_book_id
```

Use the SQL script: `scripts/update-prayer-schema.sql`

Or manually in Supabase SQL Editor:
```sql
-- Set default holy_book_id for existing prayers
UPDATE prayers 
SET holy_book_id = 'guru-granth-sahib' 
WHERE holy_book_id IS NULL;

-- Make holy_book_id required
ALTER TABLE prayers ALTER COLUMN holy_book_id SET NOT NULL;

-- Update foreign key constraint
ALTER TABLE prayers DROP CONSTRAINT IF EXISTS prayers_holy_book_id_fkey;
ALTER TABLE prayers ADD CONSTRAINT prayers_holy_book_id_fkey 
  FOREIGN KEY (holy_book_id) REFERENCES holy_books(id) ON DELETE CASCADE;
```

### Step 2: Re-run Data Migration

Migrate the new organized prayer data to Supabase:

```bash
# Migrate all data
npm run migrate:all

# Or just prayers
npm run migrate:prayers
```

The migration script will:
1. Insert/update holy book records
2. Insert/update prayers with `holy_book_id`
3. Insert/update prayer lines

### Step 3: Update Your Code

#### Old Code (Still Works - Backwards Compatible)
```typescript
import { getAllPrayers, prayersData } from './data/prayers';

const prayers = getAllPrayers(); // Works but deprecated
```

#### New Code (Recommended)
```typescript
import { 
  getAllPrayers, 
  getPrayersByHolyBook,
  searchPrayers,
  getHolyBooksSummary 
} from './data/prayers';

// Get all prayers
const allPrayers = getAllPrayers();

// Get prayers from specific holy book
const ggsPrayers = getPrayersByHolyBook('guru-granth-sahib');
const dgPrayers = getPrayersByHolyBook('dasham-granth');

// Search within a specific holy book
const results = searchPrayers('peace', 'guru-granth-sahib');

// Get summary of all holy books with prayer counts
const summary = getHolyBooksSummary();
```

#### Database Service Updates
```typescript
import { 
  getAllPrayers, 
  getPrayersByHolyBook,
  searchPrayers,
  getPrayersSummaryByHolyBook
} from './lib/database.service';

// All functions now support optional holy book filtering
const prayers = await getAllPrayers('guru-granth-sahib');
const searchResults = await searchPrayers('peace', 'dasham-granth');
const summary = await getPrayersSummaryByHolyBook();
```

## Adding a New Holy Book

To add prayers from a new holy book:

### 1. Create the Data File

Create `data/prayers/[holy-book-name].ts`:

```typescript
import type { HolyBookPrayerCollection } from './index';

export const myHolyBookPrayers: HolyBookPrayerCollection = {
  holy_book_id: 'my-holy-book',
  holy_book_name: 'My Holy Book',
  holy_book_name_punjabi: 'ਪਵਿੱਤਰ ਗ੍ਰੰਥ',
  holy_book_name_hindi: 'पवित्र ग्रंथ',
  prayers: [
    {
      id: 'prayer-1',
      holy_book_id: 'my-holy-book',
      name: 'Prayer Name',
      name_punjabi: 'ਪ੍ਰਾਰਥਨਾ',
      description: 'Description',
      lines: [
        {
          punjabi: 'ਪੰਜਾਬੀ',
          english: 'English translation',
          transliteration_english: 'Transliteration'
        }
      ]
    }
  ]
};
```

### 2. Add to Index

Update `data/prayers/index.ts`:

```typescript
import { myHolyBookPrayers } from './my-holy-book';

export const prayerCollections: HolyBookPrayerCollection[] = [
  guruGranthSahibPrayers,
  dashamGranthPrayers,
  myHolyBookPrayers,  // Add here
];
```

### 3. Run Migration

```bash
npm run migrate:prayers
```

## File Changes Summary

### Modified Files
- ✏️ `lib/supabase-schema.sql` - Updated schema to require `holy_book_id`
- ✏️ `lib/database.types.ts` - Updated Prayer interface
- ✏️ `lib/database.service.ts` - Added holy book filtering support
- ✏️ `scripts/migrate-prayers.ts` - Updated to migrate organized structure
- ✏️ `scripts/migrate-all.ts` - Updated labels
- ✏️ `data/prayers.ts` - Deprecated, now proxies to new structure

### New Files
- ✨ `data/prayers/index.ts` - Main entry point with utilities
- ✨ `data/prayers/guru-granth-sahib.ts` - GGS prayers
- ✨ `data/prayers/dasham-granth.ts` - Dasham Granth prayers
- ✨ `data/prayers/README.md` - Detailed documentation
- ✨ `scripts/update-prayer-schema.sql` - Schema migration SQL
- ✨ `PRAYER_SCHEMA_MIGRATION.md` - This guide

## Benefits

### 1. **Better Organization**
- Prayers grouped by holy book
- Easy to locate and manage
- Clear source attribution

### 2. **Data Integrity**
- Required `holy_book_id` prevents orphaned prayers
- CASCADE delete maintains referential integrity
- Type-safe with TypeScript interfaces

### 3. **Scalability**
- Add new holy books without refactoring
- Independent management of each collection
- No conflicts between sources

### 4. **Enhanced Querying**
- Filter prayers by holy book at database level
- More efficient searches
- Better user experience (can browse by source)

### 5. **Backwards Compatibility**
- Old `data/prayers.ts` still works
- Gradual migration path
- No breaking changes

## Testing

After migration, verify:

1. **Data Migration**
```bash
npm run migrate:prayers
# Check console output for success messages
```

2. **Query Prayers**
```typescript
// Test getting all prayers
const all = await getAllPrayers();
console.log(`Total prayers: ${all.length}`);

// Test filtering by holy book
const ggs = await getPrayersByHolyBook('guru-granth-sahib');
console.log(`GGS prayers: ${ggs.length}`);

// Test search
const results = await searchPrayers('peace');
console.log(`Search results: ${results.length}`);
```

3. **Check Database**
```sql
-- Verify holy_book_id is set for all prayers
SELECT COUNT(*) FROM prayers WHERE holy_book_id IS NULL;
-- Should return 0

-- Check distribution by holy book
SELECT holy_book_id, COUNT(*) as prayer_count
FROM prayers
GROUP BY holy_book_id;
```

## Troubleshooting

### Issue: Migration fails with "holy_book_id cannot be null"
**Solution**: Run the schema update SQL first to set default values:
```sql
UPDATE prayers SET holy_book_id = 'guru-granth-sahib' WHERE holy_book_id IS NULL;
```

### Issue: Old code not finding prayers
**Solution**: The old interface is maintained for compatibility. Make sure you're importing from the correct path:
```typescript
// This should still work
import { getAllPrayers } from './data/prayers';
```

### Issue: TypeScript errors about missing holy_book_id
**Solution**: Update your Prayer interface usage. The `holy_book_id` field is now required.

## Questions?

For more details, see:
- `data/prayers/README.md` - Detailed API documentation
- `lib/supabase-schema.sql` - Database schema
- `scripts/migrate-prayers.ts` - Migration implementation

## Summary

The new prayer storage system provides:
- ✅ Clear separation of prayers by holy book
- ✅ Required `holy_book_id` for data integrity
- ✅ Enhanced filtering and search capabilities
- ✅ Scalable structure for adding new holy books
- ✅ Backwards compatibility with existing code
- ✅ Better maintainability and organization

You can now easily manage prayers from multiple holy books while keeping them properly separated and attributed!

