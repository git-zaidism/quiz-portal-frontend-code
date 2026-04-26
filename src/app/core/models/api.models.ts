export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: Record<string, string>;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthTokenResponse {
  token: string;
  expiresInMinutes: number;
}

export interface Authority {
  authority: string;
}

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  enabled: boolean;
  profile: string;
  roles: string[];
  authorities: Authority[];
}

export interface UserCreateRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Category {
  categoryId: number;
  title: string;
  description: string | null;
}

export interface CategoryPayload {
  categoryId?: number | null;
  title: string;
  description: string;
}

export interface Quiz {
  quizId: number;
  title: string;
  description: string | null;
  maxMarks: string;
  numberOfQuestions: string;
  active: boolean;
  categoryId: number;
  categoryTitle: string;
}

export interface QuizPayload {
  quizId?: number | null;
  title: string;
  description: string;
  maxMarks: string;
  numberOfQuestions: string;
  active: boolean;
  categoryId: number;
}

export interface Question {
  questionId: number;
  content: string;
  image: string | null;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: string;
  givenAnswer?: string | null;
  quizId: number;
}

export interface QuestionAttempt {
  questionId: number;
  content: string;
  image: string | null;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  quizId: number;
}

export interface QuestionPayload {
  questionId?: number | null;
  content: string;
  image: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: string;
  quizId: number;
}

export interface QuestionEvaluationRequest {
  questionId: number;
  givenAnswer: string;
}

export interface QuizEvaluationResponse {
  marksGot: number;
  correctAnswers: number;
  attempted: number;
}

export type AuthMode = 'learner' | 'admin';
