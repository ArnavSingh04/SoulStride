# Guru Granth Sahib Lessons Migration Guide

## Overview

This guide explains how to convert all 1400 pages of Guru Granth Sahib Ji into structured, interactive lessons.

## Strategy

### 1. **Page Grouping**
- **Normal sections**: 3-5 pages per lesson (randomized for variety)
- **Medium importance**: 2-3 pages per lesson (e.g., Rehras Sahib, Kirtan Sohila)
- **High importance**: 1-2 pages per lesson (e.g., Mool Mantar, Japji Sahib)

### 2. **Lesson Types** (Rotated for Variety)
- **Precision**: Focus on exact meaning and interpretation
- **Meaning**: Deep dive into concepts and philosophy
- **Practice**: Interactive exercises and quizzes
- **Reflection**: Guided personal reflection
- **Context**: Historical and cultural context

### 3. **Block Structure Patterns**

Each lesson type has a different block pattern:

#### Precision Lessons
1. Objective
2. Scripture (multiple lines)
3. Explanation
4. MCQ Question
5. Reflection
6. Summary

#### Meaning Lessons
1. Objective
2. Scripture
3. Definition
4. Explanation
5. Analogy
6. Reflection
7. Summary

#### Practice Lessons
1. Objective
2. Scripture
3. Explanation
4. MCQ Question
5. Matching Exercise
6. Reflection
7. Summary

#### Reflection Lessons
1. Objective
2. Scripture
3. Context
4. Guided Reflection (multi-step)
5. Summary

#### Context Lessons
1. Objective
2. Scripture
3. Context
4. Explanation
5. Reflection
6. Summary

### 4. **Important Sections**

Special handling for:
- **Mool Mantar** (Page 1): High importance, precision lesson
- **Japji Sahib** (Pages 1-8): High importance, varied lesson types
- **Rehras Sahib** (Pages 8-10): Medium importance
- **Kirtan Sohila** (Pages 12-13): Medium importance

## Usage

### Running the Migration

```bash
npm run migrate:ggs-lessons
```

This will:
1. Read all pages from the `bani_lines` table
2. Group pages into lessons (2-5 pages each)
3. Create varied lesson types and block structures
4. Set up lesson dependencies (unlock chain)
5. Insert lessons and blocks into the database

### Migration Process

1. **Check existing lessons**: Skips lessons that already exist
2. **Fetch content**: Retrieves lines for each page range
3. **Generate lesson structure**: Creates lesson metadata and blocks
4. **Insert data**: Adds lessons and blocks to database
5. **Progress tracking**: Shows progress every 50 lessons

### Expected Output

- **~300-500 lessons** (depending on page grouping)
- **Varied lesson types** for engagement
- **Progressive difficulty** (increases with page number)
- **Unlock chain** (each lesson unlocks the next)

## Customization

### Adjusting Page Grouping

Edit `groupPagesIntoLessons()` function:
```typescript
// Change default pages per lesson
pagesPerLesson = 4; // Instead of 3

// Adjust important section grouping
pagesPerLesson = importance === 'high' ? 2 : 3; // More pages for high importance
```

### Adding Important Sections

Add to `IMPORTANT_SECTIONS`:
```typescript
const IMPORTANT_SECTIONS: Record<number, ...> = {
  // ... existing sections
  5: { name: 'Sukhmani Sahib', pages: [262, 263, ...], importance: 'medium' },
};
```

### Customizing Block Patterns

Modify `BLOCK_PATTERNS`:
```typescript
const BLOCK_PATTERNS: Record<LessonType, string[]> = {
  precision: ['objective', 'scripture', 'explanation', 'question', 'reflection'],
  // Add more block types
  practice: ['objective', 'scripture', 'explanation', 'question', 'match', 'cloze', 'reflection'],
};
```

### Enhancing Block Content

Edit `createLessonBlocks()` to:
- Add more scripture lines per lesson
- Create more varied questions
- Add audio recitation blocks
- Include scenario-based exercises
- Add guided reflections

## Best Practices

### 1. **Start Small**
Test with a small page range first:
```typescript
const totalPages = 10; // Test with first 10 pages
```

### 2. **Monitor Progress**
The script shows progress every 50 lessons. For 1400 pages, expect:
- Initial run: ~30-60 minutes (depending on database speed)
- Subsequent runs: Faster (skips existing lessons)

### 3. **Verify Data**
After migration, verify:
```sql
-- Check lesson count
SELECT COUNT(*) FROM lessons WHERE holy_book_id = 'guru-granth-sahib';

-- Check block distribution
SELECT lesson_type, COUNT(*) 
FROM lessons 
WHERE holy_book_id = 'guru-granth-sahib'
GROUP BY lesson_type;

-- Check lesson chain
SELECT id, title, unlock_after_lesson_id 
FROM lessons 
WHERE holy_book_id = 'guru-granth-sahib'
ORDER BY order_index
LIMIT 10;
```

### 4. **Iterative Improvement**
- Run migration
- Review lessons in app
- Adjust block patterns
- Re-run for specific sections

## Troubleshooting

### Issue: "No content found for pages X-Y"
- **Cause**: Pages don't exist in `bani_lines` table
- **Solution**: Ensure GGS data is migrated first (`npm run migrate:ggs`)

### Issue: "Error creating lesson"
- **Cause**: Database constraint violation or connection issue
- **Solution**: Check database connection and schema

### Issue: "Too many lessons created"
- **Cause**: Page grouping too small
- **Solution**: Increase `pagesPerLesson` in `groupPagesIntoLessons()`

### Issue: "Lessons not showing in app"
- **Cause**: Missing `order_index` or wrong `holy_book_id`
- **Solution**: Verify lesson data matches app expectations

## Next Steps

After migration:

1. **Review Sample Lessons**: Check a few lessons in the app
2. **Adjust Content**: Fine-tune block content for important sections
3. **Add Enhancements**: 
   - Audio recitation blocks
   - More interactive exercises
   - Visual aids
   - Historical context
4. **User Testing**: Get feedback on lesson flow and engagement
5. **Iterate**: Improve based on usage data

## Advanced Features

### Batch Processing
For very large datasets, consider:
- Processing in batches (100 lessons at a time)
- Adding retry logic for failed lessons
- Progress persistence (resume from last position)

### Content Enrichment
Enhance lessons with:
- AI-generated explanations
- Historical context from external sources
- Audio pronunciations
- Visual diagrams
- Cross-references to related teachings

### Analytics
Track:
- Lesson completion rates
- Time spent per lesson
- Most/least engaging lesson types
- User feedback and ratings
