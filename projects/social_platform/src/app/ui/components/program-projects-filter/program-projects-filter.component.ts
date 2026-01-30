/** @format */

import { Component, EventEmitter, inject, OnInit, Output } from "@angular/core";
import { SwitchComponent } from "@ui/components/switch/switch.component";
import { CheckboxComponent, SelectComponent } from "@ui/components";
import { ToSelectOptionsPipe } from "projects/core/src/lib/pipes/transformers/options-transform.pipe";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { ProgramDetailListUIInfoService } from "../../../api/program/facades/detail/ui/program-detail-list-ui-info.service";
import { ProgramProjectsFilterInfoService } from "./service/program-projects-filter-info.service";

/**
 * Компонент фильтрации проектов
 *
 * Функциональность:
 * - Предоставляет интерфейс для фильтрации списка проектов
 * - Управляет фильтрами по различным критериям:
 *   - Этап проекта (идея, разработка, тестирование и т.д.)
 *   - Отрасль/направление проекта
 *   - Количество участников в команде
 *   - Наличие открытых вакансий
 *   - Принадлежность к программе МосПолитех
 *   - Тип проекта (оценен экспертами или нет)
 *
 * Принимает:
 * - Query параметры из URL для восстановления состояния фильтров
 * - Данные об отраслях и этапах проектов из сервисов
 *
 * Возвращает:
 * - Обновляет query параметры URL при изменении фильтров
 * - Эмитит события для закрытия панели фильтров
 *
 * Особенности:
 * - Синхронизирует состояние фильтров с URL
 * - Поддерживает сброс всех фильтров
 * - Адаптивный интерфейс для мобильных устройств
 */
@Component({
  selector: "app-program-projects-filter",
  templateUrl: "./program-projects-filter.component.html",
  styleUrl: "./program-projects-filter.component.scss",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CheckboxComponent,
    SwitchComponent,
    SelectComponent,
    ToSelectOptionsPipe,
  ],
})
export class ProgramProjectsFilterComponent implements OnInit {
  @Output() clear = new EventEmitter<void>();

  private readonly programDetailListUIInfoService = inject(ProgramDetailListUIInfoService);
  private readonly programProjectsFilterInfoService = inject(ProgramProjectsFilterInfoService);

  protected readonly listType = this.programDetailListUIInfoService.listType;

  // Инициализация формы для фильтра
  protected readonly filterForm = this.programProjectsFilterInfoService.filterForm;

  // Массив фильтров по дополнительным полям привязанным к конкретной программе
  protected readonly filters = this.programProjectsFilterInfoService.filters;

  ngOnInit(): void {
    this.programProjectsFilterInfoService.initializationProgramProjectsFilter();
  }

  ngOnDestroy(): void {
    this.programProjectsFilterInfoService.destroy();
  }

  /**
   * Переключение значения для checkbox и radio полей
   * @param fieldType - тип поля
   * @param fieldName - имя поля
   */
  toggleAdditionalFormValues(
    fieldType: "text" | "textarea" | "checkbox" | "select" | "radio" | "file",
    fieldName: string
  ): void {
    this.programProjectsFilterInfoService.toggleAdditionalFormValues(fieldType, fieldName);
  }

  // Методы фильтрации
  setValue(event: Event): void {
    this.programProjectsFilterInfoService.setValue(event);
  }

  /**
   * Сброс всех активных фильтров
   * Очищает все query параметры и возвращает к состоянию по умолчанию
   */
  clearFilters(): void {
    this.programProjectsFilterInfoService.clearFilters();

    this.clear.emit();
  }
}
