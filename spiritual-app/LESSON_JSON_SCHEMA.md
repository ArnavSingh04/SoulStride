# Lesson JSON Schema

This document describes the JSON schema for importing lessons into Supabase.

## Structure

Your JSON should be an array of lesson objects, where each lesson object contains:
1. A `lesson` object with lesson metadata
2. A `blocks` array with all the lesson blocks

## Example JSON Format

```json
[
  {
    "lesson": {
      "id": "unique-lesson-id",
      "holy_book_id": "guru-granth-sahib",
      "section": "Japji Sahib",
      "lesson_type": "precision",
      "difficulty": 1,
      "estimated_time_min": 4,
      "learning_objective": "Understand the precise meaning of Ik Oankar",
      "title": "Ik Oankar: The Foundation",
      "title_punjabi": "ੴ: ਮੂਲ",
      "description": "Learn the foundational concept of Ik Oankar",
      "order_index": 1,
      "unlock_after_lesson_id": null
    },
    "blocks": [
      {
        "block_order": 1,
        "block_type": "objective",
        "block_data": {
          "text": "Understand what Ik Oankar means in the context of Sikh philosophy."
        }
      },
      {
        "block_order": 2,
        "block_type": "scripture",
        "block_data": {
          "gurmukhi": "ੴ",
          "transliteration": "Ik Oankar",
          "translation": "One Universal Reality",
          "show_by_default": true
        }
      }
    ]
  }
]
```

## Lesson Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier for the lesson (e.g., "japji_01_ik_onkar") |
| `holy_book_id` | string | ✅ | ID of the holy book (e.g., "guru-granth-sahib") |
| `section` | string | ✅ | Section name (e.g., "Japji Sahib", "Rehras Sahib") |
| `lesson_type` | string | ❌ | Type of lesson: "precision", "meaning", "practice", etc. |
| `difficulty` | number | ✅ | Difficulty level (1-5) |
| `estimated_time_min` | number | ✅ | Estimated time to complete in minutes |
| `learning_objective` | string | ❌ | What the learner will achieve |
| `title` | string | ❌ | Lesson title in English |
| `title_punjabi` | string | ❌ | Lesson title in Punjabi |
| `description` | string | ❌ | Lesson description |
| `order_index` | number | ✅ | Order within the section (1, 2, 3, ...) |
| `unlock_after_lesson_id` | string \| null | ❌ | ID of lesson that must be completed first |

## Block Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `block_order` | number | ✅ | Order of block within lesson (1, 2, 3, ...) |
| `block_type` | string | ✅ | Type of block (see Block Types below) |
| `block_data` | object | ✅ | Block-specific data (see Block Data below) |

## Block Types and Their Data Structures

### 1. `objective`
```json
{
  "text": "Learning objective text"
}
```

### 2. `scripture`
```json
{
  "gurmukhi": "ੴ",
  "transliteration": "Ik Oankar",
  "translation": "One Universal Reality",
  "show_by_default": true
}
```

### 3. `context`
```json
{
  "text": "Contextual information about the scripture"
}
```

### 4. `explanation`
```json
{
  "text": "Detailed explanation text"
}
```

### 5. `analogy`
```json
{
  "title": "Analogy Title",
  "text": "Analogy explanation"
}
```

### 6. `definition`
```json
{
  "term": "Term to define",
  "gloss": "Definition/gloss",
  "notes": ["Note 1", "Note 2"]
}
```

### 7. `common_misconception`
```json
{
  "misconception": "Common misunderstanding",
  "correction": "Correct understanding"
}
```

### 8. `question`
```json
{
  "question_type": "mcq",
  "prompt": "Question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correct_option": 2,
  "feedback": {
    "0": "Feedback for option 0",
    "1": "Feedback for option 1",
    "2": "Feedback for option 2",
    "3": "Feedback for option 3"
  }
}
```
**Note:** `question_type` can be: `"mcq"`, `"true_false"`, or `"short_answer"`

### 9. `match`
```json
{
  "left": ["Term 1", "Term 2"],
  "right": ["Definition 1", "Definition 2"],
  "answer_map": {
    "Term 1": "Definition 1",
    "Term 2": "Definition 2"
  }
}
```

### 10. `cloze`
```json
{
  "text": "Fill in the blank text with ___ words",
  "blanks": [
    {
      "index": 0,
      "options": ["option1", "option2"],
      "correct": "option1"
    }
  ]
}
```

### 11. `order`
```json
{
  "prompt": "Arrange in correct order",
  "items": ["Item 1", "Item 2", "Item 3"],
  "correct_order": [0, 1, 2]
}
```

### 12. `highlight`
```json
{
  "text_tokens": ["word1", "word2", "word3"],
  "prompt": "Select the important words",
  "correct_indices": [0, 2]
}
```

