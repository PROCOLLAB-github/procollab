/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ProgramDetailListUIInfoService } from "projects/social_platform/src/app/api/program/facades/detail/ui/program-detail-list-ui-info.service";
import { ProgramService } from "projects/social_platform/src/app/api/program/program.service";
import { PartnerProgramFields } from "projects/social_platform/src/app/domain/program/partner-program-fields.model";
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from "rxjs";

@Injectable()
export class ProgramProjectsFilterInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly programService = inject(ProgramService);
  private readonly programDetailListUIInfoService = inject(ProgramDetailListUIInfoService);

  filterForm: FormGroup = this.fb.group({});

  // Массив фильтров по дополнительным полям привязанным к конкретной программе
  readonly filters = signal<PartnerProgramFields[] | null>(null);

  protected readonly listType = this.programDetailListUIInfoService.listType;

  private readonly destroy$ = new Subject<void>();

  initializationProgramProjectsFilter(): void {
    const programId = this.route.parent?.snapshot.params["programId"];

    if (this.listType() === "projects" || this.listType() === "rating") {
      this.programService
        .getProgramFilters(programId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: filter => {
            this.filters.set(filter);
            this.initializeFilterForm();
            this.restoreFiltersFromUrl();
            this.subscribeToFormChanges();
          },
          error(err) {
            console.error("Error loading program filters:", err);
          },
        });
    }
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    if (fieldType === "checkbox" || fieldType === "radio") {
      const control = this.filterForm.get(fieldName);
      if (control) {
        control.setValue(!control.value);
      }
    }
  }

  // Методы фильтрации
  setValue(event: Event): void {
    event.stopPropagation();
    const control = this.filterForm.get("is_rated_by_expert");
    if (control) {
      control.setValue(!control.value);
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
          is_rated_by_expert: undefined,
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

    if (this.listType() === "rating") {
      const isRatedByExpert =
        this.route.snapshot.queryParams["is_rated_by_expert"] === "true"
          ? true
          : this.route.snapshot.queryParams["is_rated_by_expert"] === "false"
          ? false
          : null;

      formControls["is_rated_by_expert"] = new FormControl(isRatedByExpert);
    }

    Object.keys(this.filterForm.controls).forEach(key => {
      this.filterForm.removeControl(key);
    });
    Object.keys(formControls).forEach(key => {
      this.filterForm.addControl(key, formControls[key]);
    });
  }

  private restoreFiltersFromUrl(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(queries => {
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
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
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
