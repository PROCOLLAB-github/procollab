/** @format */

import { BehaviorSubject, Observable } from "rxjs";
import { Project, ProjectCount, ProjectCountLoadState } from "../project.model";
import { ApiPagination } from "../../other/api-pagination.model";
import { HttpParams } from "@angular/common/http";
import { ProjectCoverReset } from "../project-cover.model";

/** Порт репозитория проектов — контракт CRUD. Реализуется в infrastructure/repository/project. */
export abstract class ProjectRepositoryPort {
  abstract readonly count$: BehaviorSubject<ProjectCount>;
  abstract readonly countState$: BehaviorSubject<ProjectCountLoadState>;

  abstract getAll(params?: HttpParams): Observable<ApiPagination<Project>>;
  abstract getOne(id: number): Observable<Project>;
  abstract getMy(params?: HttpParams): Observable<ApiPagination<Project>>;
  abstract postOne(): Observable<Project>;
  abstract update(id: number, data: Partial<Project>): Observable<Project>;
  abstract deleteOne(id: number): Observable<void>;
  abstract refreshCount(): Observable<ProjectCount>;
  /** Сбрасывает обложку с обычными серверными правами редактирования проекта. */
  abstract resetCover(id: number): Observable<ProjectCoverReset>;
}
