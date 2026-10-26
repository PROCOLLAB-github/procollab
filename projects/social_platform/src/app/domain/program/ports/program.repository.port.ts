/** @format */

import {
  ProgramAttentionCategory,
  ProgramAttentionActionQuery,
  ProgramAttentionPreview,
  ProgramAttentionSendResult,
} from "@domain/program/program-attention-actions.model";
/** @format */

import { HttpParams } from "@angular/common/http";
import {
  ProgramCaseQuery,
  ProgramCaseFilters,
  ProgramCaseSelection,
} from "@domain/program/program-case-analytics.model";
import { ProgramRoleWidget } from "../program-role-widget.model";
import { Observable } from "rxjs";
import { ApiPagination } from "../../other/api-pagination.model";
import { Program, ProgramDataSchema } from "../program.model";
import { ProgramCreate } from "../program-create.model";
import { Project } from "../../project/project.model";
import { User } from "../../auth/user.model";
import { PartnerProgramFields } from "../partner-program-fields.model";
import { ProjectAdditionalFields } from "../../project/project-additional-fields.model";
import { ApplyToProgramDTO } from "../dto/apply-to-program.model";
import { ApplyToProgramResponse } from "../results/apply-to-program";
import {
  ProgramAnalyticsAttentionPage,
  ProgramAnalyticsAttentionParticipant,
  ProgramAnalyticsAttentionProjects,
  ProgramAnalyticsNotSubmittedProjectsPage,
  ProgramAnalyticsAttentionQuery,
} from "../program-analytics-attention.model";
import {
  ProgramAnalyticsOverview,
  ProgramAnalyticsAssignment,
  ProgramAnalyticsAssignmentScope,
  ProgramAnalyticsAssignmentScoreDetail,
} from "../program-analytics.model";

/** Порт репозитория программ: список/детали/создание/регистрация, проекты/участники/фильтры. */
export abstract class ProgramRepositoryPort {
  abstract previewAttentionReminder(
    programId: number,
    category: ProgramAttentionCategory,
    query: ProgramAttentionActionQuery,
  ): Observable<ProgramAttentionPreview>;
  abstract sendAttentionReminder(
    programId: number,
    category: ProgramAttentionCategory,
    token: string,
  ): Observable<ProgramAttentionSendResult>;
  abstract exportAttention(
    programId: number,
    category: ProgramAttentionCategory,
    query: ProgramAttentionActionQuery,
  ): Observable<Blob>;

  abstract getCaseProjects(programId: number, query: ProgramCaseQuery): Observable<unknown>;
  abstract exportCaseProjects(
    programId: number,
    selection: ProgramCaseSelection,
    filters?: ProgramCaseFilters,
  ): Observable<Blob>;

  abstract getRoleWidget(programId: number): Observable<ProgramRoleWidget>;
  abstract getAll(
    skip: number,
    take: number,
    params?: HttpParams,
  ): Observable<ApiPagination<Program>>;

  abstract getOne(programId: number): Observable<Program>;

  abstract getManagerOverview(programId: number): Observable<ProgramAnalyticsOverview>;

  abstract getManagerParticipantsWithoutVisit(
    programId: number,
    query: ProgramAnalyticsAttentionQuery,
  ): Observable<ProgramAnalyticsAttentionPage<ProgramAnalyticsAttentionParticipant>>;

  /** Уникальные участники без команды текущей программы, серверный поиск/пагинация. */
  abstract getManagerParticipantsWithoutTeam(
    programId: number,
    query: ProgramAnalyticsAttentionQuery,
  ): Observable<ProgramAnalyticsAttentionPage<ProgramAnalyticsAttentionParticipant>>;

  /** Только сданные, ещё не оценённые работы; одна работа — одна строка. */
  abstract getManagerProjectsAwaitingEvaluation(
    programId: number,
    query: ProgramAnalyticsAttentionQuery,
  ): Observable<ProgramAnalyticsAttentionProjects>;

  /** Несданные связи конкурсной программы с серверным поиском, страницей и сроком. */
  abstract getManagerProjectsNotSubmitted(
    programId: number,
    query: ProgramAnalyticsAttentionQuery,
  ): Observable<ProgramAnalyticsNotSubmittedProjectsPage>;

  /** Manager-only назначения; pending включает несданные проекты. */
  abstract getManagerAssignments(
    programId: number,
    scope: ProgramAnalyticsAssignmentScope,
  ): Observable<ProgramAnalyticsAssignment[]>;

  /** Оценки конкретного назначения строго внутри выбранной программы. */
  abstract getManagerAssignmentScores(
    programId: number,
    assignmentId: number,
  ): Observable<ProgramAnalyticsAssignmentScoreDetail>;

  abstract acknowledgeWelcome(programId: number): Observable<{ welcomeAcknowledgedAt: string }>;

  abstract create(program: ProgramCreate): Observable<Program>;

  abstract getDataSchema(programId: number): Observable<ProgramDataSchema>;

  abstract register(
    programId: number,
    additionalData: Record<string, string>,
  ): Observable<ProgramDataSchema>;

  abstract getAllProjects(
    programId: number,
    params?: HttpParams,
  ): Observable<ApiPagination<Project>>;

  abstract getPublishedProjects(
    programId: number,
    params?: HttpParams,
  ): Observable<ApiPagination<Project>>;

  abstract getAllMembers(
    programId: number,
    skip: number,
    take: number,
  ): Observable<ApiPagination<User>>;

  abstract getProgramFilters(programId: number): Observable<PartnerProgramFields[]>;

  abstract getProgramProjectAdditionalFields(
    programId: number,
  ): Observable<ProjectAdditionalFields>;

  abstract applyProjectToProgram(
    programId: number,
    dto: ApplyToProgramDTO,
  ): Observable<ApplyToProgramResponse>;

  abstract createProgramFilters(
    programId: number,
    filters: Record<string, string[]>,
    params?: HttpParams,
  ): Observable<ApiPagination<Project>>;

  abstract submitCompettetiveProject(relationId: number): Observable<Project>;
}
