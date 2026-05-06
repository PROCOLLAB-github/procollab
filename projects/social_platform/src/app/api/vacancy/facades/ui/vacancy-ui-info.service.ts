/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { AsyncState, initial, isLoading, isSuccess } from "@domain/shared/async-state";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { Vacancy } from "@domain/vacancy/vacancy.model";

@Injectable()
export class VacancyUIInfoService {
  private readonly fb = inject(FormBuilder);
  // Переменная определяющая тип страницы для списка данных и пагинации

  readonly listType = signal<"all" | "my" | null>(null);
  readonly totalItemsCount = signal(0);
  readonly vacancyPage = signal(1);
  readonly perFetchTake = signal(20);

  // Переменные для работы с фильтрами

  readonly requiredExperience = signal<string | undefined>(undefined);
  readonly roleContains = signal<string | undefined>(undefined);
  readonly workFormat = signal<string | undefined>(undefined);
  readonly workSchedule = signal<string | undefined>(undefined);
  readonly salary = signal<string | undefined>(undefined);

  // Переменные для работы с модалкой

  readonly isMyModal = signal<boolean>(false);

  // Переменные для списка вакансий и пагинации

  readonly vacancies$ = signal<AsyncState<Vacancy[]>>(initial());
  readonly loadingMore = signal(false);

  readonly vacancyList = computed(() => {
    const state = this.vacancies$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? [];
    return [];
  });

  readonly responsesList = signal<VacancyResponse[]>([]);

  readonly searchForm = this.fb.group({
    search: [""],
  });

  applyQueryParams(result: Vacancy[]): void {
    this.applySetTotalItems(result);
    this.vacancyPage.set(1);
  }

  applySetTotalItems(vacancy: Vacancy[] | VacancyResponse[]): void {
    if (!Array.isArray(vacancy)) {
      this.totalItemsCount.set(0);
      return;
    }

    this.totalItemsCount.set(vacancy.length);
  }

  applySearhValueChanged(searchValue: string) {
    this.searchForm.get("search")?.setValue(searchValue);
  }

  // myVacanciesPage Modal Section
  // -------------------

  myModalSetup() {
    if (this.listType() === "my" && this.responsesList().length === 0) {
      this.isMyModal.set(true);
    } else {
      this.isMyModal.set(false);
    }
  }

  setFilters(
    requiredExperience: any,
    roleContains: any,
    workFormat: any,
    workSchedule: any,
    salary: any
  ): void {
    this.requiredExperience.set(requiredExperience);
    this.roleContains.set(roleContains);
    this.workFormat.set(workFormat);
    this.workSchedule.set(workSchedule);
    this.salary.set(salary);
  }

  resetFilters(): void {
    this.requiredExperience.set(undefined);
    this.roleContains.set(undefined);
    this.workFormat.set(undefined);
    this.workSchedule.set(undefined);
    this.salary.set(undefined);
  }
}
