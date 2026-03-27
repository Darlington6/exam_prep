import axios from 'axios';

// Call backend directly. Port 5001 to avoid conflict with macOS AirPlay (5000).
const baseURL = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001'}/api`;

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-logout'));
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/login', data),
  me: () => api.get<{ user: User }>('/auth/me'),
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  username?: string;
  avatar?: string;
  notifications?: boolean;
  createdAt?: string;
}

export interface Exam {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  passingScore: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  examId: string;
  questionText: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  explanation?: string;
  points: number;
  order: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;    // lowercase slug, used in URLs
  name: string;  // display name (title-cased)
  count: number; // number of active exams
}

export const categoriesApi = {
  getAll: () => api.get<{ categories: Category[] }>('/categories'),
};

export interface CreateExamData {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  passingScore: number;
}

export interface CreateQuestionData {
  examId: string;
  questionText: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  explanation?: string;
  points?: number;
  order?: number;
}

// Admin API for managing exams
export const adminExamApi = {
  getAll: () => api.get<{ exams: Exam[] }>('/admin/exams'),
  getById: (id: string) => api.get<{ exam: Exam }>(`/admin/exams/${id}`),
  create: (data: CreateExamData) => api.post<{ exam: Exam }>('/admin/exams', data),
  update: (id: string, data: Partial<CreateExamData>) => 
    api.put<{ exam: Exam }>(`/admin/exams/${id}`, data),
  delete: (id: string) => api.delete(`/admin/exams/${id}`),
  toggleActive: (id: string) => api.patch<{ exam: Exam }>(`/admin/exams/${id}/toggle-active`),
};

// Admin API for managing questions
export const adminQuestionApi = {
  getByExam: (examId: string) => 
    api.get<{ questions: Question[] }>(`/admin/exams/${examId}/questions`),
  getById: (id: string) => api.get<{ question: Question }>(`/admin/questions/${id}`),
  create: (data: CreateQuestionData) => 
    api.post<{ question: Question }>('/admin/questions', data),
  update: (id: string, data: Partial<CreateQuestionData>) => 
    api.put<{ question: Question }>(`/admin/questions/${id}`, data),
  delete: (id: string) => api.delete(`/admin/questions/${id}`),
};

// Admin API for fetching exams from external sources
export const adminExternalApi = {
  fetchFromAPI: (data: { apiUrl: string; category?: string; limit?: number }) =>
    api.post<{ exams: Exam[]; questions: Question[] }>('/admin/external/fetch', data),
};

// Student Exam API
export const examApi = {
  getByCategory: (category: string) => 
    api.get<{ exams: Exam[] }>(`/exams/category/${category}`),
  getById: (id: string) => api.get<{ exam: Exam }>(`/exams/${id}`),
  getQuestions: (examId: string) => 
    api.get<{ questions: Question[] }>(`/exams/${examId}/questions`),
  getReviewQuestions: (examId: string) =>
    api.get<{ questions: Question[] }>(`/exams/${examId}/review`),
  submitAttempt: (examId: string, answers: Record<string, number>) =>
    api.post<{ attempt: ExamAttempt }>(`/exams/${examId}/submit`, { answers }),
  getAttempts: () => api.get<{ attempts: ExamAttempt[] }>('/exams/attempts'),
};

export interface ExamAttempt {
  _id: string;
  examId: string;
  userId: string;
  answers: Record<string, number>;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  completedAt: string;
}

export interface ExamHistoryEntry {
  _id: string;
  examId: string;
  examTitle: string;
  examCategory: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  completedAt: string;
}

// User profile & settings API
export const userApi = {
  getProfile: () => api.get<{ user: User }>('/user/profile'),
  updateProfile: (data: { username?: string; avatar?: string }) =>
    api.put<{ user: User }>('/user/profile', data),
  getExamHistory: () => api.get<{ history: ExamHistoryEntry[] }>('/user/exam-history'),
  updateSettings: (data: { notifications?: boolean }) =>
    api.put<{ settings: { notifications: boolean } }>('/user/settings', data),
};
