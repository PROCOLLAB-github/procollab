/** @format */

import { inject } from "@angular/core";
import { MemberService } from "@services/member.service";
import { ResolveFn } from "@angular/router";
import { ApiPagination } from "@models/api-pagination.model";
import { User } from "@auth/models/user.model";

/**
 * РЕЗОЛВЕР СТРАНИЦЫ МЕНТОРОВ
 *
 * Назначение: Предзагрузка списка менторов перед отображением страницы
 *
 * Что делает:
 * - Выполняется автоматически перед активацией маршрута страницы менторов
 * - Загружает первую страницу менторов из API (20 записей)
 * - Обеспечивает немедленное отображение данных без состояния загрузки
 *
 * Что принимает:
 * - Контекст маршрута (автоматически от Angular Router)
 * - Доступ к MemberService через dependency injection
 *
 * Что возвращает:
 * - Observable<ApiPagination<User>> - пагинированный список менторов
 * - Структура содержит:
 *   * results: User[] - массив пользователей-менторов
 *   * count: number - общее количество менторов
 *   * next/previous: ссылки на следующую/предыдущую страницы
 *
 * Параметры загрузки:
 * - offset: 0 (начинаем с первой записи)
 * - limit: 20 (загружаем 20 менторов за раз)
 *
 * Использование данных:
 * - Данные доступны в компоненте через route.data['data']
 * - Используются для инициализации списка и счетчика
 * - Основа для последующей пагинации при скролле
 */
export const MentorsResolver: ResolveFn<ApiPagination<User>> = () => {
  const memberService = inject(MemberService);

  return memberService.getMentors(0, 20);
};
