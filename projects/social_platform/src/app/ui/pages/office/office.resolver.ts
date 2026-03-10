/** @format */

import { inject } from "@angular/core";
import { InviteRepository } from "projects/social_platform/src/app/infrastructure/repository/invite/invite.repository";
import { Invite } from "projects/social_platform/src/app/domain/invite/invite.model";
import { ResolveFn } from "@angular/router";

/**
 * Резолвер для предзагрузки приглашений пользователя
 * Загружает данные о приглашениях перед инициализацией компонента офиса
 *
 * Принимает:
 * - Контекст маршрута (неявно через Angular DI)
 *
 * Возвращает:
 * - Observable<Invite[]> - массив приглашений пользователя
 */
export const OfficeResolver: ResolveFn<Invite[]> = () => {
  const inviteService = inject(InviteRepository);

  return inviteService.getMy();
};
