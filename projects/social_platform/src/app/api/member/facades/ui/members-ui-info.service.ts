/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import {
  AsyncState,
  initial,
  isLoading,
  isSuccess,
  success,
} from "projects/social_platform/src/app/domain/shared/async-state";

@Injectable()
export class MembersUIInfoService {
  private readonly fb = inject(FormBuilder);

  readonly membersTotalCount = signal<number | undefined>(undefined); // Общее количество участников
  readonly membersTake = signal<number>(20); // Количество участников на странице
  private readonly membersPage = signal<number>(1); // Текущая страница для пагинации

  readonly members$ = signal<AsyncState<User[]>>(initial()); // Массив участников для отображения

  readonly members = computed(() => {
    const state = this.members$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? [];
    return [];
  });

  // Форма поиска с обязательным полем для ввода имени
  readonly searchForm = this.fb.group({
    search: ["", [Validators.required]],
  });

  // Форма фильтрации с полями для различных критериев
  readonly filterForm = this.fb.group({
    keySkill: ["", Validators.required], // Ключевой навык
    speciality: ["", Validators.required], // Специальность
    age: [[null, null]], // Диапазон возраста [от, до]
    isMosPolytechStudent: [false], // Является ли студентом МосПолитеха
  });

  applyMembersPagination(members: ApiPagination<User>) {
    this.membersTotalCount.set(members.count);
    this.members$.set(success(members.results));
  }
}
