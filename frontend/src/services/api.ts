import axios from 'axios';
import type {
  Token,
  User,
  Word,
  ReviewWord,
  Quiz,
  QuizSubmitResult,
  QuizResult,
  ProgressSummary,
  DailyProgress,
  UserUpdate,
  ChangePasswordRequest,
  WritingEvaluateResponse,
  SpeakingEvaluateResponse,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = `${import.meta.env.BASE_URL}login`;
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data: { username: string; email: string; password: string }) =>
  api.post<User>('/auth/register', data);

export const login = (data: { username: string; password: string }) =>
  api.post<Token>('/auth/login', data);

export const getMe = () => api.get<User>('/auth/me');

export const updateMe = (data: UserUpdate) => api.put<User>('/auth/me', data);

export const changePassword = (data: ChangePasswordRequest) => api.post<{ detail: string }>(
  '/auth/change-password',
  data,
);

// Words
export const getWords = (params?: { category?: string; difficulty?: number }) =>
  api.get<Word[]>('/words', { params });

export const getCategories = () =>
  api.get<string[]>('/words/categories');

export const getReviewWords = (limit = 10) =>
  api.get<ReviewWord[]>('/words/review', { params: { limit } });

export const submitReview = (wordId: number, knew: boolean) =>
  api.post(`/words/${wordId}/review`, { knew });

// Quiz
export const generateQuiz = (params: { category?: string; count?: number; quiz_type?: string; difficulty?: number }) =>
  api.post<Quiz>('/quiz/generate', params);

export const submitQuiz = (quizId: number, answers: { question_id: number; user_answer: string }[]) =>
  api.post<QuizSubmitResult>(`/quiz/${quizId}/submit`, { answers });

export const getQuizHistory = () =>
  api.get<QuizResult[]>('/quiz/history');

// Progress
export const getProgressSummary = () =>
  api.get<ProgressSummary>('/progress/summary');

export const getProgressHistory = (days = 30) =>
  api.get<DailyProgress[]>('/progress/history', { params: { days } });

// IELTS practice (estimated bands; stored on server)
export const evaluateWritingTask2 = (data: {
  topic: string;
  task: string;
  essay: string;
  practice_task_id?: string;
}) => api.post<WritingEvaluateResponse>('/ielts/evaluate/writing', data);

export const evaluateSpeaking = (data: {
  question_text: string;
  transcript: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration_seconds?: number;
  question_id?: number;
}) => api.post<SpeakingEvaluateResponse>('/ielts/evaluate/speaking', data);

export const getIeltsHistory = (limit = 30) =>
  api.get<
    {
      id: number;
      kind: string;
      overall_band: number;
      created_at: string;
      preview: string | null;
    }[]
  >('/ielts/history', { params: { limit } });

export default api;
