# Learning Journey System Documentation

## Overview

The Learning Journey system provides a Duolingo-style learning experience for studying the Guru Granth Sahib Ji. It includes structured lessons with interactive blocks, progress tracking, and a gamified learning path.

## Features

- **Structured Lessons**: Each lesson contains 5-15 blocks/pages
- **27 Block Types**: Variety of teaching techniques (scripture, questions, reflections, etc.)
- **Progress Tracking**: Track completion and scores (when user auth is implemented)
- **Duolingo-style UI**: Visual learning path with lesson nodes
- **Interactive Learning**: Quizzes, matching, ordering, and more

## Database Schema

### Tables

1. **lessons**: Stores lesson metadata
   - `id`: Unique lesson identifier (e.g., "japji_01_ik_onkar")
   - `holy_book_id`: Reference to holy book
   - `section`: Section name (e.g., "Japji Sahib")
   - `lesson_type`: Type of lesson (e.g., "precision", "meaning", "practice")
   - `difficulty`: 1-5 difficulty level
   - `estimated_time_min`: Estimated completion time
   - `learning_objective`: Learning goal
   - `order_index`: Order within section
   - `unlock_after_lesson_id`: Dependency (lesson must be completed first)

2. **lesson_blocks**: Stores individual blocks within lessons
   - `lesson_id`: Reference to lesson
   - `block_order`: Order within lesson
   - `block_type`: Type of block (see Block Types below)
   - `block_data`: JSONB field containing block-specific data

3. **lesson_progress**: User progress tracking (for future auth implementation)
   - `user_id`: User identifier
   - `lesson_id`: Lesson reference
   - `completed`: Completion status
   - `score`: Percentage score
   - `current_block_order`: Last completed block

## Block Types

### Content Blocks (Non-Interactive)

1. **objective**: Sets learning intent
2. **scripture**: Displays Gurmukhi text with transliteration and translation
3. **context**: Provides historical/structural context
4. **explanation**: Plain-language teaching
5. **analogy**: Makes abstract ideas intuitive
6. **definition**: Defines key terms
7. **common_misconception**: Addresses common misunderstandings
8. **summary**: Key takeaways

### Practice Blocks (Interactive)

9. **question**: Multiple choice, true/false, or short answer
10. **match**: Match terms with meanings
11. **cloze**: Fill-in-the-blank exercises
12. **order**: Arrange items in correct order
13. **highlight**: Tap words matching a prompt
14. **classification**: Sort items into categories
15. **scenario_choice**: Choose best response to a situation
16. **micro_quiz**: Bundle of quick questions
17. **checkpoint**: Assessment gate

### Reflection & Habit Blocks

18. **reflection**: Free-form text response
19. **guided_reflection**: Step-by-step journaling
20. **intention**: Set daily intentions
21. **check_in**: Mood/clarity rating

### Audio Blocks

22. **audio_recitation**: Play audio with optional follow-along
23. **listen_and_select**: Listen and identify the line
24. **repeat_practice**: Practice pronunciation

### Understanding Reinforcement

25. **memory_card**: Spaced repetition flashcard
26. **compare_contrast**: Compare two concepts
27. **teach_back**: Explain in own words

## Usage

### Creating a Lesson

1. **Define the lesson**:
```typescript
const lesson: Lesson = {
  id: 'japji_01_ik_onkar',
  holy_book_id: 'guru-granth-sahib',
  section: 'Japji Sahib',
  lesson_type: 'precision',
  difficulty: 1,
  estimated_time_min: 4,
  learning_objective: 'Understand the precise meaning of Ik Oankar',
  title: 'Ik Oankar: The Foundation',
  order_index: 1,
};
```

2. **Add blocks**:
```typescript
const blocks = [
  {
    lesson_id: 'japji_01_ik_onkar',
    block_order: 1,
    block_type: 'objective',
    block_data: {
      text: 'Understand what Ik Oankar means...',
    },
  },
  // ... more blocks
];
```

3. **Insert into database**:
```typescript
await supabase.from('lessons').insert([lesson]);
await supabase.from('lesson_blocks').insert(blocks);
```

### Sample Lesson Migration

Run the sample lesson migration script:

```bash
npm run migrate:sample-lesson
```

This creates a complete example lesson (`japji_01_ik_onkar`) with 9 blocks demonstrating various block types.

### Using the UI Components

#### Learning Journey Component

```tsx
import LearningJourney from '@/components/learning-journey';

<LearningJourney
  section="Japji Sahib"
  holyBookId="guru-granth-sahib"
  onLessonPress={(lesson) => {
    // Handle lesson selection
  }}
/>
```

#### Lesson Viewer Component

```tsx
import LessonViewer from '@/components/lesson-viewer';

<LessonViewer
  visible={true}
  lesson={selectedLesson}
  onClose={() => setVisible(false)}
/>
```

## Lesson Structure Best Practices

### Recommended Flow

