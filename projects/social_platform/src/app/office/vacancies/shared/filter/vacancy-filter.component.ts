/** @format */

import { animate, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ButtonComponent, CheckboxComponent, IconComponent } from "@ui/components";
import { ClickOutsideModule } from "ng-click-outside";
import { FeedService } from "@office/feed/services/feed.service";
import { VacancyService } from "@office/services/vacancy.service";
import { map, Subscription, tap } from "rxjs";
import { workFormatFilter } from "projects/core/src/consts/filters/work-format-filter.const";
import { workScheduleFilter } from "projects/core/src/consts/filters/work-schedule-filter.const";
import { workExperienceFilter } from "projects/core/src/consts/filters/work-experience-filter.const";

/**
 * Компонент фильтра вакансий без использования реактивных форм
 * Использует сигналы для управления состоянием полей зарплаты
 */
@Component({
  selector: "app-vacancy-filter",
  standalone: true,
  imports: [
    CommonModule,
    CheckboxComponent,
    ClickOutsideModule,
    IconComponent,
    ButtonComponent,
    RouterLink,
  ],
  templateUrl: "./vacancy-filter.component.html",
  styleUrl: "./vacancy-filter.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("dropdownAnimation", [
      transition(":enter", [
        style({ opacity: 0, transform: "scaleY(0.8)" }),
        animate(".12s cubic-bezier(0, 0, 0.2, 1)"),
      ]),
      transition(":leave", [animate(".1s linear", style({ opacity: 0 }))]),
    ]),
  ],
})
export class VacancyFilterComponent implements OnInit {
  /** Сервис роутера для навигации */
  router = inject(Router);
  /** Сервис текущего маршрута */
  route = inject(ActivatedRoute);
  /** Сервис ленты новостей */
  feedService = inject(FeedService);
  /** Сервис для работы с вакансиями */
  vacancyService = inject(VacancyService);

  constructor() {}

  /** Приватное поле для хранения значения поиска */
  private _searchValue: string | undefined;

  /**
   * Сеттер для значения поиска
   * @param value - новое значение поиска
   */
  @Input() set searchValue(value: string | undefined) {
    this._searchValue = value;
  }

  /**
   * Геттер для получения значения поиска
   * @returns текущее значение поиска
   */
  get searchValue(): string | undefined {
    return this._searchValue;
  }

  /** Событие изменения значения поиска */
  @Output() searchValueChange = new EventEmitter<string>();

  /** Подписка на параметры запроса */
  queries$?: Subscription;

  /** Состояние открытия фильтра (для мобильной версии) */
  filterOpen = signal(false);

  /** Общее количество элементов */
  totalItemsCount = signal(0);

  // Сигналы для текущих значений фильтров
  /** Текущий фильтр по опыту */
  currentExperience = signal<string | undefined>(undefined);
  /** Текущий фильтр по формату работы */
  currentWorkFormat = signal<string | undefined>(undefined);
  /** Текущий фильтр по графику работы */
  currentWorkSchedule = signal<string | undefined>(undefined);
  /** Текущая зарплата */
  currentSalary = signal<string | undefined>(undefined);

  /** Опции фильтра по опыту работы */
  readonly workExperienceFilterOptions = workExperienceFilter;

  /** Опции фильтра по формату работы */
  readonly workFormatFilterOptions = workFormatFilter;

  /** Опции фильтра по графику работы */
  readonly workScheduleFilterOptions = workScheduleFilter;

  /**
   * Инициализация компонента
   */
  ngOnInit() {
    // Подписка на изменения параметров запроса
    this.queries$ = this.route.queryParams.subscribe(queries => {
      // Синхронизация текущих значений фильтров с URL
      this.currentExperience.set(queries["required_experience"]);
      this.currentWorkFormat.set(queries["work_format"]);
      this.currentWorkSchedule.set(queries["work_schedule"]);
      this.currentSalary.set(queries["salary"]);
      this.searchValue = queries["role_contains"];
    });
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
    this.currentExperience.set(undefined);
    this.currentWorkFormat.set(undefined);
    this.currentWorkSchedule.set(undefined);

    this.onSearchValueChanged("");

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

  /**
   * Обработчик изменения значения поиска
   * @param value - новое значение поиска
   */
  onSearchValueChanged(value: string) {
    this.searchValueChange.emit(value);
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
        this.searchValue
      )
      .pipe(
        tap((res: any) => {
          this.totalItemsCount.set(res.length);
        }),
        map(res => res)
      );
  }

  ngOnDestroy() {
    this.queries$?.unsubscribe();
  }
}
