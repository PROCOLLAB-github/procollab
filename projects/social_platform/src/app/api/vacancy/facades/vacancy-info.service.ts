/** @format */

import { inject, Injectable } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import {
  concatMap,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  fromEvent,
  map,
  Observable,
  Subject,
  switchMap,
  takeUntil,
  tap,
  throttleTime,
} from "rxjs";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { VacancyUIInfoService } from "./ui/vacancy-ui-info.service";
import { GetVacanciesUseCase } from "../use-cases/get-vacancies.use-case";
import { failure, isSuccess, loading, success } from "@domain/shared/async-state";

@Injectable()
export class VacancyInfoService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly getVacanciesUseCase = inject(GetVacanciesUseCase);
  private readonly vacancyUIInfoService = inject(VacancyUIInfoService);

  private readonly destroy$ = new Subject<void>();

  readonly listType = this.vacancyUIInfoService.listType;

  // Переменные для работы с фильтрами

  readonly requiredExperience = this.vacancyUIInfoService.requiredExperience;
  readonly roleContains = this.vacancyUIInfoService.roleContains;
  readonly workFormat = this.vacancyUIInfoService.workFormat;
  readonly workSchedule = this.vacancyUIInfoService.workSchedule;
  readonly salary = this.vacancyUIInfoService.salary;

  // Search Section
  // --------------

  onSearchSubmit(searchValue?: string | null): void {
    this.router.navigate([], {
      queryParams: { role_contains: searchValue || null },
      queryParamsHandling: "merge",
      relativeTo: this.route,
    });
  }

  initializationSearchValueForm(): void {
    this.vacancyUIInfoService.searchForm
      .get("search")
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(value => this.onSearchSubmit(value));
  }

  // Initialization
  // --------------

  init(): void {
    this.setupRouteListener();
    this.initializationSearchValueForm();
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ListType Section
  // ----------------

  updateListType(): void {
    const segment = this.router.url.split("/").pop()?.split("?")[0];
    const newListType = segment as "all" | "my";

    if (this.listType() !== newListType) {
      this.listType.set(newListType);

      // Загружаем данные для нового типа
      this.loadDataForCurrentType();
    }
  }

  private setupRouteListener(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateListType();
      });

    this.updateListType();
  }

  private loadDataForCurrentType(): void {
    this.initializeListData();

    if (this.listType() === "all") {
      this.initializeQueryParams();
    }

    if (this.listType() === "my") {
      this.vacancyUIInfoService.resetFilters();
      this.clearQueryParams();
    }

    this.vacancyUIInfoService.myModalSetup();
  }

  // ListItems Section
  // -----------------

  initializeListData(): void {
    const routeData$ =
      this.listType() === "all"
        ? this.route.data.pipe(map(r => r["data"]))
        : this.route.data.pipe(map(r => r["data"]));

    routeData$.pipe(takeUntil(this.destroy$)).subscribe({
      next: result => this.vacancyUIInfoService.vacancies$.set(success(result)),
      error: () => this.vacancyUIInfoService.vacancies$.set(failure("fetch_error")),
    });
  }

  // QueryParams Section
  // -------------------

  initializeQueryParams(): void {
    let isFirstEmit = true;

    this.route.queryParams
      .pipe(
        debounceTime(200),
        takeUntil(this.destroy$),
        tap(params => {
          const requiredExperience = params["required_experience"]
            ? params["required_experience"]
            : undefined;

          const roleContains = params["role_contains"] || undefined;
          const workFormat = params["work_format"] ? params["work_format"] : undefined;
          const workSchedule = params["work_schedule"] ? params["work_schedule"] : undefined;
          const salary = params["salary"] ? params["salary"] : undefined;

          this.vacancyUIInfoService.setFilters(
            requiredExperience,
            roleContains,
            workFormat,
            workSchedule,
            salary
          );
        }),
        switchMap(params => {
          // Пропускаем первый emit без фильтров — данные уже загружены resolver'ом
          if (isFirstEmit) {
            isFirstEmit = false;
            const hasFilters = Object.values(params).some(v => v != null);
            if (!hasFilters) return EMPTY;
          }

          const prev = this.vacancyUIInfoService.vacancyList();
          this.vacancyUIInfoService.vacancies$.set(loading(prev));
          return this.onFetch(0, 20);
        })
      )
      .subscribe({
        next: result => this.vacancyUIInfoService.vacancies$.set(success(result)),
        error: () => this.vacancyUIInfoService.vacancies$.set(failure("fetch_error")),
      });
  }

  // onScroll Section
  // -------------------

  onScroll(target: HTMLElement): Observable<Vacancy[]> {
    if (
      this.vacancyUIInfoService.totalItemsCount() &&
      this.vacancyUIInfoService.vacancyList().length >= this.vacancyUIInfoService.totalItemsCount()
    )
      return EMPTY;

    if (!target) return EMPTY;

    const diff = target.scrollTop - target.scrollHeight + target.clientHeight;

    if (diff > 0) {
      this.vacancyUIInfoService.loadingMore.set(true);
      return this.onFetch(
        this.vacancyUIInfoService.vacancyPage() * this.vacancyUIInfoService.perFetchTake(),
        this.vacancyUIInfoService.perFetchTake()
      ).pipe(
        tap((result: Vacancy[]) => {
          this.vacancyUIInfoService.vacancies$.update(state =>
            isSuccess(state) ? success([...state.data, ...result]) : success(result)
          );
          this.vacancyUIInfoService.loadingMore.set(false);
        })
      );
    }

    return EMPTY;
  }

  // target for Scroll Section
  // -------------------

  initScroll(target: HTMLElement): void {
    if (target) {
      fromEvent(target, "scroll")
        .pipe(
          throttleTime(500),
          concatMap(() => this.onScroll(target)),
          takeUntil(this.destroy$)
        )
        .subscribe();
    }
  }

  // QueryParams Section
  // -------------------

  onFetch(offset: number, limit: number) {
    return this.getVacanciesUseCase
      .execute({
        limit,
        offset,
        requiredExperience: this.requiredExperience(),
        workFormat: this.workFormat(),
        workSchedule: this.workSchedule(),
        salary: this.salary(),
        searchValue: this.roleContains(),
      })
      .pipe(map(result => (result.ok ? result.value : [])));
  }

  // other methods Section
  // -------------------

  private clearQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        role_contains: null,
        required_experience: null,
        work_format: null,
        work_schedule: null,
        salary: null,
      },
      queryParamsHandling: "merge",
    });
  }
}
