/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ProgramService } from "@office/program/services/program.service";
import { ApiPagination } from "@models/api-pagination.model";
import { User } from "@auth/models/user.model";

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
  const programService = inject(ProgramService);

  return programService.getAllMembers(route.parent?.params["programId"], 0, 20);
};
