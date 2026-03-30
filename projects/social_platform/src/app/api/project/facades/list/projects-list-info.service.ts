/** @format */

import { computed, ElementRef, inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import {
  concatMap,
  distinctUntilChanged,
  EMPTY,
  fromEvent,
  map,
  of,
  Subject,
  takeUntil,
  tap,
  throttleTime,
} from "rxjs";
import { NavService } from "@ui/services/nav/nav.service";
import { ProjectsInfoService } from "../projects-info.service";
import { ProgramDetailListInfoService } from "../../../program/facades/detail/program-detail-list-info.service";
import { inviteToProjectMapper } from "@utils/inviteToProjectMapper";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Project } from "@domain/project/project.model";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { GetAllProjectsUseCase } from "../../use-case/get-all-projects.use-case";
import { GetMyProjectsUseCase } from "../../use-case/get-my-projects.use-case";
import {
  AsyncState,
  initial,
  isFailure,
  isLoading,
  isSuccess,
  loading,
  success,
} from "@domain/shared/async-state";

@Injectable()
export class ProjectsListInfoService {
  private static readonly PROJECTS_PAGE_SIZE = 16;

  private readonly route = inject(ActivatedRoute);
  private readonly navService = inject(NavService);
  private readonly projectsInfoService = inject(ProjectsInfoService);
  private readonly getAllProjectsUseCase = inject(GetAllProjectsUseCase);
  private readonly getMyProjectsUseCase = inject(GetMyProjectsUseCase);
  private readonly programDetailListInfoService = inject(ProgramDetailListInfoService);
  private readonly logger = inject(LoggerService);

  private readonly destroy$ = new Subject<void>();

  private readonly projectsCount = signal<number>(0);
  private readonly currentPage = signal<number>(1);
  private readonly projectsPerFetch = signal<number>(ProjectsListInfoService.PROJECTS_PAGE_SIZE);

  private readonly currentSearchQuery = signal<string | undefined>(undefined);
  private previousReqQuery = signal<Record<string, string> | null>(null);

  readonly projects$ = signal<AsyncState<Project[]>>(initial());

  readonly projects = computed(() => {
    const state = this.projects$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? [];
    return [];
  });

  private readonly isAll = this.projectsInfoService.isAll;
  private readonly isSubs = this.projectsInfoService.isSubs;
  private readonly isDashboard = this.projectsInfoService.isDashboard;
  private readonly isInvites = this.projectsInfoService.isInvites;

