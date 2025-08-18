/** @format */

import { Component, EventEmitter, OnInit, Output, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { debounceTime, distinctUntilChanged, map, Subscription } from "rxjs";
import { SwitchComponent } from "@ui/components/switch/switch.component";
import { CheckboxComponent, SelectComponent } from "@ui/components";
import { ProgramService } from "@office/program/services/program.service";
import { PartnerProgramFields } from "@office/models/partner-program-fields.model";
import { ToSelectOptionsPipe } from "projects/core/src/lib/pipes/options-transform.pipe";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";

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
  selector: "app-projects-filter",
  templateUrl: "./projects-filter.component.html",
  styleUrl: "./projects-filter.component.scss",
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
export class ProjectsFilterComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly programService: ProgramService
  ) {
    this.filterForm = this.fb.group({});
  }

  @Output() filtersLoaded = new EventEmitter<PartnerProgramFields[]>();

  // Константы для фильтрации по типу проекта
  private programId = 0;

  ngOnInit(): void {
    this.programId = this.route.parent?.snapshot.params["programId"];

    this.programService.getProgramFilters(this.programId).subscribe({
      next: filter => {
        this.filters.set(filter);
        this.initializeFilterForm();
        this.restoreFiltersFromUrl();
        this.subscribeToFormChanges();
        this.filtersLoaded.emit(filter);
      },
      error(err) {
        console.log(err);
      },
    });
  }

  ngOnDestroy(): void {
    this.queries$?.unsubscribe();
  }

  // Инициализация формы для фильтра
  filterForm: FormGroup;

  // Подписки для управления жизненным циклом
  queries$?: Subscription;

  // Массив фильтров по дополнительным полям привязанным к конкретной программе
  filters = signal<PartnerProgramFields[] | null>(null);

  /**
   * Переключение значения для checkbox и radio полей
   * @param fieldType - тип поля
   * @param fieldName - имя поля
   */
  toggleAdditionalFormValues(
    fieldType: "text" | "textarea" | "checkbox" | "select" | "radio" | "file",
    fieldName: string
  ): void {
    if (fieldType === "checkbox" || fieldType === "radio") {
      const control = this.filterForm.get(fieldName);
      if (control) {
        control.setValue(!control.value);
      }
    }
  }

  /**
   * Сброс всех активных фильтров
   * Очищает все query параметры и возвращает к состоянию по умолчанию
   */
  clearFilters(): void {
    this.filterForm.reset();

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

  private initializeFilterForm(): void {
    const formControls: { [key: string]: FormControl } = {};

    this.filters()?.forEach(field => {
      const validators = field.isRequired ? [Validators.required] : [];
      const initialValue =
        field.fieldType === "checkbox" || field.fieldType === "radio" ? false : "";
      formControls[field.name] = new FormControl(initialValue, validators);
    });

    this.filterForm = this.fb.group(formControls);
  }

  private restoreFiltersFromUrl(): void {
    this.queries$ = this.route.queryParams.subscribe(queries => {
      Object.keys(queries).forEach(key => {
        const control = this.filterForm.get(key);
        if (control && queries[key] !== undefined) {
          const field = this.filters()?.find(f => f.name === key);
          if (field && (field.fieldType === "checkbox" || field.fieldType === "radio")) {
            control.setValue(queries[key] === "true", { emitEvent: false });
          } else {
            control.setValue(queries[key], { emitEvent: false });
          }
        }
      });
    });
  }

  private subscribeToFormChanges(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(formValue => {
        this.updateQueryParams(formValue);
      });
  }

  private updateQueryParams(formValue: any): void {
    const currentParams = { ...this.route.snapshot.queryParams };

    Object.keys(formValue).forEach(fieldName => {
      const value = formValue[fieldName];
      const field = this.filters()?.find(f => f.name === fieldName);

      if (this.shouldAddToQueryParams(value, field?.fieldType)) {
        currentParams[fieldName] = value;
      } else {
        delete currentParams[fieldName];
      }
    });

    this.router
      .navigate([], {
        queryParams: currentParams,
        relativeTo: this.route,
      })
      .then(() => {
        console.log("Query params updated:", currentParams);
      });
  }

  private shouldAddToQueryParams(
    value: any,
    fieldType?: "text" | "textarea" | "checkbox" | "select" | "radio" | "file"
  ): boolean {
    if (fieldType === "checkbox" || fieldType === "radio") {
      return value === true;
    }

    if (fieldType === "select" || fieldType === "text" || fieldType === "textarea") {
      return value !== null && value !== undefined && value !== "";
    }

    return !!value;
  }
}
