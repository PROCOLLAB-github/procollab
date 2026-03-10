/** @format */

import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, shareReplay, tap } from "rxjs";
import { Project, ProjectCount } from "../../../domain/project/project.model";
import { ProjectHttpAdapter } from "../../adapters/project/project-http.adapter";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { HttpParams } from "@angular/common/http";
import { plainToInstance } from "class-transformer";
import { ProjectDto } from "../../adapters/project/dto/project.dto";
import { ProjectRepositoryPort } from "../../../domain/project/ports/project.repository.port";

@Injectable({ providedIn: "root" })
export class ProjectRepository implements ProjectRepositoryPort {
  private readonly cache = new Map<number, Observable<Project>>();
  readonly count$ = new BehaviorSubject<ProjectCount>({ my: 0, all: 0, subs: 0 });

  private readonly projectAdapter = inject(ProjectHttpAdapter);

  getAll(params?: HttpParams): Observable<ApiPagination<Project>> {
    return this.projectAdapter
      .fetchAll(params)
      .pipe(map(page => ({ ...page, results: plainToInstance(Project, page.results) })));
  }

  getOne(id: number): Observable<Project> {
    if (!this.cache.has(id)) {
      const project$ = this.projectAdapter.fetchOne(id).pipe(
        map(dto => plainToInstance(Project, dto)),
        shareReplay(1)
      );
      this.cache.set(id, project$);
    }
    return this.cache.get(id)!;
  }

  refreshCount(): Observable<ProjectCount> {
    return this.projectAdapter.fetchCount().pipe(
      map(dto => plainToInstance(ProjectCount, dto)),
      tap(count => this.count$.next(count))
    );
  }

  update(id: number, data: Partial<ProjectDto>): Observable<Project> {
    return this.projectAdapter.putUpdate(id, data).pipe(
      map(project => plainToInstance(Project, project)),
      tap(() => this.invalidate(id))
    );
  }

  getMy(params?: HttpParams): Observable<ApiPagination<Project>> {
    return this.projectAdapter
      .fetchMy(params)
      .pipe(map(page => ({ ...page, results: plainToInstance(Project, page.results) })));
  }

  postOne(): Observable<Project> {
    return this.projectAdapter.postCreate().pipe(map(dto => plainToInstance(Project, dto)));
  }

  deleteOne(id: number): Observable<void> {
    return this.projectAdapter.deleteOne(id);
  }

  invalidate(id: number): void {
    this.cache.delete(id);
  }
}
