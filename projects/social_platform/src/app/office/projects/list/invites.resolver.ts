/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { Invite } from "@office/models/invite.model";
import { InviteService } from "@office/services/invite.service";

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
  const inviteService = inject(InviteService);

  return inviteService.getMy();
};