1. **Start with objective** - Set clear learning intent
2. **Present scripture** - Show the text being studied
3. **Provide context** - Historical/structural background
4. **Explain** - Plain-language teaching
5. **Use analogies** - Make abstract concepts concrete
6. **Define terms** - Clarify key vocabulary
7. **Address misconceptions** - Prevent common errors
8. **Practice** - Interactive exercises (questions, matching, etc.)
9. **Reflect** - Personal connection and application
10. **Summarize** - Reinforce key takeaways

### Lesson Length

- **Short lessons**: 3-5 minutes (5-8 blocks)
- **Medium lessons**: 5-10 minutes (8-12 blocks)
- **Long lessons**: 10-15 minutes (12-15 blocks)

### Difficulty Levels

- **Level 1**: Basic concepts, simple vocabulary
- **Level 2**: Building on basics, moderate complexity
- **Level 3**: Intermediate concepts, some nuance
- **Level 4**: Advanced understanding, subtle distinctions
- **Level 5**: Deep philosophical engagement

## Block Type Examples

### Scripture Block

```json
{
  "type": "scripture",
  "data": {
    "gurmukhi": "ੴ",
    "transliteration": "Ik Oankar",
    "translation": "One Universal Reality",
    "show_by_default": true
  }
}
```

### Question Block

```json
{
  "type": "question",
  "data": {
    "question_type": "mcq",
    "prompt": "Which interpretation best reflects Ik Oankar?",
    "options": [
      "There is only one god",
      "God exists separately from creation",
      "All existence is fundamentally one",
      "It is a poetic symbol without meaning"
    ],
    "correct_option": 2,
    "feedback": {
      "0": "Ik Oankar is not about counting gods...",
      "2": "Correct! Ik Oankar points to..."
    }
  }
}
```

### Scenario Choice Block

```json
{
  "type": "scenario_choice",
  "data": {
    "situation": "Your plan fails at the last minute.",
    "question": "What aligns best with Hukam?",
    "options": [
      "Quit",
      "Panic",
      "Adapt with calm effort",
      "Blame fate"
    ],
    "correct_option": 2,
    "feedback": {
      "2": "Alignment is response, not resignation."
    }
  }
}
```

## Database Service Functions

### Get Lessons

```typescript
// Get all lessons
const lessons = await getAllLessons();

// Get lessons by section
const japjiLessons = await getLessonsBySection('Japji Sahib');

// Get lessons by holy book
const ggsLessons = await getLessonsByHolyBook('guru-granth-sahib');

// Get specific lesson
const lesson = await getLessonById('japji_01_ik_onkar');

// Search lessons
const results = await searchLessons('Ik Oankar');
```

### Progress Tracking (Future)

```typescript
// Get user progress
const progress = await getLessonProgress(userId, lessonId);

// Update progress
await updateLessonProgress(userId, lessonId, {
  completed: true,
  score: 85,
  current_block_order: 10,
});
```

## UI Components

### Learning Journey (`components/learning-journey.tsx`)

Displays lessons in a Duolingo-style path:
- Section header with lesson count
- Visual lesson nodes with icons
- Progress indicators
- Lock/unlock states
- Lesson metadata (time, difficulty)

### Lesson Viewer (`components/lesson-viewer.tsx`)

Full-screen lesson experience:
- Progress bar
- Block navigation (Previous/Next)
- Block rendering
- Answer tracking

### Block Renderer (`components/block-renderer.tsx`)

Renders all 27 block types:
- Content blocks (read-only)
- Interactive practice blocks
- Reflection blocks
- Audio blocks

## Next Steps

1. **Run database migration**: Execute the SQL schema in `lib/supabase-schema.sql`
2. **Create sample lesson**: Run `npm run migrate:sample-lesson`
3. **Test UI**: Navigate to Journey tab and view the learning path
4. **Create more lessons**: Use the sample as a template
5. **Implement user auth**: Enable progress tracking
6. **Add audio support**: Implement audio playback for recitation blocks
7. **Add speech recognition**: For repeat practice blocks

## File Structure

```
spiritual-app/
├── lib/
│   ├── database.types.ts          # TypeScript types for lessons
│   ├── database.service.ts       # Database query functions
│   └── supabase-schema.sql       # Database schema (includes lessons)
├── components/
│   ├── learning-journey.tsx      # Duolingo-style path UI
│   ├── lesson-viewer.tsx         # Lesson viewing modal
│   └── block-renderer.tsx        # All 27 block type renderers
├── app/(tabs)/
│   └── journey.tsx               # Journey tab (uses LearningJourney)
└── scripts/
    └── migrate-sample-lesson.ts  # Sample lesson migration
```

## Notes

- Audio blocks currently show placeholders (implement with `expo-av`)
- Speech recording for repeat practice needs implementation
- Progress tracking requires user authentication
- Checkpoint blocks need scoring logic implementation
- Memory cards can be integrated with spaced repetition system
