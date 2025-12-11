/** @format */

import { inject } from "@angular/core";
import { MemberService } from "projects/social_platform/src/app/api/member/member.service";
import { ResolveFn } from "@angular/router";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";

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
  const memberService = inject(MemberService);

  // Загружаем первые 20 участников (skip: 0, take: 20)
  return memberService.getMembers(0, 20);
};
