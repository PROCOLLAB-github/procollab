/** @format */

import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ProgramDetailListUIInfoService } from "@api/program/facades/detail/ui/program-detail-list-ui-info.service";
import { GetProgramFiltersUseCase } from "@api/program/use-cases/get-program-filters.use-case";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";
import { debounceTime, distinctUntilChanged, shareReplay } from "rxjs";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Injectable()
export class ProgramProjectsFilterInfoService {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly programDetailListUIInfoService = inject(ProgramDetailListUIInfoService);

  private readonly getProgramFiltersUseCase = inject(GetProgramFiltersUseCase);

  filterForm: FormGroup = this.fb.group({});

  // Массив фильтров по дополнительным полям привязанным к конкретной программе
  readonly filters = signal<PartnerProgramFields[] | null>(null);

  protected readonly listType = this.programDetailListUIInfoService.listType;

  private initialized = false;

  initializationProgramProjectsFilter(): void {
    // Идемпотентность: ProgramListComponent — провайдер сервиса, повторный вход возможен
    // только при необычных потоках (HMR/тесты). Один guard вместо inflight+filters проверок.
    if (this.initialized) return;
    if (this.listType() !== "projects" && this.listType() !== "rating") return;

    this.initialized = true;

    const programId = this.route.parent?.snapshot.params["programId"];
    this.getProgramFiltersUseCase
      .execute(Number(programId))
      .pipe(shareReplay({ bufferSize: 1, refCount: true }), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.logger.error("Error loading program filters:", result.error.cause);
            this.initialized = false; // дать шанс ретраю на следующий init
            return;
          }

          this.filters.set(result.value);
          this.initializeFilterForm();
          this.restoreFiltersFromUrl();
          this.subscribeToFormChanges();
        },
      });
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
    // Полный сброс формы без эмита valueChanges — иначе через debounce уйдёт ещё один navigate.
    this.filterForm.reset({}, { emitEvent: false });

    // navigateByUrl на pathname без query — самый надёжный способ очистить query целиком.
    // router.navigate({ queryParams: {} }) в некоторых конфигурациях не сериализуется в очистку
    // (Router считает пустой объект "ничего не менять"), отсюда и эффект "сброс не работает".
    const path = this.router.url.split("?")[0];
    this.router.navigateByUrl(path).then(() => this.logger.info("Filters cleared"));
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
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(queries => {
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
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
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
        this.logger.info("Query params updated:", currentParams);
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
