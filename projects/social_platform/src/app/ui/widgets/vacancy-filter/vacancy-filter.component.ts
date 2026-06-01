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
  output,
  Output,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { ButtonComponent, CheckboxComponent, IconComponent } from "@ui/primitives";
import { AppRoutes } from "@api/paths/app-routes";
import { ClickOutsideModule } from "ng-click-outside";
import { workFormatFilter } from "@core/consts/filters/work-format-filter.const";
import { workScheduleFilter } from "@core/consts/filters/work-schedule-filter.const";
import { workExperienceFilter } from "@core/consts/filters/work-experience-filter.const";
import { VacancyFilterInfoService } from "./service/vacancy-filter-info.service";

/**
 * Компонент фильтра вакансий без использования реактивных форм
 * Использует сигналы для управления состоянием полей зарплаты
 */
@Component({
  selector: "app-vacancy-filter",
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

  @Input() set searchValue(value: string | undefined) {
    this.vacancyFilterInfoService.applyInitSearchValue(value);
  }

  get searchValue() {
    return this.vacancyFilterInfoService.searchValue();
  }

  readonly searchValueChange = output<string>();

  protected readonly filterOpen = this.vacancyFilterInfoService.filterOpen;

  protected readonly currentExperience = this.vacancyFilterInfoService.currentExperience;
  protected readonly currentWorkFormat = this.vacancyFilterInfoService.currentWorkFormat;
  protected readonly currentWorkSchedule = this.vacancyFilterInfoService.currentWorkSchedule;
  protected readonly currentSalary = this.vacancyFilterInfoService.currentSalary;

  protected readonly workExperienceFilterOptions = workExperienceFilter;

  protected readonly workFormatFilterOptions = workFormatFilter;

  protected readonly workScheduleFilterOptions = workScheduleFilter;

  protected readonly AppRoutes = AppRoutes;

  ngOnInit() {
    // Подписка на изменения параметров запроса
    this.vacancyFilterInfoService.initializationVacancyFilters();
  }

  setExperienceFilter(event: Event, experienceId: string): void {
    this.vacancyFilterInfoService.setExperienceFilter(event, experienceId);
  }

  setWorkFormatFilter(event: Event, formatId: string): void {
    this.vacancyFilterInfoService.setWorkFormatFilter(event, formatId);
  }

  setWorkScheduleFilter(event: Event, scheduleId: string): void {
    this.vacancyFilterInfoService.setWorkScheduleFilter(event, scheduleId);
  }

  resetFilter(): void {
    this.vacancyFilterInfoService.applyResetCurrentFilters();

    this.onSearchValueChanged("");

    this.vacancyFilterInfoService.resetFilter();
  }

  onSearchValueChanged(value: string) {
    this.searchValueChange.emit(value);
  }

  onClickOutside(): void {
    this.vacancyFilterInfoService.onClickOutside();
  }
}
