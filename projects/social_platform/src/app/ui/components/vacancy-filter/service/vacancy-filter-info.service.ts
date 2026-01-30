/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { VacancyService } from "projects/social_platform/src/app/api/vacancy/vacancy.service";
import { map, Subject, takeUntil, tap } from "rxjs";

@Injectable()
export class VacancyFilterInfoService {
  /** Сервис роутера для навигации */
  private readonly router = inject(Router);
  /** Сервис текущего маршрута */
  private readonly route = inject(ActivatedRoute);
  /** Сервис для работы с вакансиями */
  private readonly vacancyService = inject(VacancyService);

  private readonly destroy$ = new Subject<void>();

  /** Состояние открытия фильтра (для мобильной версии) */
  readonly filterOpen = signal(false);

  readonly searchValue = signal<string | undefined>(undefined);

  /** Общее количество элементов */
  private readonly totalItemsCount = signal(0);

  // Сигналы для текущих значений фильтров
  /** Текущий фильтр по опыту */
  currentExperience = signal<string | undefined>(undefined);
  /** Текущий фильтр по формату работы */
  currentWorkFormat = signal<string | undefined>(undefined);
  /** Текущий фильтр по графику работы */
  currentWorkSchedule = signal<string | undefined>(undefined);
  /** Текущая зарплата */
  currentSalary = signal<string | undefined>(undefined);

  initializationVacancyFilters(): void {
    // Подписка на изменения параметров запроса
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(queries => {
      // Синхронизация текущих значений фильтров с URL
      this.currentExperience.set(queries["required_experience"]);
      this.currentWorkFormat.set(queries["work_format"]);
      this.currentWorkSchedule.set(queries["work_schedule"]);
      this.currentSalary.set(queries["salary"]);
      this.applyParamsSearchValue(queries);
    });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyInitSearchValue(value?: string): void {
    this.searchValue.set(value);
  }

  applyParamsSearchValue(queries: Params): void {
    this.searchValue.set(queries["role_contains"]);
  }

  /**
   * Установка фильтра по опыту работы
   * @param event - событие клика
   * @param experienceId - идентификатор выбранного опыта
   */
  setExperienceFilter(event: Event, experienceId: string): void {
    event.stopPropagation();
    // Переключение фильтра (снятие если уже выбран)
    this.currentExperience.set(
      experienceId === this.currentExperience() ? undefined : experienceId
    );

    // Обновление URL с новым параметром
    this.router
      .navigate([], {
        queryParams: { required_experience: this.currentExperience() },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from ProjectsComponent"));
  }

  /**
   * Установка фильтра по формату работы
   * @param event - событие клика
   * @param formatId - идентификатор выбранного формата
   */
  setWorkFormatFilter(event: Event, formatId: string): void {
    event.stopPropagation();
    this.currentWorkFormat.set(formatId === this.currentWorkFormat() ? undefined : formatId);

    this.router
      .navigate([], {
        queryParams: { work_format: this.currentWorkFormat() },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from ProjectsComponent"));
  }

  /**
   * Установка фильтра по графику работы
   * @param event - событие клика
   * @param scheduleId - идентификатор выбранного графика
   */
  setWorkScheduleFilter(event: Event, scheduleId: string): void {
    event.stopPropagation();
    this.currentWorkSchedule.set(
      scheduleId === this.currentWorkSchedule() ? undefined : scheduleId
    );

    this.router
      .navigate([], {
        queryParams: {
          work_schedule: this.currentWorkSchedule(),
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from ProjectsComponent"));
  }

  /**
   * Сброс всех фильтров
   * Очищает все параметры фильтрации и обновляет URL
   */
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
      .then(() => console.debug("Filters reset from VacancyFilterComponent"));
  }

  applyResetCurrentFilters(): void {
    this.currentExperience.set(undefined);
    this.currentWorkFormat.set(undefined);
    this.currentWorkSchedule.set(undefined);
  }

  /**
   * Обработчик клика вне компонента
   * Закрывает мобильное меню фильтров
   */
  onClickOutside(): void {
    this.filterOpen.set(false);
  }

  /**
   * Загрузка данных с применением текущих фильтров
   * @param offset - смещение для пагинации
   * @param limit - количество элементов для загрузки
   * @param projectId - идентификатор проекта (опционально)
   * @returns Observable с отфильтрованными данными
   */
  onFetch(offset: number, limit: number, projectId?: number) {
    return this.vacancyService
      .getForProject(
        limit,
        offset,
        projectId,
        this.currentExperience(),
        this.currentWorkFormat(),
        this.currentWorkSchedule(),
        this.currentSalary(),
        this.searchValue()
      )
      .pipe(
        tap((res: any) => {
          this.totalItemsCount.set(res.length);
        }),
        map(res => res)
      );
  }
}
