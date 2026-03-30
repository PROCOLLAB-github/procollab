/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { map } from "rxjs";
import { GetMembersUseCase } from "@api/member/use-case/get-members.use-case";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { User } from "@domain/auth/user.model";

/**
 * Резолвер для предварительной загрузки данных участников перед переходом на страницу
 *
 * Этот резолвер выполняется Angular Router'ом перед активацией маршрута /members
 * и загружает первую страницу участников (20 записей) для отображения
 *
 * @returns Promise<ApiPagination<User>> - Возвращает промис с пагинированным списком пользователей
 */
/**
 * Функция-резолвер для загрузки участников
 *
 * @param route - Не используется, но доступен объект ActivatedRouteSnapshot
 * @param state - Не используется, но доступен объект RouterStateSnapshot
 * @returns Observable<ApiPagination<User>> - Наблюдаемый объект с данными участников
 */
export const MembersResolver: ResolveFn<ApiPagination<User>> = () => {
  const getMembersUseCase = inject(GetMembersUseCase);

  // Загружаем первые 20 участников (skip: 0, take: 20)
  return getMembersUseCase.execute(0, 20).pipe(
    map(result =>
      result.ok
        ? result.value
        : {
            count: 0,
            results: [],
            next: "",
            previous: "",
          }
    )
  );
};
