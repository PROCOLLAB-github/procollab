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
import { map, Subscription, tap } from "rxjs";
import { workFormatFilter } from "projects/core/src/consts/filters/work-format-filter.const";
import { workScheduleFilter } from "projects/core/src/consts/filters/work-schedule-filter.const";
import { workExperienceFilter } from "projects/core/src/consts/filters/work-experience-filter.const";
import { FeedService } from "../../../api/feed/feed.service";
import { VacancyService } from "../../../api/vacancy/vacancy.service";
import { VacancyFilterInfoService } from "./service/vacancy-filter-info.service";

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
  providers: [VacancyFilterInfoService],
})
export class VacancyFilterComponent implements OnInit {
  private readonly vacancyFilterInfoService = inject(VacancyFilterInfoService);

  /**
   * Сеттер для значения поиска
   * @param value - новое значение поиска
   */
  @Input() set searchValue(value: string | undefined) {
    this.vacancyFilterInfoService.applyInitSearchValue(value);
  }

  /**
   * Геттер для получения значения поиска
   * @returns текущее значение поиска
   */
  get searchValue() {
    return this.vacancyFilterInfoService.searchValue();
  }

  /** Событие изменения значения поиска */
  @Output() searchValueChange = new EventEmitter<string>();

  /** Состояние открытия фильтра (для мобильной версии) */
  protected readonly filterOpen = this.vacancyFilterInfoService.filterOpen;

  // Сигналы для текущих значений фильтров
  /** Текущий фильтр по опыту */
  protected readonly currentExperience = this.vacancyFilterInfoService.currentExperience;
  /** Текущий фильтр по формату работы */
  protected readonly currentWorkFormat = this.vacancyFilterInfoService.currentWorkFormat;
  /** Текущий фильтр по графику работы */
  protected readonly currentWorkSchedule = this.vacancyFilterInfoService.currentWorkSchedule;
  /** Текущая зарплата */
  protected readonly currentSalary = this.vacancyFilterInfoService.currentSalary;

  /** Опции фильтра по опыту работы */
  protected readonly workExperienceFilterOptions = workExperienceFilter;

  /** Опции фильтра по формату работы */
  protected readonly workFormatFilterOptions = workFormatFilter;

  /** Опции фильтра по графику работы */
  protected readonly workScheduleFilterOptions = workScheduleFilter;

  /**
   * Инициализация компонента
   */
  ngOnInit() {
    // Подписка на изменения параметров запроса
    this.vacancyFilterInfoService.initializationVacancyFilters();
  }

  /**
   * Установка фильтра по опыту работы
   * @param event - событие клика
   * @param experienceId - идентификатор выбранного опыта
   */
  setExperienceFilter(event: Event, experienceId: string): void {
    this.vacancyFilterInfoService.setExperienceFilter(event, experienceId);
  }

  /**
   * Установка фильтра по формату работы
   * @param event - событие клика
   * @param formatId - идентификатор выбранного формата
   */
  setWorkFormatFilter(event: Event, formatId: string): void {
    this.vacancyFilterInfoService.setWorkFormatFilter(event, formatId);
  }

  /**
   * Установка фильтра по графику работы
   * @param event - событие клика
   * @param scheduleId - идентификатор выбранного графика
   */
  setWorkScheduleFilter(event: Event, scheduleId: string): void {
    this.vacancyFilterInfoService.setWorkScheduleFilter(event, scheduleId);
  }

  /**
   * Сброс всех фильтров
   * Очищает все параметры фильтрации и обновляет URL
   */
  resetFilter(): void {
    this.vacancyFilterInfoService.applyResetCurrentFilters();

    this.onSearchValueChanged("");

    this.vacancyFilterInfoService.resetFilter();
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
    this.vacancyFilterInfoService.onClickOutside();
  }

  ngOnDestroy() {
    this.vacancyFilterInfoService.destroy();
  }
}
