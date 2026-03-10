/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { Invite } from "projects/social_platform/src/app/domain/invite/invite.model";
import { InviteRepository } from "projects/social_platform/src/app/infrastructure/repository/invite/invite.repository";

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
export const ProjectsInvitesResolver: ResolveFn<Invite[]> = () => {
  const inviteService = inject(InviteRepository);

  return inviteService.getMy();
};
