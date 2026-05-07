/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { User } from "@domain/auth/user.model";
import { map } from "rxjs";
import { GetAllMembersUseCase } from "@api/program/use-cases/get-all-members.use-case";

/**
 * Резолвер для предзагрузки участников программы
 *
 * Загружает первую страницу участников программы перед отображением
 * компонента. Обеспечивает мгновенное отображение списка участников.
 *
 * Принимает:
 * @param {ActivatedRouteSnapshot} route - Снимок маршрута с параметрами
 *
 * Использует:
 * @param {ProgramService} programService - Инжектируемый сервис программ
 *
 * Логика:
 * - Извлекает programId из родительского маршрута (route.parent.params)
 * - Загружает первые 20 участников (skip: 0, take: 20)
 *
 * Возвращает:
 * @returns {Observable<ApiPagination<User>>} Пагинированный список участников
 *
 * Данные включают:
 * - Массив пользователей (results)
 * - Общее количество участников (count)
 * - Информацию о пагинации
 *
 * Каждый участник содержит:
 * - Профильную информацию
 * - Аватар и контактные данные
 * - Роль в программе
 *
 * Используется в:
 * Маршруте members для предзагрузки списка участников
 */
export const ProgramMembersResolver: ResolveFn<ApiPagination<User>> = (
  route: ActivatedRouteSnapshot
) => {
  const getAllMembersUseCase = inject(GetAllMembersUseCase);

  return getAllMembersUseCase
    .execute(route.parent?.params["programId"], 0, 20)
    .pipe(
      map(result => (result.ok ? result.value : { count: 0, results: [], next: "", previous: "" }))
    );
};
