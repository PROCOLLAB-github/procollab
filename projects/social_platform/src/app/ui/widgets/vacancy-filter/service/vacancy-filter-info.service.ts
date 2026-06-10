/** @format */

import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { map, tap } from "rxjs";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { GetVacanciesUseCase } from "@api/vacancy/use-cases/get-vacancies.use-case";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Injectable()
export class VacancyFilterInfoService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly getVacanciesUseCase = inject(GetVacanciesUseCase);

  readonly filterOpen = signal(false);

  readonly searchValue = signal<string | undefined>(undefined);

  private readonly totalItemsCount = signal(0);

  readonly currentExperience = signal<string | undefined>(undefined);
  readonly currentWorkFormat = signal<string | undefined>(undefined);
  readonly currentWorkSchedule = signal<string | undefined>(undefined);
  readonly currentSalary = signal<string | undefined>(undefined);

  initializationVacancyFilters(): void {
    // Подписка на изменения параметров запроса
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(queries => {
      // Синхронизация текущих значений фильтров с URL
      this.currentExperience.set(queries["required_experience"]);
      this.currentWorkFormat.set(queries["work_format"]);
      this.currentWorkSchedule.set(queries["work_schedule"]);
      this.currentSalary.set(queries["salary"]);
      this.applyParamsSearchValue(queries);
    });
  }

  applyInitSearchValue(value?: string): void {
    this.searchValue.set(value);
  }

  applyParamsSearchValue(queries: Params): void {
    this.searchValue.set(queries["role_contains"]);
  }

  setExperienceFilter(event: Event, experienceId: string): void {
    event.stopPropagation();
    // Переключение фильтра (снятие если уже выбран)
    this.currentExperience.set(
      experienceId === this.currentExperience() ? undefined : experienceId,
    );

    // Обновление URL с новым параметром
    this.router
      .navigate([], {
        queryParams: { required_experience: this.currentExperience() },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => this.logger.debug("Query change from ProjectsComponent"));
  }

  setWorkFormatFilter(event: Event, formatId: string): void {
    event.stopPropagation();
    this.currentWorkFormat.set(formatId === this.currentWorkFormat() ? undefined : formatId);

    this.router
      .navigate([], {
        queryParams: { work_format: this.currentWorkFormat() },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => this.logger.debug("Query change from ProjectsComponent"));
  }

  setWorkScheduleFilter(event: Event, scheduleId: string): void {
    event.stopPropagation();
    this.currentWorkSchedule.set(
      scheduleId === this.currentWorkSchedule() ? undefined : scheduleId,
    );

    this.router
      .navigate([], {
        queryParams: {
          work_schedule: this.currentWorkSchedule(),
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => this.logger.debug("Query change from ProjectsComponent"));
  }

  resetFilter(): void {
    this.router
      .navigate([], {
        queryParams: {
          required_experience: null,
          work_format: null,
          work_schedule: null,
          role_contains: null,
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => this.logger.debug("Filters reset from VacancyFilterComponent"));
  }

  applyResetCurrentFilters(): void {
    this.currentExperience.set(undefined);
    this.currentWorkFormat.set(undefined);
    this.currentWorkSchedule.set(undefined);
  }

  onClickOutside(): void {
    this.filterOpen.set(false);
  }

  onFetch(offset: number, limit: number, projectId?: number) {
    return this.getVacanciesUseCase
      .execute({
        limit,
        offset,
        projectId,
        requiredExperience: this.currentExperience(),
        workFormat: this.currentWorkFormat(),
        workSchedule: this.currentWorkSchedule(),
        salary: this.currentSalary(),
        searchValue: this.searchValue(),
      })
      .pipe(
        tap(result => {
          this.totalItemsCount.set(result.ok ? result.value.length : 0);
        }),
        map(result => (result.ok ? result.value : [])),
      );
  }
}
