# Pauri-Based Lesson Creation Strategy

## Understanding the Structure

Guru Granth Sahib Ji is organized as:
- **31 Raags** (musical sections)
- **Shabads** (hymns) within raags
- **Pauris** (stanzas) within shabads/vaars

### Examples:

1. **Japji Sahib** (Ang 1-8): 
   - 38 pauris over 8 pages
   - Average: ~4.75 pauris per ang
   - **Result**: 38 lessons (1 pauri per lesson)

2. **Sukhmani Sahib** (Ang 262-296):
   - 24 Ashtpadis × 8 pauris each = **192 pauris**
   - **Result**: 192 lessons (1 pauri per lesson)

3. **Asa di Vaar** (Ang 462-475):
   - 24 pauris
   - **Result**: 24 lessons (1 pauri per lesson)

4. **Normal sections**:
   - Average ~4-5 pauris per page
   - With 2-3 pauris per lesson = **10-20 lessons per page**

## Scale Calculation

- **1400 pages** × **10-20 lessons/page** = **14,000-28,000 lessons**
- This is the correct scale, not 500 lessons!

## Migration Strategy

### Script: `migrate-ggs-lessons-by-pauri.ts`

This script:
1. **Identifies pauris** from text patterns (॥ markers, line breaks, section changes)
2. **Groups pauris** into lessons:
   - **Important sections**: 1 pauri per lesson (Mool Mantar, Japji, Sukhmani, etc.)
   - **Normal sections**: 2-3 pauris per lesson
3. **Creates varied lesson types** (precision, meaning, practice, reflection, context)
4. **Generates appropriate blocks** for each lesson

### Pauri Identification

The script identifies pauris by:
1. **Text markers**: Lines ending with "॥" (double vertical bars in Gurmukhi)
2. **Section breaks**: Changes in raag or author
3. **Line gaps**: Large gaps in line_order suggest new sections
4. **Fallback**: If no markers found, groups lines into logical pauris (8-12 lines each)

### Lesson Grouping

```typescript
// Important sections (high/medium importance)
Mool Mantar: 1 pauri → 1 lesson
Japji Sahib: 38 pauris → 38 lessons (1 pauri each)
Sukhmani Sahib: 192 pauris → 192 lessons (1 pauri each)
Asa di Vaar: 24 pauris → 24 lessons (1 pauri each)

// Normal sections
Average page: 4-5 pauris → 2-3 lessons (2-3 pauris each)
Result: 10-20 lessons per page
```

## Usage

```bash
npm run migrate:ggs-lessons-by-pauri
```

### Process

1. **Pauri Identification**: Scans all 1400 pages to identify pauris
2. **Grouping**: Groups pauris into lessons (1-3 pauris per lesson)
3. **Lesson Creation**: Creates lessons with varied types and blocks
4. **Progress Tracking**: Shows progress every 100 lessons

### Time Estimate

- **Pauri identification**: 10-20 minutes (scans all pages)
- **Lesson creation**: 2-4 hours (for 20,000+ lessons)
- **Total**: ~3-5 hours for full migration

## Important Sections

The script automatically handles:

| Section | Pages | Pauris | Lessons | Strategy |
|---------|-------|--------|---------|----------|
| Mool Mantar | 1 | 1 | 1 | 1 pauri/lesson |
| Japji Sahib | 1-8 | 38 | 38 | 1 pauri/lesson |
| Sukhmani Sahib | 262-296 | 192 | 192 | 1 pauri/lesson |
| Asa di Vaar | 462-475 | 24 | 24 | 1 pauri/lesson |
| Rehras Sahib | 8-10 | ~6 | 6 | 1 pauri/lesson |
| Kirtan Sohila | 12-13 | ~4 | 4 | 1 pauri/lesson |
| Normal sections | Rest | ~4-5/page | 10-20/page | 2-3 pauris/lesson |

## Customization

### Adjust Pauris Per Lesson

Edit `groupPaurisIntoLessons()`:

```typescript
// More pauris per lesson (fewer total lessons)
if (currentPauri.importance === 'normal') {
  paurisPerLesson = 3 + Math.floor(Math.random() * 2); // 3-4 pauris
}

// Fewer pauris per lesson (more total lessons, more focus)
if (currentPauri.importance === 'normal') {
  paurisPerLesson = 1; // 1 pauri per lesson (like important sections)
}
```

### Add Important Sections

Edit `IMPORTANT_SECTIONS`:

```typescript
const IMPORTANT_SECTIONS = {
  // ... existing
  'Sidh Gosht': {
    pages: [938, 939, 940, ...],
    pauriCount: 30,
    importance: 'high',
    paurisPerLesson: 1,
  },
};
```

### Improve Pauri Identification

If pauris aren't being identified correctly, you can:

1. **Add database field**: Add a `pauri_number` field to `bani_lines` table
2. **Use external data**: Import pauri markers from a structured source
3. **Manual mapping**: Create a mapping file for known sections

## Verification

After migration, verify:

```sql
-- Count total lessons
SELECT COUNT(*) FROM lessons 
WHERE holy_book_id = 'guru-granth-sahib';

-- Expected: 14,000-28,000 lessons

-- Check lessons per page (sample)
SELECT 
  SUBSTRING(id FROM 'p(\d+)')::INTEGER as page,
  COUNT(*) as lessons_per_page
FROM lessons 
WHERE holy_book_id = 'guru-granth-sahib'
GROUP BY page
ORDER BY page
LIMIT 20;

-- Should show 10-20 lessons per page for normal sections

-- Check important sections
SELECT section, COUNT(*) as lessons
FROM lessons 
WHERE holy_book_id = 'guru-granth-sahib'
  AND section IN ('Japji Sahib', 'Sukhmani Sahib', 'Asa di Vaar')
GROUP BY section;

-- Should match expected pauri counts
```

## Performance Considerations

### Batch Processing

For such a large dataset, consider:

1. **Process in batches**: Process 100 pages at a time
2. **Resume capability**: Save progress and resume from last position
3. **Error handling**: Retry failed lessons
4. **Database optimization**: Ensure indexes are in place

### Database Indexes

Ensure these indexes exist:

```sql
CREATE INDEX IF NOT EXISTS idx_bani_lines_page ON bani_lines(page_number);
CREATE INDEX IF NOT EXISTS idx_bani_lines_ang ON bani_lines(ang);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(order_index);
```

## Next Steps

1. **Test with small subset**: Modify script to process first 10 pages
2. **Verify pauri identification**: Check if pauris are correctly identified
3. **Run full migration**: Process all 1400 pages
4. **Review sample lessons**: Check lessons in app
5. **Iterate**: Adjust pauri identification or grouping as needed

## Troubleshooting

### Issue: "Pauris not identified correctly"

**Solutions**:
- Check if text contains "॥" markers
- Adjust `identifyPauris()` function
- Consider adding `pauri_number` field to database
- Use external pauri mapping data

### Issue: "Too many/few lessons per page"

**Solutions**:
- Adjust `paurisPerLesson` in `groupPaurisIntoLessons()`
- Check pauri identification accuracy
- Verify page content exists in database

### Issue: "Migration too slow"

**Solutions**:
- Process in smaller batches
- Add database indexes
- Optimize queries
- Use connection pooling

## Expected Results

- **14,000-28,000 total lessons**
- **10-20 lessons per page** (normal sections)
- **1 lesson per pauri** (important sections)
- **Varied lesson types** throughout
- **Progressive difficulty** by page number
- **Complete unlock chain** from first to last lesson
