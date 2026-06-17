// Shapes mirror the backend DTOs (dev.learnloop.api.web.dto.*). Kept in one
// place so screens and services share a single source of truth.

export type Role = 'INSTRUCTOR' | 'STUDENT';
export type LessonType = 'VIDEO' | 'TEXT';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  xp: number;
  streakDays: number;
  title: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ── Catalog / course detail ────────────────────────────────────────────
export interface CourseSummary {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  coverGradient: string;
  instructorName: string;
  moduleCount: number;
  lessonCount: number;
  durationMin: number;
  enrolled: boolean;
  progressPercent: number | null;
}

export interface InstructorDto {
  id: number;
  name: string;
  title: string;
}

export interface LessonDetail {
  id: number;
  title: string;
  type: LessonType;
  durationMin: number;
  content: string;
  position: number;
  xpReward: number;
  completed: boolean;
}

export interface QuizMeta {
  id: number;
  title: string;
  questionCount: number;
  bestScore: number | null;
}

export interface ModuleDetail {
  id: number;
  title: string;
  position: number;
  lessons: LessonDetail[];
  quiz: QuizMeta | null;
}

export interface CourseDetail {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  coverGradient: string;
  instructor: InstructorDto;
  modules: ModuleDetail[];
  enrolled: boolean;
  progressPercent: number;
  completed: boolean;
}

// ── Learning / gamification ────────────────────────────────────────────
export interface BadgeDto {
  code: string;
  name: string;
  description: string;
  icon: string;
}

export interface CompleteLessonResult {
  xpEarned: number;
  totalXp: number;
  streakDays: number;
  progressPercent: number;
  courseCompleted: boolean;
  newBadges: BadgeDto[];
}

export interface EnrollmentSummary {
  courseId: number;
  title: string;
  coverGradient: string;
  category: string;
  progressPercent: number;
  completed: boolean;
}

export interface CertificateDto {
  courseId: number;
  courseTitle: string;
  studentName: string;
  instructorName: string;
  issuedAt: string;
}

// ── Quiz taking ────────────────────────────────────────────────────────
export interface OptionView {
  id: number;
  text: string;
}

export interface QuestionView {
  id: number;
  text: string;
  options: OptionView[];
}

export interface QuizView {
  id: number;
  title: string;
  passingScore: number;
  questions: QuestionView[];
}

export interface Answer {
  questionId: number;
  optionId: number;
}

export interface QuestionResult {
  questionId: number;
  correctOptionId: number;
  chosenOptionId: number;
  correct: boolean;
  explanation: string;
}

export interface QuizResult {
  score: number;
  correctCount: number;
  totalCount: number;
  passed: boolean;
  xpEarned: number;
  totalXp: number;
  questions: QuestionResult[];
  newBadges: BadgeDto[];
}
