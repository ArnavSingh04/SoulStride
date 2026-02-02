// Database Types for Supabase

export interface HolyBook {
  id: string;
  name: string;
  name_punjabi: string;
  name_hindi?: string;
  description: string;
  total_pages?: number;
  created_at?: string;
}

export interface BaniLine {
  id: number;
  holy_book_id: string;
  page_number?: number;
  ang?: number;
  line_number?: number;
  line_order: number;
  punjabi: string;
  english: string;
  hindi?: string;
  transliteration_english?: string;
  transliteration_hindi?: string;
  author?: string;
  raag?: string;
  created_at?: string;
}

export interface Prayer {
  id: string;
  holy_book_id: string; // Required: Every prayer must belong to a holy book
  name: string;
  name_punjabi: string;
  name_hindi?: string;
  description: string;
  type?: string;
  time_of_day?: string;
  created_at?: string;
}

export interface PrayerLine {
  id: number;
  prayer_id: string;
  line_order: number;
  punjabi: string;
  english: string;
  hindi?: string;
  transliteration_english?: string;
  transliteration_hindi?: string;
  created_at?: string;
}

// Response types for API calls
export interface PrayerWithLines extends Prayer {
  lines: PrayerLine[];
}

export interface PageWithLines {
  pageNumber: number;
  lines: BaniLine[];
}

// ============== LEARNING JOURNEY / LESSONS ==============

export interface Lesson {
  id: string;
  holy_book_id: string;
  section: string;
  lesson_type?: string;
  difficulty: number;
  estimated_time_min: number;
  learning_objective?: string;
  title?: string;
  title_punjabi?: string;
  description?: string;
  order_index: number;
  unlock_after_lesson_id?: string;
  source?: { pauri_indices?: number[]; ang_range?: { start: number; end: number } } | null;
  tags?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface LessonBlock {
  id: number;
  lesson_id: string;
  block_order: number;
  block_type: string;
  block_data: any; // JSONB - will be typed per block type
  created_at?: string;
}

export interface LessonWithBlocks extends Lesson {
  blocks: LessonBlock[];
}

export interface LessonProgress {
  id: number;
  user_id?: string;
  lesson_id: string;
  completed: boolean;
  score?: number;
  current_block_order: number;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

// ============== BLOCK TYPE DEFINITIONS ==============

// Base block interface
export interface BaseBlock {
  id: string;
  type: string;
  data: any;
}

// 1. Objective Block
export interface ObjectiveBlockData {
  text: string;
}

// 2. Scripture Block
export interface ScriptureBlockData {
  gurmukhi: string;
  transliteration: string;
  translation: string;
  show_by_default?: boolean;
}

// 3. Context Block
export interface ContextBlockData {
  text: string;
}

// 4. Explanation Block
export interface ExplanationBlockData {
  text: string;
}

// 5. Analogy Block
export interface AnalogyBlockData {
  title: string;
  text: string;
}

// 6. Definition Block
export interface DefinitionBlockData {
  term: string;
  gloss: string;
  notes?: string[];
}

// 7. Common Misconception Block
export interface CommonMisconceptionBlockData {
  misconception: string;
  correction: string;
}

// 8. Question Block (generic)
export interface QuestionBlockData {
  question_type: 'mcq' | 'true_false' | 'short_answer';
  prompt: string;
  options?: string[];
  correct_option?: number;
  correct_answer?: string; // For short_answer
  feedback?: Record<number, string>; // Option index -> feedback
}

// 9. Match Block
export interface MatchBlockData {
  left: string[];
  right: string[];
  answer_map: Record<string, string>; // left item -> right item
}

// 10. Cloze Block
export interface ClozeBlockData {
  text: string;
  blanks: Array<{
    index: number;
    options: string[];
    correct: string;
  }>;
}

// 11. Order Block
export interface OrderBlockData {
  prompt: string;
  items: string[];
  correct_order: number[];
}

// 12. Highlight Block
export interface HighlightBlockData {
  text_tokens: string[];
  prompt: string;
  correct_indices: number[];
}

// 13. Classification Block
export interface ClassificationBlockData {
  prompt: string;
  buckets: string[];
  items: string[];
  correct_bucket: Record<string, string>; // item -> bucket
}

// 14. Scenario Choice Block
export interface ScenarioChoiceBlockData {
  situation: string;
  question: string;
  options: string[];
  correct_option: number;
  feedback?: Record<number, string>;
}

// 15. Micro Quiz Block
export interface MicroQuizBlockData {
  items: Array<{
    question_type: 'mcq' | 'true_false' | 'short_answer';
    prompt: string;
    options?: string[];
    correct_option?: number;
    correct_answer?: string;
  }>;
}

// 16. Reflection Block
export interface ReflectionBlockData {
  prompt: string;
}

// 17. Guided Reflection Block
export interface GuidedReflectionBlockData {
  steps: Array<{
    prompt: string;
  }>;
}

// 18. Intention Block
export interface IntentionBlockData {
  prompt: string;
  examples?: string[];
}

// 19. Check In Block
export interface CheckInBlockData {
  prompt: string;
  scale_min: number;
  scale_max: number;
  labels?: Record<number, string>;
}

// 20. Audio Recitation Block
export interface AudioRecitationBlockData {
  audio_url: string;
  follow_along?: boolean;
  start_time_sec?: number;
  end_time_sec?: number;
}

// 21. Listen and Select Block
export interface ListenAndSelectBlockData {
  audio_url: string;
  prompt: string;
  options: string[];
  correct_option: number;
}

// 22. Repeat Practice Block
export interface RepeatPracticeBlockData {
  prompt: string;
  mode?: 'self_check' | 'speech_scoring';
}

// 23. Summary Block
export interface SummaryBlockData {
  key_takeaways: string[];
}

// 24. Memory Card Block
export interface MemoryCardBlockData {
  front: string;
  back: string;
}

// 25. Compare Contrast Block
export interface CompareContrastBlockData {
  left_title: string;
  left_points: string[];
  right_title: string;
  right_points: string[];
}

// 26. Teach Back Block
export interface TeachBackBlockData {
  prompt: string;
}

// 27. Checkpoint Block
export interface CheckpointBlockData {
  pass_score: number; // 0-1 (e.g., 0.7 = 70%)
  question_ids: string[];
  on_pass?: {
    unlock?: string[]; // lesson IDs to unlock
  };
  on_fail?: {
    review_blocks?: string[]; // block IDs to review
  };
}

// Union type for all block data types
export type BlockData =
  | ObjectiveBlockData
  | ScriptureBlockData
  | ContextBlockData
  | ExplanationBlockData
  | AnalogyBlockData
  | DefinitionBlockData
  | CommonMisconceptionBlockData
  | QuestionBlockData
  | MatchBlockData
  | ClozeBlockData
  | OrderBlockData
  | HighlightBlockData
  | ClassificationBlockData
  | ScenarioChoiceBlockData
  | MicroQuizBlockData
  | ReflectionBlockData
  | GuidedReflectionBlockData
  | IntentionBlockData
  | CheckInBlockData
  | AudioRecitationBlockData
  | ListenAndSelectBlockData
  | RepeatPracticeBlockData
  | SummaryBlockData
  | MemoryCardBlockData
  | CompareContrastBlockData
  | TeachBackBlockData
  | CheckpointBlockData;

// Typed block interface
export interface TypedLessonBlock extends Omit<LessonBlock, 'block_data'> {
  block_data: BlockData;
}

