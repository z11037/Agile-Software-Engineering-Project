export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface UserUpdate {
  username?: string | null;
  email?: string | null;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  detail: string;
}

export interface Word {
  id: number;
  english: string;
  chinese: string;
  part_of_speech: string;
  example_sentence: string | null;
  difficulty_level: number;
  category: string;
}

export interface ReviewWord extends Word {
  familiarity_level: number;
  review_count: number;
  next_review_date: string | null;
}

export interface QuizQuestion {
  id: number;
  word_id: number;
  english: string;
  chinese: string;
  french: string;
  spanish: string;
  arabic: string;
  persian: string;
  options: string[];
  correct_answer: string | null;
}

export interface Quiz {
  id: number;
  quiz_type: string;
  total_questions: number;
  questions: QuizQuestion[];
}

export interface QuizResult {
  id: number;
  quiz_type: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  created_at: string;
}

export interface QuizSubmitResult {
  quiz_id: number;
  total_questions: number;
  correct_answers: number;
  score: number;
  results: {
    question_id: number;
    word_id: number;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
  }[];
}

export interface ProgressSummary {
  total_words: number;
  words_learned: number;
  words_mastered: number;
  total_quizzes: number;
  average_score: number;
  current_streak: number;
  reviews_today: number;
  total_oral_attempts: number;
  oral_attempts_today: number;
}

export interface DailyProgress {
  date: string;
  reviews: number;
  quizzes: number;
  accuracy: number;
  oral_practice: number;
}

export interface OralPracticeAttempt {
  id: number;
  question_id: number;
  category: string;
  difficulty: string;
  created_at: string;
}

export interface ImagePromptQuestion {
  id: number;
  image_url: string;
  image_type: string;
  hint: string | null;
  options: string[];
  correct_answer: string | null;
}

export interface ImageQuiz {
  id: number;
  total_questions: number;
  mode: string;
  questions: ImagePromptQuestion[];
}

export interface ImageQuizResultItem {
  question_id: number;
  prompt_id: number;
  image_url: string;
  image_type: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
}

export interface ImageQuizSubmitResult {
  quiz_id: number;
  total_questions: number;
  correct_answers: number;
  score: number;
  results: ImageQuizResultItem[];
}
