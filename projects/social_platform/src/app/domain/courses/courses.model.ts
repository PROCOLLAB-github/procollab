/** @format */

export interface CourseCard {
  id: number;
  title: string;
  accessType: "all_users" | "program_members" | "subscription_stub";
  status: "draft" | "published" | "ended";
  avatarUrl: string;
  cardCoverUrl: string;
  startDate: Date;
  endDate: Date;
  dateLabel: string;
  isAvailable: boolean;
  progressStatus: "not_started" | "in_progress" | "completed" | "blocked";
  percent: number;
  actionState: "start" | "continue" | "lock";
}

export interface CourseDetail {
  id: number;
  title: string;
  description: string;
  accessType: "all_users" | "program_members" | "subscription_stub";
  status: "draft" | "published" | "ended";
  avatarUrl: string;
  headerCoverUrl: string;
  startDate: Date;
  endDate: Date;
  dateLabel: string;
  isAvailable: boolean;
  partnerProgramId: number;
  progressStatus: "not_started" | "in_progress" | "completed" | "blocked";
  percent: number;
  analyticsStub: any;
}

export interface CourseLessons {
  id: number;
  moduleId: number;
  title: string;
  order: number;
  status: string;
  isAvailable: boolean;
  progressStatus: "not_started" | "in_progress" | "completed" | "blocked";
  percent: number;
  currentTaskId: number;
  taskCount: number;
}

export interface CourseModule {
  id: number;
  courseId: number;
  title: string;
  order: number;
  avatarUrl: string;
  startDate: Date;
  status: string;
  isAvailable: boolean;
  progressStatus: "not_started" | "in_progress" | "completed" | "blocked";
  percent: number;
  lessons: CourseLessons[];
}

export interface CourseStructure {
  courseId: number;
  progressStatus: "not_started" | "in_progress" | "completed" | "blocked";
  percent: number;
  modules: CourseModule[];
}

export interface Option {
  id: number;
  order: number;
  text: string;
}

export interface Task {
  id: number;
  order: number;
  title: string;
  answerTitle: string;
  status: string;
  taskKind: "question" | "informational";
  checkType: string | null;
  informationalType: string | null;
  questionType: string | null;
  answerType: string | null;
  bodyText: string;
  videoUrl: string | null;
  imageUrl: string | null;
  attachmentUrl: string | null;
  isAvailable: boolean;
  isCompleted: boolean;
  options: Option[];
}

export interface CourseLesson {
  id: number;
  moduleId: number;
  courseId: number;
  title: string;
  progressStatus: "not_started" | "in_progress" | "completed" | "blocked";
  percent: number;
  currentTaskId: number;
  moduleOrder: number;
  tasks: Task[];
}

export interface TaskAnswerResponse {
  answerId: number;
  status: "submitted" | "pending_review";
  isCorrect: boolean;
  canContinue: boolean;
  nextTaskId: number | null;
  submittedAt: Date;
}