### 13. `classification`
```json
{
  "prompt": "Classify items into buckets",
  "buckets": ["Bucket 1", "Bucket 2"],
  "items": ["Item 1", "Item 2", "Item 3"],
  "correct_bucket": {
    "Item 1": "Bucket 1",
    "Item 2": "Bucket 2"
  }
}
```

### 14. `scenario_choice`
```json
{
  "situation": "Scenario description",
  "question": "What would you do?",
  "options": ["Option 1", "Option 2", "Option 3"],
  "correct_option": 1,
  "feedback": {
    "0": "Feedback for option 0",
    "1": "Feedback for option 1"
  }
}
```

### 15. `micro_quiz`
```json
{
  "items": [
    {
      "question_type": "mcq",
      "prompt": "Question 1",
      "options": ["A", "B", "C"],
      "correct_option": 0
    },
    {
      "question_type": "true_false",
      "prompt": "Question 2",
      "options": ["True", "False"],
      "correct_option": 0
    }
  ]
}
```

### 16. `reflection`
```json
{
  "prompt": "Reflect on this question..."
}
```

### 17. `guided_reflection`
```json
{
  "steps": [
    { "prompt": "Step 1 question" },
    { "prompt": "Step 2 question" }
  ]
}
```

### 18. `intention`
```json
{
  "prompt": "Set your intention",
  "examples": ["Example 1", "Example 2"]
}
```

### 19. `check_in`
```json
{
  "prompt": "How are you feeling?",
  "scale_min": 1,
  "scale_max": 5,
  "labels": {
    "1": "Not well",
    "5": "Very well"
  }
}
```

### 20. `audio_recitation`
```json
{
  "audio_url": "https://example.com/audio.mp3",
  "follow_along": true,
  "start_time_sec": 0,
  "end_time_sec": 60
}
```

### 21. `listen_and_select`
```json
{
  "audio_url": "https://example.com/audio.mp3",
  "prompt": "What did you hear?",
  "options": ["Option 1", "Option 2"],
  "correct_option": 0
}
```

### 22. `repeat_practice`
```json
{
  "prompt": "Repeat after listening",
  "mode": "self_check"
}
```

### 23. `summary`
```json
{
  "key_takeaways": [
    "Takeaway 1",
    "Takeaway 2",
    "Takeaway 3"
  ]
}
```

### 24. `memory_card`
```json
{
  "front": "Front of card",
  "back": "Back of card"
}
```

### 25. `compare_contrast`
```json
{
  "left_title": "Left Side",
  "left_points": ["Point 1", "Point 2"],
  "right_title": "Right Side",
  "right_points": ["Point 1", "Point 2"]
}
```

### 26. `teach_back`
```json
{
  "prompt": "Explain in your own words..."
}
```

### 27. `checkpoint`
```json
{
  "pass_score": 0.7,
  "question_ids": ["question1", "question2"],
  "on_pass": {
    "unlock": ["lesson1", "lesson2"]
  },
  "on_fail": {
    "review_blocks": ["block1", "block2"]
  }
}
```

## Complete Example

```json
[
  {
    "lesson": {
      "id": "japji_01_ik_onkar",
      "holy_book_id": "guru-granth-sahib",
      "section": "Japji Sahib",
      "lesson_type": "precision",
      "difficulty": 1,
      "estimated_time_min": 4,
      "learning_objective": "Understand the precise meaning of Ik Oankar",
      "title": "Ik Oankar: The Foundation",
      "title_punjabi": "ੴ: ਮੂਲ",
      "description": "Learn the foundational concept of Ik Oankar",
      "order_index": 1,
      "unlock_after_lesson_id": null
    },
    "blocks": [
      {
        "block_order": 1,
        "block_type": "objective",
        "block_data": {
          "text": "Understand what Ik Oankar means in the context of Sikh philosophy."
        }
      },
      {
        "block_order": 2,
        "block_type": "scripture",
        "block_data": {
          "gurmukhi": "ੴ",
          "transliteration": "Ik Oankar",
          "translation": "One Universal Reality",
          "show_by_default": true
        }
      },
      {
        "block_order": 3,
        "block_type": "question",
        "block_data": {
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
            "0": "Ik Oankar is not about counting gods.",
            "1": "The teaching emphasizes unity, not separation.",
            "2": "Correct! Ik Oankar points to the fundamental oneness.",
            "3": "The symbol carries deep philosophical meaning."
          }
        }
      }
    ]
  }
]
```

## Notes

- The `lesson_id` in blocks will be automatically set from the lesson `id`
- Block `id` and `created_at` are auto-generated by the database
- All fields marked as optional (❌) can be omitted or set to `null`
- Arrays should never be `null` - use empty arrays `[]` instead
- The `order_index` should be unique within each section
