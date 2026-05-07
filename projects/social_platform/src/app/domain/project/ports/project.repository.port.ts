/** @format */

import { BehaviorSubject, Observable } from "rxjs";
import { Project, ProjectCount } from "../project.model";
import { ApiPagination } from "../../other/api-pagination.model";
import { HttpParams } from "@angular/common/http";
import { ProjectDto } from "@infrastructure/adapters/project/dto/project.dto";

/**
 * Порт репозитория проектов.
 * Определяет контракт для CRUD операций с проектами.
 * Реализуется в infrastructure/repository/project/project.repository.ts
 */
export abstract class ProjectRepositoryPort {
  abstract readonly count$: BehaviorSubject<ProjectCount>;

  abstract getAll(params?: HttpParams): Observable<ApiPagination<Project>>;
  abstract getOne(id: number): Observable<Project>;
  abstract getMy(params?: HttpParams): Observable<ApiPagination<Project>>;
  abstract postOne(): Observable<Project>;
  abstract update(id: number, data: Partial<ProjectDto>): Observable<Project>;
  abstract deleteOne(id: number): Observable<void>;
  abstract refreshCount(): Observable<ProjectCount>;
  abstract invalidate(id: number): void;
}
