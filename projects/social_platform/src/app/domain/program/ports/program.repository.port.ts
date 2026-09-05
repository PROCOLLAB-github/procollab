/** @format */

import { HttpParams } from "@angular/common/http";
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
  abstract getAll(
    skip: number,
    take: number,
    params?: HttpParams,
  ): Observable<ApiPagination<Program>>;

  abstract getOne(programId: number): Observable<Program>;

  abstract getManagerOverview(programId: number): Observable<ProgramAnalyticsOverview>;

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
