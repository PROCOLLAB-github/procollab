/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";
import { VacancyResponse } from "projects/social_platform/src/app/domain/vacancy/vacancy-response.model";
import { Vacancy } from "projects/social_platform/src/app/domain/vacancy/vacancy.model";

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

  readonly vacancyList = signal<Vacancy[]>([]);
  readonly responsesList = signal<VacancyResponse[]>([]);

  readonly searchForm = this.fb.group({
    search: [""],
  });

  applyQueryParams(result: ApiPagination<Vacancy> | ApiPagination<VacancyResponse>): void {
    this.applySetTotalItems(result);
    this.vacancyPage.set(1);
  }

  applyVacancyListData(result: ApiPagination<Vacancy> | ApiPagination<VacancyResponse>): void {
    if (!result || !Array.isArray(result.results)) {
      return;
    }

    if (this.listType() === "all") {
      this.vacancyList.set(result.results as Vacancy[]);
    } else if (this.listType() === "my") {
      this.responsesList.set(result.results as VacancyResponse[]);
    }
  }

  applySetTotalItems(vacancy: ApiPagination<Vacancy> | ApiPagination<VacancyResponse>): void {
    if (!vacancy || typeof vacancy.count !== "number") {
      this.totalItemsCount.set(0);
      return;
    }

    this.totalItemsCount.set(vacancy.count);
  }

  applyUpdateListOnScroll(result: any): void {
    this.vacancyPage.update(page => page + 1);
    this.vacancyList.update(items => [...items, ...result.results]);
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
