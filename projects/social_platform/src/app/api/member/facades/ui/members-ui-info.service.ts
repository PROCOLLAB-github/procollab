/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ApiPagination } from "projects/skills/src/models/api-pagination.model";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";

@Injectable()
export class MembersUIInfoService {
  private readonly fb = inject(FormBuilder);

  readonly membersTotalCount = signal<number | undefined>(undefined); // Общее количество участников
  readonly membersTake = signal<number>(20); // Количество участников на странице
  private readonly membersPage = signal<number>(1); // Текущая страница для пагинации

  readonly members = signal<User[]>([]); // Массив участников для отображения

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
    this.members.set(members.results);
  }

  applyQueryParams(members: ApiPagination<User>): void {
    this.members.set(members.results || []);
    this.membersTotalCount.set(members.count);
    this.membersPage.set(1);
  }

  applyMembersChunk(membersChunk: ApiPagination<User>): void {
    this.membersPage.update(page => page + 1);
    this.members.update(list => [...list, ...(membersChunk.results || [])]);
    this.membersTotalCount.set(membersChunk.count);
  }
}
