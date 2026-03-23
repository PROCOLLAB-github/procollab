/** @format */

import { ElementRef, inject, Injectable } from "@angular/core";
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  EMPTY,
  fromEvent,
  map,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
  throttleTime,
} from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";
import { ProgramDetailListUIInfoService } from "./ui/program-detail-list-ui-info.service";
import { ProjectRate } from "projects/social_platform/src/app/domain/project/project-rate";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { CreateProgramFiltersUseCase } from "../../use-cases/create-program-filters.use-case";
import { GetAllProjectsUseCase } from "../../use-cases/get-all-projects.use-case";
import { GetAllMembersUseCase } from "../../use-cases/get-all-members.use-case";
import { GetProjectSubscriptionsUseCase } from "../../../project/use-case/get-project-subscriptions.use-case";
import { FilterProjectRatingsUseCase } from "../../use-cases/filter-project-ratings.use-case";
import { GetProjectRatingsUseCase } from "../../use-cases/get-project-ratings.use-case";
import Fuse from "fuse.js";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import {
  isSuccess,
  loading,
  success,
} from "projects/social_platform/src/app/domain/shared/async-state";

@Injectable()
export class ProgramDetailListInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly createProgramFiltersUseCase = inject(CreateProgramFiltersUseCase);
  private readonly getAllProjectsUseCase = inject(GetAllProjectsUseCase);
  private readonly getAllMembersUseCase = inject(GetAllMembersUseCase);
  private readonly getProjectSubscriptionsUseCase = inject(GetProjectSubscriptionsUseCase);
  private readonly filterProjectRatingsUseCase = inject(FilterProjectRatingsUseCase);
  private readonly getProjectRatingsUseCase = inject(GetProjectRatingsUseCase);

  private readonly authRepository = inject(AuthRepositoryPort);

  private readonly programDetailListUIInfoService = inject(ProgramDetailListUIInfoService);
  private readonly logger = inject(LoggerService);

  private readonly destroy$ = new Subject<void>();

  private readonly listType = this.programDetailListUIInfoService.listType;
  private readonly searchParamName = this.programDetailListUIInfoService.searchParamName;

  private readonly listPage = this.programDetailListUIInfoService.listPage;
  private readonly itemsPerPage = this.programDetailListUIInfoService.itemsPerPage;
  private readonly listTotalCount = this.programDetailListUIInfoService.listTotalCount;

  private readonly searchForm = this.programDetailListUIInfoService.searchForm;

  initializationListData(): void {
    this.route.data
      .pipe(
        tap(data => this.listType.set(data["listType"])),
        switchMap(r => of(r["data"])),
        takeUntil(this.destroy$)
      )
      .subscribe(data => {
        this.programDetailListUIInfoService.list$.set(success(data.results));
      });

    this.setupSearch();

    if (this.listType() === "projects") this.setupProfile();

    this.setupFilters();
  }

  initScroll(target: HTMLElement, listRoot: ElementRef<HTMLUListElement>): void {
    fromEvent(target, "scroll")
      .pipe(
        throttleTime(200),
        switchMap(() => this.onScroll(target, listRoot)),
        catchError(err => {
          this.logger.error("Scroll error:", err);
          return of({});
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Сброс всех активных фильтров
   * Очищает все query параметры и возвращает к состоянию по умолчанию
   */
  onClearFilters(): void {
    this.router
      .navigate([], {
        queryParams: {
          search: undefined,
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => this.logger.info("Query change from ProjectsComponent"));
  }

  private setupSearch(): void {
    this.searchForm
      .get("search")
      ?.valueChanges.pipe(throttleTime(200), takeUntil(this.destroy$))
      .subscribe(search => {
        this.router
          .navigate([], {
            queryParams: { [this.searchParamName()]: search || null },
            relativeTo: this.route,
            queryParamsHandling: "merge",
          })
          .then(() => this.logger.debug("QueryParams changed from ProgramListComponent"));
      });

    this.route.queryParams
      .pipe(
        map(q => q["search"]),
        takeUntil(this.destroy$)
      )
      .subscribe(search => {
        this.programDetailListUIInfoService.searchedList.set(this.applySearch(search));
      });
  }

  setupProfile(): void {
    this.authRepository.profile
      .pipe(
        switchMap(p => this.getProjectSubscriptionsUseCase.execute(p.id)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.logger.error("Error loading profile subscriptions:", result.error);
            return;
          }

          this.programDetailListUIInfoService.applySetupProfile(result.value);
        },
      });
  }

  private setupFilters(): void {
    if (this.listType() === "members") return;

    this.route.queryParams
      .pipe(
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        concatMap(q => {
          const prev = this.programDetailListUIInfoService.list();
          this.programDetailListUIInfoService.list$.set(loading(prev));

          const { filters, extraParams } = this.buildFilterQuery(q);
          const programId = this.route.parent?.snapshot.params["programId"];

          this.listPage.set(0);

          const params = new HttpParams({
            fromObject: {
              offset: "0",
              limit: this.itemsPerPage().toString(),
              ...extraParams,
            },
          });

          if (this.listType() === "rating") {
            if (Object.keys(filters).length > 0) {
              return this.filterProjectRatingsUseCase.execute(programId, filters, params).pipe(
                map(result => {
                  if (!result.ok) {
                    this.logger.error("Error filtering rating projects:", result.error);
                    return this.emptyPage<ProjectRate>();
                  }

                  return result.value;
                })
              );
            }
            return this.getProjectRatingsUseCase.execute(programId, params).pipe(
              map(result => {
                if (!result.ok) {
                  this.logger.error("Error fetching rating projects:", result.error);
                  return this.emptyPage<ProjectRate>();
                }

                return result.value;
              })
            );
          }

          if (Object.keys(filters).length > 0) {
            return this.createProgramFiltersUseCase.execute(programId, filters, params).pipe(
              map(result => {
                if (!result.ok) {
                  this.logger.error("Error creating program filters:", result.error);
                  return this.emptyPage<Project>();
                }

                return result.value;
              })
            );
          }
          return this.getAllProjectsUseCase.execute(programId, params).pipe(
            map(result => {
              if (!result.ok) {
                this.logger.error("Error fetching initial projects:", result.error);
                return this.emptyPage<Project>();
              }

              return result.value;
            })
          );
        }),
        catchError(err => {
          this.logger.error("Error in setupFilters:", err);
          return of(this.emptyPage<ProjectRate | Project>());
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(result => {
        if (!result) return;

        this.programDetailListUIInfoService.list$.set(success(result.results));
        this.listPage.set(0);
      });
  }

  getInitialSearchValue(): string {
    const qp = this.route.snapshot.queryParams;
    const raw = qp["search"] ?? qp["name__contains"];
    return raw ? decodeURIComponent(raw) : "";
  }

  initializeSearchForm(): void {
    const initialValue = this.getInitialSearchValue();
    this.programDetailListUIInfoService.applyInitializationSearchForm(initialValue);
  }

  // Универсальный метод скролла
  private onScroll(target: HTMLElement, listRoot: ElementRef<HTMLUListElement>) {
    const total = this.listTotalCount();

    if (total && this.programDetailListUIInfoService.list().length >= total) {
      return EMPTY;
    }

    if (!target || !listRoot.nativeElement) return EMPTY;

    let shouldFetch = false;

    if (this.listType() === "rating") {
      const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
      shouldFetch = scrollBottom <= 200;
    } else {
      if (!listRoot) return EMPTY;
      const diff =
        target.scrollTop -
        listRoot.nativeElement.getBoundingClientRect().height +
        window.innerHeight;

      const threshold = this.listType() === "projects" ? -200 : 0;
      shouldFetch = diff > threshold;
    }

    if (shouldFetch) {
      this.programDetailListUIInfoService.loadingMore.set(true);
      this.listPage.update(p => p + 1);
      return this.onFetch();
    }

    return of({});
  }

  // Универсальный метод загрузки данных
  private onFetch() {
    const programId = this.route.parent?.snapshot.params["programId"];
    const offset = this.listPage() * this.itemsPerPage();

    // Получаем текущие query параметры для фильтров
    const currentQuery = this.route.snapshot.queryParams;
    const { filters, extraParams } = this.buildFilterQuery(currentQuery);

    const params = new HttpParams({
      fromObject: {
        offset: offset.toString(),
        limit: this.itemsPerPage().toString(),
        ...extraParams,
      },
    });

    switch (this.listType()) {
      case "rating": {
        if (Object.keys(filters).length > 0) {
          return this.filterProjectRatingsUseCase.execute(programId, filters, params).pipe(
            tap(result => {
              if (!result.ok) {
                this.logger.error("Error fetching ratings:", result.error);
                this.listPage.update(p => p - 1);
                return;
              }

              this.programDetailListUIInfoService.list$.update(state =>
                isSuccess(state)
                  ? success([...state.data, ...result.value.results])
                  : success(result.value.results)
              );
              this.programDetailListUIInfoService.loadingMore.set(false);
            }),
            catchError(err => {
              this.logger.error("Error fetching ratings:", err);
              this.listPage.update(p => p - 1);
              return of(this.emptyPage<ProjectRate>());
            }),
            takeUntil(this.destroy$)
          );
        }

        return this.getProjectRatingsUseCase.execute(programId, params).pipe(
          tap(result => {
            if (!result.ok) {
              this.logger.error("Error fetching ratings:", result.error);
              this.listPage.update(p => p - 1);
              return;
            }

            this.programDetailListUIInfoService.list$.update(state =>
              isSuccess(state)
                ? success([...state.data, ...result.value.results])
                : success(result.value.results)
            );
            this.programDetailListUIInfoService.loadingMore.set(false);
          }),
          catchError(err => {
            this.logger.error("Error fetching ratings:", err);
            this.listPage.update(p => p - 1);
            return of(this.emptyPage<ProjectRate>());
          }),
          takeUntil(this.destroy$)
        );
      }

      case "projects": {
        const projectsRequest$ =
          Object.keys(filters).length > 0
            ? this.createProgramFiltersUseCase.execute(programId, filters, params)
            : this.getAllProjectsUseCase.execute(programId, params);

        return projectsRequest$.pipe(
          tap(result => {
            if (!result.ok) {
              this.logger.error("Error fetching projects:", result.error);
              this.listPage.update(p => p - 1);
              return;
            }

            this.programDetailListUIInfoService.list$.update(state =>
              isSuccess(state)
                ? success([...state.data, ...result.value.results])
                : success(result.value.results)
            );
            this.programDetailListUIInfoService.loadingMore.set(false);
          }),
          catchError(err => {
            this.logger.error("Error fetching projects:", err);
            this.listPage.update(p => p - 1);
            return of(this.emptyPage<Project>());
          }),
          takeUntil(this.destroy$)
        );
      }

      case "members": {
        return this.getAllMembersUseCase.execute(programId, offset, this.itemsPerPage()).pipe(
          tap(result => {
            if (!result.ok) {
              this.logger.error("Error fetching members:", result.error);
              this.listPage.update(p => p - 1);
              return;
            }

            this.programDetailListUIInfoService.list$.update(state =>
              isSuccess(state)
                ? success([...state.data, ...result.value.results])
                : success(result.value.results)
            );
            this.programDetailListUIInfoService.loadingMore.set(false);
          }),
          catchError(err => {
            this.logger.error("Error fetching members:", err);
            this.listPage.update(p => p - 1);
            return of(this.emptyPage<User>());
          }),
          takeUntil(this.destroy$)
        );
      }

      default:
        return of(this.emptyPage());
    }
  }

  // Построение запроса для фильтров (кроме участников)
  private buildFilterQuery(q: any): {
    filters: Record<string, any>;
    extraParams: Record<string, any>;
  } {
    if (this.listType() === "members") return { filters: {}, extraParams: {} };

    const filters: Record<string, any> = {};
    const extraParams: Record<string, any> = {};

    Object.keys(q).forEach(key => {
      const value = q[key];
      if (value === undefined || value === "" || value === null) return;

      if (this.listType() === "rating" && (key === "search" || key === "name__contains")) {
        extraParams["name__contains"] = value;
        return;
      }

      if (this.listType() === "rating" && key === "is_rated_by_expert") {
        extraParams["is_rated_by_expert"] = value;
        return;
      }

      filters[key] = Array.isArray(value) ? value : [value];
    });

    return { filters, extraParams };
  }

  private applySearch(search: string) {
    if (!search) return this.programDetailListUIInfoService.list();

    const searchKeys =
      this.listType() === "projects" || this.listType() === "rating"
        ? ["name"]
        : ["firstName", "lastName"];

    const fuse = new Fuse(this.programDetailListUIInfoService.list(), {
      keys: searchKeys,
    });
    return fuse.search(search).map(r => r.item);
  }

  private emptyPage<T>(): ApiPagination<T> {
    return {
      count: 0,
      results: [],
      next: "",
      previous: "",
    };
  }
}
