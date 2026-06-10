/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { User } from "@domain/auth/user.model";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";
import { ProgramCreate } from "@domain/program/program-create.model";
import { Program, ProgramDataSchema } from "@domain/program/program.model";
import { ProjectAdditionalFields } from "@domain/project/project-additional-fields.model";
import { Project } from "@domain/project/project.model";
import { ProgramHttpAdapter } from "../../adapters/program/program-http.adapter";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { EntityCache } from "@domain/shared/entity-cache";
import { ApplyToProgramDTO } from "@domain/program/dto/apply-to-program.model";
import { ApplyToProgramResponse } from "@domain/program/results/apply-to-program";
import { userFromRaw } from "@utils/userRaw";
import { EventBus } from "@domain/shared/event-bus";
import { LoggedOut } from "@domain/auth/events/logged-out.event";

/** Репозиторий программ: `EntityCache<Program>` для `getOne`, остальное — passthrough. */
@Injectable({ providedIn: "root" })
export class ProgramRepository implements ProgramRepositoryPort {
  private readonly programAdapter = inject(ProgramHttpAdapter);
  private readonly entityCache = new EntityCache<Program>(5 * 60 * 1000);
  private readonly eventBus = inject(EventBus);

  constructor() {
    this.initializeEvents();
  }

  private initializeEvents(): void {
    this.eventBus.on<LoggedOut>("LoggedOut").subscribe({
      next: () => {
        this.entityCache.clear();
      },
    });
  }

  getAll(skip: number, take: number, params?: HttpParams): Observable<ApiPagination<Program>> {
    return this.programAdapter.getAll(skip, take, params);
  }

  getOne(programId: number): Observable<Program> {
    return this.entityCache.getOrFetch(programId, () => this.programAdapter.getOne(programId));
  }

  create(program: ProgramCreate): Observable<Program> {
    return this.programAdapter.create(program);
  }

  getDataSchema(programId: number): Observable<ProgramDataSchema> {
    return this.programAdapter.getDataSchema(programId).pipe(map(response => response.dataSchema));
  }

  register(
    programId: number,
    additionalData: Record<string, string>,
  ): Observable<ProgramDataSchema> {
    return this.programAdapter.register(programId, additionalData);
  }

  getAllProjects(programId: number, params?: HttpParams): Observable<ApiPagination<Project>> {
    return this.programAdapter.getAllProjects(programId, params);
  }

  getAllMembers(programId: number, skip: number, take: number): Observable<ApiPagination<User>> {
    return this.programAdapter.getAllMembers(programId, skip, take).pipe(
      map(result => ({
        ...result,
        results: result.results.map(user => userFromRaw(user)),
      })),
    );
  }

  getProgramFilters(programId: number): Observable<PartnerProgramFields[]> {
    return this.programAdapter.getProgramFilters(programId);
  }

  getProgramProjectAdditionalFields(programId: number): Observable<ProjectAdditionalFields> {
    return this.programAdapter.getProgramProjectAdditionalFields(programId);
  }

  applyProjectToProgram(
    programId: number,
    dto: ApplyToProgramDTO,
  ): Observable<ApplyToProgramResponse> {
    return this.programAdapter.applyProjectToProgram(programId, dto);
  }

  createProgramFilters(
    programId: number,
    filters: Record<string, string[]>,
    params?: HttpParams,
  ): Observable<ApiPagination<Project>> {
    return this.programAdapter.createProgramFilters(programId, filters, params);
  }

  submitCompettetiveProject(relationId: number): Observable<Project> {
    return this.programAdapter.submitCompettetiveProject(relationId);
  }
}
