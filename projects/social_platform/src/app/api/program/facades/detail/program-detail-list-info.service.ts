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
import { ProgramService } from "../../program.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ProjectRatingService } from "../../../project/project-rating.service";
import { AuthService } from "../../../auth";
import { SubscriptionService } from "../../../subsriptions/subscription.service";
import { FormGroup } from "@angular/forms";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "projects/skills/src/models/api-pagination.model";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import Fuse from "fuse.js";
import { ProgramDetailListUIInfoService } from "./ui/program-detail-list-ui-info.service";
import { ProjectRate } from "projects/social_platform/src/app/domain/project/project-rate";

@Injectable()
export class ProgramDetailListInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly programService = inject(ProgramService);
  private readonly projectRatingService = inject(ProjectRatingService);
  private readonly authService = inject(AuthService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly programDetailListUIInfoService = inject(ProgramDetailListUIInfoService);

  private readonly destroy$ = new Subject<void>();

  private readonly listType = this.programDetailListUIInfoService.listType;
  private readonly searchParamName = this.programDetailListUIInfoService.searchParamName;
  private readonly list = this.programDetailListUIInfoService.list;
  private readonly searchedList = this.programDetailListUIInfoService.searchedList;

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
        this.programDetailListUIInfoService.applyInitializationProgramListData(data);
      });

    this.setupSearch(this.searchForm);

    if (this.listType() === "projects") this.setupProfile();

    this.setupFilters();
  }

  initScroll(target: HTMLElement, listRoot: ElementRef<HTMLUListElement>): void {
    fromEvent(target, "scroll")
      .pipe(
        throttleTime(200),
        switchMap(() => this.onScroll(target, listRoot)),
        catchError(err => {
          console.error("Scroll error:", err);
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
      .then(() => console.log("Query change from ProjectsComponent"));
  }

  private setupSearch(searchForm: FormGroup): void {
    searchForm
      .get("search")
      ?.valueChanges.pipe(throttleTime(200), takeUntil(this.destroy$))
      .subscribe(search => {
        this.router
          .navigate([], {
            queryParams: { [this.searchParamName()]: search || null },
            relativeTo: this.route,
            queryParamsHandling: "merge",
          })
          .then(() => console.debug("QueryParams changed from ProgramListComponent"));
      });

    this.route.queryParams
      .pipe(
        map(q => q["search"]),
        takeUntil(this.destroy$)
      )
      .subscribe(search => {
        this.searchedList.set(this.applySearch(search));
      });
  }

  setupProfile(): void {
    this.authService.profile
      .pipe(
        switchMap(p => {
          return this.subscriptionService.getSubscriptions(p.id);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: subs => {
          this.programDetailListUIInfoService.applySetupProfile(subs);
        },
      });
  }

  private setupFilters(): void {
    if (this.listType() === "members") return;

    this.route.queryParams
      .pipe(
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        concatMap(q => {
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
              return this.projectRatingService.postFilters(programId, filters, params);
            }
            return this.projectRatingService.getAll(programId, params);
          }

          if (Object.keys(filters).length > 0) {
            return this.programService.createProgramFilters(programId, filters, params);
          }
          return this.programService.getAllProjects(programId, params);
        }),
        catchError(err => {
          console.error("Error in setupFilters:", err);
          return of({ count: 0, results: [] });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(result => {
        if (!result) return;

        this.programDetailListUIInfoService.applyInitializationProgramListData(result);
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

    if (total && this.list().length >= total) {
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
      this.listPage.update(p => p + 1);
      return this.onFetch();
    }

    return of({});
  }

  // Универсальный метод загрузки данных
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
        const ratingRequest$ =
          Object.keys(filters).length > 0
            ? this.projectRatingService.postFilters(programId, filters, params)
            : this.projectRatingService.getAll(programId, params);

        return ratingRequest$.pipe(
          tap((rating: ApiPagination<ProjectRate>) => {
            this.programDetailListUIInfoService.applyFetchProgramData(rating);
          }),
          catchError(err => {
            console.error("Error fetching ratings:", err);
            this.listPage.update(p => p - 1);
            return of({ count: this.listTotalCount || 0, results: [] });
          }),
          takeUntil(this.destroy$)
        );
      }

      case "projects": {
        const projectsRequest$ =
          Object.keys(filters).length > 0
            ? this.programService.createProgramFilters(programId, filters, params)
            : this.programService.getAllProjects(programId, params);

        return projectsRequest$.pipe(
          tap((projects: ApiPagination<Project>) => {
            this.programDetailListUIInfoService.applyFetchProgramData(projects);
          }),
          catchError(err => {
            console.error("Error fetching projects:", err);
            this.listPage.update(p => p - 1);
            return of({ count: this.listTotalCount || 0, results: [] });
          }),
          takeUntil(this.destroy$)
        );
      }

      case "members": {
        return this.programService.getAllMembers(programId, offset, this.itemsPerPage()).pipe(
          tap((members: ApiPagination<User>) => {
            this.programDetailListUIInfoService.applyFetchProgramData(members);
          }),
          catchError(err => {
            console.error("Error fetching members:", err);
            this.listPage.update(p => p - 1);
            return of({ count: this.listTotalCount || 0, results: [] });
          }),
          takeUntil(this.destroy$)
        );
      }

      default:
        return of({ count: 0, results: [] });
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
    if (!search) return this.list();

    const searchKeys =
      this.listType() === "projects" || this.listType() === "rating"
        ? ["name"]
        : ["firstName", "lastName"];

    const fuse = new Fuse(this.list(), {
      keys: searchKeys,
    });
    return fuse.search(search).map(r => r.item);
  }
}