  initializationProjectsList(): void {
    this.navService.setNavTitle("Проекты");

    this.projectsInfoService.initializationRouterEvents();

    if (this.isDashboard() || this.isSubs()) {
      this.programDetailListInfoService.setupProfile();
    }

    this.route.queryParams
      .pipe(
        map(q => q["name__contains"]),
        takeUntil(this.destroy$)
      )
      .subscribe(search => {
        if (search !== this.currentSearchQuery()) {
          this.currentSearchQuery.set(search);
          this.currentPage.set(1);
        }
      });

    if (this.isAll()) {
      this.route.queryParams
        .pipe(
          distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
          concatMap(q => {
            const prev = this.projects();
            this.projects$.set(loading(prev));

            const reqQuery = this.buildFilterQuery(q);

            if (
              this.previousReqQuery() !== null &&
              JSON.stringify(reqQuery) === JSON.stringify(this.previousReqQuery())
            ) {
              return EMPTY;
            }

            this.previousReqQuery.set(reqQuery);
            this.currentPage.set(1);

            return this.fetchAllProjects(reqQuery);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe(projects => {
          this.projects$.set(success(projects.results));
          this.projectsCount.set(projects.count);
        });
    }

    this.route.data
      .pipe(
        map(r => r["data"]),
        takeUntil(this.destroy$)
      )
      .subscribe(projects => {
        if (this.isInvites()) {
          this.projects$.set(success(inviteToProjectMapper(projects ?? [])));
          this.projectsCount.set(projects?.length ?? 0);
          return;
        }

        this.projectsCount.set(projects.count);
        this.projects$.set(success(projects.results ?? []));
      });
  }

  initScroll(target: HTMLElement, listRoot: ElementRef<HTMLUListElement>): void {
    fromEvent(target, "scroll")
      .pipe(
        throttleTime(300),
        concatMap(() => this.onScroll(target, listRoot)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildFilterQuery(q: Params): Record<string, string> {
    const reqQuery: Record<string, string> = {};

    if (q["name__contains"]) {
      reqQuery["name__contains"] = q["name__contains"];
    }
    if (q["industry"]) {
      reqQuery["industry"] = q["industry"];
    }
    if (q["step"]) {
      reqQuery["step"] = q["step"];
    }
    if (q["membersCount"]) {
      reqQuery["collaborator__count__gte"] = q["membersCount"];
    }
    if (q["anyVacancies"]) {
      reqQuery["any_vacancies"] = q["anyVacancies"];
    }
    if (q["is_rated_by_expert"]) {
      reqQuery["is_rated_by_expert"] = q["is_rated_by_expert"];
    }
    if (q["is_mospolytech"]) {
      reqQuery["is_mospolytech"] = q["is_mospolytech"];
      reqQuery["partner_program"] = q["partner_program"];
    }

    return reqQuery;
  }

  private onScroll(target: HTMLElement, listRoot: ElementRef<HTMLUListElement>) {
    if (this.isSubs() || this.isInvites()) {
      return EMPTY;
    }

    if (this.projectsCount() && this.projects().length >= this.projectsCount()) return EMPTY;

    if (!target || !listRoot.nativeElement) return EMPTY;

    const diff =
      target.scrollTop - listRoot.nativeElement.getBoundingClientRect().height + window.innerHeight;

    if (diff > 0) {
      return this.onFetch(
        this.currentPage() * this.projectsPerFetch(),
        this.projectsPerFetch()
      ).pipe(
        tap(chunk => {
          this.currentPage.update(p => p + 1);
          this.projects$.update(state =>
            isSuccess(state) ? success([...state.data, ...chunk]) : success(chunk)
          );
        })
      );
    }

    return EMPTY;
  }

  private onFetch(skip: number, take: number) {
    const queryParams = {
      offset: skip,
      limit: take,
      ...this.buildFilterQuery(this.route.snapshot.queryParams),
    };

    if (this.isAll()) {
      return this.fetchAllProjects(queryParams).pipe(map(projects => projects.results));
    }

    return this.fetchMyProjects({ offset: skip, limit: take }).pipe(
      tap(projects => {
        this.projectsCount.set(projects.count);
      }),
      map(projects => projects.results)
    );
  }

  private fetchAllProjects(queryParams?: Record<string, string | number>) {
    const params = queryParams ? new HttpParams({ fromObject: queryParams }) : undefined;

    return this.getAllProjectsUseCase.execute(params).pipe(
      map(result => {
        if (!result.ok) {
          this.logger.error("Error fetching all projects:", result.error);
          return this.emptyProjectsPage();
        }

        return result.value;
      })
    );
  }

  private fetchMyProjects(queryParams?: Record<string, string | number>) {
    const params = queryParams ? new HttpParams({ fromObject: queryParams }) : undefined;

    return this.getMyProjectsUseCase.execute(params).pipe(
      map(result => {
        if (!result.ok) {
          this.logger.error("Error fetching my projects:", result.error);
          return this.emptyProjectsPage();
        }

        return result.value;
      })
    );
  }

  private emptyProjectsPage(): ApiPagination<Project> {
    return {
      count: 0,
      results: [],
      next: "",
      previous: "",
    };
  }

  sliceInvitesArray(inviteId: number): void {
    this.projects$.update(state =>
      isSuccess(state) ? success(state.data.filter(p => p.inviteId !== inviteId)) : state
    );
    this.projectsCount.update(() => Math.max(0, this.projectsCount() - 1));
  }
}
