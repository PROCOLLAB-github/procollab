/** @format */

import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { Project, ProjectCount } from "@domain/project/project.model";
import { ProjectHttpAdapter } from "../../adapters/project/project-http.adapter";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { HttpParams } from "@angular/common/http";
import { plainToInstance } from "class-transformer";
import { ProjectDto } from "../../adapters/project/dto/project.dto";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { ProjectCreated } from "@domain/project/events/project-created.event";
import { ProjectDeleted } from "@domain/project/events/project-deleted.event";
import { ProjectSubscribed } from "@domain/project/events/project-subscribed.event";
import { ProjectUnSubscribed } from "@domain/project/events/project-unsubsribed.event";
import { RemoveProjectCollaborator } from "@domain/project/events/remove-project-collaborator.event";
import { SendVacancyResponse } from "@domain/vacancy/events/send-vacancy-response.event";
import { AcceptVacancyResponse } from "@domain/vacancy/events/accept-vacancy-response.event";
import { RejectVacancyResponse } from "@domain/vacancy/events/reject-vacancy-response.event";
import { EntityCache } from "@domain/shared/entity-cache";

@Injectable({ providedIn: "root" })
export class ProjectRepository implements ProjectRepositoryPort {
  private readonly entityCache = new EntityCache<Project>();
  readonly count$ = new BehaviorSubject<ProjectCount>({ my: 0, all: 0, subs: 0 });

  private readonly projectAdapter = inject(ProjectHttpAdapter);
  private readonly eventBus = inject(EventBus);

  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    this.eventBus.on<ProjectCreated>("ProjectCreated").subscribe(() => {
      this.count$.next({
        ...this.count$.getValue(),
        my: this.count$.getValue().my + 1,
      });
    });

    this.eventBus.on<ProjectDeleted>("ProjectDeleted").subscribe(event => {
      this.invalidate(event.payload.projectId);
      this.count$.next({
        ...this.count$.getValue(),
        my: Math.max(0, this.count$.getValue().my - 1),
      });
    });

    this.eventBus.on<ProjectSubscribed>("ProjectSubscribed").subscribe({
      next: () => {
        this.count$.next({
          ...this.count$.getValue(),
          subs: this.count$.getValue().subs + 1,
        });
      },
    });

    this.eventBus.on<ProjectUnSubscribed>("ProjectUnSubscribed").subscribe({
      next: event => {
        this.invalidate(event.payload.projectId);
        this.count$.next({
          ...this.count$.getValue(),
          subs: Math.max(0, this.count$.getValue().subs - 1),
        });
      },
    });

    this.eventBus.on<RemoveProjectCollaborator>("RemoveProjectCollaborator").subscribe({
      next: event => {
        this.invalidate(event.payload.projectId);
      },
    });

    // Слушание событий вакансий - инвалидация кэша проекта
    this.eventBus.on<SendVacancyResponse>("SendVacancyResponse").subscribe({
      next: event => {
        this.invalidate(event.payload.projectId);
      },
    });

    this.eventBus.on<AcceptVacancyResponse>("AcceptVacancyResponse").subscribe({
      next: event => {
        this.invalidate(event.payload.projectId);
      },
    });

    this.eventBus.on<RejectVacancyResponse>("RejectVacancyResponse").subscribe({
      next: event => {
        this.invalidate(event.payload.projectId);
      },
    });
  }

  getAll(params?: HttpParams): Observable<ApiPagination<Project>> {
    return this.projectAdapter
      .fetchAll(params)
      .pipe(map(page => ({ ...page, results: plainToInstance(Project, page.results) })));
  }

  getOne(id: number): Observable<Project> {
    return this.entityCache.getOrFetch(id, () =>
      this.projectAdapter.fetchOne(id).pipe(map(dto => plainToInstance(Project, dto)))
    );
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
    this.entityCache.invalidate(id);
  }
}
