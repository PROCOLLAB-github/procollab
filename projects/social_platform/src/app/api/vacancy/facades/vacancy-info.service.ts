/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  concatMap,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  fromEvent,
  map,
  Observable,
  Subject,
  switchMap,
  takeUntil,
  tap,
  throttleTime,
} from "rxjs";
import { VacancyResponse } from "../../../domain/vacancy/vacancy-response.model";
import { Vacancy } from "../../../domain/vacancy/vacancy.model";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { VacancyService } from "../vacancy.service";
import { VacancyUIInfoService } from "./ui/vacancy-ui-info.service";

@Injectable()
export class VacancyInfoService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly vacancyService = inject(VacancyService);
  private readonly vacancyUIInfoService = inject(VacancyUIInfoService);

  private readonly destroy$ = new Subject<void>();

  readonly listType = this.vacancyUIInfoService.listType;
  readonly vacancyList = this.vacancyUIInfoService.vacancyList;
  readonly responsesList = this.vacancyUIInfoService.responsesList;

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
    this.initializeListType();
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

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ListType Section
  // ----------------

  initializeListType(): void {
    const segment = this.router.url.split("/").pop()?.split("?")[0];
    this.listType.set(segment as "all" | "my");
  }

  // ListItems Section
  // -----------------

  initializeListData(): void {
    const routeData$ =
      this.listType() === "all"
        ? this.route.data.pipe(map(r => r["data"]))
        : this.route.data.pipe(map(r => r["data"]));

    routeData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((vacancy: ApiPagination<Vacancy> | ApiPagination<VacancyResponse>) => {
        if (vacancy) {
          this.vacancyUIInfoService.applyVacancyListData(vacancy);
          this.vacancyUIInfoService.applySetTotalItems(vacancy);
        }
      });
  }

  // QueryParams Section
  // -------------------

  initializeQueryParams(): void {
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
        switchMap(() => this.onFetch(0, 20))
      )
      .subscribe((result: any) => {
        this.vacancyUIInfoService.applyVacancyListData(result);
        this.vacancyUIInfoService.applyQueryParams(result);
      });
  }

  // onScroll Section
  // -------------------

  onScroll(target: HTMLElement): Observable<void> {
    if (
      this.vacancyUIInfoService.totalItemsCount() &&
      this.vacancyList().length >= this.vacancyUIInfoService.totalItemsCount()
    )
      return EMPTY;

    if (!target) return EMPTY;

    const diff = target.scrollTop - target.scrollHeight + target.clientHeight;

    if (diff > 0) {
      return this.onFetch(
        this.vacancyUIInfoService.vacancyPage() * this.vacancyUIInfoService.perFetchTake(),
        this.vacancyUIInfoService.perFetchTake()
      ).pipe(
        tap((result: any) => {
          this.vacancyUIInfoService.applyUpdateListOnScroll(result);
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
    return this.vacancyService
      .getForProject(
        limit,
        offset,
        undefined,
        this.requiredExperience(),
        this.workFormat(),
        this.workSchedule(),
        this.salary(),
        this.roleContains()
      )
      .pipe(map(res => res));
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
