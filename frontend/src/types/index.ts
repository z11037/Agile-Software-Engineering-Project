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
}

export interface DailyProgress {
  date: string;
  reviews: number;
  quizzes: number;
  accuracy: number;
}

/** Backend IELTS-style writing (Task 2) evaluation + DB id */
export interface WritingEvaluateResponse {
  score: number;
  band: number;
  word_count: number;
  breakdown: {
    task_response: number;
    coherence: number;
    lexical: number;
    grammar: number;
  };
  checks: { label: string; ok: boolean }[];
  strengths: string[];
  improvements: string[];
  disclaimer: string;
  evaluation_id: number;
}

/** Backend IELTS-style speaking evaluation (transcript-based) + DB id */
export interface SpeakingEvaluateResponse {
  score: number;
  band: number;
  word_count: number;
  duration_seconds: number | null;
  breakdown: {
    fluency_coherence: number;
    lexical: number;
    grammar: number;
    pronunciation_proxy: number;
  };
  strengths: string[];
  improvements: string[];
  disclaimer: string;
  evaluation_id: number;
}
