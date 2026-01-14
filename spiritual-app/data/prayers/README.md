# Prayers Data Structure

This directory contains prayers organized by holy book for better separation and management.

## Directory Structure

```
data/prayers/
├── index.ts                  # Main entry point, exports all prayer collections
├── guru-granth-sahib.ts      # Prayers from Guru Granth Sahib
├── dasham-granth.ts          # Prayers from Dasham Granth
└── [future-holy-book].ts     # Add more holy books as needed
```

## Design Principles

### Separation by Holy Book
Each holy book's prayers are stored in a separate file, making it easy to:
- Manage prayers from different sources independently
- Add new holy books without affecting existing data
- Filter and query prayers by their source
- Maintain data integrity and organization

### Required `holy_book_id`
Every prayer **must** have a `holy_book_id` field that links it to its source holy book. This ensures:
- Clear attribution of each prayer
- Proper database relationships with foreign key constraints
- Easy filtering and categorization
- Better data integrity

## Data Types

### HolyBookPrayerCollection
```typescript
interface HolyBookPrayerCollection {
  holy_book_id: string;           // Unique identifier for the holy book
  holy_book_name: string;         // Name in English
  holy_book_name_punjabi: string; // Name in Punjabi
  holy_book_name_hindi?: string;  // Name in Hindi (optional)
  prayers: Prayer[];              // Array of prayers from this holy book
}
```

### Prayer
```typescript
interface Prayer {
  id: string;                     // Unique prayer identifier
  holy_book_id: string;           // REQUIRED: Links to holy book
  name: string;                   // Prayer name in English
  name_punjabi: string;           // Prayer name in Punjabi
  name_hindi?: string;            // Prayer name in Hindi
  description: string;            // Description of the prayer
  type?: string;                  // e.g., "morning", "evening", "bedtime"
  time_of_day?: string;           // When to recite
  lines: PrayerLine[];            // Prayer content
}
```

### PrayerLine
```typescript
interface PrayerLine {
  punjabi: string;                    // Original Punjabi text
  english: string;                    // English translation
  hindi?: string;                     // Hindi translation (optional)
  transliteration_english?: string;   // Roman transliteration
  transliteration_hindi?: string;     // Hindi transliteration (optional)
}
```

## Adding a New Holy Book

1. Create a new file: `data/prayers/[holy-book-name].ts`
2. Define the collection following the structure:

```typescript
import type { HolyBookPrayerCollection } from './index';

export const myHolyBookPrayers: HolyBookPrayerCollection = {
  holy_book_id: 'my-holy-book',
  holy_book_name: 'My Holy Book',
  holy_book_name_punjabi: 'ਮੇਰੀ ਪਵਿੱਤਰ ਪੁਸਤਕ',
  holy_book_name_hindi: 'मेरी पवित्र पुस्तक',
  prayers: [
    {
      id: 'unique-prayer-id',
      holy_book_id: 'my-holy-book',
      name: 'Prayer Name',
      name_punjabi: 'ਪ੍ਰਾਰਥਨਾ ਨਾਮ',
      description: 'Prayer description',
      lines: [
        {
          punjabi: 'ਪੰਜਾਬੀ ਟੈਕਸਟ',
          english: 'English translation'
        }
      ]
    }
  ]
};
```

3. Import and add to `index.ts`:

```typescript
import { myHolyBookPrayers } from './my-holy-book';

export const prayerCollections: HolyBookPrayerCollection[] = [
  guruGranthSahibPrayers,
  dashamGranthPrayers,
  myHolyBookPrayers, // Add here
];
```

4. Run the migration script to update the database:
```bash
npm run migrate:prayers
```

## Usage Examples

### Get all prayers
```typescript
import { getAllPrayers } from './data/prayers';

const allPrayers = getAllPrayers();
```

### Get prayers from a specific holy book
```typescript
import { getPrayersByHolyBook } from './data/prayers';

const ggsPrayers = getPrayersByHolyBook('guru-granth-sahib');
const dgPrayers = getPrayersByHolyBook('dasham-granth');
```

### Search prayers (optionally filter by holy book)
```typescript
import { searchPrayers } from './data/prayers';

// Search all prayers
const results = searchPrayers('peace');

// Search only in Guru Granth Sahib
const ggsResults = searchPrayers('peace', 'guru-granth-sahib');
```

### Get holy books summary
```typescript
import { getHolyBooksSummary } from './data/prayers';

const summary = getHolyBooksSummary();
// Returns: [{ id, name, name_punjabi, prayer_count }, ...]
```

## Database Schema

The prayers are stored in Supabase with the following relationships:

```
holy_books
  ├── id (PRIMARY KEY)
  ├── name
  ├── name_punjabi
  └── name_hindi

prayers
  ├── id (PRIMARY KEY)
  ├── holy_book_id (FOREIGN KEY → holy_books.id, NOT NULL, CASCADE)
  ├── name
  ├── name_punjabi
  ├── name_hindi
  ├── description
  ├── type
  └── time_of_day

prayer_lines
  ├── id (PRIMARY KEY)
  ├── prayer_id (FOREIGN KEY → prayers.id, CASCADE)
  ├── line_order
  ├── punjabi
  ├── english
  ├── hindi
  ├── transliteration_english
  └── transliteration_hindi
```

## Migration

To migrate the new prayer structure to Supabase:

```bash
# Migrate all data (holy books + prayers + Guru Granth Sahib pages)
npm run migrate:all

# Or migrate just prayers
npm run migrate:prayers
```

## Benefits of This Structure

1. **Separation of Concerns**: Each holy book's prayers are independent
2. **Scalability**: Easy to add new holy books without refactoring
3. **Data Integrity**: Required `holy_book_id` ensures proper relationships
4. **Maintainability**: Clear organization makes updates easier
5. **Query Efficiency**: Can filter prayers by source at the database level
6. **Type Safety**: Full TypeScript support with proper interfaces

## Migration from Old Structure

The old `data/prayers.ts` file has been deprecated. It has been split into:
- `data/prayers/guru-granth-sahib.ts` - All original prayers (they're all from Guru Granth Sahib)
- `data/prayers/index.ts` - New unified interface

All prayers now include a `holy_book_id` field for proper categorization.

