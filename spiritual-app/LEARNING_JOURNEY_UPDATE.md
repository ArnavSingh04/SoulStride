# Learning Journey UI Update

## Overview

The learning journey has been redesigned to match Duolingo's visual style and now displays the full learning path for Guru Granth Sahib Ji, not just individual sections.

## Key Changes

### 1. Duolingo-Style UI

- **Winding Path**: Lessons are displayed in a vertical path with nodes that can alternate left/right
- **Unit/Section Banners**: Green banners at the top of each unit showing "SECTION X, UNIT Y" and the section name
- **Visual Lesson Nodes**: Circular nodes with icons representing different lesson types:
  - 📖 Book icon: Reading/scripture lessons
  - 🎤 Microphone: Audio/recitation lessons
  - 💪 Dumbbell: Practice/quiz lessons
  - 🏆 Trophy: Checkpoint/special lessons
  - 🔒 Lock: Locked lessons
  - ✅ Checkmark: Completed lessons
- **Progress Stars**: Three stars appear below completed lessons
- **Path Lines**: Green connecting lines between lessons showing progression

### 2. Full SGGS Journey

The learning journey now shows all lessons from Guru Granth Sahib Ji in one continuous path, organized by:
- **Sections**: Major divisions (Japji Sahib, Rehras Sahib, Kirtan Sohila, etc.)
- **Units**: Subdivisions within sections (typically 5-7 lessons per unit)

### 3. Template Lessons Created

Seven template lessons have been created covering different sections:

#### Japji Sahib Section:
1. **Ik Oankar: The Foundation** (Lesson 1)
   - Introduces the foundational symbol ੴ
   - Explains unity of existence
   - Includes objective, scripture, explanation, question, and reflection blocks

2. **Satnam: The True Name** (Lesson 2)
   - Explores the concept of Satnam
   - Includes definition, analogy, and scenario choice blocks
   - Unlocks after completing Lesson 1

3. **Hukam: Divine Order** (Lesson 3)
   - Teaches about Hukam vs fatalism
   - Includes common misconception, analogy, scenario choice, and summary blocks
   - Unlocks after completing Lesson 2

4. **Naam: The Living Presence** (Lesson 4)
   - Explores Naam and its practice
   - Includes match exercise and reflection
   - Unlocks after completing Lesson 3

5. **First Pauri: The Nature of Creation** (Lesson 5)
   - Deep dive into the first pauri
   - Includes guided reflection
   - Unlocks after completing Lesson 4

#### Rehras Sahib Section:
6. **Rehras Sahib: Evening Prayer** (Lesson 1)
   - Introduction to Rehras Sahib
   - Explains when and why it's recited
   - Includes intention block

#### Kirtan Sohila Section:
7. **Kirtan Sohila: Night Prayer** (Lesson 1)
   - Introduction to Kirtan Sohila
   - Explains its significance
   - Includes reflection block

## Usage

### Running the Migration

To create all template lessons in your database:

```bash
npm run migrate:template-lessons
```

This will create 7 lessons with a total of 35+ blocks demonstrating various block types.

### Viewing the Journey

1. Navigate to the **Journey** tab in the app
2. You'll see the full learning path with:
   - Unit banners showing section and unit numbers
   - Lesson nodes in a vertical path
   - Locked/unlocked states
   - Progress indicators

### Lesson Structure

Each lesson follows this general flow:
1. **Objective** - Sets learning intent
2. **Scripture** - Shows the text being studied
3. **Context/Explanation** - Provides understanding
4. **Practice** - Interactive exercises (questions, matching, etc.)
5. **Reflection** - Personal connection
6. **Summary** - Key takeaways

## Visual Design

### Colors
- **Primary Green**: `#58CC02` (Duolingo green) for active lessons
- **Completed Green**: `#4CAF50` for completed lessons
- **Gold**: `#FFD700` for checkpoints/special lessons
- **Gray**: `#CCCCCC` for locked lessons

### Node Sizes
- **Node Size**: 64x64 pixels
- **Spacing**: 24 pixels between nodes
- **Path Width**: 4 pixels

### Unit Banners
- Green background matching Duolingo style
- Shows "SECTION X, UNIT Y" in smaller text
- Section name in larger, bold text
- List icon on the right (for future unit details)

## Next Steps

1. **Create More Lessons**: Use the template lessons as examples to create lessons for more pauris and sections
2. **Add Progress Tracking**: Implement user authentication to track lesson completion
3. **Add Audio**: Implement audio playback for recitation blocks
4. **Add Checkpoints**: Create checkpoint lessons that unlock new sections
5. **Add Gamification**: Implement XP, streaks, and achievements

## File Structure

```
spiritual-app/
├── components/
│   ├── learning-journey.tsx      # Main journey UI (Duolingo-style)
│   ├── lesson-viewer.tsx          # Lesson viewing modal
│   └── block-renderer.tsx         # All 27 block type renderers
├── app/(tabs)/
│   └── journey.tsx                # Journey tab (updated)
└── scripts/
    └── migrate-template-lessons.ts # Template lessons migration
```

## Notes

- The path currently uses a simplified vertical layout with slight left/right offsets for visual interest
- Path lines connect nodes vertically (can be enhanced later for true winding paths)
- Lesson unlocking is based on `unlock_after_lesson_id` field
- Progress tracking requires user authentication (to be implemented)
- All lessons are currently unlocked for testing (lock logic is in place but disabled)
