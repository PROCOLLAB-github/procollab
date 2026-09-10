/** @format */
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProgramEvaluationMode } from "./program-analytics.model";

/** Серверный поиск и пагинация: UI не фильтрует одну страницу как полный набор. */
export interface ProgramAnalyticsAttentionQuery {
  search?: string;
  limit?: number;
  offset?: number;
}

/** Контракт ApiPagination с фактическими nullable ссылками DRF, без изменения общего типа. */
export type ProgramAnalyticsAttentionPage<T> = Omit<ApiPagination<T>, "next" | "previous"> & {
  next: string | null;
  previous: string | null;
};

/** Уникальный участник без команды в этой программе, не признак «ищет команду».
 * registeredAt — регистрация в программе, city сохраняет legacy-значения backend.
 */
export interface ProgramAnalyticsAttentionParticipant {
  userId: number;
  fullName: string;
  avatar: string | null;
  city: string | null;
  registeredAt: string | null;
}

/** Стабильные причины backend; пороги и завершённость не пересчитываются на frontend. */
export type ProgramAnalyticsAttentionReason =
  | "no_assignments"
  | "no_completed_evaluations"
  | "partially_evaluated"
  | "awaiting_first_evaluation";

/** Одна сданная работа программы, не строка назначения эксперта.
 * В open assignment-счётчики null; неизвестная дата сдачи не подменяется другой датой.
 */
export interface ProgramAnalyticsAttentionProject {
  programProjectId: number;
  project: { id: number; name: string };
  leader: { userId: number; fullName: string; avatar: string | null } | null;
  submittedAt: string | null;
  status: "awaiting_evaluation" | "partially_evaluated";
  reason: ProgramAnalyticsAttentionReason;
  reasonLabel: string;
  assignmentsTotal: number | null;
  assignmentsCompleted: number | null;
}

/** Режим берём из ответа списка, не из потенциально устаревшей сводки. */
export type ProgramAnalyticsAttentionProjects =
  ProgramAnalyticsAttentionPage<ProgramAnalyticsAttentionProject> & { mode: ProgramEvaluationMode };

/** Несданная связь проекта с программой; linkedAt — дата связи, не создания проекта. */
export interface ProgramAnalyticsNotSubmittedProject {
  programProjectId: number;
  project: { id: number; name: string };
  leader: { userId: number; fullName: string; avatar: string | null } | null;
  linkedAt: string;
}

/** Применимость и срок задаёт backend; клиент не пересчитывает дедлайн или SLA. */
export type ProgramAnalyticsNotSubmittedProjectsPage =
  ProgramAnalyticsAttentionPage<ProgramAnalyticsNotSubmittedProject> & {
    applicable: boolean;
    submissionDeadline: string | null;
    submissionOpen: boolean;
  };
