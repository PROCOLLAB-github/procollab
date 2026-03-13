/**
 * Как в базе
 *
 * id — ID курса (создается автоматически).
 *   title — название курса (до 45 символов).
 *   description — описание курса (до 600 символов, можно оставить пустым).
 *   access_type — тип доступа: для всех, для участников программы, по подписке.
 *   partner_program — связанная программа (может быть пустой, кроме сценария “для участников программы”).
 *   avatar_file — аватар курса (файл, необязательно).
 *   card_cover_file — обложка карточки курса в каталоге (файл, необязательно).
 *   header_cover_file — обложка шапки внутри страницы курса (файл, необязательно).
 *   start_date — дата старта курса (может быть пустой).
 *   end_date — дата окончания курса (может быть пустой).
 *   status — статус контента курса: черновик, опубликован, завершен.
 *   is_completed — логический флаг завершения курса.
 *   completed_at — дата/время завершения курса.
 *   datetime_created — дата/время создания.
 *   datetime_updated — дата/время обновления.
 *
 * @format
 */

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

/**
 * Как в базе
 *
  id — уникальный идентификатор модуля.
  course — курс, к которому относится модуль (обязательная связь).
  title — название модуля, максимум 40 символов.
  avatar_file — аватар модуля (необязательный файл).
  start_date — дата старта модуля (обязательная).
  status — статус модуля: draft (черновик), published (опубликован)
  order — порядковый номер модуля внутри курса (по нему сортируется вывод).
  datetime_created — дата/время создания.
  datetime_updated — дата/время последнего обновления.
 *
 */

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

/**
 * Как в базе
 *
  id — уникальный идентификатор урока.
  module — модуль, к которому относится урок (обязательная связь).
  title — название урока, максимум 45 символов.
  status — статус урока: draft (черновик), published (опубликован)
  order — порядковый номер урока внутри модуля.
  datetime_created — дата/время создания.
  datetime_updated — дата/время последнего обновления.
 */

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
