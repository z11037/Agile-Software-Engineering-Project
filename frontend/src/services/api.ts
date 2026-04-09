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
  SpeakingSelfAssessment,
  WritingEvaluateRequest,
  WritingEvaluationOut,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// ── request: attach stored access token ──────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── silent-refresh state ──────────────────────────────────────────────────────
let isRefreshing = false;
let pendingQueue: Array<(accessToken: string) => void> = [];

function drainQueue(newToken: string) {
  pendingQueue.forEach((cb) => cb(newToken));
  pendingQueue = [];
}

function clearAuthAndRedirect() {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('username');
  isRefreshing = false;
  pendingQueue = [];
  window.location.href = `${import.meta.env.BASE_URL ?? '/'}login`;
}

// ── response: silent token refresh on 401 ────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    // Don't attempt refresh for auth endpoints or already-retried requests.
    const isAuthRequest =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/register');

    if (error.response?.status !== 401 || isAuthRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request.
    if (isRefreshing) {
      return new Promise<typeof error.config>((resolve) => {
        pendingQueue.push((newToken: string) => {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Use a plain axios call to avoid triggering this interceptor recursively.
      const base = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await axios.post<Token>(`${base}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token: newRefresh } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', newRefresh);

      drainQueue(access_token);
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return api(originalRequest);
    } catch {
      clearAuthAndRedirect();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register = (data: { username: string; email: string; password: string }) =>
  api.post<User>('/auth/register', data);

export const login = (data: { username: string; password: string }) =>
  api.post<Token>('/auth/login', data);

export const logout = () => api.post<void>('/auth/logout');

export const refreshToken = (data: { refresh_token: string }) =>
  api.post<Token>('/auth/refresh', data);

export const getMe = () => api.get<User>('/auth/me');

export const updateMe = (data: UserUpdate) => api.put<User>('/auth/me', data);

export const changePassword = (data: ChangePasswordRequest) =>
  api.post<{ detail: string }>('/auth/change-password', data);

// ── Words ─────────────────────────────────────────────────────────────────────
export const getWords = (params?: { category?: string; difficulty?: number }) =>
  api.get<Word[]>('/words', { params });

export const getCategories = () => api.get<string[]>('/words/categories');

export const getReviewWords = (limit = 10) =>
  api.get<ReviewWord[]>('/words/review', { params: { limit } });

export const submitReview = (wordId: number, knew: boolean) =>
  api.post(`/words/${wordId}/review`, { knew });

// ── Quiz ──────────────────────────────────────────────────────────────────────
export const generateQuiz = (params: {
  category?: string;
  count?: number;
  quiz_type?: string;
  difficulty?: number;
  target_language?: string;
}) => api.post<Quiz>('/quiz/generate', params);

export const submitQuiz = (
  quizId: number,
  answers: { question_id: number; user_answer: string }[],
) => api.post<QuizSubmitResult>(`/quiz/${quizId}/submit`, { answers });

export const getQuizHistory = () => api.get<QuizResult[]>('/quiz/history');

// ── Progress ──────────────────────────────────────────────────────────────────
export const getProgressSummary = () => api.get<ProgressSummary>('/progress/summary');

export const getProgressHistory = (days = 30) =>
  api.get<DailyProgress[]>('/progress/history', { params: { days } });

// ── Oral practice (speaking) ──────────────────────────────────────────────────
export const submitOralPracticeAttempt = (data: {
  question_id: number;
  category: string;
  difficulty: string;
  self_assessment?: SpeakingSelfAssessment;
}) => api.post<OralPracticeAttempt>('/oral-practice/attempt', data);

export const getOralPracticeHistory = (limit = 50) =>
  api.get<OralPracticeAttempt[]>('/oral-practice/history', { params: { limit } });

// ── Writing evaluation ────────────────────────────────────────────────────────
export const evaluateWriting = (data: WritingEvaluateRequest) =>
  api.post<WritingEvaluationOut>('/writing/evaluate', data);

export const getWritingHistory = (limit = 20) =>
  api.get<WritingEvaluationOut[]>('/writing/history', { params: { limit } });

// ── Image Quiz ────────────────────────────────────────────────────────────────
export const getImageCategories = () => api.get<string[]>('/image-quiz/categories');

export const generateImageQuiz = (params: {
  category?: string;
  count?: number;
  difficulty?: number;
  mode?: string;
}) => api.post<ImageQuiz>('/image-quiz/generate', params);

export const submitImageQuiz = (
  quizId: number,
  answers: { question_id: number; user_answer: string }[],
) => api.post<ImageQuizSubmitResult>(`/image-quiz/${quizId}/submit`, { answers });

export default api;
