/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  output,
  Output,
} from "@angular/core";
import { SwitchComponent } from "@ui/primitives/switch/switch.component";
import { CheckboxComponent, SelectComponent } from "@ui/primitives";
import { ToSelectOptionsPipe } from "@corelib";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { ProgramDetailListUIInfoService } from "@api/program/facades/detail/ui/program-detail-list-ui-info.service";
import { ProgramProjectsFilterInfoService } from "./service/program-projects-filter-info.service";

/** Фильтрация списка проектов с синхронизацией состояния через URL. */
@Component({
  selector: "app-program-projects-filter",
  templateUrl: "./program-projects-filter.component.html",
  styleUrl: "./program-projects-filter.component.scss",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CheckboxComponent,
    SwitchComponent,
    SelectComponent,
    ToSelectOptionsPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramProjectsFilterComponent {
  readonly clear = output<void>();

  private readonly programDetailListUIInfoService = inject(ProgramDetailListUIInfoService);
  private readonly programProjectsFilterInfoService = inject(ProgramProjectsFilterInfoService);

  protected readonly listType = this.programDetailListUIInfoService.listType;

  // Инициализация формы для фильтра
  protected readonly filterForm = this.programProjectsFilterInfoService.filterForm;

  // Массив фильтров по дополнительным полям привязанным к конкретной программе
  protected readonly filters = this.programProjectsFilterInfoService.filters;

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

  clearFilters(): void {
    this.programProjectsFilterInfoService.clearFilters();

    this.clear.emit();
  }
}
