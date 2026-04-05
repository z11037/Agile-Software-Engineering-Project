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
  ImageQuiz,
  ImageQuizSubmitResult,
  OralPracticeAttempt,
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
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
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
export const generateQuiz = (params: { category?: string; count?: number; quiz_type?: string; difficulty?: number; target_language?: string }) =>
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

// Oral practice (speaking)
export const submitOralPracticeAttempt = (data: {
  question_id: number;
  category: string;
  difficulty: string;
}) => api.post<OralPracticeAttempt>('/oral-practice/attempt', data);

export const getOralPracticeHistory = (limit = 50) =>
  api.get<OralPracticeAttempt[]>('/oral-practice/history', { params: { limit } });

// Image Quiz
export const getImageCategories = () =>
  api.get<string[]>('/image-quiz/categories');

export const generateImageQuiz = (params: { category?: string; count?: number; difficulty?: number; mode?: string }) =>
  api.post<ImageQuiz>('/image-quiz/generate', params);

export const submitImageQuiz = (quizId: number, answers: { question_id: number; user_answer: string }[]) =>
  api.post<ImageQuizSubmitResult>(`/image-quiz/${quizId}/submit`, { answers });

export default api;
